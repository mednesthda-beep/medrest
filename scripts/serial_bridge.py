import os
import sys
import time
import re
import glob
import urllib.request
import json

API_URL = "http://localhost:3000/api/sensor-data"

def find_serial_port():
    ports = glob.glob("/dev/cu.usb*") + glob.glob("/dev/tty.usb*")
    return ports[0] if ports else "/dev/cu.usbserial-5C3D0866341"

def open_port():
    import termios
    port = find_serial_port()
    if not os.path.exists(port):
        return None, port
    try:
        fd = os.open(port, os.O_RDONLY | os.O_NOCTTY)
        attrs = termios.tcgetattr(fd)
        attrs[4] = termios.B115200
        attrs[5] = termios.B115200
        termios.tcsetattr(fd, termios.TCSANOW, attrs)
        return fd, port
    except Exception as e:
        return None, f"{port} ({e})"

def run_bridge():
    print("[Serial Bridge] Starting robust auto-reconnecting serial bridge...")
    fd = None
    port_name = ""

    buffer = ""
    temp = 35.88
    hr = 0.0
    spo2 = 0.0
    fsr = 0
    present = False
    ax, ay, az = 0.0, 0.0, 0.0

    while True:
        if fd is None:
            fd, port_name = open_port()
            if fd is not None:
                print(f"[Serial Bridge] Connected to {port_name} at 115200 baud.")
                buffer = ""
            else:
                time.sleep(1)
                continue

        try:
            chunk = os.read(fd, 256).decode("utf-8", errors="ignore")
            if not chunk:
                time.sleep(0.05)
                continue
            buffer += chunk
            lines = buffer.split("\n")
            buffer = lines.pop()

            for line in lines:
                line_str = line.strip()
                if not line_str:
                    continue

                fsr_m = re.search(r"FSR Pressure:\s+(\d+)", line_str, re.IGNORECASE)
                if fsr_m:
                    fsr = int(fsr_m.group(1))
                    present = fsr > 100 or "PRESENT" in line_str.upper()

                temp_m = re.search(r"Temperature:\s+([\d.]+)", line_str, re.IGNORECASE)
                if temp_m:
                    temp = float(temp_m.group(1))

                hr_m = re.search(r"Heart Rate:\s+([\d.]+)", line_str, re.IGNORECASE)
                if hr_m:
                    hr = float(hr_m.group(1))

                spo2_m = re.search(r"Blood Oxygen:\s+([\d.]+)", line_str, re.IGNORECASE)
                if spo2_m:
                    spo2 = float(spo2_m.group(1))

                accel_m = re.search(r"Accel\s*\(X,Y,Z\):\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)", line_str)
                if accel_m:
                    ax = float(accel_m.group(1))
                    ay = float(accel_m.group(2))
                    az = float(accel_m.group(3))

                if "--- [MedNest Sensor Reading] ---" in line_str or "[HTTP]" in line_str:
                    payload = {
                        "patientId": "patient-1",
                        "heartRate": hr,
                        "spo2": spo2,
                        "temperature": temp,
                        "fsr": fsr,
                        "patientPresent": present,
                        "movement": {"x": ax, "y": ay, "z": az},
                        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                    }
                    try:
                        req = urllib.request.Request(
                            API_URL,
                            data=json.dumps(payload).encode("utf-8"),
                            headers={"Content-Type": "application/json"}
                        )
                        urllib.request.urlopen(req, timeout=1)
                        print(f"[Bridge Forwarded] Temp={temp}°C | FSR={fsr} | HR={hr} | Present={present}")
                    except Exception as post_err:
                        pass
        except OSError as e:
            print(f"[Serial Disconnected]: {e}. Attempting reconnection...")
            try:
                os.close(fd)
            except Exception:
                pass
            fd = None
            time.sleep(1)
        except Exception as general_err:
            print(f"[Bridge Error]: {general_err}")
            time.sleep(1)

if __name__ == "__main__":
    run_bridge()

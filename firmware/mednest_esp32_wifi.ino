#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include "MAX30105.h"
#include "heartRate.h"

// ============================================================================
// 1. PIN DEFINITIONS (Exact as requested)
// ============================================================================
#define FSR_PIN   34
#define TEMP_PIN  4
#define SDA_PIN   21
#define SCL_PIN   22

// ============================================================================
// 2. NETWORK & SERVER CONFIGURATION
// ============================================================================
// Replace with your Wi-Fi credentials
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// MedNest Guardian API Endpoint:
// - For Vercel Cloud: "https://<your-project>.vercel.app/api/sensor-data"
// - For Local LAN Dev: "http://192.168.1.6:3000/api/sensor-data"
const char* SERVER_URL    = "https://your-project.vercel.app/api/sensor-data";

// Telemetry transmit interval (in milliseconds)
const unsigned long TELEMETRY_INTERVAL = 1000; // Transmit every 1 second

// ============================================================================
// 3. SENSOR OBJECTS & STATE
// ============================================================================
OneWire oneWire(TEMP_PIN);
DallasTemperature tempSensor(&oneWire);

Adafruit_MPU6050 mpu;
MAX30105 maxSensor;

// Heart rate tracking variables
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;

float heartRate = 0.0;
int beatAvg = 0;
long irValue = 0;

// Movement & Temperature cache
float temperatureC = 0.0;
float accelX = 0.0, accelY = 0.0, accelZ = 0.0;
float gyroX = 0.0, gyroY = 0.0, gyroZ = 0.0;
int fsrValue = 0;

// Timing trackers
unsigned long lastTelemetryTime = 0;
unsigned long lastTempRequestTime = 0;
unsigned long lastWifiCheckTime = 0;

// ============================================================================
// 4. HELPER: WIFI CONNECTION
// ============================================================================
void connectToWiFi() {
  Serial.println();
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startAttempt = millis();
  // Wait up to 10 seconds for initial connection
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected successfully!");
    Serial.print("[Wi-Fi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[Wi-Fi] Connection timed out. Will retry in background.");
  }
}

// ============================================================================
// 5. HELPER: TRANSMIT TELEMETRY OVER HTTP / HTTPS POST
// ============================================================================
void sendTelemetryData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Wi-Fi not connected. Skipping upload.");
    return;
  }

  HTTPClient http;
  WiFiClient regularClient;
  WiFiClientSecure secureClient;

  // Detect whether target endpoint is HTTPS (e.g. Vercel) or HTTP (local LAN)
  String urlStr = String(SERVER_URL);
  if (urlStr.startsWith("https://")) {
    secureClient.setInsecure(); // Skip TLS certificate authority verification on ESP32
    http.begin(secureClient, SERVER_URL);
  } else {
    http.begin(regularClient, SERVER_URL);
  }

  http.addHeader("Content-Type", "application/json");
  http.setTimeout(2500); // 2.5s timeout for cloud server round-trip

  // Estimate SpO2 (if finger detected, ~96-99%)
  float estimatedSpo2 = (irValue > 50000 && heartRate > 40) ? 98.0 : 0.0;
  bool isPatientPresent = (fsrValue > 100) || (irValue > 50000);

  // Construct JSON payload
  String payload = "{";
  payload += "\"patientId\":\"patient-1\",";
  payload += "\"heartRate\":" + String(heartRate, 1) + ",";
  payload += "\"spo2\":" + String(estimatedSpo2, 1) + ",";
  payload += "\"temperature\":" + String(temperatureC, 2) + ",";
  payload += "\"fsr\":" + String(fsrValue) + ",";
  payload += "\"patientPresent\":" + String(isPatientPresent ? "true" : "false") + ",";
  payload += "\"movement\":{";
  payload += "\"x\":" + String(accelX, 2) + ",";
  payload += "\"y\":" + String(accelY, 2) + ",";
  payload += "\"z\":" + String(accelZ, 2);
  payload += "}";
  payload += "}";

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.printf("[HTTP] POST Result: %d -> %s\n", httpCode, httpCode == 200 ? "OK" : "Error");
  } else {
    Serial.printf("[HTTP] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

// ============================================================================
// 6. SETUP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==============================================");
  Serial.println("  MedNest Guardian - ESP32 Multi-Sensor Node  ");
  Serial.println("==============================================");

  // Configure Analog ADC for FSR
  analogReadResolution(12);
  analogSetPinAttenuation(FSR_PIN, ADC_11db);

  // Initialize I2C Bus on pins 21 (SDA) and 22 (SCL)
  Wire.begin(SDA_PIN, SCL_PIN);

  // Initialize Temperature Sensor (DS18B20 on Pin 4)
  tempSensor.begin();
  tempSensor.setWaitForConversion(false); // Non-blocking async temperature reading
  tempSensor.requestTemperatures();
  Serial.print("DS18B20 devices detected: ");
  Serial.println(tempSensor.getDeviceCount());

  // Initialize MPU6050 Motion Sensor
  if (mpu.begin()) {
    Serial.println("MPU6050: Connected");
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  } else {
    Serial.println("MPU6050: NOT detected (check SDA/SCL wiring)");
  }

  // Initialize MAX30102 / MAX30105 Heart Rate Sensor
  if (maxSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102: Connected");
    maxSensor.setup();
    maxSensor.setPulseAmplitudeRed(0x1F);
    maxSensor.setPulseAmplitudeIR(0x1F);
  } else {
    Serial.println("MAX30102: NOT detected (check SDA/SCL wiring)");
  }

  // Connect to Wi-Fi
  connectToWiFi();

  Serial.println("----------------------------------------------");
  Serial.println("System initialized. Starting telemetry loop...");
}

// ============================================================================
// 7. MAIN LOOP
// ============================================================================
void loop() {
  // -------------------------------------------------------------
  // A. MAX30102 HEART RATE DETECTION (Runs continuously without delay)
  // -------------------------------------------------------------
  irValue = maxSensor.getIR();

  if (irValue > 50000) {
    if (checkForBeat(irValue)) {
      long delta = millis() - lastBeat;
      lastBeat = millis();

      float bpm = 60.0 / (delta / 1000.0);

      if (bpm > 40.0 && bpm < 200.0) {
        rates[rateSpot++] = (byte)bpm;
        rateSpot %= RATE_SIZE;

        int total = 0;
        for (byte i = 0; i < RATE_SIZE; i++) {
          total += rates[i];
        }
        beatAvg = total / RATE_SIZE;
        heartRate = bpm;
      }
    }
  } else {
    // Finger not detected / weak signal
    heartRate = 0.0;
    beatAvg = 0;
  }

  // -------------------------------------------------------------
  // B. PERIODIC TELEMETRY & SECONDARY SENSORS (Every 1000ms)
  // -------------------------------------------------------------
  unsigned long now = millis();

  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = now;

    // 1. FSR Pressure Sensor
    fsrValue = analogRead(FSR_PIN);

    // 2. Read DS18B20 Temperature & trigger next conversion
    float currentTemp = tempSensor.getTempCByIndex(0);
    if (currentTemp != DEVICE_DISCONNECTED_C && currentTemp > -50.0) {
      temperatureC = currentTemp;
    }
    tempSensor.requestTemperatures(); // Trigger async conversion for next read

    // 3. Read MPU6050 Motion Sensor
    sensors_event_t accel, gyro, mpuTemp;
    if (mpu.getEvent(&accel, &gyro, &mpuTemp)) {
      accelX = accel.acceleration.x;
      accelY = accel.acceleration.y;
      accelZ = accel.acceleration.z;
      gyroX  = gyro.gyro.x;
      gyroY  = gyro.gyro.y;
      gyroZ  = gyro.gyro.z;
    }

    // 4. Debug Output to Serial Monitor
    Serial.println("\n--- [MedNest Sensor Reading] ---");
    Serial.printf("FSR Pressure: %d\n", fsrValue);
    Serial.printf("Temperature:  %.2f °C\n", temperatureC);
    Serial.printf("Heart Rate:   %.1f BPM (Avg: %d) | IR: %ld\n", heartRate, beatAvg, irValue);
    Serial.printf("Accel (X,Y,Z): %.2f, %.2f, %.2f m/s^2\n", accelX, accelY, accelZ);

    // 5. Transmit Telemetry over Wi-Fi
    sendTelemetryData();
  }

  // -------------------------------------------------------------
  // C. PERIODIC WIFI AUTO-RECONNECT CHECK (Every 10s if disconnected)
  // -------------------------------------------------------------
  if (WiFi.status() != WL_CONNECTED && (now - lastWifiCheckTime >= 10000)) {
    lastWifiCheckTime = now;
    Serial.println("[Wi-Fi] Disconnected! Attempting to reconnect...");
    WiFi.reconnect();
  }
}

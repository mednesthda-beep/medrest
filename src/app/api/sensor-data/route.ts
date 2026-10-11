import { NextResponse } from 'next/server';

// In-memory telemetry cache for ESP32 data stream
let latestSensorData: any = {
  heartRate: 0,
  spo2: 0,
  temperature: 0,
  movement: { x: 0, y: 0, z: 0 },
  pressure: {
    fsr1: 0, fsr2: 0, fsr3: 0, fsr4: 0,
    fsr5: 0, fsr6: 0, fsr7: 0, fsr8: 0
  },
  patientPresent: false,
  timestamp: new Date().toISOString()
};

let sensorHistory: any[] = [];

export async function GET() {
  return NextResponse.json({
    currentData: latestSensorData,
    history: sensorHistory
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Map/normalize payload from ESP32
    const fsr = typeof data.fsr === 'number' ? data.fsr : (data.pressure?.fsr1 ?? 0);
    const pressureObj = data.pressure && typeof data.pressure === 'object' ? {
      fsr1: Number(data.pressure.fsr1 ?? fsr),
      fsr2: Number(data.pressure.fsr2 ?? fsr),
      fsr3: Number(data.pressure.fsr3 ?? fsr),
      fsr4: Number(data.pressure.fsr4 ?? fsr),
      fsr5: Number(data.pressure.fsr5 ?? fsr),
      fsr6: Number(data.pressure.fsr6 ?? fsr),
      fsr7: Number(data.pressure.fsr7 ?? fsr),
      fsr8: Number(data.pressure.fsr8 ?? fsr),
    } : {
      fsr1: fsr, fsr2: fsr, fsr3: fsr, fsr4: fsr,
      fsr5: fsr, fsr6: fsr, fsr7: fsr, fsr8: fsr,
    };

    const isPresent = Boolean(
      data.patientPresent ?? (fsr > 100 || (data.heartRate && data.heartRate > 0))
    );

    latestSensorData = {
      heartRate: Number(data.heartRate ?? 0),
      spo2: Number(data.spo2 ?? (data.heartRate > 0 ? 98 : 0)),
      temperature: Number(data.temperature ?? 0),
      movement: {
        x: Number(data.movement?.x ?? data.accelX ?? 0),
        y: Number(data.movement?.y ?? data.accelY ?? 0),
        z: Number(data.movement?.z ?? data.accelZ ?? 0),
      },
      pressure: pressureObj,
      patientPresent: isPresent,
      timestamp: data.timestamp || new Date().toISOString()
    };

    sensorHistory.push({ ...latestSensorData });
    if (sensorHistory.length > 50) {
      sensorHistory.shift();
    }

    console.log('[ESP32 Telemetry]', {
      heartRate: latestSensorData.heartRate,
      temperature: latestSensorData.temperature,
      fsr: pressureObj.fsr1,
      patientPresent: latestSensorData.patientPresent,
      time: new Date().toLocaleTimeString()
    });

    return NextResponse.json({ success: true, message: 'Sensor data recorded' });
  } catch (error) {
    console.error('Error processing sensor data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

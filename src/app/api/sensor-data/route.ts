import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
  // If memory cache is empty, load recent history from Supabase
  if (sensorHistory.length === 0) {
    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        sensorHistory = data.reverse().map((row: any) => ({
          heartRate: Number(row.heart_rate ?? 0),
          spo2: Number(row.spo2 ?? 0),
          temperature: Number(row.temperature ?? 0),
          movement: {
            x: Number(row.movement_x ?? 0),
            y: Number(row.movement_y ?? 0),
            z: Number(row.movement_z ?? 0),
          },
          pressure: {
            fsr1: Number(row.fsr ?? 0),
            fsr2: Number(row.fsr ?? 0),
            fsr3: Number(row.fsr ?? 0),
            fsr4: Number(row.fsr ?? 0),
            fsr5: Number(row.fsr ?? 0),
            fsr6: Number(row.fsr ?? 0),
            fsr7: Number(row.fsr ?? 0),
            fsr8: Number(row.fsr ?? 0),
          },
          patientPresent: Boolean(row.patient_present),
          timestamp: row.created_at
        }));

        if (sensorHistory.length > 0) {
          latestSensorData = sensorHistory[sensorHistory.length - 1];
        }
      }
    } catch (e) {
      // Table may not exist yet or connection issue
    }
  }

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

    // Save reading to Supabase asynchronously
    supabase
      .from('sensor_readings')
      .insert({
        patient_id: data.patientId || 'patient-1',
        heart_rate: latestSensorData.heartRate,
        spo2: latestSensorData.spo2,
        temperature: latestSensorData.temperature,
        fsr: pressureObj.fsr1,
        patient_present: isPresent,
        movement_x: latestSensorData.movement.x,
        movement_y: latestSensorData.movement.y,
        movement_z: latestSensorData.movement.z,
      })
      .then(({ error }) => {
        if (error) {
          console.warn('[Supabase Warning] Could not persist to sensor_readings:', error.message);
        }
      })
      .catch((err) => {
        console.warn('[Supabase Exception]', err);
      });

    return NextResponse.json({ success: true, message: 'Sensor data recorded' });
  } catch (error) {
    console.error('Error processing sensor data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

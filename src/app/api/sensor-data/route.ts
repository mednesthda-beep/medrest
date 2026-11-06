import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface MovementData {
  x: number;
  y: number;
  z: number;
}

interface SensorDataPayload {
  heartRate: number;
  spo2: number;
  temperature: number;
  movement: MovementData;
  pressure: {
    fsr1: number;
  };
  patientPresent: boolean;
  timestamp: string;
}

// In-memory telemetry fallback for ESP32 data stream
let latestSensorData: SensorDataPayload = {
  heartRate: 0,
  spo2: 0,
  temperature: 0,
  movement: { x: 0, y: 0, z: 0 },
  pressure: {
    fsr1: 0,
  },
  patientPresent: false,
  timestamp: new Date().toISOString(),
};

const sensorHistory: SensorDataPayload[] = [];

const ESP32_IP = process.env.ESP32_IP || '10.157.164.158';

async function fetchDirectFromESP32(): Promise<SensorDataPayload | null> {
  if (!ESP32_IP) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600);
    const res = await fetch(`http://${ESP32_IP}/api/sensor-data`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return {
        heartRate: Number(data.heartRate ?? 0),
        spo2: Number(data.spo2 ?? (data.heartRate > 0 ? 98 : 0)),
        temperature: Number(data.temperature ?? 0),
        movement: {
          x: Number(data.movement?.x ?? 0),
          y: Number(data.movement?.y ?? 0),
          z: Number(data.movement?.z ?? 0),
        },
        pressure: {
          fsr1: Number(data.fsr ?? data.pressure?.fsr1 ?? 0),
        },
        patientPresent: Boolean(data.patientPresent ?? (data.heartRate > 0 || (data.fsr && data.fsr > 100))),
        timestamp: data.timestamp || new Date().toISOString(),
      };
    }
  } catch {
    // ESP32 may be offline or on separate subnet
  }
  return null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  // If no live telemetry was POSTed recently, attempt direct fetch from ESP32 IP
  const isStale =
    !latestSensorData.timestamp ||
    Date.now() - new Date(latestSensorData.timestamp).getTime() > 2500;

  if (isStale) {
    const directData = await fetchDirectFromESP32();
    if (directData) {
      latestSensorData = directData;
      sensorHistory.push({ ...directData });
      if (sensorHistory.length > 50) {
        sensorHistory.shift();
      }
    }
  }

  try {
    // Fetch latest telemetry history directly from Supabase
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data && data.length > 0) {
      const history: SensorDataPayload[] = data.reverse().map((row) => ({
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
        },
        patientPresent: Boolean(row.patient_present),
        timestamp: row.created_at,
      }));

      let latest = history[history.length - 1];

      // Prioritize live in-memory reading for instant zero-lag dashboard updates
      if (
        latestSensorData &&
        latestSensorData.timestamp &&
        (!latest || new Date(latestSensorData.timestamp).getTime() >= new Date(latest.timestamp).getTime())
      ) {
        latest = latestSensorData;
      }

      return NextResponse.json(
        {
          currentData: latest,
          history: history,
        },
        {
          headers: {
            ...corsHeaders,
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        }
      );
    }
  } catch (e) {
    console.warn('[Supabase Query Warning]', e);
  }

  // Fallback to in-memory cache if database has no records yet
  return NextResponse.json(
    {
      currentData: latestSensorData,
      history: sensorHistory,
    },
    {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Map single FSR reading from ESP32
    const fsr = typeof data.fsr === 'number' ? data.fsr : Number(data.pressure?.fsr1 ?? 0);
    const pressureObj = {
      fsr1: fsr,
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
      timestamp: data.timestamp || new Date().toISOString(),
    };

    sensorHistory.push({ ...latestSensorData });
    if (sensorHistory.length > 50) {
      sensorHistory.shift();
    }

    console.log(
      `[ESP32 Live Telemetry] FSR=${pressureObj.fsr1} | Temp=${latestSensorData.temperature}°C | HR=${latestSensorData.heartRate} BPM | SpO2=${latestSensorData.spo2}% | Present=${isPresent}`
    );

    // Await saving reading to Supabase so serverless container doesn't terminate before completion
    try {
      const { error: insertError } = await supabase.from('sensor_readings').insert({
        patient_id: data.patientId || 'patient-1',
        heart_rate: latestSensorData.heartRate,
        spo2: latestSensorData.spo2,
        temperature: latestSensorData.temperature,
        fsr: pressureObj.fsr1,
        patient_present: isPresent,
        movement_x: latestSensorData.movement.x,
        movement_y: latestSensorData.movement.y,
        movement_z: latestSensorData.movement.z,
      });

      if (insertError) {
        console.warn('[Supabase Warning] Could not persist to sensor_readings:', insertError.message);
      }
    } catch (dbErr) {
      console.warn('[Supabase Exception]', dbErr);
    }

    return NextResponse.json(
      { success: true, message: 'Sensor data recorded' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error processing sensor data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

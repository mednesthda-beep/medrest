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

      const latest = history[history.length - 1];

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

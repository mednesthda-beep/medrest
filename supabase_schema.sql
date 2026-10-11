-- ============================================================================
-- MedNest Guardian: Supabase Database Schema
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bhvcffuampucuzxmgcew/sql/new
-- ============================================================================

-- 1. Create sensor_readings table for ESP32 telemetry
CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id TEXT NOT NULL DEFAULT 'patient-1',
    heart_rate NUMERIC(5, 2) DEFAULT 0,
    spo2 NUMERIC(5, 2) DEFAULT 0,
    temperature NUMERIC(5, 2) DEFAULT 0,
    fsr INTEGER DEFAULT 0,
    patient_present BOOLEAN DEFAULT false,
    movement_x NUMERIC(6, 3) DEFAULT 0,
    movement_y NUMERIC(6, 3) DEFAULT 0,
    movement_z NUMERIC(6, 3) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for ultra-fast historical chart querying
CREATE INDEX IF NOT EXISTS idx_sensor_readings_patient_created
    ON public.sensor_readings (patient_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated & anonymous users
CREATE POLICY "Allow public read on sensor_readings"
    ON public.sensor_readings
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow insert access from API / ESP32
CREATE POLICY "Allow public insert on sensor_readings"
    ON public.sensor_readings
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);


-- 2. Create emergency_alerts table for critical vital events
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id TEXT NOT NULL DEFAULT 'patient-1',
    alert_type TEXT NOT NULL, -- 'cardiac_spike', 'hypoxia', 'fever', 'fall_detected', 'bed_exit'
    severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created
    ON public.emergency_alerts (created_at DESC);

ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on emergency_alerts"
    ON public.emergency_alerts
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow public insert/update on emergency_alerts"
    ON public.emergency_alerts
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);


-- 3. Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    room_number TEXT,
    medical_condition TEXT,
    guardian_contact TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on patients"
    ON public.patients
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow public insert/update on patients"
    ON public.patients
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Seed initial demo patient
INSERT INTO public.patients (id, name, age, gender, room_number, medical_condition, guardian_contact)
VALUES 
    ('patient-1', 'John Doe', 72, 'Male', 'Room 304 - Bed A', 'Cardiac Recovery / Post-Op', '+1 555-0199')
ON CONFLICT (id) DO NOTHING;


-- 4. Enable Supabase Realtime for live web subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;

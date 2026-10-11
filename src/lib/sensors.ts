import { create } from 'zustand';

export type SensorData = {
  heartRate: number;
  spo2: number;
  temperature: number;
  movement: { x: number; y: number; z: number };
  pressure: {
    fsr1: number; fsr2: number;
    fsr3: number; fsr4: number;
    fsr5: number; fsr6: number;
    fsr7: number; fsr8: number;
  };
  patientPresent: boolean;
  timestamp: string;
};

interface SensorState {
  currentData: SensorData;
  history: SensorData[];
  demoStatus: 'normal' | 'abnormal' | 'emergency' | 'inactive';
  setDemoStatus: (status: 'normal' | 'abnormal' | 'emergency' | 'inactive') => void;
  updateRealData: (data: SensorData) => void;
  generateReading: () => void;
}

const generateBaseReading = (status: 'normal' | 'abnormal' | 'emergency' | 'inactive'): SensorData => {
  const isPresent = status !== 'inactive';
  
  // Base normal values
  let hr = 70 + Math.floor(Math.random() * 10) - 5;
  let spo2 = 98 - Math.floor(Math.random() * 2);
  let temp = 36.6 + (Math.random() * 0.4 - 0.2);
  
  if (status === 'abnormal') {
    hr = 105 + Math.floor(Math.random() * 15);
    temp = 38.2 + Math.random() * 0.5;
  } else if (status === 'emergency') {
    hr = 140 + Math.floor(Math.random() * 20);
    spo2 = 91 - Math.floor(Math.random() * 5);
  } else if (status === 'inactive') {
    hr = 0;
    spo2 = 0;
    temp = 0;
  }

  // Generate pressure based on presence
  const basePressure = isPresent ? 300 : 0;
  const pressureVariance = isPresent ? 150 : 0;

  return {
    heartRate: isPresent ? hr : 0,
    spo2: isPresent ? spo2 : 0,
    temperature: isPresent ? Number(temp.toFixed(1)) : 0,
    movement: {
      x: isPresent ? Math.random() * 0.2 : 0,
      y: isPresent ? Math.random() * 0.2 : 0,
      z: isPresent ? 0.9 + Math.random() * 0.1 : 0,
    },
    pressure: {
      fsr1: Math.max(0, basePressure + (Math.random() * pressureVariance - pressureVariance/2)),
      fsr2: Math.max(0, basePressure + (Math.random() * pressureVariance - pressureVariance/2)),
      fsr3: Math.max(0, basePressure + 50 + (Math.random() * pressureVariance - pressureVariance/2)),
      fsr4: Math.max(0, basePressure + 50 + (Math.random() * pressureVariance - pressureVariance/2)),
      fsr5: Math.max(0, basePressure + (Math.random() * pressureVariance - pressureVariance/2)),
      fsr6: Math.max(0, basePressure + (Math.random() * pressureVariance - pressureVariance/2)),
      fsr7: Math.max(0, basePressure - 50 + (Math.random() * pressureVariance - pressureVariance/2)),
      fsr8: Math.max(0, basePressure - 50 + (Math.random() * pressureVariance - pressureVariance/2)),
    },
    patientPresent: isPresent,
    timestamp: new Date().toISOString()
  };
};

export const useSensorStore = create<SensorState>((set, get) => ({
  currentData: {
    heartRate: 0,
    spo2: 0,
    temperature: 0,
    movement: { x: 0, y: 0, z: 0 },
    pressure: { fsr1: 0, fsr2: 0, fsr3: 0, fsr4: 0, fsr5: 0, fsr6: 0, fsr7: 0, fsr8: 0 },
    patientPresent: false,
    timestamp: new Date().toISOString()
  },
  history: [],
  demoStatus: 'normal',
  setDemoStatus: (status) => set({ demoStatus: status }),
  updateRealData: (data: SensorData) => set((state) => ({
    currentData: data,
    history: [...state.history.slice(-30), data],
  })),
  generateReading: () => {
    // Disabled fake data generation
  }
}));

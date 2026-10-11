import { create } from 'zustand';

export type SensorData = {
  heartRate: number;
  spo2: number;
  temperature: number;
  movement: { x: number; y: number; z: number };
  pressure: {
    fsr1: number;
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

export const useSensorStore = create<SensorState>((set) => ({
  currentData: {
    heartRate: 0,
    spo2: 0,
    temperature: 0,
    movement: { x: 0, y: 0, z: 0 },
    pressure: { fsr1: 0 },
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

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
    set((state) => {
      const isPresent = state.demoStatus !== 'inactive';
      const hrBase =
        state.demoStatus === 'emergency' ? 128 : state.demoStatus === 'abnormal' ? 98 : 74;
      const tempBase = state.demoStatus === 'emergency' ? 38.9 : 36.6;
      const spo2Base = state.demoStatus === 'emergency' ? 91 : 98;

      const newReading: SensorData = {
        heartRate: isPresent ? Math.round(hrBase + (Math.random() * 4 - 2)) : 0,
        spo2: isPresent ? Math.round(spo2Base + (Math.random() * 2 - 1)) : 0,
        temperature: isPresent
          ? parseFloat((tempBase + (Math.random() * 0.4 - 0.2)).toFixed(2))
          : 24.5,
        movement: {
          x: parseFloat((Math.random() * 0.2 - 0.1).toFixed(2)),
          y: parseFloat((Math.random() * 0.2 - 0.1).toFixed(2)),
          z: 9.81,
        },
        pressure: {
          fsr1: isPresent ? 850 + Math.floor(Math.random() * 50) : 0,
        },
        patientPresent: isPresent,
        timestamp: new Date().toISOString(),
      };

      return {
        currentData: newReading,
        history: [...state.history.slice(-30), newReading],
      };
    });
  },
}));

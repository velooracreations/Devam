import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShippingSettings {
  flatRate: number;
  freeShippingThreshold: number;
  bulkWeightThreshold: number; // e.g. 10 kg
  bulkShippingRate: number;    // e.g. 150
}

interface SettingsState {
  shipping: ShippingSettings;
  updateShipping: (settings: ShippingSettings) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      shipping: {
        flatRate: 50,
        freeShippingThreshold: 500,
        bulkWeightThreshold: 10,
        bulkShippingRate: 150,
      },
      updateShipping: (settings) => set({ shipping: settings }),
    }),
    {
      name: 'devam-settings-storage',
    }
  )
);

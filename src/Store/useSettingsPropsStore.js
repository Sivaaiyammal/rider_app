import { create } from "zustand";
import { DataStore } from "../Constants/DataStore";
import {
  distanceFormate,
  pickerAccuracy,
  pickerAppearance,
  pickerRoute,
} from "../Constants/JsonData";

const defaultSettings = {
  gpsReliability: pickerAccuracy[0],
  navAccuracy: pickerAccuracy[0],
  mapAppearance: pickerAppearance[0],
  highways: pickerRoute[0],
  tolls: pickerRoute[0],
  ferry: pickerRoute[0],
  livingStreet: pickerRoute[0],
  distanceFormate: distanceFormate[0],
};

export const useSettingsPropsStore = create((set) => ({
  settings: defaultSettings,

  initializeSettings: async () => {
    try {
      const storedSettings = await DataStore.loadData("settings");
      if (storedSettings.data) {
        const settingsNew = storedSettings.data;
        console.log("Loaded settings from storage:", settingsNew);
        set({ settings: settingsNew });
      } else {
        console.log("No settings found, using default:", defaultSettings);
        await DataStore.storeData("settings", defaultSettings);
        set({ settings: defaultSettings });
      }
    } catch (error) {
      console.error("Failed to load settings from storage:", error);
    }
  },
  updateSettings: async (newSettings) => {
    try {
      set({ settings: newSettings });
      await DataStore.storeData("settings", newSettings);
      console.log("Updated settings in storage:", newSettings);
    } catch (error) {
      console.error("Failed to update settings in storage:", error);
    }
  },
}));

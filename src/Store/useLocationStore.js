import { create } from "zustand";

const useLocationStore = create((set) => ({
  location: null,
  setLocation: (location) => set({ location }),
}));

export default useLocationStore;

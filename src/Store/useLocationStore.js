import { create } from "zustand";

const useLocationStore = create((set) => ({
  location: null,
  setLocation: (location) => set({ location }),

  // to save routes
  savedRoutes: [],
  setSavedRoutes: (data) =>
    set((state) => ({
      savedRoutes: [
        ...state.savedRoutes,
        data,
      ],
    })),

  // to save location i.e home, work, other
  savedLocation: [],
  setSavedLocation: (data) =>
    set((state) => ({
      savedLocation: [
        ...state.savedLocation,
        data,
      ],
    })),
}));

export default useLocationStore;

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
}));

export default useLocationStore;

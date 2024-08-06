import { create } from "zustand";

const useLocationStore = create((set) => ({
  location: null,
  setLocation: (location) => set({ location }),

  directions: [
    { id: 1, name: "Start", location: [], locationName: "" },
    { id: 2, name: "Waypoint", location: [], locationName: "" },
    { id: 3, name: "End", location: [], locationName: "" },
  ],
  setDirections: (direction) => set({ direction }),

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

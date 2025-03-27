import { create } from 'zustand';

/**
 * Store for managing driver location data
 * Contains coordinates, angle, and maximum speed information
 */
const useDriverLocationStore = create((set) => ({
  // Driver location state with coordinates, angle, and maxspeed
  driverLocation: null,
  driverAngle: null,
  driverMaxSpeed: null,
  
  // Update driver location with new data
  setDriverLocation: (location) => set({ driverLocation: location }),
  
  // Reset driver location to default values
  resetDriverLocation: () => set({
    driverLocation: null,
    driverAngle: null,
    driverMaxSpeed: null
  }),
}));

export default useDriverLocationStore;

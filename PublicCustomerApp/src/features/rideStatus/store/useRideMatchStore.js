import { create } from 'zustand';

const useRideMatchStore = create(set => ({
  currentDriverLatitude: null,
  setCurrentDriverLatitude: (latitude) => set({ currentDriverLatitude: latitude }),

  currentDriverLongitude: null,
  setCurrentDriverLongitude: (longitude) => set({ currentDriverLongitude: longitude }),

  driverName: null,
  setDriverName: (name) => set({ driverName: name }),

  status: null,
  setStatus: (status) => set({ status }),

  message: null,
  setMessage: (message) => set({ message }),

  setRideMatchStatus: (data) => {
    // Update status and message
    set({
      status: data.status || null,
      message: data.message || null,
      driverName: data.driver?.name || null,
      currentDriverLatitude: data.driver?.location?.[1] ?? null,
      currentDriverLongitude: data.driver?.location?.[0] ?? null,
    });
  },

  resetRideMatchStatus: () => {
    set({
      status: null,
      message: null,
      driverName: null,
    });
  },
}));

export default useRideMatchStore;

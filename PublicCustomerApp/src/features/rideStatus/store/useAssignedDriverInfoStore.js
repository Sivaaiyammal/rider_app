import { create } from 'zustand';

const useAssignedDriverInfoStore = create((set) => ({
  driverName: '',
  rating: null,
  phone: '',
  vehicleNumber: '',
  model: '',
  color: '',
  driverLatitude: null,
  driverLongitude: null,

  setDriverInfo: (info) =>
    set((state) => ({
      ...state,
      ...info,
    })),
  clearDriverInfo: () =>
    set({
      driverName: '',
      rating: null,
      phone: '',
      vehicleNumber: '',
      model: '',
      color: '',
      driverLatitude: null,
      driverLongitude: null,
    }),
}));

export default useAssignedDriverInfoStore;
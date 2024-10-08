import {create} from 'zustand';

const useDriverStatusStore = create(set => ({
  driverStatus: 'Online',
  setDriverStatus: driverStatus => set({driverStatus}),
}));

export default useDriverStatusStore;

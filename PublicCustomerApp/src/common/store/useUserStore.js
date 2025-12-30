import {create} from 'zustand';

const useUserStore = create(set => ({
  userRole: 'customer',
  setUserRole: userRole => set({userRole}),
}));

export default useUserStore;

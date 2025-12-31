import {create} from 'zustand';

const useUserStore = create(set => ({
  userRole: 'customer',
  setUserRole: userRole => set({userRole}),

  userInfo: null,
  setUserInfo: userInfo => set({userInfo}),
}));

export default useUserStore;

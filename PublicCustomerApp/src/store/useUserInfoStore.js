import { create } from 'zustand';


const useUserInfoStore = create(set => ({
  id: null,
  setID: id => set({ id }),

  userdetails: null,
  setUserdetails: userdetails => set({ userdetails }),


}));

export default useUserInfoStore;

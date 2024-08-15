import { create } from "zustand";

const useTabScreenStore = create((set) => ({
  currentScreen: 'Home',
  setCurrentScreen: (currentScreen) => set({ currentScreen })
}));

export default useTabScreenStore;

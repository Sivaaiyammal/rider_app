import { create } from 'zustand';

const useLocationStore = create((set) => ({
    savedRoute: [],
    setSavedRoute: savedRoute => set({ savedRoute }),
}));

export default useLocationStore;

import { create } from 'zustand';

const defaultStyles = {
  
  width: "100%",
  height: "100%",
 
};

const useMapStyleStore = create((set) => ({
  defaultStyle: defaultStyles,

  // Method to update the map style
  setMapStyle: (newStyle) => set({ defaultStyle: {...newStyle } }),

  // Method to reset to default
  resetMapStyle: () => set({ defaultStyle: defaultStyles }),
}));

export default useMapStyleStore;

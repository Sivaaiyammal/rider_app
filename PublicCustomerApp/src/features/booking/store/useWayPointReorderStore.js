import { create } from 'zustand';

const useWayPointReorderStore = create((set, get) => ({
  // State
  reOrderWaypoints: [],
  isLoading: false,
  lastAddStopIndex: 0,

  // Actions
  setReOrderWaypoints: (waypoints) => {
    set({ reOrderWaypoints: waypoints });
  },

  setIsLoading: (isLoading) => {
    set({ isLoading });
  },

  setLastAddStopIndex: (index) => {
    set({ lastAddStopIndex: index });
  },

  addWaypoint: (waypoint, index) => {
    const { reOrderWaypoints } = get();
    const newWaypoints = [...reOrderWaypoints];
    newWaypoints.splice(index, 0, waypoint);
    set({ reOrderWaypoints: newWaypoints });
  },

  removeWaypoint: (index) => {
    const { reOrderWaypoints } = get();
    const newWaypoints = reOrderWaypoints.filter((_, i) => i !== index);
    set({ reOrderWaypoints: newWaypoints });
  },

  reorderWaypoints: (reorderedData) => {
    const lastAddStopIndex = reorderedData.findIndex(item => item.type === 'add-stop');
    const filteredData = reorderedData.filter(item => item.type !== 'add-stop');
    
    if (filteredData.length > 0) {
      const processedData = filteredData.map((item, index) => ({
        ...item,
        type: index === 0 ? 'START_LOCATION' : 
              index === filteredData.length - 1 ? 'DESTINATION_LOCATION' : 
              'WAYPOINT_LOCATION'
      }));

      set({ 
        reOrderWaypoints: processedData,
        lastAddStopIndex: lastAddStopIndex
      });
    }
  },

  reset: () => {
    set({ 
      reOrderWaypoints: [], 
      isLoading: false, 
      lastAddStopIndex: 0 
    });
  }
}));

export default useWayPointReorderStore;

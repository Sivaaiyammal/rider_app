import { create } from 'zustand';

// Vehicle data structure
const VEHICLE_TYPES = [
    { 
      id: '1', 
      type: 'AUTO', 
      name: 'Auto ', 
      capacity: '3', 
      basePrice: 50, 
      maxPrice: 80,
      timeToPickup: 5,
      dropat:"11:09 PM"
     
    },
    { 
      id: '2', 
      type: 'BIKE', 
      name: 'Bike Hop', 
      capacity: '1', 
      basePrice: 30, 
      maxPrice: 50,
      timeToPickup: 5,
      dropat:"11:09 PM"
      
     
    },
    { 
      id: '3', 
      type: 'HATCHBACK', 
      name: 'Hatchback', 
      capacity: '4', 
      basePrice: 80, 
      maxPrice: 120,
      timeToPickup: 5,
      dropat:"11:09 PM"
      
    },
    { 
      id: '4', 
      type: 'SEDAN', 
      name: 'Sedan', 
      capacity: '4', 
      basePrice: 100, 
      maxPrice: 150,
      timeToPickup: 5,
      dropat:"11:09 PM"
    },
    { 
      id: '5', 
      type: 'SUV', 
      name: 'SUV', 
      capacity: '6', 
      basePrice: 120, 
      maxPrice: 180,
      timeToPickup: 5,
      dropat:"11:09 PM"
    }
  ];
const useRideVehicleStore = create((set,get) => ({
  // State
  availableVehicles: null,
  selectedVehicle: null,

  // Actions
  setAvailableVehicles: (vehicles) => {
    set({ availableVehicles: vehicles });
  },

  setSelectedVehicle: (vehicle) => {
    set({ selectedVehicle: vehicle });
  },

  clearSelectedVehicle: () => {
    set({ selectedVehicle: null });
  },

  clearAvailableVehicles: () => {
    set({ availableVehicles: [] });
  },

  resetVehicleStore: () => {
    set({ 
      availableVehicles: [], 
      selectedVehicle: null 
    });
  },
}));

export default useRideVehicleStore;

import {create} from 'zustand';

const initialDirections = {
  directions: [
    {id: 1, name: 'Start', location: [], locationName: ''},
    {id: 2, name: 'End', location: [], locationName: ''},
  ],
};

const useLocationStore = create(set => ({
  location: null,
  setLocation: location => set({location}),

  ...initialDirections,
  setDirections: setDirection => set({directions: setDirection}),

  currentLocationName: '',
  setCurrentLocationName: locationName =>
    set({currentLocationName: locationName}),

  resetDirections: () => set({...initialDirections}),
}));

export default useLocationStore;

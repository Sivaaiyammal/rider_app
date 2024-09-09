import {create} from 'zustand';

const useLocationStore = create(set => ({
  location: null,
  setLocation: location => set({location}),

  directions: [
    {id: 1, name: 'Start', location: [], locationName: ''},
    {id: 2, name: 'End', location: [], locationName: ''},
  ],
  setDirections: setDirection => set({directions: setDirection}),

}));

export default useLocationStore;

import { create } from 'zustand';


const useUserInfoStore = create(set => ({
  id: null,
  setID: id => set({ id }),

  userdetails: null,
  setUserdetails: userdetails => set({ userdetails }),

  homelocation:null,
  setHomelocation: homelocation => set({ homelocation }),

  worklocation:null,
  setWorklocation: worklocation => set({ worklocation }), 

  isFavouriteLocationSearchEnabled:false,
  setIsFavouriteLocationSearchEnabled: isFavouriteLocationSearchEnabled => set({ isFavouriteLocationSearchEnabled }),

  CurrentSearchFavouriteLocation:null,
  setCurrentSearchFavouriteLocation: CurrentSearchFavouriteLocation => set({ CurrentSearchFavouriteLocation }),


}));

export default useUserInfoStore;

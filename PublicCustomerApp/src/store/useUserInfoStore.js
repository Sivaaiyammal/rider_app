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

  isPreferenceShow:false,
  setIsPreferenceShow: isPreferenceShow => set({ isPreferenceShow }),

  userFavPlaces:null,
  setUserFavPlaces: userFavPlaces => set({ userFavPlaces }),
}));

export default useUserInfoStore;

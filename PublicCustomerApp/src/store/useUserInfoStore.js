import { create } from 'zustand';
import { DataStore } from '../controllers/DataStore';
import i18n from '../i18n';

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

  userFavPlaces:[],
  setUserFavPlaces: userFavPlaces => set({ userFavPlaces }),

  

  
  setTotalSpend: totalSpend => set({ totalSpend }),
  setTotalTrips: totalTrips => set({ totalTrips }),
  setCancelledTrips: cancelledTrips => set({ cancelledTrips }),
  setCompletedTrips: completedTrips => set({ completedTrips }),

  incrementTotalTrips: () => set(state => ({ totalTrips: state.totalTrips + 1 })),
  incrementCompletedTrips: () => set(state => ({ completedTrips: state.completedTrips + 1 })),
  incrementCancelledTrips: () => set(state => ({ cancelledTrips: state.cancelledTrips + 1 })),
  incrementTotalSpend: (amount) => set(state => ({ totalSpend: state.totalSpend + amount })),


  language:null,
  setLanguage: async (language) => {
    console.log('language', language);
    i18n.changeLanguage(language);
    await DataStore.storeData('language', language);
    set({ language });
  },

  ratingData:null,
  setRatingData: ratingData => set({ ratingData }),
}));

export default useUserInfoStore;

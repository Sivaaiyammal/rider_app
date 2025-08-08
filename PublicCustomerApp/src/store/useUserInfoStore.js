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

  userFavPlaces:null,
  setUserFavPlaces: userFavPlaces => set({ userFavPlaces }),

  language:null,
  setLanguage: async (language) => {
    console.log('language', language);
    i18n.changeLanguage(language);
    await DataStore.storeData('language', language);
    set({ language });
  },
}));

export default useUserInfoStore;

import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Keychain from 'react-native-keychain';

export const DataStore = {
  storeData: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  },

  loadData: async (key) => {
    try {
      let data = await AsyncStorage.getItem(key);
      data = JSON.parse(data);
      if (data) {
        // console.log(`Data loaded from store: ${key}`, data);
        return {
          status: true,
          data: data,
        };
      } else {
        return {
          status: false,
          data: null, 
        };
      }
    } catch (error) {
      throw error;
    }
  }
};

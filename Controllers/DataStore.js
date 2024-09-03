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
  },

  // loadSecureData: async (key) => {
  //   try {
  //     const credentials = await Keychain.getGenericPassword({
  //       service: key,
  //     });
  //     if (credentials) {
  //       console.log(`Credentials loaded for ${key}.`);
  //       return {
  //         status: true,
  //         data: credentials,
  //       };
  //     } else {
  //       console.log(`No credentials stored for ${key}.`);
  //       return {
  //         status: false,
  //         data: null,
  //       };
  //     }
  //   } catch (error) {
  //     console.error(`Keychain couldn't be accessed!`, error);
  //     throw error;
  //   }
  // },

  // storeSecureData: async (key, value) => {
  //   try {
  //     console.log("...values", value)
  //     await Keychain.setGenericPassword(JSON.stringify(value), key);
  //     console.log(`Credentials saved for ${key}`);
  //   } catch (error) {
  //     console.error(`Keychain couldn't be accessed!`, error);
  //     throw error;
  //   }
  // },
};

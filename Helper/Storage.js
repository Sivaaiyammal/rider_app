// import { AsyncStorage } from '@react-native-community/async-storage';

// class Storage {

//   constructor() {
//   }

//   // Save a key-value pair to AsyncStorage
//   static async setItem(key, value) {
//     try {
//       await AsyncStorage.setItem(key, JSON.stringify(value));
//     } catch (error) {
//       // console.error('AsyncStorage error: ', error);
//     }
//   }

//   // Retrieve a value from AsyncStorage
//   static async getItem(key) {
//     try {
//       const value = await AsyncStorage.getItem(key);
//       return value != null ? JSON.parse(value) : null;
//     } catch (error) {
//       // console.error('AsyncStorage error: ', error);
//       return null;
//     }
//   }

//   // Remove a value from AsyncStorage
//   static async removeItem(key) {
//     try {
//       await AsyncStorage.removeItem(key);
//     } catch (error) {
//       // console.error('AsyncStorage error: ', error);
//     }
//   }
// }

// export default Storage;

// import { NativeModules, Platform } from 'react-native';


// const { PlayIntegrityModule } = NativeModules;

// const getAppCheckToken = () => {
//     if (Platform.OS === 'ios') {
//       const appCheck = require('@react-native-firebase/app-check').default;
//       return appCheck()
//         .getToken()
//         .then((res) => res.token);
//     }
//     if (Platform.OS === 'android') {
//       return PlayIntegrityModule.getToken();
//     }
//     return Promise.reject(new Error('not platform found'));
//   };

// export { PlayIntegrityModule, getAppCheckToken };
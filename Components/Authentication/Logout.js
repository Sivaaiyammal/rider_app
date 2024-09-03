import auth from '@react-native-firebase/auth';
import NotificationManager from '../Notification/NotificationManager';
import { DataStore } from '../../Controllers/DataStore';

class Logout {
  constructor() { }

  async logout() {
    try {
      await auth().signOut();
      console.log("signingOut")
      NotificationManager.success('Logout Successful. You have been logged out.', 5000, 'bottom');
      await DataStore.storeData('user', null);
      await DataStore.storeData('FIREBASE_TOKEN', null)
      await DataStore.storeData('userPhone', null)
      await DataStore.storeData('isRegister', null)

      return true;
    } catch (error) {
      console.error('Logout Error', error);
      NotificationManager.error('Error... An error occurred while logging out.', 5000, 'bottom');
      return false;
    }
  }
}


export default Logout;
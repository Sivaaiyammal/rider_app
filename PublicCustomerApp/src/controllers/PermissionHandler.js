import { Alert, Linking, Platform } from 'react-native';

import { PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';


export const checkFineLocationPermissions = async () => {
  try {
    let grantedFineLocation = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    return grantedFineLocation;
  } catch (error) {
    console.error('Error checking fine location permissions:', error);
    return false;
  }
}

export const checkNotificationPermissions = async () => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().hasPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
             authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } else {
      // For Android, notification permissions are granted by default for API < 33
      // For API >= 33, we need to check POST_NOTIFICATIONS permission
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        return granted;
      }
      return true;
    }
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

export const RequestFineLocationPermission = async () => {

  const hasFineLocationPermission = await checkFineLocationPermissions()
  if (hasFineLocationPermission) {
    return true;
  } else {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (result === "never_ask_again") {
      Alert.alert(
        'Permission Required','',
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings()
          }
        ]
      );
      return false
    }

    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
}

export const RequestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    } else {
      // For Android API >= 33, request POST_NOTIFICATIONS permission
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // For older Android versions, notifications are granted by default
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export const RequestAllPermissions = async () => {
  try {
    // Request both location and notification permissions
    // const locationPermission = await RequestFineLocationPermission();
    const notificationPermission = await RequestNotificationPermission();
    
    return {
      // location: locationPermission,
      notification: notificationPermission
    };
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return {
      location: false,
      notification: false
    };
  }
}
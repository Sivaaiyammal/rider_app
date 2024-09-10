import { Alert, Linking } from 'react-native';

import { PermissionsAndroid } from 'react-native';


export const checkFineLocationPermissions = async () => {
  try {
    let grantedFineLocation = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    return grantedFineLocation;
  } catch (error) {
    console.error('Error checking fine location permissions:', error);
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
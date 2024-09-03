import { checkMultiple, PERMISSIONS, requestMultiple, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

export default PermissionHandler = async () => {

  const permissions = Platform.select({
    ios: [
      PERMISSIONS.IOS.CAMERA,
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    ],
    android: [
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ],
  });

  //   const requestPermissions = () => {
  requestMultiple(permissions).then((statuses) => {
    if (statuses[PERMISSIONS.ANDROID.CAMERA] === RESULTS.GRANTED && statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED) {
      // alert("All permissions granted!");
    } else {
      alert("Not all permissions were granted");
    }
  });
  //   }

};
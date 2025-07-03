/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import Geolocation from 'react-native-geolocation-service';
import useLocationStore from '../store/useLocationStore';
import useMapStore from '../store/useMapStore';

class currentLocation {
  constructor() {}
  async getCurrentLocation() {
    const {setLocation} = useLocationStore.getState();
    const {setMapLocation} = useMapStore.getState();
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          
          resolve(position);
          setLocation([position.coords.longitude, position.coords.latitude]);
          setTimeout(() => {
            setMapLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              zoom: 25,
            });
          }, 1000);
        },
        error => {
          reject(error);
          setLocation(null);
        },
        {
          accuracy: {
            android: 'high',
            ios: 'bestForNavigation',
          },
          enableHighAccuracy: true,
          maximumAge: 20000,
          distanceFilter: 0,
          useSignificantChanges: false,
        },
      );
    });
  }
}

const locationTask = new currentLocation();
export default locationTask;

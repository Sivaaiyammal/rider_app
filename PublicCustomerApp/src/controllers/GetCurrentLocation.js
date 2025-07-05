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
    const {setMapLocation,setLoading} = useMapStore.getState();
    setLoading(true); // Set loading to true before starting the geolocation process
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          console.log(
            'hari-->>community-->>Position-->>',
            position.coords.longitude,
          );
          resolve(position);
          setLocation([position.coords.longitude, position.coords.latitude]);
          setMapLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            zoom: 25,
          });
          setLoading(false); // Set loading to false after successfully getting the position
        },
        error => {
          console.log('hari-->>community-->>Error-->>',error);
          reject(error);
          setLocation(null);
          setLoading(false); // Set loading to false if there is an error
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

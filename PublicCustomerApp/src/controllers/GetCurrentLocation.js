/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import Geolocation from 'react-native-geolocation-service';
import useLocationStore from '../store/useLocationStore';
import useMapStore from '../features/map/store/useMapStore';
import { utils } from '../utils/Utils';
import { height } from '../utils/Utils';

class currentLocation {
  constructor() {}
  async getCurrentLocation() {
    const {setLocation} = useLocationStore.getState();
    const {setMapLocation,setLoading,mapShown,setMapBounds} = useMapStore.getState();
    setLoading(true); // Set loading to true before starting the geolocation process
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          setLocation([position.coords.longitude, position.coords.latitude]);
          const bounds = utils.getBoundingBox([[position.coords.longitude,position.coords.latitude]])
          const margin = [50, 100, 50, height*0.4]
          const finalBounds = [bounds, margin]
          setMapBounds(finalBounds);
         
          setLoading(false); 
          resolve(position);// Set loading to false after successfully getting the position
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
          maximumAge: 0,
          timeout: 15000,
          distanceFilter: 0,
          useSignificantChanges: false,
        },
      );
    });
  }
}

const locationTask = new currentLocation();
export default locationTask;

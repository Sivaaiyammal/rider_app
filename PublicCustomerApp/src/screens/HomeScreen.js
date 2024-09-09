import React, { useEffect } from 'react';
import {useStackScreenStore} from '../store/useStackScreenStore';
import MapScreen from './MapScreen';
import MapContainer from './Map';
import { checkFineLocationPermissions, RequestFineLocationPermission } from '../controllers/PermissionHandler';
import locationTask from '../controllers/GetCurrentLocation';
import SearchLocationScreen from './SearchLocation/SearchLocationScreen';

const HomeScreen = () => {
  const {stackScreen} = useStackScreenStore();

  const checkLocationPermission = async () => {
    const locationPermissionCheck = await checkFineLocationPermissions()
    if (locationPermissionCheck) {
      await locationTask.getCurrentLocation()
    } else {
     await RequestFineLocationPermission()
    }
  };

  useEffect(()=> {
    checkLocationPermission();
  },[])

  const renderContent = () => {
    switch (stackScreen[stackScreen.length - 1]) {
      case 'Home':
        return <MapScreen />;
      case 'SearchLocationScreen':
        return <SearchLocationScreen />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderContent()}
      <MapContainer />
    </>
  );
};

export default HomeScreen;
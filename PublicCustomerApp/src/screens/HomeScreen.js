import React, { useEffect } from 'react';
import { useStackScreenStore } from '../store/useStackScreenStore';
import MapScreen from './MapScreen';
import MapContainer from './Map';
import { checkFineLocationPermissions, RequestFineLocationPermission } from '../controllers/PermissionHandler';
import locationTask from '../controllers/GetCurrentLocation';
import SearchLocationScreen from './SearchLocation/SearchLocationScreen';
import VehicleListScreen from './VehicleListScreen';
import SelectedVehicle from './SelectedVehicle';

import { DataStore } from '../controllers/DataStore';

const HomeScreen = () => {
  const { stackScreen } = useStackScreenStore();

  const checkLocationPermission = async () => {
    const locationPermissionCheck = await checkFineLocationPermissions()
    if (locationPermissionCheck) {
      await locationTask.getCurrentLocation()
    } else {
      await RequestFineLocationPermission()
    }
  };

  useEffect(() => {
    checkLocationPermission();
  }, [])

  const renderContent = () => {
    switch (stackScreen[stackScreen.length - 1]) {
      case 'Home':
        return <MapScreen />;
      case 'SearchLocationScreen':
        return <SearchLocationScreen />;
      case 'VehicleList':
        return <VehicleListScreen />;
      case 'SelectedVehicle':
        return <SelectedVehicle />;
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
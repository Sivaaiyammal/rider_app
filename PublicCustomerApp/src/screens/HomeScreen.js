import React, { useEffect } from 'react';
import { useStackScreenStore } from '../store/useStackScreenStore';
import MapScreen from './MapScreen';
import MapContainer from './Map';
import { checkFineLocationPermissions, RequestFineLocationPermission } from '../controllers/PermissionHandler';
import locationTask from '../controllers/GetCurrentLocation';
import SearchLocationScreen from './SearchLocation/SearchLocationScreen';
import VehicleListScreen from './VehicleListScreen';
import SelectedVehicle from './SelectedVehicle';
import VehicleSearchLoader from './VehicleSearchLoader';

import DriverAssignedScreen from './driverAssigned/DriverAssignedScreen';
import RideSummary from './RideSummary';
import SearchScreen from './SearchScreen';

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
        case 'SearchScreen':
          return <SearchScreen />;
      case 'VehicleList':
        return <VehicleListScreen />;
      case 'SelectedVehicle':
        return <SelectedVehicle />;
      case 'VehicleSearchLoader':
        return <VehicleSearchLoader />;
      case 'DriverAssignedScreen':
        return <DriverAssignedScreen />;
      case 'RideSummary':
        return <RideSummary />;
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
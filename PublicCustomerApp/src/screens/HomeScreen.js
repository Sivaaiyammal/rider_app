import React, { useEffect, useRef, useState } from 'react';
import { useStackScreenStore } from '../store/useStackScreenStore';
import MapScreen from './MapScreen';
import MapContainer from './Map';
import { RequestAllPermissions } from '../controllers/PermissionHandler';
import locationTask from '../controllers/GetCurrentLocation';
import SearchLocationScreen from './SearchLocation/SearchLocationScreen';
import VehicleListScreen from './VehicleListScreen';
import SelectedVehicle from './SelectedVehicle';
import TripScreenManager from './driverAssigned/TripScreenManager';
import RideSummary from './RideSummary';
import SearchScreen from './SearchScreen';
import VehicleSearchScreen from './vehicleSearchScreen';
import useRideSelectionStore from '../store/useRideSelectionStore';
import WaypointScreen from './WaypointScreen';
import { StatusBar } from 'react-native';
import useUserInfoStore from '../store/useUserInfoStore';
import { getLocation} from '../storage/userLocalStorage';
import PickLocationScreen from './PickLocationScreen';
import { useCustomBackHandler } from '../hooks/useCustomBackHandler';


const HomeScreen = () => {
  const { stackScreen } = useStackScreenStore();
  const permissionsRequested = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const { setHomelocation, setWorklocation} = useUserInfoStore();

  const checkAllPermissions = async () => {
    if (permissionsRequested.current) return;
    
    permissionsRequested.current = true;
    const permissions = await RequestAllPermissions();
    
    if (permissions.location) {
      await locationTask.getCurrentLocation();
    }
   
  };

  const checkFavouriteLocation = async () => {
    const homeLocation = await getLocation('Home');
    const workLocation = await getLocation('Work');
 
    setHomelocation(homeLocation);
    setWorklocation(workLocation);
  };


 

  useEffect(() => {
    checkAllPermissions();
    checkFavouriteLocation();
  }, []);

  
  useCustomBackHandler();

  const renderContent = () => {
    const current = stackScreen[stackScreen.length - 1];
    const { name, params } = current;

    switch (name) {
      case 'Home':
        return <MapScreen {...params} />;
      case 'SearchLocationScreen':
        return <SearchLocationScreen {...params} />;
      case 'SearchScreen':
        return <SearchScreen {...params} />;
      case 'VehicleList':
        return <VehicleListScreen {...params} />;
      case 'SelectedVehicle':
        return <SelectedVehicle {...params} />;
      case 'TripScreenManager':
        return <TripScreenManager {...params} />;
      case 'RideSummary':
        return <RideSummary {...params} />;
      case 'VehicleSearchScreen':
        return <VehicleSearchScreen {...params} />;
      case 'WaypointScreen':
        return <WaypointScreen {...params} />;
      case 'PickLocationScreen':
        return <PickLocationScreen {...params} />;
      default:
        return null;
    }
  };

  return (
    <>
     <StatusBar barStyle="dark-content" backgroundColor={"white"} />
      {renderContent()}
      <MapContainer
        mapReady={mapReady}
        setMapReady={setMapReady}
      />
    </>
  );
};

export default HomeScreen;
import React, { useEffect, useRef, useState } from 'react';
import { useStackScreenStore } from '../store/useStackScreenStore';
import Homescreen from '../features/home/screens/HomeScreen.jsx'
import MapContainer from '../features/map/components/MapContainer.js';
import { RequestAllPermissions } from '../controllers/PermissionHandler';
import locationTask from '../controllers/GetCurrentLocation';
import SelectedVehicle from './SelectedVehicle';
import TripScreenManager from './driverAssigned/TripScreenManager';
import RideSummary from './RideSummary';
import SearchScreen from '../features/search/screens/SearchScreen';
import VehicleSearchScreen from './vehicleSearchScreen';
import WaypointScreen from '../features/booking/screens/WaypointScreen';
import { StatusBar } from 'react-native';
import useUserInfoStore from '../store/useUserInfoStore';
import { getStoredLocation} from '../storage/userLocalStorage';
import PickLocationScreen from './PickLocationScreen';
import { useCustomBackHandler } from '../hooks/useCustomBackHandler';
import PlanRideScreen from '../features/booking/screens/PlanRideScreen.jsx';
import BookRideScreen from '../features/booking/screens/BookRideScreen.jsx';


const Home = () => {
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
    const homeLocation = await getStoredLocation('Home');
    const workLocation = await getStoredLocation('Work');
 
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
        return <Homescreen {...params} />;
      case 'PlanRideScreen':
        return <PlanRideScreen {...params} />;
      case 'SearchScreen':
        return <SearchScreen {...params} />;
      case 'BookRideScreen':
        return <BookRideScreen {...params} />;
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

export default Home;
import React, { useEffect, useRef, useState } from 'react';
import { useStackScreenStore } from '../store/useStackScreenStore';
import Homescreen from '../features/home/screens/HomeScreen.jsx'
import MapContainer from '../features/map/components/MapContainer.js';
import { RequestAllPermissions } from '../controllers/PermissionHandler';
import locationTask from '../controllers/GetCurrentLocation';

import RideSummary from './RideSummary';
import SearchScreen from '../features/search/screens/SearchScreen';
import WaypointScreen from '../features/booking/screens/WaypointScreen';
import { StatusBar } from 'react-native';
import useUserInfoStore from '../store/useUserInfoStore';
import { getStoredLocation} from '../storage/userLocalStorage';
import PickLocationScreen from './PickLocationScreen';
import { useCustomBackHandler } from '../hooks/useCustomBackHandler';
import PlanRideScreen from '../features/booking/screens/PlanRideScreen.jsx';
import BookRideScreen from '../features/booking/screens/BookRideScreen.jsx';
import { checkOnGoingRide } from '../API/EndPoints/EndPoints';
import RideStatus from '../features/rideStatus';
import useCurrentRideInfoStore from '../features/rideStatus/store/useCurrentRideInfoStore';
import PaymentScreen from '../features/payment/screens/PaymentScreen';


const Home = () => {
  const { stackScreen } = useStackScreenStore();
  const permissionsRequested = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const { setHomelocation, setWorklocation} = useUserInfoStore();
  const { setStackScreen } = useStackScreenStore();
  const { setCurrentRideInfo } = useCurrentRideInfoStore();
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

  const checkOnGoingRideAndLog = async () => {
    try {
      const Response = await checkOnGoingRide();
      console.log('Response', Response)
      if(Response?.success && Response?.trip){
        setCurrentRideInfo(Response?.trip);
        setStackScreen('RideStatus', { });
      }
    } catch (error) {
      console.error('Error fetching ongoing ride:', error);
    }
  }


 

  useEffect(() => {
    checkAllPermissions();
    checkOnGoingRideAndLog();
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
      case 'RideStatus':
        return <RideStatus {...params} />;
      case 'WaypointScreen':
        return <WaypointScreen {...params} />;
      case 'PickLocationScreen':
        return <PickLocationScreen {...params} />;
      case 'PaymentScreen':
        return <PaymentScreen {...params} />;
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
      {/* {overlayStatuses.includes(tripStatus) && (
        <TripStatusOverlay status={tripStatus} />
      )} */}
    </>
  );
};

export default Home;
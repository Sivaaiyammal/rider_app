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
import { useQuery } from 'react-query';
import { checkOnGoingRide } from '../API/EndPoints/EndPoints';
import useRideSelectionStore from '../store/useRideSelectionStore';
import useMapStore from '../store/useMapStore';


const HomeScreen = () => {
  const { stackScreen, setStackScreen } = useStackScreenStore();
  const { setBookingDetails, setAssignedDriver, setRideStatus } = useRideSelectionStore();
  const permissionsRequested = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const {setGeometries} = useMapStore();


  useEffect(() => {
    console.log('mapLocation-->>')
    setGeometries([]);
  }, [stackScreen]);
  

  const checkAllPermissions = async () => {
    if (permissionsRequested.current) return;
    
    permissionsRequested.current = true;
    const permissions = await RequestAllPermissions();
    
    if (permissions.location) {
      await locationTask.getCurrentLocation();
      setMapLocation(true);
    }
    
    // Log permission status for debugging
    console.log('Location permission:', permissions.location);
    console.log('Notification permission:', permissions.notification);
  };
  


  useQuery('checkOnGoingRide', checkOnGoingRide, {
    onSuccess: (data) => {
      console.log("dataggg", data);
      if (data) {
        if (data?.trip?.status === 'PENDING') {
          setBookingDetails(data?.trip);
          setStackScreen('VehicleSearchScreen');
        } else if (data?.trip?.status === 'ACCEPTED') {
          setBookingDetails(data?.trip);
          setAssignedDriver(data?.assignDriver);
          setStackScreen('TripScreenManager');
        } else if (data?.trip?.status === 'PICKEDUP') {
          setBookingDetails(data?.trip);
          setAssignedDriver(data?.assignDriver);
          setRideStatus('STARTED');
          setStackScreen('TripScreenManager');
        }
      }
    }
  });

  useEffect(() => {
    checkAllPermissions();
  }, []);

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
      case 'TripScreenManager':
        return <TripScreenManager />;
      case 'RideSummary':
        return <RideSummary />;
      case 'VehicleSearchScreen':
        return <VehicleSearchScreen />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderContent()}
      <MapContainer
        mapReady={mapReady}
        setMapReady={setMapReady}
      />
    </>
  );
};

export default HomeScreen;
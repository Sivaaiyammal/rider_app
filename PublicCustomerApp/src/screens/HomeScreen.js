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
import TripScreenManager from './driverAssigned/TripScreenManager';
import RideSummary from './RideSummary';
import SearchScreen from './SearchScreen';
import NotificationScreen from './NotificationScreen';
import ContactScreen from './ContactScreen';
import VehicleSearchScreen from './vehicleSearchScreen';
import { useQuery } from 'react-query';
import { checkOnGoingRide } from '../API/EndPoints/EndPoints';
import useRideSelectionStore from '../store/useRideSelectionStore';

const HomeScreen = () => {
  const { stackScreen, setStackScreen } = useStackScreenStore();
  const { setBookingDetails, setAssignedDriver ,setRideStatus} = useRideSelectionStore();

  const checkLocationPermission = async () => {
    const locationPermissionCheck = await checkFineLocationPermissions()
    if (locationPermissionCheck) {
      await locationTask.getCurrentLocation()
    } else {
      await RequestFineLocationPermission()
    }
  };

  const { data: onGoingRide } = useQuery('checkOnGoingRide', checkOnGoingRide, {
    onSuccess: (data) => {
      console.log("data",data)
      if (data) {
        if (data?.trip?.status === 'PENDING') {
          setBookingDetails(data?.trip);
          setStackScreen('VehicleSearchScreen');
        } else if (data?.trip?.status === 'ACCEPTED') {
          
          setBookingDetails(data?.trip);
          setAssignedDriver(data?.assignDriver);
          setStackScreen('TripScreenManager');
        }
        else if (data?.trip?.status === 'PICKEDUP') {
          
          setBookingDetails(data?.trip);
          setAssignedDriver(data?.assignDriver);
          setRideStatus('STARTED');
          setStackScreen('TripScreenManager');
        }
      }
    }
  });

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
      <MapContainer />
    </>
  );
};

export default HomeScreen;
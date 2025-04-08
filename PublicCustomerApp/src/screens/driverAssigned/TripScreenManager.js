import React, { useEffect, useState } from 'react';
import DriverArrival from './DriverArrival';
import OnRide from './OnRide';
import useRideSelectionStore from '../../store/useRideSelectionStore';
import VehicleSearchScreen from '../vehicleSearchScreen';

const TripScreenManager = () => {
  const [onRide, setOnRide] = useState(false);
  const { bookingDetails } = useRideSelectionStore();

  

  const renderScreen = () => {
    console.log("bookingDetails",bookingDetails)
    switch (bookingDetails?.status) {
      case 'PICKEDUP':
        return <OnRide />;
      case 'ACCEPTED':
        return <DriverArrival />;
      default:
        return <VehicleSearchScreen />;
    }
  };

  return <>{renderScreen()}</>;
};

export default TripScreenManager;

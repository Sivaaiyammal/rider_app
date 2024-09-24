import React from 'react';
import DriverArrival from './DriverArrival';
import OnRide from './OnRide';

const DriverAssignedScreen = () => {
  const onRide = false;

  return <>{onRide ? <OnRide /> : <DriverArrival />}</>;
};

export default DriverAssignedScreen;

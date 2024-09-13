import React from 'react';
import DriverArrival from './DriverArrival';
import OnRide from './OnRide';

const DriverAssignedScreen = () => {
  const onRide = true;

  return <>{!onRide ? <OnRide /> : <DriverArrival />}</>;
};

export default DriverAssignedScreen;

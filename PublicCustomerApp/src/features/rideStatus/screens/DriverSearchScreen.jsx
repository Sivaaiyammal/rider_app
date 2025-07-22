import React from 'react';

import SearchLoader from '../component/SearchLoader';

import { cancelRide } from '../../../API/EndPoints/EndPoints';
import useCurrentRideInfoStore from '../store/useCurrentRideInfoStore';
import { showNotification } from '../../../components/NotificationManger';
import { useStackScreenStore } from '../../../store/useStackScreenStore';

const DriverSearchScreen = () => {
  const { tripId } = useCurrentRideInfoStore();
  const { goBack } = useStackScreenStore();
   
  
  const onCancelRide = async () => {
    const payload = {
      tripId: tripId,
      reason: 'Customer cancelled the ride',
    }
    const response = await cancelRide(payload);
    if(response.success){
      showNotification('Ride cancelled successfully');
      goBack();
    }
  }
  return (
    <>
      <SearchLoader onCancel={onCancelRide} />
    </>
  );
};



export default DriverSearchScreen;

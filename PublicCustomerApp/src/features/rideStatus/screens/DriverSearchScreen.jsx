import React from 'react';

import SearchLoader from '../component/SearchLoader';

import { cancelRideMutation } from '../../../API/APICalls/RideAPICalls';
import useCurrentRideInfoStore from '../store/useCurrentRideInfoStore';
import { showNotification } from '../../../components/NotificationManger';
import { useStackScreenStore } from '../../../store/useStackScreenStore';

const DriverSearchScreen = () => {
  const { tripId } = useCurrentRideInfoStore();
  const { setStackScreen } = useStackScreenStore();
   
  const onCancelSuccess = (data) => {
    if (data.success) {
      showNotification('Ride Cancelled', data.message || 'Your ride has been cancelled successfully', 'success');
      setStackScreen('Home');
    } else {
      showNotification('Cancellation Failed', data.message || 'Failed to cancel ride', 'danger');
    }
  };

  const onCancelError = (error) => {
    console.error('Cancel ride error:', error);
    showNotification('Cancellation Error', 'Failed to cancel ride. Please try again.', 'danger');
  };

  const { mutate: cancelRideMutate } = cancelRideMutation({
    onSuccess: onCancelSuccess,
    onError: onCancelError
  });

  const onCancelRide = async () => {
    console.log('Cancelling ride with tripId:', tripId);
    
    if (!tripId) {
      showNotification('Error', 'No trip ID found to cancel', 'danger');
      return;
    }

    try {
      const payload = {
        tripId: tripId,
        reason: 'User cancelled ride'
      };
      
      cancelRideMutate(payload);
    } catch (error) {
      console.error('Error cancelling ride:', error);
      showNotification('Error', 'Failed to cancel ride', 'danger');
    }
  };
  return (
    <>
      <SearchLoader onCancel={onCancelRide} />
    </>
  );
};



export default DriverSearchScreen;

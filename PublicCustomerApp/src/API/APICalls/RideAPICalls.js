import {QueryClient, useMutation } from 'react-query';
import { bookRide, getRideEstimation } from '../EndPoints/EndPoints';
import {showNotification} from '../../components/NotificationManger';

const queryClient = new QueryClient();

// Ride Estimation Mutation
export const rideEstimation = onSuccessCallback => {
  return useMutation(['getRideEstimation'], getRideEstimation, {
    onSuccess: data => {
      if (data.success) {
        if (onSuccessCallback) {
          queryClient.invalidateQueries('getRideEstimation');
          onSuccessCallback(data);
        }
      } else {
        showNotification('Ride Estimation', data.message, 'danger');
      }
    },
    onError: error => {
      showNotification(
        `Ride Estimation - (${error.status})`,
        error?.message?.message,
        'danger',
      );
    },
  });
};

// Ride Booking Mutation
export const createRideMutation = onSuccessCallback => {
  return useMutation(['rideBookingQuery'], bookRide, {
    onSuccess: data => {
      if (data.success) {
        if (onSuccessCallback) {
          queryClient.invalidateQueries('rideBookingQuery');
          onSuccessCallback(data);
        }
      } else {
        showNotification('Booking Failed', data.message, 'danger');
      }
    },
    onError: error => {
      showNotification(
        `Booking Failed - (${error.status})`,
        error?.message?.message,
        'danger',
      );
    },
  });
};


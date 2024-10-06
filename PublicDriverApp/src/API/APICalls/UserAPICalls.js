import {QueryClient, useMutation, useQuery} from 'react-query';
import {
  getUserDetails,
  profileUpdate,
  requestOTP,
  verifyOTP,
} from '../EndPoints/EndPoints';
import {showNotification} from '../../components/NotificationManager';

const queryClient = new QueryClient();

// request OTP Mutation
export const requestOTPMutation = onSuccessCallback => {
  return useMutation(['requestOTP'], requestOTP, {
    onSuccess: data => {
      if (data.success) {
        if (onSuccessCallback) {
          queryClient.invalidateQueries('requestOTP');
          onSuccessCallback(data);
        }
      } else {
        showNotification('Login Failed', data.message, 'danger');
      }
    },
    onError: error => {
      showNotification(
        `Login Failed - (${error.status})`,
        error?.message,
        'danger',
      );
    },
  });
};

// verify OTP Mutation
export const verifyOTPMutation = onSuccessCallback => {
  return useMutation(['verifyOTP'], verifyOTP, {
    onSuccess: data => {
      if (data.success) {
        if (onSuccessCallback) {
          queryClient.invalidateQueries('verifyOTP');
          onSuccessCallback(data);
        }
      } else {
        showNotification('Verification Failed', data.message, 'danger');
      }
    },
    onError: error => {
      showNotification(
        `Verification Failed - (${error.status})`,
        error?.message,
        'danger',
      );
    },
  });
};

// Profile Update Mutation
export const profileUpdateMutations = onSuccessCallback => {
  return useMutation(['profileUpdate'], profileUpdate, {
    onSuccess: data => {
      if (data.success) {
        if (onSuccessCallback) {
          queryClient.invalidateQueries('profileUpdate');
          onSuccessCallback(data);
        }
      } else {
        showNotification('Registration Failed', data.message, 'danger');
      }
    },
    onError: error => {
      showNotification(
        `Registration Failed - (${error.status})`,
        error?.message,
        'danger',
      );
    },
  });
};

// query user profile
export const fetchUserDetails = () => {
  return useQuery(['userProfile'], getUserDetails, {
    onError: error => {
      showNotification(`${error.status}`, error.message, 'danger');
    },
  });
};

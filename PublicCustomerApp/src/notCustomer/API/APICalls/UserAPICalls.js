import {QueryClient, useMutation, useQuery} from 'react-query';
import {
  getUserDetails,
  profileUpdate,
  requestOTP,
  checkOnGoingRide,
  testlogin,
  verifyOTP,
  deleteAccount,
  getPassengerTripStats,
  requestDriverOTP,
  verifyDriverOTP,
} from '../EndPoints/EndPoints';
import {showNotification} from '../../components/NotificationManger';
import { t } from 'i18next';

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
        showNotification(t('login_failed'), t('something_went_wrong'), 'danger');
      }
    },
    onError: error => {
      showNotification(
        t(`login_failed`),
        t('something_went_wrong'),
        'danger',
      );
    },
  });
};

export const testLogin = onSuccessCallback => {
  return useMutation(['requestOTP'], testlogin, {
    onSuccess: data => {
      if (data.success) {
        if (onSuccessCallback) {
          queryClient.invalidateQueries('requestOTP');
          onSuccessCallback(data);
        }
      } else {
        showNotification(t('login_failed'), t('something_went_wrong'), 'danger');
      }
    },
    onError: error => {
      showNotification(
        t('login_failed'),
        t('something_went_wrong'),
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
        showNotification(t('verification_failed'), t('some_error_occurred'), 'danger');
      }
    },
    onError: error => {
      showNotification(
        t('verification_failed'),
        t(`some_error_occurred`),
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
        showNotification(t('registration_failed'), t('something_went_wrong'), 'danger');
      }
    },
    onError: error => {
      showNotification(t('registration_failed'), t('something_went_wrong'), 'danger');
    },
  });
};


export const getOngoingRide = onSuccessCallback => {
 
  return useQuery(['getOngoingRide'], checkOnGoingRide, {
    onSuccess: data => {
    
      if (data.success) {
        if (onSuccessCallback) {
          
          onSuccessCallback(data);
        }
      }
    },
    onError: error => {
      showNotification(`${error.status}`, error.message, 'danger');
    },
  });
}

// query user profile
export const fetchUserDetails = () => {
  return useQuery(['userProfile'], getUserDetails, {
    onError: error => {
      showNotification(`${error.status}`, error.message, 'danger');
    },
  });
};

// delete account mutation
export const deleteAccountMutation = onSuccessCallback => {
  return useMutation(['deleteAccount'], deleteAccount, {
    onSuccess: data => {
      if (data.success) {
        if (onSuccessCallback) {
          queryClient.invalidateQueries('deleteAccount');
          onSuccessCallback(data);
        }
      } else {
        showNotification(t('delete_account_failed'), t('something_went_wrong') , 'danger');
      }
    },
    onError: error => {
      showNotification(
        t(`delete_account_failed`),
        t('something_went_wrong'),
        'danger',
      );
    },
  });
};

// fetch passenger trip stats
export const fetchPassengerTripStats = (onSuccessCallback) => {
  return useQuery(['passengerTripStats'], getPassengerTripStats, {
    onSuccess: data => {
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onError: error => {
      showNotification(`${error.status}`, error.message, 'danger');
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
  });
};


// requestDriverOTPMutation
export const requestDriverOTPMutation = onSuccessCallback => {
  return useMutation(['requestDriverOTP'], requestDriverOTP, {
    onSuccess: data => {
      if (data.success) {
        if (onSuccessCallback) {
          queryClient.invalidateQueries('requestDriverOTP');
          onSuccessCallback(data);
        }
      } else {
        showNotification(t('login_failed'), t('something_went_wrong'), 'danger');
      }
    },
    onError: error => {
      showNotification(
        t(`login_failed`),
        t('something_went_wrong'),
        'danger',
      );
    },
  });
};

export const verifyDriverOTPMutation = onSuccessCallback => {
  return useMutation(['verifyDriverOTP'], verifyDriverOTP, {
    onSuccess: data => {
      if (data.success) {
        if (onSuccessCallback) {
          queryClient.invalidateQueries('verifyDriverOTP');
          onSuccessCallback(data);
        }
      } else {
        showNotification(t('verification_failed'), t('some_error_occurred'), 'danger');
      }
    },
    onError: error => {
      showNotification(
        t('verification_failed'),
        t(`some_error_occurred`),
        'danger',
      );
    },
  });
};

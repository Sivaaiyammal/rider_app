import apiClient from "../APIClient";

// request OTP
export const requestOTP = async (payload) => {
  const { data } = await apiClient.post('/customer/auth/login', payload);
  return data;
};

export const testlogin = async (payload) => {
  const { data } = await apiClient.post('/publicrides/customer/login', payload);
  return data;
};



// verify OTP
export const verifyOTP = async (payload) => {
  const { data } = await apiClient.post('/customer/auth/verifyOTP', payload);
  return data;
};

// user profile update
export const profileUpdate = async (payload) => {
  const { data } = await apiClient.post('/customer/profile/update', payload);
  return data;
};

// get user details
export const getUserDetails = async ()=> {
  const {data} = await apiClient.get('/customer/profile/get-details')
  return data
}

// get ride estimate
export const getRideEstimation = async (payload)=> {
  const {data} = await apiClient.post('/publicrides/customer/getRideEstimations', payload)
  return data
}

// Book Ride
export const bookRide = async (payload)=> {
  const {data} = await apiClient.post('/publicrides/customer/bookTrip', payload)
  return data
}

// cancel Ride
export const cancelRide = async (payload)=> {
  const {data} = await apiClient.post('/customer/ride/cancelRide', payload)
  return data
}

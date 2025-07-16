import apiClient from "../APIClient";

// request OTP
export const requestOTP = async (payload) => {
   const { data } = await apiClient.post('/publicrides/customer/login', payload);
  // const data = {
  //   success: true,
  //   message: 'OTP Sent',
  // };
  return data;
};




// verify OTP
export const verifyOTP = async (payload) => {
  const { data } = await apiClient.post('publicrides/customer/verifyotp', payload);
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
  const {data} = await apiClient.post('/publicrides/customer/getRideEstimation', payload)
  return data
}

// Book Ride
export const bookRide = async (payload)=> {
  const {data} = await apiClient.post('/publicrides/customer/bookTrip', payload)
  return data
}

// cancel Ride


export const checkOnGoingRide = async ()=> {
  console.log('checkOnGoingRideoo')
  const {data} = await apiClient.get('/publicrides/customer/getOngoingTrip')
  return data
}

export const cancelRide = async (payload)=> {
  console.log('payload', payload)
  const {data} = await apiClient.post('publicrides/customer/cancelTrip', payload)
  return data
}




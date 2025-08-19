import apiClient from "../APIClient";
import APIConfig from "../../Config/APIConfig";

// request OTP
export const requestOTP = async (payload) => {
   const { data } = await apiClient.post(`/publicrides/customer/login`, payload);
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

export const getAvaliableCoupons = async (payload)=> {
  const {data} = await apiClient.post('/publicrides/customer/getPassengerAvaliableCoupons',payload)
  return data
}

// get ride estimate
export const getRideEstimation = async (payload)=> {
  const {data} = await apiClient.post('/publicrides/customer/getRideEstimation', payload)
  return data
}


export const updateTripStops = async (payload)=> {
  const {data} = await apiClient.post('/publicrides/customer/tripStopsChange', payload)
  return data
}

export const submitTripFeedback = async (payload)=> {
  const {data} = await apiClient.post('/publicrides/customer/passengerDriverRating',payload)
  return data
}



// Book Ride
export const bookRide = async (payload)=> {
  const {data} = await apiClient.post('/publicrides/customer/bookTrip', payload)
  return data
}

// cancel Ride


export const getUserStats = async ()=> {
  const {data} = await apiClient.get('/publicrides/customer/getUserStats')
  return data
}

export const cancelRide = async (payload)=> {
  console.log('payload', payload)
  const {data} = await apiClient.post('publicrides/customer/rideCancelByPassenger', payload)
  return data
}

export const updatePaymentInServer = async (payload) => {
  const { data } = await apiClient.post('publicrides/customer/paymentStatusUpdate', payload)
  return data
}

// get nearby drivers
export const getNearByDrivers = async (payload) => {
  const { data } = await apiClient.post('/publicrides/customer/getNearByDrivers', payload)
  return data
}

export const getPreFinalFare = async (payload) => {
  const { data } = await apiClient.post('/publicrides/customer/getPreFinalFare', payload)
  return data
}
export const passangerStopChangeRequest = async (payload) => {
  const { data } = await apiClient.post('/publicrides/customer/passangerStopChangeRequest', payload)
  return data
}

// get customer trips
export const getCustomerTrips = async (payload) => {
  
  const { data } = await apiClient.get('/publicrides/customer/getTrips', { params: payload })
  return data
}

export const addFavoritePlace = async (payload) => {
  const { data } = await apiClient.post('/publicrides/customer/addFavPlaces', payload)
  return data
}

export const deleteFavoritePlace = async (payload) => {
  const { data } = await apiClient.post('/publicrides/customer/deleteFavPlaces', payload)
  return data
}


  export const mapMatch = async (payload) => {
    const { data } = await apiClient.post(`${APIConfig.MAP_MATCH_URL}`, payload)
    return data
  }

// get ticket categories
export const getTicketCategories = async () => {
  const { data } = await apiClient.get('/publicrides/customer/getTicketCategories')
  return data
}

// delete account
export const deleteAccount = async (payload) => {
  const { data } = await apiClient.post('/publicrides/customer/getPassengerAccountDeletion', payload)
  return data
}



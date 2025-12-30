import { Platform } from "react-native";
import apiClient from "../APIClient";
import Config from "react-native-config";

// request OTP
export const requestOTP = async (payload) => {
   const { data } = await apiClient.post(`/publicrides/customer/login`, payload);
  // const data = {
  //   success: true,
  //   message: 'OTP Sent',
  // };
  return data;
};

export const requestDriverOTP = async (payload) => {
  const { data } = await apiClient.post(`/publicrides/driver/sendOTP?platform=${Platform.OS}`, payload);
 return data;
}

export const verifyDriverOTP = async (payload) => {
  const { data } = await apiClient.post(`/publicrides/driver/verifyOTP?platform=${Platform.OS}`, payload);
 return data;
}

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


// submit general app feedback
export const submitAppFeedback = async (payload) => {
  const { data } = await apiClient.post('/publicrides/customer/submitFeedback', payload)
  return data
}



// Book Ride
export const bookRide = async (payload)=> {
  const {data} = await apiClient.post('/publicrides/customer/bookTrip', payload)
  return data
}

// cancel Ride


export const getUserStats = async (currentTripId) => {
  let url = `/publicrides/customer/getUserStats`;
  if (currentTripId !== null && currentTripId !== undefined) {
    url += `?currentTripId=${currentTripId}`;
  }
  const { data } = await apiClient.get(url);
  return data;
}

export const getAvalibaleVehiclesType = async (lat,lon) => {
  const { data } = await apiClient.get(`/publicrides/customer/getAvaliableVehicleInfo?latitude=${lat}&longitude=${lon}`)
  return data
}

export const cancelRide = async (payload)=> {
  
  const {data} = await apiClient.post('publicrides/customer/rideCancelByPassenger', payload)
  return data
}

export const updatePaymentInServer = async (payload) => {
  const { data } = await apiClient.post('publicrides/customer/paymentStatusUpdate', payload)
  return data
}

// get nearby drivers
export const getNearByDrivers = async (lat,lon,radius,vehicleTypes) => {
  const { data } = await apiClient.get(`/publicrides/customer/getNearByDrivers?latitude=${lat}&longitude=${lon}&radius=${radius}&vehicleTypes=${vehicleTypes.join(',')}`)
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
  console.log("payload",payload)
  
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
    const { data } = await apiClient.post(`${Config.MAP_MATCH_URL}`, payload)
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

  export const getTripDetails = async (tripId) => {
    const {data} = await apiClient.get(`/publicrides/customer/getTripPaymentDetails?tripId=${tripId}`)
    return data
  }

  export const createOrder = async (payload) => {
    console.log(payload)
    const {data} = await apiClient.post('/publicrides/payments/customer/create-order', payload)
    return data
  }

  export const makeMaskedCallToDriver = async (payload) => {
    const {data} = await apiClient.post('/publicrides/customer/makeMaskedCallToDriver', payload)
    return data
  }

  // report passenger payment issues
  export const passengerPaymentIssues = async (payload) => {
    // expects { tripId, passengerIssues }
    const { data } = await apiClient.post('/publicrides/customer/passengerPaymentIssues', payload)
    return data
  }

  // Trigger SOS
  export const triggerSOS = async (payload) => {
    const { data } = await apiClient.post('/publicrides/customer/sosTriggered', payload)
    return data
  }

  // confirm trip status (customer reported)
  export const confirmTripStatus = async (payload) => {
    // expects { tripId, tripStatus }
    const { data } = await apiClient.post('/publicrides/customer/confirmTripStatus', payload)
    return data
  }

  // get passenger trip stats (totals, spend, etc.)
  export const getPassengerTripStats = async () => {
    const { data } = await apiClient.get('/publicrides/customer/getPassengerTripStats')
    return data
  }





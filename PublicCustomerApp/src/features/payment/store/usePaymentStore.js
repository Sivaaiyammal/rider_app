import { create } from 'zustand';

const usePaymentStore = create((set, get) => ({
  currentTripId: null,
  setCurrentTripId: (tripId) => set({ currentTripId: tripId }),

  rideId: null,
  setRideId: (rideId) => set({ rideId: rideId }),

  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),

  bookingTime: null,
  setBookingTime: (time) => set({ bookingTime: time }),

  tripStops: [],
  setTripStops: (stops) => set({ tripStops: stops }),

  tripDistance: null,
  setTripDistance: (distance) => set({ tripDistance: distance }),

  tripDuration: null,
  setTripDuration: (duration) => set({ tripDuration: duration }),

  tripFare: null,
  setTripFare: (fare) => set({ tripFare: fare }),

  driverDetails: null,
  setDriverDetails: (details) => set({ driverDetails: details }),

  vehicleDetails: null,
  setVehicleDetails: (details) => set({ vehicleDetails: details }),

  fareDetails: null,
  setFareDetails: (details) => set({ fareDetails: details }),

  tripStatus: null,
  setTripStatus: (status) => set({ tripStatus: status }),

  paymentStatus: null,
  paymentMethod: null,
  paymentDetails: null,
  setPaymentStatus: (status) => set({ paymentStatus: status }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setPaymentDetails: (details) => set({ paymentDetails: details }),
  resetPayment: () => set({
    paymentStatus: null,
    paymentMethod: null,
    paymentDetails: null,
  }),

  setTripDetails: (data) => {
    const {
      setTripDistance,
      setTripDuration,
      setTripFare,
      setDriverDetails,
      setTripStops,
      setVehicleDetails,
      setFareDetails,
      setPaymentStatus,
      setPaymentMethod,
      setCurrentTripId,
      setIsLoading,
      setRideId,
      setBookingTime,
      setTripStatus,
    } = get();

    if (data?.trip?.rideId !== undefined) {
      setRideId(data.trip.rideId);
    }
  console.log("data",JSON.stringify(data))
    if (data?.trip?.finalDistance !== undefined) {
        console.log("data.trip.finalDistance",data.trip.finalDistance)
      setTripDistance(data.trip.finalDistance);
    }
    if (data?.trip?.finalDuration !== undefined) {
      setTripDuration(data.trip.finalDuration);
    }
    if (data?.paymentDetails?.fareDetails?.fare !== undefined) {
      setTripFare(data?.paymentDetails?.fareDetails?.fare);
    }
    if (data?.driverInfo !== undefined) {
      setDriverDetails(data?.driverInfo);
    }
    if (data?.trip?.stops !== undefined) {
      setTripStops(data.trip.stops);
    }
    if (data?.vehicleInfo !== undefined) {
      setVehicleDetails(data?.vehicleInfo);
    }
    if (data?.paymentDetails?.fareDetails !== undefined) {
      setFareDetails(data?.paymentDetails?.fareDetails);
    }
    if (data?.trip?.paymentMethod !== undefined) {
      setPaymentMethod(data?.trip?.paymentMethod);
    }
    if (data?.paymentDetails?.fareDetails?.passengerPaymentStatus !== undefined) {
      setPaymentStatus(data?.paymentDetails?.fareDetails?.passengerPaymentStatus);
    }
    if (data?.trip?._id !== undefined) {
      setCurrentTripId(data.trip._id);
    }
    if (data?.trip?.createdAt !== undefined) {
      setBookingTime(data.trip.createdAt);
    }
    if(data?.trip?.status !== undefined){
      setTripStatus(data.trip.status);
    } 
    setIsLoading(false);    
  },
}));

export default usePaymentStore;

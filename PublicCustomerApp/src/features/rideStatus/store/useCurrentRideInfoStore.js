import { create } from 'zustand';

const useCurrentRideInfoStore = create((set) => ({
  tripId: null,
  tripStatus: 'ACCEPTED',
  rideStartLocation: null,
  rideEndLocation: null,
  stops: [],
  duration: null,
  minFare: null,
  maxFare: null,
  totalDistance: null,
  currentDistance: null,
  otp: null,
  estArrivalTime: null,
  paymentMethod: null,
  // Additional fields from trip data
  bookingFor: null,
  bookingForName: null,
  bookingForPhone: null,
  bookingTime: null,
  pickupTime: null,
  passangerCount: null,
  passangerId: null,
  vehicleType: null,
  publicRidesTrip: null,
  estimatedPickuoMins:null,
  estimatedArrivalMins:null,




  finalFare:"",
  breakdownFare:[],
  finalDuration:"",
  finalDistance:"",


  setTripId: (tripId) => set({ tripId }),
  setTripStatus: (tripStatus) => set({ tripStatus }),
  setRideStartLocation: (rideStartLocation) => set({ rideStartLocation }),
  setRideEndLocation: (rideEndLocation) => set({ rideEndLocation }),
  setStops: (stops) => set({ stops }),
  setDuration: (duration) => set({ duration }),
  setMinFare: (minFare) => set({ minFare }),
  setMaxFare: (maxFare) => set({ maxFare }),
  setTotalDistance: (totalDistance) => set({ totalDistance }),
  setCurrentDistance: (currentDistance) => set({ currentDistance }),
  setOtp: (otp) => set({ otp }),
  setEstArrivalTime: (estArrivalTime) => set({ estArrivalTime }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setEstimatedPickuoMins: (estimatedPickuoMins) => set({ estimatedPickuoMins }),
  setEstimatedArrivalMins: (estimatedArrivalMins) => set({ estimatedArrivalMins }),
  setBreakdownFare: (breakdownFare) => set({ breakdownFare }),

  setFinalFare: (finalFare) => {
    set({finalFare})
  },
  setFinalDuration: (finalDuration) => {
    set({finalDuration})
  },
  setFinalDistance: (finalDistance) => {
    set({finalDistance})
  },
   

  setFareDetails: (fareDetails) => {
    console.log('fareDetails',fareDetails)
    const breakdown = [];
  
    if (fareDetails?.fare != null) {
      set({ finalFare: fareDetails.fare });
    }
  
    // Trip subtotal
    if (fareDetails?.breakdown?.subtotal != null) {
      breakdown.push({
        name: "Trip Bill",
        amount: fareDetails.breakdown.subtotal,
      });
    }
  
    // Fees and additional breakdown
    const fees = fareDetails?.breakdown?.fees;
    const feesBreakdown = fees?.breakdown || {};
    console.log("feesBreakdown",fees)
    const incentives = fareDetails?.breakdown?.incentives || 0;
    
    console.log("incentives",incentives)
    // Platform Fee (includes platformFee + incentives)
    const platformFee = (feesBreakdown.platformFee || 0) + incentives;
    if (platformFee > 0) {
      breakdown.push({
        name: "Platform Fee",
        amount: platformFee,
      });
    }
  
    // Other fee components (excluding platformFee and incentives)
    Object.keys(feesBreakdown).forEach((key) => {
      if (key !== "platformFee" && key !== "incentives") {
        breakdown.push({
          name: key,
          amount: feesBreakdown[key],
        });
      }
    });
  
    set({ breakdownFare: breakdown });
  },
  
  setCurrentRideInfo: (info) => set({
    tripId: info._id || info.tripId || null,
    tripStatus: info.status || info.tripStatus || null,
    rideStartLocation: info.startLocation || info.rideStartLocation || null,
    rideEndLocation: info.endLocation || info.rideEndLocation || null,
    stops: info.stops || [],
    duration: info.estimatedDuration || info.duration || null,
    minFare: info.minFare || info.basePrice || null,
    maxFare: info.maxFare || info.maxPrice || null,
    totalDistance: info.distance || info.totalDistance || null,
    currentDistance: info.distance || info.currentDistance || null,
    otp: info.otp ?? null,
    estArrivalTime: info.estArrivalTime ?? null,
    paymentMethod: info.paymentMethod || null,
    // Additional fields from sample data
    bookingFor: info.bookingFor || null,
    bookingForName: info.bookingForName || null,
    bookingForPhone: info.bookingForPhone || null,
    bookingTime: info.bookingTime || null,
    pickupTime: info.pickupTime || null,
    passangerCount: info.passangerCount || null,
    passangerId: info.passangerId || null,
    vehicleType: info.vehicleType || null,
    publicRidesTrip: typeof info.publicRidesTrip === 'boolean' ? info.publicRidesTrip : null,
    finalDistance: info.finalDistance || null,
    finalDuration: info.finalDuration || null,
   
  }),

  resetCurrentRideInfo: () => set({
    tripId: null,
    tripStatus: 'ACCEPTED',
    rideStartLocation: null,
    rideEndLocation: null,
    stops: [],
    duration: null,
    minFare: null,
    maxFare: null,
    totalDistance: null,
    currentDistance: null,
    otp: null,
    estArrivalTime: null,
    paymentMethod: null,
    // Reset additional fields
    bookingFor: null,
    bookingForName: null,
    bookingForPhone: null,
    bookingTime: null,
    pickupTime: null,
    passangerCount: null,
    passangerId: null,
    vehicleType: null,
    publicRidesTrip: null,
    estimatedPickuoMins:null,
    estimatedArrivalMins:null

  }),
}));

export default useCurrentRideInfoStore;

import { create } from 'zustand';

const useRideBookingInfo = create(set => ({
  // Ride distance in kilometers
  rideDistance: null,
  setRideDistance: (rideDistance) => set({ rideDistance }),

  // Estimated duration in minutes
  estimatedDuration: null,
  setEstimatedDuration: (estimatedDuration) => set({ estimatedDuration }),

  // Payment type (Cash, Card, UPI, etc.)
  paymentType: "CASH",
  setPaymentType: (paymentType) => set({ paymentType }),


  rideBookMode: 'MYSELF',
  setRideBookMode: (rideBookMode) => set({ rideBookMode }),

  passangerDetails: null,
  setPassangerDetails: (passangerDetails) => set({ passangerDetails }),

  bookingFor: null,
  setBookingFor: (bookingFor) => set({ bookingFor }),

  // Reset all booking info
  resetBookingInfo: () => set({
    rideDistance: null,
    estimatedDuration: null,
    paymentType: "CASH"
  }),

  

  // Update multiple fields at once
  updateBookingInfo: (bookingInfo) => set(bookingInfo),
}));

export default useRideBookingInfo;

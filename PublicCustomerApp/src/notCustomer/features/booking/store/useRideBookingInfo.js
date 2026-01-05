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


  rideBookMode: null,
  setRideBookMode: (rideBookMode) => set({ rideBookMode }),

  passangerDetails: null,
  setPassangerDetails: (passangerDetails) => set({ passangerDetails }),

  bookingFor: null,
  setBookingFor: (bookingFor) => set({ bookingFor }),


  femaleDriverOnly: false,
  setFemaleDriverOnly: (femaleDriverOnly) => set({ femaleDriverOnly }),

  safeNightRides: false,
  setSafeNightRides: (safeNightRides) => set({ safeNightRides }),

  scheduleDateTime: null,
  setScheduleDateTime: (scheduleDateTime) => set({ scheduleDateTime }),


  isScheduledTrip: false,
  setIsScheduledTrip: (isScheduledTrip) => set({ isScheduledTrip }),


  couponCode: null,
  setCouponCode: (couponCode) => set({ couponCode }),


  regionOfficeId: null,
  setRegionOfficeId: (regionOfficeId) => set({ regionOfficeId }),

  regionOfficeCode: null,
  setRegionOfficeCode: (regionOfficeCode) => set({ regionOfficeCode }),

  // Reset all booking info
  resetBookingInfo: () => set({
    rideDistance: null,
    estimatedDuration: null,
    paymentType: "CASH",
    couponCode: null,
  }),

  

  // Update multiple fields at once
  updateBookingInfo: (bookingInfo) => set(bookingInfo),
}));

export default useRideBookingInfo;

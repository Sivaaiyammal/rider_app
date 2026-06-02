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

  tripType: 'ONE_WAY',
  setTripType: (tripType) => set({ tripType }),


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

  actingDriverVehicle: null,
  setActingDriverVehicle: (actingDriverVehicle) => set({ actingDriverVehicle }),

  actingDriverHours: null,
  setActingDriverHours: (actingDriverHours) => set({ actingDriverHours }),

  actingDriverMaxSpeed: null,
  setActingDriverMaxSpeed: (actingDriverMaxSpeed) => set({ actingDriverMaxSpeed }),

  actingDriverNotifyEvents: false,
  setActingDriverNotifyEvents: (actingDriverNotifyEvents) => set({ actingDriverNotifyEvents }),

  actingDriverAccommodation: false,
  setActingDriverAccommodation: (actingDriverAccommodation) => set({ actingDriverAccommodation }),

  actingDriverFood: false,
  setActingDriverFood: (actingDriverFood) => set({ actingDriverFood }),

  actingDriverKidsOnBoard: false,
  setActingDriverKidsOnBoard: (actingDriverKidsOnBoard) => set({ actingDriverKidsOnBoard }),

  actingDriverElderlyOnBoard: false,
  setActingDriverElderlyOnBoard: (actingDriverElderlyOnBoard) => set({ actingDriverElderlyOnBoard }),

  actingDriverItinerary: null,
  setActingDriverItinerary: (actingDriverItinerary) => set({ actingDriverItinerary }),

  couponCode: null,
  setCouponCode: (couponCode) => set({ couponCode }),

  regionOfficeId: null,
  setRegionOfficeId: (regionOfficeId) => set({ regionOfficeId }),

  regionOfficeCode: null,
  setRegionOfficeCode: (regionOfficeCode) => set({ regionOfficeCode }),

  bookingTab: 'TODAY',
  setBookingTab: (bookingTab) => set({ bookingTab }),

  durationRangeStart: null,
  setDurationRangeStart: (durationRangeStart) => set({ durationRangeStart }),

  durationRangeEnd: null,
  setDurationRangeEnd: (durationRangeEnd) => set({ durationRangeEnd }),

  isFlexibleDuration: false,
  setIsFlexibleDuration: (isFlexibleDuration) => set({ isFlexibleDuration }),

  todayDurationOption: '1_HOUR',
  setTodayDurationOption: (todayDurationOption) => set({ todayDurationOption }),

  todayCustomHours: 4,
  setTodayCustomHours: (todayCustomHours) => set({ todayCustomHours }),

  tomorrowDurationOption: 'HOURLY',
  setTomorrowDurationOption: (tomorrowDurationOption) => set({ tomorrowDurationOption }),

  tomorrowCustomHours: 4,
  setTomorrowCustomHours: (tomorrowCustomHours) => set({ tomorrowCustomHours }),

  tomorrowStartTime: (() => {
    const time = new Date();
    time.setHours(9, 0, 0, 0);
    return time;
  })(),
  setTomorrowStartTime: (tomorrowStartTime) => set({ tomorrowStartTime }),

  customStartTime: (() => {
    const time = new Date();
    time.setHours(9, 0, 0, 0);
    return time;
  })(),
  setCustomStartTime: (customStartTime) => set({ customStartTime }),

  // Reset all booking info
  resetBookingInfo: () => set({
    rideDistance: null,
    estimatedDuration: null,
    paymentType: "CASH",
    couponCode: null,
    actingDriverVehicle: null,
    actingDriverHours: null,
    actingDriverKidsOnBoard: false,
    actingDriverElderlyOnBoard: false,
    actingDriverItinerary: null,
    tripType: 'ONE_WAY',
    bookingTab: 'TODAY',
    durationRangeStart: null,
    durationRangeEnd: null,
    isFlexibleDuration: false,
    todayDurationOption: '1_HOUR',
    todayCustomHours: 4,
    tomorrowDurationOption: 'HOURLY',
    tomorrowCustomHours: 4,
    tomorrowStartTime: (() => {
      const time = new Date();
      time.setHours(9, 0, 0, 0);
      return time;
    })(),
    customStartTime: (() => {
      const time = new Date();
      time.setHours(9, 0, 0, 0);
      return time;
    })(),
    showItineraryModal: false,
  }),

  showItineraryModal: false,
  setShowItineraryModal: (showItineraryModal) => set({ showItineraryModal }),

  

  // Update multiple fields at once
  updateBookingInfo: (bookingInfo) => set(bookingInfo),
}));

export default useRideBookingInfo;

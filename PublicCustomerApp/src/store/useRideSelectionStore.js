import {create} from 'zustand';
import { rideType, tripType } from '../constants/JsonData';
const tripFor = ['For me']


const useRideSelectionStore = create(set => ({
  selectedTrip: tripType[0],
  setSelectedTrip: selectedTrip => set({selectedTrip}),

  selectedRide: rideType[0],
  setSelectedRide: selectedRide => set({selectedRide}),

  tripFor:tripFor[0],
  setTripFor: tripFor => set({tripFor}),

  contactDetails: [],
  setContactDetails: contactDetails => set({contactDetails}),


  scheduleDateTime: null,
  setScheduleDateTime: (scheduleDateTime) => set({ scheduleDateTime }),

  vehicleList: [],
  setVehicleList: (vehicleList) => set({ vehicleList }),

  bookingDetails: null,
  setBookingDetails: (bookingDetails) => set({bookingDetails})
}));

export default useRideSelectionStore;

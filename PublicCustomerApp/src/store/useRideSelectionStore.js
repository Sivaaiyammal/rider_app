import {create} from 'zustand';
import { rideType, tripType } from '../constants/JsonData';

const useRideSelectionStore = create(set => ({
  selectedTrip: tripType[0],
  setSelectedTrip: selectedTrip => set({selectedTrip}),

  selectedRide: rideType[0],
  setSelectedRide: selectedRide => set({selectedRide}),

  scheduleDateTime: null,
  setScheduleDateTime: (scheduleDateTime) => set({ scheduleDateTime }),
}));

export default useRideSelectionStore;

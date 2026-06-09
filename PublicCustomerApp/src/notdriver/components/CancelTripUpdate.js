import {NativeModules} from 'react-native';
import useTripsStore from '../store/useTripsStore';
import { useTripAcceptStore } from '../store/useTripAcceptStore';
import { useMapMarkerStore } from '../../common/store/useMapMarkerStore';
import { useStackScreenStore } from '../../common/store/useStackScreenStore';
import useCurrentScreenStore from '../../common/store/useCurrentScreenStore';
import { DataStore } from '../../common/controllers/DataStore';
import BGLocationTask from '../../common/controllers/BGLocationTask';
import { showNotification } from '../../common/components/Alerts/showNotification';
import useUserStore from '../../common/store/useUserStore';
import tripQueryClient from '../controllers/tripQueryClient';


const {NeNativeModule} = NativeModules;

const {activeTripData, setActiveTripData} = useTripsStore.getState();
const {setFetchLocationDate, setIsGetFare, setHasActiveTrip} =
  useTripAcceptStore.getState();
const {setFareBreakDown} = useTripsStore.getState();
const {setStartNavigation, setDisduration, setUserLocation, userLocation,setDirectionPoints,setDirectionResponse} =
  useMapMarkerStore.getState();
const {setStackScreen} = useStackScreenStore.getState();
const {setCurrentScreen} = useCurrentScreenStore.getState();

export const cancelTripOnRide = () => {
  setIsGetFare(false);
  setFetchLocationDate(true);
};

export const cancelTrip = res => {
  DataStore.clearData('isOngoingTrip');
  DataStore.storeData('activeTripId', null);
  setStackScreen('Home');
  setActiveTripData([]);
  setHasActiveTrip(null)
  setCurrentScreen('Map')
  setDirectionPoints(null)
  NeNativeModule.endNavigation();
  setStartNavigation(false);
  setDisduration(null);
  setDirectionResponse(null)
  // Clear stale React Query cache so the polling useEffect doesn't
  // re-navigate back to the tracking screen with old trip data.
  const token = useUserStore.getState().userInfo?.token;
  tripQueryClient.setQueryData(['fetchTrips', token], []);
  // BGLocationTask.stopDriverBgTask();
  showNotification(res?.message, '', 'success');
};

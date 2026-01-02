/* eslint-disable react/react-in-jsx-scope */
import {useCallback, useEffect, useRef, useState} from 'react';
import {useQuery} from 'react-query';
import {AppState, NativeModules, Text, View} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import ProgressBar from 'react-native-animated-progress';
import useTripsStore from '../store/useTripsStore';
import { useTripAcceptStore } from '../store/useTripAcceptStore';
import { useStackScreenStore } from '../../common/store/useStackScreenStore';
import { useMapMarkerStore } from '../../common/store/useMapMarkerStore';
import useDeviceTokenStore from '../../common/store/useDeviceTokenStore';
import useUserStore from '../../common/store/useUserStore';
import APIRequest from '../../common/APIRequest';
import NetworkAnalytics from '../../common/Analytics/NetworkAnalytics';
import { checkBackgroundLocationPermissions, checkFineLocationPermissions, CheckNotificationPermissions } from '../../common/controllers/PermissionHandler';
import { DataStore } from '../../common/controllers/DataStore';
import { Colors } from '../../common/constants/constants';
import driverWaitingTime from '../Controller/DriverWaitingTime';

const {NeNativeModule} = NativeModules;

/**
 * InitializationScreen component is responsible for initializing and fetching
 * geofences, groups, and devices data when the application starts. It also handles
 * the network connectivity status and displays a progress bar when data is being loaded.
 */
export default function DriverInitializationScreen() {
  // Device API store actions
  const setTripData = useTripsStore(state => state.setTripData);
  const setTripDataError = useTripsStore(state => state.setTripDataError);
  const setActiveTripData = useTripsStore(state => state.setActiveTripData);
  const setTripDataLoading = useTripsStore(
    state => state.setTripDataLoading,
  );

  const setFareBreakDown = useTripsStore(state => state.setFareBreakDown);
  const setIsOnGoing = useTripAcceptStore(state => state.setIsOnGoing);
  const setStackScreen = useStackScreenStore(state => state.setStackScreen);

  const {setStartNavigation, setDisduration, setDirectionPoints} = useMapMarkerStore.getState();

  const setDriverConfig = useTripsStore(state => state.setDriverConfig);
  
  const {
    setHasLocationPermission, setHasNotificationPermission,
    setHasBackgroundLocationPermission,
  } = useDeviceTokenStore()

  const setdriverDueDate = useTripsStore(state => state.setdriverDueDate);
  const fareBreakDown = useTripsStore(state => state.fareBreakDown);
  const [lastFetchedTime, setLastFetchedTime] = useState(null);
  // Get user token from global context
  const {userInfo, reFetching} = useUserStore();
  const token = userInfo?.token;

  const [ configIsLoading, setDriverConfigLoading] = useState(false);
  const [ configIsError, setDriverConfigError] = useState(null);
  
  // State to track network connectivity status
  const [isOnline, setIsOnline] = useState(null);
  const lastFetchedTimeRef = useRef(null);
  
  useEffect(() => {
    lastFetchedTimeRef.current = lastFetchedTime;
  }, [lastFetchedTime]);

  // Fetch initial network connectivity status
  useEffect(() => {
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected);
    });
  }, []);

  // Subscribe to network connectivity changes
  useEffect(() => {
    const handleConnectivityChange = state => {
      setIsOnline(state.isConnected);
    };

    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch all RideGroup data
  const fetchTrips = useCallback(async () => {
    setLastFetchedTime(new Date().getTime());
    const api = new APIRequest();
    const url = `/user/trip/driver/getTrips?driverId=${userInfo?.user?._id}`;
    const res = await api.request(url, 'GET', {}, token);
    if (res.success) {
      return res.trips;
    } else {
      NetworkAnalytics.triggerNetworkError('network_error','fetch_trips',res?.message);
      return [];
    }
  }, [token, setLastFetchedTime]);

  const fetchPublicRideTrips = useCallback(async () => {
    const api = new APIRequest();
    // const tripIdData = await DataStore.loadData('activeTripId');
    // const tripId = tripIdData?.data;
    // if (!tripId) {
    //   console.error('Trip ID not found for public ride trips')
    //   return []
    // }
    const url = `/publicrides/driver/getActiveTrip`;
    const res = await api.request(url, 'GET', {}, token);

    if (res.success) {
      return res.trip;
    } else {
      NetworkAnalytics.triggerNetworkError('network_error','fetch_public_ride_trips',res?.message);
      return [];
    }
  }, [token]);

  const fetchDriverConfig = async () => {
    const api = new APIRequest();
    const url = `/publicrides/driver/driverAppConfig`;
    const res = await api.request(url, 'POST', {}, token);
    if (res.success) {
      return res?.data;
    } else {
      return [];
    }
  }

  // Use react-query to fetch RideGroup data
  const {
    data: tripData,
    error: tripError,
    isLoading: tripLoading,
    refetch: refetchTrip,
    isFetching: isTripFetching,
    } = useQuery(['fetchTrips', token], userInfo?.user?.publicRidesDriver ? fetchPublicRideTrips : fetchTrips, {
    enabled: !!token && (isOnline || false) && reFetching,
    // refetchInterval: 300000, // 5 minutes in milliseconds
    refetchOnWindowFocus: true,
  });

    // Use react-query to Driver Configs
    const {
      data: driverConfig,
      error: driverConfigError,
      isLoading: driverConfigLoading,
      refetch: refetchDriverConfig,
      isFetching: isDriverConfigFetching,
      } = useQuery(['fetchDriverConfig', token], fetchDriverConfig, {
      enabled: !!token && (isOnline || false) && reFetching,
      // refetchInterval: 300000, // 5 minutes in milliseconds
      refetchOnWindowFocus: true,
    });

  const stateChange = useCallback(
    nextAppState => {
      if (
        nextAppState === 'active' &&
        token &&
        isOnline 
        // &&
        // lastFetchedTimeRef.current &&
        // new Date().getTime() - lastFetchedTimeRef.current > 60000
      ) {
        refetchTrip();
        refetchDriverConfig();
      }
    },
    [token, isOnline, lastFetchedTime],
  );

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      stateChange(nextAppState);
    };

    // Add the event listener only once
    const event = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Remove the event listener when the component unmounts
      event.remove();
    };
  }, []); // Empty dependency array to ensure the effect runs only once

  // Update device API store states based on query results
  useEffect(() => {
    setTripDataLoading(tripLoading);
    setTripDataError(tripError);
    setDriverConfigLoading(driverConfigLoading);
    setDriverConfigError(driverConfigError);
  }, [tripError, tripLoading]);

  const checkPermissions = useCallback(async () => {
    const hasNotificationPermissions = await CheckNotificationPermissions();
    setHasNotificationPermission(hasNotificationPermissions);

    const hasFineLocationPermissions = await checkFineLocationPermissions();
    setHasLocationPermission(hasFineLocationPermissions);

    const hasBackgroundLocationPermissions = await checkBackgroundLocationPermissions();
    setHasBackgroundLocationPermission(hasBackgroundLocationPermissions);
  }, []);

  const getActiveTrip = (tripData) => {
    const THIRTY_MINUTES = 60 * 60 * 1000; // 60 minutes in ms
    const currentTime = new Date().getTime();
    const filteredTrips = tripData?.filter(group => {
      const adjustedStartTime = group.startTime - THIRTY_MINUTES;
      const adjustedEndTime = group.endTime + THIRTY_MINUTES;
      return currentTime >= adjustedStartTime && currentTime <= adjustedEndTime;
    });
    const cleanedTrips = filteredTrips?.map(trip => ({
      ...trip,
      stops: trip.stops?.filter(stop => stop.name !== "start-location")
    }));
  
    return cleanedTrips;
  };

  const filteredTripData = (tripData) => {
    const cleanedTrips = tripData?.map(trip => ({
      ...trip,
      stops: trip.stops?.filter(stop => stop.name !== "start-location")
    }));
  
    return cleanedTrips;
  }
 
  // Update stores with fetched data
  useEffect(() => {
    if (tripData) {
      if (userInfo?.user?.publicRidesDriver){
        setTripData(tripData);
        if (tripData[0]?.status === "ACCEPTED" || tripData[0]?.status === "PICKEDUP" || tripData[0]?.status === "DROPPED"){
          setActiveTripData(tripData);
           setFareBreakDown(tripData[0]?.paymentDetails)
          if (tripData && tripData.length !== 0){
            const tripId = tripData[0]._id;
            DataStore.storeData('activeTripId',tripId)
          }
        }  
        if (tripData[0]?.status === "CANCELLED" && tripData[0]?.paymentDetails) { 
         DataStore.storeData('isOngoingTrip', true)
         setFareBreakDown(tripData[0]?.paymentDetails)
         setIsOnGoing(true)
         const updatedRideGroup = {
          ...tripData[0], 
          status:'CANCELLED', 
          finalDistance: tripData[0]?.finalDistance, 
          finalDuration: tripData[0]?.finalDuration,
          encodedPolyline: tripData[0]?.encodedPolyline,
        };
        setActiveTripData([updatedRideGroup]);
         NeNativeModule.endNavigation();
         setStartNavigation(false);
         driverWaitingTime.stopWaitingTime();
         setTimeout(() => {
           setStackScreen('PublicDriverTrackingScreen')
         }, 3000);
        } 
        if (tripData[0]?.status === "CANCELLED" && (!tripData[0]?.paymentDetails || tripData[0]?.paymentDetails === null)) {
          setActiveTripData(null);
          DataStore.storeData('activeTripId',null)
          setStartNavigation(false);
          setDisduration(null);
          setDirectionPoints(null);
          NeNativeModule.endNavigation();
        }
        if (tripData[0]?.status === "COMPLETED" || tripData[0]?.status === "DIVERGED") {
          setActiveTripData(null);
          DataStore.storeData('activeTripId',null)
          setStartNavigation(false);
          setDisduration(null);
          setDirectionPoints(null);
          NeNativeModule.endNavigation();
        }
      }else{
        const _filteredTripData = filteredTripData(tripData);
        setTripData(_filteredTripData);
        const activeTripData = getActiveTrip(_filteredTripData)
        setActiveTripData(activeTripData);
        if (activeTripData && activeTripData.length !== 0){
          const tripId = activeTripData[0]._id;
          DataStore.storeData('activeTripId',tripId)
        }
      }
    }

    if (driverConfig) {
      setDriverConfig(driverConfig);
    }
    // if (driverDueDate) {
    //   setdriverDueDate(driverDueDate);
    // }
  }, [tripData, driverConfig]);

  useEffect(() => {
     checkPermissions()
  }, []);


  return (
    <>
      {isOnline === false && (
        <View style={{backgroundColor: Colors.periwinkle, padding: 5}}>
          <Text
            style={{
              color: Colors.white,
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 12,
            }}>
            You are offline
          </Text>
        </View>
      )}
      {(tripLoading ||
        isTripFetching) && (
        <ProgressBar height={8} indeterminate backgroundColor="tomato" />
      )}
    </>
  );
}

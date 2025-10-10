import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStackScreenStore } from '../store/useStackScreenStore';
import Homescreen from '../features/home/screens/HomeScreen.jsx'
import MapContainer from '../features/map/components/MapContainer.js';
import { RequestAllPermissions } from '../controllers/PermissionHandler';
import locationTask from '../controllers/GetCurrentLocation';
import SearchScreen from '../features/search/screens/SearchScreen';
import WaypointScreen from '../features/booking/screens/WaypointScreen';
import { StatusBar, View, StyleSheet, AppState } from 'react-native';
import LottieView from 'lottie-react-native';
import useUserInfoStore from '../store/useUserInfoStore';
import { getStoredLocation, getPreferenceShowRideStatus} from '../storage/userLocalStorage';
import PickLocationScreen from './PickLocationScreen';
import { useCustomBackHandler } from '../hooks/useCustomBackHandler';
import PlanRideScreen from '../features/booking/screens/PlanRideScreen.jsx';
import BookRideScreen from '../features/booking/screens/BookRideScreen.jsx';
import { getUserStats } from '../API/EndPoints/EndPoints';
import RideStatus from '../features/rideStatus';
import useCurrentRideInfoStore from '../features/rideStatus/store/useCurrentRideInfoStore';
import PaymentScreen from '../features/payment/screens/PaymentScreen';
import useAssignedDriverInfoStore  from '../features/rideStatus/store/useAssignedDriverInfoStore';
import TripFeedbackScreen from '../features/rating/screens/TripFeedbackScreen';
import { DataStore } from '../controllers/DataStore';
import useMapStore from '../features/map/store/useMapStore';
import { useNearbyPollingControl } from '../store/useNearByDriverPollingControl';

import LanguageScreen from './OnBoard/LanguageScreen.jsx';
import MyRidesScreen from '../features/rideHistory/screens/MyRidesScreen';
import AboutScreen from '../features/Profile/MyAccountScreen';
import RideDetailScreen from '../features/rideHistory/screens/RideDetailScreen';
import ContactScreen from '../features/about/screens/ContactScreen';
import SavedPlacesScreen from '../features/savedPlaces/screens/SavedPlacesScreen';
import PreferencesScreen from '../features/preferences/screens/PreferencesScreen';
import LegalScreen from '../features/legal/screens/LegalScreen';
import AddPlaceDetailScreen from '../features/savedPlaces/screens/addplaceDetailScreen';
import GoogleMapScreen from '../features/googleMap/screens/GoogleMapScreen';
import SupportScreen from '../features/support/screens/SupportScreen';
import TicketDetailScreen from '../features/support/screens/TicketDetailScreen';
import TripSelectionScreen from '../features/support/screens/TripSelectionScreen';
import useLocationStore from '../store/useLocationStore';
import PREF from '../storage/PREF';
import { useDebounce } from '../hooks/useDebounce';
import useConfigStore from '../store/useConfigStore';
import UnableToConnectOverlay from '../components/UnableToConnectOverlay';
import AdaptiveText from '../components/Common/AdaptiveText';
import { Fonts } from '../constants/constants';
import SearchAPI from '../controllers/NEMap/Search';
import { useNavigation } from '@react-navigation/native';
import { checkFineLocationPermissions } from '../controllers/PermissionHandler';

const BootLoaderOverlay = React.memo(function BootLoaderOverlay() {
  return (
    <View style={styles.overlay}>
     
      <View style={styles.lottieContainer}>
        <LottieView
          source={require('../assets/lottie/car_travel.json')}
          autoPlay
          loop
          renderMode="HARDWARE"
          style={styles.lottie}
        />
        
      </View>
      <AdaptiveText style={styles.loadingText}>Warming up the engine…</AdaptiveText>
      
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(254, 254, 254, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  lottieContainer: {
    backgroundColor:'rgb(249, 249, 249)' ,
    borderRadius: 200,
    padding: 20,
   
   
    
  },
  lottie: {
    width: 220,
    height: 220,
  },
  loadingText: {
    position: 'absolute',
    bottom: "20%",
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
   
    color: 'black',
   
    fontFamily: Fonts.semi_bold,
  },
});

const Home = () => {
  const {location, setCurrentLocationName} = useLocationStore();
  const { setLocation } = useLocationStore.getState();
  const { stackScreen } = useStackScreenStore();
  const navigation = useNavigation();
  const appState = useRef(AppState.currentState);
  const permissionsRequested = useRef(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  
  const { setHomelocation, setWorklocation, setIsPreferenceShow} = useUserInfoStore();
  const { setStackScreen } = useStackScreenStore();
  const { setCurrentRideInfo , setFareDetails } = useCurrentRideInfoStore();
  const { setAllocatedDriverInfo } = useAssignedDriverInfoStore();
  const { setUserdetails ,setID,setUserFavPlaces,setRatingData,setTotalSpend,setCancelledTrips,setCompletedTrips,setTotalTrips} = useUserInfoStore();
  const { setMapShown , mapShown, setUserLocation} = useMapStore();
  const { setTarget } = useNearbyPollingControl();
  const { setConfig } = useConfigStore();
  

  const hasInitialLocationProcessed = useRef(false);
  const lastProcessedKey = useRef(null);
  const geocodeCache = useRef(new Map());
  const processLocationRef = useRef(null);
  
 
  const stableDebounceCallback = useRef((lng, lat) => {
    if (processLocationRef.current) {
      processLocationRef.current(lng, lat);
    }
  }).current;
  const debouncedProcessLocation = useDebounce(stableDebounceCallback, 600);


  processLocationRef.current = async (lng, lat) => {
    try {
     

      const key = `${lng},${lat}`;
      const cachedAddress = geocodeCache.current.get(key);
      if (cachedAddress) {
        setCurrentLocationName(cachedAddress);
        return;
      }

      const search = new SearchAPI();
      const response = await search.reverseGeocode(lng, lat);
      geocodeCache.current.set(key, response);
      setCurrentLocationName(response);
    } catch (e) {
      console.error('Failed to fetch address', e);
    }
  };
  
  const checkAllPermissions = async () => {
    if (permissionsRequested.current) return;
    
    permissionsRequested.current = true;
    const permissions = await RequestAllPermissions();
    
    if (permissions.location) {
      await locationTask.getCurrentLocation();
    }
    
  };


  const updateLocationDebounced = async (lng, lat) => {
    setLocation([lng, lat]);
    if (lng && lat) {
      try {
        const key = `${lng},${lat}`;

      
        if (lastProcessedKey.current === key) {
          const cached = geocodeCache.current.get(key);
          if (cached) {
            setCurrentLocationName(cached);
          }
          return;
        }
        lastProcessedKey.current = key;

     
        if (!hasInitialLocationProcessed.current) {
          hasInitialLocationProcessed.current = true;
          await processLocationRef.current(lng, lat);
          return;
        }

     
        debouncedProcessLocation(lng, lat);
      } catch (e) {
        console.error('Failed to handle location update', e);
      }
    }
  };




  const handleUserLocatioChange = useCallback(currentLocation => {
    console.log("handleUserLocatioChange at home" ,JSON.stringify(currentLocation))
    const current = useLocationStore.getState().location;
    const lng = currentLocation?.longitude;
    const lat = currentLocation?.latitude;
    if (lng == null || lat == null) {
      return;
    }
    if (!current) {
      updateLocationDebounced(lng, lat);
      return;
    }
    if (
      lng === current?.[0] &&
      lat === current?.[1]
    ) {
      return;
    }
    updateLocationDebounced(lng, lat);
  }, [updateLocationDebounced]);

  useEffect(() => {
    setUserLocation(handleUserLocatioChange);
  }, []);


  const checkFavouriteLocation = async () => {
    const homeLocation = await getStoredLocation('Home');
    const workLocation = await getStoredLocation('Work');
 
    setHomelocation(homeLocation);
    setWorklocation(workLocation);
  };

  const checkOnGoingRideAndLog = async () => {
    const currentTrip = await DataStore.loadData(PREF.CURRENT_TRIP);

    const currentTripId=currentTrip?.data || null
    try {
      setConfigError(false);
      const Response = await getUserStats(currentTripId);

   
      if(Response?.success ){

        if(Response?.appConfig){
          setConfig(Response?.appConfig);

        } else {
          setConfigError(true);
        }

        if(Response?.userStats?.favPlaces?.length > 0){
          setUserFavPlaces(Response?.userStats?.favPlaces);
        }
        if(Response?.userStats?.stats){
           
           const stats = Response?.userStats?.stats;
     
           
              
            setTotalSpend(stats?.totalSpends || 0);
          
         
            setCancelledTrips(stats?.cancelledTrips || 0);
          
  
            setCompletedTrips(stats?.completedTrips || 0);
          
          
            setTotalTrips(stats?.totalTrips || 0);
          
        }
        if(Response?.userStats?.rating){
          setRatingData(Response?.userStats?.rating);
        }



        if(Response?.trip?.status == "DROPPED" || ( Response?.trip?.status == "CANCELLED" && Response?.trip?.fareDetails)){
          setStackScreen('PaymentScreen', { });
          return;
        }
        if((Response?.trip?.status == "COMPLETED" || Response?.trip?.status == "DIVERGED") && currentTrip ){
          setStackScreen('TripFeedbackScreen', { });
          return;
        }
      
      if(Response?.trip){


        if (Response?.trip?.status == "CANCELLED" && Response?.trip?.status == "PENDING"){
          await DataStore.clearData(PREF.CURRENT_TRIP)
          return;
        }
       
        setCurrentRideInfo(Response?.trip);
        if(Response?.assignDriver){
          setAllocatedDriverInfo(Response?.assignDriver);
        }
        if(Response?.trip?.fareDetails){
          const fareData = {
            fareDetails:Response?.trip?.fareDetails,
          }
          if(Response?.trip?.customerInvoice){
            fareData.customerInvoice = Response?.trip?.customerInvoice;
          }
           setFareDetails(fareData)
        }
        setStackScreen('RideStatus', { });
      }
      
    } else {
      setConfigError(true);
    }
    } catch (error) {
      console.error('Error fetching ongoing ride:', error);
      setConfigError(true);
    } finally {
      setBootLoading(false);
    }
  }


  const checkPreferenceShowRideStatus = async () => {
    const preferenceShowRideStatus = await getPreferenceShowRideStatus();
    if(preferenceShowRideStatus == "true"){
      setIsPreferenceShow(true);
    }
  }




  


  const loadUserDetails = async () => {
    
    const userdetails = await DataStore.loadData('userdetails');
    
    if(userdetails.data){
      
      setUserdetails(userdetails.data);
      setID(userdetails.data._id);
    }
  
  }

  const coordsbasedDatafetch = async () => {
    
  } 

  const retryLoadAppConfig = async () => {
    setBootLoading(true);
    setConfigError(false);
    await checkOnGoingRideAndLog();
  }


  useEffect(() => {
    checkAllPermissions();
    loadUserDetails();
    checkFavouriteLocation();
    checkPreferenceShowRideStatus();
    checkOnGoingRideAndLog()
  }, []);

  const navigateToPermissionIfNeeded = useCallback(async () => {
    try {
      const granted = await checkFineLocationPermissions();
      setHasLocationPermission(!!granted);
      if (!granted) {
        navigation.navigate('LocationPermission');
      }
    } catch (e) {
      setHasLocationPermission(false);
    }
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        // Ensure we cache current permission state early
        const grantedNow = await checkFineLocationPermissions();
        setHasLocationPermission(!!grantedNow);
        const onBoarding = await DataStore.loadData('onBoarding');
        if (onBoarding?.data === 'onBoardingDone') {
          await navigateToPermissionIfNeeded();
        }
      } catch (e) {
        // no-op
      }
    })();
  }, [navigateToPermissionIfNeeded]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      appState.current = nextState;
      if (nextState === 'active') {
        navigateToPermissionIfNeeded();
      }
    });
    return () => subscription.remove();
  }, [navigateToPermissionIfNeeded]);

  useCustomBackHandler();

  useEffect(()=>{
    
    if(location?.length>1){
      setTarget(location[1],location[0]);
      coordsbasedDatafetch();
    }
  },[location])

  


  const renderContent = () => {
    const current = stackScreen[stackScreen.length - 1];
    const { name, params } = current;

    switch (name) {
      case 'Home':
        return <Homescreen {...params} />;
      case 'PlanRideScreen':
        return <PlanRideScreen {...params} />;
      case 'SearchScreen':
        return <SearchScreen {...params} />;
      case 'BookRideScreen':
        return <BookRideScreen {...params} />;
      case 'RideStatus':
        return <RideStatus {...params} />;
      case 'WaypointScreen':
        return <WaypointScreen {...params} />;
      case 'PickLocationScreen':
        return <PickLocationScreen {...params} />;
      case 'PaymentScreen':
        return <PaymentScreen {...params} />;
      case 'TripFeedbackScreen':
        return <TripFeedbackScreen {...params} />;
      case 'MyRidesScreen':
        return <MyRidesScreen {...params} />;
      case 'RideDetailScreen':
        return <RideDetailScreen {...params} />;
      case 'MyAccountScreen':
        return <AboutScreen {...params} />;
      case 'SavedPlacesScreen':
        return <SavedPlacesScreen {...params} />;
      case 'PreferencesScreen':
        return <PreferencesScreen {...params} />;
      case 'ContactScreen':
        return <ContactScreen {...params} />;
      case 'LegalScreen':
        return <LegalScreen {...params} />;
      case 'LanguageScreen':
        return <LanguageScreen {...params} />;
      case 'AddPlaceDetailScreen':
        return <AddPlaceDetailScreen {...params} />;

      case 'SupportScreen':
        return <SupportScreen {...params} />;
      case 'TicketDetailScreen':
        return <TicketDetailScreen {...params} />;
      case 'TripSelectionScreen':
        return <TripSelectionScreen {...params} />;
      case 'GoogleMapScreen':
        return <GoogleMapScreen {...params} />;
     
      default:
        return null;
    }
  };

  

  return (
    <>
     {bootLoading && (
        <BootLoaderOverlay />
      )}
     <StatusBar barStyle="dark-content" backgroundColor={"white"} />
      {renderContent()}
     {hasLocationPermission && (
       <MapContainer
         mapReady={mapShown}
         setMapReady={setMapShown}
       />
     )}
     
      {configError && (
        <UnableToConnectOverlay onRetry={retryLoadAppConfig} />
      )}

      {/* {overlayStatuses.includes(tripStatus) && (
        <TripStatusOverlay status={tripStatus} />
      )} */}
    </>
  );
};

export default Home;
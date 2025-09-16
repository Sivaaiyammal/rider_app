import React, { useEffect, useRef, useState } from 'react';
import { useStackScreenStore } from '../store/useStackScreenStore';
import Homescreen from '../features/home/screens/HomeScreen.jsx'
import MapContainer from '../features/map/components/MapContainer.js';
import { RequestAllPermissions } from '../controllers/PermissionHandler';
import locationTask from '../controllers/GetCurrentLocation';

import RideSummary from './RideSummary';
import SearchScreen from '../features/search/screens/SearchScreen';
import WaypointScreen from '../features/booking/screens/WaypointScreen';
import { StatusBar } from 'react-native';
import useUserInfoStore from '../store/useUserInfoStore';
import { getStoredLocation, getPreferenceShowRideStatus} from '../storage/userLocalStorage';
import PickLocationScreen from './PickLocationScreen';
import { useCustomBackHandler } from '../hooks/useCustomBackHandler';
import PlanRideScreen from '../features/booking/screens/PlanRideScreen.jsx';
import BookRideScreen from '../features/booking/screens/BookRideScreen.jsx';
import { getUserStats , getNearByDrivers} from '../API/EndPoints/EndPoints';
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
const Home = () => {
  const {location} = useLocationStore();
  const { setLocation } = useLocationStore.getState();
  const { stackScreen } = useStackScreenStore();
  const permissionsRequested = useRef(false);
  const [mapReady] = useState(false);
  const { setHomelocation, setWorklocation, setIsPreferenceShow} = useUserInfoStore();
  const { setStackScreen } = useStackScreenStore();
  const { setCurrentRideInfo , setFareDetails } = useCurrentRideInfoStore();
  const { setAllocatedDriverInfo } = useAssignedDriverInfoStore();
  const { setUserdetails ,setID,id,setUserFavPlaces,setRatingData,setTotalSpend,setCancelledTrips,setCompletedTrips,setTotalTrips} = useUserInfoStore();
  const { setMapShown , mapShown, setUserLocation} = useMapStore();
  const { setTarget } = useNearbyPollingControl();
  
  const checkAllPermissions = async () => {
    if (permissionsRequested.current) return;
    
    
    permissionsRequested.current = true;
    const permissions = await RequestAllPermissions();
    
    if (permissions.location) {
      await locationTask.getCurrentLocation();
    }
   
  };
  const handleUserLocatioChange = (location) => {
    console.log("userLocation", location);
    setLocation([location.longitude, location.latitude]);
  }

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
   console.log("currentTrip",currentTrip)
    const currentTripId=currentTrip?.data || null
    try {
      
      const Response = await getUserStats(currentTripId);
    
      console.log("Response",Response)
      if(Response?.success ){

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



        if(Response?.trip?.status == "DROPPED" || Response?.trip?.status == "CANCELLED"){
          setStackScreen('PaymentScreen', { });
          return;
        }
        if(Response?.trip?.status == "COMPLETED" && currentTrip ){
          setStackScreen('TripFeedbackScreen', { });
          return;
        }
      
      if(Response?.trip){
       
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
      
    }
    } catch (error) {
      console.error('Error fetching ongoing ride:', error);
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


 
  
 

  useEffect(() => {
    checkAllPermissions();
    loadUserDetails();
    checkFavouriteLocation();
    checkPreferenceShowRideStatus();
    checkOnGoingRideAndLog()
  }, [mapReady]);

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
     <StatusBar barStyle="dark-content" backgroundColor={"white"} />
      {renderContent()}
      <MapContainer
        mapReady={mapShown}
        setMapReady={setMapShown}
      />

      {/* {overlayStatuses.includes(tripStatus) && (
        <TripStatusOverlay status={tripStatus} />
      )} */}
    </>
  );
};

export default Home;
import {
  Animated, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  StatusBar, 
  View,
  Alert
} from 'react-native';
import React, {useEffect, useRef, useState, useCallback} from 'react';
import { useTranslation } from 'react-i18next';


import SideDrawer from '../../../components/Drawer/SideDrawer';
import {colors, Fonts} from '../../../constants/constants';

import {useStackScreenStore} from '../../../store/useStackScreenStore';
import LocationHeader from '../components/LocationHeader';
import HistoryCard from '../../shared/component/HistoryCard';
import LinearGradient from 'react-native-linear-gradient';
import SearchIcon from '../../../assets/icons/SearchIcon.svg';
import MapIcon from '../../../components/Map/MapIcon';
import FavLabelItems from '../components/FavLabelItems';
import useLocationStore from '../../../store/useLocationStore';
import  LocationTypes  from '../../booking/types/LocationTypes.json';  
import useRideBookingLocationStore from '../../booking/store/useRideBookingLocationStore'
import AdaptiveText from '../../../components/Common/AdaptiveText';
import { height, utils, width } from '../../../utils/Utils';
import BottomSheetWrapper from '../../../components/BottomSheetWrapper';
import Marker from '../../../controllers/NEMap/Marker';
import useMapStore from '../../../features/map/store/useMapStore';
import  AppConfig  from '../../../Config/AppConfig';
import  {useNearbyPollingControl}  from '../../../store/useNearByDriverPollingControl';
import PropTypes from 'prop-types';
import { checkNotificationPermissions, RequestNotificationPermission } from '../../../controllers/PermissionHandler';
import useScheduleTripStore from '../../../store/useScheduleTripStore';
import ScheduledTripBanner from '../components/ScheduledTripBanner';


const BottomSheetHeader = ({makeRidePlan}) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.bottomSheetHeader}>
      <View style={styles.bottomSheetHeaderIconContainer}>
    <MapIcon />
    </View>
    <View style={styles.bottomSheetHeaderContainer}>
    <TouchableOpacity
          style={styles.searchContainer}
          onPress={makeRidePlan}
          
        >
          <SearchIcon />
          <AdaptiveText style={styles.searchContainerText}>
            {t('where_do_you_want_to_go')}
          </AdaptiveText>
        </TouchableOpacity>
    </View>
    </View>
  )
}

const MapScreen = () => {
  const { t } = useTranslation();
  const { start,stop } = useNearbyPollingControl();
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState(null);
  const {setStackScreen} = useStackScreenStore();
  const {location,currentLocationName} = useLocationStore();
  const {setRideStartLocation,setRideEndLocation,resetRideBookingLocation } = useRideBookingLocationStore()
 
  const {setMapMarkers,setMapBounds} = useMapStore();
  const { scheduledTrips } = useScheduleTripStore();
  
  // useEffect(()=>{

  
  //   if(drivers?.length > 0 && AppConfig.SHOW_NEARBY_DRIVER){
  //     const markers = drivers.map((driver)=>{

  //       const marker = new Marker(
  //         driver.id || 'driver-marker',
  //         driver.vehicleType || 'Driver',
  //         driver.lon,
  //         driver.lat,
  //         driver.vehicleType.toLowerCase(),
  //         48,
  //         false,
  //         driver.bearing || 0
  //       );
  //       return marker
  //     })
  //     setMapMarkers(markers)
      
  //   }

  //   return ()=>{
  //     setMapMarkers([])
  //   }
  // },[drivers])


  // useEffect(()=>{
  //   if(location && location.length > 0){
  //     const bounds = utils.getBoundingBox([[location[0],location[1]]])
  //     const margin = [50, 100, 50, height*0.4]
  //     const finalBounds = [bounds, margin]
  //     setTimeout(() => {  
  //       setMapBounds(finalBounds);
  //     }, 2000);
  //   }
  // },[location])



  
  
  const scaleValue = useRef(new Animated.Value(1)).current;
  const offsetValue = useRef(new Animated.Value(0)).current;
  const closeButtonOffset = useRef(new Animated.Value(0)).current;


  const ANIMATION_CONFIG = {
    duration: 300,
    useNativeDriver: true,
  };





  const animateMenu = useCallback((toValue) => {
    try {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: toValue ? 0.9 : 1,
          ...ANIMATION_CONFIG,
        }),
        Animated.timing(offsetValue, {
          toValue: toValue ? 300 : 0,
          ...ANIMATION_CONFIG,
        }),
        Animated.timing(closeButtonOffset, {
          toValue: toValue ? -30 : 0,
          ...ANIMATION_CONFIG,
        }),
      ]).start();
    } catch (error) {
     console.log(error, 'animateMenu');
    }
  }, [scaleValue, offsetValue, closeButtonOffset]);


  
 
  const toggleMenu = useCallback(() => {
    try {
      animateMenu(!showMenu);
      setShowMenu(!showMenu);
    } catch (error) {
          console.log(error, 'toggleMenu');
    }
  }, [showMenu, animateMenu]);

  // Handle menu state changes
  useEffect(() => {
    if (!showMenu) {
      animateMenu(false);
    }
  
  }, [showMenu]);

  useEffect(()=>{
    resetRideBookingLocation();
    if(AppConfig.SHOW_NEARBY_DRIVER){
      start();
    }
    return ()=>{
      stop();
    }
  },[])

  // Request notification permission on HomeScreen mount
  useEffect(() => {
    (async () => {
      try {
        const notifGranted = await checkNotificationPermissions();
        if (!notifGranted) {
          await RequestNotificationPermission();
        }
      } catch (e) {
        // no-op
      }
    })();
  }, []);

  
  const setHomeMapMarker = () => {
    if(location && location.length > 0){
      const randomId = `home-marker-${Math.random().toString(36).substr(2, 9)}`;
      const homeMarker = new Marker(  
        randomId,
        randomId,
        location[0],  
        location[1],
        'home',
        48,
        true,  
        0
      );
      homeMarker.setAnimate(true);
      homeMarker.setAnimationTime(10000);
      homeMarker.setFocus(false)
      homeMarker.setDoRotation(false)
      setMapMarkers([homeMarker]);
    }   
  };

  useEffect(()=>{
    if(location && location.length > 0){
      setHomeMapMarker()
      const bounds = utils.getBoundingBox([[location[0],location[1]]])
      const margin = [50, 100, 50, height*0.4]
      const finalBounds = [bounds, margin]
      setTimeout(() => {
        setMapBounds(finalBounds);
      }, 1000);
    }
    return () => {
      setMapMarkers([])
    } 
  },[location])

  const handleMenu = useCallback(() => {
    try {
      setShowMenu(!showMenu);
    } catch (error) {
      console.log(error, 'handleMenu');
    }
  }, [showMenu]);

  
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const granted = await checkFineLocationPermissions();
  //       setHasLocationPermission(!!granted);
  //     } catch (e) {
  //       setHasLocationPermission(false);
  //     }
  //   })();
  // }, []);

  // const handleEnableLocationPermission = useCallback(async () => {
  //   try {
  //     const granted = await RequestFineLocationPermission();
  //     setHasLocationPermission(!!granted);
  //   } catch (e) {
  //     setHasLocationPermission(false);
  //   }
  // }, []);

  const onHistoryPress = useCallback((item) => {
    try {
      if (!item) {
        throw new Error('Invalid history item');
      }
      if (!location || !Array.isArray(location) || location.length < 2 || !currentLocationName) {
        Alert.alert(t('location_not_found'))
        return;
      }
      const locationData ={
        name:"Current Location",
        latitude:location[1],
        longitude:location[0],
        address:currentLocationName.address,
        placeName:currentLocationName.placeName,
        type:LocationTypes.START_LOCATION,
        locationFrom:"MAP",
        currentLocation:true
      }
     
      setRideStartLocation(locationData)
      setRideEndLocation(item)
      setStackScreen("PlanRideScreen",{})
     
     
    } catch (error) {
      console.log(error, 'onHistoryPress');
    }
  }, [location, currentLocationName, setRideStartLocation, setRideEndLocation, setStackScreen, t]);



  const ErrorMessage = () => (
    error && (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => setError(null)}
        > 
          <Text style={styles.errorButtonText}>{t('dismiss')}</Text>
        </TouchableOpacity>
      </View>
    )
  );

  const handleFavouriteLocationPress = useCallback((locationType,labelLocation) => {
    try {

      if (!labelLocation) {
        return;
      }
      if(!location || !currentLocationName || !location.length){
        Alert.alert(t('location_not_found'))
        return;
      }
      const locationData ={
        name:"Current Location",
        latitude:location[1],
        longitude:location[0],
        address:currentLocationName.address,
        placeName:currentLocationName.placeName,
        type:LocationTypes.START_LOCATION,
        locationFrom:"MAP",
        currentLocation:true

      }
      setRideStartLocation(locationData)
      setRideEndLocation(labelLocation)
      setStackScreen("PlanRideScreen",{})
    } catch (error) {
      console.log(error, 'handleFavouriteLocationPress');
    }
    
  }, [location, currentLocationName, setRideStartLocation, setRideEndLocation, setStackScreen, t]);

  const makeRidePlan=()=>{

    if(!location || !currentLocationName || !location.length){
      setStackScreen("PlanRideScreen",{})
      return;
    }

    const locationData ={
      name:"Current Location",
      latitude:location[1],
      longitude:location[0],
      address:currentLocationName.address,
      placeName:currentLocationName.placeName,
      type:LocationTypes.START_LOCATION,
      locationFrom:"MAP",
      currentLocation:true
    }
    setRideStartLocation(locationData)
  
    setStackScreen("PlanRideScreen",{})
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      

      <Animated.View style={styles.headerContainer}>
            <LocationHeader toggleMenu={toggleMenu} showMenu={showMenu} />
      </Animated.View>

      <BottomSheetWrapper 
       snapPoints={['40%','80%']}
       index={0}
       enablePanDownToClose={false}
       enableOverDrag={true}
       enableScroll={true}
       handleComponent={()=>BottomSheetHeader({makeRidePlan})}
       handleIndicatorStyle={{
         backgroundColor: '#DEDEDE',
         width: 50,
         height: 4,
       }}>
       
            <View style={{marginTop:60}}>
              {<ScheduledTripBanner/>}
              <FavLabelItems onLabelPress={handleFavouriteLocationPress}/>
              <HistoryCard selectCallback={onHistoryPress} header={true} bottomborder={false} />
            </View>
        
        
      </BottomSheetWrapper>

      {showMenu && <SideDrawer handleMenu={handleMenu} />}
      <ErrorMessage />
    </>
  );
};

export default MapScreen;

BottomSheetHeader.propTypes = {
  makeRidePlan: PropTypes.func,
};

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 1,
  },
  gradientOverlay: {
    height: 50,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 10,
    width:"100%",
  
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    gap: 10,
    marginTop: 20,
    borderWidth: 0.3,
    paddingVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4b48ab',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  searchContainerText: {
    fontFamily: Fonts.regular,
  
    fontSize: 16,
      
    textAlign: 'left',
    color: '#121212',
  },
  buttonText: {
    fontFamily: Fonts.medium,
    color: colors.white,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    color: colors.white,
    fontFamily: Fonts.medium,
  },
  errorContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    zIndex: 1000,
  },
  errorText: {
    color: '#c62828',
    fontFamily: Fonts.medium,
    marginBottom: 10,
  },
  errorButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#f44336',
    borderRadius: 5,
  },
  errorButtonText: {
    color: colors.white,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },


  bottomSheetHeader: {
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-between",
    alignSelf:"center",
    alignItems:"left",
    position:"absolute",    
    width:"100%",
    flex:1,
    gap:5,
    top:-45,
    
  },
  bottomSheetHeaderIconContainer: {
  paddingHorizontal:10,
  },
  bottomSheetHeaderContainer: {
    width: '100%',
    paddingTop:15,
    backgroundColor:colors.white,
    paddingBottom:10,
    paddingHorizontal:10,
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
    borderTopWidth:1,
    borderTopColor:colors.grey,
  },
  bottomSheetContent: {
    marginTop:height*0.06,
    flex:1,
    
  
  },
});

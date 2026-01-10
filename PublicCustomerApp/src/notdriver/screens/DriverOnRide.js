import {ActivityIndicator, Alert, AppState, FlatList, Linking, KeyboardAvoidingView, NativeModules, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import 'moment-timezone';
import Feather from 'react-native-vector-icons/Feather';
import useUserStore from '../../common/store/useUserStore';
import { useMapMarkerStore } from '../../common/store/useMapMarkerStore';
import useDeviceTokenStore from '../../common/store/useDeviceTokenStore';
import { useTripAcceptStore } from '../store/useTripAcceptStore';
import { useStackScreenStore } from '../../common/store/useStackScreenStore';
import usePublicDriverStore from '../store/usePublicDriverStore';
import { checkBackgroundLocationPermissions, checkFineLocationPermissions, RequestBackgroundLocationPermission, RequestFineLocationPermission } from '../../common/controllers/PermissionHandler';
import locationTask from '../../common/controllers/GetCurrentLocation';
import BGLocationTask from '../../common/controllers/BGLocationTask';
import driverWaitingTime from '../Controller/DriverWaitingTime';
import { showNotification } from '../../common/components/Alerts/showNotification';
import publicrideDriverApi from '../api/publicrideDriverApi';
import { DataStore } from '../../common/controllers/DataStore';
import APIRequest from '../../common/APIRequest';
import DriverAnalytics from '../../common/Analytics/DriverAnalytics';
import { height } from '../../common/utils/scalingutils';
import { Colors, Fonts } from '../../common/constants/constants';
import { RouteScreenStyles } from '../styles/RouteScreenStyles';
import TrackingMapIcons from '../../common/components/Alerts/TrackingMapIcons';
import FullScreenLoader from '../../common/loaders/FullScreenLoader';
import { DateTimeFormatter } from '../../common/utils/DateTimeFormatter';
import { utils } from '../../common/utils/utils';
import AddressComponent from '../components/AddressComponent';
import CustomeBottomSheet from '../../common/components/CustomeBottomSheet';
import BottomSheetPopup from '../../common/components/BottomSheetPopup';
import { findDistanceInMeters } from '../../common/core/FindDistance';
import PickUpModal from '../components/PickUpModal';
import WaitingTime from '../components/WaitingTime';
import TripFareCalculator from '../../common/core/TripFareCalculator';
import useTripsStore from '../store/useTripsStore';
import { cancelTrip } from '../components/CancelTripUpdate';
import RideMatchWSService from '../../common/controllers/socketServices/RideMatchSocketService';
import CancelRideModal from '../components/CancelModel';
import TripDetails from '../components/TripDetailCom';
import { useTranslation } from 'react-i18next';


const {NeNativeModule} = NativeModules;

const DriverOnRide = () => {
  const {t} = useTranslation()
  const[cancelRideModalVisible, setCancelRideModalVisible] = useState(false);
  const {userInfo, userRole} = useUserStore();
  const {
    setStartNavigation,
    setDirectionPoints,
    disduration,
    setDisduration,
    userLocation,
    directionReadyCallback,
    directionPoints,
    setUserLocation,
    // routeLoading,
    nativeError,
    navigationError,
    setMapMarkers,
    startNavigation,
    routeLoading,
    routeNotFound,
    setRouteNotFound
  } = useMapMarkerStore();
  const {activeTripData, setActiveTripData, updateStopData, setCurrentTripAcceptedTime} = useTripsStore();
  const {
    hasLocationPermission,
    hasBackgroundLocationPermission,
    hasNotificationPermission,
  } = useDeviceTokenStore();
  // const [loading,setLoading] = useState(false)
  const {loading, setLoading} = useTripAcceptStore()
  const {tripId, requestId, fetchLocationDate, setFetchLocationDate, isGetFare, setIsOnGoing, setIsGetFare } = useTripAcceptStore()
  const {fareBreakDown, setFareBreakDown} = useTripsStore()

  const setStackScreen = useStackScreenStore(state => state.setStackScreen);
 
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReachedPickup, setIsReachedPickup] = useState(false);
  const [isReachedDropoff, setIsReachedDropoff] = useState(false);
  const [showEndTripModal, setShowEndTripModal] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState(null)
  const [totalDistance, setTotalDistance] = useState('')
  const [totalDuration, setTotalDuration] = useState('')

  const [currentWaypointDetails, setCurrentWaypointDetails] = useState(null);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [tempStopData, setTempStopData] = useState(null);
  const [showWaypointReached,setShowWaypointReached] = useState(false)
  const [showTimeStartModal, setShowTimerStartModal] = useState(false)
  const [newLegIndex, setNewLegIndex] = useState(0)
  const prevNavLegIndex = useRef(null); // store last navLegIndex
  const [openNavChoiceModal, setOpenNavChoiceModal] = useState(false)

  const [watingTime, setWaitingTime] = useState(0)
  const [isAlertSent, setIsAlertSent] = useState(false)

  const {driverInfo} = usePublicDriverStore();

  const tripsStatus = activeTripData && activeTripData[0]?.status ? activeTripData[0]?.status : "";

  const getNonreachedStops = useTripsStore.getState().getNonreachedStops;
  const nonreachedStops = getNonreachedStops();

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const [otpLoading, setOTPLoading] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const onStartNavigationPress = async () => {
   
    // await DriverAnalytics.triggerDriverTripStatus('trip_start');
    setOpenNavChoiceModal(true)
  };

  const onNavigationClick = async () => {
    const haslocationPression = await checkFineLocationPermissions();
    const hasbackgroundPression = Platform.OS === 'android' && Platform.Version <= 28 ? true : await checkBackgroundLocationPermissions();
    if (!haslocationPression) {
      await RequestFineLocationPermission();
      return;
    }
    if (!hasbackgroundPression) {
      await RequestBackgroundLocationPermission();
      return;
    }
    if (!userLocation) {
      await locationTask.getCurrentLocation();
      return;
    }
  };

  const onStartWating = () => {
    if (BGLocationTask.isRunning()) {
        driverWaitingTime.startWatingTime()
        setShowWaypointReached(false)
        setShowTimerStartModal(false)
    } else {
       // TODO : enable foreground service and start timer
       showNotification('Background service Not Enabled','Please Enable Foregorund Service before Starting','danger')
    }
  }

  const onStopTimer =()=> {
    // driverWaitingTime.startWatingTime()
    driverWaitingTime.stopWaitingTime()
  }

  const handleEndTrip = async (reason) => {
    const haslocationPression = await checkFineLocationPermissions();

    const hasbackgroundPression =Platform.OS === 'android' && Platform.Version <= 28 ? true : await checkBackgroundLocationPermissions();
    console.log('hari-->>haslocationPression-->>', hasbackgroundPression, haslocationPression);

    // if (!hasbackgroundPression || !haslocationPression) {
    //   onNavigationClick()

    //   return;
    // }

    if (!userLocation) {
      await locationTask.getCurrentLocation();
      showNotification('Fetching Current Location', 'Try Again', 'info');
      return;
    }
      setLoading(true);
      if (tripsStatus === 'ACCEPTED') {
        const response = await publicrideDriverApi.cancelTrip(activeTripData[0]._id, reason);
        if (response.success) {
          cancelTrip(response)
        } else {
          showNotification(`Failed to Cancel Trip`, response?.message, 'danger')
        }
        setLoading(false);
      } else if (tripsStatus === 'PICKEDUP' && reason !== 'reached_destination') {
        setIsGetFare(false)
        setFetchLocationDate(true)
        DataStore.storeData('isOngoingTrip', true)
        setIsOnGoing(true)
      } else if (tripsStatus === 'PICKEDUP' && reason === 'reached_destination')  {
        endTrip();
      } else {
        setLoading(true);
        try {
          const cancelData = {driver_id:userInfo?._id, trip_id:activeTripData[0]._id, response: 'reject'}
          RideMatchWSService.emit('driver_trip_response', cancelData)
          setCancelRideModalVisible(false)
          DataStore.storeData('activeTripId', null);
          setLoading(false);
        }catch (err) {
          console.log('hari-->>accept-->>err-->>', err)
        }
      }
  }

  const onFairDetails = async (res, encodedPolyline) => {
    if (res.success) {
      if(res?.isOnGoingTrip) {
        DataStore.storeData('isOngoingTrip', true)
        setIsOnGoing(true)
    }
    const finalDistance = res?.totalFare?.distance || 0
    const finalDuration = res?.totalFare?.duration || 0
    setFareBreakDown(res?.totalFare)
    const updatedRideGroup = {
      ...activeTripData[0], 
      status:isGetFare?  'DROPPED' : 'CANCELLED', 
      finalDistance: finalDistance, 
      finalDuration: finalDuration,
      encodedPolyline: encodedPolyline,
    };
    setActiveTripData([updatedRideGroup]);
    NeNativeModule.endNavigation();
    setStartNavigation(false);
    setDisduration(null);
    driverWaitingTime.stopWaitingTime()
    showNotification(res?.message, res?.message, 'success');
    } else {
    showNotification(res?.message || 'Something went wrong', res?.message || 'Error Fetching Fare', 'danger');
    }
  
    setFetchLocationDate(false);
    setIsLoading(false);
    setLoading(false);
  }

  const endTrip = async () => {
    const haslocationPression = await checkFineLocationPermissions();
    const hasbackgroundPression = Platform.OS === 'android' && Platform.Version <= 28 ? true : await checkBackgroundLocationPermissions();
    if (!hasbackgroundPression || !haslocationPression) {
      onNavigationClick()
      return;
    }
    if (!userLocation) {
      await locationTask.getCurrentLocation();
      showNotification('Fetching Current Location', 'Try Again', 'info');
      return;
    }
    setFetchLocationDate(true)
    setLoading(true)
  }

  const onReachedPickup = () => {
    setModalVisible(true);
  }

  const onReachedPickupAlert = async () => {
     try {
        const api = new APIRequest();
        const url = `/publicrides/driver/alertPassangerPickup`;
        const payload = {
           driverName: driverInfo?.name,
           tripId: activeTripData[0]?._id,
        };
        const res = await api.request(url, 'POST', payload, userInfo.token);
        if(res.success) {
          showNotification('Alert sent', 'Alert sent', 'success');
          setIsAlertSent(true)
        } else {
          showNotification('Something went wrong', res.message, 'danger');
        }
     }
     catch (error) {
      showNotification('Something went wrong', '', 'danger');
     }
  }

  const handleWaypointsConfirm = async () => {
    setIsLoading(true);
    const filterStopNumber = tempStopData ? tempStopData[0] : activeTripData[0];
    const nextStopNumber = filterStopNumber?.stops?.filter(stop => stop.stopUpdated === true).length;
    try {
      const api = new APIRequest();
      const url = `/publicrides/driver/updateWaypointsDriverReached`;
      const payload = {
        tripId: activeTripData[0]?._id,
        stopNumber: nextStopNumber,
        isReached:true,
      };
      const res = await api.request(
        url,
        'POST',
        payload,
        userInfo?.token,
      );
      if (res?.success) {
        if (nonreachedStops[0]?.waitingTime && nonreachedStops[0]?.waitingTime !== 0) {
           updateStopData(nonreachedStops[0].name, true, 'PICKEDUP', 0, false)
           onStartWating()
        } else {
          setCurrentWaypointIndex(prevIndex => prevIndex + 1);
          updateStopData(nonreachedStops[0].name, true, 'PICKEDUP', 0, true)
          // NeNativeModule.moveToNextWaypoint();
          setStartNavigation(false);
          setDisduration(null);
          NeNativeModule.endNavigation();
        }
        setShowWaypointReached(false);
        setModalVisible(false);
        showNotification(res?.message, 'Stop Updated', 'success');
        // await DriverAnalytics.triggerDriverTripStatus(`stop_${nextStopNumber}_reached`);
      } else {
        showNotification(res?.message, res?.message, 'danger');
        setModalVisible(false);
      }
      setIsLoading(false);
    } catch (error) {
      showNotification('Something went wrong', '', 'danger');
      setIsLoading(false);
      setModalVisible(false);
    }
  };

  const handleWaypointsWaitTime = async (finalFinalTime, sotp, nextStopNumber) => {
    setIsLoading(true);
    try {
      const api = new APIRequest();
      const url = `/publicrides/driver/updateWaypointsDriverWaitTime`;
      const payload = {
        tripId: activeTripData[0]?._id,
        stopNumber: nextStopNumber,
        driverWaitTime: finalFinalTime,
        stopUpdated: true
      };
      const res = await api.request(
        url,
        'POST',
        payload,
        userInfo?.token,
      );
      if (res?.success) {
        updateStopData(sotp[0].name, true, 'PICKEDUP', finalFinalTime, true)
        setWaitingTime(0)
        setShowWaypointReached(false)
        setShowTimerStartModal(false)
        // NeNativeModule.moveToNextWaypoint();
        setStartNavigation(false);
        setDisduration(null);
        NeNativeModule.endNavigation();
        setCurrentWaypointIndex(prevIndex => prevIndex + 1);
        showNotification(res?.message, 'Pickup Successfully', 'success');
        await DriverAnalytics.triggerDriverTripStatus(`stop_${nextStopNumber}_reached`);
      } else {
        showNotification(res?.message, res?.message, 'danger');
        setModalVisible(false);
      }
      setIsLoading(false);
    } catch (error) {
      showNotification('Something went wrong', '', 'danger');
      setIsLoading(false);
      setModalVisible(false);
    }
  };

  const verifyOTP = async (otp) => {
    setOTPLoading(true)
    try{
      const api = new APIRequest();
      const url = `/publicrides/driver/verifyTripOtp`;
      const payload = {
        otp: otp,
        tripId: activeTripData[0]?._id,
      }
      const res = await api.request(url, 'POST', payload, userInfo?.token);
      if(res?.success){
        showNotification(res?.message, res?.message, 'success');
        setModalVisible(!modalVisible);
        updateStopData(nonreachedStops[0]?.name, true, 'PICKEDUP', 0, true)
        setStartNavigation(false);
        setDisduration(null);
        NeNativeModule.endNavigation();
        setDirectionPoints(null);
        setIsReachedPickup(false);
        setCurrentTripAcceptedTime(new Date().getTime());
        updateDirectionsPoints();
      }else{
        showNotification(res?.message, res?.message, 'danger');
      }
      setOTPLoading(false)
    }catch(error){
      showNotification('Something went wrong', '', 'danger');
      setOTPLoading(false)
    }
  }
      
  const handlePickupConfirm = (otp) => {
    if (otp.length !== 4) {
      showNotification('Please enter the correct OTP', '', 'danger');
      return;
    }
    verifyOTP(otp)
  }

  const updateDirectionsPoints = () => {
    if (!userLocation) return;
 
    if (tripsStatus === 'ACCEPTED') {
      const directions = [
        {
          lat: activeTripData[0]?.stops[0]?.location[1],
          lon: activeTripData[0]?.stops[0]?.location[0],
        },
      ];
      directions.unshift({
        lat: userLocation[0] || 0,
        lon: userLocation[1] || 0,
      });
       const padding = [50, 50, 50, height*0.3]
      setDirectionPoints({
        locations: directions,
        type: 'car',
        padding: padding.map(v => parseInt(v, 10))
      });
    } 

    if (tripsStatus === 'PICKEDUP'){
      nonreachedStops.unshift({
        lat: userLocation[0] || 0,
        lon: userLocation[1] || 0,
      });
       const padding = [50, 50, 50, height*0.3]
      setDirectionPoints({
        locations: nonreachedStops,
        type: 'car',
        padding: padding.map(v => parseInt(v, 10))
      });
    }
  };

  useEffect(() => {
    if (!activeTripData || activeTripData?.length === 0) return;
    if (startNavigation) return;
    updateDirectionsPoints();
  }, [tripsStatus, activeTripData,appStateVisible]);

  useEffect(() => {
    if (!disduration?.location) {
      if (userLocation && nonreachedStops?.[0]?.location) {
        const distance = findDistanceInMeters(userLocation, nonreachedStops[0].location);
        if (distance < 200 && distance >= 0) {
          if (tripsStatus === 'ACCEPTED') {
            setIsReachedPickup(true);
            return;
          }
          if (tripsStatus === 'PICKEDUP') {
              if (!nonreachedStops[0]?.stopUpdated && nonreachedStops?.length !== 1) {
                setShowWaypointReached(true);
              }
              if (nonreachedStops?.length === 1) {
                setShowWaypointReached(false);
                setIsReachedDropoff(true);
              }
          }
        }
      }
      return;
    }

    const [
      lat,
      lon,
      remainingDistance,
      remainingDuration,
      speed,
      ldistance,
      lduration,
      navLegIndex,
      bearing,
    ] = disduration?.location;

    // Track leg index progression
    if (prevNavLegIndex.current === null || prevNavLegIndex.current === 0) {
      prevNavLegIndex.current = navLegIndex;
      setCurrentWaypointIndex(navLegIndex)
    } else {
      if (navLegIndex > prevNavLegIndex.current) {
        setNewLegIndex(prev => prev + 1);
        prevNavLegIndex.current = navLegIndex;
      } else if (navLegIndex !== prevNavLegIndex.current) {
        prevNavLegIndex.current = navLegIndex;
      }
    }

    const distanceInMeters = ldistance;
    if (distanceInMeters < 200 && distanceInMeters >= 0) {
      // if (tripsStatus === 'ACCEPTED') {
      //   setIsReachedPickup(true);
      //   return;
      // }
      if (tripsStatus === 'PICKEDUP') {
        if (newLegIndex === currentWaypointIndex) {
          if (!nonreachedStops[0]?.stopUpdated && nonreachedStops?.length !== 1) {
            setShowWaypointReached(true);
          }
          if (nonreachedStops?.length === 1) {
            setShowWaypointReached(false);
            setIsReachedDropoff(true);
          }
        }   
      }
    }
  }, [disduration, userLocation, nonreachedStops]);

  const onReachedStop = () => {
    handleWaypointsConfirm()
  }

  const openGoogleMaps = () => {
    const stops = nonreachedStops.map(stop => `${stop.location?.[1]},${stop.location?.[0]}`);
    const destination = stops?.[0]
    if (!destination) {
      showNotification('No destination found', 'No destination found', 'danger');
      return;
    }
    let url = `https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=${destination}`;

    Linking.canOpenURL(url)
      .then(supported => {
        setOpenNavChoiceModal(false)
        if (!supported) {
          console.log("Can't handle url: " + url);
        }
        return Linking.openURL(url), setDirectionPoints(null);
      })
      .catch(err => console.error('An error occurred', err));
  };

  const handleNavMode = async (mode) => {
    if (mode === 'google') {
      openGoogleMaps()
    } else {
       if (!directionReadyCallback) {
      showNotification(
        'Please wait for the direction to be ready',
        '',
        'danger',
      );
      updateDirectionsPoints();
      return;
    }
    setStartNavigation(true);
    setMapMarkers([]);
    setOpenNavChoiceModal(false)
    setRouteNotFound(null);
    }
    await BGLocationTask.runDriverBgTask();

  }

  const renderOpenNavChoiceModal = () => {
    return (
      <BottomSheetPopup
        visible={openNavChoiceModal}
        driverStyles
        onClose={() => {
          setOpenNavChoiceModal(!openNavChoiceModal);
        }}>
        <View style={styles.navSheetContainer}>
          <View style={styles.navHeaderRow}>
            <Text style={[styles.navHeader, {width:'90%'}]}>{t('choose_navigation_mode')}</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('cancel_trip')} onPress={() => setOpenNavChoiceModal(false)} style={styles.navCloseBtn}>
              <MaterialCommunityIcons name="close" size={20} color={Colors.grey_dark} />
            </TouchableOpacity>
          </View>
          <Text style={styles.navSubHeader}>{t('start_navigation')} – {t('choose_navigation_mode')}</Text>
          <View style={styles.navOptionsRow}>
            <Pressable
              onPress={() => handleNavMode('google')}
              style={({pressed}) => [
                styles.navOptionCard,
                pressed && styles.navOptionPressed,
              ]}
            >
              {/* <View style={styles.navIconCircle}>
                <MaterialCommunityIcons name="google-maps" size={24} color={Colors.white} />
              </View> */}
              <Text style={styles.navOptionLabel}>{t('google')}</Text>
              <Text style={styles.navOptionDesc}>{t('start_navigation')}</Text>
            </Pressable>
            <Pressable
              onPress={() => handleNavMode('vm')}
              style={({pressed}) => [
                styles.navOptionCard,
                pressed && styles.navOptionPressed,
              ]}
            >
              {/* <View style={[styles.navIconCircle,{backgroundColor:Colors.periwinkle}]}> 
                <MaterialCommunityIcons name="road-variant" size={24} color={Colors.white} />
              </View> */}
              <Text style={styles.navOptionLabel}>{t('vm')}</Text>
              <Text style={styles.navOptionDesc}>{t('start_navigation')}</Text>
            </Pressable>
          </View>
          <View style={styles.navFooterHintWrapper}>
            <MaterialCommunityIcons name="information" size={16} color={Colors.grey_dark} />
            <Text style={styles.navFooterHint}>{t('press_to_update_status')}</Text>
          </View>
        </View>
      </BottomSheetPopup>
    );
  };

  const renderPickUpModal = () => {
    return (
      <BottomSheetPopup
        visible={modalVisible}
        onClose={() => {
          setModalVisible(!modalVisible);
        }}
        driverStyles
        >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, width: '100%', bottom: 0, position: 'absolute' }}>
          <View style={RouteScreenStyles.modalView}>
            <PickUpModal
              isPublicRide={true}
              stopsDetails={activeTripData && activeTripData.length > 0 && activeTripData[0]}
              onConfirmPress={handlePickupConfirm}
              isLoading={isLoading}
              otpLoading={otpLoading}
            />
          </View>
        </KeyboardAvoidingView>
      </BottomSheetPopup>
    );
  };

  const stopNavigation = () => {
    updateDirectionsPoints()
    NeNativeModule.endNavigation();
    setStartNavigation(false);
    setDisduration(null);
  }

  const onRecenter = () => {
    NeNativeModule.recenterNavigation();
  }

  // const isRouteLoading = routeLoading?.loading ? routeLoading?.loading : false

  // Handle native errors
  // useEffect(() => {
  //   if (nativeError) {
  //     console.log('Native Error:', nativeError);
  //     showNotification(
  //       'Navigation Error', 
  //       `${nativeError.errorType}: ${nativeError.errorMessage}`, 
  //       'danger'
  //     );
  //     setStartNavigation(false);
  //   }
  // }, [nativeError]);

  // Handle navigation errors
  // useEffect(() => {
  //   if (navigationError) {
  //     console.log('Navigation Error:', navigationError);
  //     showNotification(
  //       'Navigation Failed', 
  //       `${navigationError.errorMessage} (Code: ${navigationError.errorCode})`, 
  //       'danger'
  //     );
  //     setStartNavigation(false);
  //   }
  // }, [navigationError]);

  // Handle Route not found error
   useEffect(() => {
    if (routeNotFound) {
      if (routeNotFound == "ROUTENOTFOUND") { 
        setStartNavigation(false);
        updateDirectionsPoints();
    }
  }
  }, [routeNotFound]);

  return (
    <>
    {(isLoading || loading) &&
    <View style={{position:'absolute', width:'100%', height:'100%', zIndex:99999}}>
    <FullScreenLoader /> 
    </View>
    }
    <View style={{flex: 1}}>
      <WaitingTime setWaitingTime={setWaitingTime} onFinalTime={(finalTime, sotp, nextStopNumber)=>handleWaypointsWaitTime(finalTime, sotp, nextStopNumber)}/>       
     {fetchLocationDate && (
        <TripFareCalculator
        tripData={activeTripData[0]}
        setLoading={setLoading}
        setError={((err)=>{
          console.log('Fare calculation error:', err);
          if (err) {
           setError(err)
           setFetchLocationDate(false);
           setLoading(false);
           showNotification('Please Try Again', '', 'danger');
          }
        })}
        isGetFare={isGetFare}
        onDone={(finalData, encodedPolyline) => {
        console.log('Fare calculated with', finalData);
          onFairDetails(finalData, encodedPolyline)
          setFetchLocationDate(false);
        }}
        />
        )}
      {disduration ? null : (
        <View style={RouteScreenStyles.mapIconContainer}>
          <TrackingMapIcons markersData={directionPoints} refreshDirections={updateDirectionsPoints} />
        </View>
      )}
      {!activeTripData || activeTripData?.length === 0 ? (
        <View style={RouteScreenStyles.noActiveRouteContainer}>
          <Text style={RouteScreenStyles.noActiveRouteTxt}>
            {t('no_active_route')} !!
          </Text>
        </View>
      ) : (
        <CustomeBottomSheet useScrollView={true}>
        {loading && <FullScreenLoader />}
         {
            !disduration && tripsStatus !== "COMPLETED" ? 
                (hasLocationPermission && (Platform.OS === 'android' && Platform.Version <= 28 ? true : hasBackgroundLocationPermission) &&
                hasNotificationPermission)&& (
                  <TouchableOpacity disabled={routeLoading.loading} style={RouteScreenStyles.navigationIconContainer} onPress={() => onStartNavigationPress()}>
                    {routeLoading.loading ? <ActivityIndicator size="small" color={Colors.white} /> : 
                    <>
                    <Text style={RouteScreenStyles.navigationIconContainerTxt}>{t('start_navigation')}</Text>
                      <MaterialCommunityIcons
                        name="navigation"
                        size={22}
                        color={Colors.white}
                      />
                    </>}
                      
                  </TouchableOpacity>
                )
              : null
          }
           {/* <TouchableOpacity disabled={routeLoading.loading} style={RouteScreenStyles.navigationIconContainer} onPress={() => onStartNavigationPress()}>
                    {routeLoading.loading ? <ActivityIndicator size="small" color={Colors.white} /> : 
                    <>
                    <Text style={RouteScreenStyles.navigationIconContainerTxt}>{t.start_navigation}</Text>
                      <MaterialCommunityIcons
                        name="navigation"
                        size={22}
                        color={Colors.white}
                      />
                    </>}
                      
                  </TouchableOpacity>
                   <TouchableOpacity disabled={routeLoading.loading} style={RouteScreenStyles.navigationIconContainer} onPress={() => onEndNavigationPress()}>
                    {routeLoading.loading ? <ActivityIndicator size="small" color={Colors.white} /> : 
                    <>
                    <Text style={RouteScreenStyles.navigationIconContainerTxt}>{'t.start_navigation'}</Text>
                      <MaterialCommunityIcons
                        name="navigation"
                        size={22}
                        color={Colors.white}
                      />
                    </>}
                      
                  </TouchableOpacity> */}
            {/* <TouchableOpacity disabled={routeLoading.loading} style={RouteScreenStyles.navigationIconContainer} onPress={() => onStartNavigationPress()}>
                    {routeLoading.loading ? <ActivityIndicator size="small" color={Colors.white} /> : 
                    <>
                    <Text style={RouteScreenStyles.navigationIconContainerTxt}>{t.start_navigation}</Text>
                      <MaterialCommunityIcons
                        name="navigation"
                        size={22}
                        color={Colors.white}
                      />
                    </>}
                      
                  </TouchableOpacity>
                    <TouchableOpacity disabled={routeLoading.loading} style={RouteScreenStyles.navigationIconContainer} onPress={() => onENDNavigationPress()}>
                    {routeLoading.loading ? <ActivityIndicator size="small" color={Colors.white} /> : 
                    <>
                    <Text style={RouteScreenStyles.navigationIconContainerTxt}>{'t.start_navigation'}</Text>
                      <MaterialCommunityIcons
                        name="navigation"
                        size={22}
                        color={Colors.white}
                      />
                    </>}
                      
                  </TouchableOpacity> */}
          {watingTime > 0 &&
          <View style={RouteScreenStyles.watingTimeContainer}>
           <Text  style={RouteScreenStyles.watingTimeContainerTitle}> <Text style={{fontFamily:Fonts.light, fontSize:12}}>{t('waiting_time')}:{' '}</Text>{DateTimeFormatter.formatSecondsToDuration(watingTime)}</Text>
            <TouchableOpacity style={RouteScreenStyles.StopwatingTimeBtn} onPress={()=>onStopTimer()}>
             <Text style={RouteScreenStyles.StopwatingTimeBtnText}>{t('stop_timer')}</Text>
            </TouchableOpacity>
          </View>
          }
          {showWaypointReached && watingTime <= 0 &&
          <View>
            <TouchableOpacity style={RouteScreenStyles.reachedWaypointBtn} onPress={()=>onReachedStop()}>
              <Text style={RouteScreenStyles.reachedWaypointBtnTxt}>{t('reached')} {nonreachedStops[0]?.name}{'\n'} {t('press_to_update_status')}</Text>
            </TouchableOpacity>
            </View>
           }
          {tripsStatus === 'ACCEPTED' && 
          <View style={RouteScreenStyles.pickUpLocationContainer}>
            <Text style={RouteScreenStyles.pickUpLocationTxt}>{t('arrived_at_pickup_location')}</Text>
            <View style={RouteScreenStyles.pickUpLocationBtnContainer}>
            <TouchableOpacity disabled={isAlertSent} onPress={() => onReachedPickupAlert()} style={[RouteScreenStyles.acceptBtn,{backgroundColor:isAlertSent ? Colors.grey : Colors.periwinkle}]}>
              <Text style={[RouteScreenStyles.stopTxt, {maxWidth:130}]} numberOfLines={2}>{t('alert')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onReachedPickup()} style={RouteScreenStyles.acceptBtn}>
              <Text style={RouteScreenStyles.stopTxt}>{t('enter_otp')}</Text>
            </TouchableOpacity>
            </View>
          </View>
          }
          {
            isReachedDropoff &&
            <>
            <View
              style={[
                RouteScreenStyles.headerContainer,
                {backgroundColor: Colors.green},
              ]}>
              <View style={RouteScreenStyles.stopContainer}>
                <Text
                  style={[RouteScreenStyles.addressTxt, {color: '#ffffff'}]}>
                  {t('you_have_successfully_reached_your_destination')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={RouteScreenStyles.endTripBtn}
              onPress={() => endTrip()}>
              <Text style={RouteScreenStyles.endTripTxt}>{t('end_trip')}</Text>
            </TouchableOpacity>
          </>
          }
          {(!hasLocationPermission ||
            (!hasBackgroundLocationPermission && (Platform.OS === 'android' && Platform.Version > 28)) ||
            !hasNotificationPermission) ? (
              <View
                style={[
                  RouteScreenStyles.headerContainer,
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  },
                ]}>
                <Text
                  style={[
                    RouteScreenStyles.stopTxt,
                    {fontSize: 12, width: '60%'},
                  ]}>
                  {t('please_enable_required_permissions')}
                </Text>
                <TouchableOpacity
                  onPress={() => setStackScreen('DriverPermissionScreen')}
                  style={RouteScreenStyles.enableNowBtn}>
                  <Text
                    style={[
                      RouteScreenStyles.stopTxt,
                      {fontSize: 12, color: Colors.black},
                    ]}>
                    {t('enable_now')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : !userLocation ? (
              <View
                style={[
                  RouteScreenStyles.headerContainer,
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  },
                ]}>
                <Text
                  style={[
                    RouteScreenStyles.stopTxt,
                    {fontSize: 12, width: '60%'},
                  ]}>
                  {t('location_not_found')}
                </Text>
                <TouchableOpacity
                  onPress={() => onNavigationClick()}
                  style={RouteScreenStyles.enableNowBtn}>
                  <Text
                    style={[
                      RouteScreenStyles.stopTxt,
                      {fontSize: 12, color: Colors.black},
                    ]}>
                    {t('try_again')}
                  </Text>
                </TouchableOpacity>
              </View>
            ):null}
            {disduration && (
              <View style={styles.DurationContainer}>
             
                 <View style={styles.detailsContainer}>
              <View style={styles.durationContainer}>
                 <Text style={styles.durationText}>
                 {disduration?.location[2] < 1000? Math.round(disduration?.location[2]) +' '+'m' : utils.metersToKilometers(disduration?.location[2])?.toFixed(2) + 'km'} .
                  </Text>
                  <Text style={styles.durationText}>
                    {' '}{DateTimeFormatter.convertSecondsToReadable(
                      disduration?.location[3],true
                    )}
                  </Text>
              </View>
              </View>
              {/* <TouchableOpacity style={styles.stopNavigationBtn} onPress={()=>stopNavigation()}> 
                <Entypo name="cross" size={24} color="white" />
              </TouchableOpacity> */}
                 <TouchableOpacity style={styles.stopNavigationBtn} onPress={()=>onRecenter()}> 
                <Feather name="navigation-2" size={18} color="white" /> 
                <Text style={styles.stopNavigationBtnTxt}>Re-center</Text>
              </TouchableOpacity>
              </View>
            )}
          <TripDetails activeTripData={activeTripData} setModalVisible={setCancelRideModalVisible} />
          <AddressComponent
              percentage={0}
              waypoints={activeTripData[0]?.stops}
              deviceLocation={null}
              isPublicRides={true}
            />
            <TouchableOpacity style={styles.cancelTripBtn} onPress={()=>setCancelRideModalVisible(true)}>
              <Text style={styles.cancelTripBtnTxt}>{activeTripData?.[0]?.status === 'PICKEDUP' ? t('end_trip') : t('cancel_trip')}</Text>
            </TouchableOpacity>
        </CustomeBottomSheet>
      )}
      {cancelRideModalVisible && <CancelRideModal modalVisible={cancelRideModalVisible} setModalVisible={setCancelRideModalVisible} callCancelRide={handleEndTrip} loading={loading} tripData={activeTripData?.[0]}/>}
        {modalVisible && renderPickUpModal()}
        {/* {showTimeStartModal && renderWaitTimeModal()} */}
        {openNavChoiceModal && renderOpenNavChoiceModal()}
    </View>
    </>
  );
};

export default DriverOnRide;

const styles = StyleSheet.create({
    detailsContainer:{
        backgroundColor:'#FFD100',
        minWidth:'40%',
        alignSelf:'center',
        alignItems:'center',
        borderRadius:8,
        paddingVertical:5,
        marginTop:10
    },
    durationContainer:{
        flexDirection:'row'
    },durationText:{
        fontFamily:Fonts.regular,
        fontSize:14,
        color:Colors.black
    },cancelTripBtn:{
        backgroundColor:Colors.red,
        width:'90%',
        alignSelf:'center',
        marginTop:30,
        alignItems:'center',
        paddingVertical:10,
        borderRadius:10
    },cancelTripBtnTxt:{
        fontFamily:Fonts.regular,
        fontSize:14,
        color:Colors.white
    },
    stopNavigationBtn:{
        alignSelf:'center',
        alignItems:'center',
        borderRadius:10,
        padding:5,
        top:5,
        flexDirection:'row',
        gap:5,
        backgroundColor:Colors.grey_dark,
        justifyContent:'center',
        paddingVertical:5,
        paddingHorizontal:10,
        elevation:2
    },
    DurationContainer:{
        flexDirection:'row',
        alignItems:'center',
        width:'100%',
        padding:10,
        borderRadius:10,
        justifyContent:'center',
        gap:10
    },
    stopNavigationBtnTxt:{
      fontFamily:Fonts.regular,
      fontSize:12,
      color:Colors.white
    },
    /* Navigation Choice Modal Styles */
    navSheetContainer:{
      paddingHorizontal:18,
      paddingTop:12,
      paddingBottom:28,
      gap:14,
      backgroundColor:Colors.white,
      borderRadius:10,
      width:'90%'
    },
    navHeaderRow:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between'
    },
    navHeader:{
      fontFamily:Fonts.semi_bold,
      fontSize:16,
      color:Colors.black
    },
    navSubHeader:{
      fontFamily:Fonts.light,
      fontSize:12,
      color:Colors.grey_dark
    },
    navCloseBtn:{
      padding:6,
      borderRadius:20,
      backgroundColor:Colors.grey_xlight
    },
    navOptionsRow:{
      flexDirection:'row',
      gap:12
    },
    navOptionCard:{
      flex:1,
      backgroundColor:Colors.white,
      borderRadius:12,
      paddingVertical:14,
      paddingHorizontal:12,
      elevation:3,
      shadowColor:'#000',
      shadowOffset:{width:0,height:1},
      shadowOpacity:0.15,
      shadowRadius:2,
      borderWidth:1,
      borderColor:Colors.grey_xlight,
      gap:6
    },
    navOptionPressed:{
      opacity:0.8,
      transform:[{scale:0.98}]
    },
    navIconCircle:{
      width:40,
      height:40,
      borderRadius:20,
      backgroundColor:Colors.periwinkle,
      alignItems:'center',
      justifyContent:'center'
    },
    navOptionLabel:{
      fontFamily:Fonts.medium,
      fontSize:14,
      color:Colors.black
    },
    navOptionDesc:{
      fontFamily:Fonts.light,
      fontSize:11,
      color:Colors.grey_dark
    },
    navFooterHintWrapper:{
      flexDirection:'row',
      alignItems:'center',
      gap:6,
      marginTop:4
    },
    navFooterHint:{
      fontFamily:Fonts.light,
      fontSize:11,
      color:Colors.grey_dark,
      flex:1
    }
})

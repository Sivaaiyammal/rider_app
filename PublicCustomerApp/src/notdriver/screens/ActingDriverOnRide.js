import {ActivityIndicator, AppState, Linking, KeyboardAvoidingView, Modal, NativeModules, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
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
import { DataStore } from '../../common/controllers/DataStore';
import APIRequest from '../../common/APIRequest';
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
import { firebaselog_onRide } from '../../common/utils/FirebaseAnalytics';
import ArrivedPickUpLocation from '../components/ArrivedPickUpLocation';
import ModalFooter from '../components/ModalFooter';
import useActingDriverMediaStore from '../store/useActingDriverMediaStore';
import ActingDriverMediaButtons from '../components/ActingDriverMediaButtons';
import ActingDriverTripInfo from '../components/ActingDriverTripInfo';

const {NeNativeModule} = NativeModules;

const ActingDriverOnRide = () => {
  const {t} = useTranslation()
  const[cancelRideModalVisible, setCancelRideModalVisible] = useState(false);
  const {userInfo} = useUserStore();
  const {
    setStartNavigation,
    setDirectionPoints,
    disduration,
    setDisduration,
    userLocation,
    directionReadyCallback,
    directionPoints,
    setMapMarkers,
    startNavigation,
    routeLoading,
    routeNotFound,
    setRouteNotFound,
    setDirectionResponse
  } = useMapMarkerStore();
  const {activeTripData, setActiveTripData, updateStopData, setCurrentTripAcceptedTime} = useTripsStore();
  const {
    hasLocationPermission,
    hasBackgroundLocationPermission,
    hasNotificationPermission,
  } = useDeviceTokenStore();
  const {loading, setLoading, tripDetails, setTripDetails} = useTripAcceptStore()
  const {fetchLocationDate, setFetchLocationDate, isGetFare, setIsOnGoing, setIsGetFare } = useTripAcceptStore()
  const {setFareBreakDown} = useTripsStore()

  const setStackScreen = useStackScreenStore(state => state.setStackScreen);

  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReachedPickup, setIsReachedPickup] = useState(false);
  const [isReachedDropoff, setIsReachedDropoff] = useState(false);
  const [_error, setError] = useState(null)

  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [tempStopData] = useState(null);
  const [showWaypointReached,setShowWaypointReached] = useState(false)
  const [newLegIndex, setNewLegIndex] = useState(0)
  const prevNavLegIndex = useRef(null);
  const [openNavChoiceModal, setOpenNavChoiceModal] = useState(false)
  const [openRouteRetryModal, setOpenRouteRetryModal] = useState(false)

  const [pickUpAlertLoading, setPickUpAlertLoading] = useState(false)

  const [watingTime, setWaitingTime] = useState(0)
  const [isAlertSent, setIsAlertSent] = useState(false)

  const {driverInfo} = usePublicDriverStore();

  const tripsStatus = activeTripData && activeTripData[0]?.status ? activeTripData[0]?.status : "";

  const {
    preTripDone, dentPhotosDone, odometerPhotoDone,
    postTripDone, pendingNavOpen, setPendingNavOpen, reset: resetDriverMedia,
  } = useActingDriverMediaStore();

  // Server-side upload checks (fallback if store was cleared)
  const _bills = activeTripData?.[0]?.bills || {};
  const _prePhotos = _bills.preTripVehiclePhotos;
  const preTripUploadedOnServer = !!(_prePhotos?.front && _prePhotos?.rear && _prePhotos?.leftSide && _prePhotos?.rightSide);
  const dentUploadedOnServer = Array.isArray(_bills.dentPhotos) && _bills.dentPhotos.length > 0;
  const odometerUploadedOnServer = !!_bills.odometerPhoto;
  const _postPhotos = _bills.postTripVehiclePhotos;
  const postTripUploadedOnServer = !!(_postPhotos?.front && _postPhotos?.rear && _postPhotos?.leftSide && _postPhotos?.rightSide);
  const postTripReady = postTripDone || postTripUploadedOnServer;

  // All three must be uploaded before OTP entry is allowed
  const preMediaReady =
    (preTripDone || preTripUploadedOnServer) &&
    (dentPhotosDone || dentUploadedOnServer) &&
    (odometerPhotoDone || odometerUploadedOnServer);

  const [showPreTripWarning, setShowPreTripWarning] = useState(false);
  const [showPostTripWarning, setShowPostTripWarning] = useState(false);

  useEffect(() => {
    if (pendingNavOpen && preTripDone) {
      setPendingNavOpen(false);
      setOpenNavChoiceModal(true);
    }
  }, [preTripDone, pendingNavOpen]);

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
    setOpenNavChoiceModal(true);
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
       showNotification('Background service Not Enabled','Please Enable Foregorund Service before Starting','danger')
    }
  }

  const onStopTimer =()=> {
    driverWaitingTime.stopWaitingTime()
  }

  const handleEndTrip = async (reason, translatedReason) => {
    const _translatedReason = translatedReason || reason;

    if (!userLocation) {
      await locationTask.getCurrentLocation();
      showNotification('Fetching Current Location', '', 'info');
      return;
    }
      setLoading(true);
      if (tripsStatus === 'ACCEPTED') {
        const api = new APIRequest();
        const response = await api.request(`/publicrides/driver/v2/cancelTrip`, 'POST', {tripId:activeTripData[0]?._id, reason: _translatedReason, isBeforePickup: true,  droppedAtLoc: {
          lat: userLocation?.[0],
          lon: userLocation?.[1]
        }}, userInfo.token);
        if (response.success) {
          resetDriverMedia();
          cancelTrip(response)
          firebaselog_onRide('OR_Status(OR_S)', 'OR_S:cancelled_by_driver_before_pickup')
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
        if (!postTripReady) {
          setLoading(false);
          setShowPostTripWarning(true);
          return;
        }
        endTrip();
      } else {
        setLoading(true);
        try {
          const cancelData = {driver_id:userInfo?._id, trip_id:activeTripData?.[0]?._id, response: 'reject'}
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
    resetDriverMedia();
    firebaselog_onRide('OR_Status(OR_S)', isGetFare ? 'OR_S:dropped' : 'OR_S:cancelled_by_driver_after_pickup')
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
      showNotification('Fetching Current Location', '', 'info');
      return;
    }
    if (tripsStatus !== 'PICKEDUP') {
      showNotification(
        t('otp_required', 'OTP verification required'),
        t('please_verify_otp_before_ending', 'Please verify the customer OTP before ending the trip.'),
        'warning',
      );
      return;
    }
    if (!postTripReady) {
      setShowPostTripWarning(true);
      return;
    }
    setFetchLocationDate(true)
    setLoading(true)
  }

  const onReachedPickup = () => {
    if (!preMediaReady) {
      setShowPreTripWarning(true);
      return;
    }
    setModalVisible(true);
  }

  const onReachedPickupAlert = async () => {
     setPickUpAlertLoading(true)
     try {
        const api = new APIRequest();
        const url = `/publicrides/driver/v2/alertPassangerPickup`;
        const payload = {
           driverName: driverInfo?.name,
           tripId: activeTripData[0]?._id,
        };
        const res = await api.request(url, 'POST', payload, userInfo.token);
        if(res.success) {
          setIsAlertSent(true)
        } else {
          showNotification('Something went wrong', res.message, 'danger');
        }
        setPickUpAlertLoading(false)
     }
     catch (error) {
      showNotification('Something went wrong', '', 'danger');
      setPickUpAlertLoading(false)
     }
  }

  // Auto-send "Driver Arrived" push notification when driver reaches pickup location
  useEffect(() => {
    if (isReachedPickup && !isAlertSent && tripsStatus === 'ACCEPTED') {
      onReachedPickupAlert();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReachedPickup]);

  const handleWaypointsConfirm = async () => {
    setIsLoading(true);
    const filterStopNumber = tempStopData ? tempStopData[0] : activeTripData[0];
    const nextStopNumber = filterStopNumber?.stops?.filter(stop => stop.stopUpdated === true).length;
    try {
      const api = new APIRequest();
      const url = `/publicrides/driver/v2/updateWaypointsDriverReached`;
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
          NeNativeModule.endNavigation();
          setStartNavigation(false);
          setDisduration(null);
        setShowWaypointReached(false);
        setModalVisible(false);
        if (nonreachedStops[0]?.waitingTime && nonreachedStops[0]?.waitingTime !== 0) {
           updateStopData(nonreachedStops[0].name, true, 'PICKEDUP', 0, false)
           onStartWating()
        } else {
          setCurrentWaypointIndex(prevIndex => prevIndex + 1);
          updateStopData(nonreachedStops[0].name, true, 'PICKEDUP', 0, true)
        }
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
      const url = `/publicrides/driver/v2/updateWaypointsDriverWaitTime`;
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
        NeNativeModule.endNavigation();
        setStartNavigation(false);
        setDisduration(null);
        setCurrentWaypointIndex(prevIndex => prevIndex + 1);
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
    setOTPLoading(true);
    try{
      const api = new APIRequest();
      const url = `/publicrides/driver/v2/verifyTripOtp`;
      const payload = {
        otp: otp,
        tripId: activeTripData[0]?._id,
      }
      const res = await api.request(url, 'POST', payload, userInfo?.token);
      setOTPLoading(false);
      if(res?.success){
        return true;
      }else{
        showNotification(res?.message, res?.message, 'danger');
        return false;
      }
    }catch(error){
      showNotification('Something went wrong', '', 'danger');
      setOTPLoading(false);
      return false;
    }
  };

  const handleStartTripAfterOTP = () => {
    setModalVisible(false);
    setDirectionPoints(null);
    setDirectionResponse(null);
    setDisduration(null);
    setStartNavigation(false);
    updateStopData(nonreachedStops[0]?.name, true, 'PICKEDUP', 0, true)
    setIsReachedPickup(false);
    setCurrentTripAcceptedTime(new Date().getTime());
    firebaselog_onRide('OR_Status(OR_S)', 'OR_S:pickedup')
    setTripDetails(null)
  };

  const handlePickupConfirm = async (otp) => {
    if (otp.length !== 4) {
      showNotification('Please enter the correct OTP', '', 'danger');
      return false;
    }
    const success = await verifyOTP(otp);
    if (success) {
      setDisduration(null);
      NeNativeModule.endNavigation();
    }
    return success;
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
  }, [tripsStatus, activeTripData, appStateVisible, tripDetails]);

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
      _lat,
      _lon,
      _remainingDistance,
      _remainingDuration,
      _speed,
      ldistance,
      _lduration,
      navLegIndex,
      _bearing,
    ] = disduration?.location;

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

    if (distanceInMeters < 500 && distanceInMeters >= 0) {
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
      firebaselog_onRide('OR_Navigation(OR_N)', 'OR_N:navigation_mode_google')
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
     if (routeLoading?.error) {
      setOpenNavChoiceModal(false);
      setOpenRouteRetryModal(true);
      return;
    }
    firebaselog_onRide('OR_Navigation(OR_N)', 'OR_N:navigation_mode_vm')
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

  const renderRouteRetryModal = () => {
    return (
      <>
        <View style={styles.routeOverlay} pointerEvents="auto">
          <View style={styles.routeErrorBox}>
            <View style={styles.routeIconWrapper}>
              <MaterialCommunityIcons name="alert-circle-outline" size={44} color={Colors.red} />
            </View>
            <Text style={styles.routeErrorText} numberOfLines={2}>
              {t('routeStatus_errorTitle', { defaultValue: 'Failed to fetch route' })}
            </Text>
            <Text style={styles.routeHelperText}>
              {t('routeStatus_helper', { defaultValue: 'Ensure your internet is stable and try again.' })}
            </Text>
            <View style={{flexDirection:'row', gap:8, marginTop:6}}>
              <TouchableOpacity
                style={styles.routeRetryBtn}
                onPress={() => {
                  updateDirectionsPoints();
                  setOpenRouteRetryModal(false);
                }}
              >
                <Text style={styles.routeRetryText}>{t('routeStatus_retry', { defaultValue: 'Try Again' })}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.routeBackBtn}
                onPress={() => setOpenRouteRetryModal(false)}
              >
                <Text style={styles.routeBackText}>{t('routeStatus_back', { defaultValue: 'Back' })}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>
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
              onStartTrip={handleStartTripAfterOTP}
              isLoading={isLoading}
              otpLoading={otpLoading}
              onCancelPress={() => setCancelRideModalVisible(true)}
            />
          </View>
        </KeyboardAvoidingView>
      </BottomSheetPopup>
    );
  };

  const refreshDirections = () => {
    setTripDetails(null);
    updateDirectionsPoints();
  }

  const onRecenter = () => {
    NeNativeModule.recenterNavigation();
  }

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
      {tripsStatus === 'ACCEPTED' && (
        <View style={styles.topBanner}>
          <Text style={styles.topBannerTitle}>{t('navigate_to_pickup', {defaultValue: 'Navigate to Pickup'})}</Text>
          <Text style={styles.topBannerSub}>{nonreachedStops[0]?.address || nonreachedStops[0]?.name || ''}</Text>
        </View>
      )}
      {disduration ? null : (
        <View style={[RouteScreenStyles.mapIconContainer, tripsStatus === 'ACCEPTED' && {top: 100}]}>
          <TrackingMapIcons markersData={directionPoints} refreshDirections={()=>refreshDirections()} />
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
          {tripsStatus === 'ACCEPTED' && (
            <View style={styles.actingDriverPickupSheet}>
              {!isReachedPickup ? (
                <View style={styles.pickupSheet}>
                  <Text style={styles.pickupSheetTitle}>Pickup</Text>
                  <Text style={styles.pickupSheetAddress}>{nonreachedStops[0]?.address || nonreachedStops[0]?.name || ''}</Text>
                  
                  {disduration && (
                    <Text style={styles.pickupSheetStats}>
                      {DateTimeFormatter.convertSecondsToReadable(disduration?.location[3], true)} • {disduration?.location[2] < 1000 ? Math.round(disduration?.location[2]) + ' m' : utils.metersToKilometers(disduration?.location[2])?.toFixed(2) + ' km'}
                    </Text>
                  )}
                  <View style={styles.pickupSheetDivider} />
                  <TouchableOpacity 
                    style={styles.pickupSheetBtn}
                    onPress={() => onStartNavigationPress()}
                  >
                    <Text style={styles.pickupSheetBtnTxt}>{t('start_navigate', {defaultValue: 'Start Navigate'})}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.pickupSheetBtn, {backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E53935', marginTop: 10}]}
                    onPress={() => setCancelRideModalVisible(true)}
                  >
                    <Text style={[styles.pickupSheetBtnTxt, {color: '#E53935'}]}>{t('cancel_ride', {defaultValue: 'Cancel Ride'})}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.arrivedSheet}>
                  <Text style={styles.arrivedSheetTitle}>Arrived at Pickup Location?</Text>
                  <Text style={styles.arrivedSheetSub}>Verify with customer before starting.</Text>
                  <View style={styles.arrivedBtnRow}>
                    <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${activeTripData[0]?.passangers?.[0]?.phone || activeTripData[0]?.passangerPhone}`)}>
                      <Text style={styles.callBtnTxt}>Call Customer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imHereBtn} onPress={onReachedPickup}>
                      <Text style={styles.imHereBtnTxt}>I'm Here</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[styles.pickupSheetBtn, {backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E53935', marginTop: 10}]}
                    onPress={() => setCancelRideModalVisible(true)}
                  >
                    <Text style={[styles.pickupSheetBtnTxt, {color: '#E53935'}]}>{t('cancel_ride', {defaultValue: 'Cancel Ride'})}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {tripsStatus !== 'ACCEPTED' && (
            <>
              {loading && <FullScreenLoader />}
         {
            !disduration && tripsStatus !== "COMPLETED" ?
                (hasLocationPermission && (Platform.OS === 'android' && Platform.Version <= 28 ? true : hasBackgroundLocationPermission) &&
                hasNotificationPermission)&& (
                  <TouchableOpacity disabled={routeLoading?.loading && routeLoading?.message !== 'initialState'} style={styles.navBtn} onPress={() => onStartNavigationPress()}>
                    {routeLoading?.loading && routeLoading?.message !== 'initialState'? <ActivityIndicator size="small" color={Colors.white} /> :
                    <>
                    <MaterialCommunityIcons name="navigation-variant-outline" size={20} color={Colors.white} />
                    <Text style={styles.navBtnTxt}>{t('start_navigation')}</Text>
                    </>}

                  </TouchableOpacity>
                )
              : null
          }
          {watingTime > 0 &&
          <View style={styles.waitingCard}>
            <View style={styles.waitingTopRow}>
              <View style={styles.waitingIconCircle}>
                <MaterialCommunityIcons name="timer-sand" size={18} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.waitingLabel}>{t('waiting_time')}</Text>
                <Text style={styles.waitingTimer}>{DateTimeFormatter.formatSecondsToDuration(watingTime)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.stopTimerBtn} onPress={()=>onStopTimer()}>
              <Feather name="square" size={14} color={Colors.white} />
              <Text style={styles.stopTimerBtnTxt}>{t('stop_timer')}</Text>
            </TouchableOpacity>
          </View>
          }
          {tripsStatus !== 'ACCEPTED' && showWaypointReached && watingTime <= 0 &&
          <View style={styles.reachedBtnWrap}>
            <TouchableOpacity style={styles.reachedBtn} onPress={()=>onReachedStop()}>
              <MaterialCommunityIcons name="map-marker-check" size={22} color={Colors.white} />
              <View>
                <Text style={styles.reachedBtnTitle}>{t('reached')} {nonreachedStops[0]?.name}</Text>
                <Text style={styles.reachedBtnSub}>{t('press_to_update_status')}</Text>
              </View>
            </TouchableOpacity>
            </View>
           }
             {disduration && (
              <View style={styles.durationBar}>
                <View style={styles.durationInfoWrap}>
                  <View style={styles.durationChip}>
                    <Feather name="map-pin" size={13} color={Colors.periwinkle} />
                    <Text style={styles.durationChipTxt}>
                      {disduration?.location[2] < 1000 ? Math.round(disduration?.location[2]) + ' m' : utils.metersToKilometers(disduration?.location[2])?.toFixed(2) + ' km'}
                    </Text>
                  </View>
                  <View style={styles.durationChip}>
                    <Feather name="clock" size={13} color={Colors.periwinkle} />
                    <Text style={styles.durationChipTxt}>
                      {DateTimeFormatter.convertSecondsToReadable(disduration?.location[3], true)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.recenterBtn} onPress={()=>onRecenter()}>
                  <Feather name="navigation-2" size={16} color={Colors.white} />
                  <Text style={styles.recenterBtnText}>Re-center</Text>
                </TouchableOpacity>
              </View>
            )}
          {tripsStatus === 'ACCEPTED' &&
          <ArrivedPickUpLocation
          pickUpAlertLoading={pickUpAlertLoading}
          isAlertSent={isAlertSent}
          onReachedPickupAlert={onReachedPickupAlert}
           onReachedPickup={onReachedPickup}/>
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
          <ActingDriverMediaButtons />
          <TripDetails activeTripData={activeTripData} setModalVisible={setCancelRideModalVisible} />
          <ActingDriverTripInfo trip={activeTripData?.[0]} />

          <AddressComponent
              percentage={0}
              waypoints={activeTripData[0]?.stops}
              deviceLocation={null}
              isPublicRides={true}
            />

            {isReachedDropoff? (
             <></>
            ):(
            <ModalFooter setCancelRideModalVisible={setCancelRideModalVisible} activeTripData={activeTripData} />
            )}
            </>
          )}

        </CustomeBottomSheet>
      )}
        {(modalVisible && !cancelRideModalVisible) && renderPickUpModal()}
        {cancelRideModalVisible && <CancelRideModal modalVisible={cancelRideModalVisible} setModalVisible={setCancelRideModalVisible} callCancelRide={handleEndTrip} loading={loading} tripData={activeTripData?.[0]}/>}
        <Modal transparent animationType="fade" visible={showPreTripWarning} onRequestClose={() => setShowPreTripWarning(false)}>
          <View style={styles.preTripOverlay}>
            <View style={styles.preTripWarningBox}>
              <Text style={styles.preTripWarningTitle}>Uploads Required Before OTP</Text>
              <Text style={styles.preTripWarningMsg}>
                Please complete all required uploads before entering the OTP:
              </Text>
              <View style={styles.preTripCheckList}>
                <View style={styles.preTripCheckRow}>
                  <MaterialCommunityIcons
                    name={(preTripDone || preTripUploadedOnServer) ? 'check-circle' : 'circle-outline'}
                    size={18}
                    color={(preTripDone || preTripUploadedOnServer) ? '#4CAF50' : '#E65100'}
                  />
                  <Text style={[styles.preTripCheckTxt, (preTripDone || preTripUploadedOnServer) && styles.preTripCheckDone]}>
                    Vehicle condition photos (Front, Rear, Left, Right)
                  </Text>
                </View>
                <View style={styles.preTripCheckRow}>
                  <MaterialCommunityIcons
                    name={(dentPhotosDone || dentUploadedOnServer) ? 'check-circle' : 'circle-outline'}
                    size={18}
                    color={(dentPhotosDone || dentUploadedOnServer) ? '#4CAF50' : '#E65100'}
                  />
                  <Text style={[styles.preTripCheckTxt, (dentPhotosDone || dentUploadedOnServer) && styles.preTripCheckDone]}>
                    Dent / damage photos
                  </Text>
                </View>
                <View style={styles.preTripCheckRow}>
                  <MaterialCommunityIcons
                    name={(odometerPhotoDone || odometerUploadedOnServer) ? 'check-circle' : 'circle-outline'}
                    size={18}
                    color={(odometerPhotoDone || odometerUploadedOnServer) ? '#4CAF50' : '#E65100'}
                  />
                  <Text style={[styles.preTripCheckTxt, (odometerPhotoDone || odometerUploadedOnServer) && styles.preTripCheckDone]}>
                    Odometer reading photo
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.preTripUploadBtn}
                activeOpacity={0.8}
                onPress={() => {
                  setShowPreTripWarning(false);
                  setStackScreen('DriverVehiclePhotosScreen');
                }}>
                <MaterialCommunityIcons name="camera-plus-outline" size={18} color={Colors.white} />
                <Text style={styles.preTripUploadBtnTxt}>Upload Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal transparent animationType="fade" visible={showPostTripWarning} onRequestClose={() => setShowPostTripWarning(false)}>
          <View style={styles.preTripOverlay}>
            <View style={styles.preTripWarningBox}>
              <Text style={styles.preTripWarningTitle}>{t('post_trip_photos_required')}</Text>
              <Text style={styles.preTripWarningMsg}>
                {t('please_upload_post_trip_photos_before_ending_ride', { defaultValue: 'Please upload the 4 post-trip vehicle condition photos before ending the ride. This helps record the vehicle\'s condition at trip end.' })}
              </Text>
              <TouchableOpacity
                style={styles.preTripUploadBtn}
                activeOpacity={0.8}
                onPress={() => {
                  setShowPostTripWarning(false);
                  setStackScreen('DriverVehiclePhotosScreen');
                }}>
                <MaterialCommunityIcons name="camera-plus-outline" size={18} color={Colors.white} />
                <Text style={styles.preTripUploadBtnTxt}>{t('upload_photos_now')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {openNavChoiceModal && renderOpenNavChoiceModal()}
        {openRouteRetryModal && renderRouteRetryModal()}
    </View>
    </>
  );
};

export default ActingDriverOnRide;

const styles = StyleSheet.create({
    preTripOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    preTripWarningBox: {
      backgroundColor: Colors.white,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 360,
      gap: 10,
    },
    preTripWarningTitle: {
      fontSize: 17,
      fontFamily: Fonts.semi_bold,
      color: '#BF360C',
      textAlign: 'center',
    },
    preTripWarningMsg: {
      fontSize: 13,
      fontFamily: Fonts.regular,
      color: '#555',
      textAlign: 'center',
      lineHeight: 20,
    },
    preTripUploadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: Colors.periwinkle,
      paddingVertical: 13,
      borderRadius: 10,
      marginTop: 6,
    },
    preTripUploadBtnTxt: { fontSize: 14, fontFamily: Fonts.semi_bold, color: Colors.white },
    preTripSkipBtn: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    preTripSkipTxt: { fontSize: 13, fontFamily: Fonts.medium, color: '#999' },
    preTripCheckList: {
      gap: 10,
      marginVertical: 8,
      width: '100%',
    },
    preTripCheckRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    preTripCheckTxt: {
      fontSize: 13,
      fontFamily: Fonts.medium,
      color: '#E65100',
      flex: 1,
    },
    preTripCheckDone: {
      color: '#4CAF50',
      textDecorationLine: 'line-through',
    },
    navBtn:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'center',
      alignSelf:'center',
      gap:8,
      backgroundColor:Colors.periwinkle,
      paddingVertical:12,
      paddingHorizontal:28,
      borderRadius:28,
      marginVertical:10,
      elevation:4,
      shadowColor:Colors.periwinkle,
      shadowOffset:{width:0,height:3},
      shadowOpacity:0.35,
      shadowRadius:6,
    },
    navBtnTxt:{
      fontFamily:Fonts.semi_bold,
      fontSize:14,
      color:Colors.white,
    },
    waitingCard:{
      width:'90%',
      alignSelf:'center',
      backgroundColor:'#FFF8E1',
      borderRadius:14,
      padding:14,
      marginVertical:10,
      elevation:3,
      shadowColor:'#000',
      shadowOffset:{width:0,height:1},
      shadowOpacity:0.1,
      shadowRadius:4,
      borderLeftWidth:4,
      borderLeftColor:'#FFC107',
    },
    waitingTopRow:{
      flexDirection:'row',
      alignItems:'center',
      gap:12,
      marginBottom:12,
    },
    waitingIconCircle:{
      width:36,
      height:36,
      borderRadius:18,
      backgroundColor:'#FFC107',
      alignItems:'center',
      justifyContent:'center',
    },
    waitingLabel:{
      fontFamily:Fonts.regular,
      fontSize:11,
      color:'#9E8600',
    },
    waitingTimer:{
      fontFamily:Fonts.semi_bold,
      fontSize:20,
      color:Colors.black,
    },
    stopTimerBtn:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'center',
      gap:6,
      backgroundColor:'#E53935',
      paddingVertical:8,
      borderRadius:8,
    },
    stopTimerBtnTxt:{
      fontFamily:Fonts.medium,
      fontSize:13,
      color:Colors.white,
    },
    reachedBtnWrap:{
      paddingHorizontal:16,
      marginVertical:8,
    },
    reachedBtn:{
      flexDirection:'row',
      alignItems:'center',
      gap:12,
      backgroundColor:Colors.periwinkle,
      paddingVertical:14,
      paddingHorizontal:18,
      borderRadius:14,
      elevation:4,
      shadowColor:Colors.periwinkle,
      shadowOffset:{width:0,height:2},
      shadowOpacity:0.3,
      shadowRadius:5,
    },
    reachedBtnTitle:{
      fontFamily:Fonts.semi_bold,
      fontSize:14,
      color:Colors.white,
    },
    reachedBtnSub:{
      fontFamily:Fonts.regular,
      fontSize:11,
      color:'rgba(255,255,255,0.8)',
      marginTop:2,
    },
    durationBar:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between',
      width:'92%',
      alignSelf:'center',
      backgroundColor:'#F5F5FF',
      borderRadius:14,
      paddingVertical:10,
      paddingHorizontal:14,
      marginVertical:10,
      elevation:2,
      shadowColor:'#000',
      shadowOffset:{width:0,height:1},
      shadowOpacity:0.06,
      shadowRadius:3,
      borderWidth:1,
      borderColor:'#E8E8F0',
    },
    durationInfoWrap:{
      flexDirection:'row',
      backgroundColor:Colors.yellow_xlight,
      elevation:2,
      borderRadius:20,
      gap:5,
    },
    durationChip:{
      flexDirection:'row',
      alignItems:'center',
      gap:3,
      borderColor:Colors.black,
      paddingVertical:2,
      paddingHorizontal:6,
      borderRadius:20,
      borderLeftWidth:1
    },
    durationChipTxt:{
      fontFamily:Fonts.medium,
      fontSize:13,
      color:Colors.black,
    },
    recenterBtn:{
      borderRadius:18,
      backgroundColor:Colors.periwinkle,
      alignItems:'center',
      justifyContent:'center',
      elevation:2,
      flexDirection:'row',
      paddingVertical:5,
      paddingHorizontal:14,
      gap:4
    },
    recenterBtnText:{
      fontSize:12,
      fontFamily:Fonts.medium,
      color:Colors.white,
    },
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
      backgroundColor:Colors.grey_light
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
      borderColor:Colors.grey_light,
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
    },
    routeOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    routeErrorBox: {
      width: '75%',
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      elevation: 4,
    },
    routeIconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    routeErrorText: {
      color: Colors.red,
      fontSize: 14,
      marginBottom: 8,
      fontFamily:Fonts.regular
    },
    routeHelperText: {
      color: Colors.grey_dark,
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 8,
      fontFamily:Fonts.regular
    },
    routeRetryBtn: {
      backgroundColor: Colors.grey_dark,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    routeRetryText: {
      color: 'white',
      fontSize: 14,
      fontFamily:Fonts.semi_bold
    },
    routeBackBtn: {
      backgroundColor: 'transparent',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: Colors.grey_dark,
    },
    routeBackText: {
      color: Colors.grey_dark,
      fontSize: 14,
      fontFamily:Fonts.semi_bold
    },
  topBanner: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    backgroundColor: '#352166',
    borderRadius: 16,
    padding: 16,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  topBannerTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
  },
  topBannerSub: {
    color: '#FFFFFF',
    fontFamily: Fonts.regular,
    fontSize: 13,
    marginTop: 4,
  },
  actingDriverPickupSheet: {
    padding: 16,
  },
  pickupSheetTitle: {
    fontFamily: Fonts.semi_bold,
    fontSize: 14,
    color: Colors.black,
  },
  pickupSheetAddress: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.black,
    marginTop: 4,
  },
  pickupSheetStats: {
    fontFamily: Fonts.semi_bold,
    fontSize: 14,
    color: Colors.black,
    marginTop: 16,
  },
  pickupSheetDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  pickupSheetBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupSheetBtnTxt: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.black,
  },
  arrivedSheetTitle: {
    fontFamily: Fonts.semi_bold,
    fontSize: 18,
    color: Colors.black,
    textAlign: 'center',
  },
  arrivedSheetSub: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  arrivedBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  callBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#352166',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtnTxt: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#352166',
  },
  imHereBtn: {
    flex: 1,
    backgroundColor: '#352166',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imHereBtnTxt: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#FFFFFF',
  },
})

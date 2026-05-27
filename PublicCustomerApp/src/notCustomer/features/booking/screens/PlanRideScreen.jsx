import {Text, TouchableOpacity, View, StyleSheet, ScrollView, ActivityIndicator, BackHandler, Modal, TextInput} from 'react-native';
import React, {useCallback, useState,useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'react-native-calendars';
import NavBar from '../../../components/NavBar';
import {useStackScreenStore} from '../../../store/useStackScreenStore';
import {addLocation} from '../../../styles/AddLocationStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import { VEHICLE_TYPE_OPTIONS, VEHICLE_TYPE_ICON } from '../../myVehicles/constants/vehicleData';
import DatePicker from 'react-native-date-picker';


import DashedLine from '../../../components/Common/DashedLine';

import AnimatedBottomSheetWrapper from '../../shared/component/AnimatedBottomSheetWrapper';

import ScheduleContainer from '../../../screens/SearchLocation/ScheduleContainer';
import { height, utils } from '../../../utils/Utils';
import { colors } from '../../../constants/constants';
import Contactsheet from '../components/planride/Contactsheet';
import useUserInfoStore from '../../../../common/store/useUserInfoStore';
import RideLocationSetBox from '../components/planride/RideLocationSetBox';
import RideLocationPlanSetBox from '../components/planride/RideLocationPlanSetBox';
import FavPlacesItem from '../components/planride/FavPlacesItem';
import HistoryContainer from '../../shared/component/HistoryCard';
import useRideBookingLocationStore from '../store/useRideBookingLocationStore';
import LocationTypes from '../types/LocationTypes.json';
import { useDebouncedAPICall } from '../../../hooks/useDebounce';
import useRideBookingInfo from '../store/useRideBookingInfo';
import { Fonts } from '../../../constants/constants';
import AdaptiveText from '../../../components/Common/AdaptiveText';
import { openFeedback } from '../../../utils/feedback';
import { getCustomerTrips } from '../../../API/EndPoints/EndPoints';

const formatCalendarDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addMonths = (date, months) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

const getInclusiveDateRangeDays = (startDateString, endDateString) => {
  if (!startDateString) {
    return 0;
  }

  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString || startDateString);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  const dayMilliseconds = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.floor((endDate - startDate) / dayMilliseconds) + 1);
};

const getDateRangeMarkedDates = (startDateString, endDateString) => {
  if (!startDateString) {
    return {};
  }

  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString || startDateString);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const markedDates = {};
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const dateKey = formatCalendarDate(cursor);
    markedDates[dateKey] = {
      color: colors.black,
      textColor: colors.white,
      startingDay: dateKey === startDateString,
      endingDay: dateKey === (endDateString || startDateString),
    };
    cursor.setDate(cursor.getDate() + 1);
  }

  return markedDates;
};

const PlanRideScreen = ({selectedDestination,showScheduleTime,fromSavedPlaces,mode,vehicle}) => {
  const { t } = useTranslation();
  const {userdetails,userFavPlaces} = useUserInfoStore();
  const {goBack,setStackScreen,goBackToScreen} = useStackScreenStore();
  const {setRideStartLocation,setRideEndLocation,addRideWayPoint,resetRideBookingLocation,rideStartLocation,rideEndLocation} = useRideBookingLocationStore()

  const {
    setPassangerDetails,
    setRideBookMode,
    rideBookMode,
    passangerDetails,
    setIsScheduledTrip,
    scheduleDateTime,
    setScheduleDateTime,
    setFemaleDriverOnly,
    setSafeNightRides,
    actingDriverVehicle,
    setActingDriverVehicle,
    setActingDriverHours,
    actingDriverHours,
    actingDriverMaxSpeed,
    setActingDriverMaxSpeed,
    actingDriverNotifyEvents,
    setActingDriverNotifyEvents,
    actingDriverAccommodation,
    setActingDriverAccommodation,
    actingDriverFood,
    setActingDriverFood,
    actingDriverKidsOnBoard,
    setActingDriverKidsOnBoard,
    actingDriverElderlyOnBoard,
    setActingDriverElderlyOnBoard,
    actingDriverItinerary,
    setActingDriverItinerary,
    bookingTab,
    setBookingTab,
    durationRangeStart,
    setDurationRangeStart,
    durationRangeEnd,
    setDurationRangeEnd,
    isFlexibleDuration,
    setIsFlexibleDuration,
    todayDurationOption,
    setTodayDurationOption,
    todayCustomHours,
    setTodayCustomHours,
    tomorrowDurationOption,
    setTomorrowDurationOption,
    tomorrowCustomHours,
    setTomorrowCustomHours,
    tomorrowStartTime,
    setTomorrowStartTime,
    customStartTime,
    setCustomStartTime,
  } = useRideBookingInfo();

  const [showTripFor, setShowTripFor] = useState(false);
  const [showScheduleContainer, setShowScheduleContainer] = useState(false);
  const [selectedFavPlace, setSelectedFavPlace] = useState(null);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isItineraryExpanded, setIsItineraryExpanded] = useState(false);
  const [pendingRangeStart, setPendingRangeStart] = useState(null);
  const [pendingRangeEnd, setPendingRangeEnd] = useState(null);
  const [showCustomCalendarModal, setShowCustomCalendarModal] = useState(false);
  const todayDate = formatCalendarDate(new Date());
  const maxCustomDate = formatCalendarDate(addMonths(new Date(), 2));
  const selectedDurationDays = getInclusiveDateRangeDays(durationRangeStart, durationRangeEnd);
  const pendingDurationDays = getInclusiveDateRangeDays(pendingRangeStart, pendingRangeEnd);
  const durationRangeLabel = durationRangeStart
    ? `${utils.formatDate(durationRangeStart, 'DD MMM')} - ${utils.formatDate(durationRangeEnd || durationRangeStart, 'DD MMM')}`
    : '';
  const isActingDriverMode = mode === 'ACTING_DRIVER';

  const [showTomorrowTimePicker, setShowTomorrowTimePicker] = useState(false);
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);

  const getDatesInRange = (startDateStr, endDateStr) => {
    if (!startDateStr) return [];
    const dates = [];
    let curr = new Date(startDateStr);
    const end = new Date(endDateStr || startDateStr);
    while (curr <= end) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const addDays = (date, days) => {
    const res = new Date(date);
    res.setDate(res.getDate() + days);
    return res;
  };

  const getItineraryDates = () => {
    const today = new Date();
    if (bookingTab === 'TODAY') {
      if (todayDurationOption === '3_DAYS') {
        return [
          formatCalendarDate(today),
          formatCalendarDate(addDays(today, 1)),
          formatCalendarDate(addDays(today, 2)),
        ];
      }
    } else if (bookingTab === 'TOMORROW') {
      const tomorrow = addDays(today, 1);
      if (tomorrowDurationOption === '2_DAYS') {
        return [
          formatCalendarDate(tomorrow),
          formatCalendarDate(addDays(tomorrow, 1)),
        ];
      } else if (tomorrowDurationOption === '3_DAYS') {
        return [
          formatCalendarDate(tomorrow),
          formatCalendarDate(addDays(tomorrow, 1)),
          formatCalendarDate(addDays(tomorrow, 2)),
        ];
      }
    } else if (bookingTab === 'CUSTOM') {
      if (durationRangeStart && selectedDurationDays > 1) {
        return getDatesInRange(durationRangeStart, durationRangeEnd);
      }
    }
    return [];
  };

  const itineraryDates = getItineraryDates();
  const shouldShowItinerary = itineraryDates.length > 0;

  const [lastRidePrefs, setLastRidePrefs] = useState(null);
  const [showApplyPrefsModal, setShowApplyPrefsModal] = useState(false);

  const applyLastRidePreferences = () => {
    if (!lastRidePrefs) return;
    if (lastRidePrefs.maxSpeed) setActingDriverMaxSpeed(String(lastRidePrefs.maxSpeed));
    setActingDriverKidsOnBoard(!!lastRidePrefs.kidsOnBoard);
    setActingDriverElderlyOnBoard(!!lastRidePrefs.elderlyOnBoard);
    setActingDriverNotifyEvents(!!lastRidePrefs.notifyEvents);
    setActingDriverAccommodation(!!lastRidePrefs.accommodation);
    setActingDriverFood(!!lastRidePrefs.food);
    setShowApplyPrefsModal(false);
  };

  const handleItineraryLocationClick = (dateStr) => {
    const props = {
      onPickLocationResultCallback: (pickedLocation) => {
        if (pickedLocation) {
          const newItinerary = { ...(actingDriverItinerary || {}), [dateStr]: pickedLocation };
          setActingDriverItinerary(newItinerary);
        }
        goBack();
      },
      locationType: LocationTypes.WAYPOINT_LOCATION,
      isFromRidePointsSelection: false,
      searchBar: true,
      focusSearchOnMount: true,
      label: t('select_location', 'Select Location'),
      buttonLabel: t('select_location', 'Select Location'),
    };
    setStackScreen('PickLocationScreen', props);
  };

  useEffect(() => {
    if (!isActingDriverMode) return;

    const fetchLastRidePreferences = async () => {
      try {
        const response = await getCustomerTrips({
          page: 1,
          limit: 10,
        });

        if (response.success && response.trips?.length > 0) {
          const lastActingDriverTrip = response.trips.find(t => 
            t.isActingDriverTrip && 
            (t.kidsOnBoard || t.elderlyOnBoard || t.maxSpeed || t.accommodation || t.food || t.notifyEvents)
          );

          if (lastActingDriverTrip) {
            setLastRidePrefs({
              maxSpeed: lastActingDriverTrip.maxSpeed,
              kidsOnBoard: lastActingDriverTrip.kidsOnBoard,
              elderlyOnBoard: lastActingDriverTrip.elderlyOnBoard,
              notifyEvents: lastActingDriverTrip.notifyEvents,
              accommodation: lastActingDriverTrip.accommodation,
              food: lastActingDriverTrip.food,
            });
            setShowApplyPrefsModal(true);
          }
        }
      } catch (err) {
        console.log('Failed to fetch last ride preferences', err);
      }
    };

    fetchLastRidePreferences();
  }, [isActingDriverMode]);

  const isTripDurationSelected = !isActingDriverMode || (bookingTab === 'CUSTOM' ? !!durationRangeStart : true);
  const hasRequiredLocations = isActingDriverMode ? !!rideStartLocation : (!!rideStartLocation && !!rideEndLocation);
  const isContinueButtonVisible = hasRequiredLocations && isTripDurationSelected;

  useEffect(() => {
    if (mode !== 'ACTING_DRIVER') return;

    if (bookingTab === 'TODAY') {
      setIsScheduledTrip(false);
      setScheduleDateTime(null);
      
      if (todayDurationOption === 'FLEXIBLE') {
        setIsFlexibleDuration(true);
        setActingDriverHours(null);
      } else {
        setIsFlexibleDuration(false);
        if (todayDurationOption === '1_HOUR') {
          setActingDriverHours(1);
        } else if (todayDurationOption === '3_DAYS') {
          setActingDriverHours(72);
        } else {
          setActingDriverHours(todayCustomHours);
        }
      }
    } 
    else if (bookingTab === 'TOMORROW') {
      setIsScheduledTrip(true);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setScheduleDateTime({
        date: tomorrow.toISOString(),
        time: tomorrowStartTime
      });

      if (tomorrowDurationOption === 'FLEXIBLE') {
        setIsFlexibleDuration(true);
        setActingDriverHours(null);
      } else {
        setIsFlexibleDuration(false);
        if (tomorrowDurationOption === '1_DAY') {
          setActingDriverHours(24);
        } else if (tomorrowDurationOption === '2_DAYS') {
          setActingDriverHours(48);
        } else if (tomorrowDurationOption === '3_DAYS') {
          setActingDriverHours(72);
        } else {
          setActingDriverHours(tomorrowCustomHours);
        }
      }
    } 
    else if (bookingTab === 'CUSTOM') {
      if (durationRangeStart) {
        const startDate = new Date(durationRangeStart);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        
        if (startDate > today) {
          setIsScheduledTrip(true);
          setScheduleDateTime({
            date: startDate.toISOString(),
            time: customStartTime
          });
        } else {
          setIsScheduledTrip(false);
          setScheduleDateTime(null);
        }
        
        if (isFlexibleDuration) {
          setActingDriverHours(null);
        } else {
          const days = getInclusiveDateRangeDays(durationRangeStart, durationRangeEnd);
          setActingDriverHours(days * 24);
        }
      } else {
        setActingDriverHours(null);
      }
    }
  }, [
    mode,
    bookingTab,
    todayDurationOption,
    todayCustomHours,
    tomorrowDurationOption,
    tomorrowCustomHours,
    tomorrowStartTime,
    customStartTime,
    durationRangeStart,
    durationRangeEnd,
    isFlexibleDuration
  ]);

  const onPickDatesPress = () => {
    setPendingRangeStart(durationRangeStart);
    setPendingRangeEnd(durationRangeEnd);
    setShowCustomCalendarModal(true);
  };

  const onCustomDurationDateSelect = (day) => {
    const selectedDate = day.dateString;

    if (!pendingRangeStart || (pendingRangeStart && pendingRangeEnd)) {
      setPendingRangeStart(selectedDate);
      setPendingRangeEnd(null);
      return;
    }

    if (selectedDate < pendingRangeStart) {
      setPendingRangeStart(selectedDate);
      setPendingRangeEnd(null);
      return;
    }

    setPendingRangeEnd(selectedDate);
  };

  const onCustomCalendarCancel = () => {
    setPendingRangeStart(null);
    setPendingRangeEnd(null);
    setShowCustomCalendarModal(false);
  };

  const onCustomCalendarConfirm = () => {
    if (!pendingRangeStart) {
      return;
    }
    const rangeEnd = pendingRangeEnd || pendingRangeStart;
    const selectedDays = getInclusiveDateRangeDays(pendingRangeStart, rangeEnd);
    setDurationRangeStart(pendingRangeStart);
    setDurationRangeEnd(rangeEnd);
    setActingDriverHours(selectedDays * 24);
    setShowCustomCalendarModal(false);
  };

  // Handle selectedDestination from SavedPlacesScreen
  useEffect(() => {
    if (selectedDestination) {
      setRideEndLocation(selectedDestination);
    }
  }, [selectedDestination]);

  const onBackPress = async () => {
    console.log("onBackPress")
    resetRideBookingLocation()
    setScheduleDateTime(null)
    setIsScheduledTrip(false)
    setFemaleDriverOnly(false)
    setSafeNightRides(false)
    setActingDriverVehicle(null)
    setActingDriverHours(null)
    goBack();
  };


 
  const onFeedbackPress = () => {
    const startName = (rideStartLocation && (rideStartLocation.name || rideStartLocation.address)) || '';
    const endName = (rideEndLocation && (rideEndLocation.name || rideEndLocation.address)) || '';
    const pickupCoords = rideStartLocation && rideStartLocation.latitude != null && rideStartLocation.longitude != null
      ? `${rideStartLocation.latitude},${rideStartLocation.longitude}` : '';
    const dropCoords = rideEndLocation && rideEndLocation.latitude != null && rideEndLocation.longitude != null
      ? `${rideEndLocation.latitude},${rideEndLocation.longitude}` : '';
    openFeedback({
      screenName: 'PlanRideScreen',
      params: { rideMode: rideBookMode, tripStartName: startName, tripEndName: endName, pickupCoords, dropCoords },
      initialValues: { tripStartName: startName, tripEndName: endName, pickupCoords, dropCoords },
      onSubmit: async () => {
        // hook to send feedback if needed
      },
    });
  };

  const handleFavouriteLocationPress = useCallback((location) => {
    if(location.locationData){
      setSelectedFavPlace(location)
      setRideEndLocation(location.locationData)
    }
  }, []);

 

  useEffect(() => {
    if (mode === 'ACTING_DRIVER' && vehicle) {
      setActingDriverVehicle(vehicle);
    }
  }, [mode, vehicle]);

  useEffect(() => {
    if(mode == 'SCHEDULE_TRIP'){
      console.log("Schedule ride mode detected");
      setShowScheduleContainer(true)
    }
    if(mode == 'FEMALE_DRIVER'){
      setFemaleDriverOnly(true)
    }
    if(mode == 'NIGHT_TRIP'){
      setSafeNightRides(true)
    }
    if(mode == 'MULTI_STOP'){
      onAddWaypoint()
      
    }
    if(mode == 'FAMILY_RIDE'){
      onTripForPress()
      
    }
    return () => {
      setIsContinuing(false);
    };
  }, []);

  useEffect(() => {
    const handleHardwareBackPress = () => {
      onBackPress();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleHardwareBackPress);
    return () => {
      subscription.remove();
    };
  }, [onBackPress]);


  const oncloseDateTime = () => {
    setShowScheduleContainer(false)
    if (scheduleDateTime) return 
  }

  const onConfirmDateTime = () => {
    setShowScheduleContainer(false)
  }

  const onTripForPress = () => {
    setShowTripFor(true)
  }

  const onAddWaypoint = () => {
    setStackScreen('WaypointScreen',{fromPlanScreen:true});
  }

  const HandsetRideLocation = (item,type)=>{
    if (type === LocationTypes.START_LOCATION){
      setRideStartLocation(item)
    }else if (type === LocationTypes.DESTINATION_LOCATION){
      setRideEndLocation(item)
    }else if (type === LocationTypes.WAYPOINT_LOCATION){
      addRideWayPoint(item)
    }
  }

  const handleLocationClick=(type)=>{
    console.log("handleLocationClick",type)
    
    handlePickLocation(type)
    // onSearchClick(type)
  }

  // Debounced pick location callback
  const debouncedPickLocationCallback = (item, type) => {
    // First update the store with the selected location
    HandsetRideLocation(item, type);

    const isStart = type === LocationTypes.START_LOCATION;
    // Derive what start/end will be after this selection to avoid using stale values
    const nextStartLocation = isStart ? item : rideStartLocation;
    const nextEndLocation = isStart ? rideEndLocation : item;
    console.log("nextStartLocation,nextEndLocation",nextStartLocation,nextEndLocation)
    // // If we have both start & end after this selection and it's not a start selection, go straight to booking
    if ( nextStartLocation && nextEndLocation && isTripDurationSelected && !nextStartLocation?.currentLocation) {
      goBack()
      setStackScreen(mode === 'ACTING_DRIVER' ? 'BookActingDriverScreen' : 'BookRideScreen', {});
      return; // Skip going back, we are moving forward
    }

    // Otherwise just go back to the previous screen
    goBack();
  };

  const onPickLocationResultCallback = (item,type) =>{
    debouncedPickLocationCallback(item,type)
    
  }
   const confirmPickUpCurrentLocation = () => {
    console.log("confirmPickUpCurrentLocation",fromSavedPlaces)
    const props ={
      onPickLocationResultCallback:onPickLocationResultCallback,
      locationType:LocationTypes.START_LOCATION,
      label:t('locate_pickup_location'),
      buttonLabel:t('button_locate_pickup_location'),
      isFromRidePointsSelection:true,
      searchBar:true,
      currentLocation:true,
      focusSearchOnMount:false,
    }
    setStackScreen('PickLocationScreen', props);
  }

  const handlePickLocation = (type=null) =>{

    const props ={
      onPickLocationResultCallback:onPickLocationResultCallback,
      locationType:type?type:LocationTypes.DESTINATION_LOCATION,
      label: type === LocationTypes.DESTINATION_LOCATION ? t('locate_drop_location') : type === LocationTypes.WAYPOINT_LOCATION ? t('locate_stop') : t('locate_pickup_location'),
      buttonLabel: type === LocationTypes.DESTINATION_LOCATION ? t('button_locate_drop_location') : type === LocationTypes.WAYPOINT_LOCATION ? t('button_locate_stop') : t('button_locate_pickup_location'),
      isFromRidePointsSelection:true,
      searchBar:true,
      focusSearchOnMount:true,
    }

    if(type === LocationTypes.START_LOCATION && rideStartLocation){
      props.defaultLocation = rideStartLocation
    }
    if(type === LocationTypes.DESTINATION_LOCATION && rideEndLocation){
      props.defaultLocation = rideEndLocation
    }
    
    setStackScreen('PickLocationScreen', props)
  }

  // Debounced history location callback
  const debouncedHistoryCallback = useDebouncedAPICall((item) => {
    HandsetRideLocation(item,LocationTypes.DESTINATION_LOCATION)
  }, 300);

  const handleHistoryLocationClick=(item)=>{
    debouncedHistoryCallback(item)
    const nextEndLocation = item;
    const canOpenBooking = rideStartLocation && nextEndLocation && isTripDurationSelected;
    if(canOpenBooking){
    setStackScreen(mode === 'ACTING_DRIVER' ? 'BookActingDriverScreen' : 'BookRideScreen',{})
    }

  }

   useEffect(() => {
    if (userdetails){
      if(!rideBookMode){
        setRideBookMode('MYSELF')
        setPassangerDetails({name:userdetails.name,phone:userdetails.phone})
      }
    }
    
    if( rideEndLocation && !rideStartLocation && fromSavedPlaces ){
      confirmPickUpCurrentLocation()
    }
    
    if(showScheduleTime){
      setShowScheduleContainer(true)
    }
  }, [fromSavedPlaces, rideEndLocation, rideStartLocation, showScheduleTime, userdetails, rideBookMode, scheduleDateTime]);
 

  const handleContinue = () => {  
     setIsContinuing(true); 
     if(rideStartLocation?.currentLocation){
      const props={
        onPickLocationResultCallback:onPickLocationResultCallback,
        locationType:LocationTypes.START_LOCATION,
        label:t('button_locate_pickup_location'),
        buttonLabel:t('button_locate_pickup_location'),
        isFromRidePointsSelection:true,
        searchBar:true,
        currentLocation:true,
        defaultLocation:rideStartLocation,
        focusSearchOnMount:false,
        isConfirmLocation:true,
        isActingDriver: mode === 'ACTING_DRIVER',
        selectedVehicle: actingDriverVehicle,
      }
      setStackScreen('PickLocationScreen', props);
      return;
     }
     setStackScreen(mode === 'ACTING_DRIVER' ? 'BookActingDriverScreen' : 'BookRideScreen', {});
    //  Vibration.vibrate(100);
  }



  return (
    <>
      


      <View style={styles.PlanRideScreen}>
        <NavBar
          withBg
          onBackPress={onBackPress}
          title={t('plan_your_trip')}
          feedbackIcon={true}
          onrightIconPress={onFeedbackPress}
        />

        <ScrollView 
          style={{ flex: 1}} 
          contentContainerStyle={{paddingBottom: height*0.2}}
          keyboardShouldPersistTaps="handled"
        >
          <View style={addLocation.rideSelectionContainer}>
            <TouchableOpacity style={[addLocation.rideSelection]} onPress={() => onTripForPress()}>
              <Ionicons name="person" size={18} color={colors.white} />
             { <Text style={[addLocation.rideSelectionTxt, {width:'60%',justifyContent:'center',textAlign:'center'}]} numberOfLines={1} ellipsizeMode="tail">{rideBookMode === 'MYSELF' ? t('myself') : passangerDetails?.name || t('others')}</Text>}
              <Ionicons name="chevron-down" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
          <RideLocationSetBox 
            onAddWaypoint={onAddWaypoint}
            onLocationClick={handleLocationClick}
            hideDestination={false}
            dayHeader={shouldShowItinerary ? {
              label: t('day_1', 'Day 1'),
              date: utils.formatDate(itineraryDates[0], 'DD MMM, ddd'),
            } : null}
          />

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favPlacesContainer}
            style={styles.favPlacesScrollView}
          >  
            {userFavPlaces?.map((item,index)=>(
              <FavPlacesItem key={index} data={item} onPress={() => {
                handleFavouriteLocationPress(item)
              }}  selected={selectedFavPlace?.label === item.label} />
            ))}
            <FavPlacesItem data={{label:t('add_favorite_places')}} onPress={() => {
              setStackScreen("SavedPlacesScreen",{})
            }} type="add" />
          </ScrollView>
          <DashedLine style={styles.dottedLine} />
            {/* Acting Driver: selected vehicle + duration */}
        {mode === 'ACTING_DRIVER' && actingDriverVehicle && (
          <View style={styles.actingDriverPanel}>
            {/* Vehicle row */}
            <View style={styles.actingVehicleRow}>
              <View style={styles.actingVehicleIconContainer}>
                <Ionicons
                  name={VEHICLE_TYPE_ICON[actingDriverVehicle.type] || 'car-outline'}
                  size={24}
                  color={colors.black}
                />
              </View>
              <View style={styles.actingVehicleInfo}>
                <Text style={styles.actingVehicleReg}>{actingDriverVehicle.regNo}</Text>
                <Text style={styles.actingVehicleMeta}>
                  {[
                    VEHICLE_TYPE_OPTIONS.find(o => o.value === actingDriverVehicle.type)?.label,
                    actingDriverVehicle.make,
                    actingDriverVehicle.model,
                    actingDriverVehicle.year,
                  ].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <View style={styles.changeVehicleContainer}>
                <TouchableOpacity
                  style={styles.changeVehicleBtn}
                  onPress={() => { goBackToScreen('ActingDriverVehicleSelectScreen', {}); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.changeVehicleText}>{t('change', 'Change')}</Text>
                </TouchableOpacity>
                {!isTripDurationSelected && (
                  <Text style={styles.durationRequiredText}>{t('required', 'Required')}</Text>
                )}
              </View>
            </View>

            {/* Duration selector */}
            <View style={styles.durationSection}>
              <Text style={styles.durationLabel}>{t('booking_options', 'Booking Options')}</Text>
              
              <View style={styles.optionTabsRow}>
                <TouchableOpacity
                  style={[styles.optionTab, bookingTab === 'TODAY' && styles.optionTabSelected]}
                  onPress={() => setBookingTab('TODAY')}
                >
                  <Text style={[styles.optionTabText, bookingTab === 'TODAY' && styles.optionTabTextSelected]}>
                    {t('today', 'Today')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionTab, bookingTab === 'TOMORROW' && styles.optionTabSelected]}
                  onPress={() => setBookingTab('TOMORROW')}
                >
                  <Text style={[styles.optionTabText, bookingTab === 'TOMORROW' && styles.optionTabTextSelected]}>
                    {t('tomorrow', 'Tomorrow')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionTab, bookingTab === 'CUSTOM' && styles.optionTabSelected]}
                  onPress={() => setBookingTab('CUSTOM')}
                >
                  <Text style={[styles.optionTabText, bookingTab === 'CUSTOM' && styles.optionTabTextSelected]}>
                    {t('custom_dates', 'Custom Dates')}
                  </Text>
                </TouchableOpacity>
              </View>

              {bookingTab === 'TODAY' && (
                <View style={styles.tabContentContainer}>
                  <Text style={styles.subLabel}>{t('select_duration', 'Select Duration')}</Text>
                  <View style={styles.chipsRow}>
                    <TouchableOpacity
                      style={[styles.chipButton, todayDurationOption === '1_HOUR' && styles.chipButtonSelected]}
                      onPress={() => setTodayDurationOption('1_HOUR')}
                    >
                      <Text style={[styles.chipText, todayDurationOption === '1_HOUR' && styles.chipTextSelected]}>
                        {t('1_hour_only', '1 Hour only')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.chipButton, todayDurationOption === '3_DAYS' && styles.chipButtonSelected]}
                      onPress={() => setTodayDurationOption('3_DAYS')}
                    >
                      <Text style={[styles.chipText, todayDurationOption === '3_DAYS' && styles.chipTextSelected]}>
                        {t('now_to_3_days', 'Now to 3 Days')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.chipButton, todayDurationOption === 'CUSTOM_HOURS' && styles.chipButtonSelected]}
                      onPress={() => setTodayDurationOption('CUSTOM_HOURS')}
                    >
                      <Text style={[styles.chipText, todayDurationOption === 'CUSTOM_HOURS' && styles.chipTextSelected]}>
                        {t('custom_hours', 'Custom Hours')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.chipButton, todayDurationOption === 'FLEXIBLE' && styles.chipButtonSelected]}
                      onPress={() => setTodayDurationOption('FLEXIBLE')}
                    >
                      <Text style={[styles.chipText, todayDurationOption === 'FLEXIBLE' && styles.chipTextSelected]}>
                        {t('flexible_duration', 'Flexible (Decide Later)')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {todayDurationOption === 'CUSTOM_HOURS' && (
                    <View style={styles.stepperContainer}>
                      <Text style={styles.stepperLabel}>{t('booking_duration_hours', 'Duration (Hours)')}</Text>
                      <View style={styles.stepperRow}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setTodayCustomHours(prev => Math.max(1, prev - 1))}
                        >
                          <Ionicons name="remove-circle-outline" size={24} color={colors.black} />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{todayCustomHours} {todayCustomHours === 1 ? t('hour', 'Hour') : t('hours', 'Hours')}</Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setTodayCustomHours(prev => Math.min(24, prev + 1))}
                        >
                          <Ionicons name="add-circle-outline" size={24} color={colors.black} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {todayDurationOption === 'FLEXIBLE' && (
                    <View style={styles.flexibleInfoCard}>
                      <Ionicons name="information-circle-outline" size={16} color="#0288D1" />
                      <Text style={styles.flexibleInfoText}>
                        {t('flexible_info_desc', 'Pay per hour after trip completion. Total fare will be computed on actual driving hours.')}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {bookingTab === 'TOMORROW' && (
                <View style={styles.tabContentContainer}>
                  <View style={styles.timePickerRow}>
                    <Text style={styles.subLabel}>{t('select_start_time', 'Select Start Time')}</Text>
                    <TouchableOpacity
                      style={styles.timeSelectBtn}
                      onPress={() => setShowTomorrowTimePicker(true)}
                    >
                      <Text style={styles.timeSelectText}>
                        {utils.timestampTo12HourFormat(tomorrowStartTime)}
                      </Text>
                      <Ionicons name="time-outline" size={16} color={colors.black} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.subLabel}>{t('select_duration', 'Select Duration')}</Text>
                  <View style={styles.chipsRow}>
                    <TouchableOpacity
                      style={[styles.chipButton, tomorrowDurationOption === 'HOURLY' && styles.chipButtonSelected]}
                      onPress={() => setTomorrowDurationOption('HOURLY')}
                    >
                      <Text style={[styles.chipText, tomorrowDurationOption === 'HOURLY' && styles.chipTextSelected]}>
                        {t('hourly_booking', 'Hourly')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.chipButton, tomorrowDurationOption === '1_DAY' && styles.chipButtonSelected]}
                      onPress={() => setTomorrowDurationOption('1_DAY')}
                    >
                      <Text style={[styles.chipText, tomorrowDurationOption === '1_DAY' && styles.chipTextSelected]}>
                        {t('1_day', '1 Day')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.chipButton, tomorrowDurationOption === '2_DAYS' && styles.chipButtonSelected]}
                      onPress={() => setTomorrowDurationOption('2_DAYS')}
                    >
                      <Text style={[styles.chipText, tomorrowDurationOption === '2_DAYS' && styles.chipTextSelected]}>
                        {t('2_days', '2 Days')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.chipButton, tomorrowDurationOption === '3_DAYS' && styles.chipButtonSelected]}
                      onPress={() => setTomorrowDurationOption('3_DAYS')}
                    >
                      <Text style={[styles.chipText, tomorrowDurationOption === '3_DAYS' && styles.chipTextSelected]}>
                        {t('3_days', '3 Days')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.chipButton, tomorrowDurationOption === 'FLEXIBLE' && styles.chipButtonSelected]}
                      onPress={() => setTomorrowDurationOption('FLEXIBLE')}
                    >
                      <Text style={[styles.chipText, tomorrowDurationOption === 'FLEXIBLE' && styles.chipTextSelected]}>
                        {t('flexible_duration', 'Flexible (Decide Later)')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {tomorrowDurationOption === 'HOURLY' && (
                    <View style={styles.stepperContainer}>
                      <Text style={styles.stepperLabel}>{t('booking_duration_hours', 'Duration (Hours)')}</Text>
                      <View style={styles.stepperRow}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setTomorrowCustomHours(prev => Math.max(1, prev - 1))}
                        >
                          <Ionicons name="remove-circle-outline" size={24} color={colors.black} />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{tomorrowCustomHours} {tomorrowCustomHours === 1 ? t('hour', 'Hour') : t('hours', 'Hours')}</Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setTomorrowCustomHours(prev => Math.min(24, prev + 1))}
                        >
                          <Ionicons name="add-circle-outline" size={24} color={colors.black} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {tomorrowDurationOption === 'FLEXIBLE' && (
                    <View style={styles.flexibleInfoCard}>
                      <Ionicons name="information-circle-outline" size={16} color="#0288D1" />
                      <Text style={styles.flexibleInfoText}>
                        {t('flexible_info_desc', 'Pay per hour after trip completion. Total fare will be computed on actual driving hours.')}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {bookingTab === 'CUSTOM' && (
                <View style={styles.tabContentContainer}>
                  <Text style={styles.subLabel}>{t('pick_date_range', 'Pick Date Range')}</Text>
                  <TouchableOpacity
                    style={styles.pickDatesButton}
                    onPress={onPickDatesPress}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pickDatesText}>
                      {durationRangeLabel || t('select_date_range', 'Select Date Range')}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color={colors.black} />
                  </TouchableOpacity>

                  {durationRangeStart && (
                    <>
                      <View style={styles.timePickerRow}>
                        <Text style={styles.subLabel}>{t('select_start_time', 'Select Start Time')}</Text>
                        <TouchableOpacity
                          style={styles.timeSelectBtn}
                          onPress={() => setShowCustomTimePicker(true)}
                        >
                          <Text style={styles.timeSelectText}>
                            {utils.timestampTo12HourFormat(customStartTime)}
                          </Text>
                          <Ionicons name="time-outline" size={16} color={colors.black} />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.subLabel}>{t('booking_type', 'Booking Type')}</Text>
                      <View style={styles.chipsRow}>
                        <TouchableOpacity
                          style={[styles.chipButton, !isFlexibleDuration && styles.chipButtonSelected]}
                          onPress={() => setIsFlexibleDuration(false)}
                        >
                          <Text style={[styles.chipText, !isFlexibleDuration && styles.chipTextSelected]}>
                            {t('fixed_days', 'Fixed Days')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.chipButton, isFlexibleDuration && styles.chipButtonSelected]}
                          onPress={() => setIsFlexibleDuration(true)}
                        >
                          <Text style={[styles.chipText, isFlexibleDuration && styles.chipTextSelected]}>
                            {t('flexible_duration', 'Flexible (Decide Later)')}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {!isFlexibleDuration ? (
                        selectedDurationDays ? (
                          <View style={styles.durationOutputContainer}>
                            <Text style={styles.durationOutputLabel}>{t('duration', 'Duration')}</Text>
                            <Text style={styles.durationOutputText}>
                              {selectedDurationDays} {selectedDurationDays === 1 ? t('day', 'Day') : t('days', 'Days')} ({actingDriverHours} {t('hours', 'Hours')})
                            </Text>
                          </View>
                        ) : null
                      ) : (
                        <View style={styles.flexibleInfoCard}>
                          <Ionicons name="information-circle-outline" size={16} color="#0288D1" />
                          <Text style={styles.flexibleInfoText}>
                            {t('flexible_info_desc', 'Pay per hour after trip completion. Total fare will be computed on actual driving hours.')}
                          </Text>
                        </View>
                      )}

                    </>
                  )}
                </View>
              )}
            </View>

            {/* Plan Daily Itinerary Section */}
            {shouldShowItinerary && (
              <View style={styles.itinerarySection}>
                <TouchableOpacity
                  style={styles.itineraryCollapsibleHeader}
                  onPress={() => setIsItineraryExpanded(!isItineraryExpanded)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itineraryHeaderLeft}>
                    <Text style={[styles.itineraryHeading, { marginBottom: 0 }]}>
                      {t('plan_daily_itinerary', 'Plan Daily Itinerary (Optional)')}
                    </Text>
                  </View>
                  <Ionicons
                    name={isItineraryExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>

                {isItineraryExpanded && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.itinerarySub}>
                      {t('plan_daily_itinerary_desc', 'Add places or travel plans for each day so your driver can prepare.')}
                    </Text>

                    {rideStartLocation && (
                      <View style={styles.rideStartInfoCard}>
                        <View style={styles.rideStartDot} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rideStartLabel}>{t('ride_starts_from', 'Ride starts from')}</Text>
                          <Text style={styles.rideStartAddress} numberOfLines={2}>
                            {utils.formatAddressName(rideStartLocation)}
                          </Text>
                        </View>
                      </View>
                    )}
                    {itineraryDates.map((dateStr, idx) => {
                      const formattedDate = utils.formatDate(dateStr, 'DD MMM, ddd');
                      return (
                        <View key={dateStr} style={styles.itineraryItem}>
                          <View style={styles.itineraryDayHeader}>
                            <View style={styles.itineraryDayBadge}>
                              <Text style={styles.itineraryDayBadgeText}>{t('day_n', `Day ${idx + 1}`)}</Text>
                            </View>
                            <Text style={styles.itineraryDateText}>{formattedDate}</Text>
                          </View>
                          
                          <RideLocationPlanSetBox
                            location={actingDriverItinerary?.[dateStr]}
                            onLocationClick={() => handleItineraryLocationClick(dateStr)}
                          />
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* Driver Configurations */}
            <View style={styles.configSection}>
              <Text style={styles.durationLabel}>{t('driver_preferences', 'Ride Preferences')}</Text>
              
              <View style={styles.configItemRow}>
                <Text style={styles.configLabel}>{t('max_speed', 'Max Speed Limit (km/h)')}</Text>
                <TextInput
                  style={styles.speedInput}
                  value={actingDriverMaxSpeed}
                  onChangeText={setActingDriverMaxSpeed}
                  placeholder="e.g. 80"
                  keyboardType="numeric"
                  placeholderTextColor={colors.grey_dark}
                />
              </View>

              {/* Accommodation & Food Options */}
              <View style={styles.provisionsRow}>
                <TouchableOpacity 
                  style={[
                    styles.provisionCard,
                    actingDriverAccommodation && styles.provisionCardSelected
                  ]}
                  onPress={() => setActingDriverAccommodation(!actingDriverAccommodation)}
                  activeOpacity={0.85}
                >
                  <View style={styles.provisionHeader}>
                    <View style={[styles.provisionIconContainer, actingDriverAccommodation && styles.provisionIconContainerSelected]}>
                      <Ionicons 
                        name="bed" 
                        size={18} 
                        color={actingDriverAccommodation ? colors.black : colors.grey_dark} 
                      />
                    </View>
                    <Ionicons 
                      name={actingDriverAccommodation ? "checkmark-circle" : "ellipse-outline"} 
                      size={20} 
                      color={actingDriverAccommodation ? (colors.green || '#4CAF50') : colors.grey_light} 
                    />
                  </View>
                  <Text style={[
                    styles.provisionLabel,
                    actingDriverAccommodation && styles.provisionLabelSelected
                  ]}>
                    {t('accommodation', 'Accommodation')}
                  </Text>
                  <Text style={styles.provisionSubLabel}>
                    {t('accommodation_desc', 'For overnight stay')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.provisionCard,
                    actingDriverFood && styles.provisionCardSelected
                  ]}
                  onPress={() => setActingDriverFood(!actingDriverFood)}
                  activeOpacity={0.85}
                >
                  <View style={styles.provisionHeader}>
                    <View style={[styles.provisionIconContainer, actingDriverFood && styles.provisionIconContainerSelected]}>
                      <Ionicons 
                        name="fast-food" 
                        size={18} 
                        color={actingDriverFood ? colors.black : colors.grey_dark} 
                      />
                    </View>
                    <Ionicons 
                      name={actingDriverFood ? "checkmark-circle" : "ellipse-outline"} 
                      size={20} 
                      color={actingDriverFood ? (colors.green || '#4CAF50') : colors.grey_light} 
                    />
                  </View>
                  <Text style={[
                    styles.provisionLabel,
                    actingDriverFood && styles.provisionLabelSelected
                  ]}>
                    {t('food', 'Food')}
                  </Text>
                  <Text style={styles.provisionSubLabel}>
                    {t('food_desc', 'Meals/Allowance')}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.prefCardRow, actingDriverNotifyEvents && styles.prefCardRowActive]}
                onPress={() => setActingDriverNotifyEvents(!actingDriverNotifyEvents)}
                activeOpacity={0.8}
              >
                <View style={[styles.prefIconBox, actingDriverNotifyEvents && styles.prefIconBoxActive]}>
                  <Ionicons 
                    name="notifications-outline" 
                    size={20} 
                    color={actingDriverNotifyEvents ? colors.black : colors.grey_dark} 
                  />
                </View>
                <View style={styles.prefTextContainer}>
                  <Text style={styles.prefTitle}>{t('notify_events_title', 'Status Updates')}</Text>
                  <Text style={styles.prefSub}>{t('notify_events_desc', 'Get alerts if driver takes a break or gets stuck in traffic > 5 mins')}</Text>
                </View>
                <Ionicons 
                  name={actingDriverNotifyEvents ? "checkmark-circle" : "ellipse-outline"} 
                  size={22} 
                  color={actingDriverNotifyEvents ? (colors.green || '#4CAF50') : colors.grey_light} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.prefCardRow, actingDriverKidsOnBoard && styles.prefCardRowActive]}
                onPress={() => setActingDriverKidsOnBoard(!actingDriverKidsOnBoard)}
                activeOpacity={0.8}
              >
                <View style={[styles.prefIconBox, actingDriverKidsOnBoard && styles.prefIconBoxActive]}>
                  <Ionicons 
                    name="people-outline" 
                    size={20} 
                    color={actingDriverKidsOnBoard ? colors.black : colors.grey_dark} 
                  />
                </View>
                <View style={styles.prefTextContainer}>
                  <Text style={styles.prefTitle}>{t('kids_on_board_title', 'Children on Board')}</Text>
                  <Text style={styles.prefSub}>{t('kids_on_board_desc', 'Driver will maintain safer speeds and be extra attentive')}</Text>
                </View>
                <Ionicons 
                  name={actingDriverKidsOnBoard ? "checkmark-circle" : "ellipse-outline"} 
                  size={22} 
                  color={actingDriverKidsOnBoard ? (colors.green || '#4CAF50') : colors.grey_light} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.prefCardRow, actingDriverElderlyOnBoard && styles.prefCardRowActive]}
                onPress={() => setActingDriverElderlyOnBoard(!actingDriverElderlyOnBoard)}
                activeOpacity={0.8}
              >
                <View style={[styles.prefIconBox, actingDriverElderlyOnBoard && styles.prefIconBoxActive]}>
                  <Ionicons 
                    name="heart-outline" 
                    size={20} 
                    color={actingDriverElderlyOnBoard ? colors.black : colors.grey_dark} 
                  />
                </View>
                <View style={styles.prefTextContainer}>
                  <Text style={styles.prefTitle}>{t('elderly_on_board_title', 'Elderly Passengers')}</Text>
                  <Text style={styles.prefSub}>{t('elderly_on_board_desc', 'Driver will avoid sudden braking and help getting in/out')}</Text>
                </View>
                <Ionicons 
                  name={actingDriverElderlyOnBoard ? "checkmark-circle" : "ellipse-outline"} 
                  size={22} 
                  color={actingDriverElderlyOnBoard ? (colors.green || '#4CAF50') : colors.grey_light} 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <HistoryContainer selectCallback={handleHistoryLocationClick} bottomborder = {false} fromSearchScreen={true}/>
        </ScrollView>

        <View style={styles.pickLocationContainer}> 
          {/* <PickLocationButton
          onPress={handlePickLocation}
       
          /> */}
         {
          isContinueButtonVisible && (
            <TouchableOpacity style={[styles.continueButton, isContinuing && styles.continueButtonDisabled]} onPress={()=>{  handleContinue()}} disabled={isContinuing}>
              {isContinuing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AdaptiveText style={[styles.continueButtonText, isContinuing && styles.continueButtonTextDisabled]} color={colors.white}>{t('continue')}</AdaptiveText>
              )}
            </TouchableOpacity>
          )
         }
        </View>
       

        {showScheduleContainer &&
          <AnimatedBottomSheetWrapper onClose={oncloseDateTime}>
            <ScheduleContainer oncloseDateTime={oncloseDateTime} onConfirmDateTime={onConfirmDateTime} />
          </AnimatedBottomSheetWrapper>
        }
        {showTripFor &&
          <AnimatedBottomSheetWrapper onClose={() => setShowTripFor(false)}>
            <Contactsheet onClose={() => setShowTripFor(false)} onConfirm={() => setShowTripFor(false)} />
          </AnimatedBottomSheetWrapper>
        }
        <Modal
          visible={showCustomCalendarModal}
          transparent
          animationType="fade"
          onRequestClose={onCustomCalendarCancel}
        >
          <View style={styles.calendarModalOverlay}>
            <View style={styles.calendarModalCard}>
              <Text style={styles.calendarModalTitle}>{t('pick_dates', 'Pick Dates')}</Text>
              <Calendar
                minDate={todayDate}
                maxDate={maxCustomDate}
                onDayPress={onCustomDurationDateSelect}
                markingType="period"
                markedDates={getDateRangeMarkedDates(pendingRangeStart, pendingRangeEnd)}
                hideExtraDays
                enableSwipeMonths
                theme={{
                  calendarBackground: colors.white,
                  textSectionTitleColor: colors.grey_xxdark,
                  todayTextColor: colors.black,
                  dayTextColor: colors.black,
                  monthTextColor: colors.black,
                  textMonthFontFamily: Fonts.medium,
                  textDayFontFamily: Fonts.regular,
                  textDayHeaderFontFamily: Fonts.medium,
                  arrowColor: colors.black,
                }}
              />
              {pendingRangeStart ? (
                <View style={styles.durationOutputContainer}>
                  <Text style={styles.durationOutputLabel}>{t('duration', 'Duration')}</Text>
                  <Text style={styles.durationOutputText}>{pendingDurationDays}</Text>
                </View>
              ) : null}
              <View style={styles.calendarModalActions}>
                <TouchableOpacity
                  style={styles.calendarCancelButton}
                  onPress={onCustomCalendarCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calendarCancelText}>{t('cancel', 'Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calendarOkButton, !pendingRangeStart && styles.calendarOkButtonDisabled]}
                  onPress={onCustomCalendarConfirm}
                  activeOpacity={0.7}
                  disabled={!pendingRangeStart}
                >
                  <Text style={styles.calendarOkText}>{t('ok', 'OK')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Tomorrow Time Picker Modal */}
        {showTomorrowTimePicker && (
          <Modal
            visible={showTomorrowTimePicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowTomorrowTimePicker(false)}
          >
            <View style={styles.timePickerModalOverlay}>
              <View style={styles.timePickerModalCard}>
                <Text style={styles.timePickerModalTitle}>{t('select_start_time', 'Select Start Time')}</Text>
                <DatePicker
                  mode="time"
                  theme="light"
                  date={tomorrowStartTime}
                  is24hourSource="locale"
                  onDateChange={setTomorrowStartTime}
                />
                <View style={styles.timePickerModalActions}>
                  <TouchableOpacity
                    style={styles.timePickerOkButton}
                    onPress={() => setShowTomorrowTimePicker(false)}
                  >
                    <Text style={styles.timePickerOkText}>{t('done', 'Done')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Custom Start Time Picker Modal */}
        {showCustomTimePicker && (
          <Modal
            visible={showCustomTimePicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowCustomTimePicker(false)}
          >
            <View style={styles.timePickerModalOverlay}>
              <View style={styles.timePickerModalCard}>
                <Text style={styles.timePickerModalTitle}>{t('select_start_time', 'Select Start Time')}</Text>
                <DatePicker
                  mode="time"
                  theme="light"
                  date={customStartTime}
                  is24hourSource="locale"
                  onDateChange={setCustomStartTime}
                />
                <View style={styles.timePickerModalActions}>
                  <TouchableOpacity
                    style={styles.timePickerOkButton}
                    onPress={() => setShowCustomTimePicker(false)}
                  >
                    <Text style={styles.timePickerOkText}>{t('done', 'Done')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Apply Last Ride Preferences Modal */}
        <Modal
          visible={showApplyPrefsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowApplyPrefsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.premiumAlertBox}>
              <View style={styles.alertHeader}>
                <View style={styles.alertIconBg}>
                  <Ionicons name="sparkles-outline" size={24} color={colors.black} />
                </View>
                <Text style={styles.alertTitle}>
                  {t('apply_previous_prefs', 'Apply Last Ride Preferences?')}
                </Text>
              </View>
              
              <Text style={styles.alertDesc}>
                {t('apply_previous_prefs_desc', 'We found preferences from your recent acting driver ride. Would you like to apply them to this booking?')}
              </Text>

              <View style={styles.prefsListContainer}>
                {lastRidePrefs?.maxSpeed ? (
                  <View style={styles.prefTag}>
                    <Ionicons name="speedometer-outline" size={14} color={colors.black} />
                    <Text style={styles.prefTagText}>{t('max_speed_limit_n', 'Max Speed: {{n}} km/h', { n: lastRidePrefs.maxSpeed })}</Text>
                  </View>
                ) : null}
                {lastRidePrefs?.kidsOnBoard ? (
                  <View style={styles.prefTag}>
                    <Ionicons name="people-outline" size={14} color={colors.black} />
                    <Text style={styles.prefTagText}>{t('kids_on_board', 'Children on Board')}</Text>
                  </View>
                ) : null}
                {lastRidePrefs?.elderlyOnBoard ? (
                  <View style={styles.prefTag}>
                    <Ionicons name="heart-outline" size={14} color={colors.black} />
                    <Text style={styles.prefTagText}>{t('elderly_passengers', 'Elderly Passengers')}</Text>
                  </View>
                ) : null}
                {lastRidePrefs?.accommodation ? (
                  <View style={styles.prefTag}>
                    <Ionicons name="bed-outline" size={14} color={colors.black} />
                    <Text style={styles.prefTagText}>{t('accommodation', 'Accommodation')}</Text>
                  </View>
                ) : null}
                {lastRidePrefs?.food ? (
                  <View style={styles.prefTag}>
                    <Ionicons name="restaurant-outline" size={14} color={colors.black} />
                    <Text style={styles.prefTagText}>{t('food', 'Food')}</Text>
                  </View>
                ) : null}
                {lastRidePrefs?.notifyEvents ? (
                  <View style={styles.prefTag}>
                    <Ionicons name="notifications-outline" size={14} color={colors.black} />
                    <Text style={styles.prefTagText}>{t('status_updates', 'Status Updates')}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.alertActionsRow}>
                <TouchableOpacity
                  style={styles.alertCancelBtn}
                  onPress={() => setShowApplyPrefsModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.alertCancelText}>{t('no_thanks', 'No, thanks')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.alertApplyBtn}
                  onPress={applyLastRidePreferences}
                  activeOpacity={0.7}
                >
                  <Text style={styles.alertApplyText}>{t('apply', 'Apply')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      
    </>
  );
};

PlanRideScreen.propTypes = {
  selectedDestination: PropTypes.object,
  showScheduleTime: PropTypes.bool,
  fromSavedPlaces: PropTypes.bool,
  mode: PropTypes.string,
  vehicle: PropTypes.object,
};

const styles = StyleSheet.create({
  PlanRideScreen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
  },
  actingDriverPanel: {
    marginHorizontal: 10,
    marginTop: 14,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  actingVehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  actingVehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actingVehicleInfo: {
    flex: 1,
  },
  actingVehicleReg: {
    fontSize: 14,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
  },
  actingVehicleMeta: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
    marginTop: 2,
  },
  changeVehicleContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  changeVehicleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  changeVehicleText: {
    fontSize: 12,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
  },
  durationRequiredText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#E53935',
  },
  durationSection: {
    gap: 8,
  },
  durationLabel: {
    fontSize: 13,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
    marginBottom: 2,
  },
  pickDatesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  pickDatesText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  durationUnitRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationUnitBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  durationUnitBtnSelected: {
    borderColor: colors.black,
    backgroundColor: colors.black,
  },
  durationUnitText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  durationUnitTextSelected: {
    color: colors.white,
  },
  durationChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  durationChipSelected: {
    borderColor: colors.black,
    backgroundColor: colors.black,
  },
  durationChipText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  durationChipTextSelected: {
    color: colors.white,
  },
  durationOutputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginTop: 8,
  },
  durationOutputLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.grey_xxdark,
  },
  durationOutputText: {
    fontSize: 14,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
  },
  configSection: {
    gap: 12,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  configItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  configLabel: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
    flex: 1,
  },
  speedInput: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 70,
    textAlign: 'right',
    fontFamily: Fonts.semibold || Fonts.medium,
    fontSize: 14,
    color: colors.black,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  provisionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
  },
  provisionCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  provisionCardSelected: {
    borderColor: colors.black || '#000000',
    backgroundColor: '#F5F5F5',
  },
  provisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  provisionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  provisionIconContainerSelected: {
    backgroundColor: '#E0E0E0',
  },
  provisionLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: colors.grey_xxdark,
  },
  provisionLabelSelected: {
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
  },
  provisionSubLabel: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: colors.grey_dark,
    marginTop: 2,
  },
  checkboxLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: colors.black,
    marginLeft: 10,
    flex: 1,
    lineHeight: 16,
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  calendarModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: 14,
  },
  calendarModalTitle: {
    fontSize: 16,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
    marginBottom: 8,
  },
  calendarModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  calendarCancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  calendarCancelText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  calendarOkButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: colors.black,
  },
  calendarOkButtonDisabled: {
    opacity: 0.45,
  },
  calendarOkText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.white,
  },
  favPlacesContainer: {
    flexDirection: 'row',
    paddingVertical:10,
    gap:10,
    paddingHorizontal:5
    
  },
  favPlacesScrollView: {
    flexGrow: 0,
  },
  tripCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 5,
    marginTop: 10,
    marginBottom: 12,
  },
  tripCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 6,
    borderRadius: 22,
    backgroundColor: colors.white,
    flexShrink: 1,
  },
  tripCategoryButtonSelected: {
    backgroundColor: colors.black,
    paddingHorizontal: 18,
    borderBottomWidth: 2,
    borderBottomColor: '#00C853',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  tripCategoryTitle: {
    fontSize: 15,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.grey_xxdark,
  },
  tripCategoryTitleSelected: {
    color: colors.white,
  },
  tripCategoryInfoButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dottedLine:{
    marginVertical: 5,
    marginHorizontal: 10,
  },
  pickLocationContainer: {
    position:"absolute",
    bottom:0,
    width:"100%",
    alignSelf:'center',
    paddingHorizontal: 5,
    backgroundColor:'white'
   
  },
  continueButton:{
    backgroundColor:"#000",
    width:"100%",
    padding:15,
    borderRadius:10,
    alignItems:'center',
    justifyContent:'center',
    marginVertical:10,
  },
  continueButtonText:{
    color:"#fff",
    fontSize:16,
    fontFamily:Fonts.medium,
  },
  continueButtonDisabled:{
    backgroundColor:'#757575',
    opacity:0.6,
  },
  continueButtonTextDisabled:{
    color:'#BDBDBD',
  },
  optionTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 10,
  },
  optionTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  optionTabSelected: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionTabText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.grey_dark,
  },
  optionTabTextSelected: {
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
  },
  tabContentContainer: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  subLabel: {
    fontSize: 12,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.grey_xxdark,
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: colors.white,
  },
  chipButtonSelected: {
    borderColor: colors.black,
    backgroundColor: colors.black,
  },
  chipText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  chipTextSelected: {
    color: colors.white,
  },
  stepperContainer: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 6,
  },
  stepperLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: colors.grey_dark,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperBtn: {
    padding: 4,
  },
  stepperValue: {
    fontSize: 15,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
    minWidth: 80,
    textAlign: 'center',
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  timeSelectText: {
    fontSize: 13,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
  },
  timePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timePickerModalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  timePickerModalTitle: {
    fontSize: 16,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
    marginBottom: 16,
  },
  timePickerModalActions: {
    marginTop: 16,
    width: '100%',
  },
  timePickerOkButton: {
    backgroundColor: colors.black,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePickerOkText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: Fonts.semibold || Fonts.medium,
  },
  flexibleInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E1F5FE',
    borderWidth: 1,
    borderColor: '#B3E5FC',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  flexibleInfoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#0277BD',
    lineHeight: 16,
  },
  prefCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 10,
    gap: 12,
  },
  prefCardRowActive: {
    borderColor: colors.black || '#000000',
    backgroundColor: '#FFFFFF',
  },
  prefIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefIconBoxActive: {
    backgroundColor: '#E2E8F0',
  },
  prefTextContainer: {
    flex: 1,
    gap: 2,
  },
  prefTitle: {
    fontSize: 13,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
  },
  prefSub: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.grey_dark,
    lineHeight: 15,
  },
  itinerarySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 16,
  },
  itineraryCollapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itineraryHeaderLeft: {
    flex: 1,
  },
  itineraryHeading: {
    fontSize: 14,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
    marginBottom: 4,
  },
  itinerarySub: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.grey_dark,
    marginBottom: 16,
    lineHeight: 16,
  },
  rideStartInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  rideStartDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
    flexShrink: 0,
  },
  rideStartLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#16A34A',
    marginBottom: 2,
  },
  rideStartAddress: {
    fontSize: 13,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: '#15803D',
  },
  itineraryItem: {
    marginBottom: 16,
    gap: 8,
  },
  itineraryDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itineraryDayBadge: {
    backgroundColor: colors.black,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  itineraryDayBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.white,
  },
  itineraryDateText: {
    fontSize: 13,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
  },
  itineraryInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: colors.black,
    minHeight: 60,
    textAlignVertical: 'top',
    fontFamily: Fonts.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  premiumAlertBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  alertIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.black,
    flex: 1,
  },
  alertDesc: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.grey_dark,
    lineHeight: 18,
    marginBottom: 16,
  },
  prefsListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  prefTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  prefTagText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  alertActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  alertCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  alertCancelText: {
    fontSize: 13,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.grey_dark,
  },
  alertApplyBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertApplyText: {
    fontSize: 13,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: colors.white,
  },
});

export default PlanRideScreen;

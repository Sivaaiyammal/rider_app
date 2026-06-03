import {Text, TouchableOpacity, View, StyleSheet, ScrollView, ActivityIndicator, BackHandler, Modal, TextInput, Alert, FlatList, StatusBar, Image} from 'react-native';
import React, {useCallback, useState,useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'react-native-calendars';
import NavBar from '../../../components/NavBar';
import {useStackScreenStore} from '../../../store/useStackScreenStore';
import {addLocation} from '../../../styles/AddLocationStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import { VEHICLE_TYPE_OPTIONS, VEHICLE_TYPE_ICON, getStockImage } from '../../myVehicles/constants/vehicleData';
import DatePicker from 'react-native-date-picker';
import LinearGradient from 'react-native-linear-gradient';



import DashedLine from '../../../components/Common/DashedLine';

import AnimatedBottomSheetWrapper from '../../shared/component/AnimatedBottomSheetWrapper';

import ScheduleContainer from '../../../screens/SearchLocation/ScheduleContainer';
import { height, utils } from '../../../utils/Utils';
import { colors, actingDriverColors, ACTING_DRIVER_THEMES } from '../../../constants/constants';
import Contactsheet from '../components/planride/Contactsheet';
import useUserInfoStore from '../../../../common/store/useUserInfoStore';
import RideLocationSetBox from '../components/planride/RideLocationSetBox';
import RideLocationPlanSetBox from '../components/planride/RideLocationPlanSetBox';
import FavPlacesItem from '../components/planride/FavPlacesItem';

import ActingDriverPlanCard from '../components/planride/ActingDriverPlanCard';
import VehicleSelectionModal from '../components/planride/VehicleSelectionModal';
import HistoryContainer from '../../shared/component/HistoryCard';
import useRideBookingLocationStore from '../store/useRideBookingLocationStore';
import LocationTypes from '../types/LocationTypes.json';
import { useDebouncedAPICall } from '../../../hooks/useDebounce';
import useRideBookingInfo from '../store/useRideBookingInfo';
import { Fonts } from '../../../constants/constants';
import AdaptiveText from '../../../components/Common/AdaptiveText';
import { openFeedback } from '../../../utils/feedback';
import { getCustomerTrips, getPassangerVehicles } from '../../../API/EndPoints/EndPoints';

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

const isOutsideTirupur = (item) => {
  if (!item) return false;
  const nameText = (item.name || '').toLowerCase();
  const addressText = (typeof item.address === 'string' ? item.address : (item.address && typeof item.address === 'object' ? JSON.stringify(item.address) : '') || '').toLowerCase();
  const placeNameText = (item.placeName || '').toLowerCase();
  
  const textToSearch = `${nameText} ${addressText} ${placeNameText}`;

  // Direct cities list to verify
  const outsideCities = ['pollachi', 'erode', 'palladam', 'coimbatore', 'dharapuram', 'udumalpet', 'kangeyam', 'karur', 'salem', 'madurai', 'chennai', 'bengaluru', 'bangalore', 'kovai', 'tiruchirappalli', 'trichy'];
  for (const city of outsideCities) {
    if (textToSearch.includes(city)) {
      return true;
    }
  }

  // Also, if it doesn't mention Tirupur or Tiruppur at all (and has something specified), it is outside Tirupur
  const hasContent = nameText || addressText || placeNameText;
  if (hasContent && !textToSearch.includes('tirupur') && !textToSearch.includes('tiruppur')) {
    return true;
  }

  return false;
};


const PlanRideScreen = ({selectedDestination,showScheduleTime,fromSavedPlaces,mode,vehicle}) => {
  const { t } = useTranslation();
  const {userdetails,userFavPlaces} = useUserInfoStore();
  const {goBack,setStackScreen,goBackToScreen,getCurrentScreen} = useStackScreenStore();
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
  const [activeItineraryDay, setActiveItineraryDay] = useState(0);
  const [pendingRangeStart, setPendingRangeStart] = useState(null);
  const [pendingRangeEnd, setPendingRangeEnd] = useState(null);
  const [showCustomCalendarModal, setShowCustomCalendarModal] = useState(false);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
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
      if (durationRangeStart) {
        return getDatesInRange(durationRangeStart, durationRangeEnd);
      }
    }
    return [];
  };

  const handleAddDay = () => {
    const dates = getItineraryDates();
    if (dates.length === 0) return;
    
    const lastDateStr = dates[dates.length - 1];
    const newEnd = formatCalendarDate(addDays(lastDateStr, 1));

    if (bookingTab === 'CUSTOM') {
      setDurationRangeEnd(newEnd);
    } else {
      // Switch to CUSTOM to allow arbitrary length
      setBookingTab('CUSTOM');
      setDurationRangeStart(dates[0]);
      setDurationRangeEnd(newEnd);
    }
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

  useEffect(() => {
    if (!isActingDriverMode) return;
    const currentScreen = getCurrentScreen();
    if (currentScreen?.name !== 'PlanRideScreen') return;
    
    const fetchUserVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const response = await getPassangerVehicles();
        if (response.success) {
          const list = response.vehicles || [];
          // Compare and select newly added vehicle if list size grew
          if (vehiclesList.length > 0 && list.length > vehiclesList.length) {
            const existingRegs = vehiclesList.map(v => v.regNo);
            const newVehicle = list.find(v => !existingRegs.includes(v.regNo));
            if (newVehicle) {
              setActingDriverVehicle(newVehicle);
              if (newVehicle.maxSpeed) {
                setActingDriverMaxSpeed(String(newVehicle.maxSpeed));
              }
            }
          } else if (list.length > 0 && !actingDriverVehicle) {
            setActingDriverVehicle(list[0]);
            if (list[0].maxSpeed) {
              setActingDriverMaxSpeed(String(list[0].maxSpeed));
            }
          }
          setVehiclesList(list);
        }
      } catch (err) {
        console.log('Failed to fetch user vehicles', err);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchUserVehicles();
  }, [isActingDriverMode, getCurrentScreen()]);

  useEffect(() => {
    if (isActingDriverMode && rideEndLocation) {
      if (isOutsideTirupur(rideEndLocation)) {
        if (bookingTab !== 'CUSTOM') {
          setBookingTab('CUSTOM');
          const todayStr = formatCalendarDate(new Date());
          setDurationRangeStart(todayStr);
          setDurationRangeEnd(todayStr);
          setActingDriverHours(24);
          
          Alert.alert(
            'Outstation Ride',
            'Destination is outside Tirupur, so the booking type has been updated to Outstation.'
          );
        }
      }
    }
  }, [isActingDriverMode, rideEndLocation, bookingTab]);

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
    else if (bookingTab === 'SCHEDULE') {
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
        setIsFlexibleDuration(false);
        // actingDriverHours are already set by HomeScreen, do not overwrite them here.
      } else {
        setActingDriverHours(null);
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
    // Do not clear actingDriverVehicle and actingDriverHours so that the user's progress is preserved when returning to TripSetupScreen
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
      if (vehicle.maxSpeed) {
        setActingDriverMaxSpeed(String(vehicle.maxSpeed));
      }
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

  const onAddWaypoint = (type, dateStr) => {
    setStackScreen('WaypointScreen',{fromPlanScreen:true, dateStr});
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

  const handleLocationClick=(type, dateStr)=>{
    console.log("handleLocationClick",type, dateStr)
    
    handlePickLocation(type, dateStr)
    // onSearchClick(type)
  }

  const debouncedPickLocationCallback = (item, type, dateStr) => {
    if (dateStr) {
      const currentDayItin = actingDriverItinerary?.[dateStr] || {};
      let updatedDayItin = { ...currentDayItin };
      
      if (type === LocationTypes.START_LOCATION) {
        updatedDayItin.startLocation = item;
      } else if (type === LocationTypes.DESTINATION_LOCATION) {
        updatedDayItin.endLocation = item;
      } else if (type === LocationTypes.WAYPOINT_LOCATION) {
        updatedDayItin.wayPoints = [...(updatedDayItin.wayPoints || []), item];
      }
      
      setActingDriverItinerary({
        ...actingDriverItinerary,
        [dateStr]: updatedDayItin
      });
      goBack();
      return;
    }

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

  const onPickLocationResultCallback = (item,type, dateStr) =>{
    debouncedPickLocationCallback(item,type, dateStr)
    
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

  const handlePickLocation = (type=null, dateStr=null) =>{

    const props ={
      onPickLocationResultCallback: (item, locType) => onPickLocationResultCallback(item, locType, dateStr),
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

  const currentTheme = mode === 'ACTING_DRIVER' && actingDriverVehicle 
    ? ACTING_DRIVER_THEMES[actingDriverVehicle.type.toLowerCase()] || ACTING_DRIVER_THEMES['hatchback']
    : ACTING_DRIVER_THEMES['hatchback'];

  return (
    <>
      <View style={[styles.PlanRideScreen, mode === 'ACTING_DRIVER' && { backgroundColor: '#F8FAFC' }]}>
        {mode === 'ACTING_DRIVER' && (
          <StatusBar backgroundColor={currentTheme.primary} barStyle="light-content" />
        )}
        {mode === 'ACTING_DRIVER' && (
          <LinearGradient 
            colors={[currentTheme.primary, currentTheme.secondary]} 
            start={{x: 0, y: 0}} 
            end={{x: 0, y: 1}} 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280, zIndex: 0 }}
          />
        )}

        {/* ── Abstract Scenery — sits on top of gradient, behind the card ── */}
        {mode === 'ACTING_DRIVER' && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280, zIndex: 0, overflow: 'hidden' }} pointerEvents="none">
            {/* Sky large glow top-right */}
            <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.10)', top: -100, right: -40 }} />

            {/* Sun outer disc */}
            <View style={{ position: 'absolute', width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.18)', top: 18, right: 60 }} />
            {/* Sun inner bright */}
            <View style={{ position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.28)', top: 28, right: 70 }} />

            {/* Cloud group 1 */}
            <View style={{ position: 'absolute', width: 70, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.14)', top: 36, left: '30%' }} />
            <View style={{ position: 'absolute', width: 44, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.11)', top: 40, left: '25%' }} />
            <View style={{ position: 'absolute', width: 36, height: 18, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.10)', top: 26, left: '33%' }} />

            {/* Cloud group 2 (top-left small) */}
            <View style={{ position: 'absolute', width: 48, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.10)', top: 14, left: '10%' }} />
            <View style={{ position: 'absolute', width: 30, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', top: 18, left: '7%' }} />

            {/* Diagonal light rays */}
            <View style={{ position: 'absolute', width: 5, height: 300, backgroundColor: 'rgba(255,255,255,0.06)', top: -40, left: '48%', transform: [{ rotate: '22deg' }] }} />
            <View style={{ position: 'absolute', width: 3, height: 300, backgroundColor: 'rgba(255,255,255,0.04)', top: -40, left: '52%', transform: [{ rotate: '22deg' }] }} />
            <View style={{ position: 'absolute', width: 2, height: 300, backgroundColor: 'rgba(255,255,255,0.03)', top: -40, left: '56%', transform: [{ rotate: '22deg' }] }} />

            {/* Ground horizon band */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, backgroundColor: 'rgba(0,0,0,0.14)' }} />

            {/* Rolling hills — far (big, centered) */}
            <View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.08)', bottom: -180, left: '15%' }} />
            {/* Rolling hills — near left */}
            <View style={{ position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.12)', bottom: -100, left: -30 }} />
            {/* Rolling hills — near right */}
            <View style={{ position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.09)', bottom: -80, right: -20 }} />

            {/* Road centre dashes */}
            <View style={{ position: 'absolute', width: 22, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.22)', bottom: 18, left: '28%' }} />
            <View style={{ position: 'absolute', width: 22, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.22)', bottom: 18, left: '36%' }} />
            <View style={{ position: 'absolute', width: 22, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.22)', bottom: 18, left: '44%' }} />
            <View style={{ position: 'absolute', width: 22, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.22)', bottom: 18, left: '52%' }} />
          </View>
        )}
        
        {mode === 'ACTING_DRIVER' ? (
          <View style={{ paddingBottom: 40, zIndex: 1 }}>
            {/* Custom NavBar matching the theme */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 }}>
              <TouchableOpacity onPress={onBackPress} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                 <Ionicons name="chevron-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                 <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: '#FFF' }}>Acting Driver Booking</Text>
                 <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: '#FFF', opacity: 0.9 }}>Choose your vehicle, add pickup location.</Text>
              </View>
              <TouchableOpacity onPress={onFeedbackPress} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                 <Ionicons name="chatbubble-ellipses-outline" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            {/* Themed Vehicle Card */}
            {actingDriverVehicle && (
              <View style={{ 
                marginHorizontal: 16, 
                backgroundColor: currentTheme.primary, 
                borderRadius: 20, 
                overflow: 'hidden',
                height: 140,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)'
              }}>

                {/* ── LAYER 1: Full-card city skyline background ── */}
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">

                  {/* Night-sky tint */}
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.10)' }} />

                  {/* Moon — top right */}
                  <View style={{ position: 'absolute', width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.26)', top: 8, right: 18 }} />
                  <View style={{ position: 'absolute', width: 17, height: 17, borderRadius: 8.5, backgroundColor: 'rgba(255,255,255,0.14)', top: 8, right: 14 }} />

                  {/* Stars scattered across sky */}
                  <View style={{ position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.45)', top: 6, left: '18%' }} />
                  <View style={{ position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.35)', top: 18, left: '32%' }} />
                  <View style={{ position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.30)', top: 10, left: '48%' }} />
                  <View style={{ position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.28)', top: 22, left: '62%' }} />
                  <View style={{ position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.22)', top: 8, left: '75%' }} />

                  {/* Building A — tallest, left zone */}
                  <View style={{ position: 'absolute', width: 18, height: 70, backgroundColor: 'rgba(255,255,255,0.15)', bottom: 20, left: '8%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
                    <View style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.55)', margin: 3, borderRadius: 1 }} />
                    <View style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.22)', margin: 3, borderRadius: 1 }} />
                    <View style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.55)', margin: 3, borderRadius: 1 }} />
                    <View style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.30)', margin: 3, borderRadius: 1 }} />
                  </View>
                  {/* Antenna on A */}
                  <View style={{ position: 'absolute', width: 2, height: 14, backgroundColor: 'rgba(255,255,255,0.25)', bottom: 90, left: '9.5%' }} />
                  <View style={{ position: 'absolute', width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,80,80,0.65)', bottom: 102, left: '8.8%' }} />

                  {/* Building B — squat, far left */}
                  <View style={{ position: 'absolute', width: 14, height: 40, backgroundColor: 'rgba(255,255,255,0.11)', bottom: 20, left: '1%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
                    <View style={{ width: 4, height: 4, backgroundColor: 'rgba(255,255,255,0.42)', margin: 2, borderRadius: 1 }} />
                    <View style={{ width: 4, height: 4, backgroundColor: 'rgba(255,255,255,0.20)', margin: 2, borderRadius: 1 }} />
                  </View>

                  {/* Building C — medium, center-left */}
                  <View style={{ position: 'absolute', width: 20, height: 52, backgroundColor: 'rgba(255,255,255,0.13)', bottom: 20, left: '28%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
                    <View style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.48)', margin: 3, borderRadius: 1 }} />
                    <View style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.25)', margin: 3, borderRadius: 1 }} />
                    <View style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.48)', margin: 3, borderRadius: 1 }} />
                  </View>

                  {/* Building D — wide, center */}
                  <View style={{ position: 'absolute', width: 28, height: 42, backgroundColor: 'rgba(255,255,255,0.12)', bottom: 20, left: '42%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
                    <View style={{ flexDirection: 'row', margin: 3, gap: 3 }}>
                      <View style={{ width: 5, height: 5, backgroundColor: 'rgba(255,255,255,0.50)', borderRadius: 1 }} />
                      <View style={{ width: 5, height: 5, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 1 }} />
                      <View style={{ width: 5, height: 5, backgroundColor: 'rgba(255,255,255,0.50)', borderRadius: 1 }} />
                    </View>
                    <View style={{ flexDirection: 'row', margin: 3, gap: 3 }}>
                      <View style={{ width: 5, height: 5, backgroundColor: 'rgba(255,255,255,0.28)', borderRadius: 1 }} />
                      <View style={{ width: 5, height: 5, backgroundColor: 'rgba(255,255,255,0.50)', borderRadius: 1 }} />
                      <View style={{ width: 5, height: 5, backgroundColor: 'rgba(255,255,255,0.28)', borderRadius: 1 }} />
                    </View>
                  </View>

                  {/* Building E — slim tall, center-right */}
                  <View style={{ position: 'absolute', width: 12, height: 58, backgroundColor: 'rgba(255,255,255,0.13)', bottom: 20, left: '62%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
                    <View style={{ width: 4, height: 4, backgroundColor: 'rgba(255,255,255,0.50)', margin: 2, borderRadius: 1 }} />
                    <View style={{ width: 4, height: 4, backgroundColor: 'rgba(255,255,255,0.22)', margin: 2, borderRadius: 1 }} />
                    <View style={{ width: 4, height: 4, backgroundColor: 'rgba(255,255,255,0.50)', margin: 2, borderRadius: 1 }} />
                    <View style={{ width: 4, height: 4, backgroundColor: 'rgba(255,255,255,0.22)', margin: 2, borderRadius: 1 }} />
                  </View>

                  {/* Building F — short, far right */}
                  <View style={{ position: 'absolute', width: 16, height: 30, backgroundColor: 'rgba(255,255,255,0.10)', bottom: 20, left: '76%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
                    <View style={{ width: 4, height: 4, backgroundColor: 'rgba(255,255,255,0.38)', margin: 2, borderRadius: 1 }} />
                  </View>

                  {/* Building G — tiny, far-right edge */}
                  <View style={{ position: 'absolute', width: 10, height: 22, backgroundColor: 'rgba(255,255,255,0.09)', bottom: 20, left: '88%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />

                  {/* Ground / road */}
                  <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, backgroundColor: 'rgba(0,0,0,0.22)' }} />
                  {/* Road dashes across full width */}
                  <View style={{ position: 'absolute', width: 12, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.32)', bottom: 9, left: '5%' }} />
                  <View style={{ position: 'absolute', width: 12, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.28)', bottom: 9, left: '18%' }} />
                  <View style={{ position: 'absolute', width: 12, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.24)', bottom: 9, left: '31%' }} />
                  <View style={{ position: 'absolute', width: 12, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.20)', bottom: 9, left: '44%' }} />
                  <View style={{ position: 'absolute', width: 10, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.18)', bottom: 9, left: '57%' }} />
                  <View style={{ position: 'absolute', width: 10, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)', bottom: 9, left: '70%' }} />
                  <View style={{ position: 'absolute', width: 8,  height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.12)', bottom: 9, left: '82%' }} />
                </View>

                {/* ── LAYER 2: Left-side gradient so text stays readable ── */}
                <LinearGradient
                  colors={[currentTheme.primary, currentTheme.primary + 'CC', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '60%' }}
                  pointerEvents="none"
                />

                {/* ── LAYER 3: Text info (left side) ── */}
                <View style={{ flex: 1, padding: 16, zIndex: 2 }}>
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 20, color: '#FFF' }}>{actingDriverVehicle.regNo}</Text>
                  <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: '#FFF', opacity: 0.9, marginTop: 2 }}>{actingDriverVehicle.make} {actingDriverVehicle.model}</Text>
                  <View style={{ marginTop: 12, alignSelf: 'flex-start' }}>
                    <View style={{ backgroundColor: currentTheme.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 8 }}>
                       <Text style={{ fontFamily: Fonts.bold, fontSize: 11, color: '#FFF', textTransform: 'capitalize' }}>{actingDriverVehicle.type}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowVehicleModal(true)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                       <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: '#FFF' }}>Change Vehicle</Text>
                       <Ionicons name="chevron-down" size={16} color="#FFF" style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ── LAYER 4: Vehicle image (right side, on top of scene) ── */}
                <View style={{ position: 'absolute', right: 0, bottom: 0, top: 0, width: '55%', alignItems: 'center', justifyContent: 'flex-end' }} pointerEvents="none">
                  {actingDriverVehicle.photo ? (
                    <Image source={{ uri: actingDriverVehicle.photo }} style={{ width: '100%', height: '85%', resizeMode: 'cover' }} />
                  ) : getStockImage(actingDriverVehicle.type) ? (
                    <Image source={getStockImage(actingDriverVehicle.type)} style={{ width: '140%', height: '90%', resizeMode: 'contain', marginBottom: 16 }} />
                  ) : (
                    <Ionicons name={VEHICLE_TYPE_ICON[actingDriverVehicle.type?.toLowerCase()] || 'car-sport'} size={110} color="#FFF" style={{ opacity: 0.28, marginBottom: 18 }} />
                  )}
                </View>

              </View>
            )}
          </View>
        ) : (
          <NavBar
            withBg
            onBackPress={onBackPress}
            title={t('plan_your_trip')}
            feedbackIcon={true}
            onrightIconPress={onFeedbackPress}
          />
        )}

        <View style={[{ flex: 1, zIndex: 10, elevation: 10}, mode === 'ACTING_DRIVER' && { marginTop: -30, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' }]}>
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{paddingBottom: height*0.2}}
            keyboardShouldPersistTaps="handled"
          >
          {mode === 'ACTING_DRIVER' ? (
            <View style={{ zIndex: 10, elevation: 10 }}>
               <ActingDriverPlanCard 
                 onLocationClick={(type) => handleLocationClick(type)}
                 onItineraryClick={() => {
                   setStackScreen('ItineraryPlanScreen', {
                     itineraryDates,
                     themeColor: currentTheme,
                     onAddItineraryLocation: handleItineraryLocationClick,
                     onAddDay: handleAddDay,
                   });
                 }}
                 themeColor={currentTheme}
               />
            </View>
          ) : (
            <>
          <View style={styles.tripForContainer}>
            <TouchableOpacity style={styles.tripForPill} onPress={() => onTripForPress()} activeOpacity={0.8}>
              <View style={styles.tripForIconWrapper}>
                <Ionicons name="person" size={14} color={colors.white} />
              </View>
              <Text style={styles.tripForText} numberOfLines={1} ellipsizeMode="tail">
                {rideBookMode === 'MYSELF' ? t('myself') : passangerDetails?.name || t('others')}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.grey_dark} />
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
            </>
          )}

        <HistoryContainer selectCallback={handleHistoryLocationClick} bottomborder = {false} fromSearchScreen={true}/>
        </ScrollView>
        </View>

        <View style={styles.pickLocationContainer}> 
          {/* <PickLocationButton
          onPress={handlePickLocation}
       
          /> */}
         {
          isContinueButtonVisible && (
            mode === 'ACTING_DRIVER' ? (
              <TouchableOpacity 
                style={[styles.continueButtonActing, isContinuing && styles.continueButtonDisabled]} 
                onPress={()=>{  handleContinue()}} 
                disabled={isContinuing}
              >
                <LinearGradient
                  colors={[currentTheme.primary, currentTheme.secondary]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.actingGradientBtn}
                >
                  {isContinuing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.actingContinueText}>{t('continue')}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.continueButton, isContinuing && styles.continueButtonDisabled]} onPress={()=>{  handleContinue()}} disabled={isContinuing}>
                {isContinuing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <AdaptiveText style={[styles.continueButtonText, isContinuing && styles.continueButtonTextDisabled]} color={colors.white}>{t('continue')}</AdaptiveText>
                )}
              </TouchableOpacity>
            )
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

        {/* Plan Daily Itinerary Modal */}
        <VehicleSelectionModal 
          visible={showVehicleModal}
          onClose={() => setShowVehicleModal(false)}
          vehiclesList={vehiclesList}
          selectedVehicle={actingDriverVehicle}
          onSelect={(vehicle) => {
            setActingDriverVehicle(vehicle);
            if (vehicle.maxSpeed) {
              setActingDriverMaxSpeed(String(vehicle.maxSpeed));
            }
            setShowVehicleModal(false);
          }}
          themeMap={ACTING_DRIVER_THEMES}
          onAddVehicle={() => {
            setShowVehicleModal(false);
            setStackScreen('MyVehiclesScreen', { returnTo: 'PlanRideScreen', action: 'add' });
          }}
        />
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
    backgroundColor: '#FAFAFC', // Slightly softer background
    paddingHorizontal: 0,
  },
  tripForContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  tripForPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tripForIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: actingDriverColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripForText: {
    fontSize: 14,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: '#1E293B',
    maxWidth: 160,
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
  vehicleScrollCard: {
    width: 240,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  vehicleScrollCardSelected: {
    backgroundColor: '#F1F5F9',
    borderColor: '#94A3B8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  addVehicleScrollCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    gap: 8,
  },
  vehicleScrollIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleScrollIconBgSelected: {
    backgroundColor: '#475569',
  },
  vehicleScrollReg: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#1E293B',
  },
  vehicleScrollRegSelected: {
    color: '#1E293B',
  },
  vehicleScrollMeta: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#64748B',
    marginTop: 2,
  },
  vehicleScrollMetaSelected: {
    color: '#64748B',
  },
  addVehicleScrollText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#1E293B',
    marginTop: 8,
  },
  durationSection: {
    gap: 8,
  },
  durationLabel: {
    fontSize: 13,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: actingDriverColors.secondary,
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
    borderColor: actingDriverColors.primary,
    backgroundColor: '#F8FAFC',
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
    color: actingDriverColors.secondary,
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
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 20,
  },
  continueButtonActing: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actingGradientBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actingContinueText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#FFF',
  },
  continueButton: {
    backgroundColor: '#000000',
    width: "100%",
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  continueButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonTextDisabled: {
    color: '#94A3B8',
  },
  optionTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 6,
    gap: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  optionTabSelected: {
    backgroundColor: actingDriverColors.primary || '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  optionTabText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#64748B',
  },
  optionTabTextSelected: {
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
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
    borderColor: actingDriverColors.primary,
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  itineraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  itineraryButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itineraryButtonIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itineraryButtonTitle: {
    fontSize: 15,
    fontFamily: Fonts.semibold || Fonts.medium,
    color: '#1E293B',
  },
  itineraryButtonSub: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#64748B',
    marginTop: 2,
  },
  itineraryButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itineraryBadge: {
    backgroundColor: actingDriverColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itineraryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.bold,
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
  /* itin* styles moved to ItineraryPlanModal.jsx */
});

export default PlanRideScreen;

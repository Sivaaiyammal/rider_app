import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { Calendar } from 'react-native-calendars';
import { utils } from '../../../utils/Utils';
import { colors, Fonts, ACTING_DRIVER_THEMES } from '../../../constants/constants';
import { getStockImage } from '../../myVehicles/constants/vehicleData';
import LinearGradient from 'react-native-linear-gradient';

import { useStackScreenStore } from '../../../store/useStackScreenStore';
import useRideBookingInfo from '../store/useRideBookingInfo';
import useLocationStore from '../../../store/useLocationStore';
import LocationTypes from '../types/LocationTypes.json';
import useRideBookingLocationStore from '../store/useRideBookingLocationStore';

const TripSetupScreen = ({ isEditMode }) => {
  const { goBack, setStackScreen } = useStackScreenStore();
  const { location, currentLocationName } = useLocationStore();
  const { setRideStartLocation } = useRideBookingLocationStore();
  const { 
    actingDriverVehicle, 
    setCurrentLoactionPickupLocation,
    setRideEndLocation,
    setBookingTab,
    setDurationRangeStart,
    setDurationRangeEnd,
    setActingDriverHours,
    setTodayDurationOption,
    setTodayCustomHours,
    setTomorrowDurationOption,
    setTomorrowCustomHours,
    setTomorrowStartTime,
    setCustomStartTime,
  } = useRideBookingInfo();

  const vehicle = actingDriverVehicle;
  const currentTheme = vehicle?.type ? (ACTING_DRIVER_THEMES[vehicle.type.toLowerCase()] || ACTING_DRIVER_THEMES.hatchback) : ACTING_DRIVER_THEMES.hatchback;
  const [whenNeed, setWhenNeed] = useState('Today'); // Today, Tomorrow, Later
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [tripType, setTripType] = useState('One Way'); // One Way, Round Trip
  const [duration, setDuration] = useState('Hourly'); // Hourly, Full Day, Multiple Days
  const [hours, setHours] = useState(4);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pendingRangeStart, setPendingRangeStart] = useState(null);
  const [pendingRangeEnd, setPendingRangeEnd] = useState(null);

  const themeColor = currentTheme?.primary || ACTING_DRIVER_THEMES.hatchback.primary;

  const formatCalendarDate = (d) => {
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getInclusiveDateRangeDays = (startStr, endStr) => {
    if (!startStr) return 0;
    const sDate = new Date(startStr);
    const eDate = new Date(endStr || startStr);
    sDate.setHours(0, 0, 0, 0);
    eDate.setHours(0, 0, 0, 0);
    const dayMs = 24 * 60 * 60 * 1000;
    return Math.max(1, Math.floor((eDate - sDate) / dayMs) + 1);
  };

  const addMonths = (d, months) => {
    const nextDate = new Date(d);
    nextDate.setMonth(nextDate.getMonth() + months);
    return nextDate;
  };

  const todayDate = formatCalendarDate(new Date());
  
  const minCalendarDateObj = new Date();
  minCalendarDateObj.setDate(minCalendarDateObj.getDate() + 2);
  const minCalendarDateString = formatCalendarDate(minCalendarDateObj);
  
  const maxCustomDate = formatCalendarDate(addMonths(new Date(), 2));

  const getMarkedDates = () => {
    if (!pendingRangeStart) {
      return {};
    }
    const start = new Date(pendingRangeStart);
    const end = new Date(pendingRangeEnd || pendingRangeStart);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const marked = {};
    const cursor = new Date(start);
    while (cursor <= end) {
      const dateKey = formatCalendarDate(cursor);
      marked[dateKey] = {
        selected: true,
        color: themeColor,
        textColor: colors.white,
        startingDay: dateKey === pendingRangeStart,
        endingDay: dateKey === (pendingRangeEnd || pendingRangeStart),
      };
      cursor.setDate(cursor.getDate() + 1);
    }
    return marked;
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

  const onCustomCalendarConfirm = () => {
    if (!pendingRangeStart) {
      return;
    }
    setStartDate(pendingRangeStart);
    setEndDate(pendingRangeEnd || pendingRangeStart);
    setShowCalendarModal(false);
  };

  const onCustomCalendarCancel = () => {
    setPendingRangeStart(null);
    setPendingRangeEnd(null);
    setShowCalendarModal(false);
  };

  const handleContinue = async () => {
    try {
      const setCurrentLoactionPickupLocation = () => {
        if(!location || !currentLocationName || !location.length){
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
      };

      if (actingDriverVehicle) {
        setCurrentLoactionPickupLocation();

        if (whenNeed === 'Today') {
          setBookingTab('TODAY');
          if (duration === 'Hourly') {
             setTodayDurationOption('1_HOUR');
             setActingDriverHours(hours || 1);
          } else {
             setTodayDurationOption('CUSTOM_HOURS');
             setTodayCustomHours(12);
             setActingDriverHours(12);
          }
        } else if (duration === 'Multiple Days') {
          if (!startDate) {
            setPendingRangeStart(startDate);
            setPendingRangeEnd(endDate);
            setShowCalendarModal(true);
            return;
          }
          setBookingTab('CUSTOM');
          setDurationRangeStart(startDate);
          setDurationRangeEnd(endDate || startDate);
          setCustomStartTime(date);
          const days = getInclusiveDateRangeDays(startDate, endDate || startDate);
          setActingDriverHours(days * 24);
        } else if (whenNeed === 'Tomorrow') {
          setBookingTab('TOMORROW');
          setTomorrowStartTime(date);
          if (duration === 'Hourly') {
             setTomorrowDurationOption('HOURLY');
             setTomorrowCustomHours(hours || 1);
             setActingDriverHours(hours || 1);
          } else {
             setTomorrowDurationOption('HOURLY');
             setTomorrowCustomHours(12);
             setActingDriverHours(12);
          }
        } else if (whenNeed === 'Later') {
          setBookingTab('SCHEDULE');
          const year = date.getFullYear();
          const month = `${date.getMonth() + 1}`.padStart(2, '0');
          const day = `${date.getDate()}`.padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          
          setDurationRangeStart(formattedDate);
          setDurationRangeEnd(formattedDate);
          setCustomStartTime(date);
          
          if (duration === 'Hourly') {
             setActingDriverHours(hours || 1);
          } else {
             setActingDriverHours(12);
          }
        }

        if (isEditMode) {
          goBack({ vehicle: actingDriverVehicle });
        } else {
          setStackScreen('PlanRideScreen', {
            mode: 'ACTING_DRIVER',
            preselectedVehicleType: actingDriverVehicle.type,
            vehicle: actingDriverVehicle,
          });
        }
      } else {
        setCurrentLoactionPickupLocation();
        setStackScreen('ActingDriverVehicleSelectScreen', {});
      }
    } catch (e) {
      console.error('ActingDriver trip type error:', e);
      setCurrentLoactionPickupLocation();
      setStackScreen('ActingDriverVehicleSelectScreen', {});
    }
  };

  const handleOnChangeVehicle = () => {
    setStackScreen('ActingDriverVehicleSelectScreen', {});
  };

  return (
    <View style={styles.container}>
      <View style={styles.modalContent}>
        <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={colors.black} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.stepText}>Step 1 of 3</Text>
              <Text style={styles.titleText}>Trip Setup</Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressDot, { backgroundColor: themeColor }]} />
            <View style={styles.progressLine}>
              <View style={{ width: '50%', height: '100%', backgroundColor: themeColor }} />
            </View>
            <View style={styles.progressDot} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
          </View>

          <ScrollView 
            style={{ flex: 1 }} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
          {vehicle ? (
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleImageContainer}>
                 {vehicle.photo || getStockImage(vehicle.type) ? (
                    <Image
                      source={vehicle.photo ? { uri: vehicle.photo } : getStockImage(vehicle.type)}
                      style={styles.vehicleImage}
                    />
                  ) : (
                    <Ionicons name="car-sport" size={24} color={colors.black} />
                  )}
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={[styles.vehicleLabel, { color: themeColor }]}>Selected Vehicle</Text>
                <Text style={styles.vehicleDetails}>
                  {vehicle.regNo} - {vehicle.model}
                </Text>
              </View>
              {/* Remove onChangeVehicle check since we always have it in the screen */}
              <TouchableOpacity style={styles.changeButton} onPress={handleOnChangeVehicle}>
                <Text style={styles.changeButtonText}>Change</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.black} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.vehicleCard} onPress={handleOnChangeVehicle}>
              <View style={[styles.vehicleImageContainer, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="car-sport" size={24} color={colors.grey_dark} />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={[styles.vehicleLabel, { color: colors.grey_dark }]}>No Vehicle Selected</Text>
                <Text style={styles.vehicleDetails}>Tap to select a vehicle</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.black} />
            </TouchableOpacity>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When do you need the driver?</Text>
            <View style={styles.pillContainer}>
              {['Today', 'Tomorrow', 'Later'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.pill,
                    whenNeed === option && { borderColor: themeColor, backgroundColor: themeColor + '10' },
                  ]}
                  onPress={() => {
                    setWhenNeed(option);
                    if (option === 'Today') {
                      setDate(new Date());
                      if (duration === 'Multiple Days') {
                        setDuration('Hourly');
                      }
                    } else if (option === 'Tomorrow') {
                      const tmrw = new Date();
                      tmrw.setDate(tmrw.getDate() + 1);
                      setDate(tmrw);
                      if (duration === 'Multiple Days') {
                        setDuration('Hourly');
                      }
                    } else if (option === 'Later') {
                      if (duration === 'Multiple Days') {
                        setPendingRangeStart(startDate);
                        setPendingRangeEnd(endDate);
                        setShowCalendarModal(true);
                      } else {
                        const minDate = new Date();
                        minDate.setDate(minDate.getDate() + 2);
                        minDate.setHours(0, 0, 0, 0);
                        if (date < minDate) {
                          setDate(minDate);
                        }
                        setPickerMode('date');
                        setShowDatePicker(true);
                      }
                    }
                  }}
                >
                  <Ionicons
                    name={option === 'Later' ? 'time-outline' : 'calendar-outline'}
                    size={20}
                    color={whenNeed === option ? themeColor : colors.black}
                    style={styles.pillIcon}
                  />
                  <Text style={[styles.pillText, whenNeed === option && { color: themeColor }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{(whenNeed === 'Today' || whenNeed === 'Tomorrow') ? 'Time' : 'Date & Time'}</Text>
              <View style={styles.dateTimeContainer}>
                {duration === 'Multiple Days' ? (
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => {
                      setPendingRangeStart(startDate);
                      setPendingRangeEnd(endDate);
                      setShowCalendarModal(true);
                    }}
                  >
                    <Ionicons name="calendar-outline" size={20} color={colors.black} />
                    <Text style={styles.dateText}>
                      {startDate ? (
                        `${utils.formatDate(startDate, 'DD MMM')} - ${utils.formatDate(endDate || startDate, 'DD MMM')}`
                      ) : (
                        'Select Dates'
                      )}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  // Only show the date picker button for 'Later' — not for Today/Tomorrow
                  (whenNeed !== 'Today' && whenNeed !== 'Tomorrow') ? (
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => {
                        setPickerMode('date');
                        setShowDatePicker(true);
                      }}
                    >
                      <Ionicons name="calendar-outline" size={20} color={colors.black} />
                      <Text style={styles.dateText}>
                        {date.toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </TouchableOpacity>
                  ) : null
                )}
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => {
                    setPickerMode('time');
                    setShowDatePicker(true);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="time-outline" size={20} color={colors.black} />
                    <Text style={styles.timeText}>
                      {date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.black} />
                </TouchableOpacity>
              </View>

               <DatePicker
                modal
                open={showDatePicker}
                mode={pickerMode}
                date={date}
                minimumDate={pickerMode === 'date' ? (() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 2);
                  d.setHours(0, 0, 0, 0);
                  return d;
                })() : new Date()}
                 onConfirm={(selectedDate) => {
                  setShowDatePicker(false);
                  
                  let finalDate = selectedDate;
                  if (pickerMode === 'time') {
                    finalDate = new Date(date);
                    finalDate.setHours(selectedDate.getHours());
                    finalDate.setMinutes(selectedDate.getMinutes());
                    finalDate.setSeconds(0);
                    finalDate.setMilliseconds(0);
                  }
                  
                  setDate(finalDate);
                  
                  // Auto-update pill based on selected date
                  const today = new Date();
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  
                  if (finalDate.toDateString() === today.toDateString()) {
                    setWhenNeed('Today');
                  } else if (finalDate.toDateString() === tomorrow.toDateString()) {
                    setWhenNeed('Tomorrow');
                  } else {
                    setWhenNeed('Later');
                  }
                }}
                onCancel={() => {
                  setShowDatePicker(false);
                }}
              />
          </View>

           <View style={styles.section}>
            <Text style={styles.sectionTitle}>How long do you need the driver?</Text>
            <View style={styles.pillContainer}>
              {['Hourly', 'Full Day', 'Multiple Days'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.pill,
                    duration === option && { borderColor: themeColor, backgroundColor: themeColor + '10' },
                  ]}
                  onPress={() => {
                    setDuration(option);
                    if (option === 'Multiple Days') {
                      setWhenNeed('Later');
                      if (!startDate) {
                        setPendingRangeStart(null);
                        setPendingRangeEnd(null);
                        setShowCalendarModal(true);
                      }
                    } else if (option === 'Hourly') {
                      setShowHoursModal(true);
                    }
                  }}
                >
                  <Ionicons
                    name={option === 'Hourly' ? 'time-outline' : 'calendar-outline'}
                    size={20}
                    color={duration === option ? themeColor : colors.black}
                    style={styles.pillIcon}
                  />
                  <Text style={[styles.pillText, duration === option && { color: themeColor }]}>
                    {option}{option === 'Hourly' && duration === 'Hourly' ? ` · ${hours}h` : ''}
                  </Text>
                  {option === 'Hourly' && duration === 'Hourly' && (
                    <TouchableOpacity
                      onPress={() => setShowHoursModal(true)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="create-outline" size={14} color={themeColor} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>


          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What type of trip?</Text>
            <View style={styles.pillContainer}>
              {[
                { label: 'One Way', sub: '(Drop Off)', icon: 'arrow-forward-outline' },
                { label: 'Round Trip', sub: '(Up & Down)', icon: 'sync-outline' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.largePill,
                    tripType === option.label && { borderColor: themeColor, backgroundColor: themeColor + '10' },
                  ]}
                  onPress={() => setTripType(option.label)}
                >
                  <View style={[styles.iconCircle, tripType === option.label && { backgroundColor: themeColor + '20' }]}>
                    <Ionicons
                        name={option.icon}
                        size={20}
                        color={tripType === option.label ? themeColor : colors.black}
                    />
                  </View>
                  <View>
                    <Text style={[styles.largePillText, tripType === option.label && { color: themeColor }]}>
                        {option.label}
                    </Text>
                    <Text style={styles.largePillSub}>{option.sub}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          

         


          </ScrollView>

          <View style={{ paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 20 : 0 }}>
            <TouchableOpacity
              style={styles.continueButtonWrapper}
              onPress={handleContinue}
            >
              <LinearGradient
                colors={[currentTheme.primary, currentTheme.secondary || currentTheme.primary]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.continueButton}
              >
                <View style={{ width: 24 }} />
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={24} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </View>

        <Modal
          visible={showCalendarModal}
          animationType="fade"
          transparent
          onRequestClose={onCustomCalendarCancel}
        >
          <View style={styles.calendarModalOverlay}>
            <View style={styles.calendarModalCard}>
              <Text style={styles.calendarModalTitle}>Pick Dates</Text>
              <Calendar
                minDate={minCalendarDateString}
                maxDate={maxCustomDate}
                onDayPress={onCustomDurationDateSelect}
                markingType="period"
                markedDates={getMarkedDates()}
                theme={{
                  calendarBackground: colors.white,
                  textSectionTitleColor: colors.grey_xxdark,
                  todayTextColor: themeColor,
                  dayTextColor: colors.black,
                  textDayFontFamily: Fonts.regular,
                  textMonthFontFamily: Fonts.medium,
                  arrowColor: themeColor,
                }}
              />
              <View style={styles.calendarModalActions}>
                <TouchableOpacity 
                  style={styles.calendarCancelButton}
                  onPress={onCustomCalendarCancel}
                >
                  <Text style={styles.calendarCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.calendarOkButton, !pendingRangeStart && styles.calendarOkButtonDisabled]}
                  onPress={onCustomCalendarConfirm}
                >
                  <Text style={styles.calendarOkText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Hours Picker Modal */}
        <Modal
          visible={showHoursModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowHoursModal(false)}
        >
          <TouchableOpacity
            style={styles.calendarModalOverlay}
            activeOpacity={1}
            onPress={() => setShowHoursModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.hoursModalCard}
              onPress={() => {}}
            >
              {/* Handle */}
              <View style={styles.hoursModalHandle} />
              <Text style={styles.hoursModalTitle}>For how many hours?</Text>

              {/* Counter */}
              <View style={styles.hoursCounterRow}>
                <TouchableOpacity
                  style={[styles.hoursCounterBtn, { borderColor: themeColor }]}
                  onPress={() => setHours(h => Math.max(1, h - 1))}
                >
                  <Ionicons name="remove" size={26} color={themeColor} />
                </TouchableOpacity>
                <View style={styles.hoursCounterDisplay}>
                  <Text style={[styles.hoursCounterValue, { color: themeColor }]}>{hours}</Text>
                  <Text style={styles.hoursCounterLabel}>Hours</Text>
                </View>
                <TouchableOpacity
                  style={[styles.hoursCounterBtn, { borderColor: themeColor }]}
                  onPress={() => setHours(h => Math.min(24, h + 1))}
                >
                  <Ionicons name="add" size={26} color={themeColor} />
                </TouchableOpacity>
              </View>

              {/* Quick chips */}
              <View style={styles.hoursChipsRow}>
                {[1, 2, 3, 4, 6, 8, 10, 12].map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[
                      styles.hoursChip,
                      hours === h && { backgroundColor: themeColor, borderColor: themeColor },
                    ]}
                    onPress={() => setHours(h)}
                  >
                    <Text style={[styles.hoursChipText, hours === h && { color: '#fff' }]}>{h}h</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Confirm */}
              <TouchableOpacity
                style={[styles.hoursConfirmBtn, { backgroundColor: themeColor }]}
                onPress={() => setShowHoursModal(false)}
              >
                <Text style={styles.hoursConfirmText}>Confirm · {hours} {hours === 1 ? 'Hour' : 'Hours'}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 4,
    zIndex: 1,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  stepText: {
    fontFamily: Fonts.semi_bold,
    fontSize: 14,
    color: colors.black,
  },
  titleText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: colors.black,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D1D5DB', // default gray
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
    borderRadius: 1,
    overflow: 'hidden',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    // backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden'
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    marginBottom: 2,
  },
  vehicleDetails: {
    fontFamily: Fonts.semi_bold,
    fontSize: 14,
    color: colors.black,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.black,
    marginRight: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    color: colors.black,
    marginBottom: 12,
  },
  pillContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  pill: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  pillIcon: {
    marginBottom: 8,
  },
  pillText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.black,
  },
  largePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
  },
  largePillText: {
    fontFamily: Fonts.semi_bold,
    fontSize: 14,
    color: colors.black,
  },
  largePillSub: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: colors.grey_dark,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    gap: 8,
  },
  dateText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.black,
  },
  timePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'space-between'
  },
  timeText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.black,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  counterButton: {
    padding: 8,
  },
  counterText: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    color: colors.black,
  },
  continueButtonWrapper: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: colors.white,
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  calendarModalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    color: '#000',
  },
  calendarModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  calendarCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  calendarCancelText: {
    fontFamily: Fonts.medium,
    color: colors.grey_xxdark,
    fontSize: 14,
  },
  calendarOkButton: {
    backgroundColor: colors.black,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  calendarOkButtonDisabled: {
    opacity: 0.5,
  },
  calendarOkText: {
    fontFamily: Fonts.medium,
    color: '#fff',
    fontSize: 14,
  },
  // Hours Modal
  hoursModalCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  hoursModalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  hoursModalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#111',
    textAlign: 'center',
    marginBottom: 24,
  },
  hoursCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 28,
  },
  hoursCounterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursCounterDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },
  hoursCounterValue: {
    fontFamily: Fonts.bold,
    fontSize: 48,
    lineHeight: 52,
  },
  hoursCounterLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  hoursChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 28,
  },
  hoursChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  hoursChipText: {
    fontFamily: Fonts.semi_bold,
    fontSize: 14,
    color: '#374151',
  },
  hoursConfirmBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  hoursConfirmText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
});

export default TripSetupScreen;

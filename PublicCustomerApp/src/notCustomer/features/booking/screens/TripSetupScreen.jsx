import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
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

  const themeColor = currentTheme?.primary || ACTING_DRIVER_THEMES.hatchback.primary;

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
        } else if (whenNeed === 'Tomorrow') {
          setBookingTab('TOMORROW');
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
                    } else if (option === 'Tomorrow') {
                      const tmrw = new Date();
                      tmrw.setDate(tmrw.getDate() + 1);
                      setDate(tmrw);
                    } else if (option === 'Later') {
                      setShowDatePicker(true);
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
            <Text style={styles.sectionTitle}>Date & Time</Text>
              <View style={styles.dateTimeContainer}>
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
                minimumDate={new Date()}
                 onConfirm={(selectedDate) => {
                  setShowDatePicker(false);
                  setDate(selectedDate);
                  
                  // Auto-update pill based on selected date
                  const today = new Date();
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  
                  if (selectedDate.toDateString() === today.toDateString()) {
                    setWhenNeed('Today');
                  } else if (selectedDate.toDateString() === tomorrow.toDateString()) {
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
                  onPress={() => setDuration(option)}
                >
                  <Ionicons
                    name={option === 'Hourly' ? 'time-outline' : 'calendar-outline'}
                    size={20}
                    color={duration === option ? themeColor : colors.black}
                    style={styles.pillIcon}
                  />
                  <Text style={[styles.pillText, duration === option && { color: themeColor }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {duration === 'Hourly' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>For how many hours?</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setHours(Math.max(1, hours - 1))}
                >
                  <Ionicons name="remove" size={24} color={colors.black} />
                </TouchableOpacity>
                <Text style={styles.counterText}>{hours} Hours</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setHours(hours + 1)}
                >
                  <Ionicons name="add" size={24} color={colors.black} />
                </TouchableOpacity>
              </View>
            </View>
          )}

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
});

export default TripSetupScreen;

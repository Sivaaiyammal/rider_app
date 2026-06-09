import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';
import { colors, Fonts, actingDriverColors } from '../../../constants/constants';
import { utils } from '../../../utils/Utils';
import NavBar from '../../../components/NavBar';
import DatePicker from 'react-native-date-picker';
import useRideBookingLocationStore from '../store/useRideBookingLocationStore';
import { useTranslation } from 'react-i18next';
import useRideBookingInfo from '../store/useRideBookingInfo';
import { useStackScreenStore } from '../../../store/useStackScreenStore';

const ItineraryPlanScreen = ({
  itineraryDates,
  onLocationClick,
  onTripForPress,
  onAddItineraryLocation,
  onRemoveItineraryLocation,
  onAddDay,
  themeColor = { primary: '#FF2B2B', secondary: '#D60000', accent: '#FF6B6B' },
}) => {
  const { t } = useTranslation();
  const { goBack } = useStackScreenStore();
  const { rideBookMode, passangerDetails, actingDriverItinerary, updateBookingInfo } = useRideBookingInfo();
  const { rideStartLocation, rideEndLocation } = useRideBookingLocationStore();

  const destination = rideEndLocation ? utils.formatAddressName(rideEndLocation) : 'Select Destination';
  const pickup = rideStartLocation ? utils.formatAddressName(rideStartLocation) : 'Select Pickup Location';

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeTimeDateStr, setActiveTimeDateStr] = useState(null);
  const [activeLocationIndex, setActiveLocationIndex] = useState(null);
  const [activeTimeType, setActiveTimeType] = useState('pickup'); // 'pickup' or 'drop'
  const [tempTime, setTempTime] = useState(new Date());

  const openTimePicker = (dateStr, locIndex, timeType, existingTime) => {
    setActiveTimeDateStr(dateStr);
    setActiveLocationIndex(locIndex);
    setActiveTimeType(timeType);
    setTempTime(existingTime ? new Date(existingTime) : new Date());
    setShowTimePicker(true);
  };

  const handleTimeConfirm = (date) => {
    if (activeTimeDateStr && activeLocationIndex !== null) {
      const currentDayItin = actingDriverItinerary?.[activeTimeDateStr] || {};
      const locations = [...(currentDayItin.locations || [])];
      if (locations[activeLocationIndex]) {
        locations[activeLocationIndex] = {
          ...locations[activeLocationIndex],
          [activeTimeType === 'pickup' ? 'pickupTime' : 'dropTime']: date.toISOString(),
        };
        updateBookingInfo({
          actingDriverItinerary: {
            ...actingDriverItinerary,
            [activeTimeDateStr]: { ...currentDayItin, locations },
          }
        });
      }
    }
    setShowTimePicker(false);
    setActiveTimeDateStr(null);
    setActiveLocationIndex(null);
  };

  const toggleLocStatus = (dateStr, locIndex) => {
    const currentDayItin = actingDriverItinerary?.[dateStr] || {};
    const locations = [...(currentDayItin.locations || [])];
    if (locations[locIndex]) {
      const current = locations[locIndex].status || 'Visit';
      locations[locIndex] = { ...locations[locIndex], status: current === 'Visit' ? 'Drop' : 'Visit' };
      updateBookingInfo({
        actingDriverItinerary: {
          ...actingDriverItinerary,
          [dateStr]: { ...currentDayItin, locations },
        }
      });
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '09:00 AM';
    const d = new Date(dateString);
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  // Fallback to at least 1 day if empty
  const [localDatesToRender, setLocalDatesToRender] = useState(itineraryDates?.length > 0 ? itineraryDates : [new Date().toISOString()]);

  const handleLocalAddDay = () => {
    if (onAddDay) {
      onAddDay(); // trigger parent update (e.g. updating the global store)
    }
    
    const lastDateStr = localDatesToRender[localDatesToRender.length - 1];
    const d = new Date(lastDateStr);
    d.setDate(d.getDate() + 1);
    
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    const newDateStr = `${year}-${month}-${day}`;
    
    setLocalDatesToRender([...localDatesToRender, newDateStr]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F7FA' }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={colors.black} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              {/* <Text style={styles.stepText}>Step 3 of 4</Text> */}
              <Text style={styles.titleText}>Itinerary Planner</Text>
            </View>
          </View>

          <View style={styles.infoBanner}>
            <Ionicons name="document-text-outline" size={32} color={themeColor.primary} style={styles.infoIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoBannerTitle}>Plan your trip itinerary (Optional)</Text>
              <Text style={styles.infoBannerSub}>You can add places, dates and timings for better driver planning.</Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >


          {/* Timeline Cards */}
          <View style={styles.timelineContainer}>
            <View style={styles.timelineAxis} />
            {localDatesToRender.map((dateStr, index) => {
              const dayItinerary = actingDriverItinerary?.[dateStr] || {};
              const dayDateFormatted = formatDateDisplay(dateStr);

              return (
                <View key={index} style={styles.dayWrapper}>
                  {/* Timeline Node */}
                  <View style={[styles.dayCircle, { backgroundColor: themeColor.primary, shadowColor: themeColor.primary }]}>
                    <Text style={styles.dayCircleText}>{index + 1}</Text>
                  </View>

                  <View style={styles.cardContainer}>
                    {/* Top Row: Title */}
                    <View style={styles.cardHeaderRow}>
                      <Text style={[styles.dayTitle, { color: themeColor.primary }]}>
                        Day {index + 1} <Text style={styles.dayTitleDate}>({dayDateFormatted})</Text>
                      </Text>
                    </View>

                    {/* Body Row: Content */}
                    <View style={styles.cardBodyRow}>

                    <View style={styles.cardContent}>
                      <DraggableFlatList
                        data={dayItinerary.locations || []}
                        keyExtractor={(_, i) => `loc-${dateStr}-${i}`}
                        onDragEnd={({ data: reordered }) => {
                          const currentDayItin = actingDriverItinerary?.[dateStr] || {};
                          updateBookingInfo({
                            actingDriverItinerary: {
                              ...actingDriverItinerary,
                              [dateStr]: { ...currentDayItin, locations: reordered },
                            }
                          });
                        }}
                        scrollEnabled={false}
                        containerStyle={{ gap: 8 }}
                        renderItem={({ item: loc, getIndex, drag, isActive }) => {
                          const locIndex = getIndex();
                          return (
                            <ScaleDecorator>
                              <View style={[styles.itineraryLocationRow, isActive && { elevation: 8, opacity: 0.95 }]}>
                                {/* Drag handle strip on the left */}
                                <TouchableOpacity onLongPress={drag} delayLongPress={100} style={styles.dragHandle}>
                                  <Ionicons name="reorder-four-outline" size={22} color="#94A3B8" style={{ marginTop: -10 }} />
                                </TouchableOpacity>

                                {/* Card content */}
                                <View style={{ flex: 1, gap: 8 }}>
                                {/* Location name row */}
                                <View style={styles.locNameRow}>
                                  <Ionicons name="location" size={16} color={themeColor.secondary} />
                                  <Text style={styles.itineraryLocationText} numberOfLines={1}>
                                    {loc.name || loc.address}
                                  </Text>
                                  {onRemoveItineraryLocation && (
                                    <TouchableOpacity
                                      style={{ padding: 4 }}
                                      onPress={() => onRemoveItineraryLocation(dateStr, locIndex)}
                                      activeOpacity={0.7}
                                    >
                                      <Ionicons name="close-circle" size={18} color="#999" />
                                    </TouchableOpacity>
                                  )}
                                </View>

                                {/* Time + Status row */}
                                <View style={styles.locMetaRow}>
                                  <TouchableOpacity
                                    style={styles.locTimeButton}
                                    onPress={() => openTimePicker(dateStr, locIndex, 'pickup', loc.pickupTime)}
                                    activeOpacity={0.7}
                                  >
                                    <Ionicons name="arrow-up-circle-outline" size={12} color={themeColor.primary} />
                                    <Text style={[styles.locTimeText, { color: themeColor.primary }]}>
                                      {loc.pickupTime ? formatTime(loc.pickupTime) : 'Pickup'}
                                    </Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    style={styles.locTimeButton}
                                    onPress={() => openTimePicker(dateStr, locIndex, 'drop', loc.dropTime)}
                                    activeOpacity={0.7}
                                  >
                                    <Ionicons name="arrow-down-circle-outline" size={12} color="#E53935" />
                                    <Text style={[styles.locTimeText, { color: '#E53935' }]}>
                                      {loc.dropTime ? formatTime(loc.dropTime) : 'Drop'}
                                    </Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    style={[
                                      styles.locStatusBadge,
                                      { backgroundColor: (loc.status || 'Visit') === 'Visit' ? '#E8F5E9' : '#FFF3E0',
                                        borderColor: (loc.status || 'Visit') === 'Visit' ? '#4CAF50' : '#FF9800' }
                                    ]}
                                    onPress={() => toggleLocStatus(dateStr, locIndex)}
                                    activeOpacity={0.8}
                                  >
                                    <Ionicons
                                      name={(loc.status || 'Visit') === 'Visit' ? 'eye-outline' : 'flag-outline'}
                                      size={12}
                                      color={(loc.status || 'Visit') === 'Visit' ? '#4CAF50' : '#FF9800'}
                                    />
                                    <Text style={[styles.locStatusText, { color: (loc.status || 'Visit') === 'Visit' ? '#4CAF50' : '#FF9800' }]}>
                                      {loc.status || 'Visit'}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                                </View>{/* end flex:1 content */}
                              </View>
                            </ScaleDecorator>
                          );
                        }}
                      />
                        
                        <TouchableOpacity
                          style={styles.addItineraryLocBtn}
                          onPress={() => onAddItineraryLocation(dateStr)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="add" size={18} color={themeColor.secondary} />
                          <Text style={[styles.addItineraryLocText, { color: themeColor.secondary }]}>Add Location</Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                  </View>
                </View>
              );
            })}
            
            {/* Add Another Day Button */}
            {onAddDay && (
              <TouchableOpacity 
                style={styles.addDayButton} 
                onPress={handleLocalAddDay}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={20} color={themeColor.primary} />
                <Text style={[styles.addDayText, { color: themeColor.primary }]}>Add Another Day</Text>
              </TouchableOpacity>
            )}
          </View>
          </ScrollView>
        </View>

        {/* Floating Action Button (FAB) Footer */}
        <View style={styles.fabContainer}>
          <TouchableOpacity onPress={() => goBack()} activeOpacity={0.85}>
            <LinearGradient
              colors={[themeColor.primary, themeColor.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.fabButton, { shadowColor: themeColor.primary }]}
            >
              <Text style={styles.fabButtonText}>Done Planning</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      </GestureHandlerRootView>

      <DatePicker
        modal
        open={showTimePicker}
        date={tempTime}
        mode="time"
        theme="light"
        onConfirm={(date) => {
          setTempTime(date);
          handleTimeConfirm(date);
        }}
        onCancel={() => {
          setShowTimePicker(false);
          setActiveTimeDateStr(null);
          setActiveLocationIndex(null);
        }}
      />
    </View>
  );
};

ItineraryPlanScreen.propTypes = {
  itineraryDates: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAddItineraryLocation: PropTypes.func,
  onRemoveItineraryLocation: PropTypes.func,
  onAddDay: PropTypes.func,
  themeColor: PropTypes.object,
};

ItineraryPlanScreen.defaultProps = {
  onAddItineraryLocation: () => {},
  onRemoveItineraryLocation: null,
  onAddDay: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F4F7FA', // Modern soft background
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120, // space for FAB
    paddingTop: 10,
  },
  
  /* Step Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
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
    marginBottom: 20,
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

  /* Info Banner */
  infoBanner: {
    backgroundColor: '#F0FDF4', // Light green
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoBannerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#0F223C',
    marginBottom: 4,
  },
  infoBannerSub: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#475569',
  },

  /* Timeline */
  timelineContainer: {
    paddingHorizontal: 20,
    position: 'relative',
  },
  timelineAxis: {
    position: 'absolute',
    left: 35, // 20 padding + 15 half-circle
    top: 16,
    bottom: 24,
    width: 2,
    backgroundColor: '#CBD5E1',
    borderRadius: 1,
  },
  dayWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  dayCircle: {
    position: 'absolute',
    left: 0,
    top: 14, 
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0F4A75', 
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 3,
    shadowColor: '#0F4A75',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dayCircleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },

  /* Cards */
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginLeft: 46, // Space for circle + margin
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#0F4A75',
  },
  dayTitleDate: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#94A3B8',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F7FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  dayTime: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#0F4A75',
  },
  cardBodyRow: {
    marginTop: 0,
  },
  itineraryLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white_dirt,
    paddingVertical: 10,
    paddingRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  locNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    marginRight: 8,
  },
  itineraryLocationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.black,
    marginLeft: 8,
  },
  locMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  locTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  locTimeText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
  },
  locStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  locStatusText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
  },
  addItineraryLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 4,
  },
  addItineraryLocText: {
    fontSize: 14,
    fontFamily: Fonts.semi_bold,
    color: actingDriverColors.secondary,
    marginLeft: 4,
  },

  /* Add Day Button */
  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 46, // Align with cards
    backgroundColor: '#F0F7FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 16,
  },
  addDayText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#0F4A75',
    marginLeft: 8,
  },

  /* FAB Footer */
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  fabButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  fabButtonText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },

  /* Modal Overlays */
  timePickerModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  timePickerModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  timePickerModalTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#0F4A75',
    marginBottom: 16,
  },
  timePickerModalActions: {
    marginTop: 24,
    width: '100%',
  },
  timePickerOkButton: {
    backgroundColor: actingDriverColors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  timePickerOkButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
});

export default ItineraryPlanScreen;

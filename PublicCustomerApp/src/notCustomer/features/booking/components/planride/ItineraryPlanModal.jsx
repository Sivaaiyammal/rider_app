import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import { colors, Fonts, actingDriverColors } from '../../../../constants/constants';
import { utils } from '../../../../utils/Utils';
import NavBar from '../../../../components/NavBar';
import useRideBookingLocationStore from '../../store/useRideBookingLocationStore';
import { useTranslation } from 'react-i18next';
import useRideBookingInfo from '../../store/useRideBookingInfo';
import RideLocationSetBox from './RideLocationSetBox';
import { addLocation } from '../../../../styles/AddLocationStyles';

const ItineraryPlanModal = ({
  visible,
  onClose,
  itineraryDates,
  onLocationClick,
  onTripForPress,
  onAddWaypoint,
}) => {
  const { t } = useTranslation();
  const { rideBookMode, passangerDetails } = useRideBookingInfo();
  const { rideStartLocation, rideEndLocation } = useRideBookingLocationStore();

  const destination = rideEndLocation ? utils.formatAddressName(rideEndLocation) : 'Select Destination';
  const pickup = rideStartLocation ? utils.formatAddressName(rideStartLocation) : 'Select Pickup Location';

  // Fallback to at least 1 day if empty
  const datesToRender = itineraryDates?.length > 0 ? itineraryDates : [new Date().toISOString()];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <NavBar
          withBg
          onBackPress={onClose}
          title="Plan Your Itinerary"
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Daily Schedule</Text>
            <Text style={styles.headerSubtitle}>{datesToRender.length} Stops Planned</Text>
          </View>

          {/* Timeline Cards */}
          <View style={styles.timelineContainer}>
            {datesToRender.map((dateStr, index) => {
              // Placeholder titles like the reference image
              const titles = ["Arrival & Transit", "Corporate Site Visit", "Return Flight"];
              const dayTitle = titles[index % titles.length];

              // Generic times for UI aesthetics
              const times = ["08:30 AM", "09:15 AM", "02:00 PM"];
              const dayTime = times[index % times.length];

              // Generic pill values
              const durations = ["1h 20m", "55m", "1h 45m"];
              const distances = ["24.5 mi", "42.1 mi", "31.2 mi"];
              const duration = durations[index % durations.length];
              const distance = distances[index % distances.length];

              return (
                <View key={index} style={styles.cardContainer}>
                  {/* Top Row: Circle + Title + Time */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.dayCircle}>
                      <Text style={styles.dayCircleText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.dayTitle}>Day {index + 1}: {dayTitle}</Text>
                    <Text style={styles.dayTime}>{dayTime}</Text>
                  </View>

                  {/* Body Row: Dashed Line + Content */}
                  <View style={styles.cardBodyRow}>
                    <View style={styles.dashedLineContainer}>
                      <View style={styles.verticalDashedLine} />
                    </View>

                    <View style={styles.cardContent}>
                      {/* Interactive Location Set Box */}
                      <RideLocationSetBox 
                        onAddWaypoint={onAddWaypoint}
                        onLocationClick={onLocationClick}
                        hideDestination={false}
                        dayHeader={null}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.doneButton} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

ItineraryPlanModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  itineraryDates: PropTypes.arrayOf(PropTypes.string).isRequired,
  onLocationClick: PropTypes.func,
  onTripForPress: PropTypes.func,
  onAddWaypoint: PropTypes.func,
};

ItineraryPlanModal.defaultProps = {
  onLocationClick: () => {},
  onTripForPress: () => {},
  onAddWaypoint: () => {},
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F8FAFC', // light gray/blue background
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 10,
  },
  
  /* Header */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold || Fonts.semi_bold,
    color: '#003366',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#64748B',
  },

  /* Timeline */
  timelineContainer: {
    paddingHorizontal: 16,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  /* Card Header */
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F4A75', // Dark blue as in the image
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dayCircleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  dayTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: '#0F4A75',
  },
  dayTime: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#475569',
  },

  /* Card Body */
  cardBodyRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  dashedLineContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  verticalDashedLine: {
    width: 1,
    flex: 1,
    borderStyle: 'dashed',
    borderLeftWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 10,
  },
  cardContent: {
    flex: 1,
    paddingTop: 8,
  },

  /* Locations */
  locationItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  locIconWrap: {
    width: 20,
    alignItems: 'center',
    marginTop: 2,
    marginRight: 10,
  },
  greenRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
  },
  locTextWrap: {
    flex: 1,
  },
  locLabel: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  locValue: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#0F4A75',
    lineHeight: 20,
  },

  /* Pills */
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  pillText: {
    fontSize: 11,
    fontFamily: Fonts.semi_bold || Fonts.medium,
    color: '#3730A3',
  },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: actingDriverColors.background,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: actingDriverColors.border,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  doneButton: {
    backgroundColor: actingDriverColors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold || Fonts.semi_bold,
    color: colors.white,
  },
});

export default ItineraryPlanModal;


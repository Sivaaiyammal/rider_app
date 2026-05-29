import React, { useState } from 'react';
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
import RideLocationSetBox from './RideLocationSetBox';

const ItineraryPlanModal = ({
  visible,
  onClose,
  itineraryDates,
  actingDriverItinerary,
  setActingDriverItinerary,
  onAddWaypoint,
  onLocationClick,
}) => {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>

        {/* NavBar — same as every other screen */}
        <NavBar
          withBg
          onBackPress={onClose}
          title="Plan Your Itinerary"
        />

        {/* Day Phase Tabs */}
        <View style={styles.dayTabsRow}>
          {itineraryDates.map((dateStr, idx) => (
            <TouchableOpacity
              key={dateStr}
              style={[styles.dayTab, activeDay === idx && styles.dayTabActive]}
              onPress={() => setActiveDay(idx)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dayTabPhase, activeDay === idx && styles.dayTabPhaseActive]}>
                PHASE
              </Text>
              <Text style={[styles.dayTabLabel, activeDay === idx && styles.dayTabLabelActive]}>
                Day {idx + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Location Set Box — updates label/date per active day */}
          <RideLocationSetBox
            onAddWaypoint={onAddWaypoint}
            onLocationClick={onLocationClick}
            hideDestination={false}
            dayHeader={itineraryDates[activeDay] ? {
              label: `Day ${activeDay + 1}`,
              date: utils.formatDate(itineraryDates[activeDay], 'DD MMM, ddd'),
            } : null}
          />

          {/* Summary Cards */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Trip Summary</Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Duration</Text>
                <Text style={styles.summaryValue}>
                  {itineraryDates.length} {itineraryDates.length === 1 ? 'Day' : 'Days'}
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Est. Distance</Text>
                <Text style={styles.summaryValue}>— km</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Fuel Saver</Text>
                <Text style={[styles.summaryValue, { color: actingDriverColors.success }]}>Optimized</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Booking Status</Text>
                <Text style={styles.summaryValue}>Draft</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer — same as continueButton on PlanRideScreen */}
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
  actingDriverItinerary: PropTypes.object,
  setActingDriverItinerary: PropTypes.func.isRequired,
  onAddWaypoint: PropTypes.func,
  onLocationClick: PropTypes.func,
};

ItineraryPlanModal.defaultProps = {
  actingDriverItinerary: {},
  onAddWaypoint: () => {},
  onLocationClick: () => {},
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* ── Day Tabs ── */
  dayTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: actingDriverColors.background,
    borderBottomWidth: 1,
    borderBottomColor: actingDriverColors.border,
  },
  dayTab: {
    flex: 1,
    backgroundColor: colors.grey,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: actingDriverColors.border,
  },
  dayTabActive: {
    backgroundColor: actingDriverColors.primary,
    borderColor: actingDriverColors.primary,
  },
  dayTabPhase: {
    fontSize: 9,
    fontFamily: Fonts.medium,
    color: colors.grey_xxdark,
    letterSpacing: 1,
  },
  dayTabPhaseActive: {
    color: actingDriverColors.secondary,
  },
  dayTabLabel: {
    fontSize: 14,
    fontFamily: Fonts.semi_bold || Fonts.medium,
    color: colors.grey_xxdark,
    marginTop: 2,
  },
  dayTabLabelActive: {
    color: actingDriverColors.secondary,
  },

  /* ── Scroll ── */
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 4,
  },

  /* ── Summary Section ── */
  sectionCard: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: actingDriverColors.background,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: actingDriverColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.semi_bold || Fonts.medium,
    color: actingDriverColors.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: colors.white_dirt,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: actingDriverColors.border,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: Fonts.bold || Fonts.semi_bold,
    color: actingDriverColors.secondary,
  },

  /* ── Footer ── */
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: actingDriverColors.background,
    paddingHorizontal: 12,
    paddingBottom: 28,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: actingDriverColors.border,
  },
  doneButton: {
    backgroundColor: actingDriverColors.secondary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semi_bold || Fonts.medium,
    color: colors.white,
  },
});

export default ItineraryPlanModal;

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
        <View style={styles.dayTabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayTabsContent}
          >
            {itineraryDates.map((dateStr, idx) => (
              <TouchableOpacity
                key={dateStr}
                style={[styles.dayTab, activeDay === idx && styles.dayTabActive]}
                onPress={() => setActiveDay(idx)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayTabLabel, activeDay === idx && styles.dayTabLabelActive]}>
                  Day {idx + 1}
                </Text>
                <Text style={[styles.dayTabDate, activeDay === idx && styles.dayTabDateActive]}>
                  {utils.formatDate(dateStr, 'DD MMM')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Active Day Header Banner */}
          {itineraryDates[activeDay] && (
            <View style={styles.activeDayBanner}>
              <View style={styles.activeDayIconWrap}>
                <Ionicons name="time-outline" size={20} color={actingDriverColors.secondary} />
              </View>
              <View style={styles.activeDayTextWrap}>
                <Text style={styles.activeDayTitle}>
                  Day {activeDay + 1} Route
                </Text>
                <Text style={styles.activeDaySubtitle}>
                  {utils.formatDate(itineraryDates[activeDay], 'dddd, DD MMMM YYYY')}
                </Text>
              </View>
            </View>
          )}

          {/* Location Set Box — updates label/date per active day */}
          <RideLocationSetBox
            onAddWaypoint={onAddWaypoint}
            onLocationClick={onLocationClick}
            hideDestination={false}
            dayHeader={null} // We show the customized activeDayBanner instead!
          />

          {/* Summary Cards */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Trip Summary</Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryCardHeader}>
                  <Ionicons name="calendar-outline" size={20} color={actingDriverColors.secondary} />
                  <Text style={styles.summaryLabel}>Duration</Text>
                </View>
                <Text style={styles.summaryValue}>
                  {itineraryDates.length} {itineraryDates.length === 1 ? 'Day' : 'Days'}
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryCardHeader}>
                  <Ionicons name="navigate-outline" size={20} color={actingDriverColors.secondary} />
                  <Text style={styles.summaryLabel}>Distance</Text>
                </View>
                <Text style={styles.summaryValue}>— km</Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryCardHeader}>
                  <Ionicons name="leaf-outline" size={20} color={actingDriverColors.success} />
                  <Text style={styles.summaryLabel}>Fuel Saver</Text>
                </View>
                <Text style={[styles.summaryValue, { color: actingDriverColors.success }]}>Optimized</Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryCardHeader}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={actingDriverColors.secondary} />
                  <Text style={styles.summaryLabel}>Status</Text>
                </View>
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
  dayTabsWrapper: {
    backgroundColor: actingDriverColors.background,
    borderBottomWidth: 1,
    borderBottomColor: actingDriverColors.border,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  dayTabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  dayTab: {
    width: 85,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: actingDriverColors.border,
  },
  dayTabActive: {
    backgroundColor: actingDriverColors.primary,
    borderColor: actingDriverColors.primary,
    elevation: 3,
    shadowColor: actingDriverColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dayTabLabel: {
    fontSize: 13,
    fontFamily: Fonts.semi_bold || Fonts.medium,
    color: colors.grey_xxdark,
  },
  dayTabLabelActive: {
    color: actingDriverColors.secondary,
    fontFamily: Fonts.bold || Fonts.semi_bold,
  },
  dayTabDate: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#64748B',
    marginTop: 2,
  },
  dayTabDateActive: {
    color: actingDriverColors.secondary,
    fontFamily: Fonts.medium,
  },

  /* ── Active Day Banner ── */
  activeDayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  activeDayIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activeDayTextWrap: {
    flex: 1,
  },
  activeDayTitle: {
    fontSize: 14,
    fontFamily: Fonts.bold || Fonts.semi_bold,
    color: actingDriverColors.secondary,
  },
  activeDaySubtitle: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#6B7280',
    marginTop: 2,
  },

  /* ── Scroll ── */
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 4,
  },

  /* ── Summary Section ── */
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: actingDriverColors.background,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: actingDriverColors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: Fonts.bold || Fonts.semi_bold,
    color: '#64748B',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 15,
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

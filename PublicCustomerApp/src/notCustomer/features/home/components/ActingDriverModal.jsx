import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { Calendar } from 'react-native-calendars';
import PropTypes from 'prop-types';
import { colors, Fonts, actingDriverColors } from '../../../constants/constants';
import { utils } from '../../../utils/Utils';

const DATE_TABS = [
  { key: 'TODAY', label: 'Today', icon: 'calendar-clear-outline' },
  { key: 'TOMORROW', label: 'Tomorrow', icon: 'calendar-outline' },
  { key: 'SCHEDULE', label: 'Schedule', icon: 'time-outline' },
  { key: 'CUSTOM', label: 'Custom Dates', icon: 'calendar-number-outline' },
];

const formatCalendarDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ActingDriverModal = ({ visible, onClose, onTripTypeSelect, loading }) => {
  const [activeTab, setActiveTab] = useState('TODAY');
  
  // Duration state
  const [durationOption, setDurationOption] = useState('HOURLY'); // 'HOURLY', 'FULL_DAY', 'CUSTOM_HOURS'
  const [customHours, setCustomHours] = useState(4);
  
  // Date/Time state
  const [scheduleDateTime, setScheduleDateTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Custom Date Range state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleProceed = () => {
    onTripTypeSelect({
      bookingTab: activeTab,
      durationOption,
      customHours,
      scheduleDateTime,
      startDate,
      endDate
    });
  };

  const renderDurationSelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionLabel}>Select Duration</Text>
      <View style={styles.chipsRow}>
        <TouchableOpacity
          style={[styles.chipButton, durationOption === 'HOURLY' && styles.chipButtonSelected]}
          onPress={() => setDurationOption('HOURLY')}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, durationOption === 'HOURLY' && styles.chipTextSelected]}>
            Hourly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chipButton, durationOption === 'FULL_DAY' && styles.chipButtonSelected]}
          onPress={() => setDurationOption('FULL_DAY')}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, durationOption === 'FULL_DAY' && styles.chipTextSelected]}>
            Full Day (12 hrs)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chipButton, durationOption === 'CUSTOM_HOURS' && styles.chipButtonSelected]}
          onPress={() => setDurationOption('CUSTOM_HOURS')}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, durationOption === 'CUSTOM_HOURS' && styles.chipTextSelected]}>
            Custom Hours
          </Text>
        </TouchableOpacity>
      </View>

      {durationOption === 'CUSTOM_HOURS' && (
        <View style={styles.stepperContainer}>
          <Text style={styles.stepperLabel}>Duration (Hours)</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setCustomHours(prev => Math.max(1, prev - 1))}
            >
              <Ionicons name="remove-circle-outline" size={24} color={actingDriverColors.secondary} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{customHours} {customHours === 1 ? 'Hour' : 'Hours'}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setCustomHours(prev => Math.min(24, prev + 1))}
            >
              <Ionicons name="add-circle-outline" size={24} color={actingDriverColors.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const getMarkedDates = () => {
    if (!startDate) return {};
    const marked = {};
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    
    let current = new Date(start);
    while (current <= end) {
      const dateString = formatCalendarDate(current);
      marked[dateString] = {
        color: actingDriverColors.primary,
        textColor: actingDriverColors.secondary,
        startingDay: dateString === startDate,
        endingDay: dateString === (endDate || startDate),
      };
      current.setDate(current.getDate() + 1);
    }
    return marked;
  };

  const handleDayPress = (day) => {
    const selectedDate = day.dateString;
    if (!startDate || (startDate && endDate)) {
      setStartDate(selectedDate);
      setEndDate(null);
    } else if (selectedDate < startDate) {
      setStartDate(selectedDate);
      setEndDate(null);
    } else {
      setEndDate(selectedDate);
    }
  };

  const isProceedDisabled = activeTab === 'CUSTOM' && (!startDate);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      
      <View style={styles.panel}>
        <View style={styles.handle} />
        
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Acting Driver</Text>
            <Text style={styles.subtitle}>Plan your trip timeline</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={actingDriverColors.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          {DATE_TABS.map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabItem, isSelected && styles.tabItemActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={tab.icon} 
                  size={24} 
                  color={isSelected ? actingDriverColors.secondary : colors.grey_dark} 
                  style={styles.tabIcon}
                />
                <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>
                  {tab.label}
                </Text>
                {isSelected && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {activeTab === 'TOMORROW' && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Select Start Time</Text>
              <TouchableOpacity
                style={styles.selectorBox}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={20} color={actingDriverColors.secondary} />
                <Text style={styles.selectorText}>
                  {utils.timestampTo12HourFormat(scheduleDateTime)}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.grey_dark} />
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'SCHEDULE' && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Select Date & Time</Text>
              <TouchableOpacity
                style={styles.selectorBox}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={20} color={actingDriverColors.secondary} />
                <Text style={styles.selectorText}>
                  {utils.formatDate(scheduleDateTime, 'DD MMM YYYY, hh:mm A')}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.grey_dark} />
              </TouchableOpacity>
            </View>
          )}

          {activeTab !== 'CUSTOM' && renderDurationSelector()}

          {activeTab === 'CUSTOM' && (
            <>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Select Start Time</Text>
              <TouchableOpacity
                style={styles.selectorBox}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={20} color={actingDriverColors.secondary} />
                <Text style={styles.selectorText}>
                  {utils.timestampTo12HourFormat(scheduleDateTime)}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.grey_dark} />
              </TouchableOpacity>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Select Date Range</Text>
              <Calendar
                minDate={formatCalendarDate(new Date())}
                onDayPress={handleDayPress}
                markingType="period"
                markedDates={getMarkedDates()}
                theme={{
                  calendarBackground: colors.white_dirt,
                  textSectionTitleColor: colors.grey_xxdark,
                  todayTextColor: actingDriverColors.secondary,
                  dayTextColor: colors.black,
                  textDayFontFamily: Fonts.regular,
                  textMonthFontFamily: Fonts.medium,
                  textDayHeaderFontFamily: Fonts.medium,
                  arrowColor: actingDriverColors.secondary,
                }}
                style={styles.calendar}
              />
            </View>
            </>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[styles.proceedButton, isProceedDisabled && styles.proceedButtonDisabled]}
          activeOpacity={0.8}
          onPress={handleProceed}
          disabled={isProceedDisabled}
        >
          <Text style={styles.proceedButtonText}>Proceed to Plan Trip</Text>
          <Ionicons name="arrow-forward-outline" size={18} color={colors.white} />
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={actingDriverColors.primary} />
            <Text style={styles.loadingText}>Initializing acting driver info...</Text>
          </View>
        )}
      </View>

      <DatePicker
        modal
        open={showTimePicker}
        date={scheduleDateTime}
        mode="time"
        theme="light"
        onConfirm={(date) => {
          setShowTimePicker(false);
          setScheduleDateTime(date);
        }}
        onCancel={() => setShowTimePicker(false)}
      />

      <DatePicker
        modal
        open={showDatePicker}
        date={scheduleDateTime}
        mode="datetime"
        minimumDate={new Date()}
        theme="light"
        onConfirm={(date) => {
          setShowDatePicker(false);
          setScheduleDateTime(date);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </Modal>
  );
};

ActingDriverModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onTripTypeSelect: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

ActingDriverModal.defaultProps = {
  loading: false,
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    backgroundColor: actingDriverColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 36,
    paddingTop: 10,
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: actingDriverColors.border,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.bold || Fonts.semi_bold,
    color: actingDriverColors.secondary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
  },
  closeBtn: {
    padding: 4,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: colors.white_dirt,
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.grey_dark,
  },
  tabLabelSelected: {
    color: actingDriverColors.secondary,
    fontFamily: Fonts.bold || Fonts.semi_bold,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: '40%',
    height: 3,
    backgroundColor: actingDriverColors.secondary,
    borderRadius: 3,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: Fonts.semi_bold || Fonts.medium,
    color: actingDriverColors.secondary,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: actingDriverColors.border,
  },
  chipButtonSelected: {
    backgroundColor: actingDriverColors.primary,
    borderColor: actingDriverColors.primary,
  },
  chipText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.grey_xxdark,
  },
  chipTextSelected: {
    color: actingDriverColors.secondary,
    fontFamily: Fonts.semi_bold,
  },
  stepperContainer: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: actingDriverColors.border,
  },
  stepperLabel: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.grey_dark,
    marginBottom: 12,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperBtn: {
    padding: 8,
  },
  stepperValue: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: actingDriverColors.secondary,
  },
  selectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: actingDriverColors.border,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: actingDriverColors.secondary,
  },
  calendar: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: actingDriverColors.border,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: actingDriverColors.secondary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  proceedButtonDisabled: {
    opacity: 0.5,
  },
  proceedButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semi_bold,
    color: colors.white,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
  },
});

export default ActingDriverModal;

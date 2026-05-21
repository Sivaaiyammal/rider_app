import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';
import { Colors, Fonts } from '../../../common/constants/constants';
import { DateTimeFormatter } from '../../../common/utils/DateTimeFormatter';

const DriverCalendarView = ({
  t,
  currentDate,
  trips,
  loading,
  selectedDate,
  selectedTrips,
  monthActingTrips,
  selectedActingTrips,
  getDaysInMonth,
  getFirstDayOfMonth,
  getTripsForDate,
  hasActingTrips,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
  onTripSelect,
  onStartTrip,
  onViewLocation,
}) => {
  const getTripStatusColor = status => {
    if (status === 'COMPLETED') {
      return Colors.green_online;
    }
    if (status === 'CANCELLED') {
      return Colors.danger_red;
    }
    return Colors.blue_xxdark;
  };

  const getTripStatusBgColor = status => {
    if (status === 'COMPLETED') {
      return Colors.green_xxlight || 'rgba(41, 152, 101, 0.1)';
    }
    if (status === 'CANCELLED') {
      return 'rgba(216, 56, 56, 0.1)';
    }
    return Colors.blue_xxlight || 'rgba(232, 244, 255, 1)';
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected =
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear();
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentDate.getMonth() &&
        new Date().getFullYear() === currentDate.getFullYear();
      const dayTrips = getTripsForDate(date);
      const hasTrips = dayTrips.length > 0;
      const hasActing = hasActingTrips(date);
      const hasRegular = dayTrips.some(trip => !trip.isActingDriverTrip);

      days.push(
        <TouchableOpacity
          key={day}
          style={styles.dayCell}
          onPress={() => onDateSelect(day)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.dayContent,
            isToday && styles.dayContentToday,
            isSelected && styles.dayContentSelected,
          ]}>
            <Text style={[
              styles.dayText,
              isToday && styles.dayTextToday,
              isSelected && styles.dayTextSelected,
            ]}>
              {day}
            </Text>
            
            <View style={styles.dotsContainer}>
              {hasActing && (
                <View style={[
                  styles.dotIndicator,
                  styles.actingDot,
                  isSelected && styles.selectedDot,
                ]} />
              )}
              {hasRegular && (
                <View style={[
                  styles.dotIndicator,
                  styles.regularDot,
                  isSelected && styles.selectedDot,
                ]} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const renderTripItem = ({ item }) => (
    <View
      style={[
        styles.tripCard,
        item.isActingDriverTrip && styles.actingTripCard,
      ]}
    >
      <TouchableOpacity
        onPress={() => onTripSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.tripHeader}>
          <View style={styles.tripHeaderInfo}>
            <Text style={styles.tripTime}>
              {DateTimeFormatter.requiredDateFormat(item.bookingTime, 'ddd MMM DD, YYYY')} | {DateTimeFormatter.requiredDateFormat(item.bookingTime, 'hh:mm A')}
            </Text>
            <Text style={styles.tripIdText} numberOfLines={1}>
              ID: {item._id}
            </Text>
          </View>
          <View style={styles.tripBadges}>
            {item.isActingDriverTrip && (
              <View style={styles.actingBadge}>
                <Text style={styles.actingBadgeText}>Acting Driver</Text>
              </View>
            )}
            <View style={[styles.statusBadge, { backgroundColor: getTripStatusBgColor(item.status) }]}>
              <Text style={[
                styles.tripStatusText,
                { color: getTripStatusColor(item.status) }
              ]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        {item.isActingDriverTrip && item.customerInfo && (
          <View style={styles.customerSection}>
            <View style={styles.customerInfo}>
              <View style={styles.avatarContainer}>
                {item.customerInfo.image ? (
                  <Image
                    source={{ uri: item.customerInfo.image }}
                    style={styles.avatar}
                  />
                ) : (
                  <MaterialIcons name="account-circle" size={40} color={Colors.cool_grey} />
                )}
              </View>
              <View style={styles.customerTextInfo}>
                <Text style={styles.customerName}>{item.customerInfo.name}</Text>
                <Text style={styles.customerPhone}>{item.customerInfo.phone}</Text>
              </View>
              <View style={styles.callButton}>
                <MaterialIcons name="phone" size={18} color={Colors.blue_xxdark} />
              </View>
            </View>
          </View>
        )}

        <View style={styles.tripDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="directions-car" size={16} color={Colors.blue_xxdark} />
            <Text style={styles.detailText}>
              {item.finalDistance ? `${parseFloat(item.finalDistance).toFixed(2)} km` : 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={16} color={Colors.blue_xxdark} />
            <Text style={styles.detailText}>
              {item.finalDuration ? `${item.finalDuration} min` : 'N/A'}
            </Text>
          </View>
          {item.status === 'COMPLETED' && (
            <View style={styles.detailRow}>
              <MaterialIcons name="payments" size={16} color={Colors.green_online} />
              <Text style={[styles.detailText, { color: Colors.green_online, fontFamily: Fonts.medium }]}>
                ₹{item.paymentDetails?.fareDetails?.fare ? parseFloat(item.paymentDetails.fareDetails.fare).toFixed(2) : '0.00'}
              </Text>
            </View>
          )}
        </View>

        {item.stops?.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.locationSection}>
              <View style={styles.locationItem}>
                <View style={styles.locationIconContainer}>
                  <View style={styles.startLocationIcon}>
                    <View style={styles.startLocationDot} />
                  </View>
                </View>
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationLabel}>Pickup Point</Text>
                  <Text style={styles.locationAddress} numberOfLines={2}>
                    {item.stops[0]?.address || 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.connectionLine} />

              <View style={styles.locationItem}>
                <View style={styles.locationIconContainer}>
                  <MaterialIcons name="location-on" size={20} color={Colors.danger_red} />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationLabel}>Dropoff Point</Text>
                  <Text style={styles.locationAddress} numberOfLines={2}>
                    {item.stops[item.stops.length - 1]?.address || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {item.isActingDriverTrip && item.pickupLocation && (
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={() => onViewLocation(item.pickupLocation)}
          >
            <MaterialIcons name="map" size={18} color={Colors.blue_xxdark} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.pickupLocation.address}
            </Text>
            <MaterialIcons name="chevron-right" size={18} color={Colors.cool_grey} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {item.isActingDriverTrip && item.status !== 'COMPLETED' && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => onStartTrip(item)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="play-arrow" size={20} color={Colors.white} />
          <Text style={styles.startButtonText}>Start Trip</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && trips.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.blue_xxdark} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('calendar', 'Calendar')}</Text>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarContainer}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={onPreviousMonth}
            >
              <MaterialIcons name="chevron-left" size={24} color={Colors.blue_xxdark} />
            </TouchableOpacity>

            <View style={styles.monthTitleBlock}>
              <Text style={styles.monthText}>
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              <View style={styles.monthBadge}>
                <Text style={styles.monthBadgeText}>
                  {trips.length} Trips • {monthActingTrips} Acting
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.navButton}
              onPress={onNextMonth}
            >
              <MaterialIcons name="chevron-right" size={24} color={Colors.blue_xxdark} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <Text
                key={day}
                style={[
                  styles.weekdayText,
                  (index === 0 || index === 6) && styles.weekendText,
                ]}
              >
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {renderCalendarDays()}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.yellow }]} />
              <Text style={styles.legendText}>Acting Driver Trip</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.blue_xxdark }]} />
              <Text style={styles.legendText}>Regular Trip</Text>
            </View>
          </View>
        </View>

        <View style={styles.tripsSection}>
          <View style={styles.tripsTitleRow}>
            <View>
              <Text style={styles.tripsTitle}>
                {DateTimeFormatter.requiredDateFormat(selectedDate, 'MMM DD, YYYY')}
              </Text>
              <Text style={styles.tripsSubTitle}>
                {selectedTrips.length} trips | {selectedActingTrips} acting
              </Text>
            </View>
            <MaterialIcons name="event-note" size={24} color={Colors.blue_xxdark} />
          </View>

          {selectedTrips.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-available" size={48} color={Colors.cool_grey} />
              <Text style={styles.emptyStateText}>No trips on this date</Text>
            </View>
          ) : (
            <FlatList
              data={selectedTrips}
              renderItem={renderTripItem}
              keyExtractor={(item, index) => `${item._id}-${index}`}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

DriverCalendarView.propTypes = {
  t: PropTypes.func.isRequired,
  currentDate: PropTypes.instanceOf(Date).isRequired,
  trips: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  selectedTrips: PropTypes.arrayOf(PropTypes.object).isRequired,
  monthActingTrips: PropTypes.number.isRequired,
  selectedActingTrips: PropTypes.number.isRequired,
  getDaysInMonth: PropTypes.func.isRequired,
  getFirstDayOfMonth: PropTypes.func.isRequired,
  getTripsForDate: PropTypes.func.isRequired,
  hasActingTrips: PropTypes.func.isRequired,
  onDateSelect: PropTypes.func.isRequired,
  onPreviousMonth: PropTypes.func.isRequired,
  onNextMonth: PropTypes.func.isRequired,
  onTripSelect: PropTypes.func.isRequired,
  onStartTrip: PropTypes.func.isRequired,
  onViewLocation: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pale_grey,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    paddingVertical: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    color: Colors.blue_xxdark,
    fontFamily: Fonts.semi_bold,
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 100,
    paddingTop: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitleBlock: {
    alignItems: 'center',
    flex: 1,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E6E9F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  monthText: {
    fontSize: 18,
    fontFamily: Fonts.semi_bold,
    color: Colors.blue_xxdark,
  },
  monthBadge: {
    backgroundColor: Colors.blue_xxlight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  monthBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.blue_xxdark,
  },
  calendarContainer: {
    width: '92%',
    alignSelf: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#0F223C',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.semi_bold,
    color: Colors.warm_grey,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  weekendText: {
    color: Colors.battleship_grey,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.white,
    position: 'relative',
    paddingBottom: 4,
  },
  dayContentToday: {
    borderWidth: 1.5,
    borderColor: Colors.yellow,
    backgroundColor: Colors.yellow_xxlight,
  },
  dayContentSelected: {
    backgroundColor: Colors.blue_xxdark,
    shadowColor: Colors.blue_xxdark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dayText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
  dayTextToday: {
    color: Colors.blue_xxdark,
    fontFamily: Fonts.bold,
  },
  dayTextSelected: {
    color: Colors.white,
    fontFamily: Fonts.bold,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 3,
    position: 'absolute',
    bottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  dotIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  actingDot: {
    backgroundColor: Colors.yellow,
  },
  regularDot: {
    backgroundColor: Colors.blue_xxdark,
  },
  selectedDot: {
    backgroundColor: Colors.white,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.warm_grey,
    fontFamily: Fonts.medium,
  },
  tripsSection: {
    width: '92%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  tripsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  tripsTitle: {
    fontSize: 18,
    fontFamily: Fonts.semi_bold,
    color: Colors.blue_xxdark,
  },
  tripsSubTitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.warm_grey,
    marginTop: 2,
  },
  tripCard: {
    backgroundColor: Colors.white,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F223C',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  actingTripCard: {
    borderLeftWidth: 5,
    borderLeftColor: Colors.yellow,
  },
  actingBadge: {
    backgroundColor: Colors.blue_xxdark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.yellow,
  },
  actingBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.semi_bold,
    color: Colors.yellow,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  tripHeaderInfo: {
    flex: 1,
  },
  tripBadges: {
    alignItems: 'flex-end',
    gap: 6,
  },
  tripTime: {
    fontSize: 15,
    fontFamily: Fonts.semi_bold,
    color: Colors.blue_xxdark,
    marginBottom: 2,
  },
  tripIdText: {
    fontSize: 12,
    color: Colors.warm_grey,
    fontFamily: Fonts.regular,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripStatusText: {
    fontSize: 11,
    fontFamily: Fonts.semi_bold,
    textTransform: 'uppercase',
  },
  tripDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: Colors.blue_xxdark,
    fontFamily: Fonts.medium,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 14,
  },
  locationSection: {
    position: 'relative',
    paddingLeft: 4,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  locationIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  startLocationIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.blue_xxlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.blue_xxdark,
  },
  startLocationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.blue_xxdark,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: Colors.warm_grey,
    fontFamily: Fonts.medium,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13.5,
    color: Colors.black,
    lineHeight: 18,
    fontFamily: Fonts.regular,
  },
  connectionLine: {
    position: 'absolute',
    left: 15,
    top: 18,
    bottom: 18,
    width: 1.5,
    backgroundColor: '#E0E6ED',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.warm_grey,
    fontFamily: Fonts.medium,
    marginTop: 10,
  },
  customerSection: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginVertical: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.pale_grey_two,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E9F2',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  customerTextInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontFamily: Fonts.semi_bold,
    color: Colors.blue_xxdark,
  },
  customerPhone: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: Colors.warm_grey,
    marginTop: 1,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.blue_xxlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue_xxlight,
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 34, 60, 0.08)',
  },
  locationText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: Fonts.medium,
    color: Colors.blue_xxdark,
  },
  startButton: {
    backgroundColor: Colors.blue_xxdark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
    gap: 6,
    shadowColor: Colors.blue_xxdark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: Colors.white,
    fontFamily: Fonts.semi_bold,
    fontSize: 14,
  },
});

export default DriverCalendarView;

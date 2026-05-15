import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, Fonts } from '../../../common/constants/constants';
import APIRequest from '../../../common/APIRequest';
import useUserStore from '../../../common/store/useUserStore';
import { useStackScreenStore } from '../../../common/store/useStackScreenStore';
import { useSelectedRouteStore } from '../../store/useTripsStore';
import { DateTimeFormatter } from '../../../common/utils/DateTimeFormatter';
import { useTranslation } from 'react-i18next';

const DriverCalendarScreen = () => {
  const { t } = useTranslation();
  const { userInfo } = useUserStore();
  const { setStackScreen } = useStackScreenStore();
  const { setSelectedTrip } = useSelectedRouteStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTrips, setSelectedTrips] = useState([]);

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Dummy data - Replace with API call later
  const getDummyTrips = () => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    return [
      // COMPLETED Acting driver trips
      {
        _id: 'trip_001',
        bookingTime: new Date(thisYear, thisMonth, 2, 10, 30).getTime(),
        status: 'COMPLETED',
        finalDistance: 12.5,
        finalDuration: 25,
        isActingDriverTrip: true,
        paymentDetails: { fareDetails: { fare: 350 } }
      },
      {
        _id: 'trip_002',
        bookingTime: new Date(thisYear, thisMonth, 5, 14, 15).getTime(),
        status: 'COMPLETED',
        finalDistance: 8.3,
        finalDuration: 18,
        isActingDriverTrip: true,
        paymentDetails: { fareDetails: { fare: 245 } }
      },
      {
        _id: 'trip_003',
        bookingTime: new Date(thisYear, thisMonth, 8, 9, 45).getTime(),
        status: 'COMPLETED',
        finalDistance: 15.7,
        finalDuration: 32,
        isActingDriverTrip: true,
        paymentDetails: { fareDetails: { fare: 420 } }
      },
      {
        _id: 'trip_007',
        bookingTime: new Date(thisYear, thisMonth, 12, 8, 15).getTime(),
        status: 'COMPLETED',
        finalDistance: 18.9,
        finalDuration: 38,
        isActingDriverTrip: true,
        paymentDetails: { fareDetails: { fare: 510 } }
      },
      {
        _id: 'trip_009',
        bookingTime: new Date(thisYear, thisMonth, 18, 12, 0).getTime(),
        status: 'COMPLETED',
        finalDistance: 14.6,
        finalDuration: 29,
        isActingDriverTrip: true,
        paymentDetails: { fareDetails: { fare: 400 } }
      },
      // COMPLETED Regular driver trips
      {
        _id: 'trip_004',
        bookingTime: new Date(thisYear, thisMonth, 3, 11, 20).getTime(),
        status: 'COMPLETED',
        finalDistance: 10.2,
        finalDuration: 22,
        isActingDriverTrip: false,
        paymentDetails: { fareDetails: { fare: 300 } }
      },
      {
        _id: 'trip_005',
        bookingTime: new Date(thisYear, thisMonth, 6, 16, 0).getTime(),
        status: 'COMPLETED',
        finalDistance: 20.5,
        finalDuration: 40,
        isActingDriverTrip: false,
        paymentDetails: { fareDetails: { fare: 580 } }
      },
      {
        _id: 'trip_006',
        bookingTime: new Date(thisYear, thisMonth, 10, 13, 30).getTime(),
        status: 'COMPLETED',
        finalDistance: 7.8,
        finalDuration: 16,
        isActingDriverTrip: false,
        paymentDetails: { fareDetails: { fare: 220 } }
      },
      {
        _id: 'trip_008',
        bookingTime: new Date(thisYear, thisMonth, 15, 17, 45).getTime(),
        status: 'COMPLETED',
        finalDistance: 11.3,
        finalDuration: 24,
        isActingDriverTrip: false,
        paymentDetails: { fareDetails: { fare: 330 } }
      },
      {
        _id: 'trip_010',
        bookingTime: new Date(thisYear, thisMonth, 22, 10, 30).getTime(),
        status: 'COMPLETED',
        finalDistance: 9.7,
        finalDuration: 20,
        isActingDriverTrip: false,
        paymentDetails: { fareDetails: { fare: 280 } }
      },
      // UPCOMING Acting driver trips
      {
        _id: 'trip_011',
        bookingTime: new Date(thisYear, thisMonth, 20, 14, 30).getTime(),
        status: 'ACCEPTED',
        finalDistance: 0,
        finalDuration: 0,
        isActingDriverTrip: true,
        paymentDetails: { fareDetails: { fare: 0 } }
      },
      {
        _id: 'trip_012',
        bookingTime: new Date(thisYear, thisMonth, 23, 9, 15).getTime(),
        status: 'PENDING',
        finalDistance: 0,
        finalDuration: 0,
        isActingDriverTrip: true,
        paymentDetails: { fareDetails: { fare: 0 } }
      },
      {
        _id: 'trip_013',
        bookingTime: new Date(thisYear, thisMonth, 25, 16, 45).getTime(),
        status: 'ACCEPTED',
        finalDistance: 0,
        finalDuration: 0,
        isActingDriverTrip: true,
        paymentDetails: { fareDetails: { fare: 0 } }
      },
      // UPCOMING Regular driver trips
      {
        _id: 'trip_014',
        bookingTime: new Date(thisYear, thisMonth, 19, 11, 0).getTime(),
        status: 'PENDING',
        finalDistance: 0,
        finalDuration: 0,
        isActingDriverTrip: false,
        paymentDetails: { fareDetails: { fare: 0 } }
      },
      {
        _id: 'trip_015',
        bookingTime: new Date(thisYear, thisMonth, 21, 13, 30).getTime(),
        status: 'ACCEPTED',
        finalDistance: 0,
        finalDuration: 0,
        isActingDriverTrip: false,
        paymentDetails: { fareDetails: { fare: 0 } }
      },
      {
        _id: 'trip_016',
        bookingTime: new Date(thisYear, thisMonth, 24, 10, 0).getTime(),
        status: 'PENDING',
        finalDistance: 0,
        finalDuration: 0,
        isActingDriverTrip: false,
        paymentDetails: { fareDetails: { fare: 0 } }
      },
    ];
  };

  // Fetch trips for the entire month (using dummy data for now)
  const fetchMonthTrips = async (date) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const api = new APIRequest();
      // const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      // const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      // const response = await api.request(
      //   `/publicrides/driver/v2/getTrips?page=1&limit=100&tripStatus=ALL&startTime=${firstDay.getTime()}&endTime=${lastDay.getTime()}`,
      //   'POST',
      //   {},
      //   userInfo?.token
      // );

      // Use dummy data for now
      const dummyTrips = getDummyTrips();
      setTrips(dummyTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      // Fallback to dummy data on error
      setTrips(getDummyTrips());
    } finally {
      setLoading(false);
    }
  };

  // Get trips for a specific date
  const getTripsForDate = (date) => {
    const dateStr = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return trips.filter(trip => {
      const tripDate = new Date(trip.bookingTime);
      return (
        tripDate.getFullYear() === dateStr.getFullYear() &&
        tripDate.getMonth() === dateStr.getMonth() &&
        tripDate.getDate() === dateStr.getDate()
      );
    }).sort((a, b) => {
      // Sort acting driver trips first
      const aIsActing = a.isActingDriverTrip ? 0 : 1;
      const bIsActing = b.isActingDriverTrip ? 0 : 1;
      if (aIsActing !== bIsActing) return aIsActing - bIsActing;
      // Then sort by time
      return new Date(b.bookingTime) - new Date(a.bookingTime);
    });
  };

  // Check if a date has acting driver trips
  const hasActingTrips = (date) => {
    return getTripsForDate(date).some(trip => trip.isActingDriverTrip);
  };

  // Handle date selection
  const handleDateSelect = (day) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(selected);
    setSelectedTrips(getTripsForDate(selected));
  };

  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Handle trip selection
  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setStackScreen('TripDetailScreen');
  };

  // Fetch trips when month changes
  useEffect(() => {
    fetchMonthTrips(currentDate);
  }, [currentDate]);

  // Set selected trips when component mounts
  useEffect(() => {
    setSelectedDate(new Date());
    setSelectedTrips(getTripsForDate(new Date()));
  }, []);

  // Render calendar days
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
      const hasActing = hasActingTrips(date);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isSelected && styles.daySelected,
            isToday && !isSelected && styles.dayToday,
          ]}
          onPress={() => handleDateSelect(day)}
        >
          <View style={[
            styles.dayContent,
            hasActing && styles.dayWithActingTrips,
          ]}>
            <Text style={[
              styles.dayText,
              isSelected && styles.dayTextSelected,
              isToday && !isSelected && styles.dayTextToday,
            ]}>
              {day}
            </Text>
            {hasActing && (
              <View style={styles.actingIndicator} />
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const renderTripItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tripCard,
        item.isActingDriverTrip && styles.actingTripCard,
      ]}
      onPress={() => handleTripSelect(item)}
      activeOpacity={0.7}
    >
      {item.isActingDriverTrip && (
        <View style={styles.actingBadge}>
          <Text style={styles.actingBadgeText}>Acting Driver</Text>
        </View>
      )}
      
      <View style={styles.tripHeader}>
        <Text style={styles.tripTime}>
          {DateTimeFormatter.requiredDateFormat(item.bookingTime, 'hh:mm A')}
        </Text>
        <Text style={[
          styles.tripStatus,
          { color: item.status === 'COMPLETED' ? Colors.success : Colors.warning }
        ]}>
          {item.status}
        </Text>
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="directions-car" size={16} color={Colors.warm_grey} />
          <Text style={styles.detailText}>
            {item.finalDistance ? `${parseFloat(item.finalDistance).toFixed(2)} km` : 'N/A'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="schedule" size={16} color={Colors.warm_grey} />
          <Text style={styles.detailText}>
            {item.finalDuration ? `${item.finalDuration} min` : 'N/A'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="payments" size={16} color={Colors.success} />
          <Text style={[styles.detailText, { color: Colors.success, fontFamily: Fonts.medium }]}>
            ₹{item.paymentDetails?.fareDetails?.fare ? parseFloat(item.paymentDetails.fareDetails.fare).toFixed(2) : '0.00'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && trips.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.periwinkle} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('calendar', 'Calendar')}</Text>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={handlePreviousMonth}
          >
            <MaterialIcons name="chevron-left" size={28} color={Colors.periwinkle} />
          </TouchableOpacity>
          
          <Text style={styles.monthText}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={handleNextMonth}
          >
            <MaterialIcons name="chevron-right" size={28} color={Colors.periwinkle} />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>

          {/* Days grid */}
          <View style={styles.daysGrid}>
            {renderCalendarDays()}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.periwinkle }]} />
            <Text style={styles.legendText}>Acting Driver Trip</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.light_grey }]} />
            <Text style={styles.legendText}>Regular Trip</Text>
          </View>
        </View>

        {/* Trips for selected date */}
        <View style={styles.tripsSection}>
          <Text style={styles.tripsTitle}>
            Trips for {DateTimeFormatter.requiredDateFormat(selectedDate, 'MMM DD, YYYY')}
          </Text>

          {selectedTrips.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-available" size={48} color={Colors.light_grey} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.semi_bold,
    color: Colors.black,
  },
  scrollContent: {
    flex: 1,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontFamily: Fonts.semi_bold,
    color: Colors.black,
  },
  calendarContainer: {
    marginHorizontal: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.medium,
    color: Colors.warm_grey,
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 7 columns
    aspectRatio: 1,
    padding: 4,
  },
  dayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    position: 'relative',
  },
  dayWithActingTrips: {
    backgroundColor: Colors.periwinkle,
  },
  dayText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
  dayTextSelected: {
    color: '#fff',
    fontFamily: Fonts.semi_bold,
  },
  daySelected: {
    padding: 3,
  },
  dayTextToday: {
    color: Colors.periwinkle,
    fontFamily: Fonts.semi_bold,
  },
  dayToday: {
    borderWidth: 2,
    borderColor: Colors.periwinkle,
  },
  actingIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.periwinkle,
    position: 'absolute',
    bottom: 4,
  },
  legend: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: Colors.warm_grey,
    fontFamily: Fonts.light,
  },
  tripsSection: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  tripsTitle: {
    fontSize: 16,
    fontFamily: Fonts.semi_bold,
    color: Colors.black,
    marginBottom: 12,
    marginLeft: 8,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light_grey,
  },
  actingTripCard: {
    borderLeftColor: Colors.periwinkle,
    backgroundColor: '#f8f4ff',
  },
  actingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.periwinkle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  actingBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#fff',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripTime: {
    fontSize: 14,
    fontFamily: Fonts.semi_bold,
    color: Colors.black,
  },
  tripStatus: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  tripDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.warm_grey,
    fontFamily: Fonts.light,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.warm_grey,
    fontFamily: Fonts.light,
    marginTop: 8,
  },
});

export default DriverCalendarScreen;

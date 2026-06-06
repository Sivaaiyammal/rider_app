import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStackScreenStore } from '../store/useStackScreenStore';
import { Fonts } from '../constants/constants';
import { getCustomerTrips } from '../API/EndPoints/EndPoints';
import moment from 'moment';

// Local vehicle stock images
import AUTO_IMG from '../assets/vehicle/AUTO.webp';
import BIKE_IMG from '../assets/vehicle/BIKE.webp';
import HATCHBACK_IMG from '../assets/vehicle/HATCHBACK.webp';
import SEDAN_IMG from '../assets/vehicle/SEDAN.webp';
import SUV_IMG from '../assets/vehicle/SUV.webp';
import EXSEDAN_IMG from '../assets/vehicle/ExSEDAN.webp';
import ELECTRIC_AUTO_IMG from '../assets/vehicle/ELECTRIC_AUTO.webp';
import HATCHBACK_NEW from '../assets/image/garage/hatback.png'
import SEDAN_NEW from '../assets/image/garage/sedan.png'
import SUV_NEW from '../assets/image/garage/suv.png'
import EXE_NEW from '../assets/image/garage/exec_sedan.png'
import LUX_NEW from '../assets/image/garage/luxury.png'

const VEHICLE_IMAGES = {
  AUTO: AUTO_IMG,
  BIKE: BIKE_IMG,
  HATCHBACK: HATCHBACK_IMG,
  SEDAN: SEDAN_IMG,
  SUV: SUV_IMG,
  EXSEDAN: EXSEDAN_IMG,
  ELECTRIC_AUTO: ELECTRIC_AUTO_IMG,
  HATCHBACK_NEW: HATCHBACK_NEW,
  SEDAN_NEW: SEDAN_NEW,
  SUV_NEW: SUV_NEW,
  EXE_NEW: EXE_NEW,
  LUX_NEW: LUX_NEW,

};

// Map trip status to display status
const getTripDisplayStatus = (status) => {
  switch (status) {
    case 'SCHEDULED': return 'Upcoming';
    case 'PENDING': return 'Upcoming';
    case 'ACCEPTED': return 'In Progress';
    case 'PICKEDUP': return 'In Progress';
    case 'DROPPED': return 'Completed';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
};

const MyActingDriverBookings = () => {
  const { goBack, setStackScreen } = useStackScreenStore();
  const [activeTab, setActiveTab] = useState('All');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCustomerTrips({ rideCategory: 'acting_driver' });
      if (response?.success && Array.isArray(response.trips)) {
        setTrips(response.trips);
      } else {
        setTrips([]);
      }
    } catch (e) {
      console.error('Failed to fetch acting driver trips:', e);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const filteredData = trips.filter((trip) => {
    const status = getTripDisplayStatus(trip.status);
    if (activeTab === 'All') return true;
    return status === activeTab;
  });

  const getStatusStyles = (displayStatus) => {
    switch (displayStatus) {
      case 'Upcoming':
        return {
          cardBg: '#FAFBFF',
          borderColor: '#E8EAF6',
          badgeBg: '#EDE7F6',
          badgeText: '#5E35B1',
          dateColor: '#5E35B1',
          iconColor: '#5E35B1',
        };
      case 'In Progress':
        return {
          cardBg: '#F3FAF5',
          borderColor: '#E8F5E9',
          badgeBg: '#E8F5E9',
          badgeText: '#2E7D32',
          dateColor: '#2E7D32',
          iconColor: '#2E7D32',
        };
      case 'Cancelled':
        return {
          cardBg: '#FFF5F5',
          borderColor: '#FFEBEE',
          badgeBg: '#FFEBEE',
          badgeText: '#C62828',
          dateColor: '#C62828',
          iconColor: '#C62828',
        };
      case 'Completed':
      default:
        return {
          cardBg: '#F9F9F9',
          borderColor: '#F0F0F0',
          badgeBg: '#F5F5F5',
          badgeText: '#616161',
          dateColor: '#424242',
          iconColor: '#616161',
        };
    }
  };

  const getVehicleImage = (trip) => {
    // Use passenger vehicle photo if available
    if (trip.vehicleData?.photo) {
      return { uri: trip.vehicleData.photo };
    }
    // Fallback to stock image based on vehicle type
    const vType = (trip.vehicleData?.type || trip.passangerVehicleType || trip.vehicleType || 'AUTO').toUpperCase();
    return VEHICLE_IMAGES[vType] || AUTO_IMG;
  };

  const getVehicleLabel = (trip) => {
    const v = trip.vehicleData;
    if (v) {
      const nameStr = [v.make, v.model].filter(Boolean).join(' ');
      const regStr = v.regNo || '';
      if (nameStr && regStr) return `${nameStr} • ${regStr}`;
      if (regStr) return regStr;
      if (nameStr) return nameStr;
    }
    // Fallback
    const vType = trip.passangerVehicleType || trip.vehicleType || 'Vehicle';
    return vType;
  };

  const getTripTypeLabel = (trip) => {
    const hours = trip.actingDriverHours;
    const tripType = trip.tripType || 'ONE_WAY';
    if (!hours) return `Trip Type: ${tripType === 'ROUND_TRIP' ? 'Round Trip' : 'One Way'}`;
    if (hours >= 24) {
      const days = Math.round(hours / 24);
      return `Trip Type: Multi Day (${days} ${days > 1 ? 'Days' : 'Day'})`;
    }
    return `Trip Type: Hourly (${hours} ${hours > 1 ? 'Hrs' : 'Hr'})`;
  };

  const getTimeLabel = (trip) => {
    const status = getTripDisplayStatus(trip.status);
    const dt = trip.scheduleDateTime;
    if (!dt) return '';
    let ms = dt;
    if (typeof ms === 'number' && ms < 1e12) ms = ms * 1000;
    const m = moment(ms);
    if (status === 'In Progress') return `Started at ${m.format('hh:mm A')}`;
    if (status === 'Completed') return `Trip on ${m.format('DD MMM YYYY')}`;
    return m.format('hh:mm A');
  };

  const getLocationText = (trip) => {
    const stops = trip.stops || [];
    if (stops.length >= 2) {
      const from = stops[0]?.name || stops[0]?.address || 'Start';
      const to = stops[stops.length - 1]?.name || stops[stops.length - 1]?.address || 'End';
      return `${from}  →  ${to}`;
    }
    if (stops.length === 1) return stops[0]?.name || stops[0]?.address || '';
    return '';
  };

  const getDateParts = (trip) => {
    const dt = trip.scheduleDateTime;
    if (!dt) return { day: '--', month: '---' };
    let ms = dt;
    if (typeof ms === 'number' && ms < 1e12) ms = ms * 1000;
    const m = moment(ms);
    return { day: m.format('DD'), month: m.format('MMM').toUpperCase() };
  };

  const renderItem = ({ item: trip, index }) => {
    const displayStatus = getTripDisplayStatus(trip.status);
    const sStyles = getStatusStyles(displayStatus);
    const vehicleImg = getVehicleImage(trip);
    const vehicleLabel = getVehicleLabel(trip);
    const { day, month } = getDateParts(trip);
    const isFirstOfStatus =
      activeTab === 'All' &&
      (index === 0 || getTripDisplayStatus(trips[index - 1]?.status) !== displayStatus);

    const handlePress = () => {
      // Navigate to ScheduleScreen with the trip data
      setStackScreen('ScheduleScreen', { trip });
    };

    return (
      <View>
        {isFirstOfStatus && (
          <Text style={styles.sectionHeader}>{displayStatus}</Text>
        )}
        <TouchableOpacity
          style={[styles.cardContainer, { backgroundColor: sStyles.cardBg, borderColor: sStyles.borderColor }]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          {/* Left Date Column */}
          <View style={styles.dateColumn}>
            <Text style={[styles.dateText, { color: sStyles.dateColor }]}>{day}</Text>
            <Text style={[styles.monthText, { color: sStyles.dateColor }]}>{month}</Text>
          </View>

          {/* Right Content Column */}
          <View style={styles.contentColumn}>
            {/* Top Row: Vehicle Image & Badge */}
            <View style={styles.contentTopRow}>
              {/* Vehicle image / stock image */}
              <View style={styles.vehicleImageWrap}>
                <Image
                  source={vehicleImg}
                  style={styles.vehicleImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.topRightInfo}>
                <Text style={styles.vehicleNameText} numberOfLines={1}>{vehicleLabel}</Text>
                <View style={[styles.statusBadge, { backgroundColor: sStyles.badgeBg }]}>
                  <Text style={[styles.statusBadgeText, { color: sStyles.badgeText }]}>{displayStatus}</Text>
                </View>
              </View>
            </View>

            {/* Details Rows */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Icon name="clock-outline" size={14} color="#616161" style={styles.detailIcon} />
                <Text style={styles.detailText}>{getTimeLabel(trip)}</Text>
              </View>
              {getLocationText(trip) ? (
                <View style={styles.detailRow}>
                  <Icon name="map-marker-outline" size={14} color="#616161" style={styles.detailIcon} />
                  <Text style={styles.detailText} numberOfLines={1}>{getLocationText(trip)}</Text>
                </View>
              ) : null}
              <View style={styles.detailRow}>
                <Icon name="clipboard-text-outline" size={14} color="#616161" style={styles.detailIcon} />
                <Text style={styles.detailText}>{getTripTypeLabel(trip)}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="car-off" size={56} color="#D1C4E9" />
        <Text style={styles.emptyTitle}>No Bookings Found</Text>
        <Text style={styles.emptySubtitle}>
          {activeTab === 'All'
            ? "You haven't made any acting driver bookings yet."
            : `No ${activeTab.toLowerCase()} bookings.`}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Icon name="arrow-left" size={24} color="#1F1F1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Acting Driver Bookings</Text>
        <TouchableOpacity style={styles.backButton} onPress={fetchTrips}>
          <Icon name="refresh" size={22} color="#5E35B1" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['All', 'Upcoming', 'In Progress', 'Completed'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5E35B1" />
          <Text style={styles.loadingText}>Loading bookings…</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Icon name="alert-circle-outline" size={48} color="#EF9A9A" />
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchTrips}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => String(item._id || item.rideId || Math.random())}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: '#1F1F1F',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#5E35B1',
  },
  tabText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#757575',
  },
  tabTextActive: {
    color: '#5E35B1',
    fontFamily: Fonts.bold,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#1F1F1F',
    marginTop: 16,
    marginBottom: 12,
  },
  cardContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  dateColumn: {
    alignItems: 'center',
    marginRight: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
    paddingRight: 16,
    minWidth: 38,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  dateText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
  },
  monthText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold || Fonts.bold,
    textTransform: 'uppercase',
  },
  contentColumn: {
    flex: 1,
  },
  contentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleImageWrap: {
    width: 64,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F5F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  vehicleImage: {
    width: 60,
    height: 40,
  },
  topRightInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  vehicleNameText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#1F1F1F',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
  },
  detailsContainer: {
    marginTop: 4,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#424242',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 10,
    marginTop: 80,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#1F1F1F',
    marginTop: 8,
  },
  emptySubtitle: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#757575',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#5E35B1',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#fff',
  },
});

export default MyActingDriverBookings;

import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getCustomerTrips} from '../../../API/EndPoints/EndPoints';
import {Fonts} from '../../../constants/constants';
import {useStackScreenStore} from '../../../store/useStackScreenStore';

const UPCOMING_STATUSES = new Set(['SCHEDULED', 'PENDING']);

const formatDate = scheduleDateTime => {
  if (!scheduleDateTime) return {date: '', time: ''};
  let ms = scheduleDateTime;
  if (typeof ms === 'number' && ms < 1e12) ms = ms * 1000;
  const d = new Date(ms);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', {month: 'short'});
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = (hours % 12 || 12).toString().padStart(2, '0');
  return {date: `${day} ${month} ${year}`, time: `${h12}:${minutes} ${ampm}`};
};

const getDateLabel = scheduleDateTime => {
  if (!scheduleDateTime) return 'Scheduled';
  let ms = scheduleDateTime;
  if (typeof ms === 'number' && ms < 1e12) ms = ms * 1000;
  const d = new Date(ms);
  const now = new Date();
  const todayStr    = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toDateString();
  const tomorrowStr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toDateString();
  const tripStr     = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
  if (tripStr === todayStr)    return 'Today';
  if (tripStr === tomorrowStr) return 'Tomorrow';
  return `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('en-US', {month: 'short'})}`;
};

const getVehicleLabel = trip => {
  const v = trip.vehicleData || trip.passangerVehicle;
  if (v) {
    const name = [v.make, v.model].filter(Boolean).join(' ');
    const reg = v.regNo || '';
    if (name && reg) return `${name} • ${reg}`;
    if (reg) return reg;
    if (name) return name;
  }
  return trip.passangerVehicleType || 'Vehicle';
};

const UpcomingActingDriverCard = () => {
  const {setStackScreen} = useStackScreenStore();
  const [trip, setTrip] = useState(null);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [allTrips, setAllTrips] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getCustomerTrips({rideCategory: 'acting_driver'})
      .then(response => {
        if (cancelled || !response?.success) return;
        const upcomingTrips = (response.trips || [])
          .filter(tr => UPCOMING_STATUSES.has(tr.status))
          .sort((a, b) => (a.scheduleDateTime || 0) - (b.scheduleDateTime || 0));
        setUpcomingCount(upcomingTrips.length);
        setAllTrips(upcomingTrips);
        setTrip(upcomingTrips[0] || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!trip) return null;

  const isMultiple = upcomingCount > 1;
  const {date, time} = formatDate(trip.scheduleDateTime);
  const vehicleLabel = getVehicleLabel(trip);

  // Unique date labels across all upcoming trips (preserves order, deduplicates)
  const uniqueDateLabels = isMultiple
    ? [...new Set(allTrips.map(t => getDateLabel(t.scheduleDateTime)))]
    : [getDateLabel(trip.scheduleDateTime)];

  const handleViewDetails = () => {
    if (isMultiple) {
      setStackScreen('MyActingDriverBookings', {});
    } else {
      setStackScreen('ActingDriverTripDetail', {trip});
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="calendar-month-outline" size={18} color="#5E35B1" />
          <Text style={styles.title}>Upcoming Acting Driver</Text>
          {isMultiple && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{upcomingCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {!isMultiple && (
          <Text style={styles.vehicleText}>{vehicleLabel}</Text>
        )}

        <View style={[styles.footer, isMultiple && styles.footerMultiple]}>
          <View style={styles.badgeRow}>
            {uniqueDateLabels.map(label => (
              <View
                key={label}
                style={[
                  styles.badge,
                  label === 'Today'    && styles.badgeToday,
                  label === 'Tomorrow' && styles.badgeTomorrow,
                ]}>
                <Text style={styles.badgeText}>{label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.viewDetails}
            activeOpacity={0.8}
            onPress={handleViewDetails}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon name="chevron-right" size={16} color="#5E35B1" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8F9FE',
    borderWidth: 1,
    borderColor: '#E8EAF6',
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 10,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.semi_bold,
    color: '#1F1F1F',
  },
  dateBox: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#1F1F1F',
  },
  timeText: {
    fontSize: 12,
    fontFamily: Fonts.semi_bold,
    color: '#1F1F1F',
  },
  content: {
    marginTop: 8,
  },
  vehicleText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#424242',
    marginLeft: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginLeft: 24,
  },
  footerMultiple: {
    marginTop: 8,
    marginLeft: 0,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#5E35B1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeToday: {
    backgroundColor: '#2E7D32',
  },
  badgeTomorrow: {
    backgroundColor: '#E65100',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: Fonts.medium,
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#5E35B1',
    fontSize: 13,
    fontFamily: Fonts.medium,
    marginRight: 2,
  },
  countBadge: {
    backgroundColor: '#5E35B1',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  countBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: Fonts.semi_bold,
    lineHeight: 14,
  },
});

export default UpcomingActingDriverCard;

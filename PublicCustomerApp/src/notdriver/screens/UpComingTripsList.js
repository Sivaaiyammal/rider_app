import {StyleSheet, Text, TouchableOpacity, View, ScrollView} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import useDriverStatusStore from '../store/useDriverStatusStore';
import useUserStore from '../../common/store/useUserStore';
import { useStackScreenStore } from '../../common/store/useStackScreenStore';
import { useTripAcceptStore } from '../store/useTripAcceptStore';
import useTripsStore from '../store/useTripsStore';
import APIRequest from '../../common/APIRequest';
import { showNotification } from '../../common/components/Alerts/showNotification';
import NavBar from '../../common/components/NavBar';
import FullScreenLoader from '../../common/loaders/FullScreenLoader';
import UseBackButton from '../../common/hooks/UseBackButton';
import { Colors, colors, Fonts } from '../../common/constants/constants';
import { DateTimeFormatter } from '../../common/utils/DateTimeFormatter';
import AddressComponent from '../components/AddressComponent';
import { useTranslation } from 'react-i18next';



const formatDistance = km => {
  if (km === null || km === undefined || km < 0 || typeof km === 'object')
    return '0.00 Km';
  return `${parseFloat(km).toFixed(1)} Km`;
};

const formatDuration = minutes => {
  if (minutes === null || minutes === undefined || minutes < 0) return '0 Mins';
  return `${minutes} Mins`;
};

const getCountdownMeta = scheduleDateTime => {
  const baseMeta = {
    label: 'N/A',
    variant: 'neutral',
    remainingMs: null,
  };

  if (!scheduleDateTime) {
    return baseMeta;
  }

  const target = moment(scheduleDateTime);
  if (!target.isValid()) {
    return baseMeta;
  }

  const remainingMillis = target.valueOf() - Date.now();
  const clampedMillis = Math.max(remainingMillis, 0);
  const duration = moment.duration(clampedMillis);
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const totalMinutes = Math.floor(clampedMillis / 60000);

  if (remainingMillis <= 0) {
    return {
      label: 'Starting now',
      variant: 'critical',
      remainingMs: 0,
    };
  }

  let label;
  if (days > 0) {
    label = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    label = `${hours}h ${minutes}m`;
  } else {
    label = `${minutes}m`;
  }

  let variant = 'neutral';
  if (totalMinutes <= 15) {
    variant = 'critical';
  } else if (totalMinutes <= 60) {
    variant = 'urgent';
  } else if (totalMinutes <= 180) {
    variant = 'warning';
  }

  return {
    label,
    variant,
    remainingMs: clampedMillis,
  };
};

const UpComingTripsList = () => {
  const {upComingTrips} = useDriverStatusStore();
  const {userInfo} = useUserStore();
  const [trips, setTrips] = useState([]);
  const {goBack, setStackScreen} = useStackScreenStore();
  const {t} = useTranslation()
  const {setUpComingTripDetails} = useTripAcceptStore();
  const [loading, setLoading] = useState(false);
  const {setActiveTripData} = useTripsStore();

  const fetchUpComingTripsDetails = async tripsIds => {
    setLoading(true)
    try {
      const API = new APIRequest();
      const payload = {
        tripIds: tripsIds,
      };
      const response = await API.request(
        '/publicrides/driver/v2/getMultipleTripsDetail',
        'POST',
        payload,
        userInfo.token,
      );
      if (response?.success) {
        setTrips(response.data);
      } else {
        showNotification('Trip Details Not Found', '', 'error');
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching trip details:', error);
      setLoading(false)
    }
  };

  useEffect(() => {
    if (!upComingTrips || upComingTrips.length === 0) return;
    if (upComingTrips) {
      fetchUpComingTripsDetails(upComingTrips);
    }
  }, [upComingTrips]);

  const onStartRide = trip => {
    const tripData = [trip];
    setActiveTripData(tripData);
    console.log('tripData', tripData);
    setStackScreen('PublicDriverTrackingScreen');
  }

  return (
    <View style={styles.screen}>
      <NavBar title={'Upcoming Trips'} onBackPress={() => goBack()} />
      {loading && <FullScreenLoader/>}
      <UseBackButton onBackPress={() => goBack()} />
      {!trips || trips.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 50,
          }}>
          <Text
            style={{
              fontFamily: Fonts.medium,
              fontSize: 16,
              color: Colors.warm_grey,
            }}>
            No Upcoming Trips Found
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{paddingVertical: 20, paddingBottom: 40}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.listHeader}>
            <Text style={styles.headerSubtitle}>DRIVER SCHEDULE</Text>
            <Text style={styles.headerTitle}>Your Upcoming Trips</Text>
            <View style={styles.headerIndicator} />
          </View>
          {trips
            ?.sort(
              (a, b) =>
                new Date(a.scheduleDateTime) - new Date(b.scheduleDateTime),
            )
            .map(trip => {
              const countdownMeta = getCountdownMeta(trip?.scheduleDateTime);
              const scheduledAt = DateTimeFormatter.requiredDateFormat(
                trip.scheduleDateTime,
                'DD/MM/YYYY - hh:mm',
              );

              const badgeContainerStyle = [
                styles.badge,
                countdownMeta.variant === 'critical'
                  ? styles.badgeCritical
                  : countdownMeta.variant === 'urgent'
                    ? styles.badgeUrgent
                    : countdownMeta.variant === 'warning'
                      ? styles.badgeWarning
                      : styles.badgeNeutral,
              ];

              const badgeTextStyle = [
                styles.badgeText,
                countdownMeta.variant === 'critical'
                  ? styles.badgeTextOnDark
                  : countdownMeta.variant === 'urgent'
                    ? styles.badgeTextOnDark
                    : countdownMeta.variant === 'warning'
                      ? styles.badgeTextWarning
                      : styles.badgeTextNeutral,
              ];

              const badgeIconColor =
                countdownMeta.variant === 'critical' ||
                countdownMeta.variant === 'urgent'
                  ? '#FFFFFF'
                  : countdownMeta.variant === 'warning'
                    ? '#B45309'
                    : Colors.periwinkle;

              return (
                <View key={trip._id} style={styles.tripCard}>
                  <View style={styles.headerRow}>
                    <View>
                      <Text style={styles.rideIdLabel}>Ride ID</Text>
                      <Text style={styles.rideIdValue}>
                        {trip?.rideId || '-'}
                      </Text>
                    </View>
                    <View style={badgeContainerStyle}>
                      <Feather name="clock" size={16} color={badgeIconColor} />
                      <Text style={badgeTextStyle}>{countdownMeta.label}</Text>
                    </View>
                  </View>

                   <View style={styles.scheduleCard}>
                    <Feather
                      name="calendar"
                      size={18}
                      color={Colors.yellow || '#FFD100'}
                      style={styles.scheduleIcon}
                    />
                    <View>
                      <Text style={styles.scheduleLabel}>Scheduled At</Text>
                      <Text style={styles.scheduleValue}>{scheduledAt}</Text>
                    </View>
                  </View>

                  <View style={styles.separator} />

                  <View style={styles.cardsContainer}>
                    <View style={styles.infoCard}>
                      <View style={[styles.cardIconContainer, styles.distanceIconContainer]}>
                        <Feather name="map-pin" size={15} color="#3B82F6" />
                      </View>
                      <Text style={styles.cardValue}>
                        {trip?.estimatedDistance
                          ? formatDistance(trip?.estimatedDistance)
                          : '0.00 km'}
                      </Text>
                      <Text style={styles.cardLabel}>
                        {t('distance') || 'Distance'}
                      </Text>
                    </View>

                    <View style={styles.infoCard}>
                      <View style={[styles.cardIconContainer, styles.durationIconContainer]}>
                        <Feather name="clock" size={15} color="#10B981" />
                      </View>
                      <Text style={styles.cardValue}>
                        {trip?.estimatedDuration
                          ? formatDuration(trip.estimatedDuration)
                          : '0 Mins'}
                      </Text>
                      <Text style={styles.cardLabel}>
                        {t('duration') || 'Duration'}
                      </Text>
                    </View>

                    <View style={styles.infoCard}>
                      <View style={[styles.cardIconContainer, styles.fareIconContainer]}>
                        <FontAwesome name="rupee" size={15} color="#F59E0B" />
                      </View>
                      <Text style={styles.cardValue}>
                        ₹
                        {trip?.minFare
                          ? parseFloat(trip.minFare).toFixed(2)
                          : '0.00'}
                      </Text>
                      <Text style={styles.cardLabel}>{t('fare') || 'Fare'}</Text>
                    </View>
                  </View>

                  <View style={styles.routeContainer}>
                    <AddressComponent
                      percentage={0}
                      waypoints={trip?.stops || []}
                      deviceLocation={null}
                      isPublicRides={true}
                    />
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.secondaryButton,
                        styles.buttonSpacing,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => {setUpComingTripDetails(trip); setStackScreen('UpComingTripsView')}}>
                      <Text
                        style={[
                          styles.actionButtonText,
                          styles.secondaryButtonText,
                        ]}>
                        View
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={18}
                        color="#0F223C"
                        style={styles.actionButtonIcon}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.primaryButton]}
                      activeOpacity={0.85}
                      onPress={() => onStartRide(trip)}>
                      <Text style={styles.actionButtonText}>Start Ride</Text>
                      <FontAwesome
                        name="road"
                        size={18}
                        color="#FFFFFF"
                        style={styles.actionButtonIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
        </ScrollView>
      )}
    </View>
  );
};

export default UpComingTripsList;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Ultra-clean, premium light-grey page background
  },
  listHeader: {
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#64748B', // Slate gray
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: '#0F223C', // Deep navy
    marginTop: 4,
  },
  headerIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD100', // Gold colored indicator line
    marginTop: 8,
  },
  tripCard: {
    width: '92%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // Bolder premium rounded corners
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 6},
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rideIdLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.warm_grey,
  },
  rideIdValue: {
    fontFamily: Fonts.semi_bold,
    fontSize: 20,
    color: '#0F223C', // Premium navy title color
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeNeutral: {
    backgroundColor: 'rgba(255, 209, 0, 0.15)', // Premium gold countdown badge
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  badgeUrgent: {
    backgroundColor: '#FB923C',
  },
  badgeCritical: {
    backgroundColor: '#DC2626',
  },
  badgeText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    marginLeft: 6,
  },
  badgeTextNeutral: {
    color: '#FFD100', // Gold colored text
  },
  badgeTextWarning: {
    color: '#B45309',
  },
  badgeTextOnDark: {
    color: '#FFFFFF',
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 34, 60, 0.04)', // Elegant transparent brand blue tint
    borderRadius: 16,
    padding: 14,
  },
  scheduleIcon: {
    marginRight: 12,
  },
  scheduleLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.warm_grey_two,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  scheduleValue: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    color: Colors.black,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#ECEFF4',
    marginVertical: 18,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Sleek off-white background
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0', // Beautiful modern thin border
    minHeight: 88,
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  distanceCard: {},
  durationCard: {},
  fareCard: {},
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  distanceIconContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Subtle blue glow
  },
  durationIconContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Subtle green glow
  },
  fareIconContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)', // Subtle amber/rupee glow
  },
  cardValue: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#0F223C', // Deep navy text matching brand
    textAlign: 'center',
  },
  cardLabel: {
    fontSize: 9,
    fontFamily: Fonts.medium,
    color: '#64748B', // Slate gray label
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  routeContainer: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: Fonts.semi_bold,
    fontSize: 14,
    color: Colors.periwinkle,
    marginBottom: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 28, // Beautiful modern pill shape
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#0F223C', // Deep navy primary button
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#0F223C', // Deep navy outline border
  },
  buttonSpacing: {
    marginRight: 0, // Handled by gap property
  },
  actionButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#0F223C', // Deep navy text color
  },
  actionButtonIcon: {
    marginLeft: 8,
  },
});



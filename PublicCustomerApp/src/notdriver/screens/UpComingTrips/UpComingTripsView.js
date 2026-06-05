import {
  Linking,
  NativeModules,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';

import moment from 'moment';
import {useTripAcceptStore} from '../../store/useTripAcceptStore';
import {useMapMarkerStore} from '../../../common/store/useMapMarkerStore';
import {useStackScreenStore} from '../../../common/store/useStackScreenStore';
import {useTranslation} from 'react-i18next';
import {Colors, Fonts} from '../../../common/constants/constants';
import {height} from '../../../common/utils/scalingutils';
import UseBackButton from '../../../common/hooks/UseBackButton';
import CustomeBottomSheet from '../../../common/components/CustomeBottomSheet';
import AddressComponent from '../../components/AddressComponent';
import CancelRideModal from '../../components/CancelModel';
import {firebaselog_tripBooking} from '../../../common/utils/FirebaseAnalytics';
import {showNotification} from '../../../common/components/Alerts/showNotification';
import useTripsStore from '../../store/useTripsStore';
import { DateTimeFormatter } from '../../../common/utils/DateTimeFormatter';
import NavBar from '../../../common/components/NavBar';
import useUserStore from '../../../common/store/useUserStore';
import useDriverStatusStore from '../../store/useDriverStatusStore';
import publicrideDriverApi from '../../api/publicrideDriverApi';
import NOTWSService from '../../../common/controllers/socketServices/NOTSocketServices';

const {NeNativeModule} = NativeModules;

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

const formatScheduledAt = scheduleDateTime => {
  if (!scheduleDateTime) {
    return 'Not scheduled';
  }
  return DateTimeFormatter.requiredDateFormat(
    scheduleDateTime,
    'DD/MM/YYYY - hh:mm A',
  );
};

const UpComingTripsView = () => {
  const {upComingTripDetails, loading, setLoading, setTripId} = useTripAcceptStore();
  const {setDirectionPoints, routeLoading} = useMapMarkerStore();
  const {t} = useTranslation();
  const {goBack, setStackScreen} = useStackScreenStore();
  const countdownMeta = getCountdownMeta(upComingTripDetails?.scheduleDateTime);
  const {setActiveTripData} = useTripsStore();
  const {userInfo} = useUserStore();
  const {upComingTrips, setUpComingTrips} = useDriverStatusStore();
  const scheduledAt = formatScheduledAt(upComingTripDetails?.scheduleDateTime);
  const [cancelRideModalVisible, setCancelRideModalVisible] = useState(false);

  const passengerPhoneRaw = upComingTripDetails?.bookingForPhone || '';
  const passengerPhone = passengerPhoneRaw.replace(/\s|-/g, '');

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
    countdownMeta.variant === 'critical' || countdownMeta.variant === 'urgent'
      ? '#FFFFFF'
      : countdownMeta.variant === 'warning'
      ? '#B45309'
      : Colors.periwinkle;

  useEffect(() => {
    if (upComingTripDetails?.stops && upComingTripDetails?.stops.length !== 0) {
      const directions = upComingTripDetails?.stops?.map(direction => {
        return {
          lat: direction.location[1],
          lon: direction.location[0],
        };
      });
      const padding = [50, 50, 50, height * 0.3];
      setDirectionPoints({
        locations: directions,
        type: 'car',
        padding: padding.map(v => parseInt(v, 10)),
      });
    }
  }, [upComingTripDetails]);

  const onGoBack = () => {
    NeNativeModule.clearDirectionPoints();
    goBack();
  };

  const handleCallPassenger = () => {
    if (!passengerPhone) {
      return;
    }
    Linking.openURL(`tel:${passengerPhone}`).catch(error => {
      console.warn('Unable to start call', error);
    });
  };

  const handleEndTrip = async reason => {
    setLoading(true);
    setCancelRideModalVisible(false);
    setLoading(false);
  };

  const onAcceptRide = async () => {
    setLoading(true);
    try {
      const tripId = upComingTripDetails?._id;
      const response = await publicrideDriverApi.startUpComingRide(
        {tripId},
        userInfo?.token,
      );

      if (response?.success) {
        const tripData = response.currentTrip || upComingTripDetails;

        setTripId(tripId);
        setActiveTripData([{...tripData, status: tripData.status || 'ACCEPTED'}]);
        setUpComingTrips(
          (upComingTrips || []).filter(
            t => String(t._id) !== String(tripId),
          ),
        );
        firebaselog_tripBooking(
          'TB_Driver_Allocation(TB_DA)',
          'TB_DA:trip_accepted_inapp',
        );
        setStackScreen('PublicDriverTrackingScreen');
      } else {
        showNotification(
          'Cannot start trip',
          response?.message || 'Something went wrong. Please try again.',
          'danger',
        );
      }
    } catch (error) {
      console.error('Error starting upcoming ride:', error);
      showNotification('Error', 'Failed to start trip. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar onBackPress={() => onGoBack()}/>
      <UseBackButton onBackPress={() => onGoBack()} />
      <CustomeBottomSheet useScrollView>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Passenger Details</Text>
            <View style={badgeContainerStyle}>
              <Feather name="clock" size={16} color={badgeIconColor} />
              <Text style={badgeTextStyle}>{countdownMeta.label}</Text>
            </View>
          </View>
          <View style={styles.passengerRow}>
            <View style={styles.passengerInfo}>
              <Text style={styles.passengerName}>
                {upComingTripDetails?.bookingForName || 'Passenger'}
              </Text>
              <Text style={styles.passengerMeta}>
                {upComingTripDetails?.bookingFor || 'MYSELF'}
              </Text>
              <Text style={styles.passengerMeta}>
                {passengerPhoneRaw || 'Phone not available'}
              </Text>
              {/* <Text style={styles.passengerMeta}>
              {`Vehicle: ${upComingTripDetails?.vehicleType || '-'}`}
            </Text> */}
              <Text style={styles.passengerMeta}>
                {`Payment: ${upComingTripDetails?.paymentMethod || '-'}`}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.contactButton,
                !passengerPhone && styles.contactButtonDisabled,
              ]}
              activeOpacity={0.85}
              onPress={handleCallPassenger}
              disabled={!passengerPhone}>
              <Feather
                name="phone"
                size={18}
                color={passengerPhone ? '#FFFFFF' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.contactButtonText,
                  !passengerPhone && styles.contactButtonTextDisabled,
                ]}>
                {passengerPhone ? 'Call' : 'No Number'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.scheduleSection}>
            <View style={styles.scheduleRow}>
              <Feather
                name="calendar"
                size={18}
                color={Colors.yellow || '#FFD100'}
                style={styles.scheduleIcon}
              />
              <View>
                <Text style={styles.scheduleLabel}>Scheduled Time</Text>
                <Text style={styles.scheduleValue}>{scheduledAt}</Text>
              </View>
            </View>
          </View>
        </View>

        <AddressComponent
          percentage={0}
          waypoints={upComingTripDetails?.stops || []}
          deviceLocation={null}
          isPublicRides={true}
        />
        <View style={styles.cardsContainer}>
          <View style={styles.infoCard}>
            <View style={[styles.cardIconContainer, styles.distanceIconContainer]}>
              <Feather name="map-pin" size={15} color="#3B82F6" />
            </View>
            <Text style={styles.cardValue}>
              {upComingTripDetails?.estimatedDistance
                ? formatDistance(upComingTripDetails?.estimatedDistance)
                : '0.00 km'}
            </Text>
            <Text style={styles.cardLabel}>{t.distance || 'Distance'}</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={[styles.cardIconContainer, styles.durationIconContainer]}>
              <Feather name="clock" size={15} color="#10B981" />
            </View>
            <Text style={styles.cardValue}>
              {upComingTripDetails?.estimatedDuration
                ? formatDuration(upComingTripDetails.estimatedDuration)
                : '0 Mins'}
            </Text>
            <Text style={styles.cardLabel}>{t.duration || 'Duration'}</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={[styles.cardIconContainer, styles.fareIconContainer]}>
              <FontAwesome name="rupee" size={15} color="#F59E0B" />
            </View>
            <Text style={styles.cardValue}>
              ₹
              {upComingTripDetails?.minFare
                ? parseFloat(upComingTripDetails.minFare).toFixed(2)
                : '0.00'}
            </Text>
            <Text style={styles.cardLabel}>{t.fare || 'Fare'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          activeOpacity={0.85}
          onPress={() => onAcceptRide()}>
          <Text style={[styles.actionButtonText, {color: '#FFFFFF'}]}>Start Ride</Text>
          <FontAwesome
            name="road"
            size={18}
            color="#FFFFFF"
            style={styles.actionButtonIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.85}
          onPress={() => setCancelRideModalVisible(true)}>
          <Text style={styles.cancelButtonText}>Cancel Ride</Text>
          <Feather
            name="x-circle"
            size={18}
            color="#EF4444"
            style={styles.actionButtonIcon}
          />
        </TouchableOpacity>
      </CustomeBottomSheet>
      {cancelRideModalVisible && (
        <CancelRideModal
          modalVisible={cancelRideModalVisible}
          setModalVisible={setCancelRideModalVisible}
          callCancelRide={handleEndTrip}
          loading={loading}
          tripData={upComingTripDetails}
        />
      )}
    </>
  );
};

export default UpComingTripsView;

const styles = StyleSheet.create({
  sectionCard: {
    width: '94%',
    alignSelf: 'center',
    backgroundColor: '#0F223C', // Premium deep navy backdrop
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 6,
    borderWidth: 1,
    borderColor: '#1E3A8A', // Sleek neon blue border highlight
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeading: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: '#FFD100', // Premium warm gold title
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passengerInfo: {
    flexShrink: 1,
    paddingRight: 16,
  },
  passengerName: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: '#FFFFFF', // High contrast white name
    marginBottom: 6,
  },
  passengerMeta: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#E2E8F0', // Soft readable grey metadata
    marginBottom: 3,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981', // Glowing Emerald Green call container
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20, // Clean pill shape
    shadowColor: '#10B981',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 4,
  },
  contactButtonDisabled: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
    elevation: 0,
  },
  contactButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  contactButtonTextDisabled: {
    color: '#64748B',
  },
  scheduleSection: {
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 209, 0, 0.08)', // Beautiful gold transparency
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 0, 0.15)',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleIcon: {
    marginRight: 12,
  },
  scheduleLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scheduleValue: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#FFFFFF', // White text schedule
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
    backgroundColor: 'rgba(255, 209, 0, 0.15)',
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
    color: '#FFD100',
  },
  badgeTextWarning: {
    color: '#B45309',
  },
  badgeTextOnDark: {
    color: '#FFFFFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 28, // Beautiful modern pill shape
    width: '92%',
    alignSelf: 'center',
    marginVertical: 8,
  },

  primaryButton: {
    backgroundColor: '#0F223C', // Solid deep navy backdrop
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 4,
  },
  actionButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#EF4444', // Red outline cancellation button
    backgroundColor: 'transparent',
    width: '92%',
    alignSelf: 'center',
    marginVertical: 8,
  },
  cancelButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#EF4444',
  },

  actionButtonIcon: {
    marginLeft: 8,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    width: '92%',
    alignSelf: 'center',
    gap: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Elegant off-white background
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0', // Beautiful thin outline
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
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  durationIconContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  fareIconContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  cardValue: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#0F223C', // Deep navy brand color
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
});


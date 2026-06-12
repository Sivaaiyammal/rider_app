import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { Colors, Fonts } from '../../common/constants/constants';
import { useStackScreenStore } from '../../common/store/useStackScreenStore';
import { useMapMarkerStore } from '../../common/store/useMapMarkerStore';
import useTripsStore from '../store/useTripsStore';
import useActingDriverMediaStore from '../store/useActingDriverMediaStore';
import { useTripAcceptStore } from '../store/useTripAcceptStore';
import CustomeBottomSheet from '../../common/components/CustomeBottomSheet';
import CancelRideModal from '../components/CancelModel';
import BGLocationTask from '../../common/controllers/BGLocationTask';
import locationTask from '../../common/controllers/GetCurrentLocation';
import {
  checkBackgroundLocationPermissions,
  checkFineLocationPermissions,
} from '../../common/controllers/PermissionHandler';
import useUserStore from '../../common/store/useUserStore';
import { useTranslation } from 'react-i18next';
import { AddBillModal } from './DriverBillsExpensesScreen';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import APIRequest from '../../common/APIRequest';
import { cancelTrip } from '../components/CancelTripUpdate';
import { showNotification } from '../../common/components/Alerts/showNotification';
import { DataStore } from '../../common/controllers/DataStore';

const VEHICLE_IMAGES = {
  suv: require('../../notCustomer/assets/vehicle/SUV.webp'),
  sedan: require('../../notCustomer/assets/vehicle/SEDAN.webp'),
  hatchback: require('../../notCustomer/assets/vehicle/HATCHBACK.webp'),
  exsedan: require('../../notCustomer/assets/vehicle/ExSEDAN.webp'),
  executive_sedan: require('../../notCustomer/assets/vehicle/ExSEDAN.webp'),
  auto: require('../../notCustomer/assets/vehicle/AUTO.webp'),
  bike: require('../../notCustomer/assets/vehicle/BIKE.webp'),
  electric_auto: require('../../notCustomer/assets/vehicle/ELECTRIC_AUTO.webp'),
};

const getVehicleImage = (type) => {
  if (!type) return require('../assets/images/audi_q2_white.png');
  const key = type.toLowerCase().trim().replace(/[\s-]/g, '_');
  return VEHICLE_IMAGES[key] || require('../assets/images/audi_q2_white.png');
};

const TABS = ['Trip', 'Earnings & Bills', 'Safety'];

const APPROVAL_CONFIG = {
  pending:  { color: '#FF9800', bg: '#FFF3E0', icon: 'clock-outline',  label: 'Pending' },
  approved: { color: '#43A047', bg: '#E8F5E9', icon: 'check-circle',   label: 'Approved' },
  rejected: { color: '#E53935', bg: '#FFEBEE', icon: 'close-circle',   label: 'Rejected' },
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getDayLabel = (dateStr) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const parts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = parts
    ? new Date(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]))
    : new Date(dateStr);
  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

const getDurationLabel = (hours) => {
  if (!hours || Number(hours) === 0) return 'Full Day';
  const h = Number(hours);
  return h === 1 ? '1 Hour' : `${h} Hours`;
};

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const ActingDriverOnRideScreen = () => {
  const { setStackScreen } = useStackScreenStore();

  const {
    disduration,
    userLocation,
    setStartNavigation,
    setDirectionPoints,
    routeLoading,
    setMapMarkers,
    setRouteNotFound,
  } = useMapMarkerStore();

  const { activeTripData, fareBreakDown } = useTripsStore();
  const { loading, setLoading, setFetchLocationDate, upComingTripDetails, setIsGetFare, setIsOnGoing, setHasActiveTrip } = useTripAcceptStore();
  const { postTripDone, bills, setBills, reset: resetDriverMedia } = useActingDriverMediaStore();
  const { userInfo } = useUserStore();
  const token = userInfo?.token;
  const { t } = useTranslation();

  const [cancelRideModalVisible, setCancelRideModalVisible] = useState(false);
  const [openNavChoiceModal, setOpenNavChoiceModal] = useState(false);
  const [showPostTripWarning, setShowPostTripWarning] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showAddBillModal, setShowAddBillModal] = useState(false);

  const onBillAdded = (bill) => {
    const existing = bills?.length > 0 ? bills : (trip?.bills?.bills || []).map((b, idx) => ({ ...b, id: `server_${idx}` }));
    setBills([...existing, bill]);
    setShowAddBillModal(false);
  };

  // upComingTripDetails is guaranteed to be set on entry; activeTripData may arrive later via socket
  const trip = activeTripData?.[0] || upComingTripDetails;
  const tripsStatus = activeTripData?.[0]?.status || upComingTripDetails?.status || '';

  const _postPhotos = trip?.bills?.postTripVehiclePhotos;
  const postTripUploadedOnServer = !!(
    _postPhotos?.front && _postPhotos?.rear && _postPhotos?.leftSide && _postPhotos?.rightSide
  );
  const postTripReady = postTripDone || postTripUploadedOnServer;

  const stops = trip?.stops || [];

  const customerName = trip?.bookingForName || '-';
  const customerPhone = trip?.bookingForPhone || '-';
  const vehicleNumber = trip?.vehicleNumber || '-';
  const vehicleModel = [ trip?.vehicleModel].filter(Boolean).join(' ') || trip?.vehicleType?.replace(/_/g, ' ') || '-';
  const vehicleColor = trip?.vehicleColor || '';
  const tripId = trip?._id ? `AD${trip._id.slice(-9).toUpperCase()}` : '-';
  const estimatedFare = trip?.minFare || trip?.estimatedFare || 0;
  // Use media store bills (includes newly added bills); fall back to server bills when store is empty
  const displayBills = bills?.length > 0 ? bills : (trip?.bills?.bills || []);
  const expenseTotal = displayBills.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
  const driverEarnings = fareBreakDown?.breakdown?.driverEarnings || estimatedFare;

  const specialRequests = [];
  if (trip?.femaleOnly) specialRequests.push({ icon: 'gender-female', label: 'Female Driver Only' });
  if (trip?.kidsOnBoard) specialRequests.push({ icon: 'baby-carriage', label: 'Kids On Board' });
  if (trip?.elderlyOnBoard) specialRequests.push({ icon: 'human-cane', label: 'Elderly On Board' });
  if (trip?.nightRide) specialRequests.push({ icon: 'weather-night', label: 'Night Ride' });
  if (trip?.actingDriverMaxSpeed) specialRequests.push({ icon: 'speedometer-medium', label: `Max Speed: ${trip.actingDriverMaxSpeed} km/h` });
  const customerNotes = trip?.actingDriverOtherRequests || null;

  const arrangements = [];
  if (trip?.actingDriverAccommodation) arrangements.push({ icon: 'bed-outline', label: 'Accommodation Provided' });
  if (trip?.actingDriverFood) arrangements.push({ icon: 'food-outline', label: 'Food Provided' });

  const itinerary = trip?.actingDriverItinerary || {};
  const itineraryDates = Object.keys(itinerary).sort();
  const isMultiDay = itineraryDates.length > 1;
  const durationLabel = getDurationLabel(trip?.actingDriverHours);

  const preTripPhotos = trip?.bills?.preTripVehiclePhotos || {};
  const dentPhotos = Array.isArray(trip?.bills?.dentPhotos) ? trip.bills.dentPhotos : [];
  const vehiclePhotoEntries = [
    preTripPhotos?.front    && { key: 'front',    label: 'Front',    uri: preTripPhotos.front },
    preTripPhotos?.rear     && { key: 'rear',     label: 'Rear',     uri: preTripPhotos.rear },
    preTripPhotos?.leftSide && { key: 'leftSide', label: 'Left',     uri: preTripPhotos.leftSide },
    preTripPhotos?.rightSide&& { key: 'rightSide',label: 'Right',    uri: preTripPhotos.rightSide },
    trip?.bills?.odometerPhoto && { key: 'odometer', label: 'Odometer', uri: trip.bills.odometerPhoto },
    ...dentPhotos.map((uri, i) => ({ key: `dent_${i}`, label: `Dent ${i + 1}`, uri })),
  ].filter(Boolean);

  // ─── Start Navigation ──────────────────────────────────────────────────────
  const onStartNavigationPress = () => setOpenNavChoiceModal(true);

  const handleNavMode = async (mode) => {
    setOpenNavChoiceModal(false);
    const pickupStop = stops[0];
    if (mode === 'google') {
      const lat = pickupStop?.location?.[1];
      const lng = pickupStop?.location?.[0];
      const url = lat && lng
        ? `https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=${lat},${lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupStop?.address || '')}`;
      Linking.openURL(url).catch(() => {});
      return;
    }
    const hasFine = await checkFineLocationPermissions();
    const hasBg = Platform.OS === 'android' && Platform.Version <= 28
      ? true
      : await checkBackgroundLocationPermissions();
    if (!hasFine || !hasBg) return;
    if (!userLocation) { await locationTask.getCurrentLocation(); return; }
    if (pickupStop?.location) {
      setDirectionPoints({
        locations: [
          { lat: userLocation[0], lon: userLocation[1] },
          { lat: pickupStop.location[1], lon: pickupStop.location[0] },
        ],
        type: 'car',
        padding: [50, 50, 50, 200],
      });
    }
    setStartNavigation(true);
    setMapMarkers([]);
    setRouteNotFound(null);
    await BGLocationTask.runDriverBgTask();
  };

  // ─── Cancel / End Trip ────────────────────────────────────────────────────
  const handleCancelRide = async (reason, translatedReason) => {
    const _reason = translatedReason || reason;

    if (!userLocation) {
      await locationTask.getCurrentLocation();
      showNotification('Fetching Current Location', '', 'info');
      return;
    }

    setLoading(true);

    if (tripsStatus === 'ACCEPTED') {
      try {
        const api = new APIRequest();
        const response = await api.request(
          '/publicrides/driver/v2/cancelTrip',
          'POST',
          {
            tripId: trip?._id,
            reason: _reason,
            isBeforePickup: true,
            droppedAtLoc: { lat: userLocation?.[0], lon: userLocation?.[1] },
          },
          token,
        );
        if (response.success) {
          resetDriverMedia();
          cancelTrip(response);
        } else {
          showNotification('Failed to Cancel Trip', response?.message, 'danger');
        }
      } catch {
        showNotification('Error', 'Could not cancel trip', 'danger');
      }
      setLoading(false);

    } else if (tripsStatus === 'PICKEDUP') {
      if (reason === 'reached_destination') {
        if (!postTripReady) { setLoading(false); setShowPostTripWarning(true); return; }
        setFetchLocationDate(true);
      } else {
        setIsGetFare(false);
        setFetchLocationDate(true);
        DataStore.storeData('isOngoingTrip', true);
        setIsOnGoing(true);
      }
      setLoading(false);
    }
  };

  // ─── Tabs ──────────────────────────────────────────────────────────────────
  const renderTripTab = () => (
    <>
      {/* Vehicle Card */}
      <View style={styles.vehicleCard}>
        <View style={styles.vehicleCardLeft}>
          <View style={styles.regBadge}>
            <Text style={styles.regBadgeTxt}>{vehicleNumber}</Text>
          </View>
          <Text style={styles.vehicleModelTxt}>{vehicleModel}</Text>
          <View style={styles.specChipsRow}>
            {!!vehicleColor && (
              <View style={styles.specChip}>
                <MaterialCommunityIcons name="palette" size={11} color="#757575" />
                <Text style={styles.specChipTxt}>{vehicleColor}</Text>
              </View>
            )}
            {!!(trip?.fuelType || trip?.passengerVehicleData?.fuelType || trip?.vehicleData?.fuelType) && (
              <View style={styles.specChip}>
                <MaterialCommunityIcons name="gas-station" size={11} color="#757575" />
                <Text style={styles.specChipTxt}>
                  {(trip?.fuelType || trip?.passengerVehicleData?.fuelType || trip?.vehicleData?.fuelType)?.replace(/_/g, ' ')}
                </Text>
              </View>
            )}
            {!!(trip?.vehicleType || trip?.passangerVehicleType) && (
              <View style={styles.specChip}>
                <MaterialCommunityIcons name="car" size={11} color="#757575" />
                <Text style={styles.specChipTxt}>
                  {(trip?.vehicleType || trip?.passangerVehicleType)?.replace(/_/g, ' ')}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.vehicleCardFooter}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTxt}>LIVE TRIP</Text>
            </View>
            <Text style={styles.tripIdTxt}>Trip ID: {tripId}</Text>
          </View>
        </View>
        <Image
          source={getVehicleImage(
            trip?.vehicleType ||
            trip?.passangerVehicleType ||
            trip?.passengerVehicleData?.type ||
            trip?.vehicleData?.type
          )}
          style={styles.vehicleCardImage}
          resizeMode="contain"
        />
      </View>

      {/* Customer Card */}
      <View style={styles.card}>
        <View style={styles.customerRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{customerName?.[0]?.toUpperCase() || 'P'}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.nameRatingRow}>
              <Text style={styles.customerNameTxt}>{customerName}</Text>
              <MaterialCommunityIcons name="star" size={13} color="#FFA000" />
              <Text style={styles.ratingTxt}>4.9</Text>
            </View>
            <Text style={styles.pickupTimeTxt}>
              Pickup • {formatTime(trip?.bookingTime)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.callBtnGreen}
            onPress={() => Linking.openURL(`tel:${customerPhone?.replace(/\s|-/g, '')}`)}>
            <Feather name="phone" size={18} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.chatBtn}>
            <Feather name="message-square" size={18} color="#0F223C" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        {/* <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={14} color="#42A5F5" />
            <View>
              <Text style={styles.statLabel}>Distance Left</Text>
              <Text style={styles.statValue}>{trip?.estimatedDistance ? `${parseFloat(trip.estimatedDistance).toFixed(1)} km` : '-'}</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#42A5F5" />
            <View>
              <Text style={styles.statLabel}>Time Left</Text>
              <Text style={styles.statValue}>{trip?.estimatedDuration ? `${trip.estimatedDuration} min` : '-'}</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="currency-inr" size={14} color="#42A5F5" />
            <View>
              <Text style={styles.statLabel}>Est. Earnings</Text>
              <Text style={styles.statValue}>₹{parseFloat(estimatedFare).toFixed(0)}</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="map-marker-multiple-outline" size={14} color="#42A5F5" />
            <View>
              <Text style={styles.statLabel}>Stops Left</Text>
              <Text style={styles.statValue}>{stops.length > 1 ? stops.length - 1 : 0}</Text>
            </View>
          </View>
        </View> */}
      </View>

      {/* Pickup & Drop */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="map-marker-path" size={16} color="#0F223C" />
          <Text style={styles.cardTitle}>Trip Details</Text>
        </View>
        <View style={styles.routeRow}>
          <View style={styles.routeLineCol}>
            <View style={styles.routeDotStart} />
            <View style={styles.routeLine} />
            <MaterialCommunityIcons name="map-marker" size={16} color="#E53935" style={{ marginLeft: -2 }} />
          </View>
          <View style={{ flex: 1, gap: 0 }}>
            <View style={styles.routeStop}>
              <View style={styles.routePickupBadge}>
                <Text style={styles.routePickupBadgeTxt}>PICKUP</Text>
              </View>
              <Text style={styles.routeStopAddr} numberOfLines={2}>
                {stops[0]?.address || '-'}
              </Text>
            </View>
            <View style={styles.routeDivider} />
            <View style={styles.routeStop}>
              <View style={styles.routeDropBadge}>
                <Text style={styles.routeDropBadgeTxt}>DROP</Text>
              </View>
              <Text style={styles.routeStopAddr} numberOfLines={2}>
                {stops.length > 1 ? (stops[stops.length - 1]?.address || '-') : '-'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Trip Duration */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="calendar-clock" size={16} color="#0F223C" />
          <Text style={styles.cardTitle}>Trip Duration</Text>
          {trip?.tripType && (
            <View style={styles.tripTypeBadge}>
              <Text style={styles.tripTypeTxt}>
                {trip.tripType === 'ROUND_TRIP' ? 'Round Trip' : 'One Way'}
              </Text>
            </View>
          )}
        </View>
        {itineraryDates.length > 0 ? (
          itineraryDates.map((dateStr, idx) => (
            <View key={dateStr} style={[styles.durationRow, idx > 0 && { borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 8, paddingTop: 8 }]}>
              <View style={styles.durationDayCol}>
                <View style={[styles.durationDayDot, isMultiDay && { backgroundColor: '#352166' }]} />
                {idx < itineraryDates.length - 1 && <View style={styles.durationDayLine} />}
              </View>
              <View style={styles.durationDayContent}>
                <Text style={styles.durationDayLabel}>{getDayLabel(dateStr)}</Text>
                <View style={styles.durationBadge}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color="#352166" />
                  <Text style={styles.durationBadgeTxt}>{durationLabel}</Text>
                </View>
                <Text style={styles.durationDateTxt}>
                  {(() => {
                    const parts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
                    if (!parts) return dateStr;
                    const d = new Date(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]));
                    return d.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
                  })()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.durationRow}>
            <View style={styles.durationDayCol}>
              <View style={styles.durationDayDot} />
            </View>
            <View style={styles.durationDayContent}>
              <Text style={styles.durationDayLabel}>
                {trip?.scheduleDateTime
                  ? getDayLabel(new Date(trip.scheduleDateTime).toISOString().split('T')[0])
                  : 'Today'}
              </Text>
              <View style={styles.durationBadge}>
                <MaterialCommunityIcons name="clock-outline" size={12} color="#352166" />
                <Text style={styles.durationBadgeTxt}>{durationLabel}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Trip Itinerary — day-by-day plan added by customer */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="map-marker-path" size={16} color="#0F223C" />
          <Text style={styles.cardTitle}>Trip Itinerary</Text>
          {itineraryDates.length > 0 && (
            <View style={styles.stopCountBadge}>
              <Text style={styles.stopCountTxt}>{itineraryDates.length} {itineraryDates.length === 1 ? 'Day' : 'Days'}</Text>
            </View>
          )}
        </View>
        {itineraryDates.length === 0 ? (
          <Text style={styles.emptyBillsTxt}>No itinerary added for this trip</Text>
        ) : (
          itineraryDates.map((dateStr, dayIdx) => {
            const dayLocs = Array.isArray(itinerary[dateStr]) ? itinerary[dateStr] : (itinerary[dateStr]?.locations || []);
            return (
              <View key={dateStr} style={[styles.itinDayWrap, dayIdx > 0 && { borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 10, paddingTop: 10 }]}>
                <View style={styles.itinDayHeader}>
                  <MaterialCommunityIcons name="calendar-today" size={13} color="#352166" />
                  <Text style={styles.itinDayLabel}>{getDayLabel(dateStr)}</Text>
                  <Text style={styles.itinDayDate}>
                    {(() => {
                      const parts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
                      if (!parts) return '';
                      const d = new Date(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]));
                      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                    })()}
                  </Text>
                </View>
                {dayLocs.length === 0 ? (
                  <Text style={styles.itinEmptyTxt}>No locations planned</Text>
                ) : (
                  dayLocs.map((loc, locIdx) => {
                    const isLastLoc = locIdx === dayLocs.length - 1;
                    return (
                      <View key={locIdx} style={styles.stopRow}>
                        <View style={styles.stopLineCol}>
                          <View style={[styles.stopDot, locIdx === 0 ? styles.stopDotStart : isLastLoc ? styles.stopDotEnd : styles.stopDotMid]} />
                          {!isLastLoc && <View style={styles.stopLine} />}
                        </View>
                        <View style={styles.stopContent}>
                          {!!loc.time && (
                            <View style={styles.stopTopRow}>
                              <Text style={styles.stopTime}>{loc.time}</Text>
                            </View>
                          )}
                          <Text style={styles.stopName} numberOfLines={1}>{loc.name || `Location ${locIdx + 1}`}</Text>
                          {!!loc.address && <Text style={styles.stopAddr} numberOfLines={1}>{loc.address}</Text>}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            );
          })
        )}
      </View>

      {/* Special Requirements */}
      {specialRequests.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="shield-star-outline" size={16} color="#0F223C" />
            <Text style={styles.cardTitle}>Special Requirements</Text>
          </View>
          {specialRequests.map((req, i) => (
            <View key={i} style={styles.reqRow}>
              <View style={styles.reqIcon}>
                <MaterialCommunityIcons name={req.icon} size={16} color="#352166" />
              </View>
              <Text style={styles.reqLabel}>{req.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Driver Arrangements */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="briefcase-outline" size={16} color="#0F223C" />
          <Text style={styles.cardTitle}>Driver Arrangements</Text>
        </View>
        {arrangements.length === 0 ? (
          <Text style={styles.reqLabel}>-</Text>
        ) : arrangements.map((arr, i) => (
          <View key={i} style={styles.reqRow}>
            <View style={styles.reqIcon}>
              <MaterialCommunityIcons name={arr.icon} size={16} color="#43A047" />
            </View>
            <Text style={styles.reqLabel}>{arr.label}</Text>
          </View>
        ))}
      </View>

      {/* Customer Notes */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="note-text-outline" size={16} color="#0F223C" />
          <Text style={styles.cardTitle}>Customer Notes</Text>
        </View>
        {customerNotes ? (
          <View style={styles.customerNotesBox}>
            <Text style={styles.customerNotesTxt}>{customerNotes}</Text>
          </View>
        ) : (
          <Text style={styles.reqLabel}>-</Text>
        )}
      </View>
    </>
  );

  const renderEarningsTab = () => (
    <>
      {/* Trip Earnings */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="wallet-outline" size={16} color="#0F223C" />
          <Text style={styles.cardTitle}>Trip Earnings</Text>
          <TouchableOpacity style={styles.breakupBtn}>
            <Text style={styles.breakupTxt}>Breakup</Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color="#352166" />
          </TouchableOpacity>
        </View>
        <View style={styles.earningsRow}>
          <View style={styles.earningItem}>
            <Text style={styles.earningLabel}>Your Earnings</Text>
            <Text style={[styles.earningValue, { color: '#43A047' }]}>₹{parseFloat(driverEarnings || 0).toFixed(0)}</Text>
          </View>
          <View style={styles.earningDivider} />
          <View style={styles.earningItem}>
            <Text style={styles.earningLabel}>Trip Fare</Text>
            <Text style={styles.earningValue}>₹{parseFloat(estimatedFare || 0).toFixed(0)}</Text>
          </View>
          <View style={styles.earningDivider} />
          <View style={styles.earningItem}>
            <Text style={styles.earningLabel}>Total Expenses</Text>
            <Text style={[styles.earningValue, { color: '#E53935' }]}>₹{expenseTotal.toFixed(0)}</Text>
          </View>
        </View>
        {/* Total Payable */}
        <View style={styles.totalPayableRow}>
          <View>
            <Text style={styles.totalPayableLabel}>Total Payable by Customer</Text>
            <Text style={styles.totalPayableSub}>Trip Fare + Expenses</Text>
          </View>
          <Text style={styles.totalPayableValue}>
            ₹{(parseFloat(driverEarnings || 0) + expenseTotal).toFixed(0)}
          </Text>
        </View>
      </View>

      {/* Trip Bills */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="receipt" size={16} color="#0F223C" />
          <Text style={styles.cardTitle}>Trip Bills</Text>
          <TouchableOpacity style={styles.addBillBtn} onPress={() => {
            if (!bills?.length) {
              const serverBills = trip?.bills?.bills || [];
              if (serverBills.length > 0) {
                setBills(serverBills.map((b, idx) => ({ ...b, id: `server_${idx}`, serverIndex: idx, approval: b.approval || 'pending' })));
              }
            }
            setStackScreen('DriverBillsExpensesScreen');
          }}>
            <Text style={styles.addBillTxt}>View Bills</Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color="#352166" />
          </TouchableOpacity>
        </View>
        {displayBills.length === 0 ? (
          <Text style={styles.emptyBillsTxt}>No bills added yet</Text>
        ) : (
          displayBills.map((bill, i) => (
            <View key={i} style={styles.billRow}>
              <MaterialCommunityIcons name="receipt" size={16} color="#757575" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.billName}>{bill.description || bill.type || bill.name || `Bill ${i + 1}`}</Text>
                {!!bill.time && <Text style={styles.billTime}>{bill.time}</Text>}
              </View>
              <View style={styles.billRowRight}>
                <Text style={styles.billAmt}>₹{parseFloat(bill.amount || 0).toFixed(0)}</Text>
                {(() => {
                  const cfg = APPROVAL_CONFIG[bill.approval || 'pending'];
                  return (
                    <View style={[styles.billApprovalBadge, { backgroundColor: cfg.bg }]}>
                      <MaterialCommunityIcons name={cfg.icon} size={10} color={cfg.color} />
                      <Text style={[styles.billApprovalTxt, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  );
                })()}
              </View>
            </View>
          ))
        )}
        <TouchableOpacity style={styles.addBillFullBtn} onPress={() => setShowAddBillModal(true)} activeOpacity={0.8}>
          <MaterialCommunityIcons name="plus-circle-outline" size={16} color="#352166" />
          <Text style={styles.addBillFullTxt}>Add Bill / Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Vehicle Photos */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="camera-outline" size={16} color="#0F223C" />
          <Text style={styles.cardTitle}>Vehicle Photos</Text>
          <Text style={styles.photoCountTxt}>
            {vehiclePhotoEntries.length} added
          </Text>
        </View>
        {vehiclePhotoEntries.length === 0 ? (
          <Text style={styles.emptyBillsTxt}>No photos uploaded yet</Text>
        ) : (
          <GHScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoGrid}>
            {vehiclePhotoEntries.map((p, i) => (
              <TouchableOpacity key={i} style={styles.photoThumb} onPress={() => setStackScreen('DriverVehiclePhotosScreen')} activeOpacity={0.8}>
                <Image source={{ uri: p.uri }} style={styles.photoImg} />
                <View style={styles.photoApprovedDot}>
                  <MaterialCommunityIcons name="check" size={8} color={Colors.white} />
                </View>
                <Text style={styles.photoLabel}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </GHScrollView>
        )}
        <Text style={styles.photoHint}>Tap a tile to capture or upload • Helps verify vehicle condition</Text>
      </View>
    </>
  );

  const renderSafetyTab = () => (
    <>
      {/* Speed & Safety */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="shield-check-outline" size={16} color="#0F223C" />
          <Text style={styles.cardTitle}>Speed & Safety</Text>
          <View style={styles.monitoringBadge}>
            <View style={styles.monitoringDot} />
            <Text style={styles.monitoringTxt}>Monitoring</Text>
          </View>
        </View>
        <View style={styles.speedRow}>
          <View style={styles.speedGaugeWrap}>
            <Text style={styles.speedValue}>—</Text>
            <Text style={styles.speedUnit}>km/h</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.safetyStatusTxt}>Driving within safe limits</Text>
            <Text style={styles.safetySubTxt}>Live speed is being monitored against road speed limits in real time.</Text>
            <View style={styles.speedLimitBadge}>
              <MaterialCommunityIcons name="speedometer" size={12} color="#E53935" />
              <Text style={styles.speedLimitTxt}>Speed Limit: {trip?.actingDriverMaxSpeed || 80} km/h</Text>
            </View>
          </View>
        </View>
        <View style={styles.safetyStatsRow}>
          <View style={styles.safetyStatItem}>
            <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#E53935" />
            <Text style={styles.safetyStatLabel}>Alerts</Text>
            <Text style={[styles.safetyStatValue, { color: '#E53935' }]}>0 times</Text>
          </View>
          <View style={styles.safetyStatItem}>
            <MaterialCommunityIcons name="play-circle-outline" size={14} color="#42A5F5" />
            <Text style={styles.safetyStatLabel}>Trip Started</Text>
            <Text style={styles.safetyStatValue}>{formatTime(trip?.tripStartTime) || '—'}</Text>
          </View>
          <View style={styles.safetyStatItem}>
            <MaterialCommunityIcons name="speedometer-medium" size={14} color="#43A047" />
            <Text style={styles.safetyStatLabel}>Avg Speed</Text>
            <Text style={styles.safetyStatValue}>— km/h</Text>
          </View>
        </View>
      </View>

      {/* Upload Photos */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="car-outline" size={16} color="#0F223C" />
          <Text style={styles.cardTitle}>Upload Photos</Text>
        </View>
        <TouchableOpacity style={styles.uploadRow} onPress={() => setStackScreen('DriverVehiclePhotosScreen')} activeOpacity={0.8}>
          <View style={styles.uploadIconWrap}>
            <MaterialCommunityIcons name="car-outline" size={20} color={Colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.uploadRowTitle}>Vehicle Photos</Text>
            <Text style={styles.uploadRowSub}>Pre-trip & post-trip condition</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#BDBDBD" />
        </TouchableOpacity>
        <View style={styles.rowDivider} />
        <TouchableOpacity style={styles.uploadRow} onPress={() => setShowAddBillModal(true)} activeOpacity={0.8}>
          <View style={[styles.uploadIconWrap, { backgroundColor: '#E8EAF6' }]}>
            <MaterialCommunityIcons name="receipt" size={20} color="#3949AB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.uploadRowTitle}>Bills & Expenses</Text>
            <Text style={styles.uploadRowSub}>Toll, parking, interstate tax</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#BDBDBD" />
        </TouchableOpacity>
      </View>
    </>
  );

  // ─── Nav choice modal ──────────────────────────────────────────────────────
  const renderNavChoiceModal = () => (
    <Modal visible={openNavChoiceModal} transparent animationType="fade" onRequestClose={() => setOpenNavChoiceModal(false)}>
      <View style={styles.navOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setOpenNavChoiceModal(false)} activeOpacity={1} />
        <View style={styles.navSheet}>
          <View style={styles.navHandle} />
          <Text style={styles.navTitle}>Choose Navigation</Text>
          <Text style={styles.navSub}>Select your preferred navigation app</Text>
          <View style={styles.navOptionsRow}>
            <TouchableOpacity style={styles.navOptionCard} onPress={() => handleNavMode('google')} activeOpacity={0.8}>
              <MaterialCommunityIcons name="google-maps" size={32} color="#4285F4" />
              <Text style={styles.navOptionLabel}>Google Maps</Text>
              <Text style={styles.navOptionDesc}>Open in Google Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navOptionCard} onPress={() => handleNavMode('vm')} activeOpacity={0.8}>
              <MaterialCommunityIcons name="map-outline" size={32} color="#352166" />
              <Text style={styles.navOptionLabel}>VirtualMaze</Text>
              <Text style={styles.navOptionDesc}>In-app navigation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ─── Post-trip warning modal ───────────────────────────────────────────────
  const renderPostTripWarning = () => (
    <Modal visible={showPostTripWarning} transparent animationType="fade" onRequestClose={() => setShowPostTripWarning(false)}>
      <View style={styles.warnOverlay}>
        <View style={styles.warnBox}>
          <MaterialCommunityIcons name="camera-off-outline" size={40} color="#E53935" style={{ alignSelf: 'center', marginBottom: 10 }} />
          <Text style={styles.warnTitle}>Post-Trip Photos Required</Text>
          <Text style={styles.warnMsg}>
            Please upload the 4 post-trip vehicle condition photos before ending the ride.
          </Text>
          <TouchableOpacity
            style={styles.warnBtn}
            onPress={() => { setShowPostTripWarning(false); setStackScreen('ActingDriverPostTripScreen'); }}
            activeOpacity={0.8}>
            <MaterialCommunityIcons name="camera-plus-outline" size={18} color={Colors.white} />
            <Text style={styles.warnBtnTxt}>Upload Photos Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.warnCancelBtn} onPress={() => setShowPostTripWarning(false)}>
            <Text style={styles.warnCancelTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1 }}>
      <CustomeBottomSheet useScrollView={true}>

        {/* ── Start Navigation button ── */}
        {!disduration && tripsStatus !== 'COMPLETED' && (
          <TouchableOpacity
            style={[styles.navBtn, (routeLoading?.loading && routeLoading?.message !== 'initialState') && { opacity: 0.7 }]}
            onPress={onStartNavigationPress}
            disabled={routeLoading?.loading && routeLoading?.message !== 'initialState'}
            activeOpacity={0.85}>
            {routeLoading?.loading && routeLoading?.message !== 'initialState'
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <MaterialCommunityIcons name="navigation-variant-outline" size={20} color={Colors.white} />}
            <Text style={styles.navBtnTxt}>Start Navigation</Text>
          </TouchableOpacity>
        )}

        {/* ── Tab Bar ── */}
        <View style={styles.tabBar}>
          {TABS.map((tab, i) => (
            <TouchableOpacity key={i} style={[styles.tabItem, activeTab === i && styles.tabItemActive]} onPress={() => setActiveTab(i)} activeOpacity={0.8}>
              <Text style={[styles.tabTxt, activeTab === i && styles.tabTxtActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab Content ── */}
        {activeTab === 0 && renderTripTab()}
        {activeTab === 1 && renderEarningsTab()}
        {activeTab === 2 && renderSafetyTab()}

        <View style={{ height: 120 }} />
      </CustomeBottomSheet>

      {/* ── Footer: SOS + Call + End Trip ── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.sosBtn} onPress={() => Linking.openURL('tel:112')} activeOpacity={0.8}>
          <View style={styles.sosDot}>
            <Text style={styles.sosDotTxt}>SOS</Text>
          </View>
          <Text style={styles.sosTxt}>SOS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.callFooterBtn}
          onPress={() => Linking.openURL(`tel:${customerPhone?.replace(/\s|-/g, '')}`)}>
          <Feather name="phone" size={18} color="#0F223C" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.endTripBtn} onPress={() => setCancelRideModalVisible(true)} activeOpacity={0.85}>
          <Text style={styles.endTripTxt}>
            {tripsStatus === 'PICKEDUP' ? 'End Trip' : 'Cancel Trip'}
          </Text>
        </TouchableOpacity>
      </View>

      {renderNavChoiceModal()}
      {renderPostTripWarning()}
      <AddBillModal
        visible={showAddBillModal}
        onClose={() => setShowAddBillModal(false)}
        onAdd={onBillAdded}
        tripId={trip?._id}
        token={token}
        t={t}
      />
      {cancelRideModalVisible && (
        <CancelRideModal
          modalVisible={cancelRideModalVisible}
          setModalVisible={setCancelRideModalVisible}
          callCancelRide={(reason, translatedReason) => {
            setCancelRideModalVisible(false);
            handleCancelRide(reason, translatedReason);
          }}
          loading={loading}
          tripData={trip}
        />
      )}
    </View>
  );
};

export default ActingDriverOnRideScreen;

const styles = StyleSheet.create({
  // Start Navigation
  navBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#0F223C', marginHorizontal: 16, marginBottom: 12,
    paddingVertical: 14, borderRadius: 30, elevation: 4,
  },
  navBtnTxt: { fontSize: 15, fontFamily: Fonts.bold, color: Colors.white, letterSpacing: 0.3 },

  // Tab bar
  tabBar: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 14,
    backgroundColor: '#F0F4F8', borderRadius: 12, padding: 4,
  },
  tabItem: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabItemActive: { backgroundColor: Colors.white, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  tabTxt: { fontSize: 11, fontFamily: Fonts.medium, color: '#888' },
  tabTxtActive: { color: '#0F223C', fontFamily: Fonts.semi_bold },

  // Cards
  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    marginHorizontal: 16, marginBottom: 12, elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  cardTitle: { flex: 1, fontSize: 13, fontFamily: Fonts.semi_bold, color: '#0F223C' },

  // Vehicle card
  vehicleCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    marginHorizontal: 16, marginBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  vehicleCardLeft: { flex: 1, gap: 4 },
  vehicleCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  vehicleCardImage: { width: 110, height: 80 },
  specChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  specChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0F4F8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  specChipTxt: { fontSize: 11, fontFamily: Fonts.medium, color: '#555', textTransform: 'capitalize' },
  regBadge: { alignSelf: 'flex-start', backgroundColor: '#0F223C', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 2 },
  regBadgeTxt: { fontSize: 13, fontFamily: Fonts.bold, color: Colors.white, letterSpacing: 1 },
  vehicleModelTxt: { fontSize: 14, fontFamily: Fonts.bold, color: '#0F223C' },
  colorTxt: { fontSize: 12, fontFamily: Fonts.regular, color: '#757575' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#43A047' },
  liveTxt: { fontSize: 11, fontFamily: Fonts.bold, color: '#43A047' },
  tripIdTxt: { fontSize: 11, fontFamily: Fonts.regular, color: '#757575' },

  // Customer card
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 0, marginBottom: 12 },
  avatarCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#352166', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 18, fontFamily: Fonts.bold, color: Colors.white },
  nameRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  customerNameTxt: { fontSize: 15, fontFamily: Fonts.semi_bold, color: '#0F223C', marginRight: 2 },
  customerNotesBox: { backgroundColor: '#F7F8FA', borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: '#352166' },
  customerNotesTxt: { fontSize: 13, fontFamily: Fonts.regular, color: '#333', lineHeight: 20 },
  ratingTxt: { fontSize: 12, fontFamily: Fonts.semi_bold, color: '#0F223C' },
  pickupTimeTxt: { fontSize: 12, fontFamily: Fonts.regular, color: '#757575', marginTop: 2 },
  callBtnGreen: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#43A047', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  chatBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F4F8', alignItems: 'center', justifyContent: 'center', marginLeft: 6 },

  // Stats row
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8FA', borderRadius: 12, padding: 10 },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  statDivider: { width: 1, height: 30, backgroundColor: '#E0E0E0' },
  statLabel: { fontSize: 9, fontFamily: Fonts.regular, color: '#888' },
  statValue: { fontSize: 12, fontFamily: Fonts.bold, color: '#0F223C' },

  // Pickup & Drop route row
  routeRow: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  routeLineCol: { width: 16, alignItems: 'center', paddingTop: 4, paddingBottom: 2 },
  routeDotStart: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#42A5F5', borderWidth: 2, borderColor: '#fff', elevation: 1 },
  routeLine: { flex: 1, width: 2, backgroundColor: '#E0E0E0', marginVertical: 2 },
  routeStop: { paddingVertical: 8 },
  routePickupBadge: { alignSelf: 'flex-start', backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginBottom: 4 },
  routePickupBadgeTxt: { fontSize: 10, fontFamily: Fonts.bold, color: '#1565C0' },
  routeDropBadge: { alignSelf: 'flex-start', backgroundColor: '#FCE4EC', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginBottom: 4 },
  routeDropBadgeTxt: { fontSize: 10, fontFamily: Fonts.bold, color: '#C62828' },
  routeStopAddr: { fontSize: 13, fontFamily: Fonts.regular, color: '#222', lineHeight: 18 },
  routeDivider: { height: 1, backgroundColor: '#F0F0F0' },

  // Itinerary stops
  stopCountBadge: { backgroundColor: '#F0F4F8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  stopCountTxt: { fontSize: 10, fontFamily: Fonts.medium, color: '#0F223C' },
  stopRow: { flexDirection: 'row', marginBottom: 2 },
  stopLineCol: { width: 20, alignItems: 'center', paddingTop: 3 },
  stopDot: { width: 10, height: 10, borderRadius: 5 },
  stopDotStart: { backgroundColor: '#42A5F5' },
  stopDotMid: { backgroundColor: '#FFA000' },
  stopDotEnd: { backgroundColor: '#E53935' },
  stopLine: { width: 2, flex: 1, backgroundColor: '#E0E0E0', marginTop: 3, marginBottom: 3 },
  stopContent: { flex: 1, paddingLeft: 8, paddingBottom: 14 },
  stopTopRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 2 },
  stopTime: { fontSize: 11, fontFamily: Fonts.medium, color: '#FFA000' },
  stopTagBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  stopTagTxt: { fontSize: 9, fontFamily: Fonts.bold },
  stopName: { fontSize: 13, fontFamily: Fonts.semi_bold, color: '#0F223C' },
  stopAddr: { fontSize: 11, fontFamily: Fonts.regular, color: '#757575', marginTop: 1 },
  showMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 4 },
  showMoreTxt: { fontSize: 12, fontFamily: Fonts.semi_bold, color: '#352166' },

  // Trip summary
  tripSummaryRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12, marginTop: 4, gap: 0 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 10, fontFamily: Fonts.regular, color: '#888' },
  summaryValue: { fontSize: 13, fontFamily: Fonts.bold, color: '#0F223C', marginTop: 2 },
  routeStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  routeStatusTxt: { fontSize: 11, fontFamily: Fonts.medium, color: '#43A047' },
  updatedTxt: { fontSize: 11, fontFamily: Fonts.regular, color: '#BDBDBD' },

  // Trip Duration card
  tripTypeBadge: { backgroundColor: '#EDE7F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tripTypeTxt: { fontSize: 10, fontFamily: Fonts.semi_bold, color: '#4527A0' },
  durationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  durationDayCol: { width: 16, alignItems: 'center', paddingTop: 4 },
  durationDayDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#42A5F5' },
  durationDayLine: { width: 2, flex: 1, minHeight: 24, backgroundColor: '#E0E0E0', marginTop: 3 },
  durationDayContent: { flex: 1, gap: 4 },
  durationDayLabel: { fontSize: 14, fontFamily: Fonts.bold, color: '#0F223C' },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#EDE7F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  durationBadgeTxt: { fontSize: 12, fontFamily: Fonts.semi_bold, color: '#352166' },
  durationDateTxt: { fontSize: 11, fontFamily: Fonts.regular, color: '#757575' },

  // Requirements
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  reqIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F0F4F8', alignItems: 'center', justifyContent: 'center' },
  reqLabel: { fontSize: 13, fontFamily: Fonts.regular, color: '#333', flex: 1 },

  // Earnings
  earningsRow: { flexDirection: 'row', backgroundColor: '#F7F8FA', borderRadius: 12, padding: 12 },
  earningItem: { flex: 1, alignItems: 'center', gap: 4 },
  earningDivider: { width: 1, backgroundColor: '#E0E0E0' },
  earningLabel: { fontSize: 10, fontFamily: Fonts.regular, color: '#888' },
  earningValue: { fontSize: 16, fontFamily: Fonts.bold, color: '#0F223C' },
  totalPayableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  totalPayableLabel: { fontSize: 13, fontFamily: Fonts.semi_bold, color: '#0F223C' },
  totalPayableSub: { fontSize: 10, fontFamily: Fonts.regular, color: '#888', marginTop: 2 },
  totalPayableValue: { fontSize: 22, fontFamily: Fonts.bold, color: '#43A047' },
  breakupBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  breakupTxt: { fontSize: 12, fontFamily: Fonts.medium, color: '#352166' },

  // Bills
  addBillBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  addBillTxt: { fontSize: 12, fontFamily: Fonts.medium, color: '#352166' },
  billRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  billName: { fontSize: 13, fontFamily: Fonts.medium, color: '#333' },
  billTime: { fontSize: 10, fontFamily: Fonts.regular, color: '#BDBDBD', marginTop: 1 },
  billAmt: { fontSize: 14, fontFamily: Fonts.bold, color: '#0F223C' },
  billRowRight: { alignItems: 'flex-end', gap: 4 },
  billApprovalBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  billApprovalTxt: { fontSize: 10, fontFamily: Fonts.medium },
  emptyBillsTxt: { fontSize: 12, fontFamily: Fonts.regular, color: '#BDBDBD', textAlign: 'center', paddingVertical: 12 },
  addBillFullBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 4 },
  addBillFullTxt: { fontSize: 13, fontFamily: Fonts.semi_bold, color: '#352166' },

  // Photos
  photoCountTxt: { fontSize: 11, fontFamily: Fonts.medium, color: '#757575' },
  photoGrid: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
  photoThumb: { width: 80, height: 80, backgroundColor: '#F7F8FA', borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#E8ECEF' },
  photoImg: { width: 80, height: 80, position: 'absolute' },
  photoApprovedDot: { position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#43A047', alignItems: 'center', justifyContent: 'center' },
  photoLabel: { fontSize: 9, fontFamily: Fonts.medium, color: '#0F223C', marginTop: 4, textAlign: 'center' },
  photoHint: { fontSize: 10, fontFamily: Fonts.regular, color: '#BDBDBD', textAlign: 'center' },

  // Upload rows
  uploadRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  uploadIconWrap: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#0F223C', alignItems: 'center', justifyContent: 'center' },
  uploadRowTitle: { fontSize: 13, fontFamily: Fonts.medium, color: '#0F223C' },
  uploadRowSub: { fontSize: 10, fontFamily: Fonts.regular, color: '#888', marginTop: 1 },
  rowDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 2 },

  // Safety
  monitoringBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  monitoringDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#43A047' },
  monitoringTxt: { fontSize: 10, fontFamily: Fonts.medium, color: '#43A047' },
  speedRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  speedGaugeWrap: { width: 72, height: 72, borderRadius: 36, borderWidth: 5, borderColor: '#43A047', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FA' },
  speedValue: { fontSize: 22, fontFamily: Fonts.bold, color: '#0F223C' },
  speedUnit: { fontSize: 9, fontFamily: Fonts.regular, color: '#888' },
  safetyStatusTxt: { fontSize: 13, fontFamily: Fonts.semi_bold, color: '#0F223C', marginBottom: 4 },
  safetySubTxt: { fontSize: 11, fontFamily: Fonts.regular, color: '#757575', lineHeight: 15, marginBottom: 6 },
  speedLimitBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEEBE9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  speedLimitTxt: { fontSize: 10, fontFamily: Fonts.medium, color: '#E53935' },
  safetyStatsRow: { flexDirection: 'row', backgroundColor: '#F7F8FA', borderRadius: 10, padding: 10, gap: 0 },
  safetyStatItem: { flex: 1, alignItems: 'center', gap: 3 },
  safetyStatLabel: { fontSize: 9, fontFamily: Fonts.regular, color: '#888' },
  safetyStatValue: { fontSize: 12, fontFamily: Fonts.bold, color: '#0F223C' },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#F0F0F0', elevation: 10,
  },
  sosBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#E53935' },
  sosDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E53935', alignItems: 'center', justifyContent: 'center' },
  sosDotTxt: { fontSize: 7, fontFamily: Fonts.bold, color: Colors.white },
  sosTxt: { fontSize: 13, fontFamily: Fonts.semi_bold, color: '#E53935' },
  callFooterBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0F4F8', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
  endTripBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: '#E53935', alignItems: 'center', elevation: 2 },
  endTripTxt: { fontSize: 15, fontFamily: Fonts.semi_bold, color: Colors.white },

  // Nav choice modal
  navOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  navSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 12 },
  navHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 4 },
  navTitle: { fontSize: 16, fontFamily: Fonts.semi_bold, color: '#0F223C' },
  navSub: { fontSize: 12, fontFamily: Fonts.regular, color: '#757575' },
  navOptionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  navOptionCard: { flex: 1, alignItems: 'center', backgroundColor: '#F7F8FA', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E8ECEF', gap: 6 },
  navOptionLabel: { fontSize: 14, fontFamily: Fonts.semi_bold, color: '#0F223C' },
  navOptionDesc: { fontSize: 11, fontFamily: Fonts.regular, color: '#757575', textAlign: 'center' },

  // Post-trip warning modal
  warnOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  warnBox: { backgroundColor: Colors.white, borderRadius: 16, padding: 24, width: '100%', gap: 10 },
  warnTitle: { fontSize: 16, fontFamily: Fonts.semi_bold, color: '#BF360C', textAlign: 'center' },
  warnMsg: { fontSize: 13, fontFamily: Fonts.regular, color: '#555', textAlign: 'center', lineHeight: 18 },
  warnBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#E53935', paddingVertical: 13, borderRadius: 10, marginTop: 4 },
  warnBtnTxt: { fontSize: 14, fontFamily: Fonts.semi_bold, color: Colors.white },
  warnCancelBtn: { alignItems: 'center', paddingVertical: 8 },
  warnCancelTxt: { fontSize: 13, fontFamily: Fonts.medium, color: '#757575' },

});

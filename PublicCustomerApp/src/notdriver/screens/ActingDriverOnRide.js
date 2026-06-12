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
  const [itinNavTarget, setItinNavTarget] = useState(null);
  const [showPostTripWarning, setShowPostTripWarning] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [arrivedStopInfo, setArrivedStopInfo] = useState(null);
  const [localReachedStops, setLocalReachedStops] = useState(new Set());
  const [markingDone, setMarkingDone] = useState(false);
  const [itinOpen, setItinOpen] = useState(true);

  const onBillAdded = (bill) => {
    const existing = bills?.length > 0 ? bills : (trip?.bills?.bills || []).map((b, idx) => ({ ...b, id: `server_${idx}` }));
    setBills([...existing, bill]);
    setShowAddBillModal(false);
  };

  // upComingTripDetails is guaranteed to be set on entry; activeTripData may arrive later via socket
  const trip = activeTripData?.[0] || upComingTripDetails;
  const tripsStatus = activeTripData?.[0]?.status || upComingTripDetails?.status || '';

  // console.log('[ActingDriverOnRide] activeTripData:', JSON.stringify(activeTripData?.[0], null, 2));
  // console.log('[ActingDriverOnRide] upComingTripDetails:', JSON.stringify(upComingTripDetails, null, 2));
  // console.log('[ActingDriverOnRide] trip (resolved):', JSON.stringify(trip, null, 2));
  // console.log('[ActingDriverOnRide] vehicle fields => number:', trip?.vehicleNumber, '| model:', trip?.vehicleModel, '| color:', trip?.vehicleColor, '| type:', trip?.vehicleType, '| fuelType:', trip?.fuelType);
  // console.log('[ActingDriverOnRide] passengerVehicleData:', JSON.stringify(trip?.passengerVehicleData, null, 2));
  // console.log('[ActingDriverOnRide] vehicleData:', JSON.stringify(trip?.vehicleData, null, 2));
  // console.log('[ActingDriverOnRide] tripsStatus:', tripsStatus);
  // console.log('[ActingDriverOnRide] userLocation:', userLocation);

  const _postPhotos = trip?.bills?.postTripVehiclePhotos;
  const postTripUploadedOnServer = !!(
    _postPhotos?.front && _postPhotos?.rear && _postPhotos?.leftSide && _postPhotos?.rightSide
  );
  const postTripReady = postTripDone || postTripUploadedOnServer;

  const stops = trip?.stops || [];

  const customerName = trip?.bookingForName || '-';
  const customerPhone = trip?.bookingForPhone || '-';
  const vehicleNumber = trip?.vehicleNumber || upComingTripDetails?.vehicleNumber || '-';
  const vehicleModel = trip?.vehicleModel || upComingTripDetails?.vehicleModel || trip?.vehicleType?.replace(/_/g, ' ') || upComingTripDetails?.vehicleType?.replace(/_/g, ' ') || '-';
  const vehicleColor = trip?.vehicleColor || upComingTripDetails?.vehicleColor || '';
  const tripId = trip?.rideId || '-';
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

  // ─── Geofence: detect arrival at current itinerary stop ──────────────────
  React.useEffect(() => {
    if (!userLocation || !itinerary || arrivedStopInfo) return;
    const allLocs = itineraryDates.flatMap(dateStr => {
      const dl = Array.isArray(itinerary[dateStr]) ? itinerary[dateStr] : (itinerary[dateStr]?.locations || []);
      return dl.map(l => ({ ...l, dateStr }));
    });
    const globalIdx = allLocs.findIndex((l, gi) => !l.isReached && !localReachedStops.has(gi));
    if (globalIdx < 0) return;
    const loc = allLocs[globalIdx];
    const tLat = loc.lat ?? loc.location?.[1];
    const tLon = loc.lon ?? loc.lng ?? loc.location?.[0];
    if (!tLat || !tLon) return;
    const dLat = userLocation[0];
    const dLon = userLocation[1];
    const R = 6371;
    const toRad = v => (v * Math.PI) / 180;
    const sinA = Math.sin(toRad(tLat - dLat) / 2) ** 2;
    const sinB = Math.cos(toRad(dLat)) * Math.cos(toRad(tLat)) * Math.sin(toRad(tLon - dLon) / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(sinA + sinB), Math.sqrt(1 - sinA - sinB));
    if (dist < 0.15) {
      setArrivedStopInfo({ loc, globalIdx });
    }
  }, [userLocation]);

  const handleMarkStopDone = async () => {
    if (!arrivedStopInfo) return;
    setMarkingDone(true);
    try {
      const api = new APIRequest();
      await api.request('/publicrides/driver/v2/markStopReached', 'POST', {
        tripId: trip?._id,
        stopIndex: arrivedStopInfo.globalIdx,
        stopName: arrivedStopInfo.loc.name,
      }, token);
      setLocalReachedStops(prev => new Set([...prev, arrivedStopInfo.globalIdx]));
      setArrivedStopInfo(null);
    } catch {
      showNotification('Error', 'Could not mark stop as done', 'danger');
    } finally {
      setMarkingDone(false);
    }
  };

  // ─── Start Navigation ──────────────────────────────────────────────────────
  const onStartNavigationPress = () => setOpenNavChoiceModal(true);

  const openNavForItinLoc = (loc) => {
    setItinNavTarget(loc);
    setOpenNavChoiceModal(true);
  };

  const handleNavMode = async (mode) => {
    setOpenNavChoiceModal(false);
    const target = itinNavTarget || stops[0];
    setItinNavTarget(null);
    const targetLat = target?.lat ?? target?.location?.[1];
    const targetLon = target?.lng ?? target?.lon ?? target?.location?.[0];
    const targetAddr = target?.address || target?.name || '';
    if (mode === 'google') {
      const url = targetLat && targetLon
        ? `https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=${targetLat},${targetLon}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetAddr)}`;
      Linking.openURL(url).catch(() => {});
      return;
    }
    const hasFine = await checkFineLocationPermissions();
    const hasBg = Platform.OS === 'android' && Platform.Version <= 28
      ? true
      : await checkBackgroundLocationPermissions();
    if (!hasFine || !hasBg) return;
    if (!userLocation) { await locationTask.getCurrentLocation(); return; }
    if (targetLat && targetLon) {
      setDirectionPoints({
        locations: [
          { lat: userLocation[0], lon: userLocation[1] },
          { lat: targetLat, lon: targetLon },
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

    } else {
      // PICKEDUP or any other in-progress status (acting driver trip may stay ACCEPTED throughout)
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
            {!!(trip?.fuelType || trip?.passengerVehicleData?.fuelType || trip?.vehicleData?.fuelType || upComingTripDetails?.fuelType || upComingTripDetails?.passengerVehicleData?.fuelType) && (
              <View style={styles.specChip}>
                <MaterialCommunityIcons name="gas-station" size={11} color="#757575" />
                <Text style={styles.specChipTxt}>
                  {(trip?.fuelType || trip?.passengerVehicleData?.fuelType || trip?.vehicleData?.fuelType || upComingTripDetails?.fuelType || upComingTripDetails?.passengerVehicleData?.fuelType)?.replace(/_/g, ' ')}
                </Text>
              </View>
            )}
            {!!(trip?.vehicleType || trip?.passangerVehicleType || upComingTripDetails?.vehicleType || upComingTripDetails?.passangerVehicleType) && (
              <View style={styles.specChip}>
                <MaterialCommunityIcons name="car" size={11} color="#757575" />
                <Text style={styles.specChipTxt}>
                  {(trip?.vehicleType || trip?.passangerVehicleType || upComingTripDetails?.vehicleType || upComingTripDetails?.passangerVehicleType)?.replace(/_/g, ' ')}
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
            trip?.vehicleData?.type ||
            upComingTripDetails?.vehicleType ||
            upComingTripDetails?.passangerVehicleType ||
            upComingTripDetails?.passengerVehicleData?.type ||
            upComingTripDetails?.vehicleData?.type
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
      {(() => {
        const fmtDate = (dateStr) => {
          const parts = dateStr?.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (!parts) return dateStr || '-';
          const d = new Date(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]));
          return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        };
        const fmtDay = (dateStr) => {
          const parts = dateStr?.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (!parts) return '';
          const d = new Date(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]));
          return d.toLocaleDateString('en-IN', { weekday: 'long' });
        };
        const startDateStr = itineraryDates.length > 0
          ? itineraryDates[0]
          : trip?.scheduleDateTime
          ? new Date(trip.scheduleDateTime).toISOString().split('T')[0]
          : null;
        const endDateStr = itineraryDates.length > 1 ? itineraryDates[itineraryDates.length - 1] : null;
        const startTime = trip?.scheduleDateTime
          ? new Date(trip.scheduleDateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
          : trip?.bookingTime
          ? new Date(trip.bookingTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
          : null;
        const totalDays = itineraryDates.length;

        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color="#0F223C" />
              <Text style={styles.cardTitle}>Trip Duration</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginLeft: 'auto' }}>
                {totalDays > 0 && (
                  <View style={styles.tripTypeBadge}>
                    <Text style={styles.tripTypeTxt}>{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</Text>
                  </View>
                )}
                {trip?.tripType && (
                  <View style={[styles.tripTypeBadge, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={[styles.tripTypeTxt, { color: '#2E7D32' }]}>
                      {trip.tripType === 'ROUND_TRIP' ? 'Round Trip' : 'One Way'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.durationRangeRow}>
              {/* Start */}
              <View style={styles.durationRangeBlock}>
                <Text style={styles.durationRangeLabel}>Start</Text>
                <Text style={styles.durationRangeDate}>{startDateStr ? fmtDate(startDateStr) : '-'}</Text>
                {!!startDateStr && <Text style={styles.durationRangeDay}>{fmtDay(startDateStr)}</Text>}
                {!!startTime && (
                  <View style={styles.durationTimeChip}>
                    <MaterialCommunityIcons name="clock-outline" size={11} color="#352166" />
                    <Text style={styles.durationTimeChipTxt}>{startTime}</Text>
                  </View>
                )}
              </View>

              {/* Arrow */}
              <View style={styles.durationArrowCol}>
                <View style={styles.durationArrowLine} />
                <MaterialCommunityIcons name="arrow-right" size={16} color="#352166" />
                <View style={styles.durationArrowLine} />
              </View>

              {/* End */}
              <View style={[styles.durationRangeBlock, { alignItems: 'flex-end' }]}>
                <Text style={styles.durationRangeLabel}>End</Text>
                <Text style={styles.durationRangeDate}>{endDateStr ? fmtDate(endDateStr) : (startDateStr ? fmtDate(startDateStr) : '-')}</Text>
                {!!(endDateStr || startDateStr) && <Text style={styles.durationRangeDay}>{fmtDay(endDateStr || startDateStr)}</Text>}
                <View style={styles.durationTimeChip}>
                  <MaterialCommunityIcons name="clock-outline" size={11} color="#352166" />
                  <Text style={styles.durationTimeChipTxt}>{durationLabel}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      })()}

      {/* Trip Itinerary */}
      {(() => {
        const allLocs = itineraryDates.flatMap(dateStr => {
          const dl = Array.isArray(itinerary[dateStr]) ? itinerary[dateStr] : (itinerary[dateStr]?.locations || []);
          return dl.map(l => ({ ...l, dateStr }));
        });
        const totalStops = allLocs.length;
        const currentIdx = allLocs.findIndex(l => !l.isReached);
        const currentLoc = currentIdx >= 0 ? allLocs[currentIdx] : null;


        if (totalStops === 0) {
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="format-list-bulleted" size={16} color="#0F223C" />
                <Text style={styles.cardTitle}>Trip Itinerary</Text>
              </View>
              <Text style={styles.emptyBillsTxt}>No itinerary added for this trip</Text>
            </View>
          );
        }

        return (
          <View style={styles.card}>
            {/* Header */}
            <TouchableOpacity style={styles.itinHeaderRow} onPress={() => setItinOpen(o => !o)} activeOpacity={0.8}>
              <View style={styles.itinHeaderLeft}>
                <View style={styles.itinHeaderIcon}>
                  <MaterialCommunityIcons name="map-marker-path" size={16} color="#352166" />
                </View>
                <Text style={[styles.cardTitle, { flexShrink: 1 }]} numberOfLines={1}>Trip Itinerary</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <View style={styles.itinStopsBadge}>
                  <Text style={styles.itinStopsBadgeTxt}>{totalStops} {totalStops === 1 ? 'Stop' : 'Stops'}</Text>
                </View>
                <MaterialCommunityIcons name={itinOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#0F223C" />
              </View>
            </TouchableOpacity>

            {itinOpen && (
              <>
                {/* Arrived confirmation banner */}
                {arrivedStopInfo && (
                  <View style={styles.arrivedBanner}>
                    <View style={styles.arrivedBannerIcon}>
                      <MaterialCommunityIcons name="map-marker-check" size={18} color="#43A047" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.arrivedBannerTitle}>You've arrived!</Text>
                      <Text style={styles.arrivedBannerSub} numberOfLines={1}>{arrivedStopInfo.loc.name}</Text>
                    </View>
                    <TouchableOpacity style={styles.arrivedBannerBtn} onPress={handleMarkStopDone} disabled={markingDone} activeOpacity={0.8}>
                      {markingDone
                        ? <ActivityIndicator size="small" color="#FFF" />
                        : <Text style={styles.arrivedBannerBtnTxt}>Mark Done</Text>
                      }
                    </TouchableOpacity>
                  </View>
                )}

                {/* Current navigation banner */}
                {currentLoc && !arrivedStopInfo && (
                  <View style={styles.itinNavBanner}>
                    <View style={styles.itinNavBannerIcon}>
                      <MaterialCommunityIcons name="navigation" size={16} color="#352166" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itinNavBannerTitle}>Driving to next stop</Text>
                      <Text style={styles.itinNavBannerSub} numberOfLines={1}>
                        {currentLoc.name}
                        {currentLoc.eta ? ` • ETA ${currentLoc.eta} min` : ''}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Stop list */}
                {allLocs.map((loc, idx) => {
                  const isDone = !!loc.isReached || localReachedStops.has(idx);
                  const isCurrent = idx === currentIdx;
                  const isLast = idx === allLocs.length - 1;

                  let circleStyle = styles.itinCircleUpcoming;
                  let circleIcon = null;
                  if (isDone) {
                    circleStyle = styles.itinCircleDone;
                    circleIcon = <MaterialCommunityIcons name="check" size={14} color="#FFF" />;
                  } else if (isCurrent) {
                    circleStyle = styles.itinCircleCurrent;
                    circleIcon = <MaterialCommunityIcons name="navigation" size={13} color="#FFF" />;
                  } else if (isLast) {
                    circleStyle = styles.itinCircleDrop;
                    circleIcon = <MaterialCommunityIcons name="flag" size={13} color="#FFF" />;
                  } else {
                    circleIcon = <View style={styles.itinCircleInnerDot} />;
                  }

                  return (
                    <View key={idx} style={styles.itinStopRow}>
                      {/* Left timeline */}
                      <View style={styles.itinTimelineCol}>
                        <View style={[styles.itinCircle, circleStyle]}>
                          {circleIcon}
                        </View>
                        {!isLast && <View style={[styles.itinConnectLine, isDone && styles.itinConnectLineDone]} />}
                      </View>

                      {/* Content */}
                      <View style={styles.itinStopContent}>
                        <Text style={[styles.itinStopName, isDone && styles.itinStopNameDone]} numberOfLines={1}>
                          {loc.name || `Stop ${idx + 1}`}
                        </Text>
                        {!!loc.address && (
                          <Text style={styles.itinStopAddr} numberOfLines={isLast ? 2 : 1}>{loc.address}</Text>
                        )}
                        {(loc.arrivalTime || loc.departureTime || loc.waitingTime || loc.time) && (
                          <View style={styles.itinTimeRow}>
                            {(loc.arrivalTime || loc.time) && (
                              <View style={styles.itinTimeChip}>
                                <MaterialCommunityIcons name="clock-in" size={10} color="#352166" />
                                <Text style={styles.itinTimeChipTxt}>{loc.arrivalTime || loc.time}</Text>
                              </View>
                            )}
                            {!!loc.departureTime && (
                              <View style={styles.itinTimeChip}>
                                <MaterialCommunityIcons name="clock-out" size={10} color="#352166" />
                                <Text style={styles.itinTimeChipTxt}>{loc.departureTime}</Text>
                              </View>
                            )}
                            {!!loc.waitingTime && (
                              <View style={[styles.itinTimeChip, styles.itinTimeChipWait]}>
                                <MaterialCommunityIcons name="timer-sand" size={10} color="#E65100" />
                                <Text style={[styles.itinTimeChipTxt, { color: '#E65100' }]}>{loc.waitingTime} min wait</Text>
                              </View>
                            )}
                          </View>
                        )}
                        <View style={styles.itinBadgeRow}>
                          {isDone && (
                            <View style={styles.itinBadgeDone}><Text style={styles.itinBadgeDoneTxt}>DONE</Text></View>
                          )}
                          {!isDone && !isLast && (
                            <View style={styles.itinBadgeVisit}><Text style={styles.itinBadgeVisitTxt}>VISIT</Text></View>
                          )}
                          {isCurrent && (
                            <View style={styles.itinBadgeNav}><Text style={styles.itinBadgeNavTxt}>NAVIGATING</Text></View>
                          )}
                          {isLast && !isDone && (
                            <View style={styles.itinBadgeDrop}><Text style={styles.itinBadgeDropTxt}>DROP</Text></View>
                          )}
                        </View>
                      </View>

                      {/* Nav button */}
                      <TouchableOpacity style={styles.itinNavBtn} onPress={() => openNavForItinLoc(loc)} activeOpacity={0.7}>
                        <MaterialCommunityIcons name="navigation-variant-outline" size={18} color="#352166" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        );
      })()}

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
      {/* <View style={styles.card}>
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
      </View> */}
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
            {tripsStatus === 'ACCEPTED' ? 'Cancel Trip' : 'End Trip'}
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
  stopRow: { flexDirection: 'row', marginBottom: 2, alignItems: 'flex-start' },
  stopLineCol: { width: 20, alignItems: 'center', paddingTop: 3 },

  // Redesigned itinerary styles
  itinHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  itinHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  itinHeaderIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EDE9F8', alignItems: 'center', justifyContent: 'center' },
  itinStopsBadge: { backgroundColor: '#EDE9F8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  itinStopsBadgeTxt: { fontSize: 11, fontFamily: Fonts.semi_bold, color: '#352166' },
  itinNavBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDE9F8', borderRadius: 12, padding: 12, marginBottom: 14, gap: 10 },
  itinNavBannerIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D4CAEE', alignItems: 'center', justifyContent: 'center' },
  itinNavBannerTitle: { fontSize: 13, fontFamily: Fonts.bold, color: '#352166' },
  itinNavBannerSub: { fontSize: 11, fontFamily: Fonts.regular, color: '#666', marginTop: 1 },
  itinStopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  itinTimelineCol: { width: 36, alignItems: 'center' },
  itinCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  itinCircleDone: { backgroundColor: '#4CAF50' },
  itinCircleCurrent: { backgroundColor: '#352166' },
  itinCircleDrop: { backgroundColor: '#E53935' },
  itinCircleUpcoming: { backgroundColor: '#E8EDF2', borderWidth: 2, borderColor: '#C5D0DA' },
  itinCircleInnerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9BA8B4' },
  itinConnectLine: { width: 2, flex: 1, minHeight: 20, backgroundColor: '#E0E0E0', marginTop: 2, marginBottom: 2 },
  itinConnectLineDone: { backgroundColor: '#4CAF50' },
  itinStopContent: { flex: 1, paddingLeft: 10, paddingBottom: 18, paddingTop: 5 },
  itinStopName: { fontSize: 13, fontFamily: Fonts.semi_bold, color: '#0F223C' },
  itinStopNameDone: { color: '#9E9E9E', textDecorationLine: 'line-through' },
  itinStopAddr: { fontSize: 11, fontFamily: Fonts.regular, color: '#757575', marginTop: 2 },
  itinStopTime: { fontSize: 10, fontFamily: Fonts.medium, color: '#FFA000', marginTop: 2 },
  itinBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  itinTimeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  itinTimeChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#EDE9F8', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  itinTimeChipTxt: { fontSize: 9, fontFamily: Fonts.medium, color: '#352166' },
  itinTimeChipWait: { backgroundColor: '#FFF3E0' },
  arrivedBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#C8E6C9' },
  arrivedBannerIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#C8E6C9', alignItems: 'center', justifyContent: 'center' },
  arrivedBannerTitle: { fontSize: 13, fontFamily: Fonts.bold, color: '#2E7D32' },
  arrivedBannerSub: { fontSize: 11, fontFamily: Fonts.regular, color: '#388E3C', marginTop: 1 },
  arrivedBannerBtn: { backgroundColor: '#43A047', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, minWidth: 80, alignItems: 'center' },
  arrivedBannerBtnTxt: { fontSize: 12, fontFamily: Fonts.bold, color: '#FFF' },
  itinNavBtn: { padding: 4, paddingTop: 6 },
  itinBadgeDone: { backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, maxWidth: 74 },
  itinBadgeDoneTxt: { fontSize: 8, fontFamily: Fonts.bold, color: '#2E7D32', letterSpacing: 0.3 },
  itinBadgeVisit: { backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, maxWidth: 74 },
  itinBadgeVisitTxt: { fontSize: 8, fontFamily: Fonts.bold, color: '#2E7D32', letterSpacing: 0.3 },
  itinBadgeNav: { backgroundColor: '#FFF3E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, maxWidth: 74 },
  itinBadgeNavTxt: { fontSize: 8, fontFamily: Fonts.bold, color: '#E65100', letterSpacing: 0.3 },
  itinBadgeDrop: { backgroundColor: '#FFEBEE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, maxWidth: 74 },
  itinBadgeDropTxt: { fontSize: 8, fontFamily: Fonts.bold, color: '#C62828', letterSpacing: 0.3 },
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
  durationRangeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  durationRangeBlock: { flex: 1, gap: 4 },
  durationRangeLabel: { fontSize: 10, fontFamily: Fonts.medium, color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 0.5 },
  durationRangeDate: { fontSize: 15, fontFamily: Fonts.bold, color: '#0F223C' },
  durationRangeDay: { fontSize: 11, fontFamily: Fonts.regular, color: '#757575' },
  durationArrowCol: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  durationArrowLine: { width: 16, height: 1, backgroundColor: '#C5D0DA' },
  durationTimeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EDE9F8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start', marginTop: 2 },
  durationTimeChipTxt: { fontSize: 11, fontFamily: Fonts.medium, color: '#352166' },

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

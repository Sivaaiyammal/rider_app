import React, {useState, useEffect, useRef} from 'react';
import LottieView from 'lottie-react-native';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import {useStackScreenStore} from '../store/useStackScreenStore';
import {Fonts} from '../constants/constants';
import NavBar from '../components/NavBar';
import UseBackButton from '../../common/hooks/UseBackButton';
import useRideBookingInfo from '../features/booking/store/useRideBookingInfo';
import useRideBookingLocationStore from '../features/booking/store/useRideBookingLocationStore';
import {getCustomerTrips, cancelRide} from '../API/EndPoints/EndPoints';
import CancelRideModal from '../components/Trips/CancelTripModel';

// ── Status helpers ────────────────────────────────────────────────────────────
const getTripDisplayStatus = status => {
  switch (status) {
    case 'SCHEDULED': return 'Upcoming';
    case 'PENDING':   return 'Upcoming';
    case 'ACCEPTED':  return 'In Progress';
    case 'PICKEDUP':  return 'In Progress';
    case 'DROPPED':   return 'Completed';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    default:          return status || 'Unknown';
  }
};

const STATUS_STYLES = {
  Upcoming:      { primary: '#5E35B1', light: '#EDE7F6', border: '#D1C4E9', icon: 'clock-outline',          gradient: ['#5E35B1', '#7B52CC'] },
  'In Progress': { primary: '#2E7D32', light: '#E8F5E9', border: '#C8E6C9', icon: 'car-connected',          gradient: ['#2E7D32', '#43A047'] },
  Completed:     { primary: '#546E7A', light: '#ECEFF1', border: '#CFD8DC', icon: 'check-circle-outline',   gradient: ['#546E7A', '#78909C'] },
  Cancelled:     { primary: '#C62828', light: '#FFEBEE', border: '#FFCDD2', icon: 'close-circle-outline',   gradient: ['#C62828', '#E53935'] },
};

const getStatusStyle = status => STATUS_STYLES[getTripDisplayStatus(status)] || STATUS_STYLES.Completed;

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDateTime = dt => {
  if (!dt) return {dateLabel: '—', timeLabel: '', fullDate: ''};
  let ms = dt;
  if (typeof ms === 'number' && ms < 1e12) ms = ms * 1000;
  const m = moment(ms);
  const today    = moment().startOf('day');
  const tomorrow = moment().add(1, 'day').startOf('day');
  let dateLabel;
  if (m.isSame(today, 'day'))    dateLabel = 'Today';
  else if (m.isSame(tomorrow, 'day')) dateLabel = 'Tomorrow';
  else dateLabel = m.format('DD MMM YYYY');
  return {dateLabel, timeLabel: m.format('hh:mm A'), fullDate: m.format('DD MMM YYYY')};
};

const getTripTypeInfo = trip => {
  const hours = Number(trip.actingDriverHours || 0);
  if (hours >= 24) {
    const days = Math.round(hours / 24);
    return {label: `${days}-Day Trip`, sub: `${hours} hrs total`, icon: 'calendar-range'};
  }
  if (hours > 0) return {label: 'Hourly Booking', sub: `${hours} ${hours > 1 ? 'hrs' : 'hr'}`, icon: 'timer-outline'};
  return {label: 'Full Day Booking', sub: '~8 hrs / 80 km', icon: 'weather-sunny'};
};

const stopToLocation = stop => ({
  name: stop.name || '',
  address: stop.address || '',
  longitude: Array.isArray(stop.location) ? stop.location[0] : 0,
  latitude:  Array.isArray(stop.location) ? stop.location[1] : 0,
});

// ─────────────────────────────────────────────────────────────────────────────
const ActingDriverTripDetailScreen = ({trip: initialTrip}) => {
  const {goBack, setStackScreen} = useStackScreenStore();
  const [trip, setTrip] = useState(initialTrip);
  const [earningsExpanded, setEarningsExpanded] = useState(false);
  const [itinExpanded, setItinExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancel = () => setShowCancelModal(true);

  const confirmCancel = async reason => {
    const tripId = trip?._id?.toString() || trip?.id?.toString();
    if (!tripId) return;
    try {
      setCancelling(true);
      setShowCancelModal(false);
      const isBeforePickup = ['SCHEDULED', 'PENDING', 'ACCEPTED'].includes(trip.status);
      const res = await cancelRide({tripId, reason, isNotyetPickedUp: isBeforePickup});
      if (res?.success) {
        goBack();
      } else {
        Alert.alert('Failed', res?.message || 'Could not cancel the trip. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const currentScreenName = useStackScreenStore(
    state => state.stackScreen[state.stackScreen.length - 1]?.name,
  );
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (currentScreenName === 'ActingDriverTripDetail') {
      const tripId = trip?._id?.toString() || trip?.id?.toString();
      if (!tripId) return;
      getCustomerTrips({rideCategory: 'acting_driver'})
        .then(res => {
          const updated = (res?.trips || []).find(
            t => t._id?.toString() === tripId || t.id?.toString() === tripId,
          );
          if (updated) setTrip(updated);
        })
        .catch(() => {});
    }
  }, [currentScreenName]);

  const {updateBookingInfo} = useRideBookingInfo();
  const {setRideStartLocation, setRideEndLocation, setRideWayPoints} = useRideBookingLocationStore();

  const handleEdit = () => {
    const stops   = trip.stops || [];
    const isRound = trip.tripType === 'ROUND_TRIP';
    if (stops[0]) setRideStartLocation(stopToLocation(stops[0]));
    const usableStops = isRound ? stops.slice(0, -1) : stops;
    if (usableStops.length > 1) {
      setRideEndLocation(stopToLocation(usableStops[usableStops.length - 1]));
      setRideWayPoints(usableStops.slice(1, -1).map(stopToLocation));
    } else {
      setRideEndLocation(null);
      setRideWayPoints([]);
    }
    const rangeStart = trip.durationRangeStart ? new Date(trip.durationRangeStart) : null;
    const rangeEnd   = trip.durationRangeEnd   ? new Date(trip.durationRangeEnd)   : null;
    const startTime  = trip.scheduleDateTime
      ? new Date(typeof trip.scheduleDateTime === 'number' && trip.scheduleDateTime < 1e12
          ? trip.scheduleDateTime * 1000 : trip.scheduleDateTime)
      : new Date();
    updateBookingInfo({
      bookingTab: 'TODAY', customStartTime: startTime,
      tripType: trip.tripType || 'ONE_WAY',
      actingDriverHours: trip.actingDriverHours || null,
      durationRangeStart: rangeStart, durationRangeEnd: rangeEnd,
      actingDriverVehicle: trip.vehicleData ? {_id: trip.passangerVehicleId, ...trip.vehicleData} : null,
      actingDriverItinerary:      trip.actingDriverItinerary || null,
      actingDriverAccommodation:  !!trip.actingDriverAccommodation,
      actingDriverFood:           !!trip.actingDriverFood,
      actingDriverMaxSpeed:       trip.actingDriverMaxSpeed ? String(trip.actingDriverMaxSpeed) : '',
      actingDriverKidsOnBoard:    !!trip.kidsOnBoard,
      actingDriverElderlyOnBoard: !!trip.elderlyOnBoard,
      actingDriverOtherRequests:  trip.actingDriverOtherRequests || '',
      paymentType: trip.paymentMethod || 'CASH',
    });
    setStackScreen('BookActingDriverScreen', {editTripId: trip._id?.toString() || trip.id?.toString()});
  };

  if (!trip) {
    return (
      <View style={styles.container}>
        <NavBar title="Trip Details" onBackPress={goBack} withBg withShadow />
        <View style={styles.emptyWrap}>
          <Icon name="clipboard-off-outline" size={48} color="#E0E0E0" />
          <Text style={styles.emptyText}>Trip details not available.</Text>
        </View>
      </View>
    );
  }

  const displayStatus = getTripDisplayStatus(trip.status);
  const sStyle = getStatusStyle(trip.status);
  const isUpcoming = displayStatus === 'Upcoming';

  // Driver
  const driverInfo     = trip.driverInfo || null;
  const driverName     = driverInfo?.driverName || '';
  const driverPhone    = driverInfo?.driverPhone || '';
  const driverRating   = driverInfo?.driverRating || null;
  const driverPhoto    = driverInfo?.driverPhoto || null;
  const driverInitials = driverName
    ? driverName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'DR';

  // Trip info
  const {label: tripTypeLabel, sub: tripTypeSub, icon: tripTypeIcon} = getTripTypeInfo(trip);
  const {dateLabel, timeLabel} = formatDateTime(trip.scheduleDateTime);

  // Route
  const stops    = trip.stops || [];
  const pickup   = stops[0]?.address || stops[0]?.name || '—';
  const drop     = stops.length > 1
    ? stops[stops.length - 1]?.address || stops[stops.length - 1]?.name || '—'
    : '—';
  const waypoints = stops.slice(1, -1).filter(s => s?.address || s?.name);

  // Vehicle
  const v = trip.vehicleData || {};
  const vehicleTitle   = [v.make, v.model].filter(Boolean).join(' ') || '—';
  const vehicleReg     = v.regNo || '';
  const vehicleDetails = [v.color, v.fuelType,
    Array.isArray(v.transmission) ? v.transmission[0] : v.transmission]
    .filter(Boolean)
    .map(s => String(s).charAt(0).toUpperCase() + String(s).slice(1))
    .join('  •  ');

  // Itinerary
  const itinerary      = trip.actingDriverItinerary || null;
  const itineraryDates = itinerary ? Object.keys(itinerary).sort() : [];

  // Requirements
  const hasAccommodation = !!trip.actingDriverAccommodation;
  const hasFood          = !!trip.actingDriverFood;
  const maxSpeed         = trip.actingDriverMaxSpeed || null;
  const kidsOnBoard      = !!trip.kidsOnBoard;
  const elderlyOnBoard   = !!trip.elderlyOnBoard;
  const otherRequests    = trip.actingDriverOtherRequests || '';

  // Earnings
  const fare       = trip.estimatedFare || trip.minFare || trip.maxFare || null;
  const fareDetails = trip.fareDetails || null;

  return (
    <View style={styles.container}>
      <UseBackButton onBackPress={goBack} />
      <NavBar
        title="Trip Details"
        onBackPress={goBack}
        withBg
        withShadow
        rightElement={
          isUpcoming ? (
            <TouchableOpacity
              onPress={handleEdit}
              style={[styles.editNavBtn, {backgroundColor: sStyle.light}]}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Icon name="pencil-outline" size={17} color={sStyle.primary} />
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* ── Driver / Assigned Card ────────────────────────── */}
        <View style={[styles.heroCard, {borderTopColor: sStyle.primary}]}>
          {driverInfo ? (
            <View style={styles.heroInner}>
              <View style={styles.heroLeft}>
                {driverPhoto ? (
                  <Image
                    source={{uri: typeof driverPhoto === 'string' ? driverPhoto : undefined}}
                    style={[styles.driverPhoto, {borderColor: sStyle.primary}]}
                  />
                ) : (
                  <View style={[styles.avatarWrap, {backgroundColor: sStyle.primary}]}>
                    <Text style={styles.avatarText}>{driverInitials}</Text>
                  </View>
                )}
                <View style={[styles.assignedBadge, {backgroundColor: sStyle.light}]}>
                  <Text style={[styles.assignedBadgeText, {color: sStyle.primary}]}>Assigned</Text>
                </View>
              </View>
              <View style={styles.heroInfo}>
                <Text style={styles.driverName}>{driverName}</Text>
                {driverRating ? (
                  <View style={styles.ratingRow}>
                    <Icon name="star" size={14} color="#FFB300" />
                    <Text style={styles.ratingText}>{Number(driverRating).toFixed(1)}</Text>
                    <Text style={styles.ratingLabel}>Rating</Text>
                  </View>
                ) : null}
                {driverPhone ? (
                  <Text style={styles.driverPhone}>{driverPhone}</Text>
                ) : null}
              </View>
              {driverPhone ? (
                <TouchableOpacity
                  style={[styles.callBtn, {backgroundColor: sStyle.primary}]}
                  onPress={() => Linking.openURL(`tel:${driverPhone}`)}
                  activeOpacity={0.8}>
                  <Icon name="phone" size={20} color="#fff" />
                  <Text style={styles.callText}>Call</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.searchingInner}>
              <LottieView
                source={require('../assets/lottie/search_2.json')}
                autoPlay
                loop
                renderMode="HARDWARE"
                style={styles.searchingLottie}
              />
              <View style={styles.searchingTextWrap}>
                <Text style={styles.searchingTitle}>Searching for Driver</Text>
                <Text style={styles.searchingSub}>We'll notify you once a driver is assigned</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Status Chip ────────────────────────────────────── */}
        <View style={styles.statusRow}>
          <View style={[styles.statusChip, {backgroundColor: sStyle.light, borderColor: sStyle.border}]}>
            <Icon name={sStyle.icon} size={15} color={sStyle.primary} />
            <Text style={[styles.statusChipText, {color: sStyle.primary}]}>{displayStatus}</Text>
          </View>
          <Text style={styles.tripId} numberOfLines={1}>
            {trip.rideId ? `#${trip.rideId}` : ''}
          </Text>
        </View>

        {/* ── Trip Info Card ──────────────────────────────────── */}
        <InfoCard>
          <CardHeader icon="information-outline" title="Trip Info" color={sStyle.primary} />
          <View style={styles.infoGrid}>
            <InfoTile
              icon={tripTypeIcon}
              label="Type"
              value={tripTypeLabel}
              sub={tripTypeSub}
              accent={sStyle.primary}
              lightBg={sStyle.light}
            />
            <View style={styles.infoGridDivider} />
            <InfoTile
              icon="calendar-clock"
              label="Date & Time"
              value={dateLabel}
              sub={timeLabel}
              accent={sStyle.primary}
              lightBg={sStyle.light}
            />
          </View>
          {trip.tripType ? (
            <View style={[styles.tripTypePill, {backgroundColor: sStyle.light}]}>
              <Icon
                name={trip.tripType === 'ROUND_TRIP' ? 'sync' : 'arrow-right'}
                size={13}
                color={sStyle.primary}
              />
              <Text style={[styles.tripTypePillText, {color: sStyle.primary}]}>
                {trip.tripType === 'ROUND_TRIP' ? 'Round Trip' : 'One Way'}
              </Text>
            </View>
          ) : null}
        </InfoCard>

        {/* ── Route Card ─────────────────────────────────────── */}
        <InfoCard>
          <CardHeader icon="map-marker-path" title="Route" color={sStyle.primary} />
          <View style={styles.routeContainer}>
            {/* Pickup */}
            <RouteStop
              color="#4CAF50"
              icon="map-marker"
              label="Pickup"
              text={pickup}
              isFirst
            />
            {/* Via stops */}
            {waypoints.map((s, i) => (
              <RouteStop
                key={i}
                color="#FF9800"
                icon="map-marker-outline"
                label={`Stop ${i + 1}`}
                text={s.address || s.name}
                note={s.waitingTime ? `${s.waitingTime} min wait` : null}
              />
            ))}
            {/* Drop */}
            <RouteStop
              color={sStyle.primary}
              icon="map-marker-check"
              label="Drop"
              text={drop}
              isLast
            />
          </View>
        </InfoCard>

        {/* ── Vehicle Card ────────────────────────────────────── */}
        <InfoCard>
          <CardHeader icon="car-side" title="Vehicle" color={sStyle.primary} />
          <View style={styles.vehicleRow}>
            <View style={[styles.vehicleIconWrap, {backgroundColor: sStyle.light}]}>
              <Icon name="car-estate" size={34} color={sStyle.primary} />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleTitle}>{vehicleTitle}</Text>
              {vehicleReg ? (
                <View style={styles.regPlate}>
                  <Text style={styles.regText}>{vehicleReg}</Text>
                </View>
              ) : null}
              {vehicleDetails ? (
                <Text style={styles.vehicleDetailText}>{vehicleDetails}</Text>
              ) : null}
            </View>
          </View>
        </InfoCard>

        {/* ── Itinerary Plan ──────────────────────────────────── */}
        <InfoCard>
          {/* Header row with collapse toggle */}
          <View style={styles.itinHeaderRow}>
            <CardHeader icon="map-outline" title="Trip Itinerary" color={sStyle.primary} />
            {itineraryDates.length > 2 ? (
              <TouchableOpacity
                style={[styles.itinCollapseBtn, {backgroundColor: sStyle.light}]}
                onPress={() => setItinExpanded(e => !e)}
                activeOpacity={0.7}>
                <Text style={[styles.itinCollapseBtnText, {color: sStyle.primary}]}>
                  {itinExpanded ? 'Show Less' : `+${itineraryDates.length - 2} More`}
                </Text>
                <Icon
                  name={itinExpanded ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={sStyle.primary}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {itineraryDates.length === 0 ? (
            <EmptyNote text="No itinerary added for this trip" />
          ) : (
            (itinExpanded ? itineraryDates : itineraryDates.slice(0, 2)).map((dateStr, di) => (
              <View key={dateStr} style={[styles.itinDayBlock, di > 0 && styles.itinDayBlockBorder]}>
                <View style={[styles.itinDayHeader, {backgroundColor: sStyle.light}]}>
                  <Icon name="calendar-today" size={13} color={sStyle.primary} />
                  <Text style={[styles.itinDayLabel, {color: sStyle.primary}]}>
                    {moment(dateStr).isValid() ? moment(dateStr).format('ddd, DD MMM YYYY') : dateStr}
                  </Text>
                </View>
                {(itinerary[dateStr]?.locations || itinerary[dateStr] || []).map((loc, i) => {
                  const locList = itinerary[dateStr]?.locations || itinerary[dateStr] || [];
                  return (
                    <View key={i} style={styles.itinLocRow}>
                      <View style={styles.itinLineWrap}>
                        <View style={[styles.itinDot, {backgroundColor: sStyle.primary}]} />
                        {i < locList.length - 1
                          ? <View style={[styles.itinLine, {backgroundColor: sStyle.border}]} />
                          : null}
                      </View>
                      <View style={styles.itinLocInfo}>
                        <Text style={styles.itinLocName}>{loc.name || loc.address}</Text>
                        {loc.address && loc.address !== loc.name
                          ? <Text style={styles.itinLocAddr} numberOfLines={1}>{loc.address}</Text>
                          : null}
                        {loc.time ? <Text style={[styles.itinLocTime, {color: sStyle.primary}]}>{loc.time}</Text> : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </InfoCard>

        {/* ── Notes Card ─────────────────────────────────────── */}
        <InfoCard>
          <CardHeader icon="note-text-outline" title="Customer Notes" color={sStyle.primary} />
          <Text style={[styles.notesText, !trip.additionalInfo && styles.notesEmpty]}>
            {trip.additionalInfo || 'No notes added'}
          </Text>
        </InfoCard>

        {/* ── Driver Arrangements ─────────────────────────────── */}
        <InfoCard>
          <CardHeader icon="shield-account-outline" title="Driver Arrangements" color={sStyle.primary} />
          {hasAccommodation || hasFood ? (
            <View style={styles.tagsWrap}>
              {hasAccommodation ? (
                <ArrangementTag icon="bed-outline" label="Accommodation" color={sStyle.primary} bg={sStyle.light} />
              ) : null}
              {hasFood ? (
                <ArrangementTag icon="food-fork-drink" label="Food Allowance" color={sStyle.primary} bg={sStyle.light} />
              ) : null}
            </View>
          ) : (
            <EmptyNote text="No driver arrangements added" />
          )}
        </InfoCard>

        {/* ── Special Requirements ────────────────────────────── */}
        <InfoCard>
          <CardHeader icon="clipboard-list-outline" title="Special Requirements" color={sStyle.primary} />
          {maxSpeed || kidsOnBoard || elderlyOnBoard || otherRequests ? (
            <>
              <View style={styles.tagsWrap}>
                {maxSpeed ? (
                  <ArrangementTag icon="speedometer" label={`Max ${maxSpeed} km/h`} color={sStyle.primary} bg={sStyle.light} />
                ) : null}
                {kidsOnBoard ? (
                  <ArrangementTag icon="baby-carriage" label="Kids on Board" color={sStyle.primary} bg={sStyle.light} />
                ) : null}
                {elderlyOnBoard ? (
                  <ArrangementTag icon="human-cane" label="Elderly on Board" color={sStyle.primary} bg={sStyle.light} />
                ) : null}
              </View>
              {otherRequests ? (
                <View style={[styles.otherReqBox, {borderLeftColor: sStyle.primary}]}>
                  <Text style={styles.otherReqLabel}>Other Requests</Text>
                  <Text style={styles.otherReqText}>{otherRequests}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <EmptyNote text="No special requirements" />
          )}
        </InfoCard>

        {/* ── Estimated Earnings ──────────────────────────────── */}
        {fare ? (
          <View style={[styles.earningsCard, {borderColor: sStyle.border}]}>
            <View style={[styles.earningsHeader, {backgroundColor: sStyle.light}]}>
              <View style={styles.earningsHeaderLeft}>
                <Icon name="currency-inr" size={18} color={sStyle.primary} />
                <Text style={[styles.earningsTitle, {color: sStyle.primary}]}>Estimated Earnings</Text>
              </View>
              <TouchableOpacity
                style={styles.breakupBtn}
                onPress={() => setEarningsExpanded(e => !e)}
                activeOpacity={0.7}>
                <Text style={[styles.breakupBtnText, {color: sStyle.primary}]}>
                  {earningsExpanded ? 'Hide' : 'Breakup'}
                </Text>
                <Icon name={earningsExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={sStyle.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.earningsBody}>
              <Text style={[styles.fareBig, {color: sStyle.primary}]}>₹{fare}</Text>
              <Text style={styles.fareEst}>estimated</Text>
            </View>
            {earningsExpanded ? (
              <View style={styles.breakupContainer}>
                {fareDetails
                  ? Object.entries(fareDetails)
                      .filter(([k]) => !['invoiceId', 'invoicedAt'].includes(k))
                      .map(([key, val]) => (
                        <View key={key} style={styles.breakupRow}>
                          <Text style={styles.breakupKey}>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                          </Text>
                          <Text style={[styles.breakupVal, {color: sStyle.primary}]}>₹{val}</Text>
                        </View>
                      ))
                  : (
                    <>
                      <View style={styles.breakupRow}>
                        <Text style={styles.breakupKey}>Base Fare</Text>
                        <Text style={[styles.breakupVal, {color: sStyle.primary}]}>₹{fare}</Text>
                      </View>
                      {trip.tripType === 'ROUND_TRIP' ? (
                        <View style={styles.breakupRow}>
                          <Text style={styles.breakupKey}>Round Trip Extra</Text>
                          <Text style={[styles.breakupVal, {color: sStyle.primary}]}>₹200</Text>
                        </View>
                      ) : null}
                    </>
                  )}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* ── Cancel Trip ─────────────────────────────────────── */}
        {(displayStatus === 'Upcoming' || displayStatus === 'In Progress') ? (
          <TouchableOpacity
            style={[styles.cancelBtn, cancelling && styles.cancelBtnDisabled]}
            onPress={handleCancel}
            activeOpacity={0.8}
            disabled={cancelling}>
            <Icon name="close-circle-outline" size={18} color="#C62828" />
            <Text style={styles.cancelBtnText}>
              {cancelling ? 'Cancelling…' : 'Cancel Trip'}
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={{height: 40}} />
      </ScrollView>

      <CancelRideModal
        modalVisible={showCancelModal}
        setModalVisible={setShowCancelModal}
        callCancelRide={confirmCancel}
      />
    </View>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const InfoCard = ({children}) => (
  <View style={styles.card}>{children}</View>
);

const CardHeader = ({icon, title, color}) => (
  <View style={styles.cardHeader}>
    <View style={[styles.cardHeaderIcon, {backgroundColor: color + '18'}]}>
      <Icon name={icon} size={15} color={color} />
    </View>
    <Text style={styles.cardHeaderText}>{title}</Text>
  </View>
);

const InfoTile = ({icon, label, value, sub, accent, lightBg}) => (
  <View style={styles.infoTile}>
    <View style={[styles.infoTileIcon, {backgroundColor: lightBg}]}>
      <Icon name={icon} size={20} color={accent} />
    </View>
    <Text style={styles.infoTileLabel}>{label}</Text>
    <Text style={styles.infoTileValue}>{value}</Text>
    {sub ? <Text style={styles.infoTileSub}>{sub}</Text> : null}
  </View>
);

const RouteStop = ({color, icon, label, text, note, isFirst, isLast}) => (
  <View style={styles.routeStop}>
    <View style={styles.routeLineCol}>
      {!isFirst ? <View style={styles.routeLineTop} /> : <View style={styles.routeLineSpacer} />}
      <View style={[styles.routeDot, {backgroundColor: color}]}>
        <Icon name={icon} size={11} color="#fff" />
      </View>
      {!isLast ? <View style={styles.routeLineBottom} /> : <View style={styles.routeLineSpacer} />}
    </View>
    <View style={styles.routeStopContent}>
      <Text style={[styles.routeStopLabel, {color}]}>{label}</Text>
      <Text style={styles.routeStopText} numberOfLines={2}>{text}</Text>
      {note ? <Text style={styles.routeStopNote}>{note}</Text> : null}
    </View>
  </View>
);

const ArrangementTag = ({icon, label, color, bg}) => (
  <View style={[styles.tag, {backgroundColor: bg, borderColor: color + '40'}]}>
    <Icon name={icon} size={14} color={color} />
    <Text style={[styles.tagText, {color}]}>{label}</Text>
  </View>
);

const EmptyNote = ({text}) => (
  <View style={styles.emptyNote}>
    <Icon name="minus-circle-outline" size={14} color="#BDBDBD" />
    <Text style={styles.emptyNoteText}>{text}</Text>
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F5FA'},
  scroll:    {paddingHorizontal: 14, paddingTop: 14, paddingBottom: 20},
  emptyWrap: {flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12},
  emptyText: {fontFamily: Fonts.medium, color: '#9E9E9E', fontSize: 14},

  editNavBtn: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },

  // Hero card (driver)
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderTopWidth: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  heroInner: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 14,
  },
  heroLeft: {alignItems: 'center', gap: 6},
  heroInfo: {flex: 1},
  driverPhoto: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 2, backgroundColor: '#EEE',
  },
  avatarWrap: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: {fontFamily: Fonts.bold, fontSize: 18, color: '#fff'},
  assignedBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
  },
  assignedBadgeText: {fontFamily: Fonts.semi_bold, fontSize: 10},
  driverName:  {fontFamily: Fonts.bold, fontSize: 16, color: '#1A1A2E'},
  ratingRow:   {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4},
  ratingText:  {fontFamily: Fonts.bold, fontSize: 13, color: '#F57F17'},
  ratingLabel: {fontFamily: Fonts.regular, fontSize: 12, color: '#9E9E9E'},
  driverPhone: {fontFamily: Fonts.medium, fontSize: 13, color: '#616161', marginTop: 4},
  callBtn: {
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 4,
  },
  callText: {fontFamily: Fonts.semi_bold, fontSize: 10, color: '#fff'},

  // Searching
  searchingInner: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 14,
  },
  searchingLottie: {width: 72, height: 72},
  searchingTextWrap: {flex: 1},
  searchingTitle: {fontFamily: Fonts.semi_bold, fontSize: 14, color: '#424242'},
  searchingSub:   {fontFamily: Fonts.regular, fontSize: 12, color: '#9E9E9E', marginTop: 3},

  // Status row
  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  statusChipText: {fontFamily: Fonts.semi_bold, fontSize: 13},
  tripId: {fontFamily: Fonts.medium, fontSize: 12, color: '#9E9E9E'},

  // Info cards
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    marginBottom: 10, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10,
  },
  cardHeader: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14},
  cardHeaderIcon: {
    width: 28, height: 28, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  cardHeaderText: {fontFamily: Fonts.semi_bold, fontSize: 14, color: '#1A1A2E'},

  // Info grid (2 tiles side by side)
  infoGrid: {
    flexDirection: 'row', alignItems: 'stretch',
    marginBottom: 10,
  },
  infoGridDivider: {width: 1, backgroundColor: '#F0F0F0', marginVertical: 4},
  infoTile: {flex: 1, alignItems: 'center', paddingVertical: 8, gap: 4},
  infoTileIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  infoTileLabel: {fontFamily: Fonts.regular, fontSize: 11, color: '#9E9E9E'},
  infoTileValue: {fontFamily: Fonts.semi_bold, fontSize: 13, color: '#1A1A2E', textAlign: 'center'},
  infoTileSub:   {fontFamily: Fonts.regular, fontSize: 11, color: '#616161', textAlign: 'center'},
  tripTypePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    marginTop: 4,
  },
  tripTypePillText: {fontFamily: Fonts.medium, fontSize: 12},

  // Route timeline
  routeContainer: {paddingBottom: 4},
  routeStop: {flexDirection: 'row', alignItems: 'stretch', minHeight: 52},
  routeLineCol: {width: 28, alignItems: 'center'},
  routeLineTop:    {flex: 1, width: 2, backgroundColor: '#E0E0E0', marginBottom: 2},
  routeLineBottom: {flex: 1, width: 2, backgroundColor: '#E0E0E0', marginTop: 2},
  routeLineSpacer: {flex: 1},
  routeDot: {
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  routeStopContent: {flex: 1, paddingLeft: 10, paddingVertical: 6},
  routeStopLabel: {fontFamily: Fonts.semi_bold, fontSize: 11, marginBottom: 2},
  routeStopText: {fontFamily: Fonts.medium, fontSize: 13, color: '#1A1A2E', lineHeight: 18},
  routeStopNote: {fontFamily: Fonts.regular, fontSize: 11, color: '#FF9800', marginTop: 2},

  // Vehicle
  vehicleRow: {flexDirection: 'row', alignItems: 'center', gap: 14, paddingBottom: 4},
  vehicleIconWrap: {
    width: 70, height: 60, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  vehicleInfo: {flex: 1},
  vehicleTitle:      {fontFamily: Fonts.bold, fontSize: 15, color: '#1A1A2E'},
  vehicleDetailText: {fontFamily: Fonts.regular, fontSize: 11, color: '#9E9E9E', marginTop: 6},
  regPlate: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 4,
    borderWidth: 1, borderColor: '#E0E0E0',
  },
  regText: {fontFamily: Fonts.semi_bold, fontSize: 12, color: '#1A1A2E', letterSpacing: 1.5},

  // Notes
  notesText:  {fontFamily: Fonts.regular, fontSize: 13, color: '#424242', lineHeight: 20, paddingBottom: 4},
  notesEmpty: {color: '#BDBDBD', fontStyle: 'italic'},

  // Tags
  tagsWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4},
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  tagText: {fontFamily: Fonts.medium, fontSize: 12},

  // Other requests
  otherReqBox: {
    backgroundColor: '#FAFAFA', borderRadius: 10,
    padding: 12, marginTop: 8,
    borderLeftWidth: 3,
  },
  otherReqLabel: {fontFamily: Fonts.semi_bold, fontSize: 11, color: '#9E9E9E', marginBottom: 4},
  otherReqText:  {fontFamily: Fonts.regular, fontSize: 13, color: '#424242'},

  // Empty note
  emptyNote: {flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 4},
  emptyNoteText: {fontFamily: Fonts.regular, fontSize: 13, color: '#BDBDBD', fontStyle: 'italic'},

  // Itinerary
  itinHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 0,
  },
  itinCollapseBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    marginBottom: 14,
  },
  itinCollapseBtnText: {fontFamily: Fonts.medium, fontSize: 12},
  itinDayBlock: {paddingBottom: 10},
  itinDayBlockBorder: {borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 10},
  itinDayHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    marginBottom: 10, alignSelf: 'flex-start',
  },
  itinDayLabel: {fontFamily: Fonts.semi_bold, fontSize: 12},
  itinLocRow:   {flexDirection: 'row', alignItems: 'flex-start', gap: 0, paddingLeft: 6, marginBottom: 2},
  itinLineWrap: {width: 20, alignItems: 'center'},
  itinDot:      {width: 9, height: 9, borderRadius: 5, marginTop: 4},
  itinLine:     {width: 2, flex: 1, minHeight: 14, marginTop: 2},
  itinLocInfo:  {flex: 1, paddingLeft: 8, paddingBottom: 10},
  itinLocName:  {fontFamily: Fonts.semi_bold, fontSize: 13, color: '#1A1A2E'},
  itinLocAddr:  {fontFamily: Fonts.regular, fontSize: 12, color: '#757575', marginTop: 1},
  itinLocTime:  {fontFamily: Fonts.medium, fontSize: 11, marginTop: 2},

  // Earnings card
  earningsCard: {
    backgroundColor: '#fff', borderRadius: 16,
    marginBottom: 10, overflow: 'hidden',
    borderWidth: 1,
  },
  earningsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  earningsHeaderLeft: {flexDirection: 'row', alignItems: 'center', gap: 8},
  earningsTitle: {fontFamily: Fonts.semi_bold, fontSize: 14},
  breakupBtn:    {flexDirection: 'row', alignItems: 'center', gap: 4},
  breakupBtnText: {fontFamily: Fonts.medium, fontSize: 13},
  earningsBody: {
    alignItems: 'center', paddingVertical: 16,
  },
  fareBig: {fontFamily: Fonts.bold, fontSize: 36},
  fareEst: {fontFamily: Fonts.regular, fontSize: 12, color: '#9E9E9E', marginTop: 2},
  breakupContainer: {
    marginHorizontal: 14, marginBottom: 14,
    backgroundColor: '#FAFAFA', borderRadius: 10, padding: 12, gap: 8,
  },
  breakupRow: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2},
  breakupKey: {fontFamily: Fonts.regular, fontSize: 13, color: '#616161'},
  breakupVal: {fontFamily: Fonts.semi_bold, fontSize: 13},

  // Cancel button
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EF9A9A',
    backgroundColor: '#FFF5F5',
  },
  cancelBtnDisabled: {opacity: 0.5},
  cancelBtnText: {fontFamily: Fonts.semi_bold, fontSize: 15, color: '#C62828'},
});

export default ActingDriverTripDetailScreen;

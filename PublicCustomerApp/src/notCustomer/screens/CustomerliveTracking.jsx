import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  SafeAreaView, Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import { useStackScreenStore } from '../store/useStackScreenStore';
import locationTask from '../controllers/GetCurrentLocation';
import useMapStore from '../features/map/store/useMapStore';
import useLocationStore from '../store/useLocationStore';
import Marker from '../controllers/NEMap/Marker';
import useCurrentRideInfoStore from '../features/rideStatus/store/useCurrentRideInfoStore';
import useAssignedDriverInfoStore from '../features/rideStatus/store/useAssignedDriverInfoStore';
import useTrackHook from '../features/rideStatus/hooks/useTrackHook';

const SPEED_LIMIT = 60;
const STOPS_PREVIEW = 3;

const CustomerLiveTracking = () => {
  useTrackHook('on-ride');
  const { goBackToScreen } = useStackScreenStore();
  const goBack = () => goBackToScreen('Home');

  const [isItineraryExpanded, setIsItineraryExpanded] = useState(true);
  const [showAllStops, setShowAllStops] = useState(false);

  const {
    tripId, stops, estimatedFare, totalDistance, duration,
    finalDistance, otp, bills, finalFare,
  } = useCurrentRideInfoStore();

  const {
    driverName, driverPhoto, rating: driverRating, phone,
    vehicleNumber, model: vehicleModel, brand: vehicleBrand,
    color: vehicleColor, driverMaxSpeed,
  } = useAssignedDriverInfoStore();

  const getInitials = name => {
    if (!name) return 'D';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleCallDriver = () => {
    if (phone) Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const totalStops     = stops?.length || 0;
  const completedStops = stops?.filter(s => s.isReached || s.status === 'COMPLETED' || s.status === 'REACHED' || s.reachedTime) || [];
  const pendingStops   = stops?.filter(s => !s.isReached && s.status !== 'COMPLETED' && s.status !== 'REACHED' && !s.reachedTime) || [];
  const completedPct   = totalStops > 0 ? Math.round((completedStops.length / totalStops) * 100) : 0;
  const nextStop       = pendingStops[0];
  const stopsLeft      = pendingStops.length;

  const billsArray       = Array.isArray(bills) ? bills : [];
  const totalBillsAmount = billsArray.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
  const currentFare      = finalFare || estimatedFare;
  const yourEarnings     = currentFare != null ? Math.max(0, Number(currentFare) - totalBillsAmount) : null;
  const isOverSpeed      = driverMaxSpeed != null && driverMaxSpeed > SPEED_LIMIT;

  const visiblePending  = showAllStops ? pendingStops : pendingStops.slice(0, STOPS_PREVIEW);
  const hiddenStopCount = Math.max(0, pendingStops.length - STOPS_PREVIEW);

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">

      {/* ── Header ───────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={goBack}>
          <Icon name="arrow-left" size={22} color="#1F1F1F" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.fullScreenBtn}>
          <Icon name="fullscreen" size={15} color="#555" />
          <Text style={styles.fullScreenText}>Full Screen</Text>
        </TouchableOpacity>
      </View>

      {/* ── Speed overlay (left) ─────────────────────── */}
      <View style={styles.speedOverlay} pointerEvents="none">
        <View style={[styles.speedCircle, isOverSpeed && styles.speedCircleAlert]}>
          <Text style={[styles.speedNum, isOverSpeed && styles.speedNumAlert]}>
            {driverMaxSpeed != null ? Math.round(driverMaxSpeed) : '—'}
          </Text>
          <Text style={styles.speedCircleUnit}>km/h</Text>
        </View>
        <Text style={styles.speedLimitCaption}>Speed Limit</Text>
        {isOverSpeed ? (
          <View style={styles.violationBadge}>
            <Icon name="alert" size={10} color="#D32F2F" />
            <Text style={styles.violationText}>Speeding</Text>
          </View>
        ) : null}
      </View>

      {/* ── Map right controls ───────────────────────── */}
      <View style={styles.mapRightControls} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.mapCtrlBtn}
          onPress={() => {
            locationTask.getCurrentLocation();
            const location = useLocationStore.getState().location;
            if (location) {
              const lng = Array.isArray(location) ? location[0] : location.longitude;
              const lat = Array.isArray(location) ? location[1] : location.latitude;
              useMapStore.getState().setMapLocation({ lat, lng, zoom: 16 });
              const homeMarker = new Marker('home-marker', 'home-marker', lng, lat, 'pin_inactive', 36, true, 0);
              homeMarker.setAnimate(true); homeMarker.setFocus(false); homeMarker.setDoRotation(false);
              const cur = useMapStore.getState().mapMarkers || [];
              useMapStore.getState().setMapMarkers([...cur.filter(m => m.id !== 'home-marker'), homeMarker]);
            }
          }}>
          <Icon name="crosshairs-gps" size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.mapCtrlBtn, { marginTop: 8 }]}>
          <Icon name="layers-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* ── Bottom Sheet ─────────────────────────────── */}
      <BottomSheetWrapper
        snapPoints={['27%', '58%', '92%']}
        index={0}
        enablePanDownToClose={false}
        enableScroll={true}>

        <View style={styles.sheetContent}>

          {/* Next Stop peek */}
          <View style={styles.nextStopBlock}>
            <Text style={styles.nextStopHeader}>Next Stop</Text>
            <Text style={styles.nextStopName} numberOfLines={1}>
              {nextStop?.name || nextStop?.address || 'All stops completed'}
            </Text>
            {(duration || totalDistance) ? (
              <View style={styles.nextStopMetaRow}>
                {duration     ? <Text style={styles.nextStopMeta}>{duration} min</Text>        : null}
                {duration && totalDistance ? <Text style={styles.nextStopDot}> • </Text> : null}
                {totalDistance ? <Text style={styles.nextStopMeta}>{totalDistance} km away</Text> : null}
              </View>
            ) : null}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${completedPct}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{completedPct}%</Text>
          </View>

          {/* 4-stat tiles */}
          <View style={styles.statRow}>
            <StatTile icon="map-marker-distance"  label="Distance Left"  value={totalDistance ? `${totalDistance} km`  : '—'} color="#4b48ab" />
            <StatTile icon="clock-outline"         label="Time Left"      value={duration      ? `${duration} min`      : '—'} color="#4b48ab" />
            <StatTile icon="currency-inr"          label="Est. Earnings"  value={currentFare   ? `₹${currentFare}`      : '—'} color="#F57C00" />
            <StatTile icon="map-marker-multiple"   label="Stops Left"     value={String(stopsLeft)}                            color="#00C853" />
          </View>

          {/* Vehicle card */}
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleCardTop}>
              <View style={styles.vehicleCardLeft}>
                <Text style={styles.vehiclePlate}>{vehicleNumber || 'N/A'}</Text>
                <Text style={styles.vehicleBrand}>
                  {vehicleBrand || 'Vehicle'}
                </Text>
                <Text style={styles.vehicleModel}>{vehicleModel ? `${vehicleModel}` : 'Vehicle model not available'}</Text>  
                {vehicleColor ? <Text style={styles.vehicleColorText}>{vehicleColor}</Text> : null}
              </View>
              <View style={styles.vehicleIconBox}>
                <Icon name="car-side" size={38} color="#4b48ab" />
              </View>
            </View>
            <View style={styles.vehicleBadgeRow}>
              <View style={styles.liveTripBadge}>
                <View style={styles.liveDotGreen} />
                <Text style={styles.liveTripBadgeText}>LIVE TRIP</Text>
              </View>
              <Text style={styles.tripIdText}>Trip ID: {tripId || 'N/A'}</Text>
            </View>
          </View>

          {/* Driver card */}
          <View style={styles.driverCard}>
            {driverPhoto ? (
              <Image source={{ uri: driverPhoto }} style={styles.driverAvatar} />
            ) : (
              <View style={[styles.driverAvatar, styles.driverAvatarFallback]}>
                <Text style={styles.driverInitials}>{getInitials(driverName)}</Text>
              </View>
            )}
            <View style={styles.driverInfo}>
              <Text style={styles.driverName} numberOfLines={1}>{driverName || 'Your Driver'}</Text>
              <View style={styles.driverMetaRow}>
                <Icon name="star" size={13} color="#FFB300" />
                <Text style={styles.driverRatingText}>{driverRating || '—'}</Text>
                <Text style={styles.driverMetaSep}>  •  </Text>
                <Text style={styles.driverPickupText}>Pickup</Text>
                {otp ? <Text style={styles.driverOtp}>  OTP: {otp}</Text> : null}
              </View>
            </View>
            <TouchableOpacity style={styles.driverActionBtn} onPress={handleCallDriver}>
              <Icon name="phone" size={17} color="#4b48ab" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.driverActionBtn, { marginLeft: 8 }]}>
              <Icon name="message-text-outline" size={17} color="#4b48ab" />
            </TouchableOpacity>
          </View>

          {/* Trip Itinerary */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setIsItineraryExpanded(e => !e)}
              activeOpacity={0.7}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.cardIconWrap}>
                  <Icon name="format-list-bulleted" size={14} color="#4b48ab" />
                </View>
                <Text style={styles.cardTitle}>Trip Itinerary</Text>
              </View>
              <View style={styles.cardHeaderRight}>
                <View style={styles.stopsBadge}>
                  <Text style={styles.stopsBadgeText}>{totalStops} Stops</Text>
                </View>
                <Icon name={isItineraryExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
              </View>
            </TouchableOpacity>

            {isItineraryExpanded && (
              <>
                {/* Driving to box */}
                {nextStop ? (
                  <View style={styles.drivingBox}>
                    <Icon name="navigation" size={17} color="#4b48ab" />
                    <View style={styles.drivingBoxInfo}>
                      <Text style={styles.drivingBoxTitle}>Driving to next stop</Text>
                      <Text style={styles.drivingBoxSub} numberOfLines={1}>
                        {nextStop.name || nextStop.address}
                        {duration ? ` • ETA ${duration} min` : ''}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.drivingBox, { backgroundColor: '#E8F5E9' }]}>
                    <Icon name="check-circle" size={17} color="#00C853" />
                    <Text style={[styles.drivingBoxTitle, { color: '#00C853', marginLeft: 10 }]}>All stops reached</Text>
                  </View>
                )}

                {/* Completed stops */}
                {completedStops.map((stop, idx) => (
                  <View key={`cs-${idx}`} style={styles.stopRow}>
                    <View style={styles.stopLineCol}>
                      <View style={styles.stopDotCompleted}>
                        <Icon name="check" size={13} color="#fff" />
                      </View>
                      <View style={styles.stopConnectorFaded} />
                    </View>
                    <View style={[styles.stopBody, { opacity: 0.5 }]}>
                      <View style={styles.stopTopRow}>
                        <Text style={[styles.stopName, { textDecorationLine: 'line-through', color: '#888' }]} numberOfLines={1}>
                          {stop.name || stop.address || `Stop ${idx + 1}`}
                        </Text>
                        <View style={styles.completedStopBadge}>
                          <Text style={styles.completedStopBadgeText}>DONE</Text>
                        </View>
                      </View>
                      {stop.address ? (
                        <Text style={styles.stopAddress} numberOfLines={1}>{stop.address}</Text>
                      ) : null}
                    </View>
                  </View>
                ))}

                {/* Pending stops */}
                {visiblePending.map((stop, idx) => {
                  const num        = completedStops.length + idx + 1;
                  const isFirst    = idx === 0;
                  const isDropStop = completedStops.length + idx + 1 === totalStops;
                  const isLast     = idx === visiblePending.length - 1 && !(hiddenStopCount > 0 && !showAllStops);

                  const dotBg   = isDropStop ? '#D32F2F' : isFirst ? '#4b48ab' : '#7B52CC';
                  const dotIcon = isDropStop ? 'flag-checkered' : isFirst ? 'navigation' : 'map-marker-outline';

                  return (
                    <View key={`ps-${idx}`} style={styles.stopRow}>
                      <View style={styles.stopLineCol}>
                        <View style={[
                          styles.stopDot,
                          { backgroundColor: dotBg },
                          isFirst && styles.stopDotActive,
                        ]}>
                          <Icon name={dotIcon} size={13} color="#fff" />
                        </View>
                        {!isLast && <View style={styles.stopConnector} />}
                      </View>
                      <View style={styles.stopBody}>
                        <View style={styles.stopTopRow}>
                          <Text style={styles.stopName} numberOfLines={1}>{stop.name || `Stop ${num}`}</Text>
                          <View style={[styles.typeBadge, isDropStop && styles.dropBadge]}>
                            <Text style={[styles.typeText, isDropStop && styles.dropText]}>
                              {isDropStop ? 'DROP' : 'VISIT'}
                            </Text>
                          </View>
                          {isFirst && (
                            <View style={styles.navBadge}>
                              <Text style={styles.navBadgeText}>NAVIGATING</Text>
                            </View>
                          )}
                        </View>
                        {stop.waitingTime ? (
                          <Text style={styles.stopTime}>{stop.waitingTime} min wait</Text>
                        ) : null}
                        {stop.address ? (
                          <Text style={styles.stopAddress} numberOfLines={2}>{stop.address}</Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}

                {hiddenStopCount > 0 && !showAllStops && (
                  <TouchableOpacity style={styles.showMoreRow} onPress={() => setShowAllStops(true)}>
                    <Text style={styles.showMoreText}>Show {hiddenStopCount} more stop{hiddenStopCount > 1 ? 's' : ''}</Text>
                    <Icon name="chevron-down" size={15} color="#4b48ab" />
                  </TouchableOpacity>
                )}
                {showAllStops && pendingStops.length > STOPS_PREVIEW && (
                  <TouchableOpacity style={styles.showMoreRow} onPress={() => setShowAllStops(false)}>
                    <Text style={styles.showMoreText}>Show less</Text>
                    <Icon name="chevron-up" size={15} color="#4b48ab" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Trip Summary */}
          <View style={styles.card}>
            <View style={[styles.cardHeader, { marginBottom: 12 }]}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardIconWrap, { backgroundColor: '#E3F2FD' }]}>
                  <Icon name="shield-check-outline" size={14} color="#1565C0" />
                </View>
                <Text style={styles.cardTitle}>Trip Summary</Text>
              </View>
            </View>
            <View style={styles.summaryStatRow}>
              <SummaryStat label="Distance Covered" value={finalDistance ? `${finalDistance} km` : '—'} color="#1565C0" />
              <View style={styles.summaryDivider} />
              <SummaryStat label="Remaining"         value={totalDistance ? `${totalDistance} km` : '—'} color="#1F1F1F" />
              <View style={styles.summaryDivider} />
              <SummaryStat label="Total Duration"    value={duration      ? `${duration} min`      : '—'} color="#1F1F1F" />
            </View>
            <View style={styles.summaryFooter}>
              <View style={styles.summaryFooterLeft}>
                <View style={styles.checkSmall}>
                  <Icon name="check" size={9} color="#fff" />
                </View>
                <Text style={styles.summaryFooterText}>Following planned route</Text>
              </View>
              <Text style={styles.summaryFooterTime}>• Updated just now</Text>
            </View>
          </View>

          {/* Trip Earnings */}
          <View style={styles.card}>
            <View style={[styles.cardHeader, { marginBottom: 12 }]}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardIconWrap, { backgroundColor: '#FFF3E0' }]}>
                  <Icon name="cash-multiple" size={14} color="#F57C00" />
                </View>
                <Text style={styles.cardTitle}>Trip Earnings</Text>
              </View>
              <TouchableOpacity style={styles.breakupBtn}>
                <Text style={styles.breakupBtnText}>Breakup</Text>
                <Icon name="arrow-right" size={13} color="#F57C00" />
              </TouchableOpacity>
            </View>
            <View style={styles.earningsStatRow}>
              <EarningsStat label="Your Earnings"  value={yourEarnings != null ? `₹${yourEarnings}` : '—'} color="#4b48ab" />
              <View style={styles.earningsDivider} />
              <EarningsStat label="Trip Fare"      value={currentFare ? `₹${currentFare}` : '—'}          color="#1F1F1F" />
              <View style={styles.earningsDivider} />
              <EarningsStat label="Total Expenses" value={`₹${totalBillsAmount}`}                          color="#D32F2F" />
            </View>
          </View>

          {/* Speed & Safety */}
          <View style={styles.card}>
            <View style={[styles.cardHeader, { marginBottom: 12 }]}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardIconWrap, { backgroundColor: '#E8F5E9' }]}>
                  <Icon name="speedometer" size={14} color="#2E7D32" />
                </View>
                <Text style={styles.cardTitle}>Speed & Safety</Text>
              </View>
              <View style={styles.monitoringBadge}>
                <View style={styles.liveDotGreen} />
                <Text style={styles.monitoringText}>Monitoring</Text>
              </View>
            </View>
            <View style={styles.speedSafetyRow}>
              <View style={[styles.speedGauge, isOverSpeed && styles.speedGaugeAlert]}>
                <Text style={[styles.speedGaugeValue, isOverSpeed && styles.speedGaugeAlert]}>
                  {driverMaxSpeed != null ? Math.round(driverMaxSpeed) : '0'}
                </Text>
                <Text style={styles.speedGaugeUnit}>km/h</Text>
              </View>
              <View style={styles.speedSafetyMeta}>
                <Text style={[styles.speedStatusText, { color: isOverSpeed ? '#D32F2F' : '#2E7D32' }]}>
                  {isOverSpeed ? 'Exceeding speed limit' : 'Driving within safe limits'}
                </Text>
                <Text style={styles.speedStatusDesc}>
                  Live speed monitored against road limits in real-time.
                </Text>
                <View style={styles.speedLimitPill}>
                  <Icon name="alert-octagon" size={13} color="#D32F2F" />
                  <View style={{ marginLeft: 6 }}>
                    <Text style={styles.speedLimitPillLabel}>Speed Limit</Text>
                    <Text style={styles.speedLimitPillValue}>{SPEED_LIMIT} km/h</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Trip Bills */}
          <View style={styles.card}>
            <View style={[styles.cardHeader, { marginBottom: 12 }]}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardIconWrap, { backgroundColor: '#E8F5E9' }]}>
                  <Icon name="receipt" size={14} color="#2E7D32" />
                </View>
                <Text style={styles.cardTitle}>Trip Bills</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.addBillLink}>+ Add Bill</Text>
              </TouchableOpacity>
            </View>

            {billsArray.length === 0 ? (
              <Text style={styles.noBillsText}>No bills added yet</Text>
            ) : (
              billsArray.map((bill, idx) => (
                <View key={`bill-${idx}`} style={[styles.billRow, idx > 0 && styles.billRowBorder]}>
                  <View style={styles.billIconBox}>
                    <Icon name="receipt" size={15} color="#666" />
                  </View>
                  <View style={styles.billInfo}>
                    <Text style={styles.billName}>{bill.name || 'Expense'}</Text>
                    {bill.remarks ? <Text style={styles.billRemark}>{bill.remarks}</Text> : null}
                  </View>
                  <Text style={styles.billAmt}>₹{bill.amount}</Text>
                </View>
              ))
            )}

            {billsArray.length > 0 && (
              <TouchableOpacity style={styles.addBillFooterBtn}>
                <Icon name="plus" size={13} color="#4b48ab" />
                <Text style={styles.addBillFooterText}>Add Bill / Receipt</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ height: 90 }} />
        </View>
      </BottomSheetWrapper>

      {/* ── Fixed Bottom Action Bar ───────────────────── */}
      <View style={styles.bottomBar}>
        <BottomBarBtn icon="phone"              label="Call"    color="#00C853" bg="#E8F5E9" onPress={handleCallDriver} />
        <BottomBarBtn icon="message-text-outline" label="Chat"  color="#00C853" bg="#E8F5E9" />
        <BottomBarBtn icon="headset"            label="Support" color="#4b48ab" bg="#EDE7F6" />
        <BottomBarBtn icon="alert-circle"       label="SOS"     color="#D32F2F" bg="#FFEBEE" />
      </View>

    </SafeAreaView>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const StatTile = ({ icon, label, value, color }) => (
  <View style={styles.statTile}>
    <Icon name={icon} size={18} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SummaryStat = ({ label, value, color }) => (
  <View style={styles.summaryStat}>
    <Text style={[styles.summaryStatValue, { color }]}>{value}</Text>
    <Text style={styles.summaryStatLabel}>{label}</Text>
  </View>
);

const EarningsStat = ({ label, value, color }) => (
  <View style={styles.earningsStat}>
    <Text style={styles.earningsStatLabel}>{label}</Text>
    <Text style={[styles.earningsStatValue, { color }]}>{value}</Text>
  </View>
);

const BottomBarBtn = ({ icon, label, color, bg, onPress }) => (
  <TouchableOpacity
    style={[styles.bottomBarBtn, { backgroundColor: bg }]}
    onPress={onPress}
    activeOpacity={0.75}>
    <Icon name={icon} size={22} color={color} />
    <Text style={[styles.bottomBarLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  headerBackBtn: { padding: 4 },
  headerCenter:  { flex: 1, alignItems: 'center' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5E9', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  liveDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00C853', marginRight: 6 },
  liveText: { fontSize: 13, fontWeight: '800', color: '#00C853' },
  fullScreenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
  },
  fullScreenText: { fontSize: 12, fontWeight: '600', color: '#555' },

  // Speed overlay
  speedOverlay: { position: 'absolute', left: 14, top: 90, alignItems: 'center' },
  speedCircle: {
    width: 58, height: 58, borderRadius: 29,
    borderWidth: 4, borderColor: '#D32F2F',
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  speedCircleAlert: { backgroundColor: '#FFEBEE' },
  speedNum:        { fontSize: 20, fontWeight: '900', color: '#1F1F1F', lineHeight: 22 },
  speedNumAlert:   { color: '#D32F2F' },
  speedCircleUnit: { fontSize: 8, color: '#888', fontWeight: '700' },
  speedLimitCaption: { fontSize: 9, fontWeight: '700', color: '#888', marginTop: 3 },
  violationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FFEBEE', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6, marginTop: 4,
  },
  violationText: { fontSize: 9, fontWeight: '700', color: '#D32F2F' },

  // Map controls
  mapRightControls: { position: 'absolute', right: 14, top: 110 },
  mapCtrlBtn: {
    backgroundColor: '#FFF', width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', elevation: 3,
  },

  // Sheet
  sheetContent: { paddingHorizontal: 16, paddingTop: 4, backgroundColor: '#ffffff' },

  // Next stop peek
  nextStopBlock:   { marginBottom: 10, backgroundColor: '#fff', borderRadius: 16, padding: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
  nextStopHeader:  { fontSize: 11, fontWeight: '700', color: '#9E9E9E', letterSpacing: 0.5, marginBottom: 3 },
  nextStopName:    { fontSize: 17, fontWeight: '800', color: '#1F1F1F' },
  nextStopMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 8 },
  nextStopMeta:    { fontSize: 13, fontWeight: '600', color: '#555' },
  nextStopDot:     { fontSize: 13, color: '#CCC' },
  progressTrack:   { height: 5, backgroundColor: '#E8E8F8', borderRadius: 4, overflow: 'hidden' },
  progressFill:    { height: '100%', backgroundColor: '#4b48ab', borderRadius: 4 },
  progressLabel:   { fontSize: 10, fontWeight: '700', color: '#4b48ab', textAlign: 'right', marginTop: 3 },

  // Stats
  statRow:   { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
  statTile:  { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 13, fontWeight: '800', color: '#1F1F1F' },
  statLabel: { fontSize: 9, fontWeight: '600', color: '#9E9E9E', textAlign: 'center' },

  // Vehicle card
  vehicleCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
  vehicleCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vehicleCardLeft: { flex: 1 },
  vehiclePlate:     { fontSize: 18, fontWeight: '800', color: '#1F1F1F', letterSpacing: 1 },
  vehicleBrand:     { fontSize: 13, fontWeight: '700', color: '#555', marginTop: 4 },
  vehicleModel:     { fontSize: 12, fontWeight: '600', color: '#555', marginTop: 3 },
  vehicleColorText: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  vehicleIconBox: {
    width: 68, height: 48, backgroundColor: '#F0F0FA', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  vehicleBadgeRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 },
  liveTripBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  liveDotGreen:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00C853' },
  liveTripBadgeText:  { fontSize: 10, fontWeight: '800', color: '#00C853' },
  tripIdText:         { fontSize: 12, color: '#9E9E9E', fontWeight: '500' },

  // Driver card
  driverCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
  },
  driverAvatar:        { width: 48, height: 48, borderRadius: 24 },
  driverAvatarFallback:{ backgroundColor: '#4b48ab', alignItems: 'center', justifyContent: 'center' },
  driverInitials:      { color: '#fff', fontSize: 16, fontWeight: '700' },
  driverInfo:          { flex: 1 },
  driverName:          { fontSize: 15, fontWeight: '700', color: '#1F1F1F' },
  driverMetaRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  driverRatingText:    { fontSize: 12, fontWeight: '700', color: '#F57F17', marginLeft: 3 },
  driverMetaSep:       { fontSize: 12, color: '#CCC' },
  driverPickupText:    { fontSize: 12, color: '#888' },
  driverOtp:           { fontSize: 12, fontWeight: '700', color: '#4b48ab' },
  driverActionBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EDE7F6', alignItems: 'center', justifyContent: 'center',
  },

  // Card shell
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardHeaderLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardIconWrap: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: '#E8E8F8',
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1F1F1F' },
  stopsBadge:     { backgroundColor: '#E8E8F8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  stopsBadgeText: { fontSize: 11, fontWeight: '700', color: '#4b48ab' },

  // Itinerary
  drivingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F0F0FA', padding: 12, borderRadius: 12, marginBottom: 12,
  },
  drivingBoxInfo:  { flex: 1 },
  drivingBoxTitle: { fontSize: 13, fontWeight: '700', color: '#4b48ab' },
  drivingBoxSub:   { fontSize: 12, color: '#777', marginTop: 2 },
  completedBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F9FFF9', paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 10, marginBottom: 10,
  },
  completedCheckIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center',
  },
  completedBarText: { fontSize: 12, fontWeight: '600', color: '#555' },

  stopRow:      { flexDirection: 'row', marginBottom: 4 },
  stopLineCol:  { width: 30, alignItems: 'center' },
  stopDot: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#4b48ab', alignItems: 'center', justifyContent: 'center',
  },
  stopDotActive:    { borderWidth: 3, borderColor: '#D1C4E9' },
  stopDotCompleted: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#00C853', alignItems: 'center', justifyContent: 'center',
  },
  stopConnector:      { width: 2, flex: 1, minHeight: 14, backgroundColor: '#E0E0E0', marginTop: 3 },
  stopConnectorFaded: { width: 2, flex: 1, minHeight: 14, backgroundColor: '#E8E8E8', marginTop: 3 },
  completedStopBadge: {
    backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  completedStopBadgeText: { fontSize: 9, fontWeight: '800', color: '#00C853' },
  stopBody:     { flex: 1, paddingLeft: 10, paddingBottom: 14 },
  stopTopRow:   { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
  stopName:     { fontSize: 14, fontWeight: '700', color: '#1F1F1F', flex: 1 },
  typeBadge:    { backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText:     { fontSize: 9, fontWeight: '800', color: '#00C853' },
  dropBadge:    { backgroundColor: '#FFEBEE' },
  dropText:     { color: '#D32F2F' },
  navBadge:     { backgroundColor: '#FFF3E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  navBadgeText: { fontSize: 9, fontWeight: '800', color: '#F57C00' },
  stopTime:     { fontSize: 12, fontWeight: '600', color: '#4b48ab', marginTop: 3 },
  stopAddress:  { fontSize: 12, color: '#888', marginTop: 2, lineHeight: 17 },
  showMoreRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 4,
  },
  showMoreText: { fontSize: 13, fontWeight: '700', color: '#4b48ab' },

  // Trip Summary
  summaryStatRow: { flexDirection: 'row', marginBottom: 12 },
  summaryStat:    { flex: 1, alignItems: 'center' },
  summaryStatValue:{ fontSize: 16, fontWeight: '800' },
  summaryStatLabel:{ fontSize: 10, color: '#9E9E9E', fontWeight: '600', marginTop: 3, textAlign: 'center' },
  summaryDivider:  { width: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },
  summaryFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F9F9F9', padding: 10, borderRadius: 10,
  },
  summaryFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkSmall: {
    width: 16, height: 16, borderRadius: 8, backgroundColor: '#00C853',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryFooterText: { fontSize: 12, fontWeight: '600', color: '#333' },
  summaryFooterTime: { fontSize: 12, color: '#9E9E9E' },

  // Earnings
  earningsStatRow: { flexDirection: 'row' },
  earningsStat:    { flex: 1, alignItems: 'center', paddingVertical: 4 },
  earningsStatLabel:{ fontSize: 10, color: '#9E9E9E', fontWeight: '600', marginBottom: 4 },
  earningsStatValue:{ fontSize: 16, fontWeight: '800' },
  earningsDivider: { width: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },
  breakupBtn:     { flexDirection: 'row', alignItems: 'center', gap: 3 },
  breakupBtnText: { fontSize: 12, fontWeight: '700', color: '#F57C00' },

  // Speed & Safety
  speedSafetyRow:  { flexDirection: 'row', alignItems: 'center', gap: 16 },
  speedGauge: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 5, borderColor: '#00C853',
    alignItems: 'center', justifyContent: 'center',
  },
  speedGaugeAlert: { borderColor: '#D32F2F', color: '#D32F2F' },
  speedGaugeValue: { fontSize: 22, fontWeight: '800', color: '#1F1F1F' },
  speedGaugeUnit:  { fontSize: 9, color: '#888', fontWeight: '700' },
  speedSafetyMeta: { flex: 1 },
  speedStatusText: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  speedStatusDesc: { fontSize: 11, color: '#888', marginBottom: 8, lineHeight: 16 },
  speedLimitPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8,
    alignSelf: 'flex-start',
  },
  speedLimitPillLabel: { fontSize: 9, color: '#D32F2F' },
  speedLimitPillValue: { fontSize: 12, fontWeight: '800', color: '#D32F2F' },
  monitoringBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  monitoringText: { fontSize: 10, fontWeight: '700', color: '#00C853' },

  // Bills
  noBillsText: { fontSize: 13, color: '#BDBDBD', fontStyle: 'italic', paddingBottom: 4 },
  billRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  billRowBorder: { borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  billIconBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center',
  },
  billInfo:   { flex: 1 },
  billName:   { fontSize: 14, fontWeight: '600', color: '#333' },
  billRemark: { fontSize: 11, color: '#999', marginTop: 2 },
  billAmt:    { fontSize: 14, fontWeight: '700', color: '#1F1F1F' },
  addBillLink: { fontSize: 13, fontWeight: '700', color: '#00C853' },
  addBillFooterBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 6, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  addBillFooterText: { fontSize: 13, fontWeight: '700', color: '#4b48ab' },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', flexDirection: 'row',
    paddingVertical: 10, paddingHorizontal: 10, paddingBottom: 20,
    borderTopWidth: 1, borderTopColor: '#EEEEEE',
  },
  bottomBarBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, marginHorizontal: 4, borderRadius: 14,
  },
  bottomBarLabel: { fontSize: 11, fontWeight: '700', marginTop: 4 },
});

export default CustomerLiveTracking;

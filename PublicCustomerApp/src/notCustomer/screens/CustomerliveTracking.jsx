import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  SafeAreaView, Linking, TextInput,
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
import { Fonts } from '../../common/constants/constants';

const P       = '#352166';
const P_LIGHT = '#EDE9F8';
const P_MED   = '#D4CAEE';
const NAVY    = '#0F223C';
const GREY    = '#757575';

const SPEED_LIMIT = 60;
const TABS = ['Trip', 'Fare & Bills', 'Safety'];

const CustomerLiveTracking = () => {
  useTrackHook('on-ride');
  const { goBackToScreen } = useStackScreenStore();
  const goBack = () => goBackToScreen('Home');

  const [activeTab, setActiveTab]               = useState(0);
  const [isItinOpen, setIsItinOpen]             = useState(true);
  const [showAllStops, setShowAllStops]         = useState(false);
  const [notes, setNotes]                       = useState('');
  const [editingNotes, setEditingNotes]         = useState(false);
  const [violationCount, setViolationCount]     = useState(0);
  const [violations, setViolations]             = useState([]);
  const prevSpeedRef                            = useRef(null);

  const {
    tripId, stops, estimatedFare, totalDistance, duration,
    finalDistance, otp, bills, finalFare,
    specialRequirements, driverArrangements, tripNotes,
    bookingTime, tripType, vehicleBillPhotos,
  } = useCurrentRideInfoStore();

  // Build photo entries from trip bills data
  const preTripPhotos = vehicleBillPhotos?.preTripVehiclePhotos || bills?.preTripVehiclePhotos || {};
  const dentPhotos    = Array.isArray(vehicleBillPhotos?.dentPhotos || bills?.dentPhotos)
    ? (vehicleBillPhotos?.dentPhotos || bills?.dentPhotos)
    : [];
  const odometerPhoto = vehicleBillPhotos?.odometerPhoto || bills?.odometerPhoto || null;
  const vehiclePhotoEntries = [
    preTripPhotos?.front     && { key: 'front',    label: 'Front',    uri: preTripPhotos.front },
    preTripPhotos?.rear      && { key: 'rear',     label: 'Rear',     uri: preTripPhotos.rear },
    preTripPhotos?.leftSide  && { key: 'left',     label: 'Left Side', uri: preTripPhotos.leftSide },
    preTripPhotos?.rightSide && { key: 'right',    label: 'Right Side', uri: preTripPhotos.rightSide },
    odometerPhoto            && { key: 'odometer', label: 'Odometer', uri: odometerPhoto },
    ...dentPhotos.map((uri, i) => ({ key: `dent_${i}`, label: `Dent ${i + 1}`, uri })),
  ].filter(Boolean);

  const {
    driverName, driverPhoto, rating: driverRating, phone,
    vehicleNumber, model: vehicleModel, brand: vehicleBrand,
    color: vehicleColor, driverMaxSpeed,
    maxAllowedSpeed,
  } = useAssignedDriverInfoStore();

  const speedLimit = maxAllowedSpeed || SPEED_LIMIT;

  // Track speed violations
  useEffect(() => {
    const curr = driverMaxSpeed != null ? Math.round(driverMaxSpeed) : null;
    const prev = prevSpeedRef.current;
    if (curr != null && curr > speedLimit && (prev == null || prev <= speedLimit)) {
      const ts = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      setViolationCount(c => c + 1);
      setViolations(v => [...v, { speed: curr, time: ts }]);
    }
    prevSpeedRef.current = curr;
  }, [driverMaxSpeed]);

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

  const billsArray       = Array.isArray(bills) ? bills : [];
  const totalBillsAmount = billsArray.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
  const currentFare      = finalFare || estimatedFare;
  const isOverSpeed      = driverMaxSpeed != null && Math.round(driverMaxSpeed) > speedLimit;

  const STOPS_PREVIEW   = 3;
  const visiblePending  = showAllStops ? pendingStops : pendingStops.slice(0, STOPS_PREVIEW);
  const hiddenStopCount = Math.max(0, pendingStops.length - STOPS_PREVIEW);

  const fmtDate = ts => ts
    ? new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const fmtTime = ts => ts
    ? new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '—';

  // ── Trip Tab ─────────────────────────────────────────────────────────────
  const renderTripTab = () => (
    <View>
      {/* Driver Details */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Icon name="account" size={14} color={P} />
          </View>
          <Text style={styles.cardTitle}>Driver Details</Text>
        </View>
        <View style={styles.driverRow}>
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
              {!!otp && (
                <>
                  <Text style={styles.driverMetaSep}>  •  </Text>
                  <Text style={styles.driverOtp}>OTP: {otp}</Text>
                </>
              )}
            </View>
          </View>
          <View style={styles.driverActions}>
            <TouchableOpacity style={styles.driverActionBtn} onPress={handleCallDriver}>
              <Icon name="phone" size={17} color={P} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.driverActionBtn}>
              <Icon name="message-text-outline" size={17} color={P} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Vehicle Details */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Icon name="car-side" size={14} color={P} />
          </View>
          <Text style={styles.cardTitle}>Vehicle Details</Text>
        </View>
        <View style={styles.vehicleRow}>
          <View style={{ flex: 1, gap: 8 }}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plate Number</Text>
              <Text style={styles.detailValue}>{vehicleNumber || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Brand</Text>
              <Text style={styles.detailValue}>{vehicleBrand || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Model</Text>
              <Text style={styles.detailValue}>{vehicleModel || 'N/A'}</Text>
            </View>
            {!!vehicleColor && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Color</Text>
                <Text style={styles.detailValue}>{vehicleColor}</Text>
              </View>
            )}
          </View>
          <View style={styles.vehicleIconBox}>
            <Icon name="car-side" size={40} color={P} />
          </View>
        </View>
        <View style={styles.liveTripBadge}>
          <View style={styles.liveDotGreen} />
          <Text style={styles.liveTripBadgeText}>LIVE TRIP</Text>
        </View>
      </View>

      {/* Vehicle Photos */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Icon name="camera-outline" size={14} color={P} />
          </View>
          <Text style={styles.cardTitle}>Vehicle Photos</Text>
          <View style={styles.viewOnlyBadge}>
            <Icon name="eye-outline" size={11} color={GREY} />
            <Text style={styles.viewOnlyTxt}>View only</Text>
          </View>
        </View>

        {vehiclePhotoEntries.length === 0 ? (
          <View style={styles.emptyPhotos}>
            <Icon name="image-off-outline" size={28} color={P_MED} />
            <Text style={styles.emptyNote}>No photos uploaded yet</Text>
          </View>
        ) : (
          <View style={styles.photoGrid}>
            {vehiclePhotoEntries.map(photo => (
              <View key={photo.key} style={styles.photoItem}>
                <Image source={{ uri: photo.uri }} style={styles.photoImg} resizeMode="cover" />
                <View style={styles.photoLabelWrap}>
                  <Text style={styles.photoLabel}>{photo.label}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Trip Details */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Icon name="information-outline" size={14} color={P} />
          </View>
          <Text style={styles.cardTitle}>Trip Details</Text>
        </View>
        <View style={{ gap: 8 }}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trip ID</Text>
            <Text style={styles.detailValue}>{tripId || '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{fmtDate(bookingTime)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{fmtTime(bookingTime)}</Text>
          </View>
          {!!tripType && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trip Type</Text>
              <Text style={styles.detailValue}>{tripType}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stops</Text>
            <Text style={styles.detailValue}>{totalStops} stops</Text>
          </View>
        </View>
      </View>

      {/* Trip Duration */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Icon name="clock-outline" size={14} color={P} />
          </View>
          <Text style={styles.cardTitle}>Trip Duration</Text>
        </View>
        <View style={styles.durationRow}>
          <View style={styles.durationBlock}>
            <Text style={styles.durationLabel}>Distance Covered</Text>
            <Text style={styles.durationValue}>{finalDistance ? `${finalDistance} km` : '—'}</Text>
          </View>
          <View style={styles.durationDivider} />
          <View style={styles.durationBlock}>
            <Text style={styles.durationLabel}>Remaining</Text>
            <Text style={styles.durationValue}>{totalDistance ? `${totalDistance} km` : '—'}</Text>
          </View>
          <View style={styles.durationDivider} />
          <View style={styles.durationBlock}>
            <Text style={styles.durationLabel}>Time Left</Text>
            <Text style={styles.durationValue}>{duration ? `${duration} min` : '—'}</Text>
          </View>
        </View>
        {/* Progress */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completedPct}%` }]} />
        </View>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressSubLabel}>{completedStops.length}/{totalStops} stops done</Text>
          <Text style={styles.progressLabel}>{completedPct}%</Text>
        </View>
      </View>

      {/* Trip Itinerary */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.cardHeader} onPress={() => setIsItinOpen(o => !o)} activeOpacity={0.7}>
          <View style={styles.cardIconWrap}>
            <Icon name="format-list-bulleted" size={14} color={P} />
          </View>
          <Text style={styles.cardTitle}>Trip Itinerary</Text>
          <View style={styles.stopsBadge}>
            <Text style={styles.stopsBadgeText}>{totalStops} stops</Text>
          </View>
          <Icon name={isItinOpen ? 'chevron-up' : 'chevron-down'} size={18} color={GREY} />
        </TouchableOpacity>

        {isItinOpen && (
          <>
            {nextStop ? (
              <View style={styles.drivingBox}>
                <Icon name="navigation" size={16} color={P} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.drivingBoxTitle}>Driving to next stop</Text>
                  <Text style={styles.drivingBoxSub} numberOfLines={1}>
                    {nextStop.name || nextStop.address}
                    {duration ? ` • ETA ${duration} min` : ''}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={[styles.drivingBox, { backgroundColor: '#E8F5E9' }]}>
                <Icon name="check-circle" size={16} color="#43A047" />
                <Text style={[styles.drivingBoxTitle, { color: '#43A047', marginLeft: 10 }]}>All stops reached</Text>
              </View>
            )}

            {/* Completed stops */}
            {completedStops.map((stop, idx) => (
              <View key={`cs-${idx}`} style={styles.stopRow}>
                <View style={styles.stopLineCol}>
                  <View style={styles.stopDotCompleted}>
                    <Icon name="check" size={11} color="#fff" />
                  </View>
                  <View style={styles.stopConnectorFaded} />
                </View>
                <View style={[styles.stopBody, { opacity: 0.5 }]}>
                  <View style={styles.stopTopRow}>
                    <Text style={[styles.stopName, { textDecorationLine: 'line-through', color: GREY }]} numberOfLines={1}>
                      {stop.name || stop.address || `Stop ${idx + 1}`}
                    </Text>
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneBadgeText}>DONE</Text>
                    </View>
                  </View>
                  {!!stop.address && <Text style={styles.stopAddress} numberOfLines={1}>{stop.address}</Text>}
                </View>
              </View>
            ))}

            {/* Pending stops */}
            {visiblePending.map((stop, idx) => {
              const num        = completedStops.length + idx + 1;
              const isFirst    = idx === 0;
              const isDropStop = num === totalStops;
              const isLast     = idx === visiblePending.length - 1 && !(hiddenStopCount > 0 && !showAllStops);
              const dotBg      = isDropStop ? '#D32F2F' : isFirst ? P : '#7B52CC';
              const dotIcon    = isDropStop ? 'flag-checkered' : isFirst ? 'navigation' : 'map-marker-outline';

              return (
                <View key={`ps-${idx}`} style={styles.stopRow}>
                  <View style={styles.stopLineCol}>
                    <View style={[styles.stopDot, { backgroundColor: dotBg }, isFirst && styles.stopDotActive]}>
                      <Icon name={dotIcon} size={11} color="#fff" />
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
                    {!!stop.waitingTime && <Text style={styles.stopTime}>{stop.waitingTime} min wait</Text>}
                    {!!stop.address && <Text style={styles.stopAddress} numberOfLines={2}>{stop.address}</Text>}
                    {/* Time chips */}
                    {(stop.arrivalTime || stop.departureTime) && (
                      <View style={styles.timeChipRow}>
                        {!!stop.arrivalTime && (
                          <View style={styles.timeChip}>
                            <Icon name="clock-in" size={11} color={P} />
                            <Text style={styles.timeChipTxt}>Arr {fmtTime(stop.arrivalTime)}</Text>
                          </View>
                        )}
                        {!!stop.departureTime && (
                          <View style={styles.timeChip}>
                            <Icon name="clock-out" size={11} color={P} />
                            <Text style={styles.timeChipTxt}>Dep {fmtTime(stop.departureTime)}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {hiddenStopCount > 0 && !showAllStops && (
              <TouchableOpacity style={styles.showMoreRow} onPress={() => setShowAllStops(true)}>
                <Text style={styles.showMoreText}>Show {hiddenStopCount} more stop{hiddenStopCount > 1 ? 's' : ''}</Text>
                <Icon name="chevron-down" size={14} color={P} />
              </TouchableOpacity>
            )}
            {showAllStops && pendingStops.length > STOPS_PREVIEW && (
              <TouchableOpacity style={styles.showMoreRow} onPress={() => setShowAllStops(false)}>
                <Text style={styles.showMoreText}>Show less</Text>
                <Icon name="chevron-up" size={14} color={P} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Special Requirements */}
      {(specialRequirements?.length > 0 || true) && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <Icon name="star-circle-outline" size={14} color={P} />
            </View>
            <Text style={styles.cardTitle}>Special Requirements</Text>
          </View>
          {specialRequirements?.length > 0 ? (
            <View style={styles.tagWrap}>
              {specialRequirements.map((req, i) => (
                <View key={i} style={styles.reqTag}>
                  <Icon name={req.icon || 'check-circle-outline'} size={12} color={P} />
                  <Text style={styles.reqTagTxt}>{req.label || req}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyNote}>No special requirements</Text>
          )}
        </View>
      )}

      {/* Driver Arrangements */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Icon name="hand-heart-outline" size={14} color={P} />
          </View>
          <Text style={styles.cardTitle}>Driver Arrangements</Text>
        </View>
        {driverArrangements?.length > 0 ? (
          <View style={styles.tagWrap}>
            {driverArrangements.map((arr, i) => (
              <View key={i} style={styles.reqTag}>
                <Icon name={arr.icon || 'check-circle-outline'} size={12} color={P} />
                <Text style={styles.reqTagTxt}>{arr.label || arr}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyNote}>No arrangements specified</Text>
        )}
      </View>

      {/* Notes — editable by customer */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Icon name="note-text-outline" size={14} color={P} />
          </View>
          <Text style={styles.cardTitle}>Notes</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditingNotes(e => !e)}>
            <Icon name={editingNotes ? 'check' : 'pencil-outline'} size={14} color={P} />
            <Text style={styles.editBtnTxt}>{editingNotes ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
        {editingNotes ? (
          <TextInput
            style={styles.notesInput}
            value={notes || tripNotes || ''}
            onChangeText={setNotes}
            placeholder="Add notes for driver..."
            placeholderTextColor="#BDBDBD"
            multiline
            numberOfLines={3}
          />
        ) : (
          <Text style={notes || tripNotes ? styles.notesText : styles.emptyNote}>
            {notes || tripNotes || 'No notes added. Tap Edit to add a note.'}
          </Text>
        )}
      </View>
    </View>
  );

  // ── Fare & Bills Tab ──────────────────────────────────────────────────────
  const renderFareTab = () => (
    <View>
      {/* Fare Breakdown */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconWrap, { backgroundColor: '#FFF3E0' }]}>
            <Icon name="currency-inr" size={14} color="#F57C00" />
          </View>
          <Text style={styles.cardTitle}>Fare Details</Text>
        </View>
        <View style={styles.fareHighlight}>
          <View>
            <Text style={styles.fareHighlightLabel}>Estimated Fare</Text>
            <Text style={styles.fareHighlightValue}>{currentFare ? `₹${currentFare}` : '—'}</Text>
          </View>
          <View style={styles.fareFinalBadge}>
            <Icon name="check-circle" size={12} color={finalFare ? '#43A047' : '#F57C00'} />
            <Text style={[styles.fareFinalTxt, { color: finalFare ? '#43A047' : '#F57C00' }]}>
              {finalFare ? 'Final' : 'Estimated'}
            </Text>
          </View>
        </View>
        <View style={{ gap: 8, marginTop: 12 }}>
          <View style={styles.fareRow}>
            <Text style={styles.fareRowLabel}>Base Fare</Text>
            <Text style={styles.fareRowValue}>{currentFare ? `₹${currentFare}` : '—'}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareRowLabel}>Total Expenses</Text>
            <Text style={[styles.fareRowValue, { color: '#D32F2F' }]}>₹{totalBillsAmount}</Text>
          </View>
          <View style={[styles.fareRow, styles.fareTotalRow]}>
            <Text style={styles.fareTotalLabel}>Total Payable</Text>
            <Text style={styles.fareTotalValue}>
              ₹{currentFare ? Number(currentFare) + totalBillsAmount : totalBillsAmount}
            </Text>
          </View>
        </View>
      </View>

      {/* Bills */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconWrap, { backgroundColor: P_LIGHT }]}>
            <Icon name="receipt" size={14} color={P} />
          </View>
          <Text style={styles.cardTitle}>Bills & Expenses</Text>
          {billsArray.length > 0 && (
            <View style={styles.stopsBadge}>
              <Text style={styles.stopsBadgeText}>{billsArray.length} items</Text>
            </View>
          )}
        </View>

        {billsArray.length === 0 ? (
          <View style={styles.emptyBills}>
            <Icon name="receipt-outline" size={28} color={P_MED} />
            <Text style={styles.emptyNote}>No bills added yet</Text>
          </View>
        ) : (
          <>
            {billsArray.map((bill, idx) => (
              <View key={`bill-${idx}`} style={[styles.billRow, idx > 0 && styles.billRowBorder]}>
                <View style={styles.billIconBox}>
                  <Icon name="receipt" size={15} color={P} />
                </View>
                <View style={styles.billInfo}>
                  <Text style={styles.billName}>{bill.name || 'Expense'}</Text>
                  {!!bill.remarks && <Text style={styles.billRemark}>{bill.remarks}</Text>}
                </View>
                <Text style={styles.billAmt}>₹{bill.amount}</Text>
              </View>
            ))}
            <View style={styles.billTotalRow}>
              <Text style={styles.billTotalLabel}>Total Bills</Text>
              <Text style={styles.billTotalValue}>₹{totalBillsAmount}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );

  // ── Safety Tab ────────────────────────────────────────────────────────────
  const renderSafetyTab = () => (
    <View>
      {/* Live Speed */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconWrap, { backgroundColor: '#E8F5E9' }]}>
            <Icon name="speedometer" size={14} color="#2E7D32" />
          </View>
          <Text style={styles.cardTitle}>Live Speed</Text>
          <View style={[styles.monitoringBadge, isOverSpeed && styles.monitoringBadgeAlert]}>
            <View style={[styles.monitoringDot, isOverSpeed && { backgroundColor: '#D32F2F' }]} />
            <Text style={[styles.monitoringText, isOverSpeed && { color: '#D32F2F' }]}>
              {isOverSpeed ? 'Speeding' : 'Monitoring'}
            </Text>
          </View>
        </View>
        <View style={styles.speedRow}>
          <View style={[styles.speedGauge, isOverSpeed && styles.speedGaugeAlert]}>
            <Text style={[styles.speedGaugeValue, isOverSpeed && { color: '#D32F2F' }]}>
              {driverMaxSpeed != null ? Math.round(driverMaxSpeed) : '0'}
            </Text>
            <Text style={styles.speedGaugeUnit}>km/h</Text>
          </View>
          <View style={styles.speedMeta}>
            <Text style={[styles.speedStatusText, { color: isOverSpeed ? '#D32F2F' : '#2E7D32' }]}>
              {isOverSpeed ? 'Driver is exceeding speed limit!' : 'Driver is within safe limits'}
            </Text>
            <Text style={styles.speedDesc}>Speed is monitored in real-time against set limits.</Text>
            <View style={styles.speedLimitPill}>
              <Icon name="alert-octagon" size={12} color="#D32F2F" />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.speedLimitLabel}>Speed Limit</Text>
                <Text style={styles.speedLimitValue}>{speedLimit} km/h</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Violations */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconWrap, { backgroundColor: '#FFEBEE' }]}>
            <Icon name="alert-circle-outline" size={14} color="#D32F2F" />
          </View>
          <Text style={styles.cardTitle}>Speed Violations</Text>
          <View style={[styles.violationCountBadge, violationCount > 0 && styles.violationCountBadgeAlert]}>
            <Text style={[styles.violationCountTxt, violationCount > 0 && { color: '#D32F2F' }]}>
              {violationCount} violation{violationCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {violationCount === 0 ? (
          <View style={styles.noViolation}>
            <View style={styles.noViolationIcon}>
              <Icon name="shield-check-outline" size={28} color="#43A047" />
            </View>
            <Text style={styles.noViolationTitle}>No Violations</Text>
            <Text style={styles.noViolationSub}>Driver has stayed within the speed limit throughout the trip.</Text>
          </View>
        ) : (
          <>
            <View style={styles.violationSummaryRow}>
              <View style={styles.violationSummaryBlock}>
                <Text style={styles.violationSummaryNum}>{violationCount}</Text>
                <Text style={styles.violationSummaryLabel}>Total Violations</Text>
              </View>
              <View style={styles.violationSummaryDivider} />
              <View style={styles.violationSummaryBlock}>
                <Text style={[styles.violationSummaryNum, { color: '#D32F2F' }]}>
                  {Math.max(...violations.map(v => v.speed))} km/h
                </Text>
                <Text style={styles.violationSummaryLabel}>Peak Speed</Text>
              </View>
              <View style={styles.violationSummaryDivider} />
              <View style={styles.violationSummaryBlock}>
                <Text style={styles.violationSummaryNum}>{speedLimit} km/h</Text>
                <Text style={styles.violationSummaryLabel}>Speed Limit</Text>
              </View>
            </View>

            <Text style={styles.violationLogTitle}>Violation Log</Text>
            {violations.map((v, i) => (
              <View key={i} style={[styles.violationLogRow, i > 0 && styles.violationLogBorder]}>
                <View style={styles.violationLogIcon}>
                  <Icon name="speedometer-slow" size={14} color="#D32F2F" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.violationLogSpeed}>{v.speed} km/h</Text>
                  <Text style={styles.violationLogOver}>+{v.speed - speedLimit} km/h over limit</Text>
                </View>
                <Text style={styles.violationLogTime}>{v.time}</Text>
              </View>
            ))}
          </>
        )}
      </View>

      {/* Safety Tips */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconWrap, { backgroundColor: P_LIGHT }]}>
            <Icon name="shield-account-outline" size={14} color={P} />
          </View>
          <Text style={styles.cardTitle}>Safety Information</Text>
        </View>
        {[
          { icon: 'seatbelt', text: 'Ensure all passengers have seatbelts fastened.' },
          { icon: 'phone-off', text: 'Driver should not use phone while driving.' },
          { icon: 'speedometer-medium', text: `Driver must stay under ${speedLimit} km/h at all times.` },
        ].map((tip, i) => (
          <View key={i} style={[styles.safetyTip, i > 0 && { borderTopWidth: 1, borderTopColor: '#F0F0F0' }]}>
            <View style={styles.safetyTipIcon}>
              <Icon name={tip.icon} size={14} color={P} />
            </View>
            <Text style={styles.safetyTipText}>{tip.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={goBack}>
          <Icon name="arrow-left" size={22} color={NAVY} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.fullScreenBtn}
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
          <Icon name="crosshairs-gps" size={15} color={P} />
          <Text style={styles.fullScreenText}>Center</Text>
        </TouchableOpacity>
      </View>

      {/* Speed overlay */}
      <View style={styles.speedOverlay} pointerEvents="none">
        <View style={[styles.speedCircle, isOverSpeed && styles.speedCircleAlert]}>
          <Text style={[styles.speedNum, isOverSpeed && styles.speedNumAlert]}>
            {driverMaxSpeed != null ? Math.round(driverMaxSpeed) : '—'}
          </Text>
          <Text style={styles.speedCircleUnit}>km/h</Text>
        </View>
        {isOverSpeed && (
          <View style={styles.violationBadge}>
            <Icon name="alert" size={10} color="#D32F2F" />
            <Text style={styles.violationBadgeTxt}>Speeding</Text>
          </View>
        )}
      </View>

      {/* Map right controls */}
      <View style={styles.mapRightControls} pointerEvents="box-none">
        <TouchableOpacity style={styles.mapCtrlBtn}>
          <Icon name="layers-outline" size={20} color={P} />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <BottomSheetWrapper
        snapPoints={['27%', '58%', '92%']}
        index={0}
        enablePanDownToClose={false}
        enableScroll={true}>

        {/* Next Stop Peek */}
        <View style={styles.nextStopBlock}>
          {/* Label + percentage */}
          <View style={styles.nextStopTopRow}>
            <View style={styles.nextStopIconWrap}>
              <Icon name="navigation" size={13} color="#FFF" />
            </View>
            <Text style={styles.nextStopHeader}>Next Stop</Text>
            <View style={styles.nextStopPctBadge}>
              <Text style={styles.nextStopPct}>{completedPct}%</Text>
            </View>
          </View>

          {/* Stop name */}
          <Text style={styles.nextStopName} numberOfLines={1}>
            {nextStop?.name || nextStop?.address || 'All stops completed'}
          </Text>

          {/* ETA chips */}
          {!!(duration || totalDistance) && (
            <View style={styles.nextStopChipRow}>
              {!!duration && (
                <View style={styles.nextStopChip}>
                  <Icon name="clock-outline" size={11} color={P} />
                  <Text style={styles.nextStopChipTxt}>{duration} min</Text>
                </View>
              )}
              {!!totalDistance && (
                <View style={styles.nextStopChip}>
                  <Icon name="map-marker-distance" size={11} color={P} />
                  <Text style={styles.nextStopChipTxt}>{totalDistance} km away</Text>
                </View>
              )}
            </View>
          )}

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completedPct}%` }]} />
          </View>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressSubLabel}>{completedStops.length}/{totalStops} stops done</Text>
            <Text style={styles.progressLabel}>{completedPct}%</Text>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.tabItem, activeTab === i && styles.tabItemActive]}
              onPress={() => setActiveTab(i)}
              activeOpacity={0.8}>
              <Text style={[styles.tabTxt, activeTab === i && styles.tabTxtActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 0 && renderTripTab()}
          {activeTab === 1 && renderFareTab()}
          {activeTab === 2 && renderSafetyTab()}
          <View style={{ height: 100 }} />
        </View>

      </BottomSheetWrapper>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <BottomBarBtn icon="phone"               label="Call"    color="#43A047" bg="#E8F5E9" onPress={handleCallDriver} />
        <BottomBarBtn icon="message-text-outline" label="Chat"   color="#43A047" bg="#E8F5E9" />
        <BottomBarBtn icon="headset"              label="Support" color={P}       bg={P_LIGHT} />
        <BottomBarBtn icon="alert-circle"         label="SOS"     color="#D32F2F" bg="#FFEBEE" onPress={() => Linking.openURL('tel:112').catch(() => {})} />
      </View>

    </SafeAreaView>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const BottomBarBtn = ({ icon, label, color, bg, onPress }) => (
  <TouchableOpacity style={[styles.bottomBarBtn, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.75}>
    <Icon name={icon} size={22} color={color} />
    <Text style={[styles.bottomBarLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#ECEEF2',
  },
  headerBackBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: P_LIGHT, alignItems: 'center', justifyContent: 'center',
  },
  headerCenter:  { flex: 1, alignItems: 'center' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5E9', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  liveDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#43A047', marginRight: 6 },
  liveText: { fontSize: 13, fontFamily: Fonts.bold, color: '#43A047' },
  fullScreenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: P_LIGHT, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
  },
  fullScreenText: { fontSize: 12, fontFamily: Fonts.semi_bold, color: P },

  speedOverlay: { position: 'absolute', left: 14, top: 80, alignItems: 'center' },
  speedCircle: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 4, borderColor: '#D32F2F',
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  speedCircleAlert: { backgroundColor: '#FFEBEE' },
  speedNum:         { fontSize: 18, fontFamily: Fonts.bold, color: NAVY, lineHeight: 20 },
  speedNumAlert:    { color: '#D32F2F' },
  speedCircleUnit:  { fontSize: 8, fontFamily: Fonts.bold, color: GREY },
  violationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FFEBEE', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6, marginTop: 4,
  },
  violationBadgeTxt: { fontSize: 9, fontFamily: Fonts.bold, color: '#D32F2F' },

  mapRightControls: { position: 'absolute', right: 14, top: 100 },
  mapCtrlBtn: {
    backgroundColor: '#FFF', width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', elevation: 3,
  },

  // Next stop
  nextStopBlock: {
    marginHorizontal: 16, marginBottom: 10, backgroundColor: P, borderRadius: 16,
    padding: 16, elevation: 3,
    shadowColor: P, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  nextStopTopRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  nextStopIconWrap:  { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  nextStopHeader:    { flex: 1, fontSize: 11, fontFamily: Fonts.bold, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 0.8 },
  nextStopPctBadge:  { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  nextStopPct:       { fontSize: 12, fontFamily: Fonts.bold, color: '#FFF' },
  nextStopName:      { fontSize: 17, fontFamily: Fonts.bold, color: '#FFF', marginBottom: 10 },
  nextStopChipRow:   { flexDirection: 'row', gap: 8, marginBottom: 12 },
  nextStopChip:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  nextStopChipTxt:   { fontSize: 11, fontFamily: Fonts.semi_bold, color: P },
  progressTrack:     { height: 5, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4, overflow: 'hidden' },
  progressFill:      { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
  progressLabelRow:  { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressSubLabel:  { fontSize: 10, fontFamily: Fonts.medium, color: 'rgba(255,255,255,0.7)' },
  progressLabel:     { fontSize: 10, fontFamily: Fonts.bold, color: '#FFF' },

  // Tab bar
  tabBar: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#F0F4F8', borderRadius: 12, padding: 4,
  },
  tabItem:       { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabItemActive: { backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  tabTxt:        { fontSize: 11, fontFamily: Fonts.medium, color: '#888' },
  tabTxtActive:  { color: NAVY, fontFamily: Fonts.semi_bold },
  tabContent:    { paddingHorizontal: 0 },

  // Card
  card: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 14,
    marginHorizontal: 16, marginBottom: 12,
    elevation: 1, shadowColor: NAVY, shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle:   { flex: 1, fontSize: 13, fontFamily: Fonts.semi_bold, color: NAVY },
  cardIconWrap:{ width: 28, height: 28, borderRadius: 8, backgroundColor: P_LIGHT, alignItems: 'center', justifyContent: 'center' },

  // Driver row
  driverRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverAvatar: { width: 50, height: 50, borderRadius: 25 },
  driverAvatarFallback: { backgroundColor: P, alignItems: 'center', justifyContent: 'center' },
  driverInitials:{ color: '#FFF', fontSize: 16, fontFamily: Fonts.bold },
  driverInfo:   { flex: 1 },
  driverName:   { fontSize: 15, fontFamily: Fonts.bold, color: NAVY },
  driverMetaRow:{ flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  driverRatingText: { fontSize: 12, fontFamily: Fonts.bold, color: '#F57F17', marginLeft: 3 },
  driverMetaSep:{ fontSize: 12, color: '#CCC' },
  driverOtp:    { fontSize: 12, fontFamily: Fonts.bold, color: P },
  driverActions:{ flexDirection: 'row', gap: 8 },
  driverActionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: P_LIGHT, alignItems: 'center', justifyContent: 'center' },

  // Vehicle
  vehicleRow:   { flexDirection: 'row', alignItems: 'center' },
  vehicleIconBox:{ width: 72, height: 52, backgroundColor: P_LIGHT, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  viewOnlyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  viewOnlyTxt:   { fontSize: 10, fontFamily: Fonts.medium, color: GREY },
  emptyPhotos:   { alignItems: 'center', paddingVertical: 20, gap: 6 },
  photoGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoItem:     { width: '47%', borderRadius: 12, overflow: 'hidden', backgroundColor: '#F0F0F0' },
  photoImg:      { width: '100%', height: 110, borderRadius: 12 },
  photoLabelWrap:{ backgroundColor: 'rgba(53,33,102,0.7)', paddingVertical: 4, paddingHorizontal: 8, position: 'absolute', bottom: 0, left: 0, right: 0, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  photoLabel:    { fontSize: 11, fontFamily: Fonts.bold, color: '#FFF', textAlign: 'center' },
  liveTripBadge:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  liveDotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#43A047' },
  liveTripBadgeText: { fontSize: 10, fontFamily: Fonts.bold, color: '#43A047' },

  // Detail rows
  detailRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 12, fontFamily: Fonts.medium, color: GREY },
  detailValue: { fontSize: 12, fontFamily: Fonts.semi_bold, color: NAVY },

  // Duration
  durationRow:    { flexDirection: 'row', marginBottom: 12 },
  durationBlock:  { flex: 1, alignItems: 'center' },
  durationDivider:{ width: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },
  durationLabel:  { fontSize: 10, fontFamily: Fonts.medium, color: GREY, marginBottom: 4 },
  durationValue:  { fontSize: 15, fontFamily: Fonts.bold, color: NAVY },

  // Itinerary
  stopsBadge:    { backgroundColor: P_LIGHT, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  stopsBadgeText:{ fontSize: 10, fontFamily: Fonts.bold, color: P },
  drivingBox:    { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: P_LIGHT, padding: 10, borderRadius: 12, marginBottom: 10 },
  drivingBoxTitle:{ fontSize: 12, fontFamily: Fonts.bold, color: P },
  drivingBoxSub: { fontSize: 11, fontFamily: Fonts.regular, color: GREY, marginTop: 2 },
  stopRow:       { flexDirection: 'row', marginBottom: 4 },
  stopLineCol:   { width: 28, alignItems: 'center' },
  stopDot:       { width: 24, height: 24, borderRadius: 12, backgroundColor: P, alignItems: 'center', justifyContent: 'center' },
  stopDotActive: { borderWidth: 3, borderColor: P_MED },
  stopDotCompleted: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#43A047', alignItems: 'center', justifyContent: 'center' },
  stopConnector:      { width: 2, flex: 1, minHeight: 12, backgroundColor: P_MED, marginTop: 2 },
  stopConnectorFaded: { width: 2, flex: 1, minHeight: 12, backgroundColor: '#E8E8E8', marginTop: 2 },
  doneBadge:     { backgroundColor: '#E8F5E9', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  doneBadgeText: { fontSize: 9, fontFamily: Fonts.bold, color: '#43A047' },
  stopBody:      { flex: 1, paddingLeft: 10, paddingBottom: 12 },
  stopTopRow:    { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
  stopName:      { fontSize: 13, fontFamily: Fonts.bold, color: NAVY, flex: 1 },
  typeBadge:     { backgroundColor: '#E8F5E9', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  typeText:      { fontSize: 9, fontFamily: Fonts.bold, color: '#43A047' },
  dropBadge:     { backgroundColor: '#FFEBEE' },
  dropText:      { color: '#D32F2F' },
  navBadge:      { backgroundColor: '#FFF3E0', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  navBadgeText:  { fontSize: 9, fontFamily: Fonts.bold, color: '#F57C00' },
  stopTime:      { fontSize: 11, fontFamily: Fonts.semi_bold, color: P, marginTop: 2 },
  stopAddress:   { fontSize: 11, fontFamily: Fonts.regular, color: GREY, marginTop: 2, lineHeight: 16 },
  timeChipRow:   { flexDirection: 'row', gap: 6, marginTop: 5, flexWrap: 'wrap' },
  timeChip:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: P_LIGHT, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  timeChipTxt:   { fontSize: 10, fontFamily: Fonts.medium, color: P },
  showMoreRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 4 },
  showMoreText:  { fontSize: 12, fontFamily: Fonts.bold, color: P },

  // Tags / requirements
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reqTag:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: P_LIGHT, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  reqTagTxt: { fontSize: 12, fontFamily: Fonts.medium, color: P },
  emptyNote: { fontSize: 12, fontFamily: Fonts.regular, color: '#BDBDBD', fontStyle: 'italic' },

  // Edit button
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: P_LIGHT, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  editBtnTxt: { fontSize: 11, fontFamily: Fonts.semi_bold, color: P },
  notesInput: { backgroundColor: '#F8F9FC', borderRadius: 10, padding: 10, fontSize: 13, fontFamily: Fonts.regular, color: NAVY, borderWidth: 1, borderColor: P_MED, minHeight: 70, textAlignVertical: 'top' },
  notesText:  { fontSize: 13, fontFamily: Fonts.regular, color: NAVY, lineHeight: 20 },

  // Fare
  fareHighlight:      { backgroundColor: P_LIGHT, padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fareHighlightLabel: { fontSize: 11, fontFamily: Fonts.medium, color: P, marginBottom: 4 },
  fareHighlightValue: { fontSize: 24, fontFamily: Fonts.bold, color: P },
  fareFinalBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  fareFinalTxt:       { fontSize: 11, fontFamily: Fonts.bold },
  fareRow:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  fareRowLabel:       { fontSize: 13, fontFamily: Fonts.medium, color: GREY },
  fareRowValue:       { fontSize: 13, fontFamily: Fonts.semi_bold, color: NAVY },
  fareTotalRow:       { borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 4, paddingTop: 8 },
  fareTotalLabel:     { fontSize: 14, fontFamily: Fonts.bold, color: NAVY },
  fareTotalValue:     { fontSize: 16, fontFamily: Fonts.bold, color: P },

  // Bills
  emptyBills:      { alignItems: 'center', paddingVertical: 20, gap: 6 },
  billRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  billRowBorder:   { borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  billIconBox:     { width: 34, height: 34, borderRadius: 10, backgroundColor: P_LIGHT, alignItems: 'center', justifyContent: 'center' },
  billInfo:        { flex: 1 },
  billName:        { fontSize: 13, fontFamily: Fonts.semi_bold, color: NAVY },
  billRemark:      { fontSize: 11, fontFamily: Fonts.regular, color: GREY, marginTop: 2 },
  billAmt:         { fontSize: 13, fontFamily: Fonts.bold, color: NAVY },
  billTotalRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10, marginTop: 4 },
  billTotalLabel:  { fontSize: 13, fontFamily: Fonts.bold, color: NAVY },
  billTotalValue:  { fontSize: 14, fontFamily: Fonts.bold, color: P },

  // Speed & Safety
  speedRow:        { flexDirection: 'row', alignItems: 'center', gap: 16 },
  speedGauge:      { width: 70, height: 70, borderRadius: 35, borderWidth: 5, borderColor: '#43A047', alignItems: 'center', justifyContent: 'center' },
  speedGaugeAlert: { borderColor: '#D32F2F' },
  speedGaugeValue: { fontSize: 20, fontFamily: Fonts.bold, color: NAVY },
  speedGaugeUnit:  { fontSize: 8, fontFamily: Fonts.bold, color: GREY },
  speedMeta:       { flex: 1 },
  speedStatusText: { fontSize: 13, fontFamily: Fonts.bold, marginBottom: 4 },
  speedDesc:       { fontSize: 11, fontFamily: Fonts.regular, color: GREY, marginBottom: 8, lineHeight: 16 },
  speedLimitPill:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start' },
  speedLimitLabel: { fontSize: 9, fontFamily: Fonts.medium, color: '#D32F2F' },
  speedLimitValue: { fontSize: 12, fontFamily: Fonts.bold, color: '#D32F2F' },
  monitoringBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  monitoringBadgeAlert: { backgroundColor: '#FFEBEE' },
  monitoringDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: '#43A047' },
  monitoringText:  { fontSize: 10, fontFamily: Fonts.bold, color: '#2E7D32' },

  // Violations
  violationCountBadge:      { backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  violationCountBadgeAlert: { backgroundColor: '#FFEBEE' },
  violationCountTxt:        { fontSize: 11, fontFamily: Fonts.bold, color: GREY },
  noViolation:      { alignItems: 'center', paddingVertical: 20, gap: 8 },
  noViolationIcon:  { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  noViolationTitle: { fontSize: 15, fontFamily: Fonts.bold, color: NAVY },
  noViolationSub:   { fontSize: 12, fontFamily: Fonts.regular, color: GREY, textAlign: 'center', lineHeight: 18 },
  violationSummaryRow:     { flexDirection: 'row', backgroundColor: '#FFF8F8', borderRadius: 12, padding: 14, marginBottom: 14 },
  violationSummaryBlock:   { flex: 1, alignItems: 'center' },
  violationSummaryDivider: { width: 1, backgroundColor: '#F0D0D0', marginVertical: 4 },
  violationSummaryNum:     { fontSize: 18, fontFamily: Fonts.bold, color: NAVY },
  violationSummaryLabel:   { fontSize: 10, fontFamily: Fonts.medium, color: GREY, marginTop: 3 },
  violationLogTitle:  { fontSize: 12, fontFamily: Fonts.semi_bold, color: NAVY, marginBottom: 8 },
  violationLogRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  violationLogBorder: { borderTopWidth: 1, borderTopColor: '#FFF0F0' },
  violationLogIcon:   { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' },
  violationLogSpeed:  { fontSize: 13, fontFamily: Fonts.bold, color: '#D32F2F' },
  violationLogOver:   { fontSize: 11, fontFamily: Fonts.medium, color: GREY, marginTop: 1 },
  violationLogTime:   { fontSize: 11, fontFamily: Fonts.medium, color: GREY },

  // Safety tips
  safetyTip:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  safetyTipIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: P_LIGHT, alignItems: 'center', justifyContent: 'center' },
  safetyTipText: { flex: 1, fontSize: 12, fontFamily: Fonts.medium, color: NAVY, lineHeight: 18 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', flexDirection: 'row',
    paddingVertical: 10, paddingHorizontal: 10, paddingBottom: 20,
    borderTopWidth: 1, borderTopColor: '#ECEEF2',
    elevation: 8, shadowColor: NAVY, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: -2 },
  },
  bottomBarBtn:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, marginHorizontal: 4, borderRadius: 14 },
  bottomBarLabel: { fontSize: 11, fontFamily: Fonts.bold, marginTop: 4 },
});

export default CustomerLiveTracking;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Modal,
  KeyboardAvoidingView,
  Platform,
  NativeModules,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { Colors, Fonts } from '../../common/constants/constants';
import { useStackScreenStore } from '../../common/store/useStackScreenStore';
import useActingDriverMediaStore from '../store/useActingDriverMediaStore';
import { useTripAcceptStore } from '../store/useTripAcceptStore';
import { useMapMarkerStore } from '../../common/store/useMapMarkerStore';
import BGLocationTask from '../../common/controllers/BGLocationTask';
import NavBar from '../../common/components/NavBar';
import CustomeBottomSheet from '../../common/components/CustomeBottomSheet';
import { height } from '../../common/utils/scalingutils';
import APIRequest from '../../common/APIRequest';
import useUserStore from '../../common/store/useUserStore';
import usePublicDriverStore from '../store/usePublicDriverStore';

const { NeNativeModule } = NativeModules;

const CHECKLIST_ITEMS = [
  { key: 'front', label: 'Front', icon: 'car-back' },
  { key: 'rear', label: 'Rear', icon: 'car' },
  { key: 'left', label: 'Left Side', icon: 'car-side' },
  { key: 'right', label: 'Right Side', icon: 'car-side' },
  { key: 'odometer', label: 'Odometer', icon: 'speedometer' },
  { key: 'damage', label: 'Damage', icon: 'alert-decagram' },
];

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
  const normalizedType = type.toLowerCase().trim().replace(/[\s-]/g, '_');
  return VEHICLE_IMAGES[normalizedType] || require('../assets/images/audi_q2_white.png');
};

const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
};

export default function DriverPreTripOverviewScreen() {
  const { goBack, setStackScreen } = useStackScreenStore();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [itinExpanded, setItinExpanded] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);

  const {
    userLocation,
    setDirectionPoints,
    setStartNavigation,
    setMapMarkers,
    setRouteNotFound,
    directionReadyCallback,
    routeLoading,
  } = useMapMarkerStore();

  const {
    preTripPhotos,
    dentPhotos,
    odometerPhoto,
    currentStage,
    setCurrentStage,
    isArrived,
    setIsArrived,
    preTripDone,
    odometerPhotoDone,
  } = useActingDriverMediaStore();

  const { upComingTripDetails, setUpComingTripDetails } = useTripAcceptStore();
  const { userInfo } = useUserStore();
  const showPaymentInitiatedLoader = usePublicDriverStore(s => s.showPaymentInitiatedLoader);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isPhotosApproved = !!(
    upComingTripDetails?.bills?.vehiclePhotosApproved === true
  );

  const isPhotosSent = !isPhotosApproved && (preTripDone && odometerPhotoDone);

  const isCustomerPaid = !!(
    upComingTripDetails?.bills?.isConfirmationFeePaid === true ||
    upComingTripDetails?.passengerPaymentStatus === 'completed' ||
    upComingTripDetails?.passengerPaymentStatus === 'COMPLETED' ||
    upComingTripDetails?.isAdvancePaid === true ||
    upComingTripDetails?.advancePaid === true
  );

  const refreshTripDetails = async () => {
    if (!upComingTripDetails?._id) return;
    setIsRefreshing(true);
    try {
      const api = new APIRequest();
      const response = await api.request(
        `/publicrides/driver/v2/getTrips?page=1&limit=1&tripId=${upComingTripDetails._id}`,
        'POST',
        {},
        userInfo?.token,
      );
      if (response?.success && response?.trips?.length > 0) {
        setUpComingTripDetails(response.trips[0]);
      }
    } catch (e) {
      console.log('refreshTripDetails error', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh when socket signals customer payment
  useEffect(() => {
    if (showPaymentInitiatedLoader) {
      refreshTripDetails();
    }
  }, [showPaymentInitiatedLoader]);

  const checklist = {
    front: !!preTripPhotos.front,
    rear: !!preTripPhotos.rear,
    left: !!preTripPhotos.leftSide,
    right: !!preTripPhotos.rightSide,
    odometer: !!odometerPhoto,
    damage: dentPhotos.length > 0,
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  // Plot trip route on the map behind the bottom sheet
  useEffect(() => {
    if (upComingTripDetails?.stops?.length) {
      const directions = upComingTripDetails.stops.map(s => ({
        lat: s.location[1],
        lon: s.location[0],
      }));
      setDirectionPoints({
        locations: directions,
        type: 'car',
        padding: [50, 50, 50, Math.round(height * 0.3)],
      });
    }
  }, [upComingTripDetails]);

  useEffect(() => {
    if (completedCount === CHECKLIST_ITEMS.length && isArrived && currentStage === 2) {
      setCurrentStage(3);
      Alert.alert('Checklist Completed', 'Vehicle inspection complete. Please proceed to Customer Verification.');
    }
  }, [completedCount, isArrived, currentStage]);

  const onGoBack = () => {
    NeNativeModule.clearDirectionPoints();
    goBack();
  };

  const handleMarkArrival = () => {
    setIsArrived(true);
    setCurrentStage(2);
    setStackScreen('DriverVehiclePhotosScreen');
  };

  const toggleChecklistItem = () => {
    if (!isArrived) {
      Alert.alert('Action Required', 'Please mark arrival first before inspecting the vehicle.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark Arrival', onPress: handleMarkArrival },
      ]);
      return;
    }
    setStackScreen('DriverVehiclePhotosScreen');
  };

  const verifyOTP = async (otp) => {
    setOtpLoading(true);
    try {
      const api = new APIRequest();
      const tripId = upComingTripDetails?._id;
      const res = await api.request('/publicrides/driver/v2/verifyTripOtp', 'POST', { otp, tripId }, userInfo?.token);
      setOtpLoading(false);
      if (res?.success) return true;
      return false;
    } catch {
      setOtpLoading(false);
      return false;
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 4) return;
    const success = await verifyOTP(otpValue);
    if (success) {
      setShowOtpModal(false);
      setOtpValue('');
      setCurrentStage(4);
    } else {
      Alert.alert('Invalid OTP', 'The OTP you entered is incorrect. Please try again.');
    }
  };

  const handleStartTripAfterOTP = () => {
    setStackScreen('ActingDriverOnRideScreen');
  };

  const handleNavMode = async (mode) => {
    const pickupStop = upComingTripDetails?.stops?.[0];
    setShowNavModal(false);

    if (mode === 'google') {
      const lat = pickupStop?.location?.[1];
      const lng = pickupStop?.location?.[0];
      let url = '';
      if (lat && lng) {
        url = `https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=${lat},${lng}`;
      } else if (pickupStop?.address) {
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupStop.address)}`;
      }
      if (url) {
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open Google Maps.'));
      }
      return;
    }

    // VirtualMaze in-app navigation
    if (routeLoading?.error) {
      Alert.alert('Route Error', 'Failed to fetch route. Check your internet and try again.');
      return;
    }
    if (!directionReadyCallback) {
      Alert.alert('Please wait', 'Route is still loading, try again in a moment.');
      return;
    }
    if (userLocation && pickupStop?.location) {
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
    goBack();
    await BGLocationTask.runDriverBgTask();
  };

  const handleAction = (type) => {
    const rawPhone = upComingTripDetails?.bookingForPhone || '';
    const cleanPhone = rawPhone.replace(/\s|-/g, '');
    const name = upComingTripDetails?.bookingForName || '';

    switch (type) {
      case 'call':
        if (cleanPhone) Linking.openURL(`tel:${cleanPhone}`);
        break;
      case 'navigate':
        setShowNavModal(true);
        break;
      case 'sos':
        Alert.alert('SOS Emergency', 'Emergency SOS signal sent to dispatch and emergency services.');
        break;
      case 'cancel':
        Alert.alert('Cancel Assignment', 'Are you sure you want to cancel this assignment?', [
          { text: 'No', style: 'cancel' },
          { text: 'Yes, Cancel', style: 'destructive', onPress: () => onGoBack() },
        ]);
        break;
      case 'help':
        Alert.alert('Support Helpline', `Connecting to Driver Helpline... ${name}`);
        break;
      case 'start_trip':
        Alert.alert('Trip Started', 'Trip has been started. Safe drive!', [
          { text: 'OK', onPress: () => onGoBack() },
        ]);
        break;
    }
  };

  const renderProgressTracker = () => {
    const stages = [
      { id: 0, label: 'Assigned', icon: 'check-circle' },
      { id: 1, label: 'Driving to Vehicle', icon: 'car-connected' },
      { id: 2, label: 'Vehicle Inspection', icon: 'clipboard-check' },
      { id: 3, label: 'Customer Verification', icon: 'account-check' },
      { id: 4, label: 'Trip Started', icon: 'flag-checkered' },
    ];

    return (
      <View style={styles.trackerContainer}>
        {stages.map((stage, idx) => {
          const isCompleted = idx < currentStage;
          const isActive = idx === currentStage;
          const showLine = idx < stages.length - 1;
          return (
            <React.Fragment key={stage.id}>
              <View style={styles.stageItem}>
                <View style={[styles.stageCircle, isCompleted && styles.circleCompleted, isActive && styles.circleActive]}>
                  {isCompleted ? (
                    <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                  ) : isActive ? (
                    <MaterialCommunityIcons name={stage.id === 1 ? 'car' : stage.id === 2 ? 'file-document' : stage.id === 3 ? 'account' : 'flag'} size={14} color="#FFF" />
                  ) : (
                    <MaterialCommunityIcons name={stage.id === 2 ? 'file-document-outline' : stage.id === 3 ? 'account-outline' : 'flag-outline'} size={14} color="#BDBDBD" />
                  )}
                </View>
                <Text numberOfLines={2} style={[styles.stageLabel, isActive && styles.stageLabelActive, isCompleted && styles.stageLabelCompleted]}>
                  {stage.label}
                </Text>
              </View>
              {showLine && <View style={[styles.stageLine, idx < currentStage ? styles.lineActive : styles.lineInactive]} />}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <>
      <NavBar onBackPress={onGoBack} />
      <CustomeBottomSheet useScrollView={true}>

        {/* Trip ID + Earnings header row */}
        <View style={styles.tripHeaderRow}>
          <Text style={styles.tripIdLabel}>Trip ID: {upComingTripDetails?.rideId || '-'}</Text>
          <View style={styles.earningsBadge}>
            <Feather name="trending-up" size={12} color="#4CAF50" style={{ marginRight: 4 }} />
            <Text style={styles.earningsLabel}>Earnings</Text>
            <Text style={styles.earningsValue}>₹{upComingTripDetails?.minFare || '0'}</Text>
          </View>
        </View>

        {/* Waiting for Advance Payment Banner */}
        {!isCustomerPaid && (
          <View style={styles.waitingBanner}>
            <View style={styles.waitingBannerLeft}>
              <View style={styles.waitingIconCircle}>
                <MaterialCommunityIcons name="clock-outline" size={22} color="#B45309" />
              </View>
              <View style={styles.waitingBannerInfo}>
                <Text style={styles.waitingBannerTitle}>Waiting for Customer Payment</Text>
                <Text style={styles.waitingBannerSub}>
                  Customer needs to pay the advance before you proceed.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.waitingRefreshBtn}
              onPress={refreshTripDetails}
              disabled={isRefreshing}
            >
              <MaterialCommunityIcons
                name={isRefreshing ? 'loading' : 'refresh'}
                size={18}
                color="#B45309"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Tracker */}
        {renderProgressTracker()}

        {/* Smart Arrival Card */}
        <View style={styles.arrivalCard}>
          <View style={styles.arrivalHeaderRow}>
            <View style={styles.arrivalIconCircle}>
              <MaterialCommunityIcons name="map-marker" size={20} color={currentStage >= 2 ? '#4CAF50' : '#299865'} />
            </View>
            <View style={styles.arrivalInfo}>
              <Text style={styles.arrivalSub}>{isArrived ? 'ARRIVED AT VEHICLE' : 'SMART ARRIVAL'}</Text>
              <Text style={styles.arrivalTitle}>
                {isArrived ? 'Complete the handover checklist.' : 'Please proceed to the vehicle.'}
              </Text>
              <Text style={styles.arrivalDesc}>
                {isArrived ? 'Perform inspection before passenger handover.' : 'Mark your arrival once you reach the vehicle.'}
              </Text>
            </View>
            {!isArrived && (
              <TouchableOpacity style={styles.markArrivalBtn} onPress={handleMarkArrival}>
                <Text style={styles.markArrivalText}>Mark Arrival</Text>
              </TouchableOpacity>
            )}
            {isArrived && currentStage === 3 && isPhotosApproved && (
              <TouchableOpacity style={[styles.markArrivalBtn, { backgroundColor: '#FF9800' }]} onPress={() => setShowOtpModal(true)}>
                <Text style={styles.markArrivalText}>Verify OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>VEHICLE INFORMATION</Text>
          </View>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleImageContainer}>
              <Image
                source={getVehicleImage(upComingTripDetails?.vehicleType || upComingTripDetails?.passangerVehicleType || upComingTripDetails?.passengerVehicleData?.type || upComingTripDetails?.vehicleData?.type)}
                style={styles.vehicleImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.vehicleDetails}>
              <View style={styles.regNoBadge}>
                <Text style={styles.regNoText}>{upComingTripDetails?.vehicleNumber || '-'}</Text>
              </View>
              <Text style={styles.vehicleModel}>{upComingTripDetails?.vehicleModel || '-'}</Text>
              <View style={styles.specsRow}>
                <View style={styles.specChip}>
                  <MaterialCommunityIcons name="palette" size={12} color="#757575" />
                  <Text style={styles.specText}>{upComingTripDetails?.vehicleColor || '-'}</Text>
                </View>
                <View style={styles.specChip}>
                  <MaterialCommunityIcons name="gas-station" size={12} color="#757575" />
                  <Text style={styles.specText}>
                    {upComingTripDetails?.fuelType?.replace(/_/g, ' ') || upComingTripDetails?.passengerVehicleData?.fuelType?.replace(/_/g, ' ') || upComingTripDetails?.vehicleData?.fuelType?.replace(/_/g, ' ') || '-'}
                  </Text>
                </View>
                <View style={styles.specChip}>
                  <MaterialCommunityIcons name="car" size={12} color="#757575" />
                  <Text style={styles.specText}>{upComingTripDetails?.vehicleType || '-'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.card}>
          <View style={styles.customerRow}>
            <View style={styles.avatarBackground}>
              <Feather name="user" size={24} color="#0F223C" />
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{upComingTripDetails?.bookingForName || '-'}</Text>
              {isCustomerPaid ? (
                <Text style={styles.customerPhone}>{upComingTripDetails?.bookingForPhone || '-'}</Text>
              ) : (
                <View style={styles.paymentPendingBadge}>
                  <MaterialCommunityIcons name="lock-outline" size={11} color="#B45309" />
                  <Text style={styles.paymentPendingText}>Payment Pending</Text>
                </View>
              )}
              <Text style={styles.customerStatus}>
                Status: <Text style={{ color: '#299865', fontFamily: Fonts.medium }}>{upComingTripDetails?.status || '-'}</Text>
              </Text>
            </View>
            {isCustomerPaid ? (
              <TouchableOpacity style={styles.iconButton} onPress={() => handleAction('call')}>
                <Feather name="phone" size={18} color="#299865" />
                <Text style={styles.iconButtonText}>Call</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.iconButton, { opacity: 0.35 }]}>
                <Feather name="phone" size={18} color="#9E9E9E" />
                <Text style={[styles.iconButtonText, { color: '#9E9E9E' }]}>Call</Text>
              </View>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 8 }}>
            <View style={styles.statChip}>
              <Feather name="map-pin" size={12} color="#0F223C" style={{ marginRight: 4 }} />
              <Text style={styles.statChipText}>
                {upComingTripDetails?.estimatedDistance ? `${parseFloat(upComingTripDetails.estimatedDistance).toFixed(1)} km` : '-'}
              </Text>
            </View>
            <View style={styles.statChip}>
              <Feather name="clock" size={12} color="#0F223C" style={{ marginRight: 4 }} />
              <Text style={styles.statChipText}>
                {upComingTripDetails?.estimatedDuration ? `ETA ${upComingTripDetails.estimatedDuration} mins` : '-'}
              </Text>
            </View>
            <View style={styles.statChip}>
              <MaterialCommunityIcons name="wallet-outline" size={12} color="#0F223C" style={{ marginRight: 4 }} />
              <Text style={styles.statChipText}>₹{upComingTripDetails?.minFare || '0'} Est.</Text>
            </View>
          </ScrollView>
        </View>

        {/* Trip Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="file-document-outline" size={18} color="#0F223C" style={{ marginRight: 6 }} />
              <Text style={styles.cardTitle}>TRIP DETAILS</Text>
            </View>
          </View>
          <View style={styles.routeContainer}>
            <View style={styles.routePoints}>
              <View style={styles.routeDotBlue} />
              <View style={styles.routeLine} />
              <View style={styles.routeDotRed} />
            </View>
            <View style={styles.routeDetails}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.routeLabel}>Pickup Location</Text>
                <Text style={styles.routeVal}>{upComingTripDetails?.stops?.[0]?.address || '-'}</Text>
              </View>
              <View style={{ marginTop: 12, flex: 1, marginRight: 8 }}>
                <Text style={styles.routeLabel}>Drop Location</Text>
                <Text style={styles.routeVal}>{upComingTripDetails?.stops?.[upComingTripDetails?.stops?.length - 1]?.address || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Itinerary Plan Card */}
        {(() => {
          const itinerary = upComingTripDetails?.actingDriverItinerary || {};
          const itineraryDates = Object.keys(itinerary).sort();
          const moreDaysCount = itineraryDates.length > 1 ? itineraryDates.length - 1 : 0;

          const renderDayBlock = (dateStr, isAdditional = false) => {
            const locations = itinerary[dateStr] || [];
            return (
              <View key={dateStr} style={[styles.itinDayBlock, isAdditional && { marginTop: 12, borderTopWidth: 1, borderColor: '#F5F6F8', paddingTop: 12 }]}>
                <View style={styles.itinDayHeader}>
                  <MaterialCommunityIcons name="calendar-today" size={13} color="#0F223C" />
                  <Text style={styles.itinDayLabel}>{formatDate(dateStr)}</Text>
                </View>
                {locations.map((loc, locIdx) => {
                  const isLast = locIdx === locations.length - 1;
                  return (
                    <View key={locIdx} style={styles.itinLocRow}>
                      <View style={styles.itinLineWrap}>
                        <View style={styles.itinDot} />
                        {!isLast && <View style={styles.itinLine} />}
                      </View>
                      <View style={styles.itinLocInfo}>
                        <Text style={styles.itinLocName}>{loc.name || '-'}</Text>
                        {loc.address ? <Text style={styles.itinLocAddr}>{loc.address}</Text> : null}
                        {loc.time ? <Text style={styles.itinLocTime}>{loc.time}</Text> : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          };

          return (
            <View style={styles.card}>
              <View style={styles.itinHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="map-marker-distance" size={18} color="#0F223C" style={{ marginRight: 6 }} />
                  <Text style={styles.cardTitle}>TRIP ITINERARY</Text>
                </View>
                {moreDaysCount > 0 && (
                  <TouchableOpacity style={styles.itinCollapseBtn} onPress={() => setItinExpanded(e => !e)} activeOpacity={0.7}>
                    <Text style={styles.itinCollapseBtnText}>{itinExpanded ? 'Show Less' : `+${moreDaysCount} More Day${moreDaysCount > 1 ? 's' : ''}`}</Text>
                    <MaterialCommunityIcons name={itinExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#0F223C" />
                  </TouchableOpacity>
                )}
              </View>
              {itineraryDates.length === 0 ? (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontFamily: Fonts.regular, color: '#757575' }}>No itinerary planned for this trip.</Text>
                </View>
              ) : (
                <>
                  {renderDayBlock(itineraryDates[0])}
                  {itinExpanded && itineraryDates.slice(1).map(dateStr => renderDayBlock(dateStr, true))}
                </>
              )}
            </View>
          );
        })()}

        {/* Driver Arrangements */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="shield-account-outline" size={18} color="#0F223C" style={{ marginRight: 6 }} />
              <Text style={styles.cardTitle}>DRIVER ARRANGEMENTS</Text>
            </View>
          </View>
          <View style={styles.arrangementsRow}>
            <View style={styles.arrTag}>
              <MaterialCommunityIcons name="bed-outline" size={16} color="#0F223C" />
              <Text style={styles.arrTagText}>{upComingTripDetails?.actingDriverAccommodation ? 'Accommodation Provided' : 'No Accommodation'}</Text>
            </View>
            <View style={styles.arrTag}>
              <MaterialCommunityIcons name="food-fork-drink" size={16} color="#0F223C" />
              <Text style={styles.arrTagText}>{upComingTripDetails?.actingDriverFood ? 'Food Allowance Included' : 'Food Not Included'}</Text>
            </View>
          </View>
        </View>

        {/* Special Requirements */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="alert-decagram-outline" size={18} color="#0F223C" style={{ marginRight: 6 }} />
              <Text style={styles.cardTitle}>SPECIAL REQUIREMENTS</Text>
            </View>
          </View>
          <View style={styles.arrangementsRow}>
            <View style={styles.arrTag}>
              <MaterialCommunityIcons name="speedometer" size={16} color="#0F223C" />
              <Text style={styles.arrTagText}>Max {upComingTripDetails?.actingDriverMaxSpeed || 80} km/h</Text>
            </View>
            {upComingTripDetails?.kidsOnBoard && (
              <View style={styles.arrTag}>
                <MaterialCommunityIcons name="baby-carriage" size={16} color="#0F223C" />
                <Text style={styles.arrTagText}>Kids on Board</Text>
              </View>
            )}
            {upComingTripDetails?.elderlyOnBoard && (
              <View style={styles.arrTag}>
                <MaterialCommunityIcons name="human-cane" size={16} color="#0F223C" />
                <Text style={styles.arrTagText}>Elderly on Board</Text>
              </View>
            )}
            {upComingTripDetails?.femaleOnly && (
              <View style={styles.arrTag}>
                <MaterialCommunityIcons name="gender-female" size={16} color="#0F223C" />
                <Text style={styles.arrTagText}>Female Passenger</Text>
              </View>
            )}
          </View>
          <View style={styles.specialReqNoteBox}>
            <Text style={styles.specialReqNoteTitle}>Other Requests</Text>
            <Text style={styles.specialReqNoteText}>{upComingTripDetails?.actingDriverOtherRequests || '-'}</Text>
          </View>
        </View>

        {/* Vehicle Handover Checklist */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>VEHICLE HANDOVER CHECKLIST</Text>
            {isPhotosApproved ? (
              <View style={styles.photosApprovedBadge}>
                <MaterialCommunityIcons name="shield-check" size={12} color="#fff" />
                <Text style={styles.photosApprovedBadgeText}>Approved</Text>
              </View>
            ) : isPhotosSent ? (
              <View style={styles.photosWaitingBadge}>
                <MaterialCommunityIcons name="clock-outline" size={12} color="#E65100" />
                <Text style={styles.photosWaitingBadgeText}>Pending</Text>
              </View>
            ) : (
              <Text style={styles.checklistStatusText}>{completedCount}/{CHECKLIST_ITEMS.length} Completed</Text>
            )}
          </View>

          {isPhotosApproved ? (
            /* Approved — tap to view read-only */
            <TouchableOpacity style={styles.approvedChecklistRow} onPress={() => setStackScreen('DriverVehiclePhotosScreen')} activeOpacity={0.8}>
              <View style={styles.approvedChecklistIcon}>
                <MaterialCommunityIcons name="image-multiple-outline" size={22} color="#43A047" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.approvedChecklistTitle}>Photos verified by customer</Text>
                <Text style={styles.approvedChecklistSub}>Tap to view uploaded photos</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#43A047" />
            </TouchableOpacity>
          ) : isPhotosSent ? (
            /* Waiting for customer approval */
            <TouchableOpacity style={styles.waitingChecklistRow} onPress={() => setStackScreen('DriverVehiclePhotosScreen')} activeOpacity={0.8}>
              <View style={styles.waitingChecklistIcon}>
                <MaterialCommunityIcons name="clock-outline" size={22} color="#E65100" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.waitingChecklistTitle}>Waiting for customer approval</Text>
                <Text style={styles.waitingChecklistSub}>Photos sent — customer is reviewing</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#E65100" />
            </TouchableOpacity>
          ) : (
            /* Normal upload checklist */
            <>
              <View style={styles.checklistGrid}>
                {CHECKLIST_ITEMS.map((item) => {
                  const isChecked = checklist[item.key];
                  return (
                    <TouchableOpacity key={item.key} style={[styles.checklistItem, isChecked && styles.checklistItemChecked]} onPress={toggleChecklistItem}>
                      <View style={[styles.checklistIconCircle, isChecked && styles.checklistIconCircleChecked]}>
                        <MaterialCommunityIcons name={item.icon} size={20} color={isChecked ? '#4CAF50' : '#757575'} />
                      </View>
                      <Text style={[styles.checklistLabel, isChecked && styles.checklistLabelChecked]}>{item.label}</Text>
                      {isChecked && (
                        <View style={styles.checkBadge}>
                          <MaterialCommunityIcons name="check" size={10} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.progressBarWrapper}>
                <Text style={styles.progressLabel}>{progressPercent}%</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Bottom padding so last card isn't hidden behind floating bar */}
        <View style={{ height: 100 }} />
      </CustomeBottomSheet>

      {/* Floating Action Bar */}
      <View style={styles.floatingBar}>
        <TouchableOpacity
          style={styles.floatingCancelBtn}
          onPress={() => handleAction('cancel')}
          activeOpacity={0.85}
        >
          <Feather name="x-circle" size={20} color="#EF4444" />
          <Text style={styles.floatingCancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.floatingSosBtn}
          onPress={() => handleAction('sos')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="alarm-light-outline" size={20} color="#FFF" />
          <Text style={styles.floatingSosBtnText}>SOS</Text>
        </TouchableOpacity>

        {currentStage === 4 ? (
          <TouchableOpacity
            style={[styles.floatingNavBtn, { backgroundColor: '#4CAF50' }]}
            onPress={handleStartTripAfterOTP}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="play-circle-outline" size={20} color="#FFF" />
            <Text style={styles.floatingNavBtnText}>Start Trip</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.floatingNavBtn}
            onPress={() => handleAction('navigate')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="navigation-variant" size={20} color="#FFF" />
            <View>
              <Text style={styles.floatingNavBtnText}>Navigate to Vehicle</Text>
              {(upComingTripDetails?.estimatedDistance || upComingTripDetails?.estimatedDuration) && (
                <Text style={styles.floatingNavBtnSub}>
                  {upComingTripDetails?.estimatedDistance ? `${parseFloat(upComingTripDetails.estimatedDistance).toFixed(1)} km` : ''}
                  {upComingTripDetails?.estimatedDistance && upComingTripDetails?.estimatedDuration ? ' • ' : ''}
                  {upComingTripDetails?.estimatedDuration ? `ETA ${upComingTripDetails.estimatedDuration} mins` : ''}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* OTP Verification */}
      <Modal visible={showOtpModal} transparent animationType="slide" onRequestClose={() => setShowOtpModal(false)}>
        <View style={styles.otpOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.otpSheet}>
              <View style={styles.otpHandle} />
              <Text style={styles.otpTitle}>Verify OTP</Text>
              <Text style={styles.otpSub}>Enter the 4-digit OTP provided by the customer</Text>
              <TextInput
                style={styles.otpInput}
                value={otpValue}
                onChangeText={setOtpValue}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="0000"
                placeholderTextColor="#BDBDBD"
              />
              <View style={styles.otpBtnRow}>
                <TouchableOpacity style={styles.otpCancelBtn} onPress={() => { setShowOtpModal(false); setOtpValue(''); }}>
                  <Text style={styles.otpCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.otpVerifyBtn, otpLoading && { opacity: 0.7 }]} onPress={handleVerifyOtp} disabled={otpLoading}>
                  {otpLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.otpVerifyBtnText}>Verify</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Navigation Choice Modal */}
      <Modal visible={showNavModal} transparent animationType="fade" onRequestClose={() => setShowNavModal(false)}>
        <View style={styles.navModalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setShowNavModal(false)} activeOpacity={1} />
          <View style={styles.navSheet}>
            <View style={styles.navSheetHandle} />
            <View style={styles.navSheetHeaderRow}>
              <Text style={styles.navSheetTitle}>Choose Navigation</Text>
              <TouchableOpacity onPress={() => setShowNavModal(false)} style={styles.navSheetCloseBtn}>
                <MaterialCommunityIcons name="close" size={20} color={Colors.grey_dark} />
              </TouchableOpacity>
            </View>
            <Text style={styles.navSheetSub}>Navigate to vehicle pickup location</Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  tripHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#E8ECEF',
  },
  tripIdLabel: {
    fontSize: 12,
    fontFamily: Fonts.semi_bold,
    color: '#0F223C',
  },
  earningsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4FBF7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2F6EC',
  },
  earningsLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#8E9A8F',
    marginRight: 4,
  },
  earningsValue: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#4CAF50',
  },

  // Progress Tracker
  trackerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  stageItem: {
    alignItems: 'center',
    width: 60,
  },
  stageCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  circleActive: { backgroundColor: '#4CAF50' },
  circleCompleted: { backgroundColor: '#4CAF50' },
  stageLabel: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 11,
  },
  stageLabelActive: { color: '#4CAF50', fontFamily: Fonts.semi_bold },
  stageLabelCompleted: { color: '#4CAF50' },
  stageLine: {
    flex: 1,
    height: 2,
    marginHorizontal: -12,
    marginTop: -16,
  },
  lineActive: { backgroundColor: '#4CAF50' },
  lineInactive: { backgroundColor: '#E0E0E0' },

  // Arrival Card
  arrivalCard: {
    backgroundColor: '#E2F6EC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C6EFE0',
  },
  arrivalHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  arrivalIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  arrivalInfo: { flex: 1 },
  arrivalSub: { fontSize: 10, fontFamily: Fonts.bold, color: '#299865', letterSpacing: 0.5 },
  arrivalTitle: { fontSize: 15, fontFamily: Fonts.semi_bold, color: '#0F223C', marginTop: 2 },
  arrivalDesc: { fontSize: 11, fontFamily: Fonts.regular, color: '#4F5E52', marginTop: 1 },
  markArrivalBtn: {
    backgroundColor: '#299865',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  markArrivalText: { fontSize: 12, fontFamily: Fonts.semi_bold, color: '#FFF' },

  // Cards
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F5F6F8',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 12, fontFamily: Fonts.bold, color: '#757575', letterSpacing: 0.5 },

  // Vehicle
  vehicleRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleImageContainer: {
    width: 110,
    height: 80,
    backgroundColor: '#FFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  vehicleImage: { width: 100, height: 80 },
  vehicleDetails: { flex: 1 },
  regNoBadge: {
    backgroundColor: '#F0F4F8',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#D0D9E0',
    marginBottom: 4,
  },
  regNoText: { fontSize: 12, fontFamily: Fonts.semi_bold, color: '#333' },
  vehicleModel: { fontSize: 12, fontFamily: Fonts.bold, color: '#0F223C', marginBottom: 6 },
  specsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  specText: { fontSize: 10, fontFamily: Fonts.medium, color: '#616161', marginLeft: 3 },

  // Customer
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 15, fontFamily: Fonts.semi_bold, color: '#0F223C' },
  customerPhone: { fontSize: 12, fontFamily: Fonts.regular, color: '#757575', marginTop: 2 },
  customerStatus: { fontSize: 11, fontFamily: Fonts.regular, color: '#757575', marginTop: 2 },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  iconButtonText: { fontSize: 8, fontFamily: Fonts.regular, color: '#757575', marginTop: 2 },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statChipText: { fontSize: 11, fontFamily: Fonts.medium, color: '#0F223C' },

  // Route
  routeContainer: { flexDirection: 'row', marginTop: 6 },
  routePoints: {
    alignItems: 'center',
    marginRight: 12,
    width: 12,
    paddingVertical: 4,
  },
  routeDotBlue: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#42A5F5' },
  routeLine: { width: 1, flex: 1, backgroundColor: '#BDBDBD', marginVertical: 4 },
  routeDotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6060' },
  routeDetails: { flex: 1 },
  routeLabel: { fontSize: 10, fontFamily: Fonts.medium, color: '#42A5F5' },
  routeVal: { fontSize: 13, fontFamily: Fonts.regular, color: '#333', marginTop: 2 },

  // Itinerary
  itinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F5F6F8',
    marginBottom: 12,
  },
  itinCollapseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  itinCollapseBtnText: { fontSize: 11, fontFamily: Fonts.medium, color: '#0F223C' },
  itinDayBlock: { marginBottom: 4 },
  itinDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
    marginBottom: 12,
  },
  itinDayLabel: { fontSize: 12, fontFamily: Fonts.semi_bold, color: '#0F223C' },
  itinLocRow: { flexDirection: 'row', marginBottom: 10 },
  itinLineWrap: { alignItems: 'center', marginRight: 12, width: 12, paddingVertical: 4 },
  itinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0F223C' },
  itinLine: { width: 1, flex: 1, backgroundColor: '#E0E0E0', marginTop: 4 },
  itinLocInfo: { flex: 1 },
  itinLocName: { fontSize: 13, fontFamily: Fonts.semi_bold, color: '#333' },
  itinLocAddr: { fontSize: 11, fontFamily: Fonts.regular, color: '#757575', marginTop: 2 },
  itinLocTime: { fontSize: 10, fontFamily: Fonts.bold, color: '#0F223C', marginTop: 2 },

  // Arrangements & Special Req
  arrangementsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  arrTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderWidth: 0.5,
    borderColor: '#D0D9E0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
  },
  arrTagText: { fontSize: 11, fontFamily: Fonts.medium, color: '#0F223C' },
  specialReqNoteBox: {
    backgroundColor: '#F9FAFC',
    borderLeftWidth: 3,
    borderColor: '#0F223C',
    borderRadius: 4,
    padding: 10,
    marginTop: 12,
  },
  specialReqNoteTitle: { fontSize: 11, fontFamily: Fonts.bold, color: '#757575', marginBottom: 4 },
  specialReqNoteText: { fontSize: 12, fontFamily: Fonts.regular, color: '#333', lineHeight: 16 },

  // Checklist
  checklistStatusText: { fontSize: 11, fontFamily: Fonts.medium, color: '#757575' },
  checklistGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  checklistItem: {
    width: '14%',
    paddingVertical: 10,
    paddingHorizontal: 1,
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  checklistItemChecked: { backgroundColor: '#F4FBF7', borderColor: '#C6EFE0' },
  checklistIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  checklistIconCircleChecked: { backgroundColor: '#FFF' },
  checklistLabel: { fontSize: 9, fontFamily: Fonts.medium, color: '#616161', textAlign: 'center' },
  checklistLabelChecked: { color: '#4CAF50', fontFamily: Fonts.semi_bold },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarWrapper: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  progressLabel: { fontSize: 11, fontFamily: Fonts.bold, color: '#757575', width: 36 },
  progressBarBg: { flex: 1, height: 6, backgroundColor: '#ECECEC', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 3 },

  // Photos approved badge (checklist header)
  photosApprovedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#43A047', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, gap: 3 },
  photosApprovedBadgeText: { fontSize: 11, fontFamily: Fonts.bold, color: '#fff' },

  // Photos waiting badge (checklist header)
  photosWaitingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, gap: 3 },
  photosWaitingBadgeText: { fontSize: 11, fontFamily: Fonts.bold, color: '#E65100' },

  // Approved checklist row
  approvedChecklistRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 4 },
  approvedChecklistIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  approvedChecklistTitle: { fontSize: 14, fontFamily: Fonts.bold, color: '#2E7D32' },
  approvedChecklistSub: { fontSize: 12, fontFamily: Fonts.regular, color: '#757575', marginTop: 1 },

  // Waiting checklist row
  waitingChecklistRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 4 },
  waitingChecklistIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' },
  waitingChecklistTitle: { fontSize: 14, fontFamily: Fonts.bold, color: '#E65100' },
  waitingChecklistSub: { fontSize: 12, fontFamily: Fonts.regular, color: '#757575', marginTop: 1 },

  // Floating Action Bar
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  floatingNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F223C',
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    elevation: 4,
    shadowColor: '#0F223C',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  floatingNavBtnText: { fontSize: 14, fontFamily: Fonts.bold, color: '#FFF', letterSpacing: 0.3 },
  floatingNavBtnSub: { fontSize: 10, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 1 },
  floatingCancelBtn: {
    width: 62,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: '#FFF',
    gap: 3,
  },
  floatingCancelBtnText: { fontSize: 9, fontFamily: Fonts.semi_bold, color: '#EF4444' },
  floatingSosBtn: {
    width: 62,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#DC2626',
    gap: 3,
    elevation: 4,
    shadowColor: '#DC2626',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  floatingSosBtnText: { fontSize: 9, fontFamily: Fonts.bold, color: '#FFF', letterSpacing: 0.5 },

  // OTP Modal
  otpOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  otpSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  otpHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 16 },
  otpTitle: { fontSize: 18, fontFamily: Fonts.bold, color: '#0F223C', marginBottom: 6 },
  otpSub: { fontSize: 13, fontFamily: Fonts.regular, color: '#757575', marginBottom: 20 },
  otpInput: { borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12, fontSize: 24, fontFamily: Fonts.bold, color: '#0F223C', textAlign: 'center', letterSpacing: 12, paddingVertical: 14, marginBottom: 24 },
  otpBtnRow: { flexDirection: 'row', gap: 12 },
  otpCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E0E0E0', alignItems: 'center' },
  otpCancelBtnText: { fontSize: 15, fontFamily: Fonts.semi_bold, color: '#757575' },
  otpVerifyBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#0F223C', alignItems: 'center' },
  otpVerifyBtnText: { fontSize: 15, fontFamily: Fonts.bold, color: '#FFF' },

  // Nav Choice Modal
  navModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  navSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
  },
  navSheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 4 },
  navSheetHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navSheetTitle: { fontSize: 16, fontFamily: Fonts.semi_bold, color: '#0F223C' },
  navSheetCloseBtn: { padding: 6, borderRadius: 20, backgroundColor: '#F0F4F8' },
  navSheetSub: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.grey_dark },
  navOptionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  navOptionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    gap: 6,
  },
  navOptionLabel: { fontSize: 14, fontFamily: Fonts.semi_bold, color: '#0F223C' },
  navOptionDesc: { fontSize: 11, fontFamily: Fonts.regular, color: Colors.grey_dark, textAlign: 'center' },

  // Waiting for payment banner
  waitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  waitingBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  waitingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingBannerInfo: { flex: 1 },
  waitingBannerTitle: {
    fontSize: 13,
    fontFamily: Fonts.semi_bold,
    color: '#92400E',
  },
  waitingBannerSub: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 15,
  },
  waitingRefreshBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FDE68A',
    marginLeft: 8,
  },

  // Payment pending badge inside customer card
  paymentPendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 0.5,
    borderColor: '#FDE68A',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 7,
    alignSelf: 'flex-start',
    marginTop: 3,
    gap: 4,
  },
  paymentPendingText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#B45309',
  },
});

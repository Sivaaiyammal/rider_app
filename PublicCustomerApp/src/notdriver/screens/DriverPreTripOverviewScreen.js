import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Linking,
  Modal,
  TextInput
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { Colors, Fonts } from '../../common/constants/constants';
import { useStackScreenStore } from '../../common/store/useStackScreenStore';
import useActingDriverMediaStore from '../store/useActingDriverMediaStore';
import { useTripAcceptStore } from '../store/useTripAcceptStore';

// 7 checklist items definition
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

const navigateToLocation = (locationArray, address) => {
  let url = '';
  if (locationArray && locationArray.length === 2) {
    const lng = locationArray[0];
    const lat = locationArray[1];
    url = `google.navigation:q=${lat},${lng}`;
  } else if (address) {
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  
  if (url) {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open maps on this device.');
    });
  }
};

export default function DriverPreTripOverviewScreen({ isVisible = true }) {
  const { goBack, setStackScreen } = useStackScreenStore();
  
  // Interactive States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [itinExpanded, setItinExpanded] = useState(false);

  // Connect to useActingDriverMediaStore
  const {
    preTripPhotos,
    dentPhotos,
    odometerPhoto,
    currentStage,
    setCurrentStage,
    isArrived,
    setIsArrived,
  } = useActingDriverMediaStore();

  const { upComingTripDetails } = useTripAcceptStore();

  // console.log("upComingTripDetails", upComingTripDetails)

  // We derive checklist from store:
  const checklist = {
    front: !!preTripPhotos.front,
    rear: !!preTripPhotos.rear,
    left: !!preTripPhotos.leftSide,
    right: !!preTripPhotos.rightSide,
    odometer: !!odometerPhoto,
    damage: dentPhotos.length > 0,
  };

  // Calculations
  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  // Trigger stage change when checklist changes
  useEffect(() => {
    if (completedCount === CHECKLIST_ITEMS.length && isArrived && currentStage === 2) {
      setCurrentStage(3);
      Alert.alert(
        'Checklist Completed',
        'Vehicle inspection complete. Please proceed to Customer Verification.'
      );
    }
  }, [completedCount, isArrived, currentStage]);

  const handleMarkArrival = () => {
    setIsArrived(true);
    setCurrentStage(2);
    Alert.alert(
      'Arrived at Vehicle',
      'Arrival marked. Please complete the Vehicle Handover Checklist.'
    );
  };

  const toggleChecklistItem = () => {
    if (!isArrived) {
      Alert.alert(
        'Action Required',
        'Please mark arrival first before inspecting the vehicle.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Mark Arrival', onPress: handleMarkArrival }
        ]
      );
      return;
    }
    // Navigate to DriverVehiclePhotosScreen
    setStackScreen('DriverVehiclePhotosScreen');
  };

  const handleVerifyOtp = () => {
    if (otpValue === '1234') {
      setShowOtpModal(false);
      setCurrentStage(4);
      Alert.alert(
        'Verification Success',
        'Customer verified successfully. You can now start the ride!'
      );
    } else {
      Alert.alert('Invalid OTP', 'Please enter 1234 for verification demo.');
    }
  };

  const handleAction = (type) => {
    const rawPhone = upComingTripDetails?.bookingForPhone || '+91 86674 40287';
    const cleanPhone = rawPhone.replace(/\s|-/g, '');
    const name = upComingTripDetails?.bookingForName || 'Sivakumar Murugan';

    switch (type) {
      case 'call':
        Linking.openURL(`tel:${cleanPhone}`);
        break;
      case 'whatsapp':
        Linking.openURL(`whatsapp://send?phone=${cleanPhone}`).catch(() => {
          Alert.alert('WhatsApp Not Installed', 'Could not open WhatsApp on this device.');
        });
        break;
      case 'chat':
        Alert.alert('Chat', `Opening chat with ${name}...`);
        break;
      case 'navigate': {
        const pickupLoc = upComingTripDetails?.pickupLocation;
        const lat = pickupLoc?.location ? pickupLoc.location[1] : 11.0183;
        const lng = pickupLoc?.location ? pickupLoc.location[0] : 76.9934;
        Linking.openURL(`google.navigation:q=${lat},${lng}`);
        break;
      }
      case 'sos':
        Alert.alert('SOS Emergency', 'Emergency SOS signal sent to dispatch and emergency services.');
        break;
      case 'cancel':
        Alert.alert(
          'Cancel Assignment',
          'Are you sure you want to cancel this assignment?',
          [
            { text: 'No', style: 'cancel' },
            { text: 'Yes, Cancel', style: 'destructive', onPress: () => goBack() }
          ]
        );
        break;
      case 'help':
        Alert.alert('Support Helpline', 'Connecting to Driver Helpline...');
        break;
      case 'start_trip':
        Alert.alert('Trip Started', 'Trip has been started. Safe drive!', [
          { text: 'OK', onPress: () => goBack() }
        ]);
        break;
    }
  };

  // Render progress tracker stages
  const renderProgressTracker = () => {
    const stages = [
      { id: 0, label: 'Assigned', icon: 'check-circle' },
      { id: 1, label: 'Driving to Vehicle', icon: 'car-connected' },
      { id: 2, label: 'Vehicle Inspection', icon: 'clipboard-check' },
      { id: 3, label: 'Customer Verification', icon: 'account-check' },
      { id: 4, label: 'Trip Started', icon: 'flag-checkered' }
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
                <View style={[
                  styles.stageCircle,
                  isCompleted && styles.circleCompleted,
                  isActive && styles.circleActive
                ]}>
                  {isCompleted ? (
                    <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                  ) : isActive ? (
                    <MaterialCommunityIcons name={stage.id === 1 ? 'car' : stage.id === 2 ? 'file-document' : stage.id === 3 ? 'account' : 'flag'} size={14} color="#FFF" />
                  ) : (
                    <MaterialCommunityIcons name={stage.id === 2 ? 'file-document-outline' : stage.id === 3 ? 'account-outline' : 'flag-outline'} size={14} color="#BDBDBD" />
                  )}
                </View>
                <Text numberOfLines={2} style={[
                  styles.stageLabel,
                  isActive && styles.stageLabelActive,
                  isCompleted && styles.stageLabelCompleted
                ]}>
                  {stage.label}
                </Text>
              </View>
              {showLine && (
                <View style={[
                  styles.stageLine,
                  idx < currentStage ? styles.lineActive : styles.lineInactive
                ]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={goBack}
      statusBarTranslucent={true}
    >
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={styles.sheetDismissArea} onPress={goBack} activeOpacity={1} />
        <View style={styles.bottomSheet}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.tripIdLabel}>Trip ID: {upComingTripDetails?.rideId || '-'}</Text>
        </View>
        <TouchableOpacity style={styles.earningsBadge}>
          <Feather name="trending-up" size={12} color="#4CAF50" style={{ marginRight: 4 }} />
          <Text style={styles.earningsLabel}>Earnings</Text>
          <Text style={styles.earningsValue}>₹{upComingTripDetails?.minFare || '850'}</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color="#9E9E9E" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress Tracker */}
        {renderProgressTracker()}

        {/* Proximity / Smart Arrival Card */}
        <View style={styles.arrivalCard}>
          <View style={styles.arrivalHeaderRow}>
            <View style={styles.arrivalIconCircle}>
              <MaterialCommunityIcons name="map-marker" size={20} color={currentStage >= 2 ? '#4CAF50' : '#299865'} />
            </View>
            <View style={styles.arrivalInfo}>
              <Text style={styles.arrivalSub}>{isArrived ? 'ARRIVED AT VEHICLE' : 'SMART ARRIVAL'}</Text>
              <Text style={styles.arrivalTitle}>
                {isArrived 
                  ? 'Complete the handover checklist.' 
                  : 'You are 150 meters away!'}
              </Text>
              <Text style={styles.arrivalDesc}>
                {isArrived 
                  ? 'Perform inspection before passenger handover.' 
                  : 'You are near the vehicle location.'}
              </Text>
            </View>
            {!isArrived && (
              <TouchableOpacity style={styles.markArrivalBtn} onPress={handleMarkArrival}>
                <Text style={styles.markArrivalText}>Mark Arrival</Text>
              </TouchableOpacity>
            )}
            {isArrived && currentStage === 3 && (
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
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9E9E9E" />
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
              {/* <Text style={styles.vehicleModel}>
                {upComingTripDetails?.vehicleBrand || 'Audi Q2'}
              </Text> */}
              <Text style={styles.vehicleModel}>
                {upComingTripDetails?.vehicleModel || '-'}
              </Text>
              
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
                  <MaterialCommunityIcons name="sine-wave" size={12} color="#757575" />
                  <Text style={styles.specText}>
                    {(() => {
                      const trans = upComingTripDetails?.transmission || upComingTripDetails?.passengerVehicleData?.transmission || upComingTripDetails?.vehicleData?.transmission;
                      if (Array.isArray(trans) && trans.length > 0) {
                        return trans[0].charAt(0).toUpperCase() + trans[0].slice(1).toLowerCase();
                      }
                      if (typeof trans === 'string' && trans.trim().length > 0) {
                        return trans.trim().charAt(0).toUpperCase() + trans.trim().slice(1).toLowerCase();
                      }
                      return '-';
                    })()}
                  </Text>
                </View>
                <View style={styles.specChip}>
                  <MaterialCommunityIcons name="car" size={12} color="#757575" />
                  <Text style={styles.specText}>
                    <Text style={styles.regNoText}>{upComingTripDetails?.vehicleType || '-'}</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>

          
        </View>

        {/* Customer Information */}
        <View style={styles.card}>
          <View style={styles.customerRow}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarBackground}>
                <Feather name="user" size={24} color="#0F223C" />
              </View>
            </View>
            
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{upComingTripDetails?.bookingForName || 'Sivakumar Murugan'}</Text>
              <Text style={styles.customerPhone}>{upComingTripDetails?.bookingForPhone || '+91 86674 40287'}  <Feather name="copy" size={12} color="#9E9E9E" /></Text>
              <Text style={styles.customerStatus}>Status: <Text style={{ color: '#299865', fontFamily: Fonts.medium }}>{upComingTripDetails?.status || 'pickedup'}</Text></Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleAction('call')}>
                <Feather name="phone" size={18} color="#299865" />
                <Text style={styles.iconButtonText}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.iconButton} onPress={() => handleAction('whatsapp')}>
                <MaterialCommunityIcons name="whatsapp" size={18} color="#299865" />
                <Text style={styles.iconButtonText}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton} onPress={() => handleAction('chat')}>
                <Feather name="message-square" size={18} color="#0F223C" />
                <Text style={styles.iconButtonText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Feather name="map-pin" size={12} color="#0F223C" style={{ marginRight: 4 }} />
              <Text style={styles.statChipText}>
                {upComingTripDetails?.estimatedDistance
                  ? `${parseFloat(upComingTripDetails.estimatedDistance).toFixed(1)} km away`
                  : '1.9 km away'}
              </Text>
            </View>
            <View style={styles.statChip}>
              <Feather name="clock" size={12} color="#0F223C" style={{ marginRight: 4 }} />
              <Text style={styles.statChipText}>
                {upComingTripDetails?.estimatedDuration
                  ? `ETA ${upComingTripDetails.estimatedDuration} mins`
                  : 'ETA 6 mins'}
              </Text>
            </View>
            <View style={styles.statChip}>
              <MaterialCommunityIcons name="wallet-outline" size={12} color="#0F223C" style={{ marginRight: 4 }} />
              <Text style={styles.statChipText}>₹{upComingTripDetails?.minFare || '850'} Est. Earnings</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#9E9E9E" style={{ marginLeft: 'auto' }} />
          </View>
        </View>

        {/* Pickup Instructions */}
        <View style={[styles.card, { backgroundColor: '#FFFDF9', borderColor: '#FFEAC2', borderWidth: 1 }]}>
          <View style={styles.instructionRow}>
            <View style={styles.lightbulbCircle}>
              <Feather name="alert-circle" size={18} color="#FF9800" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.instructionTitle}>PICKUP INSTRUCTIONS</Text>
              <Text style={styles.instructionText}>
                Customer will be waiting at Main Entrance.{"\n"}
                Vehicle parked in Basement B2. Security informed.
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#FF9800" />
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="file-document-outline" size={18} color="#0F223C" style={{ marginRight: 6 }} />
              <Text style={styles.cardTitle}>TRIP DETAILS</Text>
            </View>
            <TouchableOpacity style={styles.viewAddressBtn}>
              <Text style={styles.viewAddressTxt}>View Full Address</Text>
              <MaterialCommunityIcons name="chevron-right" size={14} color="#0F223C" />
            </TouchableOpacity>
          </View>
          <View style={styles.routeContainer}>
            <View style={styles.routePoints}>
              <View style={styles.routeDotBlue} />
              <View style={styles.routeLine} />
              <View style={styles.routeDotRed} />
            </View>
            
            <View style={styles.routeDetails}>
              <View style={[styles.routeCellText, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.routeLabel}>Pickup Location</Text>
                  <Text style={styles.routeVal}>{upComingTripDetails?.stops?.[0]?.address || '-'}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    const stop = upComingTripDetails?.stops?.[0];
                    navigateToLocation(stop?.location, stop?.address || stop?.name);
                  }}
                  style={{ padding: 6 }}
                >
                  <MaterialCommunityIcons name="navigation-variant" size={20} color="#0F223C" />
                </TouchableOpacity>
              </View>
              
              <View style={[styles.routeCellText, { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.routeLabel}>Drop Location</Text>
                  <Text style={styles.routeVal}>{upComingTripDetails?.stops?.[upComingTripDetails?.stops?.length - 1]?.address || '-'}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    const stops = upComingTripDetails?.stops || [];
                    const stop = stops[stops.length - 1];
                    navigateToLocation(stop?.location, stop?.address || stop?.name);
                  }}
                  style={{ padding: 6 }}
                >
                  <MaterialCommunityIcons name="navigation-variant" size={20} color="#0F223C" />
                </TouchableOpacity>
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
              <View 
                key={dateStr} 
                style={[
                  styles.itinDayBlock, 
                  isAdditional && { marginTop: 12, borderTopWidth: 1, borderColor: '#F5F6F8', paddingTop: 12 }
                ]}
              >
                <View style={styles.itinDayHeader}>
                  <MaterialCommunityIcons name="calendar-today" size={13} color="#0F223C" />
                  <Text style={styles.itinDayLabel}>{formatDate(dateStr)}</Text>
                </View>
                {locations.map((loc, locIdx) => {
                  const isLast = locIdx === locations.length - 1;
                  return (
                    <View key={locIdx} style={[styles.itinLocRow, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                      <View style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start' }}>
                        <View style={styles.itinLineWrap}>
                          <View style={styles.itinDot} />
                          {!isLast && <View style={styles.itinLine} />}
                        </View>
                        <View style={[styles.itinLocInfo, { flex: 1, marginRight: 8 }]}>
                          <Text style={styles.itinLocName}>{loc.name || '-'}</Text>
                          {loc.address ? <Text style={styles.itinLocAddr}>{loc.address}</Text> : null}
                          {loc.time ? <Text style={styles.itinLocTime}>{loc.time}</Text> : null}
                        </View>
                      </View>
                      <TouchableOpacity 
                        onPress={() => navigateToLocation(loc.location, loc.address || loc.name)}
                        style={{ padding: 6 }}
                      >
                        <MaterialCommunityIcons name="navigation-variant" size={20} color="#0F223C" />
                      </TouchableOpacity>
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
                  <TouchableOpacity
                    style={styles.itinCollapseBtn}
                    onPress={() => setItinExpanded(e => !e)}
                    activeOpacity={0.7}>
                    <Text style={styles.itinCollapseBtnText}>
                      {itinExpanded ? 'Show Less' : `+${moreDaysCount} More Day${moreDaysCount > 1 ? 's' : ''}`}
                    </Text>
                    <MaterialCommunityIcons
                      name={itinExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#0F223C"
                    />
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

        {/* Driver Arrangements Card */}
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
              <Text style={styles.arrTagText}>
                {upComingTripDetails?.actingDriverAccommodation ? 'Accommodation Provided' : 'No Accommodation'}
              </Text>
            </View>
            <View style={styles.arrTag}>
              <MaterialCommunityIcons name="food-fork-drink" size={16} color="#0F223C" />
              <Text style={styles.arrTagText}>
                {upComingTripDetails?.actingDriverFood ? 'Food Allowance Included' : 'Food Not Included'}
              </Text>
            </View>
          </View>
        </View>

        {/* Special Requirements Card */}
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
            {upComingTripDetails?.kidsOnBoard ? (
              <View style={styles.arrTag}>
                <MaterialCommunityIcons name="baby-carriage" size={16} color="#0F223C" />
                <Text style={styles.arrTagText}>Kids on Board</Text>
              </View>
            ) : null}
            {upComingTripDetails?.elderlyOnBoard ? (
              <View style={styles.arrTag}>
                <MaterialCommunityIcons name="human-cane" size={16} color="#0F223C" />
                <Text style={styles.arrTagText}>Elderly on Board</Text>
              </View>
            ) : null}
            {upComingTripDetails?.femaleOnly ? (
              <View style={styles.arrTag}>
                <MaterialCommunityIcons name="gender-female" size={16} color="#0F223C" />
                <Text style={styles.arrTagText}>Female Passenger</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.specialReqNoteBox}>
            <Text style={styles.specialReqNoteTitle}>Other Requests</Text>
            <Text style={styles.specialReqNoteText}>
              Please drive slowly on speed bumps. The elderly passenger has back issues.
            </Text>
          </View>
        </View>

        {/* Vehicle Handover Checklist */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>VEHICLE HANDOVER CHECKLIST</Text>
            <Text style={styles.checklistStatusText}>{completedCount}/{CHECKLIST_ITEMS.length} Completed</Text>
          </View>

          <View style={styles.checklistGrid}>
            {CHECKLIST_ITEMS.map((item) => {
              const isChecked = checklist[item.key];
              return (
                <TouchableOpacity 
                  key={item.key} 
                  style={[styles.checklistItem, isChecked && styles.checklistItemChecked]} 
                  onPress={toggleChecklistItem}
                >
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

          {/* Checklist Custom Progress Bar */}
          <View style={styles.progressBarWrapper}>
            <Text style={styles.progressLabel}>{progressPercent}%</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fabSupport} onPress={() => handleAction('help')}>
        <MaterialCommunityIcons name="headset" size={22} color="#FFF" />
        <Text style={styles.fabText}>Need{"\n"}Help?</Text>
      </TouchableOpacity>

      {/* Footer Navigation Bar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.sosButton} onPress={() => handleAction('sos')}>
          <View style={styles.sosCircle}>
            <Text style={styles.sosText}>SOS</Text>
          </View>
          <Text style={styles.sosLabel}>SOS</Text>
        </TouchableOpacity>

        {currentStage === 4 ? (
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#4CAF50' }]} onPress={() => handleAction('start_trip')}>
            <MaterialCommunityIcons name="play-circle-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryButtonText}>Start Trip</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={() => handleAction('navigate')}>
            <MaterialCommunityIcons name="navigation-variant" size={20} color="#FFF" style={{ marginRight: 6 }} />
            <View>
              <Text style={styles.primaryButtonText}>Navigate to Vehicle</Text>
              <Text style={styles.primaryButtonSub}>1.9 km • ETA 6 mins</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelButton} onPress={() => handleAction('cancel')}>
          <Text style={styles.cancelButtonText}>Cancel Ride</Text>
        </TouchableOpacity>
      </View>

      {/* OTP verification Modal */}
      <Modal visible={showOtpModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Customer Verification</Text>
            <Text style={styles.modalSubtitle}>Please ask passenger for the OTP. Enter 1234 to proceed.</Text>
            
            <TextInput
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="0000"
              placeholderTextColor="#9E9E9E"
              value={otpValue}
              onChangeText={setOtpValue}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowOtpModal(false)}>
                <Text style={styles.modalCancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalVerifyBtn} onPress={handleVerifyOtp}>
                <Text style={styles.modalVerifyBtnTxt}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
        </View>
      </View>
    </Modal>
  );
}

DriverPreTripOverviewScreen.propTypes = {
  isVisible: PropTypes.bool,
};

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetDismissArea: {
    height: '8%',
  },
  bottomSheet: {
    backgroundColor: '#F7F8FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    overflow: 'hidden',
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E0E0E0',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#E8ECEF',
  },
  backButton: {
    padding: 6,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
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
  scrollContent: {
    padding: 16,
  },
  
  // Progress Tracker styles
  trackerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
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
  circleActive: {
    backgroundColor: '#4CAF50',
  },
  circleCompleted: {
    backgroundColor: '#4CAF50',
  },
  stageLabel: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 11,
  },
  stageLabelActive: {
    color: '#4CAF50',
    fontFamily: Fonts.semi_bold,
  },
  stageLabelCompleted: {
    color: '#4CAF50',
  },
  stageLine: {
    flex: 1,
    height: 2,
    marginHorizontal: -12,
    marginTop: -16,
  },
  lineActive: {
    backgroundColor: '#4CAF50',
  },
  lineInactive: {
    backgroundColor: '#E0E0E0',
  },

  // Proximity/Arrival Banner
  arrivalCard: {
    backgroundColor: '#E2F6EC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C6EFE0',
  },
  arrivalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrivalIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  arrivalInfo: {
    flex: 1,
  },
  arrivalSub: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#299865',
    letterSpacing: 0.5,
  },
  arrivalTitle: {
    fontSize: 15,
    fontFamily: Fonts.semi_bold,
    color: '#0F223C',
    marginTop: 2,
  },
  arrivalDesc: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#4F5E52',
    marginTop: 1,
  },
  markArrivalBtn: {
    backgroundColor: '#299865',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  markArrivalText: {
    fontSize: 12,
    fontFamily: Fonts.semi_bold,
    color: '#FFF',
  },

  // Standard Card Styling
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
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
  cardTitle: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#757575',
    letterSpacing: 0.5,
  },
  
  // Vehicle Row
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleImageContainer: {
    width: 110,
    height: 80,
    backgroundColor: '#ffffffff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  vehicleImage: {
    width: 100,
    height: 80,
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoCountText: {
    fontSize: 9,
    color: '#FFF',
    fontFamily: Fonts.medium,
  },
  vehicleDetails: {
    flex: 1,
  },
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
  regNoText: {
    fontSize: 12,
    fontFamily: Fonts.semi_bold,
    color: '#333',
  },
  vehicleModel: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#0F223C',
    marginBottom: 6,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
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
  specText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#616161',
    marginLeft: 3,
  },
  locationNotesRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#F5F6F8',
    marginTop: 16,
    paddingTop: 12,
  },
  noteCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  noteIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  noteLabel: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#757575',
  },
  noteValue: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#333',
    marginTop: 1,
  },

  // Customer Row Styles
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontFamily: Fonts.semi_bold,
    color: '#0F223C',
  },
  customerPhone: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#757575',
    marginTop: 2,
  },
  customerStatus: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#757575',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
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
  iconButtonText: {
    fontSize: 8,
    fontFamily: Fonts.regular,
    color: '#757575',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#F5F6F8',
    marginTop: 16,
    paddingTop: 12,
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statChipText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#0F223C',
  },

  // Instruction row
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lightbulbCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructionTitle: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#FF9800',
    letterSpacing: 0.5,
  },
  instructionText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#665D4D',
    marginTop: 2,
    lineHeight: 16,
  },

  // Trip details
  viewAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAddressTxt: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#0F223C',
    marginRight: 2,
  },
  routeContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  routePoints: {
    alignItems: 'center',
    marginRight: 12,
    width: 12,
    paddingVertical: 4,
  },
  routeDotBlue: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#42A5F5',
  },
  routeLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#BDBDBD',
    marginVertical: 4,
    borderStyle: 'dashed',
  },
  routeDotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6060',
  },
  routeDetails: {
    flex: 1,
  },
  routeCellText: {
    justifyContent: 'center',
  },
  routeLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#42A5F5',
  },
  routeVal: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#333',
    marginTop: 2,
  },

  // Handover checklist
  checklistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  checklistItem: {
    width: '14%',
    // backgroundColor: '#FAFAFA',
    // borderWidth: 1,
    // borderColor: '#E0E0E0',
    // borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 1,
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  checklistItemChecked: {
    backgroundColor: '#F4FBF7',
    borderColor: '#C6EFE0',
  },
  checklistIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  checklistIconCircleChecked: {
    backgroundColor: '#FFF',
  },
  checklistLabel: {
    fontSize: 9,
    fontFamily: Fonts.medium,
    color: '#616161',
    textAlign: 'center',
  },
  checklistLabelChecked: {
    color: '#4CAF50',
    fontFamily: Fonts.semi_bold,
  },
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
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: '#757575',
    width: 36,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#ECECEC',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },

  // Floating Support
  fabSupport: {
    position: 'absolute',
    right: 16,
    bottom: 110,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F223C',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: {
    fontSize: 8,
    fontFamily: Fonts.bold,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 9,
  },

  // Footer Actions
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: '#E8ECEF',
  },
  sosButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  sosCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FF6060',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
  },
  sosText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#FF6060',
  },
  sosLabel: {
    fontSize: 8,
    fontFamily: Fonts.bold,
    color: '#FF6060',
    marginTop: 2,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F223C',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 12,
    height: 44,
  },
  primaryButtonText: {
    fontSize: 13,
    fontFamily: Fonts.semi_bold,
    color: '#FFF',
    textAlign: 'center',
  },
  primaryButtonSub: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 1,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#FF6060',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  cancelButtonText: {
    fontSize: 11,
    fontFamily: Fonts.semi_bold,
    color: '#FF6060',
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#0F223C',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#0F223C',
    textAlign: 'center',
    width: 120,
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelBtnTxt: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#666',
  },
  modalVerifyBtn: {
    flex: 1,
    backgroundColor: '#299865',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalVerifyBtnTxt: {
    fontSize: 14,
    fontFamily: Fonts.semi_bold,
    color: '#FFF',
  },

  // New Cards Styles
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
  itinCollapseBtnText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#0F223C',
  },
  itinDayBlock: {
    marginBottom: 4,
  },
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
  itinDayLabel: {
    fontSize: 12,
    fontFamily: Fonts.semi_bold,
    color: '#0F223C',
  },
  itinLocRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  itinLineWrap: {
    alignItems: 'center',
    marginRight: 12,
    width: 12,
    paddingVertical: 4,
  },
  itinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F223C',
  },
  itinLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  itinLocInfo: {
    flex: 1,
  },
  itinLocName: {
    fontSize: 13,
    fontFamily: Fonts.semi_bold,
    color: '#333',
  },
  itinLocAddr: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#757575',
    marginTop: 2,
  },
  itinLocTime: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#0F223C',
    marginTop: 2,
  },
  arrangementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
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
  arrTagText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#0F223C',
  },
  specialReqNoteBox: {
    backgroundColor: '#F9FAFC',
    borderLeftWidth: 3,
    borderColor: '#0F223C',
    borderRadius: 4,
    padding: 10,
    marginTop: 12,
  },
  specialReqNoteTitle: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: '#757575',
    marginBottom: 4,
  },
  specialReqNoteText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#333',
    lineHeight: 16,
  },
});

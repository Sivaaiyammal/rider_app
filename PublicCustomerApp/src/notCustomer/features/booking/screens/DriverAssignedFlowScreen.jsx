import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated, Image, ActivityIndicator, Alert } from 'react-native';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import AdaptiveText from '../../../components/Common/AdaptiveText';
import { colors, Fonts } from '../../../constants/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useCurrentRideInfoStore from '../../rideStatus/store/useCurrentRideInfoStore';
import useAssignedDriverInfoStore from '../../rideStatus/store/useAssignedDriverInfoStore';
import VehicleDriverPreview from '../../../components/Common/VehicleDriverPreview';
import BottomSheetWrapper from '../../../components/BottomSheetWrapper';
import LinearGradient from 'react-native-linear-gradient';
import { utils } from '../../../utils/Utils';
import { cancelRide, approveVehiclePhotos } from '../../../API/EndPoints/EndPoints';

const DriverAssignedFlowScreen = ({ route }) => {
  const { setStackScreen, reset } = useStackScreenStore();
  const [step, setStep] = useState(1);
  const { currentRideInfo, resetCurrentRideInfo } = useCurrentRideInfoStore();
  const assignedDriverInfo = useAssignedDriverInfoStore();
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const isApproved = currentRideInfo?.bills?.vehiclePhotosApproved;
    const hasPhotos = currentRideInfo?.bills?.preTripVehiclePhotos;
    if (hasPhotos && !isApproved && step < 5) {
      setStep(5);
    } else if (isApproved && step < 6) {
      setStep(6);
    }
  }, [currentRideInfo?.bills, step]);

  useEffect(() => {
    if (currentRideInfo?.status === 'PICKEDUP' || currentRideInfo?.status === 'STARTED') {
      setStackScreen('CustomerliveTracking', {});
    }
  }, [currentRideInfo?.status]);

  const handlePhotoApproval = async (approvalStatus) => {
    try {
      setIsApproving(true);
      const tripId = currentRideInfo?._id;
      if (tripId) {
        await approveVehiclePhotos(tripId, approvalStatus);
        if (approvalStatus === 'rejected') {
          Alert.alert('Photos Rejected', 'Driver has been notified to retake the photos.');
          setStep(4); // Go back to waiting step
        }
      }
    } catch (error) {
      console.error('Error approving photos:', error);
      Alert.alert('Error', 'Failed to submit approval.');
    } finally {
      setIsApproving(false);
    }
  };
  const driverName = assignedDriverInfo?.driverName || currentRideInfo?.driverId?.name || 'Driver';
  const driverRating = assignedDriverInfo?.rating || currentRideInfo?.driverId?.ratingData?.rating || '4.8';
  const driverPhoto = assignedDriverInfo?.driverPhoto || currentRideInfo?.driverId?.photo || null;
  const vehicleType = assignedDriverInfo?.vehicleType || currentRideInfo?.vehicleType || 'AUTO';
  const vehicleName = assignedDriverInfo?.model || currentRideInfo?.vehicleId?.model || 'Vehicle';
  const vehicleNumber = assignedDriverInfo?.vehicleNumber || currentRideInfo?.vehicleId?.regNo || '';

  const pickupLocation = currentRideInfo?.stops?.[0]?.address || currentRideInfo?.from?.address || 'Pickup Location';
  const dropLocation = currentRideInfo?.stops?.[currentRideInfo?.stops?.length - 1]?.address || currentRideInfo?.to?.address || 'Drop Location';
  const bookingType = currentRideInfo?.duration === 'Multiple Days' ? 'Multiple Days' : (currentRideInfo?.actingDriverHours ? `Hourly (${currentRideInfo?.actingDriverHours} hrs)` : 'Full Day');

  const confirmationAmount = 30; // Dummy

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      reset();
    }
  };

  const handleReject = async () => {
    try {
      setIsRejecting(true);
      const tripId = currentRideInfo?._id;
      if (tripId) {
        await cancelRide({
          tripId,
          reason: 'Passenger rejected assigned driver',
          isNotyetPickedUp: true
        });
      }
      resetCurrentRideInfo();
      reset();
    } catch (error) {
      console.error(error);
      setIsRejecting(false);
    }
  };

  console.log("currentRideInfo",assignedDriverInfo)

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <AdaptiveText style={styles.headerTitle}>Driver Assigned!</AdaptiveText>
      <AdaptiveText style={styles.headerSub}>Your acting driver is confirmed.</AdaptiveText>

      <View style={styles.card}>
        <View style={styles.driverRow}>

          <Image source={{ uri: driverPhoto }} style={styles.driverImg} />
          <View style={styles.driverInfo}>
            <AdaptiveText style={styles.driverName}>{driverName}</AdaptiveText>
            <AdaptiveText style={styles.driverMeta}>⭐ {driverRating} • Experienced</AdaptiveText>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={20} color="#4b48ab" />
          </TouchableOpacity>
        </View>

        {/* <View style={styles.vehicleRow}>
          <AdaptiveText style={styles.vehicleText}>{vehicleName} • {vehicleNumber}</AdaptiveText>
        </View> */}

        <View style={styles.locationRow}>
          <Ionicons name="location" size={20} color="#4b48ab" />
          <View style={styles.locationTextWrap}>
            <AdaptiveText style={styles.locationLabel}>Pickup Location</AdaptiveText>
            <AdaptiveText style={styles.locationValue} numberOfLines={2}>{pickupLocation}</AdaptiveText>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="time" size={20} color="#4b48ab" />
          <View style={styles.locationTextWrap}>
            <AdaptiveText style={styles.locationLabel}>Booking Type</AdaptiveText>
            <AdaptiveText style={styles.locationValue}>{bookingType}</AdaptiveText>
          </View>
        </View>
      </View>


      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.rejectButton} onPress={handleReject} disabled={isRejecting}>
          {isRejecting ? <ActivityIndicator color="#e53935" /> : <AdaptiveText style={styles.rejectButtonText}>Reject</AdaptiveText>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={handleNext} disabled={isRejecting}>
          <AdaptiveText style={styles.primaryButtonText}>Continue</AdaptiveText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <AdaptiveText style={styles.headerTitle}>Confirm Your Booking</AdaptiveText>
      <AdaptiveText style={styles.headerSub}>Pay a confirmation amount to proceed.</AdaptiveText>

      <View style={styles.card}>
        <AdaptiveText style={styles.sectionTitle}>Booking Summary</AdaptiveText>
        <AdaptiveText style={styles.summaryText}>{vehicleName} • {vehicleNumber}</AdaptiveText>
        <AdaptiveText style={styles.summaryText}>{bookingType}</AdaptiveText>
        <AdaptiveText style={styles.summaryText} numberOfLines={2}>{pickupLocation}</AdaptiveText>
      </View>

      <View style={styles.card}>
        <AdaptiveText style={styles.sectionTitle}>Confirmation Amount</AdaptiveText>
        <AdaptiveText style={styles.amountText}>₹{confirmationAmount}</AdaptiveText>
        <AdaptiveText style={styles.summaryText}>This amount will be adjusted in final bill.</AdaptiveText>
      </View>

      <View style={styles.card}>
        <AdaptiveText style={styles.sectionTitle}>Payment Methods</AdaptiveText>
        <View style={styles.paymentMethod}>
          <AdaptiveText style={styles.paymentText}>Online</AdaptiveText>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </View>
      </View>


      <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
        <AdaptiveText style={styles.primaryButtonText}>Pay ₹{confirmationAmount}</AdaptiveText>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={[styles.stepContainer, { alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: 40 }]}>
      <View style={styles.successCircle}>
        <Ionicons name="checkmark" size={60} color="#fff" />
      </View>
      <AdaptiveText style={styles.successTitle}>Payment Successful!</AdaptiveText>
      <AdaptiveText style={styles.successSub}>Your booking is confirmed.</AdaptiveText>

      <View style={[styles.card, { width: '100%', marginTop: 20 }]}>
        <View style={styles.driverRow}>
          <Image source={{ uri: driverPhoto }} style={styles.driverImg} />
          <View style={styles.driverInfo}>
            <AdaptiveText style={styles.driverName}>{driverName}</AdaptiveText>
            <AdaptiveText style={styles.driverMeta}>⭐ {driverRating}</AdaptiveText>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButtonOutline} onPress={handleNext}>
        <AdaptiveText style={styles.primaryButtonOutlineText}>View Booking Details</AdaptiveText>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => reset()} style={{ marginTop: 20 }}>
        <AdaptiveText style={{ color: '#4b48ab', fontFamily: Fonts.medium }}>Go to Home</AdaptiveText>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity style={styles.backBtn} onPress={() => setStep(3)}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <AdaptiveText style={styles.headerTitle}>Booking Details</AdaptiveText>

      <View style={styles.card}>
        <View style={styles.driverRow}>
          <Image source={{ uri: driverPhoto }} style={styles.driverImg} />
          <View style={styles.driverInfo}>
            <AdaptiveText style={styles.driverName}>{driverName}</AdaptiveText>
            <AdaptiveText style={styles.driverMeta}>⭐ {driverRating}</AdaptiveText>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={20} color="#4b48ab" />
          </TouchableOpacity>
        </View>
        <AdaptiveText style={styles.vehicleText}>{vehicleName} • {vehicleNumber}</AdaptiveText>
      </View>

      <View style={styles.card}>
        <AdaptiveText style={styles.sectionTitle}>Booking Information</AdaptiveText>
        <View style={styles.infoRow}>
          <AdaptiveText style={styles.infoLabel}>Booking Type</AdaptiveText>
          <AdaptiveText style={styles.infoValue}>{bookingType}</AdaptiveText>
        </View>
        <View style={styles.infoRow}>
          <AdaptiveText style={styles.infoLabel}>Date & Time</AdaptiveText>
          <AdaptiveText style={styles.infoValue}>
            {currentRideInfo?.scheduleDateTime ? utils.formatScheduleDateTimeLabel(currentRideInfo.scheduleDateTime) : 'Now'}
          </AdaptiveText>
        </View>
        <View style={styles.infoRow}>
          <AdaptiveText style={styles.infoLabel}>Pickup</AdaptiveText>
          <AdaptiveText style={styles.infoValue} numberOfLines={2}>{pickupLocation}</AdaptiveText>
        </View>
        <View style={styles.infoRow}>
          <AdaptiveText style={styles.infoLabel}>Drop</AdaptiveText>
          <AdaptiveText style={styles.infoValue} numberOfLines={2}>{dropLocation}</AdaptiveText>
        </View>
      </View>

      <View style={styles.card}>
        <AdaptiveText style={styles.sectionTitle}>Payment Info</AdaptiveText>
        <View style={styles.infoRow}>
          <AdaptiveText style={styles.infoLabel}>Paid (Confirmation)</AdaptiveText>
          <AdaptiveText style={styles.infoValue}>₹{confirmationAmount}</AdaptiveText>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: '#f0f4ff', borderColor: '#4b48ab', borderWidth: 1 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ActivityIndicator color="#4b48ab" style={{ marginRight: 10 }} />
          <AdaptiveText style={[styles.summaryText, { color: '#4b48ab', fontFamily: Fonts.semi_bold, flex: 1 }]}>
            Waiting for driver to arrive and upload vehicle condition photos...
          </AdaptiveText>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => reset()}>
        <AdaptiveText style={styles.primaryButtonText}>Go to Home</AdaptiveText>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </View>
  );

  const renderStep5 = () => {
    const preTripPhotos = currentRideInfo?.bills?.preTripVehiclePhotos;
    const dentPhotos = currentRideInfo?.bills?.dentPhotos || [];
    const odometerPhoto = currentRideInfo?.bills?.odometerPhoto;

    return (
      <View style={[styles.stepContainer, { paddingBottom: 80 }]}>
        <AdaptiveText style={styles.headerTitle}>Vehicle Condition Photos</AdaptiveText>
        <AdaptiveText style={styles.headerSub}>Your driver has uploaded the vehicle photos. Please review and confirm.</AdaptiveText>
        
        <ScrollView style={{ flex: 1, marginTop: 10 }} showsVerticalScrollIndicator={false}>
          {preTripPhotos && (
            <View style={styles.card}>
              <AdaptiveText style={styles.sectionTitle}>Pre-Trip Photos</AdaptiveText>
              <View style={styles.photoGrid}>
                {Object.values(preTripPhotos).filter(Boolean).map((photo, index) => (
                  <Image key={`pre_${index}`} source={{ uri: photo }} style={styles.previewImage} />
                ))}
              </View>
            </View>
          )}

          {dentPhotos.length > 0 && (
            <View style={styles.card}>
              <AdaptiveText style={styles.sectionTitle}>Dent Photos</AdaptiveText>
              <View style={styles.photoGrid}>
                {dentPhotos.map((photo, index) => (
                  <Image key={`dent_${index}`} source={{ uri: photo }} style={styles.previewImage} />
                ))}
              </View>
            </View>
          )}

          {odometerPhoto && (
            <View style={styles.card}>
              <AdaptiveText style={styles.sectionTitle}>Odometer Photo</AdaptiveText>
              <Image source={{ uri: odometerPhoto }} style={[styles.previewImage, { width: '100%', height: 150 }]} />
            </View>
          )}
        </ScrollView>

        <View style={[styles.actionRow, { position: 'absolute', bottom: 10, left: 20, right: 20 }]}>
          <TouchableOpacity style={styles.rejectButton} onPress={() => handlePhotoApproval('rejected')} disabled={isApproving}>
            {isApproving ? <ActivityIndicator color="#e53935" /> : <AdaptiveText style={styles.rejectButtonText}>Retake Photos</AdaptiveText>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.continueButton} onPress={() => handlePhotoApproval('approved')} disabled={isApproving}>
            {isApproving ? <ActivityIndicator color="#fff" /> : <AdaptiveText style={styles.primaryButtonText}>Approve Photos</AdaptiveText>}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStep6 = () => {
    const otpParts = currentRideInfo?.otp?.split('') || ['-', '-', '-', '-'];
    
    return (
      <View style={[styles.stepContainer, { alignItems: 'center' }]}>
        <AdaptiveText style={[styles.headerTitle, { marginTop: 20 }]}>Share this OTP with your driver</AdaptiveText>
        
        <View style={styles.otpContainer}>
          {otpParts.map((char, index) => (
            <View key={index} style={styles.otpBox}>
              <AdaptiveText style={styles.otpText}>{char}</AdaptiveText>
            </View>
          ))}
        </View>

        <AdaptiveText style={[styles.headerSub, { marginTop: 20 }]}>Once OTP is verified, your trip will start.</AdaptiveText>

        <View style={{ marginVertical: 40 }}>
           <Ionicons name="shield-checkmark" size={100} color="#4CAF50" />
        </View>

        <TouchableOpacity style={styles.primaryButtonOutline} onPress={handleReject} disabled={isRejecting}>
          {isRejecting ? <ActivityIndicator color="#4b48ab" /> : <AdaptiveText style={styles.primaryButtonOutlineText}>Cancel Ride</AdaptiveText>}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <LinearGradient colors={['#e0e0e0', '#f5f5f5']} style={{ flex: 1 }} />
      </View>
      <BottomSheetWrapper
        snapPoints={['85%', '95%']}
        index={0}
        enablePanDownToClose={false}
        enableScroll={true}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}
      </BottomSheetWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapPlaceholder: {
    height: '40%',
    width: '100%',
  },
  stepContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  backBtn: {
    marginBottom: 10,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: '#4b48ab',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSub: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  driverImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 10,
  },
  driverName: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    color: '#000',
  },
  driverMeta: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#666',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8e8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleRow: {
    marginBottom: 10,
  },
  vehicleText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#333',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  locationTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  locationLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#888',
  },
  locationValue: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#000',
  },
  primaryButton: {
    backgroundColor: '#4b48ab',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
    gap: 15,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#ffebee',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  rejectButtonText: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    color: '#e53935',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#4b48ab',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    color: '#fff',
  },
  primaryButtonOutline: {
    borderColor: '#4b48ab',
    borderWidth: 1.5,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
  },
  primaryButtonOutlineText: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    color: '#4b48ab',
  },
  sectionTitle: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  summaryText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  amountText: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: '#4CAF50',
    marginBottom: 6,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  paymentText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#333',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: '#000',
    marginBottom: 5,
  },
  successSub: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#000',
    flex: 2,
    textAlign: 'right',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  previewImage: {
    width: '48%',
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  otpBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: '#f9f9f9',
  },
  otpText: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: '#4CAF50',
  },
});

export default DriverAssignedFlowScreen;

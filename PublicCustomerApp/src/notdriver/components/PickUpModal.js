import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Fonts } from '../../common/constants/constants';
import { useTranslation } from 'react-i18next';

const PickUpModal = ({
  stopsDetails,
  onConfirmPress,
  onStartTrip,
  isPublicRide,
  otpLoading,
  onCancelPress,
}) => {
  const { t } = useTranslation();
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const inputRef = useRef(null);

  const handleValueChange = async (value) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    setOtpCode(numericValue);
    
    if (numericValue.length === 4) {
      if (!isPublicRide) {
        onConfirmPress();
        return;
      }
      setOtpError('');
      const success = await onConfirmPress(numericValue);
      if (success) {
        setIsVerified(true);
      } else {
        setOtpError(t('invalid_otp', {defaultValue: 'Invalid OTP'}));
      }
    }
  };

  const handleBoxPress = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (isVerified) {
    return (
      <View style={styles.container}>
        <View style={styles.successIconContainer}>
          <MaterialCommunityIcons name="check" size={40} color={Colors.white} />
        </View>
        <Text style={styles.titleBold}>{t('otp_verified', {defaultValue: 'OTP Verified'})}</Text>
        <Text style={styles.subtitle}>{t('you_can_now_start_trip', {defaultValue: 'You can now start the trip.'})}</Text>
        <Text style={[styles.subtitle, {marginTop: 16}]}>{t('trip_will_start_now', {defaultValue: 'Trip will start now.'})}</Text>
        
        <View style={styles.carImageContainer}>
           <MaterialCommunityIcons name="car-side" size={80} color={Colors.periwinkle} />
        </View>

        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={onStartTrip}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnTxt}>{t('start_trip', {defaultValue: 'Start Trip'})}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.successIconContainer}>
        <MaterialCommunityIcons name="check" size={40} color={Colors.white} />
      </View>
      <Text style={styles.titleBold}>{t('otp_sent', {defaultValue: 'OTP Sent'})}</Text>
      <Text style={styles.subtitle}>{t('ask_otp_from_customer', {defaultValue: 'Ask OTP from your customer'})}</Text>

      <TouchableOpacity activeOpacity={1} onPress={handleBoxPress} style={styles.otpBoxesContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={[styles.otpBox, otpCode.length === index && styles.otpBoxActive]}>
            <Text style={styles.otpBoxText}>{otpCode[index] || ''}</Text>
          </View>
        ))}
      </TouchableOpacity>

      <TextInput
        ref={inputRef}
        value={otpCode}
        onChangeText={handleValueChange}
        maxLength={4}
        keyboardType="numeric"
        style={styles.hiddenInput}
        autoFocus
      />
      
      {otpLoading && <ActivityIndicator size="small" color={Colors.periwinkle} style={{marginVertical: 10}}/>}
      {(otpCode.length === 4 && otpError !== '') && <Text style={styles.otpError}>{otpError}</Text>}

      <Text style={styles.timerText}>{t('otp_valid_for', {defaultValue: 'OTP is valid for 5:00 minutes'})}</Text>
      
      <Text style={styles.footerText}>
        {t('once_otp_verified_trip_starts', {defaultValue: 'Once OTP is verified, the trip will start automatically.'})}
      </Text>

      {onCancelPress && (
        <TouchableOpacity 
          style={styles.cancelBtn} 
          onPress={onCancelPress}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnTxt}>{t('cancel_ride', {defaultValue: 'Cancel Ride'})}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PickUpModal;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titleBold: {
    fontSize: 20,
    fontFamily: Fonts.semi_bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#666',
    textAlign: 'center',
  },
  otpBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 30,
  },
  otpBox: {
    width: 50,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  otpBoxActive: {
    borderColor: Colors.periwinkle,
    borderWidth: 2,
  },
  otpBoxText: {
    fontSize: 24,
    fontFamily: Fonts.semi_bold,
    color: '#4CAF50',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpError: {
    color: '#E53935',
    fontSize: 13,
    fontFamily: Fonts.medium,
    marginTop: -10,
    marginBottom: 10,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#666',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  carImageContainer: {
    marginVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#352166',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnTxt: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.semi_bold,
  },
  cancelBtn: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e53935',
    backgroundColor: '#fff',
    alignItems: 'center',
    alignSelf: 'center',
  },
  cancelBtnTxt: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#e53935',
  },
});

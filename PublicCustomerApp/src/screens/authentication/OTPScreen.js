import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState, useCallback, useEffect } from 'react';

import { loginStyles } from '../../styles/UserStyles';
import OTPTextInput from 'react-native-otp-textinput';
import { colors } from '../../constants/constants';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { showNotification } from '../../components/NotificationManger';
import { DataStore } from '../../controllers/DataStore';
import { usePostQuery } from '../../hooks/useQuery';


const OTPScreen = ({ route }) => {

  const navigation = useNavigation();
  const [loginPhoneNumber, setloginPhoneNumber] = useState(route.params.phoneNumber);
  const [otpInput, setOtpInput] = useState('');

  const onVerifyOTPSuccess = (data) => {

    if (data.success) {

      showNotification('OTP Verified', 'OTP Verified Successfully', 'success');

      navigation.dispatch(
        CommonActions.navigate({
          name: 'HomeScreen'
        }),
      );
    } else {
      showNotification('Invalid OTP', data.message, 'danger');
    }

  }

  const onVerifyOTPError = (data) => {
    if (!data.success) showNotification('Invalid OTP', data.message, 'danger');

  }

  const { mutate: VerifyOTPMutate, isSuccess } = usePostQuery({
    onSuccess: onVerifyOTPSuccess,
    onError: onVerifyOTPError
  });

  const verifyOtp = async () => {
    if (otpInput.length === 0) {
      showNotification('Please Verify OTP', 'Invalid Otp', 'danger');
    } else {

      const payload = {
        otp: otpInput,
        phoneNumber: loginPhoneNumber,
      }

      await VerifyOTPMutate({
        queryKey: 'verifyOTPQuery',
        url: '/customer/auth/verifyOTP',
        payload: payload
      })
    }
  };

  return (
    <View style={loginStyles.screen}>
      <Text style={[loginStyles.headerTxt, loginStyles.otpHeaderTxt]}>
        One Time{'\n'}Password(OTP)
      </Text>
      <Text style={[loginStyles.headerContent, loginStyles.otpHeaderTxt]}>
        An OTP has been sent to mobile number
      </Text>
      <Text style={loginStyles.phoneTxt}>{loginPhoneNumber}</Text>
      <View style={loginStyles.otpContainer}>
        <OTPTextInput
          inputCount={6}
          textInputStyle={{
            width: 40,
            height: 60,
            borderColor: 'gray',
            borderWidth: 1,
            margin: 5,
            borderRadius: 5,
            color: colors.black,
          }}
          handleTextChange={setOtpInput}
          focusedBorderColor="#2785ff"
          autoFocus={true}
          tintColor={[
            colors.blue_xxdark,
            colors.blue_xxdark,
            colors.blue_xxdark,
            colors.blue_xxdark,
            colors.blue_xxdark,
            colors.blue_xxdark,
          ]}
        />
      </View>
      <TouchableOpacity style={loginStyles.otpBtn} onPress={() => verifyOtp()}>
        <Text style={loginStyles.otptxt}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OTPScreen;

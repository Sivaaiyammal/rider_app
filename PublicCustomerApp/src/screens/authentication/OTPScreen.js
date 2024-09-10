import {Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {loginStyles} from '../../styles/UserStyles';
import OTPTextInput from 'react-native-otp-textinput';
import {colors} from '../../constants/constants';
import {showNotification} from '../../components/NotificationManger';

const OTPScreen = () => {
  const [otpInput, setOtpInput] = useState('');

  const verifyOtp = () => {
    if (otpInput.length === 0) {
      showNotification('Please Verify OTP', 'Invalid Otp', 'danger');
    } else {
      console.log('OTP====>>', otpInput);
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
      <Text style={loginStyles.phoneTxt}>987*****10</Text>
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

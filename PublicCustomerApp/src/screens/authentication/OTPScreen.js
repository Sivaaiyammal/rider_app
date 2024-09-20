import {Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useRef, useState, useCallback, useEffect} from 'react';

import {loginStyles} from '../../styles/UserStyles';
import OTPTextInput from 'react-native-otp-textinput';
import {colors} from '../../constants/constants';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {showNotification} from '../../components/NotificationManger';
import {DataStore} from '../../controllers/DataStore';
import useUserInfoStore from '../../store/useUserInfoStore';
import {verifyOTPMutation} from '../../API/APICalls/UserAPICalls';
import FullScreenLoader from '../../components/Loaders/FullScreenLoader';

const OTPScreen = ({route}) => {
  const navigation = useNavigation();
  const [loginPhoneNumber, setloginPhoneNumber] = useState(
    route.params.phoneNumber,
  );
  const [otpInput, setOtpInput] = useState('');

  const [timer, setTimer] = useState(30);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const {setID, setUserdetails} = useUserInfoStore();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsButtonDisabled(false);
    }
  }, [timer]);

  const handleVerificationSuccess = async data => {
    if (data.success) {
      showNotification('OTP Verified', 'OTP Verified Successfully', 'success');

      console.log(data, 'data');
      let {accessToken, refreshToken, userDetails} = data;
      setID(userDetails._id);
      setUserdetails(userDetails);

      await DataStore.storeData('access_token', accessToken);
      await DataStore.storeData('refresh_token', refreshToken);
      await DataStore.storeData('userdetails', userDetails);
      if (!userDetails.personalDetails) {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'RegisterationScreen',
          }),
        );
      } else {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'HomeScreen',
          }),
        );
      }
    } else {
      showNotification('Invalid OTP', data.message, 'danger');
    }
  };

  const {mutate: verifyOTPMutate, isLoading: isLoading} = verifyOTPMutation(
    handleVerificationSuccess,
  );

  const verifyOtp = async () => {
    if (otpInput.length === 0) {
      showNotification('Please Verify OTP', 'Invalid Otp', 'danger');
    } else {
      const payload = {
        otp: otpInput,
        phoneNumber: loginPhoneNumber,
      };
      verifyOTPMutate(payload);
    }
  };

  return (
    <View style={loginStyles.screen}>
      {isLoading && <FullScreenLoader />}
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
      <TouchableOpacity onPress={()=>console.log('hari-->>resendPressed-->>')}>
      <Text style={loginStyles.resendOTP}>Resend OTP {isButtonDisabled ? `in ${timer}` : null}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={loginStyles.otpBtn} onPress={() => verifyOtp()}>
        <Text style={loginStyles.otptxt}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OTPScreen;

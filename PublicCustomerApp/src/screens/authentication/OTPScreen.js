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
import Icon from 'react-native-vector-icons/MaterialIcons';

// Utility function to mask phone number
const maskPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.length < 5) return phoneNumber;
  
  const firstThree = phoneNumber.substring(0, 3);
  const lastTwo = phoneNumber.substring(phoneNumber.length - 2);
  const middleAsterisks = '*'.repeat(phoneNumber.length - 5);
  
  return `${firstThree}${middleAsterisks}${lastTwo}`;
};

const OTPScreen = ({route}) => {
  const navigation = useNavigation();
  const [loginPhoneNumber, setloginPhoneNumber] = useState(
    route.params.phoneNumber,
  );
  const [countryCode, setCountryCode] = useState(
    route.params.countryCode,
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
      let {  user,isNewUser} = data;
      console.log(user?.token)
      console.log(user?.token)
      console.log(user)
      console.log(isNewUser)
      setID(user._id);
      setUserdetails(user);

      await DataStore.storeData('access_token', user?.token);
      await DataStore.storeData('userdetails', user);
      if (isNewUser) {
        
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
        phone: `+${countryCode}${loginPhoneNumber}`,
      };
      verifyOTPMutate(payload);
    }
  };

  return (
    <View style={loginStyles.screen}>
      {isLoading && <FullScreenLoader />}
      
      {/* Header with back button */}
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20}}>
      
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.blue_xxdark,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Icon name="chevron-left" size={30} color="white" />
        </TouchableOpacity>
      </View>
      
      <Text style={[loginStyles.headerTxt, loginStyles.otpHeaderTxt]}>
        One Time{'\n'}Password(OTP)
      </Text>
      <Text style={[loginStyles.headerContent, loginStyles.otpHeaderTxt]}>
        An OTP has been sent to mobile number
      </Text>
      <Text style={loginStyles.phoneTxt}>{maskPhoneNumber(loginPhoneNumber)}</Text>
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

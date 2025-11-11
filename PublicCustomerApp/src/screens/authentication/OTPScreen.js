import {Text, TouchableOpacity, View} from 'react-native';
import React, {useState, useEffect, useRef, useContext} from 'react';

import {loginStyles} from '../../styles/UserStyles';
import OTPTextInput from 'react-native-otp-textinput';
import {colors} from '../../constants/constants';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {showNotification} from '../../components/NotificationManger';
import {DataStore} from '../../controllers/DataStore';
import useUserInfoStore from '../../store/useUserInfoStore';
import {requestOTPMutation, verifyOTPMutation} from '../../API/APICalls/UserAPICalls';
import FullScreenLoader from '../../components/Loaders/FullScreenLoader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';  
import PropTypes from 'prop-types';  
import { GlobalContext } from '../../context/GlobalContext';
import useRideMatching from '../../hooks/useRideMatching';
import OTPInput from '../../components/Common/OTPInput';
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
  const {addListener} = useContext(GlobalContext);
  const { initializeSocket} = useRideMatching();
  const [loginPhoneNumber] = useState(
    route.params.phoneNumber,
  );
  const [countryCode] = useState(
    route.params.countryCode,
  );
  const [otpInput, setOtpInput] = useState('');

  const [timer, setTimer] = useState(120);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  

  const {setID, setUserdetails} = useUserInfoStore();
  
  // Add ref for OTP input to enable auto-fill
  const otpRef = useRef(null);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

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
    try {
      if (data.success) {
       
        
        let { user, isNewUser } = data;
        
        setID(user._id);
        setUserdetails(user);

        await DataStore.storeData('access_token', user?.token);
        addListener(user?.token);
        await DataStore.storeData('userdetails', user);
      
        
        if (isNewUser) {
          navigation.dispatch(
            CommonActions.navigate({
              name: 'RegisterationScreen',
            }),
          );
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomeScreen' }],
          });
        }
        showNotification('OTP Verified', 'OTP Verified Successfully', 'success');
      } else {
        if(data?.message.typeof === 'string'){  
          showNotification('Failed', "Invalid OTP", 'danger');
        }else{
          showNotification('Failed', "Something went wrong", 'danger');
        }
      }
    } catch (error) {
      console.error('Error in handleVerificationSuccess:', error);
      showNotification('Failed', 'Something went wrong', 'danger');
    }
  };

  const {mutate: verifyOTPMutate, isLoading: isLoading} = verifyOTPMutation(
    handleVerificationSuccess,
  );

  const getFcmToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      return fcmToken;
    } catch (error) {
      console.log('Error getting FCM token: ', error);
    }
  };


  const verifyOtp = async () => {
    if (otpInput.length === 0) {
      showNotification('Please Verify OTP', 'Invalid Otp', 'danger');
    } else {
      const fcmToken = await getFcmToken();
      const deviceImei = await DeviceInfo.getUniqueId().catch(error => {
        console.log('Error getting device IMEI: ', error);
      });
      const tokenCred = {
        token: fcmToken,
        deviceImei: deviceImei,
      };
      const payload = {
        otp: otpInput,
        phone: `+${countryCode}${loginPhoneNumber}`,
        fcmToken: tokenCred,
      };
      
      verifyOTPMutate(payload);
    }
  };


  useEffect(()=>{
    if(otpInput.length === 6){
      verifyOtp()
    }
  },[otpInput])

 
  const onOtpChange = (text) => {
    const digitsOnly = (text || '').replace(/[^0-9]/g, '');
    const code = digitsOnly.slice(0, 6);
    setOtpInput(code);
  };
  
  const handleResendSuccess = (data) => {
    if(data.success){
      showNotification('OTP Resend', 'OTP Resend Successfully', 'success');
      
    }else{
      showNotification('OTP Resend', "Failed to resend OTP", 'danger');
    }
  };
  const {mutate: requestOTPMutate} = requestOTPMutation(
    handleResendSuccess,
  );

  const resendOTP = async () => {
    const payload = {
      phone: `+${countryCode}${loginPhoneNumber}`,
     
    };
    DataStore.storeData('login_phoneNumber', loginPhoneNumber);
    requestOTPMutate(payload);
    setTimer(120);
    setIsButtonDisabled(true);
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
      <OTPInput
          inputCount={6}
          onChange={onOtpChange}
          onComplete={(code) => setOtpInput(code)}  // your effect will auto-verify when length===6
          autoFocus
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          focusedBorderColor={colors.blue_xxdark}
          tintColor={[
            colors.grey_xdark,
            colors.grey_xdark ,
            colors.grey_xdark,
            colors.grey_xdark,
            colors.grey_xdark,
            colors.grey_xdark,
          ]}
          inputStyle={{
            width: 40,
            height: 60,
            borderWidth: 1,    
            margin: 5,
            borderRadius: 5,
            color: colors.black,
          }}
      />
      </View>
      <TouchableOpacity disabled={isButtonDisabled} onPress={()=> isButtonDisabled ? null : resendOTP()}>
      <Text style={loginStyles.resendOTP}>Resend OTP {isButtonDisabled ? `in ${formatTime(timer)}` : null}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={loginStyles.otpBtn} onPress={() => verifyOtp()}>
        <Text style={loginStyles.otptxt}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

OTPScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      phoneNumber: PropTypes.string.isRequired,
      countryCode: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default OTPScreen;

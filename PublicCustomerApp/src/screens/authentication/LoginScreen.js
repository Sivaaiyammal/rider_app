import {Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';


import {loginStyles} from '../../styles/UserStyles';
import Logo from '../../assets/image/logo.svg';
import Phone from '../../assets/image/svgIcons/phone.svg';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {showNotification} from '../../components/NotificationManger';
import {DataStore} from '../../controllers/DataStore';

import {requestOTPMutation} from '../../API/APICalls/UserAPICalls';
import FullScreenLoader from '../../components/Loaders/FullScreenLoader';

const LoginScreen = () => {
  const navigation = useNavigation();
  const country = {
    callingCode: ['91'],
    cca2: 'IN',
    currency: ['INR'],
    flag: 'flag-in',
    name: 'India',
    region: 'Asia',
    subregion: 'Southern Asia',
  };
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumErr, setPhoneNumErr] = useState('');

  const handleLoginSuccess = (data) => {
    if (data) {
      showNotification('OTP Sent', 'OTP Sent to your mobile number', 'success');
      console.log('data', data);
      navigation.dispatch(
        CommonActions.navigate({
          name: 'OTPScreen',
          params: {
            countryCode: country.callingCode[0],
            phoneNumber: phoneNumber,
          },
        }),
      );
    }
  };

  const {mutate: requestOTPMutate, isLoading: isLoading} = requestOTPMutation(
    handleLoginSuccess,
  );

  const renderCountryCode = () => (
    <View style={loginStyles.countryPicker}>
      <View>
        <Text style={loginStyles.flag}>🇮🇳</Text>
      </View>
      <Text style={loginStyles.callingCode}>
        +{country.callingCode[0]}
      </Text>
    </View>
  );

  const requestOTP = async () => {
    const payload = {
      phone: `+${country.callingCode[0]}${phoneNumber}`,
    };
    DataStore.storeData('login_phoneNumber', phoneNumber);
    requestOTPMutate(payload);
  };

  const handleChange = text => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setPhoneNumber(numericValue);
    
    // Update error message based on phone number length
    if (numericValue.length === 0) {
      setPhoneNumErr('');
    } else if (numericValue.length < 10) {
      setPhoneNumErr('Phone number must be 10 digits');
    } else if (numericValue.length > 10) {
      setPhoneNumErr('Phone number must be 10 digits');
    } else {
      setPhoneNumErr('');
    }
  };



  return (
    <>
      {isLoading && <FullScreenLoader />}
      <View style={loginStyles.screen}>
        <View style={loginStyles.header}>
          <Logo />
          <Text style={loginStyles.headerTxt}>
            Namma Ooru Taxi ® {'\n'} For Public
          </Text>
        </View>
        <View style={loginStyles.contectContainer}>
          <Text style={loginStyles.signInTxt}>
            Sign In by using Mobile Number
          </Text>
          <View style={loginStyles.inputConatiner}>
            {renderCountryCode()}
            <TextInput
              style={loginStyles.input}
              placeholder="Mobile Number"
              keyboardType="number-pad"
              onChangeText={handleChange}
              value={phoneNumber}
              maxLength={10}
            />
            <View style={loginStyles.phoneIcon}>
              <Phone />
            </View>
          </View>
          {phoneNumErr !== '' && (
            <Text style={loginStyles.errTxt}>{phoneNumErr}</Text>
          )}
        </View>
       
        <TouchableOpacity
          style={[
            loginStyles.otpBtn,
            phoneNumber.length !== 10 && {opacity: 0.5}
          ]}
          onPress={() => requestOTP()}
          disabled={phoneNumber.length !== 10}>
          <Text style={loginStyles.otptxt}>Request OTP</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default LoginScreen;

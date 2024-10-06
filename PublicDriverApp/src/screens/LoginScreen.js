import {Image, Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useRef, useState, useCallback} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';

import CountryPicker, {FlagButton} from 'react-native-country-picker-modal';
import Phone from '../assets/image/svgIcons/phone.svg';
import {CommonActions, useNavigation} from '@react-navigation/native';

import FullScreenLoader from '../components/Loaders/FullScreenLoader';
import { showNotification } from '../components/NotificationManager';
import { requestOTPMutation } from '../API/APICalls/UserAPICalls';
import { loginStyles } from '../styles/UserStyles';
import { DataStore } from '../controllers/DataStore';
import { onBoardingStyles, SplashStyles } from '../styles/SplashStyles';
import { colors } from '../constants/constants';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [countryCode, setCountryCode] = useState('IN');
  const [country, setCountry] = useState({
    callingCode: ['91'],
    cca2: 'IN',
    currency: ['INR'],
    flag: 'flag-in',
    name: 'India',
    region: 'Asia',
    subregion: 'Southern Asia',
  });
  const [visible, setVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumErr, setPhoneNumErr] = useState(null);

  const handleLoginSuccess = (data) => {
    if (data) {
      showNotification('OTP Sent', 'OTP Sent to your mobile number', 'success');
      navigation.dispatch(
        CommonActions.navigate({
          name: 'OTPScreen',
          params: {
            phoneNumber: phoneNumber,
          },
        }),
      );
    }
  };

  const {mutate: requestOTPMutate, isLoading: isLoading} = requestOTPMutation(
    handleLoginSuccess,
  );

  const onSelect = country => {
    setCountryCode(country.cca2);
    setCountry(country);
  };

  const renderCustomFlagButton = () => (
    <TouchableOpacity
      onPress={() => setVisible(true)}
      style={loginStyles.countryPicker}>
      <View>
        <FlagButton
          withEmoji={true}
          countryCode={country.cca2}
          onOpen={() => setVisible(true)}
        />
      </View>
      <Text style={loginStyles.callingCode}>
        {country ? '+' + country.callingCode : '+91'}
      </Text>
    </TouchableOpacity>
  );

  const renderCountryPicker = () => {
    return (
      <CountryPicker
        {...{
          countryCode,
          withFilter: true,
          withFlag: true,
          withCountryNameButton: true,
          withAlphaFilter: true,
          withCallingCode: true,
          withEmoji: true,
          onSelect,
        }}
        visible={visible}
        onClose={() => setVisible(false)}
        renderFlagButton={renderCustomFlagButton}></CountryPicker>
    );
  };

  const requestOTP = async () => {
    if (phoneNumber.length === 0) {
      setPhoneNumErr('Please Enter Mobile Number');
    } else if (phoneNumber.length < 10) {
      setPhoneNumErr('Please Enter Valid Mobile Number');
    } else {
      const payload = {
        phoneNumber: phoneNumber,
      };
      DataStore.storeData('login_phoneNumber', phoneNumber);
      requestOTPMutate(payload);
    }
  };

  const handleChange = text => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setPhoneNumber(numericValue);
  };

  return (
    <>
      {isLoading && <FullScreenLoader />}
      <View style={loginStyles.screen}>
        <View style={loginStyles.header}>
        <View style={SplashStyles.logo}>
          <Image
            source={require('../assets/image/logo.png')}
            style={{width: '100%', height: '100%', resizeMode: 'contain'}}
          />
        </View>
          <Text style={loginStyles.headerTxt}>
            Namma Ooru Taxi ® {'\n'}For Drivers
          </Text>
        </View>
        <View style={[onBoardingStyles.yellowSeperator,{marginLeft:20, marginBottom:20}]}></View>
        <View style={loginStyles.contectContainer}>
          <Text style={loginStyles.signInTxt}>
            Sign In by using Mobile Number
          </Text>
          <View style={loginStyles.inputConatiner}>
            {renderCountryPicker()}
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
          {(phoneNumber.length === 0 || phoneNumber.length < 10) && (
            <Text style={loginStyles.errTxt}>{phoneNumErr}</Text>
          )}
        </View>
        <TouchableOpacity
          style={loginStyles.otpBtn}
          onPress={() => requestOTP()}>
          <Text style={loginStyles.otptxt}>Request OTP</Text>
          <AntDesign name="arrowright" color={colors.white} size={16} />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default LoginScreen;

import {Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';

import CountryPicker, {FlagButton} from 'react-native-country-picker-modal';
import {loginStyles} from '../../styles/UserStyles';

import Logo from '../../assets/image/logo.svg';
import Phone from '../../assets/image/svgIcons/phone.svg';
import {CommonActions, useNavigation} from '@react-navigation/native';

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

  const requestOTP = () => {
    if (phoneNumber.length === 0) {
      setPhoneNumErr('Please Enter Mobile Number');
    } else if (phoneNumber.length < 10){
      setPhoneNumErr('Please Enter Valid Mobile Number');
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'HomeScreen'}],
        }),
      );
    }
  };

  const handleChange = text => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setPhoneNumber(numericValue);
  };

  return (
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
      <TouchableOpacity style={loginStyles.otpBtn} onPress={() => requestOTP()}>
        <Text style={loginStyles.otptxt}>Request OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

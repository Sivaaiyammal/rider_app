import {Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';

import CountryPicker, {FlagButton} from 'react-native-country-picker-modal';
import {loginStyles} from '../../styles/UserStyles';

import Logo from '../../assets/image/logo.svg';
import Phone from '../../assets/image/svgIcons/phone.svg';
import {colors} from '../../constants/constants';
import { DataStore } from '../../controllers/DataStore';
import { CommonActions, useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation()
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
     navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'HomeScreen'}],
      }),
    );
  }

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
          <TextInput style={loginStyles.input} placeholder="hello" keyboardType='numeric'/>
          <View style={loginStyles.phoneIcon}>
          <Phone />
          </View>
          
        </View>
      </View>
      <TouchableOpacity style={loginStyles.otpBtn} onPress={()=>requestOTP()}>
        <Text style={loginStyles.otptxt}>Request OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

import {Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useState, useContext} from 'react';

import CountryPicker, {FlagButton} from 'react-native-country-picker-modal';
import {loginStyles} from '../../../notCustomer/styles/UserStyles';
import Logo from '../../assets/image/logo.svg';
import Phone from '../../assets/image/svgIcons/phone.svg';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {showNotification} from '../../../notCustomer/components/NotificationManger';
import {DataStore} from '../../../notCustomer/controllers/DataStore';

import {testLogin} from '../../../notCustomer/API/APICalls/UserAPICalls';
import FullScreenLoader from '../../../notCustomer/components/Loaders/FullScreenLoader';
import useUserInfoStore from '../../store/useUserInfoStore';
import { GlobalContext } from '../../context/GlobalContext';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';  
const LoginScreen = () => {
  const navigation = useNavigation();
  const {addListener} = useContext(GlobalContext);
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
  const [password, setPassword] = useState('');
  const [phoneNumErr, setPhoneNumErr] = useState(null);
  const {setUserdetails} = useUserInfoStore();
  const handleLoginSuccess = (data) => {
    if (data) {
      // showNotification('Logged In', 'Logged in Successfully', 'success');
      
      let {token} = data.user || {};
     
      DataStore.storeData('access_token', token);
      DataStore.storeData('userdetails', data?.user);
      setUserdetails(data?.user);
      addListener(token);
     
      navigation.dispatch(
        CommonActions.navigate({
          name: 'HomeScreen',
        }),
      );
    }
  };

  const {mutate: testLogins, isLoading: isLoading} = testLogin(
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
  const getFcmToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      return fcmToken;
    } catch (error) {
      console.log('Error getting FCM token: ', error);
    }
  };

  const requestOTP = async () => {
    if (phoneNumber.length === 0) {
      setPhoneNumErr('Please Enter Mobile Number');
    } else if (phoneNumber.length < 10) {
      setPhoneNumErr('Please Enter Valid Mobile Number');
    } else {
      setPhoneNumErr(null);
      const fcmToken = await getFcmToken();
      const deviceImei = await DeviceInfo.getUniqueId().catch(error => {
        console.log('Error getting device IMEI: ', error);
      });
      const tokenCred = {
        token: fcmToken,
        deviceImei: deviceImei,
      };
      
      const payload = {
        phone: '+' + country.callingCode[0] + phoneNumber,
        password: password,
        fcmToken: tokenCred,
        
      };
      console.log("Login payload", payload)
      DataStore.storeData('login_phoneNumber', phoneNumber);
      testLogins(payload);
    }
  };

  const handleChange = text => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setPhoneNumber(numericValue);
  };

  const PasswordHandle= text => {
    setPassword(text)
  }

  const navigateRegisterPage = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'RegisterationScreen',
      }),
    );

  }

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
          {phoneNumErr && (
            <Text style={loginStyles.errTxt}>{phoneNumErr}</Text>
          )}
        </View>
        <View style={loginStyles.contectContainer}>
          <View style={loginStyles.inputConatiner}>
            <TextInput
              style={loginStyles.input}
              placeholder="Password"
              onChangeText={PasswordHandle}
              value={password}
            />
          </View>
        </View>
        <TouchableOpacity
          style={loginStyles.newUserBtn}
          onPress={() => navigateRegisterPage()}>
          <Text style={{ flexDirection: "row" }}>
            <Text>New User? </Text>
            <Text style={loginStyles.registerPageBtn}>Register</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={loginStyles.otpBtn}
          onPress={() => requestOTP()}>
          <Text style={loginStyles.otptxt}>Login</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default LoginScreen;

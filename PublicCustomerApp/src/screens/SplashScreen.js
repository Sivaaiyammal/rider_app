import { ActivityIndicator, Text, View } from 'react-native';
import React, { useCallback, useEffect, useContext } from 'react';
import { SplashStyles } from '../styles/SplashStyles';
import Logo from '../assets/image/logo.svg';
import SplashBg from '../assets/image/splashBg.svg';
import { colors } from '../constants/constants';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { DataStore } from '../controllers/DataStore';
import useUserInfoStore from '../store/useUserInfoStore';
import { GlobalContext } from '../context/GlobalContext';
import DeviceInfo from 'react-native-device-info';
const SplashScreen = () => {


  const version = DeviceInfo.getVersion();
  const versionCode = DeviceInfo.getBuildNumber();

  

  return (
    <View style={SplashStyles.screen}>
      <View style={SplashStyles.logoContainer}>
        <Logo />
        <Text style={SplashStyles.splashTitle}>
          Namma Ooru Taxi ® {'\n'}
        </Text>
        <Text style={SplashStyles.versionTxt}>
          {`V${version} ( ${versionCode} )`}
        </Text>
      </View>
      <ActivityIndicator color={colors.yellow} size={30} />
      <View style={SplashStyles.splashBg}>
        <SplashBg />
      </View>
    </View>
  );
};

export default SplashScreen;

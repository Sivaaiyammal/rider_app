import { ActivityIndicator, Text, View, Image } from 'react-native';
import React from 'react';
import { SplashStyles } from '../../notCustomer/styles/SplashStyles';
import Logo from '../../notCustomer/assets/image/logo.svg';
import { colors } from '../../notCustomer/constants/constants';
import DeviceInfo from 'react-native-device-info';
import Greeting from '../../notCustomer/assets/image/greeting.webp';
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
         <ActivityIndicator style={{marginTop: 20}} color={colors.yellow} size={30} />
      
        <Image source={Greeting} style={{width: '100%', height: '50%',position: 'absolute', bottom: 0}} />
    
    </View>
  );
};

export default SplashScreen;

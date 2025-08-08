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
const SplashScreen = () => {
  const navigation = useNavigation();
  const {addListener} = useContext(GlobalContext);
  const {setLanguage} = useUserInfoStore();
  useEffect(() => {
    setTimeout(() => {
      nextScreen();
    }, 2000);
  });

  const nextScreen = useCallback(async () => {
    const language = await DataStore.loadData('language');
    const onBoarding = await DataStore.loadData('onBoarding');
    const access_token = await DataStore.loadData('access_token');
    
    if (access_token.data) {
      
      addListener(access_token.data);
      navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'HomeScreen' }],
            }),
          );
    } else if (language.data && language.data !== 'languageDone') {
      // If language is stored as a language code (en, ta, hi, etc.)
      setLanguage(language.data);
      
      if (onBoarding.data === 'onBoardingDone') {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'LoginScreen' }],
          }),
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'OnBoarding' }],
          }),
        );
      }
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'LanguageScreen' }],
        }),
      );
    }
  }, []);

  return (
    <View style={SplashStyles.screen}>
      <View style={SplashStyles.logoContainer}>
        <Logo />
        <Text style={SplashStyles.splashTitle}>
          Namma Ooru Taxi ® {'\n'} 
        </Text>
        <Text style={SplashStyles.versionTxt}>V1.0.0.0.0</Text>
      </View>
      <ActivityIndicator color={colors.yellow} size={30} />
      <View style={SplashStyles.splashBg}>
        <SplashBg />
      </View>
    </View>
  );
};

export default SplashScreen;

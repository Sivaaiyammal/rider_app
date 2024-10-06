import {ActivityIndicator, Image, StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useEffect} from 'react';
import {SplashStyles} from '../styles/SplashStyles';
import {colors} from '../constants/constants';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {DataStore} from '../controllers/DataStore';
import SplashBg from '../assets/image/splashBg.svg';
const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    setTimeout(() => {
      nextScreen();
    }, 2000);
  });

  const nextScreen = useCallback(async () => {
    const language = await DataStore.loadData('language');
    const onBoarding = await DataStore.loadData('onBoarding');
    const termsAccepted = await DataStore.loadData('termsAccepted');
    const userInfo = await DataStore.loadData('userInfo');

    if (language.data === 'languageDone') {
      if (onBoarding.data === 'onBoardingDone') {
        if (termsAccepted.data === 'termsAcceptedDone') {
          if (userInfo.data) {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'HomeScreen'}],
              }),
            );
          } else {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'LoginScreen'}],
              }),
            );
          }
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'ThingsToKnow'}],
            }),
          );
        }
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'WelcomeScreen'}],
          }),
        );
      }
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'LanguageScreen'}],
        }),
      );
    }
  }, []);

  return (
    <View style={SplashStyles.screen}>
      <View style={SplashStyles.logoContainer}>
        <View style={SplashStyles.logo}>
          <Image
            source={require('../assets/image/logo.png')}
            style={{width: '100%', height: '100%', resizeMode: 'contain'}}
          />
        </View>
        <Text style={SplashStyles.splashTitle}>
          Namma Ooru Taxi ® {'\n'}For Drivers
        </Text>
        <Text style={SplashStyles.versionTxt}>V2.0.2.5</Text>
      </View>
      <ActivityIndicator color={colors.yellow} size={30} />
      <View style={SplashStyles.splashBg}>
        <SplashBg />
      </View>
    </View>
  );
};

export default SplashScreen;

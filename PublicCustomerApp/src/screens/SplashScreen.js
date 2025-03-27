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
  const {setUserdetails} = useUserInfoStore();
  useEffect(() => {
    setTimeout(() => {
      nextScreen();
    }, 2000);
  });

  const nextScreen = useCallback(async () => {
    const language = await DataStore.loadData('language');
    const onBoarding = await DataStore.loadData('onBoarding');
    const access_token = await DataStore.loadData('access_token');
    const userdetails = await DataStore.loadData('userdetails');

    console.log('access_token',access_token, userdetails.data);

    if (access_token.data) {
      if(userdetails.data){
        setUserdetails(userdetails.data);
      }
      addListener(access_token.data);

      // if (!userdetails.data.personalDetails) {
      //   navigation.dispatch(
      //     CommonActions.reset({
      //       index: 0,
      //       routes: [{ name: 'RegisterationScreen' }],
      //     }),
      //   );
      //   return;
      // } else {
      //   navigation.dispatch(
      //     CommonActions.reset({
      //       index: 0,
      //       routes: [{ name: 'HomeScreen' }],
      //     }),
      //   );
      // }

      navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'HomeScreen' }],
            }),
          );


    } else if (language.data === 'languageDone') {
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
          Namma Ooru Taxi ® {'\n'} For Public
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

import React, { useState, useCallback, useContext, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DataStore } from '../controllers/DataStore';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/OnBoard/WelcomeScreen.jsx';
import LanguageScreen from '../screens/OnBoard/LanguageScreen.jsx';
import OnBoarding from '../screens/OnBoard/OnBoarding.jsx';
import Home from '../screens/Home';
import TrackingTestScreen from '../screens/TrackingTestScreen.jsx';
import LocationPermissionScreen from '../screens/LocationPermissionScreen';
import LoginScreen from '../screens/authentication/LoginScreen';
import RegisterationScreen from '../screens/authentication/RegisterationScreen';
import OTPScreen from '../screens/authentication/OTPScreen';
import DriverAccessScreen from '../screens/Driver/DriverAccessScreen.jsx';
import useUserInfoStore from '../store/useUserInfoStore';
import { GlobalContext } from '../context/GlobalContext';
import PropTypes from 'prop-types';
import i18n from '../i18n';
import useRideMatching from '../hooks/useRideMatching'; 
import InAppUpdates from '../utils/InAppUpdates';

// import YourRidesScreen from '../screens/Rides/YourRidesScreen';
// import YourRideDetailsScreen from '../screens/Rides/YourRideDetailsScreen';
// import MyAccountScreen from '../screens/Profile/MyAccountScreen';
// import NotificationScreen from '../screens/NotificationScreen';
// import ContactScreen from '../screens/ContactScreen';
import ContactScreen from '../features/about/screens/ContactScreen';
// import SavedPlacesScreen from '../screens/SavedPlacesScreen';
// import PreferencesScreen from '../screens/PreferencesScreen';
// import ReceiptsScreen from '../screens/ReceiptsScreen';
// import AboutScreen from '../screens/AboutScreen';
// import LegalScreen from '../screens/LegalScreen';

const Navigation = ({ onSplashComplete }) => {
  const Stack = createNativeStackNavigator();
  const [initialRoute, setInitialRoute] = useState('LanguageScreen');
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  const {addListener} = useContext(GlobalContext);
  const {setLanguage} = useUserInfoStore();
  useRideMatching();
  const nextScreen = useCallback(async () => {
    const language = await DataStore.loadData('language');
    const onBoarding = await DataStore.loadData('onBoarding');
    const access_token = await DataStore.loadData('access_token');

   console.log(access_token.data, 'access_token');

    
    if (access_token.data) {
      setInitialRoute('HomeScreen');
      addListener(access_token.data);
    } else if (language.data && language.data !== 'languageDone') {
      // If language is stored as a language code (en, ta, hi, etc.)
      setLanguage(language.data);
      try { i18n.changeLanguage(language.data); } catch (e) { console.warn('i18n changeLanguage failed', e); }
      
      // if (onBoarding.data === 'onBoardingDone') {
      //   setInitialRoute('LoginScreen');
      // } else {
      //   setInitialRoute('OnBoarding');
      // }
       setInitialRoute('LoginScreen');
    } else {
      setInitialRoute('LanguageScreen');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      nextScreen().finally(() => {
        setIsSplashLoading(false);
        if (typeof onSplashComplete === 'function') {
          onSplashComplete();
        }
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [nextScreen, onSplashComplete]);


    // Call in-app update check with 2-second delay after splash screen completes
    useEffect(() => {
      if (isSplashLoading) return;
      const timeoutId = setTimeout(() => {
        console.log('[Navigation] Checking for in-app updates (immediate/force) after splash...');
        InAppUpdates.checkUpdateStatus();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }, [isSplashLoading]);

  if (isSplashLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="OnBoarding" component={OnBoarding} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterationScreen" component={RegisterationScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      <Stack.Screen name="HomeScreen" component={Home} />
      <Stack.Screen name="TrackingTestScreen" component={TrackingTestScreen} />
      <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
      <Stack.Screen name="DriverAccessScreen" component={DriverAccessScreen} />
      <Stack.Screen name="ContactScreen" component={ContactScreen} />
    
    </Stack.Navigator>
  );
};

export default Navigation;

Navigation.propTypes = {
  onSplashComplete: PropTypes.func,
};

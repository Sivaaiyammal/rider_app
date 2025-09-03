import React, { useState, useCallback, useContext, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DataStore } from '../controllers/DataStore';
import SplashScreen from '../screens/SplashScreen';
import LanguageScreen from '../screens/OnBoard/LanguageScreen.jsx';
import OnBoarding from '../screens/OnBoard/OnBoarding.jsx';
import Home from '../screens/Home';
import LoginScreen from '../screens/authentication/LoginScreen';
import RegisterationScreen from '../screens/authentication/RegisterationScreen';
import OTPScreen from '../screens/authentication/OTPScreen';
import useUserInfoStore from '../store/useUserInfoStore';
import { GlobalContext } from '../context/GlobalContext';
import {decode as atob} from 'base-64';

// import YourRidesScreen from '../screens/Rides/YourRidesScreen';
// import YourRideDetailsScreen from '../screens/Rides/YourRideDetailsScreen';
// import MyAccountScreen from '../screens/Profile/MyAccountScreen';
// import NotificationScreen from '../screens/NotificationScreen';
// import ContactScreen from '../screens/ContactScreen';
// import SavedPlacesScreen from '../screens/SavedPlacesScreen';
// import PreferencesScreen from '../screens/PreferencesScreen';
// import ReceiptsScreen from '../screens/ReceiptsScreen';
// import AboutScreen from '../screens/AboutScreen';
// import LegalScreen from '../screens/LegalScreen';

const Navigation = () => {
  const Stack = createNativeStackNavigator();
  const [initialRoute, setInitialRoute] = useState('LanguageScreen');
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  const {addListener} = useContext(GlobalContext);
  const {setLanguage} = useUserInfoStore();

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
      
      if (onBoarding.data === 'onBoardingDone') {
        setInitialRoute('LoginScreen');
      } else {
        setInitialRoute('OnBoarding');
      }
    } else {
      setInitialRoute('LanguageScreen');
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      nextScreen().finally(() => {
        setIsSplashLoading(false);
      });
    }, 2000);
  }, []);

  if (isSplashLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
      <Stack.Screen name="OnBoarding" component={OnBoarding} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterationScreen" component={RegisterationScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      <Stack.Screen name="HomeScreen" component={Home} />
    
    </Stack.Navigator>
  );
};

export default Navigation;

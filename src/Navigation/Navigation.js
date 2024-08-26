import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from 'react-native-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SplashReactScreen from '../Screens/splashScreen';
import LanguageScreen from '../Screens/languageScreen';
import MainScreen from '../Screens/MainScreen';
import LoginScreen from '../Screens/Users/LoginScreen';
import OnboardingScreen from '../Screens/OnboardingScreen';
import UserPreference from '../Screens/Users/UserPreference';

const Navigation = () => {

  const Stack = createNativeStackNavigator();

  useEffect(() => {
    if (SplashScreen) {
      SplashScreen.hide();
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashReactScreen} />
        <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
        <Stack.Screen name="onBoardingScreen" component={OnboardingScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="userPreference" component={UserPreference} />
        <Stack.Screen 
          name="Home" 
          component={MainScreen}
        />
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
};

export default Navigation;

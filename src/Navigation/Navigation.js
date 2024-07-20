import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from 'react-native-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from '../Screens/HomeScreen';
import SearchScreen from '../Screens/SearchScreen';
import SplashReactScreen from '../Screens/splashScreen';
import LanguageScreen from '../Screens/languageScreen';

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
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
        />
        <Stack.Screen 
          name="SearchScreen" 
          component={SearchScreen} 
        />
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
};

export default Navigation;

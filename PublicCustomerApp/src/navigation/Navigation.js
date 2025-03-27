import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LanguageScreen from '../screens/LanguageScreen';
import OnBoarding from '../screens/OnBoarding';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/authentication/LoginScreen';
import RegisterationScreen from '../screens/authentication/RegisterationScreen';
import OTPScreen from '../screens/authentication/OTPScreen';
import YourRidesScreen from '../screens/Rides/YourRidesScreen';
import YourRideDetailsScreen from '../screens/Rides/YourRideDetailsScreen';
import MyAccountScreen from '../screens/Profile/MyAccountScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ContactScreen from '../screens/ContactScreen';
const Navigation = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
      <Stack.Screen name="OnBoarding" component={OnBoarding} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterationScreen" component={RegisterationScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="YourRidesScreen" component={YourRidesScreen} />
      <Stack.Screen name="YourRideDetailsScreen" component={YourRideDetailsScreen} />
      <Stack.Screen name="MyAccountScreen" component={MyAccountScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen name="ContactScreen" component={ContactScreen} />
    </Stack.Navigator>
  );
};

export default Navigation;

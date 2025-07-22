import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LanguageScreen from '../screens/OnBoard/LanguageScreen.jsx';
import OnBoarding from '../screens/OnBoard/OnBoarding.jsx';
import Home from '../screens/Home';
import LoginScreen from '../screens/authentication/LoginScreen';
import RegisterationScreen from '../screens/authentication/RegisterationScreen';
import OTPScreen from '../screens/authentication/OTPScreen';
import YourRidesScreen from '../screens/Rides/YourRidesScreen';
import YourRideDetailsScreen from '../screens/Rides/YourRideDetailsScreen';
import MyAccountScreen from '../screens/Profile/MyAccountScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ContactScreen from '../screens/ContactScreen';
import SavedPlacesScreen from '../screens/SavedPlacesScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import ReceiptsScreen from '../screens/ReceiptsScreen';
import AboutScreen from '../screens/AboutScreen';
import LegalScreen from '../screens/LegalScreen';

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
      <Stack.Screen name="HomeScreen" component={Home} />
      <Stack.Screen name="YourRidesScreen" component={YourRidesScreen} />
      <Stack.Screen name="YourRideDetailsScreen" component={YourRideDetailsScreen} />
      <Stack.Screen name="MyAccountScreen" component={MyAccountScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen name="ContactScreen" component={ContactScreen} />
      <Stack.Screen name="SavedPlacesScreen" component={SavedPlacesScreen} />
      <Stack.Screen name="PreferencesScreen" component={PreferencesScreen} />
      <Stack.Screen name="ReceiptsScreen" component={ReceiptsScreen} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
      <Stack.Screen name="LegalScreen" component={LegalScreen} />
    </Stack.Navigator>
  );
};

export default Navigation;

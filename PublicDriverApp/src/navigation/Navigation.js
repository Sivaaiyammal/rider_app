import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LanguageScreen from '../screens/LanguageScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import OnBoardingScreen from '../screens/OnBoardingScreen';
import ThingsToKnow from '../screens/ThingsToKnow';
import LoginScreen from '../screens/LoginScreen';
import OTPscreen from '../screens/OTPscreen';
import HomeScreen from '../screens/HomeScreen';
import DriverVehiclesDetails from '../screens/DriverVehicleDetails/DriverVehiclesDetails';
import DocumentsListScreen from '../screens/DriverVehicleDetails/DocumentsListScreen';
import DocUploadScreen from '../screens/DriverVehicleDetails/DocUploadScreen';

const Navigation = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="OnBoardingScreen" component={OnBoardingScreen} />
       <Stack.Screen name="ThingsToKnow" component={ThingsToKnow}/>
       <Stack.Screen name="LoginScreen" component={LoginScreen}/>
       <Stack.Screen name="OTPScreen" component={OTPscreen}/>
       <Stack.Screen name="HomeScreen" component={HomeScreen}/>
       <Stack.Screen name="DriverVehiclesDetails" component={DriverVehiclesDetails}/>
       <Stack.Screen name="DocumentsListScreen" component={DocumentsListScreen}/>
       <Stack.Screen name="DocUploadScreen" component={DocUploadScreen}/>
    </Stack.Navigator>
  );
};

export default Navigation;

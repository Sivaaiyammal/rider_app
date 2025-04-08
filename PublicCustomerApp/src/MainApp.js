import {useColorScheme} from 'react-native';
import React, { useCallback, useEffect } from 'react';
import firebase from '@react-native-firebase/app';
import Navigation from './navigation/Navigation';
import {NavigationContainer} from '@react-navigation/native';
import {AlertNotificationRoot} from 'react-native-alert-notification';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { DataStore } from './controllers/DataStore';
import { ContextProvider } from './context/GlobalContext';
import firebaseConfig from '../firebaseConfig';

import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import PushNotifications from './controllers/PushNotification';


if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);

} 
  

const MainApp = () => {
  const appearance = useColorScheme();
  const setAppTheme = useCallback(async () => {
    const IS_FIRST = await DataStore.loadData('IS_FIRST');
    if (IS_FIRST.data === null) {
      DataStore.storeData('Theme', appearance);
      DataStore.storeData('IsDefault', true);
      DataStore.storeData('IS_FIRST', true);
    }
  }, []);

  async function requestPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  useEffect(() => {
    setAppTheme();
  }, [setAppTheme]);



useEffect(() => {
  requestPermission();
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('Message handled in the foreground!', remoteMessage);
    PushNotifications.sendNotification(remoteMessage.notification.body, remoteMessage.notification.title, remoteMessage.data)
  });

  messaging()
  .getInitialNotification()
  .then(remoteMessage => {
      PushNotifications.onRemoteNotificationHandler(remoteMessage)
  });

  // Listen for background messages
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });

  // PushNotifications.testTripReportNotification()
  // PushNotifications.scheduleNotification()

 

  messaging()
    .getToken()
    .then(token => {
      console.log('FCM Token:', token);
      // send to your backend if needed
    });
    // PushNotifications.scheduleNotification()

  return unsubscribe;
}, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
       <ContextProvider>
      <AlertNotificationRoot theme="light">
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </AlertNotificationRoot>
      </ContextProvider>
    </GestureHandlerRootView>
  );
};

export default MainApp;

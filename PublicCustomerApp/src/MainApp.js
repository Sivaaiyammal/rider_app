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
import PushNotifications from './controllers/PushNotification';
import { NetworkProvider, useNetwork } from './context/NetworkContext';
import NoNetworkOverlay from './components/NoNetworkOverlay';
import i18n from './i18n';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const MainAppContent = () => {
  const appearance = useColorScheme();
  const { isConnected, checkConnection } = useNetwork();

  const setAppTheme = useCallback(async () => {
    const IS_FIRST = await DataStore.loadData('IS_FIRST');
    if (IS_FIRST.data === null) {
      DataStore.storeData('Theme', appearance);
      DataStore.storeData('IsDefault', true);
      DataStore.storeData('IS_FIRST', true);
    }
  }, [appearance]);

  useEffect(() => {
    setAppTheme();
  }, [setAppTheme]);

  const initLanguage = async () => {
    const language = await DataStore.loadData('language');
    if(language.data){
      i18n.changeLanguage(language.data);
    }
  }

  useEffect(() => {
    initLanguage();
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

    messaging()
      .getToken()
      .then(token => {
        console.log('FCM Token:', token);
        // send to your backend if needed
      });

    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
       <ContextProvider>
        <AlertNotificationRoot theme="light">
          <NavigationContainer>
            <Navigation />
          </NavigationContainer>
          {!isConnected && (
            <NoNetworkOverlay onRetry={checkConnection} />
          )}
      </AlertNotificationRoot>
      </ContextProvider>
    </GestureHandlerRootView>
  );
};

const MainApp = () => (
  <NetworkProvider>
    <MainAppContent />
  </NetworkProvider>
);

export default MainApp;

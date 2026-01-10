import {useColorScheme ,StatusBar,Vibration,Linking} from 'react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import firebase from '@react-native-firebase/app';
import Navigation from './navigation/Navigation';
import { navigationRef } from './navigation/RootNavigation';
import {NavigationContainer} from '@react-navigation/native';
import {AlertNotificationRoot} from 'react-native-alert-notification';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { DataStore } from './common/controllers/DataStore';
import { ContextProvider } from './context/GlobalContext';
import firebaseConfig from '../firebaseConfig';
import messaging from '@react-native-firebase/messaging';
import { NetworkProvider, useNetwork } from './context/NetworkContext';
import NetworkBanner from './notCustomer/components/NetworkBanner';
import i18n from './common/i18n';
// import { useNearbyPollingControl } from './store/useNearByDriverPollingControl';
import FeedbackBottomSheet from './notCustomer/components/FeedbackBottomSheet';
import tripAlert from './common/controllers/TripAlert';
import { parseDeepLink } from './utils/DeepLink';
import DriverInitializationScreen from './notdriver/components/DriverInitializationScreen';
import DeviceInfo from 'react-native-device-info';
import useDeviceAPIStore from './common/store/useDeviceAPIStore';
import PushNotifications from './common/core/PushNotifications';


if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const MainAppContent = () => {
  const appearance = useColorScheme();
  const { isConnected, checkConnection } = useNetwork();
  const { setUserDeviceId } = useDeviceAPIStore();
 


  
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
    if(language.data && language.data !== 'languageDone'){
      i18n.changeLanguage(language.data);
    }
  }

  useEffect(() => {
    initLanguage();
    
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const notification = remoteMessage?.notification;
      const data = remoteMessage?.data || {};
      const title = data?.title ?? 'Notification';
      const body = notification?.body ?? data?.message ?? data?.body ?? '';

      const clearedtxt = title?.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').trim();
      
    
      if (clearedtxt == 'driver assigned') {

        tripAlert.playDriverAllocatedAlert();
        Vibration.vibrate();
      }
      PushNotifications.sendNotification(body, title, data);
    }); 



    messaging()
    .getInitialNotification()
    .then(remoteMessage => {
        PushNotifications.onRemoteNotificationHandler(remoteMessage)
    });

    // Listen for background messages
   


    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!',remoteMessage);
      // await PushNotifications.updateDataFromRequest(remoteMessage);
      const data = remoteMessage?.data || {};
       const title = data?.title ?? 'Notification';
        const clearedtxt = title?.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').trim();
      console.log('clearedtxt',clearedtxt);
      console.log(clearedtxt , '===','driver assigned');
      console.log(clearedtxt == 'driver assigned');
    
      if (clearedtxt == 'driver assigned') {
        console.log('Playing trip alert sound');
        tripAlert.playAlertSound()
        Vibration.vibrate();
      }
    })


    messaging()
      .getToken()
      

    return unsubscribe;
  }, []);

  function handleDeepLink(url) {

    console.log('Handling deep link URL:', url);
    if (!url) return;

    const parsed = parseDeepLink(url);
    if (!parsed) {
      console.warn('[DeepLink] Skipping deep link handling, parsing failed');
      return;
    }

    console.log('Parsed URL:', parsed);

    // parsed looks like:
    // {
    //   scheme: 'https',
    //   hostname: 'staging.vmmaps.com',
    //   path: 'trackingengine/customer',
    //   queryParams: { screen: 'login', rideId: '123' }
    // }

    const { hostname, path, queryParams } = parsed;
    const screen = queryParams?.screen;
 

    console.log('hostname:', hostname);
    console.log('path:', path);
    console.log('screen:', screen);
   
}



  useEffect(() => {
    try {
      // App opened from a deep link
      Linking.getInitialURL()
        .then((url) => {
          try {
            if (url) {
              console.log('[DeepLink] Initial URL:', url);
              handleDeepLink(url);
            } else {
              console.log('[DeepLink] No initial URL');
            }
          } catch (err) {
            console.error('[DeepLink] Error handling initial URL:', err);
          }
        })
        .catch((err) => {
          console.error('[DeepLink] getInitialURL failed:', err);
        });

      // App already running and receives a new link
      const sub = Linking.addEventListener('url', ({ url }) => {
        try {
          console.log('[DeepLink] Received URL event:', url);
          handleDeepLink(url);
        } catch (err) {
          console.error('[DeepLink] Error handling URL event:', err);
        }
      });

      return () => {
        try {
          sub?.remove();
        } catch (err) {
          console.error('[DeepLink] Error removing URL listener:', err);
        }
      };
    } catch (err) {
      console.error('[DeepLink] useEffect error:', err);
      return () => {};
    }
  }, []);

    useEffect(() => {
    DeviceInfo.getUniqueId().then(id => {
      setUserDeviceId(id)
    }).catch(err => {
      console.log(err)
    })
    return () => {
    }
  }, [])

    const memoizedDriverInitializationHandler = useMemo(
    () => <DriverInitializationScreen />,
    [],
  );
  

  return (
    <GestureHandlerRootView style={{flex: 1}}>
       
        <AlertNotificationRoot theme="light">
          <>
            <NavigationContainer ref={navigationRef}>
              <ContextProvider>
              {memoizedDriverInitializationHandler}
              <Navigation />
              </ContextProvider>
            </NavigationContainer>
            <FeedbackBottomSheet />
            {(!isConnected && (
              <NetworkBanner onRetry={checkConnection} />
            ))}
          </>
      </AlertNotificationRoot>
    </GestureHandlerRootView>
  );
};

const MainApp = () => (
  <NetworkProvider>
    <StatusBar barStyle="dark-content" backgroundColor={"white"} />
    <MainAppContent />
  </NetworkProvider>
);

export default MainApp;

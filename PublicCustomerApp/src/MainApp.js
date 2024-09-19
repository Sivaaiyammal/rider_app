import {useColorScheme} from 'react-native';
import React, { useCallback, useEffect } from 'react';
import Navigation from './navigation/Navigation';
import {NavigationContainer} from '@react-navigation/native';
import {AlertNotificationRoot} from 'react-native-alert-notification';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { DataStore } from './controllers/DataStore';
import { ContextProvider } from './context/GlobalContext';

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

  useEffect(() => {
    setAppTheme();
  }, [setAppTheme]);

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

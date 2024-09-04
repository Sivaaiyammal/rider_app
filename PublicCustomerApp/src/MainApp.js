import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Navigation from './navigation/Navigation';
import {NavigationContainer} from '@react-navigation/native';
import {AlertNotificationRoot} from 'react-native-alert-notification';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const MainApp = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AlertNotificationRoot theme="light">
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </AlertNotificationRoot>
    </GestureHandlerRootView>
  );
};

export default MainApp;

const styles = StyleSheet.create({});

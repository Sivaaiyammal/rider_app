import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Navigation from './navigation/Navigation';
import {NavigationContainer} from '@react-navigation/native';

const MainApp = () => {
  return (
    <NavigationContainer>
      <Navigation />
    </NavigationContainer>
  );
};

export default MainApp;

const styles = StyleSheet.create({});

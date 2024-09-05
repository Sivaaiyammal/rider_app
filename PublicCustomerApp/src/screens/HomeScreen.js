import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useStackScreenStore} from '../store/useStackScreenStore';
import MapScreen from './MapScreen';
import MapContainer from './Map';

const HomeScreen = () => {
  const {stackScreen} = useStackScreenStore();
  const renderContent = () => {
    switch (stackScreen[stackScreen.length - 1]) {
      case 'Home':
        return <MapScreen />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderContent()}
      <MapContainer />
    </>
  );
};

export default HomeScreen;
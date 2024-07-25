import { ScrollView, StyleSheet, View, TouchableOpacity, BackHandler } from 'react-native';
import React, { useEffect, useState } from 'react';

import InputContainer from '../Components/InputContainer';
import DraggableBottomSheet from '../Components/BottomSheet';
import { IconButton } from 'react-native-paper';
import { useStackScreenStore } from '../Store/useStackScreen';
import useMapStore from '../Store/useMapStore';

import CurrentLocationIcon from '../Assets/Icons/currentLocation.svg';
import DirectionsIcon from '../Assets/Icons/direction.svg';
import CustomTabBar from '../Components/CustomTabBar/CustomTabBar';
import POIScreen from './POIScreen';
import SettingsScreen from './SettingsScreen';

const HomeScreen = ({ }) => {
  const { setStackScreen } = useStackScreenStore();
  const { mode, setMode } = useMapStore();

  const clearText = () => {
    setSearchText('');
  };

  const handleFocus = () => {
    console.log('Focused');
    setStackScreen('Search');
  }

  useEffect(() => {
    const handleBackPress = () => {
      console.log('Back pressed');
      return true;
    };
    
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  const BottomSheet = () => (
    
    <View style={{ flex: 1 }}>

      <View style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
        <IconButton 
          icon="menu" 
          size={24} 
          containerColor='#fff' 
          color="#000" 
          onPress={() => {
            console.log('Pressed');
          }}
        />
      </View>

      <View style={{ position: 'absolute', top: 10, right: 0, zIndex: 1000 }}>
        <TouchableOpacity onPress={() => console.log('Pressed')}>
          <CurrentLocationIcon />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => console.log('Pressed')}>
          <DirectionsIcon />
        </TouchableOpacity>
      </View>

      <DraggableBottomSheet
        minHeightRatio={0.57}
        children={
          <View style={styles.screenContainer}>
            <InputContainer
              placeholder={'Search'}
              onFocus={handleFocus}
              value={''}
              onCancelPress={() => clearText()}
            />
            <POIScreen />
          </View>
        }
      />
    </View>
  );

  return (
    <>
      <CustomTabBar 
        menus={[
          {
            icon: 'home',
            name: 'Home',
            component: <BottomSheet />,
          }, {
            icon: 'moon',
            name: 'Mode',
            component: <View />,
            callBack: () => {
              setMode(mode === 'light' ? 'dark' : 'light');
            },
          }, {
            icon: 'language',
            name: 'Language',
            component: <View />,
          }, {
            icon: 'sun',
            name: 'Settings',
            component: <SettingsScreen />,
          }
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default HomeScreen;
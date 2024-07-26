import { ScrollView, StyleSheet, View, TouchableOpacity, BackHandler } from 'react-native';
import React, { useEffect, useState } from 'react';

import DraggableBottomSheet from '../../Components/BottomSheet';
import { IconButton } from 'react-native-paper';
import useMapStore from '../../Store/useMapStore';

import CurrentLocationIcon from '../../Assets/Icons/currentLocation.svg';
import DirectionsIcon from '../../Assets/Icons/direction.svg';
import CustomTabBar from '../../Components/CustomTabBar/CustomTabBar';
import SettingsScreen from '../SettingsScreen';
import ContentScreen from './content';

const HomeScreen = ({ }) => {
  const [dragHeight, setDragHeight] = useState(300);
  const { mode, setMode, setMapMarkers } = useMapStore();

  useEffect(() => {
    const handleBackPress = () => {
      console.log('Back pressed');
      return true;
    };

    setMapMarkers([]);

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
        minHeight={dragHeight}
        children={
          <ContentScreen setDragHeight={setDragHeight} />
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

export default HomeScreen;
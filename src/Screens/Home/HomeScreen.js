import { ScrollView, StyleSheet, View, TouchableOpacity, BackHandler, PermissionsAndroid } from 'react-native';
import React, { useEffect, useState } from 'react';

import DraggableBottomSheet from '../../Components/BottomSheet';
import { IconButton } from 'react-native-paper';
import useMapStore from '../../Store/useMapStore';

import CurrentLocationIcon from '../../Assets/Icons/currentLocation.svg';
import DirectionsIcon from '../../Assets/Icons/direction.svg';
import CustomTabBar from '../../Components/CustomTabBar/CustomTabBar';
import SettingsScreen from '../SettingsScreen';
import ContentScreen from './content';
import SearchInput from './searchInput';
import { useStackScreenStore } from '../../Store/useStackScreen';

const HomeScreen = ({ }) => {
  const [dragHeight, setDragHeight] = useState(300);
  const { mode, setMode, setMapMarkers } = useMapStore();
  const { setStackScreen } = useStackScreenStore();

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

  const handleCurrentScreen = () => {
    setStackScreen('Search');
  }

  const handleCurrentLocation = () => {

    let permission = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, 
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
    ]

    let granted = PermissionsAndroid.requestMultiple(permission)

    if(granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED){



    }

  }

  const BottomSheet = () => (
    <View style={{ flex: 1, marginTop: 10 }}>
      <View style={{
        // position: 'absolute',
        // top: 10, left: 10,
        // zIndex: 1000,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <IconButton
          icon="menu"
          size={24}
          containerColor='#fff'
          color="#000"
          onPress={() => {
            console.log('Pressed');
          }}
        />
        {/* <View style={{ width: '100%' }}> */}
          <SearchInput
            searchText={''}
            setCurrentScreen={handleCurrentScreen}
            focused={true}
            closeBtn={false}
          />
        {/* </View> */}

      </View>

      <View style={{ position: 'absolute', right: -10 }}>
        <TouchableOpacity onPress={() => {
          handleCurrentLocation()
        }}>
          <CurrentLocationIcon />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => console.log('Pressed')}>
          <DirectionsIcon />
        </TouchableOpacity>
      </View>

      {/* <DraggableBottomSheet
        minHeight={dragHeight}
        children={
          <ContentScreen setDragHeight={setDragHeight} />
        }
      /> */}
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
            icon: 'lightbulb',
            name: 'Mode',
            component: <View />,
            callBack: (icon) => {
              console.log('Mode pressed', icon);
              setMode(icon === 'lightbulb' ? 'dark' : 'light');
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
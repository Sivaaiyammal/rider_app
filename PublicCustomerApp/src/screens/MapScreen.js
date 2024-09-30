import {Animated, StyleSheet, Text, TouchableOpacity} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import SideDrawer from '../components/Drawer/SideDrawer';
import {colors, Fonts} from '../constants/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomSheet from '../components/BottomSheet';
import {useStackScreenStore} from '../store/useStackScreenStore';
import MapScreenHeader from '../components/MapScreenHeader';
import useLocationStore from '../store/useLocationStore';
import Marker from '../controllers/NEMap/Marker';
import useMapStore from '../store/useMapStore';

const MapScreen = () => {
  const [showMenu, setShowMenu] = useState(false);

  const {setStackScreen} = useStackScreenStore();
  const {location,setDirections, currentLocationName} = useLocationStore(); 
  const {setMapMarkers} = useMapStore();

  const scaleValue = useRef(new Animated.Value(1)).current;
  const offsetValue = useRef(new Animated.Value(0)).current;
  const closeButtonOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showMenu) {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(offsetValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(closeButtonOffset, {
          toValue: 0, 
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showMenu, scaleValue, offsetValue, closeButtonOffset]);

  const toggleMenu = () => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: showMenu ? 1 : 0.9, 
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(offsetValue, {
        toValue: showMenu ? 0 : 300, 
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(closeButtonOffset, {
        toValue: showMenu ? 0 : -30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    setShowMenu(!showMenu); 
  };

  const onSearchPress = () => {
    // if location set current loc as start else navigate
    if (location && currentLocationName) {
      const initialDirections = [
        {id: 1, name: 'Start', location: location, locationName: currentLocationName},
        {id: 2, name: 'End', location: [], locationName: ''},
      ]
      setDirections(initialDirections)
      const marker = new Marker(
        String(1),
        currentLocationName,
        location[0],
        location[1],
        'marker_start',
        36,
        true,
      );
      marker.setFocus(true);
      setMapMarkers([marker]);
      setStackScreen('SearchLocationScreen')
    } else {
      setStackScreen('SearchLocationScreen')
    }

  }

  return (
    <>
      <Animated.View
        style={[
          styles.animatedStyles,
          {
            borderRadius: 15,
            transform: [{scale: scaleValue}, {translateX: offsetValue}],
          },
        ]}>
        <Animated.View>
       <MapScreenHeader toggleMenu={toggleMenu} showMenu={showMenu}/>
        </Animated.View>
        <BottomSheet minHeight={150}>
          <TouchableOpacity
            style={styles.searchcontainer}
            onPress={() => onSearchPress()}>
            <Ionicons name={'search'} size={22} />
            <Text style={styles.searchcontainerTxt}>Search Destination</Text>
          </TouchableOpacity>
        </BottomSheet>
      </Animated.View>
      {showMenu && <SideDrawer />}
    </>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  animatedStyles: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  searchcontainer: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    gap: 10,
    marginTop: 20,
    borderWidth: 0.3,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  searchcontainerTxt: {
    fontFamily: Fonts.medium,
    color: colors.black,
  },
});

import {Animated, StyleSheet, Text, TouchableOpacity, StatusBar} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import SideDrawer from '../components/Drawer/SideDrawer';
import {colors, Fonts} from '../constants/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomSheet from '../components/BottomSheet';
import {useStackScreenStore} from '../store/useStackScreenStore';
import MapScreenHeader from '../components/MapScreenHeader';
import HistoryCard from '../components/historyCard';
import useLocationStore from '../store/useLocationStore';
import Marker from '../controllers/NEMap/Marker';
import useMapStore from '../store/useMapStore';
import LinearGradient from 'react-native-linear-gradient';

const MapScreen = () => {
  const [showMenu, setShowMenu] = useState(false);

  const {setStackScreen} = useStackScreenStore();
  const {location,directions,setDirections, currentLocationName,setSelectedInput} = useLocationStore(); 
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
    setDirections([])
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

  const onSearchPress = (element = 'rideNow') => {
    // In this function we handle navigation and state setup for click events from the ride now button and search box
    // Set initial directions with current location if available
    if (location && currentLocationName) {
      const initialDirections = [
        {
          id: 1,
          name: 'Start', 
          location: location,
          locationName: currentLocationName
        },
        {
          id: 2,
          name: 'End',
          location: [],
          locationName: ''
        }
      ];
      setDirections(initialDirections);

      // Add marker for current location
      const marker = new Marker(
        '1',
        currentLocationName,
        location[0],
        location[1],
        'marker_start',
        36,
        true
      );
      marker.setFocus(true);
      setMapMarkers([marker]);
      
      if (element === 'searchBox') {
        setSelectedInput(initialDirections[1]);
      }
    } else if (element === 'searchBox') {
      setSelectedInput(directions[1]);
    }

    if (element === 'rideNow') {
      //this  navigate to start and end location setting screen
      setStackScreen('SearchLocationScreen');
    } else if (element === 'searchBox') {
      //this navigate to search screen and adding search location screen in stack
      setStackScreen('SearchLocationScreen');
      setStackScreen('SearchScreen');
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff"  />
      <LinearGradient colors={['#FFFFFF', '#FFFFFF', 'rgba(255,255,255,0)']} style={{height:50,position:'absolute',top:0,left:0,right:0,zIndex:1}} ></LinearGradient>
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
        <BottomSheet minHeight={150} style={{zIndex: 1000}}>
          <TouchableOpacity
            style={styles.searchcontainer}
            onPress={() => onSearchPress('searchBox')}>
            <Ionicons name={'search'} size={22} color={'#757575'} />
            <Text style={styles.searchcontainerTxt}>Where you want to go ?</Text>
          </TouchableOpacity>
         
          <TouchableOpacity
            style={styles.buttoncontainer}
            onPress={() => onSearchPress()}>
            <Ionicons name={'car'} size={22} color={colors.white} />
            <Text style={styles.buttonTxt}>Ride Now</Text>
          </TouchableOpacity>
          <HistoryCard/>
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
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    alignItems: 'center',
    borderColor: '#e0e0e0',
  },
  buttoncontainer: {
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
    justifyContent: 'center',
    backgroundColor:'#4b48ab'

  },
  searchcontainerTxt: {
    fontFamily: Fonts.medium,
    color: '#757575',
  },
  buttonTxt: {
    fontFamily: Fonts.medium,
    color: colors.white,
  },
});

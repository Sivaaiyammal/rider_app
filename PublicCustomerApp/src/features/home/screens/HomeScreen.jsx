import {
  Animated, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  StatusBar, 
  View,
  Alert
} from 'react-native';
import React, {useEffect, useRef, useState, useCallback} from 'react';
import { useTranslation } from 'react-i18next';


import SideDrawer from '../../../components/Drawer/SideDrawer';
import {colors, Fonts} from '../../../constants/constants';
import BottomSheet from '../../../components/BottomSheet';
import {useStackScreenStore} from '../../../store/useStackScreenStore';
import LocationHeader from '../components/LocationHeader';
import HistoryCard from '../../shared/component/HistoryCard';
import LinearGradient from 'react-native-linear-gradient';
import SearchIcon from '../../../assets/icons/SearchIcon.svg';
import MapIcon from '../../../components/Map/MapIcon';
import FavLabelItems from '../components/FavLabelItems';
import useLocationStore from '../../../store/useLocationStore';
import  LocationTypes  from '../../booking/types/LocationTypes.json';  
import useRideBookingLocationStore from '../../booking/store/useRideBookingLocationStore'
import AdaptiveText from '../../../components/Common/AdaptiveText';
import { height } from '../../../utils/Utils';

const MapScreen = () => {
  const { t } = useTranslation();

  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState(null);
  const {setStackScreen} = useStackScreenStore();
  const {location,currentLocationName} = useLocationStore();
  const {setRideStartLocation,setRideEndLocation } = useRideBookingLocationStore()
 
  
  const scaleValue = useRef(new Animated.Value(1)).current;
  const offsetValue = useRef(new Animated.Value(0)).current;
  const closeButtonOffset = useRef(new Animated.Value(0)).current;


  const ANIMATION_CONFIG = {
    duration: 300,
    useNativeDriver: true,
  };


  const animateMenu = useCallback((toValue) => {
    try {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: toValue ? 0.9 : 1,
          ...ANIMATION_CONFIG,
        }),
        Animated.timing(offsetValue, {
          toValue: toValue ? 300 : 0,
          ...ANIMATION_CONFIG,
        }),
        Animated.timing(closeButtonOffset, {
          toValue: toValue ? -30 : 0,
          ...ANIMATION_CONFIG,
        }),
      ]).start();
    } catch (error) {
     console.log(error, 'animateMenu');
    }
  }, [scaleValue, offsetValue, closeButtonOffset]);

 
  const toggleMenu = useCallback(() => {
    try {
      animateMenu(!showMenu);
      setShowMenu(!showMenu);
    } catch (error) {
          console.log(error, 'toggleMenu');
    }
  }, [showMenu, animateMenu]);

  // Handle menu state changes
  useEffect(() => {
    if (!showMenu) {
      animateMenu(false);
    }
  
  }, [showMenu]);

  
  
  

  // Menu handler
  const handleMenu = useCallback(() => {
    try {
      setShowMenu(!showMenu);
    } catch (error) {
      console.log(error, 'handleMenu');
    }
  }, [showMenu]);

  // History press handler
  const onHistoryPress = useCallback((item) => {
    try {
      if (!item) {
        throw new Error('Invalid history item');
      }
      if (!location || !Array.isArray(location) || location.length < 2 || !currentLocationName) {
        Alert.alert(t('location_not_found'))
        return;
      }
      const locationData ={
        name:"Current Location",
        latitude:location[1],
        longitude:location[0],
        address:currentLocationName,
        type:LocationTypes.START_LOCATION,
        locationFrom:"MAP"
      }
      console.log("locationData",locationData);
      setRideStartLocation(locationData)
      setRideEndLocation(item)
      setStackScreen("PlanRideScreen",{})
     
     
    } catch (error) {
      console.log(error, 'onHistoryPress');
    }
  }, [location, currentLocationName, setRideStartLocation, setRideEndLocation, setStackScreen, t]);


  // Error component
  const ErrorMessage = () => (
    error && (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => setError(null)}
        >
          <Text style={styles.errorButtonText}>{t('dismiss')}</Text>
        </TouchableOpacity>
      </View>
    )
  );

  const handleFavouriteLocationPress = useCallback((locationType,labelLocation) => {
    try {
      console.log('Favourite location press:', locationType, labelLocation);
      if (!labelLocation) {
        return;
      }
      if(!location || !currentLocationName || !location.length){
        Alert.alert(t('location_not_found'))
        return;
      }
      const locationData ={
        name:"Current Location",
        latitude:location[1],
        longitude:location[0],
        address:currentLocationName,
        type:LocationTypes.START_LOCATION,
        locationFrom:"MAP"
      }
      setRideStartLocation(locationData)
      setRideEndLocation(labelLocation)
      setStackScreen("PlanRideScreen",{})
    } catch (error) {
      console.log(error, 'handleFavouriteLocationPress');
    }
    
  }, [location, currentLocationName, setRideStartLocation, setRideEndLocation, setStackScreen, t]);

  const makeRidePlan=()=>{

    if(!location || !currentLocationName || !location.length){
      Alert.alert(t('location_not_found'))
      return;
    }

    const locationData ={
      name:"Current Location",
      latitude:location[1],
      longitude:location[0],
      address:currentLocationName,
      type:LocationTypes.START_LOCATION,
      locationFrom:"MAP"
    }
    setRideStartLocation(locationData)
  
    setStackScreen("PlanRideScreen",{})
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF', 'rgba(255,255,255,0)']}
        style={styles.gradientOverlay}
      />

      <Animated.View style={styles.headerContainer}>
            <LocationHeader toggleMenu={toggleMenu} showMenu={showMenu} />
      </Animated.View>

      <BottomSheet minHeight={height*0.4}  HeaderComponent={<MapIcon />}>
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={makeRidePlan}
          
        >
          <SearchIcon />
          <AdaptiveText style={styles.searchContainerText}>
            {t('where_do_you_want_to_go')}
          </AdaptiveText>
        </TouchableOpacity>

        <FavLabelItems onLabelPress={handleFavouriteLocationPress}/>

        <HistoryCard selectCallback={onHistoryPress} header={false} bottomborder={false} />
      </BottomSheet>

      {showMenu && <SideDrawer handleMenu={handleMenu} />}
      <ErrorMessage />
    </>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 2,
  },
  gradientOverlay: {
    height: 50,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    gap: 10,
    marginTop: 20,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    gap: 10,
    marginTop: 20,
    borderWidth: 0.3,
    paddingVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4b48ab',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  searchContainerText: {
    fontFamily: Fonts.regular,
  
    fontSize: 16,
      
    textAlign: 'left',
    color: '#121212',
  },
  buttonText: {
    fontFamily: Fonts.medium,
    color: colors.white,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    color: colors.white,
    fontFamily: Fonts.medium,
  },
  errorContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    zIndex: 1000,
  },
  errorText: {
    color: '#c62828',
    fontFamily: Fonts.medium,
    marginBottom: 10,
  },
  errorButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#f44336',
    borderRadius: 5,
  },
  errorButtonText: {
    color: colors.white,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
});

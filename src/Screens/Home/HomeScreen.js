import { ScrollView, StyleSheet, View, TouchableOpacity, BackHandler, PermissionsAndroid, Alert, Linking } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import DraggableBottomSheet from '../../Components/BottomSheet';
import { IconButton } from 'react-native-paper';
import useMapStore from '../../Store/useMapStore';
import Geolocation from 'react-native-geolocation-service';

import Marker from '../../Constants/NEMap/Marker';

import CurrentLocationIcon from '../../Assets/Icons/currentLocation.svg';
import DirectionsIcon from '../../Assets/Icons/direction.svg';
import CustomTabBar from '../../Components/CustomTabBar/CustomTabBar';
import SettingsScreen from '../Settings/SettingsScreen';
import ContentScreen from './content';
import SearchInput from './searchInput';
import { useStackScreenStore } from '../../Store/useStackScreen';
import useLocationStore from '../../Store/useLocationStore';
import PositionBasedView from '../../Components/positingView';
import Drawer from '../../Components/Drawer/Drawer';
import GlobalContext from '../../Context/GlobalContext';
import locationTask from '../../Controllers/GetCurrentLocation';
import { checkFineLocationPermissions, RequestFineLocationPermission } from '../../Controllers/PermissionHandler';

const HomeScreen = ({ }) => {
  const [centerPoints, setCenterPoints] = useState(null);
  const [latLng, setLatLng] = useState({ lat: 37.7749, lng: -122.4194 });
  const [positioningView, setPositioningView] = useState(false);
  const [dragHeight, setDragHeight] = useState(300);
  const { mapMoving, setMapMoving, setOnMapCenterChanged, setMode, setMapMarkers, setMapLocation, setMapClickCallback } = useMapStore();
  const { setStackScreen } = useStackScreenStore();
  const { setLocation, setDirections } = useLocationStore();

  const {themeOperations, themeValue} = useContext(GlobalContext);

  const checkLocationPermission = useCallback(async (value) => {
    const locationPermissionCheck = await checkFineLocationPermissions()
    if (locationPermissionCheck) {
      getLocation();
    } else {
     await RequestFineLocationPermission()
    }
    console.log('hari-->>mapScreen-->>1')
  }, [checkFineLocationPermissions]);

  useEffect(() => {
    const handleBackPress = () => {
      console.log('Back pressed');
      return true;
    };

    const directions = [
      {
        id: 1,
        name: "Start",
        location: [],
        locationName: "",
      },
      { id: 2, name: "Waypoint", location: [], locationName: "" },
      { id: 3, name: "End", location: [], locationName: "" },
    ]
    setDirections(directions);

    checkLocationPermission();
    setMapMarkers([]);
    setOnMapCenterChanged(mapCenterChanged);
    setMapClickCallback(mapClickCallback);

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  const getLocation = async () => {
    await locationTask.getCurrentLocation()
  }

  const mapCenterChanged = (data) => {

    if (!centerPoints && data.latitude && data.longitude) {

      // const marker = new Marker(
      //   "centerPoints-1",
      //   "Home",
      //   data.latitude,
      //   data.longitude,
      //   "location_pin",
      //   36,
      //   true
      // )

      // setCenterPoints(marker)
      // setMapMarkers([...mapMarkers, marker])
      setLatLng({ lat: data.longitude, lng: data.latitude })
      setPositioningView(data.moving)
      setMapMoving(data.moving);
    }

    if (centerPoints && data.latitude && data.longitude) {

      // const updatedMarker = new Marker(
      //   "centerPoints-1",
      //   "Home",
      //   data.latitude,
      //   data.longitude,
      //   "location_pin",
      //   36,
      //   true
      // )

      // setCenterPoints(updatedMarker)
      // setMapMarkers(mapMarkers.map(marker =>
      //   marker.id === "centerPoints-1" ? updatedMarker : marker
      // ))

      setLatLng({ lat: data.longitude, lng: data.latitude })
      setPositioningView(data.moving)
      setMapMoving(data.moving);
    }

  }

  const mapClickCallback = (data) => {
    setPositioningView(false)
    setLatLng({ lat: data.latitude, lng: data.longitude })
    setPositioningView(true)
    setMapMoving(true);
  }

  const changeTheme = (icon) => {
    if (icon === 'lightbulb') {
      themeOperations('light')
      setMode('light')
    } else {
      themeOperations('dark')
      setMode('dark')
    }
  }


  const BottomSheet = () => (
    <View style={{ flex: 1, marginTop: 10 }}>
    <Drawer />

      <View style={{ position: 'absolute', right: -10 }}>
        <TouchableOpacity onPress={checkLocationPermission}>
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
      {positioningView && <PositionBasedView latLng={latLng} setPositioningView={setPositioningView} />}
      <CustomTabBar
        menus={[
          {
            icon: 'home',
            name: 'Home',
            component: <BottomSheet />,
          }, {
            icon: themeValue === 'dark' ? 'lightbulb' : 'moon',
            name: 'Mode',
            component: <View />,
            callBack: (icon) => {
              console.log('Mode pressed', icon);
              changeTheme(icon)
            },
          }, {
            icon: 'language',
            name: 'Language',
            component: <View />,
            callBack: (icon) => {
              console.log('Lan pressed', icon);
            },
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
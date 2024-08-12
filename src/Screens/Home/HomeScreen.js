import { ScrollView, StyleSheet, View, TouchableOpacity, BackHandler, PermissionsAndroid, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';

import DraggableBottomSheet from '../../Components/BottomSheet';
import { IconButton } from 'react-native-paper';
import useMapStore from '../../Store/useMapStore';
import Geolocation from 'react-native-geolocation-service';

import Marker from '../../Constants/NEMap/Marker';

import CurrentLocationIcon from '../../Assets/Icons/currentLocation.svg';
import DirectionsIcon from '../../Assets/Icons/direction.svg';
import CustomTabBar from '../../Components/CustomTabBar/CustomTabBar';
import SettingsScreen from '../SettingsScreen';
import ContentScreen from './content';
import SearchInput from './searchInput';
import { useStackScreenStore } from '../../Store/useStackScreen';
import useLocationStore from '../../Store/useLocationStore';
import PositionBasedView from '../../Components/positingView';
import Drawer from '../../Components/Drawer/Drawer';

const HomeScreen = ({ }) => {
  const [centerPoints, setCenterPoints] = useState(null);
  const [latLng, setLatLng] = useState({ lat: 37.7749, lng: -122.4194 });
  const [positioningView, setPositioningView] = useState(false);
  const [dragHeight, setDragHeight] = useState(300);
  const { mapMoving, setMapMoving, setOnMapCenterChanged, setMode, setMapMarkers, setMapLocation, setMapClickCallback } = useMapStore();
  const { setStackScreen } = useStackScreenStore();
  const { setLocation, setDirections } = useLocationStore();

  useEffect(() => {
    const handleBackPress = () => {
      console.log('Back pressed');
      return true;
    };

    const checkLocationPermission = async () => {
      const locationPermissionCheck = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

      if (locationPermissionCheck) {
        getLocation();
        return true
      }
    }

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

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation([position.coords.longitude, position.coords.latitude]);
        setMapLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          zoom: 25,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000,
      }
    );
  }

  const handleCurrentLocation = async () => {
    try {
      const locationPermissionCheck = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

      if (locationPermissionCheck) {
        getLocation();
        return true
      }

      const grantedLocation = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ]);

      if (grantedLocation['android.permission.ACCESS_FINE_LOCATION'] !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("One or more permissions denied");

        if (grantedLocation['android.permission.ACCESS_FINE_LOCATION'] === 'never_ask_again') {
          Alert.alert(
            "Permission Required",
            "Location permission is required. Please enable it in the app settings.",
            [
              { text: "Open Settings", onPress: () => Linking.openSettings() }
            ]
          );
        } else {
          Alert.alert(
            "Permission Denied",
            "Location permission is required. Please enable it in the app settings.",
            [
              { text: "Open Settings", onPress: () => Linking.openSettings() }
            ]
          );
        }
        return false
      } else {
        console.log("Location permissions granted");
        getLocation();
        return true
      }

    } catch (err) {
      console.warn(err);
      setLocation(false);
      return false
    }

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
    console.log("mapClickCallback", data)
    setLatLng({ lat: data.latitude, lng: data.longitude })
    setPositioningView(true)
    setMapMoving(true);
  }

  const BottomSheet = () => (
    <View style={{ flex: 1, marginTop: 10 }}>
    <Drawer />

      <View style={{ position: 'absolute', right: -10 }}>
        <TouchableOpacity onPress={handleCurrentLocation}>
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
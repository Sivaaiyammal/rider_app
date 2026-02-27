import {StyleSheet, Text, View, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {use, useCallback, useEffect, useMemo, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Marker from '../../map/Marker';
import locationTask from '../../controllers/GetCurrentLocation';
import { Colors, Icons } from '../../constants/constants';
import { useMapMarkerStore } from '../../store/useMapMarkerStore';
import { checkFineLocationPermissions, RequestFineLocationPermission } from '../../controllers/PermissionHandler';
import { showNotification } from './showNotification';
import { useTranslation } from 'react-i18next';
import useHotSpotStore from '../../../notdriver/store/useHotSpotStore';
import { height } from '../../utils/scalingutils';

const mapIconSet = [
  {
    id: 1,
    name: 'currentLocation',
    icon: Icons.currentLoc,
    accessibilityLabel: 'Current Location',
  },

   {
   id: 2,
        name: 'FitToMarkers',
        icon: Icons.fitToMarkers,
        accessibilityLabel: 'Fit to Markers',
      },
        {
    id: 3,
    name: 'refreshDirections',
    icon: <Ionicons name='refresh-outline' size={24} color={Colors.black} />,
    accessibilityLabel: 'refreshDirections',
  },
];

function GetDevicesBoundingBox(devices) {
  if (!devices || devices.length === 0) {
    return null;
  }
  let minLat = Number.MAX_VALUE;
  let maxLat = Number.MIN_VALUE;
  let minLon = Number.MAX_VALUE;
  let maxLon = Number.MIN_VALUE;

  if(!devices?.locations || devices?.locations?.length === 0) 
  return null;

  devices?.locations?.map(device => {
    if (!device) return;
    if (device) {
      const {lat, lon} = device;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }
  });

  if (
    minLat === Number.MAX_VALUE ||
    maxLat === Number.MIN_VALUE ||
    minLon === Number.MAX_VALUE ||
    maxLon === Number.MIN_VALUE
  ) {
    return null;
  }

  return [minLon, minLat, maxLon, maxLat];
}

const TrackingMapIcons = props => {
  const {markersData, isDriverLocation, currentLocationCallBack, refreshDirections, onlyLocation, ishomeDriver} = props;
  const {setMapLocation, setMapBounds, setUserLocation, setMapMarkers,mapMarkers, userLocation} = useMapMarkerStore();
  const [loading, setLoading] = useState(false)
  const {t} = useTranslation();

  const {hotSportMarkers} = useHotSpotStore()

  const setUserMarker  = (latitude, longitude) => {
    setUserLocation([latitude, longitude])
        setMapLocation({
          lat: latitude,
          lng: longitude,
          zoom: 16,
        });
          const userMarker = new Marker(
          'locations1',
          'userMarker',
          longitude,
          latitude,
          'pin_inactive',
          36,
          false,
        );
        const newMarkers = [userMarker]
        if (mapMarkers.find(marker => marker?.id !== 'locations1')) {
          setMapMarkers(newMarkers)
        }
        setLoading(false)
  }

  const getUserLocation = async () =>{
    await locationTask.getCurrentLocation().then((position) => {
      if (isDriverLocation) {
        currentLocationCallBack(position)
      } else {
        setUserMarker(position.coords.latitude, position.coords.longitude)
        
      }
    })
  }

  const getCurrentLocation = async () => {
    const isLocationPermitted = await checkFineLocationPermissions();
    if (!isLocationPermitted) {
      const hasLocationpermission = await RequestFineLocationPermission();
      if (!hasLocationpermission) {
        showNotification(
          t('loc_permission_denied'),
          t('grant_loc_permission'),
          'danger',
          3000,
        );
        return;
      }
    }
    getUserLocation();
  };

  const filterMarkersWithin50km = (markers) => {
    if (!markers || markers.length === 0) return [];

    if (userLocation === null || userLocation.length !== 2) return markers;

    const [currentLat, currentLon] = userLocation;

    // Haversine distance function
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
    
    // Filter markers within 50km of current location
    return markers.filter(marker => {
      if (!marker) return false;
      // Support both {latitude, longitude} and {lat, lon}
      let lat = marker.latitude;
      let lon = marker.longitude;
      if (typeof lat !== 'number' || typeof lon !== 'number') {
        lat = marker.lat;
        lon = marker.lon;
      }
      if (typeof lat !== 'number' || typeof lon !== 'number') return false;
      const dist = getDistanceFromLatLonInKm(currentLat, currentLon, lat, lon);
      return dist <= 50;
    });
  }

  const fitToHotSpot = (markers) => {
   if (!markers || markers?.length === 1) {
    return null;
  }
  const newMarkers = filterMarkersWithin50km(markers);

  let minLat = Number.MAX_VALUE;
  let maxLat = Number.MIN_VALUE;
  let minLon = Number.MAX_VALUE;
  let maxLon = Number.MIN_VALUE;

  newMarkers?.map(marker => {
    if (!marker) return;
    if (marker) {
      const {latitude, longitude} = marker;
      if (latitude < minLat) minLat = latitude;
      if (latitude > maxLat) maxLat = latitude;
      if (longitude < minLon) minLon = longitude;
      if (longitude > maxLon) maxLon = longitude;
    }
  });

  if (
    minLat === Number.MAX_VALUE ||
    maxLat === Number.MIN_VALUE ||
    minLon === Number.MAX_VALUE ||
    maxLon === Number.MIN_VALUE
  ) {
    return null;
  }

  return [minLon, minLat, maxLon, maxLat];
  }

  const fitToBounds = useCallback(async () => {
    if (ishomeDriver) {
      const bBox = fitToHotSpot(hotSportMarkers)
      if (bBox === null || !bBox) return 
      setMapBounds([bBox, [350, height *0.5, 350, height *0.49]]);
    } else {
      const bBox = GetDevicesBoundingBox(markersData);
      if (bBox === null || !bBox) return 
      setMapBounds([bBox, [70, 70, 100, 250]])
    }
  }, [markersData?.locations, hotSportMarkers]);

  const mapIconsPress = item => {
    if (item.name === 'currentLocation') {
      getCurrentLocation();
    } else if (item.name === 'FitToMarkers') {
      fitToBounds();
    } else {
      refreshDirections();
    }
  };

  const mapSet = () => {
    if (onlyLocation) {
      // Hide both FitToMarkers and refreshDirections
      return mapIconSet.filter(item => item?.name !== 'refreshDirections' && item?.name !== 'FitToMarkers')
    } else if (!refreshDirections || refreshDirections === null) {
      // Only hide refreshDirections
      return mapIconSet.filter(item => item?.name !== 'refreshDirections')
    } else {
      return mapIconSet
    }
  }

  return mapSet().map(item => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.mapIconBtns}
        onPress={() => mapIconsPress(item)}>
        {(item.id === 1 && loading) ? <ActivityIndicator /> : item.icon}
      </TouchableOpacity>
    );
  });
};

export default TrackingMapIcons;

const styles = StyleSheet.create({
  mapIconBtns: {
    backgroundColor: Colors.white,
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 3, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 5,
    zIndex:9
  },
  SOSBtn: {
    backgroundColor: Colors.red,
    alignItems: 'center',
    width: 45,
    height: 45,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {width: 3, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 5,
    justifyContent: 'center',
  },
  SOSBtnTxt: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'BebasNeue',
  },
});

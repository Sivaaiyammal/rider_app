import {StyleSheet, Text, View, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Marker from '../../map/Marker';
import locationTask from '../../controllers/GetCurrentLocation';
import { Colors, Icons } from '../../constants/constants';
import { useMapMarkerStore } from '../../store/useMapMarkerStore';
import { checkFineLocationPermissions, RequestFineLocationPermission } from '../../controllers/PermissionHandler';
import { showNotification } from './showNotification';

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
  const {markersData, isDriverLocation, currentLocationCallBack, refreshDirections,} = props;
  const {setMapLocation, setMapBounds, setUserLocation, setMapMarkers, directionPoints,mapMarkers} = useMapMarkerStore();
  const [loading, setLoading] = useState(false)

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
          t.loc_permission_denied,
          t.grant_loc_permission,
          'danger',
          3000,
        );
        return;
      }
    }
    getUserLocation();
  };

  const fitToBounds = useCallback(async () => {
    const bBox = GetDevicesBoundingBox(markersData);
    if (!bBox) return showNotification(t['unable_to_zoom'], '', 'info');
    setMapBounds([bBox, [70, 70, 100, 250]]);
  }, [markersData?.locations]);

  const mapIconsPress = item => {
    if (item.name === 'currentLocation') {
      getCurrentLocation();
    } else if (item.name === 'FitToMarkers') {
      fitToBounds();
    } else {
      refreshDirections();
    }
  };

  const mapSet = !refreshDirections || refreshDirections === null ? mapIconSet.filter(item => item?.name !== 'refreshDirections') : mapIconSet;

  return mapSet.map(item => {
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

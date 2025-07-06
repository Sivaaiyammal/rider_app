import { Text, StyleSheet, View, Image } from 'react-native';
import React, { Component } from 'react';
import { HomeScreenContext } from '../Home/HomeScreen';

import { useStackScreenStore } from '../store/useStackScreenStore';
import useSelectedVehicleStore from '../store/useSelectedVehicleStore';
import useLocationStore from '../store/useLocationStore';
import useMapStore from '../features/map/store/useMapStore';
import useRideSelectionStore from '../store/useRideSelectionStore';

import Pulse from '../components/Pulse';
import SwipeBtn from '../components/SwipeBtn';
import vehicle_search from '../assets/image/Trips/vehicle_search.png';
import BottomSheet from '../components/BottomSheet';
import { commonStyles } from '../styles/VehicleSearchLoaderStyle';
import { showNotification } from '../components/NotificationManger';
import { useEffect } from 'react';
import useMapStyleStore from '../store/useMapStyleStore';
const VehicleSearchLoader = ({ onCancel }) => {

  const { goBack, reset: screenStoreReset, setStackScreen } = useStackScreenStore();
  const { setMapStyle } = useMapStyleStore();
  const { selectedVehicle } = useSelectedVehicleStore();
  const { directions, setDirections } = useLocationStore();
  const { selectedTrip, selectedRide } = useRideSelectionStore();
  const {
    setOnSearchResults,
    setMapMarkers,
    setDirectionPoints,
    setSearchUnit,
    directionPoints,
  } = useMapStore();

  useEffect(() => {
    setTimeout(() => {
      setMapStyle({
        width: "100%",
        height: "100%",
        transition: 'all 5s ease-in-out',
      });
    }, 5000);
  }, []);

  const cancelSearching = async (label) => {

    showNotification('Ride Cancelled', 'Your ride has been cancelled', 'success');

    setDirections([
      { id: 1, name: 'Start', location: [], locationName: '' },
      { id: 2, name: 'End', location: [], locationName: '' },
    ]);
    setOnSearchResults(null);
    setMapMarkers([]);
    setDirectionPoints(null);
    setSearchUnit('');
    screenStoreReset()

    await locationTask.getCurrentLocation();
  };

  return (
    <BottomSheet>
      <View style={commonStyles.search_container_driver}>
        <View style={commonStyles.search_pulseContainer}>
          <Pulse style={{ bottom: 20 }} />
        </View>
        <View>
          <View style={commonStyles.searchVehicle_textContainer}>
            <View style={commonStyles.search_containercenter}>
              <Image style={commonStyles.search_image} source={vehicle_search} />
              <Text style={commonStyles.search_boldText}>Searching for Taxi...</Text>
              <Text>Your ride will start soon</Text>
            </View>
          </View>
        </View>
        <View style={commonStyles.search_container_driver}>
          <SwipeBtn
            name="Slide to Cancel"
            onHandleSwipeEnd={() => cancelSearching('vehicle name')}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

export default VehicleSearchLoader;
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import NavBar from '../components/NavBar';
import {useStackScreenStore} from '../store/useStackScreenStore';
import useSelectedVehicleStore from '../store/useSelectedVehicleStore';
import useLocationStore from '../store/useLocationStore';
import useMapStore from '../store/useMapStore';

import useRideSelectionStore from '../store/useRideSelectionStore';
import BottomSheet from '../components/BottomSheet';
import {vehicleDetailsStyles} from '../styles/VehicleDetails';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {showNotification} from '../components/NotificationManger';
import {usePostQuery} from '../hooks/useQuery';
import locationTask from '../controllers/GetCurrentLocation';

import SearchLoader from '../components/Loaders/SearchLoader';
import {createRideMutation} from '../API/APICalls/RideAPICalls';
import FullScreenLoader from '../components/Loaders/FullScreenLoader';
import SelectedVehicleDetails from '../components/SelectedVehicleDetails';

const SelectedVehicle = () => {
  const navigation = useNavigation();

  const {goBack, setStackScreen} = useStackScreenStore();
  const {selectedVehicle} = useSelectedVehicleStore();
  const {directions, setDirections} = useLocationStore();
  const {selectedTrip, selectedRide} = useRideSelectionStore();
  const {
    setOnSearchResults,
    setMapMarkers,
    setDirectionPoints,
    setSearchUnit,
    directionPoints,
  } = useMapStore();

  const [isLoading, setIsLoading] = useState('');

  const onBackPress = () => {
    goBack();
  };

  const getRideTypeValue = type => {
    if (type == '1') return 'one_way';
    if (type == '2') return 'round_trip';
    return 'one_way';
  };
  const getTripTypeValue = type => {
    if (type == '1') return 'instant';
    if (type == '2') return 'schedule';
    return 'instant';
  };
  const getVehicleTypeValue = type => {
    if (type == '1') return 'bike';
    return 'car';
  };

  const onBookingSuccess = data => {
    if (data.success) {
      showNotification('Booking Completed Successfully', '', 'success');
      setIsLoading(true);

      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        setStackScreen('DriverAssignedScreen');
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  };

  const {mutate: BookingMutate, isLoading: isBookRideLoading} =
    createRideMutation(onBookingSuccess);

  const HandleBookRide = async () => {
    if (directions.length < 2) {
     showNotification(
        'Please select start and end location',
        'Please select start and end location',
        'danger',
      );
      return
    }
    if (!selectedVehicle || Object.keys(selectedVehicle).length <= 0) {
       showNotification(
        'Please select a vehicle',
        'Please select a vehicle',
        'danger',
      );
      return
    }

    let start_location = directions.filter(item => item.name == 'Start')[0];
    let end_location = directions.filter(item => item.name == 'End')[0];
    let waypoints = directions.filter(item => item.name == 'Waypoint');
    let trip_type = getTripTypeValue(selectedTrip.id);
    let ride_type = getRideTypeValue(selectedRide.id);
    let vehicle_type = getVehicleTypeValue(selectedVehicle.id);

    let payload = {
      startLocation: {
        location: start_location.location,
        address: start_location.locationName,
      },
      endLocation: {
        location: end_location.location,
        address: end_location.locationName,
      },
      waypoints: waypoints.map(item => {
        return {location: item.location, address: item.locationName};
      }),
      rideType: ride_type,
      vehicleType: vehicle_type,
    };
    BookingMutate(payload);
  };

  console.log('hari-->>selectedRide-->>',isBookRideLoading)

  return (
    <>
      {isLoading ? (
        <SearchLoader />
      ) : (
        <>
          {isBookRideLoading && (
            <View style={{width: '100%', height: '100%', zIndex: 9999}}>
              <FullScreenLoader />
            </View>
          )}
          <NavBar withBg title={'Choose Your Ride'} onBackPress={onBackPress} />
          <SelectedVehicleDetails
            selectedVehicle={selectedVehicle}
            HandleBookRide={HandleBookRide}
            selectedRide={selectedRide}
          />
        </>
      )}
    </>
  );
};

export default SelectedVehicle;

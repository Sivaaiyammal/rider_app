import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import { useStackScreenStore } from '../store/useStackScreenStore';
import useSelectedVehicleStore from '../store/useSelectedVehicleStore';
import useLocationStore from '../store/useLocationStore';
import useMapStore from '../store/useMapStore';

import useRideSelectionStore from '../store/useRideSelectionStore';
import BottomSheet from '../components/BottomSheet';
import { vehicleDetailsStyles } from '../styles/VehicleDetails';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { showNotification } from '../components/NotificationManger';
import { usePostQuery } from '../hooks/useQuery';
import locationTask from '../controllers/GetCurrentLocation';


import PeopleBlack from '../assets/image/peopleBlack.svg';
import DurationBlack from '../assets/image/durationBlack.svg';
import FareGreen from '../assets/image/fareGreen.svg';
import Rocket from '../assets/image/svgIcons/rocket.svg';
import EndBlack from '../assets/image/svgIcons/end_black.svg';
import SearchLoader from '../components/Loaders/SearchLoader';

const SelectedVehicle = () => {

  const navigation = useNavigation();

  const { goBack, reset: screenStoreReset, setStackScreen } = useStackScreenStore();
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

  const [isLoading, setIsLoading] = useState('')

  const onBackPress = () => {
    goBack();
  };

  const getLocationIcon = item => {
    switch (item.name) {
      case 'Start':
        return <Rocket />;
      case 'End':
        return <EndBlack />;
    }
  };

  const getRideTypeValue = (type) => {
    if (type == '1') return 'one_way';
    if (type == '2') return 'round_trip';
    return 'one_way'
  }
  const getTripTypeValue = (type) => {
    if (type == '1') return 'instant';
    if (type == '2') return 'schedule';
    return 'instant'
  }
  const getVehicleTypeValue = (type) => {
    if (type == '1') return 'bike';
    return 'car'
  }

  const onBookingSuccess = async (data) => {

    console.log(data, 'data');

    if (data.success) {

      showNotification('Booking Completed Successfully', 'Booking Completed Successfully', 'success');

      setDirections([
        { id: 1, name: 'Start', location: [], locationName: '' },
        { id: 2, name: 'End', location: [], locationName: '' },
      ]);
      setOnSearchResults(null);
      setMapMarkers([]);
      goBack();
      setDirectionPoints(null);
      setSearchUnit('');
      await locationTask.getCurrentLocation();
      screenStoreReset()
    } else {
      showNotification('Please try again', data.message, 'danger');
    }

  }

  const onBookingError = (data) => {
    if (!data.success) showNotification('Please try again', data.message, 'danger');

  }

  const { mutate: BookingMutate, isSuccess } = usePostQuery({
    onSuccess: onBookingSuccess,
    onError: onBookingError
  });

  const HandleBookRide = async () => {

    if (directions.length < 2) {
      return showNotification('Please select start and end location', 'Please select start and end location', 'danger');
    }
    if (!selectedVehicle || Object.keys(selectedVehicle).length <= 0) {
      return showNotification('Please select a vehicle', 'Please select a vehicle', 'danger');
    }

    let start_location = directions.filter(item => item.name == 'Start')[0]
    let end_location = directions.filter(item => item.name == 'End')[0]
    let waypoints = directions.filter(item => item.name == 'Waypoint')
    let trip_type = getTripTypeValue(selectedTrip.id)
    let ride_type = getRideTypeValue(selectedRide.id)
    let vehicle_type = getVehicleTypeValue(selectedVehicle.id)

    let payload = {
      startLocation: {
        location: start_location.location,
        address: start_location.locationName
      },
      endLocation: {
        location: end_location.location,
        address: end_location.locationName
      },
      waypoints: waypoints.map(item => { return { location: item.location, address: item.locationName } }),
      rideType: ride_type,
      vehicleType: vehicle_type
    }


    await BookingMutate({
      queryKey: 'rideBookingQuery',
      url: '/customer/ride/create',
      payload: payload
    })

  }

  const _HandleBookRide = () => {
    setIsLoading(true)
    // setTimeout(() => {

    // }, 3000);

    setStackScreen('VehicleSearchLoader')

  }


  return (
    <>
      <NavBar withBg title={'Choose Your Ride'} onBackPress={onBackPress} />
      <BottomSheet>
        <View style={vehicleDetailsStyles.detailsContainer}>
          <Image
            source={selectedVehicle.Image}
            style={{ width: 120, aspectRatio: 1 }}
          />
          <View>
            <Text style={vehicleDetailsStyles.name}>
              {selectedVehicle.name}
            </Text>
            <Text style={vehicleDetailsStyles.durationTxt}>
              {' '}
              <DurationBlack /> {selectedVehicle.duration}
            </Text>
            <Text style={vehicleDetailsStyles.durationTxt}>
              {' '}
              <PeopleBlack /> {selectedVehicle.count}
            </Text>
            <Text style={vehicleDetailsStyles.fareTxt}>
              <FareGreen /> {selectedVehicle.total_price}
            </Text>
          </View>
        </View>
        <View style={vehicleDetailsStyles.locationContainer}>
          {directions.map(item => {
            return (
              <View key={item.id} style={vehicleDetailsStyles.locationNames}>
                {getLocationIcon(item)}
                <Text style={vehicleDetailsStyles.locationTxt}>
                  {item.locationName}
                </Text>
              </View>
            );
          })}
        </View>
        <TouchableOpacity style={vehicleDetailsStyles.paymentContainer}>
          <Text style={vehicleDetailsStyles.paymentTxt}>Payment Method</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={vehicleDetailsStyles.cnfrmBtn}
          onPress={_HandleBookRide}
        >
          <Text style={vehicleDetailsStyles.cnfrmBtnTxt}>Confirm {selectedVehicle.name} Ride</Text>
        </TouchableOpacity>
      </BottomSheet>
      {/* <SearchLoader /> */}
    </>
  );
};

export default SelectedVehicle;

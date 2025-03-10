import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import NavBar from '../components/NavBar';
import {useStackScreenStore} from '../store/useStackScreenStore';
import useSelectedVehicleStore from '../store/useSelectedVehicleStore';
import useLocationStore from '../store/useLocationStore';
import useRideSelectionStore from '../store/useRideSelectionStore';
import useMapStore from '../store/useMapStore';

import BottomSheet from '../components/BottomSheet';
import {vehicleDetailsStyles} from '../styles/VehicleDetails';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {showNotification} from '../components/NotificationManger';
import {usePostQuery} from '../hooks/useQuery';
import locationTask from '../controllers/GetCurrentLocation';

import SearchLoader from '../components/Loaders/SearchLoader';
import {cancelRideMutation, createRideMutation} from '../API/APICalls/RideAPICalls';
import FullScreenLoader from '../components/Loaders/FullScreenLoader';
import SelectedVehicleDetails from '../components/SelectedVehicleDetails';
import useMapStyleStore from '../store/useMapStyleStore';
const SelectedVehicle = () => {
  const navigation = useNavigation();

  const {goBack, setStackScreen, screenStoreReset} = useStackScreenStore();
  const {selectedVehicle} = useSelectedVehicleStore();
  const {directions, setDirections} = useLocationStore();
  const {selectedTrip, selectedRide, setBookingDetails, bookingDetails} = useRideSelectionStore();
  const {setMapStyle,resetMapStyle} = useMapStyleStore();
  const {
    setOnSearchResults,
    setMapMarkers,
    setDirectionPoints,
    setSearchUnit,
    directionPoints,
  } = useMapStore();

  const timeoutIdRef = useRef(null);

  const [isLoading, setIsLoading] = useState('');

  const onBackPress = () => {
    resetMapStyle();
    goBack();
  };

  const getRideTypeValue = type => {
    if (type == '1') return 'ONESIDE';
    if (type == '2') return 'ROUNDTRIP';
    return 'ONESIDE';
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
      setBookingDetails(data);
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = setTimeout(() => {
        setIsLoading(false);
        setStackScreen('DriverAssignedScreen');
      }, 5000);
    }
  };

  const onCancelSuccess =async (data) => {
    if (data.success) {
      showNotification(data.message, '', 'success');
      setBookingDetails(null);
      setDirections([
        { id: 1, name: 'Start', location: [], locationName: '' },
        { id: 2, name: 'End', location: [], locationName: '' },
      ]);
      setOnSearchResults(null);
      setMapMarkers([]);
      setDirectionPoints(null);
      setSearchUnit('');
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      setIsLoading(false); 
      setStackScreen('Home')
      await locationTask.getCurrentLocation();
    }
  }

  // Clear timeout on component unmount
  useEffect(() => {
    setMapStyle({
      width: "100%",
      height: "60%",
    });
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const {mutate: BookingMutate, isLoading: isBookRideLoading} =
    createRideMutation(onBookingSuccess);

  const {mutate: cancelRideMutate, isLoading: isCancelRideLoading} =
    cancelRideMutation(onCancelSuccess);

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
    let vehicle_type = selectedVehicle.vehicleType;

    let payload = {
      startLocation: [ start_location.location[0],start_location.location[1]],
      endLocation: [end_location.location[0],end_location.location[1]],
      stops: [
        {name:'Pickup Point',location:[start_location.location[0],start_location.location[1]],address:start_location.locationName},
        {name:'Drop Point',location:[end_location.location[0],end_location.location[1]],address:end_location.locationName},
      ],
      rideType: ride_type,
      vehicleType: vehicle_type,
      passangerCount: 1,
      pickupTime: "234243242342",
    };
    console.log('payload-->>', payload)
    BookingMutate(payload);
  };

  const onCancelRide = () => {
    // {"message": "Ride created successfully",
    //    "ride": {"acknowledged": true,
    //      "insertedId": "66f1506af7e54f72cfe7b0f5"}, "success": true}
    const payload = {
      rideId:bookingDetails?.ride?.insertedId
    }
    cancelRideMutate(payload)
  }

  return (
    <>
      {isLoading ? (
        <SearchLoader handleSwipeSuccess={onCancelRide}/>
      ) : (
        <>
          {(isBookRideLoading || isCancelRideLoading) && (
            <View style={{width: '100%', height: '100%', zIndex: 9999}}>
              <FullScreenLoader />
            </View>
          )}
          <NavBar title={'Choose Your Ride'} onBackPress={onBackPress} />
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

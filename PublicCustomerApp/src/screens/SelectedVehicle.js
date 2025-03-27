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
import useUserInfoStore from '../store/useUserInfoStore';
const Driver={
  "_id": {
    "$oid": "67e152f98403b17a8eba7ff6"
  },
  "name": "katthik",
  "email": "karthik@gmail.com",
  "phone": "+916754545434",
  "password": "U2FsdGVkX1/jA8Ej0yAp4VF+QPiRGlXwOH3Dx2oobHE=",
  "fcmTokens": [
    {
      "token": "fHcyNcp9Si-6P_NayoviTO:APA91bFZgA27Tzf3CKaUJBssfTyhN-zVtCMY2_LXi4FKH9uAGKvQqauyWDjBhSSba_JbVjlphycL4-FVxLJfpjYoW_BSAQCstYbPp3eeRhnInVYmWC26Ik8",
      "deviceImei": "681cc30ddef15e10"
    }
  ],
  "createdBy": "publicrides",
  "createdOn": 1742820089412,
  "publicRidesDriver": true,
  "tripStatus": "ONGOING",
  "aadharNo": "76e564754474",
  "gender": "male",
  "panNo": "hftyftyfty",
  "ownVehicleInfo": {
    "vehicleNumber": "erewrwewe",
    "vehicleColor": "Blue",
    "vehicleType": "AUTO",
    "vehicleBrand": "Tata Motors",
    "vehicleModel": "Tigor",
    "manufacturingYear": "2023"
  },
  "documents": {
    "aadhar": "https://not-publicrides.objectstore.e2enetworks.net/driver/67e152f98403b17a8eba7ff6/aadhar/aadhar.png",
    "driving_license": "https://not-publicrides.objectstore.e2enetworks.net/driver/67e152f98403b17a8eba7ff6/driving_license/driving_license.png",
    "vehicle_rc_book": "https://not-publicrides.objectstore.e2enetworks.net/driver/67e152f98403b17a8eba7ff6/vehicle_rc_book/vehicle_rc_book.png",
    "insurance": "https://not-publicrides.objectstore.e2enetworks.net/driver/67e152f98403b17a8eba7ff6/insurance/insurance.png",
    "pollution_certificate": "https://not-publicrides.objectstore.e2enetworks.net/driver/67e152f98403b17a8eba7ff6/pollution_certificate/pollution_certificate.png",
    "pan_card": "https://not-publicrides.objectstore.e2enetworks.net/driver/67e152f98403b17a8eba7ff6/pan_card/pan_card.png",
    "driver_photo": "https://not-publicrides.objectstore.e2enetworks.net/driver/67e152f98403b17a8eba7ff6/driver_photo/driver_photo.png",
    "vehicle_photo": "https://not-publicrides.objectstore.e2enetworks.net/driver/67e152f98403b17a8eba7ff6/vehicle_photo/vehicle_photo.png"
  },
  "location": {
    "type": "Point",
    "coordinates": [
      80.2092,
      13.0639
    ]
  },
  "licenseNo": "646547764674764764776464747647646747647"
}
const SelectedVehicle = () => {
  const navigation = useNavigation();
  const {userdetails} = useUserInfoStore();
  const {goBack, setStackScreen, screenStoreReset} = useStackScreenStore();
  const {selectedVehicle} = useSelectedVehicleStore();
  const {directions, setDirections} = useLocationStore();
  const {selectedTrip, selectedRide, setBookingDetails, bookingDetails, tripFor, selectedContact, paymentMethod, assignedDriver, rideDuration, setAssignedDriver} = useRideSelectionStore();
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

      // setAssignedDriver(Driver)
     
      
    }
  };

  useEffect(() => {
    if(assignedDriver){
      setIsLoading(false);
      setStackScreen('DriverAssignedScreen');
    }
    
  }, [assignedDriver])

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
   
    // let waypoints = directions.filter(item => item.name == 'Waypoint');
    // let trip_type = getTripTypeValue(selectedTrip.id);
   
    
    let vehicle_type = selectedVehicle.vehicleType;
    let tripEstimatedPrice = selectedVehicle.fare;
    
   
    let distance = 3000;
    let estimatedDuration = rideDuration;
    let bookingFor = tripFor == "For Myself" ? "MYSELF" : "OTHER";
    let bookingForName = selectedContact.name 
    let bookingForPhone = selectedContact.phone
 
    let payload = {
      startLocation: [ start_location.location[0],start_location.location[1]],
      endLocation: [end_location.location[0],end_location.location[1]],
      stops: [
        {name:'Pickup Point',location:[start_location.location[0],start_location.location[1]],address:start_location.locationName},
        {name:'Drop Point',location:[end_location.location[0],end_location.location[1]],address:end_location.locationName},
      ],
      vehicleType: vehicle_type,
      passangerCount: 1,
      pickupTime: "234243242342",
      estimatedFare: tripEstimatedPrice,
      distance: distance,
      estimatedDuration: estimatedDuration,
      bookingFor: bookingFor,
      bookingForName: bookingForName,
      bookingForPhone: bookingForPhone,
      paymentMethod: paymentMethod.toUpperCase(),
    };
    console.log('payload-->>', payload)
    
    BookingMutate(payload);
    setBookingDetails(payload);
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
        <>
        <SearchLoader handleSwipeSuccess={onCancelRide}/>
        </>
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

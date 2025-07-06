import {
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Linking,
  BackHandler,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import NavBar from '../../components/NavBar';
import { colors } from '../../constants/constants';
import { cancelRide } from '../../API/EndPoints/EndPoints';

import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import useMapStore from '../../features/map/store/useMapStore';
import { rideStyles } from '../../styles/RideStyles';
import { useStackScreenStore } from '../../store/useStackScreenStore';
import useRideSelectionStore from '../../store/useRideSelectionStore';
import useLocationStore from '../../store/useLocationStore';
import Polyline from '../../controllers/NEMap/Polyline';
import polyline from '@mapbox/polyline';
import useDriverLocationStore from '../../store/useDriverLocationStore';
import { findRoute } from '../../controllers/NEMap/findRoute';
import Marker from '../../controllers/NEMap/Marker';
import { showNotification } from '../../components/NotificationManger';
import locationTask from '../../controllers/GetCurrentLocation';
import useMapStyleStore from '../../store/useMapStyleStore';
import CancelRideModal from '../../components/Trips/CancelTripModel';



const DriverArrival = () => {

  const [GetDriverSocketData, setGetDriverSocketData] = useState(false)
  const {setStackScreen} = useStackScreenStore();


  const [driverDistance, setDriverDistance] = useState('100m away');
  const {setBookingDetails} = useRideSelectionStore();
  const [arrivalTime, setArrivalTime] = useState(300);
  const {resetMapStyle} = useMapStyleStore();
  const {setDirections} = useLocationStore();
 
  const { reset } = useStackScreenStore();
  const { driverLocation, setDriverLocation, driverAngle, driverMaxSpeed } = useDriverLocationStore();


  const {
    setOnSearchResults,
    setMapMarkers,
    setDirectionPoints,
    setGeometries,
  } = useMapStore();

  const {
    vehicleList,
    setVehicleList,
    assignedDriver,
    otp,
    bookingDetails,
    rideDistance,
    rideDuration,
  } = useRideSelectionStore();
 
  
  const locationTask = useLocationStore();

  const handleCall = (phoneNumber) => {
    const url = `tel:${encodeURIComponent(phoneNumber)}`;
    Linking.openURL(url).catch((err) =>
      console.error('An error occurred', err)
    );
  };

  const onBackPress = useCallback(async () => {
    if (vehicleList.length !== 0) return setVehicleList([]);

    setDirections([
      { id: 1, name: 'Start', location: [], locationName: '' },
      { id: 2, name: 'End', location: [], locationName: '' },
    ]);
    setOnSearchResults(null);
    setDirectionPoints(null);
    reset();
    await locationTask.getCurrentLocation();
  }, [vehicleList]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onBackPress();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [onBackPress]);

  
    const AddMarker = (driverLocation) => {
      const markers = []
      let vehicleType = bookingDetails?.vehicleType ? bookingDetails?.vehicleType.toLowerCase() : 'suv'
      try {
        if(bookingDetails?.startLocation){
          const pickupMarker = new Marker(
            'pickup',
            'pickup',
            bookingDetails.startLocation[0],
            bookingDetails.startLocation[1],
            'default',
            36,
            true
          )
          markers.push(pickupMarker)
        }
        if(driverLocation){
          const driverAngles = driverAngle || 0
          const driverMarker = new Marker(
          'auto',
          vehicleType,
          driverLocation[0],
          driverLocation[1],
          vehicleType,
          36,
          true,
          driverAngles
        );
        markers.push(driverMarker)
        }
        console.log('markers-->>', markers)
        setMapMarkers(markers)
      } catch (error) {
        console.error('Error adding marker:', error);
      }
    };

    const fetchRoute = async () => {
      try {
        if (driverLocation && bookingDetails?.startLocation) {
          const directions = [
            {
              id: 1,
              name: 'Start',
              location: [
                driverLocation[0],
                driverLocation[1],
              ],
            },
            {
              id: 2,
              name: 'End',
              location: bookingDetails.startLocation,
            },
          ];

          const response = await findRoute(directions);
          if (response?.trip) {
            const allCoords = [];
            if (!GetDriverSocketData) {
              response.trip.legs.forEach((item) => {
                const decodedData = polyline.decode(item.shape, 6);
                const reversedCoordinates = decodedData.map(([lat, lon]) => [lon, lat]);
                allCoords.push(...reversedCoordinates);
              });

              // Create and set polyline
              const polyLine = new Polyline(
                1,
                `routes`,
                allCoords,
                '#174EA6',
                'small'
              );
              polyLine.setPadding([100, 130, 100, 100]);
              polyLine.setFocus(true);
              // Set both geometries and markers at once
              setGeometries([polyLine]);
              setGetDriverSocketData(true);
            }
            if (response?.trip?.summary?.time) {
              setArrivalTime(response?.trip?.summary?.time);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    

    useEffect(() => {
      console.log('driverLocation-->>', driverLocation);
      console.log('driverAngle-->>', driverAngle)
      if (driverLocation && driverAngle != null) {
        AddMarker(driverLocation);
        fetchRoute(driverLocation);
        checkDriverLocation(driverLocation);
      }
    }, [driverLocation]);

    useEffect(() => {
      console.log('driverLocation-->>', driverLocation);
      console.log('driverAngle-->>', driverAngle)
      if (assignedDriver?.location?.coordinates != null) {
        AddMarker(assignedDriver?.location?.coordinates);
        fetchRoute(assignedDriver?.location?.coordinates);
        checkDriverLocation(assignedDriver?.location?.coordinates);
      }
    }, []);

    useEffect(() => {
      setDirectionPoints(null);
      if(assignedDriver && assignedDriver?.name){
        showNotification(`${assignedDriver?.name.charAt(0).toUpperCase() + assignedDriver?.name.slice(1).toLowerCase()} assigned to your ride`, 'is on the way to your location', 'success')
      }
    }, []);


    const checkDriverLocation = (driverLocation) => {
      try {
        if(driverLocation && bookingDetails?.startLocation) {
          // Calculate distance between driver and end location
          const driverLat = driverLocation[0];
          const driverLng = driverLocation[1];
          const endLat = bookingDetails.startLocation[0];
          const endLng = bookingDetails.startLocation[1];
        
        // Calculate distance using Haversine formula
        const R = 6371e3; // Earth's radius in meters
        const φ1 = driverLat * Math.PI/180;
        const φ2 = endLat * Math.PI/180;
        const Δφ = (endLat-driverLat) * Math.PI/180;
        const Δλ = (endLng-driverLng) * Math.PI/180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // distance in meters
        console.log('distance-->>', distance)
        // Check if driver is within 200 meters of end location
        if (distance <= 200) {
          console.log('Driver has entered destination area (within 200m radius)');
          
          showNotification(`Driver almost reached your location`,`OTP :${otp}`, 'success')
          
          // Here you can trigger any actions needed when driver reaches destination
          
        }
      }
    } catch (error) {
      console.error('Error checking driver location:', error);
    }
    }







   



  const [modalVisible, setModalVisible] = useState(false);
  const handleCancelRide = async (reason) => {
    console.log('handleCancelRide');
    setModalVisible(true);
    try {
      const response = await cancelRide({ tripId: bookingDetails._id, reason });
      if (response.success) {
        showNotification(response.message, '', 'success');
        setDirections([
          { id: 1, name: 'Start', location: [], locationName: '' },
          { id: 2, name: 'End', location: [], locationName: '' },
        ]);
        setOnSearchResults(null);
        setMapMarkers([]);
        resetMapStyle();
        setStackScreen('Home');
        locationTask.getCurrentLocation();
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error cancelling ride:', error);
    }
  }
  

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <NavBar title="Driver Assigned" />
      <View style={rideStyles.containerMain}>
        <View style={rideStyles.container}>
        <View style={rideStyles.title}>
          <Text style={rideStyles.titleTxt}>
          Your driver will reach your location in
          </Text>
          <View style={rideStyles.statusBox}>
          <Text style={[rideStyles.titleTxt, {fontSize: 24,fontWeight:"600",  color:"rgb(4, 113, 59)"}]}>{Math.round(arrivalTime/60)} Minutes</Text>
          </View>
        </View>

        <View style={rideStyles.contentContianer}>
          <View style={rideStyles.carDetailsCard}>
            <View style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
              <Text style={rideStyles.vehicleNum}>
                {assignedDriver?.ownVehicleInfo?.vehicleNumber}
              </Text>
              <Text style={rideStyles.vehicleType}>
                {assignedDriver?.ownVehicleInfo?.vehicleBrand},{' '}
                {assignedDriver?.ownVehicleInfo?.vehicleModel} ·{' '}
                {assignedDriver?.ownVehicleInfo?.vehicleColor}
              </Text>
            </View>
          </View>

          <View style={rideStyles.driverDetails}>
            <View style={rideStyles.profileContainer}>
              <Image
                source={{
                  uri:
                    assignedDriver?.photo ||
                    'https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/1015f/MainBefore.jpg',
                }}
                style={rideStyles.profileImage}
              />
              <Text style={rideStyles.rating}>
                <AntDesign name="star" color={colors.yellow} size={10} /> 4.8
              </Text>
            </View>

            <View style={rideStyles.profileNameContainer}>
              <Text style={rideStyles.driverName}>{assignedDriver?.name}</Text>
              <Text style={rideStyles.driverratingTxt}>Top Rated Driver</Text>
            </View>

            <View style={rideStyles.otpContainer}>
              <Text style={rideStyles.otpTitle}>OTP</Text>
              <View style={{ flexDirection: 'row' }}>
                {bookingDetails?.otp?.split('').map((char, index) => (
                  <Text key={index} style={rideStyles.otpNum}>
                    {char}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={[rideStyles.driverDetails, { width: '90%' }]}>
            <RideInfo label="Duration" value={`${Math.round(rideDuration / 60)} Mins`} />
            <RideInfo label="Distance" value={`${Math.round(rideDistance)} Km`} />
            <RideInfo label="Price" value={`₹${Math.round(bookingDetails?.estimatedFare)}`} /> 
          </View>

          <View style={rideStyles.driverDetails}>
            <TouchableOpacity
              onPress={() => handleCall(assignedDriver?.phone)}
              style={rideStyles.callBtn}
            >
              <FontAwesome6 size={14} color={colors.white} name="phone-volume" />
              <Text style={rideStyles.callTxt}>CALL DRIVER</Text>
            </TouchableOpacity>

            <TouchableOpacity style={rideStyles.closeBtn} onPress={() => setModalVisible(true)}>
              <AntDesign name="close" size={26} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </View>
      {modalVisible && (
        <CancelRideModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          callCancelRide={handleCancelRide}
        />
      )}
    </>
  );
};

const RideInfo = ({ label, value }) => (
  <View style={rideStyles.vehicleDetails}>
    <Text style={rideStyles.vehicleType}>{label}</Text>
    <Text style={rideStyles.driverName}>{value}</Text>
  </View>
);

export default DriverArrival;

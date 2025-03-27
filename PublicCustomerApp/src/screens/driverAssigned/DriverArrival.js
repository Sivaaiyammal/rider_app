import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Linking,
  BackHandler,
  Image,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import NavBar from '../../components/NavBar';
import { colors } from '../../constants/constants';

import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import useMapStore from '../../store/useMapStore';
import { rideStyles } from '../../styles/RideStyles';
import { useStackScreenStore } from '../../store/useStackScreenStore';
import useRideSelectionStore from '../../store/useRideSelectionStore';
import useLocationStore from '../../store/useLocationStore';
import Polyline from '../../controllers/NEMap/Polyline';
import polyline from '@mapbox/polyline';
import useDriverLocationStore from '../../store/useDriverLocationStore';
import { findRoute } from '../../controllers/NEMap/findRoute';
import Marker from '../../controllers/NEMap/Marker';
import { getRemainingPolyline } from '../../controllers/PolylineController';


const DriverArrival = () => {
  const [getDriverLocation, setGetDriverLocation] = useState(false);
 
  const { reset } = useStackScreenStore();
  const { driverLocation, setDriverLocation , driverAngle, driverMaxSpeed} = useDriverLocationStore();
  const [polylineDATA, setPolylineDATA] = useState(null);
  const [reversedPolylineCoords, setReversedPolylineCoords] = useState([]); // ✅ new state

  const {
    setOnSearchResults,
    setMapMarkers,
    setDirectionPoints,
    setGeometries,
    setDirections,
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


  useEffect(() => {
    if (driverLocation) {
      addMarker(driverLocation);
    }
    if(!getDriverLocation){
      fetchRoute();
      setDriverLocation(driverLocation);
      setGetDriverLocation(true);
    }
  }, [driverLocation]);

  const fetchRoute = async () => {
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
      setPolylineDATA(response);
    }
  };


  useEffect(() => {
    setDirectionPoints([]);
    setDriverLocation(assignedDriver?.location?.coordinates);
    fetchRoute();
    
    
  }, [assignedDriver]);

  // useEffect(() => {
  //   console.log('driverLocation-->>', driverLocation)
  //   if (polylineDATA && driverLocation) {
  //     const remaining = getRemainingPolyline(reversedPolylineCoords, [
  //       driverLocation[0],
  //       driverLocation[1],
  //     ]);
  //     setReversedPolylineCoords(remaining);
  //     console.log('remaining-->>', remaining[0])
      
  //   }
  // }, [driverLocation]);


  const addMarker = (location) => {
    const marker = new Marker(
      'car',
      'hyundai',
      location[0],
      location[1],
      'suv',
      36,
      true,
      driverAngle,
    );
    setMapMarkers([marker]);
  }


  useEffect(() => {
    if (!polylineDATA?.trip?.legs?.length) return;
    const allCoords = [];
  
    // Step 1: Decode & reverse coordinates
    polylineDATA.trip.legs.forEach((item) => {
      const decodedData = polyline.decode(item.shape, 6);
      const reversedCoordinates = decodedData.map(([lat, lon]) => [lon, lat]);
      allCoords.push(...reversedCoordinates);
    });
    // Step 2: Store in state
    setReversedPolylineCoords(allCoords);
  }, [polylineDATA]);


  useEffect(() => {
    if (!reversedPolylineCoords.length) return;
    const polyLine = new Polyline(
      1,
      `routes`,
      reversedPolylineCoords,
      '#174EA6',
      'small'
    );
    polyLine.setPadding([100, 130, 100, 100]);
    polyLine.setFocus(true);
  
    setGeometries([polyLine]);
  
   
  }, [reversedPolylineCoords, driverLocation]);
  

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <NavBar title="Driver Assigned" />
      <View style={rideStyles.container}>
        <View style={rideStyles.title}>
          <Text style={rideStyles.titleTxt}>
            Your driver has arrived in 2 minutes
          </Text>
          <View style={rideStyles.statusBox}>
            <Text style={[rideStyles.titleTxt, { fontSize: 14 }]}>100m away</Text>
          </View>
        </View>

        <View style={rideStyles.contentContianer}>
          <View style={rideStyles.carDetailsCard}>
            <View>
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
                {otp.split('').map((char, index) => (
                  <Text key={index} style={rideStyles.otpNum}>
                    {char}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={[rideStyles.driverDetails, { width: '100%' }]}>
            
            
          
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

            <TouchableOpacity style={rideStyles.closeBtn}>
              <AntDesign name="close" size={26} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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

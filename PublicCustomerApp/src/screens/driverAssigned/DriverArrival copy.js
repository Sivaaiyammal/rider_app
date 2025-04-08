import {
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Linking,
  BackHandler,
  Image,
} from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
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


const DriverArrival = () => {
  const [polylineDATA, setPolylineDATA] = useState(null);
  const [reversedPolylineCoords, setReversedPolylineCoords] = useState([]);
  const [driverDistance, setDriverDistance] = useState('100m away');
  const [arrivalTime, setArrivalTime] = useState('2 minutes');
 
  const { reset } = useStackScreenStore();
  const { driverLocation, setDriverLocation, driverAngle, driverMaxSpeed } = useDriverLocationStore();
  const prevDriverLocationRef = useRef(null);

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
      if (response?.trip?.summary) {
        const distanceInMeters = response.trip.summary.length;
        const timeInSeconds = response.trip.summary.time;
        
        // Update distance display
        if (distanceInMeters < 1000) {
          setDriverDistance(`${Math.round(distanceInMeters)}m away`);
        } else {
          setDriverDistance(`${(distanceInMeters / 1000).toFixed(1)}km away`);
        }
        
        // Update arrival time
        const minutes = Math.ceil(timeInSeconds / 60);
        setArrivalTime(minutes <= 1 ? 'less than a minute' : `${minutes} minutes`);
      }
      
      setPolylineDATA(response);
    }
  };

  useEffect(() => {
    setDirectionPoints([]);
    setDriverLocation(bookingDetails?.endLocation);
    fetchRoute();
  }, []);

  // Re-fetch route when driver location changes significantly
  useEffect(() => {
    if (!prevDriverLocationRef.current) {
      prevDriverLocationRef.current = driverLocation;
      return;
    }
    
    if (driverLocation && prevDriverLocationRef.current) {
      // Calculate if driver has moved enough to warrant a route update
      const [prevLon, prevLat] = prevDriverLocationRef.current;
      const [newLon, newLat] = driverLocation;
      
      // Simple distance calculation (not perfect but good enough for this purpose)
      const distance = Math.sqrt(
        Math.pow(newLon - prevLon, 2) + Math.pow(newLat - prevLat, 2)
      );
      
      // Update route if driver has moved significantly (approximately 50 meters)
      if (distance > 0.0005) {
        fetchRoute();
        prevDriverLocationRef.current = driverLocation;
      }
    }
  }, [driverLocation]);

  // Process polyline data and add marker in a single effect
  useEffect(() => {
    if (!polylineDATA?.trip?.legs?.length || !driverLocation) return;
    
    // Process polyline data
    const allCoords = [];
    polylineDATA.trip.legs.forEach((item) => {
      const decodedData = polyline.decode(item.shape, 6);
      const reversedCoordinates = decodedData.map(([lat, lon]) => [lon, lat]);
      allCoords.push(...reversedCoordinates);
    });
    setReversedPolylineCoords(allCoords);
    
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
    
    // Create and set marker
    const marker = new Marker(
      'car',
      'hyundai',
      driverLocation[0],
      driverLocation[1],
      'suv',
      36,
      true,
      driverAngle,
    );
    
    // Set both geometries and markers at once
    setGeometries([polyLine]);
    setMapMarkers([marker]);
    
  }, [polylineDATA, driverLocation, driverAngle]);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <NavBar title="Driver Assigned" />
      <View style={rideStyles.container}>
        <View style={rideStyles.title}>
          <Text style={rideStyles.titleTxt}>
            Your driver has arrived in {arrivalTime}
          </Text>
          <View style={rideStyles.statusBox}>
            <Text style={[rideStyles.titleTxt, { fontSize: 14 }]}>{driverDistance}</Text>
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

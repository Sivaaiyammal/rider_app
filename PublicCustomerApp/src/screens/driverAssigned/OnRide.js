import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect,useState} from 'react';
import NavBar from '../../components/NavBar';
import {colors, Fonts} from '../../constants/constants';

import {rideStyles} from '../../styles/RideStyles';

import Rocket from '../../assets/image/svgIcons/rocket.svg';
import EndBlack from '../../assets/image/svgIcons/end_black.svg';
import {vehicleDetailsStyles} from '../../styles/VehicleDetails';
import useLocationStore from '../../store/useLocationStore';
import {useStackScreenStore} from '../../store/useStackScreenStore';
import {scheduleContainerStyles} from '../../styles/AddLocationStyles';
import { StatusBar } from 'react-native';
import useMapStore from '../../store/useMapStore';
import useRideSelectionStore from '../../store/useRideSelectionStore';
import { Image } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AddressContainer from '../../components/Trips/AddressContainer';
import  useDriverLocationStore  from '../../store/useDriverLocationStore';
import Polyline from '../../controllers/NEMap/Polyline';
import polyline from '@mapbox/polyline';
import { findRoute } from '../../controllers/NEMap/findRoute';
import Marker from '../../controllers/NEMap/Marker';
import { showNotification } from '../../components/NotificationManger';
const OnRide = () => {
  const [arrivalTime, setArrivalTime] = useState(0)
  const [rideDistance, setRideDistance] = useState(0)

  const {directions} = useLocationStore();
  const [getDriverLocation,setDriverLocation] = useState(false)
  const { setDirectionPoints, setMapMarkers, setGeometries, mapMarkers} = useMapStore();
  const {setStackScreen} = useStackScreenStore();
  const {bookingDetails,assignedDriver,setRideStatus,rideStatus} = useRideSelectionStore();
  const {driverLocation,driverAngle} = useDriverLocationStore();

  const getLocationIcon = item => {
    switch (item.name) {
      case 'Start':
        return <Rocket />;
      case 'End':
        return <EndBlack />;
    }
  };

  useEffect(() => {
    setDirectionPoints(null)
    setMapMarkers(null)
    fetchRoute()
    const startMarker = AddMarker(bookingDetails?.startLocation)
    setMapMarkers([startMarker])
    showNotification(`Trip has started`, 'you have started your trip', 'success')
    // setStackScreen('RideSummary');
  },[])

  const AddMarker = (driverLocation,type) => {

    const angle = type === 'suv' ? driverAngle || 0 : 0
    const markerType = type === 'car' ? bookingDetails?.vehicleType ? bookingDetails?.vehicleType.toLowerCase() : 'suv' : type
    const marker = new Marker(
      markerType,
      'hyundai',
      driverLocation[0],
      driverLocation[1],
      markerType,
      36,
      true,
      angle
    );
    console.log('marker-->>', marker)
    return marker
  }

  const fetchRoute = async (driverLocations=null) => {
    const startLocation = driverLocations ? driverLocations : bookingDetails?.startLocation
    const endLocation = bookingDetails?.endLocation
    if (startLocation && endLocation) {
      const directions = [
        {
          id: 1,
          name: 'Start',
          location: [
            startLocation[0] ,
            startLocation[1],
          ],
        },
        {
          id: 2,
          name: 'End',
          location: [endLocation[0], endLocation[1]],
        },
      ];

      const response = await findRoute(directions);
      if (response?.trip) {
        const allCoords = [];
        response.trip.legs.forEach((item) => {
          const decodedData = polyline.decode(item.shape, 6);
          const reversedCoordinates = decodedData.map(([lat, lon]) => [lon, lat]);
          allCoords.push(...reversedCoordinates);
        });
        if(!getDriverLocation){
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
        setDriverLocation(true)
        }
        if(response?.trip?.summary?.length){
          setRideDistance(response?.trip?.summary?.length)
        }
        if(response?.trip?.summary?.time){
          setArrivalTime(response?.trip?.summary?.time)
        }
        
        
      }
    }
  };
  const checkDriverLocation = (driverLocation) => {
    if(driverLocation && bookingDetails?.endLocation) {
      // Calculate distance between driver and end location
      const driverLat = driverLocation[0];
      const driverLng = driverLocation[1];
      const endLat = bookingDetails.endLocation[0];
      const endLng = bookingDetails.endLocation[1];
      
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
      if (distance <= 250) {
        console.log('Driver has entered destination area (within 200m radius)');
        
       showNotification(`You are about to reach your destination`, '', 'success')
        
        // Here you can trigger any actions needed when driver reaches destination
        // setRideStatus('ARRIVED');
        // setStackScreen('RideSummary');
      }
      if(distance <= 200){
        showNotification("Trip Completed",`You have reached your destination`, 'success')
        setRideStatus('COMPLETED');
        setStackScreen('RideSummary');
      }
    }
  }

  useEffect(() => {
    console.log('driverLocationOnRide-->>', driverLocation)
    console.log('driverAngleOnRide-->>', driverAngle)
    if(driverLocation && driverAngle != null){
      checkDriverLocation(driverLocation)
      const endLocation = bookingDetails?.endLocation
      const endMarker = AddMarker(endLocation,'default')
      const marker = AddMarker(driverLocation,'suv')
      setMapMarkers([ endMarker, marker ])
      fetchRoute(driverLocation)
    }
    
  }, [driverLocation])

  useEffect(() => {
    if(rideStatus === 'COMPLETED'){
      setStackScreen('RideSummary');
      showNotification(`Trip Completed`, 'you have reached your destination', 'success')
    }
  }, [rideStatus])



  const changePayment = () => {
    // setStackScreen('RideSummary');
  };

  const onPressDetails = () => {
    setStackScreen('RideSummary');
  };

  const onRideComplete = false;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <NavBar title="On Ride" />
      <View  style={[rideStyles.containerMain]}>
        <View style={{position:'absolute',top:-70,right:10,zIndex:1000}}>
          <TouchableOpacity style={{width:50,height:50,borderRadius:50,backgroundColor:"red" }}><Text style={{fontFamily:Fonts.regular,fontSize:16, color:colors.white,textAlign:'center',lineHeight:50,fontWeight:'bold'}}>SOS</Text></TouchableOpacity>
        </View>
        {/* <TouchableOpacity style={{width:'100%', alignSelf:'center', paddingVertical:10, paddingHorizontal:10, borderRadius:10}}><Text style={{fontFamily:Fonts.regular,fontSize:16, color:colors.black,}}>Cancel Ride</Text></TouchableOpacity> */}
      <View style={[rideStyles.container]}>
        <View style={rideStyles.title}>
          <Text style={rideStyles.titleTxt}>You can reach your destination in</Text>
          <View
            style={[
              rideStyles.statusBox,
              
            ]}>
            <Text style={[rideStyles.titleTxt, {fontSize: 24,fontWeight:"600",  color:"rgb(4, 113, 59)"}]}>
              {Math.round(arrivalTime/60)} Mins . {Math.round(rideDistance)} Km
            </Text>
          </View>
        </View>
        <View style={[rideStyles.contentContianer, {paddingBottom: 10}]}>
          {/* <View style={rideStyles.driverDetailsB}>
            <Text style={rideStyles.OnRideText}>On Ride</Text>
            <View style={rideStyles.profilePic}></View>
            <Text style={rideStyles.profileName}>{assignedDriver?.name}</Text>
            <Text style={rideStyles.carType}>
            {assignedDriver?.ownVehicleInfo?.vehicleBrand},{' '}
                {assignedDriver?.ownVehicleInfo?.vehicleModel} ·{' '}
                {assignedDriver?.ownVehicleInfo?.vehicleColor}
            </Text>
          </View> */}

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
              <Text style={rideStyles.driverName}>{assignedDriver?.name} . {assignedDriver?.ownVehicleInfo?.vehicleNumber}</Text>
              <Text style={rideStyles.driverratingTxt}>{assignedDriver?.ownVehicleInfo?.vehicleBrand} . {assignedDriver?.ownVehicleInfo?.vehicleModel} . {assignedDriver?.ownVehicleInfo?.vehicleColor}</Text>
            </View>

           
          </View>
        
          {/* <View style={[rideStyles.driverDetails, {width: '100%'}]}>
            <View style={rideStyles.vehicleDetails}>
              <Text style={rideStyles.vehicleType}>Arrival</Text>
              <Text style={rideStyles.driverName}>3:20 PM</Text>
            </View>
            <View style={rideStyles.vehicleDetails}>
              <Text style={rideStyles.vehicleType}>Duration</Text>
              <Text style={rideStyles.driverName}>30 Min</Text>
            </View>
            <View style={rideStyles.vehicleDetails}>
              <Text style={rideStyles.vehicleType}>Distance</Text>
              <Text style={rideStyles.driverName}>15 Km</Text>
            </View>
            <View style={rideStyles.vehicleDetails}>
              <Text style={rideStyles.vehicleType}>Price</Text>
              <Text style={rideStyles.driverName}>₹100.00</Text>
            </View>
          </View> */}
          <View style={{fontFamily:Fonts.regular,width:'100%',paddingHorizontal:10, flexDirection:'row', justifyContent:'center', gap:10,alignItems:'center'}}>
            <Text style={{fontFamily:Fonts.regular,fontSize:16, color:colors.black,}}>Estimated amount to be paid </Text>
            <Text style={{fontFamily:Fonts.regular,fontSize:20, color:colors.green,}}>₹{bookingDetails?.estimatedFare}</Text>
          </View>
          <AddressContainer directions={directions} />
          {/* <TouchableOpacity
            style={vehicleDetailsStyles.paymentContainer}
            onPress={() => changePayment()}>
            <Text style={vehicleDetailsStyles.paymentTxt}>
              Change Payment Method
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
      </View>
      {onRideComplete && (
        <View style={rideStyles.endRideContainer}>
          <View style={[rideStyles.container, {backgroundColor: colors.green}]}>
            <View style={[rideStyles.title, {justifyContent: 'center'}]}>
              <Text style={[rideStyles.titleTxt]}>Ride Completed</Text>
            </View>
            <View style={[rideStyles.contentContianer, {paddingBottom: 10}]}>
              <View style={rideStyles.driverDetailsB}>
                <Text style={rideStyles.rideCompleteTxt}>
                  Your ride is completed. {'\n'} Please proceed with the payment
                </Text>
                <Text style={[rideStyles.profileName, {fontSize: 40}]}>
                  ₹157.50
                </Text>
                <Text style={[rideStyles.carType, {fontSize: 16}]}>
                  30 Min . 15 Km
                </Text>
              </View>
              <View style={scheduleContainerStyles.btnComponent}>
                <TouchableOpacity
                  style={scheduleContainerStyles.confrmBtn}
                  onPress={() => onPressDetails()}>
                  <Text
                    style={[
                      scheduleContainerStyles.confrmBtnTxt,
                      {fontSize: 12},
                    ]}>
                    MORE DETAILS
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    scheduleContainerStyles.confrmBtn,
                    {backgroundColor: colors.green},
                  ]}>
                  <Text
                    style={[
                      scheduleContainerStyles.confrmBtnTxt,
                      {color: colors.white, fontSize: 12},
                    ]}>
                    PAY NOW
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default OnRide;

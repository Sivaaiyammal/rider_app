import {
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import React from 'react';
import {vehicleDetailsStyles} from '../styles/VehicleDetails';
import useLocationStore from '../store/useLocationStore';
import DistanceBlue from '../assets/image/svgIcons/distanceBlue.svg';
import Watch from '../assets/image/svgIcons/watch.svg';
import Fare from '../assets/image/svgIcons/fare.svg';
import Support from '../assets/image/svgIcons/support.svg';
import {rideStyles} from '../styles/RideStyles';
import {rideSummary} from '../styles/RideSummary';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, Fonts} from '../constants/constants';
import {Rating} from 'react-native-ratings';
import AddressContainer from '../components/Trips/AddressContainer';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Image } from 'react-native';
import useRideSelectionStore from '../store/useRideSelectionStore';
import {useStackScreenStore} from '../store/useStackScreenStore';
import useMapStore from '../store/useMapStore';
import useMapStyleStore from '../store/useMapStyleStore';
import locationTask from '../controllers/GetCurrentLocation';
import DriverProfileImage from '../assets/image/driver.png';

const RideSummary = () => {
  const {directions, setDirections} = useLocationStore();
  const {assignedDriver, bookingDetails, rideDistance, setBookingDetails, setAssignedDriver, setRideStatus} = useRideSelectionStore();
  const {reset: resetStackScreen} = useStackScreenStore();
  const {setOnSearchResults, setMapMarkers, setDirectionPoints, setSearchUnit} = useMapStore();
  const {resetMapStyle} = useMapStyleStore();

  const isCompleted = false;

  const handleGoToHome = async () => {
    // Reset all ride-related data
    setBookingDetails(null);
    setAssignedDriver(null);
    setRideStatus(null);
    
    // Reset location data
    setDirections([
      { id: 1, name: 'Start', location: [], locationName: '' },
      { id: 2, name: 'End', location: [], locationName: '' },
    ]);
    
    // Reset map data
    setOnSearchResults(null);
    setMapMarkers([]);
    setDirectionPoints(null);
    setSearchUnit('');
    
    // Reset map style
    resetMapStyle();
    
    // Reset navigation stack to home
    resetStackScreen();
    
    // Get current location
    await locationTask.getCurrentLocation();
  };

  return (
    <View style={{flex:1, backgroundColor:colors.white,paddingVertical:20}}>
      <Text style={{fontFamily:Fonts.regular,fontSize:20, color:colors.black,textAlign:'center',paddingVertical:10}}>You have reached your destination</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={rideSummary.priceContainer}>
          <ImageBackground
            source={require('../assets/image/summaryBg.png')}
            style={rideSummary.imageBg}
            resizeMode="cover">
            <Text style={rideSummary.rideFare}>Ride Fare</Text>
            <Text style={rideSummary.rideFareAmount}>₹{bookingDetails?.estimatedFare}</Text>
          </ImageBackground>
        </View>
        <Text style={rideSummary.headerDate}>Mon, Jan 01 2022 | 3:00 PM</Text>
        <Text style={rideSummary.headerTipId}>Trip ID : ABCD01234</Text>
        <View style={rideSummary.seperater} />
        <Text style={rideSummary.titles}>Location Details</Text>
        <AddressContainer directions={directions} />
        <View style={rideSummary.seperater} />
        <Text style={rideSummary.titles}>Trip Details</Text>
        <View style={[rideStyles.driverDetailsB, {marginTop: 15}]}>
        <View style={rideStyles.driverDetails}>
            <View style={rideStyles.profileContainer}>
              <Image
                source={DriverProfileImage}
                style={rideStyles.profileImage}
              />
              <View style={rideStyles.rating}>
                <AntDesign name="star" color={colors.yellow} size={10} />
                <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.black, marginLeft: 2 }}>4.8</Text>
              </View>
            </View>

            <View style={rideStyles.profileNameContainer}>
              <Text style={rideStyles.driverName}>{assignedDriver?.name} . {assignedDriver?.ownVehicleInfo?.vehicleNumber}</Text>
              <Text style={rideStyles.driverratingTxt}>{assignedDriver?.ownVehicleInfo?.vehicleBrand} . {assignedDriver?.ownVehicleInfo?.vehicleModel} . {assignedDriver?.ownVehicleInfo?.vehicleColor}</Text>
            </View>

           
          </View>
        </View>
        <View style={rideSummary.rideDetails}>
          <View
            style={[rideSummary.rideDetailsCards, {backgroundColor: '#e5f6ff'}]}>
            <DistanceBlue />
            <Text style={rideSummary.rideDetailsCardsText}>Distance</Text>
            <Text style={rideSummary.rideDetailsText}>{Math.round(rideDistance)} km</Text>
          </View>
          <View
            style={[rideSummary.rideDetailsCards, {backgroundColor: '#fef4e4'}]}>
            <Watch />
            <Text style={rideSummary.rideDetailsCardsText}>Duration</Text>
            <Text style={rideSummary.rideDetailsText}>{Math.round(bookingDetails?.estimatedDuration/60)} mins</Text>
          </View>
          <View
            style={[rideSummary.rideDetailsCards, {backgroundColor: '#e9f4ef'}]}>
            <Fare />
            <Text style={rideSummary.rideDetailsCardsText}>Fare</Text>
            <Text style={rideSummary.rideDetailsText}>₹{bookingDetails?.estimatedFare}</Text>
          </View>
        </View>

        <View style={rideSummary.seperater} />

        <View style={rideSummary.billView}>
          <Text style={rideSummary.titles}>Payment Details</Text>
          <View style={rideSummary.billContents}>
            <Text style={rideSummary.billTitle}>Trip Bill</Text>
            <Text style={rideSummary.billPrice}>₹{bookingDetails?.estimatedFare}</Text>
          </View>
          <View style={rideSummary.billContents}>
            <Text style={rideSummary.billTitle}>GST 0%</Text>
            <Text style={rideSummary.billPrice}>₹0.00</Text>
          </View>
          <View style={rideSummary.billContents}>
            <Text style={rideSummary.billTitle}>Booking Charges</Text>
            <Text style={rideSummary.billPrice}>-₹0.00</Text>
          </View>
          <View style={rideSummary.seperater} />
          <View style={rideSummary.billContents}>
            <Text style={rideSummary.billTitleTotal}>Total Bill</Text>
            <Text style={rideSummary.billPriceTotal}>₹{bookingDetails?.estimatedFare}</Text>
          </View>
        </View>

        {isCompleted && (
          <TouchableOpacity style={vehicleDetailsStyles.paymentContainer}>
            <Text style={vehicleDetailsStyles.paymentTxt}>Payment Method</Text>
            <Text>Cash</Text>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <View>
            <View style={rideSummary.seperater} />
            <Text style={rideSummary.titles}>How is your Trips?</Text>
            <View
              style={[rideStyles.driverDetailsB, {marginTop: 15, width: '96%'}]}>
              <View style={rideStyles.profilePic}></View>
              <Rating
                type="custom"
                ratingCount={5}
                imageSize={30}
                onFinishRating={e => console.log('star-->>rating-->>', e)}
                style={{paddingVertical: 10}}
                defaultRating={3.5}
              />
              <TextInput style={rideSummary.input} placeholder="Comments" />
            </View>

            <TouchableOpacity style={rideSummary.submitBtn}>
              <Ionicons name={'checkmark'} size={22} color={colors.white} />
              <Text style={rideSummary.submitBtnTxt}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={vehicleDetailsStyles.paymentContainer}>
          <Text style={vehicleDetailsStyles.paymentTxt}>
            Get Help from Support
          </Text>
          <Support />
        </TouchableOpacity>
      </ScrollView>
      
      {isCompleted ? (
        <TouchableOpacity
          style={[rideSummary.payBtn, {backgroundColor: colors.black}]}
          onPress={handleGoToHome}>
          <Text style={rideSummary.payBtnTxt}>HOME</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={rideSummary.payBtn}
          onPress={handleGoToHome}>
          <Text style={rideSummary.payBtnTxt}>PAY ₹{bookingDetails?.estimatedFare}</Text>
        </TouchableOpacity>
      )}
   </View>
  );
};

export default RideSummary;

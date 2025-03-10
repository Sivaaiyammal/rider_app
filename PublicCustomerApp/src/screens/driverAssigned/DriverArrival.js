import {StyleSheet, Text, TouchableOpacity, View,StatusBar,Linking,Alert,BackHandler} from 'react-native';
import React from 'react';
import NavBar from '../../components/NavBar';
import {colors, Fonts} from '../../constants/constants';

import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import  useMapStore  from '../../store/useMapStore';
import Message from '../../assets/image/svgIcons/message.svg';
import { rideStyles } from '../../styles/RideStyles';
import { useStackScreenStore } from '../../store/useStackScreenStore';
import useRideSelectionStore from '../../store/useRideSelectionStore';
import useLocationStore from '../../store/useLocationStore';

const DriverArrival = () => {
  const OTP = '4730';
  const otpArray = OTP.split('');
  const {goBack} = useStackScreenStore();
  const {
    setOnSearchResults,
    setMapMarkers,
    setDirectionPoints,
   
  } = useMapStore();
  const {setDirections} = useLocationStore();

  const {vehicleList, setVehicleList} =
    useRideSelectionStore();

  const handleCall = (phoneNumber) => {
    const url = `tel:${encodeURIComponent(phoneNumber)}`; 
     Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  }

  const onBackPress = async () => {

    if (vehicleList.length !== 0) return setVehicleList([])
    setDirections([
      {id: 1, name: 'Start', location: [], locationName: ''},
      {id: 2, name: 'End', location: [], locationName: ''},
    ]);
    setOnSearchResults(null);
    setMapMarkers([]);
    goBack();
    setDirectionPoints(null);
    setSearchUnit('');
    setSelectedInput(null);
    await locationTask.getCurrentLocation();
  };

  BackHandler.addEventListener('hardwareBackPress', () => {
    onBackPress()
    return true
  });

  return (
    <>
    <StatusBar barStyle={'dark-content'} backgroundColor={colors.white}/>
      <NavBar  title={'Driver Assigned'} />
      <View style={rideStyles.container}>
        <View style={rideStyles.title}>
          <Text style={rideStyles.titleTxt}>Your driver has arrived</Text>
          <View style={rideStyles.statusBox}>
            <Text style={[rideStyles.titleTxt, {fontSize: 14}]}>Waiting</Text>
          </View>
        </View>
        <View style={rideStyles.contentContianer}>
          <View style={rideStyles.carDetailsCard}>
            <Text style={rideStyles.vehicleNum}>TN 01 AB 1234</Text>
            <Text style={rideStyles.vehicleType}>
              Maruti Suzuki Swift . White
            </Text>
          </View>
          <View style={rideStyles.driverDetails}>
            <View style={rideStyles.profileContainer}>
              <View style={rideStyles.profileImage}></View>
              <Text style={rideStyles.rating}>< AntDesign name={'star'} color={colors.yellow} size={10}/>{' '}4.8</Text>
            </View>
            <View style={rideStyles.profileNameContainer}>
              <Text style={rideStyles.driverName}>Vandervort Wilmer</Text>
              <Text style={rideStyles.driverratingTxt}>Top Rated Driver</Text>
            </View>
            <View style={rideStyles.otpContainer}>
              <Text style={rideStyles.otpTitle}>OTP</Text>
              <View style={{flexDirection: 'row'}}>
                {otpArray.map((char, index) => (
                  <Text key={index} style={rideStyles.otpNum}>
                    {char}
                  </Text>
                ))}
              </View>
            </View>
          </View>
          <View style={[rideStyles.driverDetails,{width:'100%'}]}>
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
          </View>
          <View style={rideStyles.driverDetails}>
           <TouchableOpacity onPress={() => handleCall('8248611628')} style={rideStyles.callBtn}>
           <FontAwesome6 size={14} color={colors.white} name="phone-volume"/>
            <Text style={rideStyles.callTxt}>CALL DRIVER</Text>
           </TouchableOpacity>
           <TouchableOpacity style={rideStyles.msgBtn}>
             <Message />
           </TouchableOpacity>
           <TouchableOpacity style={rideStyles.closeBtn}>
            <AntDesign name="close" size={26} color={colors.white}/>
           </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

export default DriverArrival;

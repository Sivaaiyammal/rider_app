import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import NavBar from '../../components/NavBar';
import {colors, Fonts} from '../../constants/constants';

import { rideStyles } from '../../styles/RideStyles';

import Rocket from '../../assets/image/svgIcons/rocket.svg';
import EndBlack from '../../assets/image/svgIcons/end_black.svg';
import { vehicleDetailsStyles } from '../../styles/VehicleDetails';
import useLocationStore from '../../store/useLocationStore';

const OnRide = () => {
    const { directions } = useLocationStore();

    const getLocationIcon = item => {
        switch (item.name) {
          case 'Start':
            return <Rocket />;
          case 'End':
            return <EndBlack />;
        }
      };

  return (
    <>
    <NavBar withBg title={'On Ride'} />
    <View style={[rideStyles.container]}>
      <View style={rideStyles.title}>
        <Text style={rideStyles.titleTxt}>Reach your destination in</Text>
        <View style={[rideStyles.statusBox,{backgroundColor:colors.call_green}]}>
          <Text style={[rideStyles.titleTxt, {fontSize: 14}]}>28:30 Mins . 15 Km</Text>
        </View>
      </View>
      <View style={[rideStyles.contentContianer, {paddingBottom:10}]}>
       <View style={rideStyles.driverDetailsB}>
         <Text style={rideStyles.OnRideText}>On Ride</Text>
         <View style={rideStyles.profilePic}></View>
         <Text style={rideStyles.profileName}>Vandervort Wilmer</Text>
         <Text style={rideStyles.carType}>Maruti Suzuki Swift . TN 01 AB 1234</Text>
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
          <Text style={vehicleDetailsStyles.paymentTxt}>Change Payment Method</Text>
        </TouchableOpacity>
      </View>
    </View>
  </>
  )
}

export default OnRide

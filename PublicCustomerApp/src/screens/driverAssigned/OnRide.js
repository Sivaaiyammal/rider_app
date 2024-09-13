import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import NavBar from '../../components/NavBar';
import {colors, Fonts} from '../../constants/constants';

import {rideStyles} from '../../styles/RideStyles';

import Rocket from '../../assets/image/svgIcons/rocket.svg';
import EndBlack from '../../assets/image/svgIcons/end_black.svg';
import {vehicleDetailsStyles} from '../../styles/VehicleDetails';
import useLocationStore from '../../store/useLocationStore';
import {useStackScreenStore} from '../../store/useStackScreenStore';
import {scheduleContainerStyles} from '../../styles/AddLocationStyles';

const OnRide = () => {
  const {directions} = useLocationStore();
  const {setStackScreen} = useStackScreenStore();

  const getLocationIcon = item => {
    switch (item.name) {
      case 'Start':
        return <Rocket />;
      case 'End':
        return <EndBlack />;
    }
  };

  const changePayment = () => {
    // setStackScreen('RideSummary');
  };

  const onPressDetails = () => {
    setStackScreen('RideSummary');
  };

  const onRideComplete = true;

  return (
    <>
      <NavBar withBg title={'On Ride'} />
      <View style={[rideStyles.container]}>
        <View style={rideStyles.title}>
          <Text style={rideStyles.titleTxt}>Reach your destination in</Text>
          <View
            style={[
              rideStyles.statusBox,
              {backgroundColor: colors.call_green},
            ]}>
            <Text style={[rideStyles.titleTxt, {fontSize: 14}]}>
              28:30 Mins . 15 Km
            </Text>
          </View>
        </View>
        <View style={[rideStyles.contentContianer, {paddingBottom: 10}]}>
          <View style={rideStyles.driverDetailsB}>
            <Text style={rideStyles.OnRideText}>On Ride</Text>
            <View style={rideStyles.profilePic}></View>
            <Text style={rideStyles.profileName}>Vandervort Wilmer</Text>
            <Text style={rideStyles.carType}>
              Maruti Suzuki Swift . TN 01 AB 1234
            </Text>
          </View>
          <View style={[rideStyles.driverDetails, {width: '100%'}]}>
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
          <TouchableOpacity
            style={vehicleDetailsStyles.paymentContainer}
            onPress={() => changePayment()}>
            <Text style={vehicleDetailsStyles.paymentTxt}>
              Change Payment Method
            </Text>
          </TouchableOpacity>
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

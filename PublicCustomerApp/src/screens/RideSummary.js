import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import BottomSheet from '../components/BottomSheet';
import {vehicleDetailsStyles} from '../styles/VehicleDetails';
import useLocationStore from '../store/useLocationStore';
import Rocket from '../assets/image/svgIcons/rocket.svg';
import EndBlack from '../assets/image/svgIcons/end_black.svg';
import DistanceBlue from '../assets/image/svgIcons/distanceBlue.svg';
import Watch from '../assets/image/svgIcons/watch.svg';
import Fare from '../assets/image/svgIcons/fare.svg';
import Support from '../assets/image/svgIcons/support.svg';
import {rideStyles} from '../styles/RideStyles';
import {rideSummary} from '../styles/RideSummary';

const RideSummary = () => {
  const {directions} = useLocationStore();

  const getLocationIcon = item => {
    switch (item.name) {
      case 'Start':
        return <Rocket />;
      case 'End':
        return <EndBlack />;
    }
  };

  return (
    <BottomSheet>
      <View style={rideSummary.priceContainer}>
        <ImageBackground
          source={require('../assets/image/summaryBg.png')}
          style={rideSummary.imageBg}
          resizeMode="cover">
          <Text style={rideSummary.rideFare}>Ride Fare</Text>
          <Text style={rideSummary.rideFareAmount}>₹157.50</Text>
        </ImageBackground>
      </View>
      <Text style={rideSummary.headerDate}>Mon, Jan 01 2022 | 3:00 PM</Text>
      <Text style={rideSummary.headerTipId}>Trip ID : ABCD01234</Text>
      <View style={rideSummary.seperater} />
      <Text style={rideSummary.titles}>Location Details</Text>
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
      <View style={rideSummary.seperater} />
      <Text style={rideSummary.titles}>Trip Details</Text>
      <View style={[rideStyles.driverDetailsB, {marginTop: 15}]}>
        <View style={rideStyles.profilePic}></View>
        <Text style={rideStyles.profileName}>Vandervort Wilmer</Text>
        <Text style={rideStyles.carType}>
          Maruti Suzuki Swift . TN 01 AB 1234
        </Text>
      </View>
      <View style={rideSummary.rideDetails}>
        <View
          style={[rideSummary.rideDetailsCards, {backgroundColor: '#e5f6ff'}]}>
          <DistanceBlue />
          <Text style={rideSummary.rideDetailsCardsText}>Distance</Text>
          <Text style={rideSummary.rideDetailsText}>12 Km</Text>
        </View>
        <View
          style={[rideSummary.rideDetailsCards, {backgroundColor: '#fef4e4'}]}>
          <Watch />
          <Text style={rideSummary.rideDetailsCardsText}>Duration</Text>
          <Text style={rideSummary.rideDetailsText}>30 min</Text>
        </View>
        <View
          style={[rideSummary.rideDetailsCards, {backgroundColor: '#e9f4ef'}]}>
          <Fare />
          <Text style={rideSummary.rideDetailsCardsText}>Fare</Text>
          <Text style={rideSummary.rideDetailsText}>₹100.00</Text>
        </View>
      </View>

      <View style={rideSummary.seperater} />

      <View style={rideSummary.billView}>
        <Text style={rideSummary.titles}>Payment Details</Text>
        <View style={rideSummary.billContents}>
          <Text style={rideSummary.billTitle}>Trip Bill</Text>
          <Text style={rideSummary.billPrice}>₹92.00</Text>
        </View>
        <View style={rideSummary.billContents}>
          <Text style={rideSummary.billTitle}>GST 18%</Text>
          <Text style={rideSummary.billPrice}>₹18.00</Text>
        </View>
        <View style={rideSummary.billContents}>
          <Text style={rideSummary.billTitle}>Booking Charges</Text>
          <Text style={rideSummary.billPrice}>-₹10.00</Text>
        </View>
        <View style={rideSummary.seperater} />
        <View style={rideSummary.billContents}>
          <Text style={rideSummary.billTitleTotal}>Total Bill</Text>
          <Text style={rideSummary.billPriceTotal}>₹90.00</Text>
        </View>
      </View>

      <TouchableOpacity style={vehicleDetailsStyles.paymentContainer}>
        <Text style={vehicleDetailsStyles.paymentTxt}>
          Get Help from Support
        </Text>
        <Support />
      </TouchableOpacity>
      <TouchableOpacity style={rideSummary.payBtn}>
        <Text style={rideSummary.payBtnTxt}>PAY ₹157.50</Text>
      </TouchableOpacity>
    </BottomSheet>
  );
};

export default RideSummary;

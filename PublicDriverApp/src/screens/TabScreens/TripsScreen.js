import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import HomeHeader from '../../components/HomeHeader';
import UpComingTrips from '../../assets/image/drawerIcons/upcomingTrips.svg';
import ArrowRight from '../../assets/image/svgIcons/arrowRight.svg';
import TripHistory from '../../assets/image/drawerIcons/tripHistory.svg';
import {serviceStyles} from '../../styles/serviceStyles';
import {useStackScreenStore} from '../../store/useStackScreenStore';

const TripsScreen = () => {
  const {setStackScreen} = useStackScreenStore();

  return (
    <View style={serviceStyles.screen}>
      <HomeHeader screen={'Trips'} />
      <View style={serviceStyles.container}>
        <TouchableOpacity
          style={serviceStyles.serviceTypeBtn}
          onPress={() => setStackScreen('UpComingTrips')}>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            <UpComingTrips />
            <Text style={serviceStyles.serviceTypeBtnTxt}>Upcoming Trips</Text>
          </View>
          <ArrowRight />
        </TouchableOpacity>
        <TouchableOpacity style={serviceStyles.serviceTypeBtn}>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            <TripHistory />
            <Text style={serviceStyles.serviceTypeBtnTxt}>Trip History</Text>
          </View>
          <ArrowRight />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TripsScreen;

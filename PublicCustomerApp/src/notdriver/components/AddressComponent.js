import {Animated, StyleSheet, Text, View} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useUserStore from '../../common/store/useUserStore';
import { Colors, Fonts } from '../../common/constants/constants';
import WayPointIndicator from '../Indicators/WayPointIndicator';
import YellowMarker from '../../notdriver/assets/icons/YellowMarker.svg';
import StatLocBlue from '../../notdriver/assets/icons/statLocBlue.svg';
import { useTranslation } from 'react-i18next';
import { DateTimeFormatter } from '../../common/utils/DateTimeFormatter';
import Entypo from 'react-native-vector-icons/Entypo';

const AddressComponent = props => {
  const {userInfo} = useUserStore()
  const {percentage, waypoints, screen, deviceLocation, isPublicRides} = props;
  const {t} = useTranslation()

  const busPosition = useRef(new Animated.Value(0)).current;
  const [finalPosition, setFinalPosition] = useState(0);

  const transformedData = waypoints;

  const handleBusLayout = (event, index) => {
    if (index === transformedData.length - 1) {
      const {y} = event.nativeEvent.layout;
      setFinalPosition(y);
    }
  };

  const translateY = busPosition.interpolate({
    inputRange: [0, 100],
    outputRange: [0, finalPosition],
  });

  useEffect(() => {
    Animated.timing(busPosition, {
      toValue: percentage,
      duration: 4000,
      useNativeDriver: true,
    }).start();
  }, [busPosition, finalPosition]);

   const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined || minutes <= 0) return '0 Min';
    if (minutes <= 1 || minutes < 2) return '1 Min';
    return `${DateTimeFormatter.formatMinutesToDuration(minutes)}`;
   };

  function isMyStop(name) {
    const result = transformedData.find(stop => 
      stop?.passangers?.some(passenger => passenger?._id === userInfo?._id)
    );

    if (result && name === result.name) {
      return 'your_stop';
    }
    return null;
  }

  return (
    <View style={[styles.mainContainer,{width: screen === 'rideDetails' ? '100%' : '90%',backgroundColor: isPublicRides ? Colors.white : Colors.grey_light},]}>
     
      {transformedData?.map((item, index) => {
        let displayName = item.name;
        let displayIcon = item.icon;

        if (index === 0) {
          displayName =isPublicRides? 'pick_up_location' : 'start_loc';
          displayIcon = isPublicRides? <StatLocBlue/> : <YellowMarker />;
        } else if (index === transformedData.length - 1) {
          displayName = isPublicRides? 'drop_location' : 'end_loc';
          displayIcon = <Ionicons name={isPublicRides? 'location-outline' : 'flag'} color={'red'} size={18} />;
        } else {
          displayName = `stop`;
          displayIcon = <WayPointIndicator waypoints={index}/>;
        }
        return (
          <View
            style={styles.addContainer}
            key={index}
            onLayout={event => handleBusLayout(event, index)}>
            <View style={[styles.markerIcons,{backgroundColor:isPublicRides ? Colors.white : Colors.grey_light}]}>{displayIcon}</View>
            <Text style={styles.nameTxt}>
              {displayName === 'stop'
                ? t(displayName) + ' ' + index
                : t(displayName) || displayName} <Text style={styles.yourStopTxt}>{t(isMyStop(item.name))}</Text>
            </Text>
            <Text style={styles.addTxt}>{item.address}</Text>
            {item?.waitingTime > 0 && ( 
              <View style={styles.waitingTimeContainer}>
              <Entypo name="clock" size={14} color={Colors.periwinkle}/>
              <Text style={styles.waitingTimeTxt}>{formatDuration(item.waitingTime)}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default AddressComponent;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: Colors.grey_light,
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 10,
  },
  nameTxt: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.cool_grey,
  },
  addTxt: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.black,
  },
  addContainer: {
    borderLeftWidth: 1,
    paddingLeft: 20,
    borderStyle: 'dashed',
    marginTop:10
  },
  countTxt: {
    fontFamily: Fonts.regular,
    fontSize: 18,
  },
  markerIcons: {
    position: 'absolute',
    left: -12,
    backgroundColor: Colors.grey_light,
    alignItems: 'center',
    justifyContent: 'center',
    width: 25,
    height: 25,
  },
  busIcon: {
    position: 'absolute',
    left: 4,
    zIndex: 1,
  },
  yourStopTxt:{
    fontFamily:Fonts.regular,
    color:'#1379ff',
    fontSize:12
  },
  waitingTimeContainer:{
    flexDirection:'row',
    gap:5,
    marginTop:10,
    alignItems:'center'
  },
  waitingTimeTxt:{
    fontFamily:Fonts.regular,
    fontSize:14,
    color:Colors.periwinkle
  }
});

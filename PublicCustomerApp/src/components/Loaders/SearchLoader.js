import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Pulse from './Pulse';
import VehicleSearch from '../../assets/image/svgIcons/vehicleSearch.svg';
import { colors, Fonts } from '../../constants/constants';
import SwipeBtn from '../SwipeBtn';

const SearchLoader = (props) => {

  const {handleSwipeSuccess} = props

  // const handleSwipeSuccess = () => {
  //   Alert.alert("Success", "You have successfully swiped the button!");
  // };

  return (
    <View style={styles.container}>
      <Pulse />
      <View style={styles.contentContainer}>
      <VehicleSearch />
      <Text style={styles.textA}>Searching for Taxi...</Text>
      <Text style={styles.textB}>Your ride will start soon</Text>
      </View>
      <View style={styles.SwipeBtn}>
      <SwipeBtn name="SWIPE TO CANCEL" onHandleSwipeEnd={()=>handleSwipeSuccess()} />
      </View>
    </View>
  );
};

export default SearchLoader;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 300,
    backgroundColor: 'white',
    overflow: 'hidden',
    borderTopLeftRadius:30,
    borderTopRightRadius:30
  },
  contentContainer:{
    width:'80%',
    marginTop:60,
    alignSelf:'center',
    alignItems:'center',
  },
  textA:{
    fontFamily:Fonts.medium,
    color:colors.black,
    fontSize:16,
    marginTop:10
  },
  textB:{
    fontFamily:Fonts.light,
    color:colors.black,
    fontSize:12,
    marginTop:10
  },
  SwipeBtn:{
    marginTop:20
  }
});

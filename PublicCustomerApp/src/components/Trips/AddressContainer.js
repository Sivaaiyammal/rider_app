import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { colors, Fonts } from '../../constants/constants';
import Rocket from '../../assets/image/svgIcons/rocket.svg';
import EndBlack from '../../assets/image/svgIcons/end_black.svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useStackScreenStore } from '../../store/useStackScreenStore';
import  useCurrentRideInfoStore  from '../../features/rideStatus/store/useCurrentRideInfoStore';

import FontAwesome from 'react-native-vector-icons/FontAwesome5';

const AddressContainer = ({ directions,edit=false ,live=false}) => {


  const getLocationIcon = (item,index,length,isReached) => {

    if(live && isReached){
      return <View style={{width:20,height:20,backgroundColor:'#00920a',borderRadius:100,alignItems:'center',justifyContent:'center'}}>
           <FontAwesome name="check" size={12} color={colors.white} />
      </View>
    }
  
    switch (index) {
      case 0:
        return <Rocket height={18} width={18} style={{color:isReached ? '#00920a': 'black'}}/>;
      case length-1:
        return <EndBlack height={20} width={20} color={colors.primary}/>;
      default:
        return <View style={{width:20,height:20,backgroundColor:'black',borderRadius:100,alignItems:'center',justifyContent:'center'}}>
          <Text style={{color:'white',fontSize:12,fontFamily:Fonts.regular}}>{index}</Text>
        </View>;
    }
  };

    const {setStackScreen} = useStackScreenStore()
    const {tripId} = useCurrentRideInfoStore()

  const handleStopEdit = (item) => {
    setStackScreen('WaypointScreen',{
      stopsFromOnGoingRide:directions,
      tripId:tripId
    })
  }
  
  return (
    <View style={styles.locationContainer}>
      <View style={styles.line}></View>
      {directions.map((item, index) => {
        return (
          <View key={item.id} style={styles.locationNames}>
            {getLocationIcon(item,index,directions.length,item.isReached)}
            <View style={styles.locationTxtContainer}>
              <Text style={{fontSize:14, color:'#212121',fontFamily:Fonts.regular}}>
                {index == 0 ? 'Pickup' : index != directions.length-1 ? 'Stop' : 'Drop'}
              </Text>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.locationTxt}>
                {(item.address || item.locationName)?.charAt(0).toUpperCase() + (item.address || item.locationName)?.slice(1)}
              </Text>
             
             
            </View>
            {edit && !item.isReached && (
              <TouchableOpacity style={{paddingTop:10}} onPress={handleStopEdit}>  
              <Icon name="edit" size={20} color={colors.black} />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
};

AddressContainer.propTypes = {
  directions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
      locationName: PropTypes.string
    })
  ).isRequired
};

const styles = StyleSheet.create({
  locationContainer: {
    backgroundColor: colors.white_dirt,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom:10
  },
  locationNames: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
   
  },
  locationTxtContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  locationTxt: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.black,
  },
  line:{
    position:'absolute',
    flex:1,
    width:1,
    borderLeftWidth:1,
    borderLeftColor:'grey',
    borderStyle:'dashed',
    left:25,
    right:0,
    top:0,
    bottom:0,
    marginVertical:40
  }
});

export default AddressContainer;
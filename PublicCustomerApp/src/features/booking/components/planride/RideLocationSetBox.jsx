import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import PropTypes from 'prop-types';
import DestinationIcon from '../../../../assets/icons/destinationIcon';
import { Fonts } from '../../../../constants/constants';
import LocationTypes from '../../types/LocationTypes.json';



const LineWidth = 2;
const RideLocationSetBox = ({
  pickup = '1, Kambar Street, Alandur, Chennai...',
  destination = 'Search Destination',
  onAddWaypoint,
  onLocationClick,
}) => {
  return (
    <View style={styles.container}>
      {/* Pickup Row */}
      <TouchableOpacity style={[styles.row]} onPress={()=>onLocationClick(LocationTypes.START_LOCATION)}>
        <View style={styles.iconContainer}>
        <View style={[styles.dottedVerticalLine, { borderColor: 'transparent' }]} />

        <View style={[styles.iconItem, { backgroundColor: '#4caf5030' }]}> 
          <View style={styles.iconSubItem} />
        </View>
        <View style={styles.dottedVerticalLine} />
        </View>
        <View style={[styles.locationContainer]}>
          <Text style={styles.label}>Your Location</Text>
          <Text style={styles.address} numberOfLines={1}>{pickup}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.stopContainer} onPress={()=>onLocationClick(LocationTypes.WAYPOINT_LOCATION)}>
        <View style={styles.iconContainer}>
        <View style={styles.dottedVerticalLine} />
        </View>
        <View style={styles.stopLocationContainer}>
         
        </View>
      </TouchableOpacity>
        <TouchableOpacity style={styles.addStopBtnAbsolute} onPress={()=>onAddWaypoint(LocationTypes.WAYPOINT_LOCATION)}>
            <View style={styles.plusIconBg}>
            <Svg width="18" height="18" viewBox="0 0 18 18">
                <Path d="M9 4v10M4 9h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </Svg>
            </View>
        </TouchableOpacity>
     
      {/* Destination Row */}
      <TouchableOpacity style={[styles.row]} onPress={()=>onLocationClick(LocationTypes.DESTINATION_LOCATION)} activeOpacity={0.7}>
        <View style={styles.iconContainer}>
        <View style={styles.dottedVerticalLine} />
        
         <DestinationIcon  height={23} width={23} />
        <View style={[styles.dottedVerticalLine, { borderColor: 'transparent' }]} />

        
        </View>
        <View style={[styles.locationContainer]}>
          <Text style={styles.label}>Destination</Text>
          <Text style={styles.placeHolder}>{destination}</Text>
        </View>
      </TouchableOpacity>
   
    </View>
  );
};

RideLocationSetBox.propTypes = {
  pickup: PropTypes.string,
  destination: PropTypes.string,
  onAddWaypoint: PropTypes.func,
  onSearchDestination: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 15,
   
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    margin: 8,
    boxShadow: '0 3px 6px 0 rgba(0, 0, 0, 0.05)',
    border: 'solid 0.5px #e0e0e0',
    position: 'relative',
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  iconItem: {
    width: 25,
    height: 25,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSubItem: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4caf50',
  },
  locationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 15,
    paddingVertical: 10,
   
   
  },
  label: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 2,
  },
  address: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
    color: '#212121',
    fontFamily: Fonts.regular,
  },
  placeHolder: {
    fontSize: 14,
    color: '#212121',
   
    fontFamily: Fonts.regular,
  },
  dottedVerticalLine: {
    width: 1,
    flex: 1,
    borderStyle: 'dashed',
    borderLeftWidth: 1,
    borderColor: ' #e0e0e0;',
  },
  iconContainer: {
    width: 25,
   
    justifyContent: 'center',
    alignItems: 'center',
   
  },
 
  plusIconBg: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStopBtnAbsolute: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    right: 10,

  
  
    zIndex: 10,
  },
  dottedLineContainer: {
    alignItems: 'center',
  
  },
  dottedLine: {
    height: 2,
    width: '100%',
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 1,
  },
  stopContainer: {

    flexDirection: 'row',
  },
  stopLocationContainer: {
    flex: 1,
    height: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 15,
    backgroundColor: '#eee',
    borderRadius: 10,
    
    
    
   
    
  },
});

export default RideLocationSetBox;

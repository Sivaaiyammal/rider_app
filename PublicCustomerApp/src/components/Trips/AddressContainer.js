import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { colors, Fonts } from '../../constants/constants';
import Rocket from '../../assets/image/svgIcons/rocket.svg';
import EndBlack from '../../assets/image/svgIcons/end_black.svg';
import Icon from 'react-native-vector-icons/MaterialIcons';

const getLocationIcon = (item,index,length) => {
  switch (index) {
    case 0:
      return <Rocket height={15} width={15} />;
    case length-1:
      return <EndBlack height={15} width={15} />;
    default:
      return <Rocket />;
  }
};

const AddressContainer = ({ directions,edit=false }) => {
  
  return (
    <View style={styles.locationContainer}>
      {directions.map((item, index) => {
        return (
          <View key={item.id} style={styles.locationNames}>
            {getLocationIcon(item,index,directions.length)}
            <View style={styles.locationTxtContainer}>
              <Text style={{fontSize:14, color:'#212121',fontFamily:Fonts.regular}}>
                {index == 0 ? 'Pickup' : index != directions.length-1 ? 'Stop' : 'Drop'}
              </Text>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.locationTxt}>
                {(item.address || item.locationName)?.charAt(0).toUpperCase() + (item.address || item.locationName)?.slice(1)}
              </Text>
             
             
            </View>
            {edit && (
              <TouchableOpacity style={{paddingTop:10}}>  
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
  }
});

export default AddressContainer;
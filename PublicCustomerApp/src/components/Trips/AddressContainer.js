import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { colors, Fonts } from '../../constants/constants';
import Rocket from '../../assets/image/svgIcons/rocket.svg';
import EndBlack from '../../assets/image/svgIcons/end_black.svg';

const getLocationIcon = (item) => {
  switch (item.name) {
    case 'Start':
    case 'Pickup Point':
      return <Rocket />;
    case 'End':
    case 'Drop Point':
      return <EndBlack />;
    default:
      if (item.name && item.name.startsWith('Waypoint')) {
        return <EndBlack />;
      }
      return null;
  }
};

const AddressContainer = ({ directions }) => {
  console.log('directions', directions)
  return (
    <View style={styles.locationContainer}>
      {directions.map((item, index) => {
        return (
          <View key={item.id} style={styles.locationNames}>
            {getLocationIcon(item)}
            <View style={styles.locationTxtContainer}>
              <Text style={{ color:colors.grey}}>
                {index == 0 ? 'From' : index != directions.length-1 ? 'Stop' : 'To'}
              </Text>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.locationTxt}>
                {(item.address || item.locationName)?.charAt(0).toUpperCase() + (item.address || item.locationName)?.slice(1)}
              </Text>
            </View>
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
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom:10
  },
  locationNames: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
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
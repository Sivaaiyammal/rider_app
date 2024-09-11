import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {colors, Fonts} from '../constants/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProfileImage from '../assets/image/svgIcons/profileImage.svg';
import useLocationStore from '../store/useLocationStore';
import SearchAPI from '../controllers/NEMap/Search';

const MapScreenHeader = props => {
  const {toggleMenu, showMenu} = props;
  const {location, currentLocationName, setCurrentLocationName} = useLocationStore();

  const fetchAddressName = async () => {
    if (location && location.length === 2) {
      const coordinates = [location[1], location[0]];
      try {
        const search = new SearchAPI();
        const response = await search.reverseGeocode(coordinates);
        if (response) {
            setCurrentLocationName(
            response.properties.street ||
              response.properties.name ||
              'Unnamed Location',
          );
        }
      } catch (e) {
        console.error('Failed to fetch address', e);
      }
    }
  };

  useEffect(() => {
    fetchAddressName(); 
  }, [location]); 

  return (
    <View style={styles.addressContainer}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity onPress={() => toggleMenu()}>
          <Ionicons
            name={!showMenu ? 'reorder-three-outline' : 'close'}
            size={35}
          />
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
          <ProfileImage />
        </TouchableOpacity>
      </View>
      <View style={{marginLeft: 10}}>
        <Text style={styles.title}>{'Location'}</Text>
        <Text style={styles.address}>
          {currentLocationName ? currentLocationName : <ActivityIndicator />}
        </Text>
      </View>
    </View>
  );
};

export default MapScreenHeader;

const styles = StyleSheet.create({
  addressContainer: {
    position: 'absolute',
    top: 20,
    zIndex: 100,
    backgroundColor: colors.white,
    flexDirection: 'row',
    padding: 8,
    borderRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    width: '90%',
    alignSelf: 'center',
  },
  addressProfileImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color:colors.black
  },
  address: {
    color: '#212121',
    fontSize: 12,
    marginTop: 2,
    fontFamily: Fonts.regular,
  },
});

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import {Fonts} from '../constants/constants';
import ProfileImage from '../assets/image/svgIcons/profileImage.svg';
import useLocationStore from '../store/useLocationStore';
import SearchAPI from '../controllers/NEMap/Search';
import HomeMenuIcon from '../assets/icons/HomeMenu.svg';
import {width} from '../utils/Utils';

const MapScreenHeader = props => {
  const {toggleMenu} = props;
  const {location, currentLocationName, setCurrentLocationName} = useLocationStore();

  // Calculate responsive maxWidth (70% of screen width)
  const responsiveMaxWidth = width * 0.7;

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
          gap: 5,
        }}>
        <TouchableOpacity style={styles.homeMenuIcon} onPress={() => toggleMenu()}>
          <HomeMenuIcon  />
          
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
          <ProfileImage />
        </TouchableOpacity>
      </View>
      <View style={{marginLeft: 10}}>
        <Text style={styles.title}>{'Your Location'}</Text>
        <Text style={[styles.address, {maxWidth: responsiveMaxWidth-10}]} numberOfLines={1} ellipsizeMode="tail">
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
    flexDirection: 'row',
    padding: 8,
    elevation: 5,
    overflow: 'hidden',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 16,
    boxShadow: '0 3px 6px 0 rgba(0, 0, 0, 0.05)',
    border: 'solid 0.5px #e0e0e0',
    backgroundColor: '#fff',
    
  },
  homeMenuIcon: {
    paddingHorizontal: 10,
  },
  addressProfileImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  title: {
    fontFamily: Fonts.regular,
    fontSize: 12,
   
    color: '#757575',
    
  },
  address: {
    color: '#212121',
    fontSize: 14,
    fontWeight: 500,
    marginTop: 2,
    fontFamily: Fonts.medium,
  },
});

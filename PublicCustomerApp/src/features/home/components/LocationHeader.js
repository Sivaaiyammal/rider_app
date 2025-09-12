import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
  } from 'react-native';
  import React, {useEffect} from 'react';
  import { useTranslation } from 'react-i18next';
  import {Fonts,colors} from '../../../constants/constants';
  import ProfileImage from '../../../assets/image/svgIcons/profileImage.svg';
  import useLocationStore from '../../../store/useLocationStore';
  import SearchAPI from '../../../controllers/NEMap/Search';
  import HomeMenuIcon from '../../../assets/icons/HomeMenu.svg';
  import {utils, width} from '../../../utils/Utils';
import CurrentLocationIcon from '../../../assets/icons/CurrentLocationIcon.svg';
import { height } from '../../../utils/Utils';
import locationTask from '../../../controllers/GetCurrentLocation';
import SkeletonLoader from '../../../components/Loaders/SkeletonLoader';

  
  const LocationHeader = (props) => {
    const { t } = useTranslation();
    const {toggleMenu} = props;
    const {location, currentLocationName, setCurrentLocationName} = useLocationStore();
   
    const handleCurrentLocation = async () => {
      await locationTask.getCurrentLocation();
      
    }
    // Calculate responsive maxWidth (70% of screen width)
    const responsiveMaxWidth = width * 0.7;
  
    const fetchAddressName = async () => {
      if (location && location.length === 2) {
        const coordinates = [location[1], location[0]];
        try {
          const search = new SearchAPI();
          const response = await search.reverseGeocode(coordinates);
          setCurrentLocationName(response);
          
        } catch (e) {
          console.error('Failed to fetch address', e);
        }
      }
    };

   
  
    useEffect(() => {
      fetchAddressName(); 
    }, [location]); 
  
    return (
      <View style={styles.headerWrapper}>
        <View style={styles.addressContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}>
            <TouchableOpacity style={styles.homeMenuIcon} onPress={() => toggleMenu()}>
              <HomeMenuIcon width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
              <ProfileImage />
            </TouchableOpacity>
          </View>
          <View style={{marginLeft: 10}}>
            <Text style={styles.title}>{t('your_location')}</Text>
            <Text style={[styles.address, {maxWidth: responsiveMaxWidth-10}]} numberOfLines={1} ellipsizeMode="tail">
              {currentLocationName? utils.getFormatedHeader(currentLocationName) : <SkeletonLoader  height={20} width={responsiveMaxWidth-50} backgroundColor={colors.grey_xlight} />}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.currentLocationIconContainer} onPress={handleCurrentLocation}>
          <CurrentLocationIcon width={25} height={25} />
        </TouchableOpacity>
      </View>
    );
  };
  
  export default LocationHeader;
  
  const styles = StyleSheet.create({
    headerWrapper: {
      position: 'relative',
      width: '100%',
      // Ensures the wrapper takes up space for absolute positioning
      minHeight: 80,
      zIndex: 100,
    },
    addressContainer: {
      position: 'absolute',
      top: 20,
      left: '5%',
      right: '5%',
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
      paddingLeft: 10,
      paddingRight: 7,
     
      alignItems:"center",
      justifyContent:"center",
      height: "100%",
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
    currentLocationIconContainer: {
      position: 'absolute',
      height: 40,
      width: 40,
      right: 30,
      bottom: -height*0.06,
      zIndex: 101,
      backgroundColor: 'white',
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 30,
      elevation: 10,
     
    },
  });
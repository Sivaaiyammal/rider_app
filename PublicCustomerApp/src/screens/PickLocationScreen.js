import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import {useStackScreenStore} from '../store/useStackScreenStore';
import NavBar from '../components/NavBar';
import useMapStore from '../features/map/store/useMapStore';
import PickIcon from '../assets/icons/pickupIcon.webp';
import { colors, Fonts   } from '../constants/constants';
import { height, utils} from '../utils/Utils';
import MapIcon from '../components/Map/MapIcon';
import SearchAPI from '../controllers/NEMap/Search';
import SkeletonLoader from '../components/Loaders/SkeletonLoader';
import useLocationStore from '../store/useLocationStore';
import useMapStyleStore from '../store/useMapStyleStore';
import CurrentLocationIcon from '../assets/icons/CurrentLocationIcon.svg';

// import locationTask from "../controllers/GetCurrentLocation";
import usePropsStore from '../store/usePropsStore';
import { useDebouncedAPICall } from '../hooks/useDebounce';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import AdaptiveText from '../components/Common/AdaptiveText';
import { findRoute } from '../controllers/NEMap/findRoute';
import polyline from '@mapbox/polyline';
const PickLocationScreen = ({onPickLocationResultCallback,locationType=null,defaultLocation=null,label=null,isFromRidePointsSelection=false}) => {
  const {goBack} = useStackScreenStore();
  const { setOnMapCenterChanged,setMapMarkers,setOnMapRotationChanged,setMapLocation} = useMapStore();
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const {currentLocationName,location} = useLocationStore();
  const {setIsMapButtonVisible} = useMapStyleStore();
  const {pickedLocation,setPickedLocation} = usePropsStore();
  const [mapMoving,setMapMoving] = useState(false)
  const { t } = useTranslation();
  const [isConfirming, setIsConfirming] = useState(false);
  const searchRef = useRef(new SearchAPI());
  const getLastLatLngfromPolyLine = useCallback(async (polylineData) => {
    console.log("polylineData",polylineData)
    const encodedPolyline = polylineData.trip.legs?.[0].shape || null;

    if(!encodedPolyline){
      return null;
    }
    const coordinates = await polyline.decode(encodedPolyline, 6);
    console.log("coordinates",coordinates)
    return coordinates[coordinates.length - 1];
  }, []);
  const extractRouteSummary = useCallback((routeData) => {
        if (!routeData?.trip?.legs || routeData.trip.legs.length === 0) {
          return null;
        }
        if (routeData.trip.legs.length > 1) {
          let totalTime = 0;
          let totalLength = 0;
          routeData.trip.legs.forEach(leg => {
            if (leg.summary) {
              totalTime += leg.summary.time || 0;
              totalLength += leg.summary.length || 0;
            }
          });
          return { time: totalTime, length: totalLength };
        }
        const leg = routeData.trip.legs[0];
        if (leg.summary) {
          return leg.summary;
        }
        return null;
      }, []);
  const fetchAddressName = useCallback(async (longitude, latitude) => {
    try {
      const response = await searchRef.current.reverseGeocode(longitude, latitude);    
      return response 

    } catch (e) {
      console.error("Failed to fetch address", e);
      return "";
    }
    
  }, []);

 
  const debouncedMapCenterChange = useDebouncedAPICall(async (data) => {
    setIsAddressLoading(true);
    const response = await fetchAddressName(data.longitude, data.latitude);
    
    let item = {
      latitude: data.latitude,
      longitude: data.longitude,
      placeName: response.placeName,
      type:locationType,
      locationFrom:"MAP"
    }
    if(response.address){
      item.address = response.address;
    }
    setPickedLocation(item);
    setIsAddressLoading(false);
  }, 500);

  const onmapCenterChanged = async (data)=>{
    setMapMoving(false);
    setPickedLocation(null)
    setIsAddressLoading(true);
    debouncedMapCenterChange(data);
  }

  const onMapRotationChangedCallback = async ()=>{
    setMapMoving(true);
  }



  const centerMap = async ()=>{
    setPickedLocation({
      latitude:location[1], 
      longitude: location[0],
      placeName: currentLocationName.placeName,
      address: currentLocationName.address, 
      type:locationType,
      locationFrom:"MAP"
    });
    setTimeout(()=>{
      setMapLocation({
        lat: location[1],
        lng: location[0],
        zoom: 18,
      });
    },100)

  }

  useEffect(()=>{

   
    setOnMapCenterChanged(onmapCenterChanged);
    setOnMapRotationChanged(onMapRotationChangedCallback);
    if (defaultLocation){
      setPickedLocation({
        latitude:defaultLocation.location[1],
        longitude:defaultLocation.location[0],
        placeName:defaultLocation.placeName,
        address:defaultLocation.address,
        type:locationType,
        locationFrom:"MAP"
      });

      
      
        setMapLocation({
          lat: defaultLocation.location[1],
          lng: defaultLocation.location[0],
          zoom: 25,
        });
      
    }else{
    setPickedLocation({
      latitude:location[1], 
      longitude: location[0],
      placeName: currentLocationName.placeName,
      address: currentLocationName.address, 
      type:locationType,
      locationFrom:"MAP"
    });
    setIsMapButtonVisible(false);
    setMapMarkers([]); 
    
     setTimeout(()=>{
            setMapLocation({
              lat: location[1],
              lng: location[0],
              zoom: 18,
            });
          },100)
    
     return ()=>{
      setOnMapCenterChanged(null);
      setIsMapButtonVisible(true);
     }
  
  }},[]);

  useEffect(() => {
    return () => {
      setIsConfirming(false);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (debouncedMapCenterChange && debouncedMapCenterChange.cancel) {
        debouncedMapCenterChange.cancel();
      }
      if (searchRef.current && searchRef.current.searchAbortController) {
        searchRef.current.searchAbortController.abort();
      }
    };
  }, []);

  // removed unused handleCurrentLocation to satisfy linter

  return (
    <>
      <NavBar
        title={ t('locate_on_map')}
        onBackPress={() => goBack()}
      />
      <View style={[styles.container]}>
        <View style={[mapMoving && { marginBottom: 7 },{ alignSelf: 'center', alignItems: 'center' }]}>
          <Image source={PickIcon} style={styles.pickIcon} />
          <View style={styles.pickIconVerticalLine}></View>
        </View>
        <View style={[styles.shadowContainer]}>
          <View style={[styles.shadow]}>
          </View>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <View style={styles.mapIconContainer}>
          <MapIcon />
        </View>
        <TouchableOpacity style={styles.currentLocationIconContainer} onPress={centerMap}>
          <CurrentLocationIcon width={25} height={25} />
        </TouchableOpacity>
        <LinearGradient
          colors={['transparent','#303030',]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={styles.bottomContainerWarrapper}
        >
          <AdaptiveText style={styles.bottomContainerText} color={colors.white}> {label ? label : t('pick_location')}</AdaptiveText>
        </LinearGradient>
        <View style={styles.AddressContainer}>
          {/* <View style={styles.AddressContainerIcon}>
                    <Icon name="location-on" size={30} color="#ffd11a"/>
                  </View> */}
          <View style={styles.AddressContainerMain}>
              <AdaptiveText style={styles.AddressContainerTextTitle} color={colors.grey_xxdark}>📍 {t('address')}</AdaptiveText>
             {!isAddressLoading && pickedLocation?.placeName && <Text style={styles.AddressContainerPlaceName} color={colors.black}>{utils.capitalizeFirstLetter(pickedLocation?.placeName)}</Text>}
            {(!isAddressLoading && pickedLocation?.address) &&
              <Text style={styles.AddressContainerTextAddress} color={colors.grey_xxdark}>{utils.formatArrayAddress(pickedLocation.address)}</Text>
            }

            {(isAddressLoading || !pickedLocation?.placeName)  &&
              <View style={styles.AddressContainerSkeleton}>
                <SkeletonLoader
                  width="100%"
                  height={20}
                  borderRadius={4}
                  backgroundColor="#E8E8E8"
                  shimmerColor="#F5F5F5"
                />
                


                <SkeletonLoader
                  width="70%"
                  height={20}
                  borderRadius={4}
                  backgroundColor="#E8E8E8"
                  shimmerColor="#F5F5F5"
                />
              </View>
            }
          </View>

        </View>
        <TouchableOpacity
          style={[
            styles.bottomContainerButton,
            (isAddressLoading || isConfirming || !pickedLocation?.placeName) && styles.bottomContainerButtonDisabled
          ]}
          onPress={async () => {
            if (isAddressLoading || isConfirming || !pickedLocation?.placeName) return;
            setIsConfirming(true);
            try {

              if(!isFromRidePointsSelection){
                onPickLocationResultCallback(pickedLocation, locationType);
                return;
              }
              const fromLat = location?.[1];
              const fromLon = location?.[0];
              const toLat = pickedLocation?.latitude;
              const toLon = pickedLocation?.longitude;
              if (fromLat == null || fromLon == null || toLat == null || toLon == null) {
                Alert.alert('Invalid location', 'Current or selected location is missing.');
                return;
              }
              const toRadians = (degrees) => (degrees * Math.PI) / 180;
              const R = 6371000; // meters
              const dLat = toRadians(toLat - fromLat);
              const dLon = toRadians(toLon - fromLon);
              const lat1Rad = toRadians(fromLat);
              const lat2Rad = toRadians(toLat);
              const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const distanceMeters = R * c;
              const isSameLocation = distanceMeters < 30; // treat <30m as same location
              if (isSameLocation) {
                Alert.alert('Same location', 'Current and selected location are the same.');
                return;
              }
              const points = [
                { lat: fromLat, lon: fromLon },
                { lat: toLat, lon: toLon }
              ];

              const routeData = await findRoute(points);
              const summary = await extractRouteSummary(routeData);
              const lastLatLng = await getLastLatLngfromPolyLine(routeData);
             
              
           
              const distanceKm = summary?.length || null;
            
              if (distanceKm >= 0.2) {
                if(lastLatLng){
                  pickedLocation.latitude = lastLatLng[0];
                  pickedLocation.longitude = lastLatLng[1];
                }
                onPickLocationResultCallback(pickedLocation, locationType);
              } else if (distanceKm == null ) {
                Alert.alert('No route found', 'No route is available to the selected location.');
               
              } else {
                const title = t('min_distance_title', { defaultValue: 'Distance too short' });
                const message = t('min_distance_message', { defaultValue: 'Ride distance must be at least 200 m' });
                Alert.alert(title, message);
              }
            } catch (e) {
              console.error('Route check failed', e);
              Alert.alert('Error', 'Failed to find a route. Please try again.');
            } finally {
              setIsConfirming(false);
            }
          }}
          disabled={isAddressLoading || isConfirming || !pickedLocation?.placeName}
        >
          {isConfirming ? (
            <ActivityIndicator color="white" />
          ) : (
            <AdaptiveText style={[
            styles.bottomContainerButtonText,
            (isAddressLoading || isConfirming || !pickedLocation?.placeName) && styles.bottomContainerButtonTextDisabled
            ]} color={colors.white}>{t('confirm_location')}</AdaptiveText>
          )}
        </TouchableOpacity>


      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  },
  pickIcon: {
    width: 25,
    height: 25,
  },
  pickIconVerticalLine: {
    width: 2,
    height: 15,
    backgroundColor: colors.black,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    borderRadius:20,
    marginHorizontal:10,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
    elevation: 10,
    zIndex: 1000,
    alignSelf:'center',
    justifyContent:'center',
    
  },
  bottomContainerText: {
    fontSize: 16,
    color: 'white',
    padding: 7,
    paddingHorizontal:10,
    fontFamily: Fonts.medium,
  },
  AddressContainer: {
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.grey,
    marginHorizontal:5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 15,
    
  },
  AddressContainerMain: {
    gap: 5,
    width: '100%',
  },
  AddressContainerTextTitle: {
    fontSize: 14,
    color: '#757575',
    fontFamily: Fonts.regular,
    
   
  },
  AddressContainerIcon: {
    backgroundColor:  '#fff79e',
    padding: 10,
    paddingVertical: 15,
    borderWidth: 0.5,
    borderColor:'#ffea00',
    borderRadius: 14,
  },
  AddressContainerTextAddress: {
    fontSize: 14,
    color: colors.grey_xxdark,
    textWrap: 'wrap',
    lineHeight: 20,
    fontFamily: Fonts.regular,
  
  },    
  AddressContainerPlaceName: {
    fontSize: 16,
    color: colors.black,
    textWrap: 'wrap',
    lineHeight: 20,
    fontFamily: Fonts.medium,
    marginTop: 10,
  },
  bottomContainerButton: {
    
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal:10,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    
    borderRadius: 16,
    backgroundColor: '#212121',
  },
  bottomContainerButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
  bottomContainerButtonDisabled: {
    backgroundColor: '#757575',
    opacity: 0.6,
  },
  bottomContainerButtonTextDisabled: {
    color: '#BDBDBD',
  },
  mapIconContainer: {
   position: 'absolute',
   top: -25,
   left: 10,
   zIndex: 1000,
  },
  AddressContainerSkeleton: {
    gap: 5,
  },
  currentLocationIconContainer: {
    position: 'absolute',
    top: -height * 0.07,
    right: 10,
    zIndex: 1000,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainerWarrapper: {
   padding:0,
   margin:5,
   borderTopLeftRadius:13,
   width:"70%"
  },
  shadowContainer: {
   
  
    height: 10,
    width: 10,
    top: -5,
   
    backgroundColor: '#101010'+'50',
    alignSelf: 'center',
    marginBottom: 10,
    borderRadius: 50,
    transform: [{ scaleX: 2 }],
  },
});

PickLocationScreen.propTypes = {
  onPickLocationResultCallback: PropTypes.func.isRequired,
  locationType: PropTypes.any,
  defaultLocation: PropTypes.shape({
    location: PropTypes.arrayOf(PropTypes.number),
    placeName: PropTypes.string,
    address: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  }),
  label: PropTypes.string,
  isFromRidePointsSelection: PropTypes.bool,
};

export default PickLocationScreen;

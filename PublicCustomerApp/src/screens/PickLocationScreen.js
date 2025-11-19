import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Vibration,
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
import { openFeedback } from '../utils/feedback';
import  Circle from '../controllers/NEMap/Circle';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

// import locationTask from "../controllers/GetCurrentLocation";
import usePropsStore from '../store/usePropsStore';
import { useDebouncedAPICall } from '../hooks/useDebounce';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import AdaptiveText from '../components/Common/AdaptiveText';
import { findRoute } from '../controllers/NEMap/findRoute';
import polyline from '@mapbox/polyline';
import useRideBookingLocationStore from '../features/booking/store/useRideBookingLocationStore';
import SearchScreen from '../features/search/screens/SearchScreen.jsx';
import { search } from 'react-native-country-picker-modal/lib/CountryService';


const PickLocationScreen = ({onPickLocationResultCallback,locationType=null,defaultLocation=null,label=null,isFromRidePointsSelection=false,limitRadius=null, searchBar=false,index=null,buttonLabel=null}) => {
  const {goBack} = useStackScreenStore();
  const { setOnMapCenterChanged,setMapMarkers,setOnMapRotationChanged,setMapLocation,setGeometries } = useMapStore();
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const {setStackScreen} = useStackScreenStore();
  const [searchTxt, setSearchTxt] = useState(null);
  const {currentLocationName,location} = useLocationStore();
  const {setIsMapButtonVisible} = useMapStyleStore();
  const {pickedLocation,setPickedLocation} = usePropsStore();
  const [showSearch,setShowSearch] = useState(false);
  // Ref to suppress handling of the next map center change when it is programmatic
  const suppressCenterChangeRef = useRef(false);
  const [mapMoving,setMapMoving] = useState(false)
  const { t } = useTranslation();
  const [isConfirming, setIsConfirming] = useState(false);
  const searchRef = useRef(new SearchAPI());
  const { 
    rideStartLocation, 
    rideEndLocation, 
    rideWayPoints 
  } = useRideBookingLocationStore();
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
    setSearchTxt(null);
    setPickedLocation(item);
    setIsAddressLoading(false);
  }, 500);

  const onmapCenterChanged = async (data)=>{
    // Ignore the next center change if we flagged it as programmatic
    if (suppressCenterChangeRef.current) {
      suppressCenterChangeRef.current = false;
      setMapLocation(false)
      return;
    }
    setMapMoving(false);
    // Start loading a new address only after user interaction
    setIsAddressLoading(true);
    debouncedMapCenterChange(data);
  };

  const onMapRotationChangedCallback = async ()=>{
    setMapMoving(true);
  }



  const centerMap = async ()=>{
    if(!location) return;
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

    const hasExistingPick = !!(
      pickedLocation &&
      pickedLocation.latitude != null &&
      pickedLocation.longitude != null && defaultLocation==null
    );

    if (hasExistingPick) {
      
      setIsMapButtonVisible(false);
      setMapMarkers([]);
      suppressCenterChangeRef.current = true;
      setTimeout(() => {
        setMapLocation({
          lat: pickedLocation.latitude,
          lng: pickedLocation.longitude,
          zoom: 18,
        });
      }, 100);
      setTimeout(()=>{
        setMapMoving(false);
      },500)

    } else if (defaultLocation){

      console.log('defaultLocation',defaultLocation);
      
      if(!defaultLocation.location && ( !defaultLocation.latitude && !defaultLocation.longitude)) return;

      const lat = defaultLocation?.location?.[1] || defaultLocation.latitude;
      const lon = defaultLocation?.location?.[0] || defaultLocation.longitude;

      console.log({
        latitude:lat,
        longitude:lon,
        placeName:defaultLocation.placeName || defaultLocation,
        address:defaultLocation.address,
        type:locationType,
        locationFrom:"MAP"
      })
      setPickedLocation({
        latitude:lat,
        longitude:lon,
        placeName:defaultLocation.placeName || defaultLocation?.name,
        address:defaultLocation.address,
        type:locationType,
        locationFrom:"MAP"
      });
      suppressCenterChangeRef.current = true;
      setMapLocation({
        lat: defaultLocation?.location?.[1] || defaultLocation.latitude,
        lng: defaultLocation?.location?.[0] || defaultLocation.longitude,
        zoom: 25,
      });

      if(limitRadius && limitRadius>0){
        const circle = new Circle(
      'circle1',
      'Circle 1',
      defaultLocation.location[1],
      defaultLocation.location[0],
      limitRadius * 1000, // radius in meters
      "#1A7d5fff",
      "#7d5fff", 
      "medium",
      );
      console.log('circle',circle);
      setGeometries([circle]);
         // Convert km to meters
      }
       setTimeout(()=>{
        setMapMoving(false);
      },500)
      setIsAddressLoading(false);

      
    } else {
     
      if(!location) return;
      console.log('location',location);
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
      suppressCenterChangeRef.current = true;
      setTimeout(()=>{
        setMapLocation({
          lat: location[1],
          lng: location[0],
          zoom: 18,
        });
      },100);
       setTimeout(()=>{
        setMapMoving(false);
      },500)

    }
    
    return ()=>{
      setOnMapCenterChanged(null);
      setIsMapButtonVisible(true);
    };
  },[]);

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

  const handleFeedback = () => {
    console.log("handleFeedback pickedLocation",pickedLocation)
          const lat = pickedLocation?.latitude.toFixed(6);
          const lon = pickedLocation?.longitude.toFixed(6);
          const coordStr = (lat != null && lon != null) ? `${lat} , ${lon}` : '';
          openFeedback({
            screenName: 'PickLocationScreen',
            initialValues: { coords: coordStr },
          });
        };

  const handleBack = () => {
    // Clear transient picked location only when user explicitly backs out.
    setPickedLocation(null);
    setGeometries([]);
    goBack();
  };

  const onSearchClickResultCallback = (result,type) => {
    if(!result) return;
    // Cancel any pending reverse geocode from map center change to avoid overwriting
    if (debouncedMapCenterChange && debouncedMapCenterChange.cancel) {
      debouncedMapCenterChange.cancel();
    }

    // Suppress the center change event triggered by programmatic map update
    suppressCenterChangeRef.current = true;
    const updated = {
      latitude: result.latitude,
      longitude: result.longitude,
      placeName: result.placeName || result.name || '',
      address: result.address,
      type: locationType ?? type,
      locationFrom: 'MAP'
    };
    setPickedLocation(updated);
    setSearchTxt(updated.placeName || updated.address || '');
    // Ensure UI stops showing skeleton loader
    setIsAddressLoading(false);
    setMapLocation({
      lat: updated.latitude,
      lng: updated.longitude,
      zoom: 18,
    });
    console.log('onSearchClickResultCallback', updated);
    setShowSearch(false);
   
  };

  const handleSearch = () => {
    setShowSearch(true);
  }

  // removed unused handleCurrentLocation to satisfy linter

  return (
    <>
      
      {searchBar ? (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <TouchableOpacity
              style={styles.searchBarIconButton}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel={t('back', { defaultValue: 'Back' })}
            >
              <Icon name="arrow-back" size={22} color={colors.black} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchBarInputContainer} onPress={handleSearch}>
              <Icon name="search" size={20} color={colors.grey_dark} />
              <Text
                style={[styles.searchBarInput,{color: searchTxt?colors.black: colors.grey_dark}]}
              
              >{searchTxt?searchTxt:t('search_cities_areas_streets')}</Text>
            </TouchableOpacity>
        
          </View>
        </View>
      ):
      <NavBar
        title={ t('locate_on_map')}
        onBackPress={handleBack}
        feedbackIcon={true}
        onrightIconPress={handleFeedback}
      />}
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
        <View>
        <TouchableOpacity style={styles.currentLocationIconContainer} onPress={centerMap}>
          <CurrentLocationIcon width={25} height={25} />
          </TouchableOpacity>
            <TouchableOpacity
              style={[styles.feedbackIcon, { backgroundColor: colors.black,}]}
              onPress={handleFeedback}
            >
               <Ionicons name={"chatbubble-ellipses-outline"} size={25} color={colors.white} />
            </TouchableOpacity>
        </View>
        
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
             {!isAddressLoading && pickedLocation?.placeName && (
               <Text style={styles.AddressContainerPlaceName} color={colors.black}>
                 {utils.capitalizeFirstLetter(pickedLocation?.placeName)}
               </Text>
             )}
            {!isAddressLoading && pickedLocation?.address && pickedLocation?.placeName && (
              <Text style={styles.AddressContainerTextAddress} color={colors.grey_xxdark}>
                {Array.isArray(pickedLocation.address)
                  ? utils.formatArrayAddress(pickedLocation.address)
                  : pickedLocation.address}
              </Text>
            )}

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
        {limitRadius && limitRadius>0 &&
        <View style={{alignSelf:'center', backgroundColor:colors.yellow+'50',paddingHorizontal:10,paddingVertical:5,marginTop:5,width:"90%",borderRadius:5}}>
      
          <AdaptiveText style={{alignSelf:'center', fontSize:12, color:colors.grey_xxdark}}>{t('location_within_radius', { radius: limitRadius })}</AdaptiveText>
        </View>
        }
        <TouchableOpacity
          style={[
            styles.bottomContainerButton,
            (isAddressLoading || isConfirming || !pickedLocation?.placeName) && styles.bottomContainerButtonDisabled
          ]}
          onPress={async () => {
            if (isAddressLoading || isConfirming || !pickedLocation?.placeName) return;

            Vibration.vibrate(100);
            setIsConfirming(true);
            try {
               setGeometries([]);
               if(limitRadius){
                const fromLat = defaultLocation?.location[1];
                const fromLon = defaultLocation?.location[0];

                const toLat = pickedLocation?.latitude;
                const toLon = pickedLocation?.longitude;
                const distanceFromCenter = utils.calculateDistanceInMeters(fromLat, fromLon, toLat, toLon);

                if(distanceFromCenter > limitRadius * 1000){

                const title = t('location_outside_radius_title', { defaultValue: 'Location outside allowed radius' });
                const message = t('location_outside_radius_message', { defaultValue: `You must select a location within a ${limitRadius} km radius.` });
                Alert.alert(title, message);
                return;
                }
              }

              if(!isFromRidePointsSelection){
                onPickLocationResultCallback(pickedLocation, locationType,index);
                return;
              }

              
        
              let fromLat = null;
              let fromLon = null;

              console.log('rideStartLocation,rideEndLocation,rideWayPoints',rideStartLocation,rideEndLocation,rideWayPoints);
              
              if(rideStartLocation){
                console.log('rideStartLocation',rideStartLocation);
                 fromLat = rideStartLocation?.latitude;
                 fromLon = rideStartLocation?.longitude;
              }
              if(rideEndLocation && locationType==="END_LOCATION"){
                console.log('rideEndLocation',rideEndLocation);
                 fromLat = rideEndLocation?.latitude;
                 fromLon = rideEndLocation?.longitude;
              }
           
              const toLat = pickedLocation?.latitude;
              const toLon = pickedLocation?.longitude;
              if (fromLat == null || fromLon == null ) {
                onPickLocationResultCallback(pickedLocation, locationType,index);
                return;
              }
              const distanceMeters = utils.calculateDistanceInMeters(fromLat, fromLon, toLat, toLon);

             
              const isSameLocation = distanceMeters < 30; // treat <30m as same location
              if (isSameLocation) {
                const title = t('same_location_title', { defaultValue: 'Locations too close' });
                const message = t('same_location_message', { defaultValue: 'Pickup and drop-off locations are very close. Please choose a farther location.' });
                Alert.alert(title, message);
                return;
              }
              const points = [
                { lat: fromLat, lon: fromLon },
                { lat: toLat, lon: toLon }
              ];

              console.log('points',points);

              const routeData = await findRoute(points);
              const summary = await extractRouteSummary(routeData);
              const lastLatLng = await getLastLatLngfromPolyLine(routeData);
             
              
           
              const distanceKm = summary?.length || null;
            
              if (distanceKm >= 0.2) {
                if(lastLatLng){
                  pickedLocation.latitude = lastLatLng[0];
                  pickedLocation.longitude = lastLatLng[1];
                }
                onPickLocationResultCallback(pickedLocation, locationType,index);
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
            ]} color={colors.white}>{buttonLabel || t('confirm_location')}</AdaptiveText>
          )}
        </TouchableOpacity>


      </View>
      {showSearch && (
        <View style={styles.searchOverlay}>
          <SearchScreen
            onSearchClick={onSearchClickResultCallback}
            searchType={locationType}
            onClose={() => setShowSearch(false)}
            hidePickLocation={true}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
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
  searchBarContainer:{
    position:'absolute',
    top:5,
    left:10,
    right:10,
    zIndex:1000,
    alignItems:'center',
  },
  searchBar:{
    flexDirection:'row',
    alignItems:'center',
    gap:7,
    paddingHorizontal:12,
    paddingVertical:10,
  
    borderRadius:12,
    width:"100%",
    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
  
  },
  searchBarIconButton:{
    backgroundColor: colors.white,
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.grey_light,
    elevation: 10,
  },
  searchBarInputContainer:{
    flex:1,
    flexDirection:'row',
  
    alignItems:'center',
    backgroundColor:colors.white,
    borderRadius:30,
    paddingHorizontal:10,
    paddingVertical:10,
    gap:8,
    borderWidth:1,
    borderColor:colors.grey_light,
   
  },
  searchBarInput:{
    flex:1,
    fontSize:16,
    fontFamily: Fonts.regular,
    color: colors.black,
    padding:0,
    textTransform:'capitalize'
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
  feedbackIcon: {
    position: 'absolute',
    top: -height * 0.15,
    right: 10,
    zIndex: 1000,
    backgroundColor: colors.black,
    padding: 10,
    borderRadius: 30,
    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  searchOverlay:{
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0,
    backgroundColor: 'white',
    zIndex:2000,
    elevation:20,
  }
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

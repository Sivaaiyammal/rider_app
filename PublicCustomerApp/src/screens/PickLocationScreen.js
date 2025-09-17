import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity
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
import locationTask from "../controllers/GetCurrentLocation";
import usePropsStore from '../store/usePropsStore';
import { useDebouncedAPICall } from '../hooks/useDebounce';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';

const PickLocationScreen = ({onPickLocationResultCallback,locationType=null,defaultLocation=null,title=null,label=null}) => {
  const {goBack} = useStackScreenStore();
  const { setOnMapCenterChanged,setMapMarkers,setOnMapRotationChanged,setMapLocation} = useMapStore();
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const {currentLocationName,location} = useLocationStore();
  const {setIsMapButtonVisible} = useMapStyleStore();
  const {pickedLocation,setPickedLocation} = usePropsStore();
  const [mapMoving,setMapMoving] = useState(false)
  const { t } = useTranslation();
  const fetchAddressName = useCallback(async (longitude, latitude) => {
    
  
    try {
      const search = new SearchAPI();
      const response = await search.reverseGeocode(longitude, latitude);    
      return response 

    } catch (e) {
      console.error("Failed to fetch address", e);
      return "";
    }
    
  }, []);

 
  const debouncedMapCenterChange = useDebouncedAPICall(async (data) => {
    setIsAddressLoading(true);
    const response = await fetchAddressName(data.longitude, data.latitude);
    console.log(response,"response")
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
  }, 300);

  const onmapCenterChanged = async (data)=>{
    setMapMoving(false);
    debouncedMapCenterChange(data);
  }

  const onMapRotationChangedCallback = async ()=>{
    setMapMoving(true);
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

  const handleCurrentLocation = async () => {
    await locationTask.getCurrentLocation();
    
  }

  


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
        <TouchableOpacity style={styles.currentLocationIconContainer} onPress={handleCurrentLocation}>
          <CurrentLocationIcon width={25} height={25} />
        </TouchableOpacity>
        <LinearGradient
          colors={['transparent','#303030',]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={styles.bottomContainerWarrapper}
        >
          <Text style={styles.bottomContainerText}> {label ? label : t('pick_location')}</Text>
        </LinearGradient>
        <View style={styles.AddressContainer}>
          {/* <View style={styles.AddressContainerIcon}>
                    <Icon name="location-on" size={30} color="#ffd11a"/>
                  </View> */}
          <View style={styles.AddressContainerMain}>
              <Text style={styles.AddressContainerTextTitle}>📍 {t('address')}</Text>
             {!isAddressLoading && pickedLocation?.placeName && <Text style={styles.AddressContainerPlaceName}>{utils.capitalizeFirstLetter(pickedLocation?.placeName)}</Text>}
            {(!isAddressLoading && pickedLocation?.address) &&
              <Text style={styles.AddressContainerTextAddress}>{utils.formatArrayAddress(pickedLocation.address)}</Text>
            }

            {isAddressLoading &&
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
            isAddressLoading && styles.bottomContainerButtonDisabled
          ]}
          onPress={() => onPickLocationResultCallback(pickedLocation, locationType)}
          disabled={isAddressLoading}
        >
          <Text style={[
            styles.bottomContainerButtonText,
            isAddressLoading && styles.bottomContainerButtonTextDisabled
            ]}>{t('confirm_location')}</Text>
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

export default PickLocationScreen;

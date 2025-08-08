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
import { height} from '../utils/Utils';
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

const PickLocationScreen = ({onPickLocationResultCallback,locationType=null,defaultLocation=null,title=null}) => {
  const {goBack} = useStackScreenStore();
  const { setOnMapCenterChanged,setMapMarkers,setOnMapRotationChanged,setMapLocation} = useMapStore();
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const {currentLocationName,location} = useLocationStore();
  const {setIsMapButtonVisible} = useMapStyleStore();
  const {pickedLocation,setPickedLocation} = usePropsStore();
  const [mapMoving,setMapMoving] = useState(false)
  const { t } = useTranslation();
  const fetchAddressName = useCallback(async (lat, lng) => {
    const coordinates = [lat, lng];
  
    try {
      const search = new SearchAPI();
      const response = await search.reverseGeocode(coordinates);
      if (response) {
        return (
          response.properties.street ||
          response.properties.name ||
          "Unnamed Location"
        );
      }
    } catch (e) {
      console.error("Failed to fetch address", e);
      return "";
    }
    
  }, []);

  // Debounced map center change handler to prevent excessive API calls
  const debouncedMapCenterChange = useDebouncedAPICall(async (data) => {
    setIsAddressLoading(true);
    const address = await fetchAddressName(data.longitude, data.latitude, true);
    let item = {
      latitude: data.longitude,
      longitude: data.latitude,
      address: address,
      type:locationType,
      locationFrom:"MAP"
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

    console.log("defaultLocation",defaultLocation)
    setOnMapCenterChanged(onmapCenterChanged);
    setOnMapRotationChanged(onMapRotationChangedCallback);
    if (defaultLocation){
      setPickedLocation({
        latitude:defaultLocation.location[1],
        longitude:defaultLocation.location[0],
        address:defaultLocation.address,
        type:locationType,
        locationFrom:"MAP"
      });

      console.log("defaultLocation",defaultLocation)
      
        setMapLocation({
          lat: defaultLocation.location[1],
          lng: defaultLocation.location[0],
          zoom: 25,
        });
      
    }else{
    setPickedLocation({
      latitude:location[1], 
      longitude: location[0],
      address: currentLocationName, 
      type:locationType,
      locationFrom:"MAP"
    });
    setIsMapButtonVisible(false);
    setMapMarkers([]);   
    
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
        title={title ? title : t('locate_on_map')}
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
        <Text style={styles.bottomContainerText}> {t('pick_location')}</Text>
        <View style={styles.AddressContainer}>
          {/* <View style={styles.AddressContainerIcon}>
                    <Icon name="location-on" size={30} color="#ffd11a"/>
                  </View> */}
          <View style={styles.AddressContainerMain}>
              <Text style={styles.AddressContainerTextTitle}>📍 {t('address')}</Text>
            {!isAddressLoading && pickedLocation?.address ? (
              <Text style={styles.AddressContainerTextAddress}>{pickedLocation.address}</Text>
            ) : (
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
            )}
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
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
    elevation: 10,
    zIndex: 1000,
  },
  bottomContainerText: {
    fontSize: 18,
    color: '#212121',
    
    padding: 10,
    fontFamily: Fonts.medium,
  },
  AddressContainer: {
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.grey,
  
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
    color: colors.black,
    textWrap: 'wrap',
    lineHeight: 20,
    fontFamily: Fonts.regular,
  
  },    

  bottomContainerButton: {
    
    paddingVertical: 15,
    paddingHorizontal: 20,
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
   top: -height * 0.04,
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

import {Text, TouchableOpacity, View, StyleSheet, ScrollView} from 'react-native';
import React, {useCallback, useState,useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from '../../../components/NavBar';
import {useStackScreenStore} from '../../../store/useStackScreenStore';
import useMapStore from '../../../features/map/store/useMapStore';
import {addLocation} from '../../../styles/AddLocationStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';


import Schdule from '../../../assets/image/svgIcons/schdule.svg';

import AnimatedBottomSheetWrapper from '../../shared/component/AnimatedBottomSheetWrapper';
import useRideSelectionStore from '../../../store/useRideSelectionStore';

import TripType from '../components/planride/TripType';
import ScheduleContainer from '../../../screens/SearchLocation/ScheduleContainer';
import { rideType } from '../../../constants/JsonData';
import { utils } from '../../../utils/Utils';
import { colors } from '../../../constants/constants';
import Contactsheet from '../components/planride/Contactsheet';
import useUserInfoStore from '../../../store/useUserInfoStore';
import RideLocationSetBox from '../components/planride/RideLocationSetBox';
import FavPlacesItem from '../components/planride/FavPlacesItem';
import HistoryContainer from '../../shared/component/HistoryCard';
import PickLocationButton from '../../shared/component/PickLocationButton';
import useRideBookingLocationStore from '../store/useRideBookingLocationStore';
import LocationTypes from '../types/LocationTypes.json';
import { useDebouncedAPICall } from '../../../hooks/useDebounce';
import useRideBookingInfo from '../store/useRideBookingInfo';
import { width } from '../../../utils/Utils';
import { Fonts } from '../../../constants/constants';
import { storeLocation } from '../../../storage/userLocalStorage';    

const PlanRideScreen = ({selectedDestination,showScheduleTime}) => {
  const { t } = useTranslation();
  const {userdetails,homelocation,worklocation,setHomelocation,setWorklocation,userFavPlaces} = useUserInfoStore();
  const {goBack,setStackScreen} = useStackScreenStore();
  const {setRideStartLocation,setRideEndLocation,addRideWayPoint,resetRideBookingLocation,rideStartLocation,rideEndLocation} = useRideBookingLocationStore()
  const {
    setOnSearchResults,
    setMapMarkers,
    setDirectionPoints,
    setSearchUnit,
   
  } = useMapStore();

  const {selectedRide, setSelectedRide, scheduleDateTime, setScheduleDateTime, tripFor} =
    useRideSelectionStore();
  const {setPassangerDetails,setRideBookMode,rideBookMode,passangerDetails} = useRideBookingInfo()

  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showTripFor, setShowTripFor] = useState(false);
  const [showScheduleContainer, setShowScheduleContainer] = useState(false);
  const [selectedFavPlace, setSelectedFavPlace] = useState(null);
  const isContinueButtonVisible = rideStartLocation && rideEndLocation

  // Handle selectedDestination from SavedPlacesScreen
  useEffect(() => {
    if (selectedDestination) {
      setRideEndLocation(selectedDestination);
    }
  }, [selectedDestination]);

  const _toggleSubview = useCallback(() => {
    setShowBottomSheet(!showBottomSheet);
  }, [showBottomSheet]);

  const onBackPress = async () => {
    resetRideBookingLocation()
    setScheduleDateTime(null)
    goBack();
  };

  const handlePlaceSave = useCallback((location,locationType) => {
   
    if(locationType === "Home"){
      location.type = LocationTypes.HOME_LOCATION
      setHomelocation(location)
    }else{
      location.type = LocationTypes.WORK_LOCATION
      setWorklocation(location)
    }
    storeLocation(locationType,location)
    goBack()
    
   
  }, []);

  const handleFavouriteLocationPress = useCallback((location) => {
    if(location.locationData){
      setSelectedFavPlace(location)
      setRideEndLocation(location.locationData)
    }
    
  }, []);

  useEffect(() => {
    if (userdetails){
      if(!rideBookMode){
        setRideBookMode('MYSELF')
        setPassangerDetails({name:userdetails.name,phone:userdetails.phone})
      }
    }
    console.log(showScheduleTime,"wdjdkdbkwdbk")
    if(showScheduleTime){
      setShowScheduleContainer(true)
    }
  }, []);


  

  
  
  

  
  const onRideTypePress = () => {
    
    _toggleSubview();
  };



  const onRideSelect = item => {
    setSelectedRide(item);
    if (item.name === 'Schedule') {
      setShowScheduleContainer(true)
    } else {
      _toggleSubview();
      setScheduleDateTime(null);
    }
  };

  const oncloseDateTime = () => {
    setShowScheduleContainer(false)
    if (scheduleDateTime) return 
    setSelectedRide(rideType[0])
  }

  const onConfirmDateTime = () => {
    setShowScheduleContainer(false)
    _toggleSubview();
  }

  const onTripForPress = () => {
    setShowTripFor(true)
  }

  const onAddWaypoint = () => {
    setStackScreen('WaypointScreen');
  }


  const HandsetRideLocation = (item,type)=>{
    if (type === LocationTypes.START_LOCATION){
      setRideStartLocation(item)
    }else if (type === LocationTypes.DESTINATION_LOCATION){
      setRideEndLocation(item)
    }else if (type === LocationTypes.WAYPOINT_LOCATION){
      addRideWayPoint(item)
    }
  }

  // Debounced search callback to prevent excessive API calls
  const debouncedSearchCallback = useDebouncedAPICall((item, type) => {
    HandsetRideLocation(item, type);
    goBack();
    if(type !== LocationTypes.START_LOCATION){
      setStackScreen('BookRideScreen',{})
    }
  }, 300);

  const onSearchClickResultCallback = (item,type) =>{
    debouncedSearchCallback(item,type)
   

    
  }

  const onSearchClick = (type) =>{
    setStackScreen("SearchScreen",{
      onSearchClick:onSearchClickResultCallback,
      searchType:type
    })
  }

  const handleLocationClick=(type)=>{
    

    onSearchClick(type)
  }

  // Debounced pick location callback
  const debouncedPickLocationCallback = useDebouncedAPICall((item, type) => {
    console.log(item,type,"fromPickup")
    HandsetRideLocation(item,type)
    console.log("type",type)
    goBack()
    if(type !== LocationTypes.START_LOCATION){
      setStackScreen('BookRideScreen',{})
    }
  }, 300);

  const onPickLocationResultCallback = (item,type) =>{
    debouncedPickLocationCallback(item,type)
    
  }

  const handlePickLocation = () =>{
    console.log("pick location")
    setStackScreen('PickLocationScreen',{
      onPickLocationResultCallback:onPickLocationResultCallback,
      locationType:LocationTypes.DESTINATION_LOCATION
    })
  }

  // Debounced history location callback
  const debouncedHistoryCallback = useDebouncedAPICall((item) => {
    HandsetRideLocation(item,LocationTypes.DESTINATION_LOCATION)
  }, 300);

  const handleHistoryLocationClick=(item)=>{
    debouncedHistoryCallback(item)
    setStackScreen('BookRideScreen',{})

  }


console.log(scheduleDateTime,"ebdkjdjk")

const scheduleDate = scheduleDateTime?.date ? utils.formatDate(scheduleDateTime?.date) : ""
const scheduleTime = scheduleDateTime?.time ? utils.timestampTo12HourFormat(scheduleDateTime?.time) : ""

  return (
    <>
      


      <View style={styles.PlanRideScreen}>
        <NavBar withBg onBackPress={onBackPress} title={t('plan_your_trip')} />


        <View style={addLocation.rideSelectionContainer}>
          <TouchableOpacity
            style={[addLocation.rideSelection,scheduleDate&&{flex:2}]}
            onPress={() => onRideTypePress()}>
            <Schdule />
            <Text style={addLocation.rideSelectionTxt}>{t(selectedRide.translationKey)}{' '}{scheduleDate ? scheduleDate + " - " + scheduleTime.toUpperCase() : scheduleTime.toUpperCase()}
            </Text>
            {!scheduleDate && <Ionicons name={"chevron-down"} size={14} color={"white"} />}
          </TouchableOpacity>

          <TouchableOpacity style={[addLocation.rideSelection,scheduleDate && {flex:1/4}]} onPress={() => onTripForPress()}>
            <Ionicons name="person" size={18} color={colors.white} />
           {!scheduleDate && <Text style={addLocation.rideSelectionTxt}>{rideBookMode === 'MYSELF' ? t('myself') : passangerDetails?.name || t('others')}</Text>}
            <Ionicons name="chevron-down" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
        <RideLocationSetBox 
      
        onAddWaypoint={onAddWaypoint}
        onLocationClick={handleLocationClick}
        
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.favPlacesContainer}
          style={styles.favPlacesScrollView}
        >  
          {userFavPlaces?.map((item,index)=>(
            <FavPlacesItem key={index} data={item} onPress={() => {
              handleFavouriteLocationPress(item)
            }}  selected={selectedFavPlace?.label === item.label} />
          ))}
          <FavPlacesItem data={{label:t('add_favorite_places')}} onPress={() => {
            setStackScreen("SavedPlacesScreen",{})
          }} type="add" />
        </ScrollView>
        <View style={styles.dottedLine}/>
        <HistoryContainer selectCallback={handleHistoryLocationClick} bottomborder = {false} fromSearchScreen={true}/>

        <View style={styles.pickLocationContainer}> 
          <PickLocationButton
          onPress={handlePickLocation}
       
          />
         {
          isContinueButtonVisible && (
            <TouchableOpacity style={styles.continueButton} onPress={()=>setStackScreen("BookRideScreen",{})}>
              <Text style={styles.continueButtonText}>{t('continue')}</Text>
            </TouchableOpacity>
          )
         }
        </View>
       

        {showBottomSheet  && (
          <AnimatedBottomSheetWrapper onClose={_toggleSubview}>
            <TripType

              onTripSelect={onRideSelect}
              selectedRide={selectedRide}
            />
          </AnimatedBottomSheetWrapper>
        )}

        {showScheduleContainer &&
          <AnimatedBottomSheetWrapper onClose={oncloseDateTime}>
            <ScheduleContainer oncloseDateTime={oncloseDateTime} onConfirmDateTime={onConfirmDateTime} />
          </AnimatedBottomSheetWrapper>
        }
        {showTripFor &&
          <AnimatedBottomSheetWrapper onClose={() => setShowTripFor(false)}>
            <Contactsheet onClose={() => setShowTripFor(false)} onConfirm={() => setShowTripFor(false)} />
          </AnimatedBottomSheetWrapper>
        }
      </View>
      
    </>
  );
};

const styles = StyleSheet.create({
  PlanRideScreen: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
   
  },
  favPlacesContainer: {
    flexDirection: 'row',
    paddingVertical:10,
    gap:10,
    paddingHorizontal:5
    
  },
  favPlacesScrollView: {
    flexGrow: 0,
  },
  dottedLine:{
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    borderColor: '#bdbdbd',
    marginVertical: 5,
    marginHorizontal: 10,
  },
  pickLocationContainer: {
    position:"absolute",
    bottom:0,
    width:"100%",
    alignSelf:'center',
    paddingHorizontal: 5,
   
  },
  continueButton:{
    backgroundColor:"#000",
    width:"100%",
    padding:15,
    borderRadius:10,
    alignItems:'center',
    justifyContent:'center',
    marginVertical:10,
  },
  continueButtonText:{
    color:"#fff",
    fontSize:16,
    fontFamily:Fonts.medium,
  },
});

export default PlanRideScreen;

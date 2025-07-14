import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import React, {useCallback, useState,useEffect} from 'react';
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

const PlanRideScreen = () => {
  const {userdetails,homelocation,worklocation,setHomelocation,setWorklocation} = useUserInfoStore();
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
  const isContinueButtonVisible = rideStartLocation && rideEndLocation
  const _toggleSubview = useCallback(() => {
    setShowBottomSheet(!showBottomSheet);
  }, [showBottomSheet]);

  const onBackPress = async () => {
    resetRideBookingLocation()
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

  const handleFavouriteLocationPress = useCallback((locationType) => {
    if(locationType === "Home"){
      
      if(homelocation){
        setRideEndLocation(homelocation)
        setStackScreen("BookRideScreen",{})
      }else{

        setStackScreen('SearchScreen',{
          onSearchClick: handlePlaceSave,
          searchType:locationType
        });

      }
      
    }else if(locationType === "Work"){
      if(worklocation){
        setRideEndLocation(worklocation)
        setStackScreen("BookRideScreen",{})
      }else{

        setStackScreen('SearchScreen',{
          onSearchClick: handlePlaceSave,
          searchType:locationType
        });

      }
    }
    
  }, []);

  useEffect(() => {
    if (userdetails){
      setRideBookMode('MYSELF')
      setPassangerDetails({name:userdetails.name,phone:userdetails.phone})
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
    setStackScreen('BookRideScreen',{})
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
    goBack()
    setStackScreen('BookRideScreen',{})
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


const scheduleDate = scheduleDateTime?.date ? utils.formatDate(scheduleDateTime?.date) : ""
const scheduleTime = scheduleDateTime?.time ? utils.timestampTo12HourFormat(scheduleDateTime?.time) : ""

  return (
    <>
      


      <View style={styles.PlanRideScreen}>
        <NavBar withBg onBackPress={onBackPress} title={'Plan your trip'} />


        <View style={addLocation.rideSelectionContainer}>
          <TouchableOpacity
            style={addLocation.rideSelection}
            onPress={() => onRideTypePress()}>
            <Schdule />
            <Text style={addLocation.rideSelectionTxt}>{selectedRide.name}{' '}{scheduleDate ? scheduleDate + "-" + scheduleTime : scheduleTime}
            </Text>
            {!scheduleDate && <Ionicons name={"chevron-down"} size={14} color={"white"} />}
          </TouchableOpacity>

          <TouchableOpacity style={addLocation.rideSelection} onPress={() => onTripForPress()}>
            <Ionicons name="person" size={18} color={colors.white} />
            <Text style={addLocation.rideSelectionTxt}>{rideBookMode === 'MYSELF' ? 'Myself' : passangerDetails?.name || 'Others'}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
        <RideLocationSetBox 
      
        onAddWaypoint={onAddWaypoint}
        onLocationClick={handleLocationClick}
        
        />
        <View style={styles.favPlacesContainer}>  
          <FavPlacesItem type="home" isDataExist={homelocation?true:false} onPress={() => {
            handleFavouriteLocationPress("Home")
          }} />
          <FavPlacesItem type="work" isDataExist={worklocation?true:false} onPress={() => {
            handleFavouriteLocationPress("Work")
          }} />
        </View>
        <View style={styles.dottedLine}/>
        <HistoryContainer selectCallback={handleHistoryLocationClick} bottomborder = {false} fromSearchScreen={true}/>

        <View style={styles.pickLocationContainer}> 
          <PickLocationButton
          onPress={handlePickLocation}
       
          />
         {
          isContinueButtonVisible && (
            <TouchableOpacity style={styles.continueButton} onPress={()=>setStackScreen("BookRideScreen",{})}>
              <Text style={styles.continueButtonText}>Continue</Text>
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

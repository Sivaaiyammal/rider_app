import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import React, {useCallback, useState,useEffect} from 'react';
import NavBar from '../../../components/NavBar';
import {useStackScreenStore} from '../../../store/useStackScreenStore';
import AddLocationCard from '../../../screens/SearchLocation/AddLocationCard';
import useLocationStore from '../../../store/useLocationStore';
import useMapStore from '../../../features/map/store/useMapStore';
import locationTask from '../../../controllers/GetCurrentLocation';
import {addLocation} from '../../../styles/AddLocationStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';


import Schdule from '../../../assets/image/svgIcons/schdule.svg';

import AnimatedBottomSheetWrapper from '../../shared/component/AnimatedBottomSheetWrapper';
import useRideSelectionStore from '../../../store/useRideSelectionStore';

import TripType from '../components/planride/TripType';
import ScheduleContainer from '../../../screens/SearchLocation/ScheduleContainer';
import { rideType } from '../../../constants/JsonData';
import { utils } from '../../../utils/Utils';
import useMapStyleStore from '../../../store/useMapStyleStore';
import { colors } from '../../../constants/constants';
import Contactsheet from '../../../components/Contactsheet';
import useUserInfoStore from '../../../store/useUserInfoStore';
import RideLocationSetBox from '../components/planride/RideLocationSetBox';
import FavPlacesItem from '../components/planride/FavPlacesItem';
import HistoryContainer from '../../shared/component/HistoryCard';
import PickLocationButton from '../../shared/component/PickLocationButton';

const PlanRideScreen = () => {
  const {userdetails} = useUserInfoStore();
  const {goBack,setStackScreen} = useStackScreenStore();
 
  const {
    setOnSearchResults,
    setMapMarkers,
    setDirectionPoints,
    setSearchUnit,
   
  } = useMapStore();

  const {selectedRide, setSelectedRide, scheduleDateTime, setScheduleDateTime,vehicleList, setVehicleList, tripFor, setSelectedContact,setRideDistance,setRideDuration,rideDistance} =
    useRideSelectionStore();

  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showTripFor, setShowTripFor] = useState(false);
  const [showScheduleContainer, setShowScheduleContainer] = useState(false);

  const _toggleSubview = useCallback(() => {
    setShowBottomSheet(!showBottomSheet);
  }, [showBottomSheet]);

  const onBackPress = async () => {
   
    goBack();
   
   
    
  };

  useEffect(() => {
    
    setSelectedContact({name:userdetails.name,phone:userdetails.phone})
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

  const onSearchClickResultCallback = (item) =>{
    goBack()
    console.log(item)
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

  const onPickLocationResultCallback = (item) =>{
    goBack()
    
  }

  const handlePickLocation = () =>{
    console.log("pick location")
    setStackScreen('PickLocationScreen',{
      onPickLocationResultCallback:onPickLocationResultCallback
    })
  }

  const handleHistoryLocationClick=()=>{

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
            <Text style={addLocation.rideSelectionTxt}>{tripFor}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
        <RideLocationSetBox 
      
        onAddWaypoint={onAddWaypoint}
        onLocationClick={handleLocationClick}
        
        />
        <View style={styles.favPlacesContainer}>  
          <FavPlacesItem type="home" onPress={() => {}} />
          <FavPlacesItem type="work" onPress={() => {}} />
        </View>
        <View style={styles.dottedLine}/>
        <HistoryContainer selectCallback={handleHistoryLocationClick}/>

        <View style={styles.pickLocationContainer}> 
          <PickLocationButton
          onPress={handlePickLocation}
       
          />
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
});

export default PlanRideScreen;

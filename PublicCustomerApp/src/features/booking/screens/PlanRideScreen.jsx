import {Text, TouchableOpacity, View, StyleSheet, ScrollView, ActivityIndicator, BackHandler} from 'react-native';
import React, {useCallback, useState,useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from '../../../components/NavBar';
import {useStackScreenStore} from '../../../store/useStackScreenStore';
import {addLocation} from '../../../styles/AddLocationStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';


import Schdule from '../../../assets/image/svgIcons/schdule.svg';
import DashedLine from '../../../components/Common/DashedLine';

import AnimatedBottomSheetWrapper from '../../shared/component/AnimatedBottomSheetWrapper';
import useRideSelectionStore from '../../../store/useRideSelectionStore';

import TripType from '../components/planride/TripType';
import ScheduleContainer from '../../../screens/SearchLocation/ScheduleContainer';
import { rideType } from '../../../constants/JsonData';
import { height, utils } from '../../../utils/Utils';
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
import { Fonts } from '../../../constants/constants';
import AdaptiveText from '../../../components/Common/AdaptiveText';

const PlanRideScreen = ({selectedDestination,showScheduleTime}) => {
  const { t } = useTranslation();
  const {userdetails,userFavPlaces} = useUserInfoStore();
  const {goBack,setStackScreen} = useStackScreenStore();
  const {setRideStartLocation,setRideEndLocation,addRideWayPoint,resetRideBookingLocation,rideStartLocation,rideEndLocation} = useRideBookingLocationStore()

  const {selectedRide, setSelectedRide, scheduleDateTime, setScheduleDateTime} =
    useRideSelectionStore();
  const {setPassangerDetails,setRideBookMode,rideBookMode,passangerDetails} = useRideBookingInfo()

  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showTripFor, setShowTripFor] = useState(false);
  const [showScheduleContainer, setShowScheduleContainer] = useState(false);
  const [selectedFavPlace, setSelectedFavPlace] = useState(null);
  const isContinueButtonVisible = rideStartLocation && rideEndLocation
  const [isContinuing, setIsContinuing] = useState(false);

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
    console.log("onBackPress")
    resetRideBookingLocation()
    setScheduleDateTime(null)
    goBack();
  };

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
    
    if(showScheduleTime){
      setShowScheduleContainer(true)
    }
  }, []);

  useEffect(() => {
    return () => {
      setIsContinuing(false);
    };
  }, []);

  useEffect(() => {
    const handleHardwareBackPress = () => {
      onBackPress();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleHardwareBackPress);
    return () => {
      subscription.remove();
    };
  }, [onBackPress]);


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
    setStackScreen('WaypointScreen',{fromPlanScreen:true});
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
    console.log("onSearchClickResultCallback",item,type);
    debouncedSearchCallback(item,type)
   

    
  }

  const onSearchClick = (type) =>{
    setStackScreen("SearchScreen",{
      onSearchClick:onSearchClickResultCallback,
      searchType:type,
      label:type === LocationTypes.DESTINATION_LOCATION ? t('locate_drop_location') : type === LocationTypes.WAYPOINT_LOCATION ? t('locate_stop') : t('locate_pickup_location')
    })
  }

  const handleLocationClick=(type)=>{
    

    onSearchClick(type)
  }

  // Debounced pick location callback
  const debouncedPickLocationCallback = (item, type) => {
    goBack()
    HandsetRideLocation(item,type)
    if(type !== LocationTypes.START_LOCATION){
      setStackScreen('BookRideScreen',{})
    }
  };

  const onPickLocationResultCallback = (item,type) =>{
    debouncedPickLocationCallback(item,type)
    
  }

  const handlePickLocation = () =>{
    
    setStackScreen('PickLocationScreen',{
      onPickLocationResultCallback:onPickLocationResultCallback,
      locationType:LocationTypes.DESTINATION_LOCATION,
      label:t('locate_drop_location'),
      isFromRidePointsSelection:true
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
        <DashedLine style={styles.dottedLine} />
        <ScrollView style={{ flex: 1}} contentContainerStyle={{paddingBottom: height*0.2}}>
        <HistoryContainer selectCallback={handleHistoryLocationClick} bottomborder = {false} fromSearchScreen={true}/>
        </ScrollView>

        <View style={styles.pickLocationContainer}> 
          <PickLocationButton
          onPress={handlePickLocation}
       
          />
         {
          isContinueButtonVisible && (
            <TouchableOpacity style={[styles.continueButton, isContinuing && styles.continueButtonDisabled]} onPress={()=>{ setIsContinuing(true); setStackScreen("BookRideScreen",{}); }} disabled={isContinuing}>
              {isContinuing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AdaptiveText style={[styles.continueButtonText, isContinuing && styles.continueButtonTextDisabled]} color={colors.white}>{t('continue')}</AdaptiveText>
              )}
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

PlanRideScreen.propTypes = {
  selectedDestination: PropTypes.object,
  showScheduleTime: PropTypes.bool,
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
    marginVertical: 5,
    marginHorizontal: 10,
  },
  pickLocationContainer: {
    position:"absolute",
    bottom:0,
    width:"100%",
    alignSelf:'center',
    paddingHorizontal: 5,
    backgroundColor:'white'
   
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
  continueButtonDisabled:{
    backgroundColor:'#757575',
    opacity:0.6,
  },
  continueButtonTextDisabled:{
    color:'#BDBDBD',
  },
});

export default PlanRideScreen;

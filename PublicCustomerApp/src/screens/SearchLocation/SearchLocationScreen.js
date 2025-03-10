import {Animated, Text, TouchableOpacity, View, BackHandler} from 'react-native';
import React, {useCallback, useRef, useState,useEffect} from 'react';
import NavBar from '../../components/NavBar';
import {useStackScreenStore} from '../../store/useStackScreenStore';
import AddLocationCard from './AddLocationCard';
import useLocationStore from '../../store/useLocationStore';
import useMapStore from '../../store/useMapStore';
import locationTask from '../../controllers/GetCurrentLocation';
import {addLocation} from '../../styles/AddLocationStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Schdule from '../../assets/image/svgIcons/schdule.svg';
import Onway from '../../assets/image/svgIcons/onway.svg';

import useRideSelectionStore from '../../store/useRideSelectionStore';
import TripType from './TripType';
import RideType from './RideType';
import ScheduleContainer from './ScheduleContainer';
import { rideType } from '../../constants/JsonData';
import { utils } from '../../utils/Utils';
import { rideEstimation } from '../../API/APICalls/RideAPICalls';
import FullScreenLoader from '../../components/Loaders/FullScreenLoader';
import VehicleListScreen from '../VehicleListScreen';
import useMapStyleStore from '../../store/useMapStyleStore';
import { colors } from '../../constants/constants';
import Contactsheet from '../../components/Contactsheet';
const SearchLocation = () => {
  const {goBack,setStackScreen} = useStackScreenStore();
  const {setDirections, directions, setSelectedInput} = useLocationStore();
  const {setMapStyle,resetMapStyle} = useMapStyleStore();
  const {
    setOnSearchResults,
    setMapMarkers,
    setDirectionPoints,
    setSearchUnit,
    directionPoints,
  } = useMapStore();

  const {setSelectedTrip, selectedTrip, selectedRide, setSelectedRide, scheduleDateTime, setScheduleDateTime,vehicleList, setVehicleList, tripFor, setTripFor, contactDetails, setContactDetails} =
    useRideSelectionStore();

  const [isHidden, setIsHidden] = useState(false);
  const [showTripFor, setShowTripFor] = useState(false);
  const [selectedContent, setSelectedContent] = useState('');
  const [showScheduleContainer, setShowScheduleContainer] = useState(false);

  const bounceValue = useRef(new Animated.Value(1200)).current;

  const _toggleSubview = useCallback(() => {
    let toValue = 0;
    if (isHidden) {
      toValue = 1200;
    }
    Animated.spring(bounceValue, {
      toValue: toValue,
      velocity: 12,
      tension: 8,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setIsHidden(!isHidden);
  }, [isHidden]);

  const onBackPress = async () => {
    console.log("onBackPress")
    if (vehicleList.length !== 0) return setVehicleList([])
    setDirections([
      {id: 1, name: 'Start', location: [], locationName: ''},
      {id: 2, name: 'End', location: [], locationName: ''},
    ]);
    setOnSearchResults(null);
    setMapMarkers([]);
    goBack();
    setDirectionPoints(null);
    setSearchUnit('');
    setSelectedInput(null);
    await locationTask.getCurrentLocation();
    resetMapStyle();
  };

  useEffect(() => {
    setMapStyle({
      width: "100%",
      height: "70%",
      bottom: 0,
    });
  }, []);

  const onEstimationSuccess = (data) => {
    if (!data?.data) return;
    setVehicleList(data.data);
    if (data.data.length !== 0) {
      setStackScreen('VehicleList');
    }
  };

  const {mutate: estimationMutate, isLoading: isEstimationLoading} =
    rideEstimation(onEstimationSuccess);

  const onConfirm = () => {
    let start_location = directions.filter(item => item.name == 'Start')[0]
    let end_location = directions.filter(item => item.name == 'End')[0]
    let waypoints = directions.filter(item => item.name == 'Waypoint')
    let trip_type = selectedTrip.value
    let ride_type = selectedRide.value

    let payload = {
      startLocation: [start_location.location[0],start_location.location[1]],
      endLocation: [ end_location.location[0],end_location.location[1]],

      // waypoints: waypoints.map(item => { return { lat: item.location[0], lon: item.location[1] } }),
      // trip_type: trip_type,
    }
    estimationMutate(payload)
  };

  const onRideTypePress = () => {
    setSelectedContent('RideType');
    _toggleSubview();
  };

  const onTripTypePress = () => {
    setSelectedContent('TripType');
    _toggleSubview();
  };

  const onTripSelect = item => {
    setSelectedTrip(item);
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
    console.log("onTripForPress")
  }

const scheduleDate = scheduleDateTime?.date ? utils.formatDate(scheduleDateTime?.date) : ""
const scheduleTime = scheduleDateTime?.time ? utils.timestampTo12HourFormat(scheduleDateTime?.time) : ""

  return (
    <>
      {isEstimationLoading && <FullScreenLoader />}
      <NavBar withBg onBackPress={onBackPress} leftTitle={'Plan your trip'} />
      
      <TouchableOpacity style={addLocation.forMeContainer}  onPress={() => onTripForPress()}>
        <Text style={addLocation.forMeText}>{tripFor}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.black} />
      </TouchableOpacity>
  
      <View style={addLocation.rideSelectionContainer}>
        <TouchableOpacity
          style={addLocation.rideSelection}
          onPress={() => onRideTypePress()}>
          <Schdule />
          <Text style={addLocation.rideSelectionTxt}>{selectedRide.name}{' '}{scheduleDate ? scheduleDate + "-" + scheduleTime : scheduleTime}
          </Text>
          {!scheduleDate && <Ionicons name={"chevron-down"} size={14} color={"white"} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={addLocation.rideSelection}
          onPress={() => onTripTypePress()}>
          <Onway />
          <Text style={addLocation.rideSelectionTxt}>{selectedTrip.name}</Text>
          <Ionicons name={"chevron-down"} size={14} color={"white"} />
        </TouchableOpacity>
      </View>
      <AddLocationCard screenType={'searchLocation'} />
      {directionPoints && (
        <TouchableOpacity
          style={addLocation.confirmBtn}
          onPress={() => onConfirm()}>
          <View style={addLocation.confirmBtnTxtContainer}>
            <Text style={addLocation.confirmBtnTxt}>CONFIRM  DESTINATION </Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </View>
        </TouchableOpacity>
      )}
      <Animated.View
        onPress={() => console.log('pressed')}
        style={[
          addLocation.rideOptionContainer,
          { transform: [{ translateY: bounceValue }] },
        ]}>
        {selectedContent === 'TripType' && (
          <TripType
            _toggleSubview={_toggleSubview}
            onTripSelect={onTripSelect}
            selectedTrip={selectedTrip}
          />
        )}
        {selectedContent === 'RideType' && (
          <RideType
            _toggleSubview={_toggleSubview}
            onTripSelect={onRideSelect}
            selectedRide={selectedRide}
          />
        )}
      </Animated.View>
      {showScheduleContainer &&
        <ScheduleContainer oncloseDateTime={oncloseDateTime} onConfirmDateTime={onConfirmDateTime} />
      }
      {showTripFor &&
       
       <Contactsheet onClose={() => setShowTripFor(false)} onConfirm={() => setShowTripFor(false)} />
      }
      {/* {vehicleList.length !== 0 && 
        <VehicleListScreen vehicleListData={vehicleList}/>
      } */}
    </>
  );
};

export default SearchLocation;

import {Animated, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';
import NavBar from '../../components/NavBar';
import {useStackScreenStore} from '../../store/useStackScreenStore';
import AddLocationCard from './AddLocationCard';
import useLocationStore from '../../store/useLocationStore';
import useMapStore from '../../store/useMapStore';
import locationTask from '../../controllers/GetCurrentLocation';
import {addLocation} from '../../styles/AddLocationStyles';

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

const SearchLocation = () => {
  const {goBack} = useStackScreenStore();
  const {setDirections, directions, setSelectedInput} = useLocationStore();
  const {
    setOnSearchResults,
    setMapMarkers,
    setDirectionPoints,
    setSearchUnit,
    directionPoints,
  } = useMapStore();

  const {setSelectedTrip, selectedTrip, selectedRide, setSelectedRide, scheduleDateTime, setScheduleDateTime,vehicleList, setVehicleList} =
    useRideSelectionStore();

  const [isHidden, setIsHidden] = useState(false);
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
  };

  const onEstimationSuccess = (data) => {
    setVehicleList(data?.data)
  }

  const {mutate: estimationMutate, isLoading: isEstimationLoading} =
    rideEstimation(onEstimationSuccess);

  const onConfirm = () => {
    let start_location = directions.filter(item => item.name == 'Start')[0]
    let end_location = directions.filter(item => item.name == 'End')[0]
    let waypoints = directions.filter(item => item.name == 'Waypoint')
    let trip_type = selectedTrip.value
    let ride_type = selectedRide.value

    let payload = {
      startLocation: {
        lat: start_location.location[0],
        lon: start_location.location[1],
      },
      endLocation: {
        lat: end_location.location[0],
        lon: end_location.location[1],
      },

      waypoints: waypoints.map(item => { return { lat: item.location[0], lon: item.location[1] } }),
      trip_type: trip_type,
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

const scheduleDate = scheduleDateTime?.date ? utils.formatDate(scheduleDateTime?.date) : ""
const scheduleTime = scheduleDateTime?.time ? utils.timestampTo12HourFormat(scheduleDateTime?.time) : ""

  return (
    <>
      {isEstimationLoading && <FullScreenLoader />}
      <NavBar withBg onBackPress={onBackPress} title={'Destination'} />
      <View style={addLocation.rideSelectionContainer}>
        <TouchableOpacity
          style={addLocation.rideSelection}
          onPress={() => onRideTypePress()}>
          <Schdule />
          <Text style={addLocation.rideSelectionTxt}>{selectedRide.name}{'  '}{scheduleDate + "-" + scheduleTime}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={addLocation.rideSelection}
          onPress={() => onTripTypePress()}>
          <Onway />
          <Text style={addLocation.rideSelectionTxt}>{selectedTrip.name}</Text>
        </TouchableOpacity>
      </View>
      <AddLocationCard screenType={'searchLocation'} />
      {directionPoints && (
        <TouchableOpacity
          style={addLocation.confirmBtn}
          onPress={() => onConfirm()}>
          <Text style={addLocation.confirmBtnTxt}>CONFIRM DESTINATION</Text>
        </TouchableOpacity>
      )}
      <Animated.View
        onPress={() => console.log('pressed')}
        style={[
          addLocation.rideOptionContainer,
          {transform: [{translateY: bounceValue}]},
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
        <ScheduleContainer oncloseDateTime={oncloseDateTime} onConfirmDateTime={onConfirmDateTime}/>
      }
      {vehicleList.length !== 0 && 
        <VehicleListScreen vehicleListData={vehicleList}/>
      }
    </>
  );
};

export default SearchLocation;

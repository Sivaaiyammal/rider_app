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

const SearchLocation = () => {
  const {goBack, setStackScreen} = useStackScreenStore();
  const {setDirections} = useLocationStore();
  const {
    setOnSearchResults,
    setMapMarkers,
    setDirectionPoints,
    setSearchUnit,
    directionPoints,
  } = useMapStore();

  const {setSelectedTrip, selectedTrip, selectedRide, setSelectedRide} =
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
    setDirections([
      {id: 1, name: 'Start', location: [], locationName: ''},
      {id: 2, name: 'End', location: [], locationName: ''},
    ]);
    setOnSearchResults(null);
    setMapMarkers([]);
    goBack();
    setDirectionPoints(null);
    setSearchUnit('');
    await locationTask.getCurrentLocation();
  };

  const onConfirm = () => {
    setStackScreen('VehicleList');
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
    }
  };

  return (
    <>
      <NavBar withBg onBackPress={onBackPress} title={'Destination'} />
      <View style={addLocation.rideSelectionContainer}>
        <TouchableOpacity
          style={addLocation.rideSelection}
          onPress={() => onRideTypePress()}>
          <Schdule />
          <Text style={addLocation.rideSelectionTxt}>{selectedRide.name}</Text>
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
        <ScheduleContainer />
      }
    </>
  );
};

export default SearchLocation;

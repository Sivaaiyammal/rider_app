import React, {useRef, useState, useCallback} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import {_} from 'lodash';

import Ionicons from 'react-native-vector-icons/Ionicons';
import YourLoc from '../../assets/image/svgIcons/yourLoc.svg';
import EndLoc from '../../assets/image/svgIcons/endLoc.svg';
import {addLocation} from '../../styles/AddLocationStyles';
import DragAndDropCard from '../../components/DragAndDropCard';
import {colors} from '../../constants/constants';
import useLocationStore from '../../store/useLocationStore';
import useMapStore from '../../store/useMapStore';
import Marker from '../../controllers/NEMap/Marker';
import {useStackScreenStore} from '../../store/useStackScreenStore';

const AddLocationCard = props => {
  const {screenType} = props;
  const {directions, setDirections} = useLocationStore();
  const {setStackScreen} = useStackScreenStore();
  const {
    setSearchUnit,
    mapMarkers,
    onSearchResults,
    setOnSearchResults,
    setMapMarkers,
    setDirectionPoints,
    searchUnit,
  } = useMapStore();
  const [selectedInputIndex, setSelectedInputIndex] = useState(0);

  const inputRefs = useRef([]);
  const itemHeight = 80;

  const onFocus = useCallback(id => {
    setSelectedInputIndex(id);
    if (screenType === 'vehicleList') {
      setStackScreen('SearchLocationScreen');
    }
  }, []);

  const debouncedSetSearchUnit = useCallback(
    _.debounce(
      value => {
        setSearchUnit(value);
      },
      2000,
      {
        leading: true,
        trailing: true,
      },
    ),
    [],
  );

  const _onChangeText = useCallback((value, index) => {
    const newDirections = [...directions];
    newDirections[index].locationName = value;
    setDirections(newDirections);
    setDirectionPoints(null);
    debouncedSetSearchUnit(value);
  }, []);

  const setRouteDirection = directions => {
    if (directions.length === 2) {
      // Sort directions by their id to ensure start and end points
      const sortedDirections = directions.sort((a, b) => a.id - b.id);
      const routeData = sortedDirections.map(direction => ({
        lat: direction.lat,
        lon: direction.lng,
      }));
      setMapMarkers([]);
      setDirectionPoints({locations: routeData, type: 'car'});
    } else {
      setDirectionPoints(null);
    }
  };

  const updateDirections = useCallback(directions => {
    const directionPoints = directions.map(direction => ({
      lat: direction.location[1],
      lon: direction.location[0],
    }));
    setDirectionPoints({locations: directionPoints, type: 'car'});
  }, []);

  const addMapMarkers = (item, markerType) => {
    const marker = new Marker(
      String(selectedInputIndex),
      item?.name || Math.random().toString(),
      item?.longitude,
      item?.latitude,
      markerType,
      36,
      true,
    );
    const updatedMarkers = [...mapMarkers];
    const existingIndex = updatedMarkers.findIndex(m => m.type === markerType);
    if (existingIndex !== -1) {
      updatedMarkers[existingIndex] = marker;
    } else {
      updatedMarkers.push(marker);
    }
    marker.setFocus(true);
    setMapMarkers(updatedMarkers);
    setRouteDirection(updatedMarkers);
  };

  const removeMapMarker = markerType => {
    const updatedMarkers = mapMarkers.filter(
      marker => marker.type !== markerType,
    );
    setMapMarkers(updatedMarkers);
    setDirectionPoints(null);
  };

  //   on location name Press
  const onLocationNamePress = useCallback(
    item => {
      const newDirections = [...directions];
      newDirections[selectedInputIndex].locationName =
        item.address || item.name;
      newDirections[selectedInputIndex].location = [
        item.longitude,
        item.latitude,
      ];
      setDirections(newDirections);
      setOnSearchResults(null);
      setSearchUnit('');
      if (selectedInputIndex === 0) {
        addMapMarkers(item, 'marker_start');
      } else if (selectedInputIndex === directions.length - 1) {
        addMapMarkers(item, 'marker_end');
      } else {
        addMapMarkers(item, `marker_waypoint ${selectedInputIndex}`);
      }
    },
    [directions, selectedInputIndex, setDirections, setOnSearchResults],
  );

  // clear text and remove marker
  const clearText = index => {
    const newDirections = [...directions];
    newDirections[index].locationName = '';
    newDirections[index].location = [];
    setSearchUnit('');
    setDirections(newDirections);
    setOnSearchResults(null);
    if (index === 0) {
      removeMapMarker('marker_start');
    } else if (index === directions.length - 1) {
      removeMapMarker('marker_end');
    } else {
      removeMapMarker(`marker_waypoint ${index}`);
    }
  };

  const getLocationIcon = useCallback((id, totalLocations) => {
    if (id === 0) {
      return {
        icon: <YourLoc />,
        name: 'Start Location',
      };
    } else if (id === totalLocations - 1) {
      return {
        icon: <EndLoc width={15} height={15} />,
        name: 'End Location',
      };
    } else {
      return {
        icon: <YourLoc width={15} height={15} />,
        name: `Waypoint`,
      };
    }
  }, []);

  const moveItem = (fromIndex, toIndex) => {
    if (fromIndex !== toIndex) {
      const newDirections = [...directions];

      // Swap only the locationName and location arrays
      const fromItem = newDirections[fromIndex];
      const toItem = newDirections[toIndex];

      const tempLocationName = fromItem.locationName;
      const tempLocation = fromItem.location;

      fromItem.locationName = toItem.locationName;
      fromItem.location = toItem.location;

      toItem.locationName = tempLocationName;
      toItem.location = tempLocation;
      setDirections(newDirections);
      updateDirections(newDirections);
    }
  };

  return (
    <View style={{backgroundColor: colors.white, paddingVertical: 5}}>
      <View style={addLocation.addLocationContainer}>
        {directions.map((direction, index) => (
          <DragAndDropCard
            key={direction.id}
            index={index}
            length={directions.length}
            itemHeight={itemHeight}
            topOffset={0}
            onDragEnd={(dragIndex, hoverIndex, isMoved) => {
              console.log(
                `Dragged from ${dragIndex} to ${hoverIndex} - Moved: ${isMoved}`,
              );
              if (isMoved) return moveItem(dragIndex, hoverIndex);
              if (inputRefs.current[hoverIndex])
                inputRefs.current[hoverIndex].focus();
            }}>
            <Text style={addLocation.inputHeader}>
              {getLocationIcon(index, directions.length).name}
            </Text>
            <View style={addLocation.draggableCard}>
              {getLocationIcon(index, directions.length).icon}
              <TextInput
                ref={el => (inputRefs.current[index] = el)}
                style={addLocation.draggableInput}
                // placeholder={getLocationIcon(index, directions.length).name}
                value={direction.locationName}
                onFocus={() => onFocus(index)}
                onChangeText={value => _onChangeText(value, index)}
              />
              <TouchableOpacity onPress={() => clearText(index)}>
                <Ionicons name={'close'} size={20} />
              </TouchableOpacity>
            </View>
          </DragAndDropCard>
        ))}
        {onSearchResults &&
          Array.isArray(onSearchResults?.searchResults) &&
          onSearchResults?.searchResults?.length !== 0 &&
          searchUnit.length !== 0 && (
            <View style={{height: 200, marginTop: 10}}>
              <ScrollView>
                {onSearchResults?.searchResults?.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => onLocationNamePress(item)}>
                    <Text style={addLocation.searchResults}>
                      {item.address || item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
      </View>
    </View>
  );
};

export default AddLocationCard;

AddLocationCard.propTypes = {
  screenType: PropTypes.string,
};

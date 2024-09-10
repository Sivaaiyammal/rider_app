import React, { useRef, useState, useCallback } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import YourLoc from '../../assets/image/svgIcons/yourLoc.svg';
import EndLoc from '../../assets/image/svgIcons/endLoc.svg';
import { addLocation } from '../../styles/AddLocationStyles';
import DragAndDropCard from '../../components/DragAndDropCard';
import { colors } from '../../constants/constants';
import useLocationStore from '../../store/useLocationStore';
import useMapStore from '../../store/useMapStore';
import Marker from '../../controllers/NEMap/Marker';


const AddLocationCard = () => {
  const { directions, setDirections } = useLocationStore();
  const {
    setSearchUnit,
    mapMarkers,
    onSearchResults,
    setOnSearchResults,
    setMapMarkers,
  } = useMapStore();
  const [selectedInputIndex, setSelectedInputIndex] = useState(0);

  const inputRefs = useRef([]);
  const itemHeight = 80;

  const onFocus = useCallback(id => {
    setSelectedInputIndex(id);
  }, []);

  const onChangeText = useCallback((value, index) => {
    const newDirections = [...directions];
    newDirections[index].locationName = value;
    setDirections(newDirections);
    setSearchUnit(value);
  }, []);

  //   const setRouteDirection = () => {
  //     const directionPoints = directions
  //       .filter(direction => direction.location.length > 0)
  //       .map(direction => ({
  //         lat: direction.location[1],
  //         lon: direction.location[0],
  //       }));
  //     setMapMarkers([]);
  //     console.log('directionPoints-route', directionPoints, directions);
  //     setDirectionPoints({locations: directionPoints, type: 'car'});
  //   };

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
    marker.setFocus(true);
    const updatedMarkers = [...mapMarkers];
    const existingIndex = updatedMarkers.findIndex(m => m.type === markerType);
    if (existingIndex !== -1) {
      updatedMarkers[existingIndex] = marker;
    } else {
      updatedMarkers.push(marker);
    }
    setMapMarkers(updatedMarkers);
  };

  const removeMapMarker = markerType => {
    const updatedMarkers = mapMarkers.filter(
      marker => marker.type !== markerType,
    );
    setMapMarkers(updatedMarkers);
  };


  //   on location name Press
  const onLocationNamePress = useCallback(
    item => {
      const newDirections = [...directions];
      newDirections[selectedInputIndex].locationName =
        item.address || item.name;
      newDirections[selectedInputIndex].location = [
        item.latitude,
        item.longitude,
      ];
      setDirections(newDirections);
      setOnSearchResults(null);
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

  return (
    <View style={{ backgroundColor: colors.white, paddingVertical: 5 }}>
      <View style={addLocation.addLocationContainer}>
        {directions.map((direction, index) => (
          <DragAndDropCard
            key={direction.id}
            index={index}
            length={directions.length}
            itemHeight={itemHeight}
            topOffset={0}
            onDragEnd={(dragIndex, hoverIndex, isMoved) => {
              console.log(`Dragged from ${dragIndex} to ${hoverIndex}`);
              if (isMoved && inputRefs.current[hoverIndex]) {
                inputRefs.current[hoverIndex].focus();
              }
            }}>
            <Text style={addLocation.inputHeader}>{getLocationIcon(index, directions.length).name}</Text>
            <View style={addLocation.draggableCard}>
              {getLocationIcon(index, directions.length).icon}
              <TextInput
                ref={el => (inputRefs.current[index] = el)}
                style={addLocation.draggableInput}
                // placeholder={getLocationIcon(index, directions.length).name}
                value={direction.locationName}
                onFocus={() => onFocus(index)}
                onChangeText={value => onChangeText(value, index)}
              />
              <TouchableOpacity onPress={() => clearText(index)}>
                <Ionicons name={'close'} size={20} />
              </TouchableOpacity>
            </View>
          </DragAndDropCard>
        ))}
        {onSearchResults && (
          <View style={{ height: 190 }}>
            <ScrollView>
              {onSearchResults?.searchResults?.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => onLocationNamePress(item)}>
                  <Text>{item.address || item.name}</Text>
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

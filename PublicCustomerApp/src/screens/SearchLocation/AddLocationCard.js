import React, {useRef, useState, useCallback, useEffect} from 'react';
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

const AddLocationCard = () => {
  const {directions, setDirections, setSelectedInput} = useLocationStore();
  const {setStackScreen} = useStackScreenStore();
  const {
    setSearchUnit,
    mapMarkers,
    setMapMarkers,
    setDirectionPoints,
    mapClickCallback
  } = useMapStore();

  const inputRefs = useRef([]);
  const itemHeight = 80;

  const onFocus = useCallback(id => {
    setStackScreen('SearchScreen');
    setSelectedInput(id);
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

  const updateDirections = useCallback((directions) => {
    const directionPoints = directions.map(direction => {
      if (direction.location.length > 0) {
        return {
          lat: direction.location[1],
          lon: direction.location[0],
        };
      } else {
        return null;
      }
    }).filter(point => point !== null);
    if (directionPoints.length > 0) {
      setDirectionPoints({ locations: directionPoints, type: 'car' });
    } else {
      console.log('No valid direction points found. Not updating state.');
    }
  }, []);

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

  const addWaypoints = () => {
    const endIndex = directions.findIndex(item => item.name === "End");
    // Create a new waypoint object with the current End ID
    const newWaypoint = {
      id: directions[endIndex].id,
      location: [],
      locationName: "",
      name: `Waypoint ${directions.length - 1}`
    };
    directions[endIndex].id += 1;
    const newData = [
      ...directions.slice(0, endIndex),
      newWaypoint,
      directions[endIndex]
    ];
    setDirections(newData)
  }

  const updateRouteDirections = useCallback(
    (newData) => {
      const routeData = newData.map(item => {
        return {
          lat: item.location[1],
          lon: item.location[0],
        };
      });
      setDirectionPoints({locations: routeData, type: 'car'});
    },
    [directions],
  );

  const removeWaypoints = (id) => {
    const filteredData = directions.filter(item => item.id !== id);
    // Rearrange id after deletion
    const newData = filteredData.map((item, index) => ({
      ...item,
      id: index + 1,
      name: item.name.startsWith("Waypoint") ? `Waypoint ${index}` : item.name
    }));
    setDirections(newData)
    updateRouteDirections(newData)
  }

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
              if (!isMoved && inputRefs.current[hoverIndex])
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
                value={direction.locationName}
                onFocus={() => onFocus(index)}
                onChangeText={value => _onChangeText(value, index)}
                selection={{start:0}}
              />
              {getLocationIcon(index, directions.length).name === 'Waypoint' && 
                <TouchableOpacity onPress={() => removeWaypoints(direction.id)}>
                <Ionicons name={'close'} size={20} />
              </TouchableOpacity>
              }
            </View>
          </DragAndDropCard>
        ))}
        <TouchableOpacity style={{marginTop:10,
        }} onPress={()=>addWaypoints()}>
          <Text>Add Waypoints</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddLocationCard;

AddLocationCard.propTypes = {
  screenType: PropTypes.string,
};

import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, BackHandler, TouchableOpacity } from "react-native";
import { IconButton } from "react-native-paper";
import Icon from 'react-native-vector-icons/FontAwesome5';

import useMapStore from "../../../Store/useMapStore";
import { useStackScreenStore } from "../../../Store/useStackScreen";

import DragAndDropCard from "../../../Components/DragDrop";
import DraggbleImg from "../../../Assets/Icons/Drag.svg";
import InputContainer from "../../../Components/InputContainer";
import { SearchAPI } from "../../../Constants/NEMap/Search";
import SearchResult from '../../../Components/SearchResult';

const MultiStopStartEndLocation = ({ route }) => {
  const [screen, setScreen] = useState('Direction');
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedInputIndex, setSelectedInputIndex] = useState(0);
  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [directions, setDirections] = useState([
    { id: 1, name: 'Start', location: route?.coordinates || [], locationName: route?.name || '' },
    { id: 2, name: 'Waypoint', location: [], locationName: '' },
    { id: 3, name: 'End', location: [], locationName: '' }
  ]);
  const { setStackScreen } = useStackScreenStore();
  const { directionPoints, setDirectionPoints, setMapMarkers,setStartNavigation } = useMapStore();
  const inputRefs = useRef([]);
  const search = new SearchAPI();

  useEffect(() => {

    BackHandler.addEventListener('hardwareBackPress', () => {
      setScreen('Direction');
      setStackScreen('Home');
      return true;
    });

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', () => { });
    };
  }, []);

  const Header = () => (
    <View style={styles.header}>
      <IconButton
        icon="arrow-left"
        size={20}
        color="#212121"
        onPress={() => setStackScreen('Home')}
      />
      <Text>Directions</Text>
      <View />
    </View>
  );

  const moveItem = (dragIndex, hoverIndex) => {
    const newDirections = [...directions];
    const [removed] = newDirections.splice(dragIndex, 1);
    newDirections.splice(hoverIndex, 0, removed);
    setDirections(newDirections);
  };

  const handleSearchTextChange = (value) => {
    setSearchText(value);
    reverseGeocode(value);
  };

  const reverseGeocode = async (value) => {
    const response = await search.search(value);
    const formattedData = response.features.map(feature => ({
      catId: feature.properties.osm_id,
      title: feature.properties.type,
      data: [{
        id: feature.properties.osm_id,
        name: feature.properties.name,
        address: `${feature.properties.street}, ${feature.properties.city}, ${feature.properties.state} ${feature.properties.postcode}`,
        duration: `${(feature.score * 10).toFixed(0)}m away`,
        coordinates: feature.geometry.coordinates,
      }]
    }));

    setSearchData(formattedData);
    setLoading(false);
  }

  const selectedCallBack = (item) => {
    const newDirections = [...directions];
    newDirections[selectedInputIndex].location = item.coordinates;
    newDirections[selectedInputIndex].locationName = item.name;
    setDirections(newDirections);
    setSearchText('');
    setScreen('Direction');
    setMapMarkers([])
    setUpDirectionPoints();
  }

  const setUpDirectionPoints = () => {
    console.log(route, "route")
    const directionPoints = directions.map(direction => {
      if (direction.location.length > 0) {
        return {
          lat: direction.location[1],
          lon: direction.location[0],
        }
      }
    });
    setDirectionPoints(directionPoints);
    if (directionPoints.length > 0) {
      setScreen('Navigation');
    }
  }

  return (
    <>
      {screen === 'Direction' &&
        <View style={styles.container}>
          <Header />
          {directions.map((direction, index) => (
            <DragAndDropCard
              key={direction.id}
              index={index}
              onDragEnd={(dragIndex, hoverIndex, isMoved) => {
                moveItem(dragIndex, hoverIndex);
                if (isMoved && inputRefs.current[hoverIndex]) {
                  inputRefs.current[hoverIndex].focus();
                }
              }}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Icon name={index === 0 ? "map-marker-alt" : "map-marker-alt"} size={20} color="#212121" />
                </View>
                <TextInput
                  ref={el => inputRefs.current[index] = el}
                  style={styles.input}
                  placeholder={`${direction.name} location`}
                  value={direction.locationName}
                  onFocus={() => {
                    setScreen('Search');
                    setSelectedInputIndex(index);
                  }}
                  onChangeText={(value) => {
                    const newDirections = [...directions];
                    newDirections[index].locationName = value;
                    setDirections(newDirections);
                  }}
                />
                <DraggbleImg style={styles.dragIcon} />
              </View>
            </DragAndDropCard>
          ))}
          <View style={styles.tabContainer}>
            {
              ['bus', 'car', 'running'].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.tabItem, index === selectedTab ? styles.selectedTab : null]}
                  onPress={() => setSelectedTab(index)}
                >
                  <Icon name={item} size={20} color="#212121" />
                </TouchableOpacity>
              ))
            }
          </View>
        </View>
      }
      {screen === 'Search' &&
        <View style={[styles.container, { height: '100%' }]}>
          <InputContainer
            onChange={handleSearchTextChange}
            autoFocus={true}
            loading={loading}
            placeholder="Search for a location"
            value={searchText}
            onCancelPress={() => setScreen('Direction')}
          />
          {searchText.length > 0 && (
            <SearchResult
              searchTxt={searchText}
              search_data={searchData}
              selectedCallBack={selectedCallBack}
            />
          )}
        </View>
      }
      {screen === 'Navigation' &&
        <View style={styles.navigationContainer}>
          <View style={styles.selectLocationContainer}>
            <Text style={styles.navigationText}>Start Navigation</Text>
            <IconButton
              icon="navigation"
              size={30}
              iconColor="#fff"
              style={styles.navigationIcon}
              onPress={() => {
                console.log('Start Navigation');
                setStartNavigation(true);
              }}
            />
          </View>
        </View>
      }
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 275,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#fafafa',
  },
  cardContent: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  iconContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  input: {
    height: 40,
    flex: 1,
    paddingLeft: 10,
  },
  dragIcon: {
    position: 'absolute',
    right: 10,
    width: '50%',
    height: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    paddingHorizontal: 20,
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#212121',
  },
  tabItem: {
    paddingHorizontal: 10,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  selectLocationContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navigationText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  navigationIcon: {
    backgroundColor: '#3087eb',
    position: 'absolute',
    right: 10,
    top: -20,
    color: '#fff',
  },
});

export default MultiStopStartEndLocation;
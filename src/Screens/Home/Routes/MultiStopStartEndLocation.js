import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  BackHandler,
  TouchableOpacity,
} from "react-native";
import { IconButton } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import YourLoc from "../../../Assets/Icons/yourloc.svg";
import Flag from "../../../Assets/Icons/flag.svg";
import EndLoc from "../../../Assets/Icons/endLoc.svg";
import Icon from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import useMapStore from "../../../Store/useMapStore";
import { useStackScreenStore } from "../../../Store/useStackScreen";
import useLocationStore from "../../../Store/useLocationStore";

import DragAndDropCard from "../../../Components/DragDrop";
import DraggbleImg from "../../../Assets/Icons/Drag.svg";
import InputContainer from "../../../Components/InputContainer";
import { SearchAPI } from "../../../Constants/NEMap/Search";
import SearchResult from "../../../Components/SearchResult";
import { addLocation } from "../../../Styles/AnimatedTextinputStyles";
import { Colors } from "../../../Constants/Contants";
import Routes from "../../../Assets/Icons/routes.svg";
import SetRouteScreen from "../../SetRouteScreen";
import StartNavigation from "../../StartNavigation";
import LocationOptions from '../../../Components/Locations/LocationOptions.jsx'

const MultiStopStartEndLocation = ({ route }) => {
  const [screen, setScreen] = useState("Direction");
  const [searchText, setSearchText] = useState("");
  const [selectedTab, setSelectedTab] = useState("car");
  const [selectedInputIndex, setSelectedInputIndex] = useState(0);
  const [searchData, setSearchData] = useState([]);
  const [isFocused, setIsFocused] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false)
  const {onSearchResults, setSearchUnit} = useMapStore();
  const { location } = useLocationStore();
  const [directions, setDirections] = useState([
    {
      id: 1,
      name: "Start",
      location: location || [],
      locationName: location ? location.reverse().join(', ') : "",
    },
    { id: 2, name: "Waypoint", location: [], locationName: "" },
    { id: 3, name: "End", 
      location: route?.coordinates || [],
      locationName: route?.name || "",
    },
  ]);

  const { setStackScreen, goBack } = useStackScreenStore();
  const {
    directionPoints,
    setDirectionPoints,
    setMapMarkers,
    setStartNavigation,
  } = useMapStore();
  const inputRefs = useRef([]);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => {
      onBackPress();
      return true;
    });

    const directionPoints = directions
      .filter(direction => direction.location.length > 0)
      .map(direction => ({
        lat: direction.location[1],
        lon: direction.location[0]
      }));

    if(directionPoints.length == 2){
      setMapMarkers([])
      setDirectionPoints({ locations: directionPoints, type: selectedTab });
      setShowOptions(true)
    }

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", () => {});
    };
  }, []);

  const onBackPress = () => {
    goBack();
    setDirections([
      {
        id: 1,
        name: "Start",
        location: [],
        locationName: "",
      },
      { id: 2, name: "Waypoint", location: [], locationName: "" },
      { id: 3, name: "End", location: [], locationName: "" },
    ]);
    setDirectionPoints(null);
  };

  const itemHeight = 100;

  const moveItem = (fromIndex, toIndex) => {
    if (fromIndex !== toIndex) {
      const newDirections = [...directions];
      const [movedItem] = newDirections.splice(fromIndex, 1);
      newDirections.splice(toIndex, 0, movedItem);
      setDirections(newDirections);
    }
  };

  const handleSearchTextChange = (value) => {
    setSearchText(value);
    setSearchUnit(value);
  };

  const selectedCallBack = (item) => {
    const newDirections = [...directions];
    newDirections[selectedInputIndex].location = item.coordinates;
    newDirections[selectedInputIndex].locationName = item.name;
    setDirections(newDirections);
    setSearchText("");
    setScreen("Direction");
    setMapMarkers([]);
    setUpDirectionPoints();
  };

  const setUpDirectionPoints = () => {
    const directionPoints = directions.map((direction) => {
      if (direction.location.length > 0) {
        return {
          lat: direction.location[1],
          lon: direction.location[0],
        };
      }
    });
    setDirectionPoints({ locations: directionPoints, type: selectedTab });
    if (
      directionPoints.length > 0 &&
      directionPoints[0] &&
      directionPoints[directionPoints.length - 1]
    ) {
      setDirectionPoints({ locations: directionPoints, type: selectedTab });
      setShowOptions(true);
    } else {
      console.warn("Start and End locations are required.");
    }
  };

  const onStartNavigationPress = async () => {
    setScreen("Navigation");
    setStartNavigation(true);
  };

  const onRoutesPress = () => {
    setScreen("Routes");
  };

  const getLocationIcon = (id) => {
    switch (id) {
      case 0:
        return {
          icon: <YourLoc />,
          name: "Your Location",
        };
      case 1:
        return {
          icon: <Flag width={15} height={15} />,
          name: "Add Waypoint",
        };
      case 2:
        return {
          icon: <EndLoc width={15} height={15} />,
          name: "Destination",
        };
    }
  };

  return (
    <>
      {screen === "Direction" && (
        <View style={addLocation.container}>
          <TouchableOpacity
            onPress={() => onBackPress()}
            style={addLocation.backButton}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.black} />
          </TouchableOpacity>
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
                  moveItem(dragIndex, hoverIndex);
                  if (isMoved && inputRefs.current[hoverIndex]) {
                    inputRefs.current[hoverIndex].focus();
                  }
                }}
              >
                <View style={addLocation.draggableCard}>
                  {getLocationIcon(index).icon}
                  <TextInput
                    ref={(el) => (inputRefs.current[index] = el)}
                    style={addLocation.draggableInput}
                    placeholder={getLocationIcon(index).name}
                    value={direction.locationName}
                    onFocus={() => {
                      setScreen("Search");
                      setSelectedInputIndex(index);
                      setIsFocused(true);
                    }}
                    onChangeText={(value) => {
                      const newDirections = [...directions];
                      newDirections[index].locationName = value;
                      setDirections(newDirections);
                    }}
                  />
                  <DraggbleImg style={addLocation.dragIcon} />
                </View>
              </DragAndDropCard>
            ))}
          </View>
        </View>
      )}
      {screen === "Search" && (
        <View style={[styles.container, { height: "100%" }]}>
          <InputContainer
            onChange={handleSearchTextChange}
            autoFocus={true}
            loading={loading}
            placeholder="Search for a location"
            value={searchText}
            onCancelPress={() => setScreen("Direction")}
          />
          {searchText.length > 0 && (
            <SearchResult
              searchTxt={searchText}
              search_data={onSearchResults?.searchResults}
              selectedCallBack={selectedCallBack}
            />
          )}
        </View>
      )}
      {screen === "Routes" && (
        <SetRouteScreen
          goBack={() => setScreen("Direction")}
          onStartPress={() => {
            onStartNavigationPress();
          }}
        />
      )}
      {screen === "Navigation" && (
        <StartNavigation
          goBack={() => {
            setStartNavigation(false);
            setScreen("Direction");
          }}
        />
      )}
      {screen !== "Search" && showOptions && (
        <View style={addLocation.bottomContainer}>
          <View style={addLocation.directionType}>
            {[
              { icon: "car", name: "car" },
              { icon: "bicycle", name: "bike" },
              { icon: "train", name: "train" },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tabItem,
                  selectedTab === item.name ? styles.selectedTab : null,
                ]}
                onPress={() => {
                  setSelectedTab(item.name);
                  setDirectionPoints({
                    locations: directionPoints.locations,
                    type: item.name,
                  });
                }}
              >
                <Icon name={item.icon} size={20} color="#212121" />
              </TouchableOpacity>
            ))}
          </View>
          <LocationOptions directions={directions} onRoutesPress={onRoutesPress} onStartNavigationPress={onStartNavigationPress}/>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 275,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#fafafa",
  },
  cardContent: {
    // backgroundColor: '#fafafa',
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
    width: "90%",
    alignSelf: "center",
  },
  iconContainer: {
    borderRadius: 10,
    padding: 10,
    width: "12%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconStartContainer: {
    width: "80%",
    height: 15,
    backgroundColor: "#1b73e8",
    borderRadius: 50,
    shadowColor: "#1b73e8",
    shadowOffset: {
      width: 10,
      height: 20,
    },
    shadowOpacity: 10,
    shadowRadius: 0.5,
    elevation: 5,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
  },
  dragIcon: {
    position: "absolute",
    right: 10,
    width: "50%",
    height: 50,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    paddingHorizontal: 20,
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#212121",
  },
  tabItem: {
    paddingHorizontal: 10,
  },
  navigationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  selectLocationContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navigationText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  navigationIcon: {
    backgroundColor: "#3087eb",
    position: "absolute",
    right: 10,
    top: -20,
    color: "#fff",
  },
});

export default MultiStopStartEndLocation;

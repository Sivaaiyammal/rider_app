import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import PropTypes from 'prop-types';
import Ionicons from 'react-native-vector-icons/Ionicons';

import useMapStore from "../store/useMapStore";
import NEMap from "../components/Native/NEMap";
import Loaders from "../components/Loaders/FullScreenLoader";
import useLocationStore from "../store/useLocationStore";
import useMapStyleStore from "../store/useMapStyleStore";

const MapContainer = ({ mapStyle }) => {
  const {
    mode,
    mapMarkers,
    searchUnit,
    onMapCenterChanged,
    geometries,
    directionPoints,
    setOnSearchResults,
    mapLocation,
    mapDblclickCallback,
    markerClickCallback,
    setMapReady,
    mapReady,
    mapClickCallback,
    startNavigation,
    setDirectionReadyCallback,
    searchPOI,
    setSearchPOIResults,
    setUserLocation,
    setMapMoving,
    setDisduration,
    setSearchPOIError,
    setMapLocation
  } = useMapStore();
  const { defaultStyle } = useMapStyleStore();

  const { location } = useLocationStore();

  const searchStr = { start_location: location ? [location[1], location[0]] : [], search_str: searchUnit }

  const defaultSettings = {
    "distanceFormate": "Kilometers(km)/ Meters(m)",
    "ferry": "Avoid",
    "gpsReliability": "High",
    "highways": "Prefer",
    "language": "en",
    "livingStreet": "Slightly Prefer",
    "mapAppearance": "Small",
    "navAccuracy": "Medium",
    "tolls": "Slightly Prefer"
  }


  return (
    <View style={[styles.mapContainer, defaultStyle]}>
      {!mapReady && <Loaders message="Setting up Map" />}
      <NEMap
        mapStyle={mapStyle || styles.mapStyles}
        homeLocation={mapLocation}
        onMapReady={() => {
          setMapReady(true);
        }}
        onMapMoving={setMapMoving}
        markers={mapMarkers}
        searchUnit={searchStr}
        autoPOISearch={searchPOI}
        settingsProps={defaultSettings}
        onSearchResults={setOnSearchResults}
        onSearchPOIResults={setSearchPOIResults}
        mode={mode}
        onMarkerClick={markerClickCallback}
        onMapCenterChanged={onMapCenterChanged}
        onMapClick={mapClickCallback}
        geometries={geometries}
        findRoute={directionPoints}
        onMapDblclick={mapDblclickCallback}
        navigation={startNavigation}
        onDirectionReady={setDirectionReadyCallback}
        onUserLocationChange={(location) => setUserLocation([location.latitude, location.longitude])}
        distanceListner={setDisduration}
        onSearchPOIError={setSearchPOIError}
        onNavigationEnd={(e) => console.log('hari--->>navigationEnd-->>', e)}
      />
     
    </View>
    
  );
};

MapContainer.propTypes = {
  mapStyle: PropTypes.object,
};

export default MapContainer;

const styles = StyleSheet.create({
  mapContainer: {
    position: "absolute", 
    zIndex: -1,
  },
  mapStyles: {
    width: "100%",
    height: "100%",
   
  },
  gradientContainer: {
    zIndex: 2,
    position: "absolute",
    height: 100,
    width: "100%",
  },
  LinearGradient: {
    flex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex:4000
  }
});

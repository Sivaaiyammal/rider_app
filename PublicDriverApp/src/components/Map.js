import React from "react";
import { View, StyleSheet } from "react-native";
import PropTypes from 'prop-types';
import useMapStore from "../store/useMapStore";
import useLocationStore from "../store/useLocationStore";
import NEMap from "./Native/NEMap";

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
    setSearchPOIError
  } = useMapStore();

  const { location } = useLocationStore();

  const searchStr = { start_location: location ? [location[1], location[0]] : [], search_str: searchUnit }

  console.log("mapReady", searchStr);

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
    <View style={[styles.mapContainer]}>
      {/* {!mapReady && <Loaders message="Setting up Map" />} */}
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
        onNavigationEnd={(e) => {
          console.log("")
        }}
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
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  mapStyles: {
    width: "100%",
    height: "100%",
    zIndex: 99999999,
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
});

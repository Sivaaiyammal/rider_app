import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import useMapStore from "../Store/useMapStore";
import NEMap from "../Components/Native/NEMap";
import Loaders from "../Components/Loaders/FullScreenLoader";

const MapContainer = ({ mapStyle }) => {
  const {
    mode,
    mapMarkers,
    searchUnit,
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
  } = useMapStore();

  console.log("SEARCH POI", searchPOI)

  return (
    <View style={[styles.mapContainer]}>
      {!mapReady && <Loaders message="Setting up Map" />}
      <NEMap
        mapStyle={mapStyle ? mapStyle : styles.mapStyles}
        homeLocation={mapLocation}
        onMapReady={() => {
          setMapReady(true);
        }}
        markers={mapMarkers}
        searchUnit={searchUnit}
        autoPOISearch={searchPOI}
        onSearchResults={setOnSearchResults}
        onSearchPOIResults={setSearchPOIResults}
        mode={mode}
        onMarkerClick={markerClickCallback}
        onMapClick={mapClickCallback}
        geometries={geometries}
        findRoute={directionPoints}
        onMapDblclick={mapDblclickCallback}
        navigation={startNavigation}
        onDirectionReady={setDirectionReadyCallback}
      />
    </View>
  );
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
    zIndex: 1,
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

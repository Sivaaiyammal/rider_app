import React from "react";
import { View, StyleSheet } from "react-native";

import useMapStore from "../store/useMapStore";
import NEMap from "../components/Native/NEMap";
import Loaders from "../components/Loaders/FullScreenLoader";
import useLocationStore from "../store/useLocationStore";

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

  return (
    <View style={[styles.mapContainer]}>
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
        settingsProps={{"language":'en'}}
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

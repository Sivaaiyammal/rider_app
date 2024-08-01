import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import useMapStore from "../../Store/useMapStore";
import NavBar from "../../Components/NavBar";
import { FlatList } from "react-native-gesture-handler";
import Marker from "../../Constants/NEMap/Marker";
import { useStackScreenStore } from "../../Store/useStackScreen";

const POIresultScreen = () => {
  const { setStackScreen } = useStackScreenStore();
  const { searchPOIResults, setMapMarkers, setMapLocation } = useMapStore();

  const onResultSelect = (item) => {
    const marker = new Marker(
      String(new Date().getTime() + Math.random()),
      item.name,
      item.longitude,
      item.latitude,
      "marker_end",
      36,
      true
    );
    marker.setFocus(true);
    setMapMarkers([marker]);
    setMapLocation({
      lat: item.latitude,
      lng: item.longitude,
      maxZoom: 16,
      zoom: 16,
    });
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => onResultSelect(item)}
        style={styles.item}
      >
        <Text style={styles.title}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <NavBar title={"POI Results"} withBg onBackPress={() => setStackScreen("Home")} />
      <View style={styles.horizontalList}>
        <FlatList
          horizontal
          data={searchPOIResults?.searchPOIResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          maxToRenderPerBatch={1}
          pagingEnabled
        />
      </View>
    </>
  );
};

export default POIresultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  horizontalList: {
    position: "absolute",
    bottom: 0,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    height: 100,
  },
  title: {
    fontSize: 32,
  },
});

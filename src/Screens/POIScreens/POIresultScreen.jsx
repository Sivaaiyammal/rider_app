import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useRef, useState } from "react";
import useMapStore from "../../Store/useMapStore";
import NavBar from "../../Components/NavBar";
import { FlatList } from "react-native-gesture-handler";
import Marker from "../../Constants/NEMap/Marker";
import { WIDTH } from "../../Constants";
import { Colors, Fonts } from "../../Constants/Contants";
import {useStackScreenStore} from '../../Store/useStackScreen'

const POIresultScreen = () => {
  const { searchPOIResults, setMapMarkers, setMapLocation } = useMapStore();

  // console.log('hari-->>searchPOIResults-->>', searchPOIResults)

  const {goBack, setStackScreen} = useStackScreenStore();

  const [index, setIndex] = useState(0);
  const indexRef = useRef(index);
  const flatListRef = useRef(null);

  indexRef.current = index;

  const onScroll = useCallback((event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const scroll_index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(scroll_index);

    const distance = Math.abs(roundIndex - scroll_index);

    const isNoMansLand = distance > 0.5;

    if (roundIndex !== indexRef.current && !isNoMansLand) {
      setIndex(roundIndex);
     
      const filteredPOI = searchPOIResults?.searchPOIResults?.find((_, id) => id === roundIndex);
      onResultSelect(filteredPOI)
      console.log('hari-->>index-->>', roundIndex, filteredPOI)
    }
  }, []);

  const onBackPress = () => {
    goBack()
  }

  const onDirectionsPress = (item) => {
    const location = {
      address : item.address, name : item.name, 
      coordinates: [item.longitude, item.latitude], 
    }
    setStackScreen("Directions", location)
  }

  const onResultSelect = (item) => {
    const marker = new Marker(
      String(new Date().getTime() + Math.random()),
      item?.name || Math.random().toString(),
      item?.longitude,
      item?.latitude,
      "marker_start",
      36,
      true
    );
    marker.setFocus(true);
    setMapMarkers([marker]);
    setMapLocation({
      lat: item?.latitude,
      lng: item?.longitude,
      maxZoom: 16,
      zoom: 16,
    });
  };

  const renderItem = useCallback(function renderItem({ item }) {
    return (
          <View style={styles.slide}>
          <Text style={styles.slideTitle}>{item.name}</Text>
          <Text style={styles.slideSubtitle}>{item.address}</Text>
          <TouchableOpacity style={styles.directionBtn} onPress={()=>onDirectionsPress(item)}>
          <Text style={styles.directionBtnTxt}>Directions</Text>
          </TouchableOpacity>
        </View>
    );
  }, []);

  return (
    <>
      <NavBar onBackPress={()=>onBackPress()} title={"POI Results"} withBg />
      <View style={styles.horizontalList}>
        <FlatList
          ref={flatListRef}
          data={searchPOIResults?.searchPOIResults}
          style={styles.carousel}
          renderItem={renderItem}
          pagingEnabled
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={onScroll}
          initialNumToRender={10}
          maxToRenderPerBatch={1}
          removeClippedSubviews={true}
          scrollEventThrottle={16}
          keyExtractor={useCallback((_,id) => String(id), [])}
          getItemLayout={useCallback(
            (_, ind) => ({
              ind,
              length: WIDTH,
              offset: ind * WIDTH,
            }),
            []
          )}
        />
      </View>
    </>
  );
};

export default POIresultScreen;

const styles = StyleSheet.create({
  carousel: { 
    flex: 1, 
  },
  container: {
    flex: 1,
  },
  horizontalList: {
    position: "absolute",
    bottom: 10,
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
  slide: {
    width: WIDTH ,
    alignItems: 'center',
    minHeight:130,
    backgroundColor:Colors.white,
    borderRadius:10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding:5
  },
  slideTitle:{
    fontFamily:Fonts.medium,
    color:Colors.black,
    fontSize:16
  },
  slideSubtitle:{
    fontFamily:Fonts.regular,
    color:Colors.black,
    fontSize:12,
    width:'90%',
    marginTop:10,
  },
  directionBtn:{
    backgroundColor:'red',
    marginBottom:10,
    paddingVertical:5,
    paddingHorizontal:15,
    borderRadius:5,
    backgroundColor:Colors.blue,
    position:'absolute',
    bottom:0
  },
  directionBtnTxt:{
    fontFamily:Fonts.medium,
    color:Colors.white,
   
  }
});

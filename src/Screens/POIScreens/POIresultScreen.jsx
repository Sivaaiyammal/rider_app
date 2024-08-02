import { StyleSheet, Text, TouchableOpacity, View, FlatList, Dimensions } from "react-native";
import React, { useCallback, useRef, useState } from "react";
import useMapStore from "../../Store/useMapStore";
import NavBar from "../../Components/NavBar";
import Marker from "../../Constants/NEMap/Marker";
import { WIDTH } from "../../Constants";
import { Colors, Fonts } from "../../Constants/Contants";
import {useStackScreenStore} from '../../Store/useStackScreen';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const SPACING = 4;
const ITEM_LENGTH = width * 0.9;
const BORDER_RADIUS = 0;

const POIresultScreen = () => {
  const { searchPOIResults, setMapMarkers, setMapLocation } = useMapStore();

  const {goBack, setStackScreen} = useStackScreenStore();

  const {t} = useTranslation()

  const data = searchPOIResults?.searchPOIResults
  ? searchPOIResults?.searchPOIResults
  : [];

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

      const filteredPOI = data?.filter((_, id) => id === roundIndex);
      if (filteredPOI.length !== 0) {
        onResultSelect(filteredPOI[0])
      }
    }
  }, [data]);

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
        <View style={{ width: ITEM_LENGTH, }}>
        <View
          style={[
            styles.itemContent,
          ]}
        >
          <Text style={styles.slideTitle}><Entypo name="location" size={16}/>{' '}{item.name}</Text>
          <Text style={styles.slideSubtitle}>{item.address}</Text>
          <TouchableOpacity style={styles.directionBtn} onPress={()=>onDirectionsPress(item)}>
            <FontAwesome5 name="directions" color={Colors.white} size={16}/>
          <Text style={styles.directionBtnTxt}>{t('direction')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, []);

  return (
    <>
      <NavBar onBackPress={()=>onBackPress()} title={"POI Results"} withBg />
      <View style={styles.horizontalList}>
        <FlatList
          ref={flatListRef}
          data={data}
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
          snapToInterval={ITEM_LENGTH}
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
  itemContent: {
    marginHorizontal: SPACING * 2,
    borderRadius: BORDER_RADIUS + SPACING * 2,
    minHeight:140,
    padding:10,
    backgroundColor:Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    bottom:0,
    flexDirection:'row',
    gap:10,
    alignItems:'center',
    right:10
  },
  directionBtnTxt:{
    fontFamily:Fonts.medium,
    color:Colors.white,

  },
  arrowBtnText: {
    fontSize: 42,
    fontWeight: "600",
  },
  item: {},
  itemText: {
    fontSize: 24,
    position: "absolute",
    bottom: SPACING * 2,
    right: SPACING * 2,
    color: "black",
    fontWeight: "600",
  },
});
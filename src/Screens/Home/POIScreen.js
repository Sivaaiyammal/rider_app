import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5';

import InputContainer from '../../Components/InputContainer';

import EnergyIcon from '../../Assets/Icons/EnergyIcon.svg';
import { IconButton } from "react-native-paper";
import {useStackScreenStore} from "../../Store/useStackScreen";
import useMapStore from '../../Store/useMapStore';
import useLocationStore from '../../Store/useLocationStore';


const POIScreen = ({ setDragHeight, currentScreen }) => {
  const { setStackScreen } = useStackScreenStore();
  const { setSearchPOI } = useMapStore();
  const { location } = useLocationStore();


  const [communityBy, setCommunityBy] = useState([
    {
      name: 'Bus',
      icon: 'bus',
      color: '#00b0ff',
    },
    {
      name: 'Car',
      icon: 'car',
      color: '#31bc92',
    }, {
      name: 'Walk',
      icon: 'running',
      color: '#ed8a19',
    }, {
      name: 'Bike',
      icon: 'bicycle',
      color: '#00b0ff',
    }
  ]);

  const clearText = () => {
    setSearchText('');
  };


  return (
    <View>
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: '#00b0ff' }]}>
          <Icon name="home" size={20} color="#fff" />
          <Text style={styles.title}>Home</Text>
        </View>
        <View style={[styles.header, { backgroundColor: '#31bc92' }]}>
          <Icon name="briefcase" size={20} color="#fff" />
          <Text style={styles.title}>Work</Text>
        </View>
        <View style={[styles.header, { backgroundColor: '#ed8a19' }]}>
          <Icon name="star-half-alt" size={20} color="#fff" />
          <Text style={styles.title}>Saved</Text>
        </View>
      </View>

      {/* <View style={styles.communityByContainer}>
        <View style={styles.communityByContent}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#000" }}>Community by</Text>
          <Icon name="filter" size={15} color="#000" />
        </View>
        <View style={styles.communityByItems}>
          {communityBy.map((item, index) => (
            <TouchableOpacity key={index}
              style={{
                position: 'relative',
              }}
              onPress={() => {
                setCommunityBy(communityBy.map((item, i) => ({
                  ...item,
                  selected: i === index,
                })));
              }}>
              {item.selected &&
                <View style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  zIndex: 100,
                }}>
                  <EnergyIcon width={20} height={20} color="#fff" />
                </View>}
              <View style={[styles.communityByItem, { backgroundColor: item.selected ? '#0090ff' : '#eeeeee', borderColor: item.selected ? '#007cdc' : '#e0e0e0' }]}>
                <Icon name={item.icon} size={20} color={item.selected ? '#fff' : '#9e9e9e'} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View> */}

      <View style={styles.poiContainer}>
        {[
          { name: 'Food', icon: 'food', color: '#FF6B6B', poiID: 2 },
          { name: 'Health', icon: 'hospital-box', color: '#4ECDC4', poiID: 40 },
          { name: 'Shopping', icon: 'shopping', color: '#45B7D1', poiID: 309 },
          { name: 'Leisure', icon: 'bed-clock', color: '#FFA07A', poiID: 183 },
          { name: 'Cash', icon: 'cash-marker', color: '#98D8C8', poiID: 32 },
          { name: 'Public', icon: 'bank', color: '#F7B731', poiID: 14 },
          { name: 'Airport', icon: 'airplane-marker', color: '#6A89CC', poiID: 71 },
          { name: 'More', icon: 'dots-horizontal', color: '#A3CB38' }
        ].map((item, index) => (
          <IconButton 
            key={index}
            icon={item.icon}
            size={20} 
            color="#fff"
            iconColor="#fff"
            onPress={() => {

              if(item.poiID){
                console.log(item.poiID);
                setSearchPOI({
                  poiID: item.poiID,
                  latitude: location[1],
                  longitude: location[0],
                });
              } else {
                setStackScreen('Search');
              } 

            }} 
            style={[styles.poiItem, {
              backgroundColor: item.color,
              borderColor: item.color,
            }]}
          />
        ))}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 10,
    backgroundColor: "red",
    borderRadius: 25,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  communityByContainer: {
    flexDirection: "column",
    padding: 10,
    gap: 10,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },
  communityByItems: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 10,
  },
  communityByItem: {
    padding: 10,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#eeeeee',
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  communityByContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  poiContainer: {
    flexDirection: "row",
    // justifyContent: "",
    alignItems: "center",
    flexWrap: "wrap",
    padding: 10,
    gap: 10,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },
  poiItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default POIScreen;
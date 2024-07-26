import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5';

import InputContainer from '../../Components/InputContainer';

import EnergyIcon from '../../Assets/Icons/EnergyIcon.svg';

const POIScreen = ({ setDragHeight, currentScreen }) => {

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

      <View style={styles.communityByContainer}>
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
});

export default POIScreen;
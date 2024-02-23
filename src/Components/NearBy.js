import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

// styles
import {AddressCards} from '../Styles/ComponentStyles';
import {find_nearby} from '../Constants/DummyData';
import {Icons} from '../Constants/Contants';

const NearBy = () => {
  const getNearBy = id => {
    switch (id) {
      case 1:
        return {
          icon: Icons.petrol_bunk,
        };
      case 2:
        return {
          icon: Icons.resturant,
        };
      case 3:
        return {
          icon: Icons.shopping,
        };
      case 4:
        return {
          icon: Icons.railway_station,
        };
      case 5:
        return {
          icon: Icons.metro_station,
        };
      case 6:
        return {
          icon: Icons.bus_stops,
        };
      case 7:
        return {
          icon: Icons.tourist_attraction,
        };
      case 8:
        return {
          icon: Icons.hotels,
        };
      case 9:
        return {
          icon: Icons.coffee_shop,
        };
    }
  };

  return (
    <View style={AddressCards.cardContainer}>
      <Text style={AddressCards.cardTitle}>Find Nearby</Text>
      {find_nearby.map((item, i) => {
        return (
          <TouchableOpacity key={i} style={AddressCards.contentList}>
            <View style={AddressCards.searchCancelBtn}>
              {getNearBy(item.id)?.icon}
            </View>
            <View style={AddressCards.m5}>
              <Text style={AddressCards.titleTxt}>{item.name}</Text>
              {item.address && <Text>{item.address}</Text>}
            </View>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity>
        <Text style={AddressCards.cardViewAllBtn}>View all</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NearBy;

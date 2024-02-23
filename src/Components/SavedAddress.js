import {Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {saved_address} from '../Constants/DummyData';
import {AddressCards} from '../Styles/ComponentStyles';
import {Icons} from '../Constants/Contants';

const SearchCard = () => {
  const getSavedAddress = _ => {
    switch (_) {
      case 1:
        return {
          icon: Icons.home_add,
          color: '#d7f1fc',
        };
      case 2:
        return {
          icon: Icons.work_add,
          color: '#d7f2eb',
        };
    }
  };

  return (
    <View style={AddressCards.cardContainer}>
      {saved_address.slice(0, 2).map((item, i) => {
        return (
          <TouchableOpacity key={i} style={AddressCards.contentList}>
            <View
              style={[
                AddressCards.searchCancelBtn,
                {backgroundColor: getSavedAddress(item.id).color},
              ]}>
              {getSavedAddress(item.id).icon}
            </View>
            <View style={AddressCards.m5}>
              <Text style={AddressCards.titleTxt}>{item.name}</Text>
              <Text style={AddressCards.addressTxt} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {saved_address.length > 3 && (
        <TouchableOpacity style={AddressCards.contentList}>
          <View style={[AddressCards.searchCancelBtn]}>{Icons.saved_add}</View>
          <View style={AddressCards.m5}>
            <Text style={AddressCards.titleTxt}>Saved Address</Text>
            <Text style={[AddressCards.addressTxt, AddressCards.colorOrange]}>
              {saved_address.length} Places Saved
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchCard;

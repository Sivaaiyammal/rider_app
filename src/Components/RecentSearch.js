import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

// styles
import {AddressCards} from '../Styles/ComponentStyles';
import {recent_search} from '../Constants/DummyData';
import {Icons} from '../Constants/Contants';

const RecentSearch = () => {
  return (
    <View style={AddressCards.cardContainer}>
      <Text style={AddressCards.cardTitle}>Recent Searches</Text>
      {recent_search.slice(0, 4).map((item, i) => {
        return (
          <TouchableOpacity key={i} style={AddressCards.contentList}>
            <View style={AddressCards.searchCancelBtn}>
              {Icons.search_history}
            </View>
            <View style={AddressCards.m5}>
              <Text style={AddressCards.titleTxt}>{item.name}</Text>
              {item.address && (
                <Text numberOfLines={1} style={AddressCards.addressTxt}>
                  {item.address}
                </Text>
              )}
              {item.status && (
                <View style={AddressCards.flexRow}>
                  <Text
                    style={[AddressCards.statusTxt, AddressCards.colorGreen]}>
                    {item.status === 'open' && 'Open Now'}
                  </Text>
                  <Text style={AddressCards.statusTxt}>
                    {' . '}Closes: 10:00 pm
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity>
        <Text style={AddressCards.cardViewAllBtn}>
          View all recent searches
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RecentSearch;

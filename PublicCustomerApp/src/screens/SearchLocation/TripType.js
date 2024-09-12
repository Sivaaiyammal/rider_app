import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {addLocation} from '../../styles/AddLocationStyles';
import {colors} from '../../constants/constants';
import {tripType} from '../../constants/JsonData';

import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const TripType = props => {
  const {_toggleSubview, onTripSelect, selectedTrip} = props;
  
  return (
    <View style={addLocation.rideOptionBottom}>
      <TouchableOpacity
        style={addLocation.closeBtn}
        onPress={() => _toggleSubview()}>
        <AntDesign name="closecircleo" color={colors.black} size={24} />
      </TouchableOpacity>
      {tripType.map(item => {
        return (
          <TouchableOpacity
            style={addLocation.tripSelectionBtn}
            key={item.id}
            onPress={() => onTripSelect(item)}>
            <View style={{flexDirection: 'row', gap: 15, alignItems: 'center'}}>
              {item.icon}
              <Text style={addLocation.tripSelectionBtnTxt}>{item.name}</Text>
            </View>
            <MaterialCommunityIcons
              name={
                selectedTrip.name === item.name
                  ? 'circle-slice-8'
                  : 'circle-outline'
              }
              color={colors.black}
              size={20}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TripType;

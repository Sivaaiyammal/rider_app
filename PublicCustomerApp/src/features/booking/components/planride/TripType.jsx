import {Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {addLocation} from '../../../../styles/AddLocationStyles';
import {colors} from '../../../../constants/constants';
import {rideType} from '../../../../constants/JsonData';

import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const TripType = props => {
  const {_toggleSubview, onTripSelect, selectedRide} = props;
  
  return (
    <View style={addLocation.rideOptionBottom}>
     
      {rideType.map(item => {
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
                selectedRide.name === item.name
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

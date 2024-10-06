import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {colors, Fonts} from '../../constants/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { nabBarAStyles } from '../../styles/NavStyles';

const NavBarA = props => {
  const {title, subtitle, image, onBackPress} = props;
  return (
    <View style={nabBarAStyles.container}>
      <View>
        <View style={nabBarAStyles.titleContainer}>
          {onBackPress && (
            <TouchableOpacity onPress={onBackPress}>
            <Ionicons name="chevron-back" size={20} color={colors.black} />
            </TouchableOpacity>
          )}
          <View style={{marginLeft:8}}>
          <Text style={nabBarAStyles.titleText}>{title}</Text>
          <Text style={nabBarAStyles.subTitleText}>{subtitle}</Text>
          </View>
        </View>
      </View>
      {image}
    </View>
  );
};

export default NavBarA;

import {Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {navStyles} from '../styles/NavStyles';
import {colors} from '../constants/constants';

const NavBar = props => {
  const {
    title,
    rightIcon,
    onBackPress,
    onrightIconPress,
    withBg = false,
    withShadow = false,
  } = props;
  return (
    <View
      style={[
        navStyles.navContainer,
        {
          backgroundColor: withBg ? 'white' : 'transparent',
          elevation: withShadow ? 5 : 0,
        },
      ]}>
      <TouchableOpacity style={navStyles.leftIcon} onPress={onBackPress}>
        {onBackPress && (
          <View style={navStyles.leftBtn}>
            <Ionicons name="chevron-back" size={20} color={colors.black} />
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={navStyles.content}>
        <Text style={navStyles.contentTxt}>{title}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={navStyles.rightIcon} onPress={onrightIconPress}>
        {rightIcon && (
          <View style={navStyles.leftBtn}>
            <Text>{rightIcon}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default NavBar;

import {Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {navStyles} from '../styles/NavStyles';
import {colors} from '../constants/constants';
import LinearGradient from 'react-native-linear-gradient';

const NavBar = props => {
  const {
    title,
    leftTitle,
    rightIcon,
    onBackPress,
    onrightIconPress,
    withBg = false,
    withShadow = false, 
  } = props;
  return (
    <LinearGradient colors={['#FFFFFF', '#FFFFFF', withBg ? '#FFFFFF' : 'rgba(255,255,255,0)']} >
    <View
      style={[
        navStyles.navContainer,
        {
          backgroundColor:  'transparent',
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
      {leftTitle && (
        <TouchableOpacity style={navStyles.leftcontent}>
          <Text style={navStyles.leftcontentTxt}>{leftTitle}</Text>
        </TouchableOpacity>
      )}
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
    </LinearGradient>
  );
};

export default NavBar;

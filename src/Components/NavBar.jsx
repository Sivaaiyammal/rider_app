import {Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons'

import { navStyles } from '../Styles/NavStyles';
import { Colors } from '../Constants/Contants';

const NavBar = props => {
  const {title, rightIcon, onBackPress, onrightIconPress, withBg=false} = props;

  return (
    <View style={[navStyles.navContainer, {backgroundColor: withBg ? 'white' : 'transparent'}]}>
      <TouchableOpacity style={navStyles.leftIcon} onPress={onBackPress}>
        <View style={navStyles.leftBtn}><Ionicons name='arrow-back' size={30} color={Colors.black}/></View>
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

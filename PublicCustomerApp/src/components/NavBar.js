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
   
    <View
      style={[
        navStyles.navContainer,
        {
          backgroundColor:  'transparent',
          elevation: withShadow ? 5 : 0,
        },
      ]}>

     {onBackPress && ( <TouchableOpacity style={navStyles.leftIcon} onPress={onBackPress}>
       
          <View style={navStyles.leftBtn}>
            <Ionicons name="chevron-back" size={25} color={colors.black} />
          </View>
       
        
      </TouchableOpacity>
       )}
      {leftTitle && (
        <View style={navStyles.leftcontent}>
          <Text style={navStyles.leftcontentTxt}>{leftTitle}</Text>
        </View>
      )}
      <View style={navStyles.content}>
        <Text style={navStyles.contentTxt}>{title}</Text>
      </View>
      {rightIcon && (<TouchableOpacity style={navStyles.rightIcon} onPress={onrightIconPress}>
      
          <View style={navStyles.leftBtn}>
            <Text>{rightIcon}</Text>
          </View>
       
      </TouchableOpacity>
       )}
    </View>
  
  );
};

export default NavBar;

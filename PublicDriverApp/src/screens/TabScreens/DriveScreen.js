import {Animated, StyleSheet, Text, TouchableOpacity} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import SideDrawer from '../../components/Drawer/SideDrawer';
import { colors, Fonts } from '../../constants/constants';
import DriveScreenHeader from '../../components/DriveScreenHeader';
import HomeHeader from '../../components/HomeHeader';

const DriveScreen = () => {
  return (
    <>
      <Animated.View
        style={[
          styles.animatedStyles,
          {
            borderRadius: 15,
          },
        ]}>
        <Animated.View>
       <HomeHeader screen={'drive'}/>
        </Animated.View>
      </Animated.View>
    </>
  );
};

export default DriveScreen;

const styles = StyleSheet.create({
  animatedStyles: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  searchcontainer: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    gap: 10,
    marginTop: 20,
    borderWidth: 0.3,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  searchcontainerTxt: {
    fontFamily: Fonts.medium,
    color: colors.black,
  },
});

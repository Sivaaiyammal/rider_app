import {Animated, StyleSheet, Text, TouchableOpacity} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import SideDrawer from '../../components/Drawer/SideDrawer';
import { colors, Fonts } from '../../constants/constants';
import DriveScreenHeader from '../../components/DriveScreenHeader';

const DriveScreen = () => {
  const [showMenu, setShowMenu] = useState(false);

  const scaleValue = useRef(new Animated.Value(1)).current;
  const offsetValue = useRef(new Animated.Value(0)).current;
  const closeButtonOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showMenu) {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(offsetValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(closeButtonOffset, {
          toValue: 0, 
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showMenu, scaleValue, offsetValue, closeButtonOffset]);

  const toggleMenu = () => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: showMenu ? 1 : 0.9, 
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(offsetValue, {
        toValue: showMenu ? 0 : 300, 
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(closeButtonOffset, {
        toValue: showMenu ? 0 : -30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    setShowMenu(!showMenu); 
  };

  return (
    <>
      <Animated.View
        style={[
          styles.animatedStyles,
          {
            borderRadius: 15,
            transform: [{scale: scaleValue}, {translateX: offsetValue}],
          },
        ]}>
        <Animated.View>
       <DriveScreenHeader toggleMenu={toggleMenu} showMenu={showMenu}/>
        </Animated.View>

      </Animated.View>
      {showMenu && <SideDrawer />}
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

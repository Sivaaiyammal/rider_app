import {Animated, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import SideDrawer from '../components/Drawer/SideDrawer';
import ProfileImage from '../assets/image/svgIcons/profileImage.svg';
import {colors, Fonts} from '../constants/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomSheet from '../components/BottomSheet';
import {useStackScreenStore} from '../store/useStackScreenStore';

const MapScreen = () => {
  const [showMenu, setShowMenu] = useState(false);

  const {setStackScreen} = useStackScreenStore();

  const scaleValue = useRef(new Animated.Value(1)).current;
  const offsetValue = useRef(new Animated.Value(0)).current;
  const closeButtonOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showMenu) {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: showMenu ? 0.78 : 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(offsetValue, {
          toValue: showMenu ? 350 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(closeButtonOffset, {
          toValue: showMenu ? -30 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showMenu, scaleValue, offsetValue, closeButtonOffset]);

  const toggleMenu = () => {
    Animated.timing(scaleValue, {
      toValue: showMenu ? 1 : 0.9,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(offsetValue, {
      toValue: showMenu ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(closeButtonOffset, {
      toValue: showMenu ? 0 : -30,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowMenu(!showMenu);
    return !showMenu;
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
          <View style={styles.addressContainer}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <TouchableOpacity onPress={() => toggleMenu()}>
                <Ionicons
                  name={!showMenu ? 'reorder-three-outline' : 'close'}
                  size={35}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <ProfileImage />
              </TouchableOpacity>
            </View>
            <View style={{marginLeft: 10}}>
              <Text style={styles.title}>{'Location'}</Text>
              <Text style={styles.address}>
                {this.props?.address ? this.props.address : <ActivityIndicator />}
              </Text>
            </View>
          </View>
        </Animated.View>
        <BottomSheet minHeight={150}>
          <TouchableOpacity
            style={styles.searchcontainer}
            onPress={() => setStackScreen('SearchLocationScreen')}>
            <Ionicons name={'search'} size={22} />
            <Text style={styles.searchcontainerTxt}>Search Destination</Text>
          </TouchableOpacity>
        </BottomSheet>
      </Animated.View>
      {showMenu && <SideDrawer />}
    </>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  animatedStyles: {
    flexGrow: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 3,
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
  addressContainer: {
    position: 'absolute',
    top: 20,
    zIndex: 100,
    backgroundColor: colors.white,
    flexDirection: 'row',
    padding: 8,
    borderRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    width: '90%',
    alignSelf: 'center',
  },
  addressProfileImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  title: {
    color: '#757575',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  address: {
    color: '#212121',
    fontSize: 12,
    marginTop: 2,
    fontFamily: Fonts.regular,
  },
});

// CustomTabBar.js
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import useCurrentScreenStore from '../../store/useCurrentScreenStore';
import FloatingButton from '../FloatingButton';
import { colors, Fonts } from '../../constants/constants';

export default function CustomTabBar({menus}) {
  const {currentScreen, setCurrentScreen, showBottomTabs} =
    useCurrentScreenStore();

  const onMenuClick = name => {
    setCurrentScreen(name);
  };

  return (
    <>
      {menus.find(menu => menu.name === currentScreen)?.component}
      <FloatingButton />
      {showBottomTabs && (
        <View style={styles.bottomBar}>
          {menus.map(menu => {
            if (menu.name === 'FloatingBtn') {
              return null;
            }
            return (
              <View style={{flex: 1}} key={menu.id}>
                <TouchableOpacity
                  accessibilityLabel={menu.name}
                  style={[styles.menu]}
                  onPress={() => onMenuClick(menu.name)}>
                  {menu.icon}
                  <Text
                    style={[
                      styles.menuName,
                      {
                        color:
                          currentScreen === menu.name ? colors.black : colors.grey_xxdark,
                        textAlign: 'center',
                      },
                    ]}>
                    {menu.name}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  menuName: {
    fontSize: 14,
    fontFamily: Fonts.light,
  },
  menu: {
    padding: 10,
    alignItems: 'center',
    gap: 5,
  },
  bottomBar: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    backgroundColor: colors.white,
    paddingVertical: 3,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
  },
});
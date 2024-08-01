import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  menuName: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium'
  },
  menu: {
    padding: 10,
  },
  container: {
    position: 'absolute',
    width: '100%',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  bottomBar: {
    position: 'absolute',
    width: '100%',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fafafa',
    // paddingVertical: 10,
    // borderTopRightRadius: 15,
    // borderTopLeftRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 10000,
    flex: 1,
    flexDirection: 'row',
  },
  notification: {
    backgroundColor: 'orange',
    // padding: 5,
    borderRadius: 50, // Changed to make it round
    position: 'absolute',
    top: 0,
    right: 20,
    height: 20,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default function CustomTabBar({ menus = [] }) {
  const [tab, setTab] = useState(menus)
  const [showBottomTabs, setShowBottomTabs] = useState(true)
  const [currentScreen, setCurrentScreen] = useState('Home')
  const activeIndex = menus.findIndex(menu => menu.name === currentScreen);

  const onMenuClick = (name, callBack, icon) => {
    // setCurrentScreen(name);
    if(name === 'Home') {
      setCurrentScreen('Home')
    } else if(name === 'Settings') {
      setCurrentScreen('Settings')
    }
    if(callBack) {
      callBack(icon);
      setTab(tab.map(menu => 
        menu.name === name 
          ? {...menu, icon: icon === 'moon' ? 'lightbulb' : 'moon'} 
          : menu
      ))
    }
  };

  return (
    <>
      {tab[activeIndex].component && tab[activeIndex].component}
      <View style={styles.bottomBar}>
        {tab.map(menu => {
          if (menu.hidden) {
            return null;
          }
          return (
            <View style={{ flex: 1 }} key={menu.id}>
              {
                <TouchableOpacity
                  style={[styles.menu, {alignItems: 'center', justifyContent: 'center', gap: 5}]}
                  key={menu.id}
                  testID={menu.name}
                  onPress={() => onMenuClick(menu.name, menu.callBack, menu.icon)}>
                  <Icon
                    name={menu.icon}
                    size={18}
                    color={currentScreen === menu.name ? '#810000' : '#757575'}
                  />
                </TouchableOpacity>
              }
            </View>
          );
        })}
      </View>
    </>
  );
}


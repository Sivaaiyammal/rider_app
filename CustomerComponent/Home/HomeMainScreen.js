import React, { Component } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from './HomeScreen';
import SettingsScreen from '../Settings';

const Tab = createBottomTabNavigator();

function HomeWrapper(props) {
  const isFocused = useIsFocused();
  return isFocused ? <HomeScreen {...props} hideTabBar={() => this.setState({ isTabBarVisible: false })}/> : null;
}

class HomeMainScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTabBarVisible: true,
    };
  }
  
  hideTab =() =>{
    this.setState({ isTabBarVisible: false })
  }

  render() {
    return (
      <Tab.Navigator
        initialRouteName="Home"
        detachInactiveScreens={false} // if true its nor rendering the maps
      >
        <Tab.Screen
          name="Home"
          options={{
            tabBarStyle:{ display: this.state.isTabBarVisible ? 'flex' : 'none' },
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => (
              <Icon
                name={focused ? 'home' : 'home-outline'}
                size={size}
                color={color}
              />
            ),
          }}
          component={HomeWrapper}
        />
        <Tab.Screen
          name="Settings"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => (
              <Icon
                name={focused ? 'settings' : 'settings-outline'}
                size={size}
                color={color}
              />
            ),
          }}
          component={SettingsScreen}
        />
      </Tab.Navigator>
    );
  }
}

export default HomeMainScreen;

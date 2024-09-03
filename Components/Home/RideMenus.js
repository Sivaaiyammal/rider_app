import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';

// Custom Modules

import {bottomTabStyles} from '../../Styles/Home/Home';

class TripMenus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMenu: 0,
    };
  }

  onMenuSelect(menu, index) {
    this.setState({selectedMenu: index});
    menu.callback();
  }

  render() {
    return (
      <View style={bottomTabStyles.rideMenuContainer}>
        {this.props.menus.map((menu, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => this.onMenuSelect(menu, index)}>
              <View>
                <View
                  style={[
                    bottomTabStyles.rideMenuImageContainer,
                    {
                      backgroundColor: this.props.isSelectEnable
                        ? this.state.selectedMenu == index
                          ? menu.activeColor
                          : menu.color || '#e4f2fc'
                        : menu.color || '#e4f2fc',
                    },
                  ]}>
                  <Image
                    // style={bottomTabStyles.rideMenuImage}
                    source={
                      this.props.isSelectEnable
                        ? this.state.selectedMenu == index
                          ? menu.buttonActiveImage
                          : menu.buttonImage
                        : menu.buttonImage
                    }
                  />
                </View>
                <Text
                  style={[
                    bottomTabStyles.menuText,
                    {
                      color: this.props.isSelectEnable
                        ? this.state.selectedMenu == index
                          ? menu.activeColor
                          : '#212529'
                        : '#212529',
                      fontWeight: this.props.isSelectEnable
                        ? this.state.selectedMenu == index
                          ? 'bold'
                          : 400
                        : 400,
                    },
                  ]}>
                  {menu.text}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
}

export default TripMenus;


import React from 'react';
import {Component} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';

// Styles

import {InstantTripsStyles} from '../../Styles/Home/InstantTrips';
import {MapIconsStyle} from '../../Styles/Home/Home';

// images

import NotificationImage from '../../Assets/HomeScreen/Notification.webp';
import LeftArrowImage from '../../Assets/LeftArrow.svg';

class HeaderBasic extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          paddingLeft: 25,
          paddingRight: 25,
          paddingTop: 20,
          paddingBottom: 20,
        }}>
        <TouchableOpacity
          onPress={() => this.props.onBackPress()}
          style={[MapIconsStyle.iconContainer, {marginBottom: 0}]}>
          <LeftArrowImage width={20} height={20} />
        </TouchableOpacity>
        <Text style={InstantTripsStyles.instantTripCreateHeaderText}>
          {this.props.title}
        </Text>
        {!this.props.disableRigthIcon ? (
          <TouchableOpacity
            style={[MapIconsStyle.iconContainer, {marginBottom: 0}]}>
            <Image
              style={MapIconsStyle.icon}
              source={this.props.NotificationImage || NotificationImage}
            />
          </TouchableOpacity>
        ) : (
          <Text></Text>
        )}
      </View>
    );
  }
}

export default HeaderBasic;

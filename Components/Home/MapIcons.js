import React, {Component} from 'react';
import {View, TouchableOpacity, Image} from 'react-native';

// Custom Modules

import {MapIconsStyle} from '../../Styles/Home/Home';

// Images

import NotificationImage from '../../Assets/HomeScreen/Notification.webp';
import CurrentLocationImage from '../../Assets/HomeScreen/CurrentLocation.webp';
import CompassImage from '../../Assets/HomeScreen/Compass.webp';
import CarImage from '../../Assets/HomeScreen/Car.webp';

class MapIcons extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View style={MapIconsStyle.container}>
        <TouchableOpacity
          style={MapIconsStyle.iconContainer}
          onPress={() =>
            this.props.notificationIconCallback
              ? this.props.notificationIconCallback()
              : null
          }>
          <Image source={NotificationImage} style={MapIconsStyle.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={MapIconsStyle.iconContainer}
          onPress={() =>
            this.props.zoomToHomeLocation
              ? this.props.zoomToHomeLocation()
              : null
          }>
          <Image source={CurrentLocationImage} style={MapIconsStyle.icon} />
        </TouchableOpacity>
        {this.props.compass ? (
          <TouchableOpacity style={MapIconsStyle.iconContainer}>
            <Image source={CompassImage} style={MapIconsStyle.icon} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={MapIconsStyle.iconContainer}
          onPress={() =>
            this.props.carIconCallback ? this.props.carIconCallback() : null
          }>
          <Image source={CarImage} style={MapIconsStyle.icon} />
        </TouchableOpacity>
      </View>
    );
  }
}

export default MapIcons;

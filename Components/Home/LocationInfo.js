import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import {getRedirection} from 'react-native-translation/src/LanguageProvider';

// Custom Modules

import {locationInfoStyles} from '../../Styles/Home/Home';

// Images

import ProfileImage from '../../Assets/HomeScreen/Profile.webp';
import TranslationFile from '../../CustomerComponent/locales/TranslationFile';

class LocationInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
    };

    this.translation = getRedirection(TranslationFile);
  }

  handleProfileClick = () => {
    // this.props.navigation.navigate('myAccount')

    console.log('Profile Clicked');
    // this.props.profileClick()
  };

  toggleMenu = () => {
    let toggleBtn = this.props.toggleMenu();
    console.log(toggleBtn, 'toggleBtn');
    this.setState({showMenu: toggleBtn});
  };

  render() {
    const {showMenu} = this.props;

    return (
      <View style={locationInfoStyles.addressContainer}>
        <View
          style={{
            ...locationInfoStyles.addressIconContainer,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          {this.props.toggleMenu && (
            <TouchableOpacity
              onPress={() => {
                this.toggleMenu();
              }}>
              <Icon
                name={showMenu ? 'close' : 'menu'}
                size={30}
                style={{...locationInfoStyles.addressIcon, marginRight: 10}}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={this.handleProfileClick}>
            <Image
              source={ProfileImage}
              style={locationInfoStyles.addressProfileImage}
            />
          </TouchableOpacity>
        </View>

        <View>
          <Text style={locationInfoStyles.title}>
            {this.translation['your_location']}
          </Text>
          <Text style={locationInfoStyles.address}>
            {this.props.address || <ActivityIndicator />}
          </Text>
        </View>
      </View>
    );
  }
}

LocationInfo.prototype = {
  address: PropTypes.string.isRequired,
};

LocationInfo.defaultProps = {
  address: 'No Address Found',
};

export default LocationInfo;


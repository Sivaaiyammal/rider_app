import React, {Component} from 'react';
import {View} from 'react-native';
import RidesYours from '../RidesDetails/Rides';
import MyAccount from '../Profile/MyAccount';
import NotificationScreen from '../NotificationScreen';
import ContactScreen from '../ContactScreen';
import ChooseLanguageScreen from '../../Components/Language/ChooseLanguageScreen';
import {DataStore} from '../../Controllers/DataStore';

export default class MenuScreens extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedLanguage: 'en',
    };
  }

  handleRadioButtonPress = language => {
    console.log('language', language);
    this.setState({selectedLanguage: language});
    DataStore.storeData('language', language);
  };

  getSelectedScreen = screen => {
    switch (screen) {
      case 'myAccount':
        return <MyAccount navigation={this.props.navigationee}/>;
      case 'RidesYours':
        return <RidesYours />;
      case 'Notifications':
        return <NotificationScreen />;
      case 'contact':
        return <ContactScreen />;
    }
  };

  render() {
    const {isModalOpen, selectedScreen} = this.props;
    return (
        isModalOpen && (
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor:'white'
            }}>
            {this.getSelectedScreen(selectedScreen)}
          </View>
        )
    );
  }
}

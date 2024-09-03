import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Custom Modules

import {bottomTabStyles, HomeMenuStyles} from '../../Styles/Home/Home';
import MainMenuButtons from '../../Components/Home/MainMenuButtons';
import RideMenus from '../../Components/Home/RideMenus';
import TripCardDetails from '../Trips/tripCardDetials';
import {HomeScreenContext} from '../Home/HomeScreen';

// Images
import RideNowImage from '../../Assets/HomeScreen/ridenow.png';
import RideNowActiveImage from '../../Assets/HomeScreen/ridenow_active.png';

import ScheduleRideImage from '../../Assets/HomeScreen/scheduleride.png';
import ScheduleRideActiveImage from '../../Assets/HomeScreen/scheduleride_active.png';

import RentalImage from '../../Assets/HomeScreen/rental.png';
import RentalActiveImage from '../../Assets/HomeScreen/rental_active.png';

import OutstationImage from '../../Assets/HomeScreen/outstation.png';
import OutstationActiveImage from '../../Assets/HomeScreen/outstation_active.png';

import SharedImage from '../../Assets/HomeScreen/shared.png';
import SharedActiveImage from '../../Assets/HomeScreen/shared_active.png';

import SearchImage from '../../Assets/HomeScreen/search.webp';
import {getRedirection} from 'react-native-translation/src/LanguageProvider';
import TranslationFile from '../locales/TranslationFile';
import NotificationManager from '../../Components/Notification/NotificationManager';

class MainMenuContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      selectedMenu: 'RideNow',
      selectedMenuType: 'RideNow',
    };
    this.showTripDetails = this.props.showTripDetails;
    this.translation = getRedirection(TranslationFile);
  }

  getRideMenus(context) {
    return [
      {
        text: this.translation['Ride_now'],
        callback: () => {
          this.setState({selectedMenu: 'RideNow', selectedMenuType: 'RideNow'});
        },
        buttonImage: RideNowImage,
        buttonActiveImage: RideNowActiveImage,
        color: '#f8ebff',
        activeColor: '#4b48ab',
      },
      {
        text: this.translation['schedule'],
        callback: () => {
          this.setState({
            selectedMenu: 'Schedule',
            selectedMenuType: 'Schedule',
          });
        },
        buttonImage: ScheduleRideImage,
        buttonActiveImage: ScheduleRideActiveImage,
        color: '#f8ebff',
        activeColor: '#4775ff',
      },
      // {
      //   text: 'Rental',
      //   callback: () => {
      //     this.setState({selectedMenu: 'Rental', selectedMenuType: 'Rental'});
      //   },
      //   buttonImage: RentalImage,
      //   buttonActiveImage: RentalActiveImage,
      //   color: '#f8ebff',
      //   activeColor: '#cb61ff',
      // },
      // {
      //   text: 'Outstation',
      //   callback: () => {
      //     this.setState({
      //       selectedMenu: 'Outstation',
      //       selectedMenuType: 'Outstation',
      //     });
      //   },
      //   buttonImage: OutstationImage,
      //   buttonActiveImage: OutstationActiveImage,
      //   color: '#f8ebff',
      //   activeColor: '#ff5a76',
      // },
      // {
      //   text: 'Sharing',
      //   callback: () => {
      //     this.setState({selectedMenu: 'Sharing', selectedMenuType: 'Sharing'});
      //   },
      //   buttonImage: SharedImage,
      //   buttonActiveImage: SharedActiveImage,
      //   color: '#f8ebff',
      //   activeColor: '#419a5b',
      // },
    ];
  }

  updateHomeView(label) {
    if (label === 'RideNow' || label === 'Schedule') {
      this.props.updateHomeView(label);
    } else {
      NotificationManager.error('Currently Unavailable', 3000, 'bottom');
    }
  }

  onSearchChange(value) {
    this.setState({searchValue: value});
  }

  render() {
    return (
      <HomeScreenContext.Consumer>
        {context => (
          <ScrollView style={bottomTabStyles.container}>
            <RideMenus menus={this.getRideMenus()} isSelectEnable={true} />
            <TouchableOpacity
              disabled={this.props.showMenu}
              onPress={() => {
                this.updateHomeView(this.state.selectedMenuType);
              }}
              style={{...bottomTabStyles.searchInputContianer, marginTop: 25}}>
              <Image style={bottomTabStyles.searchImage} source={SearchImage} />
              <TextInput
                style={{width: '100%'}}
                placeholder={this.translation['search_destination']}
                placeholderTextColor="#757575"
                autoCapitalize="none"
                autoCorrect={false}
                value={this.state.searchValue}
                onChangeText={this.onSearchChange}
                editable={false}
                color="#000"
              />
            </TouchableOpacity>
          </ScrollView>
        )}
      </HomeScreenContext.Consumer>
    );
  }
}

export default MainMenuContainer;

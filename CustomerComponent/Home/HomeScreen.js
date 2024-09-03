import React, {Component} from 'react';
import {View, Animated, Text} from 'react-native';
import {HomeScreenStyles} from '../../Styles/Home/Home';
import MyAccount from '../Profile/MyAccount';
import {SearchAPI} from '../../Controllers/NEMap/Search';
import RidesYours from '../RidesDetails/Rides';
import ContactScreen from '../ContactScreen';
import NotificationScreen from '../NotificationScreen';
import InstantTrips from './RideNow/RideNow';
import ChooseLanguageScreen from '../../Components/Language/ChooseLanguageScreen.js';
import {DataStore} from '../../Controllers/DataStore.js';
import APIRequest from '../../Controllers/APIRequest.js';
import {GlobalContext} from '../Store/CreateStore.js';
import FullScreenLoader from '../../Components/Loaders/FullScreenLoader.js';
import NotificationManager from '../../Components/Notification/NotificationManager.js';
import {getRedirection} from 'react-native-translation/src/LanguageProvider';
import TranslationFile from '../locales/TranslationFile.js';
import ApiConfig from '../../Config/ApiConfig.js';
import SideBarMenu from './sideBarMenu.js';
import CustomModal from '../../Controllers/CustomComponent/CustomModal.js';
import MenuScreens from '../screens/MenuScreens.js';

export const HomeScreenContext = React.createContext();

class HomeScreen extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      mapInitialLocation: null,
      currentScreen: 'Home',
      showDetailsView: false,
      userLocation: null,
      userAddress: null,
      showMenu: false,
      rideType: 'Ridenow',
      selectedLanguage: 'en',
      profileData: null,
      isLoading: false,
      isModalOpen: false,
      selectedScreen: null,
    };

    this.translation = getRedirection(TranslationFile);

    this.navigation = this.props.navigation;
    this.changeScreen = this.changeScreen.bind(this);
    this.showMenus = this.showMenus.bind(this);
    this.showTripDetails = this.showTripDetails.bind(this);
    this.onUserLocationChange = this.onUserLocationChange.bind(this);
    this.zoomToHomeLocation = this.zoomToHomeLocation.bind(this);
    // this.getRideNowUI = this.getRideNowUI.bind(this);
    this.updateRideType = this.updateRideType.bind(this);
    // this.getHomeScreenMainUI = this.getHomeScreenMainUI.bind(this)

    // Animated values
    this.offsetValue = new Animated.Value(0);
    this.scaleValue = new Animated.Value(1);
    this.closeButtonOffset = new Animated.Value(0);

    this.updateMapLoaded = this.updateMapLoaded.bind(this);

    this.globalContext = context;
    const {userDetails} = this.globalContext;
    this.userInfo = userDetails?.userInfo;
  }

  async getUserDetails() {
    this.setState({isLoading: true});
    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/get-profile-detials';

    const phoneNumber = this.userInfo;

    let payload = {
      phone: phoneNumber,
    };

    await api
      .request(url, 'POST', payload)
      .then(data => {
        if (data.success) {
          this.setState({profileData: data.data});
        }
      })
      .catch(
        e => (
          console.log('USER DETAILS-->>ERROR-->>', e),
          NotificationManager.error(
            'Error While Fetching User Details',
            5000,
            'bottom',
          )
        ),
      )
      .finally(() => this.setState({isLoading: false}));
  }

  toggleMenu = () => {
    const {showMenu} = this.state;

    // Start the animations
    Animated.timing(this.scaleValue, {
      toValue: showMenu ? 1 : 0.78,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(this.offsetValue, {
      toValue: showMenu ? 0 : 350,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(this.closeButtonOffset, {
      toValue: showMenu ? 0 : -30,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Update the state
    this.setState({showMenu: !showMenu});

    return !showMenu;
  };

  changeScreen(screenName,isUpdate) {
    console.log('change screen', screenName);

    if (screenName === 'Language' || isUpdate)
    return this.setState({currentScreen: screenName, showMenu: false});

    if (this.state.isModalOpen) {
      this.setState({isModalOpen: false, showMenu: false});
    } else {
      this.setState({isModalOpen: true, selectedScreen: screenName});
    }
  }

  showMenus() {
    this.setState({showMenu: true});
  }

  showTripDetails(val) {
    this.setState({showDetailsView: val});
    this.changeScreen('Home');
  }

  async onUserLocationChange(data) {
    this.setState({userLocation: data});
    // reverse geocode and getaddress
    try {
      let api = new SearchAPI();
      let address = await api.reverseGeocode(
        [data.latitude, data.longitude],
        (onlyAddress = true),
      );
      if (this.state.mapInitialLocation == null) {
        this.setState({
          userAddress: address,
          mapInitialLocation: {
            lng: data.longitude,
            lat: data.latitude,
            zoom: 12,
            key: 1,
          },
        });
      } else {
        this.setState({
          userAddress: address,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  zoomToHomeLocation() {
    //call setstate to reset the mapinitial location
    if (!this.state.mapInitialLocation) return;

    this.setState({
      mapInitialLocation: {
        lng: this.state.mapInitialLocation.lng,
        lat: this.state.mapInitialLocation.lat,
        key: this.state.mapInitialLocation.key + 1, // updating the key will force rerender even if location does not change
        zoom: 12, //the zoom must be diferent than the current zoom
      },
    });
  }
  async onUserLocationChange(data) {
    this.setState({userLocation: data});
    // reverse geocode and getaddress
    try {
      let api = new SearchAPI();
      let address = await api.reverseGeocode(
        [data.latitude, data.longitude],
        (onlyAddress = true),
      );
      if (this.state.mapInitialLocation == null) {
        this.setState({
          userAddress: address,
          mapInitialLocation: {
            lng: data.longitude,
            lat: data.latitude,
            zoom: 12,
            key: 1,
          },
        });
      } else {
        this.setState({
          userAddress: address,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  componentDidMount = async () => {
    await this.getUserDetails();

    let {data: language} = await DataStore.loadData('language');
    console.log(language, 'language');
    if (language) {
      this.setState({selectedLanguage: language});
      console.log(language, 'Selected-->>language');
    }
  };

  handleRadioButtonPress = language => {
    console.log('language', language);
    this.setState({selectedLanguage: language});
    DataStore.storeData('language', language);
  };

  onBackPress = () => {
    this.changeScreen('Home',true);
  };

  getMenus = () => {
    return [
      {
        title: this.translation['my_account'],
        imageProps: 'person',
        onPress: () => {
          this.changeScreen('myAccount');
        },
      },
      {
        title: this.translation['your_rides'],
        imageProps: 'car',
        onPress: () => {
          this.changeScreen('RidesYours');
        },
      },
      {
        title: this.translation['notification'],
        imageProps: 'notifications',
        onPress: () => {
          this.changeScreen('Notifications');
        },
      },
      {
        title: this.translation['language'],
        imageProps: 'language',
        onPress: () => {
          this.changeScreen('Language');
        },
      },
      {
        title: this.translation['about'],
        imageProps: 'help-buoy',
        onPress: () => {
          this.changeScreen('contact');
        },
      },
    ];
  };

  getHomeScreenMainUI = () => {
    const {
      showDetailsView,
      showMenu,
      userAddress,
      mapInitialLocation,
      isLoading,
    } = this.state;

    return (
      <InstantTrips
        loading={isLoading}
        getMenus={this.getMenus()}
        showDetailsView={showDetailsView}
        showMenu={showMenu}
        userAddress={userAddress}
        toggleMenu={this.toggleMenu}
        zoomToHomeLocation={this.zoomToHomeLocation}
        onUserLocationChange={this.onUserLocationChange}
        mapInitialLocation={mapInitialLocation}
        updateMapLoaded={this.updateMapLoaded}
        itemData={this.state.profileData}
        istabvisible={this.isTabBarVisible}
        hideTabBar={this.hideTabBarr}
        sideBarMenus={
          <SideBarMenu
            menus={this.getMenus()}
            itemData={this.state.profileData}
          />
        }
      />
    );
  };

  isTabBarVisible = v => {
    this.hideTabBar(v);
  };

  updateMapLoaded = () => {
    // this.setState({ mapLoaded: true })
    console.log('MAP-->>loaded');
  };

  updateRideType(val) {
    this.setState({rideType: val});
  }

  onBackPresss = () => {
    this.props.navigation.reset({
      index: 0,
      routes: [{name: 'AuthenticationScreen'}],
    });
  };

  hideTabBarr = home => {
    this.props.navigation.setOptions({
      tabBarStyle: {display: home === 'home' ? 'flex' : 'none'},
    });
  };

  MenuScreens() {
    return (
      <MenuScreens
        isModalOpen={this.state.isModalOpen}
        selectedScreen={this.state.selectedScreen}
        navigationee={this.onBackPresss}
        onBackPress={this.onBackPress}
        handleRadioButtonPress={this.handleRadioButtonPress}
      />
    );
  }

  render() {
    return (
      <>
        <HomeScreenContext.Provider
          value={{
            changeScreen: this.changeScreen,
            showDetailsView: this.showTripDetails,
            rideType: this.updateRideType,
          }}>
          {this.state.isLoading && <FullScreenLoader message="Loading" />}
          {{
            Home: this.getHomeScreenMainUI,
            Language: () => {
              return (
                <ChooseLanguageScreen
                  selectedLanguage={this.state.selectedLanguage || 'English'}
                  changeScreen={this.onBackPress}
                  Colors={'#6f00ff'}
                  listOFLanguages={[
                    {
                      Text: 'English',
                      value: 'en',
                      callback: this.handleRadioButtonPress,
                    },
                    {
                      Text: 'தமிழ்',
                      value: 'ta',
                      callback: this.handleRadioButtonPress,
                    },
                    {
                      Text: 'हिन्दी',
                      value: 'हिन्दी',
                      callback: this.handleRadioButtonPress,
                    },
                  ]}
                  settings={true}
                />
              );
            }
          }[this.state.currentScreen]?.()}
          {this.MenuScreens()}
        </HomeScreenContext.Provider>
      </>
    );
  }
}

HomeScreen.contextType = GlobalContext;
export default HomeScreen;

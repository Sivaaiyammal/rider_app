import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {HomeScreenContext} from '../Home/HomeScreen';
import TripHistoryHeader from '../../Components/Trips/TripHistoryHeader';
import TripHistory from './tripHistory';
import UpCommingTrip from './upCommingTrips';
import TripDetail from './TripDetail';
import CustomBackHandler from '../Home/RideNow/usebackbtn';
import TranslationFile from '../locales/TranslationFile';
import {getRedirection} from 'react-native-translation/src/LanguageProvider';

class RidesYours extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentScreen: 'upComingTrips',
      showDetails: false,
      trip_details: null,
    };

    this.translation = getRedirection(TranslationFile);
  }

  openDetail = value => {
    console.log('hari-->>openDetails', value);
    this.setState({showDetails: true, trip_details: value});
  };

  onBackPress(homescreenContext) {
    if (this.state.showDetails) {
      this.setState({showDetails: false, trip_details: null});
    } else {
      homescreenContext.changeScreen('Home');
    }
  }

  handleDeviceBackPress(context) {
    context.changeScreen('Home');
  }

  render() {
    return (
      <HomeScreenContext.Consumer>
        {homescreenContext => (
          <View style={{backgroundColor: 'white', flex: 1}}>
            <CustomBackHandler
                onBackPress={() => this.handleDeviceBackPress(homescreenContext)}
              />
            <TripHistoryHeader
              headerText="Your Rides"
              onBackPress={() => this.onBackPress(homescreenContext)}
            />
            {this.state.showDetails ? (
                <TripDetail itemData={this.state.trip_details}/>
            ) : (
              <>
                <View style={{alignItems: 'center'}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      // padding: 10,
                      backgroundColor: '#eeeeee',
                      borderRadius: 20,
                    }}>
                    <TouchableOpacity
                      style={{
                        padding: 10,
                        backgroundColor:
                          this.state.currentScreen == 'upComingTrips'
                            ? '#4b48ab'
                            : 'transparent',
                        borderRadius: 20,
                      }}
                      onPress={() =>
                        this.setState({currentScreen: 'upComingTrips'})
                      }>
                      <Text
                        style={{
                          color:
                            this.state.currentScreen == 'upComingTrips'
                              ? 'white'
                              : 'grey',
                        }}>
                          {this.translation['upcoming_trips']}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        padding: 10,
                        backgroundColor:
                          this.state.currentScreen == 'tripHistory'
                            ? '#4b48ab'
                            : 'transparent',
                        borderRadius: 20,
                      }}
                      onPress={() =>
                        this.setState({currentScreen: 'tripHistory'})
                      }>
                      <Text
                        style={{
                          color:
                            this.state.currentScreen == 'tripHistory'
                              ? 'white'
                              : 'grey',
                        }}>
                          {this.translation['trip_history']}
                        
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View>
                  {this.state.currentScreen == 'upComingTrips' ? (
                    <UpCommingTrip />
                  ) : (
                    <TripHistory detailedView={this.openDetail} />
                  )}
                </View>
              </>
            )}
          </View>
        )}
      </HomeScreenContext.Consumer>
    );
  }
}

export default RidesYours;

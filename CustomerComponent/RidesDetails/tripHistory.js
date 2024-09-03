import React from 'react';
import {View, Text, FlatList, Image, ActivityIndicator} from 'react-native';
import {SearchAPI} from '../../Controllers/NEMap/Search';
import NotificationManager from '../../Components/Notification/NotificationManager';
import APIRequest, {static_data} from '../../Controllers/APIRequest';
import TripFilter from '../Trips/TripFilter';
import Trip from '../Trips/Trip';
import {GlobalContext} from '../Store/CreateStore';
import TripDetail from './TripDetail';
import moment from 'moment';
import ApiConfig from '../../Config/ApiConfig';
import TranslationFile from '../locales/TranslationFile';
import {getRedirection} from 'react-native-translation/src/LanguageProvider';

class TripHistory extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = {
      selectedMenu: 'RideNow',
      trips: [],
      isLoading: false,
      isRefreshing: false,
      selectedFilter: 'Today',
      page: 1,
      limit: 10,
      allDataFetched: false,
      isEndLoading: false,
    };
    this.sort = 0;
    this.searchAPI = new SearchAPI();
    this.fetching = false; // Flag to check if fetching is in progress
    this.closeTripSummary = this.closeTripSummary.bind(this);
    this.onFilterChangeCallback = this.onFilterChangeCallback.bind(this);
    this.globalContext = context;
    const {userDetails} = this.globalContext;
    this.userID = userDetails?.userInfo;
    this.handleTripSummary = this.handleTripSummary.bind(this);

    this.translation = getRedirection(TranslationFile);
  }

  async handleTripSummary(trip) {
    console.log('hari-->>handleTripSummary--->>', trip);
    this.props.detailedView(trip);
    // Create a deep copy of the trip to avoid mutating the original
    // const updatedTrip = JSON.parse(JSON.stringify(trip));

    // if (updatedTrip.waypoints && updatedTrip.waypoints.length != 0) {
    //   for (let element of updatedTrip.waypoints) {
    //     try {
    //       let startLocationName = await this.searchAPI.reverseGeocode([
    //         element.location['x'],
    //         element.location['y'],
    //       ]);

    //       if (startLocationName != undefined) {
    //         let {name, country, state, city} = startLocationName.properties;
    //         let address = country || '';
    //         address += state ? ', ' + state : '';
    //         element.location_info =
    //           name + ',' + city + ',' + state + ',' + country;
    //       }
    //     } catch (error) {
    //       if (error.name === 'AbortError') {
    //         // leave abort error no need to handle it
    //       } else {
    //         throw error;
    //       }
    //     }
    //   }
    // }

    // this.setState({showSummary: true, activeTrip: updatedTrip});
  }

  closeTripSummary() {
    this.setState({showSummary: false});
  }

  async componentDidMount() {
    let {page, limit, selectedFilter} = this.state;

    this.setState({isLoading: true}); // Start loading
    await this.fetchTrips(selectedFilter, page, limit);
  }

  async fetchTrips(filter, page, limit) {
    try {
      let {selectedFilter} = this.state;
      let result = this.getDateRange(filter || selectedFilter);

      let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
      let url = '/api/customer/get-requests-history';

      let payload = {
        phone: this.userID,
        starttime: String(result.startDate),
        endtime: String(result.endDate),
        status: '3',
        limit: limit,
        page: page
      };

      console.log('hari--->>fetchTrips-->>payload-->>', payload);

      let responseData = await api.request(url, 'POST', payload);
      console.log(responseData);
      if (responseData.success) {
        if (responseData.count < this.state.limit) {
          this.setState({allDataFetched: true}); // Set allDataFetched to true if returned data is less than the limit
        }

        this.setState(prevState => ({
          trips: page === 1 ? responseData.data : [...prevState.trips, ...responseData.data],
          isLoading: false,
          isRefreshing: false,
          isEndLoading: false,
        }));
        this.fetching = false; // Set fetching to false after data is fetched
        NotificationManager.success(responseData.message, 5000, 'bottom');
      } else {
        this.setState(prevState => ({
          isLoading: false,
          isRefreshing: false,
          isEndLoading: false,
        }));
        this.fetching = false; // Set fetching to false after data is fetched

        NotificationManager.error(responseData.message, 5000, 'bottom');
      }
    } catch (error) {
      console.error(error);
      NotificationManager.error(
        'ServerConnectionError - Unable To fetch trips',
        5000,
        'bottom',
      );
    }
  }

  async onFilterChangeCallback(filter) {
    let {page, limit} = this.state;

    this.setState({selectedFilter: filter, trips: []});
    this.setState({isLoading: true,allDataFetched:false}); // Start loading
    await this.fetchTrips(filter, 1, limit);
  }

  getDateRange(selection) {
    moment.tz.setDefault('Asia/Kolkata');

    const today = moment();
    let startDate, endDate;

    switch (selection) {
      case 'Today':
        startDate = today.startOf('day').valueOf();
        endDate = today.endOf('day').valueOf();
        break;
      case 'Yesterday':
        startDate = moment(today).subtract(1, 'days').startOf('day').valueOf();
        endDate = moment(today).subtract(1, 'days').endOf('day').valueOf();
        break;
      case 'This Week':
        // Assuming week starts on Sunday (0 = Sunday, 6 = Saturday)
        startDate = moment().startOf('week').valueOf();
        endDate = moment().endOf('week').valueOf();
        break;
      case 'Last Week':
        startDate = moment().subtract(1, 'weeks').startOf('week').valueOf();
        endDate = moment().subtract(1, 'weeks').endOf('week').valueOf();
        break;
      default:
        startDate = selection; // Assuming that default is a valid date string or timestamp.
        endDate = selection;
    }

    return {
      startDate: startDate,
      endDate: endDate,
    };
  }

  handleRefresh = () => {
    this.setState(
      {
        isRefreshing: true,
        page: 1,
        allDataFetched:false
      },
      () => {
        this.fetchTrips(
          this.state.selectedFilter,
          this.state.page,
          this.state.limit,
        );
      },
    );
  };

  handleLoadMore = () => {
    if (!this.fetching && !this.state.allDataFetched) {
      // Check if not fetching and all data isn't fetched yet
      this.fetching = true; // Set fetching to true
      this.setState(
        prevState => ({
          page: prevState.page + 1,
          isEndLoading: true,
        }),
        () => {
          this.fetchTrips(
            this.state.selectedFilter,
            this.state.page,
            this.state.limit,
          );
        },
      );
    }
  };

  renderFooter = () => {
    if (!this.state.isEndLoading) return null;
    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 1,
          borderColor: 'white',
        }}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  render() {
    let {isLoading} = this.state;

    return (
      <View>
        <TripFilter
          selectedFilter={this.state.selectedFilter}
          onFilterChangeCallback={this.onFilterChangeCallback}
          filters={['Today', 'Yesterday', 'This Week', 'Last Week', 'date']}
        />
        {/* <Trips detailedViewCallback={this.handleTripSummary} trips={trips} type="history" /> */}
        {isLoading ? (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
            }}>
            <ActivityIndicator size="large" color="#2785ff" />
          </View>
        ) : (this.state.trips && this.state.trips.length == 0) ||
          this.state.trips == null ? (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
            }}>
            <Image
              source={require('../../Assets/Trips/tripDetails/emptyTrips.png')}
              style={{width: 300, height: 500}}
            />
            <Text style={{fontSize: 20, fontWeight: 'bold', color: '#a9a9a9'}}>
            {this.translation['no_trips_found']}
            </Text>
          </View>
        ) : (
          <FlatList
            data={this.state.trips}
            renderItem={({item, index}) => (
              <Trip
                showDetails={index == 0 ? true : false}
                detailedViewCallback={this.handleTripSummary}
                trip={item}
              />
            )}
            keyExtractor={item => item.request_id}
            refreshing={this.state.isRefreshing}
            onRefresh={this.handleRefresh}
            onEndReached={this.handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={this.renderFooter}
          />
        )}
      </View>
    );
  }
}
TripHistory.contextType = GlobalContext;
export default TripHistory;

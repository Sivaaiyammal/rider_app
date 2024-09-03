import React from 'react';
import {View, Text, FlatList, Image, ActivityIndicator} from 'react-native';
import TripFilter from '../Trips/TripFilter';
import NotificationManager from '../../Components/Notification/NotificationManager';
import APIRequest, {static_data} from '../../Controllers/APIRequest';
import UpcomingTrip from '../Trips/UpcomingTrip';
import {GlobalContext} from '../Store/CreateStore';
import moment from 'moment';
import ApiConfig from '../../Config/ApiConfig';
import {getRedirection} from 'react-native-translation/src/LanguageProvider';
import TranslationFile from '../locales/TranslationFile';

class UpCommingTrip extends React.Component {
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
    this.fetching = false; // Flag to check if fetching is in progress
    this.sort = 1;
    this.onFilterChangeCallback = this.onFilterChangeCallback.bind(this);
    this.getDateRange = this.getDateRange.bind(this);
    this.onCacelTrip = this.onCacelTrip.bind(this);
    this.globalContext = context;
    const {userDetails} = this.globalContext;
    this.userID = userDetails?.userInfo;

    this.translation = getRedirection(TranslationFile);
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
        status: '0',
        limit: limit,
        page: page
      };

      console.log('hari--->>fetchTrips-->>payload-->>', payload);

      let responseData = await api.request(url, 'POST', payload);

      if (responseData.success) {
        if (responseData.count < this.state.limit) {
          this.setState({allDataFetched: true}); // Set allDataFetched to true if returned data is less than the limit
        }

        this.setState(prevState => ({
          trips: page === 1 ? responseData.data : [...prevState.trips, ...responseData.data],
          isLoading: false,
          isRefreshing: false,
          isEndLoading: false
      }))
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
      this.setState(prevState => ({
        isLoading: false,
        isRefreshing: false,
        isEndLoading: false,
      }));
      this.fetching = false; // Set fetching to false after data is fetched
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
    this.setState({isLoading: true, allDataFetched:false}); // Start loading
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
      case 'Tomorrow':
        startDate = moment(today).add(1, 'days').startOf('day').valueOf();
        endDate = moment(today).add(1, 'days').endOf('day').valueOf();
        break;
      case 'This Week':
        // Assuming week starts on Sunday (0 = Sunday, 6 = Saturday)
        startDate = moment(today).startOf('week').valueOf();
        endDate = moment(today).endOf('week').valueOf();
        break;
      case 'Next Week':
        // Next week's start and end dates
        startDate = moment().add(1, 'weeks').startOf('week').valueOf();
        endDate = moment().add(1, 'weeks').endOf('week').valueOf();
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

  async onCacelTrip(trip) {
    let {trips} = this.state;

    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/customer-cancel-request';

    let payload = {
      phone: static_data,
      request_id: trip.request_id,
    };

    let responseData = await api.request(url, 'POST', payload);

    if (responseData.success) {
      let filteredData = trips.filter(
        item => item.request_id !== trip.request_id,
      );

      this.setState({trips: filteredData});
      NotificationManager.success(responseData.message, 5000, 'bottom');

      return true;
    } else {
      NotificationManager.error(responseData.message, 5000, 'bottom');
      return false;
    }
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
          filters={['Today', 'Tomorrow', 'This Week', 'Next Week', 'date']}
        />

        {isLoading ? (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
              flex: 1,
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
          <View style={{paddingBottom: 250}}>
            <FlatList
              data={this.state.trips}
              renderItem={({item, index}) => (
                <UpcomingTrip
                  showDetails={index == 0 ? true : false}
                  onCacelTrip={this.onCacelTrip}
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
          </View>
        )}
      </View>
    );
  }
}

UpCommingTrip.contextType = GlobalContext;
export default UpCommingTrip;

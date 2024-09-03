import React from 'react';
import {Component} from 'react';

import {View, ScrollView, Image, Text, TouchableOpacity} from 'react-native';
import Trip from './Trip';
import UpcomingTrip from './UpcomingTrip';
import {FlatList} from 'react-native-gesture-handler';

class Trips extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    if (
      (this.props.trips && this.props.trips.length == 0) ||
      this.props.trips == null
    ) {
      return (
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
            No Trips Found
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={this.props.trips}
        renderItem={({item, index}) =>
          this.props.type == 'upcoming' ? (
            <UpcomingTrip
              showDetails={index == 0 ? true : false}
              key={item.schedule_id}
              onCacelTrip={this.props.onCacelTrip}
              trip={item}
            />
          ) : this.props.type == 'history' ? (
            <Trip
              showDetails={index == 0 ? true : false}
              detailedViewCallback={this.props.detailedViewCallback}
              key={item.schedule_id}
              trip={item}
            />
          ) : null
        }
        keyExtractor={item => item.schedule_id}
        refreshing={this.state.isRefreshing}
        onRefresh={this.handleRefresh}
        onEndReached={this.handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={this.renderFooter}
      />
    );
  }
}

export default Trips;

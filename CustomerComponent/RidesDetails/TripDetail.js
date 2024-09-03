import {StyleSheet, Text, View} from 'react-native';
import React, {Component} from 'react';
import StatusCompleted from '../Home/RideNow/StatusCompleted';
import InstantTrips from '../Home/RideNow/RideNow';
import NEMap from '../../Components/Native/NEMap';
import DraggableBottomSheet from '../../Controllers/CustomComponent/BottomSheet';
import Marker from '../../Controllers/NEMap/Marker';

export class TripDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startLocationMarker: null,
      waypointLocationMarkers: [],
      endLocationMarker: null,
      mapFindRoute: null,
      startNavigation: false,
      routeFound: false,
      route: null,
    };
  }

  componentDidMount(){
    const details_data  = this.props.itemData 
    if (details_data){
      this.setStartLocationName(details_data.start_location.y,details_data.start_location.x)
      this.setEndLocationName(details_data.end_location.y,details_data.end_location.x)
    }
  }

  setStartLocationName(longitude,latitude) {
    let marker = new Marker(
      String(new Date().getTime()),
      'start',
      longitude,
      latitude,
    );
    this.setState(
      prevState => ({
        ...prevState,
        startLocationMarker: marker,
        routeFound: false,
        route: null,
      }),
      () => this.setRoute(),
    );
  }

  setEndLocationName(longitude,latitude) {
    let marker = new Marker(
      String(new Date().getTime()),
      'end',
      longitude,
      latitude,
    );
    this.setState(
      prevState => ({
        ...prevState,
        endLocationMarker: marker,
        routeFound: false,
        route: null,
      }),
      () => this.setRoute(),
    );
  }

  getDirectionPoints = data => {
    let locations = [];

    data.forEach(d => {
      locations.push({
        lat: d[1],
        lon: d[0],
      });
    });

    return locations;
  };

  async setRoute() {
    if (this.state.startLocationMarker && this.state.endLocationMarker) {
      let startLocation = [
        this.state.startLocationMarker.lng,
        this.state.startLocationMarker.lat,
      ];
      let endLocation = [
        this.state.endLocationMarker.lng,
        this.state.endLocationMarker.lat,
      ];

      let wayPoints = this.state.waypointLocationMarkers.map(marker => [
        marker?.lng,
        marker?.lat,
      ]);

      let locations = this.getDirectionPoints([
        startLocation,
        ...wayPoints,
        endLocation,
      ]);

      console.log(locations, 'LOCATIONS');
      this.setState({
        mapFindRoute: locations,
      });
      return;
    }
  }

  onDirectionReady = () => {
    this.setState({routeFound: true});
  };

  mapView() {
    let markers = [];
    if (this.state.startLocationMarker)
      markers.push(this.state.startLocationMarker);
    if (this.state.endLocationMarker)
      markers.push(this.state.endLocationMarker);
    if (this.state.waypointLocationMarkers.length)
      markers.push(...this.state.waypointLocationMarkers);

    return (
      <NEMap
        mapStyle={{width: '100%', height: '90%'}}
        // markers={markers}
        onDirectionReady={this.onDirectionReady}
        navigation={this.state.startNavigation}
        findRoute={this.state.mapFindRoute}
      />
    );
  }

  render() {
    const newData = this.props.itemData;
    return (
      <View style={detaileViewStyles.detailsContainer}>
        <View style={detaileViewStyles.mapContainer}>{this.mapView()}</View>
        <DraggableBottomSheet
          minHeight={250}
          children={
            <StatusCompleted
              itemData={newData}
              isHistory={true}
            />
          }
        />
      </View>
    );
  }
}

export default TripDetail;

const detaileViewStyles = StyleSheet.create({
  detailsContainer: {
    flex: 1,
  },
  mapContainer: {
    position: 'absolute',
    width: '100%',
    height: '90%',
  },
  bottomView: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'white',
    height: 300,
  },
});


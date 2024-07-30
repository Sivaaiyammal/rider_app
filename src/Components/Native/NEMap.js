/* eslint-disable no-unused-vars */
/* eslint-disable react/self-closing-comp */
import React, { Component } from 'react';
import { requireNativeComponent, View } from 'react-native';
import { DeviceEventEmitter } from 'react-native';

const MapView = requireNativeComponent('NeNativeModule'); // Use the module name defined in your native module

const defaultStyle = {
  height: '99%',
  width: '100%',
};

class NEMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapLoaded: false,
      loadMap: false,
      resizeDone: false,
    };
    this.getmapReady = this.getmapReady.bind(this);
  }

  triggerResize() {
    setTimeout(() => {
      this.setState(prevState => ({
        ...prevState,
        resizeDone: true,
      }));
    }, 100);
  }

  triggerResizeNav() {
    this.setState(prevState => ({
      ...prevState,
      resizeDone: false,
    }));
    setTimeout(() => {
      this.setState(prevState => ({
        ...prevState,
        resizeDone: true,
      }));
    }, 4000);
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState(prevState => ({
        ...prevState,
        loadMap: true,
        resizeDone: false,
      }));
    }, 100);
    /* Trigger map ready callback */
    this.mapReadyListener = DeviceEventEmitter.addListener('onMapReady', () => {
      console.log("MAP READYY")
      // Set Map loaded to true
      this.setState(prevState => ({
        ...prevState,
        mapLoaded: true,
      }));
      this.props.onMapReady ? this.props.onMapReady() : null;

      this.triggerResize();
    });

    this.navigationReadyListener = DeviceEventEmitter.addListener("onNavigationReady", () => {
      this.props.onMapReady ? this.props.onMapReady() : null
      // Set Map loaded to true
      setTimeout(() => {
        this.setState(prevState => ({
          ...prevState,
          mapLoaded: true
        }));
        this.triggerResizeNav()
      }, 100)

      console.log("Navigation, Map LOADED TRUE")


    });

    this.mapClickListener = DeviceEventEmitter.addListener(
      'onMapClick',
      data => {
        const fixedData = {
          longitude: parseFloat(data.longitude.toFixed(5)),
          latitude: parseFloat(data.latitude.toFixed(5)),
        };
        this.props.onMapClick ? this.props.onMapClick(fixedData) : null;
      },
    );

    this.userLocationChangeListener = DeviceEventEmitter.addListener(
      'onUserLocationChange',
      data => {
        const fixedData = {
          longitude: parseFloat(data.longitude.toFixed(5)),
          latitude: parseFloat(data.latitude.toFixed(5)),
        };
        this.props.onUserLocationChange
          ? this.props.onUserLocationChange(fixedData)
          : null;
      },
    );

    this.directionReadyListener = DeviceEventEmitter.addListener(
      'direction-ready',
      data => {
        this.props.onDirectionReady ? this.props.onDirectionReady(data) : null;
      },
    );
    this.directionInitListener = DeviceEventEmitter.addListener(
      'direction-init',
      data => {
        this.props.onDirectionInit ? this.props.onDirectionInit(true) : null;
      },
    );

    this.markerClickListener = DeviceEventEmitter.addListener(
      'onMarkerClick',
      (data) => {
        this.props.onMarkerClick ? this.props.onMarkerClick(data) : null;
      }
    )

    this.onMapDblclickListener = DeviceEventEmitter.addListener(
      'onMapDblclick',
      (data) => {
        this.props.onMapDblclick ? this.props.onMapDblclick(data) : null;
      }
    )

    this.searchResultsListener = DeviceEventEmitter.addListener(
      'onSearchResults',
      (data) => {
        // console.log("searchResults", data)
        this.props.onSearchResults ? this.props.onSearchResults(data) : null;
      }
    )
  }

  componentWillUnmount() {
    // Don't forget to remove the listener to avoid memory leaks
    this.mapReadyListener.remove();
    this.mapClickListener.remove();
    // this.navigationReadyListener.remove();

  }
  getmapReady() {
    return this.state.mapLoaded;
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.markers !== this.props.markers) {
      this.setState(prevState => ({
        ...prevState,
        resizeDone: !prevState.resizeDone,
      }));
      // }, 100);
    }
  };


  render() {
    return this.state.loadMap ? (
      <>
        <MapView
          style={this.state.resizeDone ? this.props.mapStyle : defaultStyle}
          markers={this.state.mapLoaded ? this.props.markers : null}
          homeLocation={
            this.state.mapLoaded
              ? [
                this.props.homeLocation || {
                  lat: 13.0827,
                  lng: 80.2707,
                  zoom: 6,
                },
              ]
              : null
          }
          mode={this.props.mode}
          searchUnit={this.props.searchUnit}
          geometries={this.state.mapLoaded ? this.props.geometries : null}
          findRoute={
            this.state.mapLoaded && this.props.findRoute?.length !== 0
              ? this.props.findRoute
              : null
          }
          navigation={this.props.navigation}
        />
      </>
    ) : (
      <View></View>
    );
  }
}

export default NEMap;

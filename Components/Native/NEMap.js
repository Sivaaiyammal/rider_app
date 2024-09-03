import React, { Component } from 'react';
import { requireNativeComponent, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { DeviceEventEmitter, AppState, NativeModules } from 'react-native';
import PropsTypes from 'prop-types';


const MapView = requireNativeComponent('NeNativeModule'); // Use the module name defined in your native module
const { NeNativeModule } = NativeModules;


const defaultStyle = {
    height: "99%",
    width: "100%"
}


class NEMap extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showMap: true,
            mapLoaded: false,
            loadMap: false,
            resizeDone: false,
            appState: AppState.currentState,
            mapKey: 1
        }
        this.getmapReady = this.getmapReady.bind(this)
    }

    triggerResize() {

        setTimeout(() => {
            this.setState(prevState => ({
                ...prevState,
                resizeDone: true
            }))
        }, 100)
    }

    triggerResizeNav() {
        this.setState(prevState => ({
            ...prevState,
            resizeDone: false
        }))
        setTimeout(() => {
            this.setState(prevState => ({
                ...prevState,
                resizeDone: true
            }))
        }, 4000)
    }

    _handleAppStateChange = (nextAppState) => {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            // this.remountMap()
            /*
                Temporary Fix for map black screen issue
            */
            // this.setState({ showMap: false }, () => {
            //     setTimeout(() => {
            //         this.setState(prevState => {
            //             // loop through all keys in prevState and if its an object add a random key to force re-render
            //             let newState = { ...prevState }
            //             for (let key in prevState) {
            //                 if (key == "showMap") newState[key] = true
            //                 else if (key == "mapKey") newState[key] = prevState[key] + 1

            //                 else if (typeof prevState[key] == "object") {
            //                     newState[key] = { ...prevState[key], randomKey: Math.random() }
            //                 }else{
            //                     newState[key] = prevState[key]
            //                 }

            //             }
            //             console.log(newState)
            //             return newState
            //         }
            //         )
            //     }, 0)
            // })



        } else if (
            this.state.appState === 'active' &&
            nextAppState.match(/inactive|background/)
        ) {
        }

        this.setState({ appState: nextAppState });
    };


    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);

        setTimeout(() => {
            this.setState(prevState => ({
                ...prevState,
                loadMap: true,
                resizeDone: false
            }))
        }, 100)
        /* Trigger map ready callback */
        this.mapReadyListener = DeviceEventEmitter.addListener("onMapReady", () => {
            this.props.onMapReady ? this.props.onMapReady() : null
            // Set Map loaded to true
            setTimeout(() => {
                this.setState(prevState => ({
                    ...prevState,
                    mapLoaded: true
                }));
                this.props.updateMapLoaded()
            }, 500)

            this.triggerResize()

        });
        /* Trigger map ready callback */
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


        this.mapClickListener = DeviceEventEmitter.addListener("onMapClick", (data) => {
            console.log("ONMAPCLCICKMAP",data)
            const fixedData = {
                longitude: parseFloat(data.longitude.toFixed(5)),
                latitude: parseFloat(data.latitude.toFixed(5))
            };
            this.props.onMapClick ? this.props.onMapClick(fixedData) : null;

        });

        this.userLocationChangeListener = DeviceEventEmitter.addListener("onUserLocationChange", (data) => {
            const fixedData = {
                longitude: parseFloat(data.longitude.toFixed(5)),
                latitude: parseFloat(data.latitude.toFixed(5))
            };
            console.log("USER LOCATION CHANGE",fixedData)
            this.props.onUserLocationChange ? this.props.onUserLocationChange(fixedData) : null;

        });

        this.directionReadyListener = DeviceEventEmitter.addListener("direction-ready", (data) => {
            this.props.onDirectionReady ? this.props.onDirectionReady(true) : null;
            console.log("Direction Ready")
        })
        this.directionInitListener = DeviceEventEmitter.addListener("direction-init", (data) => {
            this.props.onDirectionInit ? this.props.onDirectionInit(true) : null;
        })
    }

    componentWillUnmount() {
        // Don't forget to remove the listener to avoid memory leaks
        this.mapReadyListener.remove();
        this.mapClickListener.remove();
        this.navigationReadyListener.remove();

        console.log("Unmount")
    }
    getmapReady() {
        return this.state.mapLoaded
    }

    remountMap = () => {
        this.setState(prevState => ({
            mapKey: prevState.mapKey + 1 // Increment the key to remount the map
        }));
    }

    render() {
        // navigator={this.state.mapLoaded &&this.props.navigation ?this.props.navigation:false}
        console.log("MAP RENDER")
        return (
            this.state.loadMap ?
                <>
                    {/* {
                        this.state.showMap ? */}
                            <MapView
                                // key={this.state.mapKey}
                                style={this.state.resizeDone ? this.props.mapStyle : defaultStyle}
                                markers={this.state.mapLoaded ? this.props.markers : null}
                                homeLocation={this.state.mapLoaded ? [this.props.homeLocation || { lat: 13.0827, lng: 80.2707, zoom: 6 }] : null}
                                geometries={this.state.mapLoaded ? this.props.geometries : null}
                                findRoute={this.state.mapLoaded && this.props.findRoute?.length != 0 ? this.props.findRoute : null}
                                navigation={this.props.navigation}
                            />
                            {/* : null */}
                    {/* } */}
                </>

                :
                <View>

                </View>



        );


    }
}

NEMap.defaultProps = {
    mapStyle: defaultStyle,
    markers: [],
    polylines: [],
    findRoute: [],
    onMapReady: null,
    onMapClick: null,
    onUserLocationChange: null,
    homeLocation: null,
    navigation: false,
    updateMapLoaded: () => { }
};

NEMap.propTypes = {
    mapStyle: PropsTypes.object,
    markers: PropsTypes.array,
    polylines: PropsTypes.array,
    findRoute: PropsTypes.array,
    onMapReady: PropsTypes.func,
    onMapClick: PropsTypes.func,
    onUserLocationChange: PropsTypes.func,
    homeLocation: PropsTypes.object,
    navigation: PropsTypes.bool,
    updateMapLoaded: PropsTypes.func
};


export default NEMap;
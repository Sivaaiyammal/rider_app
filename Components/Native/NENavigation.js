import React, { Component } from 'react';
import { requireNativeComponent, View, Text, TouchableOpacity } from 'react-native';
import { defaultNEMapStyle } from '../../Styles/NEMap/NEMap.js';
import { DeviceEventEmitter } from 'react-native';
import { NativeModules } from 'react-native';


const NavigationView = requireNativeComponent('NeNativeNavigation'); // Use the module name defined in your native module


const defaultStyle = {
    height: 297,
    width: "100%"
}


class NENavigation extends Component {

    constructor(props) {
        super(props)
        this.state = {
            mapLoaded: false,
            loadMap: false,
            resizeDone: false
        }
    }

    triggerResize() {
        setTimeout(() => {
            this.setState(prevState => ({
                ...prevState,
                resizeDone: true
            }))
            console.log(this.state)
        }, 100)
    }

    componentDidMount() {
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
        },500)

            console.log("NENavigation, Map LOADED TRUE")
            this.triggerResize()

        });

        this.mapClickListener = DeviceEventEmitter.addListener("onMapClick", (data) => {
            const fixedData = {
                longitude: parseFloat(data.longitude.toFixed(5)),
                latitude: parseFloat(data.latitude.toFixed(5))
            };
            this.props.onMapClick ? this.props.onMapClick(fixedData) : null;

        });

        this.navigatorListener = DeviceEventEmitter.addListener("navigation", (data) => {
           console.log("data",data.message)

        });
    }

    componentWillUnmount() {
        // Don't forget to remove the listener to avoid memory leaks
        this.mapReadyListener.remove();
        this.mapClickListener.remove();
        this.navigatorListener.remove()
        console.log("Unmount")
    }

    render() {

        return (


            this.state.loadMap ?
               
                <NavigationView
                    style={this.state.resizeDone ? this.props.mapStyle : defaultStyle}
                    markers={this.state.mapLoaded ? this.props.markers : null}
                    homeLocation={this.state.mapLoaded ? [this.props.homeLocation || { lat: 13.0827, lng: 80.2707, zoom: 6 }] : null}
                    polylines={this.state.mapLoaded ? this.props.polylines : null}
                    // navigator={this.state.mapLoaded &&this.props.navigation.length!=0 ?this.props.navigation:null }
                />

            


             
                :
                <View></View>



        );


    }
}



export default NENavigation;
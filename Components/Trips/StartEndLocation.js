
import React from 'react';
import { Component } from 'react';
import { View, Text, TextInput, Image, Keyboard, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';


import { InstantTripsStyles } from '../../Styles/Home/InstantTrips'
import LocationSearch from '../Common/LocationSearch';
import { SearchAPI } from '../../Controllers/NEMap/Search';

// styles

import { searchStyle } from '../../Styles/LocationSearch'

// images
import StartLocationImage from '../../Assets/HomeScreen/InstantTrips/StartLocation.webp'
import EndLocationImage from '../../Assets/HomeScreen/InstantTrips/EndLocation.webp'
import NotificationManager from '../Notification/NotificationManager';

class StartEndLocation extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showLocationSearch: false,
            startLocationName: props.defaultName.startLocationName,
            endLocationName: props.defaultName.endLocationName,
            searchData: null,
            activeInputType: 'null',
            showStartLocationLoader: false,
            showEndLocationLoader: false
        }
        this.searchAPI = new SearchAPI()
        this.searchData = this.searchData.bind(this)
        this.setLocation = this.setLocation.bind(this)

        this.contentDetials = this.props.contentDetials || undefined
    }

    componentDidUpdate(prevProps, prevState){
    
        if(prevProps.defaultName.startLocationName !== this.props.defaultName.startLocationName && 
            prevProps.defaultName.endLocationName !== this.props.defaultName.endLocationName){

            this.setState(prevState => ({
                ...prevState,
                startLocationName: this.props.defaultName.startLocationName,
                endLocationName: this.props.defaultName.endLocationName
            }))
        }

    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    async searchData() {

        this.setState(prevState => ({
            ...prevState,
            data: null
        }))
        let { activeInputType } = this.state
        let searchText = activeInputType == 'start' ? this.state.startLocationName : this.state.endLocationName
        this.setState(prevState => ({
            ...prevState,
            showStartLocationLoader: activeInputType == 'start' ? true : false,
            showEndLocationLoader: activeInputType == 'end' ? true : false
        }))
        let data;
        try {
            data = await this.searchAPI.search(searchText);
            if(this._isMounted) return

            this.setState(prevState => ({
                ...prevState,
                searchData: data,
                showStartLocationLoader: false,
                showEndLocationLoader: false

            }))
        } catch (error) {
            if(this._isMounted) return

            if (error.name === 'AbortError') {
                // leave abort error no need to handle it
            } else {
                NotificationManager.warning("Unable To geocode locations",3000,'bottom')
            }
        }


    }

    setStartLocationName(name) {
        this.setState(prevState => ({
            ...prevState,
            startLocationName: name
        }), this.searchData)
    }

    setEndLocationName(name) {
        this.setState(prevState => ({
            ...prevState,
            endLocationName: name
        }), this.searchData)
    }

    setLocation(location, coordinates) {
        if (this.state.activeInputType == 'start') {
            this.setState(prevState => ({
                ...prevState,
                startLocationName: location
            }))
            //update parent component
            this.props.setStartLocationName(location, coordinates)
        } else {
            this.setState(prevState => ({
                ...prevState,
                endLocationName: location
            }))
            //update parent component
            this.props.setEndLocationName(location, coordinates)

        }
        // close the keyboard on selection
        Keyboard.dismiss()
    }

    oninputFocus(type) {
        this.setState(prevState => ({
            ...prevState,
            showLocationSearch: true,
            activeInputType: type
        }))
    }

    oninputBlur() {

        this.setState(prevState => ({
            ...prevState,
            showLocationSearch: false,
            activeInputType: null,
            searchData: null
        }))

    }

    componentDidMount() {
        this.props.setMapClickHandler ? this.props.setMapClickHandler(this.onMapClickHandler.bind(this)) : null
    }

    async onMapClickHandler(data) {

        let { latitude, longitude } = data
        let locationName = longitude + "," + latitude
        let { activeInputType } = this.state
console.log(activeInputType, 'activeInputType')
        if (activeInputType == 'start') {
            this.setState({ showStartLocationLoader: true })
        } else if (activeInputType == 'end') {
            this.setState({ showEndLocationLoader: true })
        }
        try {
            let data = await this.searchAPI.reverseGeocode([latitude, longitude])
            let { properties } = data
            let { name, city, state, country } = properties
            const parts = [name, city, state, country];
            let place = parts.filter(Boolean).join(", ");
            locationName = place
        } catch (error) {
            console.log(error)
        }
        this.setState(prevState => ({
            ...prevState,
            startLocationName: this.state.activeInputType == 'start' ? locationName : this.state.startLocationName,
            endLocationName: this.state.activeInputType == 'end' ? locationName : this.state.endLocationName,
            showStartLocationLoader: false,
            showEndLocationLoader: false
        }))
        console.log(locationName, this.state.activeInputType, 'locationName')
        this.state.activeInputType == 'start' ?
            this.props.setStartLocationName(locationName, [longitude, latitude])
            :
            this.props.setEndLocationName(locationName, [longitude, latitude])

    }


    render() {
        return (<View style={InstantTripsStyles.instantTripLocationInputsContainer}>
            <View style={InstantTripsStyles.instantTripLocationInputContainer}>
                <Text style={InstantTripsStyles.inputLabel}>
                    {
                        this.contentDetials ?
                            this.contentDetials.startTitle
                            : "Home Location"
                    }
                </Text>
                <Image style={InstantTripsStyles.instantTripCreateInputIcon}
                    source={
                        this.contentDetials ?
                            this.contentDetials.startImage
                            : StartLocationImage
                    }
                />
                <TextInput
                    onFocus={() => this.oninputFocus('start')}
                    onBlur={() => this.oninputBlur()}
                    style={InstantTripsStyles.instantTripCreateHeaderInput}
                    onChangeText={(value) => this.setStartLocationName(value)}
                >
                    {this.state.startLocationName}
                </TextInput>
                {this.state.showStartLocationLoader ? <ActivityIndicator /> : null}

            </View>
            <View style={InstantTripsStyles.instantTripLocationInputContainer}>
                <Text style={InstantTripsStyles.inputLabel}>
                    {
                        this.contentDetials ?
                            this.contentDetials.endTitle
                            : "Office Location"
                    }
                </Text>
                <Image style={InstantTripsStyles.instantTripCreateInputIcon}
                    source={
                        this.contentDetials ?
                            this.contentDetials.endImage
                            : EndLocationImage
                    }
                />
                <TextInput
                    onFocus={() => this.oninputFocus('end')}
                    onBlur={() => this.oninputBlur()}
                    onChangeText={(value) => this.setEndLocationName(value)}
                    style={InstantTripsStyles.instantTripCreateHeaderInput}>{this.state.endLocationName}</TextInput>
                {this.state.showEndLocationLoader ? <ActivityIndicator /> : null}

            </View>
            {
                this.state.showLocationSearch ?
                    <View style={[searchStyle.container, this.state.activeInputType == 'end' ? searchStyle.bottom : {}]}>
                        <LocationSearch data={this.state.searchData} setLocation={this.setLocation} />
                    </View> : null
            }
        </View>)
    }
}

StartEndLocation.defaultProps = {
    defaultName: {
        startLocationName: "",
        endLocationName: ""
    },
    setStartLocationName: () => { },
    setEndLocationName: () => { },
    setMapClickHandler: () => { }
}

StartEndLocation.propTypes = {
    setStartLocationName: PropTypes.func,
    setEndLocationName: PropTypes.func,
    setMapClickHandler: PropTypes.func
}

export default StartEndLocation
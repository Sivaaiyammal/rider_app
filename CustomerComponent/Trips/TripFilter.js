import React from "react";
import { Component } from "react";

import { View, Text, Image, TouchableOpacity } from 'react-native';

import { TripFilterStyle } from "../../Styles/Trips/TripFilter";
import DateTimePicker from '@react-native-community/datetimepicker';

// images
import CalenderImage from '../../Assets/Trips/Calender.webp';

class TripFilter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFilter: "Today",
            showDatePickers: false,
        }

        this.handleFilterChange = this.handleFilterChange.bind(this)
    }

    handleFilterChange(filter) {

        if(filter === "date") {

            this.setState({
                showDatePickers: true
            })

        } else {

            this.props.onFilterChangeCallback? this.props.onFilterChangeCallback(filter): null
        }
    }

    onEndTimeChange = (event, selectedDate) => {
        const currentDate = selectedDate || new Date();
        this.setState({
            showDatePickers: false
        })
        this.props.onFilterChangeCallback? this.props.onFilterChangeCallback(currentDate): null
    }

    render() {
        let filters = this.props.filters || ["Today", "Yesterday", "LastWeek"]
        return (
            <View style={TripFilterStyle.container}>
                {
                    filters.map((filter, index) => {
                        return <TouchableOpacity
                            key={index}
                            style={[
                                TripFilterStyle.filterContainer,
                                filters.indexOf(this.props.selectedFilter) == -1 && filter === 'date' ? {padding: 10, backgroundColor: '#eeeeee', borderRadius: 50} : null
                            ]}
                            onPress={() => this.handleFilterChange(filter) }
                        >
                            {filter === "date" ?<Image style={TripFilterStyle.icon} source={CalenderImage} />  : 
                            <Text
                                style={[
                                    TripFilterStyle.text,
                                    this.props.selectedFilter === filter ? TripFilterStyle.selectedTab : null
                                ]}
                            >
                                {filter}
                            </Text> }
                        </TouchableOpacity>
                    })
                }

                {this.state.showDatePickers && <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="default"
                    onChange={this.onEndTimeChange}
                />}
            </View>
        )
    }
}

export default TripFilter;
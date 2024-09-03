import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

class YourRidesFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'tripHistory'
        }
    }

    onBtnPress(tab) {
        this.setState({
            activeTab: tab
        })
        tab == "tripHistory" ? this.props.onTripHistorySelected() : this.props.onUpcomingTripsSelected();
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={[styles.button, styles.borderRight, this.state.activeTab == "tripHistory" ? styles.activeBtn : {}]}
                    onPress={() => this.onBtnPress('tripHistory')}>
                    <Text style={this.state.activeTab == "tripHistory" ? styles.activeText : styles.buttonText}>Trip History</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button,
                    this.state.activeTab == "UpcomingTrips" ? styles.activeBtn : {}
                    ]}

                    onPress={() => {this.onBtnPress('UpcomingTrips')}}>
                    <Text style={this.state.activeTab == "UpcomingTrips" ? styles.activeText : styles.buttonText}>Upcoming Trips</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

export default YourRidesFilter;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', // align children horizontally
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '80%',
        paddingBottom: 20
    },
    activeText: {
        fontSize: 16,
        color: 'white',
    },
    button: {
        flex: 1, // each button will take 50% of the container width
        justifyContent: 'center', // center children vertically in the button
        alignItems: 'center', // center children horizontally in the button
        padding: 10, // padding inside the buttons
        borderRadius: 30,
        backgroundColor: '#eeeeee',
        border: 'none'
    },
    activeBtn: {
        backgroundColor: "#4b48ab"
    },
    borderRight: {
        borderRightWidth: 1, // add a border to the right of the first button
        borderColor: 'grey', // border color
    },
    buttonText: {
        fontSize: 16,
        color: 'black',
    },
});

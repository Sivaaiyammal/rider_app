
import React from "react";
import { Component } from "react";
import { View, Text, Image, Pressable, TouchableOpacity } from 'react-native';

const styles = {
    container: {
        backgroundColor: '#e4f2ee',
        width: 190,
        padding: 10,
        borderRadius: 10
    },
    text: {
        color: 'green',
        fontSize: 12,
        fontWeight: 'bold'
    }
}

class TripStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return <View style={styles.container}>
            <Text style={styles.text}>Searching For Driver/Taxi</Text>
        </View>;
    }
}

export default TripStatus;

import React from "react";
import { Component } from "react";
import { ScrollView, View, TouchableOpacity, Text, StyleSheet } from "react-native";
import APIRequest from "../../Controllers/APIRequest";

const styles = StyleSheet.create({
    container: {

    },

    searchItem: {
        padding: 10,
        width: '100%',
        padding: 5,
        width: '100%',
        // marginVertical:6,
        borderBottomWidth:0.2,
        // marginTop:4,
        borderColor:'grey',
        paddingVertical:14
    }
});

class LocationSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null
        };
    }


    render() {


        return <ScrollView keyboardShouldPersistTaps='always' style={{ maxHeight: 300, width: '100%' }}>
            {
                this.props.data ? this.props.data.features.map((item, index) => {
                    let { name, city, state, country } = item.properties
                    const parts = [name, city, state, country];
                    let {coordinates} = item.geometry
                    let place = parts.filter(Boolean).join(", ");

                    return (
                        <TouchableOpacity onPress={() => this.props.setLocation(place,coordinates)} style={styles.searchItem} key={index}>
                            <Text  style={{color:'black'}}>{place}</Text>
                        </TouchableOpacity>
                    )
                })
                    :
                    null
            }
        </ScrollView>;
    }
}

export default LocationSearch;
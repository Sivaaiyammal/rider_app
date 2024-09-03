
import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
import NoData from '../Assets/SvgIcons/NoData'
import ButtonSecondaryRect from './Buttons/ButtonSecondaryRect';

class UnableToFetch extends Component {
    render() {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 50,width:"100%" }}>
                <NoData height={200} />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#a9a9a9' }}>{this.props.text || "Unable To Fetch"}</Text>
                <ButtonSecondaryRect
                    name="Retry"
                    onPress={this.props.onRetry}
                    bgColor={"tomato"} 
                    textColor={"white"}
                    minWidth="100&"
                    borderColor="tomato"
                    fontSize={14}
                    iconName="rotate-right"
                />
            </View>
        );
    }
}

export default UnableToFetch;

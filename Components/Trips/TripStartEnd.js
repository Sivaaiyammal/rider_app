import React from "react";
import { Component } from "react";
import { View, Text, Image} from 'react-native';

import FromImage from '../../Assets/Trips/From.webp';
import ToImage from '../../Assets/Trips/To.webp';
import { utils } from '../../Controllers/utils';

// styles
import { TripStyle } from '../../Styles/Trips/Trip'

class TripStartEnd extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }


    render() {

        let { start_time,end_time,startLocationName,endLocationName } = this.props;

        return (
            <View>
                <View style={TripStyle.location}>
                    <View>
                        <Image style={TripStyle.locationImage} source={FromImage} />
                    </View>
                    <View>
                        <Text style={TripStyle.locationText}>{startLocationName}</Text>
                        <Text style={TripStyle.locationTimeText}>{utils.formatDateAndTime(start_time)}</Text>
                    </View>
                </View>
                <View style={TripStyle.location}>
                    <View>
                        <Image style={[TripStyle.locationImage]} source={ToImage} />
                    </View>
                    <View>
                        <Text style={TripStyle.locationText}>{endLocationName}</Text>
                        <Text style={TripStyle.locationTimeText}>{utils.formatDateAndTime(end_time)}</Text>
                    </View>
                </View>
            </View>


        )
    }
}

export default TripStartEnd;
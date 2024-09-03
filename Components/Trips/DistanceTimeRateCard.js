

import { View,Text } from 'react-native';

import {flexStyle} from '../../Styles/Common/Common'

import Star from '../../Assets/account/star.svg';
import Case from '../../Assets/account/case.svg';
import Wheel from '../../Assets/account/wheel.svg';
import Watch from '../../Assets/account/watch.svg';
import Route from '../../Assets/account/route.svg';

export default function DistanceTimeRateCard(props){

    const {distance,duration,fare} = props

    return (
        <View style={[flexStyle.frjse]}>
            <View style={flexStyle.frg5}>
                <Route height={20} width={20}/>
                <Text>{(distance/1000).toFixed(2)} km</Text>
            </View>
            <View style={flexStyle.frg5}>
                <Watch height={20} width={20}/>
                <Text>{(duration/60).toFixed(2)} mins</Text>
            </View>
            <View style={flexStyle.frg5}>
                <Case height={20} width={20}/>
                <Text>Rs. {fare}</Text>
            </View>
        </View>
    )

}
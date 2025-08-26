import { View, Text, TouchableOpacity  } from 'react-native'
import React, { useEffect } from 'react'
import useAssignedDriverInfoStore from '../../rideStatus/store/useAssignedDriverInfoStore';
// import useRouteDraw from './hook/useRouteDraw';

const TestScreen = () => {
  const {
    driverLatitude,
    driverLongitude
  } = useAssignedDriverInfoStore();

  const stops=[
    {
      "name": "Pickup Point",
      "location": [
        77.12742405872746,
        11.210778809804475
      ],
      "address": "Sokkampalayam",
      "waitingTime": 0,
      "isReached": true,
      "arrivalTime": 1756202907154,
      "driverWaitTime": 0,
      "stopUpdated": true,
      "updatedAt": 1756202907154
    },
    {
      "name": "Drop Point",
      "location": [
        77.04266933607721,
        11.04734822521169
      ],
      "address": "97, Kovai Thirunagar 4th St, Near Rajaganapathi Temple, Civil Aerodrome Post, Nehru Nagar West, Coimbatore, Tamil Nadu 641014",
      "waitingTime": 0,
      "isReached": false
    }
  ]

  // const {estimatedDuration,remainingDistance,SetViewBoundingBox} = useRouteDraw({destimationlat:stops[1].location[1],destimationlon:stops[1].location[0],driverLat:driverLatitude,driverLon:driverLongitude})  

  
  return (
    <View>
      <Text>Estimated Duration: {estimatedDuration}</Text>
      <Text>Remaining Distance: {remainingDistance}</Text>
      <TouchableOpacity onPress={SetViewBoundingBox}>
        <Text>Set View Bounding Box</Text>
      </TouchableOpacity>
    </View>
  )
}

export default TestScreen

import { View, Text, BackHandler } from 'react-native'
import React, { useEffect } from 'react'
import TripHistoryHeader from '../Trips/TripHistoryHeader'
import { ScrollView } from 'react-native-gesture-handler'
import { flexStyle } from '../../Styles/Common/Common'
import NoTripsFound from '../Trips/NoTripsFound'

import {utils} from '../../Controllers/utils'




export default function EditNotificationScreen(props) {
    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            props.onBack()
            return true
        })

        return () => backHandler.remove()
    })

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <TripHistoryHeader headerText={"Notifications"} onBackPress={() => props.onBack()} />
            {
                props.data?.length == 0 ? <NoTripsFound text={"No Notifications found!"} /> :

                    <ScrollView style={{ padding: 10 }}>
                        {
                            props.data.map((data, index) => {
                                const {status,column_id, created_on, updated_at} = data
                                let statusVal = status == 0 ? "Initiated" : data.status == 1 ? "Approved" : "Rejected"
                                let field = column_id == 0 ? "Name" : column_id == 1 ? "Location" : column_id == 2 ? "Email": column_id == 3 ? "Shift Time" : column_id == 4 ? "Department" : column_id == 5 ? "Designation" : column_id == 6 ? "Project" : "Trip Type"
                                return (
                                    <View key={index} style={{ backgroundColor: '#E5E5E5', borderRadius: 8, padding: 8, marginVertical: 5 }}>
                                        <View style={[flexStyle.frjsb, { marginBottom: 5 }]}>
                                            <Text style={{ color: '#212121', fontSize: 14, fontWeight: 'bold' }}>Edit request raised for {field}</Text>
                                            <Text style={{ color: '#757575', fontSize: 14, fontWeight: 'bold' }}>{utils.formatDate(created_on)} </Text>
                                        </View>
                                        <Text style={{ color: '#757575' }}>The request you have raised is {statusVal}</Text>
                                        <Text style={{ color: 'green', fontWeight: '500', fontSize: 12 }}>Request updated on {utils.formatDate(updated_at)}</Text>
                                    </View>
                                )
                            })
                        }

                        <View style={{ marginBottom: 50 }}></View>
                    </ScrollView>
            }


        </View>
    )
}
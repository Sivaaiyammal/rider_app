import { View, Text, BackHandler, TouchableOpacity, TextInput } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import FullScreenLoader from '../Loaders/FullScreenLoader'
import { SearchAPI } from '../../Controllers/NEMap/Search'
import NotificationManager from '../Notification/NotificationManager'
import TripHistoryHeader from '../Trips/TripHistoryHeader'
import Marker from '../../Controllers/NEMap/Marker'
import APIRequest from '../../Controllers/APIRequest'
import { GlobalContext } from '../../EmployeeComponent/store/createStore'
import { ScrollView } from 'react-native-gesture-handler'
import useMapStore from '../../EmployeeComponent/store/useMapStore'

export default function EditAddress({ onBackEdit, context, onChangeAddress, profileData, onConfirmFromAddress }) {

    const [loading, setLoading] = useState(false)
    const [locationData, setLocationData] = useState(null)
    const [address, setAddress] = useState("")
    const [pincode, setPincode] = useState("")
    const { userDetails } = useContext(GlobalContext)
    const mapStore = useMapStore()
    const [mounted,setMounted] = useState(false)

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', ()=>handleBackward(false))
        let pin = profileData.employee_pincode ?? ""
        let addr = profileData.employee_addressline_1 ?? ""
        setAddress(addr)
        setPincode(String(pin))
        setMounted(true)
        mapStore.setDirectionPoints(null)

        return () => {
            mapStore.setShowMap(false)
            mapStore.setMarkers([])
            backHandler.remove()
        }
    }, [])

    const updateData = ()=>{
        let pin = profileData.employee_pincode ?? ""
        let addr = profileData.employee_addressline_1 ?? ""
        setAddress(addr)
        setPincode(String(pin))
    }

    useEffect(() => {
        if (mapStore.clickedLocation) {
            getAddress(mapStore.clickedLocation)
            let marker = new Marker(String(new Date().getTime()), "pickingaddress", mapStore.clickedLocation.longitude, mapStore.clickedLocation.latitude, "start")
            mapStore.setMarkers([marker])
        }
    }, [mapStore.clickedLocation])


    const handleBackward = (bool) => {
        
        onBackEdit(bool)
        return true
    }

    const onSubmit = async () => {
        if (!locationData || pincode == "") return NotificationManager.warning("Please fill the neccessary fields", 3000, "bottom")
        if (pincode.length < 6 || pincode.length > 6) return NotificationManager.warning("pincode must be 6 digits", 3000, "bottom")
        setLoading(true)
        const url = "/api/employee/employee_change_request"
        const apiRequest = new APIRequest()

        const { properties, geometry } = locationData
        const { coordinates } = geometry
        let { name, county, state, postcode, country } = properties
        let area = name ?? ""
        let village = county ?? ""
        let stateArea = state ?? ""
        let countryArea = country ?? ""

        const address = `${area}, ${village}, ${stateArea}`;
        const body = {
            "employee_id": userDetails.id,
            "lat": coordinates[1],
            "lon": coordinates[0],
            "pincode": pincode,
            "address": address,
            "country": countryArea,
            "state": stateArea,
            "city": area
        }

        try {

            const response = await apiRequest.request(url, "POST", body)
            console.log(response,'--frrrrrrrs')
            if(!mounted) return
            if (!response.status) {
                updateData()
                throw new Error("Cannot update address")
            }
            onChangeAddress(address)
            setAddress("")
            setPincode("")
            onConfirmFromAddress({status:0,column_id:1,created_on:new Date().toISOString(),updated_at:new Date().toISOString()})
            // NotificationManager.success("Address changed successfully", 3000, "bottom")
            handleBackward(true)

        } catch (err) {
            console.log(err, 'cannot update address')
            NotificationManager.error("Error Updating address", 3000, "bottom")
        }

        setLoading(false)

    }

    const getAddress = async (data) => {
        setLoading(true)
        const search = new SearchAPI()
        const convertedArray = [data.latitude, data.longitude]
        try {
            const response = await search.reverseGeocode(convertedArray, false)
            if(!mounted) return 
            if (!response) {
                NotificationManager.error("Cannot get Address", 3000, "bottom")
                const address = `${data.latitude} ${data.longitude}`;
                setAddress(address)
                return
            }
            if (response) setLocationData(response)
            const { properties } = response
            const { name, county, state } = properties
            let area = name ?? ""
            let village = county ?? ""
            let stateArea = state ?? ""

            const address = `${area}, ${village}, ${stateArea}`;

            setAddress(address)

        } catch (e) {
            NotificationManager.error("Cannot pick address from map", 3000, "bottom")
            console.log(e, 'cannot fetch picked address')
        }

        setLoading(false)
    }



    return (

        <View style={{ position: 'absolute', top: 400, zIndex: 100,width:"100%" }}>
            {loading && <FullScreenLoader />}
            <View style={{ position: 'absolute', top: -400, width: "100%", backgroundColor: "white" }}>
                <TripHistoryHeader headerText={"Edit Address"} onBackPress={() => handleBackward()} />
            </View>
            <ScrollView style={{ padding: 10 }}>
                <Text style={styles.titleText}>Select From Map or Enter Manually</Text>
                <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={(val) => setAddress(val)}
                    placeholder="Select address or Enter address"

                />
                <Text style={styles.titleText}>Enter pincode</Text>
                <TextInput
                    style={styles.input}
                    value={pincode}
                    onChangeText={(val) => setPincode(val)}
                    placeholder='Enter pincode'
                    keyboardType='numeric'
                />
                <TouchableOpacity style={styles.submitBtn} onPress={() => onSubmit()}>
                    <Text style={styles.text}>Submit</Text>
                </TouchableOpacity>

            </ScrollView>


        </View>

    )
}

const styles = StyleSheet.create({
    input: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "grey",
        marginVertical: 10
    },
    titleText: {
        color: '#212121',
        fontWeight: '500',
        marginTop: 10
    },
    submitBtn: {
        borderRadius: 8,
        backgroundColor: "#212121",
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center"
    },
    text: {
        color: '#fff',
        fontWeight: '500',
    }
})
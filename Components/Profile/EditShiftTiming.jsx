import { BackHandler, Text, TouchableOpacity, View } from 'react-native'
import React, { Component } from 'react'
import TripHistoryHeader from '../Trips/TripHistoryHeader'
import DateTimePicker from '@react-native-community/datetimepicker';
import { StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';


import Trash from '../../Assets/SvgIcons/Trash.svg'
import WithUserStore from '../../EmployeeComponent/store/WithUserStore';
import APIRequest from '../../Controllers/APIRequest';
import NotificationManager from '../Notification/NotificationManager';

class EditShiftTiming extends Component {
    constructor(props) {
        super(props)

        this.state = {
            selectedShift: '',
            shifts: [
                {time:"9:00 - 19:00"},
                {time:"11:00 - 21:00"},
            ],
        }
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            this.props.onBackPress()
            return true
        })
        this.fetchData()
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }

    fetchData = async () => {
        const url = "/api/employee/list_shifts"
        const body = {
            "employee_id": this.props.user.employee_phone_number,
            "page": 1,
            "limit": 10
        }
        let apiRequest = new APIRequest()
        try {
            const response = await apiRequest.request(url, "POST", body)
            if(!response.status) return NotificationManager.error("Cannot get shift timings, please try later",3000,"bottom")
            if(response.status){
                this.setState({shifts:response.data})
            }
        } catch (err) {
            console.log(err)
        }
    }

    handleShiftChange = (val)=>{
        this.setState({selectedShift:val})
    }

    handleSubmit = () =>{
        const { selectedShift } = this.state
        if(selectedShift == "") return NotificationManager.warning("Shift Time cannot be empty",3000,"bottom")
        this.props.onConfirm("Shift Timings",selectedShift)
    }



    render() {
        const { shifts, selectedShift } = this.state
        return (
            <View style={{ flex: 1, position: 'relative' }}>
                <TripHistoryHeader headerText="Edit Shift Timing" onBackPress={() => this.props.onBackPress()} />
                <Picker
                    selectedValue={selectedShift}
                    onValueChange={this.handleShiftChange}
                    style={styles.picker}
                >
                    <Picker.Item label="Select a Shift Time" value="" />
                    {
                        shifts.map((shift, index) => {
                            return <Picker.Item label={shift.shift_time} value={shift.id} key={index} />
                        })
                    }

                </Picker>

                <TouchableOpacity style={styles.submitBtn} onPress={()=>this.handleSubmit()}>
                    <Text style={{ color: "#fff" }}>Submit</Text>
                </TouchableOpacity>

            </View>
        )
    }
}

export default WithUserStore(EditShiftTiming)

const styles = StyleSheet.create({
    submitBtn: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 8,
        alignSelf: 'center',
        // marginTop: 50
        // position: 'absolute',
        // bottom: 50
    },
    dayBox: {
        flexDirection: 'row',
        alignItems: 'center',
        width: "100%",
        marginVertical: 5
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        width: "60%"
    },
    picker: {
        width: '95%',
        margin: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)', // Low opacity border
        backgroundColor: '#FFFFFF', // White background for picker,,
    }
})

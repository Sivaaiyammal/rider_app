import { Text, View, TouchableOpacity, Image } from 'react-native'
import React, { Component } from 'react'
import coffeeImg from "../../Assets/HomeScreen/coffee.webp"
import burgerImg from "../../Assets/HomeScreen/burger.webp"
import lunchImg from "../../Assets/HomeScreen/lunch.webp"
import Coffee from "../../Assets/SvgIcons/Coffee.svg"
import Burger from "../../Assets/SvgIcons/Burger.svg"
import Rice from "../../Assets/SvgIcons/Rice.svg"

import { GoOnlineStyle, GoOfflineStyle, GoBreakStyle } from "../../Styles/DriverStyle/StatusPopupStyle"


class GoBreak extends Component {
    constructor(props) {
        super(props)

        this.state = {
            breakTime: '',
            timers: [
                { label:"15",name: "min", value: 900, image: <Coffee /> },
                { label:"30",name: "min", value: 1800, image: <Burger /> },
                { label:"1",name: "Hr", value: 3600, image: <Rice /> }
            ],
            activeTimer: 1,
            breakTime: 1800
        }
    }

    render() {
        return (
            <View style={GoBreakStyle.container}>
                <Text style={GoBreakStyle.text}>How Long do you need Break?</Text>
                <View style={GoBreakStyle.selectTime}>
                    {
                        this.state.timers.map((timer, index) => {
                            return (
                                <TouchableOpacity
                                    style={[GoBreakStyle.button, { borderWidth: index == (this.state.activeTimer) ? 2 : 0 }]}
                                    key={index}
                                    onPress={() => this.setState({ breakTime: timer.value, activeTimer: index })}>
                                    <>{timer.image}</>
                                    <Text style={GoBreakStyle.duration}>{timer.label} {timer.name}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
                <View style={GoOnlineStyle.buttonContainer}>
                    <TouchableOpacity style={GoOnlineStyle.cancelBtn} key={'cancel'} onPress={() => this.props.onCancel('break')}>
                        <Text style={GoOnlineStyle.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={GoBreakStyle.confirmBtn} key={'confirm'} onPress={() => this.props.onSuccess(this.state.breakTime)}>
                        <Text style={GoOnlineStyle.confirmBtnText}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

export default GoBreak

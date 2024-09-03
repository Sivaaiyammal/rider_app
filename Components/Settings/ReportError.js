import { Text, View, BackHandler } from 'react-native'
import React, { Component } from 'react'
import { container } from '../../Styles/DriverStyle/Emergency'
import TripHistoryHeader from '../Trips/TripHistoryHeader'

class ReportError extends Component {
    constructor(props) {
        super(props)

        this.state = {}
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackward)
    }

    handleBackward = () => {
        this.props.onBack()
        return true
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }
    render() {
        return (
            <View style={container}>
                <TripHistoryHeader onBackPress={this.props.onBack} headerText={'Report Error'} />
            </View>
        )
    }
}

export default ReportError
import { Text, View, BackHandler, StyleSheet, Button } from 'react-native'
import React, { Component } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { container } from '../../Styles/DriverStyle/Emergency'
import TripHistoryHeader from '../Trips/TripHistoryHeader'

import VisionMission from '../../Assets/SvgIcons/vision-mission.svg'

import { AgreementStyles } from '../../Styles/DriverStyle/AgreementStyle'
import { styles, IconSize } from "../../Styles/Settings/settings";
import TranslationFile from '../../DriverComponent/locales/TranslationFile'
import { TransText,getTranslation, getRedirection } from 'react-native-translation'

class AboutUs extends Component {
    constructor(props) {
        super(props)

        this.state = {}
        this.translation = getRedirection(TranslationFile)
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
                <TripHistoryHeader onBackPress={this.props.onBack} headerText={'About us'} />
                <ScrollView style={[styles.container]}>
                    <View style={style.viewContent}>
                        <VisionMission height={300} width={300} />
                        <Text style={style.text}>{this.translation['About Us Main Content']}
                        </Text>
                        {/* <AboutUsSvg height={300} width={300} /> */}
                        <Text style={style.viewContent}>{this.translation['About Us Sub Content']}</Text>
                        <Text style={[style.viewContent, { marginBottom: 100 }]}>{this.translation['About Us End Content']}</Text>
                    </View>

                </ScrollView>
            </View>
        )
    }
}

export default AboutUs

const style = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    viewContent: {
        color: '#212121',
        // textAlign: 'justify',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5
    },
    text: {
        color: '#212121',
        // textAlign:'justify',
        fontSize: 15
    }
})
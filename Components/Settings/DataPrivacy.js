import { Text, View, BackHandler, ScrollView } from 'react-native'
import React, { Component } from 'react'
import { container } from '../../Styles/DriverStyle/Emergency'
import TripHistoryHeader from '../Trips/TripHistoryHeader'

import { AgreementStyles } from '../../Styles/DriverStyle/AgreementStyle'
import { getRedirection } from 'react-native-translation/src/LanguageProvider'
import TranslationFile from '../../DriverComponent/locales/TranslationFile'


class DataPrivacy extends Component {
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
                <TripHistoryHeader onBackPress={this.props.onBack} headerText={'Data Privacy'} />
                <ScrollView style={{ padding: 10 }}>


                    <Text style={AgreementStyles.description}>
                        {this.translation['Data Privacy title']}
                    </Text>

                    <Text style={AgreementStyles.newTitle}>{this.translation['Limited Data collection:']}</Text>
                    <Text style={AgreementStyles.description}>
                        {this.translation['Limited Data Content']}
                    </Text>

                    <Text style={AgreementStyles.newTitle}>{this.translation['Strict Security Measures:']} </Text>
                    <Text style={AgreementStyles.description}>
                        {this.translation['Strict Security Content']}
                    </Text>


                    <Text style={AgreementStyles.newTitle}>{this.translation['No Third-Party Sharing:']}</Text>
                    <Text style={AgreementStyles.description}>
                        {this.translation['No Third-party Content']}
                    </Text>


                    <Text style={AgreementStyles.newTitle}>{this.translation['Transparency and Control:']}</Text>
                    <Text style={AgreementStyles.description}>
                        {this.translation[`Transparency and Control Content`]}
                    </Text>

                    <Text style={AgreementStyles.newTitle}>{this.translation['Compliance and Retention:']}</Text>
                    <Text style={AgreementStyles.description}>
                        {this.translation[`Compliance and Retention Content`]}
                    </Text>

                </ScrollView>
            </View>
        )
    }
}

export default DataPrivacy
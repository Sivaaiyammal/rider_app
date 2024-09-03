import { Text, View, BackHandler, ScrollView } from 'react-native'
import React, { Component } from 'react'
import { container } from '../../Styles/DriverStyle/Emergency'
import TripHistoryHeader from '../Trips/TripHistoryHeader'

import { AgreementStyles } from '../../Styles/DriverStyle/AgreementStyle'
import { getRedirection } from 'react-native-translation/src/LanguageProvider'
import TranslationFile from '../../DriverComponent/locales/TranslationFile'

class PrivacyPolicy extends Component {
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
            <View style={[container]}>
                <TripHistoryHeader onBackPress={this.props.onBack} headerText="Privacy Policy" />
                <ScrollView style={{ padding: 10 }}>

                    {/* Privacy Policy */}
                    <Text style={AgreementStyles.newTitle}>{this.translation['Privacy Policy Heading']}</Text>

                    {/* Introduction */}
                    <Text style={AgreementStyles.description}>{this.translation['Privacy Policy Title']}</Text>

                    {/* Information Collection */}
                    <Text style={AgreementStyles.newTitle}>{this.translation['Information Collection:']}</Text>
                    <Text style={AgreementStyles.description}>
                        {this.translation['Information Collection Content']}
                    </Text>

                    {/* Data Usage */}
                    <Text style={AgreementStyles.newTitle}>{this.translation['Data Usage:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Data Usage Content']}</Text>

                    {/* Data Security */}
                    <Text style={AgreementStyles.newTitle}>{this.translation['Data Security:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Data Security Content']}</Text>

                    {/* Third-Party Sharing */}
                    <Text style={AgreementStyles.newTitle}>{this.translation['Third-Party Sharing:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Third-Party Sharing Content']}</Text>

                    {/* Access and Control */}
                    <Text style={AgreementStyles.newTitle}>{this.translation['Access and Control:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Access and Control Content']}</Text>

                    {/* Retention Period */}
                    <Text style={AgreementStyles.newTitle}>{this.translation['Retention Period:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Retention Period Content']}</Text>

                    {/* Changes to Policy */}
                    <Text style={AgreementStyles.newTitle}>{this.translation['Changes to Policy:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Changes to Policy Content']}</Text>

                    {/* Consent */}
                    <Text style={AgreementStyles.newTitle}>{this.translation['Consent:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Consent Content']}</Text>

                    {/* Contact Us */}
                    <Text style={AgreementStyles.newTitle}>{this.translation['Contact Us:']}</Text>
                    <Text style={[AgreementStyles.description,{marginBottom:100}]}>{this.translation['Contact Us Content']}</Text>

                </ScrollView>

            </View>
        )
    }
}

export default PrivacyPolicy
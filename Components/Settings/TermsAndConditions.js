import { Text, View, BackHandler, ScrollView } from 'react-native'
import React, { Component } from 'react'
import { container } from '../../Styles/DriverStyle/Emergency'
import TripHistoryHeader from '../Trips/TripHistoryHeader'

import { AgreementStyles } from '../../Styles/DriverStyle/AgreementStyle'
import { getRedirection } from 'react-native-translation/src/LanguageProvider'
import TranslationFile from '../../DriverComponent/locales/TranslationFile'

class TermsAndConditions extends Component {
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
                <TripHistoryHeader onBackPress={this.props.onBack} headerText={'Terms and Conditons'} />
                <ScrollView style={{ padding: 10,marginBottom:100 }}>

                    <Text style={AgreementStyles.description}>{this.translation['Terms and Conditions Title']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Acceptance of Terms:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Acceptance of Terms Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Applicability:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Applicability Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['App Usage and Eligibility:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['App Usage and Eligibility Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Registration and Account:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Registration and Account Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Driver Responsibilities:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Driver Responsibilities Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Accepting Trips:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Accepting Trips Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Safety and Conduct:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Safety and Conduct Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Data Privacy and Use:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Data Privacy and Use Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Payment and Fees:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Payment and Fees Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Intellectual Property Rights:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Intellectual Property Rights Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Modifications and Updates:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Modifications and Updates Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Termination:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Termination Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Disclaimer of Liability:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Disclaimer of Liability Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Governing Law and Jurisdiction:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Governing Law and Jurisdiction Content']}</Text>
                    <Text style={AgreementStyles.newTitle}>{this.translation['Contact Information:']}</Text>
                    <Text style={AgreementStyles.description}>{this.translation['Contact Information Content']}</Text>
                </ScrollView>
            </View>
        )
    }
}

export default TermsAndConditions
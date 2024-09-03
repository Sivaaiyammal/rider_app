import { BackHandler, Text, View, TouchableOpacity, ScrollView, Button } from 'react-native'
import React, { Component } from 'react'
import { container } from '../../Styles/DriverStyle/Emergency'
import TripHistoryHeader from '../Trips/TripHistoryHeader'
import { LanguageSCreenStyles } from '../../Styles/Language/ChooseLanguage'
import RadioButton from '../../Controllers/CustomComponent/RadioButton';
import { TranslationConsumer } from 'react-native-translation/src/LanguageProvider'

class LanguageScreen extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
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
        const { listOfLanguages, selectedLanguage, Colors } = this.props
        return (
            <View style={[container, { flex: 1 }]}>
                <TripHistoryHeader headerText={"Language"} onBackPress={this.props.onBack} />
                <ScrollView style={[LanguageSCreenStyles.scrollView, { height: 500 }]}>
                    <View style={LanguageSCreenStyles.radioContainer}>
                        {listOfLanguages.map((language, index) => {

                            return (
                                <TranslationConsumer key={index}>
                                    {
                                        ({ languageConsumer, updateLanguage }) => {
                                            return (
                                                <TouchableOpacity key={index} 
                                                    onPress={() => { 
                                                        language.callback(language.value)
                                                        updateLanguage(language.value)
                                                        }}>
                                                    <RadioButton
                                                        selected={language.value === selectedLanguage}
                                                        labelName={language.text}
                                                        style={{ margin: 10 }}
                                                        Colors={'grey'}
                                                    />
                                                </TouchableOpacity>
                                            )
                                        }
                                    }

                                </TranslationConsumer>
                            )

                        })}

                    </View>

                </ScrollView>
                {/* <TouchableOpacity style={LanguageSCreenStyles.confirmBtn}>
                    <Text style={LanguageSCreenStyles.confirmBtnText}>Confirm</Text>
                </TouchableOpacity> */}
            </View>
        )
    }
}

export default LanguageScreen
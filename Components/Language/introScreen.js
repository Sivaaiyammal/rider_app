import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import { LanguageSCreenStyles } from '../../Styles/Language/ChooseLanguage'
import ArrowImage from '../../Assets/SplashScreen/arrow.svg';
import Back from '../../Assets/Common/Back.svg'
import { getRedirection } from 'react-native-translation/src/LanguageProvider';
import TranslationFile from '../../DriverComponent/locales/TranslationFile';



class IntroScreen extends Component {

    constructor(props) {

        super(props)
        this.state = {

        }
        this.translation = getRedirection(TranslationFile)

    }

    render() {

        const { content, changeScreen, Colors, goBack } = this.props

        return (
            <View style={{ width: "100%", height: "100%" }}>
                <View style={[LanguageSCreenStyles.overallContainer,{backgroundColor:Colors}]}>
                    <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
                        <TouchableOpacity onPress={() => goBack()}>
                            <Back width={20} height={20} />
                        </TouchableOpacity>
                        <View style={{ paddingHorizontal: 10 }}>
                            <Text style={{ color: 'white' }} > {this.translation['Welcome to']}</Text>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 24, verticalAlign: 'top' }}>
                                {this.translation['VM Routes']}
                                <View style={{
                                    // marginLeft: 10,
                                    paddingLeft: 2,
                                    transform: [{ translateY: -5 }],
                                }}>
                                    <Text style={{ fontSize: 16,color:'#fff'}}>®</Text>
                                </View>
                            </Text>

                        </View>
                    </View>
                </View>
                <View style={LanguageSCreenStyles.radioContainer}>
                    <ScrollView style={{ margin: 10 }}>

                        {
                            content.map((item, index) => {
                                return (
                                    <View key={index} style={LanguageSCreenStyles.conntentContanier}>
                                        {item.imageType == 'svg' ? <>{item.image}</> : <Image style={{}} source={item.image} />}
                                        <Text style={LanguageSCreenStyles.contentStyles}>{this.translation[item.title]}</Text>
                                    </View>
                                )
                            })
                        }
                    </ScrollView>
                </View>
                <View style={LanguageSCreenStyles.nextStyles}>
                    <TouchableOpacity style={LanguageSCreenStyles.btnMainContainer} onPress={() => changeScreen()}>
                        <View style={LanguageSCreenStyles.ButtonContianer}>
                            <Text style={{ color: 'white' }}>{this.translation['Next']} </Text>
                            <ArrowImage />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }


}

IntroScreen.prototype = {
    content: PropTypes.array.isRequired,
    changeScreen: PropTypes.func.isRequired,
    Colors: PropTypes.string.isRequired
}

IntroScreen.defaultProps = {
    content: [],
    changeScreen: () => { },
    Colors: '#6f00ff'
}

export default IntroScreen
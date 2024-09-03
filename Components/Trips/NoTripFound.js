import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';

// Custom Modules

import { NoTripFoundStyles } from '../../Styles/Home/Home'

// Images

import WarningImage from '../../Assets/HomeScreen/Warning.webp'
import NotFoundImage from '../../Assets/HomeScreen/NotFound.webp'
import { getRedirection } from 'react-native-translation/src/LanguageProvider';
import TranslationFile from '../../DriverComponent/locales/TranslationFile';
class NoTripFound extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
        this.translation = getRedirection(TranslationFile)
    }

    render() {

        return (<View style={NoTripFoundStyles.container} >
            <View style={NoTripFoundStyles.warningContainer}>
                <Image style={NoTripFoundStyles.warningImage} source={WarningImage} />
                <Text style={NoTripFoundStyles.warningText}>{this.translation[this.props.title] || this.translation["No Trips Found"]}</Text>
            </View>
            <View>
                <Text style={NoTripFoundStyles.warningInfo}>
                    {this.translation[this.props.content] || this.translation['No Trips Found Des']}
                </Text>
            </View>
            <Image style={NoTripFoundStyles.notFoundImage} source={NotFoundImage} />
        </View>)
    }

}

export default NoTripFound;
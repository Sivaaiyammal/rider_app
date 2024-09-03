
import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native';
import PropTypes from 'prop-types'

// styles

import { buttonStyles } from '../../Styles/Home/Home'
import { getRedirection } from 'react-native-translation/src/LanguageProvider';
import TranslationFile from '../../DriverComponent/locales/TranslationFile';
import NotificationManager from '../Notification/NotificationManager';
import { HomeScreenContext } from '../../EmployeeComponent/Home/HomeScreen';



class MainMenuButtons extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
        this.translation = getRedirection(TranslationFile)
    }

    render() {
        return (
            <View style={buttonStyles.buttonsContainer}>
                {
                    this.props.menus.map((menu, index) => {
                        return (
                            <TouchableOpacity key={index} style={!menu.bgDark ? buttonStyles.buttonContainer : buttonStyles.sosButtonContainer} onPress={() => menu.callback()}>
                                <Image
                                    source={menu.buttonImage}
                                    style={buttonStyles.buttonImage}
                                />
                                <Text style={!menu.bgDark ? buttonStyles.buttonText : buttonStyles.sosButtonText}>{menu.text}</Text>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        )
    }
}

MainMenuButtons.propTypes = {
    menus: PropTypes.array.isRequired,
}
export default MainMenuButtons
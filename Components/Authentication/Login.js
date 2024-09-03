import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import { AuthendicationStyles } from '../../Styles/Language/authentication';
import PropTypes from 'prop-types'
// Modules

// images
import ArrowImage from '../../Assets/SplashScreen/arrow.svg';
const LogoImage = require('../../Assets/SplashScreen/Logo.png');
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getRedirection } from 'react-native-translation/src/LanguageProvider';
import TranslationFile from '../../DriverComponent/locales/TranslationFile';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

        this.translation = getRedirection(TranslationFile)
    }

    render() {

        const { title, subtitle, value, onChangeHandler, onRequestOTP, isRegisterLinkEnable, onRegisterLinkClick, isLoginLinkEnable, onLoginLinkClick, Logo } = this.props
        return (
            <View style={AuthendicationStyles.container}>
                <View>
                    {/* <View style={{ height: 20 }} > */}
                    {/* <Image style={{ marginBottom: 20, height: "25%", aspectRatio: 0.6 }} source={LogoImage} /> */}
                    <>{Logo}</>
                    {/* </View> */}
                    {title.map((item, index) => {
                        return (
                            <Text key={index} style={AuthendicationStyles.titleStyle}>{item}</Text>
                        )
                    })}
                    <View style={AuthendicationStyles.sizedBox} />
                    <View style={{ marginBottom: 12 }}>
                        <Text style={AuthendicationStyles.inputTitle}>{subtitle}</Text>
                        <View style={AuthendicationStyles.inputContianer}>
                            <Icon name="phone" style={{ fontSize: 30, color: 'black', marginRight: 10 }} />
                            <TextInput
                                style={{ width: "100%" }}
                                placeholder={this.translation["Mobile Number"]? this.translation["Mobile Number"] : "Mobile Number"}
                                placeholderTextColor="#000"
                                keyboardType="numeric"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={value}
                                onChangeText={(text) => {
                                    const numericText = text.replace(/[^0-9]/g, '');
                                    onChangeHandler(numericText);
                                }}
                                color="#000"
                                maxLength={10}
                            />
                        </View>
                        {isRegisterLinkEnable ?
                            <Text
                                style={AuthendicationStyles.inputTitle}

                            >
                                Are you a new user?
                                <Text style={{ fontWeight: 'bold' }} onPress={() => onRegisterLinkClick()}> Register</Text>
                            </Text>
                            : ""}
                        {isLoginLinkEnable ?
                            <Text
                                style={AuthendicationStyles.inputTitle}

                            >
                                Already a user?
                                <Text style={{ fontWeight: 'bold' }} onPress={() => onLoginLinkClick()}> Sign in Here</Text>
                            </Text>
                            : ""}
                    </View>
                </View>
                <TouchableOpacity style={{ padding: 10, alignItems: 'flex-end' }} onPress={() => onRequestOTP()} disabled={this.props.onLoading}>
                    <View style={AuthendicationStyles.requestBtn}>
                        {this.props.onLoading ? <ActivityIndicator /> : null}
                        <Text style={{ color: 'white' }}>{this.translation['Request OTP']?this.translation['Request OTP'] : 'Request OTP'}</Text>
                        <ArrowImage />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

Login.prototype = {
    title: PropTypes.array.isRequired,
    subtitle: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChangeHandler: PropTypes.func.isRequired,
    onRequestOTP: PropTypes.func.isRequired,
    onLoading: PropTypes.bool.isRequired
}

Login.defaultProps = {
    title: [],
    subtitle: '',
    value: '',
    onChangeHandler: () => { },
    onRequestOTP: () => { },
    onLoading: false
}

export default Login;

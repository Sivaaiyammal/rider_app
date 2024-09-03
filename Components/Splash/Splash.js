// Splash Screen component for the app

import React, { Component } from 'react'
import { View, Text, Image } from 'react-native'
import PropTypes from 'prop-types'
import { splashScreenStyle } from '../../Styles/Splash/Splashscreen'
// import BackgroundImage from '../../Assets/SplashScreen/driverBackGround.svg';
import { ActivityIndicator } from 'react-native-paper';
import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers';

class Splash extends Component {

    constructor(props) {

        super(props)

    }

    componentDidMount = () => {

        setTimeout(() => {

            this.props.callback()

        }, 1000)

    }

    render() {

        let { callback, logo, BackgroundImage, text, version, isLoading = false, Logo } = this.props
        // console.log(backgroundImage)

        return (
            <View style={splashScreenStyle.container}>
                <View style={splashScreenStyle.subcontainer}>
                    {Logo}
                    {/* <Image style={{ ...splashScreenStyle.logo, height: "25%", aspectRatio: 0.6 }} source={logo} /> */}
                    <Text style={splashScreenStyle.title}>{text}</Text>
                    <Text style={splashScreenStyle.version}>{version}</Text>
                    {isLoading ? <ActivityIndicator size={'small'} style={{ marginTop: 10, left: 0, alignItems: 'flex-start', zIndex: 2 }} /> : null}
                </View>
                {/* <Image style={splashScreenStyle.backgroundImage} source={backgroundImage} /> */}
                <View style={{ bottom: 0, width: ScreenWidth, height: ScreenHeight , zIndex: -1}}>
                {BackgroundImage && (
                    BackgroundImage
                )}
                </View>

            </View>
        )
    }
}

Splash.propTypes = {
    callback: PropTypes.func,
    logo: PropTypes.any,
    BackgroundImage: PropTypes.any,
    text: PropTypes.string,
    version: PropTypes.string
}

Splash.defaultProps = {
    callback: () => { },
    logo: "",
    BackgroundImage: <></>,
    text: "",
    version: ""
}

export default Splash;
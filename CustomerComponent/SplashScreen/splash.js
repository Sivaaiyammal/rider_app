// Splash Screen component for the app

import React, { Component } from 'react';
import { firebase } from '@react-native-firebase/app';
import Splash from '../../Components/Splash/Splash';
import { DataStore } from '../../Controllers/DataStore';
import { Image } from 'react-native';

// Images

// const LogoImage = require('../../Assets/SplashScreen/Logo.webp');
import LogoImage from '../../Assets/SplashScreen/DriverLogo.svg';
const BackgroundImage = require('../../Assets/SplashScreen/driverBackGround.webp');


class SplashScreen extends Component {
  constructor(props) {
    super(props);

    this.navigation = this.props.navigation;
  }

  initFirebase = async () => {

    console.log("init firebase")
    const firebaseConfig = {
      apiKey: "AIzaSyBDH3c9xS4Tztu5pynSpbg-0mLsc7rnS0g",
      authDomain: "vmroutes.firebaseapp.com",
      projectId: "vmroutes",
      storageBucket: "vmroutes.appspot.com",
      messagingSenderId: "946479001116",
      appId: "1:946479001116:android:ee720c1ddf6e200fbc39d9",
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    console.log("end init firebase")

  }

  nextScrren = async () => {
    // console.log("splash screen")
    // this.initFirebase()
    const language = await DataStore.loadData('language');
    const onboard = await DataStore.loadData('onboard');

    if (language.status) {
      if (onboard.status) {
        this.navigation.navigate('AuthenticationScreen');
      } else {
        this.navigation.navigate('OnboardScreen');
      }
    } else {
      this.navigation.navigate('LanguageScreen');
    }

  }

  render = () => {
    // setTimeout(() => {
    //   this.navigation.navigate('ChooseLanguageScreen');
    // }, 3000);

    return (
      <Splash
        // logo={LogoImage}
        Logo={<LogoImage width={55} height={90} />}
        BackgroundImage={<Image source={BackgroundImage} />}
        text={'VM Routes ® For Public'}
        version={'v1.0'}
        callback={this.nextScrren}
      />
    );
  }
}

export default SplashScreen;

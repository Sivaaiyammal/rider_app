import React, {Component} from 'react';
import ChooseLanguageScreen from '../../Components/Language/ChooseLanguageScreen';
import IntroScreen from '../../Components/Language/introScreen';
import {DataStore} from '../../Controllers/DataStore';

const findCandidates = require('../../Assets/SplashScreen/find_candidates.png');
const integrity = require('../../Assets/SplashScreen/integrity.png');
const credit_card = require('../../Assets/SplashScreen/credit_card_slash.png');
class LanguageScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedLanguage: 'en',
      showIntroScreen: false,
    };

    this.init();

    this.navigation = this.props.navigation;
  }

  init = async () => {
    let {status, data} = await DataStore.loadData('language');
    this.setState({showIntroScreen: status});
    console.log(status, data, 'intro');
  };

  componentDidMount = async () => {
    let {data: language} = await DataStore.loadData('language');
    console.log(language, 'language');
    if (language) {
      this.setState({selectedLanguage: language});
    }
  };

  handleRadioButtonPress = language => {
    console.log('language', language);
    this.setState({selectedLanguage: language});
    DataStore.storeData('language', language);
  };

  changeScreen = () => {
    DataStore.storeData('language', this.state.selectedLanguage);
    this.navigation.navigate('OnboardScreen');
  };

  goToLoginPage = () => {
    DataStore.storeData('language', this.state.selectedLanguage);
    this.navigation.navigate('OnboardScreen');
  };

  render = () => {
    return (
      <ChooseLanguageScreen
        listOFLanguages={[
          {
            Text: 'English',
            value: 'en',
            callback: this.handleRadioButtonPress,
          },
          {
            Text: 'தமிழ்',
            value: 'ta',
            callback: this.handleRadioButtonPress,
          },
          {
            Text: 'हिन्दी',
            value: 'हिन्दी',
            callback: this.handleRadioButtonPress,
          },
        ]}
        selectedLanguage={this.state.selectedLanguage}
        changeScreen={this.changeScreen}
        Colors={'#4b48ab'}
      />
    );
  };
}

export default LanguageScreen;

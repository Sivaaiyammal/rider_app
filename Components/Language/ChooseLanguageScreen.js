import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity, ScrollView} from 'react-native';
import PropTypes from 'prop-types';

import {LanguageSCreenStyles} from '../../Styles/Language/ChooseLanguage';
import RadioButton from '../../Controllers/CustomComponent/RadioButton';
import {DataStore} from '../../Controllers/DataStore';

const worldImage = require('../../Assets/SplashScreen/world_log.png');
import ArrowImage from '../../Assets/SplashScreen/arrow.svg';
// import { TranslationConsumer } from 'react-native-translation/src/LanguageProvider';
import {TranslationConsumer} from 'react-native-translation';
import CustomBackHandler from '../../CustomerComponent/Home/RideNow/usebackbtn';

class ChooseLanguageScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedLanguage: this.props.selectedLanguage,
    };
  }

  handleNext = () => {
    console.log('language');
    DataStore.storeData('language', this.props.selectedLanguage);
    this.props.changeScreen('home');
  };

  handleDeviceBackPress() {
    this.props.changeScreen('home');
  }

  render() {
    const {selectedLanguage, listOFLanguages, changeScreen, Colors} =
      this.props;

    return (
      <View style={{flex: 1}}>
        <CustomBackHandler onBackPress={() => this.handleDeviceBackPress()} />
        <View
          style={[LanguageSCreenStyles.container, {backgroundColor: Colors}]}>
          <View
            style={{
              padding: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}>
            <TouchableOpacity>
              <View width={20} height={20} />
            </TouchableOpacity>
            <View style={{paddingHorizontal: 10}}>
              <Text style={{color: 'white'}}>Choose Your</Text>
              <Text style={LanguageSCreenStyles.title}>Language</Text>
            </View>
          </View>
          <Image style={{height: 100, marginRight: 30}} source={worldImage} />
        </View>
        {/* <View style={{height: 140}}> */}
        <ScrollView style={[LanguageSCreenStyles.scrollView, {height: 500}]}>
          <View style={LanguageSCreenStyles.radioContainer}>
            {listOFLanguages.map((language, index) => {
              return (
                <TranslationConsumer key={index}>
                  {({languageConsumer, updateLanguage}) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          language.callback(language.value);
                          updateLanguage(language.value);
                        }}>
                        <RadioButton
                          selected={language.value === selectedLanguage}
                          labelName={language.Text}
                          style={{margin: 20}}
                          Colors={Colors}
                        />
                      </TouchableOpacity>
                    );
                  }}
                </TranslationConsumer>
              );
            })}
          </View>
        </ScrollView>
        {/* </View> */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 20,
            width: '100%',
            position: 'absolute',
            bottom: 0,
          }}>
          {(this.props?.settings && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                bottom: 0,
              }}>
              {/* <TouchableOpacity
								style={{...LanguageSCreenStyles.btnMainContainer, left:0}}
								onPress={() => changeScreen()}>
								<View style={LanguageSCreenStyles.ButtonContianer}>
									<Text style={{ color: 'white' }}>
										Back
									</Text>
								</View>
							</TouchableOpacity> */}
              <TranslationConsumer>
                {({language, updateLanguage}) => {
                  console.log(
                    language,
                    updateLanguage,
                  );
                  return (
                    <TouchableOpacity
                      style={LanguageSCreenStyles.btnMainContainer}
                      onPress={() => {
                        updateLanguage(this.props.selectedLanguage),
                          this.handleNext();
                      }}>
                      <View style={LanguageSCreenStyles.ButtonContianer}>
                        <Text style={{color: 'white'}}>Ok</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              </TranslationConsumer>
            </View>
          )) || (
            <TranslationConsumer>
              {({language, updateLanguage}) => {
                console.log(
                  'hari->TranslationConsumer-->NEXT-->>',
                  language,
                  updateLanguage,
                );
                return (
                  <TouchableOpacity
                    style={LanguageSCreenStyles.btnMainContainer}
                    onPress={() => {
                      updateLanguage(this.props.selectedLanguage);
                      this.handleNext();
                    }}>
                    <View style={LanguageSCreenStyles.ButtonContianer}>
                      <Text style={{color: 'white'}}>Next</Text>
                      <ArrowImage />
                    </View>
                  </TouchableOpacity>
                );
              }}
            </TranslationConsumer>
          )}
        </View>
      </View>
    );
  }
}

ChooseLanguageScreen.prototype = {
  selectedLanguage: PropTypes.string,
  listOFLanguages: PropTypes.array,
  changeScreen: PropTypes.func,
  Colors: PropTypes.string,
};

ChooseLanguageScreen.defaultProps = {
  selectedLanguage: '',
  listOFLanguages: [],
  changeScreen: () => {},
  Colors: '#6f00ff',
};

export default ChooseLanguageScreen;

import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import React, {Component} from 'react';

import {RideNowTripsStyles} from '../../../../Styles/Home/RideNow';
import RadioButton from '../../../../Controllers/CustomComponent/RadioButton';

import {getRedirection} from 'react-native-translation/src/LanguageProvider';
import TranslationFile from '../../../locales/TranslationFile';

export default class RideTypeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.translation = getRedirection(TranslationFile);

  }

  onDropdownChange(type, option) {
    this.props.onDropdownChange(type, option);
  }

  render() {
    return (
      <TouchableOpacity
        style={RideNowTripsStyles.dropdownContainer}
        onPress={() => this.props.onClose()}>
        <View
          style={RideNowTripsStyles.dropdownContent}
          key={`dropdown-container`}>
          <Text style={RideNowTripsStyles.dropdownTitle}>
            {/* Choose a {this.props.title} */}
            {this.translation['choose_ride_type']}
          </Text>

          <ScrollView style={RideNowTripsStyles.dropdownOptions}>
            {this.props.dropdownOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => this.onDropdownChange(this.props.type, option)}>
                <RadioButton
                  selected={option.value == this.props.selectedOption.value}
                  labelName={option.title}
                  style={{margin: 20}}
                  Colors={'#000'}
                  isDisableSelectedBG={true}
                  isInnerCircleDisable={true}
                  isLabelLeft={true}
                  isLabelIcon={option.isIcon}
                  labelIcon={option.icon}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            onPress={() => this.props.onClose()}
            style={{
              padding: 10,
              backgroundColor: 'black',
              borderRadius: 10,
              width: '40%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{fontWeight: 'bold', color: 'white'}}>{this.translation['close']}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }
}

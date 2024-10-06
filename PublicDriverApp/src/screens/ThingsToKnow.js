import {Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  LanguageStyles,
  onBoardingStyles,
  thingstoKnowStyles,
} from '../styles/SplashStyles';
import {ThingsToKnowData} from '../constants/JsonData';
import {colors} from '../constants/constants';
import {useNavigation} from '@react-navigation/native';
import {DataStore} from '../controllers/DataStore';
import Bulb from '../assets/image/svgIcons/bulb.svg';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { showNotification } from '../components/NotificationManager';

const ThingsToKnow = () => {
  const navigation = useNavigation();

  const [accepted, setAccepted] = useState(false);

  const onNextPress = () => {
    if (!accepted) {
      showNotification('Please Accept Terms and Conditions', '', 'danger');
    } else {
      navigation.navigate('LoginScreen');
      DataStore.storeData('termsAccepted', 'termsAcceptedDone');
    }
  };

  return (
    <View style={LanguageStyles.screen}>
      <TouchableOpacity
        style={[onBoardingStyles.backBtn, {position: 'absolute'}]}>
        <Ionicons name="chevron-back" size={20} color={colors.black} />
      </TouchableOpacity>
      <View style={thingstoKnowStyles.header}>
        <Text style={thingstoKnowStyles.headerTxt}>Things To Know</Text>
        <Bulb />
      </View>
      <View
        style={[
          onBoardingStyles.yellowSeperator,
          {alignSelf: 'center'},
        ]}></View>
      <View style={LanguageStyles.langContainer}>
        {ThingsToKnowData.map(item => (
          <View key={item.id} style={[LanguageStyles.welcomeCards]}>
            {item.image}
            <Text style={[LanguageStyles.welcomeDesc]}>{item.desc}</Text>
          </View>
        ))}
      </View>
      <View style={thingstoKnowStyles.termsContainer}>
        <TouchableOpacity onPress={() => setAccepted(!accepted)}>
          <MaterialCommunityIcons
            name={accepted ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={16}
            color={accepted ? colors.yellow : colors.black}
          />
        </TouchableOpacity>
        <Text style={thingstoKnowStyles.termsText}>
          By tapping get started below, you will be agree to Namma Ooru Taxi
            <Text style={thingstoKnowStyles.linkText}> Terms and conditions, </Text>
            <Text style={thingstoKnowStyles.linkText}> Privacy Policy & Disclaimer</Text>
        </Text>
      </View>
      <TouchableOpacity
        style={LanguageStyles.nextBtn}
        onPress={() => onNextPress()}>
        <Text style={LanguageStyles.nextBtnTxt}>Get Started</Text>
        <AntDesign name="arrowright" color={colors.white} size={16} />
      </TouchableOpacity>
    </View>
  );
};

export default ThingsToKnow;

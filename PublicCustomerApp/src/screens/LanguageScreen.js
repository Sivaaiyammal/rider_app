import { Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { LanguageStyles } from '../styles/SplashStyles';
import { languages } from '../constants/JsonData';
import { colors } from '../constants/constants';
import { useNavigation } from '@react-navigation/native';
import { DataStore } from '../controllers/DataStore';

const LanguageScreen = () => {
  const navigation = useNavigation();

  const [selected, setSelected] = useState(languages[1]);

  const changeLanguage = item => {
    setSelected(item);
  };

  const onNextPress = () => {
    navigation.navigate('OnBoarding');
    DataStore.storeData('language', 'languageDone');
  };

  return (
    <View style={LanguageStyles.screen}>
      <Text style={LanguageStyles.title}>Choose {'\n'} Your Language</Text>
      <View style={LanguageStyles.langContainer}>
        {languages.map(item => (
          <TouchableOpacity
            onPress={() => changeLanguage(item)}
            key={item.id}
            style={[
              LanguageStyles.langBtn,
              {
                backgroundColor:
                  selected.id === item.id ? colors.yellow : colors.white,
              },
            ]}>
            <Text style={LanguageStyles.langTxt}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={LanguageStyles.nextBtn}
        onPress={() => onNextPress()}>
        <Text style={LanguageStyles.nextBtnTxt}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageScreen;

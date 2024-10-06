import {Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {LanguageStyles} from '../styles/SplashStyles';
import {languages} from '../constants/JsonData';
import {colors} from '../constants/constants';
import {useNavigation} from '@react-navigation/native';
import {DataStore} from '../controllers/DataStore';
import NavBarA from '../components/TopNavBar/NavBarA';
import Globe from '../assets/image/svgIcons/globe.svg';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AntDesign from 'react-native-vector-icons/AntDesign';

const LanguageScreen = () => {
  const navigation = useNavigation();

  const [selected, setSelected] = useState(languages[1]);

  const changeLanguage = item => {
    setSelected(item);
  };

  const onNextPress = () => {
    navigation.navigate('WelcomeScreen');
    DataStore.storeData('language', 'languageDone');
  };

  return (
    <View style={LanguageStyles.screen}>
      <NavBarA title={'Choose Your'} subtitle={'Language'} image={<Globe />} />
      <View style={LanguageStyles.langContainer}>
        {languages.map(item => (
          <TouchableOpacity
            onPress={() => changeLanguage(item)}
            key={item.id}
            style={[
              LanguageStyles.langBtn,
              {
                borderColor:
                  selected.id === item.id ? colors.yellow : colors.grey_dark,
                backgroundColor:
                  selected.id === item.id ? colors.white : colors.white_dirt,
              },
            ]}>
            <Fontisto
              name={
                selected.id === item.id
                  ? 'radio-btn-active'
                  : 'radio-btn-passive'
              }
              color={selected.id === item.id ? colors.yellow : colors.black}
              size={20}
            />
            <Text style={[LanguageStyles.langTxt,{color:selected.id === item.id ? colors.yellow : colors.black}]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={LanguageStyles.nextBtn}
        onPress={() => onNextPress()}>
        <Text style={LanguageStyles.nextBtnTxt}>Next</Text>
        <AntDesign name="arrowright" color={colors.white} size={16}/>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageScreen;

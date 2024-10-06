import {Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {LanguageStyles} from '../styles/SplashStyles';
import {welcomeData} from '../constants/JsonData';
import {colors} from '../constants/constants';
import {useNavigation} from '@react-navigation/native';
import {DataStore} from '../controllers/DataStore';
import NavBarA from '../components/TopNavBar/NavBarA';
import AntDesign from 'react-native-vector-icons/AntDesign';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const onBackPress = () => {
    navigation.goBack();
  }

  const onNextPress = () => {
    navigation.navigate('OnBoardingScreen');
  };

  return (
    <View style={LanguageStyles.screen}>
      <NavBarA onBackPress={onBackPress} title={'Welcome to'} subtitle={'Namma Ooru Taxi ®'}/>
      <View style={LanguageStyles.langContainer}>
        {welcomeData.map(item => (
          <View
            key={item.id}
            style={[
              LanguageStyles.welcomeCards,
            ]}>
            {item.image}
            <Text style={[LanguageStyles.welcomeDesc]}>{item.desc}</Text>
          </View>
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

export default WelcomeScreen;

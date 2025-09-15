import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import { languages } from '../../constants/JsonData';
import { colors } from '../../constants/constants';
import { useNavigation } from '@react-navigation/native';
import { DataStore } from '../../controllers/DataStore';
import { useTranslation } from 'react-i18next';
  import AdaptiveText from '../../components/Common/AdaptiveText';
import i18n from '../../i18n';
import { GlobalContext } from '../../context/GlobalContext';
import { Fonts } from '../../constants/constants';
import { useStackScreenStore } from '../../store/useStackScreenStore';
import NavBar from '../../components/NavBar';

const LanguageScreen = ({fromDrawer}) => {
  const navigation = useNavigation();
  const {goBack} = useStackScreenStore();
  const { t } = useTranslation();
  const { 
    theme, 
    isDarkMode

  } = useContext(GlobalContext);

  const [selected, setSelected] = useState(languages[0]);

  // Initialize selected language based on current i18n language
  useEffect(() => {
    const currentLanguage = i18n.language;
    const currentLangObj = languages.find(lang => lang.code === currentLanguage);
    if (currentLangObj) {
      setSelected(currentLangObj);
    }
  }, []);

  const changeLanguage = item => {
    setSelected(item);
  };


  const handleLanguageChange = (language) => {
    changeLanguage(language);
    i18n.changeLanguage(language.code);
  };

  const onNextPress = async () => {
    // Save the selected language to AsyncStorage
    await DataStore.storeData('language', selected.code);
    
    if(fromDrawer){
      goBack();
    }
    else{
      navigation.navigate('OnBoarding');
    }
  };

  return (
   
   
    <View style={[styles.screen]}>
      
        <View style={styles.header}> 
      {fromDrawer && <NavBar withBg={true} onBackPress={() => goBack()} title={'Choose Language'} />}       
     { !fromDrawer && <AdaptiveText style={styles.title} color={theme.text} >{t('choose_language')}</AdaptiveText>}
     
      </View>
      <View style={styles.langContainer}>
        {languages.map((item) => (
          <View key={item.id} style={styles.langItemWrapper}>
            <TouchableOpacity
              onPress={() => handleLanguageChange(item)}
              style={[
                styles.langBtn,
                {
                  backgroundColor:
                    selected.id === item.id ? theme.primary_secondary : colors.white,
                },
              ]}>
              <Text style={styles.langTxt}>{item.name}</Text>
              {item.code !== 'en' && <Text style={styles.langSubTxt}>{item.name_en}</Text>}
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.nextBtn]}
        onPress={() => onNextPress()}>
        <Text style={[styles.nextBtnTxt]}>{fromDrawer ? t('done') : t('next')}</Text>
      </TouchableOpacity>
    </View>
    
  );
};

export default LanguageScreen;
const styles = StyleSheet.create({
    screen: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.white,
      paddingHorizontal: 10,
    },
    header: {
      width: '90%',
      alignItems: 'center',
     
      minHeight: 130,
  
    },
    title: {
      fontFamily: Fonts.semi_bold,
      fontSize: 32,
      color: colors.black,
      marginTop: 30,
      textAlign: 'center',
    },
    langContainer: {
      width: '90%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 30,
    },
    langItemWrapper: {
      width: '48%',
      marginBottom: 15,
    },
    langBtn: {
      backgroundColor: colors.white,
      borderRadius: 5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      paddingVertical: 30,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      height:130,
    },
    langTxt: {
      fontFamily: Fonts.semi_bold,
      color: colors.black,
      fontSize: 16,
    },
    langSubTxt: {
      fontFamily: Fonts.regular,
      color: colors.black,
      fontSize: 12,
    },
    nextBtn: {
      position: 'absolute',
      bottom: 20,
      backgroundColor: colors.blue_xxdark,
      width: '80%',
      paddingVertical: 10,
      borderRadius: 30,
      alignItems: 'center',
    },
    nextBtnTxt: {
      fontFamily: Fonts.medium,
      color: colors.white,
      fontSize: 14,
      textTransform: 'uppercase',
    },
  });           

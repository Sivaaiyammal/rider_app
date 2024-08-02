import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";
import en from './en.json';
import ar from './ar.json';

const resources = {
  en: {
    translation: en.translation
  },
  ar: {
    translation: ar.translation
  }
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: I18nManager.isRTL ? "ar" : 'en',
    interpolation: {
      escapeValue: false
    }
  });

  export default i18n;
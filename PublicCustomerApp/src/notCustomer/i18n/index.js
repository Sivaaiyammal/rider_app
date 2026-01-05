import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-react-native-language-detector';
import english from './locales/en.json';
import tamil from './locales/ta.json';
import kannada from './locales/kn.json';
import malayalam from './locales/ml.json';
import telugu from './locales/te.json';
import hindi from './locales/hi.json';

// Create an isolated i18n instance for customer flows
const i18n = i18next.createInstance();

i18n
  .use(LanguageDetector) // auto detect language
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: english },
      ta: { translation: tamil },
      kn: { translation: kannada },
      ml: { translation: malayalam },
      te: { translation: telugu },
      hi: { translation: hindi },
    },
    interpolation: {
      escapeValue: false, // React already does escaping
      prefix: '{',
      suffix: '}',
    },
  });

export default i18n;

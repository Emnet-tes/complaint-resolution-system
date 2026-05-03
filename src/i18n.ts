import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import am from './locales/am.json';
import om from './locales/om.json';


i18n
  .use(LanguageDetector) // Automatically detects user language
  .use(initReactI18next)
  .init({
    lng: 'en',
    resources: {
      en: { translation: en },
      am: { translation: am },
      om: { translation: om }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
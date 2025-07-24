import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import deTranslations from './locales/de.json';
import sqTranslations from './locales/sq.json';

const resources = {
    en: { translation: enTranslations },
    de: { translation: deTranslations },
    sq: { translation: sqTranslations },
};

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',

        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'marbelle-language',
        },

        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;

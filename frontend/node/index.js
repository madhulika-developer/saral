import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import te from './te.json';
import hi from './hi.json';
import ta from './ta.json';
import kn from './kn.json';
import ml from './ml.json';
import mr from './mr.json';
import bn from './bn.json';
import gu from './gu.json';
import pa from './pa.json';
import or from './or.json';
import ur from './ur.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', isRtl: false },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', isRtl: false },
  { code: 'en', name: 'English', englishName: 'English', isRtl: false },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', isRtl: false },
  { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada', isRtl: false },
  { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam', isRtl: false },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi', isRtl: false },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', isRtl: false },
  { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', isRtl: false },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', isRtl: false },
  { code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Odia', isRtl: false },
  { code: 'ur', name: 'اردو', englishName: 'Urdu', isRtl: true },
];

const resources = {
  en: { translation: en },
  te: { translation: te },
  hi: { translation: hi },
  ta: { translation: ta },
  kn: { translation: kn },
  ml: { translation: ml },
  mr: { translation: mr },
  bn: { translation: bn },
  gu: { translation: gu },
  pa: { translation: pa },
  or: { translation: or },
  ur: { translation: ur },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Handle RTL direction and HTML lang attribute
export const updateDocumentDirection = (langCode) => {
  const isRtl = langCode === 'ur' || langCode === 'ar';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = langCode;
};

// Listen for language changes to update RTL
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

// Initial direction setup
updateDocumentDirection(i18n.language || 'en');

export default i18n;

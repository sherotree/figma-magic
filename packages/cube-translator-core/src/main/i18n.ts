import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from '../lang/en';
import { ja } from '../lang/ja';
import { zh } from '../lang/zh';

export const initI18next = () => {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ja: { translation: ja },
      zh: { translation: zh },
    },
    lng: 'en', // TODO:
    debug: false,
    nsSeparator: false,
    keySeparator: false,
    ignoreJSONStructure: false,
    interpolation: {
      escapeValue: false,
    },
  });
};

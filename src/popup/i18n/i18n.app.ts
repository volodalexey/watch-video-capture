import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import trEn from './en/translation.en.json';
import { loadLocalStorageLng } from './i18n.utils';
import trRu from './ru/translation.ru.json';

export function initI18n() {
  i18next.use(initReactI18next).init({
    lng: loadLocalStorageLng(),
    resources: {
      en: {
        tr: trEn,
      },
      ru: {
        tr: trRu,
      },
    },
  });
}

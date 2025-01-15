import { DefaultLng, LsI18NextLng } from './i18n.constants';
import { I18NextLanguage } from './i18n.types';

export function isI18NextLng(lng: unknown): lng is I18NextLanguage {
  return (
    typeof lng === 'string' &&
    (lng === I18NextLanguage.en || lng === I18NextLanguage.ru)
  );
}

export function loadLocalStorageLng(): I18NextLanguage {
  const lsI18NextLngRaw = localStorage.getItem(LsI18NextLng);
  if (isI18NextLng(lsI18NextLngRaw)) {
    return lsI18NextLngRaw;
  }
  return DefaultLng;
}

export function saveLocalStorageLng(lng: I18NextLanguage) {
  localStorage.setItem(LsI18NextLng, lng);
}

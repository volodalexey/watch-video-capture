import tr from './en/translation.en.json';

const resources = {
  tr,
} as const;

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof resources;
  }
}

export enum I18NextLanguage {
  en = 'en',
  ru = 'ru',
}

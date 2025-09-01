export type Messages = Record<string, string>;

const en: Messages = {
  app_title: 'DBT Diary Card',
  dashboard: 'Dashboard',
  diary: 'Diary',
  history: 'History',
  export: 'Export',
};

const locales: Record<string, Messages> = { en };

let current = 'en';

export function setLocale(locale: string) {
  if (locales[locale]) current = locale;
}

export function t(key: string, fallback?: string) {
  const dict = (locales[current] ?? locales['en']) as Messages;
  return dict[key] ?? fallback ?? key;
}

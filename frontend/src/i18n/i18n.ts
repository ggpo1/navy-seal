import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ru from './locales/ru.json'
import zh from './locales/zh.json'

const LANG_STORAGE_KEY = 'navy-seal-lang'
const SUPPORTED_LNGS = ['ru', 'en', 'zh'] as const
type SupportedLng = (typeof SUPPORTED_LNGS)[number]

function detectInitialLanguage(): SupportedLng {
  if (typeof window === 'undefined') return 'en'

  const saved = window.localStorage.getItem(LANG_STORAGE_KEY)
  if (saved === 'ru' || saved === 'en' || saved === 'zh') return saved

  const nav = (window.navigator.language ?? '').toLowerCase()
  if (nav.startsWith('ru')) return 'ru'
  if (nav.startsWith('zh')) return 'zh'
  return 'en'
}

export function setLanguage(lng: SupportedLng) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LANG_STORAGE_KEY, lng)
  }
  return i18n.changeLanguage(lng)
}

const initialLng = detectInitialLanguage()

i18n.use(initReactI18next).init({
  lng: initialLng,
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    zh: { translation: zh },
  },
  interpolation: {
    escapeValue: false,
  },
})

export default i18n


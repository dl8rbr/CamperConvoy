'use client'

import { useTranslation } from 'react-i18next'
import { changeLanguage } from '@/lib/i18n'

/**
 * LanguageSwitcher Komponente
 * 
 * Ermöglicht die manuelle Umschaltung zwischen Deutsch und Englisch.
 * Die Sprachänderung erfolgt ohne Seiten-Neuladen via i18n.changeLanguage().
 */

const languages = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
] as const

type LanguageCode = typeof languages[number]['code']

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  
  const currentLanguage = i18n.language || 'de'

  const handleLanguageChange = (lng: LanguageCode) => {
    // Sprache wechseln ohne Seiten-Neuladen
    changeLanguage(lng)
  }

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          title={`${t('language.switchTo')} ${lang.label}`}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            transition-all duration-200
            ${currentLanguage === lang.code
              ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-medium'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
            }
          `}
          aria-label={`${t('language.switchTo')} ${lang.label}`}
          aria-pressed={currentLanguage === lang.code}
        >
          <span className="text-base">{lang.flag}</span>
          <span className="text-sm hidden sm:inline">{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  )
}

// Kompakte Version für Mobile
export function LanguageSwitcherCompact() {
  const { i18n } = useTranslation()
  
  const currentLanguage = i18n.language || 'de'
  const otherLanguage = currentLanguage === 'de' ? 'en' : 'de'
  const otherLangData = languages.find(l => l.code === otherLanguage)!

  return (
    <button
      onClick={() => changeLanguage(otherLanguage)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <span>{otherLangData.flag}</span>
      <span className="text-sm">{otherLangData.label}</span>
    </button>
  )
}



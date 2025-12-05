/**
 * i18next Konfiguration für CamperConvoy
 * 
 * Zwei Ansätze für Mehrsprachigkeit in Next.js:
 * 
 * 1. Client-seitiger Ansatz (verwendet hier):
 *    - i18next mit react-i18next
 *    - Übersetzungen in JSON-Dateien unter public/locales/
 *    - Sprachumschaltung via i18n.changeLanguage() ohne Seiten-Neuladen
 *    - Vorteil: Einfach zu implementieren, keine Änderung der URL
 * 
 * 2. Next.js i18n-Routing Ansatz (Alternative):
 *    - Verzeichnisstruktur: /app/[lang]/page.tsx
 *    - URL ändert sich: /de/convoys vs /en/convoys
 *    - Vorteil: SEO-freundlich, SSR-kompatibel
 *    - Nachteil: Komplexere Struktur, URL-Änderung
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Übersetzungen inline für schnelles Laden
// (In Produktion könnten diese auch dynamisch geladen werden)
import deTranslations from '../../public/locales/de.json'
import enTranslations from '../../public/locales/en.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: deTranslations },
      en: { translation: enTranslations },
    },
    fallbackLng: 'de',
    lng: 'de', // Standard-Sprache
    
    interpolation: {
      escapeValue: false, // React escaped bereits
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'camper-convoy-language',
    },
    
    react: {
      useSuspense: false, // Für Client Components
    },
  })

export default i18n

// Helper für programmatische Sprachänderung
export const changeLanguage = (lng: 'de' | 'en') => {
  i18n.changeLanguage(lng)
  localStorage.setItem('camper-convoy-language', lng)
}

// Aktuelle Sprache abrufen
export const getCurrentLanguage = () => i18n.language || 'de'



import { useState, useEffect } from 'react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
]

export function LanguageSelector() {
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [i18nAvailable, setI18nAvailable] = useState(false)

  useEffect(() => {
    // Try to load i18n dynamically
    import('react-i18next')
      .then((module) => {
        setI18nAvailable(true)
        // If i18n is available, we could use it here
        // For now, just mark it as available
      })
      .catch(() => {
        // i18n not available, use local state
        setI18nAvailable(false)
        const saved = localStorage.getItem('i18nextLng') || 'en'
        setCurrentLanguage(saved)
      })
  }, [])

  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang)
    localStorage.setItem('i18nextLng', lang)
    
    // Try to update i18n if available
    if (i18nAvailable) {
      import('react-i18next')
        .then((module) => {
          // i18n would be initialized by now if available
        })
        .catch(() => {
          // Ignore
        })
    }
  }

  return (
    <div className="relative">
      <select
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  )
}

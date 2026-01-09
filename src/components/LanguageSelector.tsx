const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
]

export function LanguageSelector() {
  // Try to use i18n if available, otherwise default to English
  let currentLanguage = 'en'
  try {
    // @ts-ignore - react-i18next types may not be available
    const { useTranslation } = require('react-i18next')
    const { i18n } = useTranslation()
    currentLanguage = i18n.language || 'en'
  } catch {
    // i18n not available, use default
    currentLanguage = 'en'
  }

  return (
    <div className="relative">
      <select
        value={currentLanguage}
        onChange={(e) => {
          try {
            // @ts-ignore
            const { useTranslation } = require('react-i18next')
            const { i18n } = useTranslation()
            i18n.changeLanguage(e.target.value)
          } catch {
            // i18n not available, ignore
          }
        }}
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

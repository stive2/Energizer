import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

export const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'en',
  globalInjection: true,
  messages,
})

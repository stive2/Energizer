import { defineBoot } from '#q-app/wrappers'
import { i18n } from 'src/i18n/instance.js'

export default defineBoot(({ app }) => {
  app.use(i18n)
})

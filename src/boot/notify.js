import { defineBoot } from '#q-app/wrappers'
import { Notify } from 'quasar'

/**
 * Toutes les notifications : en haut, au-dessus des dialogues, bien visibles.
 */
export default defineBoot(() => {
  const create = Notify.create.bind(Notify)

  Notify.create = (opts) => {
    const options = typeof opts === 'string' ? { message: opts } : { ...opts }

    return create({
      timeout: 7500,
      progress: true,
      multiLine: true,
      classes: 'app-notify',
      ...options,
      position: 'top',
    })
  }

  Notify.setDefaults({
    timeout: 7500,
    progress: true,
    multiLine: true,
    position: 'top',
    classes: 'app-notify',
  })
})

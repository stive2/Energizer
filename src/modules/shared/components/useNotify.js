import { useQuasar } from 'quasar'
import { stripHtml } from 'src/modules/immatriculations/api/immatAssureResponse.js'

/** Durée par défaut des toasts en haut d’écran (ms). */
export const NOTIFY_DEFAULT_TIMEOUT = 7500

/** Soumission télé-immat + affichage de l’état de contrôle (ms). */
export const NOTIFY_CONTROLE_TIMEOUT = 15000

/** État de contrôle généré : message long, fermeture manuelle. */
export const NOTIFY_CONTROLE_MESSAGE_TIMEOUT = 0

/**
 * @param {import('quasar').QNotifyCreateOptions} [opts]
 */
function baseNotifyOptions(opts = {}) {
  return {
    position: 'top',
    progress: true,
    multiLine: true,
    timeout: NOTIFY_DEFAULT_TIMEOUT,
    ...opts,
  }
}

export const useNotify = () => {
  const $q = useQuasar()

  /**
   * @param {string} message
   * @param {import('quasar').QNotifyCreateOptions} [opts]
   */
  const notifySuccess = (message, opts = {}) => {
    $q.notify({
      ...baseNotifyOptions(opts),
      type: 'positive',
      message,
      icon: 'check_circle',
    })
  }

  /**
   * @param {string} message
   * @param {import('quasar').QNotifyCreateOptions} [opts]
   */
  const notifyError = (message, opts = {}) => {
    $q.notify({
      ...baseNotifyOptions(opts),
      type: 'negative',
      message,
      icon: 'error',
    })
  }

  /**
   * @param {string} message
   * @param {import('quasar').QNotifyCreateOptions} [opts]
   */
  const notifyInfo = (message, opts = {}) => {
    $q.notify({
      ...baseNotifyOptions(opts),
      type: 'info',
      message,
      icon: 'info',
    })
  }

  /**
   * @param {string} message
   * @param {import('quasar').QNotifyCreateOptions} [opts]
   */
  const notifyWarning = (message, opts = {}) => {
    $q.notify({
      ...baseNotifyOptions(opts),
      type: 'warning',
      message,
      icon: 'warning',
    })
  }

  /**
   * Notification après génération de l’état de contrôle (message serveur long + URL).
   * @param {string} message
   * @param {import('quasar').QNotifyCreateOptions} [opts]
   */
  const notifyControleGenerated = (message, opts = {}) => {
    let text = stripHtml(message || '').trim()
    if (text) {
      text = text.split(/CLIQUER SUR LE LIEN/i)[0]?.trim() || text
    }
    $q.notify({
      ...baseNotifyOptions({
        timeout: NOTIFY_CONTROLE_MESSAGE_TIMEOUT,
        classes: 'app-notify app-notify-controle',
        actions: [{ label: 'OK', color: 'white', handler: () => {} }],
        ...opts,
      }),
      type: 'positive',
      message: text || 'État de contrôle généré.',
      icon: 'assignment_turned_in',
    })
  }

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    notifyControleGenerated,
    NOTIFY_DEFAULT_TIMEOUT,
    NOTIFY_CONTROLE_TIMEOUT,
    NOTIFY_CONTROLE_MESSAGE_TIMEOUT,
  }
}

import { useQuasar } from 'quasar'

/** Durée par défaut des toasts en haut d’écran (ms). */
export const NOTIFY_DEFAULT_TIMEOUT = 7500

/** Soumission télé-immat + affichage de l’état de contrôle (ms). */
export const NOTIFY_CONTROLE_TIMEOUT = 15000

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

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    NOTIFY_DEFAULT_TIMEOUT,
    NOTIFY_CONTROLE_TIMEOUT,
  }
}

import { Notify } from 'quasar'

const DEFAULT_TIMEOUT = 7500
const NOTIFY_POSITION = 'top'

/**
 * @param {import('quasar').QNotifyCreateOptions} options
 */
export function notify(options = {}) {
  const type = options.type ?? 'info'

  return Notify.create({
    timeout: DEFAULT_TIMEOUT,
    progress: true,
    multiLine: options.multiLine ?? true,
    ...options,
    type,
    position: NOTIFY_POSITION,
    classes: ['app-notify', options.classes].filter(Boolean).join(' '),
  })
}

export function notifyPositive(message, opts = {}) {
  return notify({ type: 'positive', message, ...opts })
}

export function notifyNegative(message, opts = {}) {
  return notify({ type: 'negative', message, ...opts })
}

export function notifyWarning(message, opts = {}) {
  return notify({ type: 'warning', message, ...opts })
}

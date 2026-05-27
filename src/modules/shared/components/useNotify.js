import { useQuasar } from 'quasar'

export const useNotify = () => {
  const $q = useQuasar()

  const notifySuccess = (message) => {
    $q.notify({
      type: 'positive',
      message,
      icon: 'check_circle',
      position: 'top',
    })
  }

  const notifyError = (message) => {
    $q.notify({
      type: 'negative',
      message,
      icon: 'error',
      position: 'top',
    })
  }

  const notifyInfo = (message) => {
    $q.notify({
      type: 'info',
      message,
      icon: 'info',
      position: 'top',
    })
  }

  const notifyWarning = (message) => {
    $q.notify({
      type: 'warning',
      message,
      icon: 'warning',
      position: 'top',
    })
  }

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
  }
}

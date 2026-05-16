import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

/**
 * @param {object} options
 * @param {string} [options.displayNameKey] - sessionStorage key for display name
 * @param {string} [options.profileKey] - sessionStorage key for profile
 * @param {string} [options.profileExpected] - required profile value
 * @param {{ name: string }} options.loginRoute - redirect if not authenticated
 * @param {string[]} [options.clearSessionKeys]
 * @param {string[]} [options.clearLocalKeys]
 * @param {{ name: string }} options.logoutRoute
 */
export function useAuthenticatedSession(options) {
  const router = useRouter()
  const $q = useQuasar()
  const { t } = useI18n()

  const displayName = ref('')

  function readDisplayName() {
    if (options.displayNameKey && typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(options.displayNameKey) || ''
    }
    if (options.localUserInfoKey && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(options.localUserInfoKey)
        if (raw) {
          const u = JSON.parse(raw)
          return u.nom || u.name || u.email || ''
        }
      } catch {
        /* ignore */
      }
    }
    return ''
  }

  function isAuthenticated() {
    if (options.sessionAuthKey && typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(options.sessionAuthKey) === '1'
    }
    if (options.profileKey && options.profileExpected && typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(options.profileKey) === options.profileExpected
    }
    if (options.localTokenKey && typeof localStorage !== 'undefined') {
      return !!localStorage.getItem(options.localTokenKey)
    }
    return true
  }

  onMounted(() => {
    if (!isAuthenticated()) {
      router.replace(options.loginRoute)
      return
    }
    displayName.value = readDisplayName()
  })

  const userInitials = computed(() => {
    const name = displayName.value.trim()
    if (!name) return '?'
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  })

  function clearStorage() {
    if (options.clearSessionKeys?.length && typeof sessionStorage !== 'undefined') {
      options.clearSessionKeys.forEach((k) => sessionStorage.removeItem(k))
    }
    if (options.clearLocalKeys?.length && typeof localStorage !== 'undefined') {
      options.clearLocalKeys.forEach((k) => localStorage.removeItem(k))
    }
  }

  function logout() {
    $q.dialog({
      title: t('layout.logoutConfirmTitle'),
      message: t('layout.logoutConfirmMessage'),
      cancel: true,
      persistent: true,
    }).onOk(() => {
      clearStorage()
      displayName.value = ''
      $q.notify({
        type: 'positive',
        message: t('layout.logoutSuccess'),
        position: 'top',
      })
      router.push(options.logoutRoute)
    })
  }

  return {
    displayName,
    userInitials,
    logout,
  }
}

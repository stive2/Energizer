import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import {
  isAgentSessionActive,
  isInsuredSessionActive,
} from 'src/modules/shared/utils/portalSimAuthSession.js'
import {
  computeUserInitials,
  formatUserDisplayName,
  splitFullName,
} from 'src/modules/shared/utils/userDisplay.js'

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
  const userProfile = ref(null)

  function readUserInfoRaw() {
    const key = options.localUserInfoKey || 'user_info'
    if (typeof localStorage === 'undefined') return null
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  function readDisplayName() {
    if (options.displayNameKey && typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(options.displayNameKey) || ''
    }
    if (options.localUserInfoKey && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(options.localUserInfoKey)
        if (raw) {
          const u = JSON.parse(raw)
          return u.displayName || u.nom || u.name || u.email || ''
        }
      } catch {
        /* ignore */
      }
    }
    return ''
  }

  function isAuthenticated() {
    if (options.profileExpected === 'external') {
      return isInsuredSessionActive()
    }
    if (options.profileExpected === 'internal') {
      return isAgentSessionActive()
    }
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

  function refreshUserProfile() {
    userProfile.value = readUserInfoRaw()
    const name = formatUserDisplayName(userProfile.value, readDisplayName())
    if (name) displayName.value = name
  }

  function persistUserProfile(updates) {
    const current = { ...(readUserInfoRaw() || {}), ...updates }
    if (updates.nom && !updates.prenom && String(updates.nom).includes(' ')) {
      const split = splitFullName(updates.nom)
      if (split.prenom) {
        current.prenom = split.prenom
        current.nom = split.nom
      }
    }
    const key = options.localUserInfoKey || 'user_info'
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(current))
    }
    const label = formatUserDisplayName(current)
    if (label && options.displayNameKey && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(options.displayNameKey, label)
    }
    refreshUserProfile()
    return current
  }

  function readSimPassword() {
    if (options.simPasswordKey && typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem(options.simPasswordKey)
      if (stored) return stored
    }
    return options.defaultSimPassword || ''
  }

  function changeSimPassword(currentPassword, newPassword) {
    const expected = readSimPassword()
    if (expected && currentPassword !== expected) {
      return { ok: false, error: 'current_invalid' }
    }
    if (!newPassword || newPassword.length < 8) {
      return { ok: false, error: 'too_short' }
    }
    if (options.simPasswordKey && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(options.simPasswordKey, newPassword)
    }
    return { ok: true }
  }

  onMounted(() => {
    if (!isAuthenticated()) {
      router.replace(options.loginRoute)
      return
    }
    refreshUserProfile()
    if (!displayName.value) {
      displayName.value = readDisplayName()
    }
  })

  const userInitials = computed(() =>
    computeUserInitials(userProfile.value, displayName.value),
  )

  function clearStorage() {
    if (options.clearSessionKeys?.length && typeof sessionStorage !== 'undefined') {
      options.clearSessionKeys.forEach((k) => sessionStorage.removeItem(k))
    }
    if (options.simPasswordKey && typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(options.simPasswordKey)
    }
    if (options.clearLocalKeys?.length && typeof localStorage !== 'undefined') {
      options.clearLocalKeys.forEach((k) => localStorage.removeItem(k))
    }
  }

  async function performLogout() {
    if (options.logoutVariant) {
      try {
        const { useAuthStore } = await import('src/modules/shared/stores/authStore.js')
        await useAuthStore().logout({ variant: options.logoutVariant })
      } catch {
        clearStorage()
      }
    } else {
      clearStorage()
    }
    displayName.value = ''
    $q.notify({
      type: 'positive',
      message: t('layout.logoutSuccess'),
      position: 'top',
    })
    router.push(options.logoutRoute)
  }

  return {
    displayName,
    userInitials,
    userProfile,
    refreshUserProfile,
    persistUserProfile,
    changeSimPassword,
    readSimPassword,
    performLogout,
  }
}

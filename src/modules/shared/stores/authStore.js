/**
 * Store Pinia — Authentification portail CNPS.
 *
 * Encapsule la connexion, la déconnexion et la procédure de mot de passe oublié
 * pour les deux variantes du composant `PortalSimLogin` (agent / assuré).
 *
 * Persistance simple via `localStorage` (clés alignées sur l'existant) afin de
 * survivre à un rafraîchissement de page.
 */
import { defineStore, acceptHMRUpdate } from 'pinia'
import {
  login as apiLogin,
  forgotPassword as apiForgotPassword,
  logout as apiLogout,
  AuthError,
} from 'src/modules/shared/api/auth/authApi.js'
import { persistAgentSession, persistInsuredSession, clearPortalSimSession } from 'src/modules/shared/utils/portalSimAuthSession.js'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_info'

function safeReadUser() {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function safeReadToken() {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: safeReadUser(),
    token: safeReadToken(),
    loading: false,
    forgotLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    displayName: (state) => state.user?.displayName || state.user?.login || '',
    profile: (state) => state.user?.profile || null,
  },

  actions: {
    /**
     * Lance l'authentification.
     * @param {{ variant: 'agent'|'insured', login: string, password: string }} payload
     */
    async login(payload) {
      this.loading = true
      this.error = null
      try {
        const result = await apiLogin(payload)
        this.token = result.token
        this.user = result.user

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, result.token)
          localStorage.setItem(USER_KEY, JSON.stringify(result.user))
        }

        if (payload.variant === 'agent' && (result.pagePrincipaleHtml || result.pagePrincipale)) {
          persistAgentSession({
            login: result.user?.login,
            displayName: result.user?.displayName,
            prenom: result.user?.prenom,
            nom: result.user?.nom,
            profile: result.user?.profile || 'internal',
            token: result.token,
            lib_centre: result.user?.lib_centre,
            code_centre: result.user?.code_centre,
          })

          const { useEnergizerSessionStore } = await import(
            'src/modules/energizer/stores/energizerSessionStore.js'
          )
          const energizerSession = useEnergizerSessionStore()
          if (result.pagePrincipaleHtml) {
            energizerSession.applyFromHtml(result.pagePrincipaleHtml, result.user?.login)
          } else {
            energizerSession.applyParsed(result.pagePrincipale, result.user?.login)
          }
        }

        if (payload.variant === 'insured') {
          const insuredUser = {
            ...result.user,
            profile: 'external',
            num_assu: result.user?.num_assu || payload.login,
            login: result.user?.login || result.user?.num_assu || payload.login,
          }
          this.user = insuredUser
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(USER_KEY, JSON.stringify(insuredUser))
          }
          persistInsuredSession({
            login: insuredUser.login,
            num_assu: insuredUser.num_assu,
            displayName: insuredUser.displayName,
            token: result.token,
            user: insuredUser,
          })
        }

        return result
      } catch (err) {
        const message =
          err instanceof AuthError
            ? err.message
            : err?.response?.data?.message || err?.message || 'Échec de connexion.'
        this.error = message
        throw err instanceof AuthError ? err : new AuthError(message)
      } finally {
        this.loading = false
      }
    },

    /**
     * Demande la réinitialisation du mot de passe.
     * @param {{ login: string, variant?: 'agent'|'insured' }} payload
     */
    async requestPasswordReset(payload) {
      this.forgotLoading = true
      try {
        return await apiForgotPassword(payload)
      } finally {
        this.forgotLoading = false
      }
    },

    async logout(options = {}) {
      const variant =
        options.variant ||
        (this.user?.profile === 'external' ? 'insured' : 'agent')
      try {
        await apiLogout({ variant })
      } catch {
        /* ignore — déconnexion locale prioritaire */
      }
      try {
        const { useEnergizerSessionStore } = await import(
          'src/modules/energizer/stores/energizerSessionStore.js'
        )
        useEnergizerSessionStore().clear()
      } catch {
        /* module energizer optionnel */
      }
      this.token = null
      this.user = null
      this.error = null
      clearPortalSimSession()
    },

    /** Recharge la session depuis le stockage local (utile au boot). */
    restoreSession() {
      this.token = safeReadToken()
      this.user = safeReadUser()
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}

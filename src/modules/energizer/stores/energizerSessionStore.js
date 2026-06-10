import { defineStore } from 'pinia'
import {
  parseEnergizerPagePrincipale,
  isEnergizerPagePrincipaleHtml,
} from 'src/modules/energizer/adapters/parseEnergizerPagePrincipale.js'
import {
  readAgentLogin,
  syncAuthUserFromEnergizer,
} from 'src/modules/energizer/utils/syncAuthUserFromEnergizer.js'

const STORAGE_KEY = 'energizer_page_principale'

function readStored() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStored(payload) {
  if (typeof sessionStorage === 'undefined') return
  if (!payload) {
    sessionStorage.removeItem(STORAGE_KEY)
    return
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export const useEnergizerSessionStore = defineStore('energizer-session', {
  state: () => ({
    pagePrincipale: readStored(),
  }),

  getters: {
    userContext: (state) => state.pagePrincipale?.user || {},
    toolbarLinks: (state) => state.pagePrincipale?.toolbarLinks || [],
    legacyMenuGroups: (state) => state.pagePrincipale?.sidebarMenu || [],
    roleBannerLinks: (state) => state.pagePrincipale?.roleBannerLinks || [],
    hasLegacyMenu: (state) => (state.pagePrincipale?.sidebarMenu || []).length > 0,
    sessionLogin: (state) => state.pagePrincipale?.login || '',
  },

  actions: {
    applyParsed(parsed, login = '') {
      const agentLogin = String(login || readAgentLogin() || '').trim()
      const previous = this.pagePrincipale
      const sameAgent =
        !agentLogin ||
        !previous?.login ||
        String(previous.login).trim() === agentLogin
      const keepPreviousMenu =
        sameAgent &&
        !(parsed?.sidebarMenu?.length) &&
        (previous?.sidebarMenu?.length ?? 0) > 0

      const payload = {
        ...parsed,
        sidebarMenu: keepPreviousMenu ? previous.sidebarMenu : parsed?.sidebarMenu || [],
        login: agentLogin,
      }
      this.pagePrincipale = payload
      writeStored(payload)
      syncAuthUserFromEnergizer(parsed?.user, agentLogin)
      return payload
    },

    applyFromHtml(html, login = '') {
      if (!isEnergizerPagePrincipaleHtml(html)) {
        return null
      }
      const parsed = parseEnergizerPagePrincipale(html)
      return this.applyParsed(parsed, login)
    },

    hydrateFromStorage(expectedLogin = '') {
      const stored = readStored()
      const login = String(expectedLogin || readAgentLogin() || '').trim()

      if (stored?.login && login && stored.login !== login) {
        this.clear()
        return
      }

      if (!stored) {
        this.pagePrincipale = null
        return
      }

      this.pagePrincipale = stored

      if (stored.user && login) {
        syncAuthUserFromEnergizer(stored.user, login)
      }
    },

    clear() {
      this.pagePrincipale = null
      writeStored(null)
    },
  },
})

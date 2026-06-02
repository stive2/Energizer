import { defineStore } from 'pinia'
import {
  parseEnergizerPagePrincipale,
  isEnergizerPagePrincipaleHtml,
} from 'src/modules/energizer/adapters/parseEnergizerPagePrincipale.js'

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
  },

  actions: {
    applyFromHtml(html) {
      if (!isEnergizerPagePrincipaleHtml(html)) {
        return null
      }
      const parsed = parseEnergizerPagePrincipale(html)
      this.pagePrincipale = parsed
      writeStored(parsed)
      return parsed
    },

    hydrateFromStorage() {
      this.pagePrincipale = readStored()
    },

    clear() {
      this.pagePrincipale = null
      writeStored(null)
    },
  },
})

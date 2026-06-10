import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useEnergizerSessionStore } from 'src/modules/energizer/stores/energizerSessionStore.js'
import { getEnergizerBaseUrl } from 'src/modules/shared/config/energizerHttp.js'
import { mapLegacyMenuGroupsToSidebar } from 'src/modules/energizer/utils/mapLegacyEnergizerMenu.js'
import { partitionEnergizerToolbarLinks } from 'src/modules/energizer/utils/partitionEnergizerToolbarLinks.js'
import { buildDossiersSidebarSection } from 'src/modules/energizer/utils/buildDossiersSidebarSection.js'
import { readAgentLogin } from 'src/modules/energizer/utils/syncAuthUserFromEnergizer.js'
import { isAgentSessionActive } from 'src/modules/shared/utils/portalSimAuthSession.js'

function resolveLegacyHref(href) {
  const path = String(href || '').trim()
  if (!path || path.startsWith('http')) return path
  const base = getEnergizerBaseUrl().replace(/\/+$/, '')
  return `${base}/${path.replace(/^\/+/, '')}`
}

function isSessionForCurrentUser(pagePrincipale) {
  if (!pagePrincipale) return false
  if (!isAgentSessionActive()) return false

  const hasMenu = (pagePrincipale.sidebarMenu?.length ?? 0) > 0
  if (!hasMenu) return false

  const login = readAgentLogin()
  const sessionLogin = String(pagePrincipale.login || '').trim()

  if (!login || !sessionLogin) return true

  return sessionLogin === login
}

export function useEnergizerSidebarMenu() {
  const sessionStore = useEnergizerSessionStore()
  const { pagePrincipale } = storeToRefs(sessionStore)

  const sessionReady = computed(() => isSessionForCurrentUser(pagePrincipale.value))

  const partitionedToolbar = computed(() => {
    if (!sessionReady.value || !pagePrincipale.value) {
      return partitionEnergizerToolbarLinks([])
    }
    return partitionEnergizerToolbarLinks(pagePrincipale.value.toolbarLinks || [])
  })

  const menuItems = computed(() => {
    if (!sessionReady.value) return []

    const groups = pagePrincipale.value?.sidebarMenu || []
    if (!groups.length) return []

    return mapLegacyMenuGroupsToSidebar(groups)
  })

  const dossiersMenuItems = computed(() => {
    if (!sessionReady.value) return []
    return buildDossiersSidebarSection(partitionedToolbar.value.dossiersItems, resolveLegacyHref)
  })

  return { menuItems, dossiersMenuItems, sessionStore, sessionReady }
}

export function useEnergizerToolbarContext() {
  const sessionStore = useEnergizerSessionStore()
  const { pagePrincipale } = storeToRefs(sessionStore)

  const sessionReady = computed(() => isSessionForCurrentUser(pagePrincipale.value))

  const partitionedToolbar = computed(() => {
    if (!sessionReady.value || !pagePrincipale.value) {
      return partitionEnergizerToolbarLinks([])
    }
    return partitionEnergizerToolbarLinks(pagePrincipale.value.toolbarLinks || [])
  })

  const centreLabel = computed(() => {
    if (!sessionReady.value) return ''
    const user = pagePrincipale.value?.user || {}
    const fromUser = user.lib_centre || user.agence || ''
    return fromUser || partitionedToolbar.value.centreLabel || ''
  })

  const toolbarLinks = computed(() => {
    if (!sessionReady.value) return []
    return partitionedToolbar.value.toolbarQuickLinks.map((link) => ({
      ...link,
      href: resolveLegacyHref(link.href),
    }))
  })

  const loginHistoryLink = computed(() => {
    if (!sessionReady.value) return null
    const history = partitionedToolbar.value.loginHistory
    if (!history) return null

    return {
      label: history.label,
      href: resolveLegacyHref(history.href),
    }
  })

  return { centreLabel, toolbarLinks, loginHistoryLink, sessionStore, sessionReady }
}

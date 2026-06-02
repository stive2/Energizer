import { computed } from 'vue'
import { energizerMenu } from 'src/modules/energizer/config/energizerMenu.js'
import { useEnergizerSessionStore } from 'src/modules/energizer/stores/energizerSessionStore.js'
import { getEnergizerBaseUrl } from 'src/modules/shared/config/energizerHttp.js'

function resolveLegacyHref(href) {
  const path = String(href || '').trim()
  if (!path || path.startsWith('http')) return path
  const base = getEnergizerBaseUrl().replace(/\/+$/, '')
  return `${base}/${path.replace(/^\/+/, '')}`
}

export function useEnergizerSidebarMenu() {
  const sessionStore = useEnergizerSessionStore()

  const menuItems = computed(() => energizerMenu)

  return { menuItems, sessionStore }
}

export function useEnergizerToolbarContext() {
  const sessionStore = useEnergizerSessionStore()

  const centreLabel = computed(() => sessionStore.userContext.lib_centre || '')
  const toolbarLinks = computed(() =>
    sessionStore.toolbarLinks.map((link) => ({
      ...link,
      href: resolveLegacyHref(link.href),
    })),
  )

  return { centreLabel, toolbarLinks, sessionStore }
}

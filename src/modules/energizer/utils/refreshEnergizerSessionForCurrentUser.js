import { refreshEnergizerPagePrincipale } from 'src/modules/shared/api/auth/energizerAuthApi.js'
import { useEnergizerSessionStore } from 'src/modules/energizer/stores/energizerSessionStore.js'
import { isAgentSessionActive } from 'src/modules/shared/utils/portalSimAuthSession.js'
import { readAgentLogin } from 'src/modules/energizer/utils/syncAuthUserFromEnergizer.js'

/**
 * Recharge pagePrincipale.jsp pour l'agent actuellement authentifié (liens, badges, centre).
 */
export async function refreshEnergizerSessionForCurrentUser() {
  if (!isAgentSessionActive()) return null

  const login = readAgentLogin()
  const store = useEnergizerSessionStore()

  try {
    const { html, parsed } = await refreshEnergizerPagePrincipale()
    const applied = store.applyFromHtml(html, login)
    if (applied) return applied
    if (parsed) return store.applyParsed(parsed, login)
    return store.pagePrincipale
  } catch {
    store.hydrateFromStorage(login)
    return store.pagePrincipale
  }
}

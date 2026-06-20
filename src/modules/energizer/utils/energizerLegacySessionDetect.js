/**
 * Détection session / page login EnergizerDev — évite les faux positifs
 * (ex. lien « index.html » ou « login » dans une JSP PF authentifiée).
 */

/**
 * @param {string} html
 * @returns {boolean}
 */
export function isEnergizerLegacyModulePageHtml(html) {
  const raw = String(html ?? '')
  if (!raw.trim()) return false

  return (
    /javascript:loading\(/i.test(raw)
    || /<table[^>]*id=["']entetebull2/i.test(raw)
    || /id=["']sidebar1["']/i.test(raw)
    || /Bonjour\s+/i.test(raw)
    || /name=["']cbxcritere["']/i.test(raw)
    || /name=["']txtsaisienumassu["']/i.test(raw)
    || /name=["']fdatepmd["']/i.test(raw)
    || /gestionpiecemaintient/i.test(raw)
    || /gestiondesreprises/i.test(raw)
    || /periodeactivite/i.test(raw)
    || /elementsliquidationpf/i.test(raw)
    || /statsituationsdossiersparbranche/i.test(raw)
    || /addpieceRecep/i.test(raw)
    || /addpiece\.jsp/i.test(raw)
    || /name=["']person\d/i.test(raw)
    || /Liste des Pi[eèè]ces Jointes/i.test(raw)
    || /showAjout\.jsp/i.test(raw)
    || /name=["']Insert-/i.test(raw)
  )
}

/**
 * @param {string} url
 * @returns {boolean}
 */
export function isEnergizerLegacySuccessRedirectUrl(url) {
  const raw = String(url ?? '').trim()
  if (!raw) return false
  if (isEnergizerLegacyLoginUrl(raw)) return false
  return /jAccueil\.jsp|pagePrincipale\.jsp|blank\.jsp|nouveauDossier\.jsp/i.test(raw)
}

/**
 * @param {string} url
 * @returns {boolean}
 */
export function isEnergizerLegacyLoginUrl(url) {
  const raw = String(url ?? '').trim()
  if (!raw) return false
  return /userloginmid\.jsp/i.test(raw) || /\/index\.html(\?|$)/i.test(raw)
}

/**
 * @param {string} html
 * @returns {boolean}
 */
export function isEnergizerLegacyLoginPageHtml(html) {
  const raw = String(html ?? '').trim()
  if (!raw) return false
  if (isEnergizerLegacyModulePageHtml(raw)) return false

  if (/userloginmid\.jsp/i.test(raw)) return true
  if (/Vous devez ouvrir une session/i.test(raw)) return true
  if (/index\.html\?error=/i.test(raw)) return true
  if (
    /Se connecter/i.test(raw)
    && /name=["']frm["']/i.test(raw)
    && /action=["']userloginmid/i.test(raw)
  ) {
    return true
  }

  return false
}

/**
 * Règles métier newtiersbeneficiaire.jsp / lib/TiersBeneficiaire.js / saisietiersbeneficiaire.java
 */
import { isLegacyDateNotFuture } from './liquidationRpDeclarationLegacy.js'

/** @param {Record<string, unknown>} form @param {Record<string, unknown>} row */
export function mapTiersBeneficiaireDossierRowToForm(form, row = {}) {
  form.numdossier = row.numdossier ?? ''
  form.numassure = row.numassu ?? row.numassure ?? ''
}

/** @param {Record<string, unknown>} form */
export function validateTiersBeneficiaireForm(form) {
  const errors = []
  const req = (cond, msg) => { if (cond) errors.push(msg) }

  req(!form.numdossier, 'Choisissez un dossier MP/AT SVP')
  req(!form.numassure, 'Choisissez un dossier MP/AT SVP')
  if (form.naissbenef && !isLegacyDateNotFuture(form.naissbenef)) {
    errors.push('Date de naissance invalide ou future')
  }

  return errors
}

/**
 * saisietiersbeneficiaire.java → newtiersbeneficiaire.jsp?error=…
 * @param {{ redirectUrl?: string | null, finalUrl?: string | null, html?: string }} response
 */
export function parseRpTiersBeneficiaireResult(response = {}) {
  const candidates = [response.redirectUrl, response.finalUrl].filter(Boolean)
  for (const url of candidates) {
    const errorMatch = String(url).match(/[?&]error=([^&#]+)/i)
    if (errorMatch?.[1]) return decodeURIComponent(errorMatch[1].trim())
    const resultMatch = String(url).match(/[?&]resultat=([^&#]+)/i)
    if (resultMatch?.[1]) return decodeURIComponent(resultMatch[1].trim())
  }
  const html = String(response.html ?? '')
  const hidden = html.match(/name=["'](?:resultat|error)["'][^>]*value=["']([^"']*)["']/i)
  if (hidden?.[1]) return hidden[1].trim()
  return null
}

/** @param {string | null | undefined} code */
export function rpTiersBeneficiaireResultMessage(code) {
  if (code === 'ok') return 'Bénéficiaire créé avec succès !'
  if (code === 'ko') return 'Échec création du bénéficiaire'
  return null
}

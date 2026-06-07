/**
 * Règles métier newcertificatdeces.jsp / lib/certificatdeces.js / certificatdeces.java
 */
import {
  compareLegacyFrDates,
  isLegacyDateNotFuture,
} from './liquidationRpDeclarationLegacy.js'
import { mapCertificatDossierRowToForm } from './liquidationRpCertificatInitLegacy.js'

export const RP_CERTIFICAT_DECES_TYPE = 'CD-CERTIFICAT DE DECES ET DE GENRE DE MORT'

/** @param {Record<string, unknown>} form @param {Record<string, unknown>} row */
export function mapCertificatDecesDossierRowToForm(form, row = {}) {
  mapCertificatDossierRowToForm(form, row)
  form.type = RP_CERTIFICAT_DECES_TYPE
}

/** @param {Record<string, unknown>} form */
export function validateCertificatDecesForm(form) {
  const errors = []
  const req = (cond, msg) => { if (cond) errors.push(msg) }

  req(!form.numdossier, 'Choisissez un dossier MP/AT SVP')
  req(!form.numassure, 'Choisissez un dossier MP/AT SVP')
  req(!form.dateaccident, 'Date accident obligatoire')
  req(!form.datecertificat, 'Date certificat obligatoire')
  req(form.datecertificat && !isLegacyDateNotFuture(form.datecertificat), 'Date certificat invalide ou future')
  if (form.datecertificat && form.dateaccident) {
    const cmp = compareLegacyFrDates(form.datecertificat, form.dateaccident)
    if (cmp != null && cmp < 0) {
      errors.push('La date du certificat doit être ≥ à la date de l\'accident')
    }
  }
  req(!form.numcertificat, 'N° certificat obligatoire')
  req(!String(form.nommedecin ?? '').trim(), 'Nom du médecin obligatoire')
  req(!String(form.structure ?? '').trim(), 'Hôpital obligatoire')
  req(!form.datedeces, 'Date de décès obligatoire')
  req(form.datedeces && !isLegacyDateNotFuture(form.datedeces), 'Date de décès invalide ou future')
  if (form.datedeces && form.datecertificat) {
    const cmp = compareLegacyFrDates(form.datedeces, form.datecertificat)
    if (cmp != null && cmp > 0) {
      errors.push('La date de décès doit être antérieure ou égale à la date du certificat')
    }
  }

  return errors
}

/**
 * certificatdeces.java redirige vers newcertificatdeces.jsp?error=…
 * @param {{ redirectUrl?: string | null, finalUrl?: string | null, html?: string }} response
 */
export function parseRpCertificatDecesResult(response = {}) {
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
export function rpCertificatDecesResultMessage(code) {
  if (code === 'ok') return 'Ajout du certificat accompli avec succès !'
  if (code === 'ko') return 'Ajout du certificat non accompli'
  if (code === 'FI') return 'Échec — Ajout des certificats médicaux clôturé pour ce dossier'
  if (code === 'CD') return 'Échec — Le certificat médical de décès est unique !'
  return null
}

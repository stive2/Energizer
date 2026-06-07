/**
 * Règles métier newcertificat.jsp / lib/certificatinit.js / certificatinit.java
 */
import {
  compareLegacyFrDates,
  isLegacyDateNotFuture,
} from './liquidationRpDeclarationLegacy.js'

export const RP_CERTIFICAT_TYPE_OPTIONS = [
  { label: 'CI — Certificat Médical Initial', value: 'CI-CERTIFICAT MEDICAL INITIAL', code: 'CI', icon: 'add_circle', color: 'teal' },
  { label: 'CP — Certificat Médical de Prolongation', value: 'CP-CERTIFICAT MEDICAL DE PROLONGATION', code: 'CP', icon: 'update', color: 'primary' },
  { label: 'CF — Certificat Médical Final', value: 'CF-CERTIFICAT MEDICAL FINAL', code: 'CF', icon: 'task_alt', color: 'deep-orange' },
]

const TYPE_VALUE_BY_CODE = Object.fromEntries(
  RP_CERTIFICAT_TYPE_OPTIONS.map((o) => [o.code, o.value]),
)

/** @param {unknown} type */
export function extractCertificatTypeCode(type) {
  const str = String(type ?? '').trim()
  if (!str) return ''
  if (str.includes('-')) return str.split('-')[0].trim()
  if (TYPE_VALUE_BY_CODE[str]) return str
  const byIndex = { 0: 'CI', 1: 'CP', 2: 'CF' }[str]
  return byIndex ?? str
}

/** @param {unknown} type */
export function normalizeCertificatTypeValue(type) {
  const str = String(type ?? '').trim()
  if (!str) return ''
  if (str.includes('-')) return str
  const code = extractCertificatTypeCode(str)
  return TYPE_VALUE_BY_CODE[code] ?? str
}

/** @param {Record<string, unknown>} form @param {Record<string, unknown>} row */
export function mapCertificatDossierRowToForm(form, row = {}) {
  form.numdossier = row.numdossier ?? ''
  form.numassure = row.numassu ?? row.numassure ?? ''
  form.nomassure = row.nom ?? ''
  form.siegelesion = row.slesion ?? row.siegelesion ?? ''
  form.naturelesion = row.nlesion ?? row.naturelesion ?? ''
  form.numcertificat = row.numcertificat ?? ''
  form.numordre = row.numordre ?? ''
  form.flag = row.flag ?? ''
  form.flagcmi = row.flagcmi ?? row.flag ?? ''
  form.flagcmf = row.flagcmf ?? ''
  form.dateaccident = row.dateaccident ?? ''
  form.dateeffet = row.dateeffet ?? ''
}

/** @param {Record<string, unknown>} form */
export function validateCertificatInitForm(form) {
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
  req(!form.type, 'Sélectionnez le type de certificat SVP')
  req(!String(form.nommedecin ?? '').trim(), 'Nom du médecin obligatoire')
  req(!String(form.structure ?? '').trim(), 'Hôpital obligatoire')

  const code = extractCertificatTypeCode(form.type)
  if (code === 'CI' && form.flagcmi === 'OUI') {
    errors.push('Échec — Le certificat médical initial est unique !')
  }
  if (code === 'CF' && form.flagcmi !== 'OUI') {
    errors.push('Le certificat médical initial (CI) doit être créé avant le certificat final')
  }
  if ((code === 'CI' || code === 'CP') && form.nbrejours != null && Number(form.nbrejours) < 0) {
    errors.push('Vous ne pouvez saisir un nombre de jours négatif')
  }
  if (code === 'CF') {
    const tx = Number(form.txipp)
    if (form.txipp === '' || form.txipp == null || Number.isNaN(tx) || tx < 0 || tx > 100) {
      errors.push('Échec — Le taux d\'IPP saisi doit être compris entre 0 et 100')
    }
    if (form.datefinrappel && form.dateaccident) {
      const cmp = compareLegacyFrDates(form.datefinrappel, form.dateaccident)
      if (cmp != null && cmp < 0) {
        errors.push('La date prochain contrôle doit être ≥ à la date d\'accident')
      }
    }
  }

  return errors
}

/**
 * certificatinit.java redirige vers newcertificat.jsp?error=… (pas resultat=).
 * @param {{ redirectUrl?: string | null, finalUrl?: string | null, html?: string }} response
 */
export function parseRpCertificatInitResult(response = {}) {
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
export function rpCertificatInitResultMessage(code) {
  if (code === 'ok') return 'Ajout du certificat accompli avec succès !'
  if (code === 'ko') return 'Ajout du certificat non accompli'
  if (code === 'FI') return 'Échec — Ajout des certificats médicaux clôturé pour ce dossier'
  if (code === 'CI' || code === 'IN') return 'Échec — Le certificat médical initial est unique !'
  if (code === 'FI1') return 'Échec — Le taux d\'IPP saisi doit être compris entre 0 et 100'
  if (code === 'IN1') return 'Échec — Vous ne pouvez saisir un nombre de jours négatif'
  return null
}

/**
 * Règles métier nllenotedefrais.jsp / lib/notesdefrais.js / NouvelleNote.java
 */
import { isLegacyDateNotFuture } from './liquidationRpDeclarationLegacy.js'

export const RP_NOTE_FRAIS_TYPES_BENEF = [
  { label: 'ASSURÉ', value: 'ASSURE' },
  { label: 'EMPLOYEUR', value: 'EMPLOYEUR' },
  { label: 'TIERS', value: 'TIERS' },
]

import { toLegacyUppercase } from 'src/modules/energizer/utils/liquidationLegacyUtils.js'

/** @param {Record<string, unknown>} form @param {Record<string, unknown>} row */
export function mapNoteFraisDossierRowToForm(form, row = {}) {
  form.numdossier = row.numdossier ?? ''
  form.numnote = row.numnote ?? ''
  form.numassu = row.numassu ?? ''
  form.numemployeur = row.numemployeur ?? ''
  form.nomemployeur = toLegacyUppercase(row.nomemployeur ?? '')
  form.flag = ''
  form.tiersbeneficiaire = ''
}

/** @param {{ id?: string, type?: string, code?: string, libelle?: string }}[] | undefined} rows */
export function toNoteFraisObjetOptions(rows) {
  return (Array.isArray(rows) ? rows : [])
    .filter((r) => r?.id != null || r?.code != null)
    .map((r) => ({
      id: String(r.id ?? r.code),
      type: String(r.type ?? r.libelle ?? r.id ?? r.code),
    }))
}

/** @param {Record<string, unknown>} form */
export function validateNoteFraisForm(form) {
  const errors = []
  const req = (cond, msg) => { if (cond) errors.push(msg) }

  req(!form.numdossier, 'Choisissez un dossier SVP')
  req(!String(form.numemployeur ?? '').trim(), 'Matricule employeur obligatoire')
  req(!String(form.nomemployeur ?? '').trim(), 'Raison sociale obligatoire')
  req(!form.objet, 'Sélectionnez l\'objet de la note SVP')
  req(!form.tiersbeneficiaire, 'Sélectionnez le type de prise en charge')
  if (form.tiersbeneficiaire === 'TIERS') {
    req(!form.flag, 'Sélectionnez le tiers bénéficiaire')
  }
  req(!form.datedemande, 'Date de la note obligatoire')
  req(form.datedemande && !isLegacyDateNotFuture(form.datedemande), 'Date invalide ou future')

  return errors
}

/**
 * NouvelleNote.java forward vers adddetailnote.jsp en cas de succès.
 * @param {{ redirectUrl?: string | null, finalUrl?: string | null, html?: string, error?: string | null }} response
 */
export function parseRpNoteFraisResult(response = {}) {
  if (response.error) return 'ko'

  const candidates = [response.redirectUrl, response.finalUrl].filter(Boolean)
  for (const url of candidates) {
    if (/register\.html\?error/i.test(String(url))) return 'ko'
    if (/adddetailnote/i.test(String(url))) return 'ok'
  }

  const html = String(response.html ?? '')
  if (/register\.html\?error/i.test(html)) return 'ko'
  if (/adddetailnote/i.test(html)) return 'ok'

  const errorMatch = html.match(/name=["'](?:resultat|error)["'][^>]*value=["']([^"']*)["']/i)
  if (errorMatch?.[1] === 'ko') return 'ko'

  if (html.trim() && !/erreur|error/i.test(html.slice(0, 500))) {
    return 'ok'
  }

  return null
}

/** @param {string | null | undefined} code */
export function rpNoteFraisResultMessage(code) {
  if (code === 'ok') return 'Note de frais enregistrée avec succès !'
  if (code === 'ko') return 'Erreur lors de l\'enregistrement de la note de frais'
  return null
}

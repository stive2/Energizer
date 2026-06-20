import { getEnergizerBaseUrl, isEnergizerLegacyAuthEnabled } from 'src/modules/shared/config/energizerHttp.js'
import { employeurRowsFromPayload } from './lookupResponseUtils.js'
import {
  ENERGIZER_LEGACY_JSP,
  ENERGIZER_LEGACY_SERVLETS,
  getEnergizerLegacyJsp,
  parseEnergizerLegacyRows,
  postEnergizerLegacyServlet,
} from './energizerLegacyClient.js'
import {
  buildRpDeclarationApiPayload,
  buildRpCertificatInitApiPayload,
  buildRpCertificatDecesApiPayload,
  buildRpTiersBeneficiaireApiPayload,
  buildRpNoteFraisApiPayload,
  RP_DECLARATION_SUBMIT_FIELDS,
  RP_CERTIFICAT_INIT_SUBMIT_FIELDS,
  RP_CERTIFICAT_DECES_SUBMIT_FIELDS,
  RP_TIERS_BENEFICIAIRE_SUBMIT_FIELDS,
  RP_NOTE_FRAIS_SUBMIT_FIELDS,
} from '../data/liquidationRpLegacyFields.js'
import {
  parseRpDeclarationResult,
  rpDeclarationResultMessage,
} from '../utils/liquidationRpDeclarationLegacy.js'
import {
  parseRpCertificatInitResult,
  rpCertificatInitResultMessage,
} from '../utils/liquidationRpCertificatInitLegacy.js'
import {
  parseRpCertificatDecesResult,
  rpCertificatDecesResultMessage,
} from '../utils/liquidationRpCertificatDecesLegacy.js'
import {
  parseRpTiersBeneficiaireResult,
  rpTiersBeneficiaireResultMessage,
} from '../utils/liquidationRpTiersBeneficiaireLegacy.js'
import {
  parseRpNoteFraisResult,
  rpNoteFraisResultMessage,
  toNoteFraisObjetOptions,
} from '../utils/liquidationRpNoteFraisLegacy.js'

function legacyRpDeclarationRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.nlledeclaration}`
}

function legacyRpCertificatRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.newCertificat}`
}

function legacyRpCertificatDecesRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.newCertificatDeces}`
}

function legacyRpTiersBeneficiaireRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.newTiersBeneficiaire}`
}

function legacyRpNoteFraisRefererUrl() {
  const base = getEnergizerBaseUrl().replace(/\/$/, '')
  return `${base}/${ENERGIZER_LEGACY_JSP.nlleNoteDeFrais}`
}

function quoteMatForEmployeurLookup(mat) {
  const raw = String(mat ?? '').trim()
  if (!raw) return raw
  if (raw.startsWith("'") && raw.endsWith("'")) return raw
  return `'${raw.replace(/'/g, "''")}'`
}

async function loadLegacyReferential(jspPath, label) {
  const data = await getEnergizerLegacyJsp(jspPath)
  return parseEnergizerLegacyRows(data, label)
}

export async function fetchRpReferentialsLegacy() {
  const [
    arrondissements,
    typeRisques,
    siegeLesions,
    natureLesions,
    agentMateriels,
    postesTravail,
  ] = await Promise.all([
    loadLegacyReferential(ENERGIZER_LEGACY_JSP.arrondissement, 'arrondissement.jsp'),
    loadLegacyReferential(ENERGIZER_LEGACY_JSP.typeRisque, 'typerisque.jsp'),
    loadLegacyReferential(ENERGIZER_LEGACY_JSP.siegeLesion, 'siegelesion.jsp'),
    loadLegacyReferential(ENERGIZER_LEGACY_JSP.natureLesion, 'naturelesion.jsp'),
    loadLegacyReferential(ENERGIZER_LEGACY_JSP.agentMateriel, 'agentmateriel.jsp'),
    loadLegacyReferential(ENERGIZER_LEGACY_JSP.posteTravail, 'postetravail.jsp'),
  ])

  return {
    arrondissements,
    typeRisques,
    siegeLesions,
    natureLesions,
    agentMateriels,
    postesTravail,
  }
}

export async function searchRpDossiersLegacy() {
  const data = await getEnergizerLegacyJsp(ENERGIZER_LEGACY_JSP.declaration)
  return parseEnergizerLegacyRows(data, 'declaration.jsp')
}

export async function searchRpCertificatDossiersLegacy() {
  const data = await getEnergizerLegacyJsp(ENERGIZER_LEGACY_JSP.certificatInit)
  return parseEnergizerLegacyRows(data, 'certificatinit.jsp')
}

export async function fetchRpEmployeurLegacy(matricule) {
  const mat = quoteMatForEmployeurLookup(matricule)
  if (!mat) return null
  const data = await getEnergizerLegacyJsp(ENERGIZER_LEGACY_JSP.infoEmployeur, { mat })
  const rows = employeurRowsFromPayload(parseEnergizerLegacyRows(data, 'infoemployeur.jsp'))
  const row = rows[0]
  if (!row) return null
  return {
    nomemployeur: row.RAISON_SOCIALE ?? row.raison_sociale ?? row.nomemployeur ?? '',
    raison_sociale: row.RAISON_SOCIALE ?? row.raison_sociale ?? '',
  }
}

export async function saveRpDeclarationLegacy(form) {
  const payload = buildRpDeclarationApiPayload(form)
  RP_DECLARATION_SUBMIT_FIELDS.forEach((key) => {
    if (payload[key] == null) payload[key] = ''
  })

  const response = await postEnergizerLegacyServlet(
    ENERGIZER_LEGACY_SERVLETS.declaration,
    payload,
    { referer: legacyRpDeclarationRefererUrl() },
  )

  const result = parseRpDeclarationResult(response)
  const message = rpDeclarationResultMessage(result)
  if (result === 'ok') {
    return { success: true, result, message }
  }
  throw new Error(message || 'Modification du dossier non accomplie')
}

export async function saveCertificatInitLegacy(form) {
  const payload = buildRpCertificatInitApiPayload(form)
  RP_CERTIFICAT_INIT_SUBMIT_FIELDS.forEach((key) => {
    if (payload[key] == null) payload[key] = ''
  })

  const response = await postEnergizerLegacyServlet(
    ENERGIZER_LEGACY_SERVLETS.certificatinit,
    payload,
    { referer: legacyRpCertificatRefererUrl() },
  )

  const result = parseRpCertificatInitResult(response)
  const message = rpCertificatInitResultMessage(result)
  if (result === 'ok') {
    return { success: true, result, message }
  }
  throw new Error(message || 'Ajout du certificat non accompli')
}

export async function saveCertificatDecesLegacy(form) {
  const payload = buildRpCertificatDecesApiPayload(form)
  RP_CERTIFICAT_DECES_SUBMIT_FIELDS.forEach((key) => {
    if (payload[key] == null) payload[key] = ''
  })

  const response = await postEnergizerLegacyServlet(
    ENERGIZER_LEGACY_SERVLETS.certificatdeces,
    payload,
    { referer: legacyRpCertificatDecesRefererUrl() },
  )

  const result = parseRpCertificatDecesResult(response)
  const message = rpCertificatDecesResultMessage(result)
  if (result === 'ok') {
    return { success: true, result, message }
  }
  throw new Error(message || 'Ajout du certificat non accompli')
}

export async function saveTiersBeneficiaireLegacy(form) {
  const payload = buildRpTiersBeneficiaireApiPayload(form)
  RP_TIERS_BENEFICIAIRE_SUBMIT_FIELDS.forEach((key) => {
    if (payload[key] == null) payload[key] = ''
  })

  const response = await postEnergizerLegacyServlet(
    ENERGIZER_LEGACY_SERVLETS.saisietiersbeneficiaire,
    payload,
    { referer: legacyRpTiersBeneficiaireRefererUrl() },
  )

  const result = parseRpTiersBeneficiaireResult(response)
  const message = rpTiersBeneficiaireResultMessage(result)
  if (result === 'ok') {
    return { success: true, result, message }
  }
  throw new Error(message || 'Échec création du bénéficiaire')
}

export async function fetchTiersBeneficiairesLegacy(numassu) {
  const mat = String(numassu ?? '').trim()
  if (!mat) return []
  const data = await getEnergizerLegacyJsp(ENERGIZER_LEGACY_JSP.tiersBeneficiaires, { numassu: mat })
  return parseEnergizerLegacyRows(data, 'lestiersbeneficiaires.jsp')
}

export async function fetchNotesFraisDossiersLegacy() {
  const data = await getEnergizerLegacyJsp(ENERGIZER_LEGACY_JSP.nouvelleNote)
  return parseEnergizerLegacyRows(data, 'nouvellenote.jsp')
}

export async function fetchNotesFraisObjetsLegacy() {
  const data = await getEnergizerLegacyJsp(ENERGIZER_LEGACY_JSP.natureNoteFrais)
  const rows = parseEnergizerLegacyRows(data, 'naturenotefrais.jsp')
  return toNoteFraisObjetOptions(rows)
}

export async function saveNoteFraisLegacy(form) {
  const payload = buildRpNoteFraisApiPayload(form)
  RP_NOTE_FRAIS_SUBMIT_FIELDS.forEach((key) => {
    if (payload[key] == null) payload[key] = ''
  })
  if (payload.tiersbeneficiaire !== 'TIERS') {
    payload.flag = ''
  }

  const response = await postEnergizerLegacyServlet(
    ENERGIZER_LEGACY_SERVLETS.NouvelleNote,
    payload,
    { referer: legacyRpNoteFraisRefererUrl() },
  )

  const result = parseRpNoteFraisResult(response)
  const message = rpNoteFraisResultMessage(result)
  if (result === 'ok') {
    return { success: true, result, message }
  }
  throw new Error(message || 'Erreur lors de l\'enregistrement de la note de frais')
}

export function isRpLegacyApiEnabled() {
  return isEnergizerLegacyAuthEnabled()
}

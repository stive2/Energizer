/**
 * Soumission Choix_prestation_pf — adaptée au servlet teleImmat existant (sans le modifier).
 *
 * ExtJS (tele_prestation_pf.js) poste depuis la même origine Tomcat en multipart complet.
 * Quasar passe par le proxy Vite : Tomcat @MultipartConfig lit mal les scalaires mélangés
 * aux fichiers → même contournement que l’ancien PfServletProxy.php :
 *   - scalaires en query-string (getParameter fiable)
 *   - corps POST multipart = fichiers uniquement (61, 65, 62, 66…)
 *
 * Référence : tele_prestation_pf.js form.submit → ../Choix_prestation_pf
 */

/** Ordre des champs ExtJS / GererPrestationPf (Create). */
export const PF_SCALAR_ORDER = [
  'numAssuText',
  'laction',
  'nomAssuText',
  'dateNaissAssuText',
  'sexeAssuText',
  'addrAssuText',
  'emailAssuText',
  'telAssuText',
  'matrInteText',
  'matEmployeur',
  'RAISON_SOCIALE',
  'numDossier',
  'codeSecrText',
  'dateCreaDoss',
  'typePrestation',
  'codeCentrePrefText',
  'Dest',
  'CODE_CENTRECNPSC',
  'numAssu',
  'codeSecret',
  'code_secret',
  'choixAp',
  'choixAc',
  'choixIjcm',
  'choixAf',
  'code_tele',
  'dateAccoProb',
  'dateExam1Date',
  'dateExam2',
  'AP1ChBo',
  'FM1ChBo',
  'AP2ChBo',
  'FM2ChBo',
  'ijcmChBo',
  'accoPremChBo',
  'nombJourSupp',
  'dateDebuCongEffe',
  'dateFinCongEffe',
  'dateDebuNonSala',
  'dateFinNonSala',
  'dateReprActi',
  'dateAccoEffe',
  'nombEnfaViab',
  'nombEnfaContMedi',
  'FAChBo',
  'FMAChBo',
  'dateSignEmpl',
  'dateEmba',
  'nbreHeurEmba',
  'nombEnfaMoin6',
  'nombEnfaPlus6',
  'nombEnfaReco',
]

const PF_FILE_PRIORITY = ['61', '65', '62', '66', '63', '92_1', '94', '210', '16', '113']

/** ExtJS tele_prestation_pf.js — value « Créer » (startsWith « C » côté servlet). */
export const PF_LACTION_CREATE = 'Creer'

/** Champs numériques : parseInt("") si chaîne vide (GererPrestationPf). */
export const PF_OMIT_IF_EMPTY = new Set([
  'nombEnfaViab',
  'nombEnfaContMedi',
  'nombJourSupp',
  'nbreHeurEmba',
  'nombEnfaMoin6',
  'nombEnfaPlus6',
  'nombEnfaReco',
])

/** Cases à cocher : absentes si non cochées. */
export const PF_CHECKBOX_FIELDS = new Set([
  'ijcmChBo',
  'accoPremChBo',
  'AP1ChBo',
  'FM1ChBo',
  'AP2ChBo',
  'FM2ChBo',
  'FAChBo',
  'FMAChBo',
])

/**
 * @param {FormData} formData
 * @returns {{ scalars: Record<string, string>, files: Array<[string, File]> }}
 */
export function splitPfFormData(formData) {
  /** @type {Record<string, string>} */
  const scalars = {}
  /** @type {Array<[string, File]>} */
  const files = []

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      files.push([key, value])
    } else {
      scalars[key] = String(value)
    }
  }

  return { scalars, files }
}

/**
 * Normalise les scalaires avant envoi (Create) — règles servlet teleImmat.
 * @param {Record<string, string>} scalars
 */
export function normalizePfCreateScalars(scalars) {
  const out = { ...scalars }

  delete out.simples
  delete out.valider
  delete out.typeSubmission

  if (!out.laction || !String(out.laction).startsWith('C')) {
    out.laction = PF_LACTION_CREATE
  }

  if (out.numAssu && !out.numAssuText) out.numAssuText = out.numAssu
  if (out.numAssuText && !out.numAssu) out.numAssu = out.numAssuText

  for (const key of PF_OMIT_IF_EMPTY) {
    if (out[key] === '' || out[key] === undefined) delete out[key]
  }
  for (const key of PF_CHECKBOX_FIELDS) {
    if (out[key] !== 'on') delete out[key]
  }

  const isCreate = String(out.laction).startsWith('C')
  const hasExistingDossier = String(out.numDossier || '').trim().length > 0
  if (isCreate && !hasExistingDossier) {
    delete out.code_tele
    delete out.codeSecret
    delete out.code_secret
    delete out.codeSecrText
  }

  if (out.choixAp === '1') {
    if (!('dateExam1Date' in out)) out.dateExam1Date = ''
    if (!('dateExam2' in out)) out.dateExam2 = ''
    if (!('dateAccoProb' in out)) out.dateAccoProb = ''
  }

  return out
}

/**
 * @param {Record<string, string>} scalars
 */
export function assertPfRequiredScalars(scalars) {
  const normalized = normalizePfCreateScalars(scalars)
  const missing = []

  if (!String(normalized.numAssuText || normalized.numAssu || '').trim()) {
    missing.push('numAssuText')
  }
  if (!String(normalized.typePrestation || '').trim()) {
    missing.push('typePrestation')
  }
  if (!String(normalized.Dest || '').trim()) {
    missing.push('Dest')
  }
  if (!String(normalized.codeCentrePrefText || '').trim()) {
    missing.push('codeCentrePrefText')
  }
  if (!String(normalized.CODE_CENTRECNPSC || '').trim()) {
    missing.push('CODE_CENTRECNPSC')
  }
  if (!String(normalized.matEmployeur || '').trim()) {
    missing.push('matEmployeur')
  }
  if (!String(normalized.RAISON_SOCIALE || '').trim()) {
    missing.push('RAISON_SOCIALE')
  }

  if (missing.length) {
    throw new Error(
      `Champs obligatoires manquants pour Choix_prestation_pf : ${missing.join(', ')}.`,
    )
  }

  return normalized
}

function fileSortIndex(key) {
  const idx = PF_FILE_PRIORITY.indexOf(key)
  if (idx >= 0) return idx
  const m = /^(\d+)_/.exec(key)
  if (m) return 100 + parseInt(m[1], 10)
  return 1000
}

/**
 * Query-string ordonnée — scalaires pour getParameter() servlet.
 * @param {Record<string, string>} scalars
 */
export function buildPfServletQueryParams(scalars) {
  const normalized = normalizePfCreateScalars(scalars)
  const params = new URLSearchParams()
  const seen = new Set()

  const append = (key, value) => {
    if (seen.has(key)) return
    if (value === '' && (PF_OMIT_IF_EMPTY.has(key) || PF_CHECKBOX_FIELDS.has(key))) return
    if (value === null || value === undefined) return
    params.append(key, String(value))
    seen.add(key)
  }

  for (const key of PF_SCALAR_ORDER) {
    if (key in normalized) append(key, normalized[key])
  }
  for (const [key, value] of Object.entries(normalized)) {
    append(key, value)
  }

  if (!seen.has('laction')) {
    params.append('laction', PF_LACTION_CREATE)
  }

  return params
}

/**
 * @param {string} servletPath ex. /Choix_prestation_pf
 * @param {Record<string, string>} scalars
 */
export function buildPfServletSubmitUrl(servletPath, scalars) {
  const qs = buildPfServletQueryParams(scalars).toString()
  return qs ? `${servletPath}?${qs}` : servletPath
}

/**
 * Corps multipart : fichiers seuls (comme PfServletProxy.php).
 * @param {Array<[string, File]>} fileEntries
 */
export function buildPfFilesOnlyFormData(fileEntries) {
  const fd = new FormData()
  const sorted = [...fileEntries].sort(
    (a, b) => fileSortIndex(a[0]) - fileSortIndex(b[0]) || a[0].localeCompare(b[0]),
  )
  for (const [key, file] of sorted) {
    fd.append(key, file, file.name)
  }
  return fd
}

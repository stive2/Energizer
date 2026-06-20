/**
 * Noms de champs alignés sur register.js / NouvDossier.java / show.jsp (EnergizerDev).
 * Les payloads API ne doivent pas exposer les clés internes Vue (RAISON_SOCIALE, tele_*, fieldState…).
 */
import { TYPE_IMMAT_OPTIONS } from 'src/modules/energizer/data/nouveauDossierTypes.js'

/** Paramètres POST attendus par cm.sapelli.NouvDossier (register.js → nouvdossier). */
export const NOUVEAU_DOSSIER_SUBMIT_FIELDS = [
  'objet',
  'numassu',
  'nomcompletass',
  'today',
  'date_naiss',
  'centre_ges',
  'nomcomplet',
  'nomtiers',
  'datedemande',
  'datecessation',
  'datedeces',
  'dateconstatinvalid',
  'dateconstatincapacite',
  'datedemandeassuredecede',
  'natureprestation',
  'tauxinvalide',
  'dateaccident',
  'datedeclaration',
  'email',
  'adresse',
  'telephone',
  'typeimmas',
  'revision',
  'circuit',
  'code_circuit',
  'lad',
  'code_centre',
  'code_pres',
  'code_natu_pres',
  'code_natu_pres_register',
  'mat_employeur',
  'raison_soc',
  'centre',
  'boite_post',
  'regime',
  'risque',
  'code_tele_enreg',
  'code_secret',
]

/** Paramètres POST teleimportation.jsp (register.js telecompletion). */
export const TELEIMPORTATION_FIELDS = [
  'code_tele',
  'code_secret',
  'code_circuit',
  'objet',
  'num_assu',
]

/** Contexte show.jsp (hors lignes person1…nbreN). */
export const NOUVEAU_DOSSIER_PIECES_CONTEXT_FIELDS = [
  'numdossier',
  'username',
  'code_centre_user',
  'numassu',
  'nom_complet',
  'date_naiss',
  'nomcomplet',
  'telephone',
  'adresse',
  'myobjet',
  'codetele',
  'objet',
  'psize',
]

/** Mapping clés internes Vue → noms legacy pour l’employeur (register.js group00). */
export const EMPLOYEUR_INTERNAL_TO_LEGACY = {
  RAISON_SOCIALE: 'raison_soc',
  CODE_CENTRE: 'centre',
  BOITE_POSTALE: 'boite_post',
  REGIME_CNPS: 'regime',
  CODE_GPE_RISQUE: 'risque',
}

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function normalizeTypeimmasForApi(value) {
  if (value == null || value === '') return ''
  const opt = TYPE_IMMAT_OPTIONS.find((o) => o.code === value || o.lib === value)
  return opt?.lib ?? String(value)
}

/**
 * @param {Record<string, unknown>} form
 * @returns {string}
 */
function resolveObjetLabel(form) {
  const raw = form.objet
  if (raw != null && typeof raw === 'object' && 'libelle_type_pres' in raw) {
    return String(raw.libelle_type_pres ?? '')
  }
  return raw != null ? String(raw) : ''
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function resolveNaturePrestationLabel(value) {
  if (value == null) return ''
  if (typeof value === 'object' && value !== null && 'label' in value) {
    return String(value.label ?? '')
  }
  return String(value)
}

/**
 * Payload POST NouvDossier — m_config register.js.
 * @param {Record<string, unknown>} form État Pinia (clés internes autorisées).
 * @returns {Record<string, string | number | null>}
 */
export function buildNouveauDossierApiPayload(form) {
  /** @type {Record<string, string | number | null>} */
  const payload = {
    objet: resolveObjetLabel(form),
    numassu: form.numassu ?? '',
    nomcompletass: form.nomcompletass ?? '',
    today: form.today ?? '',
    date_naiss: form.date_naiss ?? '',
    centre_ges: form.centre_ges ?? '',
    nomcomplet: form.nomcomplet ?? '',
    nomtiers: form.nomtiers ?? '',
    datedemande: form.datedemande ?? '',
    datecessation: form.datecessation ?? '',
    datedeces: form.datedeces ?? '',
    dateconstatinvalid: form.dateconstatinvalid ?? '',
    dateconstatincapacite: form.dateconstatincapacite ?? '',
    datedemandeassuredecede: form.datedemandeassuredecede ?? '',
    natureprestation: resolveNaturePrestationLabel(form.natureprestation),
    tauxinvalide: form.tauxinvalide ?? '',
    dateaccident: form.dateaccident ?? '',
    datedeclaration: form.datedeclaration ?? '',
    email: form.email ?? '',
    adresse: form.adresse ?? '',
    telephone: form.telephone ?? '',
    typeimmas: normalizeTypeimmasForApi(form.typeimmas),
    revision: form.revision ?? 'NON',
    circuit: form.circuit ?? '',
    code_circuit: form.code_circuit ?? '1',
    lad: form.lad ?? 'NON',
    code_centre: form.code_centre ?? '',
    code_pres: form.code_pres ?? '',
    code_natu_pres: form.code_natu_pres ?? '',
    code_natu_pres_register: form.code_natu_pres_register ?? '',
    mat_employeur: form.mat_employeur ?? '',
    raison_soc: form.raison_soc ?? form.RAISON_SOCIALE ?? '',
    centre: form.centre ?? form.CODE_CENTRE ?? '',
    boite_post: form.boite_post ?? form.BOITE_POSTALE ?? '',
    regime: form.regime ?? form.REGIME_CNPS ?? '',
    risque: form.risque ?? form.CODE_GPE_RISQUE ?? '',
    code_tele_enreg: form.code_tele_enreg ?? '',
    code_secret: form.code_secret ?? '',
  }

  return payload
}

/**
 * Payload POST show.jsp — pièces jointes après enregistrement dossier.
 * @param {Record<string, unknown>} context piecesContext du store
 * @param {Array<{ person?: string, titulaire?: string, dateDep?: string, dateVal?: string, observ?: string, nbre?: string }>} pieceRows
 * @param {{ username?: string }} [options]
 */
export function buildNouveauDossierPiecesApiPayload(context, pieceRows, options = {}) {
  const rows = Array.isArray(pieceRows) ? pieceRows : []
  /** @type {Record<string, string>} */
  const payload = {
    numdossier: String(context.numdossier ?? ''),
    username: String(options.username ?? ''),
    code_centre_user: String(context.code_centre_user ?? ''),
    numassu: String(context.numassu ?? ''),
    nom_complet: String(context.nom_complet ?? ''),
    date_naiss: String(context.date_naiss ?? ''),
    nomcomplet: String(context.nomcomplet ?? ''),
    telephone: String(context.telephone ?? ''),
    adresse: String(context.adresse ?? ''),
    myobjet: String(context.myobjet ?? ''),
    codetele: String(context.codetele ?? ''),
    objet: String(context.objet ?? ''),
    psize: String(rows.length),
  }

  rows.forEach((row, idx) => {
    const i = idx + 1
    payload[`person${i}`] = String(row.person ?? '')
    payload[`titulaire${i}`] = String(row.titulaire ?? '')
    payload[`dateDep${i}`] = String(row.dateDep ?? '')
    payload[`dateVal${i}`] = String(row.dateVal ?? '')
    payload[`observ${i}`] = String(row.observ ?? '')
    payload[`nbre${i}`] = String(row.nbre ?? '1')
  })

  return payload
}

/**
 * Payload POST showAjout.jsp — ajout de pièces en réception (addpieceRecep.jsp).
 * @param {Record<string, unknown>} context
 * @param {Array<{ person?: string, titulaire?: string, dateDep?: string, dateVal?: string, observ?: string, nbre?: string }>} pieceRows
 * @param {{ username?: string }} [options]
 */
export function buildNouveauDossierReceptionPiecesApiPayload(context, pieceRows, options = {}) {
  const payload = buildNouveauDossierPiecesApiPayload(context, pieceRows, {
    ...options,
    username: options.username ?? context.username ?? '',
  })
  const nom = String(
    context.nom_complet ?? context.nomcomplet ?? context.myname ?? '',
  ).trim()
  payload.myname = nom
  payload.datedemande = String(context.datedemande ?? '')
  payload.username = String(options.username ?? context.username ?? payload.username ?? '')
  payload.code_centre_user = String(
    context.code_centre_user ?? payload.code_centre_user ?? '',
  )
  for (let i = 1; i <= pieceRows.length; i += 1) {
    payload[`observ${i}`] = String(payload[`observ${i}`] ?? '')
  }
  return payload
}

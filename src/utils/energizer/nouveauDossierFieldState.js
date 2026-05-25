/**
 * Visibilité / activation des champs — logique du listener select « Objet » (register.js).
 * Les champs non pertinents pour le type d'objet sont masqués (visible: false), pas seulement désactivés.
 *
 * @param {{ code_pres: string, libelle_type_pres: string, code_natu_pres?: string }} typeMeta
 */
export function computeNouveauDossierFieldState(typeMeta) {
  if (!typeMeta) {
    return createDefaultFieldState()
  }

  const { code_pres, libelle_type_pres: libelle } = typeMeta
  const state = createDefaultFieldState()

  if (code_pres === 'P') {
    state.typeimmas.enabled = false
    state.datecessation.enabled = true
    state.revision.enabled = true
  } else {
    state.datecessation.enabled = false
    state.revision.enabled = false
    state.revision.forcedValue = 'NON'
  }

  if (code_pres === 'A' || code_pres === 'E') {
    state.typeimmas.enabled = code_pres !== 'E'
    state.numassu.enabled = false
    state.nomcompletass.enabled = false
    state.date_naiss.enabled = false
  } else {
    state.typeimmas.enabled = false
    state.numassu.enabled = true
    state.nomcompletass.enabled = true
    state.date_naiss.enabled = true
  }

  if (code_pres === 'X' || code_pres === 'Z') {
    state.group00.visible = true
    state.datecessation.enabled = false
    state.datedeces.enabled = false
    state.dateaccident.enabled = false
    state.datedeclaration.enabled = false
    state.numassu.enabled = false
    state.nomcompletass.enabled = false
    state.date_naiss.enabled = false
    state.email.enabled = false
    state.adresse.enabled = false
    state.telephone.enabled = false
    state.typeimmas.enabled = false
    state.centre_ges.enabled = false
    state.nomcomplet.enabled = false
  } else {
    state.group00.visible = false
  }

  const isSurvivants =
    libelle === 'Pension de Survivants' || libelle === 'Allocation de Survivants'
  if (isSurvivants) {
    state.datedeces.enabled = true
    state.datedemandeassuredecede.enabled = true
    state.natureprestation.enabled = true
  } else {
    state.datedeces.enabled = false
    state.datedemandeassuredecede.enabled = false
    state.natureprestation.enabled = false
    state.dateconstatinvalid.enabled = false
    state.dateconstatincapacite.enabled = false
  }

  if (libelle === 'Pension Invalidité') {
    state.dateconstatinvalid.enabled = true
    state.tauxinvalide.enabled = true
    state.dateaccident.enabled = true
    state.nomtiers.enabled = true
    state.dateconstatincapacite.enabled = true
  } else {
    state.tauxinvalide.enabled = false
    state.nomtiers.enabled = false
  }

  const isRpAccident =
    code_pres === 'R' &&
    (libelle === "Dossier d Accident du Travail" ||
      libelle === 'Dossier de Maladie Professionnelle')
  if (isRpAccident) {
    state.dateaccident.enabled = true
    state.datedeclaration.enabled = true
  } else if (libelle !== 'Pension Invalidité') {
    state.dateaccident.enabled = false
    state.datedeclaration.enabled = false
  }

  applyFieldVisibility(state, code_pres)
  return state
}

/**
 * Masque les champs hors périmètre du type d'objet (ergonomie formulaire).
 * @param {ReturnType<typeof createDefaultFieldState>} state
 * @param {string} code_pres
 */
function applyFieldVisibility(state, code_pres) {
  const isEmployeurOnly = code_pres === 'X' || code_pres === 'Z'

  const specialistKeys = [
    'datecessation',
    'revision',
    'datedeces',
    'datedemandeassuredecede',
    'natureprestation',
    'dateconstatinvalid',
    'dateconstatincapacite',
    'tauxinvalide',
    'nomtiers',
    'dateaccident',
    'datedeclaration',
    'typeimmas',
  ]
  for (const key of specialistKeys) {
    state[key].visible = state[key].enabled === true
  }

  const showAssureBlock = !isEmployeurOnly
  state.numassu.visible = showAssureBlock && state.numassu.enabled === true
  state.nomcompletass.visible = showAssureBlock && state.nomcompletass.enabled === true
  state.date_naiss.visible = showAssureBlock && state.date_naiss.enabled === true
  state.centre_ges.visible = showAssureBlock && state.centre_ges.enabled !== false

  state.nomcomplet.visible = !isEmployeurOnly
  state.email.visible = !isEmployeurOnly && state.email.enabled !== false
  state.adresse.visible = !isEmployeurOnly && state.adresse.enabled !== false
  state.telephone.visible = !isEmployeurOnly && state.telephone.enabled !== false

  state.datedemande.visible = true
  state.circuit.visible = true
  state.today.visible = true
}

function createDefaultFieldState() {
  return {
    numassu: { enabled: true, visible: true, required: false },
    nomcompletass: { enabled: true, visible: true, required: false },
    date_naiss: { enabled: true, visible: true, required: false },
    centre_ges: { enabled: true, visible: true, required: false },
    nomcomplet: { enabled: true, visible: true, required: true },
    nomtiers: { enabled: false, visible: false, required: false },
    datedemande: { enabled: true, visible: true, required: true },
    datecessation: { enabled: false, visible: false, required: false },
    datedeces: { enabled: false, visible: false, required: false },
    dateconstatinvalid: { enabled: false, visible: false, required: false },
    dateconstatincapacite: { enabled: false, visible: false, required: false },
    datedemandeassuredecede: { enabled: false, visible: false, required: false },
    natureprestation: { enabled: false, visible: false, required: false },
    tauxinvalide: { enabled: false, visible: false, required: false },
    dateaccident: { enabled: false, visible: false, required: false },
    datedeclaration: { enabled: false, visible: false, required: false },
    email: { enabled: true, visible: true, required: false },
    adresse: { enabled: true, visible: true, required: true },
    telephone: { enabled: true, visible: true, required: true },
    typeimmas: { enabled: false, visible: false, required: true },
    revision: { enabled: false, visible: false, required: true, forcedValue: null },
    circuit: { enabled: true, visible: true, required: true },
    today: { enabled: true, visible: true, required: false },
    group00: { visible: false },
    group03: { visible: false },
    btEnreg: { enabled: true },
  }
}

/** @type {Record<string, unknown>} */
const HIDDEN_FIELD_DEFAULTS = {
  natureprestation: null,
  tauxinvalide: null,
  typeimmas: 'O',
  revision: 'NON',
}

const FORM_FIELD_KEYS = [
  'numassu',
  'nomcompletass',
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
]

/**
 * Réinitialise les valeurs des champs masqués pour éviter d'envoyer des données hors contexte.
 * @param {Record<string, unknown>} form
 * @param {ReturnType<typeof createDefaultFieldState>} fieldState
 */
export function clearHiddenFormFields(form, fieldState) {
  for (const key of FORM_FIELD_KEYS) {
    if (fieldState[key]?.visible === false && Object.prototype.hasOwnProperty.call(form, key)) {
      form[key] = Object.prototype.hasOwnProperty.call(HIDDEN_FIELD_DEFAULTS, key)
        ? HIDDEN_FIELD_DEFAULTS[key]
        : ''
    }
  }
}

export function isFieldVisibleInForm(fieldKey, fieldState) {
  const meta = fieldState[fieldKey]
  if (!meta) return true
  return meta.visible !== false
}

export function isFieldEnabled(fieldKey, fieldState) {
  const meta = fieldState[fieldKey]
  if (!meta) return true
  return meta.enabled !== false
}

export function isFieldActive(fieldKey, fieldState) {
  return isFieldVisibleInForm(fieldKey, fieldState) && isFieldEnabled(fieldKey, fieldState)
}

export function isFieldRequired(fieldKey, fieldState) {
  const meta = fieldState[fieldKey]
  if (!meta) return false
  return meta.required === true && isFieldActive(fieldKey, fieldState)
}

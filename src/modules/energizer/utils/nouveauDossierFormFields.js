/**
 * Métadonnées UI des champs formulaire nouveau dossier (icônes, clés i18n).
 * Aligné sur register.js / addpiece.jsp (EnergizerDev).
 */

/** Attributs Quasar pour validation immédiate (sans attendre la soumission). */
export const LEGACY_QFIELD_VALIDATE_ATTRS = {
  lazyRules: false,
  reactiveRules: true,
}

/** @type {Record<string, string>} */
export const NOUVEAU_DOSSIER_FIELD_ICONS = {
  objet: 'folder_open',
  numassu: 'badge',
  nomcompletass: 'account_circle',
  today: 'today',
  date_naiss: 'cake',
  centre_ges: 'location_city',
  nomcomplet: 'person',
  nomtiers: 'groups',
  datedemande: 'event',
  datecessation: 'event_busy',
  datedeces: 'church',
  dateconstatinvalid: 'accessible',
  dateconstatincapacite: 'healing',
  datedemandeassuredecede: 'event_note',
  natureprestation: 'category',
  tauxinvalide: 'percent',
  dateaccident: 'warning',
  datedeclaration: 'campaign',
  email: 'email',
  adresse: 'home',
  telephone: 'phone',
  typeimmas: 'app_registration',
  revision: 'history',
  circuit: 'route',
  mat_employeur: 'business',
  raison_soc: 'storefront',
  centre: 'domain',
  boite_post: 'mail',
  regime: 'policy',
  risque: 'security',
  adresse_employeur: 'place',
  code_tele_enreg: 'pin',
  code_secret: 'lock',
}

/** @type {Record<string, string>} */
export const NOUVEAU_DOSSIER_PIECE_FIELD_ICONS = {
  person: 'description',
  titulaire: 'person',
  dateDep: 'event',
  dateVal: 'draw',
  observ: 'notes',
  nbre: 'numbers',
}

/**
 * @param {string} fieldKey
 * @returns {string}
 */
export function fieldIcon(fieldKey) {
  return NOUVEAU_DOSSIER_FIELD_ICONS[fieldKey] ?? 'edit'
}

/**
 * @param {string} fieldKey
 * @returns {string}
 */
export function pieceFieldIcon(fieldKey) {
  return NOUVEAU_DOSSIER_PIECE_FIELD_ICONS[fieldKey] ?? 'edit'
}

/**
 * Champs et constantes alignés sur tele_imma_employeur0.jsp / imma_employeur0.js
 * (employeur de main d'œuvre domestique — TYPE_EMPLOYEUR = 0).
 */

export const IMMAT_EMP_DOM_TYPE_EMPLOYEUR = '0'
export const IMMAT_EMP_DOM_CODE_REGIME = '9'
export const IMMAT_EMP_DOM_CODE_GPE_RISQUE = 'A'
export const IMMAT_EMP_DOM_OBJET = 'Empl'

/** Pièces jointes fixes (name= dans le POST multipart). */
export const IMMAT_EMP_DOM_PIECE = {
  PLAN_LOCALISATION: '40',
  LISTE_TRAVAILLEURS: '41',
}

export const CAUSE_IMMA_OPTIONS = [
  { label: 'Spontanee', value: '0' },
  { label: 'Suite a controle', value: '1' },
]

export const CIRCUIT_DOSSIER_OPTIONS = [
  { label: 'Centre Formalite Creation Entreprise(C.F.C.E)', value: '4' },
  { label: 'AUTRE', value: '3' },
]

/** Clés POST scalaires alignées imma_employeur0.js (name=). */
export const IMMAT_EMP_DOM_POST_FIELD_NAMES = [
  'TYPE_EMPLOYEUR',
  'laction',
  'code_tele',
  'code_secret',
  'CODE_REGIME',
  'CODE_GPE_RISQUE',
  'CAUSEIMMA',
  'CAUSE_IMMA',
  'CIRCUITDOSSIER',
  'CIRCUIT_DOSSIER',
  'objet',
  'NOM_PERSEMPL',
  'PRENOM_PERSEMPL',
  'DATE_NAISS_PERSEMPL',
  'LOCALITE_NAISS_PERSEMPL',
  'CODE_PAYS_NAISSEMPL',
  'CODE_REGION_NAISSEMPL',
  'CODE_DEPA_NAISSEMPL',
  'LIEU_NAISS_PERSEMPL',
  'LieuNaissPe',
  'NATIONALITE',
  'NATIONALITEC',
  'PROFESSION',
  'SEXE_PERSEMPL',
  'NUM_TYPEPIECE',
  'typepiece',
  'NUM_PIECE',
  'DATE_PIECE',
  'CODE_PAYS_PIECE',
  'CODE_REGION_PIECE',
  'CODE_DEPA_PIECE',
  'LIEU_PIECEC',
  'LIEU_PIECE',
  'ADRESSE_EMPL',
  'BOITE_POSTALE',
  'TEL',
  'TEL_PERSEMPL',
  'EMAIL',
  'CODE_ARRONDC',
  'CODE_ARROND',
  'CODE_PAYS',
  'CODE_REGION',
  'CODE_DEPA',
  'NOM_QUARTIER',
  'LIEUDIT_EMPL',
  'num_case',
  'NBRE_EMPL',
  'DATE_DEB_SERVICE',
  'DATE_EFFET',
  'CODE_CENTREIMPOT',
  'CODE_CENTREIMPOTC',
  'CODE_CENTRECNPS',
  'CODE_CENTRECNPSC',
  'Dest',
  'valider',
  'etatValid',
]

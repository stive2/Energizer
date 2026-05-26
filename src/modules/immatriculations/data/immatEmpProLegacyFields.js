/**
 * Champs et constantes alignés sur tele_imma_employeur1.jsp / imma_employeur1.js
 * (employeur de main d'oeuvre professionnelle — TYPE_EMPLOYEUR = 1).
 */

export const IMMAT_EMP_PRO_TYPE_EMPLOYEUR = '1'
export const IMMAT_EMP_PRO_OBJET = 'Empl'

export const CAUSE_IMMA_OPTIONS = [
  { label: 'Spontanee', value: '0' },
  { label: 'Suite a controle', value: '1' },
]

export const CIRCUIT_DOSSIER_OPTIONS = [
  { label: 'Centre Formalite Creation Entreprise(C.F.C.E)', value: '4' },
  { label: 'AUTRE', value: '3' },
]

/** Pieces jointes fixes (name= dans le POST multipart). */
/** name= des fileuploadfield legacy (imma_employeur1.js). */
export const IMMAT_EMP_PRO_PIECES = {
  REGISTRE_COMMERCE: '35',
  STATUTS: '36',
  PATENTE: '37',
  IMPOT_LIBERATOIRE: '38',
  CARTE_CONTRIBUABLE: '39',
  PLAN_LOCALISATION: '40',
  LISTE_TRAVAILLEURS: '41',
  CONTRAT_BAIL: '126',
  AUTORISATION_OUVERTURE: '159',
}

/** Clés POST scalaires (hors fichiers dynamiques NUM_TYPEPIECE). */
export const IMMAT_EMP_PRO_POST_FIELD_NAMES = [
  'TYPE_EMPLOYEUR',
  'laction',
  'code_tele',
  'code_secret',
  'objet',
  'Dest',
  'CAUSE_IMMA',
  'CAUSEIMMA',
  'CIRCUIT_DOSSIER',
  'CIRCUITDOSSIER',
  'RAISON_SOCIALE',
  'NOM_COMMERCIAL',
  'Sigle',
  'CODE_ARROND',
  'CODE_ARRONDC',
  'CODE_DEPA',
  'CODE_REGION',
  'CODE_PAYS',
  'BOITE_POSTALE',
  'ADRESSE_EMPL',
  'NOM_QUARTIER',
  'LIEUDIT_EMPL',
  'num_case',
  'EMAIL',
  'TEL',
  'AUTRE_CONTACT',
  'DATE_DEB_SERVICE',
  'date_creation_empl',
  'DATE_EFFET',
  'num_registre',
  'num_contr',
  'NUM_EMPL_SIEGE',
  'RAISON_SOCIALE_SIEGE',
  'NOM_COMMERCIAL_SIEGE',
  'CODE_NATUREJUR',
  'NATURE_JURC',
  'CODE_SECT_ACTIVITE',
  'CODE_SECT_ACTIVITEC',
  'CODE_REGIME',
  'CODE_GPE_RISQUE',
  'A_VERIFIER',
  'NBRE_EMPL',
  'CODE_CENTREIMPOT',
  'CODE_CENTREIMPOTC',
  'CODE_CENTRECNPS',
  'CODE_CENTRECNPSC',
  'NOM_PERSEMPL',
  'PRENOM_PERSEMPL',
  'DATE_NAISS_PERSEMPL',
  'LOCALITE_NAISS_PERSEMPL',
  'LIEU_NAISS_PERSEMPL',
  'LieuNaissPe',
  'CODE_PAYS_NAISSEMPL',
  'CODE_REGION_NAISSEMPL',
  'CODE_DEPA_NAISSEMPL',
  'SEXE_PERSEMPL',
  'TEL_PERSEMPL',
  'BP_PERSEMPL',
  'ADR_PERSEMPL',
  'EMAIL_PERSEMPL',
  'NATIONALITE',
  'NATIONALITEC',
  'NUM_TYPEPIECE',
  'typepiece',
  'NUM_PIECE',
  'DATE_PIECE',
  'LIEU_PIECEC',
  'LIEU_PIECE',
  'CODE_PAYS_PIECE',
  'CODE_REGION_PIECE',
  'CODE_DEPA_PIECE',
  'valider',
  'etatValid',
]

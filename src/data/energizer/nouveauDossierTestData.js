/**
 * Données de test — réception « Nouveau dossier » (Energizer).
 * Utilisées par les mocks API et le guide de scénarios (nouveauDossierTestScenarios.js).
 */

/** Objet supplémentaire en mock : télé-immatriculation assuré (code_pres A). */
export const NOUVEAU_DOSSIER_OBJET_TELE_ASSURE = {
  libelle_type_pres: '[TEST] Télé-immatriculation assuré',
  code_pres: 'A',
  code_natu_pres: 'TA',
  code_centre_user: '321',
}

/** Champs communs à renseigner quand ils sont activés (cas standard). */
export const NOUVEAU_DOSSIER_COMMON_FORM = {
  numassu: '321-1234567-0',
  nomcomplet: 'MBALLA Paul Dépôtant',
  nomtiers: 'TIERS DEMO SARL',
  datedemande: '15/04/2026',
  datecessation: '01/01/2026',
  datedeces: '20/03/2026',
  dateconstatinvalid: '10/02/2025',
  dateconstatincapacite: '12/02/2025',
  datedemandeassuredecede: '25/03/2026',
  natureprestation: 'Pension de Survivants',
  tauxinvalide: 55,
  dateaccident: '05/01/2026',
  datedeclaration: '10/01/2026',
  email: 'depotant.demo@cnps.cm',
  adresse: '123 Avenue de la Réunification, Yaoundé',
  telephone: '677123456',
  typeimmas: 'O',
  revision: 'NON',
  circuit: 'ORDINAIRE',
  mat_employeur: '321-1234567-A',
  code_tele_enreg: 'DEMO-ASS-001',
  code_secret: 'secret2026',
}

/** Matricules assuré (Entrée dans le champ numassu). */
export const NOUVEAU_DOSSIER_TEST_ASSURES = {
  '321-1234567-0': {
    nom_complet: 'KAMGA Jean-Pierre',
    date_naiss: '15/03/1975',
    centre_ges: 'Centre Yaoundé I',
    ecart_mois_60: -5,
    pre_depot_pvid: null,
  },
  '321-1256447-9': {
    nom_complet: 'NKOA Sylvie',
    date_naiss: '22/08/1982',
    centre_ges: 'Centre Douala',
    ecart_mois_60: -12,
    pre_depot_pvid: 'TELE-PV-2026-001',
  },
  /** Alerte « éléments de calcul pension » (ecart_mois_60 >= -10, code_natu_pres PV). */
  '321-8888888-1': {
    nom_complet: 'FOTSO Martin',
    date_naiss: '01/05/1966',
    centre_ges: 'Centre Bafoussam',
    ecart_mois_60: -8,
    pre_depot_pvid: null,
  },
}

/** Matricules employeur (Entrée dans mat_employeur, bloc Reprise). */
export const NOUVEAU_DOSSIER_TEST_EMPLOYEURS = {
  '321-1234567-A': {
    NUM_EMPLOYEUR: '321-1234567-A',
    RAISON_SOCIALE: 'ENTREPRISE DEMO SARL',
    ADRESSE_EMPLOYEUR: 'Rue 123, Bastos',
    BOITE_POSTALE: 'BP 4567 Yaoundé',
    REGIME_CNPS: 'Général',
    CODE_GPE_RISQUE: '1',
    CODE_CENTRE: '001',
  },
  '321-6549873-Z': {
    NUM_EMPLOYEUR: '321-6549873-Z',
    RAISON_SOCIALE: 'SOCIETE NORD CAMEROUN',
    ADRESSE_EMPLOYEUR: 'Zone industrielle',
    BOITE_POSTALE: 'BP 100 Garoua',
    REGIME_CNPS: 'Agricole',
    CODE_GPE_RISQUE: '2',
    CODE_CENTRE: '003',
  },
}

export const NOUVEAU_DOSSIER_NATURE_PRESTATIONS = [
  {
    libelle_type_pres: 'Pension de Vieillesse Normale',
    code_centre_user: '321',
    code_pres: 'P',
    code_natu_pres: 'PVN',
    code_natu_pres_register: 'PVN',
  },
  {
    libelle_type_pres: 'Allocation de Survivants',
    code_centre_user: '321',
    code_pres: 'P',
    code_natu_pres: 'AS',
    code_natu_pres_register: 'AS',
  },
  {
    libelle_type_pres: 'Pension de Survivants',
    code_centre_user: '321',
    code_pres: 'P',
    code_natu_pres: 'PS',
    code_natu_pres_register: 'PS',
  },
]

/** Codes télé-immatriculation (bloc Importation). */
export const NOUVEAU_DOSSIER_TELE_CODES = {
  assure_ok: {
    code_tele_enreg: 'DEMO-ASS-001',
    code_secret: 'secret2026',
    objet: 'A',
    circuit: 'TELE-IMMATRICULATION',
    objetListe: '[TEST] Télé-immatriculation assuré',
  },
  employeur_ok: {
    code_tele_enreg: 'DEMO-EMP-001',
    code_secret: 'secret2026',
    objet: 'E',
    circuit: 'TELE-IMMATRICULATION',
    objetListe: 'Embauche / Cessation',
  },
  duplicate: {
    code_tele_enreg: 'DUPLICATE',
    code_secret: 'duplicate',
    message: 'Dossier existant DOS-2026-TELE-99',
  },
  not_found: {
    code_tele_enreg: 'INVALIDE',
    code_secret: 'xxx',
    message: 'Enregistrement absent',
  },
}

export const NOUVEAU_DOSSIER_TELE_ASSURE_OK = {
  DONNEES1: 'KAMGA Jean-Pierre',
  DONNEES2: '15/03/1975',
  DONNEES3: 'Yaoundé',
  DONNEES4: '321-1234567-A - ENTREPRISE DEMO SARL',
  DONNEES5: '01/06/2010',
  DONNEES6: null,
  DONNEES7: '10/05/2026',
  DONNEES8: 'OBLIGATOIRE',
}

export const NOUVEAU_DOSSIER_TELE_EMPLOYEUR_OK = {
  DONNEES1: 'ENTREPRISE DEMO SARL',
  DONNEES2: 'DEMO COMMERCE',
  DONNEES3: 'Yaoundé',
  DONNEES4: 'Bastos',
  DONNEES5: '01/01/2015',
  DONNEES6: null,
  DONNEES7: '10/05/2026',
  DONNEES8: null,
}

export const NOUVEAU_DOSSIER_TELE_DUPLICATE = {
  DONNEES6: 'DOS-2026-TELE-99',
}

/** Matricules invalides (doivent échouer à la validation). */
export const NOUVEAU_DOSSIER_INVALID = {
  matAssure: '123-456',
  matEmployeur: '999-INVALID',
}

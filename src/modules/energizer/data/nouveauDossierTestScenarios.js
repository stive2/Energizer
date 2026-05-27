/**
 * Scénarios de test programmatiques — un cas par famille de formulaire.
 * @see nouveauDossierTestData.js — valeurs brutes (matricules, télé, commun)
 * @see GUIDE_TEST_NOUVEAU_DOSSIER.md — guide manuel complet (checklist, parcours)
 */
import { NOUVEAU_DOSSIER_COMMON_FORM, NOUVEAU_DOSSIER_TELE_CODES } from './nouveauDossierTestData.js'

/** @typedef {'standard'|'pension'|'survivants'|'invalidite'|'rp'|'reprise'|'tele_employeur'|'tele_assure'|'pv_alerte'|'pre_depot'} ScenarioId */

/**
 * Champs activés par scénario (référence ExtJS).
 * Les autres champs restent visibles mais désactivés.
 */
export const SCENARIO_FIELD_GROUPS = {
  standard: {
    label: 'Cas standard (assuré + dépôt + contact)',
    champsActifs: [
      'numassu',
      'nomcompletass',
      'date_naiss',
      'centre_ges',
      'nomcomplet',
      'datedemande',
      'email',
      'adresse',
      'telephone',
      'circuit',
    ],
    valeurs: {
      ...NOUVEAU_DOSSIER_COMMON_FORM,
      circuit: 'ORDINAIRE',
    },
  },
  pension: {
    label: 'Pension / vieillesse (code_pres P)',
    champsActifs: [
      'numassu',
      'nomcompletass',
      'nomcomplet',
      'datedemande',
      'datecessation',
      'revision',
      'adresse',
      'telephone',
      'circuit',
    ],
    valeurs: {
      ...NOUVEAU_DOSSIER_COMMON_FORM,
      revision: 'NON',
      datecessation: '01/12/2025',
    },
  },
  pv_alerte: {
    label: 'Pension PV — alerte calcul auto (ecart_mois_60)',
    champsActifs: ['numassu', 'nomcomplet', 'datedemande', 'datecessation', 'revision', 'adresse', 'telephone'],
    valeurs: {
      numassu: '321-8888888-1',
      nomcomplet: 'FOTSO Martin',
      datedemande: '15/04/2026',
      datecessation: '01/06/2024',
      revision: 'NON',
      adresse: NOUVEAU_DOSSIER_COMMON_FORM.adresse,
      telephone: NOUVEAU_DOSSIER_COMMON_FORM.telephone,
    },
    notes: 'Choisir « Pension de Vieillesse Anticipée pour Usure Prématurée » puis Entrée sur numassu → alerte orange.',
  },
  pre_depot: {
    label: 'Pension — pré-dépôt PVID existant',
    champsActifs: ['numassu', 'nomcomplet', 'datedemande', 'adresse', 'telephone'],
    valeurs: {
      numassu: '321-1256447-9',
      nomcomplet: 'NKOA Sylvie',
      datedemande: '15/04/2026',
      adresse: NOUVEAU_DOSSIER_COMMON_FORM.adresse,
      telephone: NOUVEAU_DOSSIER_COMMON_FORM.telephone,
    },
    notes:
      'Choisir une pension (sauf Survivants). Entrée sur numassu → alerte pré-dépôt TELE-PV-2026-001.',
  },
  survivants: {
    label: 'Survivants (décès + nature prestation)',
    champsActifs: [
      'numassu',
      'nomcompletass',
      'nomcomplet',
      'datedemande',
      'datedeces',
      'datedemandeassuredecede',
      'natureprestation',
      'adresse',
      'telephone',
      'circuit',
    ],
    valeurs: {
      ...NOUVEAU_DOSSIER_COMMON_FORM,
      natureprestation: 'Pension de Survivants',
      datedeces: '20/03/2026',
      datedemandeassuredecede: '25/03/2026',
    },
  },
  invalidite: {
    label: 'Pension Invalidité',
    champsActifs: [
      'numassu',
      'nomcompletass',
      'nomcomplet',
      'nomtiers',
      'datedemande',
      'dateconstatinvalid',
      'dateconstatincapacite',
      'dateaccident',
      'tauxinvalide',
      'adresse',
      'telephone',
      'circuit',
    ],
    valeurs: {
      ...NOUVEAU_DOSSIER_COMMON_FORM,
      nomtiers: 'CLINIQUE DEMO',
      tauxinvalide: 55,
      dateconstatinvalid: '10/02/2025',
      dateconstatincapacite: '12/02/2025',
      dateaccident: '05/01/2026',
    },
  },
  rp: {
    label: 'AT / Maladie professionnelle',
    champsActifs: [
      'numassu',
      'nomcompletass',
      'nomcomplet',
      'datedemande',
      'dateaccident',
      'datedeclaration',
      'adresse',
      'telephone',
      'circuit',
    ],
    valeurs: {
      ...NOUVEAU_DOSSIER_COMMON_FORM,
      dateaccident: '05/01/2026',
      datedeclaration: '10/01/2026',
    },
  },
  reprise: {
    label: 'Reprise dossier (X ou Z) — bloc employeur uniquement',
    champsActifs: ['mat_employeur', 'RAISON_SOCIALE', 'CODE_CENTRE', 'BOITE_POSTALE', 'REGIME_CNPS', 'CODE_GPE_RISQUE', 'ADRESSE_EMPLOYEUR', 'datedemande', 'circuit'],
    valeurs: {
      mat_employeur: '321-1234567-A',
      datedemande: '15/04/2026',
      circuit: 'ORDINAIRE',
    },
    notes: 'Après Entrée sur mat_employeur, les champs employeur se remplissent. nomcomplet / assuré sont désactivés.',
  },
  tele_employeur: {
    label: 'Télé-immatriculation employeur',
    champsActifs: ['code_tele_enreg', 'code_secret', 'circuit', 'datedemande'],
    valeurs: {
      circuit: NOUVEAU_DOSSIER_TELE_CODES.employeur_ok.circuit,
      code_tele_enreg: NOUVEAU_DOSSIER_TELE_CODES.employeur_ok.code_tele_enreg,
      code_secret: NOUVEAU_DOSSIER_TELE_CODES.employeur_ok.code_secret,
      datedemande: '10/05/2026',
    },
    notes: 'Objet : « Embauche / Cessation ». Circuit : TELE-IMMATRICULATION. Puis blur sur les codes.',
  },
  tele_assure: {
    label: 'Télé-immatriculation assuré',
    champsActifs: ['code_tele_enreg', 'code_secret', 'circuit'],
    valeurs: {
      circuit: NOUVEAU_DOSSIER_TELE_CODES.assure_ok.circuit,
      code_tele_enreg: NOUVEAU_DOSSIER_TELE_CODES.assure_ok.code_tele_enreg,
      code_secret: NOUVEAU_DOSSIER_TELE_CODES.assure_ok.code_secret,
    },
    notes: 'Objet : « [TEST] Télé-immatriculation assuré ». Circuit : TELE-IMMATRICULATION.',
  },
  revision_oui: {
    label: 'Révision de droits — confirmation OUI',
    champsActifs: ['numassu', 'nomcomplet', 'datedemande', 'datecessation', 'revision', 'adresse', 'telephone'],
    valeurs: {
      numassu: '321-1234567-0',
      nomcomplet: 'TEST REVISION OUI',
      datedemande: '15/04/2026',
      datecessation: '01/01/2026',
      revision: 'OUI',
      adresse: NOUVEAU_DOSSIER_COMMON_FORM.adresse,
      telephone: NOUVEAU_DOSSIER_COMMON_FORM.telephone,
    },
    notes: 'Objet pension (ex. Pension de Vieillesse Normale). Choisir revision OUI → confirmer la boîte de dialogue.',
  },
  lad: {
    label: 'Circuit GED-LAD',
    champsActifs: ['numassu', 'nomcomplet', 'datedemande', 'adresse', 'telephone', 'circuit'],
    valeurs: {
      ...NOUVEAU_DOSSIER_COMMON_FORM,
      circuit: 'GED-LAD',
    },
  },
}

/** Mapping objet → scénario de test. */
export const OBJET_TO_SCENARIO = {
  Fournisseur: 'standard',
  Locataire: 'standard',
  'Embauche / Cessation': 'tele_employeur',
  'Prestations Familiales': 'standard',
  'Allocations Familiales': 'standard',
  'Allocation de Maternité': 'standard',
  'Allocations Prénatales': 'standard',
  'Frais Médicaux de Grossesse et de Maternité': 'standard',
  'Indemnités Journalières (Congés de Maternité)': 'standard',
  'Allocations Apériodiques': 'standard',
  Courrier: 'standard',
  'Allocation de Survivants': 'survivants',
  'Frais de Transport suite à Convocation un Assuré': 'standard',
  'frais funéraires suite à décès d un assuré sans prestation PVID ni ayant droit': 'standard',
  'Pension de Vieillesse Anticipée pour Usure Prématurée': 'pv_alerte',
  'Allocation de Vieillesse Anticipée pour Usure Prématurée': 'pension',
  'Pension de Vieillesse Normale': 'pension',
  'Pension de Vieillesse Anticipée pour Convenance Personnelle': 'pension',
  'Allocation de Vieillesse Normale': 'pension',
  'Pension de Survivants': 'survivants',
  'Pension Invalidité': 'invalidite',
  'Dossier de Maladie Professionnelle': 'rp',
  "Dossier d Accident du Travail": 'rp',
  'Demande de contre visite': 'standard',
  'remboursement des frais medicaux pour credirentier avec soins': 'standard',
  'Dossier de rechute': 'rp',
  'Demande Annuite Rente': 'standard',
  'Demande Rachat Rente': 'standard',
  'Demande d une Attestation pour Soumission': 'standard',
  'Reprise dossier assure': 'reprise',
  'Reprise dossier employeur': 'reprise',
  '[TEST] Télé-immatriculation assuré': 'tele_assure',
}

/** Liste ordonnée pour parcourir tous les cas (checklist QA). */
export const NOUVEAU_DOSSIER_TEST_CHECKLIST = Object.entries(OBJET_TO_SCENARIO).map(
  ([objet, scenarioId], index) => ({
    ordre: index + 1,
    objet,
    scenarioId,
    scenarioLabel: SCENARIO_FIELD_GROUPS[scenarioId]?.label ?? scenarioId,
    champsActifs: SCENARIO_FIELD_GROUPS[scenarioId]?.champsActifs ?? [],
    valeurs: SCENARIO_FIELD_GROUPS[scenarioId]?.valeurs ?? {},
    notes: SCENARIO_FIELD_GROUPS[scenarioId]?.notes ?? '',
  }),
)

/**
 * @param {string} libelleObjet
 * @returns {{ scenarioId: string, champsActifs: string[], valeurs: Record<string, unknown>, notes: string } | null}
 */
export function getTestScenarioForObjet(libelleObjet) {
  const scenarioId = OBJET_TO_SCENARIO[libelleObjet]
  if (!scenarioId) return null
  const group = SCENARIO_FIELD_GROUPS[scenarioId]
  return {
    scenarioId,
    champsActifs: group.champsActifs,
    valeurs: { ...group.valeurs },
    notes: group.notes ?? '',
  }
}

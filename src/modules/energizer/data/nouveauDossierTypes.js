/**
 * Types d'objet « Nouveau dossier » — alignés sur nouvDossier.jsp / combo ExtJS.
 * libelle_type_pres = libellé affiché ; code_pres / code_natu_pres pilotent la visibilité des champs.
 */
export const NOUVEAU_DOSSIER_OBJETS = [
  { libelle_type_pres: 'Fournisseur', code_pres: 'G', code_natu_pres: 'FR', code_centre_user: '001' },
  { libelle_type_pres: 'Locataire', code_pres: 'G', code_natu_pres: 'LO', code_centre_user: '001' },
  { libelle_type_pres: 'Embauche / Cessation', code_pres: 'E', code_natu_pres: 'EC', code_centre_user: '001' },
  { libelle_type_pres: 'Prestations Familiales', code_pres: 'F', code_natu_pres: 'PF', code_centre_user: '001' },
  { libelle_type_pres: 'Allocations Familiales', code_pres: 'F', code_natu_pres: 'AF', code_centre_user: '001' },
  { libelle_type_pres: 'Allocation de Maternité', code_pres: 'F', code_natu_pres: 'AM', code_centre_user: '001' },
  { libelle_type_pres: 'Allocations Prénatales', code_pres: 'F', code_natu_pres: 'AP', code_centre_user: '001' },
  {
    libelle_type_pres: 'Frais Médicaux de Grossesse et de Maternité',
    code_pres: 'F',
    code_natu_pres: 'FM',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'Indemnités Journalières (Congés de Maternité)',
    code_pres: 'F',
    code_natu_pres: 'IJ',
    code_centre_user: '321',
  },
  { libelle_type_pres: 'Allocations Apériodiques', code_pres: 'F', code_natu_pres: 'AA', code_centre_user: '001' },
  { libelle_type_pres: 'Courrier', code_pres: 'C', code_natu_pres: 'CO', code_centre_user: '001' },
  {
    libelle_type_pres: 'Allocation de Survivants',
    code_pres: 'P',
    code_natu_pres: 'AS',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'Frais de Transport suite à Convocation un Assuré',
    code_pres: 'G',
    code_natu_pres: 'FT',
    code_centre_user: '321',
  },
  {
    libelle_type_pres:
      'frais funéraires suite à décès d un assuré sans prestation PVID ni ayant droit',
    code_pres: 'G',
    code_natu_pres: 'FF',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'Pension de Vieillesse Anticipée pour Usure Prématurée',
    code_pres: 'P',
    code_natu_pres: 'PV',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'Allocation de Vieillesse Anticipée pour Usure Prématurée',
    code_pres: 'P',
    code_natu_pres: 'AVU',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'Pension de Vieillesse Normale',
    code_pres: 'P',
    code_natu_pres: 'PVN',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'Pension de Vieillesse Anticipée pour Convenance Personnelle',
    code_pres: 'P',
    code_natu_pres: 'APC',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'Allocation de Vieillesse Normale',
    code_pres: 'P',
    code_natu_pres: 'AVN',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'Pension de Survivants',
    code_pres: 'P',
    code_natu_pres: 'PS',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'Pension Invalidité',
    code_pres: 'I',
    code_natu_pres: 'PI',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'Dossier de Maladie Professionnelle',
    code_pres: 'R',
    code_natu_pres: 'MP',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: "Dossier d Accident du Travail",
    code_pres: 'R',
    code_natu_pres: 'AT',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'Demande de contre visite',
    code_pres: 'G',
    code_natu_pres: 'CV',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'remboursement des frais medicaux pour credirentier avec soins',
    code_pres: 'G',
    code_natu_pres: 'RM',
    code_centre_user: '321',
  },
  { libelle_type_pres: 'Dossier de rechute', code_pres: 'R', code_natu_pres: 'RE', code_centre_user: '001' },
  { libelle_type_pres: 'Demande Annuite Rente', code_pres: 'G', code_natu_pres: 'AR', code_centre_user: '001' },
  { libelle_type_pres: 'Demande Rachat Rente', code_pres: 'G', code_natu_pres: 'RR', code_centre_user: '001' },
  {
    libelle_type_pres: 'Demande d une Attestation pour Soumission',
    code_pres: 'G',
    code_natu_pres: 'DS',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'Reprise dossier assure',
    code_pres: 'X',
    code_natu_pres: 'RA',
    code_centre_user: '321',
  },
  {
    libelle_type_pres: 'Reprise dossier employeur',
    code_pres: 'Z',
    code_natu_pres: 'RE',
    code_centre_user: '321',
  },
]

export const TYPE_IMMAT_OPTIONS = [
  { code: 'O', lib: 'OBLIGATOIRE' },
  { code: 'V', lib: 'VOLONTAIRE' },
]

export const OUI_NON_OPTIONS = [
  { code: '0', lib: 'OUI' },
  { code: '1', lib: 'NON' },
]

export { DEFAULT_CIRCUITS } from 'src/modules/energizer/utils/nouveauDossierCircuits.js'

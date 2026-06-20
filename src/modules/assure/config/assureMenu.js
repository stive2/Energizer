/** Navigation et session — module Assuré */

export const assureSessionConfig = {
  displayNameKey: 'assure-sim-display-name',
  profileKey: 'assure-sim-profile',
  profileExpected: 'external',
  loginRoute: { name: 'assure-login' },
  logoutRoute: { name: 'module-portal' },
  logoutVariant: 'insured',
  clearSessionKeys: ['assure-sim-profile', 'assure-sim-display-name'],
  localTokenKey: 'auth_token',
  localUserInfoKey: 'user_info',
  clearLocalKeys: ['auth_token', 'user_info'],
}

/** Entrées sidebar (style Energizer, statiques). */
export const assureSidebarPrestationEntries = [
  {
    routeName: 'assure-prestations-familiales',
    labelKey: 'layout.sidebar.assurePrestationsFamiliales',
    icon: 'family_restroom',
    to: { name: 'assure-prestations-familiales' },
  },
  {
    routeName: 'depot-dossier',
    labelKey: 'layout.sidebar.assureDossiersPrestations',
    icon: 'upload_file',
    to: { name: 'depot-dossier' },
  },
  {
    routeName: 'assure-prestation-pension',
    labelKey: 'layout.sidebar.assurePrestationPension',
    icon: 'savings',
    to: { name: 'assure-prestation-pension' },
    disabled: true,
  },
  {
    routeName: 'assure-prestation-prise-at-mp',
    labelKey: 'layout.sidebar.assurePrestationPriseAtMp',
    icon: 'medical_services',
    to: { name: 'assure-prestation-prise-at-mp' },
    disabled: true,
  },
]

export const assureSidebarAccountEntry = {
  routeName: 'assure-account',
  labelKey: 'layout.sidebar.assureMonCompte',
  icon: 'manage_accounts',
  to: { name: 'assure-account' },
}

/** Menu plat pour fil d’Ariane (AuthenticatedLayout). */
export const assureBreadcrumbMenu = [
  { labelKey: 'layout.sidebar.home', to: { name: 'assure-home' } },
  {
    labelKey: 'layout.sidebar.assureDepotDossiers',
    children: assureSidebarPrestationEntries.map((e) => ({
      labelKey: e.labelKey,
      to: e.to,
    })),
  },
  { labelKey: 'layout.sidebar.assureMonCompte', to: { name: 'assure-account' } },
]

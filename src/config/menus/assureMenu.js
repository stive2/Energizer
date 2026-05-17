/** Navigation sidebar — module Assuré */
export const assureMenu = [
  {
    type: 'item',
    labelKey: 'layout.sidebar.home',
    icon: 'home',
    to: { name: 'assure-home' },
    exact: true,
  },
  {
    type: 'group',
    labelKey: 'layout.sidebar.assureDepotDossiers',
    labelBold: true,
    icon: 'folder_shared',
    defaultOpened: true,
    children: [
      {
        type: 'group',
        labelKey: 'layout.sidebar.assureDossiersPrestations',
        icon: 'folder_open',
        defaultOpened: true,
        children: [
          {
            type: 'item',
            labelKey: 'layout.sidebar.assurePrestationsFamiliales',
            icon: 'family_restroom',
            to: { name: 'assure-prestations-familiales' },
          },
          {
            type: 'item',
            labelKey: 'layout.sidebar.assurePrestationPension',
            icon: 'savings',
            to: { name: 'assure-prestation-pension' },
          },
          {
            type: 'item',
            labelKey: 'layout.sidebar.assurePrestationPriseAtMp',
            icon: 'medical_services',
            to: { name: 'assure-prestation-prise-at-mp' },
          },
        ],
      },
    ],
  },
]

export const assureSessionConfig = {
  displayNameKey: 'assure-sim-display-name',
  profileKey: 'assure-sim-profile',
  profileExpected: 'external',
  loginRoute: { name: 'assure-login' },
  logoutRoute: { name: 'module-portal' },
  clearSessionKeys: ['assure-sim-profile', 'assure-sim-display-name'],
  localTokenKey: 'auth_token',
  localUserInfoKey: 'user_info',
  clearLocalKeys: ['auth_token', 'user_info'],
}

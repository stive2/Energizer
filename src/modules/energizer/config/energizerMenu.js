/** Navigation sidebar — module Energizer (agent CNPS) */
export const energizerMenu = [
  {
    type: 'item',
    labelKey: 'layout.sidebar.stats',
    icon: 'insights',
    to: { name: 'energizer-home' },
    exact: true,
  },
  {
    type: 'group',
    labelKey: 'layout.sidebar.nouveauxDossiers',
    icon: 'folder',
    defaultOpened: true,
    children: [
      {
        type: 'item',
        labelKey: 'layout.sidebar.receptionStd',
        icon: 'inbox',
        to: { name: 'energizer-reception-nouveau-dossier' },
      },
    ],
  },
  {
    type: 'group',
    labelKey: 'layout.sidebar.liquidations',
    icon: 'account_balance_wallet',
    children: [
      {
        type: 'group',
        labelKey: 'layout.sidebar.prestationPf',
        icon: 'family_restroom',
        children: [
          {
            labelKey: 'layout.sidebar.saisieElementsLiquidation',
            icon: 'edit_document',
            to: { name: 'prestation-pf-saisie-elements' },
          },
        ],
      },
      {
        type: 'group',
        labelKey: 'layout.sidebar.prestationRp',
        icon: 'elderly',
        children: [
          {
            labelKey: 'layout.sidebar.rpSaisieDossier',
            icon: 'folder_open',
            to: { name: 'prestation-rp-saisie-dossier' },
          },
          {
            labelKey: 'layout.sidebar.rpSaisieElementsLiquidation',
            icon: 'edit_document',
            to: { name: 'prestation-rp-saisie-elements' },
          },
        ],
      },
    ],
  },
]

export const energizerSessionConfig = {
  displayNameKey: 'energizer-portal-sim-display-name',
  profileKey: 'energizer-portal-sim-profile',
  profileExpected: 'internal',
  loginRoute: { name: 'energizer-login' },
  logoutRoute: { name: 'energizer-login' },
  clearSessionKeys: ['energizer-portal-sim-profile', 'energizer-portal-sim-display-name'],
  localTokenKey: 'auth_token',
  localUserInfoKey: 'user_info',
  simPasswordKey: 'energizer-sim-password',
  defaultSimPassword: 'Agent2026!',
  clearLocalKeys: ['auth_token', 'user_info'],
}

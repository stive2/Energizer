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
    labelKey: 'layout.sidebar.dossiers',
    icon: 'folder_shared',
    defaultOpened: true,
    children: [
      {
        labelKey: 'layout.sidebar.depotDossiers',
        icon: 'upload_file',
        to: { name: 'depot-dossier' },
      },
      {
        labelKey: 'layout.sidebar.dashboard',
        icon: 'dashboard',
        to: { name: 'assure-dashboard' },
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

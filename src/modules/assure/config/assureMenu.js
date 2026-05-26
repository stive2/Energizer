/** Session / déconnexion — module Assuré (menu sidebar : composant AssureSidebarNav.vue). */

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

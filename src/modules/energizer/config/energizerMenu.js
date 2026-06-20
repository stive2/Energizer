/** Menu sidebar Energizer — entièrement dynamique (pagePrincipale.jsp). */
export const energizerMenu = []

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

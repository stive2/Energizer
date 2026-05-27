/**
 * Chemins API — Authentification portail CNPS.
 *
 * Les chemins reprennent l'esprit des actions JSP historiques
 * (`userloginmid.jsp`, `forgotPassword`) tout en suivant la convention REST
 * utilisée par les autres modules (`/auth/...`).
 */
export const AUTH_API = {
  login: '/auth/login',
  logout: '/auth/logout',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
}

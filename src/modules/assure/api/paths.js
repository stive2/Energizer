/** Endpoints API — module Assuré */
export const ASSURE_API = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    reactivate: '/auth/reactivate',
  },
  account: {
    profile: (numAssu) => `/account/${encodeURIComponent(numAssu)}/profile`,
    typesPiece: '/account/types-piece',
    register: '/account/register',
    password: '/account/password',
  },
  home: '/assure/home',
  /** Repli si VITE_TELE_IMMAT_USE_LEGACY=false (immaticulation assuré) */
  teleImmat: {
    gererAssure: '/assure/tele-immat/gerer-assure',
  },
}

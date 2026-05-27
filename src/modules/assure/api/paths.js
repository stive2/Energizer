/** Endpoints API — module Assuré */
export const ASSURE_API = {
  depotPf: {
    contexte: '/assure/depot-pf/contexte',
    employeur: '/assure/depot-pf/employeur',
    dossiers: '/assure/depot-pf/dossiers',
  },
  /** POST multipart — équivalent servlet teleImmat GererAssure */
  teleImmat: {
    gererAssure: '/assure/tele-immat/gerer-assure',
  },
}

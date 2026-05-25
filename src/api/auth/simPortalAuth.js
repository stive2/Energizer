/**
 * Comptes fictifs — authentification portail (démo, sans API CNPS).
 * Utilisés par `authApi.js` lorsque le mode simulation est actif.
 */

export const SIM_PORTAL_EXTERNAL = {
  profile: 'external',
  variant: 'insured',
  login: 'assure.externe@cnps.demo',
  /** Matricule assuré de démonstration (champ `num_assu`). */
  num_assu: '321-1256447-9',
  password: 'Assure2026!',
  displayName: 'Marie Kouam — assurée (démo)',
}

export const SIM_PORTAL_INTERNAL = {
  profile: 'internal',
  variant: 'agent',
  login: 'agent.interne@cnps.demo',
  password: 'Agent2026!',
  prenom: 'Jean',
  nom: 'Ndzana',
  displayName: 'Jean Ndzana — agent CNPS (démo)',
}

/**
 * Tant que l'API /auth n'existe pas : aucun appel réseau.
 * Passer `VITE_CNPS_USE_REAL_AUTH=true` dans .env quand le backend sera prêt.
 */
export function isSimAuthEnabled() {
  return import.meta.env.VITE_CNPS_USE_REAL_AUTH !== 'true'
}

export function getSimAccountByProfile(profile) {
  return profile === 'external' ? SIM_PORTAL_EXTERNAL : SIM_PORTAL_INTERNAL
}

export function getSimAccountByVariant(variant) {
  return variant === 'agent' ? SIM_PORTAL_INTERNAL : SIM_PORTAL_EXTERNAL
}

export function validateSimPortalCredentials(profile, login, password) {
  const spec = getSimAccountByProfile(profile)
  const value = (login || '').trim()
  const loginNorm = value.toLowerCase()
  const loginOk =
    loginNorm === spec.login.toLowerCase() ||
    (spec.num_assu && value === spec.num_assu)
  return loginOk && password === spec.password
}

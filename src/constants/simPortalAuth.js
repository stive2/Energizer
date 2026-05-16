/** Comptes fictifs pour la simulation d’authentification sur le portail (démo uniquement). */

export const SIM_PORTAL_EXTERNAL = {
  profile: 'external',
  login: 'assure.externe@cnps.demo',
  password: 'Assure2026!',
  displayName: 'Marie Kouam — assurée (démo)',
}

export const SIM_PORTAL_INTERNAL = {
  profile: 'internal',
  login: 'agent.interne@cnps.demo',
  password: 'Agent2026!',
  displayName: 'Jean Ndzana — agent CNPS (démo)',
}

export function validateSimPortalCredentials(profile, login, password) {
  const spec = profile === 'external' ? SIM_PORTAL_EXTERNAL : SIM_PORTAL_INTERNAL
  return (
    login.trim().toLowerCase() === spec.login.toLowerCase() && password === spec.password
  )
}

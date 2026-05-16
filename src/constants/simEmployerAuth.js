/** Compte employeur fictif (démonstration). */

export const SIM_EMPLOYER = {
  login: 'employeur.demo@cnps.demo',
  password: 'Employeur2026!',
  displayName: 'SOC DEMO SARL — employeur (démo)',
}

export function validateSimEmployerCredentials(login, password) {
  return (
    login.trim().toLowerCase() === SIM_EMPLOYER.login.toLowerCase() &&
    password === SIM_EMPLOYER.password
  )
}

/** Contexte agent CNPS connecté (démo / session simulée). */
export function getConnectedAgentContext() {
  const fallback = {
    matricule: 'AGT-DEMO-001',
    login: 'agent.interne@cnps.demo',
    name: 'Jean Ndzana',
  }

  if (typeof localStorage === 'undefined') {
    return fallback
  }

  try {
    const raw = localStorage.getItem('user_info')
    if (!raw) return fallback
    const user = JSON.parse(raw)
    const prenom = user.prenom || ''
    const nom = user.nom || ''
    const name =
      user.displayName ||
      [prenom, nom].filter(Boolean).join(' ') ||
      fallback.name

    return {
      matricule: user.matricule || fallback.matricule,
      login: user.login || user.email || fallback.login,
      name,
    }
  } catch {
    return fallback
  }
}

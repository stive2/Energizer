/** Contexte agent CNPS connecté (session userloginmid.jsp / authStore). */
export function getConnectedAgentContext() {
  if (typeof localStorage === 'undefined') {
    return { matricule: '', login: '', name: '' }
  }

  try {
    const raw = localStorage.getItem('user_info')
    if (!raw) {
      return { matricule: '', login: '', name: '' }
    }
    const user = JSON.parse(raw)
    if (user.profile !== 'internal') {
      return { matricule: '', login: '', name: '' }
    }
    const prenom = user.prenom || ''
    const nom = user.nom || ''
    const name =
      user.displayName ||
      [prenom, nom].filter(Boolean).join(' ') ||
      user.login ||
      ''

    return {
      matricule: user.matricule || user.login || '',
      login: user.login || user.email || '',
      name,
    }
  } catch {
    return { matricule: '', login: '', name: '' }
  }
}

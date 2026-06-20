/** Tableau de bord local si l’API /assure/home est indisponible. */

function readStoredUser() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem('user_info')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function buildAssureHomeFallbackDashboard() {
  const user = readStoredUser() || {}
  const numAssu = String(user.num_assu || user.login || user.numeroAssure || '').trim()
  const prenom = String(user.prenom || '').trim()
  const nom = String(user.nom || '').trim()
  const displayName =
    user.displayName || [prenom, nom].filter(Boolean).join(' ').trim() || numAssu

  return {
    user: {
      num_assu: numAssu,
      displayName,
      lib_centre: user.lib_centre || user.agence || '',
      prenom,
      nom,
    },
    account: {
      exists: true,
      active: true,
    },
    depotPf: {
      available: true,
      backend: 'teleImmat',
    },
    quickActions: [
      {
        id: 'depot-pf',
        route: 'assure-prestations-familiales',
        icon: 'family_restroom',
        enabled: true,
      },
      {
        id: 'depot-dossier',
        route: 'depot-dossier',
        icon: 'upload_file',
        enabled: true,
      },
      {
        id: 'mon-compte',
        route: 'assure-account',
        icon: 'manage_accounts',
        enabled: true,
      },
    ],
  }
}

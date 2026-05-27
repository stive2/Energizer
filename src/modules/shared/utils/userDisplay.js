/** Nom affiché (sans suffixe rôle / démo après « — »). */
export function formatUserDisplayName(profile, fallback = '') {
  if (profile?.prenom && profile?.nom) {
    return `${profile.prenom} ${profile.nom}`.trim()
  }
  const raw = profile?.displayName || profile?.nom || fallback || ''
  return String(raw).split(/[—–]/)[0].trim()
}

/** Initiales : 1re lettre du nom + 1re lettre du prénom (ex. Ndzana Jean → NJ). */
export function computeUserInitials(profile, fallbackDisplayName = '') {
  if (profile?.nom && profile?.prenom) {
    return (profile.nom.charAt(0) + profile.prenom.charAt(0)).toUpperCase()
  }
  const clean = formatUserDisplayName(profile, fallbackDisplayName)
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[1].charAt(0) + parts[0].charAt(0)).toUpperCase()
  }
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return '?'
}

/** Découpe « Prénom Nom » en { prenom, nom }. */
export function splitFullName(fullName) {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length >= 2) {
    return { prenom: parts[0], nom: parts.slice(1).join(' ') }
  }
  return { prenom: '', nom: parts[0] || '' }
}

/** Lecture matricule assuré depuis la session portail. */

export function readInsuredNumAssu() {
  if (typeof localStorage === 'undefined') return ''
  try {
    const raw = localStorage.getItem('user_info')
    if (!raw) return ''
    const user = JSON.parse(raw)
    return String(user.num_assu || user.login || user.numeroAssure || '').trim()
  } catch {
    return ''
  }
}

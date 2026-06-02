import { energizerAxios } from './energizerClient.js'
import { AuthError } from './authApi.js'
import { calcMD5 } from 'src/modules/shared/utils/md5.js'
import {
  parseEnergizerPagePrincipale,
  isEnergizerPagePrincipaleHtml,
} from 'src/modules/energizer/adapters/parseEnergizerPagePrincipale.js'

const LOGIN_JSP = 'userloginmid.jsp'
const SESSION_PROBE_JSP = 'pagePrincipale.jsp'

function resolveFinalUrl(response) {
  return response?.request?.responseURL || response?.config?.url || ''
}

function isLoginFailureUrl(url) {
  return /index\.html/i.test(url)
}

function isPasswordChangeRedirect(url) {
  return /majPWD\.jsp/i.test(url) && !/pagePrincipale/i.test(url)
}

function buildUserFromParse(parsed, loginValue) {
  const u = parsed.user || {}
  const displayName =
    u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ') || loginValue

  return {
    login: loginValue,
    displayName,
    prenom: u.firstName || '',
    nom: u.lastName || '',
    profile: 'internal',
    lib_centre: u.lib_centre || '',
    agence: u.lib_centre || '',
    code_centre: u.code_centre || '',
    email: loginValue,
    matricule: loginValue,
  }
}

async function fetchPagePrincipaleHtml() {
  const { data } = await energizerAxios.get(SESSION_PROBE_JSP, {
    responseType: 'text',
    skipErrorNotify: true,
  })
  return String(data ?? '')
}

/**
 * @deprecated Préférer parseEnergizerPagePrincipale
 */
export function parseEnergizerSessionFromHtml(html) {
  const parsed = parseEnergizerPagePrincipale(html)
  return {
    firstName: parsed.user.firstName,
    lastName: parsed.user.lastName,
    username: parsed.user.displayName ? '' : '',
    lib_centre: parsed.user.lib_centre,
    displayName: parsed.user.displayName,
  }
}

/**
 * Connexion agent — POST userloginmid.jsp (login + password MD5).
 */
export async function loginEnergizerAgent({ login, password }) {
  const loginValue = (login || '').trim()
  if (!loginValue) {
    throw new AuthError('Entrez le login SVP.')
  }
  if (!password) {
    throw new AuthError('Entrez le mot de passe.')
  }

  const body = new URLSearchParams()
  body.append('login', loginValue)
  body.append('password', calcMD5(password))

  let response
  try {
    response = await energizerAxios.post(LOGIN_JSP, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'text',
      maxRedirects: 10,
      skipErrorNotify: true,
    })
  } catch (err) {
    const status = err?.response?.status
    const location = err?.response?.headers?.location || ''
    if ((status === 302 || status === 303) && isLoginFailureUrl(location)) {
      throw new AuthError('Identifiant ou mot de passe incorrect.')
    }
    if ((status === 302 || status === 303) && isPasswordChangeRedirect(location)) {
      throw new AuthError(
        'Merci de procéder à la modification de votre mot de passe sur le portail Energizer.',
        'PASSWORD_CHANGE_REQUIRED',
      )
    }
    throw new AuthError(
      err?.message || 'Impossible de joindre le serveur Energizer.',
      'NETWORK_ERROR',
    )
  }

  const finalUrl = resolveFinalUrl(response)
  let html = String(response?.data ?? '')

  if (isLoginFailureUrl(finalUrl) || /index\.html/i.test(html)) {
    throw new AuthError('Identifiant ou mot de passe incorrect.')
  }

  if (isPasswordChangeRedirect(finalUrl)) {
    throw new AuthError(
      'Merci de procéder à la modification de votre mot de passe sur le portail Energizer.',
      'PASSWORD_CHANGE_REQUIRED',
    )
  }

  if (!isEnergizerPagePrincipaleHtml(html)) {
    html = await fetchPagePrincipaleHtml()
  }

  if (!isEnergizerPagePrincipaleHtml(html)) {
    throw new AuthError('Réponse de connexion inattendue du serveur Energizer.')
  }

  const parsed = parseEnergizerPagePrincipale(html)

  return {
    token: `energizer-legacy-${Date.now()}`,
    user: buildUserFromParse(parsed, loginValue),
    pagePrincipale: parsed,
    pagePrincipaleHtml: html,
  }
}

export async function refreshEnergizerPagePrincipale() {
  const html = await fetchPagePrincipaleHtml()
  if (!isEnergizerPagePrincipaleHtml(html)) {
    throw new AuthError('Session Energizer expirée. Veuillez vous reconnecter.', 'SESSION_EXPIRED')
  }
  return {
    html,
    parsed: parseEnergizerPagePrincipale(html),
  }
}

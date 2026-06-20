import axios from 'axios'
import { getTeleImmatBaseUrl, getTeleImmatTimeout } from 'src/modules/shared/config/teleImmat.js'

/**
 * Client HTTP dédié teleImmat_0.1 (JSP + servlets).
 * Séparé de l'API CNPS pour éviter les intercepteurs / baseURL globaux.
 */
export const teleImmatAxios = axios.create({
  baseURL: getTeleImmatBaseUrl(),
  timeout: getTeleImmatTimeout(),
  headers: {
    Accept: 'application/json, text/plain, */*',
  },
})

if (import.meta.env.DEV) {
  console.info('[teleImmat] baseURL:', getTeleImmatBaseUrl())
}

/**
 * POST application/x-www-form-urlencoded — format attendu par les JSP legacy.
 * @param {string} path
 * @param {Record<string, string>} params
 */
export async function postLegacyJsp(path, params = {}) {
  const body = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') body.append(key, String(value))
  })

  const { data } = await teleImmatAxios.post(path, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    skipErrorNotify: true,
  })
  return data
}

/**
 * GET JSP référentiel (larrondissement.jsp, lepays.jsp, …).
 * @param {string} path
 * @param {Record<string, string|number>} [params] — ex. { _dc: Date.now() } (cache-bust ExtJS)
 * @param {{ timeout?: number }} [options]
 */
export async function getLegacyJsp(path, params = {}, options = {}) {
  const { data } = await teleImmatAxios.get(path, {
    params: { _dc: Date.now(), ...params },
    timeout: options.timeout,
    skipErrorNotify: true,
  })
  return data
}

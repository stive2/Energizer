/**
 * Client HTTP — backend-assure (port 83 / proxy /api-assure).
 */
import axios from 'axios'
import { notifyNegative } from 'src/modules/shared/utils/appNotify.js'
import { getApiErrorMessage } from 'src/modules/shared/services/http/apiError.js'
import {
  getAssureApiBaseUrl,
  getAssureApiTimeout,
} from 'src/modules/shared/config/assureHttp.js'

const TOKEN_KEY = 'auth_token'

export const assureApi = axios.create({
  baseURL: getAssureApiBaseUrl(),
  timeout: getAssureApiTimeout(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

assureApi.interceptors.request.use(
  (config) => {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        const bearer = `Bearer ${token}`
        config.headers.Authorization = bearer
        config.headers['X-Authorization'] = bearer
      }
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error),
)

assureApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const skipNotify = error.config?.skipErrorNotify === true
    if (!skipNotify && typeof window !== 'undefined') {
      notifyNegative(getApiErrorMessage(error), { timeout: 5000 })
    }
    return Promise.reject(error)
  },
)

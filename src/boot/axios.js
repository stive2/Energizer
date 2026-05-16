import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'
import {
  CNPS_AUTH_TOKEN_KEY,
  getCnpsApiBaseUrl,
  getCnpsApiTimeout,
} from 'src/config/api.js'
import { getApiErrorMessage } from 'src/services/http/apiError.js'

const api = axios.create({
  baseURL: getCnpsApiBaseUrl(),
  timeout: getCnpsApiTimeout(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem(CNPS_AUTH_TOKEN_KEY)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const skipNotify = error.config?.skipErrorNotify === true
    if (!skipNotify && typeof window !== 'undefined') {
      Notify.create({
        type: 'negative',
        message: getApiErrorMessage(error),
        timeout: 5000,
        position: 'top',
      })
    }
    return Promise.reject(error)
  },
)

if (import.meta.env.DEV) {
  console.info('[CNPS API] baseURL:', getCnpsApiBaseUrl(), '| timeout:', getCnpsApiTimeout(), 'ms')
}

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api, axios }

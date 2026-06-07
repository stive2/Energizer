import axios from 'axios'
import {
  getEnergizerBaseUrl,
  getEnergizerTimeout,
} from 'src/modules/shared/config/energizerHttp.js'
import { setupEnergizerAxiosSessionInterceptor } from 'src/modules/energizer/utils/energizerSessionExpiry.js'

/**
 * Client HTTP backend Energizer (JSP session Tomcat).
 * withCredentials : cookie JSESSIONID après userloginmid.jsp.
 */
export const energizerAxios = axios.create({
  baseURL: getEnergizerBaseUrl(),
  timeout: getEnergizerTimeout(),
  withCredentials: true,
  headers: {
    Accept: 'text/html,application/json,text/plain,*/*',
  },
})

setupEnergizerAxiosSessionInterceptor(energizerAxios)

if (import.meta.env.DEV) {
  console.info('[Energizer] baseURL:', getEnergizerBaseUrl())
}

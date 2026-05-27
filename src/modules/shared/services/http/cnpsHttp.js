/**
 * Client HTTP CNPS — point d’entrée unique pour les appels API.
 *
 * @example
 * import { api } from 'src/modules/shared/services/http/cnpsHttp.js'
 * const { data } = await api.get('/chemin/ressource')
 * await api.post('/chemin', payload, { skipErrorNotify: true })
 */
export { api, axios } from 'boot/axios'

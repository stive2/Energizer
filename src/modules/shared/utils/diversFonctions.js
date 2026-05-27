/**
 * Portage Quasar / ES modules des utilitaires de `divers_fonctions.js` (Sapelli).
 */

export const Exp_mat = /^[0-9]([0-9]){2}-([0-9]){7}(-([0-9]){3}){0,1}-[A-Z]$/
export const Exp_contrib = /^[A-Z]([0-9]){12}[A-Z]$/i
export const Exp_sal = /^[0-9]([0-9]){4,8}([0-9]){0,1}$/

export const sepachampsvaleur = '.=.'
export const sepachamps = '.#.'

/**
 * Vérifie le caractère saisi (équivalent `validateKey` + onKeyPress legacy).
 * @returns {boolean}
 */
export function validateKey(event) {
  const validKeys = /[\w@. ]/
  // eslint-disable-next-line no-control-regex
  const validSpecialKeys = /[\x08\x0D-]/
  const key = String.fromCharCode(event.which ?? event.keyCode)
  const isKeyValid = validKeys.test(key) || validSpecialKeys.test(key)
  if (!isKeyValid) {
    alert('ATTENTION!!! vous avez saisi un caractere Non Valide')
    if (event.returnValue !== undefined) event.returnValue = false
    if (event.cancelBubble !== undefined) event.cancelBubble = true
    event.preventDefault()
  }
  return isKeyValid
}

/**
 * Contrôle des champs obligatoires du formulaire de connexion.
 * Assuré (Sapelli) : num_assu, mot2passe — Energizer (index.html) : login, userpassword.
 */
export function controleChamps(fields) {
  // || et non ?? : les champs vides de l'autre module (login '' vs num_assu) ne doivent pas masquer la saisie.
  const id = (fields?.num_assu || fields?.login || '').toString().trim()
  const pass = (fields?.mot2passe || fields?.userpassword || fields?.password || '').toString().trim()
  if (id.length > 0 && pass.length > 0) {
    return true
  }
  alert('Renseignez tous les champs obligatoires(*)')
  return false
}

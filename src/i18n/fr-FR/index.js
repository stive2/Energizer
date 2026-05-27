import baseFr from './baseFr'
import teledeclaration from './teledeclaration'
import global from './global'

export default {
  ...baseFr, // fusionne les traductions générales
  ...teledeclaration,
  ...global,
}

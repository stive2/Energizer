import baseEn from './baseEn'
import teledeclaration from './teledeclaration'
import global from './global'

export default {
  ...baseEn, // fusionne les traductions générales
  ...teledeclaration,
  ...global,
}

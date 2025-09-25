import baseFr from './baseFr'
import controleEmp from './controleEmp'
import tenuCmpteCotisant from './tenuCmpteCotisant'
import teledeclaration from './teledeclaration'
import global from './global'

export default {
  ...baseFr, // fusionne les traductions générales
  ...controleEmp, // fusionne les traductions spécifiques au contrôle employeur
  ...tenuCmpteCotisant, // fusionne les traductions spécifiques à la tenue de comptes cotisants
  ...teledeclaration,
  ...global,
}

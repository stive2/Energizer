import baseFr from './baseFr'
import controleEmp from './controleEmp'

export default {
  ...baseFr, // fusionne les traductions générales
  ...controleEmp, // fusionne les traductions spécifiques au contrôle employeur
}

import baseEn from './baseEn'
import controleEmp from './controleEmp'

export default {
  ...baseEn, // fusionne les traductions générales
  ...controleEmp, // fusionne les traductions spécifiques au contrôle employeur
}

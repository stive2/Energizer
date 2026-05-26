/**
 * Helpers partagés alignement POST legacy (employeur0 / employeur1).
 */

/** Legacy store sexe : id F/M, libellé FEMININ/MASCULIN — POST attend F ou M. */
export function toLegacySexe(val) {
  const v = String(val ?? '').toUpperCase()
  if (v === 'F' || v === 'FEMININ') return 'F'
  if (v === 'M' || v === 'MASCULIN') return 'M'
  return val
}

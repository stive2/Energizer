/**
 * Contexte référentiels pour sync / FormData employeur pro (listes serveur JSP).
 * @param {{
 *   arrondissements?: object[],
 *   activites?: object[],
 *   centres?: object[],
 *   formeJuridique?: object[],
 *   impots?: object[],
 *   pays?: object[],
 *   pieces?: object[],
 * }} refs
 */
export function createImmatEmpProReferentialContext(refs = {}) {
  const arrondissements = refs.arrondissements ?? []
  const activites = refs.activites ?? []
  const centres = refs.centres ?? []
  const formeJuridique = refs.formeJuridique ?? []
  const impots = refs.impots ?? []
  const pays = refs.pays ?? []
  const pieces = refs.pieces ?? []

  function byCode(list, key, code) {
    if (code === null || code === undefined || code === '') return null
    return list.find((x) => String(x[key]) === String(code)) || null
  }

  return {
    arrondissements,
    activites,
    centres,
    formeJuridique,
    impots,
    pays,
    pieces,
    byCode,
    arrondLabel(code) {
      const a = byCode(arrondissements, 'CODE_ARROND', code)
      return a?.NOM_ARROND ?? code
    },
    natJurLabel(code) {
      const n = byCode(formeJuridique, 'CODE_NATUREJUR', code)
      return n?.LIBELLE_NATUREJUR ?? code
    },
    activiteLabel(code) {
      const a = byCode(activites, 'CODE_SECT_ACTIVITE', code)
      return a?.LIBELLE_SECT_ACTIVITE ?? code
    },
    impotLabel(code) {
      const i = byCode(impots, 'CODE_CENTREIMPOT', code)
      return i?.ABREVIATION ?? code
    },
    cnpsLabel(value) {
      const byCodeCentre = byCode(centres, 'CODE_CENTRE', value)
      if (byCodeCentre) return byCodeCentre.LIB_CENTRE
      const byLib = centres.find((c) => String(c.LIB_CENTRE) === String(value))
      return byLib?.LIB_CENTRE ?? value
    },
    paysNationaliteLabel(codeOrLabel) {
      const p = byCode(pays, 'code_pays', codeOrLabel)
      if (p) return p.nationalite
      const byNat = pays.find((x) => x.nationalite === codeOrLabel)
      return byNat?.nationalite ?? codeOrLabel
    },
  }
}

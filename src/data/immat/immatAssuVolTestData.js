import { arrondissements } from '../Arrondissements.js'
import { pays } from '../Pays.js'
import { pieces } from '../Pieces.js'
import { centres } from '../Centres.js'
import { matrimonial } from './Matrimonial.js'
import { origineRevenu } from './OrigineRevenu.js'

const yaounde = arrondissements.find((a) => a.NOM_ARROND === 'YAOUNDE I') || arrondissements[0]
const cameroun = pays.find((p) => p.code_pays === 'CMR') || pays.find((p) => p.nationalite === 'CAMEROUNAISE')
const cni = pieces.find((p) => p.NUM_TYPEPIECE === '56') || pieces[0]
const centreYde = centres.find((c) => c.LIB_CENTRE.includes('Yaounde')) || centres[0]
const origine = origineRevenu[0]

/** Jeu de test régime 1 — assuré volontaire. */
export const immatAssuVolTestDataRegime1 = {
  ORIGINE_REVENU: origine,
  CODE_ORIGINEREV: origine.CODE_ORIGINEREV,
  CODE_REGIMEAV: origine.CODE_REGIME,
  DATE_DEBUT_AFFI: '01/06/2026',
  MIN_DATE_DEBUT_AFFI: '01/12/2025',
  DATE_DEBUT_AFFI_SOLL: '01/06/2026',
  DETAILS_ORIGINEREV: 'COMMERCE DE DETAIL',
  MONTANT_REV_ANNUEL: 2400000,
  ASSIETTE_COTISATION: 200000,
  TAUX: 9.5,
  MONTANT_COTISATION: 19000,
  SMIG_VALUE: 36270,
  SEXE_PERS: 'FEMININ',
  NOM_PERS: 'FOUDA',
  PRENOM_PERS: 'CLAIRE',
  DATE_NAISS_PERS: '20/03/1985',
  LOCALITE_NAISS: 'DOUALA',
  LieuNaiss: yaounde,
  civilite: matrimonial[1],
  NATIONALITEC: cameroun,
  typepiece: cni,
  NUM_PIECE: '987654321',
  DATE_PIECE: '05/06/2018',
  LIEU_PIECEC: yaounde,
  NOM_PERE: 'FOUDA',
  PRENOM_PERE: 'PIERRE',
  etatP: 'Vivant',
  NOM_MERE: 'NKODO',
  PRENOM_MERE: 'ANNE',
  etatM: 'Vivant',
  CODE_VILLEC: yaounde,
  QUARTIER: 'AKWA',
  TEL_PERS: '+237 677 000 111',
  EMAIL_PERS: 'claire.fouda@example.cm',
  Adresse: 'BOULEVARD DE LA LIBERTE',
  CODE_CENTRECNPSC: centreYde,
  nombEnfa: 0,
  nombCert: 0,
  nombConj: 0,
  smig_annuel: '435240',
  max_cotisation_annuel: '9000000',
  taux: '9.5',
}

export function applyImmatAssuVolTestData(formRef) {
  const target = formRef.value ?? formRef
  Object.assign(target, {
    ...immatAssuVolTestDataRegime1,
    file504: target.file504 ?? null,
    file507: target.file507 ?? null,
    pieceIdentite: target.pieceIdentite ?? null,
    declarationHonneur: target.declarationHonneur ?? null,
    actesNaissance: [],
    certificatsTravail: [],
    actesMariage: [],
  })
}

export function createMockImageFile(name = 'test.jpg') {
  if (typeof File === 'undefined') return null
  return new File([new Uint8Array([0xff, 0xd8, 0xff])], name, { type: 'image/jpeg' })
}

export const immatAssuVolTestFilesRegime1 = {
  file504: () => createMockImageFile('declaration_revenu.jpg'),
  file507: () => createMockImageFile('declaration_honneur.jpg'),
  pieceIdentite: () => createMockImageFile('cni.jpg'),
  declarationHonneur: () => createMockImageFile('declaration_piece.jpg'),
}

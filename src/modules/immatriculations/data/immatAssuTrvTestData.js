import { arrondissements } from 'src/modules/shared/data/Arrondissements.js'
import { pays } from 'src/modules/shared/data/Pays.js'
import { pieces } from 'src/modules/shared/data/Pieces.js'
import { centres } from 'src/modules/shared/data/Centres.js'
import { matrimonial } from './Matrimonial.js'

const yaounde = arrondissements.find((a) => a.NOM_ARROND === 'YAOUNDE I') || arrondissements[0]
const cameroun = pays.find((p) => p.code_pays === 'CMR') || pays.find((p) => p.nationalite === 'CAMEROUNAISE')
const cni = pieces.find((p) => p.NUM_TYPEPIECE === '56') || pieces[0]
const centreYde = centres.find((c) => c.LIB_CENTRE.includes('Yaounde')) || centres[0]

/** Jeu de test régime 0 — assuré travailleur obligatoire (sans fichiers binaires). */
export const immatAssuTrvTestDataRegime0 = {
  mat_employeur: '123-1234567-123-A',
  NOM_COMMERCIAL: 'Orange Cameroon',
  RAISON_SOCIALE: 'Orange Cameroun',
  ADRESSE_EMPLOYEUR: 'YAOUNDE',
  DATE_EMB_PREM_TRAV: '25/10/1998',
  DATE_EMB_PRE_SALL: '01/03/2024',
  EFFECTIF_APPROX: 500,
  CODE_categ: 3,
  CODE_echelon: 'B',
  Specialite: 'TECHNICIEN',
  NiveauAss: 'BAC+2',
  ActuelRevenu: 450000,
  SMIG_VALUE: 36270,
  SEXE_PERS: 'MASCULIN',
  NOM_PERS: 'NDJENG',
  PRENOM_PERS: 'JEAN',
  DATE_NAISS_PERS: '15/06/1990',
  LOCALITE_NAISS: 'BAFOUSSAM',
  LieuNaiss: yaounde,
  civilite: matrimonial[1],
  NATIONALITEC: cameroun,
  typepiece: cni,
  NUM_PIECE: '123456789',
  DATE_PIECE: '10/01/2020',
  LIEU_PIECEC: yaounde,
  NOM_PERE: 'NDJENG',
  PRENOM_PERE: 'PAUL',
  DATE_NAISS_PERSP: '01/01/1960',
  LOCALITE_NAISS_PERE: 'BAFOUSSAM',
  LieuNaissPere: yaounde,
  etatP: 'Vivant',
  NOM_MERE: 'FOUDA',
  PRENOM_MERE: 'MARIE',
  DATE_NAISS_PERSM: '12/05/1965',
  LOCALITE_NAISS_MERE: 'DOUALA',
  LieuNaissMere: yaounde,
  etatM: 'Vivant',
  CODE_VILLEC: yaounde,
  QUARTIER: 'BASTOS',
  TEL_PERS: '+237 699 123 456',
  FAX_PERS: '',
  Adresse: 'RUE 1234 BASTOS',
  EMAIL_PERS: 'jean.ndjeng@example.cm',
  BP: 'BP 1000',
  CODE_CENTRECNPSC: centreYde,
  nombEnfa: 1,
  nombCert: 0,
  nombConj: 1,
  code_tele: '',
  code_secret: '',
  Dest: '',
}

/**
 * Applique les données de test sur le formulaire (fichiers à joindre manuellement).
 * @param {import('vue').Ref<object>} formRef
 */
export function applyImmatAssuTrvTestData(formRef) {
  const target = formRef.value ?? formRef
  Object.assign(target, {
    ...immatAssuTrvTestDataRegime0,
    avisEmbauche: target.avisEmbauche ?? null,
    pieceIdentite: target.pieceIdentite ?? null,
    declarationHonneur: target.declarationHonneur ?? null,
    actesNaissance: target.actesNaissance?.length ? target.actesNaissance : [],
    actesMariage: target.actesMariage?.length ? target.actesMariage : [],
    certificatsTravail: target.certificatsTravail ?? [],
  })
}

/** Fichiers factices pour tests locaux (navigateur / Node 18+). */
export function createMockImageFile(name = 'test.jpg') {
  if (typeof File === 'undefined') return null
  return new File([new Uint8Array([0xff, 0xd8, 0xff])], name, { type: 'image/jpeg' })
}

export const immatAssuTrvTestFilesRegime0 = {
  avisEmbauche: () => createMockImageFile('avis_embauche.jpg'),
  pieceIdentite: () => createMockImageFile('cni.jpg'),
  declarationHonneur: () => createMockImageFile('declaration.jpg'),
  acteNaissanceEnfant1: () => createMockImageFile('enfant1.jpg'),
  acteMariage1: () => createMockImageFile('mariage1.jpg'),
}

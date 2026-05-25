/**
 * Noms de champs alignés sur EnergizerDev — servlets PF (SaisieElementLiquidationPF, etc.).
 */
import {
  formatLegacyDate,
  toLegacyString,
  setLegacyCheckbox,
  buildLegacySearchParams,
} from 'src/utils/energizer/liquidationLegacyUtils.js'

export { buildLegacySearchParams as buildPfSearchApiParams }

/** POST /eltliquidationpf — SaisieElementLiquidationPF.java */
export const PF_ELEMENTS_LIQUIDATION_SUBMIT_FIELDS = [
  'txtsaisienumdoss',
  'txtSaisieDatepreacc',
  'txtSaisieDateeffacc',
  'txtSaisieDateDebConges',
  'txtSaisieCessationActivite',
  'txtSaisiefinconges',
  'chsaisieAP1',
  'chsaisieFM1',
  'chsaisieFraisMedicauxAcc',
  'txtSaisieProbablefinconges',
  'txtSaisieDateDebCessationPaiement',
  'txtSaisieFinCessationPaiement',
  'txtSaisierepriseactivite',
  'txtSaisieProbablejouissance',
  'chsaisieaccpremature',
  'txtSaisieDateExamen1',
  'chsaisieAP2',
  'chsaisieFM2',
  'txtSaisieDateExamen2',
  'chsaisieAcc',
  'txtsaisienbreenfantsviables',
  'txtsaisienbreenfantssouscontr',
  'chsaisieIj',
  'txtsaisienbrejoursij',
  'txtsaisienbrejourscouches',
  'chsaisiemode25',
  'txtsaisiesalnetreconstitue',
  'txtsaisiematinterne',
]

/** POST /eltliquidationaf — SaisieElementLiquidationAF.java */
export const PF_AF_SUBMIT_FIELDS = [
  'txtsaisienumdoss',
  'txtSaisieDateEmbauche',
  'txtSaisieDateSignatureEmpl',
  'txtSaisieNbreHeures',
]

/** POST /gestiondesreprises — GererReprise.java */
export const PF_REPRISE_SUBMIT_FIELDS = [
  'txtsaisienumdoss',
  'txtSaisiedatedebutreprise',
  'txtSaisiedatefinreprise',
  'txtsaisienbrejours',
  'txtsaisiereliquat',
  'cbxtype',
  'cbxrang',
  'cbxrembempl',
  'txtsaisienumempl',
  'txtSaisieDateDebutRembEmpl',
  'txtSaisieDateFinRembEmpl',
  'txtsaisiematassu',
]

/** POST /delnonreprise — DeleteReprise.java */
export const PF_REPRISE_DELETE_FIELDS = ['txtsaisienumdoss', 'cbxtype', 'cbxrang']

/** POST /gestionperiodeactivite — SaisiePeriodeActivite.java */
export const PF_PERIODE_SUBMIT_FIELDS = [
  'txtsaisiematassu',
  'txtsaisienumempl',
  'txtSaisiedatedebutreprise',
  'txtSaisiedatefinreprise',
  'cbxtype',
]

/** POST /gestpmd — PieceMaintientDroit.java */
export const PF_PMD_SUBMIT_FIELDS = [
  'txtsaisienumassu',
  'txtsaisienumbene',
  'txtsaisiedatedebut',
  'txtsaisiedatefin',
  'btnSubmit',
]

/** POST statSituationsDossiersParBranche.jsp */
export const PF_STATISTIQUES_FIELDS = ['cbxcentre', 'cbxbranche', 'txtvaleurdeb', 'txtvaleurfin']

/**
 * @param {Record<string, unknown>} form
 * @returns {Record<string, string>}
 */
export function buildPfElementsLiquidationApiPayload(form) {
  /** @type {Record<string, string>} */
  const payload = {
    txtsaisienumdoss: toLegacyString(form.txtsaisienumdoss),
    txtSaisieDatepreacc: formatLegacyDate(form.txtSaisieDatepreacc),
    txtSaisieDateeffacc: formatLegacyDate(form.txtSaisieDateeffacc),
    txtSaisieDateDebConges: formatLegacyDate(form.txtSaisieDateDebConges),
    txtSaisieCessationActivite: formatLegacyDate(form.txtSaisieCessationActivite),
    txtSaisiefinconges: formatLegacyDate(form.txtSaisiefinconges),
    txtSaisieProbablefinconges: formatLegacyDate(form.txtSaisieProbablefinconges),
    txtSaisieDateDebCessationPaiement: formatLegacyDate(form.txtSaisieDateDebCessationPaiement),
    txtSaisieFinCessationPaiement: formatLegacyDate(form.txtSaisieFinCessationPaiement),
    txtSaisierepriseactivite: formatLegacyDate(form.txtSaisierepriseactivite),
    txtSaisieProbablejouissance: formatLegacyDate(form.txtSaisieProbablejouissance),
    txtSaisieDateExamen1: formatLegacyDate(form.txtSaisieDateExamen1),
    txtSaisieDateExamen2: formatLegacyDate(form.txtSaisieDateExamen2),
    txtsaisienbreenfantsviables: toLegacyString(form.txtsaisienbreenfantsviables),
    txtsaisienbreenfantssouscontr: toLegacyString(form.txtsaisienbreenfantssouscontr),
    txtsaisienbrejoursij: toLegacyString(form.txtsaisienbrejoursij),
    txtsaisienbrejourscouches: toLegacyString(form.txtsaisienbrejourscouches),
    txtsaisiesalnetreconstitue: toLegacyString(form.txtsaisiesalnetreconstitue),
    txtsaisiematinterne: toLegacyString(form.txtsaisiematinterne),
  }

  setLegacyCheckbox(payload, 'chsaisieAP1', form.chsaisieAP1)
  setLegacyCheckbox(payload, 'chsaisieFM1', form.chsaisieFM1)
  setLegacyCheckbox(payload, 'chsaisieAP2', form.chsaisieAP2)
  setLegacyCheckbox(payload, 'chsaisieFM2', form.chsaisieFM2)
  setLegacyCheckbox(payload, 'chsaisieAcc', form.chsaisieAcc)
  setLegacyCheckbox(payload, 'chsaisieIj', form.chsaisieIj)
  setLegacyCheckbox(payload, 'chsaisieaccpremature', form.chsaisieaccpremature)
  setLegacyCheckbox(payload, 'chsaisieFraisMedicauxAcc', form.chsaisieFraisMedicauxAcc)
  setLegacyCheckbox(payload, 'chsaisiemode25', form.chsaisiemode25)

  return payload
}

/**
 * @param {Record<string, unknown>} form
 */
export function buildPfAllocationFamilialeApiPayload(form) {
  return {
    txtsaisienumdoss: toLegacyString(form.txtsaisienumdoss),
    txtSaisieDateEmbauche: formatLegacyDate(form.txtSaisieDateEmbauche),
    txtSaisieDateSignatureEmpl: formatLegacyDate(form.txtSaisieDateSignatureEmpl),
    txtSaisieNbreHeures: toLegacyString(form.txtSaisieNbreHeures),
  }
}

/**
 * @param {Record<string, unknown>} form
 */
export function buildPfRepriseApiPayload(form) {
  return {
    txtsaisienumdoss: toLegacyString(form.txtsaisienumdoss),
    txtSaisiedatedebutreprise: formatLegacyDate(form.txtSaisiedatedebutreprise),
    txtSaisiedatefinreprise: formatLegacyDate(form.txtSaisiedatefinreprise),
    txtsaisienbrejours: toLegacyString(form.txtsaisienbrejours),
    txtsaisiereliquat: toLegacyString(form.txtsaisiereliquat),
    cbxtype: toLegacyString(form.cbxtype),
    cbxrang: toLegacyString(form.cbxrang),
    cbxrembempl: toLegacyString(form.cbxrembempl),
    txtsaisienumempl: toLegacyString(form.txtsaisienumempl),
    txtSaisieDateDebutRembEmpl: formatLegacyDate(form.txtSaisieDateDebutRembEmpl),
    txtSaisieDateFinRembEmpl: formatLegacyDate(form.txtSaisieDateFinRembEmpl),
    txtsaisiematassu: toLegacyString(form.txtsaisiematassu),
  }
}

/**
 * @param {Record<string, unknown>} form
 */
export function buildPfRepriseDeleteApiPayload(form) {
  return {
    txtsaisienumdoss: toLegacyString(form.txtsaisienumdoss),
    cbxtype: toLegacyString(form.cbxtype),
    cbxrang: toLegacyString(form.cbxrang),
  }
}

/**
 * @param {Record<string, unknown>} form
 */
export function buildPfPeriodeActiviteApiPayload(form) {
  return {
    txtsaisiematassu: toLegacyString(form.txtsaisiematassu),
    txtsaisienumempl: toLegacyString(form.txtsaisienumempl),
    txtSaisiedatedebutreprise: formatLegacyDate(form.txtSaisiedatedebutreprise),
    txtSaisiedatefinreprise: formatLegacyDate(form.txtSaisiedatefinreprise),
    cbxtype: toLegacyString(form.cbxtype),
  }
}

/**
 * @param {Record<string, unknown>} form
 * @param {{ action?: 'save' | 'delete' }} [options]
 */
export function buildPfPmdApiPayload(form, options = {}) {
  const action = options.action === 'delete' ? '2' : '1'
  return {
    txtsaisienumassu: toLegacyString(form.txtsaisienumassu),
    txtsaisienumbene: toLegacyString(form.txtsaisienumbene),
    txtsaisiedatedebut: formatLegacyDate(form.txtsaisiedatedebut),
    txtsaisiedatefin: formatLegacyDate(form.txtsaisiedatefin),
    btnSubmit: action,
  }
}

/**
 * @param {{ centre?: string, branche?: string, periodeDebut?: string, periodeFin?: string }} filters
 */
export function buildPfStatistiquesApiPayload(filters) {
  return {
    cbxcentre: toLegacyString(filters.cbxcentre),
    cbxbranche: toLegacyString(filters.cbxbranche),
    txtvaleurdeb: formatLegacyDate(filters.txtvaleurdeb),
    txtvaleurfin: formatLegacyDate(filters.txtvaleurfin),
  }
}

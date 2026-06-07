/**
 * Couche intermédiaire — convertit le state Vue/Pinia (noms internes)
 * en paramètres legacy EnergizerDev avant tout appel HTTP.
 *
 * Référence : EnergizerDev (register.js, servlets cm.sapelli.*).
 * Les composants et stores passent `form` / `filters` ; seul cet adaptateur
 * produit les clés attendues par le backend.
 */
import {
  buildNouveauDossierApiPayload,
  buildNouveauDossierPiecesApiPayload,
} from 'src/modules/energizer/data/nouveauDossierLegacyFields.js'
import {
  buildRpDeclarationApiPayload,
  buildRpCertificatInitApiPayload,
  buildRpCertificatDecesApiPayload,
  buildRpNoteFraisApiPayload,
  buildRpTiersBeneficiaireApiPayload,
} from 'src/modules/energizer/data/liquidationRpLegacyFields.js'
import {
  buildPfElementsLiquidationApiPayload,
  buildPfAllocationFamilialeApiPayload,
  buildPfRepriseApiPayload,
  buildPfRepriseDeleteApiPayload,
  buildPfPeriodeActiviteApiPayload,
  buildPfPmdApiPayload,
  buildPfStatistiquesApiPayload,
} from 'src/modules/energizer/data/liquidationPfLegacyFields.js'
import { buildLegacySearchParams } from 'src/modules/energizer/utils/liquidationLegacyUtils.js'

/** @typedef {typeof LegacyOperation[keyof typeof LegacyOperation]} LegacyOperationId */

export const LegacyOperation = Object.freeze({
  NOUVEAU_DOSSIER_SUBMIT: 'nouveauDossier.submit',
  NOUVEAU_DOSSIER_PIECES: 'nouveauDossier.pieces',
  RP_SEARCH: 'rp.search',
  RP_DECLARATION: 'rp.declaration',
  RP_CERTIFICAT_INIT: 'rp.certificatInit',
  RP_CERTIFICAT_DECES: 'rp.certificatDeces',
  RP_NOTE_FRAIS: 'rp.noteFrais',
  RP_TIERS_BENEFICIAIRE: 'rp.tiersBeneficiaire',
  PF_SEARCH: 'pf.search',
  PF_ELEMENTS_LIQUIDATION: 'pf.elementsLiquidation',
  PF_ALLOCATION_FAMILIALE: 'pf.allocationFamiliale',
  PF_REPRISE: 'pf.reprise',
  PF_REPRISE_DELETE: 'pf.repriseDelete',
  PF_PERIODE_ACTIVITE: 'pf.periodeActivite',
  PF_PMD: 'pf.pmd',
  PF_STATISTIQUES: 'pf.statistiques',
})

/**
 * @param {Record<string, unknown>} payload
 * @param {string[]} allowedKeys
 * @returns {Record<string, unknown>}
 */
export function pickLegacyFields(payload, allowedKeys) {
  /** @type {Record<string, unknown>} */
  const out = {}
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      out[key] = payload[key]
    }
  }
  return out
}

/**
 * @param {LegacyOperationId} operation
 * @param {unknown} source Données Vue (form, filters, contexte pièces…)
 * @param {Record<string, unknown>} [options] Options complémentaires (ex. action PMD)
 * @returns {Record<string, unknown>}
 */
export function toLegacyApiPayload(operation, source, options = {}) {
  switch (operation) {
    case LegacyOperation.NOUVEAU_DOSSIER_SUBMIT:
      return /** @type {Record<string, unknown>} */ (
        buildNouveauDossierApiPayload(/** @type {Record<string, unknown>} */ (source))
      )

    case LegacyOperation.NOUVEAU_DOSSIER_PIECES: {
      const input = /** @type {{ context: Record<string, unknown>, pieceRows: unknown[], username?: string }} */ (
        source
      )
      return /** @type {Record<string, unknown>} */ (
        buildNouveauDossierPiecesApiPayload(
          input.context,
          input.pieceRows,
          { username: input.username },
        )
      )
    }

    case LegacyOperation.RP_SEARCH:
    case LegacyOperation.PF_SEARCH:
      return /** @type {Record<string, unknown>} */ (
        buildLegacySearchParams(/** @type {Record<string, unknown>} */ (source))
      )

    case LegacyOperation.RP_DECLARATION:
      return /** @type {Record<string, unknown>} */ (
        buildRpDeclarationApiPayload(/** @type {Record<string, unknown>} */ (source))
      )

    case LegacyOperation.RP_CERTIFICAT_INIT:
      return /** @type {Record<string, unknown>} */ (
        buildRpCertificatInitApiPayload(/** @type {Record<string, unknown>} */ (source))
      )

    case LegacyOperation.RP_CERTIFICAT_DECES:
      return /** @type {Record<string, unknown>} */ (
        buildRpCertificatDecesApiPayload(/** @type {Record<string, unknown>} */ (source))
      )

    case LegacyOperation.RP_NOTE_FRAIS:
      return /** @type {Record<string, unknown>} */ (
        buildRpNoteFraisApiPayload(/** @type {Record<string, unknown>} */ (source))
      )

    case LegacyOperation.RP_TIERS_BENEFICIAIRE:
      return /** @type {Record<string, unknown>} */ (
        buildRpTiersBeneficiaireApiPayload(/** @type {Record<string, unknown>} */ (source))
      )

    case LegacyOperation.PF_ELEMENTS_LIQUIDATION:
      return /** @type {Record<string, unknown>} */ (
        buildPfElementsLiquidationApiPayload(/** @type {Record<string, unknown>} */ (source))
      )

    case LegacyOperation.PF_ALLOCATION_FAMILIALE:
      return /** @type {Record<string, unknown>} */ (
        buildPfAllocationFamilialeApiPayload(/** @type {Record<string, unknown>} */ (source))
      )

    case LegacyOperation.PF_REPRISE:
      return /** @type {Record<string, unknown>} */ (
        buildPfRepriseApiPayload(/** @type {Record<string, unknown>} */ (source))
      )

    case LegacyOperation.PF_REPRISE_DELETE:
      return /** @type {Record<string, unknown>} */ (
        buildPfRepriseDeleteApiPayload(/** @type {Record<string, unknown>} */ (source))
      )

    case LegacyOperation.PF_PERIODE_ACTIVITE:
      return /** @type {Record<string, unknown>} */ (
        buildPfPeriodeActiviteApiPayload(/** @type {Record<string, unknown>} */ (source))
      )

    case LegacyOperation.PF_PMD:
      return /** @type {Record<string, unknown>} */ (
        buildPfPmdApiPayload(/** @type {Record<string, unknown>} */ (source), {
          action: options.action === 'delete' ? 'delete' : 'save',
        })
      )

    case LegacyOperation.PF_STATISTIQUES:
      return /** @type {Record<string, unknown>} */ (
        buildPfStatistiquesApiPayload(/** @type {Record<string, unknown>} */ (source))
      )

    default:
      throw new Error(`Opération legacy inconnue : ${operation}`)
  }
}

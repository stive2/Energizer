/**
 * Simulation de l'enregistrement — servlet cm.sapelli.NouvDossier (POST nouvdossier).
 * Cas nominaux et alternatifs pour développement sans backend.
 */
import { NOUVEAU_DOSSIER_TEST_ASSURES } from 'src/modules/energizer/data/nouveauDossierTestData.js'
import { isValidMatriculeAssure, isValidMatriculeEmployeur } from 'src/modules/energizer/composables/useNouveauDossierRules.js'
import { isTeleCircuitCode } from 'src/modules/energizer/utils/nouveauDossierCircuits.js'
import { normalizeMatriculeEmployeur } from 'src/modules/assure/api/depotPrestationPfUtils.js'
import { getConnectedAgentContext } from 'src/modules/energizer/utils/nouveauDossierAgentContext.js'
import { isFieldActive } from 'src/modules/energizer/utils/nouveauDossierFieldState.js'

export class NouveauDossierSubmitError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NouveauDossierSubmitError'
  }
}

let dossierSequence = 0

function delay(ms = 350) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function generateNumDossier(payload) {
  dossierSequence += 1
  const codePres = payload.code_pres || 'G'
  const codeCentre = (payload.code_centre || '001').padStart(3, '0').slice(0, 3)
  const seq = String(dossierSequence).padStart(11, '0')
  return `${codePres}${codeCentre}${seq}`
}

/**
 * Contrôles métier simplifiés alignés sur NouvDossier.java.
 * @param {Record<string, unknown>} payload Payload legacy (via energizerLegacyAdapter).
 * @param {{ fieldState?: Record<string, { enabled?: boolean }>, teleImported?: boolean }} [options]
 */
export function validateNouveauDossierSubmit(payload, options = {}) {
  const fieldState = options.fieldState
  const teleImported = options.teleImported === true
  const codePres = payload.code_pres
  const codeCentre = payload.code_centre
  const numassu = (payload.numassu || '').trim()
  const matEmployeur = normalizeMatriculeEmployeur(payload.mat_employeur)
  const codeCircuit = payload.code_circuit

  if (numassu && !isValidMatriculeAssure(numassu)) {
    throw new NouveauDossierSubmitError(
      'Matricule assuré invalide. Vérifiez le format (ex. 321-1234567-0).',
    )
  }

  if (matEmployeur && !isValidMatriculeEmployeur(matEmployeur)) {
    throw new NouveauDossierSubmitError('Matricule employeur invalide.')
  }

  if (
    isTeleCircuitCode(codeCircuit) &&
    (!payload.code_tele_enreg?.trim() || !payload.code_secret?.trim())
  ) {
    throw new NouveauDossierSubmitError(
      'Le circuit du dossier « Télé-immatriculation » nécessite le code de téléenregistrement et le code secret.',
    )
  }

  if (isTeleCircuitCode(codeCircuit)) {
    if (
      payload.code_tele_enreg === 'DUPLICATE' ||
      payload.code_secret === 'duplicate'
    ) {
      throw new NouveauDossierSubmitError(
        'Un dossier existe déjà avec ces paramètres de télé-immatriculation.',
      )
    }
    if (payload.code_tele_enreg === 'INVALIDE') {
      throw new NouveauDossierSubmitError(
        'Enregistrement télé-immatriculation absent, vérifiez les paramètres.',
      )
    }
    const teleImportedOk = teleImported
    if ((codePres === 'A' || codePres === 'E') && !teleImportedOk) {
      throw new NouveauDossierSubmitError(
        'Validez les codes de télé-immatriculation avant d’enregistrer le dossier.',
      )
    }
  }

  const numassuRequired = fieldState ? isFieldActive('numassu', fieldState) : false

  if (numassuRequired && numassu) {
    if (codeCentre === '001') {
      throw new NouveauDossierSubmitError(
        `Le dossier de l'assuré ${numassu} ne peut être enregistré au centre 001 ; utilisez un autre centre de gestion.`,
      )
    }
    if (!NOUVEAU_DOSSIER_TEST_ASSURES[numassu]) {
      throw new NouveauDossierSubmitError(
        `L'assuré ${numassu} n'existe pas dans le référentiel.`,
      )
    }
  }

  if (numassuRequired && !numassu) {
    throw new NouveauDossierSubmitError('Le numéro assuré est obligatoire pour ce type de dossier.')
  }

  if (codePres === 'P' && payload.revision === 'OUI' && numassu === '321-1256447-9') {
    throw new NouveauDossierSubmitError(
      'Aucun droit en pension enregistré sous ce numéro assuré (révision de droits impossible).',
    )
  }

  if (codePres === 'P' && numassu === '321-8888888-8') {
    throw new NouveauDossierSubmitError(
      "Un dossier de pension est déjà en cours de traitement pour cet assuré.",
    )
  }

  if (
    codePres === 'R' &&
    numassu === '321-1234567-0' &&
    payload.dateaccident === '05/01/2026' &&
    payload.datedeclaration === '10/01/2026'
  ) {
    throw new NouveauDossierSubmitError(
      `Accident survenu le ${payload.dateaccident} et déjà connu dans le système.`,
    )
  }

  if (matEmployeur === '999-INVALID-Z') {
    throw new NouveauDossierSubmitError(
      `L'employeur ${matEmployeur} n'existe pas au centre sélectionné.`,
    )
  }
}

/**
 * @param {Record<string, unknown>} payload
 * @param {{ append: (record: Record<string, unknown>) => void }} storage
 * @param {{ fieldState?: Record<string, { enabled?: boolean }>, teleImported?: boolean }} [validationContext]
 */
export async function mockSubmitNouveauDossier(payload, storage, validationContext = {}) {
  await delay()
  validateNouveauDossierSubmit(payload, validationContext)

  const agent = getConnectedAgentContext()
  const num_dossier = generateNumDossier(payload)
  const now = new Date().toISOString()
  const record = {
    id: num_dossier,
    num_dossier,
    code_type_pres: num_dossier,
    libelle_type_pres: payload.objet || '',
    ...payload,
    mat_employeur: payload.mat_employeur
      ? normalizeMatriculeEmployeur(payload.mat_employeur)
      : payload.mat_employeur,
    date_enreg: now,
    createdAt: now,
    code_situ: 'En Attente',
    localisation: 'Réception',
    agentMatricule: agent.matricule,
    agentLogin: agent.login,
    agentName: agent.name,
  }

  storage.append(record)

  let message = 'Dossier enregistré avec succès.'
  if (payload.code_pres === 'X') {
    message = "Votre demande d'attestation pour soumission a été enregistrée avec succès."
  }

  return {
    success: true,
    num_dossier,
    code_type_pres: num_dossier,
    message,
    redirect: 'addpiece',
  }
}

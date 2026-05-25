import { NOUVEAU_DOSSIER_OBJETS, DEFAULT_CIRCUITS } from 'src/data/energizer/nouveauDossierTypes.js'
import {
  NOUVEAU_DOSSIER_NATURE_PRESTATIONS,
  NOUVEAU_DOSSIER_OBJET_TELE_ASSURE,
  NOUVEAU_DOSSIER_TEST_ASSURES,
  NOUVEAU_DOSSIER_TEST_EMPLOYEURS,
  NOUVEAU_DOSSIER_TELE_ASSURE_OK,
  NOUVEAU_DOSSIER_TELE_EMPLOYEUR_OK,
  NOUVEAU_DOSSIER_TELE_DUPLICATE,
} from 'src/data/energizer/nouveauDossierTestData.js'
import { formatTodayFr } from 'src/composables/energizer/useNouveauDossierRules.js'
import { mockSubmitNouveauDossier as runMockSubmit } from './nouveauDossierSubmitMock.js'
import {
  appendAgentReceptionDossier,
  listAgentReceptionDossiers,
} from './nouveauDossierStorageMock.js'

export function mockFetchNouveauDossierObjets() {
  const today = formatTodayFr()
  const all = [...NOUVEAU_DOSSIER_OBJETS, NOUVEAU_DOSSIER_OBJET_TELE_ASSURE]
  return all.map((o) => ({ ...o, today, code_pres: o.code_pres }))
}

export function mockFetchNaturePrestations() {
  return NOUVEAU_DOSSIER_NATURE_PRESTATIONS
}

export function mockFetchTypeCircuits() {
  return DEFAULT_CIRCUITS
}

export function mockFetchInfoAssure(mat) {
  const row = NOUVEAU_DOSSIER_TEST_ASSURES[mat]
  if (!row) {
    return { root: [] }
  }
  return { root: [row] }
}

export function mockFetchInfoEmployeur(mat) {
  const row = NOUVEAU_DOSSIER_TEST_EMPLOYEURS[mat]
  if (!row) {
    return []
  }
  return [row]
}

export function mockTeleimportation(params) {
  const { code_tele, code_secret, objet } = params
  if (code_tele === 'DUPLICATE' || code_secret === 'duplicate') {
    return { root: [NOUVEAU_DOSSIER_TELE_DUPLICATE] }
  }
  if (!code_tele || !code_secret) {
    return { root: [null] }
  }
  if (objet === 'A' && code_tele === 'DEMO-ASS-001' && code_secret === 'secret2026') {
    return { root: [NOUVEAU_DOSSIER_TELE_ASSURE_OK] }
  }
  if (objet === 'E' && code_tele === 'DEMO-EMP-001' && code_secret === 'secret2026') {
    return { root: [NOUVEAU_DOSSIER_TELE_EMPLOYEUR_OK] }
  }
  return { root: [null] }
}

export function mockSubmitNouveauDossier(payload, validationContext = {}) {
  return runMockSubmit(payload, { append: appendAgentReceptionDossier }, validationContext)
}

export function mockListSavedDossiers() {
  return listAgentReceptionDossiers()
}

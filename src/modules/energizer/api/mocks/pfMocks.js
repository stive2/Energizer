export const MOCK_PF_DOSSIERS = [
  {
    numdoss: 'PF-2026-001',
    numassu: '321-1234567-0',
    nomassu: 'KAMGA Jean-Pierre',
    situation: 'En Cours de Traitement',
    ij: 'NON',
    accprema: 'NON',
    basecal: '30',
  },
]

export const MOCK_REPRISES = [
  { id: '1', numdoss: 'PF-2026-001', numassu: '321-1234567-0', datedebut: '01/01/2026' },
]

export const MOCK_PERIODES = [
  { id: '1', numassu: '321-1234567-0', typeoperation: 'AJOUT' },
]

export const MOCK_PMD = [
  { id: '1', numdoss: 'PF-2026-001', typepiece: 'CERTIFICAT' },
]

export function mockSearchPfDossiers() {
  return []
}

export function mockSubmitOk(payload) {
  return { success: true, ...payload }
}

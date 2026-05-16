const MOCK_EMPLOYERS = {
  '1-20-97-001234': 'BATCOM SARL',
  '1-20-97-005678': 'CHIMIE BASSA SARL',
  '1-20-97-009012': 'CABINET CONSEIL SUD',
  '201-1234567-A': 'SOCIÉTÉ DEMO SARL',
}

export function mockFetchRpEmployeur(mat) {
  const rs = MOCK_EMPLOYERS[mat]
  if (!rs) throw new Error('EMPLOYEUR_NOT_FOUND')
  return { raison_sociale: rs, nomemployeur: rs }
}

export function mockSearchRpDossiers() {
  return [
    { numdossier: 'AT-2026-001', numassure: '321-1234567-0', nomassure: 'KAMGA Jean-Pierre' },
    { numdossier: 'AT-2026-002', numassure: '321-1234567-123-0', nomassure: 'MBALLA Sylvie' },
  ]
}

export function mockNotesFraisMeta() {
  return {
    dossiers: mockSearchRpDossiers(),
    objets: [
      { code: 'FRAIS_MED', libelle: 'Frais médicaux' },
      { code: 'FRAIS_TRANS', libelle: 'Frais de transport' },
    ],
    tiers: {
      '321-1234567-0': [{ code: 'T1', libelle: 'Dr. NGONO' }],
    },
  }
}

export function mockSubmitOk(payload) {
  return { success: true, ...payload }
}

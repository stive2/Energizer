import { fictifApiRechercheEmployeurParMatricule } from './fictifEmployeurDepotPfApi.js'

export const MOCK_ASSURE_CONTEXTE = {
  numAssu: '321-1234567-0',
  nom: 'KAMGA',
  prenom: 'Marie-Claire',
  dateNaissance: '15/03/1990',
  sexe: 'F',
  civilite: 'Mme',
  EMAIL_PERS: 'marie-claire.kamga@example.cm',
  TEL_PERS: '+237 677 123 456',
  Adresse: 'YAOUNDE, CAMEROUN',
  mat_interne: 'EMP-2024-001',
}

export function mockLoadAssureContexte() {
  return Promise.resolve({ ...MOCK_ASSURE_CONTEXTE })
}

/** @deprecated Utiliser fictifApiRechercheEmployeurParMatricule */
export async function mockFetchEmployeur(matricule) {
  const { data } = await fictifApiRechercheEmployeurParMatricule(matricule)
  return data
}

export function mockSubmitDepotPrestationPf() {
  return Promise.resolve({
    success: true,
    Msg: 'Dossier enregistré avec succès.',
    nextPage: null,
  })
}

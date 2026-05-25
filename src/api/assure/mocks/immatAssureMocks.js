/** Réponse mock alignée sur onSuccessOrFail (traitementFm1.js). */
export function mockSubmitTeleImmatAssure() {
  return Promise.resolve({
    success: true,
    message: 'Dossier télé-immatriculation enregistré avec succès (mock).',
    nextPage: null,
  })
}

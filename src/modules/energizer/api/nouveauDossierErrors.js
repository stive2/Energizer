export class NouveauDossierSubmitError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NouveauDossierSubmitError'
  }
}

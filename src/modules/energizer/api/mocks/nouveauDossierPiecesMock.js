/**
 * Mocks — finalize (end.jsp), corbeille jAccueil, persistance pièces.
 */
function delay(ms = 300) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const jaccueilStore = []

export function mockJaccueilDossiers(currentNumdossier) {
  const rows = [
    {
      num_dossier: currentNumdossier,
      nom_requerant: 'Dossier en cours',
      telephone: '',
      adresse: '',
      myobjet: '',
      datedemande: '',
      etape: 'Accueil',
      date_position: new Date().toLocaleDateString('fr-FR'),
    },
    {
      num_dossier: 'E3210000000000000244',
      nom_requerant: 'KOUDRI SARL',
      telephone: '699000000',
      adresse: 'YAOUNDE',
      myobjet: 'IMMEM',
      datedemande: '08-07-2010',
      etape: 'Accueil',
      date_position: '08-07-2010',
    },
    {
      num_dossier: 'F3210000000000000990735',
      nom_requerant: 'NKOLO MBA CELESTE',
      telephone: '',
      adresse: '',
      myobjet: 'PF',
      datedemande: '20-05-2026',
      etape: 'Pause',
      date_position: '20-05-2026',
    },
  ]
  return rows.filter(
    (r, i, arr) => arr.findIndex((x) => x.num_dossier === r.num_dossier) === i,
  )
}

export async function mockFinalizeDossier(numdossier) {
  await delay(300)
  jaccueilStore.push({
    num_dossier: numdossier,
    finalizedAt: new Date().toISOString(),
  })
  return {
    ok: true,
    message: `Dossier ${numdossier} finalisé (simulation end.jsp).`,
    code_situ: 'Receptionne',
    etape: 'Accueil',
  }
}

export async function mockPersistPieces(piecesPayload) {
  await delay(200)
  const count = Number.parseInt(String(piecesPayload?.psize ?? '0'), 10) || 0
  return {
    ok: true,
    numdossier: piecesPayload?.numdossier,
    count,
  }
}

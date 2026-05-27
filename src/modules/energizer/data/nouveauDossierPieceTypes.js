/**
 * Types de pièces (jtypepiece) — données fictives par natu_prestation (addpiece.jsp).
 * Format valeur select : num_typepiece + '_' + libelle
 */
const BASE_PIECES = {
  PVID: [
    { num_typepiece: '97', libelle: "Attestation d Incapacité de Travail" },
    { num_typepiece: '25', libelle: 'Certificat Vie' },
    { num_typepiece: '12', libelle: 'Demande de Pension' },
    { num_typepiece: '88', libelle: 'Bulletin de Salaire' },
  ],
  PF: [
    { num_typepiece: '40', libelle: 'Acte de Naissance' },
    { num_typepiece: '41', libelle: 'Certificat de Scolarité' },
    { num_typepiece: '42', libelle: 'Attestation de Vie' },
  ],
  RP: [
    { num_typepiece: '50', libelle: 'Acte de Décès' },
    { num_typepiece: '51', libelle: 'Demande de Rente' },
    { num_typepiece: '52', libelle: 'Certificat Médical' },
  ],
  IMMAS: [
    { num_typepiece: '157', libelle: "Autorisation/Arreté d'ouverture" },
    { num_typepiece: '10', libelle: "Demande d'Immatriculation Assuré" },
    { num_typepiece: '11', libelle: 'Pièce Identité' },
  ],
  IMMEM: [
    { num_typepiece: '120', libelle: "Demande d'Immatriculation Employeur" },
    { num_typepiece: '121', libelle: 'Registre Commerce' },
    { num_typepiece: '122', libelle: 'Statuts' },
    { num_typepiece: '123', libelle: 'Carte Contribuable' },
    { num_typepiece: '124', libelle: 'Plan Localisation' },
  ],
  REAS: [
    { num_typepiece: '200', libelle: 'Demande de Révision' },
    { num_typepiece: '201', libelle: 'Justificatif de Droits' },
  ],
  REMP: [
    { num_typepiece: '210', libelle: 'Demande de Révision Employeur' },
  ],
}

export function getPieceTypesForObjet(objet) {
  const list = BASE_PIECES[objet] ?? BASE_PIECES.PVID
  return list.map((p) => ({
    ...p,
    value: `${p.num_typepiece}_${p.libelle}`,
    label: `${p.num_typepiece}_${p.libelle}`,
  }))
}

/** Pièces déjà en base pour addpieceRecep (démo). */
export function getMockExistingPiecesForDossier(numdossier) {
  const prefix = (numdossier || '').charAt(0)
  if (prefix === 'E') {
    return [
      {
        id: '1',
        person: "120_Demande d'Immatriculation Employeur",
        titulaire: 'KOUDRI SARL',
        dateDep: '13-07-2010',
        dateVal: '13-07-2010',
        observ: '+COPIE RAPPORT DE CONTROLE',
        nbre: '3',
        verifiee: 'OUI',
        num_typepiece: '120',
        num_ordre: '1',
      },
      {
        id: '2',
        person: '121_Registre Commerce',
        titulaire: 'KOUDRI SARL',
        dateDep: '13-07-2010',
        dateVal: '13-07-2010',
        observ: 'PHOTOCOPIE',
        nbre: '1',
        verifiee: 'OUI',
        num_typepiece: '121',
        num_ordre: '2',
      },
    ]
  }
  return [
    {
      id: '1',
      person: '25_Certificat Vie',
      titulaire: 'DEMO ASSURE',
      dateDep: '20-05-2026',
      dateVal: '18-05-2026',
      observ: '',
      nbre: '1',
      verifiee: 'OUI',
      num_typepiece: '25',
      num_ordre: '1',
    },
  ]
}

export const NBRE_PIECE_OPTIONS = Array.from({ length: 15 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1),
}))

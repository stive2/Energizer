import { prestationTypes } from 'src/data/nouveauDossier/prestationTypes.js'

function todayFr() {
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

export function mockFetchInfoAssure() {
  return {
    nom_complet: 'KAMGA Jean-Pierre',
    date_naiss: '12/03/1975',
    centre_ges: 'CPS YAOUNDE INDEPENDANCE',
    pre_depot_pvid: null,
    ecart_mois_60: -5,
  }
}

export function mockFetchInfoEmployeur() {
  return {
    RAISON_SOCIALE: 'SOCIÉTÉ DEMO SARL',
    ADRESSE_EMPLOYEUR: 'Douala, Akwa',
    BOITE_POSTALE: 'BP 1234',
    REGIME_CNPS: 'Général',
    CODE_GPE_RISQUE: 'A',
    CODE_CENTRE: '201',
  }
}

export function mockFetchTeleImportation({ code_tele, code_secret, objet }) {
  if (objet === 'A' && code_tele === 'DEMO-ASS-001' && code_secret === 'secret2026') {
    return {
      ok: true,
      fields: {
        tele_nom: 'KAMGA Jean-Pierre',
        tele_date_naiss: '12/03/1975',
        tele_lieu_naiss: 'Yaoundé',
        tele_empl: 'CNPS DEMO',
        tele_date_emb: '01/01/2010',
        tele_date_enreg: todayFr(),
      },
      date_demande: todayFr(),
      typeimmas: 'O',
      existingDossierNum: null,
    }
  }
  if (objet === 'E' && code_tele === 'DEMO-EMP-001' && code_secret === 'secret2026') {
    return {
      ok: true,
      fields: {
        tele_raison: 'SOCIÉTÉ DEMO SARL',
        tele_nom: 'DEMO COMMERCE',
        tele_regime: 'Douala',
        tele_risque: 'Akwa',
        date_effet: '01/06/2020',
        tele_date_enreg: todayFr(),
      },
      date_demande: todayFr(),
      typeimmas: null,
      existingDossierNum: null,
    }
  }
  if (code_tele === 'EXIST-001') {
    return { ok: false, existingDossierNum: 'DOS-2026-0042' }
  }
  throw new Error('NOT_FOUND')
}

export function mockListDossiers() {
  try {
    const raw = localStorage.getItem('energizer-nouveau-dossiers')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function mockSaveDossier(record) {
  const list = mockListDossiers().filter((r) => !String(r.id).startsWith('DOS-DEMO-'))
  const entry = {
    ...record,
    id: record.id || `DOS-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  list.unshift(entry)
  localStorage.setItem('energizer-nouveau-dossiers', JSON.stringify(list))
  return entry
}

export function mockPrestationTypes() {
  return prestationTypes
}

/**
 * Filtre client aligné sur les JSP EnergizerDev (elementsLiquidationPF, gestionDesReprises,
 * gestionPieceMaintientDroit) : LIKE %valeurdeb% côté serveur ; txtvaleurfin appliqué ici
 * (borne haute lexicographique pour texte, plage de dates pour fdatepmd).
 */

function dateToSortKey(value) {
  const raw = String(value ?? '').trim().replace(/\//g, '-')
  const m = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (m) return `${m[3]}${m[2]}${m[1]}`
  return raw.toUpperCase()
}

export function dossierFieldByCritere(row, critere) {
  if (critere === 'fnumassu') return String(row.numassu ?? '').toUpperCase()
  if (critere === 'fnomassu') {
    return `${String(row.nomassu ?? '')} ${String(row.prenomassu ?? '')}`.toUpperCase().trim()
  }
  if (critere === 'fnombene') {
    return `${String(row.nombene ?? '')} ${String(row.prenombene ?? '')}`.toUpperCase().trim()
  }
  if (critere === 'fdatepmd') return dateToSortKey(row.datedebut)
  return String(row.numdoss ?? row.numdossier ?? '').toUpperCase()
}

export function filterPfDossiersByCriteria(list, { critere, start, end } = {}) {
  const needle = String(start ?? '').toUpperCase().trim()
  const endVal = String(end ?? '').toUpperCase().trim()
  if (!needle && !endVal) return [...list]

  if (critere === 'fdatepmd') {
    const startKey = dateToSortKey(start)
    const endKey = dateToSortKey(end)
    return list.filter((row) => {
      const key = dateToSortKey(row.datedebut)
      if (!key) return false
      if (startKey && key < startKey) return false
      if (endKey && key > endKey) return false
      return true
    })
  }

  return list.filter((row) => {
    const value = dossierFieldByCritere(row, critere)
    if (!value) return false
    if (needle && !value.includes(needle)) return false
    if (endVal && value > endVal) return false
    return true
  })
}

export function normalizePfDossierRow(row = {}) {
  return {
    ...row,
    numdoss: row.numdoss ?? row.num_dossier ?? '',
    numassu: row.numassu ?? row.num_assu ?? '',
    requerant: row.requerant ?? row.nom_requerant ?? '',
    datedemande: row.datedemande ?? row.date_demande ?? '',
    natupres: row.natupres ?? row.natu_pres ?? '',
    libellenatupres: row.libellenatupres ?? row.libelle_natu_pres ?? row.natupres ?? row.natu_pres ?? '',
    position: row.position ?? row.code_situ ?? '',
    dateposi: row.dateposi ?? row.date_situ ?? '',
    nomassu: row.nomassu ?? row.nom_assu ?? '',
    prenomassu: row.prenomassu ?? row.prenom_assu ?? '',
    dateembauche: row.dateembauche ?? row.date_embauche ?? row.date_embauche_assu ?? '',
    datesignempl: row.datesignempl ?? row.date_sign_empl ?? '',
    nbreheure: row.nbreheure ?? row.nbre_heure ?? row.heure_trav_mois_emb ?? 0,
  }
}

/** Lignes table gestionDesReprises.jsp (loading JavaScript). */
export function normalizePfRepriseRow(row = {}) {
  const flag = row.cbxtype ?? row.flagreprise ?? row.flag_reprise ?? 'NON'
  return {
    ...row,
    numdoss: row.numdoss ?? row.num_dossier ?? '',
    numassu: row.numassu ?? row.num_assu ?? '',
    requerant: row.requerant ?? row.nom_requerant ?? '',
    datedemande: row.datedemande ?? row.date_demande ?? '',
    natupres: row.natupres ?? row.natu_pres ?? '',
    libellenatupres: row.libellenatupres ?? row.libelle_natu_pres ?? row.naturepres ?? row.natupres ?? '',
    position: row.position ?? row.code_situ ?? '',
    dateposi: row.dateposi ?? row.date_situ ?? '',
    nomassu: row.nomassu ?? row.nom_assu ?? '',
    prenomassu: row.prenomassu ?? row.prenom_assu ?? '',
    datedebut: row.datedebut ?? row.date_debut ?? '',
    datefin: row.datefin ?? row.date_fin ?? '',
    flagreprise: flag,
    cbxtype: flag,
    jourspayes: row.jourspayes ?? row.nombre_jours ?? row.txtsaisienbrejours ?? 0,
    joursreliquat: row.joursreliquat ?? row.reliquat_jours ?? row.txtsaisiereliquat ?? 0,
    rang: row.rang ?? row.cbxrang ?? '1',
    cbxrang: row.cbxrang ?? row.rang ?? '1',
    flagrembempl: row.flagrembempl ?? row.flag_remb_empl ?? row.cbxrembempl ?? 'NON',
    cbxrembempl: row.cbxrembempl ?? row.flagrembempl ?? 'NON',
    numempl: row.numempl ?? row.num_employeur ?? row.txtsaisienumempl ?? '',
    datedebrempl: row.datedebrempl ?? row.date_debut_rempl ?? '',
    datefinrempl: row.datefinrempl ?? row.date_fin_rempl ?? '',
  }
}

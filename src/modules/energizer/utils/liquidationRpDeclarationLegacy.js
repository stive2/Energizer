/**
 * Règles métier nlledeclaration.jsp / lib/declaration.js
 */

export const RP_OUI_NON_OPTIONS = [
  { label: 'OUI', value: 'OUI' },
  { label: 'NON', value: 'NON' },
]

export const RP_SECTEUR_OPTIONS = [
  { label: '1 — PRIMAIRE', value: '1' },
  { label: '2 — SECONDAIRE ET TERTIAIRE I', value: '2' },
  { label: '3 — TERTIAIRE II', value: '3' },
  { label: '4 — DOMESTIQUES DE MAISON', value: '4' },
  { label: '5 — ENSEIGNEMENT PRIVÉ', value: '5' },
  { label: '6 — PUBLIC', value: '6' },
]

export const RP_ZONE_OPTIONS = [
  { label: 'Zone 1', value: '1' },
  { label: 'Zone 2', value: '2' },
  { label: 'Zone 3', value: '3' },
]

/** @param {unknown} value */
export function parseLegacyFrDate(value) {
  const str = String(value ?? '').trim()
  if (!str || str.length < 8) return null
  const normalized = str.replace(/-/g, '/')
  const match = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) return null
  return date
}

/** ExtJS daterange : date valide et non future */
export function isLegacyDateNotFuture(value) {
  const date = parseLegacyFrDate(value)
  if (!date) return false
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return date.getTime() <= today.getTime()
}

/** @param {unknown} a @param {unknown} b */
export function compareLegacyFrDates(a, b) {
  const da = parseLegacyFrDate(a)
  const db = parseLegacyFrDate(b)
  if (!da || !db) return null
  return da.getTime() - db.getTime()
}

/**
 * @param {Record<string, unknown>} form
 * @param {number} step
 * @returns {string[]}
 */
export function validateRpDeclarationStep(form, step) {
  const errors = []
  const req = (cond, msg) => { if (cond) errors.push(msg) }

  switch (step) {
    case 1:
      req(!form.numdossier, 'Choisissez un dossier SVP')
      req(!String(form.numemployeur ?? '').trim(), 'Numéro employeur obligatoire')
      req(!String(form.nomemployeur ?? '').trim(), 'Chargez l\'employeur (Entrée ou recherche)')
      break
    case 2:
      req(!form.postetravail && !form.codeposte, 'Poste de travail obligatoire')
      req(!form.codetyperisque && !form.coderisque, 'Type de risque obligatoire')
      req(!form.datesurvenance, 'Date accident obligatoire')
      req(form.datesurvenance && !isLegacyDateNotFuture(form.datesurvenance), 'Date accident invalide ou future')
      if (form.datesurvenance && form.datedeclaration) {
        const cmp = compareLegacyFrDates(form.datesurvenance, form.datedeclaration)
        if (cmp != null && cmp > 0) {
          errors.push('La date accident doit être antérieure ou égale à la date de déclaration')
        }
      }
      break
    case 3:
      req(!form.codesiegelesion && !form.codesiegel, 'Siège lésion codifié obligatoire')
      req(!form.codenatlesion && !form.codenaturel, 'Nature lésion codifiée obligatoire')
      if (form.ancienneteposte === '' || form.ancienneteposte == null) {
        errors.push('Ancienneté au poste obligatoire')
      } else {
        const n = Number(form.ancienneteposte)
        if (Number.isNaN(n) || n < 0 || n > 40) errors.push('Ancienneté : valeur entre 0 et 40')
      }
      req(!form.flagformation, 'Formation à l\'activité obligatoire')
      req(!form.agentmateriel && !form.codeagentmat, 'Agent matériel obligatoire')
      req(!form.flaghospitalisation, 'Hospitalisation obligatoire')
      req(!form.flag, 'Prise en charge obligatoire')
      req(!form.flagarrettravail, 'Arrêt de travail obligatoire')
      req(!form.flagdecesimmediat, 'Décès immédiat obligatoire')
      break
    case 4:
      req(!form.categorie, 'Catégorie obligatoire')
      req(!form.echelon, 'Échelon obligatoire')
      req(!form.secteur, 'Secteur d\'activité obligatoire')
      req(!form.zone, 'Zone accident obligatoire')
      req(!form.flagretarrerage, 'Retenir les arriérages obligatoire')
      break
    case 5:
      if (form.ippold === '' || form.ippold == null) errors.push('Taux IPP précédent obligatoire')
      if (form.rmmold === '' || form.rmmold == null) errors.push('Ancienne RMM obligatoire')
      if (form.allocationold === '' || form.allocationold == null) errors.push('Allocation d\'incapacité obligatoire')
      break
    case 6:
      break
    default:
      break
  }

  return errors
}

/** @param {Record<string, unknown>} form */
export function validateRpDeclarationForm(form) {
  const errors = []
  for (let step = 1; step <= 6; step += 1) {
    errors.push(...validateRpDeclarationStep(form, step))
  }
  return [...new Set(errors)]
}

/**
 * @param {{ redirectUrl?: string | null, finalUrl?: string | null, html?: string }} response
 */
export function parseRpDeclarationResult(response = {}) {
  const candidates = [response.redirectUrl, response.finalUrl].filter(Boolean)
  for (const url of candidates) {
    const match = String(url).match(/[?&]resultat=([^&#]+)/i)
    if (match?.[1]) return decodeURIComponent(match[1].trim())
  }
  const html = String(response.html ?? '')
  const hidden = html.match(/name=["']resultat["'][^>]*value=["']([^"']*)["']/i)
  if (hidden?.[1]) return hidden[1].trim()
  return null
}

/** @param {string | null | undefined} code */
export function rpDeclarationResultMessage(code) {
  if (code === 'ok') return 'Modification du dossier accomplie avec succès !'
  if (code === 'ko1') return 'Incohérence entre les dates suivantes : Embauche, Accident, Cessation'
  if (code === 'ko') return 'Modification du dossier non accomplie'
  return null
}

/** @param {Record<string, unknown>} form */
export function applyRpRetenueArrierageRules(form) {
  if (form.flagretarrerage === 'NON') {
    form.montantretenue = 0
  }
}

/** @param {Record<string, unknown>} form @param {Record<string, unknown>} row */
export function mapRpDossierRowToForm(form, row = {}) {
  form.numdossier = row.numdossier ?? ''
  form.objet = row.objet ?? ''
  form.numassu = row.numassu ?? ''
  form.nom = row.nom ?? ''
  form.emploiassure = row.emploiassure ?? ''
  form.datedeclaration = row.datedeclaration ?? ''
  form.datedepot = row.datedemande ?? row.datedepot ?? ''
  form.datedeces = row.datedeces ?? ''
  form.txipp = row.txipp ?? ''
  form.numemployeur = row.numemployeur ?? ''
  form.nomemployeur = row.rs ?? row.nom_employeur ?? ''
  form.observation = row.prescription ?? ''
  form.datesurvenance = row.dateaccident ?? ''
  form.heuresurvenance = row.heure ?? ''
  form.lieuaccident = row.lieu ?? ''
  form.arrondissement = row.arrond ?? row.code_arrond ?? ''
  form.quartier = row.quartier ?? ''
  form.adresse = row.adresse ?? ''
  form.causes = row.causes ?? ''
  form.consequences = row.consequences ?? ''
  form.codesiegelesion = row.codesl ?? row.sl ?? ''
  form.codesiegel = row.codesl ?? ''
  form.siegelesion = row.slesion ?? row.sl ?? ''
  form.codenatlesion = row.codenl ?? row.nl ?? ''
  form.codenaturel = row.codenl ?? ''
  form.naturelesion = row.nlesion ?? row.nl ?? ''
  form.ancienneteposte = row.anciennete ?? 0
  form.flagformation = row.flagformation ?? ''
  form.flag = row.flag ?? ''
  form.flagarrettravail = row.flagarrettravail ?? ''
  form.flagdecesimmediat = row.flagdecesimmediat ?? ''
  form.flaghospitalisation = row.flaghospit ?? ''
  form.lieuhospitalisation = row.lieuhospit ?? ''
  form.agentmateriel = row.codeagentmat ?? row.agentmat ?? ''
  form.codeagentmat = row.codeagentmat ?? ''
  form.postetravail = row.codepostetravail ?? row.postetravail ?? ''
  form.codeposte = row.codepostetravail ?? ''
  form.codetyperisque = row.coderisquetravail ?? row.risquetravail ?? ''
  form.coderisque = row.coderisquetravail ?? ''
  form.temoin1 = row.t1 ?? ''
  form.identite1 = row.id1 ?? ''
  form.temoin2 = row.t2 ?? ''
  form.identite2 = row.id2 ?? ''
  form.temoin3 = row.t3 ?? ''
  form.identite3 = row.id3 ?? ''
  form.categorie = row.cat ?? ''
  form.echelon = row.ech ?? ''
  form.secteur = row.sect ?? ''
  form.zone = row.codezone ?? ''
  form.periode1 = row.p1 ?? ''
  form.montant1 = row.sm1 ?? 0
  form.periode2 = row.p2 ?? ''
  form.montant2 = row.sm2 ?? 0
  form.periode3 = row.p3 ?? ''
  form.montant3 = row.sm3 ?? 0
  form.salrecons = row.salrecons ?? 0
  form.flagretarrerage = row.flagretrappel ?? ''
  form.montantretenue = row.montantretrappel ?? 0
  form.ippold = row.ippold ?? 0
  form.rmmold = row.rmmold ?? 0
  form.allocationold = row.allocationold ?? 0
  applyRpRetenueArrierageRules(form)
}

/** @param {{ code?: string, libelle?: string, label?: string, value?: string }}[] | undefined} rows */
export function toRpSelectOptions(rows) {
  return (Array.isArray(rows) ? rows : [])
    .filter((r) => r?.code != null)
    .map((r) => ({ label: String(r.libelle ?? r.code), value: String(r.code) }))
}

/**
 * Résout une valeur combo legacy (code ou libellé) vers la value des options Quasar.
 * @param {{ label?: string, value?: string, code?: string, libelle?: string }[]} options
 * @param {unknown} raw
 */
export function resolveRpSelectValue(options, raw) {
  const str = String(raw ?? '').trim()
  if (!str) return ''
  const opts = Array.isArray(options) ? options : []
  const byValue = opts.find((o) => o.value === str || o.code === str)
  if (byValue) return String(byValue.value ?? byValue.code)
  const lower = str.toLowerCase()
  const byLabel = opts.find((o) => String(o.label ?? o.libelle ?? '').trim().toLowerCase() === lower)
  return byLabel ? String(byLabel.value ?? byLabel.code) : str
}

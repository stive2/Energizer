/**
 * Utilitaires pièces jointes — alignés sur addpiece.jsp / addpieceRecep.jsp / show.jsp.
 */

const ASSURE_SUMMARY_OBJETS = new Set(['PVID', 'PF', 'RP'])

const NATURES_TITULAIRE_ASSURE = new Set([
  'PV',
  'PVAU',
  'PI',
  'AV',
  'AVA',
  'AT',
  'DT',
  'RR',
  'AR',
  'PS',
])

/** Mapping code_pres → natu_prestation (addpiece.jsp). */
export function resolveObjetFromCodePres(codePres) {
  const map = {
    P: 'PVID',
    F: 'PF',
    R: 'RP',
    E: 'IMMEM',
    A: 'IMMAS',
    Y: 'REAS',
    Z: 'REMP',
  }
  return map[codePres] ?? 'PVID'
}

export function shouldShowAssureSummary(objet) {
  return ASSURE_SUMMARY_OBJETS.has(objet)
}

export function defaultTitulaireForNature(codeNatuPres, nomComplet) {
  if (!codeNatuPres) return nomComplet || ''
  if (NATURES_TITULAIRE_ASSURE.has(codeNatuPres)) return nomComplet || ''
  return ''
}

export function formatTodayPieceFr() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

/** Parse dd-MM-yyyy ou dd/MM/yyyy. */
export function parsePieceDate(str) {
  if (!str) return null
  const s = String(str).trim()
  const sep = s.includes('-') ? '-' : '/'
  const parts = s.split(sep)
  if (parts.length !== 3) return null
  const [d, m, y] = parts.map((x) => parseInt(x, 10))
  if (!d || !m || !y) return null
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? null : date
}

export function isValidPieceDate(str) {
  return parsePieceDate(str) != null
}

function comparePieceDates(depStr, valStr) {
  const dep = parsePieceDate(depStr)
  const val = parsePieceDate(valStr)
  if (!dep || !val) return 0
  return dep.getTime() - val.getTime()
}

/**
 * Validation addpiece.jsp (mode initial).
 * @returns {{ ok: boolean, message?: string, field?: string }}
 */
export function validateInitialPieceRows(rows) {
  for (let i = 0; i < rows.length; i += 1) {
    const idx = i + 1
    const row = rows[i]
    if (!row.titulaire?.trim()) {
      return {
        ok: false,
        message: 'Renseignez le Titulaire de la Pièce SVP',
        field: `titulaire${idx}`,
      }
    }
    if (!isValidPieceDate(row.dateDep)) {
      return { ok: false, message: 'Entrez une Date Valide', field: `dateDep${idx}` }
    }
    if (!isValidPieceDate(row.dateVal)) {
      return { ok: false, message: 'Entrez une Date Valide', field: `dateVal${idx}` }
    }
    if (!row.dateVal?.trim()) {
      return {
        ok: false,
        message: 'Renseignez La date de Signature de la Pièce',
        field: `dateVal${idx}`,
      }
    }
    if (comparePieceDates(row.dateDep, row.dateVal) < 0) {
      return {
        ok: false,
        message:
          'La date de dépôt de la pièce ne doit pas être antérieure à la date de signature de la pièce',
        field: `dateVal${idx}`,
      }
    }
  }
  return { ok: true }
}

/**
 * Validation addpieceRecep.jsp (mode réception).
 */
export function validateReceptionPieceRows(rows, datedemande) {
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  const dossierDate = parsePieceDate(datedemande)

  for (let i = 0; i < rows.length; i += 1) {
    const idx = i + 1
    const row = rows[i]
    if (row._skipValidation) continue

    if (!row.titulaire?.trim()) {
      return {
        ok: false,
        message: 'Renseignez le Titulaire de la Pièce SVP',
        field: `titulaire${idx}`,
      }
    }
    if (!row.dateDep?.trim() || !isValidPieceDate(row.dateDep)) {
      return { ok: false, message: 'Entrez une Date Valide', field: `dateDep${idx}` }
    }
    if (!row.dateVal?.trim() || !isValidPieceDate(row.dateVal)) {
      return { ok: false, message: 'Entrez une Date Valide', field: `dateVal${idx}` }
    }

    const dep = parsePieceDate(row.dateDep)
    const val = parsePieceDate(row.dateVal)

    if (dep > now) {
      return {
        ok: false,
        message: 'La date de dépôt de la pièce ne doit pas être postérieure à la date du jour',
        field: `dateDep${idx}`,
      }
    }
    if (dossierDate && dep < dossierDate) {
      return {
        ok: false,
        message:
          'La date de dépôt de la pièce ne doit pas être antérieure à la date de depôt du dossier',
        field: `dateDep${idx}`,
      }
    }
    if (val > now) {
      return {
        ok: false,
        message:
          'La date de signature de la pièce ne doit pas être postérieure à la date du jour',
        field: `dateVal${idx}`,
      }
    }
    if (comparePieceDates(row.dateDep, row.dateVal) < 0) {
      return {
        ok: false,
        message:
          'La date de dépôt de la pièce ne doit pas être antérieure à la date de signature de la pièce',
        field: `dateVal${idx}`,
      }
    }
  }
  return { ok: true }
}

export function splitPersonValue(person) {
  if (!person) return { num_typepiece: '', libelle: '' }
  const idx = person.indexOf('_')
  if (idx < 0) return { num_typepiece: person, libelle: person }
  return {
    num_typepiece: person.slice(0, idx),
    libelle: person.slice(idx + 1),
  }
}

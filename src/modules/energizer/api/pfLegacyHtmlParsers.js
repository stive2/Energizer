/**
 * Parse HTML EnergizerDev (gestionDesReprises.jsp, periodeActivite.jsp, etc.)
 */

import {
  createEnergizerSessionExpiredError,
} from 'src/modules/energizer/utils/energizerSessionExpiry.js'
import { isEnergizerLegacyLoginPageHtml } from 'src/modules/energizer/utils/energizerLegacySessionDetect.js'

function parseLegacyJsArgList(rawArgs) {
  const args = []
  let current = ''
  let inQuote = false
  let quoteChar = ''

  for (let i = 0; i < rawArgs.length; i += 1) {
    const ch = rawArgs[i]
    if ((ch === "'" || ch === '"') && rawArgs[i - 1] !== '\\') {
      if (!inQuote) {
        inQuote = true
        quoteChar = ch
      } else if (quoteChar === ch) {
        inQuote = false
        quoteChar = ''
      }
      current += ch
      continue
    }
    if (ch === ',' && !inQuote) {
      args.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim().length > 0) args.push(current.trim())
  return args
}

export function normalizeLegacyJsValue(v) {
  const raw = String(v ?? '').trim()
  if (!raw || raw === 'null' || raw === 'undefined' || raw === 'this') return ''
  if (
    (raw.startsWith("'") && raw.endsWith("'")) ||
    (raw.startsWith('"') && raw.endsWith('"'))
  ) {
    return raw.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').trim()
  }
  return raw
}

function assertLegacyHtmlSession(html) {
  const raw = String(html ?? '')
  if (!raw.trim()) return []
  if (isEnergizerLegacyLoginPageHtml(raw)) {
    throw createEnergizerSessionExpiredError()
  }
  return raw
}

/**
 * @param {string} html
 * @param {(args: string[]) => Record<string, string> | null} mapRow
 */
export function parseLegacyLoadingRowsFromHtml(html, mapRow) {
  const raw = assertLegacyHtmlSession(html)
  const rows = []
  const seen = new Set()
  const loadingRe = /javascript:loading\(([^"]+)\)/gi
  let match
  while ((match = loadingRe.exec(raw)) !== null) {
    const args = parseLegacyJsArgList(match[1])
    const row = mapRow(args)
    const key = row?.rowKey || row?.numassu || row?.numdoss
    if (!key) continue
    const dedupe = `${key}|${row?.numbene ?? ''}|${row?.datedebut ?? ''}`
    if (seen.has(dedupe)) continue
    seen.add(dedupe)
    rows.push(row)
  }
  return rows
}

export function mapLegacyPeriodeLoadingArgs(args) {
  if (args.length < 8) return null
  const numassu = normalizeLegacyJsValue(args[0])
  const typeact = normalizeLegacyJsValue(args[7])
  return {
    rowKey: numassu,
    numassu,
    nomassu: `${normalizeLegacyJsValue(args[1])} ${normalizeLegacyJsValue(args[2])}`.trim(),
    prenomassu: normalizeLegacyJsValue(args[2]),
    dateembauche: normalizeLegacyJsValue(args[3]),
    datecessation: normalizeLegacyJsValue(args[4]),
    numempl: normalizeLegacyJsValue(args[5]),
    matempl: normalizeLegacyJsValue(args[5]),
    dateaffiliation: normalizeLegacyJsValue(args[6]),
    typeact,
    libelleType: normalizeLegacyJsValue(args[8]) || typeact,
  }
}

export function mapLegacyPmdLoadingArgs(args) {
  if (args.length < 12) return null
  const numassu = normalizeLegacyJsValue(args[0])
  const numbene = normalizeLegacyJsValue(args[3])
  return {
    rowKey: `${numassu}|${numbene}`,
    numassu,
    nomassu: `${normalizeLegacyJsValue(args[1])} ${normalizeLegacyJsValue(args[2])}`.trim(),
    prenomassu: normalizeLegacyJsValue(args[2]),
    numbene,
    nombene: `${normalizeLegacyJsValue(args[4])} ${normalizeLegacyJsValue(args[5])}`.trim(),
    prenombene: normalizeLegacyJsValue(args[5]),
    position: normalizeLegacyJsValue(args[6]),
    motif: normalizeLegacyJsValue(args[7]),
    scolarise: normalizeLegacyJsValue(args[8]),
    apprentissage: normalizeLegacyJsValue(args[9]),
    datenaiss: normalizeLegacyJsValue(args[10]),
    datedebut: normalizeLegacyJsValue(args[11]),
    datefin: normalizeLegacyJsValue(args[12]),
  }
}

function stripHtmlCell(cell) {
  return String(cell ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim()
}

/** statSituationsDossiersParBranche.jsp — lignes du tableau (sans loading JS). */
export function parseStatSituationsFromHtml(html) {
  const raw = assertLegacyHtmlSession(html)
  const rows = []
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let trMatch
  while ((trMatch = trRe.exec(raw)) !== null) {
    const tr = trMatch[1]
    if (!/border:1px solid black;font-size:12px/i.test(tr)) continue
    const cells = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => stripHtmlCell(m[1]))
    if (cells.length < 13 || !/^\d+$/.test(cells[0])) continue
    rows.push({
      numdossier: cells[1],
      objet: cells[2],
      numassu: cells[3],
      requerant: cells[4],
      situation: cells[5],
      datesitu: cells[6],
      localisation: cells[7],
      datedemande: cells[8],
      initiateur: cells[9],
      dateenreg: cells[10],
      numempl: cells[11],
      raisonsoc: cells[12],
      datecessation: cells[13] ?? '',
    })
  }
  return rows
}

/** Options centre depuis statSituationsDossiersParBranche.jsp */
export function parseStatCentresFromHtml(html) {
  const raw = String(html ?? '')
  const options = []
  const re = /<option\s+value=["']?([^"'\s>]+)["']?[^>]*>([^<]*)<\/option>/gi
  let match
  while ((match = re.exec(raw)) !== null) {
    const value = match[1].trim()
    const label = stripHtmlCell(match[2])
    if (!value || value.length !== 3) continue
    options.push({ label, value })
  }
  return options
}

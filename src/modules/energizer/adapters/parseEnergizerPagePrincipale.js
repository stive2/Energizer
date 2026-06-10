import { normalizeLegacyMenuHierarchy } from '../utils/normalizeLegacyMenuHierarchy.js'

/**
 * Parse le HTML de pagePrincipale.jsp (session Tomcat EnergizerDev).
 * @param {string} html
 */
export function parseEnergizerPagePrincipale(html) {
  if (!html || typeof html !== 'string') {
    return emptyPagePrincipale()
  }

  const user = parseUserBlock(html)
  const toolbarLinks = parseToolbarLinks(html)
  const sidebarMenu = parseLegacySidebarMenu(html)
  const roleBannerLinks = parseRoleBannerLinks(html)

  return {
    user,
    toolbarLinks,
    sidebarMenu,
    roleBannerLinks,
    rawHasSidebar: /id=["']sidebar1["']/i.test(html),
  }
}

function emptyPagePrincipale() {
  return {
    user: {},
    toolbarLinks: [],
    sidebarMenu: [],
    roleBannerLinks: [],
    rawHasSidebar: false,
  }
}

function decodeMenuLabel(raw) {
  return String(raw || '')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .trim()
}

function parseUserBlock(html) {
  const bonjour = html.match(/Bonjour\s+([^<\n]+)/i)
  let firstName = ''
  let lastName = ''
  if (bonjour?.[1]) {
    const parts = bonjour[1].trim().split(/\s+/).filter(Boolean)
    firstName = parts[0] || ''
    lastName = parts.slice(1).join(' ')
  }

  const centreMatch =
    html.match(/centre cnps\s*:?\s*([^<\n]+)/i) ||
    html.match(/centre\s*:?\s*(CPS[^<\n]+)/i)
  let lib_centre = centreMatch?.[1]?.trim().replace(/\s+/g, ' ') || ''

  if (!lib_centre) {
    const cpsMatch = html.match(/\b(CPS[\s-][A-ZÀ-Ü0-9\s-]{2,})/i)
    lib_centre = cpsMatch?.[1]?.trim().replace(/\s+/g, ' ') || ''
  }

  const displayName = [firstName, lastName].filter(Boolean).join(' ')

  return {
    firstName,
    lastName,
    displayName,
    lib_centre,
    agence: lib_centre,
  }
}

function parseToolbarLinks(html) {
  const headerMatch = html.match(/id=["']header["'][^>]*>([\s\S]*?)<\/div>/i)
  const chunk = headerMatch?.[1] || html
  const links = []
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m
  while ((m = re.exec(chunk)) !== null) {
    const href = m[1].trim()
    const rawInner = m[2]
    const badgeFromHtml =
      rawInner.match(/<[^>]+>\s*(\d+)\s*<\/[^>]+>/i)?.[1] ||
      rawInner.match(/>\s*(\d+)\s*</)?.[1] ||
      rawInner.match(/[([]+(\d+)[)\]]/)?.[1] ||
      null
    const label = rawInner.replace(/<[^>]+>/g, '').trim()
    if (!href || !label) continue
    if (/cnpsBanner|dhtml-menu-builder/i.test(href + label)) continue
    links.push({ href, label, badge: badgeFromHtml })
  }
  return links
}

function parseRoleBannerLinks(html) {
  const links = []
  const re =
    /<tr[^>]*>[\s\S]*?<a\s+[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/tr>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const row = m[0]
    if (!/xx-large|DEMANDE DE MORATOIRE/i.test(row)) continue
    const href = m[1].trim()
    const label = m[2].replace(/<[^>]+>/g, '').trim()
    if (href && label) links.push({ href, label })
  }
  return links
}

// dhtml-menu-builder : stm_ai(id, […], w, h) et stm_aix(itemId, parentId, […], w, h)
const STM_AI_CALL_RE =
  /stm_ai\s*\(\s*(["'])((?:\\.|(?!\1).)*)\1\s*,\s*\[([\s\S]*?)\]\s*(?:,[^)]*)?\)/gi

const STM_AIX_CALL_RE =
  /stm_aix\s*\(\s*(["'])((?:\\.|(?!\1).)*)\1\s*,\s*(["'])((?:\\.|(?!\3).)*)\3\s*,\s*\[([\s\S]*?)\]\s*(?:,[^)]*)?\)/gi

function normalizeMenuHref(href) {
  const value = String(href || '').trim()
  if (!value || value === '#') return ''
  return value
}

/**
 * Découpe le contenu d'un tableau stmenu ([0,"Label",...]) en jetons.
 * @param {string} arrayBody
 */
function parseStmenuArrayTokens(arrayBody) {
  const tokens = []
  let i = 0
  const source = String(arrayBody || '').trim()

  while (i < source.length) {
    while (i < source.length && /[\s,]/.test(source[i])) i += 1
    if (i >= source.length) break

    if (source.slice(i, i + 4) === 'null') {
      tokens.push('')
      i += 4
      continue
    }

    const quote = source[i]
    if (quote === '"' || quote === "'") {
      i += 1
      let value = ''
      while (i < source.length) {
        if (source[i] === '\\' && i + 1 < source.length) {
          value += source[i + 1]
          i += 2
          continue
        }
        if (source[i] === quote) {
          i += 1
          break
        }
        value += source[i]
        i += 1
      }
      tokens.push(decodeMenuLabel(value))
      continue
    }

    const numberMatch = source.slice(i).match(/^-?\d+/)
    if (numberMatch) {
      tokens.push(numberMatch[0])
      i += numberMatch[0].length
      continue
    }

    i += 1
  }

  return tokens
}

function isStmenuHrefCandidate(token) {
  const value = String(token || '').trim()
  if (!value || value === '#') return false
  if (/^_(self|top|blank|parent)$/i.test(value)) return false
  if (/\.(gif|png|jpg|jpeg|ico)$/i.test(value)) return false
  if (/^(fade|blank)\./i.test(value)) return false
  if (/^\d+pt\s/i.test(value) || /^(bold\s+)?\d+pt/i.test(value)) return false
  if (/^#[0-9A-Fa-f]{3,8}$/.test(value)) return false
  if (/^progid:/i.test(value)) return false
  if (/^(transparent|hand|default)$/i.test(value)) return false
  return true
}

function labelAndHrefFromStmenuTokens(tokens) {
  const label = String(tokens[1] || '').trim()

  let href = ''
  for (const index of [7, 2, 3]) {
    const token = tokens[index]
    if (isStmenuHrefCandidate(token)) {
      href = String(token).trim()
      break
    }
  }

  if (!href) {
    for (let index = 2; index < Math.min(tokens.length, 14); index += 1) {
      const token = tokens[index]
      if (typeof token !== 'string') continue
      const value = token.trim()
      if (!value) continue
      if (/\.(jsp|html|htm|do)(\?|$|#)/i.test(value) || /^https?:\/\//i.test(value)) {
        href = value
        break
      }
    }
  }

  return {
    label,
    href: normalizeMenuHref(href),
  }
}

function toLegacyMenuNode(node) {
  const childNodes = node.children.map(toLegacyMenuNode).filter(Boolean)

  if (childNodes.length) {
    return {
      label: node.label,
      href: node.href,
      children: childNodes,
    }
  }

  return { label: node.label, href: node.href || '' }
}

/**
 * Reconstruit l'arbre stmenu (stm_ai / stm_aix) dans l'ordre du script.
 * Chaque stm_ai ouvre un groupe racine ; les stm_aix(itemId, parentId) s'y rattachent.
 * @param {Array<{ id: string, parentId: string | null, label: string, href: string, isRoot?: boolean }>} orderedDefs
 */
export function buildStmenuMenuGroups(orderedDefs) {
  const roots = []
  let nodesById = new Map()
  let currentRoot = null

  for (const def of orderedDefs) {
    if (!def?.label) continue

    if (def.isRoot) {
      currentRoot = {
        id: def.id,
        label: def.label,
        href: '',
        children: [],
      }
      roots.push(currentRoot)
      nodesById = new Map()
      if (def.id) {
        nodesById.set(def.id, currentRoot)
      }
      continue
    }

    if (!def.id) continue

    const node = {
      id: def.id,
      label: def.label,
      href: normalizeMenuHref(def.href),
      children: [],
    }

    const parent = nodesById.get(def.parentId)
    if (parent) {
      parent.children.push(node)
    } else if (currentRoot) {
      currentRoot.children.push(node)
    }

    nodesById.set(def.id, node)
  }

  return roots
    .map((root) => toLegacyMenuNode(root))
    .filter((group) => group && group.label)
}

/**
 * Extrait le bloc HTML entre #sidebar1 et #mainContent (sans couper aux divs internes).
 */
export function extractSidebarMenuChunk(html) {
  const openTag = html.match(/id=["']sidebar1["'][^>]*>/i)
  if (!openTag || openTag.index === undefined) {
    return html
  }

  const from = openTag.index + openTag[0].length
  const tail = html.slice(from)
  const mainContent = tail.match(/<div[^>]+id=["']mainContent["']/i)

  if (mainContent && mainContent.index !== undefined) {
    return tail.slice(0, mainContent.index)
  }

  return tail
}

function collectStmenuDefsInOrder(chunk) {
  const tokens = []

  let match
  while ((match = STM_AI_CALL_RE.exec(chunk)) !== null) {
    const { label } = labelAndHrefFromStmenuTokens(parseStmenuArrayTokens(match[3]))
    if (!label) continue

    tokens.push({
      index: match.index,
      def: {
        id: match[2],
        parentId: null,
        label,
        href: '',
        isRoot: true,
      },
    })
  }

  STM_AI_CALL_RE.lastIndex = 0

  while ((match = STM_AIX_CALL_RE.exec(chunk)) !== null) {
    const { label, href } = labelAndHrefFromStmenuTokens(parseStmenuArrayTokens(match[5]))
    if (!label) continue

    tokens.push({
      index: match.index,
      def: {
        id: match[2],
        parentId: match[4],
        label,
        href,
        isRoot: false,
      },
    })
  }

  STM_AIX_CALL_RE.lastIndex = 0

  tokens.sort((a, b) => a.index - b.index)
  return tokens.map((entry) => entry.def)
}

/**
 * Extrait le menu stmenu (stm_ai / stm_aix) inclus dans #sidebar1.
 */
function stripJsLineComments(chunk) {
  return String(chunk || '').replace(/^\s*\/\/.*$/gm, '')
}

function parseLegacySidebarMenu(html) {
  const sidebarChunk = stripJsLineComments(extractSidebarMenuChunk(html))
  let groups = buildStmenuMenuGroups(collectStmenuDefsInOrder(sidebarChunk))

  if (!groups.length) {
    groups = buildStmenuMenuGroups(collectStmenuDefsInOrder(stripJsLineComments(html)))
  }

  return normalizeLegacyMenuHierarchy(groups)
}

export function isEnergizerPagePrincipaleHtml(html) {
  if (!html || typeof html !== 'string') return false
  return /Bonjour\s+/i.test(html) || /id=["']sidebar1["']/i.test(html)
}

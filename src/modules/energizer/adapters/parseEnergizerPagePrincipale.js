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

  const centreMatch = html.match(/centre cnps\s*:?\s*([^<\n]+)/i)
  const lib_centre = centreMatch?.[1]?.trim() || ''

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
    const label = m[2].replace(/<[^>]+>/g, '').trim()
    if (!href || !label) continue
    if (/cnpsBanner|dhtml-menu-builder/i.test(href + label)) continue
    links.push({ href, label })
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

/**
 * Extrait le menu stmenu (stm_ai / stm_aix) inclus dans #sidebar1.
 */
function parseLegacySidebarMenu(html) {
  const sidebarMatch = html.match(/id=["']sidebar1["'][^>]*>([\s\S]*?)<\/div>\s*<div id=["']mainContent/i)
  const chunk = sidebarMatch?.[1] || html

  const groups = []
  let currentGroup = null

  const lines = chunk.split(/\r?\n/)
  for (const line of lines) {
    const top = line.match(/stm_ai\(\s*"[^"]+"\s*,\s*\[\s*0\s*,\s*"((?:[^"\\]|\\.)*)"/)
    if (top) {
      currentGroup = {
        label: decodeMenuLabel(top[1]),
        children: [],
      }
      groups.push(currentGroup)
      continue
    }

    const item = line.match(
      /stm_aix\(\s*"[^"]+"\s*,\s*"[^"]+"\s*,\s*\[\s*0\s*,\s*"((?:[^"\\]|\\.)*)"\s*,\s*""\s*,\s*""\s*,\s*-1\s*,\s*-1\s*,\s*0\s*,\s*"([^"]*)"/,
    )
    if (!item) continue

    const label = decodeMenuLabel(item[1])
    const href = item[2].trim()
    if (!label) continue

    if (!href || href === '#' || href === '') {
      if (currentGroup) {
        currentGroup.children.push({ label, href: '', children: [] })
      }
      continue
    }

    const leaf = { label, href }
    if (currentGroup) {
      const last = currentGroup.children[currentGroup.children.length - 1]
      if (last && !last.href && last.children) {
        last.children.push(leaf)
      } else {
        currentGroup.children.push(leaf)
      }
    } else {
      groups.push({ label: 'Menu', children: [leaf] })
      currentGroup = groups[groups.length - 1]
    }
  }

  return groups.filter((g) => g.children.length > 0)
}

export function isEnergizerPagePrincipaleHtml(html) {
  if (!html || typeof html !== 'string') return false
  return /Bonjour\s+/i.test(html) || /id=["']sidebar1["']/i.test(html)
}

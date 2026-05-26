/** Styles colonnes tableaux pièces / corbeille (aligné $primary #1976D2). */
export const NOUVEAU_DOSSIER_TABLE_PRIMARY = '#1976D2'

export const NOUVEAU_DOSSIER_TABLE_HEADER_CLASS = 'nouveau-dossier-table-col-header'

export const NOUVEAU_DOSSIER_TABLE_CELL_CLASS = 'nouveau-dossier-table-col-cell'

export const primaryTableHeaderStyle = {
  backgroundColor: NOUVEAU_DOSSIER_TABLE_PRIMARY,
  color: '#ffffff',
  fontWeight: '600',
  fontSize: '13px',
}

export const primaryTableCellStyle = {
  color: NOUVEAU_DOSSIER_TABLE_PRIMARY,
  fontWeight: '500',
  fontSize: '14px',
}

/**
 * @param {Array<Record<string, unknown>>} columns
 * @param {{ skipCellStyle?: string[] }} [options]
 */
export function withPrimaryTableColumns(columns, options = {}) {
  const skip = new Set(options.skipCellStyle ?? ['action', 'actions'])

  return columns.map((col) => ({
    ...col,
    headerClasses: NOUVEAU_DOSSIER_TABLE_HEADER_CLASS,
    classes: skip.has(col.name) ? col.classes : NOUVEAU_DOSSIER_TABLE_CELL_CLASS,
    headerStyle: {
      ...primaryTableHeaderStyle,
      ...parseMinWidth(col.headerStyle || col.style),
    },
    style: skip.has(col.name)
      ? col.style
      : {
          ...primaryTableCellStyle,
          ...parseMinWidth(col.style),
        },
  }))
}

function parseMinWidth(style) {
  if (typeof style === 'string') {
    const match = style.match(/min-width:\s*([^;]+)/i)
    return match ? { minWidth: match[1].trim() } : {}
  }
  if (style && typeof style === 'object' && style.minWidth) {
    return { minWidth: style.minWidth }
  }
  return {}
}

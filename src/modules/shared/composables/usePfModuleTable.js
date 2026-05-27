import { computed } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Colonnes visibles, mode grille et pagination selon la taille d'écran.
 * @param {import('vue').Ref|Array} allColumns - colonnes complètes du q-table
 * @param {{ mobileCols?: string[], tabletHidden?: string[], rowsPerPageDesktop?: number[] }} [options]
 */
export function usePfModuleTable(allColumns, options = {}) {
  const $q = useQuasar()
  const {
    mobileCols = null,
    tabletHidden = [],
    rowsPerPageDesktop = [10, 20, 50],
    rowsPerPageMobile = [5, 10],
  } = options

  const columnsRef = computed(() => {
    const cols = Array.isArray(allColumns) ? allColumns : allColumns.value
    return cols
  })

  const visibleTableColumns = computed(() => {
    const cols = columnsRef.value
    if ($q.screen.lt.sm && mobileCols?.length) {
      return cols.filter((c) => mobileCols.includes(c.name))
    }
    if ($q.screen.lt.md && tabletHidden.length) {
      return cols.filter((c) => !tabletHidden.includes(c.name))
    }
    return cols
  })

  const tableGrid = computed(() => $q.screen.lt.sm && !!mobileCols?.length)
  const tableRowsPerPageOptions = computed(() =>
    $q.screen.lt.sm ? rowsPerPageMobile : rowsPerPageDesktop,
  )
  const tableDefaultRowsPerPage = computed(() =>
    $q.screen.lt.sm ? rowsPerPageMobile[0] : rowsPerPageDesktop[0],
  )

  return {
    visibleTableColumns,
    tableGrid,
    tableRowsPerPageOptions,
    tableDefaultRowsPerPage,
  }
}

import { ref, watch, onMounted } from 'vue'
import {
  filterPfDossiersByCriteria,
  normalizePfDossierRow,
  normalizePfRepriseRow,
} from 'src/modules/energizer/utils/pfDossierSearchUtils.js'
function normalizePeriodeRow(row = {}) {
  return {
    ...row,
    rowKey: row.rowKey ?? row.numassu,
    numassu: row.numassu ?? '',
    nomassu: row.nomassu ?? '',
    numempl: row.numempl ?? row.matempl ?? '',
    typeact: row.typeact ?? '',
    libelleType: row.libelleType ?? row.typeact ?? '',
    dateembauche: row.dateembauche ?? '',
    datecessation: row.datecessation ?? '',
  }
}

function normalizePmdRow(row = {}) {
  return {
    ...row,
    rowKey: row.rowKey ?? `${row.numassu}|${row.numbene}`,
    numassu: row.numassu ?? '',
    nomassu: row.nomassu ?? '',
    numbene: row.numbene ?? '',
    nombene: row.nombene ?? '',
    datedebut: row.datedebut ?? '',
    datefin: row.datefin ?? '',
    datenaiss: row.datenaiss ?? '',
  }
}

/**
 * Liste PF/AF/Reprises/Périodes/PMD : catalogue serveur au chargement, filtre client à la saisie,
 * recherche serveur au submit du formulaire de recherche.
 * @param {{ pfStore: object, scope?: 'pf'|'af', mode?: 'dossiers'|'reprises'|'periodes'|'pmd', $q?: object, withEndFilter?: boolean, defaultCritere?: string, defaultStart?: string }} options
 */
export function usePfDossierCatalogTable({
  pfStore,
  scope = 'pf',
  mode = 'dossiers',
  $q,
  withEndFilter = false,
  defaultCritere,
  defaultStart,
}) {
  const normalizeFns = {
    reprises: normalizePfRepriseRow,
    periodes: normalizePeriodeRow,
    pmd: normalizePmdRow,
    dossiers: normalizePfDossierRow,
  }
  const normalizeRow = normalizeFns[mode] ?? normalizePfDossierRow

  async function fetchRows(params) {
    if (mode === 'reprises') return pfStore.loadReprises(params)
    if (mode === 'periodes') return pfStore.loadPeriodes(params)
    if (mode === 'pmd') return pfStore.loadPmd(params)
    return pfStore.searchDossiers({ scope, ...params })
  }
  const loading = ref(false)
  const errorMsg = ref('')
  const cbxcritere = ref(defaultCritere ?? (mode === 'periodes' || mode === 'pmd' ? 'fnumassu' : 'fnumdoss'))
  const txtvaleurdeb = ref(defaultStart ?? (mode === 'dossiers' || mode === 'reprises' ? '000-' : ''))
  const txtvaleurfin = ref('')
  const catalogDossiers = ref([])
  const dossiers = ref([])
  /** false au 1er affichage (comme JSP avant clic Rechercher) */
  const filtersActive = ref(false)

  function refreshDisplay() {
    if (!filtersActive.value) {
      dossiers.value = [...catalogDossiers.value]
      return
    }
    dossiers.value = filterPfDossiersByCriteria(catalogDossiers.value, {
      critere: cbxcritere.value,
      start: txtvaleurdeb.value,
      end: withEndFilter ? txtvaleurfin.value : '',
    })
  }

  watch([cbxcritere, txtvaleurdeb, txtvaleurfin], () => {
    if (!catalogDossiers.value.length && !filtersActive.value) return
    filtersActive.value = true
    refreshDisplay()
  })

  async function loadCatalog() {
    loading.value = true
    errorMsg.value = ''
    try {
      const list = await fetchRows({ catalog: true })
      catalogDossiers.value = (Array.isArray(list) ? list : []).map(normalizeRow)
      filtersActive.value = false
      refreshDisplay()
    } catch (error) {
      catalogDossiers.value = []
      dossiers.value = []
      errorMsg.value = error?.message || 'Erreur de chargement des dossiers.'
    } finally {
      loading.value = false
    }
  }

  async function searchDossiers() {
    loading.value = true
    errorMsg.value = ''
    try {
      const list = await fetchRows({
        criteria: cbxcritere.value,
        start: txtvaleurdeb.value,
        ...(withEndFilter ? { end: txtvaleurfin.value } : {}),
      })
      catalogDossiers.value = (Array.isArray(list) ? list : []).map(normalizeRow)
      filtersActive.value = true
      refreshDisplay()
      if ($q) {
        $q.notify({
          type: dossiers.value.length ? 'positive' : 'info',
          message: dossiers.value.length
            ? `${dossiers.value.length} dossier(s) trouvé(s)`
            : 'Recherche effectuée — aucun résultat',
          position: 'top',
          timeout: 1500,
        })
      }
    } catch (error) {
      dossiers.value = []
      errorMsg.value = error?.message || 'Échec de la recherche des dossiers.'
    } finally {
      loading.value = false
    }
  }

  function resetSearch() {
    cbxcritere.value = defaultCritere ?? (mode === 'periodes' || mode === 'pmd' ? 'fnumassu' : 'fnumdoss')
    txtvaleurdeb.value = defaultStart ?? (mode === 'dossiers' || mode === 'reprises' ? '000-' : '')
    txtvaleurfin.value = ''
    errorMsg.value = ''
    loadCatalog()
  }

  onMounted(() => {
    loadCatalog()
  })

  return {
    loading,
    errorMsg,
    cbxcritere,
    txtvaleurdeb,
    txtvaleurfin,
    dossiers,
    loadCatalog,
    searchDossiers,
    resetSearch,
  }
}

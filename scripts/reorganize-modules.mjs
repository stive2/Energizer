/**
 * Réorganisation modulaire du projet Quasar.
 * Exécuter : node scripts/reorganize-modules.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'src')

/** @type {[string, string][]} chemins relatifs à src/ */
const MOVES = [
  // --- shared ---
  ['layouts', 'modules/shared/layouts'],
  ['components/layout', 'modules/shared/components/layout'],
  ['components/logins', 'modules/shared/components/logins'],
  ['components/EssentialLink.vue', 'modules/shared/components/EssentialLink.vue'],
  ['components/CustomSpinner.vue', 'modules/shared/components/CustomSpinner.vue'],
  ['components/useNotify.js', 'modules/shared/components/useNotify.js'],
  ['pages/modules/portal', 'modules/shared/pages/portal'],
  ['pages/dashboard.vue', 'modules/shared/pages/dashboard.vue'],
  ['pages/ErrorNotFound.vue', 'modules/shared/pages/ErrorNotFound.vue'],
  ['pages/IndexPageOld.vue', 'modules/shared/pages/IndexPageOld.vue'],
  ['stores/authStore.js', 'modules/shared/stores/authStore.js'],
  ['stores/example-store.js', 'modules/shared/stores/example-store.js'],
  ['services', 'modules/shared/services'],
  ['api/auth', 'modules/shared/api/auth'],
  ['config/api.js', 'modules/shared/config/api.js'],
  ['composables/useAuthenticatedSession.js', 'modules/shared/composables/useAuthenticatedSession.js'],
  ['composables/usePfModuleTable.js', 'modules/shared/composables/usePfModuleTable.js'],
  ['utils/diversFonctions.js', 'modules/shared/utils/diversFonctions.js'],
  ['utils/appNotify.js', 'modules/shared/utils/appNotify.js'],
  ['utils/menuBreadcrumbs.js', 'modules/shared/utils/menuBreadcrumbs.js'],
  ['utils/sidebarNavInset.js', 'modules/shared/utils/sidebarNavInset.js'],
  ['utils/userDisplay.js', 'modules/shared/utils/userDisplay.js'],
  ['utils/portalSimAuthSession.js', 'modules/shared/utils/portalSimAuthSession.js'],
  ['utils/md5.js', 'modules/shared/utils/md5.js'],

  // --- energizer ---
  ['components/prestationPF', 'modules/energizer/components/prestationPF'],
  ['components/prestationRP', 'modules/energizer/components/prestationRP'],
  ['components/energizer/nouveauDossier', 'modules/energizer/components/nouveauDossier'],
  ['pages/modules/energizer', 'modules/energizer/pages'],
  ['pages/energizer/NouveauDossierReceptionPage.vue', 'modules/energizer/pages/NouveauDossierReceptionPage.vue'],
  ['pages/liquidations', 'modules/energizer/pages/liquidations'],
  ['api/energizer', 'modules/energizer/api'],
  ['stores/energizer', 'modules/energizer/stores'],
  ['composables/energizer', 'modules/energizer/composables'],
  ['data/energizer', 'modules/energizer/data'],
  ['utils/energizer', 'modules/energizer/utils'],
  ['config/menus/energizerMenu.js', 'modules/energizer/config/energizerMenu.js'],

  // --- immatriculations ---
  ['components/ImmatAssuTrv.vue', 'modules/immatriculations/components/ImmatAssuTrv.vue'],
  ['components/ImmatAssuVol.vue', 'modules/immatriculations/components/ImmatAssuVol.vue'],
  ['components/ImmatEmpPro.vue', 'modules/immatriculations/components/ImmatEmpPro.vue'],
  ['components/ImmatEmpDom.vue', 'modules/immatriculations/components/ImmatEmpDom.vue'],
  ['pages/modules/declarations', 'modules/immatriculations/pages'],
  ['data/immat', 'modules/immatriculations/data'],
  ['utils/immatAssuTrvLegacy.js', 'modules/immatriculations/utils/immatAssuTrvLegacy.js'],
  ['utils/immatAssuVolLegacy.js', 'modules/immatriculations/utils/immatAssuVolLegacy.js'],

  // --- assure ---
  ['components/assure', 'modules/assure/components'],
  ['components/Prestations', 'modules/assure/components/Prestations'],
  ['pages/modules/assure', 'modules/assure/pages'],
  ['pages/prestations', 'modules/assure/pages/prestations'],
  ['stores/assure', 'modules/assure/stores'],
  ['composables/assure', 'modules/assure/composables'],
  ['data/assure', 'modules/assure/data'],
  ['utils/depotPrestationPfAccouchement.js', 'modules/assure/utils/depotPrestationPfAccouchement.js'],
  ['config/menus/assureMenu.js', 'modules/assure/config/assureMenu.js'],
]

/** Fichiers API assuré (hors immat) → module assure */
const ASSURE_API_MOVES = [
  ['api/assure/paths.js', 'modules/assure/api/paths.js'],
  ['api/assure/depotPrestationPfApi.js', 'modules/assure/api/depotPrestationPfApi.js'],
  ['api/assure/depotPrestationPfUtils.js', 'modules/assure/api/depotPrestationPfUtils.js'],
  ['api/assure/mocks/depotPrestationPfMocks.js', 'modules/assure/api/mocks/depotPrestationPfMocks.js'],
  ['api/assure/mocks/fictifEmployeurDepotPfApi.js', 'modules/assure/api/mocks/fictifEmployeurDepotPfApi.js'],
]

/** Fichiers API immat → module immatriculations */
const IMMAT_API_MOVES = [
  ['api/assure/immatAssureApi.js', 'modules/immatriculations/api/immatAssureApi.js'],
  ['api/assure/immatAssureResponse.js', 'modules/immatriculations/api/immatAssureResponse.js'],
  ['api/assure/mocks/immatAssureMocks.js', 'modules/immatriculations/api/mocks/immatAssureMocks.js'],
]

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function moveEntry(fromRel, toRel) {
  const from = path.join(src, fromRel)
  const to = path.join(src, toRel)
  if (!fs.existsSync(from)) {
    console.warn(`SKIP (missing): ${fromRel}`)
    return
  }
  if (fs.existsSync(to)) {
    console.warn(`SKIP (exists): ${toRel}`)
    return
  }
  ensureDir(to.endsWith(path.sep) || !path.extname(to) ? to : to)
  fs.renameSync(from, to)
  console.log(`OK ${fromRel} → ${toRel}`)
}

function moveSharedDataFiles() {
  const dataDir = path.join(src, 'data')
  if (!fs.existsSync(dataDir)) return
  const destDir = path.join(src, 'modules/shared/data')
  fs.mkdirSync(destDir, { recursive: true })
  for (const name of fs.readdirSync(dataDir)) {
    const full = path.join(dataDir, name)
    if (fs.statSync(full).isFile()) {
      const dest = path.join(destDir, name)
      if (!fs.existsSync(dest)) {
        fs.renameSync(full, dest)
        console.log(`OK data/${name} → modules/shared/data/${name}`)
      }
    }
  }
  try {
    fs.rmdirSync(dataDir)
  } catch {
    /* sous-dossiers résiduels */
  }
}

function cleanupEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) cleanupEmptyDirs(full)
  }
  if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir)
  }
}

/** Remplacements d'imports (ordre : plus long d'abord) */
const IMPORT_REPLACEMENTS = [
  // src/ — chemins spécifiques avant génériques
  ['src/components/prestationPF/', 'src/modules/energizer/components/prestationPF/'],
  ['src/components/prestationRP/', 'src/modules/energizer/components/prestationRP/'],
  ['src/components/energizer/nouveauDossier/', 'src/modules/energizer/components/nouveauDossier/'],
  ['src/components/energizer/', 'src/modules/energizer/components/'],
  ['src/components/Immat', 'src/modules/immatriculations/components/Immat'],
  ['src/components/assure/', 'src/modules/assure/components/'],
  ['src/components/Prestations/', 'src/modules/assure/components/Prestations/'],
  ['src/components/layout/', 'src/modules/shared/components/layout/'],
  ['src/components/logins/', 'src/modules/shared/components/logins/'],
  ['src/components/useNotify', 'src/modules/shared/components/useNotify'],
  ['src/components/EssentialLink', 'src/modules/shared/components/EssentialLink'],
  ['src/components/CustomSpinner', 'src/modules/shared/components/CustomSpinner'],
  ['src/layouts/', 'src/modules/shared/layouts/'],
  ['src/pages/modules/portal/', 'src/modules/shared/pages/portal/'],
  ['src/pages/modules/energizer/', 'src/modules/energizer/pages/'],
  ['src/pages/modules/declarations/', 'src/modules/immatriculations/pages/'],
  ['src/pages/modules/assure/', 'src/modules/assure/pages/'],
  ['src/pages/energizer/', 'src/modules/energizer/pages/'],
  ['src/pages/liquidations/', 'src/modules/energizer/pages/liquidations/'],
  ['src/pages/prestations/', 'src/modules/assure/pages/prestations/'],
  ['src/pages/dashboard', 'src/modules/shared/pages/dashboard'],
  ['src/pages/ErrorNotFound', 'src/modules/shared/pages/ErrorNotFound'],
  ['src/pages/IndexPageOld', 'src/modules/shared/pages/IndexPageOld'],
  ['src/api/energizer/', 'src/modules/energizer/api/'],
  ['src/api/assure/immatAssure', 'src/modules/immatriculations/api/immatAssure'],
  ['src/api/assure/mocks/immatAssure', 'src/modules/immatriculations/api/mocks/immatAssure'],
  ['src/api/assure/', 'src/modules/assure/api/'],
  ['src/api/auth/', 'src/modules/shared/api/auth/'],
  ['src/stores/energizer/', 'src/modules/energizer/stores/'],
  ['src/stores/assure/', 'src/modules/assure/stores/'],
  ['src/stores/authStore', 'src/modules/shared/stores/authStore'],
  ['src/stores/example-store', 'src/modules/shared/stores/example-store'],
  ['src/composables/energizer/', 'src/modules/energizer/composables/'],
  ['src/composables/assure/', 'src/modules/assure/composables/'],
  ['src/composables/useAuthenticatedSession', 'src/modules/shared/composables/useAuthenticatedSession'],
  ['src/composables/usePfModuleTable', 'src/modules/shared/composables/usePfModuleTable'],
  ['src/data/energizer/', 'src/modules/energizer/data/'],
  ['src/data/immat/', 'src/modules/immatriculations/data/'],
  ['src/data/assure/', 'src/modules/assure/data/'],
  ['src/data/', 'src/modules/shared/data/'],
  ['src/utils/energizer/', 'src/modules/energizer/utils/'],
  ['src/utils/immatAssu', 'src/modules/immatriculations/utils/immatAssu'],
  ['src/utils/depotPrestationPfAccouchement', 'src/modules/assure/utils/depotPrestationPfAccouchement'],
  ['src/utils/portalSimAuthSession', 'src/modules/shared/utils/portalSimAuthSession'],
  ['src/utils/menuBreadcrumbs', 'src/modules/shared/utils/menuBreadcrumbs'],
  ['src/utils/appNotify', 'src/modules/shared/utils/appNotify'],
  ['src/utils/diversFonctions', 'src/modules/shared/utils/diversFonctions'],
  ['src/utils/sidebarNavInset', 'src/modules/shared/utils/sidebarNavInset'],
  ['src/utils/userDisplay', 'src/modules/shared/utils/userDisplay'],
  ['src/utils/md5', 'src/modules/shared/utils/md5'],
  ['src/config/menus/energizerMenu', 'src/modules/energizer/config/energizerMenu'],
  ['src/config/menus/assureMenu', 'src/modules/assure/config/assureMenu'],
  ['src/config/api', 'src/modules/shared/config/api'],
  ['src/services/', 'src/modules/shared/services/'],

  // Alias Quasar (layouts/, pages/, components/)
  ['components/prestationPF/', 'src/modules/energizer/components/prestationPF/'],
  ['components/prestationRP/', 'src/modules/energizer/components/prestationRP/'],
  ['components/layout/', 'src/modules/shared/components/layout/'],
  ['components/logins/', 'src/modules/shared/components/logins/'],
  ['components/Immat', 'src/modules/immatriculations/components/Immat'],
  ["import('layouts/", "import('src/modules/shared/layouts/"],
  ["import('pages/modules/portal/", "import('src/modules/shared/pages/portal/"],
  ["import('pages/modules/energizer/", "import('src/modules/energizer/pages/"],
  ["import('pages/modules/declarations/", "import('src/modules/immatriculations/pages/"],
  ["import('pages/modules/assure/", "import('src/modules/assure/pages/"],
  ["import('pages/energizer/", "import('src/modules/energizer/pages/"],
  ["import('pages/liquidations/", "import('src/modules/energizer/pages/liquidations/"],
  ["import('pages/prestations/", "import('src/modules/assure/pages/prestations/"],
  ["import('pages/dashboard", "import('src/modules/shared/pages/dashboard"],
  ["import('pages/ErrorNotFound", "import('src/modules/shared/pages/ErrorNotFound"],

  // Imports relatifs courants après déplacement immat / assure
  ["from '../data/immat/", "from 'src/modules/immatriculations/data/"],
  ["from '../data/", "from 'src/modules/shared/data/"],
  ["from '../../data/", "from 'src/modules/shared/data/"],
  ["from '../utils/immatAssuVolLegacy", "from 'src/modules/immatriculations/utils/immatAssuVolLegacy"],
  ["from '../utils/immatAssuTrvLegacy", "from 'src/modules/immatriculations/utils/immatAssuTrvLegacy"],
  ["from '../../components/useNotify", "from 'src/modules/shared/components/useNotify"],
  ["from '../components/useNotify", "from 'src/modules/shared/components/useNotify"],
  ["from '../js/regex", "from 'src/js/regex"],
  ["from '../Arrondissements", "from 'src/modules/shared/data/Arrondissements"],
  ["from '../Pays", "from 'src/modules/shared/data/Pays"],
  ["from '../Pieces", "from 'src/modules/shared/data/Pieces"],
  ["from '../Centres", "from 'src/modules/shared/data/Centres"],
  ["from '../depotPrestationPfUtils", "from 'src/modules/assure/api/depotPrestationPfUtils"],
]

function walkFiles(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) {
      if (name === 'node_modules' || name === '.quasar') continue
      walkFiles(full, exts, out)
    } else if (exts.some((e) => name.endsWith(e))) {
      out.push(full)
    }
  }
  return out
}

function applyImportReplacements() {
  const files = walkFiles(src, ['.js', '.vue', '.scss', '.md'])
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8')
    let changed = false
    for (const [from, to] of IMPORT_REPLACEMENTS) {
      if (content.includes(from)) {
        content = content.split(from).join(to)
        changed = true
      }
    }
    if (changed) fs.writeFileSync(file, content, 'utf8')
  }
  console.log(`Import replacements applied to ${files.length} files under src/`)
}

console.log('=== Phase 1: déplacements ===')
for (const [from, to] of MOVES) moveEntry(from, to)
for (const [from, to] of IMMAT_API_MOVES) moveEntry(from, to)
for (const [from, to] of ASSURE_API_MOVES) moveEntry(from, to)
moveSharedDataFiles()

console.log('\n=== Phase 2: nettoyage dossiers vides ===')
for (const d of ['components', 'pages', 'layouts', 'api', 'stores', 'composables', 'data', 'utils', 'config', 'services']) {
  cleanupEmptyDirs(path.join(src, d))
}

console.log('\n=== Phase 3: mise à jour des imports ===')
applyImportReplacements()

console.log('\nDone.')

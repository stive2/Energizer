<template>
  <div class="q-pa-sm periode-activite">

    <!-- Bannière d'erreur -->
    <q-banner v-if="errorMsg" class="bg-negative text-white q-mb-sm" rounded dense>
      <template v-slot:avatar><q-icon name="error" color="white" /></template>
      {{ errorMsg }}
      <template v-slot:action>
        <q-btn flat color="white" label="Fermer" dense @click="errorMsg = ''" />
      </template>
    </q-banner>

    <!-- ═══════════════════════════════════════════════════════
         RECHERCHE
    ═══════════════════════════════════════════════════════ -->
    <q-card class="q-mb-sm card-elevated">
      <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
        <div class="row items-center">
          <q-icon name="search" size="xs" class="q-mr-xs" />
          <span class="text-body2 text-weight-bold">Recherche</span>
        </div>
      </q-card-section>
      <q-card-section class="q-py-sm">
        <q-form @submit.prevent="searchPeriodes" @reset="resetSearch">
          <div class="row q-col-gutter-sm items-end">
            <div class="col-12 col-sm-3">
              <q-select
                v-model="searchCriteria"
                :options="searchOptions"
                label="Critères"
                outlined dense emit-value map-options color="primary"
              />
            </div>
            <div class="col-12 col-sm-3">
              <q-input
                v-model="searchStartValue"
                label="Valeur de Début"
                outlined dense
                @update:model-value="val => (searchStartValue = (val || '').toUpperCase())"
              />
            </div>
            <div class="col-12 col-sm-3">
              <q-input
                v-model="searchEndValue"
                label="Valeur de Fin"
                outlined dense
                @update:model-value="val => (searchEndValue = (val || '').toUpperCase())"
              />
            </div>
            <div class="col-12 col-sm-3">
              <div class="row q-gutter-xs">
                <q-btn type="submit" color="primary" label="Rechercher" icon="search"
                  dense unelevated style="border-radius:8px" :loading="loading" />
                <q-btn type="reset" color="grey-6" label="Annuler" icon="close"
                  dense unelevated style="border-radius:8px" />
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- ═══════════════════════════════════════════════════════
         LISTE DES PÉRIODES  +  bouton Nouvelle Saisie
    ═══════════════════════════════════════════════════════ -->
    <q-card class="card-elevated">
      <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="calendar_month" size="xs" class="q-mr-xs" />
            <span class="text-body2 text-weight-bold">
              Gestion des Interruptions &amp; Périodes d'Activité
            </span>
          </div>
          <div class="row items-center q-gutter-sm">
            <q-badge color="white" text-color="primary" :label="`${periodes.length} enregistrement(s)`" />
            <q-btn
              color="white" text-color="primary" icon="add" label="Nouvelle saisie"
              dense unelevated size="sm" style="border-radius:8px; font-weight:600;"
              @click="openDialog()"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-table
          :rows="periodes"
          :columns="tableColumns"
          row-key="rowKey"
          :loading="loading"
          dense flat
          :rows-per-page-options="[10, 20, 50]"
          no-data-label="Aucun enregistrement trouvé — utilisez la recherche ci-dessus"
          class="periodes-table"
        >
          <template v-slot:body-cell-index="props">
            <q-td :props="props" class="text-center text-grey-6">{{ props.rowIndex + 1 }}</q-td>
          </template>

          <template v-slot:body-cell-numassu="props">
            <q-td :props="props">
              <a class="dossier-link" href="#" @click.prevent="loadPeriode(props.row)">
                <q-icon name="person" size="xs" class="q-mr-xs" />{{ props.row.numassu }}
              </a>
            </q-td>
          </template>

          <template v-slot:body-cell-typeact="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.typeact === 'ACT' ? 'positive' : 'orange-7'"
                :label="props.row.libelleType || props.row.typeact"
                style="font-size:0.7rem"
              />
            </q-td>
          </template>

          <template v-slot:no-data="{ message }">
            <div class="full-width row flex-center text-grey-6 q-pa-lg">
              <q-icon name="inbox" size="2rem" class="q-mr-sm" />{{ message }}
            </div>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- ═══════════════════════════════════════════════════════
         DIALOG – FORMULAIRE PÉRIODE D'ACTIVITÉ
    ═══════════════════════════════════════════════════════ -->
    <q-dialog v-model="showDialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="dialog-form-card">

        <!-- En-tête -->
        <q-bar class="bg-primary text-white q-py-sm">
          <q-icon name="calendar_month" />
          <span class="q-ml-sm text-body1 text-weight-bold">
            Période d'Activité — Saisie
          </span>
          <q-space />
          <q-btn flat dense round color="white" icon="restart_alt" size="sm" @click="resetForm">
            <q-tooltip>Réinitialiser</q-tooltip>
          </q-btn>
          <q-btn flat dense round color="white" icon="close" size="sm" v-close-popup @click="resetForm" />
        </q-bar>

        <!-- Corps scrollable -->
        <q-card-section class="q-pa-sm overflow-auto dialog-body">
          <q-form ref="saisieFormRef" @submit.prevent="submitForm" @reset="resetForm">

            <!-- ── Employeur ── -->
            <div class="sep q-mb-xs">
              <q-icon name="business" size="xs" class="q-mr-xs" />Employeur
            </div>
            <div class="row q-col-gutter-xs q-mb-sm">
              <div class="col-6 col-md-3">
                <q-input v-model="form.matempl" label="Matricule Employeur" outlined dense readonly
                  bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-5">
                <q-input v-model="form.raisonsociale" label="Raison Sociale" outlined dense readonly
                  bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-4">
                <q-input v-model="form.dateaffiliation" label="Date Affiliation" outlined dense readonly
                  bg-color="blue-grey-1" label-color="primary" />
              </div>
            </div>

            <!-- ── Assuré ── -->
            <div class="sep q-mb-xs">
              <q-icon name="person" size="xs" class="q-mr-xs" />Assuré
            </div>
            <div class="row q-col-gutter-xs q-mb-sm">
              <div class="col-6 col-md-4">
                <q-input v-model="form.numassu" label="N° Assuré" outlined dense readonly
                  bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-4">
                <q-input v-model="form.nomassu" label="Noms Assuré" outlined dense readonly
                  bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-4">
                <q-input v-model="form.prenomassu" label="Prénoms Assuré" outlined dense readonly
                  bg-color="blue-grey-1" label-color="primary" />
              </div>
            </div>

            <!-- ── Données de la période ── -->
            <div class="sep q-mb-xs">
              <q-icon name="event_note" size="xs" class="q-mr-xs" />Données de la Période
            </div>
            <div class="row q-col-gutter-xs q-mb-sm items-start">

              <!-- Type -->
              <div class="col-12 col-md-2">
                <q-select
                  v-model="form.typeact"
                  :options="typeOptions"
                  label="Type"
                  outlined dense emit-value map-options color="primary"
                  :rules="[v => !!v || 'Veuillez sélectionner le type de chaque opération']"
                />
              </div>

              <!-- Matricule Assuré -->
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.matassu"
                  label="Matricule Assuré"
                  outlined dense
                  bg-color="yellow-1"
                  :rules="[v => !!v || 'Veuillez saisir le Numéro Assuré SVP!!!']"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" color="amber-8" size="xs" />
                  </template>
                </q-input>
              </div>

              <!-- Numéro Employeur -->
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.numempl"
                  label="Numéro Employeur"
                  outlined dense
                  bg-color="yellow-1"
                  :rules="[v => !!v || 'Veuillez saisir le Numéro Employeur SVP!!!']"
                >
                  <template v-slot:prepend>
                    <q-icon name="business" color="amber-8" size="xs" />
                  </template>
                </q-input>
              </div>

              <!-- Date Embauche -->
              <div class="col-12 col-md-2">
                <q-input
                  v-model="form.dateembauche"
                  label="Date Embauche"
                  outlined dense
                  bg-color="yellow-1"
                  :rules="[v => !!v || 'Veuillez saisir une Date embauche SVP!!!']"
                >
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.dateembauche" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="primary" flat dense />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <!-- Date Cessation -->
              <div class="col-12 col-md-2">
                <q-input
                  v-model="form.datecessation"
                  label="Date Cessation"
                  outlined dense
                  bg-color="yellow-1"
                >
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datecessation" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="primary" flat dense />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- ── Boutons d'action ── -->
            <div class="row justify-center q-gutter-sm q-mt-sm">
              <q-btn
                type="submit"
                color="primary"
                label="Valider"
                icon="save"
                unelevated
                style="border-radius:10px; min-width:140px"
                :loading="submitting"
              />
              <q-btn
                type="reset"
                color="grey-6"
                label="Annuler"
                icon="refresh"
                unelevated
                style="border-radius:10px; min-width:140px"
                @click="resetForm"
              />
            </div>

          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationPfStore } from 'src/stores/energizer/liquidationPfStore.js'

defineOptions({ name: 'PeriodeActivite' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()

// ─── Interface ──────────────────────────────────────────────────
const loading    = ref(false)
const submitting = ref(false)
const errorMsg   = ref('')
const showDialog = ref(false)
const saisieFormRef = ref(null)

// ─── Recherche ──────────────────────────────────────────────────
const searchCriteria   = ref('fnumassu')
const searchStartValue = ref('')
const searchEndValue   = ref('')

const searchOptions = [
  { label: 'Num Assuré',  value: 'fnumassu' },
  { label: 'Noms Assuré', value: 'fnomassu' },
]

// ─── Options selects ────────────────────────────────────────────
const typeOptions = [
  { label: 'En Activité',  value: 'ACT' },
  { label: 'Interruption', value: 'INT' },
]

// ─── Formulaire ─────────────────────────────────────────────────
const FORM_INITIAL = {
  // Readonly (chargés depuis la table)
  matempl:        '',
  raisonsociale:  '',
  dateaffiliation:'',
  numassu:        '',
  nomassu:        '',
  prenomassu:     '',
  // Saisie
  typeact:        '',
  matassu:        '',
  numempl:        '',
  dateembauche:   '',
  datecessation:  '',
}

const form = reactive({ ...FORM_INITIAL })

// ─── Table ──────────────────────────────────────────────────────
const periodes = ref([])

const tableColumns = [
  { name: 'index',      label: 'N°',                 field: 'index',      align: 'center', style: 'width:50px' },
  { name: 'numassu',    label: 'N° Assuré',           field: 'numassu',    align: 'left', sortable: true },
  { name: 'nomassu',    label: 'Noms Assuré',         field: 'nomassu',    align: 'left', sortable: true },
  { name: 'numempl',    label: 'Matricule Employeur', field: 'numempl',    align: 'left', sortable: true },
  { name: 'typeact',    label: 'Type',                field: 'typeact',    align: 'left', sortable: true },
  { name: 'dateembauche',  label: 'Date Embauche',   field: 'dateembauche',  align: 'left', sortable: true },
  { name: 'datecessation', label: 'Date Cessation',  field: 'datecessation', align: 'left', sortable: true },
]

// ─── Données de test (à retirer en production) ──────────────────
const MOCK_PERIODES = [
  {
    rowKey: '1', numassu: '5-20-97-123456-78',
    nomassu: 'KAMGA Marie-Claire', numempl: '1-20-97-001234',
    typeact: 'ACT', libelleType: 'En Activité',
    dateembauche: '01-03-2020', datecessation: '',
    dateaffiliation: '01-03-2020', matempl: '1-20-97-001234',
    raisonsociale: 'SOCIÉTÉ DEMO SARL', prenomassu: 'Marie-Claire',
  },
  {
    rowKey: '2', numassu: '5-20-97-654321-12',
    nomassu: 'NKOA Sylvie', numempl: '1-20-97-005678',
    typeact: 'INT', libelleType: 'INTERRUPTION',
    dateembauche: '15-06-2018', datecessation: '28-02-2026',
    dateaffiliation: '15-06-2018', matempl: '1-20-97-005678',
    raisonsociale: 'ENTREPRISE NORD SARL', prenomassu: 'Sylvie',
  },
  {
    rowKey: '3', numassu: '5-20-97-987654-55',
    nomassu: 'MBELLA Claire', numempl: '1-20-97-009012',
    typeact: 'ACT', libelleType: 'En Activité',
    dateembauche: '10-01-2022', datecessation: '',
    dateaffiliation: '10-01-2022', matempl: '1-20-97-009012',
    raisonsociale: 'CABINET CONSEIL SUD', prenomassu: 'Claire',
  },
  {
    rowKey: '4', numassu: '5-20-97-111222-33',
    nomassu: 'ATANGANA Patience', numempl: '1-20-97-003344',
    typeact: 'INT', libelleType: 'INTERRUPTION',
    dateembauche: '05-09-2015', datecessation: '31-12-2025',
    dateaffiliation: '05-09-2015', matempl: '1-20-97-003344',
    raisonsociale: 'IMPORT EXPORT CENTRE', prenomassu: 'Patience',
  },
]

onMounted(async () => {
  try {
    const list = await pfStore.loadPeriodes()
    periodes.value = list?.length ? list : MOCK_PERIODES
  } catch {
    periodes.value = MOCK_PERIODES
  }
})

// ─── Dialog ──────────────────────────────────────────────────────
function openDialog() {
  showDialog.value = true
}

// ─── Chargement depuis table (équivalent loading()) ──────────────
// loading(numassu, nomassu, prenomassu, dateembauche, datecessation,
//         matempl, dateaffiliation, type)
function loadPeriode(row) {
  form.numassu        = row.numassu        ?? ''
  form.matassu        = row.numassu        ?? ''   // txtsaisiematassu = numassu
  form.nomassu        = row.nomassu        ?? ''
  form.prenomassu     = row.prenomassu     ?? ''
  form.matempl        = row.matempl        ?? ''
  form.numempl        = row.numempl        ?? ''   // txtsaisienumempl = matempl
  form.raisonsociale  = row.raisonsociale  ?? ''
  form.dateembauche   = row.dateembauche   ?? ''
  form.datecessation  = row.datecessation  ?? ''
  form.dateaffiliation = row.dateaffiliation ?? ''
  form.typeact        = row.typeact        ?? ''

  showDialog.value = true
  $q.notify({ type: 'positive', message: `Assuré ${row.numassu} chargé`, position: 'top', timeout: 1500 })
}

// ─── Validation ──────────────────────────────────────────────────
function validateForm() {
  if (!form.matassu) {
    $q.notify({ type: 'negative', message: 'Veuillez saisir le Numéro Assuré SVP!!!', position: 'top' })
    return false
  }
  if (!form.numempl) {
    $q.notify({ type: 'negative', message: 'Veuillez saisir le Numéro Employeur SVP!!!', position: 'top' })
    return false
  }
  if (!form.dateembauche) {
    $q.notify({ type: 'negative', message: 'Veuillez saisir une Date embauche SVP!!!', position: 'top' })
    return false
  }
  if (!form.typeact) {
    $q.notify({ type: 'negative', message: 'Veuillez sélectionner le type de chaque opération!!!', position: 'top' })
    return false
  }
  return true
}

// ─── Soumission (action = gestionperiodeactivite) ────────────────
async function submitForm() {
  const ok = await saisieFormRef.value?.validate()
  if (!ok) return
  if (!validateForm()) return

  submitting.value = true
  try {
    await pfStore.submitPeriode({ ...form })
    $q.notify({ type: 'positive', message: 'Période d\'activité enregistrée avec succès !', position: 'top', icon: 'check_circle' })
    showDialog.value = false
    resetForm()
  } catch {
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement", position: 'top' })
  } finally {
    submitting.value = false
  }
}

// ─── Réinitialisation ────────────────────────────────────────────
function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  saisieFormRef.value?.resetValidation()
}

// ─── Recherche ───────────────────────────────────────────────────
async function searchPeriodes() {
  loading.value = true
  errorMsg.value = ''
  try {
    periodes.value = await pfStore.loadPeriodes({
      criteria: searchCriteria.value,
      start: searchStartValue.value,
      end: searchEndValue.value,
    })
    $q.notify({ type: 'info', message: 'Recherche effectuée', position: 'top' })
  } catch {
    periodes.value = MOCK_PERIODES
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchCriteria.value   = 'fnumassu'
  searchStartValue.value = ''
  searchEndValue.value   = ''
  periodes.value = MOCK_PERIODES
  errorMsg.value = ''
}
</script>

<style scoped>
.periode-activite {
  max-width: 1400px;
  margin: 0 auto;
}

.card-elevated {
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header-rounded {
  border-radius: 15px 15px 0 0;
}

/* ── Dialog ───────────────────────────────────── */
.dialog-form-card {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
}

/* ── Séparateurs de sections ──────────────────── */
.sep {
  font-size: 0.72rem;
  font-weight: 700;
  color: #1976d2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-left: 3px solid #1976d2;
  padding: 2px 0 2px 8px;
  background: linear-gradient(to right, rgba(25, 118, 210, 0.06), transparent);
  border-radius: 0 4px 4px 0;
}

/* ── Liens table ──────────────────────────────── */
.dossier-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
  transition: color 0.2s;
}
.dossier-link:hover {
  color: #0d47a1;
  text-decoration: underline;
}

.periodes-table { border-radius: 0 0 15px 15px; }
.periodes-table :deep(.q-table__bottom) {
  background: #fafafa;
  border-radius: 0 0 15px 15px;
}
</style>

<template>
  <div class="q-pa-sm gestion-pmd">

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
        <q-form @submit.prevent="searchPmd" @reset="resetSearch">
          <div class="row q-col-gutter-sm items-end">
            <div class="col-12 col-sm-3">
              <q-select
                v-model="searchCriteria"
                :options="searchOptions"
                label="Critères"
                outlined dense emit-value map-options color="primary"
                @update:model-value="onCriteriaChange"
              />
            </div>
            <div class="col-12 col-sm-3">
              <q-input
                v-model="searchStartValue"
                :label="searchCriteria === 'fdatepmd' ? 'Date Début' : 'Valeur de Début'"
                outlined dense
                @update:model-value="val => { if (searchCriteria !== 'fdatepmd') searchStartValue = (val || '').toUpperCase() }"
              >
                <template v-if="searchCriteria === 'fdatepmd'" v-slot:append>
                  <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="searchStartValue" mask="DD/MM/YYYY" today-btn color="primary">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat dense />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-3">
              <q-input
                v-model="searchEndValue"
                :label="searchCriteria === 'fdatepmd' ? 'Date Fin' : 'Valeur de Fin'"
                outlined dense
                @update:model-value="val => { if (searchCriteria !== 'fdatepmd') searchEndValue = (val || '').toUpperCase() }"
              >
                <template v-if="searchCriteria === 'fdatepmd'" v-slot:append>
                  <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="searchEndValue" mask="DD/MM/YYYY" today-btn color="primary">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat dense />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
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
         LISTE DES PMD  +  bouton Nouvelle Saisie
    ═══════════════════════════════════════════════════════ -->
    <q-card class="card-elevated">
      <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="description" size="xs" class="q-mr-xs" />
            <span class="text-body2 text-weight-bold">Gestion des Pièces de Maintien de Droits</span>
          </div>
          <div class="row items-center q-gutter-sm">
            <q-badge color="white" text-color="primary" :label="`${pmdList.length} enregistrement(s)`" />
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
          :rows="pmdList"
          :columns="tableColumns"
          row-key="rowKey"
          :loading="loading"
          dense flat
          :rows-per-page-options="[10, 20, 50]"
          no-data-label="Aucune pièce trouvée — utilisez la recherche ci-dessus"
          class="pmd-table"
        >
          <template v-slot:body-cell-index="props">
            <q-td :props="props" class="text-center text-grey-6">{{ props.rowIndex + 1 }}</q-td>
          </template>

          <template v-slot:body-cell-numassu="props">
            <q-td :props="props">
              <a class="dossier-link" href="#" @click.prevent="loadPmd(props.row)">
                <q-icon name="person" size="xs" class="q-mr-xs" />{{ props.row.numassu }}
              </a>
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
         DIALOG – FORMULAIRE PMD
    ═══════════════════════════════════════════════════════ -->
    <q-dialog v-model="showDialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="dialog-form-card">

        <!-- En-tête -->
        <q-bar class="bg-primary text-white q-py-sm">
          <q-icon name="description" />
          <span class="q-ml-sm text-body1 text-weight-bold">Pièce de Maintien de Droit — Saisie</span>
          <q-space />
          <q-btn flat dense round color="white" icon="restart_alt" size="sm" @click="resetForm">
            <q-tooltip>Réinitialiser</q-tooltip>
          </q-btn>
          <q-btn flat dense round color="white" icon="close" size="sm" v-close-popup @click="resetForm" />
        </q-bar>

        <!-- Corps scrollable -->
        <q-card-section class="q-pa-sm overflow-auto dialog-body">
          <q-form ref="saisieFormRef" @submit.prevent="submitForm" @reset="resetForm">

            <!-- ── Assuré ── -->
            <div class="sep q-mb-xs">
              <q-icon name="person" size="xs" class="q-mr-xs" />Assuré
            </div>
            <div class="row q-col-gutter-xs q-mb-sm items-start">
              <div class="col-6 col-md-3">
                <q-input
                  v-model="form.numassu"
                  label="* N° Assuré"
                  outlined dense
                  label-color="red-7"
                  :rules="[v => !!v || 'Numéro Assuré SVP!!']"
                >
                  <template v-slot:prepend><q-icon name="badge" color="red-7" size="xs" /></template>
                </q-input>
              </div>
              <div class="col-6 col-md-4">
                <q-input v-model="form.nomassu" label="Noms Assuré" outlined dense readonly bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-5">
                <q-input v-model="form.prenomassu" label="Prénoms Assuré" outlined dense readonly bg-color="yellow-1" />
              </div>
            </div>

            <!-- ── Bénéficiaire ── -->
            <div class="sep q-mb-xs">
              <q-icon name="child_care" size="xs" class="q-mr-xs" />Bénéficiaire
            </div>
            <div class="row q-col-gutter-xs q-mb-sm items-start">
              <div class="col-6 col-md-2">
                <q-input
                  v-model="form.numbene"
                  label="* N° Bénéficiaire"
                  outlined dense
                  label-color="red-7"
                  :rules="[v => !!v || 'Entrez le Numéro du bénéficiaire SVP']"
                >
                  <template v-slot:prepend><q-icon name="tag" color="red-7" size="xs" /></template>
                </q-input>
              </div>
              <div class="col-6 col-md-4">
                <q-input v-model="form.nombene" label="Noms Bénéficiaire" outlined dense readonly bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-3">
                <q-input v-model="form.prenombene" label="Prénoms Bénéficiaire" outlined dense readonly bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-3">
                <q-input v-model="form.datenaiss" label="Date Naissance" outlined dense readonly bg-color="yellow-1">
                  <template v-slot:prepend><q-icon name="cake" color="amber-8" size="xs" /></template>
                </q-input>
              </div>
            </div>

            <!-- ── Situation ── -->
            <div class="sep q-mb-xs">
              <q-icon name="info_outline" size="xs" class="q-mr-xs" />Situation du Bénéficiaire
            </div>
            <div class="row q-col-gutter-xs q-mb-sm items-start">
              <div class="col-6 col-md-3">
                <q-input v-model="form.position" label="Position" outlined dense readonly bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-3">
                <q-input v-model="form.motif" label="Motif" outlined dense readonly bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.dateposi" label="Date Position" outlined dense readonly bg-color="yellow-1">
                  <template v-slot:prepend><q-icon name="event" color="amber-8" size="xs" /></template>
                </q-input>
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.scolarise" label="Scolarisé ?" outlined dense readonly bg-color="yellow-1" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.apprentissage" label="En Apprentissage ?" outlined dense readonly bg-color="yellow-1" />
              </div>
            </div>

            <!-- ── Période de validité ── -->
            <div class="sep q-mb-xs">
              <q-icon name="date_range" size="xs" class="q-mr-xs" />Période de Validité
            </div>
            <div class="row q-col-gutter-xs q-mb-sm items-start">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.datedebut"
                  label="* Date Début"
                  outlined dense
                  label-color="red-7"
                  bg-color="yellow-1"
                  :rules="[v => !!v || 'Entrez la Date de début SVP !!!']"
                >
                  <template v-slot:prepend><q-icon name="event" color="red-7" size="xs" /></template>
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datedebut" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="primary" flat dense />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.datefin"
                  label="* Date Fin"
                  outlined dense
                  label-color="red-7"
                  bg-color="yellow-1"
                  :rules="[v => !!v || 'Entrez la date de fin SVP']"
                >
                  <template v-slot:prepend><q-icon name="event_busy" color="red-7" size="xs" /></template>
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datefin" mask="DD/MM/YYYY" today-btn color="primary">
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
                label="Enregistrer"
                icon="save"
                unelevated
                style="border-radius:10px; min-width:140px"
                :loading="submitting"
              />
              <q-btn
                color="negative"
                label="Supprimer"
                icon="delete"
                unelevated
                style="border-radius:10px; min-width:140px"
                :loading="deleting"
                :disable="!form.numassu || !form.numbene"
                @click="deletePmd"
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

defineOptions({ name: 'GestionPieceMaintientDroit' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()

// ─── Interface ──────────────────────────────────────────────────
const loading    = ref(false)
const submitting = ref(false)
const deleting   = ref(false)
const errorMsg   = ref('')
const showDialog = ref(false)
const saisieFormRef = ref(null)

// ─── Recherche ──────────────────────────────────────────────────
const searchCriteria   = ref('fnumassu')
const searchStartValue = ref('')
const searchEndValue   = ref('')

const searchOptions = [
  { label: 'Num Assuré',          value: 'fnumassu'  },
  { label: 'Noms Assuré',         value: 'fnomassu'  },
  { label: 'Noms Bénéficiaire',   value: 'fnombene'  },
  { label: 'Date',                value: 'fdatepmd'  },
]

function onCriteriaChange() {
  searchStartValue.value = ''
  searchEndValue.value   = ''
}

// ─── Formulaire ─────────────────────────────────────────────────
const FORM_INITIAL = {
  // Assuré
  numassu:      '',
  nomassu:      '',
  prenomassu:   '',
  // Bénéficiaire
  numbene:      '',
  nombene:      '',
  prenombene:   '',
  datenaiss:    '',
  // Situation
  position:     '',
  motif:        '',
  dateposi:     '',   // txtsaisedatenaiss (labelé "Date Position" dans le JSP, reçoit datenaiss)
  scolarise:    '',
  apprentissage:'',
  // Période
  datedebut:    '',
  datefin:      '',
}

const form = reactive({ ...FORM_INITIAL })

// ─── Table ──────────────────────────────────────────────────────
const pmdList = ref([])

const tableColumns = [
  { name: 'index',     label: 'N°',                 field: 'index',     align: 'center', style: 'width:50px' },
  { name: 'numassu',   label: 'N° Assuré',           field: 'numassu',   align: 'left', sortable: true },
  { name: 'nomassu',   label: 'Noms Assuré',         field: 'nomassu',   align: 'left', sortable: true },
  { name: 'numbene',   label: 'N° Bénéficiaire',     field: 'numbene',   align: 'left', sortable: true },
  { name: 'nombene',   label: 'Noms Bénéficiaire',   field: 'nombene',   align: 'left', sortable: true },
  { name: 'datenaiss', label: 'Date Naissance',      field: 'datenaiss', align: 'left', sortable: true },
  { name: 'datedebut', label: 'Date Début',          field: 'datedebut', align: 'left', sortable: true },
  { name: 'datefin',   label: 'Date Fin',            field: 'datefin',   align: 'left', sortable: true },
]

// ─── Données de test (à retirer en production) ──────────────────
const MOCK_PMD = [
  {
    rowKey: '1',
    numassu: '5-20-97-123456-78', nomassu: 'KAMGA Marie-Claire', prenomassu: 'Marie-Claire',
    numbene: '01', nombene: 'KAMGA', prenombene: 'Paul Junior',
    datenaiss: '12/05/2012', position: 'A', motif: 'ENF', dateposi: '12/05/2012',
    scolarise: 'OUI', apprentissage: 'NON',
    datedebut: '01/01/2026', datefin: '31/12/2026',
  },
  {
    rowKey: '2',
    numassu: '5-20-97-654321-12', nomassu: 'NKOA Sylvie', prenomassu: 'Sylvie',
    numbene: '02', nombene: 'NKOA', prenombene: 'Grace Esther',
    datenaiss: '03/08/2009', position: 'A', motif: 'ENF', dateposi: '03/08/2009',
    scolarise: 'OUI', apprentissage: 'NON',
    datedebut: '01/01/2026', datefin: '31/12/2026',
  },
  {
    rowKey: '3',
    numassu: '5-20-97-987654-55', nomassu: 'MBELLA Claire', prenomassu: 'Claire',
    numbene: '01', nombene: 'MBELLA', prenombene: 'Cyrille',
    datenaiss: '20/11/2014', position: 'A', motif: 'ENF', dateposi: '20/11/2014',
    scolarise: 'NON', apprentissage: 'OUI',
    datedebut: '01/03/2026', datefin: '28/02/2027',
  },
  {
    rowKey: '4',
    numassu: '5-20-97-111222-33', nomassu: 'ATANGANA Patience', prenomassu: 'Patience',
    numbene: '03', nombene: 'ATANGANA', prenombene: 'Lionel',
    datenaiss: '07/02/2018', position: 'A', motif: 'ENF', dateposi: '07/02/2018',
    scolarise: 'NON', apprentissage: 'NON',
    datedebut: '01/06/2026', datefin: '31/05/2027',
  },
]

onMounted(async () => {
  try {
    const list = await pfStore.loadPmd()
    pmdList.value = list?.length ? list : MOCK_PMD
  } catch {
    pmdList.value = MOCK_PMD
  }
})

// ─── Dialog ──────────────────────────────────────────────────────
function openDialog() {
  showDialog.value = true
}

// ─── Chargement depuis table (équivalent loading()) ──────────────
// loading(numassu, nomassu, prenomassu, numbene, nombene, prenombene,
//         position, motif, scolarise, apprentissage, datenaiss, datedeb, datefin)
function loadPmd(row) {
  form.numassu       = row.numassu      !== 'null' ? (row.numassu      ?? '') : ''
  form.nomassu       = row.nomassu      !== 'null' ? (row.nomassu      ?? '') : ''
  form.prenomassu    = row.prenomassu   !== 'null' ? (row.prenomassu   ?? '') : ''
  form.numbene       = row.numbene      !== 'null' ? String(row.numbene ?? '') : ''
  form.nombene       = row.nombene      !== 'null' ? (row.nombene      ?? '') : ''
  form.prenombene    = row.prenombene   !== 'null' ? (row.prenombene   ?? '') : ''
  form.position      = row.position     !== 'null' ? (row.position     ?? '') : ''
  form.motif         = row.motif        !== 'null' ? (row.motif        ?? '') : ''
  form.scolarise     = row.scolarise    !== 'null' ? (row.scolarise    ?? '') : ''
  form.apprentissage = row.apprentissage!== 'null' ? (row.apprentissage ?? '') : ''
  form.datenaiss     = row.datenaiss    !== 'null' ? (row.datenaiss    ?? '') : ''
  form.dateposi      = row.datenaiss    !== 'null' ? (row.datenaiss    ?? '') : ''
  form.datedebut     = row.datedebut    !== 'null' ? (row.datedebut    ?? '') : ''
  form.datefin       = row.datefin      !== 'null' ? (row.datefin      ?? '') : ''

  showDialog.value = true
  $q.notify({ type: 'positive', message: `Assuré ${row.numassu} / Bénéficiaire ${row.numbene} chargé`, position: 'top', timeout: 1500 })
}

// ─── Validation ──────────────────────────────────────────────────
function validateForm() {
  if (!form.numbene) {
    $q.notify({ type: 'negative', message: 'Entrez le Numéro du bénéficiaire SVP', position: 'top' })
    return false
  }
  if (!form.numassu) {
    $q.notify({ type: 'negative', message: 'Numéro Assuré SVP!!', position: 'top' })
    return false
  }
  if (!form.datedebut) {
    $q.notify({ type: 'negative', message: 'Entrez la Date de début SVP !!!', position: 'top' })
    return false
  }
  if (!form.datefin) {
    $q.notify({ type: 'negative', message: 'Entrez la date de fin SVP', position: 'top' })
    return false
  }
  return true
}

// ─── Enregistrer (submitFunction(1) → action="gestpmd") ──────────
async function submitForm() {
  const ok = await saisieFormRef.value?.validate()
  if (!ok) return
  if (!validateForm()) return

  submitting.value = true
  try {
    await pfStore.submitPmd({ ...form })
    $q.notify({ type: 'positive', message: 'Pièce de maintien de droit enregistrée avec succès !', position: 'top', icon: 'check_circle' })
    showDialog.value = false
    resetForm()
  } catch {
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement", position: 'top' })
  } finally {
    submitting.value = false
  }
}

// ─── Supprimer (submitFunction(2)) ───────────────────────────────
async function deletePmd() {
  $q.dialog({
    title: 'Confirmer la suppression',
    message: `Supprimer la pièce pour l'assuré <b>${form.numassu}</b> / bénéficiaire <b>${form.numbene}</b> ?`,
    html: true,
    cancel: { label: 'Annuler', flat: true, color: 'grey-7' },
    ok: { label: 'Supprimer', color: 'negative', unelevated: true },
  }).onOk(async () => {
    deleting.value = true
    try {
      await pfStore.removePmd(`${form.numassu}|${form.numbene}`)
      $q.notify({ type: 'positive', message: 'Pièce supprimée avec succès !', position: 'top' })
      showDialog.value = false
      resetForm()
    } catch {
      $q.notify({ type: 'negative', message: 'Erreur lors de la suppression', position: 'top' })
    } finally {
      deleting.value = false
    }
  })
}

// ─── Réinitialisation ────────────────────────────────────────────
function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  saisieFormRef.value?.resetValidation()
}

// ─── Recherche ───────────────────────────────────────────────────
async function searchPmd() {
  loading.value = true
  errorMsg.value = ''
  try {
    pmdList.value = await pfStore.loadPmd({
      criteria: searchCriteria.value,
      start: searchStartValue.value,
      end: searchEndValue.value,
    })
    $q.notify({ type: 'info', message: 'Recherche effectuée', position: 'top' })
  } catch {
    pmdList.value = MOCK_PMD
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchCriteria.value   = 'fnumassu'
  searchStartValue.value = ''
  searchEndValue.value   = ''
  pmdList.value = MOCK_PMD
  errorMsg.value = ''
}
</script>

<style scoped>
.gestion-pmd {
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

.pmd-table { border-radius: 0 0 15px 15px; }
.pmd-table :deep(.q-table__bottom) {
  background: #fafafa;
  border-radius: 0 0 15px 15px;
}
</style>

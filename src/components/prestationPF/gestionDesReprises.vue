<template>
  <div class="q-pa-sm gestion-reprises">

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
          <span class="text-body2 text-weight-bold">Recherche de Dossiers</span>
        </div>
      </q-card-section>
      <q-card-section class="q-py-sm">
        <q-form @submit.prevent="searchDossiers" @reset="resetSearch">
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
         LISTE DES DOSSIERS  +  bouton Nouvelle Saisie
    ═══════════════════════════════════════════════════════ -->
    <q-card class="card-elevated">
      <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="restart_alt" size="xs" class="q-mr-xs" />
            <span class="text-body2 text-weight-bold">Reprises / Non Reprises en IJ</span>
          </div>
          <div class="row items-center q-gutter-sm">
            <q-badge color="white" text-color="primary" :label="`${dossiers.length} dossier(s)`" />
            <q-btn
              color="white"
              text-color="primary"
              icon="add"
              label="Nouvelle saisie"
              dense unelevated size="sm"
              style="border-radius:8px; font-weight:600;"
              @click="openDialog()"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-table
          :rows="dossiers"
          :columns="tableColumns"
          row-key="numdoss"
          :loading="loading"
          dense flat
          :rows-per-page-options="[10, 20, 50]"
          no-data-label="Aucun dossier trouvé — utilisez la recherche ci-dessus"
          class="reprises-table"
        >
          <template v-slot:body-cell-index="props">
            <q-td :props="props" class="text-center text-grey-6">{{ props.rowIndex + 1 }}</q-td>
          </template>

          <template v-slot:body-cell-numdoss="props">
            <q-td :props="props">
              <a class="dossier-link" href="#" @click.prevent="loadDossier(props.row)">
                <q-icon name="folder_open" size="xs" class="q-mr-xs" />{{ props.row.numdoss }}
              </a>
            </q-td>
          </template>

          <template v-slot:body-cell-flagreprise="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.flagreprise === 'OUI' ? 'positive' : 'orange-7'"
                :label="props.row.flagreprise === 'OUI' ? 'Reprise' : 'Non Reprise'"
                style="font-size:0.7rem"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-position="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.position)"
                :label="props.row.position || '—'" style="font-size:0.7rem" />
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
         DIALOG – FORMULAIRE DE SAISIE REPRISE
    ═══════════════════════════════════════════════════════ -->
    <q-dialog v-model="showDialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="dialog-form-card">

        <!-- En-tête -->
        <q-bar class="bg-primary text-white q-py-sm">
          <q-icon name="restart_alt" />
          <span class="q-ml-sm text-body1 text-weight-bold">Certificat de Reprise / Non Reprise en IJ</span>
          <q-space />
          <q-btn flat dense round color="white" icon="restart_alt" size="sm" @click="resetForm">
            <q-tooltip>Réinitialiser</q-tooltip>
          </q-btn>
          <q-btn flat dense round color="white" icon="close" size="sm" v-close-popup @click="resetForm" />
        </q-bar>

        <!-- Corps scrollable -->
        <q-card-section class="q-pa-sm overflow-auto dialog-body">
          <q-form ref="saisieFormRef" @submit.prevent="submitForm" @reset="resetForm">

            <!-- ── Identification du dossier ── -->
            <div class="sep q-mb-xs">
              <q-icon name="folder_open" size="xs" class="q-mr-xs" />Identification du Dossier
            </div>
            <div class="row q-col-gutter-xs q-mb-sm">
              <div class="col-6 col-md-2">
                <q-input v-model="form.numdoss" label="N° Dossier" outlined dense readonly
                  bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-3">
                <q-input v-model="form.natupres" label="Nature Prestation" outlined dense readonly
                  bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.datedemande" label="Date Demande" outlined dense readonly
                  bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.numassu" label="N° Assuré" outlined dense readonly
                  bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.nomassu" label="Noms Assuré" outlined dense readonly
                  bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-1">
                <q-input v-model="form.prenomassu" label="Prénoms" outlined dense readonly
                  bg-color="blue-grey-1" label-color="primary" />
              </div>
            </div>

            <!-- ── Reprise / Non Reprise ── -->
            <div class="sep q-mb-xs">
              <q-icon name="event_repeat" size="xs" class="q-mr-xs" />Données de Reprise
            </div>
            <div class="row q-col-gutter-xs q-mb-sm items-start">

              <!-- Type -->
              <div class="col-12 col-md-2">
                <q-select
                  v-model="form.flagreprise"
                  :options="typeOptions"
                  label="Type"
                  outlined dense emit-value map-options color="primary"
                />
              </div>

              <!-- Rang -->
              <div class="col-6 col-md-1">
                <q-select
                  v-model="form.rang"
                  :options="rangOptions"
                  label="Rang"
                  outlined dense emit-value map-options color="primary"
                />
              </div>

              <!-- Date Début -->
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.datedebut"
                  label="Date Début"
                  outlined dense
                  bg-color="yellow-1"
                  :rules="[v => !!v || 'Date début obligatoire']"
                >
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

              <!-- Date Fin -->
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.datefin"
                  label="Date Fin"
                  outlined dense
                  bg-color="yellow-1"
                >
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

              <!-- Matricule Assuré -->
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.matassu"
                  label="Matricule Assuré"
                  outlined dense readonly
                  bg-color="blue-grey-1"
                  label-color="primary"
                  :rules="[v => !!v || 'Veuillez sélectionner un dossier']"
                />
              </div>
            </div>

            <!-- Jours Payés / Reliquat -->
            <div class="row q-col-gutter-xs q-mb-sm items-start">
              <div class="col-6 col-md-2">
                <q-input
                  v-model.number="form.jourspayes"
                  label="Jours Payés"
                  type="number" min="0"
                  outlined dense
                />
              </div>
              <div class="col-6 col-md-2">
                <q-input
                  v-model.number="form.joursreliquat"
                  label="Reliquat Jours"
                  type="number" min="0"
                  outlined dense
                />
              </div>
            </div>

            <!-- ── Remboursement Employeur ── -->
            <div class="sep q-mb-xs">
              <q-icon name="business" size="xs" class="q-mr-xs" />Remboursement Employeur
            </div>
            <div class="row q-col-gutter-xs q-mb-sm items-start">

              <!-- Remboursement Employeur? -->
              <div class="col-12 col-md-2">
                <q-select
                  v-model="form.flagrembempl"
                  :options="rembEmplOptions"
                  label="Remboursement Employeur ?"
                  outlined dense emit-value map-options color="primary"
                />
              </div>

              <!-- N° Employeur -->
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.numempl"
                  label="N° Employeur"
                  outlined dense
                  bg-color="yellow-1"
                  :disable="form.flagrembempl === 'NON'"
                >
                  <template v-slot:prepend>
                    <q-icon name="business" color="amber-8" size="xs" />
                  </template>
                </q-input>
              </div>

              <!-- Date Début Remboursement -->
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.datedebrempl"
                  label="Date Début Remboursement"
                  outlined dense
                  bg-color="yellow-1"
                  :disable="form.flagrembempl === 'NON'"
                >
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datedebrempl" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="primary" flat dense />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <!-- Date Fin Remboursement -->
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.datefinrempl"
                  label="Date Fin Remboursement"
                  outlined dense
                  bg-color="yellow-1"
                  :disable="form.flagrembempl === 'NON'"
                >
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datefinrempl" mask="DD/MM/YYYY" today-btn color="primary">
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
                color="negative"
                label="Supprimer"
                icon="delete"
                unelevated
                style="border-radius:10px; min-width:140px"
                :loading="deleting"
                :disable="!form.numdoss"
                @click="deleteReprise"
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

defineOptions({ name: 'GestionDesReprises' })

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
const searchCriteria   = ref('fnumdoss')
const searchStartValue = ref('000-')
const searchEndValue   = ref('')

const searchOptions = [
  { label: 'Num Dossier', value: 'fnumdoss' },
  { label: 'Num Assuré',  value: 'fnumassu' },
  { label: 'Noms Assuré', value: 'fnomassu' },
]

// ─── Options des selects ─────────────────────────────────────────
const typeOptions = [
  { label: 'Non Reprise', value: 'NON' },
  { label: 'Reprise',     value: 'OUI' },
]

const rangOptions = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
]

const rembEmplOptions = [
  { label: 'NON', value: 'NON' },
  { label: 'OUI', value: 'OUI' },
]

// ─── Formulaire ─────────────────────────────────────────────────
const FORM_INITIAL = {
  numdoss:      '',
  numassu:      '',
  natupres:     '',
  datedemande:  '',
  nomassu:      '',
  prenomassu:   '',
  // Reprise
  flagreprise:  'NON',
  rang:         '1',
  datedebut:    '',
  datefin:      '',
  matassu:      '',
  jourspayes:   0,
  joursreliquat: 0,
  // Remboursement employeur
  flagrembempl: 'NON',
  numempl:      '',
  datedebrempl: '',
  datefinrempl: '',
}

const form = reactive({ ...FORM_INITIAL })

// ─── Table ──────────────────────────────────────────────────────
const dossiers = ref([])

const tableColumns = [
  { name: 'index',       label: 'N°',               field: 'index',       align: 'center', style: 'width:50px' },
  { name: 'numdoss',     label: 'N° Dossier',        field: 'numdoss',     align: 'left', sortable: true },
  { name: 'numassu',     label: 'N° Assuré',         field: 'numassu',     align: 'left', sortable: true },
  { name: 'requerant',   label: 'Noms Requérant',    field: 'requerant',   align: 'left', sortable: true },
  { name: 'datedemande', label: 'Date Demande',       field: 'datedemande', align: 'left', sortable: true },
  { name: 'natupres',    label: 'Nature Prestation',  field: 'natupres',    align: 'left', sortable: true },
  { name: 'flagreprise', label: 'Type',               field: 'flagreprise', align: 'left', sortable: true },
  { name: 'rang',        label: 'Rang',               field: 'rang',        align: 'center', sortable: true },
  { name: 'position',    label: 'Position Dossier',   field: 'position',    align: 'left', sortable: true },
  { name: 'dateposi',    label: 'Date Position',      field: 'dateposi',    align: 'left', sortable: true },
]

// ─── Données de test (à retirer en production) ──────────────────
const MOCK_REPRISES = [
  {
    numdoss: 'F2026-001', numassu: '5-20-97-123456-78',
    requerant: 'KAMGA Marie-Claire', datedemande: '15/03/2026',
    natupres: 'Prestations Familiales', position: 'En Cours de Traitement', dateposi: '15/03/2026',
    nomassu: 'KAMGA', prenomassu: 'Marie-Claire',
    datedebut: '20/03/2026', datefin: '28/05/2026',
    flagreprise: 'NON', jourspayes: 98, joursreliquat: 0,
    rang: '1', flagrembempl: 'NON', numempl: '1-20-97-001234',
    datedebrempl: '', datefinrempl: '',
  },
  {
    numdoss: 'F2026-002', numassu: '5-20-97-654321-12',
    requerant: 'NKOA Sylvie', datedemande: '02/04/2026',
    natupres: 'Indemnités Journalières', position: 'En attente de pièces', dateposi: '05/04/2026',
    nomassu: 'NKOA', prenomassu: 'Sylvie',
    datedebut: '01/04/2026', datefin: '30/06/2026',
    flagreprise: 'OUI', jourspayes: 45, joursreliquat: 53,
    rang: '2', flagrembempl: 'OUI', numempl: '1-20-97-005678',
    datedebrempl: '01/04/2026', datefinrempl: '30/06/2026',
  },
  {
    numdoss: 'F2026-003', numassu: '5-20-97-987654-55',
    requerant: 'MBELLA Claire', datedemande: '20/04/2026',
    natupres: 'Alloc. Accouchement Prématuré', position: 'Transmis au superviseur', dateposi: '22/04/2026',
    nomassu: 'MBELLA', prenomassu: 'Claire',
    datedebut: '', datefin: '',
    flagreprise: 'NON', jourspayes: 0, joursreliquat: 0,
    rang: '1', flagrembempl: 'NON', numempl: '',
    datedebrempl: '', datefinrempl: '',
  },
  {
    numdoss: 'F2026-004', numassu: '5-20-97-111222-33',
    requerant: 'ATANGANA Patience', datedemande: '01/05/2026',
    natupres: 'Prestations Familiales', position: 'Annuler Liquidation', dateposi: '03/05/2026',
    nomassu: 'ATANGANA', prenomassu: 'Patience',
    datedebut: '06/04/2026', datefin: '12/07/2026',
    flagreprise: 'OUI', jourspayes: 60, joursreliquat: 38,
    rang: '3', flagrembempl: 'OUI', numempl: '1-20-97-003344',
    datedebrempl: '06/04/2026', datefinrempl: '12/07/2026',
  },
]

onMounted(async () => {
  try {
    const list = await pfStore.loadReprises()
    dossiers.value = list?.length ? list : MOCK_REPRISES
  } catch {
    dossiers.value = MOCK_REPRISES
  }
})

// ─── Dialog ──────────────────────────────────────────────────────
function openDialog() {
  showDialog.value = true
}

// ─── Chargement dossier depuis la table (équivalent loading()) ──
function loadDossier(row) {
  form.numdoss     = row.numdoss     ?? ''
  form.numassu     = row.numassu     ?? ''
  form.natupres    = row.natupres    ?? ''
  form.datedemande = row.datedemande ?? ''
  form.nomassu     = row.nomassu     ?? ''
  form.prenomassu  = row.prenomassu  ?? ''
  form.matassu     = row.numassu     ?? ''   // matricule = num_assu
  form.datedebut   = row.datedebut   ?? ''
  form.datefin     = row.datefin     ?? ''
  form.flagreprise = row.flagreprise ?? 'NON'
  form.jourspayes  = row.jourspayes  ?? 0
  form.joursreliquat = row.joursreliquat ?? 0
  form.rang        = String(row.rang ?? '1')
  form.flagrembempl = row.flagrembempl ?? 'NON'
  form.numempl     = row.numempl     ?? ''
  form.datedebrempl = row.datedebrempl ?? ''
  form.datefinrempl = row.datefinrempl ?? ''

  showDialog.value = true
  $q.notify({ type: 'positive', message: `Dossier ${row.numdoss} chargé`, position: 'top', timeout: 1500 })
}

// ─── Validation ──────────────────────────────────────────────────
function validateForm() {
  if (!form.matassu) {
    $q.notify({ type: 'negative', message: 'Veuillez saisir le Numéro Assuré SVP !!!', position: 'top' })
    return false
  }
  if (!form.datedebut) {
    $q.notify({ type: 'negative', message: 'Veuillez saisir la date début SVP !!!', position: 'top' })
    return false
  }
  if (form.jourspayes > 98) {
    $q.notify({ type: 'negative', message: 'Le nombre de Jours de congés de maternité doit être inférieur ou égal à 98', position: 'top' })
    return false
  }
  return true
}

// ─── Soumission (Valider → action = gestiondesreprises) ──────────
async function submitForm() {
  const ok = await saisieFormRef.value?.validate()
  if (!ok) return
  if (!validateForm()) return

  submitting.value = true
  try {
    await pfStore.submitReprise({ ...form })
    $q.notify({ type: 'positive', message: 'Reprise enregistrée avec succès !', position: 'top', icon: 'check_circle' })
    showDialog.value = false
    resetForm()
  } catch {
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement", position: 'top' })
  } finally {
    submitting.value = false
  }
}

// ─── Suppression (Supprimer → action = delnonreprise) ───────────
async function deleteReprise() {
  $q.dialog({
    title: 'Confirmer la suppression',
    message: `Supprimer la reprise du dossier <b>${form.numdoss}</b> ?`,
    html: true,
    cancel: { label: 'Annuler', flat: true, color: 'grey-7' },
    ok: { label: 'Supprimer', color: 'negative', unelevated: true },
  }).onOk(async () => {
    deleting.value = true
    try {
      await pfStore.removeReprise(form.numdoss || form.id)
      $q.notify({ type: 'positive', message: 'Reprise supprimée avec succès !', position: 'top' })
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
async function searchDossiers() {
  loading.value = true
  errorMsg.value = ''
  try {
    dossiers.value = await pfStore.loadReprises({
      criteria: searchCriteria.value,
      start: searchStartValue.value,
      end: searchEndValue.value,
    })
    $q.notify({ type: 'info', message: 'Recherche effectuée', position: 'top' })
  } catch {
    dossiers.value = MOCK_REPRISES
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchCriteria.value   = 'fnumdoss'
  searchStartValue.value = '000-'
  searchEndValue.value   = ''
  dossiers.value = MOCK_REPRISES
  errorMsg.value = ''
}

// ─── Helpers UI ──────────────────────────────────────────────────
function getStatusColor(status) {
  if (!status) return 'grey-5'
  const s = status.toLowerCase()
  if (s.includes('cours'))   return 'orange-7'
  if (s.includes('attente')) return 'blue-6'
  if (s.includes('transmi')) return 'teal-6'
  if (s.includes('annul'))   return 'negative'
  return 'grey-6'
}
</script>

<style scoped>
.gestion-reprises {
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

.reprises-table { border-radius: 0 0 15px 15px; }
.reprises-table :deep(.q-table__bottom) {
  background: #fafafa;
  border-radius: 0 0 15px 15px;
}
</style>

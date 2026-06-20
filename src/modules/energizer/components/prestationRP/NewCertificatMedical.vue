<template>
  <div class="q-pa-sm new-certificat">

    <!-- En-tête -->
    <div class="text-center q-mb-sm">
      <div class="text-h6 text-primary text-weight-bold">
        <q-icon name="medical_information" class="q-mr-xs" />
        Ajout de Certificats Médicaux
      </div>
      <div class="text-caption text-grey-6">
        Certificat Initial · Prolongation · Final — AT/MP
      </div>
    </div>

    <q-banner v-if="loadError" class="bg-negative text-white q-mb-sm" rounded dense>
      {{ loadError }}
    </q-banner>

    <!-- Règle métier -->
    <q-banner class="bg-blue-1 text-primary q-mb-sm" rounded dense>
      <template v-slot:avatar><q-icon name="info" color="primary" size="sm" /></template>
      <span class="text-caption">
        Pour tout dossier AT/MP, le <b>certificat médical initial (CI)</b> et le <b>certificat final (CF)</b> sont <b>uniques</b>.
        Le CI doit exister avant tout ajout de certificat de prolongation ou final.
      </span>
    </q-banner>

    <q-form ref="formRef" @submit.prevent="submitForm">

      <!-- ═══════════════════════════════════════════════════════
           SECTION 1 : IDENTIFICATION
      ═══════════════════════════════════════════════════════ -->
      <q-card class="q-mb-sm card-elevated">
        <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-icon name="folder_open" size="xs" class="q-mr-xs" />
              <span class="text-body2 text-weight-bold">Identification du Dossier</span>
            </div>
            <q-btn flat dense round icon="restart_alt" color="white" size="sm" @click="resetForm">
              <q-tooltip>Réinitialiser</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
        <q-card-section class="q-py-sm">
          <div class="row q-col-gutter-xs q-mb-xs">

            <!-- Sélection dossier -->
            <div class="col-12 col-md-4">
              <q-select
                v-model="selectedDossier"
                :options="dossierOptions"
                label="N° Dossier *"
                outlined dense emit-value map-options
                option-label="numdossier"
                option-value="numdossier"
                use-input input-debounce="0"
                :loading="loadingCatalog"
                @filter="filterDossiers"
                @update:model-value="onDossierSelect"
                color="primary"
                :rules="[v => !!v || 'Choisissez un dossier MP/AT SVP']"
              >
                <template v-slot:prepend>
                  <q-icon name="confirmation_number" color="primary" size="xs" />
                </template>
                <template v-slot:no-option>
                  <q-item><q-item-section class="text-grey">Aucun dossier</q-item-section></q-item>
                </template>
              </q-select>
            </div>

            <!-- Date Accident (readonly, depuis le dossier) -->
            <div class="col-6 col-md-2">
              <q-input
                v-model="form.dateaccident"
                label="Date Accident"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
              >
                <template v-slot:prepend><q-icon name="event_busy" color="primary" size="xs" /></template>
              </q-input>
            </div>

            <!-- Date Certificat (saisie, >= dateaccident) -->
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.datecertificat"
                label="Date Certificat *"
                outlined dense
                bg-color="yellow-1"
                :rules="[
                  v => !!v || 'Date certificat obligatoire',
                  v => !v || isLegacyDateNotFuture(v) || 'Date invalide ou future',
                  v => {
                    if (!v || !form.dateaccident) return true
                    const cmp = compareLegacyFrDates(v, form.dateaccident)
                    return cmp == null || cmp >= 0
                      || 'La date du certificat doit être ≥ à la date de l\'accident'
                  }
                ]"
              >
                <template v-slot:append>
                  <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.datecertificat" mask="DD/MM/YYYY" today-btn color="primary">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat dense />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- N° Certificat -->
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.numcertificat"
                label="N° Certificat"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
              >
                <template v-slot:prepend><q-icon name="tag" color="primary" size="xs" /></template>
              </q-input>
            </div>
          </div>

          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-6 col-md-3">
              <q-input v-model="form.numassure" label="N° Assuré" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>
            <div class="col-6 col-md-4">
              <q-input v-model="form.nomassure" label="Nom Assuré" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>

            <!-- Type de certificat -->
            <div class="col-12 col-md-5">
              <q-select
                v-model="form.type"
                :options="typeOptions"
                label="Type de Certificat *"
                outlined dense emit-value map-options
                color="primary"
                :rules="[v => !!v || 'Sélectionnez le type de certificat SVP']"
                @update:model-value="onTypeChange"
              >
                <template v-slot:prepend><q-icon name="category" color="primary" size="xs" /></template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.icon" :color="scope.opt.color" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <!-- Praticien -->
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-6 col-md-4">
              <q-input
                v-model="form.nommedecin"
                label="Nom du Médecin *"
                outlined dense
                bg-color="yellow-1"
                class="input-uppercase"
                :rules="[v => !!v || 'Nom du médecin obligatoire']"
                @update:model-value="val => { form.nommedecin = toLegacyUppercase(val) }"
              >
                <template v-slot:prepend><q-icon name="local_hospital" color="amber-8" size="xs" /></template>
              </q-input>
            </div>
            <div class="col-6 col-md-4">
              <q-input
                v-model="form.structure"
                label="Hôpital / Structure *"
                outlined dense
                bg-color="yellow-1"
                class="input-uppercase"
                :rules="[v => !!v || 'Hôpital obligatoire']"
                @update:model-value="val => { form.structure = toLegacyUppercase(val) }"
              >
                <template v-slot:prepend><q-icon name="domain" color="amber-8" size="xs" /></template>
              </q-input>
            </div>
          </div>

          <!-- Lésions (saisissables comme ExtJS) -->
          <div class="row q-col-gutter-xs">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.naturelesion"
                name="naturelesion"
                label="Nature de la Lésion"
                type="textarea"
                rows="2"
                outlined dense
                bg-color="yellow-1"
                class="input-uppercase"
                @update:model-value="val => { form.naturelesion = toLegacyUppercase(val) }"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.siegelesion"
                name="siegelesion"
                label="Siège de la Lésion"
                type="textarea"
                rows="2"
                outlined dense
                bg-color="yellow-1"
                class="input-uppercase"
                @update:model-value="val => { form.siegelesion = toLegacyUppercase(val) }"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ═══════════════════════════════════════════════════════
           SECTION 2 : CERTIFICAT INITIAL / PROLONGATION (membre1)
           Visible si type ≠ CF (Certificat Final)
      ═══════════════════════════════════════════════════════ -->
      <q-expansion-item
        v-show="showMembre1"
        v-model="sections.membre1"
        icon="healing"
        label="Certificat Médical Initial / Prolongation"
        header-class="section-header text-teal-8 text-weight-bold"
        class="q-mb-sm card-elevated"
        expand-icon-class="text-teal-8"
        :disable="!showMembre1"
      >
        <q-card>
          <q-card-section class="q-py-sm">
            <div class="row q-col-gutter-xs items-center">
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.nbrejours"
                  label="Nombre de Jours d'Incapacité"
                  type="number"
                  min="0"
                  outlined dense
                  bg-color="yellow-1"
                  :rules="showMembre1
                    ? [v => v >= 0 || 'Vous ne pouvez saisir un nombre de jours négatif']
                    : []"
                >
                  <template v-slot:prepend><q-icon name="today" color="teal-7" size="xs" /></template>
                  <template v-slot:append><span class="text-caption text-grey-6">jour(s)</span></template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-banner dense rounded class="bg-teal-1 text-teal-9">
                  <template v-slot:avatar><q-icon name="info" color="teal" size="sm" /></template>
                  <span class="text-caption">
                    Saisissez la durée d'incapacité de travail en jours.
                    Le CI est unique par dossier.
                  </span>
                </q-banner>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- ═══════════════════════════════════════════════════════
           SECTION 3 : CERTIFICAT FINAL (membre2)
           Visible si type = CF
      ═══════════════════════════════════════════════════════ -->
      <q-expansion-item
        v-show="showMembre2"
        v-model="sections.membre2"
        icon="task_alt"
        label="Certificat Médical Final"
        header-class="section-header text-deep-orange text-weight-bold"
        class="q-mb-sm card-elevated"
        expand-icon-class="text-deep-orange"
        :disable="!showMembre2"
      >
        <q-card>
          <q-card-section class="q-py-sm">
            <div class="row q-col-gutter-xs items-start">
              <div class="col-6 col-md-3">
                <q-input
                  v-model.number="form.txipp"
                  label="Taux IPP Médecin Traitant (%)"
                  type="number"
                  min="0"
                  max="100"
                  outlined dense
                  bg-color="yellow-1"
                  :rules="showMembre2
                    ? [
                        v => v >= 0 || 'Valeur minimale : 0',
                        v => v <= 100 || 'Le taux d\'IPP doit être compris entre 0 et 100'
                      ]
                    : []"
                >
                  <template v-slot:prepend><q-icon name="percent" color="deep-orange" size="xs" /></template>
                </q-input>
              </div>
              <div class="col-6 col-md-3">
                <q-input
                  v-model="form.datefinrappel"
                  label="Date Prochain Contrôle"
                  outlined dense
                  bg-color="yellow-1"
                  :rules="showMembre2
                    ? [
                        v => !v || isLegacyDateNotFuture(v) || 'Date invalide ou future',
                        v => {
                          if (!v || !form.dateaccident) return true
                          const cmp = compareLegacyFrDates(v, form.dateaccident)
                          return cmp == null || cmp >= 0 || 'Date doit être ≥ date d\'accident'
                        }
                      ]
                    : []"
                >
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datefinrappel" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="primary" flat dense />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-5">
                <q-banner dense rounded class="bg-orange-1 text-orange-9">
                  <template v-slot:avatar><q-icon name="warning" color="orange" size="sm" /></template>
                  <span class="text-caption">
                    Le <b>certificat final</b> est unique par dossier.
                    Il clôture la prise en charge et fixe le taux d'IPP.
                  </span>
                </q-banner>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- ═══════════════════════════════════════════════════════
           STATUT DU DOSSIER (badges informatifs)
      ═══════════════════════════════════════════════════════ -->
      <div v-if="form.numassure" class="row q-gutter-xs q-mb-sm q-mt-xs">
        <q-chip
          :color="form.flagcmi === 'OUI' ? 'positive' : 'grey-4'"
          :text-color="form.flagcmi === 'OUI' ? 'white' : 'grey-7'"
          icon="check_circle"
          dense size="sm"
        >
          CI {{ form.flagcmi === 'OUI' ? 'existant' : 'non créé' }}
        </q-chip>
        <q-chip
          :color="form.flagcmf === 'OUI' ? 'negative' : 'grey-4'"
          :text-color="form.flagcmf === 'OUI' ? 'white' : 'grey-7'"
          icon="block"
          dense size="sm"
        >
          CF {{ form.flagcmf === 'OUI' ? 'clôturé' : 'non créé' }}
        </q-chip>
      </div>

      <!-- ═══════════════════════════════════════════════════════
           BOUTONS
      ═══════════════════════════════════════════════════════ -->
      <div class="row justify-center q-mt-md q-gutter-sm">
        <q-btn
          type="submit"
          color="primary"
          label="Enregistrer"
          icon="save"
          unelevated
          style="border-radius:10px; min-width:180px"
          :loading="submitting"
        />
        <q-btn
          type="reset"
          color="grey-6"
          label="Annuler"
          icon="refresh"
          unelevated
          style="border-radius:10px; min-width:180px"
          @click="resetForm"
        />
      </div>

    </q-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationRpStore } from 'src/modules/energizer/stores/liquidationRpStore.js'
import {
  RP_CERTIFICAT_TYPE_OPTIONS,
  extractCertificatTypeCode,
  mapCertificatDossierRowToForm,
  validateCertificatInitForm,
} from 'src/modules/energizer/utils/liquidationRpCertificatInitLegacy.js'
import {
  compareLegacyFrDates,
  isLegacyDateNotFuture,
} from 'src/modules/energizer/utils/liquidationRpDeclarationLegacy.js'
import { toLegacyUppercase } from 'src/modules/energizer/utils/liquidationLegacyUtils.js'

defineOptions({ name: 'NewCertificatMedical' })

const $q = useQuasar()
const rpStore = useLiquidationRpStore()

const formRef = ref(null)
const submitting = ref(false)
const loadingCatalog = ref(false)
const loadError = ref('')
const selectedDossier = ref(null)

const sections = reactive({
  membre1: false,
  membre2: false,
})

const typeOptions = RP_CERTIFICAT_TYPE_OPTIONS

const certificatTypeCode = computed(() => extractCertificatTypeCode(form.type))
const showMembre1 = computed(() => certificatTypeCode.value === 'CI' || certificatTypeCode.value === 'CP')
const showMembre2 = computed(() => certificatTypeCode.value === 'CF')

const allDossiers = ref([])
const dossierOptions = ref([])

onMounted(async () => {
  loadingCatalog.value = true
  loadError.value = ''
  try {
    const list = await rpStore.loadRpCertificatDossiers()
    allDossiers.value = Array.isArray(list) ? list : []
    dossierOptions.value = [...allDossiers.value]
    if (!allDossiers.value.length) {
      loadError.value = 'Aucun dossier disponible sur le serveur.'
    }
  } catch (e) {
    loadError.value = e?.message || 'Impossible de charger les dossiers depuis le serveur.'
  } finally {
    loadingCatalog.value = false
  }
})

const FORM_INITIAL = {
  numdossier: '',
  numassure: '',
  nomassure: '',
  dateaccident: '',
  datecertificat: '',
  numcertificat: '',
  numordre: '',
  flag: '',
  flagcmi: '',
  flagcmf: '',
  dateeffet: '',
  type: '',
  nommedecin: '',
  structure: '',
  naturelesion: '',
  siegelesion: '',
  nbrejours: 0,
  txipp: 0,
  datefinrappel: '',
  dateconsolidation: '',
}

const form = reactive({ ...FORM_INITIAL })

function filterDossiers(val, update) {
  update(() => {
    if (!val) {
      dossierOptions.value = allDossiers.value
    } else {
      const needle = val.toLowerCase()
      dossierOptions.value = allDossiers.value.filter(
        d => d.numdossier?.toLowerCase().includes(needle)
          || d.nom?.toLowerCase().includes(needle),
      )
    }
  })
}

function onDossierSelect(numdossier) {
  const row = allDossiers.value.find(x => x.numdossier === numdossier)
  if (!row) return
  mapCertificatDossierRowToForm(form, row)
  form.naturelesion = toLegacyUppercase(form.naturelesion)
  form.siegelesion = toLegacyUppercase(form.siegelesion)
  $q.notify({
    type: 'positive',
    message: `Dossier ${numdossier} chargé`,
    position: 'top',
    timeout: 1500,
  })
}

function onTypeChange(type) {
  const code = extractCertificatTypeCode(type)
  if (code === 'CF') {
    sections.membre1 = false
    sections.membre2 = true
    if (form.flagcmi !== 'OUI') {
      $q.notify({
        type: 'warning',
        message: 'Le certificat médical initial (CI) doit être créé avant le certificat final',
        position: 'top',
      })
    }
  } else {
    sections.membre2 = false
    sections.membre1 = true
    if (code === 'CI' && form.flagcmi === 'OUI') {
      $q.notify({
        type: 'negative',
        message: 'Échec — Le certificat médical initial est unique !',
        position: 'top',
      })
    }
  }
}

function validateMetier() {
  const errors = validateCertificatInitForm(form)
  if (errors.length) {
    $q.notify({ type: 'negative', message: errors[0], position: 'top' })
    return false
  }
  return true
}

async function submitForm() {
  const ok = await formRef.value?.validate()
  if (!ok) return
  if (!validateMetier()) return

  submitting.value = true
  try {
    const result = await rpStore.submitCertificatInit(form)
    $q.notify({
      type: 'positive',
      message: result?.message || 'Ajout du certificat accompli avec succès !',
      position: 'top',
      icon: 'check_circle',
    })
    resetForm()
    const list = await rpStore.loadRpCertificatDossiers()
    allDossiers.value = Array.isArray(list) ? list : []
    dossierOptions.value = [...allDossiers.value]
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e?.message || 'Ajout du certificat non accompli',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  selectedDossier.value = null
  sections.membre1 = false
  sections.membre2 = false
  dossierOptions.value = allDossiers.value
  formRef.value?.resetValidation()
}
</script>

<style scoped>
.new-certificat {
  max-width: 1200px;
  margin: 0 auto;
}

.card-elevated {
  border-radius: 12px;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.08);
}

.card-header-rounded {
  border-radius: 12px 12px 0 0;
}

.section-header {
  font-size: 0.88rem;
  font-weight: 700;
  border-radius: 12px;
}

.input-uppercase :deep(.q-field__native),
.input-uppercase :deep(textarea) {
  text-transform: uppercase;
}
</style>

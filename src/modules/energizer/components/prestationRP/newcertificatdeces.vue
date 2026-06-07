<template>
  <div class="q-pa-sm new-certificat-deces">

    <div class="text-center q-mb-sm">
      <div class="text-h6 text-primary text-weight-bold">
        <q-icon name="article" class="q-mr-xs" />
        Ajout du Certificat Médical de Décès et de Genre de Mort
      </div>
      <div class="text-caption text-grey-6">CD — Dossier Accident du Travail / Maladie Professionnelle</div>
    </div>

    <q-banner v-if="loadError" class="bg-negative text-white q-mb-sm" rounded dense>
      {{ loadError }}
    </q-banner>

    <q-banner class="bg-red-1 text-red-9 q-mb-sm" rounded dense>
      <template v-slot:avatar><q-icon name="warning" color="red-7" size="sm" /></template>
      <span class="text-caption">
        Le <b>Certificat de Décès (CD)</b> est <b>unique</b> par dossier AT/MP.
        La date de décès doit être antérieure ou égale à la date du certificat.
      </span>
    </q-banner>

    <q-form ref="formRef" @submit.prevent="submitForm">

      <q-card class="q-mb-sm card-elevated">
        <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-icon name="folder_open" size="xs" class="q-mr-xs" />
              <span class="text-body2 text-weight-bold">Identification du Dossier</span>
            </div>
            <div class="row items-center q-gutter-xs">
              <q-chip color="red-7" text-color="white" icon="article" dense size="sm">
                CD — Certificat de Décès et Genre de Mort
              </q-chip>
              <q-btn flat dense round icon="restart_alt" color="white" size="sm" @click="resetForm">
                <q-tooltip>Réinitialiser</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-py-sm">

          <div class="row q-col-gutter-xs q-mb-xs">
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

            <div class="col-6 col-md-2">
              <q-input
                v-model="form.dateaccident"
                name="dateaccident"
                label="Date Accident"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
              >
                <template v-slot:prepend><q-icon name="event_busy" color="primary" size="xs" /></template>
              </q-input>
            </div>

            <div class="col-6 col-md-3">
              <q-input
                v-model="form.datecertificat"
                name="datecertificat"
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

            <div class="col-6 col-md-3">
              <q-input
                v-model="form.numcertificat"
                name="numcertificat"
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
              <q-input v-model="form.numassure" name="numassure" label="N° Assuré" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>
            <div class="col-6 col-md-4">
              <q-input v-model="form.nomassure" name="nomassure" label="Nom Assuré" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>
          </div>

          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-6 col-md-4">
              <q-input
                v-model="form.nommedecin"
                name="nommedecin"
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
                name="structure"
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

          <div class="row q-col-gutter-xs">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.naturelesion"
                name="naturelesion"
                label="Nature de la Lésion"
                type="textarea" rows="2"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.siegelesion"
                name="siegelesion"
                label="Siège de la Lésion"
                type="textarea" rows="2"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-expansion-item
        v-model="sections.deces"
        icon="person_off"
        label="Informations sur le Décès"
        header-class="section-header-deces text-weight-bold"
        class="q-mb-sm card-elevated"
        expand-icon-class="text-red-7"
        default-opened
      >
        <q-card>
          <q-card-section class="q-py-sm">
            <div class="row q-col-gutter-xs items-start">

              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.datedeces"
                  name="datedeces"
                  label="Date de Décès *"
                  outlined dense
                  bg-color="yellow-1"
                  hint="Doit être antérieure ou égale à la date du certificat"
                  :rules="[
                    v => !!v || 'Date de décès obligatoire',
                    v => !v || isLegacyDateNotFuture(v) || 'Date invalide ou future',
                    v => {
                      if (!v || !form.datecertificat) return true
                      const cmp = compareLegacyFrDates(v, form.datecertificat)
                      return cmp == null || cmp <= 0
                        || 'La date de décès doit être ≤ à la date du certificat'
                    }
                  ]"
                >
                  <template v-slot:prepend><q-icon name="event" color="red-7" size="xs" /></template>
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datedeces" mask="DD/MM/YYYY" today-btn color="red">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="red" flat dense />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-8">
                <q-input
                  v-model="form.observation"
                  name="observation"
                  label="Observations"
                  type="textarea"
                  rows="3"
                  outlined dense
                  bg-color="yellow-1"
                  class="input-uppercase"
                  hint="Précisez le genre de mort et toute observation pertinente"
                  @update:model-value="val => { form.observation = toLegacyUppercase(val) }"
                />
              </div>
            </div>

            <q-banner dense rounded class="bg-red-1 text-red-9 q-mt-sm" v-if="form.numassure">
              <template v-slot:avatar><q-icon name="info" color="red-7" size="sm" /></template>
              <span class="text-caption">
                Ce certificat (CD) est <b>unique</b> par dossier.
                Il ne peut être créé qu'<b>une seule fois</b>.
              </span>
            </q-banner>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <div v-if="form.numassure" class="row q-gutter-xs q-mb-sm">
        <q-chip
          :color="form.flagcmi === 'OUI' ? 'positive' : 'grey-4'"
          :text-color="form.flagcmi === 'OUI' ? 'white' : 'grey-7'"
          icon="check_circle" dense size="sm"
        >
          CI {{ form.flagcmi === 'OUI' ? 'existant' : 'non créé' }}
        </q-chip>
      </div>

      <div class="row justify-center q-mt-md q-gutter-sm">
        <q-btn
          type="submit"
          color="red-7"
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
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationRpStore } from 'src/modules/energizer/stores/liquidationRpStore.js'
import {
  RP_CERTIFICAT_DECES_TYPE,
  mapCertificatDecesDossierRowToForm,
  validateCertificatDecesForm,
} from 'src/modules/energizer/utils/liquidationRpCertificatDecesLegacy.js'
import {
  compareLegacyFrDates,
  isLegacyDateNotFuture,
} from 'src/modules/energizer/utils/liquidationRpDeclarationLegacy.js'
import { toLegacyUppercase } from 'src/modules/energizer/utils/liquidationLegacyUtils.js'

defineOptions({ name: 'NewCertificatDeces' })

const $q = useQuasar()
const rpStore = useLiquidationRpStore()

const formRef = ref(null)
const submitting = ref(false)
const loadingCatalog = ref(false)
const loadError = ref('')
const selectedDossier = ref(null)
const sections = reactive({ deces: true })

const allDossiers = ref([])
const dossierOptions = ref([])

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
  type: RP_CERTIFICAT_DECES_TYPE,
  nommedecin: '',
  structure: '',
  naturelesion: '',
  siegelesion: '',
  datedeces: '',
  observation: '',
}

const form = reactive({ ...FORM_INITIAL })

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
  mapCertificatDecesDossierRowToForm(form, row)
  $q.notify({
    type: 'positive',
    message: `Dossier ${numdossier} chargé`,
    position: 'top',
    timeout: 1500,
  })
}

function validateMetier() {
  const errors = validateCertificatDecesForm(form)
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
    form.type = RP_CERTIFICAT_DECES_TYPE
    const result = await rpStore.submitCertificatDeces(form)
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
  sections.deces = true
  dossierOptions.value = allDossiers.value
  formRef.value?.resetValidation()
}
</script>

<style scoped>
.new-certificat-deces {
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

.section-header-deces {
  font-size: 0.88rem;
  font-weight: 700;
  color: #b71c1c;
  border-radius: 12px;
}

.input-uppercase :deep(.q-field__native),
.input-uppercase :deep(textarea) {
  text-transform: uppercase;
}
</style>

<template>
  <div class="q-pa-sm nlle-note-frais">

    <q-banner v-if="loadError" class="bg-negative text-white q-mb-sm" rounded dense>
      {{ loadError }}
    </q-banner>

    <div class="text-center q-mb-sm">
      <div class="text-h6 text-primary text-weight-bold">
        <q-icon name="receipt_long" class="q-mr-xs" />
        Nouvelle Note de Frais — AT/MP
      </div>
      <div class="text-caption text-grey-6">
        Saisie des frais médicaux engagés dans le cadre d'un dossier Accident du Travail / Maladie Professionnelle
      </div>
    </div>

    <q-form ref="formRef" @submit.prevent="submitForm">

      <q-card class="q-mb-sm card-elevated">
        <q-card-section class="card-header card-header--primary q-py-sm">
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
          <div class="row q-col-gutter-sm q-mb-xs">
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
                class="field-num-value"
                @filter="filterDossiers"
                @update:model-value="onDossierSelect"
                color="primary"
                :rules="[v => !!v || 'Choisissez un dossier SVP']"
              >
                <template #prepend>
                  <q-icon name="confirmation_number" color="primary" size="xs" />
                </template>
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Aucun dossier</q-item-section></q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model="form.numassu"
                name="numassu"
                label="N° Assuré"
                outlined dense readonly
                bg-color="blue-grey-1"
                class="field-num-value"
              >
                <template #prepend><q-icon name="badge" color="primary" size="xs" /></template>
              </q-input>
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model="form.numnote"
                name="numnote"
                label="N° Note"
                outlined dense readonly
                bg-color="blue-grey-1"
                class="field-num-value"
              >
                <template #prepend><q-icon name="tag" color="primary" size="xs" /></template>
              </q-input>
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model="form.numemployeur"
                name="numemployeur"
                label="Mat. Employeur *"
                outlined dense readonly
                bg-color="blue-grey-1"
                class="field-num-value"
                :rules="[v => !!v || 'Matricule employeur obligatoire']"
              >
                <template #prepend><q-icon name="business_center" color="primary" size="xs" /></template>
              </q-input>
            </div>

            <div class="col-12 col-md-8">
              <q-input
                v-model="form.nomemployeur"
                name="nomemployeur"
                label="Raison Sociale *"
                outlined dense readonly
                bg-color="blue-grey-1"
                class="input-uppercase"
                :rules="[v => !!v || 'Raison sociale obligatoire']"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="q-mb-sm card-elevated">
        <q-card-section class="card-header card-header--primary q-py-sm">
          <div class="row items-center">
            <q-icon name="receipt" size="xs" class="q-mr-xs" />
            <span class="text-body2 text-weight-bold">Détails de la Note de Frais</span>
          </div>
        </q-card-section>
        <q-card-section class="q-py-sm">
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.objet"
                name="objet"
                :options="objetOptions"
                label="Objet *"
                outlined dense emit-value map-options
                option-label="type"
                option-value="type"
                color="primary"
                :loading="loadingCatalog"
                :rules="[v => !!v || 'Sélectionnez l\'objet de la note SVP']"
              >
                <template #prepend><q-icon name="category" color="primary" size="xs" /></template>
              </q-select>
            </div>

            <div class="col-6 col-md-3">
              <q-input
                v-model="form.datedemande"
                name="datedemande"
                label="Date Note *"
                outlined dense
                bg-color="yellow-1"
                mask="##/##/####"
                :rules="[
                  v => !!v || 'Date de la note obligatoire',
                  v => isLegacyDateNotFuture(v) || 'Date invalide ou future',
                ]"
              >
                <template #prepend><q-icon name="event" color="primary" size="xs" /></template>
                <template #append>
                  <q-icon name="edit_calendar" class="cursor-pointer" color="primary" size="xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.datedemande" mask="DD/MM/YYYY" today-btn color="primary">
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

          <div class="sep q-mb-xs q-mt-xs">
            <q-icon name="store" size="xs" class="q-mr-xs" />Fournisseur / Prestataire
          </div>
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.fournisseur"
                name="fournisseur"
                label="Fournisseur"
                outlined dense
                bg-color="yellow-1"
                class="input-uppercase"
                @update:model-value="val => { form.fournisseur = toLegacyUppercase(val) }"
              >
                <template #prepend><q-icon name="business" color="primary" size="xs" /></template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.adresse"
                name="adresse"
                label="Adresse"
                outlined dense
                bg-color="yellow-1"
                class="input-uppercase"
                @update:model-value="val => { form.adresse = toLegacyUppercase(val) }"
              >
                <template #prepend><q-icon name="location_on" color="primary" size="xs" /></template>
              </q-input>
            </div>
            <div class="col-6 col-md-2">
              <q-input
                v-model="form.telephone"
                name="telephone"
                label="Téléphone"
                outlined dense
                bg-color="yellow-1"
                class="input-uppercase"
                @update:model-value="val => { form.telephone = toLegacyUppercase(val) }"
              >
                <template #prepend><q-icon name="phone" color="primary" size="xs" /></template>
              </q-input>
            </div>
          </div>

          <div class="sep q-mb-xs q-mt-xs">
            <q-icon name="people" size="xs" class="q-mr-xs" />Prise en Charge
          </div>
          <div class="row q-col-gutter-xs items-start">
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.tiersbeneficiaire"
                name="tiersbeneficiaire"
                :options="typesBenefOptions"
                label="La victime est prise en charge par *"
                outlined dense emit-value map-options
                color="primary"
                :rules="[v => !!v || 'Sélectionnez le type de prise en charge']"
                @update:model-value="onTiersBenefChange"
              >
                <template #prepend><q-icon name="person_search" color="primary" size="xs" /></template>
              </q-select>
            </div>

            <div class="col-12 col-md-4">
              <q-select
                v-model="form.flag"
                name="flag"
                :options="tiersBenefOptions"
                label="Tiers Bénéficiaire"
                outlined dense emit-value map-options
                option-label="nombene"
                option-value="nombene"
                color="primary"
                :disable="form.tiersbeneficiaire !== 'TIERS'"
                :class="{ 'opacity-disabled': form.tiersbeneficiaire !== 'TIERS' }"
                :rules="form.tiersbeneficiaire === 'TIERS'
                  ? [v => !!v || 'Sélectionnez le tiers bénéficiaire']
                  : []"
              >
                <template #prepend><q-icon name="person" color="primary" size="xs" /></template>
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Aucun bénéficiaire</q-item-section></q-item>
                </template>
              </q-select>
            </div>

            <div v-if="form.tiersbeneficiaire && form.tiersbeneficiaire !== 'TIERS'" class="col-12 col-md-4">
              <q-banner dense rounded class="bg-blue-1 text-primary">
                <template #avatar><q-icon name="info" color="primary" size="sm" /></template>
                <span class="text-caption">
                  Prise en charge par <b>{{ form.tiersbeneficiaire }}</b> —
                  aucun tiers bénéficiaire à sélectionner.
                </span>
              </q-banner>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="row justify-center q-mt-md q-gutter-sm">
        <q-btn
          type="submit"
          color="primary"
          label="Enregistrer"
          icon="save"
          unelevated
          class="action-btn"
          :loading="submitting"
        />
        <q-btn
          type="reset"
          color="grey-6"
          label="Annuler"
          icon="refresh"
          unelevated
          class="action-btn"
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
import { toLegacyUppercase } from 'src/modules/energizer/utils/liquidationLegacyUtils.js'
import {
  RP_NOTE_FRAIS_TYPES_BENEF,
  mapNoteFraisDossierRowToForm,
  validateNoteFraisForm,
} from 'src/modules/energizer/utils/liquidationRpNoteFraisLegacy.js'
import { isLegacyDateNotFuture } from 'src/modules/energizer/utils/liquidationRpDeclarationLegacy.js'

defineOptions({ name: 'NlleNoteDeFrais' })

const $q = useQuasar()
const rpStore = useLiquidationRpStore()

const formRef = ref(null)
const submitting = ref(false)
const loadingCatalog = ref(false)
const loadError = ref('')
const selectedDossier = ref(null)

const typesBenefOptions = RP_NOTE_FRAIS_TYPES_BENEF

const allDossiers = ref([])
const dossierOptions = ref([])
const objetOptions = ref([])
const tiersBenefOptions = ref([])

const FORM_INITIAL = {
  numdossier: '',
  numassu: '',
  numnote: '',
  numemployeur: '',
  nomemployeur: '',
  objet: '',
  fournisseur: '',
  adresse: '',
  telephone: '',
  tiersbeneficiaire: '',
  flag: '',
  datedemande: '',
}

const form = reactive({ ...FORM_INITIAL })

onMounted(async () => {
  loadingCatalog.value = true
  loadError.value = ''
  try {
    const { dossiers, objets } = await rpStore.loadNotesFraisMeta()
    allDossiers.value = Array.isArray(dossiers) ? dossiers : []
    dossierOptions.value = [...allDossiers.value]
    objetOptions.value = Array.isArray(objets) ? objets : []
    if (!allDossiers.value.length) {
      $q.notify({
        type: 'warning',
        message: 'Aucun dossier disponible sur le serveur.',
        position: 'top',
      })
    }
  } catch (e) {
    loadError.value = e?.message || 'Impossible de charger les données depuis le serveur.'
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
          || d.nomemployeur?.toLowerCase().includes(needle),
      )
    }
  })
}

async function onDossierSelect(numdossier) {
  const row = allDossiers.value.find(x => x.numdossier === numdossier)
  if (!row) return

  mapNoteFraisDossierRowToForm(form, row)

  try {
    tiersBenefOptions.value = await rpStore.loadTiersBeneficiaires(row.numassu) ?? []
  } catch {
    tiersBenefOptions.value = []
  }

  $q.notify({
    type: 'positive',
    message: `Dossier ${numdossier} chargé`,
    position: 'top',
    timeout: 1500,
  })
}

function onTiersBenefChange(val) {
  if (val !== 'TIERS') {
    form.flag = ''
  }
}

function validateMetier() {
  const errors = validateNoteFraisForm(form)
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
    const result = await rpStore.submitNoteFrais(form)
    $q.notify({
      type: 'positive',
      message: result?.message || 'Note de frais enregistrée avec succès !',
      position: 'top',
      icon: 'check_circle',
    })
    resetForm()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e?.message || 'Erreur lors de l\'enregistrement de la note de frais',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  selectedDossier.value = null
  tiersBenefOptions.value = []
  dossierOptions.value = allDossiers.value
  formRef.value?.resetValidation()
}
</script>

<style scoped>
.nlle-note-frais {
  max-width: 1100px;
  margin: 0 auto;
}

.card-elevated {
  border-radius: 12px;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  color: white;
}

.card-header--primary {
  background: linear-gradient(90deg, #1565c0, #1976d2);
}

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

.opacity-disabled {
  opacity: 0.5;
}

.action-btn {
  border-radius: 10px;
  min-width: 180px;
  font-weight: 600;
}

.input-uppercase :deep(.q-field__native),
.input-uppercase :deep(textarea) {
  text-transform: uppercase;
}

.field-num-value :deep(.q-field__native),
.field-num-value :deep(.q-field__input) {
  font-size: 0.8rem;
  letter-spacing: 0;
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
}
</style>

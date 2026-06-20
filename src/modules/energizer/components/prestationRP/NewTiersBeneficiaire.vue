<template>
  <div class="q-pa-sm new-tiers-benef">

    <q-banner v-if="loadError" class="bg-negative text-white q-mb-sm" rounded dense>
      {{ loadError }}
    </q-banner>

    <q-form ref="formRef" @submit.prevent="submitForm">

      <!-- Dossier -->
      <q-card class="q-mb-md card-elevated">
        <q-card-section class="card-header card-header--primary q-py-sm">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-icon name="folder_open" size="xs" class="q-mr-sm" />
              <span class="text-body2 text-weight-bold">Identification du dossier</span>
            </div>
            <q-btn flat dense round icon="restart_alt" color="white" size="sm" @click="resetForm">
              <q-tooltip>Réinitialiser</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
        <q-card-section class="q-py-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-5">
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
                <template #prepend><q-icon name="confirmation_number" color="primary" size="xs" /></template>
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Aucun dossier</q-item-section></q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.numassure"
                name="numassure"
                label="N° Assuré"
                outlined dense readonly
                bg-color="blue-grey-1"
              >
                <template #prepend><q-icon name="badge" color="primary" size="xs" /></template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Bénéficiaire -->
      <q-card class="q-mb-md card-elevated">
        <q-card-section class="card-header card-header--primary q-py-sm">
          <q-icon name="person_add" size="xs" class="q-mr-sm" />
          <span class="text-body2 text-weight-bold">Identité du tiers bénéficiaire</span>
        </q-card-section>
        <q-card-section class="q-py-md">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-3">
              <q-input
                v-model="form.numbenef"
                name="numbenef"
                label="N° Bénéficiaire"
                outlined dense
                bg-color="yellow-1"
                hint="Vide = création auto"
                class="input-uppercase"
                @update:model-value="val => { form.numbenef = toLegacyUppercase(val) }"
              >
                <template #prepend><q-icon name="tag" color="primary" size="xs" /></template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.nombenef"
                name="nombenef"
                label="Nom"
                outlined dense
                bg-color="yellow-1"
                class="input-uppercase"
                @update:model-value="val => { form.nombenef = toLegacyUppercase(val) }"
              >
                <template #prepend><q-icon name="person" color="primary" size="xs" /></template>
              </q-input>
            </div>
            <div class="col-12 col-md-5">
              <q-input
                v-model="form.prenombenef"
                name="prenombenef"
                label="Prénom"
                outlined dense
                bg-color="yellow-1"
                class="input-uppercase"
                @update:model-value="val => { form.prenombenef = toLegacyUppercase(val) }"
              >
                <template #prepend><q-icon name="person_outline" color="primary" size="xs" /></template>
              </q-input>
            </div>
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.naissbenef"
                name="naissbenef"
                label="Date de naissance"
                outlined dense
                bg-color="yellow-1"
                mask="##/##/####"
                :rules="[
                  v => !v || isLegacyDateNotFuture(v) || 'Date invalide ou future'
                ]"
              >
                <template #append>
                  <q-icon name="edit_calendar" class="cursor-pointer" color="primary" size="xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.naissbenef" mask="DD/MM/YYYY" color="primary" today-btn>
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
                v-model="form.numpiece"
                name="numpiece"
                label="N° Pièce d'identité"
                outlined dense
                bg-color="yellow-1"
                class="input-uppercase"
                @update:model-value="val => { form.numpiece = toLegacyUppercase(val) }"
              >
                <template #prepend><q-icon name="credit_card" color="primary" size="xs" /></template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.tel"
                name="tel"
                label="Téléphone"
                type="tel"
                prefix="+237"
                maxlength="9"
                outlined dense
                bg-color="yellow-1"
                :rules="telephoneRules"
              >
                <template #prepend><q-icon name="phone" color="primary" size="xs" /></template>
              </q-input>
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.adresse"
                name="adresse"
                label="Adresse"
                type="textarea"
                rows="2"
                outlined dense
                bg-color="yellow-1"
                class="input-uppercase"
                @update:model-value="val => { form.adresse = toLegacyUppercase(val) }"
              >
                <template #prepend><q-icon name="home" color="primary" size="xs" /></template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="row justify-center q-gutter-sm q-mt-lg">
        <q-btn
          type="submit"
          color="primary"
          label="Valider"
          icon="save"
          unelevated
          no-caps
          class="action-btn"
          :loading="submitting"
        />
        <q-btn
          flat
          color="grey-7"
          label="Annuler"
          icon="refresh"
          no-caps
          class="action-btn"
          @click="resetForm"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useLiquidationRpStore } from 'src/modules/energizer/stores/liquidationRpStore.js'
import {
  mapTiersBeneficiaireDossierRowToForm,
  validateTiersBeneficiaireForm,
} from 'src/modules/energizer/utils/liquidationRpTiersBeneficiaireLegacy.js'
import { isLegacyDateNotFuture } from 'src/modules/energizer/utils/liquidationRpDeclarationLegacy.js'
import { toLegacyUppercase } from 'src/modules/energizer/utils/liquidationLegacyUtils.js'
import { buildLegacyTelephoneRules } from 'src/modules/energizer/utils/energizerFormInputUtils.js'

defineOptions({ name: 'NewTiersBeneficiaire' })

const { t } = useI18n()
const $q = useQuasar()
const telephoneRules = buildLegacyTelephoneRules(t)
const rpStore = useLiquidationRpStore()

const formRef = ref(null)
const submitting = ref(false)
const loadingCatalog = ref(false)
const loadError = ref('')
const selectedDossier = ref(null)

const allDossiers = ref([])
const dossierOptions = ref([])

const FORM_INITIAL = {
  numdossier: '',
  numassure: '',
  numbenef: '',
  nombenef: '',
  prenombenef: '',
  naissbenef: '',
  adresse: '',
  tel: '',
  numpiece: '',
}

const form = reactive({ ...FORM_INITIAL })

onMounted(async () => {
  loadingCatalog.value = true
  loadError.value = ''
  try {
    const list = await rpStore.loadRpDossiers()
    allDossiers.value = Array.isArray(list) ? list : []
    dossierOptions.value = [...allDossiers.value]
    if (!allDossiers.value.length) {
      $q.notify({
        type: 'warning',
        message: 'Aucun dossier disponible sur le serveur.',
        position: 'top',
      })
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
  mapTiersBeneficiaireDossierRowToForm(form, row)
  $q.notify({
    type: 'positive',
    message: `Dossier ${numdossier} chargé`,
    position: 'top',
    timeout: 1500,
  })
}

function validateMetier() {
  const errors = validateTiersBeneficiaireForm(form)
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
    const result = await rpStore.submitTiersBeneficiaire(form)
    $q.notify({
      type: 'positive',
      message: result?.message || 'Bénéficiaire créé avec succès !',
      position: 'top',
      icon: 'check_circle',
    })
    resetForm()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e?.message || 'Échec création du bénéficiaire',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  selectedDossier.value = null
  dossierOptions.value = allDossiers.value
  formRef.value?.resetValidation()
}
</script>

<style scoped>
.new-tiers-benef {
  max-width: 960px;
  margin: 0 auto;
}

.card-elevated {
  border-radius: 14px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
  overflow: hidden;
}

.card-header {
  color: white;
}

.card-header--primary {
  background: linear-gradient(90deg, #1565c0, #1976d2);
}

.action-btn {
  border-radius: 10px;
  min-width: 160px;
  font-weight: 600;
}

.input-uppercase :deep(.q-field__native),
.input-uppercase :deep(textarea) {
  text-transform: uppercase;
}
</style>

<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="q-pa-md depot-pf-page">
    <q-card flat class="depot-pf-shell">
      <q-card-section class="depot-pf-shell__header">
        <div class="depot-pf-shell__title-row">
          <q-icon name="family_restroom" size="28px" class="depot-pf-shell__title-icon" />
          <div>
            <div class="depot-pf-shell__title">{{ t('layout.sidebar.assurePrestationsFamiliales') }}</div>
            <div class="depot-pf-shell__subtitle">{{ t('modules.assure.depotPf.pageLead') }}</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section
        v-if="!store.contexte && store.loadingContexte"
        class="depot-pf-shell__loading flex flex-center q-pa-xl"
      >
        <q-spinner color="primary" size="40px" />
      </q-card-section>

      <!-- Étapes 1–2 : dans la carte (le reste s’affiche dans le dialogue) -->
      <q-card-section v-else-if="isCardStep" class="depot-pf-form-body">
        <div class="depot-pf-form-stack">
          <template v-if="wizardStep === 'welcome'">
            <DepotPrestationPF_Bienvenue />
            <div class="depot-pf-wizard-actions">
              <q-btn
                color="primary"
                unelevated
                no-caps
                icon="arrow_forward"
                :label="t('modules.assure.depotPf.continuer')"
                @click="wizardStep = 'coordonnees'"
              />
            </div>
          </template>

          <template v-else-if="wizardStep === 'coordonnees'">
            <q-form ref="coordonneesFormRef" @submit.prevent="onCoordonneesContinue">
              <DepotPrestationPF_Coordonnees />
              <div class="depot-pf-wizard-actions row q-gutter-sm">
                <q-btn
                  flat
                  no-caps
                  color="grey-8"
                  icon="arrow_back"
                  :label="t('modules.assure.depotPf.retour')"
                  @click="wizardStep = 'welcome'"
                />
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  no-caps
                  icon="arrow_forward"
                  :label="t('modules.assure.depotPf.continuer')"
                />
              </div>
            </q-form>
          </template>
        </div>
      </q-card-section>
    </q-card>

    <!-- Type de prestation, examens prénataux et saisie : dialogue -->
    <q-dialog
      v-model="pfFormDialogOpen"
      persistent
      maximized-on-small
      class="depot-pf-form-dialog"
    >
      <q-card class="depot-pf-form-dialog__card">
        <q-toolbar class="bg-primary text-white">
          <q-icon name="description" size="sm" class="q-mr-sm" />
          <q-toolbar-title
            class="text-subtitle1 text-weight-bold depot-pf-dialog-toolbar-title"
            :class="{ 'depot-pf-dialog-toolbar-title--center': wizardStep === 'examens_choice' }"
          >
            {{ dialogTitle }}
          </q-toolbar-title>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="onDialogCloseAttempt"
          />
        </q-toolbar>

        <q-card-section class="depot-pf-form-dialog__body scroll">
          <div class="depot-pf-form-stack">
            <template v-if="wizardStep === 'type_select'">
              <div class="depot-pf-type-card">
                <q-select
                  v-model="selectedTypeCode"
                  :options="typeOptions"
                  :label="t('modules.assure.depotPf.selectType')"
                  outlined
                  dense
                  emit-value
                  map-options
                  option-value="code"
                  option-label="label"
                  class="depot-pf-select-type"
                  :rules="[required]"
                  @update:model-value="onTypeSelected"
                >
                  <template #option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-icon :name="scope.opt.icon" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="depot-pf-wizard-actions">
                <q-btn
                  flat
                  no-caps
                  color="grey-8"
                  icon="arrow_back"
                  :label="t('modules.assure.depotPf.retour')"
                  @click="goBackFromTypeSelect"
                />
              </div>
            </template>

            <template v-else-if="wizardStep === 'examens_choice'">
              <div class="depot-pf-form-section depot-pf-examens-choice">
                <p class="depot-pf-examens-choice__lead">
                  {{ t('modules.assure.depotPf.examensChoixLead') }}
                </p>
                <q-option-group
                  v-model="examensChoice"
                  class="depot-pf-examens-choice__options"
                  :options="examensChoiceOptions"
                  color="primary"
                  type="checkbox"
                />
              </div>
              <div class="depot-pf-wizard-actions row q-gutter-sm">
                <q-btn
                  flat
                  no-caps
                  color="grey-8"
                  icon="arrow_back"
                  :label="t('modules.assure.depotPf.retour')"
                  @click="wizardStep = 'type_select'"
                />
                <q-btn
                  color="primary"
                  unelevated
                  no-caps
                  icon="arrow_forward"
                  :disable="!examensChoice.length"
                  :label="t('modules.assure.depotPf.continuer')"
                  @click="onExamensChoiceContinue"
                />
              </div>
            </template>

            <template v-else-if="wizardStep === 'form'">
              <q-form
                ref="depotFormRef"
                class="depot-pf-form-stack depot-pf-form-stack--active"
                @submit.prevent="onSubmit"
              >
                <template
                  v-if="
                    selectedTypeCode !== DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX &&
                    selectedTypeCode !== DEPOT_PF_TYPE_CODES.ACCOUCHEMENT &&
                    selectedTypeCode !== DEPOT_PF_TYPE_CODES.CONGES_MATERNITE &&
                    selectedTypeCode !== DEPOT_PF_TYPE_CODES.ALLOCATIONS_FAMILIALES
                  "
                >
                  <DepotPrestationPF_CentreCnps />
                  <q-separator />
                </template>

                <div
                  v-if="selectedTypeCode === DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX"
                  class="depot-pf-form-section depot-pf-examens-form"
                >
                  <div class="depot-pf-form-main-title depot-pf-form-main-title--center text-primary">
                    {{ t('inputassu.remboursement_examens_prenataux') }}
                  </div>
                  <DepotPrestationPF_ExamensPremier v-if="showExamensPremier" />
                  <DepotPrestationPF_ExamensDeuxieme v-if="showExamensDeuxieme" />
                  <div class="depot-pf-examens-zone-commune">
                    <div class="depot-pf-centre-cnps-select-wrap">
                      <DepotPrestationPF_CentreCnpsSelect />
                    </div>
                  </div>
                  <div v-if="showSubmitAfterPremier" class="depot-pf-form-actions q-mt-md">
                    <DepotPrestationPF_SubmitBlock
                      :submit-label="submitLabel"
                      :loading="store.submitting"
                      @reset="onReset"
                    />
                  </div>
                  <div v-if="showSubmitAfterDeuxieme" class="depot-pf-form-actions q-mt-md">
                    <DepotPrestationPF_SubmitBlock
                      :submit-label="submitLabel"
                      :loading="store.submitting"
                      @reset="onReset"
                    />
                  </div>
                </div>

                <Suspense v-else-if="activeFormComponent">
                  <component :is="activeFormComponent" />
                  <template #fallback>
                    <div class="flex flex-center q-pa-md">
                      <q-spinner color="primary" size="32px" />
                    </div>
                  </template>
                </Suspense>

                <template v-if="showSharedSubmit">
                  <q-separator class="depot-pf-separator" />
                  <DepotPrestationPF_SubmitBlock
                    :submit-label="submitLabel"
                    :loading="store.submitting"
                    @reset="onReset"
                  />
                </template>

                <div class="depot-pf-wizard-actions q-mt-sm">
                  <q-btn
                    flat
                    no-caps
                    color="grey-8"
                    icon="arrow_back"
                    :label="t('modules.assure.depotPf.retour')"
                    @click="goBackFromForm"
                  />
                </div>
              </q-form>
            </template>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepotPrestationPfStore } from 'src/stores/assure/depotPrestationPfStore.js'
import { DEPOT_PF_TYPE_CODES, listDepotPfTypesForAssure } from 'src/data/assure/depotPrestationPfTypes.js'
import { useDepotPrestationPfRules } from 'src/composables/assure/useDepotPrestationPfRules.js'
import { useNotify } from 'src/components/useNotify.js'
import { assureSessionConfig } from 'src/config/menus/assureMenu.js'
import { useAuthenticatedSession } from 'src/composables/useAuthenticatedSession.js'

const DepotPrestationPF_Bienvenue = defineAsyncComponent(
  () => import('src/components/assure/depotPrestationPF/DepotPrestationPF_Bienvenue.vue'),
)
const DepotPrestationPF_Coordonnees = defineAsyncComponent(
  () => import('src/components/assure/depotPrestationPF/DepotPrestationPF_Coordonnees.vue'),
)
const DepotPrestationPF_CentreCnps = defineAsyncComponent(
  () => import('src/components/assure/depotPrestationPF/DepotPrestationPF_CentreCnps.vue'),
)
const DepotPrestationPF_CentreCnpsSelect = defineAsyncComponent(
  () => import('src/components/assure/depotPrestationPF/DepotPrestationPF_CentreCnpsSelect.vue'),
)
const DepotPrestationPF_ExamensPremier = defineAsyncComponent(
  () => import('src/components/assure/depotPrestationPF/DepotPrestationPF_ExamensPremier.vue'),
)
const DepotPrestationPF_ExamensDeuxieme = defineAsyncComponent(
  () => import('src/components/assure/depotPrestationPF/DepotPrestationPF_ExamensDeuxieme.vue'),
)
const DepotPrestationPF_Accouchement = defineAsyncComponent(
  () => import('src/components/assure/depotPrestationPF/DepotPrestationPF_Accouchement.vue'),
)
const DepotPrestationPF_CongesMaternite = defineAsyncComponent(
  () => import('src/components/assure/depotPrestationPF/DepotPrestationPF_CongesMaternite.vue'),
)
const DepotPrestationPF_AllocationsFamiliales = defineAsyncComponent(
  () => import('src/components/assure/depotPrestationPF/DepotPrestationPF_AllocationsFamiliales.vue'),
)
const DepotPrestationPF_SubmitBlock = defineAsyncComponent(
  () => import('src/components/assure/depotPrestationPF/DepotPrestationPF_SubmitBlock.vue'),
)

useAuthenticatedSession(assureSessionConfig)

const { t } = useI18n()
const store = useDepotPrestationPfStore()
const { required } = useDepotPrestationPfRules()
const { notifySuccess, notifyError } = useNotify()

const wizardStep = ref('welcome')
const coordonneesFormRef = ref(null)
const depotFormRef = ref(null)
const selectedTypeCode = ref(null)
const examensChoice = ref([])
const pfFormDialogOpen = ref(false)

const PF_DIALOG_STEPS = ['type_select', 'examens_choice', 'form']

const isDialogStep = computed(() => PF_DIALOG_STEPS.includes(wizardStep.value))

const isCardStep = computed(
  () => wizardStep.value === 'welcome' || wizardStep.value === 'coordonnees',
)

const dialogTitle = computed(() => {
  if (wizardStep.value === 'type_select') {
    return t('modules.assure.depotPf.selectType')
  }
  if (wizardStep.value === 'examens_choice') {
    return t('modules.assure.depotPf.examensChoixTitre')
  }
  const opt = typeOptions.value.find((o) => o.code === selectedTypeCode.value)
  return opt?.label || t('modules.assure.depotPf.dialogTitre')
})

const typeOptions = computed(() =>
  listDepotPfTypesForAssure(t, store.assureSexe).map((item) => ({
    ...item,
    label: item.label,
    description: item.description,
  })),
)

const FORM_COMPONENTS = {
  [DEPOT_PF_TYPE_CODES.ACCOUCHEMENT]: DepotPrestationPF_Accouchement,
  [DEPOT_PF_TYPE_CODES.CONGES_MATERNITE]: DepotPrestationPF_CongesMaternite,
  [DEPOT_PF_TYPE_CODES.ALLOCATIONS_FAMILIALES]: DepotPrestationPF_AllocationsFamiliales,
}

const activeFormComponent = computed(() =>
  selectedTypeCode.value && selectedTypeCode.value !== DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX
    ? FORM_COMPONENTS[selectedTypeCode.value]
    : null,
)

const examensChoiceOptions = computed(() => [
  { label: t('inputassu.premier_examen_prenatal'), value: 'premier' },
  { label: t('inputassu.deuxieme_examen_prenatal'), value: 'deuxieme' },
])

const resolvedExamensChoice = computed(() => {
  const picks = examensChoice.value
  if (picks.includes('premier') && picks.includes('deuxieme')) return 'both'
  if (picks.includes('premier')) return 'premier'
  if (picks.includes('deuxieme')) return 'deuxieme'
  return null
})

const showExamensPremier = computed(
  () =>
    selectedTypeCode.value === DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX &&
    (store.examensPrenatauxChoice === 'premier' || store.examensPrenatauxChoice === 'both'),
)

const showExamensDeuxieme = computed(
  () =>
    selectedTypeCode.value === DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX &&
    (store.examensPrenatauxChoice === 'deuxieme' || store.examensPrenatauxChoice === 'both'),
)

const showSubmitAfterPremier = computed(() => store.examensPrenatauxChoice === 'premier')

const showSubmitAfterDeuxieme = computed(() => store.examensPrenatauxChoice === 'deuxieme')

const showSharedSubmit = computed(() => {
  if (selectedTypeCode.value === DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX) {
    return store.examensPrenatauxChoice === 'both'
  }
  return Boolean(selectedTypeCode.value)
})

const submitLabel = computed(() =>
  store.common.typeSubmission === 'temporaire'
    ? t('inputassu.sauvegarde_temporaire')
    : t('inputassu.soumission_definitive'),
)

watch(isDialogStep, (open) => {
  pfFormDialogOpen.value = open
})

function onDialogCloseAttempt() {
  if (wizardStep.value === 'type_select') {
    goBackFromTypeSelect()
    return
  }
  if (wizardStep.value === 'examens_choice') {
    wizardStep.value = 'type_select'
    return
  }
  if (wizardStep.value === 'form') {
    goBackFromForm()
  }
}

function onTypeSelected(code) {
  store.setSelectedType(code)
  if (!code) return
  if (code === DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX) {
    examensChoice.value = []
    store.examensPrenatauxChoice = null
    wizardStep.value = 'examens_choice'
  } else {
    store.examensPrenatauxChoice = null
    wizardStep.value = 'form'
  }
}

async function onCoordonneesContinue() {
  const valid = await coordonneesFormRef.value?.validate()
  if (!valid) {
    notifyError(t('errors.required'))
    return
  }
  if (!store.common.RAISON_SOCIALE?.trim()) {
    notifyError(t('modules.assure.depotPf.employeurIntrouvable'))
    return
  }
  store.saveCoordonneesTemporaires()
  wizardStep.value = 'type_select'
}

function onExamensChoiceContinue() {
  const choice = resolvedExamensChoice.value
  if (!choice) {
    notifyError(t('modules.assure.depotPf.errors.examens_prenataux_aucune_demande'))
    return
  }
  store.examensPrenatauxChoice = choice
  wizardStep.value = 'form'
}

function goBackFromTypeSelect() {
  selectedTypeCode.value = null
  store.setSelectedType(null)
  store.examensPrenatauxChoice = null
  if (store.dossierTemporaire?.common) {
    Object.assign(store.common, { ...store.dossierTemporaire.common })
  }
  wizardStep.value = 'coordonnees'
}

function goBackFromForm() {
  if (selectedTypeCode.value === DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX) {
    examensChoice.value =
      store.examensPrenatauxChoice === 'both'
        ? ['premier', 'deuxieme']
        : store.examensPrenatauxChoice
          ? [store.examensPrenatauxChoice]
          : []
    wizardStep.value = 'examens_choice'
  } else {
    wizardStep.value = 'type_select'
  }
}

function mapValidationError(code) {
  const key = `modules.assure.depotPf.errors.${code}`
  const msg = t(key)
  return msg !== key ? msg : code
}

async function onSubmit() {
  if (!store.dossierTemporaire) {
    notifyError(t('modules.assure.depotPf.coordonneesRequises'))
    return
  }
  if (!selectedTypeCode.value) {
    notifyError(t('modules.assure.depotPf.selectType'))
    return
  }
  if (
    selectedTypeCode.value === DEPOT_PF_TYPE_CODES.CONGES_MATERNITE &&
    !store.isFemale
  ) {
    notifyError(t('modules.assure.depotPf.materniteFemmeUniquement'))
    return
  }

  const valid = await depotFormRef.value?.validate()
  if (!valid) {
    notifyError(t('errors.required'))
    return
  }

  const result = await store.submitDossier(selectedTypeCode.value)
  if (result.errors?.length) {
    result.errors.forEach((code) => notifyError(mapValidationError(code)))
    return
  }
  if (result.success) {
    const msg =
      store.common.typeSubmission === 'temporaire'
        ? t('form.temporarySubmissionDescription')
        : t('form.definitiveSubmissionDescription')
    notifySuccess(
      [result.result?.Msg || msg, t('modules.assure.depotPf.autreTypeApresSoumission')]
        .filter(Boolean)
        .join(' — '),
    )
    returnToTypeSelectionAfterSubmit()
  }
}

function returnToTypeSelectionAfterSubmit() {
  selectedTypeCode.value = null
  examensChoice.value = []
  store.prepareForAnotherDepotType()
  wizardStep.value = 'type_select'
  depotFormRef.value?.resetValidation()
}

function onReset() {
  wizardStep.value = 'welcome'
  selectedTypeCode.value = null
  examensChoice.value = []
  pfFormDialogOpen.value = false
  store.resetAll()
  depotFormRef.value?.resetValidation()
  coordonneesFormRef.value?.resetValidation()
}

watch(selectedTypeCode, (code) => {
  store.setSelectedType(code)
})

onMounted(() => {
  store.loadContexte()
})
</script>

<style lang="scss">
@import 'src/css/depot-prestation-pf-form.scss';

.depot-pf-form-dialog .q-toolbar {
  min-height: 48px;
  height: auto;
  flex-shrink: 0;
}

.depot-pf-dialog-toolbar-title {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  line-height: 1.35;
  padding: 0.2rem 0;
}

.depot-pf-form-dialog__card {
  width: min(920px, 96vw);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
}

.depot-pf-form-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
  max-height: calc(92vh - 56px);
  padding: 1rem 1.25rem 1.25rem;
}

.depot-pf-wizard-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(148, 163, 184, 0.25);
}

@media (max-width: 600px) {
  .depot-pf-form-dialog__card {
    width: 100%;
    max-height: 100vh;
  }

  .depot-pf-dialog-toolbar-title {
    font-size: 0.8125rem;
    line-height: 1.4;
    padding-right: 0.35rem;
  }
}
</style>

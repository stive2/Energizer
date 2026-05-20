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

      <q-card-section v-else class="depot-pf-form-body">
        <div class="depot-pf-form-stack">
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
          @update:model-value="onTypeChange"
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

        <q-form
          v-if="selectedTypeCode"
          ref="depotFormRef"
          class="depot-pf-form-stack depot-pf-form-stack--active"
          @submit.prevent="onSubmit"
        >
          <Suspense>
            <DepotPrestationPF_ChampsCommuns />
            <template #fallback>
              <div class="flex flex-center q-pa-md">
                <q-spinner color="primary" size="32px" />
              </div>
            </template>
          </Suspense>

          <q-separator />

          <Suspense v-if="activeFormComponent">
            <component :is="activeFormComponent" />
            <template #fallback>
              <div class="flex flex-center q-pa-md">
                <q-spinner color="primary" size="32px" />
              </div>
            </template>
          </Suspense>

          <q-separator class="depot-pf-separator" />

          <div class="depot-pf-submit-card">
            <div class="depot-pf-submit-card__title">
              <q-icon name="send" size="20px" />
              {{ t('inputassu.type_soumission') }}
            </div>
            <q-option-group
              v-model="store.common.typeSubmission"
              :options="submissionOptions"
              color="primary"
              inline
              class="depot-pf-submit-card__options"
            />

          <div class="depot-pf-form-actions">
            <q-btn
              type="submit"
              color="primary"
              unelevated
              no-caps
              icon="send"
              :loading="store.submitting"
              :label="submitLabel"
            />
            <q-btn
              flat
              color="grey-8"
              no-caps
              icon="refresh"
              :label="t('form.reset')"
              @click="onReset"
            />
          </div>
          </div>
        </q-form>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepotPrestationPfStore } from 'src/stores/assure/depotPrestationPfStore.js'
import { DEPOT_PF_TYPE_CODES, listDepotPfTypesForAssure } from 'src/constants/assure/depotPrestationPfTypes.js'
import { useDepotPrestationPfRules } from 'src/composables/assure/useDepotPrestationPfRules.js'
import { useNotify } from 'src/components/useNotify.js'
import { assureSessionConfig } from 'src/config/menus/assureMenu.js'
import { useAuthenticatedSession } from 'src/composables/useAuthenticatedSession.js'
const DepotPrestationPF_ChampsCommuns = defineAsyncComponent(
  () => import('src/components/assure/depotPrestationPF/DepotPrestationPF_ChampsCommuns.vue'),
)
const DepotPrestationPF_ExamensPrenataux = defineAsyncComponent(
  () => import('src/components/assure/depotPrestationPF/DepotPrestationPF_ExamensPrenataux.vue'),
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

useAuthenticatedSession(assureSessionConfig)

const { t } = useI18n()
const store = useDepotPrestationPfStore()
const { required } = useDepotPrestationPfRules()
const { notifySuccess, notifyError } = useNotify()

const depotFormRef = ref(null)
const selectedTypeCode = ref(null)

const typeOptions = computed(() =>
  listDepotPfTypesForAssure(t, store.assureSexe).map((item) => ({
    ...item,
    label: item.label,
    description: item.description,
  })),
)

const FORM_COMPONENTS = {
  [DEPOT_PF_TYPE_CODES.EXAMENS_PRENATAUX]: DepotPrestationPF_ExamensPrenataux,
  [DEPOT_PF_TYPE_CODES.ACCOUCHEMENT]: DepotPrestationPF_Accouchement,
  [DEPOT_PF_TYPE_CODES.CONGES_MATERNITE]: DepotPrestationPF_CongesMaternite,
  [DEPOT_PF_TYPE_CODES.ALLOCATIONS_FAMILIALES]: DepotPrestationPF_AllocationsFamiliales,
}

const activeFormComponent = computed(() =>
  selectedTypeCode.value ? FORM_COMPONENTS[selectedTypeCode.value] : null,
)

const submissionOptions = computed(() => [
  { label: t('inputassu.soumission_definitive'), value: 'definitive' },
  { label: t('inputassu.sauvegarde_temporaire'), value: 'temporaire' },
])

const submitLabel = computed(() =>
  store.common.typeSubmission === 'temporaire'
    ? t('inputassu.sauvegarde_temporaire')
    : t('inputassu.soumission_definitive'),
)

function onTypeChange(code) {
  store.setSelectedType(code)
}

watch(selectedTypeCode, (code) => {
  store.setSelectedType(code)
})

function mapValidationError(code) {
  const key = `modules.assure.depotPf.errors.${code}`
  const msg = t(key)
  return msg !== key ? msg : code
}

async function onSubmit() {
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
    notifySuccess(result.result?.Msg || msg)
    if (store.common.typeSubmission === 'definitive') {
      onReset()
    }
  }
}

function onReset() {
  selectedTypeCode.value = null
  store.resetAll()
  depotFormRef.value?.resetValidation()
}

onMounted(() => {
  store.loadContexte()
})
</script>

<style lang="scss">
@import 'src/css/depot-prestation-pf-form.scss';
</style>

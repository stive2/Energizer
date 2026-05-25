<template>
  <div class="depot-pf-form-section depot-pf-welcome">
    <q-banner rounded class="bg-primary text-white depot-pf-welcome__banner">
      <template #avatar>
        <q-icon name="waving_hand" size="32px" />
      </template>
      <div class="text-h6 text-weight-bold">{{ t('modules.assure.depotPf.welcomeTitle') }}</div>
      <div class="text-body2 q-mt-xs">{{ t('modules.assure.depotPf.welcomeLead') }}</div>
    </q-banner>

    <p class="depot-pf-welcome__hint text-grey-8 q-mb-sm">
      {{ t('modules.assure.depotPf.welcomeHint') }}
    </p>

    <div class="depot-pf-form-grid-1-2">
      <q-input
        :model-value="store.numAssu"
        :label="t('inputassu.matricule_assure')"
        outlined
        dense
        readonly
        bg-color="blue-grey-1"
      />
      <q-input
        :model-value="nomPrenom"
        :label="t('inputassu.nom_prenom')"
        outlined
        dense
        readonly
        bg-color="blue-grey-1"
      />
    </div>

    <div class="depot-pf-form-grid-3">
      <q-input
        :model-value="dateNaissance"
        :label="t('inputassu.date_naissance_assure')"
        outlined
        dense
        readonly
        bg-color="blue-grey-1"
      />
      <q-input
        :model-value="sexeLabel"
        :label="t('inputassu.sexe')"
        outlined
        dense
        readonly
        bg-color="blue-grey-1"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepotPrestationPfStore } from 'src/stores/assure/depotPrestationPfStore.js'

const { t } = useI18n()
const store = useDepotPrestationPfStore()

const nomPrenom = computed(() => {
  const ctx = store.contexte
  if (!ctx) return ''
  return [ctx.nom, ctx.prenom].filter(Boolean).join(' ').trim()
})

const dateNaissance = computed(
  () => store.contexte?.dateNaissance || store.contexte?.date_naissance || '',
)

const sexeLabel = computed(() => {
  const s = store.contexte?.sexe
  if (s === 'F') return t('input.female')
  if (s === 'M') return t('input.male')
  return s || ''
})
</script>

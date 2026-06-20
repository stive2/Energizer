<template>
  <div class="depot-pf-form-section depot-pf-welcome">
    <q-banner rounded class="bg-primary text-white depot-pf-welcome__banner">
      <template #avatar>
        <q-icon name="waving_hand" size="32px" />
      </template>
      <div class="text-h6 text-weight-bold">{{ t('modules.assure.depotPf.welcomeTitle') }}</div>
      <div class="text-body2 q-mt-xs">{{ t('modules.assure.depotPf.welcomeLead') }}</div>
    </q-banner>

    <p class="depot-pf-welcome__hint text-grey-8 q-mb-sm text-center">
      {{ t('modules.assure.depotPf.welcomeHint') }}
    </p>

    <div class="depot-pf-form-grid-1-2">
      <q-input
        :model-value="store.numAssu"
        :label="fieldLabel(t('inputassu.matricule_assure'))"
        outlined
        dense
        readonly
        bg-color="blue-grey-1"
      >
        <template #prepend>
          <q-icon name="fingerprint" color="primary" />
        </template>
      </q-input>
      <q-input
        :model-value="nomPrenom"
        :label="fieldLabel(t('inputassu.nom_prenom'))"
        outlined
        dense
        readonly
        bg-color="blue-grey-1"
      >
        <template #prepend>
          <q-icon name="person" color="primary" />
        </template>
      </q-input>
    </div>

    <div class="depot-pf-form-grid-3">
      <q-input
        :model-value="dateNaissance"
        :label="fieldLabel(t('inputassu.date_naissance_assure'))"
        outlined
        dense
        readonly
        bg-color="blue-grey-1"
      >
        <template #prepend>
          <q-icon name="cake" color="primary" />
        </template>
      </q-input>
      <q-input
        :model-value="sexeLabel"
        :label="fieldLabel(t('inputassu.sexe'))"
        outlined
        dense
        readonly
        bg-color="blue-grey-1"
      >
        <template #prepend>
          <q-icon name="wc" color="primary" />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepotPrestationPfStore } from 'src/modules/assure/stores/depotPrestationPfStore.js'
import { formatSexeLabel } from 'src/modules/assure/utils/formatSexeLabel.js'
import { useDepotPrestationPfRules } from 'src/modules/assure/composables/useDepotPrestationPfRules.js'

const { t } = useI18n()
const store = useDepotPrestationPfStore()
const { fieldLabel } = useDepotPrestationPfRules()

const nomPrenom = computed(() => {
  const ctx = store.contexte
  if (!ctx) return ''
  return [ctx.nom, ctx.prenom].filter(Boolean).join(' ').trim()
})

const dateNaissance = computed(
  () => store.contexte?.dateNaissance || store.contexte?.date_naissance || '',
)

const sexeLabel = computed(() => formatSexeLabel(store.contexte?.sexe, t))
</script>

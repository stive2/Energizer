<template>
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
        :loading="loading"
        :label="submitLabel"
      />
      <q-btn
        flat
        color="grey-8"
        no-caps
        icon="refresh"
        :label="t('form.reset')"
        @click="$emit('reset')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepotPrestationPfStore } from 'src/modules/assure/stores/depotPrestationPfStore.js'

defineProps({
  submitLabel: { type: String, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['reset'])

const { t } = useI18n()
const store = useDepotPrestationPfStore()

const submissionOptions = computed(() => [
  { label: t('inputassu.soumission_definitive'), value: 'definitive' },
  { label: t('inputassu.sauvegarde_temporaire'), value: 'temporaire' },
])
</script>

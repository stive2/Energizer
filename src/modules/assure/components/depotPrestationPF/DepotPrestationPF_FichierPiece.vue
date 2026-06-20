<template>
  <q-file
    :model-value="modelValue"
    outlined
    dense
    clearable
    :accept="LEGACY_FORM_DOCUMENT_FILE_ACCEPT"
    :max-file-size="LEGACY_FORM_FILE_MAX_SIZE"
    :label="displayLabel"
    :rules="rules"
    :class="['depot-pf-fichier-piece', requiredFieldClass(markRequired)]"
    @update:model-value="$emit('update:modelValue', $event)"
    @rejected="onRejected"
  >
    <template #prepend>
      <q-icon name="attach_file" color="primary" />
    </template>
  </q-file>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  LEGACY_FORM_DOCUMENT_FILE_ACCEPT,
  LEGACY_FORM_FILE_MAX_SIZE,
} from 'src/modules/immatriculations/utils/immatLegacyCommon.js'
import { useNotify } from 'src/modules/shared/components/useNotify.js'
import { useDepotPrestationPfRules } from 'src/modules/assure/composables/useDepotPrestationPfRules.js'

const props = defineProps({
  modelValue: { type: [File, Object, null], default: null },
  label: { type: String, required: true },
  rules: { type: Array, default: () => [] },
  markRequired: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const { t } = useI18n()
const { notifyError } = useNotify()
const { fieldLabel, requiredFieldClass } = useDepotPrestationPfRules()

const displayLabel = computed(() => fieldLabel(props.label))

function onRejected(entries) {
  const entry = entries?.[0]
  if (entry?.failedPropValidation === 'max-file-size') {
    notifyError(t('form.file_too_large'))
  }
}
</script>

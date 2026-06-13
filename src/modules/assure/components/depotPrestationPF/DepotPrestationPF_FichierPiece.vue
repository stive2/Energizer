<template>
  <q-file
    :model-value="modelValue"
    outlined
    dense
    clearable
    :accept="LEGACY_FORM_DOCUMENT_FILE_ACCEPT"
    :max-file-size="LEGACY_FORM_FILE_MAX_SIZE"
    :label="label"
    :rules="rules"
    @update:model-value="$emit('update:modelValue', $event)"
    @rejected="onRejected"
  >
    <template #prepend>
      <q-icon name="attach_file" color="primary" />
    </template>
  </q-file>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import {
  LEGACY_FORM_DOCUMENT_FILE_ACCEPT,
  LEGACY_FORM_FILE_MAX_SIZE,
} from 'src/modules/immatriculations/utils/immatLegacyCommon.js'
import { useNotify } from 'src/modules/shared/components/useNotify.js'

defineProps({
  modelValue: { type: [File, Object, null], default: null },
  label: { type: String, required: true },
  rules: { type: Array, default: () => [] },
})

defineEmits(['update:modelValue'])

const { t } = useI18n()
const { notifyError } = useNotify()

function onRejected(entries) {
  const entry = entries?.[0]
  if (entry?.failedPropValidation === 'max-file-size') {
    notifyError(t('form.file_too_large'))
  }
}
</script>

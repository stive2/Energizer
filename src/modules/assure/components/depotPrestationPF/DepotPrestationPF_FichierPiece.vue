<template>
  <q-file
    :model-value="modelValue"
    outlined
    dense
    clearable
    accept=".gif,.jpg,.jpeg,.pdf,.xls,.xlsx"
    :label="label"
    :rules="rules"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prepend>
      <q-icon name="attach_file" color="primary" />
    </template>
  </q-file>
</template>

<script setup>
defineProps({
  modelValue: { type: [File, Object, null], default: null },
  label: { type: String, required: true },
  rules: { type: Array, default: () => [] },
})

defineEmits(['update:modelValue'])
</script>

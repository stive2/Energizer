<template>
  <div class="depot-pf-checkbox-field row items-center no-wrap">
    <q-icon :name="icon" color="primary" size="20px" class="depot-pf-checkbox-field__icon" />
    <q-checkbox
      :model-value="modelValue"
      :label="displayLabel"
      :class="['depot-pf-checkbox-field__control', 'col', requiredFieldClass(markRequired)]"
      color="primary"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDepotPrestationPfRules } from 'src/modules/assure/composables/useDepotPrestationPfRules.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
  icon: { type: String, default: 'check_box' },
  markRequired: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const { fieldLabel, requiredFieldClass } = useDepotPrestationPfRules()

const displayLabel = computed(() => fieldLabel(props.label))
</script>

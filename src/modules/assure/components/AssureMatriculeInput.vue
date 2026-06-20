<template>
  <div class="assure-matricule" :class="{ 'assure-matricule--compact': compact }">
    <div class="assure-matricule__hint text-caption text-grey-7 text-center q-mb-xs">
      {{ t('modules.assure.register.matriculeFormat') }}
    </div>

    <div class="assure-matricule__parts row items-center justify-center no-wrap">
      <q-input
        ref="part1Ref"
        v-model="parts.part1"
        class="assure-matricule__part"
        outlined
        dense
        maxlength="3"
        inputmode="numeric"
        :label="t('modules.assure.register.matriculePart1')"
        :disable="disable"
        hide-bottom-space
        @update:model-value="() => onPartInput(1)"
      />
      <span class="assure-matricule__sep">-</span>
      <q-input
        ref="part2Ref"
        v-model="parts.part2"
        class="assure-matricule__part assure-matricule__part--mid"
        outlined
        dense
        maxlength="7"
        inputmode="numeric"
        :label="t('modules.assure.register.matriculePart2')"
        :disable="disable"
        hide-bottom-space
        @update:model-value="() => onPartInput(2)"
      />
      <span class="assure-matricule__sep">-</span>
      <q-input
        ref="part3Ref"
        v-model="parts.part3"
        class="assure-matricule__part assure-matricule__part--key"
        outlined
        dense
        maxlength="1"
        inputmode="numeric"
        :label="t('modules.assure.register.matriculePart3')"
        :disable="disable"
        hide-bottom-space
        @update:model-value="() => onPartInput(3)"
      />
    </div>

    <q-input
      :model-value="displayMatricule"
      class="assure-matricule__full q-mt-sm"
      outlined
      dense
      readonly
      :label="t('modules.assure.register.matriculeRetained')"
      hide-bottom-space
    >
      <template #prepend>
        <q-icon name="badge" color="primary" size="xs" />
      </template>
    </q-input>
  </div>
</template>

<script setup>
import { reactive, computed, watch, ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  buildMatriculeAssure,
  splitMatriculeAssure,
} from 'src/modules/assure/utils/assureRegisterLegacy.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  disable: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const part1Ref = ref(null)
const part2Ref = ref(null)
const part3Ref = ref(null)

const parts = reactive({
  part1: '',
  part2: '',
  part3: '',
})

watch(
  () => props.modelValue,
  (val) => {
    const next = splitMatriculeAssure(val)
    if (next.part1 === '000' && next.part2 === '0000000' && next.part3 === '0') {
      parts.part1 = ''
      parts.part2 = ''
      parts.part3 = ''
      return
    }
    parts.part1 = next.part1 === '000' ? '' : next.part1.replace(/^0+/, '') || next.part1
    parts.part2 = next.part2 === '0000000' ? '' : next.part2.replace(/^0+/, '') || next.part2
    parts.part3 = next.part3 === '0' ? '' : next.part3
  },
  { immediate: true },
)

const displayMatricule = computed(() => {
  const p1 = String(parts.part1 ?? '').replace(/\D/g, '')
  const p2 = String(parts.part2 ?? '').replace(/\D/g, '')
  const p3 = String(parts.part3 ?? '').replace(/\D/g, '')
  if (!p1 && !p2 && !p3) return ''
  if (p1.length === 3 && p2.length === 7 && p3.length === 1) {
    return `${p1}-${p2}-${p3}`
  }
  const chunks = [p1, p2, p3].filter((c) => c.length > 0)
  return chunks.join('-')
})

function focusPart(n) {
  nextTick(() => {
    const map = { 1: part1Ref, 2: part2Ref, 3: part3Ref }
    map[n]?.value?.focus?.()
  })
}

function emitIfComplete() {
  const p1 = String(parts.part1 ?? '').replace(/\D/g, '')
  const p2 = String(parts.part2 ?? '').replace(/\D/g, '')
  const p3 = String(parts.part3 ?? '').replace(/\D/g, '')
  if (p1.length >= 1 && p2.length >= 1 && p3.length >= 1) {
    emit('update:modelValue', buildMatriculeAssure(p1, p2, p3))
  } else {
    emit('update:modelValue', '')
  }
}

function onPartInput(which) {
  parts.part1 = String(parts.part1 ?? '').replace(/\D/g, '').slice(0, 3)
  parts.part2 = String(parts.part2 ?? '').replace(/\D/g, '').slice(0, 7)
  parts.part3 = String(parts.part3 ?? '').replace(/\D/g, '').slice(0, 1)

  if (which === 1 && parts.part1.length >= 3) focusPart(2)
  if (which === 2 && parts.part2.length >= 7) focusPart(3)

  emitIfComplete()
}

/** Normalise le matricule complet (padding zéros) — à appeler avant validation API. */
function normalize() {
  const p1 = String(parts.part1 ?? '').replace(/\D/g, '')
  const p2 = String(parts.part2 ?? '').replace(/\D/g, '')
  const p3 = String(parts.part3 ?? '').replace(/\D/g, '')
  if (!p1 && !p2 && !p3) {
    emit('update:modelValue', '')
    return ''
  }
  const full = buildMatriculeAssure(p1 || '0', p2 || '0', p3 || '0')
  parts.part1 = full.slice(0, 3)
  parts.part2 = full.slice(4, 11)
  parts.part3 = full.slice(12, 13)
  emit('update:modelValue', full)
  return full
}

defineExpose({ normalize })
</script>

<style scoped>
.assure-matricule__parts {
  gap: 0.25rem;
}

.assure-matricule__part {
  width: 4.5rem;
  min-width: 0;
}

.assure-matricule__part--mid {
  width: 6.75rem;
}

.assure-matricule__part--key {
  width: 3.5rem;
}

.assure-matricule--compact .assure-matricule__part {
  width: 4.25rem;
}

.assure-matricule--compact .assure-matricule__part--mid {
  width: 6.5rem;
}

.assure-matricule--compact .assure-matricule__part--key {
  width: 3.25rem;
}

.assure-matricule__sep {
  font-weight: 700;
  color: var(--q-primary);
  padding: 0 0.05rem;
  margin-top: 0.35rem;
  font-size: 0.9rem;
}

.assure-matricule__full {
  max-width: 100%;
  margin: 0 auto;
}

.assure-matricule__full :deep(.q-field__control) {
  background: #f1f5f9;
  min-height: 36px;
}

.assure-matricule__part :deep(.q-field__control) {
  min-height: 36px;
}

.assure-matricule__part :deep(.q-field__label) {
  font-size: 0.72rem;
  white-space: nowrap;
}
</style>

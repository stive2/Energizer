<template>
  <q-item
    v-if="isLeaf"
    clickable
    v-ripple
    :to="entry.to"
    :exact="entry.exact"
    :inset-level="itemInsetLevel"
    active-class="aura-active"
    class="aura-item"
    @click="onNavigate"
  >
    <q-item-section avatar class="aura-dot-slot">
      <q-icon v-if="entry.icon" :name="entry.icon" class="aura-icon" :class="iconSizeClass" />
      <span v-else class="aura-dot" :style="{ background: dotColor(dotIndex) }" />
    </q-item-section>
    <q-item-section v-if="!miniMode">
      <q-item-label class="aura-item-label" :class="labelSizeClass">{{ t(entry.labelKey) }}</q-item-label>
    </q-item-section>
    <q-tooltip v-if="miniMode" anchor="center right" self="center left" :offset="[8, 0]">
      {{ t(entry.labelKey) }}
    </q-tooltip>
  </q-item>

  <q-expansion-item
    v-else-if="isGroup && !miniMode"
    :expand-separator="false"
    :default-opened="!!entry.defaultOpened"
    :header-inset-level="itemInsetLevel"
    header-class="aura-item"
    expand-icon-class="aura-expand-icon"
    class="aura-expansion"
    :dense="depth > 0"
  >
    <template #header>
      <q-item-section avatar>
        <q-icon :name="entry.icon" class="aura-icon" :class="iconSizeClass" />
      </q-item-section>
      <q-item-section>
        <q-item-label class="aura-item-label" :class="labelSizeClass">{{ t(entry.labelKey) }}</q-item-label>
      </q-item-section>
    </template>

    <AuraSidebarNavNode
      v-for="(child, idx) in entry.children"
      :key="entryKey(child, idx)"
      :entry="normalizeEntry(child)"
      :depth="depth + 1"
      :mini-mode="miniMode"
      :dot-index="idx"
      @navigate="onNavigate"
    />
  </q-expansion-item>

  <q-item
    v-else-if="isGroup && miniMode"
    clickable
    v-ripple
    class="aura-item"
    @click="onNavigate"
  >
    <q-item-section avatar>
      <q-icon :name="entry.icon" class="aura-icon" />
    </q-item-section>
    <q-menu anchor="top right" self="top left" :offset="[8, 0]">
      <q-list dense style="min-width: 220px">
        <q-item-label header class="text-weight-bold">{{ t(entry.labelKey) }}</q-item-label>
        <q-item
          v-for="(leaf, lIdx) in collectLeaves(entry.children)"
          :key="entryKey(leaf, lIdx)"
          clickable
          v-close-popup
          v-ripple
          :to="leaf.to"
          :exact="leaf.exact"
          @click="onNavigate"
        >
          <q-item-section>{{ t(leaf.labelKey) }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
    <q-tooltip anchor="center right" self="center left" :offset="[8, 0]">
      {{ t(entry.labelKey) }}
    </q-tooltip>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { sidebarNavInsetLevel } from 'src/utils/sidebarNavInset.js'

defineOptions({ name: 'AuraSidebarNavNode' })

const props = defineProps({
  entry: {
    type: Object,
    required: true,
  },
  depth: {
    type: Number,
    default: 0,
  },
  miniMode: {
    type: Boolean,
    default: false,
  },
  dotIndex: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['navigate'])

const { t } = useI18n()

const DOT_COLORS = ['#a8d8ff', '#ffc897', '#9defc8', '#d4b8ff']

const normalizedEntry = computed(() => normalizeEntry(props.entry))

const isGroup = computed(() => normalizedEntry.value.type === 'group')
const isLeaf = computed(() => normalizedEntry.value.type === 'item')

const iconSizeClass = computed(() => (props.depth >= 2 ? 'aura-icon--sm' : undefined))
const labelSizeClass = computed(() => (props.depth >= 2 ? 'aura-item-label--sm' : undefined))
const itemInsetLevel = computed(() => sidebarNavInsetLevel(props.depth))

function normalizeEntry(entry) {
  if (entry.type === 'group' || entry.type === 'item') {
    return entry
  }
  if (entry.to) {
    return { ...entry, type: 'item' }
  }
  if (entry.children?.length) {
    return { ...entry, type: 'group' }
  }
  return { ...entry, type: 'item' }
}

function onNavigate() {
  emit('navigate')
}

function entryKey(entry, idx) {
  return entry.labelKey || entry.type || String(idx)
}

function dotColor(index) {
  return DOT_COLORS[index % DOT_COLORS.length]
}

function collectLeaves(entries = []) {
  const leaves = []
  for (const entry of entries) {
    const normalized = normalizeEntry(entry)
    if (normalized.type === 'item' && normalized.to) {
      leaves.push(normalized)
    } else if (normalized.type === 'group' && normalized.children?.length) {
      leaves.push(...collectLeaves(normalized.children))
    }
  }
  return leaves
}
</script>

<style scoped>
.aura-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.aura-dot-slot {
  min-width: 40px !important;
}

.aura-icon--sm {
  font-size: 16px;
}

.aura-item-label--sm {
  font-size: 12.5px;
}
</style>

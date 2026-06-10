<template>
  <q-item
    v-if="isExternalLeaf"
    clickable
    v-ripple
    tag="a"
    :href="entry.href"
    target="_blank"
    rel="noopener noreferrer"
    :inset-level="itemInsetLevel"
    class="aura-item"
    @click="onNavigate"
  >
    <q-item-section avatar class="aura-dot-slot">
      <q-icon :name="entry.icon || 'open_in_new'" class="aura-icon" :class="iconSizeClass" />
    </q-item-section>
    <q-item-section v-if="!miniMode">
      <q-item-label class="aura-item-label" :class="labelSizeClass">{{ entryLabel }}</q-item-label>
    </q-item-section>
    <q-item-section v-if="!miniMode && entry.badge" side>
      <q-badge color="orange" text-color="white" class="aura-item-badge">{{ entry.badge }}</q-badge>
    </q-item-section>
    <q-tooltip v-if="miniMode" anchor="center right" self="center left" :offset="[8, 0]">
      {{ entryLabel }}<template v-if="entry.badge"> ({{ entry.badge }})</template>
    </q-tooltip>
  </q-item>

  <q-item
    v-else-if="isLeaf"
    :clickable="!entry.disabled && !!entry.to"
    :disable="!!entry.disabled"
    v-ripple
    :to="entry.disabled ? undefined : entry.to"
    :exact="entry.exact"
    :inset-level="itemInsetLevel"
    active-class="aura-active"
    class="aura-item"
    :class="{ 'aura-item--pending': entry.disabled }"
    @click="onNavigate"
  >
    <q-item-section avatar class="aura-dot-slot">
      <q-icon v-if="entry.icon" :name="entry.icon" class="aura-icon" :class="iconSizeClass" />
      <span v-else class="aura-dot" :style="{ background: dotColor(dotIndex) }" />
    </q-item-section>
    <q-item-section v-if="!miniMode">
      <q-item-label class="aura-item-label" :class="labelSizeClass">{{ entryLabel }}</q-item-label>
    </q-item-section>
    <q-item-section v-if="!miniMode && entry.badge" side>
      <q-badge color="orange" text-color="white" class="aura-item-badge">{{ entry.badge }}</q-badge>
    </q-item-section>
    <q-tooltip v-if="miniMode" anchor="center right" self="center left" :offset="[8, 0]">
      {{ entryLabel }}<template v-if="entry.badge"> ({{ entry.badge }})</template>
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
        <q-item-label class="aura-item-label" :class="labelSizeClass">{{ entryLabel }}</q-item-label>
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
        <q-item-label header class="text-weight-bold">{{ entryLabel }}</q-item-label>
        <q-item
          v-for="(leaf, lIdx) in collectLeaves(entry.children)"
          :key="entryKey(leaf, lIdx)"
          :clickable="!leaf.disabled && (!!leaf.to || !!leaf.href)"
          :disable="!!leaf.disabled"
          v-close-popup
          v-ripple
          :to="leaf.disabled || leaf.href ? undefined : leaf.to"
          :href="leaf.disabled ? undefined : leaf.href"
          :target="leaf.href ? '_blank' : undefined"
          :rel="leaf.href ? 'noopener noreferrer' : undefined"
          :tag="leaf.href ? 'a' : undefined"
          :exact="leaf.exact"
          @click="onNavigate"
        >
          <q-item-section>{{ resolveEntryLabel(leaf) }}</q-item-section>
          <q-item-section v-if="leaf.badge" side>
            <q-badge color="orange" text-color="white">{{ leaf.badge }}</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
    <q-tooltip anchor="center right" self="center left" :offset="[8, 0]">
      {{ entryLabel }}
    </q-tooltip>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { sidebarNavInsetLevel } from 'src/modules/shared/utils/sidebarNavInset.js'

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
const isLeaf = computed(() => normalizedEntry.value.type === 'item' && !normalizedEntry.value.href)
const isExternalLeaf = computed(
  () => normalizedEntry.value.type === 'item' && !!normalizedEntry.value.href,
)

const entryLabel = computed(() => resolveEntryLabel(normalizedEntry.value))

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

function resolveEntryLabel(entry) {
  if (entry.label) return entry.label
  if (entry.labelKey) return t(entry.labelKey)
  return ''
}

function entryKey(entry, idx) {
  return entry.label || entry.labelKey || entry.href || entry.type || String(idx)
}

function dotColor(index) {
  return DOT_COLORS[index % DOT_COLORS.length]
}

function collectLeaves(entries = []) {
  const leaves = []
  for (const entry of entries) {
    const normalized = normalizeEntry(entry)
    if (normalized.type === 'item') {
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

.aura-item-badge {
  font-size: 0.68rem;
  font-weight: 700;
  min-width: 1.25rem;
  justify-content: center;
}

.aura-item--pending {
  opacity: 0.72;
}
</style>

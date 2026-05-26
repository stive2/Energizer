<template>
  <q-list padding class="aura-nav-list">
    <q-item-label v-if="!miniMode && navSectionLabel" header class="aura-nav-section">
      {{ navSectionLabel }}
    </q-item-label>

    <template v-for="(entry, idx) in items" :key="entryKey(entry, idx)">
      <AuraSidebarNavNode
        v-if="entry.type === 'item' || entry.type === 'group'"
        :entry="entry"
        :mini-mode="miniMode"
        :dot-index="idx"
        @navigate="onNavigate"
      />

      <q-separator
        v-else-if="entry.type === 'separator' && !miniMode"
        spaced
        inset
        class="aura-separator"
      />
    </template>
  </q-list>
</template>

<script setup>
import AuraSidebarNavNode from 'src/modules/shared/components/layout/AuraSidebarNavNode.vue'

const emit = defineEmits(['navigate'])

defineProps({
  items: {
    type: Array,
    required: true,
  },
  miniMode: {
    type: Boolean,
    default: false,
  },
  navSectionLabel: {
    type: String,
    default: '',
  },
})

function onNavigate() {
  emit('navigate')
}

function entryKey(entry, idx) {
  return entry.labelKey || entry.type || String(idx)
}
</script>

<style scoped>
.aura-nav-list {
  padding: 8px;
}

.aura-nav-section {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  padding: 8px 8px 4px;
}

.aura-separator {
  background: rgba(255, 255, 255, 0.2);
  margin: 8px 12px;
}
</style>

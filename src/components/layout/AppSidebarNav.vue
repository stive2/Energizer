<template>
  <q-list padding class="sidebar-nav-list sidebar-nav-root">
    <template v-for="(entry, idx) in items" :key="entryKey(entry, idx)">
      <q-item
        v-if="entry.type === 'item'"
        clickable
        v-ripple
        :to="entry.to"
        :exact="entry.exact"
        active-class="sidebar-nav-item--active"
        class="sidebar-nav-item"
      >
        <q-item-section v-if="entry.icon" avatar>
          <q-icon :name="entry.icon" class="sidebar-nav-icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="sidebar-nav-label">{{ t(entry.labelKey) }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-expansion-item
        v-else-if="entry.type === 'group'"
        expand-separator
        :icon="entry.icon"
        :label="t(entry.labelKey)"
        header-class="sidebar-nav-group__header"
        expand-icon-class="sidebar-nav-expand-icon"
        class="sidebar-nav-group"
        :default-opened="!!entry.defaultOpened"
      >
        <template v-for="(child, cIdx) in entry.children" :key="entryKey(child, cIdx)">
          <!-- Niveau 2 : sous-groupe imbriqué -->
          <q-expansion-item
            v-if="child.type === 'group'"
            expand-separator
            :icon="child.icon"
            :label="t(child.labelKey)"
            header-class="sidebar-nav-group__header sidebar-nav-group__header--nested"
            expand-icon-class="sidebar-nav-expand-icon"
            class="sidebar-nav-group sidebar-nav-group--nested"
            dense
          >
            <template v-for="(sub, sIdx) in child.children" :key="entryKey(sub, sIdx)">
              <!-- Niveau 3 : sous-sous-groupe (profondeur 4 totale) -->
              <q-expansion-item
                v-if="sub.type === 'group'"
                expand-separator
                :icon="sub.icon"
                :label="t(sub.labelKey)"
                header-class="sidebar-nav-group__header sidebar-nav-group__header--deep"
                expand-icon-class="sidebar-nav-expand-icon"
                class="sidebar-nav-group sidebar-nav-group--deep"
                dense
              >
                <q-item
                  v-for="(deep, dIdx) in sub.children"
                  :key="entryKey(deep, dIdx)"
                  clickable
                  v-ripple
                  :to="deep.to"
                  :exact="deep.exact"
                  active-class="sidebar-nav-item--active"
                  class="sidebar-nav-item sidebar-nav-item--child sidebar-nav-item--deep"
                >
                  <q-item-section v-if="deep.icon" avatar>
                    <q-icon :name="deep.icon" size="xs" class="sidebar-nav-icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-caption sidebar-nav-label sidebar-nav-label--compact">{{
                      t(deep.labelKey)
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-expansion-item>

              <!-- Niveau 3 : item simple -->
              <q-item
                v-else
                clickable
                v-ripple
                :to="sub.to"
                :exact="sub.exact"
                active-class="sidebar-nav-item--active"
                class="sidebar-nav-item sidebar-nav-item--child sidebar-nav-item--grandchild"
              >
                <q-item-section v-if="sub.icon" avatar>
                  <q-icon :name="sub.icon" size="sm" class="sidebar-nav-icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2 sidebar-nav-label">{{ t(sub.labelKey) }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-expansion-item>

          <!-- Niveau 2 : item simple -->
          <q-item
            v-else
            clickable
            v-ripple
            :to="child.to"
            :exact="child.exact"
            active-class="sidebar-nav-item--active"
            class="sidebar-nav-item sidebar-nav-item--child"
          >
            <q-item-section v-if="child.icon" avatar>
              <q-icon :name="child.icon" size="sm" class="sidebar-nav-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-body2 sidebar-nav-label">{{ t(child.labelKey) }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-expansion-item>

      <q-separator
        v-else-if="entry.type === 'separator'"
        spaced
        inset
        class="sidebar-nav-separator"
      />
    </template>
  </q-list>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const { t } = useI18n()

function entryKey(entry, idx) {
  return entry.labelKey || entry.type || String(idx)
}
</script>

<style scoped>
.sidebar-nav-root {
  --sidebar-text: #1f2937;
  --sidebar-hover: #f3f4f6;
  --sidebar-active: color-mix(in srgb, var(--q-primary) 12%, #ffffff);
}

.sidebar-nav-list {
  padding: 8px 6px 28px;
}

.sidebar-nav-label {
  color: var(--sidebar-text);
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.sidebar-nav-label--compact {
  font-size: 0.8125rem;
}

.sidebar-nav-icon {
  color: var(--q-primary);
}

.sidebar-nav-expand-icon {
  color: var(--q-primary) !important;
}

.sidebar-nav-group :deep(.q-expansion-item__content) {
  background: transparent;
}

.sidebar-nav-group__header {
  font-weight: 600;
  color: var(--sidebar-text) !important;
  font-size: 0.875rem;
}

.sidebar-nav-group :deep(.q-expansion-item__header) {
  border-radius: 8px;
  margin: 1px 8px;
  min-height: 40px;
  transition: background-color 0.12s ease;
}

.sidebar-nav-group :deep(.q-expansion-item__header:hover) {
  background: var(--sidebar-hover);
}

.sidebar-nav-group :deep(.q-expansion-item__header .q-icon) {
  color: var(--q-primary) !important;
}

.sidebar-nav-item {
  border-radius: 8px;
  margin: 2px 8px;
  min-height: 40px;
  transition: background-color 0.12s ease;
}

.sidebar-nav-item--child {
  margin-left: 4px;
  padding-left: 8px;
}

.sidebar-nav-group--nested {
  margin-left: 6px;
}

.sidebar-nav-group--nested :deep(.q-expansion-item__container) {
  padding-left: 6px;
}

.sidebar-nav-item--grandchild {
  margin-left: 10px;
  padding-left: 12px;
}

.sidebar-nav-group--deep {
  margin-left: 12px;
}

.sidebar-nav-group--deep :deep(.q-expansion-item__container) {
  padding-left: 6px;
}

.sidebar-nav-group__header--deep {
  font-size: 0.8125rem;
  font-weight: 600;
}

.sidebar-nav-item--deep {
  margin-left: 16px;
  padding-left: 10px;
}

.sidebar-nav-item:hover {
  background: var(--sidebar-hover);
}

.sidebar-nav-item--active {
  background: var(--sidebar-active) !important;
  font-weight: 600;
  box-shadow: none;
}

.sidebar-nav-item--active .sidebar-nav-label {
  color: var(--q-primary);
}

.sidebar-nav-separator {
  background: #e5e7eb;
  margin-top: 6px;
  margin-bottom: 6px;
}
</style>

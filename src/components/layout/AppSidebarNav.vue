<template>
  <q-list
    padding
    class="sidebar-nav-list sidebar-nav-root"
    :class="{ 'sidebar-nav-root--compact-top': compactTop }"
  >
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
        <q-item-section v-if="entry.icon" avatar class="sidebar-nav-icon-slot">
          <div class="sidebar-nav-icon-wrap">
            <q-icon :name="entry.icon" class="sidebar-nav-icon" />
          </div>
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
        :header-class="groupHeaderClass(entry)"
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
            :header-class="groupHeaderClass(child, 'sidebar-nav-group__header--nested')"
            expand-icon-class="sidebar-nav-expand-icon"
            class="sidebar-nav-group sidebar-nav-group--nested"
            :default-opened="!!child.defaultOpened"
            dense
          >
            <template v-for="(sub, sIdx) in child.children" :key="entryKey(sub, sIdx)">
              <!-- Niveau 3 : sous-sous-groupe (profondeur 4 totale) -->
              <q-expansion-item
                v-if="sub.type === 'group'"
                expand-separator
                :icon="sub.icon"
                :label="t(sub.labelKey)"
                :header-class="groupHeaderClass(sub, 'sidebar-nav-group__header--deep')"
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
                  <q-item-section v-if="deep.icon" avatar class="sidebar-nav-icon-slot">
                    <div class="sidebar-nav-icon-wrap sidebar-nav-icon-wrap--sm">
                      <q-icon :name="deep.icon" size="xs" class="sidebar-nav-icon" />
                    </div>
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
                <q-item-section v-if="sub.icon" avatar class="sidebar-nav-icon-slot">
                  <div class="sidebar-nav-icon-wrap sidebar-nav-icon-wrap--sm">
                    <q-icon :name="sub.icon" size="sm" class="sidebar-nav-icon" />
                  </div>
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
            :class="childItemClass(child)"
          >
            <q-item-section v-if="child.icon" avatar class="sidebar-nav-icon-slot">
              <div class="sidebar-nav-icon-wrap sidebar-nav-icon-wrap--sm">
                <q-icon :name="child.icon" size="sm" class="sidebar-nav-icon" />
              </div>
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
  compactTop: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()

function entryKey(entry, idx) {
  return entry.labelKey || entry.type || String(idx)
}

function groupHeaderClass(entry, extra = '') {
  const classes = ['sidebar-nav-group__header']
  if (extra) classes.push(extra)
  if (entry.labelBold) classes.push('sidebar-nav-group__header--bold')
  return classes.join(' ')
}

function childItemClass(child) {
  return [
    'sidebar-nav-item',
    'sidebar-nav-item--child',
    child.nestedChild && 'sidebar-nav-item--nested-child',
  ]
}
</script>

<style scoped>
.sidebar-nav-root {
  --sidebar-text: var(--app-sidebar-text, #334155);
  --sidebar-text-strong: var(--app-sidebar-text-strong, #0f172a);
  --sidebar-muted: var(--app-sidebar-muted, #64748b);
  --sidebar-hover: var(--app-sidebar-hover, #e8eef5);
  --sidebar-active-bg: var(--app-sidebar-active-bg, #e8f2ff);
  --sidebar-active-text: var(--app-sidebar-active-text, #1d4ed8);
  --sidebar-accent: var(--app-sidebar-accent, #2563eb);
  --sidebar-icon-bg: var(--app-sidebar-icon-bg, #ffffff);
}

.sidebar-nav-list {
  padding: 10px 10px 24px;
}

.sidebar-nav-root--compact-top .sidebar-nav-list {
  padding-top: 14px;
}

.sidebar-nav-label {
  color: var(--sidebar-text);
  font-weight: 500;
  font-size: 0.8125rem;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.sidebar-nav-label--compact {
  font-size: 0.78rem;
}

.sidebar-nav-icon-slot {
  min-width: 40px;
}

.sidebar-nav-icon-wrap {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sidebar-icon-bg);
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.sidebar-nav-icon-wrap--sm {
  width: 30px;
  height: 30px;
  border-radius: 8px;
}

.sidebar-nav-icon {
  color: var(--sidebar-accent);
  font-size: 1.15rem;
}

.sidebar-nav-expand-icon {
  color: var(--sidebar-muted) !important;
  opacity: 0.85;
}

.sidebar-nav-group :deep(.q-expansion-item__content) {
  background: transparent;
  padding-bottom: 2px;
}

.sidebar-nav-group__header {
  font-weight: 600;
  color: var(--sidebar-text-strong) !important;
  font-size: 0.8125rem;
}

.sidebar-nav-group :deep(.sidebar-nav-group__header--bold),
.sidebar-nav-group :deep(.sidebar-nav-group__header--bold .q-item__label) {
  font-weight: 700 !important;
  color: var(--sidebar-text-strong) !important;
  font-size: 0.78rem !important;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sidebar-nav-group :deep(.q-expansion-item__header) {
  border-radius: 10px;
  margin: 2px 8px;
  min-height: 42px;
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.sidebar-nav-group :deep(.q-expansion-item__header:hover) {
  background: var(--sidebar-hover);
}

.sidebar-nav-group :deep(.q-expansion-item__header .q-icon) {
  color: var(--sidebar-accent) !important;
}

.sidebar-nav-item {
  border-radius: 10px;
  margin: 3px 8px;
  min-height: 42px;
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.sidebar-nav-item--child {
  margin-left: 6px;
  padding-left: 4px;
}

.sidebar-nav-item--nested-child {
  margin-left: 14px;
  padding-left: 10px;
}

.sidebar-nav-group--nested {
  margin-left: 4px;
  border-left: 2px solid #dbe4ef;
  margin-bottom: 2px;
}

.sidebar-nav-group--nested :deep(.q-expansion-item__container) {
  padding-left: 4px;
}

.sidebar-nav-item--grandchild {
  margin-left: 8px;
  padding-left: 8px;
}

.sidebar-nav-group--deep {
  margin-left: 8px;
  border-left: 2px solid #e8eef5;
}

.sidebar-nav-group--deep :deep(.q-expansion-item__container) {
  padding-left: 4px;
}

.sidebar-nav-group__header--deep {
  font-size: 0.78rem;
  font-weight: 600;
}

.sidebar-nav-item--deep {
  margin-left: 12px;
  padding-left: 8px;
}

.sidebar-nav-item:hover {
  background: var(--sidebar-hover);
}

.sidebar-nav-item:hover .sidebar-nav-icon-wrap {
  border-color: #bfdbfe;
  background: #f8fbff;
}

.sidebar-nav-item--active {
  background: var(--sidebar-active-bg) !important;
  box-shadow: inset 3px 0 0 var(--sidebar-accent);
  font-weight: 600;
}

.sidebar-nav-item--active .sidebar-nav-label {
  color: var(--sidebar-active-text);
  font-weight: 600;
}

.sidebar-nav-item--active .sidebar-nav-icon-wrap {
  background: #fff;
  border-color: #93c5fd;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.12);
}

.sidebar-nav-separator {
  background: #dbe4ef;
  margin: 8px 16px;
}
</style>

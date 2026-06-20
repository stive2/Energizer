<template>
  <q-list padding class="aura-nav-list">
    <q-item
      clickable
      v-ripple
      :to="{ name: 'assure-home' }"
      exact
      active-class="aura-active"
      class="aura-item"
      @click="closeSidebarOnMobile"
    >
      <q-item-section avatar>
        <q-icon name="home" class="aura-icon" />
      </q-item-section>
      <q-item-section v-if="!miniMode">
        <q-item-label class="aura-item-label">{{ t('layout.sidebar.home') }}</q-item-label>
      </q-item-section>
      <q-tooltip v-if="miniMode" anchor="center right" self="center left" :offset="[8, 0]">
        {{ t('layout.sidebar.home') }}
      </q-tooltip>
    </q-item>

    <q-expansion-item
      v-if="!miniMode"
      :expand-separator="false"
      header-class="aura-item"
      expand-icon-class="aura-expand-icon"
      class="aura-expansion"
      default-opened
    >
      <template #header>
        <q-item-section avatar>
          <q-icon name="folder_shared" class="aura-icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="aura-item-label">{{ t('layout.sidebar.assureDepotDossiers') }}</q-item-label>
        </q-item-section>
      </template>

      <q-item
        v-for="(entry, idx) in prestationEntries"
        :key="entry.routeName"
        clickable
        v-ripple
        :to="entry.disabled ? undefined : entry.to"
        :disable="entry.disabled"
        :inset-level="childInsetLevel"
        active-class="aura-active"
        class="aura-item"
        @click="!entry.disabled && closeSidebarOnMobile()"
      >
        <q-item-section avatar class="aura-dot-slot">
          <span class="aura-dot" :style="{ background: dotColor(idx) }" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="aura-item-label">{{ t(entry.labelKey) }}</q-item-label>
          <q-item-label v-if="entry.disabled" caption class="text-grey-5">
            {{ t('layout.sidebar.comingSoon') }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-expansion-item>

    <q-item v-else clickable v-ripple class="aura-item">
      <q-item-section avatar>
        <q-icon name="folder_shared" class="aura-icon" />
      </q-item-section>
      <q-menu anchor="top right" self="top left" :offset="[8, 0]">
        <q-list dense style="min-width: 220px">
          <q-item-label header class="text-weight-bold">{{
            t('layout.sidebar.assureDepotDossiers')
          }}</q-item-label>
          <q-item
            v-for="entry in prestationEntries"
            :key="entry.routeName"
            clickable
            v-close-popup
            v-ripple
            :disable="entry.disabled"
            :to="entry.disabled ? undefined : entry.to"
            @click="closeSidebarOnMobile"
          >
            <q-item-section>{{ t(entry.labelKey) }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
      <q-tooltip anchor="center right" self="center left" :offset="[8, 0]">
        {{ t('layout.sidebar.assureDepotDossiers') }}
      </q-tooltip>
    </q-item>

    <q-item-label v-if="!miniMode" header class="aura-nav-section q-mt-sm">
      {{ t('layout.sidebar.navSectionAccount') }}
    </q-item-label>

    <q-item
      clickable
      v-ripple
      :to="accountEntry.to"
      active-class="aura-active"
      class="aura-item"
      @click="closeSidebarOnMobile"
    >
      <q-item-section avatar>
        <q-icon :name="accountEntry.icon" class="aura-icon" />
      </q-item-section>
      <q-item-section v-if="!miniMode">
        <q-item-label class="aura-item-label">{{ t(accountEntry.labelKey) }}</q-item-label>
      </q-item-section>
      <q-tooltip v-if="miniMode" anchor="center right" self="center left" :offset="[8, 0]">
        {{ t(accountEntry.labelKey) }}
      </q-tooltip>
    </q-item>
  </q-list>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  assureSidebarAccountEntry,
  assureSidebarPrestationEntries,
} from 'src/modules/assure/config/assureMenu.js'
import { sidebarNavInsetLevel } from 'src/modules/shared/utils/sidebarNavInset.js'

const { t } = useI18n()
const closeSidebarOnMobile = inject('closeSidebarOnMobile', () => {})
const auraSidebarMiniMode = inject('auraSidebarMiniMode', null)

const miniMode = computed(() => auraSidebarMiniMode?.value ?? false)
const childInsetLevel = sidebarNavInsetLevel(1)
const prestationEntries = assureSidebarPrestationEntries
const accountEntry = assureSidebarAccountEntry

const DOT_COLORS = ['#a8d8ff', '#ffc897', '#9defc8', '#d4b5ff']

function dotColor(index) {
  return DOT_COLORS[index % DOT_COLORS.length]
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

.aura-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.aura-dot-slot {
  min-width: 40px !important;
}
</style>

<template>
  <q-list padding class="assure-sidebar-nav">
    <q-item
      clickable
      v-ripple
      :to="{ name: 'assure-home' }"
      exact
      active-class="assure-sidebar-nav__link--active"
      class="assure-sidebar-nav__link"
    >
      <q-item-section avatar class="assure-sidebar-nav__avatar">
        <q-icon name="home" />
      </q-item-section>
      <q-item-section class="assure-sidebar-nav__label text-bold">
        {{ t('layout.sidebar.home') }}
      </q-item-section>
    </q-item>

    <q-expansion-item
      expand-separator
      icon="folder_shared"
      :label="t('layout.sidebar.assureDepotDossiers')"
      header-class="assure-sidebar-nav__group-header text-bold"
      expand-icon-class="assure-sidebar-nav__expand-icon"
      class="assure-sidebar-nav__group"
      default-opened
    >
      <div class="assure-sidebar-nav__children">
        <q-item
          v-for="entry in prestationEntries"
          :key="entry.routeName"
          clickable
          v-ripple
          dense
          :to="entry.to"
          active-class="assure-sidebar-nav__link--active"
          class="assure-sidebar-nav__link assure-sidebar-nav__link--child"
        >
          <q-item-section avatar class="assure-sidebar-nav__avatar assure-sidebar-nav__avatar--child">
            <q-icon :name="entry.icon" size="18px" />
          </q-item-section>
          <q-item-section class="assure-sidebar-nav__label text-bold">
            {{ t(entry.labelKey) }}
          </q-item-section>
        </q-item>
      </div>
    </q-expansion-item>
  </q-list>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const prestationEntries = [
  {
    routeName: 'assure-prestations-familiales',
    labelKey: 'layout.sidebar.assurePrestationsFamiliales',
    icon: 'family_restroom',
    to: { name: 'assure-prestations-familiales' },
  },
  {
    routeName: 'assure-prestation-pension',
    labelKey: 'layout.sidebar.assurePrestationPension',
    icon: 'savings',
    to: { name: 'assure-prestation-pension' },
  },
  {
    routeName: 'assure-prestation-prise-at-mp',
    labelKey: 'layout.sidebar.assurePrestationPriseAtMp',
    icon: 'medical_services',
    to: { name: 'assure-prestation-prise-at-mp' },
  },
]
</script>

<style scoped>
.assure-sidebar-nav {
  padding-top: 6px;
  padding-bottom: 12px;
}

.assure-sidebar-nav :deep(.q-item__section--avatar) {
  min-width: 28px !important;
  max-width: 28px;
  padding-right: 2px !important;
}

.assure-sidebar-nav :deep(.q-item__section--main) {
  padding-left: 0 !important;
}

.assure-sidebar-nav__avatar {
  justify-content: flex-start;
}

.assure-sidebar-nav__link {
  border-radius: 6px;
  margin: 1px 4px;
  min-height: 36px;
  padding: 4px 6px;
  color: #0d47a1;
  transition: background-color 0.15s ease;
}

.assure-sidebar-nav__children {
  margin: 2px 6px 6px 22px;
  padding: 4px 0 4px 12px;
  border-left: 2px solid rgba(13, 71, 161, 0.28);
}

.assure-sidebar-nav__link--child {
  margin-left: 0;
  margin-right: 0;
  padding-left: 6px;
  padding-right: 4px;
  min-height: 32px;
}

.assure-sidebar-nav__avatar--child :deep(.q-icon) {
  font-size: 18px !important;
}

.assure-sidebar-nav__link:hover {
  background: rgba(25, 118, 210, 0.12);
}

.assure-sidebar-nav__label {
  font-size: 12px;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.assure-sidebar-nav__link :deep(.q-icon) {
  color: #1976d2;
  font-size: 20px;
}

.assure-sidebar-nav__link--active {
  background: #90caf9 !important;
  color: #0d47a1 !important;
}

.assure-sidebar-nav__link--active :deep(.q-icon) {
  color: #0d47a1 !important;
}

.assure-sidebar-nav__group :deep(.q-expansion-item__container) {
  margin: 0 2px;
}

.assure-sidebar-nav__group :deep(.q-expansion-item__header) {
  min-height: 36px;
  padding: 4px 8px 4px 6px;
  border-radius: 6px;
  margin: 2px 4px;
  color: #0d47a1;
  font-size: 12px;
  font-weight: 700;
}

.assure-sidebar-nav__group :deep(.q-expansion-item__header .q-item__section--avatar) {
  min-width: 28px !important;
  padding-right: 2px !important;
}

.assure-sidebar-nav__group :deep(.q-expansion-item__header .q-icon) {
  color: #1976d2;
  font-size: 20px;
}

.assure-sidebar-nav__group :deep(.q-expansion-item__header:hover) {
  background: rgba(25, 118, 210, 0.1);
}

.assure-sidebar-nav__expand-icon {
  color: #1565c0 !important;
  font-size: 18px !important;
}

.assure-sidebar-nav__group :deep(.q-expansion-item__content) {
  padding: 0;
}
</style>

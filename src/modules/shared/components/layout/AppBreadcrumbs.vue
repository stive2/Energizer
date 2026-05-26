<template>
  <q-breadcrumbs
    v-if="resolvedItems.length"
    class="app-breadcrumbs q-mb-sm text-grey-7"
    active-color="primary"
    separator=">"
  >
    <q-breadcrumbs-el
      v-for="(crumb, idx) in resolvedItems"
      :key="`${crumb.labelKey}-${idx}`"
      :label="t(crumb.labelKey)"
      :to="crumb.to"
    />
  </q-breadcrumbs>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { buildMenuBreadcrumbs } from 'src/modules/shared/utils/menuBreadcrumbs.js'

const props = defineProps({
  items: {
    type: Array,
    default: null,
  },
  menuItems: {
    type: Array,
    default: null,
  },
  routeName: {
    type: String,
    default: '',
  },
  homeLabelKey: {
    type: String,
    default: 'layout.sidebar.home',
  },
  homeRoute: {
    type: Object,
    default: () => ({ name: 'energizer-home' }),
  },
})

const route = useRoute()
const { t } = useI18n()

const resolvedItems = computed(() => {
  if (props.items?.length) {
    return props.items
  }
  if (!props.menuItems?.length) {
    return []
  }
  const name = props.routeName || route.name
  return buildMenuBreadcrumbs(props.menuItems, name, {
    homeLabelKey: props.homeLabelKey,
    homeRoute: props.homeRoute,
  })
})
</script>

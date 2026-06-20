<template>
  <q-breadcrumbs
    v-if="resolvedItems.length"
    class="app-breadcrumbs q-mb-sm text-grey-7"
    active-color="primary"
    separator=">"
  >
    <q-breadcrumbs-el
      v-for="(crumb, idx) in resolvedItems"
      :key="`${crumb.label || crumb.labelKey || idx}-${idx}`"
      :label="crumbLabel(crumb)"
      :to="crumb.to"
    />
  </q-breadcrumbs>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  prependHome: {
    type: Boolean,
    default: true,
  },
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const resolvedItems = computed(() => {
  if (props.items?.length) {
    return props.items
  }
  if (!props.menuItems?.length) {
    return []
  }
  if (props.routeName) {
    return buildMenuBreadcrumbs(props.menuItems, props.routeName, {
      homeLabelKey: props.homeLabelKey,
      homeRoute: props.homeRoute,
      prependHome: props.prependHome,
      router,
    })
  }
  return buildMenuBreadcrumbs(props.menuItems, route, {
    homeLabelKey: props.homeLabelKey,
    homeRoute: props.homeRoute,
    prependHome: props.prependHome,
    router,
  })
})

function crumbLabel(crumb) {
  if (crumb.label) return crumb.label
  if (crumb.labelKey) return t(crumb.labelKey)
  return ''
}
</script>

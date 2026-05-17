<template>
  <AuthenticatedLayout
    :menu-items="assureMenu"
    :session-config="assureSessionConfig"
    toolbar-title-key="title"
    drawer-title-key="layout.sidebar.navTitleAssure"
  >
    <router-view />
  </AuthenticatedLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import AuthenticatedLayout from 'layouts/AuthenticatedLayout.vue'
import { assureMenu, assureSessionConfig } from 'src/config/menus/assureMenu.js'
import { useDepotPrestationPfStore } from 'src/stores/assure/depotPrestationPfStore.js'

const depotPfStore = useDepotPrestationPfStore()

onMounted(() => {
  depotPfStore.loadContexte()
})
</script>

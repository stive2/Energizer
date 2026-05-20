<template>
  <AuthenticatedLayout
    :session-config="assureSessionConfig"
    toolbar-title-key="title"
    :show-drawer-brand="false"
    :drawer-width="250"
    :drawer-breakpoint="500"
    drawer-mini
    drawer-content-class="assure-drawer-panel bg-blue-2"
    drawer-class="authenticated-drawer assure-drawer"
  >
    <template #sidebar>
      <AssureSidebarNav />
    </template>

    <router-view />
  </AuthenticatedLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import AuthenticatedLayout from 'layouts/AuthenticatedLayout.vue'
import AssureSidebarNav from 'components/layout/AssureSidebarNav.vue'
import { assureSessionConfig } from 'src/config/menus/assureMenu.js'
import { useDepotPrestationPfStore } from 'src/stores/assure/depotPrestationPfStore.js'

const depotPfStore = useDepotPrestationPfStore()

onMounted(() => {
  depotPfStore.loadContexte()
})
</script>

<style>
.assure-drawer.authenticated-drawer {
  background: #bbdefb !important;
  border-right: 1px solid #90caf9 !important;
  box-shadow: 4px 0 20px rgba(13, 71, 161, 0.12);
}

.assure-drawer-panel {
  background: #bbdefb !important;
}
</style>

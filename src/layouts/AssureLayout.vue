<template>
  <AuthenticatedLayout
    :session-config="assureSessionConfig"
    toolbar-title-key="layout.assure.toolbarTitle"
    toolbar-title-mobile-key="layout.assure.toolbarTitleMobile"
    sidebar-title-key="layout.assure.sidebarTitle"
    show-profile-menu
    footer-simple
    aura-sidebar
    :show-sidebar-brand="false"
    :show-sidebar-user="false"
    :drawer-breakpoint="1024"
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

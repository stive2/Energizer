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
import AuthenticatedLayout from 'src/modules/shared/layouts/AuthenticatedLayout.vue'
import AssureSidebarNav from 'src/modules/shared/components/layout/AssureSidebarNav.vue'
import { assureSessionConfig } from 'src/modules/assure/config/assureMenu.js'
import { useDepotPrestationPfStore } from 'src/modules/assure/stores/depotPrestationPfStore.js'

const depotPfStore = useDepotPrestationPfStore()

onMounted(() => {
  depotPfStore.loadContexte()
})
</script>

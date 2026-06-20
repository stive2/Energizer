<template>
  <AuthenticatedLayout
    :session-config="assureSessionConfig"
    :menu-items="assureBreadcrumbMenu"
    :breadcrumb-home-route="{ name: 'assure-home' }"
    toolbar-title-key=""
    toolbar-title-mobile-key=""
    sidebar-title-key=""
    show-profile-menu
    footer-simple
    aura-sidebar
    show-route-breadcrumbs
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
import { assureSessionConfig, assureBreadcrumbMenu } from 'src/modules/assure/config/assureMenu.js'
import { useDepotPrestationPfStore } from 'src/modules/assure/stores/depotPrestationPfStore.js'
import { fetchAssureMe } from 'src/modules/shared/api/auth/assureAuthApi.js'
import { persistInsuredSession } from 'src/modules/shared/utils/portalSimAuthSession.js'

const depotPfStore = useDepotPrestationPfStore()

onMounted(async () => {
  depotPfStore.loadContexte()
  try {
    const body = await fetchAssureMe()
    if (body?.user) {
      persistInsuredSession({
        login: body.user.num_assu,
        num_assu: body.user.num_assu,
        displayName: body.displayName || body.user.displayName,
        token: localStorage.getItem('auth_token'),
        user: body.user,
      })
    }
  } catch {
    /* session locale conservée si le serveur est injoignable */
  }
})
</script>

<template>
  <AssureAuthPageLayout
    :back-to="{ name: 'module-portal' }"
    back-label="Retour"
  >
    <PortalSimLogin variant="insured" embedded @authenticated="onAuth" />
  </AssureAuthPageLayout>
</template>

<script setup>
import AssureAuthPageLayout from 'src/modules/assure/components/AssureAuthPageLayout.vue'
import PortalSimLogin from 'src/modules/shared/components/logins/PortalSimLogin.vue'
import { persistInsuredSession } from 'src/modules/shared/utils/portalSimAuthSession.js'

function onAuth(payload) {
  persistInsuredSession({
    ...payload,
    num_assu: payload.num_assu || payload.login,
  })
  // La redirection est gérée par PortalSimLogin après connexion réussie.
}
</script>

<style scoped>
:deep(.portal-sim-login--embedded) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 900px) {
  :deep(.portal-sim-login--embedded) {
    overflow: visible;
    min-height: min-content;
  }

  :deep(.portal-sim-login--embedded .portal-sim-login__panel) {
    margin-bottom: 0.75rem;
  }
}
</style>

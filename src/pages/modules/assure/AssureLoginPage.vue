<template>
  <q-page class="column flex-center q-pa-md intranet-login-gate">
    <PortalSimLogin variant="insured" @authenticated="onAuth" />
  </q-page>
</template>

<script setup>
import PortalSimLogin from 'components/logins/PortalSimLogin.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const PROFILE_KEY = 'assure-sim-profile'
const NAME_KEY = 'assure-sim-display-name'

function onAuth(payload) {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(PROFILE_KEY, 'external')
    sessionStorage.setItem(NAME_KEY, payload.displayName)
  }
  localStorage.setItem('auth_token', 'sim-token-external')
  localStorage.setItem(
    'user_info',
    JSON.stringify({
      profile: 'external',
      nom: payload.displayName,
      email: payload.login,
      numeroAssure: 'DEMO-ASS-001',
    }),
  )
  router.replace({ name: 'assure-home' })
}
</script>

<template>
  <q-page class="login-page fit column no-wrap">
    <div class="login-layout">
      <div class="login-image-side">
        <img :src="bgImage" class="login-image" alt="CNPS Sapelli Energizer" />
      </div>

      <aside class="login-form-side">
        <div class="login-form-top">
          <q-btn
            flat
            dense
            no-caps
            icon="arrow_back"
            label="Retour"
            color="primary"
            class="login-back-btn"
            :to="{ name: 'module-portal' }"
          />
        </div>

        <PortalSimLogin variant="agent" embedded @authenticated="onAuth" />
      </aside>
    </div>
  </q-page>
</template>

<script setup>
import PortalSimLogin from 'src/modules/shared/components/logins/PortalSimLogin.vue'
import { useRoute, useRouter } from 'vue-router'
import bgImage from 'assets/images/energizerCnps.jpg'
import { persistAgentSession } from 'src/modules/shared/utils/portalSimAuthSession.js'

const router = useRouter()
const route = useRoute()

function onAuth(payload) {
  persistAgentSession(payload)
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
  if (redirect && redirect.startsWith('/')) {
    router.replace(redirect)
    return
  }
  router.replace({ name: 'energizer-home' })
}
</script>

<style scoped>
.login-page {
  overflow: hidden;
  padding: 0 !important;
  min-height: 0 !important;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.login-layout {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  width: 100%;
  overflow: hidden;
}

.login-image-side {
  flex: 1 1 72%;
  min-width: 0;
  overflow: hidden;
  background: #6eb8e8;
}

.login-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left center;
  display: block;
}

.login-form-side {
  flex: 0 0 28%;
  width: 28%;
  min-width: 280px;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #d4ebfa 0%, #eef7fd 100%);
  border-left: 1px solid rgba(21, 101, 192, 0.12);
}

.login-form-top {
  flex-shrink: 0;
  padding: 0.45rem 0.5rem 0;
  background: linear-gradient(180deg, #c5e3f8 0%, #e8f4fc 100%);
}

.login-back-btn {
  font-size: 0.72rem;
  font-weight: 600;
  min-height: 32px;
  padding: 0 0.35rem;
}

.login-form-side :deep(.portal-sim-login--embedded) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 900px) {
  .login-page {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .login-layout {
    flex-direction: column;
    min-height: min(100dvh, 100vh);
  }

  .login-image-side {
    flex: 0 0 min(38vh, 280px);
    width: 100%;
    max-width: none;
    min-height: 160px;
  }

  .login-form-side {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    max-width: none;
    overflow-y: auto;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .login-form-side :deep(.portal-sim-login--embedded) {
    overflow: visible;
    min-height: min-content;
  }

  .login-form-side :deep(.portal-sim-login--embedded .portal-sim-login__panel) {
    margin-bottom: 0.75rem;
  }
}

@media (max-width: 480px) {
  .login-image-side {
    flex: 0 0 32vh;
    min-height: 140px;
  }

  .login-form-top {
    padding: 0.35rem 0.5rem 0;
  }
}
</style>

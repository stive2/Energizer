<template>
  <q-page class="login-page">

    <!-- Image de fond -->
    <div class="login-bg" :style="{ backgroundImage: `url(${bgImage})` }" />

    <!-- Voile très léger : surtout à droite pour ne pas ternir le logo à gauche -->
    <div class="login-overlay" />

    <div class="login-content">
      <div class="login-aside">
        <q-btn
          flat
          dense
          no-caps
          icon="arrow_back"
          label="Retour au portail"
          color="primary"
          class="login-back-btn"
          :to="{ name: 'module-portal' }"
        />

        <div class="login-badge">
          <q-icon name="shield" size="16px" class="q-mr-xs" />
          Portail CNPS — Accès agent
        </div>

        <PortalSimLogin variant="agent" @authenticated="onAuth" />
      </div>
    </div>

  </q-page>
</template>

<script setup>
import PortalSimLogin from 'components/logins/PortalSimLogin.vue'
import { useRouter } from 'vue-router'
import bgImage from 'assets/images/imgcnps.JPG'

const router = useRouter()

const PROFILE_KEY = 'energizer-portal-sim-profile'
const NAME_KEY = 'energizer-portal-sim-display-name'

function onAuth(payload) {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(PROFILE_KEY, 'internal')
    sessionStorage.setItem(NAME_KEY, payload.displayName)
  }
  router.replace({ name: 'energizer-home' })
}
</script>

<style scoped>
.login-page {
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', system-ui, sans-serif;
  /* La hauteur utile vient du style inline de QPage (écran − barres layout) */
  display: flex;
  flex-direction: column;
}

/* Fond fixe : couvre tout l’écran visible, sans trou ni bande (dvh = barre d’adresse mobile) */
.login-bg {
  position: fixed;
  inset: 0;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background-size: cover;
  background-position: left center;
  background-repeat: no-repeat;
  filter: saturate(1.06) brightness(1.04);
  z-index: 0;
}

/* Presque pas de voile à gauche (logo / façade) ; léger renfort à droite seulement */
.login-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  pointer-events: none;
  background: linear-gradient(
    92deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0) 48%,
    rgba(248, 250, 252, 0.35) 68%,
    rgba(237, 242, 252, 0.55) 100%
  );
  z-index: 1;
}

.login-content {
  position: relative;
  z-index: 2;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1rem 1.5rem;
  width: 100%;
  min-height: 0;
  box-sizing: border-box;
}

@media (min-width: 720px) {
  .login-content {
    align-items: flex-end;
    justify-content: center;
    padding: 1.5rem clamp(1rem, 4vw, 3rem) 1.5rem 1.25rem;
  }
}

/* Colonne formulaire : lisible sur tout fond, alignée avec la carte */
.login-aside {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  padding: 1.1rem 1.1rem 1rem;
  border-radius: 16px;
  background: rgba(241, 245, 249, 0.88);
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow:
    0 4px 6px rgba(15, 23, 42, 0.04),
    0 18px 48px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.login-back-btn {
  align-self: flex-start;
  margin: -4px 0 0 -6px;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.login-badge {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  background: rgba(25, 118, 210, 0.1);
  border: 1px solid rgba(25, 118, 210, 0.22);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #1565c0;
}
</style>

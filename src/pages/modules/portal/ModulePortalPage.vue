<template>
  <q-page class="portal-page">
    <div class="portal-bg" :style="{ backgroundImage: `url(${bgImage})` }" />
    <div class="portal-overlay" aria-hidden="true" />

    <div class="portal-shell">
      <header class="portal-hero">
        <q-avatar size="52px" class="portal-hero__logo">
          <q-icon name="account_balance" size="28px" color="white" />
        </q-avatar>
        <h1 class="portal-hero__title">{{ t('modules.portal.title') }}</h1>
        <p class="portal-hero__subtitle">{{ t('home.portalSubtitle') }}</p>
      </header>

      <div class="portal-modules">
        <button
          v-for="(card, index) in cards"
          :key="card.routeKey"
          type="button"
          class="portal-module"
          :class="`portal-module--${card.color}`"
          :style="{ '--delay': `${index * 70}ms` }"
          :aria-label="t(card.titleKey) || card.fallbackTitle"
          @click="go(card.to)"
        >
          <div class="portal-module__icon">
            <q-icon :name="card.icon" size="28px" color="white" />
          </div>
          <div class="portal-module__body">
            <span class="portal-module__title">{{ t(card.titleKey) || card.fallbackTitle }}</span>
            <span class="portal-module__desc">{{ card.description }}</span>
          </div>
          <q-icon name="chevron_right" size="24px" class="portal-module__chevron" />
        </button>
      </div>

      <p class="portal-footer">
        <q-icon name="touch_app" size="16px" class="q-mr-xs" />
        {{ t('modules.portal.footerHint') }}
      </p>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import bgImage from 'assets/images/imgcnps.JPG'

const { t } = useI18n()
const router = useRouter()

function go(to) {
  router.push(to)
}

const cards = computed(() => [
  {
    routeKey: 'energizer',
    titleKey: 'modules.energizer.cardTitle',
    fallbackTitle: 'EnergiZer',
    description: 'Gestion agent — réception, liquidations, statistiques',
    icon: 'hub',
    color: 'blue',
    to: { name: 'energizer-login' },
  },
  {
    routeKey: 'assure',
    titleKey: 'modules.assure.cardTitle',
    fallbackTitle: 'Espace assuré',
    description: 'Suivi des droits et dépôt de dossiers',
    icon: 'person',
    color: 'indigo',
    to: { name: 'assure-login' },
  },
  {
    routeKey: 'declarations',
    titleKey: 'modules.declarations.cardTitle',
    fallbackTitle: 'Déclarations',
    description: 'Immatriculations en ligne sans connexion',
    icon: 'assignment',
    color: 'primary',
    to: { name: 'declarations-home' },
  },
])
</script>

<style scoped>
.portal-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 32px;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

.portal-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

.portal-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    165deg,
    rgba(13, 71, 161, 0.82) 0%,
    rgba(25, 118, 210, 0.75) 45%,
    rgba(0, 30, 80, 0.88) 100%
  );
  z-index: 1;
}

.portal-shell {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 560px;
  animation: portal-fade-in 0.6s ease;
}

@keyframes portal-fade-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hero */
.portal-hero {
  text-align: center;
  margin-bottom: 28px;
}

.portal-hero__logo {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.35);
  margin-bottom: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.portal-hero__title {
  margin: 0 0 10px;
  font-size: clamp(1.5rem, 5vw, 1.85rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
  line-height: 1.15;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.portal-hero__subtitle {
  margin: 0 auto;
  max-width: 420px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

/* Modules */
.portal-modules {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.portal-module {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 18px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  text-align: left;
  transition:
    transform 0.22s ease,
    background 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
  animation: portal-card-in 0.45s ease backwards;
  animation-delay: var(--delay, 0ms);
}

@keyframes portal-card-in {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.portal-module:hover {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
}

.portal-module:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
}

.portal-module__icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.portal-module--blue .portal-module__icon {
  background: linear-gradient(145deg, #1565c0, #42a5f5);
}

.portal-module--indigo .portal-module__icon {
  background: linear-gradient(145deg, #3949ab, #7986cb);
}

.portal-module--primary .portal-module__icon {
  background: linear-gradient(145deg, var(--q-primary, #1976d2), #64b5f6);
}

.portal-module__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.portal-module__title {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.25;
}

.portal-module__desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.35;
}

.portal-module__chevron {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.2s ease, color 0.2s ease;
}

.portal-module:hover .portal-module__chevron {
  color: #fff;
  transform: translateX(4px);
}

.portal-footer {
  margin: 20px 0 0;
  text-align: center;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 600px) {
  .portal-shell {
    max-width: 640px;
  }

  .portal-modules {
    gap: 14px;
  }

  .portal-module {
    padding: 18px 20px;
  }
}
</style>

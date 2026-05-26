<template>
  <q-page class="portal-page fit">
    <div class="portal-bg" :style="{ backgroundImage: `url(${bgImage})` }" />

    <div class="portal-shell">
      <h1 class="portal-heading">{{ t('modules.portal.title') }}</h1>

      <div class="portal-modules">
        <button
          v-for="(card, index) in cards"
          :key="card.routeKey"
          type="button"
          class="portal-module"
          :class="`portal-module--${card.color}`"
          :style="{ '--delay': `${index * 60}ms` }"
          :aria-label="t(card.titleKey) || card.fallbackTitle"
          @click="go(card.to)"
        >
          <div class="portal-module__icon">
            <q-icon :name="card.icon" size="36px" color="white" />
          </div>
          <span class="portal-module__title">{{ t(card.titleKey) || card.fallbackTitle }}</span>
        </button>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import bgImage from 'assets/images/portailCnps.jpg'

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
    icon: 'hub',
    color: 'blue',
    to: { name: 'energizer-login' },
  },
  {
    routeKey: 'assure',
    titleKey: 'modules.assure.cardTitle',
    fallbackTitle: 'Espace assuré',
    icon: 'person',
    color: 'indigo',
    to: { name: 'assure-login' },
  },
  {
    routeKey: 'immatriculations',
    titleKey: 'modules.declarations.cardTitleImmatriculations',
    fallbackTitle: 'Immatriculations',
    icon: 'badge',
    color: 'primary',
    to: { name: 'declarations-home' },
  },
])
</script>

<style scoped>
.portal-page {
  position: relative;
  min-height: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: clamp(0.75rem, 2.5vh, 1.75rem) 1.75rem 1rem;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

.portal-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  /* décale le visuel vers la droite pour ne pas masquer le logo CNPS sous la colonne */
  background-position: 58% 42%;
  background-repeat: no-repeat;
  z-index: 0;
}

.portal-shell {
  position: relative;
  z-index: 2;
  width: auto;
  max-width: 320px;
  margin: 0;
  animation: portal-fade-in 0.5s ease;
}

@keyframes portal-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.portal-heading {
  margin: 0 0 2.65rem;
  text-align: left;
  font-size: clamp(1.65rem, 3.2vw, 2.35rem);
  font-weight: 800;
  color: #0d47a1;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
}

.portal-modules {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
}

.portal-module {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 0.7rem;
  width: 100%;
  min-height: 0;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(21, 101, 192, 0.14);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
  cursor: pointer;
  text-align: left;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  animation: portal-card-in 0.4s ease backwards;
  animation-delay: var(--delay, 0ms);
}

@keyframes portal-card-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.portal-module:hover {
  transform: translateY(-2px);
  border-color: rgba(25, 118, 210, 0.35);
  box-shadow: 0 6px 18px rgba(25, 118, 210, 0.12);
}

.portal-module:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.25);
}

.portal-module__icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.1);
}

.portal-module--blue .portal-module__icon {
  background: linear-gradient(145deg, #42a5f5, #1976d2);
}

.portal-module--indigo .portal-module__icon {
  background: linear-gradient(145deg, #7986cb, #3949ab);
}

.portal-module--primary .portal-module__icon {
  background: linear-gradient(145deg, #64b5f6, #1565c0);
}

.portal-module__title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0d47a1;
  line-height: 1.15;
}

@media (max-width: 480px) {
  .portal-page {
    padding: 0.65rem 1rem 0.75rem;
  }

  .portal-shell {
    max-width: 280px;
  }

  .portal-heading {
    font-size: 1.45rem;
  }

  .portal-module {
    padding: 0.45rem 0.6rem;
  }

  .portal-module__icon {
    width: 50px;
    height: 50px;
  }

  .portal-module__title {
    font-size: 0.88rem;
  }
}
</style>

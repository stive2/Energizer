<template>
  <q-page class="login-page fit column no-wrap">
    <div class="login-layout">
      <div class="login-image-side">
        <img :src="bgImage" class="login-image" alt="CNPS — Déclarations et immatriculations" />
      </div>

      <aside class="login-form-side decl-panel">
        <div class="decl-panel__inner">
          <header class="decl-hero">
            <div class="decl-hero__badge">
              <q-icon name="verified_user" size="15px" class="q-mr-xs" aria-hidden="true" />
              <span>{{ t('modules.declarations.noLoginBadge') }}</span>
            </div>
            <h1 class="decl-hero__title">{{ t('modules.declarations.homeTitle') }}</h1>
          </header>

          <section class="decl-section" aria-labelledby="decl-section-employeurs">
          <div class="decl-section__head">
            <q-avatar size="28px" color="blue-1" text-color="primary" icon="business" />
            <h2 id="decl-section-employeurs" class="decl-section__title">
              {{ t('modules.declarations.sectionEmployeurs') }}
            </h2>
          </div>

          <div class="decl-cards">
            <article
              v-for="(tile, index) in employeurTiles"
              :key="tile.code"
              class="decl-card"
              :class="`decl-card--${tile.theme}`"
              :style="{ '--stagger': `${index * 50}ms` }"
              tabindex="0"
              role="button"
              :aria-label="label(tile.code)"
              @click="openImmat(tile.code)"
              @keyup.enter="openImmat(tile.code)"
            >
              <div class="decl-card__glow" />
              <div class="decl-card__body">
                <div class="decl-card__icon-wrap">
                  <q-icon :name="tile.icon" size="22px" />
                </div>
                <div class="decl-card__content">
                  <div class="decl-card__code">{{ tile.code }}</div>
                  <h3 class="decl-card__name">{{ label(tile.code) }}</h3>
                </div>
                <q-icon name="arrow_forward" class="decl-card__arrow" size="18px" />
              </div>
            </article>
          </div>
          </section>

          <div class="decl-section-divider" role="presentation" />

          <section class="decl-section" aria-labelledby="decl-section-assures">
          <div class="decl-section__head">
            <q-avatar size="28px" color="blue-1" text-color="primary" icon="groups" />
            <h2 id="decl-section-assures" class="decl-section__title">
              {{ t('modules.declarations.sectionAssures') }}
            </h2>
          </div>

          <div class="decl-cards">
            <article
              v-for="(tile, index) in assureTiles"
              :key="tile.code"
              class="decl-card"
              :class="`decl-card--${tile.theme}`"
              :style="{ '--stagger': `${(index + 2) * 50}ms` }"
              tabindex="0"
              role="button"
              :aria-label="label(tile.code)"
              @click="openImmat(tile.code)"
              @keyup.enter="openImmat(tile.code)"
            >
              <div class="decl-card__glow" />
              <div class="decl-card__body">
                <div class="decl-card__icon-wrap">
                  <q-icon :name="tile.icon" size="22px" />
                </div>
                <div class="decl-card__content">
                  <div class="decl-card__code">{{ tile.code }}</div>
                  <h3 class="decl-card__name">{{ label(tile.code) }}</h3>
                </div>
                <q-icon name="arrow_forward" class="decl-card__arrow" size="18px" />
              </div>
            </article>
          </div>
          </section>
        </div>
      </aside>
    </div>

    <q-dialog v-model="showStepperDialog" persistent maximized>
      <ImmatAssuVol v-if="showImmatAssuVol" :service="selectedService" @close="closeAll" />
      <ImmatEmpPro v-if="showImmatEmpPro" :service="selectedService" @close="closeAll" />
      <ImmatEmpDom v-if="showImmatEmpDom" :service="selectedService" @close="closeAll" />
      <ImmatAssuTrv v-if="showImmatAssuTrv" :service="selectedService" @close="closeAll" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import bgImage from 'assets/images/popularCnps.jpg'
import ImmatEmpPro from 'components/ImmatEmpPro.vue'
import ImmatEmpDom from 'components/ImmatEmpDom.vue'
import ImmatAssuTrv from 'components/ImmatAssuTrv.vue'
import ImmatAssuVol from 'components/ImmatAssuVol.vue'

const { t } = useI18n()

const immatServices = [
  { code: 'IMMEP', name: 'services.immep.name', description: 'services.immep.description' },
  { code: 'IMMED', name: 'services.immed.name', description: 'services.immed.description' },
  { code: 'IMMAT', name: 'services.immat.name', description: 'services.immat.description' },
  { code: 'IMMAV', name: 'services.immav.name', description: 'services.immav.description' },
]

const employeurTiles = [
  { code: 'IMMEP', icon: 'work_outline', theme: 'primary-dark' },
  { code: 'IMMED', icon: 'home_repair_service', theme: 'primary' },
]

const assureTiles = [
  { code: 'IMMAT', icon: 'engineering', theme: 'primary-light' },
  { code: 'IMMAV', icon: 'person_add_alt_1', theme: 'primary-soft' },
]

function findSvc(code) {
  return immatServices.find((s) => s.code === code) || null
}

function label(code) {
  const s = findSvc(code)
  return s ? t(s.name) : code
}

const selectedService = ref(null)
const showStepperDialog = ref(false)
const showImmatEmpPro = ref(false)
const showImmatEmpDom = ref(false)
const showImmatAssuTrv = ref(false)
const showImmatAssuVol = ref(false)

function closeAll() {
  showStepperDialog.value = false
  showImmatEmpPro.value = false
  showImmatEmpDom.value = false
  showImmatAssuTrv.value = false
  showImmatAssuVol.value = false
}

function openImmat(code) {
  const svc = findSvc(code)
  if (!svc) return
  selectedService.value = { ...svc, id: 1 }
  showImmatEmpPro.value = code === 'IMMEP'
  showImmatEmpDom.value = code === 'IMMED'
  showImmatAssuTrv.value = code === 'IMMAT'
  showImmatAssuVol.value = code === 'IMMAV'
  showStepperDialog.value = true
}
</script>

<style scoped>
.login-page {
  --decl-surface-bg: linear-gradient(180deg, #c8e6f8 0%, #e8f4fc 48%, #f4fafd 100%);
  overflow: hidden;
  padding: 0 !important;
  font-family: 'Segoe UI', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.login-layout {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  width: 100%;
  overflow: hidden;
}

.login-image-side {
  position: relative;
  flex: 0 0 44%;
  width: 44%;
  min-width: 0;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--decl-surface-bg);
}

.login-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  display: block;
}

.login-form-side.decl-panel {
  flex: 1 1 56%;
  width: 56%;
  min-width: 0;
  max-width: none;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0;
  background: var(--decl-surface-bg);
  scrollbar-width: thin;
  scrollbar-color: rgba(25, 118, 210, 0.35) transparent;
}

.login-form-side.decl-panel::-webkit-scrollbar {
  width: 5px;
}

.login-form-side.decl-panel::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: rgba(25, 118, 210, 0.3);
}

.decl-panel__inner {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: clamp(0.75rem, 1.8vh, 1.1rem) clamp(0.75rem, 1.4vw, 1rem) 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.decl-hero {
  flex-shrink: 0;
  padding-bottom: 0.15rem;
}

.decl-hero__badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(25, 118, 210, 0.18);
  color: #1565c0;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.45rem;
  box-shadow: 0 1px 4px rgba(25, 118, 210, 0.08);
}

.decl-hero__title {
  margin: 0;
  font-size: clamp(1.02rem, 1.6vw, 1.22rem);
  font-weight: 800;
  color: #0d47a1;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.decl-section {
  flex-shrink: 0;
}

.decl-section-divider {
  height: 1px;
  margin: 0.15rem 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(21, 101, 192, 0.22) 20%,
    rgba(21, 101, 192, 0.22) 80%,
    transparent
  );
}

.decl-section__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
}

.decl-section__title {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: #455a64;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.decl-cards {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.decl-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 11px;
  border: 1px solid rgba(21, 101, 192, 0.1);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
  animation: decl-card-in 0.45s ease backwards;
  animation-delay: var(--stagger, 0ms);
}

@keyframes decl-card-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.decl-card:hover,
.decl-card:focus-visible {
  transform: translateY(-2px);
  background: #fff;
  box-shadow: 0 6px 18px rgba(25, 118, 210, 0.14);
  border-color: rgba(25, 118, 210, 0.22);
  outline: none;
}

.decl-card:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.decl-card:focus-visible {
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.08),
    0 0 0 2px rgba(25, 118, 210, 0.4);
}

.decl-card__glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.decl-card--primary-dark .decl-card__glow {
  background: linear-gradient(90deg, #0d47a1, #1976d2);
}
.decl-card--primary-dark .decl-card__icon-wrap {
  background: linear-gradient(135deg, #e3f2fd, #90caf9);
  color: #0d47a1;
}

.decl-card--primary .decl-card__glow {
  background: linear-gradient(90deg, #1565c0, #42a5f5);
}
.decl-card--primary .decl-card__icon-wrap {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1565c0;
}

.decl-card--primary-light .decl-card__glow {
  background: linear-gradient(90deg, #1976d2, #64b5f6);
}
.decl-card--primary-light .decl-card__icon-wrap {
  background: linear-gradient(135deg, #e8f4fd, #bbdefb);
  color: #1976d2;
}

.decl-card--primary-soft .decl-card__glow {
  background: linear-gradient(90deg, #1e88e5, #90caf9);
}
.decl-card--primary-soft .decl-card__icon-wrap {
  background: linear-gradient(135deg, #f0f7ff, #e3f2fd);
  color: #1e88e5;
}

.decl-card__body {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.6rem;
}

.decl-card__icon-wrap {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.decl-card__content {
  flex: 1 1 auto;
  min-width: 0;
}

.decl-card__code {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #90a4ae;
  margin-bottom: 1px;
}

.decl-card__name {
  margin: 0;
  font-size: 0.74rem;
  font-weight: 700;
  color: #263238;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.decl-card__arrow {
  flex-shrink: 0;
  color: #b0bec5;
  transition: transform 0.2s ease, color 0.2s ease;
}

.decl-card:hover .decl-card__arrow {
  transform: translateX(3px);
  color: var(--q-primary, #1976d2);
}

@media (max-width: 900px) {
  .login-layout {
    flex-direction: column;
  }

  .login-image-side {
    flex: 0 0 42%;
    width: 100%;
    max-width: none;
  }

  .login-image {
    object-fit: contain;
    object-position: center center;
  }

  .login-form-side.decl-panel {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    max-width: none;
  }

  .decl-panel__inner {
    max-width: none;
  }
}
</style>

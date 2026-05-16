<template>
  <q-page class="declarations-home">
    <div class="declarations-home__bg" aria-hidden="true" />

    <div class="declarations-home__wrap q-mx-auto q-px-md q-py-lg">
      <header class="declarations-hero q-mb-lg">
        <div class="declarations-hero__badge row items-center q-mb-sm">
          <q-icon name="verified_user" size="18px" class="q-mr-xs" />
          <span>{{ t('modules.declarations.noLoginBadge') }}</span>
        </div>
        <h1 class="declarations-hero__title">{{ t('modules.declarations.homeTitle') }}</h1>
      </header>

      <section class="declarations-section q-mb-lg" aria-labelledby="decl-section-employeurs">
        <div class="declarations-section__head row items-center q-mb-sm">
          <q-avatar size="36px" color="blue-1" text-color="primary" icon="business" class="q-mr-sm" />
          <div>
            <h2 id="decl-section-employeurs" class="declarations-section__title">
              {{ t('modules.declarations.sectionEmployeurs') }}
            </h2>
            <p class="declarations-section__subtitle">{{ t('modules.declarations.sectionEmployeursLead') }}</p>
          </div>
        </div>

        <div class="row q-col-gutter-lg justify-start">
          <div
            v-for="(tile, index) in employeurTiles"
            :key="tile.code"
            class="col-12 col-sm-6"
          >
            <article
              class="decl-card"
              :class="`decl-card--${tile.theme}`"
              :style="{ '--stagger': `${index * 60}ms` }"
              tabindex="0"
              role="button"
              :aria-label="label(tile.code)"
              @click="openImmat(tile.code)"
              @keyup.enter="openImmat(tile.code)"
            >
              <div class="decl-card__glow" />
              <div class="decl-card__body">
                <div class="decl-card__icon-wrap">
                  <q-icon :name="tile.icon" size="28px" />
                </div>
                <div class="decl-card__content col">
                  <div class="decl-card__code">{{ tile.code }}</div>
                  <h3 class="decl-card__name">{{ label(tile.code) }}</h3>
                  <p class="decl-card__desc">{{ desc(tile.code) }}</p>
                </div>
                <q-icon name="arrow_forward" class="decl-card__arrow" size="22px" />
              </div>
              <div class="decl-card__footer">
                <span>{{ t('modules.declarations.openForm') }}</span>
                <q-icon name="open_in_new" size="16px" class="q-ml-xs" />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="declarations-section" aria-labelledby="decl-section-assures">
        <div class="declarations-section__head row items-center q-mb-sm">
          <q-avatar size="36px" color="blue-1" text-color="primary" icon="groups" class="q-mr-sm" />
          <div>
            <h2 id="decl-section-assures" class="declarations-section__title">
              {{ t('modules.declarations.sectionAssures') }}
            </h2>
            <p class="declarations-section__subtitle">{{ t('modules.declarations.sectionAssuresLead') }}</p>
          </div>
        </div>

        <div class="row q-col-gutter-lg justify-start">
          <div
            v-for="(tile, index) in assureTiles"
            :key="tile.code"
            class="col-12 col-sm-6"
          >
            <article
              class="decl-card"
              :class="`decl-card--${tile.theme}`"
              :style="{ '--stagger': `${index * 60}ms` }"
              tabindex="0"
              role="button"
              :aria-label="label(tile.code)"
              @click="openImmat(tile.code)"
              @keyup.enter="openImmat(tile.code)"
            >
              <div class="decl-card__glow" />
              <div class="decl-card__body">
                <div class="decl-card__icon-wrap">
                  <q-icon :name="tile.icon" size="28px" />
                </div>
                <div class="decl-card__content col">
                  <div class="decl-card__code">{{ tile.code }}</div>
                  <h3 class="decl-card__name">{{ label(tile.code) }}</h3>
                  <p class="decl-card__desc">{{ desc(tile.code) }}</p>
                </div>
                <q-icon name="arrow_forward" class="decl-card__arrow" size="22px" />
              </div>
              <div class="decl-card__footer">
                <span>{{ t('modules.declarations.openForm') }}</span>
                <q-icon name="open_in_new" size="16px" class="q-ml-xs" />
              </div>
            </article>
          </div>
        </div>
      </section>
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

function desc(code) {
  const s = findSvc(code)
  return s ? t(s.description) : ''
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
.declarations-home {
  position: relative;
  min-height: 100%;
  overflow: hidden;
}

.declarations-home__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 10% -10%, rgba(25, 118, 210, 0.12), transparent 55%),
    radial-gradient(ellipse 60% 40% at 95% 20%, rgba(13, 71, 161, 0.06), transparent 50%),
    linear-gradient(180deg, #fafbfc 0%, #f0f4f8 100%);
  z-index: 0;
}

.declarations-home__wrap {
  position: relative;
  z-index: 1;
  max-width: 1040px;
}

.declarations-hero__badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(25, 118, 210, 0.12);
  color: var(--q-primary, #1976d2);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.declarations-hero__title {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  color: var(--q-primary, #1976d2);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.declarations-section__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #263238;
}

.declarations-section__subtitle {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #78909c;
}

.decl-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.28s cubic-bezier(0.34, 1.2, 0.64, 1),
    box-shadow 0.28s ease,
    border-color 0.2s ease;
  animation: decl-card-in 0.5s ease backwards;
  animation-delay: var(--stagger, 0ms);
}

@keyframes decl-card-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.decl-card:hover,
.decl-card:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: transparent;
  outline: none;
}

.decl-card:focus-visible {
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.1),
    0 0 0 3px rgba(25, 118, 210, 0.45);
}

.decl-card__glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  transition: height 0.25s ease;
}

.decl-card:hover .decl-card__glow {
  height: 6px;
}

.decl-card--primary-dark .decl-card__glow { background: linear-gradient(90deg, #0d47a1, #1976d2); }
.decl-card--primary-dark .decl-card__icon-wrap { background: linear-gradient(135deg, #e3f2fd, #90caf9); color: #0d47a1; }

.decl-card--primary .decl-card__glow { background: linear-gradient(90deg, #1565c0, #42a5f5); }
.decl-card--primary .decl-card__icon-wrap { background: linear-gradient(135deg, #e3f2fd, #bbdefb); color: #1565c0; }

.decl-card--primary-light .decl-card__glow { background: linear-gradient(90deg, #1976d2, #64b5f6); }
.decl-card--primary-light .decl-card__icon-wrap { background: linear-gradient(135deg, #e8f4fd, #bbdefb); color: #1976d2; }

.decl-card--primary-soft .decl-card__glow { background: linear-gradient(90deg, #1e88e5, #90caf9); }
.decl-card--primary-soft .decl-card__icon-wrap { background: linear-gradient(135deg, #f0f7ff, #e3f2fd); color: #1e88e5; }

.decl-card__body {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px 14px;
}

.decl-card__icon-wrap {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.decl-card__code {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  color: #90a4ae;
  margin-bottom: 4px;
}

.decl-card__name {
  margin: 0 0 6px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #263238;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.decl-card__desc {
  margin: 0;
  font-size: 0.82rem;
  color: #78909c;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.decl-card__arrow {
  flex-shrink: 0;
  color: #b0bec5;
  margin-top: 6px;
  transition: transform 0.25s ease, color 0.2s ease;
}

.decl-card:hover .decl-card__arrow {
  transform: translateX(4px);
  color: var(--q-primary, #1976d2);
}

.decl-card__footer {
  display: flex;
  align-items: center;
  padding: 10px 20px 12px;
  border-top: 1px solid #f5f5f5;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--q-primary, #1976d2);
  letter-spacing: 0.02em;
}
</style>

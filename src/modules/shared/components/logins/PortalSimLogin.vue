<template>
  <q-card
    class="portal-sim-login"
    :class="[cardModifier, { 'portal-sim-login--embedded': embedded }]"
    flat
  >
    <header v-if="showLegacyHeader" class="portal-sim-login__top-bar">
      <q-img
        v-if="bannerSrc"
        :src="bannerSrc"
        alt="CNPS"
        fit="contain"
        class="portal-sim-login__banner"
      />
      <div class="portal-sim-login__quick-links row wrap q-gutter-xs q-mt-sm">
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          icon="public"
          label="Site CNPS"
          class="portal-sim-login__chip-btn"
          href="http://www.cnps.cm"
          target="_blank"
          rel="noopener noreferrer"
          tag="a"
        />
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          icon="fact_check"
          label="Vérifier immatriculation"
          class="portal-sim-login__chip-btn"
          :to="{ name: 'declarations-home' }"
        />
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          icon="menu_book"
          label="Guide"
          class="portal-sim-login__chip-btn"
          @click="openUserGuide"
        />
      </div>
    </header>

    <header
      class="portal-sim-login__hero"
      :class="{ 'portal-sim-login__hero--compact': isInsured }"
    >
      <div class="portal-sim-login__hero-icon" :class="heroIconClass">
        <q-icon :name="isInsured ? 'health_and_safety' : 'badge'" size="28px" />
      </div>
      <div class="portal-sim-login__hero-text">
        <h1 class="portal-sim-login__title text-primary">{{ spaceTitle }}</h1>
        <p v-if="showHeroLead" class="portal-sim-login__lead">
          {{ t(variantConfig.subtitleKey) }}
        </p>
      </div>
    </header>

    <fieldset class="portal-sim-login__panel">
      <q-form
        ref="formRef"
        :name="isInsured ? 'formulaire' : 'frm'"
        class="portal-sim-login__form"
        @submit.prevent="onSubmit"
      >
        <h2 class="portal-sim-login__form-title text-primary">Connexion</h2>

        <div id="conn1" class="portal-sim-login__fields">
          <!-- Energizer legacy (index.html → userloginmid.jsp) : login, userpassword, password -->
          <template v-if="!isInsured">
            <q-input
              id="login"
              v-model="formulaire.login"
              name="login"
              label="Compte / Login *"
              outlined
              stack-label
              autocomplete="username"
              title="Entrez le Login SVP"
              :disable="loading"
              hide-bottom-space
              class="portal-sim-login__input"
              @keypress="onKeyPress"
            >
              <template #prepend>
                <q-icon name="badge" color="primary" />
              </template>
            </q-input>

            <q-input
              id="userpassword"
              v-model="formulaire.userpassword"
              name="userpassword"
              :type="showPassword ? 'text' : 'password'"
              label="Mot de passe / Password *"
              outlined
              stack-label
              autocomplete="current-password"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              title="Entrez le Mot de Passe"
              :disable="loading"
              hide-bottom-space
              class="portal-sim-login__input portal-sim-login__input--password"
              @keypress="onKeyPress"
            >
              <template #prepend>
                <q-icon name="lock" color="primary" />
              </template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer text-grey-7"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
            <input type="hidden" name="password" :value="passwordHiddenHash" />
          </template>

          <!-- Espace assuré (ConnFile.php) : num_assu, mot2passe -->
          <template v-else>
            <q-input
              id="num_assu"
              v-model="formulaire.num_assu"
              name="num_assu"
              label="Matricule assuré *"
              outlined
              stack-label
              autocomplete="username"
              title="Saisissez votre matricule assuré"
              :disable="loading"
              hide-bottom-space
              class="portal-sim-login__input"
              @keypress="onKeyPress"
            >
              <template #prepend>
                <q-icon name="badge" color="primary" />
              </template>
            </q-input>

            <q-input
              id="mot2passe"
              v-model="formulaire.mot2passe"
              name="mot2passe"
              :type="showPassword ? 'text' : 'password'"
              label="Mot de passe *"
              outlined
              stack-label
              autocomplete="current-password"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              title="Saisissez votre mot de passe"
              :disable="loading"
              hide-bottom-space
              class="portal-sim-login__input portal-sim-login__input--password"
              @keypress="onKeyPress"
            >
              <template #prepend>
                <q-icon name="lock" color="primary" />
              </template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer text-grey-7"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </template>
        </div>

        <div id="conn2" />

        <div class="portal-sim-login__options-row">
          <q-checkbox
            v-model="formulaire.rememberMe"
            :label="t('home.simLogin.rememberMe')"
            dense
            color="primary"
            keep-color
            class="portal-sim-login__remember text-primary"
            :disable="loading"
          />
          <q-btn
            flat
            no-caps
            color="primary"
            class="portal-sim-login__forgot-btn"
            label="Mot de passe oublié"
            @click="openForgotDialog"
          />
        </div>

        <q-banner
          v-if="authStore.error"
          rounded
          dense
          class="portal-sim-login__error"
        >
          <template #avatar>
            <q-icon name="error_outline" color="negative" />
          </template>
          {{ authStore.error }}
        </q-banner>

        <div class="portal-sim-login__actions">
          <q-btn
            type="submit"
            color="primary"
            unelevated
            no-caps
            rounded
            class="portal-sim-login__submit full-width"
            :loading="loading"
            label="Se connecter"
          />
        </div>

        <div v-if="isInsured" class="portal-sim-login__signup-row">
          <q-btn
            flat
            no-caps
            color="primary"
            label="Créer votre compte"
            class="portal-sim-login__signup-btn"
            @click="goCreateAccount"
          />
        </div>
      </q-form>
    </fieldset>

    <q-dialog v-model="forgotDialog.open" persistent>
      <q-card class="portal-sim-login__dialog">
        <q-card-section class="portal-sim-login__dialog-head row items-center no-wrap">
          <q-avatar
            icon="lock_reset"
            color="primary"
            text-color="white"
            size="48px"
          />
          <div class="q-ml-md col">
            <div class="text-h6 text-weight-bold">Réinitialisation du mot de passe</div>
            <div class="text-caption text-grey-7">
              Indiquez votre matricule assuré
            </div>
          </div>
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            :disable="forgotLoading"
          />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form ref="forgotFormRef" @submit.prevent="onForgotSubmit">
            <q-input
              id="forgot_num_assu"
              v-model="forgotDialog.num_assu"
              name="num_assu"
              label="Matricule assuré *"
              outlined
              stack-label
              :disable="forgotLoading"
              :rules="[(v) => !!v?.trim() || 'Champ obligatoire']"
              lazy-rules
              autofocus
            >
              <template #prepend>
                <q-icon name="badge" color="primary" />
              </template>
            </q-input>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            flat
            no-caps
            label="Annuler"
            color="grey-8"
            :disable="forgotLoading"
            v-close-popup
          />
          <q-btn
            unelevated
            no-caps
            rounded
            color="primary"
            icon="send"
            :loading="forgotLoading"
            label="Envoyer"
            @click="onForgotSubmit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/modules/shared/stores/authStore.js'
import { controleChamps, validateKey } from 'src/modules/shared/utils/diversFonctions.js'
import { calcMD5 } from 'src/modules/shared/utils/md5.js'

/**
 * Connexion portail CNPS.
 * - variant agent (Energizer) : champs JSP index.html — `login`, `userpassword`, `password` (hidden, MD5).
 * - variant insured (assuré) : ConnFile.php — `num_assu`, `mot2passe`, formulaire `formulaire`.
 */
const props = defineProps({
  variant: {
    type: String,
    default: 'insured',
    validator: (v) => ['agent', 'insured'].includes(v),
  },
  embedded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['authenticated'])

const { t } = useI18n()
const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const { loading, forgotLoading } = storeToRefs(authStore)

const formRef = ref(null)
const forgotFormRef = ref(null)
const showPassword = ref(false)

const REMEMBER_KEY = 'portal-sim-remember-me'
const NUM_ASSU_KEY = 'portal-sim-num_assu'
const LOGIN_KEY = 'portal-sim-login'

const formulaire = reactive({
  login: '',
  userpassword: '',
  num_assu: '',
  mot2passe: '',
  rememberMe: true,
})

/** Hash MD5 envoyé dans le champ caché `password` (comme securepass.js → userloginmid.jsp). */
const passwordHiddenHash = computed(() =>
  formulaire.userpassword ? calcMD5(formulaire.userpassword) : '',
)

const forgotDialog = reactive({
  open: false,
  num_assu: '',
})

const isInsured = computed(() => props.variant === 'insured')
const cardModifier = computed(() => `portal-sim-login--${props.variant}`)
const showLegacyHeader = computed(() => isInsured.value && !props.embedded)

const spaceTitle = computed(() =>
  isInsured.value ? 'ESPACE ASSURE' : t('home.simLogin.agentTitle'),
)

const showHeroLead = computed(() => !isInsured.value)

const heroIconClass = computed(() =>
  isInsured.value ? 'portal-sim-login__hero-icon--insured' : 'portal-sim-login__hero-icon--agent',
)

const variantConfig = computed(() =>
  props.variant === 'agent'
    ? { subtitleKey: 'home.simLogin.agentSubtitle' }
    : { subtitleKey: 'home.simLogin.insuredSubtitle' },
)

const bannerSrc = computed(() => {
  try {
    return new URL('pics/cnpsBanner.gif', import.meta.env.BASE_URL).href
  } catch {
    return null
  }
})

function onKeyPress(event) {
  validateKey(event)
}

function restoreRememberedMatricule() {
  if (typeof localStorage === 'undefined') return
  if (localStorage.getItem(REMEMBER_KEY) !== 'true') return
  formulaire.rememberMe = true
  if (isInsured.value) {
    const saved = localStorage.getItem(NUM_ASSU_KEY)
    if (saved) formulaire.num_assu = saved
  } else {
    const saved = localStorage.getItem(LOGIN_KEY)
    if (saved) formulaire.login = saved
  }
}

function persistRememberedMatricule() {
  if (typeof localStorage === 'undefined') return
  if (formulaire.rememberMe) {
    localStorage.setItem(REMEMBER_KEY, 'true')
    if (isInsured.value) {
      localStorage.setItem(NUM_ASSU_KEY, formulaire.num_assu.trim())
    } else {
      localStorage.setItem(LOGIN_KEY, formulaire.login.trim())
    }
  } else {
    localStorage.removeItem(REMEMBER_KEY)
    localStorage.removeItem(NUM_ASSU_KEY)
    localStorage.removeItem(LOGIN_KEY)
  }
}

function loginCredentials() {
  if (isInsured.value) {
    return {
      login: formulaire.num_assu.trim(),
      password: formulaire.mot2passe,
    }
  }
  return {
    login: formulaire.login.trim(),
    password: formulaire.userpassword,
  }
}

function initMatomo() {
  if (typeof window === 'undefined' || !isInsured.value) return
  const _paq = (window._paq = window._paq || [])
  _paq.push(['trackPageView'])
  _paq.push(['enableLinkTracking'])
  const u = '//analytics.cnps.cm/'
  _paq.push(['setTrackerUrl', `${u}matomo.php`])
  _paq.push(['setSiteId', '6'])
  if (document.querySelector('script[data-matomo-cnps]')) return
  const g = document.createElement('script')
  g.async = true
  g.src = `${u}matomo.js`
  g.setAttribute('data-matomo-cnps', '6')
  const s = document.getElementsByTagName('script')[0]
  s?.parentNode?.insertBefore(g, s)
}

onMounted(() => {
  initMatomo()
  restoreRememberedMatricule()
})

function openUserGuide() {
  const guideUrl = new URL(
    'Guide_utilisateur_client_CHDS.pdf',
    import.meta.env.BASE_URL,
  ).href
  window.open(guideUrl, '_blank', 'noopener,noreferrer')
}

function goCreateAccount() {
  router.push({ name: 'declarations-home', query: { op: 'create' } })
}

async function onSubmit() {
  const creds = loginCredentials()
  if (!controleChamps(isInsured.value
    ? { num_assu: creds.login, mot2passe: creds.password }
    : { login: creds.login, userpassword: creds.password })) {
    return
  }

  authStore.error = null

  try {
    const result = await authStore.login({
      variant: props.variant,
      login: creds.login,
      password: creds.password,
    })

    $q.notify({
      type: 'positive',
      message: `Bienvenue ${result.user.displayName}`,
      timeout: 1800,
      position: 'top',
    })

    if (isInsured.value) {
      formulaire.mot2passe = ''
    } else {
      formulaire.userpassword = ''
    }
    showPassword.value = false
    persistRememberedMatricule()

    emit('authenticated', {
      login: result.user.login,
      num_assu: isInsured.value ? formulaire.num_assu.trim() : undefined,
      displayName: result.user.displayName,
      profile: result.user.profile,
      token: result.token,
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err?.message || t('home.simLogin.invalidCredentials'),
      timeout: 3500,
      position: 'top',
    })
  }
}

function openForgotDialog() {
  forgotDialog.num_assu = formulaire.num_assu || ''
  forgotDialog.open = true
}

async function onForgotSubmit() {
  const valid = await forgotFormRef.value?.validate()
  if (!valid) return

  try {
    const result = await authStore.requestPasswordReset({
      login: forgotDialog.num_assu.trim(),
      variant: props.variant,
    })

    $q.notify({
      type: 'positive',
      message:
        result.message ||
        'Si un compte existe pour ce matricule, un email a été envoyé avec les instructions.',
      timeout: 4500,
      position: 'top',
      multiLine: true,
    })

    forgotDialog.open = false
    forgotDialog.num_assu = ''
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err?.message || t('home.simLogin.forgot.error'),
      timeout: 4500,
      position: 'top',
    })
  }
}
</script>

<style scoped>
.portal-sim-login {
  --psl-accent: #1565c0;
  --psl-accent-soft: #e3f2fd;
  --psl-surface: #ffffff;
  --psl-muted: #64748b;
  --psl-radius: 16px;
  --psl-pad-x: clamp(0.75rem, 4vw, 1.35rem);
  --psl-pad-y: clamp(0.85rem, 3vw, 1.25rem);

  box-sizing: border-box;
  width: 100%;
  max-width: min(420px, 100%);
  padding: var(--psl-pad-y) var(--psl-pad-x) 1rem;
  border-radius: var(--psl-radius);
  background: var(--psl-surface);
  border: 1px solid rgba(21, 101, 192, 0.08);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 40px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.portal-sim-login--insured {
  --psl-accent: #3949ab;
  --psl-accent-soft: #e8eaf6;
}

.portal-sim-login--agent {
  --psl-accent: #1565c0;
}

.portal-sim-login__top-bar {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.portal-sim-login__banner {
  max-height: 56px;
  border-radius: 8px;
}

.portal-sim-login__chip-btn {
  border-radius: 999px;
  background: var(--psl-accent-soft);
  color: var(--psl-accent);
  font-size: 0.72rem;
  font-weight: 600;
}

.portal-sim-login__quick-links {
  width: 100%;
}

.portal-sim-login__hero {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 2vw, 0.75rem);
  min-width: 0;
}

.portal-sim-login__hero-icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--psl-accent-soft);
  color: var(--psl-accent);
}

.portal-sim-login__hero-icon--insured {
  background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%);
  color: #3949ab;
}

.portal-sim-login__hero-icon--agent {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
}

.portal-sim-login__hero--compact {
  justify-content: center;
  text-align: center;
  padding-bottom: 0.15rem;
}

.portal-sim-login__hero--compact .portal-sim-login__hero-text {
  flex: 0 1 auto;
}

.portal-sim-login__hero-text {
  min-width: 0;
  flex: 1;
}

.portal-sim-login__title {
  margin: 0;
  font-size: clamp(1.05rem, 4.5vw, 1.2rem);
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.25;
  word-break: break-word;
}

.portal-sim-login__lead {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  line-height: 1.45;
  color: var(--psl-muted);
}

.portal-sim-login__panel {
  border: none;
  margin: clamp(0.5rem, 2vw, 0.75rem) 0 0;
  padding: 0;
  min-width: 0;
  width: 100%;
}

.portal-sim-login__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.95rem;
}

.portal-sim-login__form-title {
  margin: 0 0 0.35rem;
  padding-top: 0.15rem;
  font-size: clamp(1rem, 3.5vw, 1.1rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  text-align: center;
  line-height: 1.3;
}

.portal-sim-login__fields {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.portal-sim-login__input :deep(.q-field__label) {
  font-size: 0.95rem;
}

.portal-sim-login__input :deep(.q-field__native),
.portal-sim-login__input :deep(input) {
  font-size: 1rem;
}

.portal-sim-login__input--password :deep(.q-field__native),
.portal-sim-login__input--password :deep(.q-field__input),
.portal-sim-login__input--password :deep(input) {
  text-transform: none;
}

.portal-sim-login__input {
  width: 100%;
}

.portal-sim-login__input :deep(.q-field__control) {
  border-radius: 12px;
  background: #f8fafc;
  min-height: clamp(44px, 12vw, 50px);
}

.portal-sim-login__input :deep(.q-field--focused .q-field__control) {
  background: #fff;
}

.portal-sim-login__options-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 0.75rem;
  margin-top: -0.1rem;
  width: 100%;
}

.portal-sim-login__remember {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
}

.portal-sim-login__remember :deep(.q-checkbox__label) {
  white-space: normal;
  line-height: 1.25;
}

.portal-sim-login__forgot-btn {
  flex: 0 1 auto;
  max-width: 100%;
  text-align: right;
}

.portal-sim-login__remember :deep(.q-checkbox__label) {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--q-primary) !important;
}

.portal-sim-login__remember :deep(.q-checkbox__inner) {
  color: var(--q-primary);
}

.portal-sim-login__forgot-btn :deep(.q-btn__content) {
  font-weight: 600;
  font-size: clamp(0.82rem, 2.8vw, 0.92rem);
  line-height: 1.2;
  white-space: normal;
  text-align: right;
}

.portal-sim-login__forgot-btn {
  min-height: 36px;
  padding: 0 0.25rem;
}

.portal-sim-login__error {
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #b91c1c;
  font-size: 0.92rem;
}

.portal-sim-login__actions {
  margin-top: 0.1rem;
}

.portal-sim-login__submit {
  font-weight: 700;
  font-size: 0.95rem;
  min-height: 40px;
  padding: 0 0.75rem;
  box-shadow: 0 4px 14px rgba(21, 101, 192, 0.2);
}

.portal-sim-login__submit :deep(.q-btn__content) {
  font-size: 0.95rem;
}

.portal-sim-login--insured .portal-sim-login__submit {
  box-shadow: 0 4px 14px rgba(57, 73, 171, 0.2);
}

.portal-sim-login__signup-row {
  display: flex;
  justify-content: center;
  padding-top: 0.5rem;
  margin-top: 0.15rem;
  border-top: 1px solid rgba(148, 163, 184, 0.22);
}

.portal-sim-login__signup-btn {
  font-weight: 700;
  font-size: 0.95rem;
  min-height: 38px;
  padding: 0 0.5rem;
  border: none !important;
  box-shadow: none !important;
}

.portal-sim-login__signup-btn::before {
  border: none !important;
}

.portal-sim-login__signup-btn :deep(.q-btn__content) {
  font-size: 0.95rem;
}

.portal-sim-login__dialog {
  width: min(440px, calc(100vw - 1.5rem));
  max-width: 100%;
  border-radius: var(--psl-radius);
  overflow: hidden;
}

.portal-sim-login__dialog-head {
  padding: 1rem 1.15rem 0.85rem;
  background: linear-gradient(180deg, var(--psl-accent-soft) 0%, #fff 100%);
}

/* Mode plein panneau (pages login) */
.portal-sim-login--embedded {
  max-width: none;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: 0;
  gap: 0;
  border: none;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}

.portal-sim-login--embedded .portal-sim-login__hero {
  flex-shrink: 0;
  padding: 0.85rem 1.15rem 0.5rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, transparent 100%);
}

.portal-sim-login--embedded .portal-sim-login__panel {
  flex: 1 1 auto;
  min-height: 0;
  margin: clamp(0.35rem, 2vw, 0.5rem) clamp(0.5rem, 3vw, 0.85rem) 0;
  padding: clamp(0.85rem, 3vw, 1rem) clamp(0.75rem, 3vw, 1.1rem)
    clamp(1rem, 3vw, 1.1rem);
  border-radius: var(--psl-radius);
  background: var(--psl-surface);
  border: 1px solid rgba(21, 101, 192, 0.1);
  box-shadow: 0 8px 28px rgba(13, 71, 161, 0.08);
}

.portal-sim-login--embedded .portal-sim-login__form {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Tablettes et petits écrans */
@media (max-width: 768px) {
  .portal-sim-login__hero-icon {
    width: 46px;
    height: 46px;
    border-radius: 12px;
  }

  .portal-sim-login__input :deep(.q-field__label),
  .portal-sim-login__input :deep(.q-field__native),
  .portal-sim-login__input :deep(input) {
    font-size: 16px; /* évite le zoom auto sur iOS */
  }
}

/* Mobile étroit */
@media (max-width: 480px) {
  .portal-sim-login:not(.portal-sim-login--embedded) {
    max-width: 100%;
    border-radius: 14px;
  }

  .portal-sim-login__hero--compact {
    flex-direction: column;
    gap: 0.4rem;
  }

  .portal-sim-login__options-row {
    flex-direction: column;
    align-items: stretch;
  }

  .portal-sim-login__forgot-btn {
    align-self: stretch;
    justify-content: flex-end;
  }

  .portal-sim-login__chip-btn :deep(.q-btn__content) {
    font-size: 0.68rem;
  }

  .portal-sim-login--embedded .portal-sim-login__hero {
    padding: 0.65rem 0.75rem 0.35rem;
  }
}

/* Très petits écrans */
@media (max-width: 360px) {
  .portal-sim-login {
    --psl-radius: 12px;
  }

  .portal-sim-login__submit,
  .portal-sim-login__signup-btn {
    min-height: 42px;
  }
}

/* Grands écrans : formulaire autonome centré */
@media (min-width: 1024px) {
  .portal-sim-login:not(.portal-sim-login--embedded) {
    max-width: 420px;
  }
}
</style>

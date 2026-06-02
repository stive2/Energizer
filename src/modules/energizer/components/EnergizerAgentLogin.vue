<template>
  <div class="energizer-agent-login column no-wrap">
    <header class="energizer-agent-login__hero">
      <div class="energizer-agent-login__hero-icon">
        <q-icon name="badge" size="28px" />
      </div>
      <div class="energizer-agent-login__hero-text">
        <h1 class="energizer-agent-login__title text-primary">
          {{ t('home.simLogin.agentTitle') }}
        </h1>
        <p class="energizer-agent-login__lead">
          {{ t('home.simLogin.agentSubtitle') }}
        </p>
      </div>
    </header>

    <fieldset class="energizer-agent-login__panel">
      <q-form
        ref="formRef"
        name="frm"
        class="energizer-agent-login__form"
        greedy
        @submit.prevent="onSubmit"
      >
        <q-input
          id="login"
          v-model="formulaire.login"
          name="login"
          label="Compte / Login *"
          outlined
          stack-label
          dense
          autocomplete="username"
          :disable="loading"
          hide-bottom-space
          class="energizer-agent-login__input"
          :rules="[(v) => !!String(v || '').trim() || 'Entrez le login SVP']"
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
          dense
          autocomplete="current-password"
          :disable="loading"
          hide-bottom-space
          class="energizer-agent-login__input q-mt-sm"
          :rules="[(v) => !!String(v || '').trim() || 'Entrez le mot de passe']"
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

        <q-checkbox
          v-model="formulaire.rememberMe"
          :label="t('home.simLogin.rememberMe')"
          dense
          color="primary"
          keep-color
          class="energizer-agent-login__remember text-primary q-mt-md"
          :disable="loading"
        />

        <q-banner
          v-if="authStore.error"
          rounded
          dense
          class="energizer-agent-login__error q-mt-sm"
        >
          <template #avatar>
            <q-icon name="error_outline" color="negative" />
          </template>
          {{ authStore.error }}
        </q-banner>

        <q-btn
          type="submit"
          color="primary"
          unelevated
          no-caps
          rounded
          class="energizer-agent-login__submit full-width q-mt-md"
          :loading="loading"
          label="Se connecter"
        />
      </q-form>
    </fieldset>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/modules/shared/stores/authStore.js'
import { validateKey } from 'src/modules/shared/utils/diversFonctions.js'
import { calcMD5 } from 'src/modules/shared/utils/md5.js'
import { persistAgentSession } from 'src/modules/shared/utils/portalSimAuthSession.js'
import { useEnergizerSessionStore } from 'src/modules/energizer/stores/energizerSessionStore.js'

const emit = defineEmits(['authenticated'])

const { t } = useI18n()
const $q = useQuasar()
const authStore = useAuthStore()
const energizerSession = useEnergizerSessionStore()
const { loading } = storeToRefs(authStore)

const formRef = ref(null)
const showPassword = ref(false)

const REMEMBER_KEY = 'portal-sim-remember-me'
const LOGIN_KEY = 'portal-sim-login'

const formulaire = reactive({
  login: '',
  userpassword: '',
  rememberMe: true,
})

const passwordHiddenHash = computed(() =>
  formulaire.userpassword ? calcMD5(formulaire.userpassword) : '',
)

function onKeyPress(event) {
  validateKey(event)
}

function restoreRememberedLogin() {
  if (typeof localStorage === 'undefined') return
  if (localStorage.getItem(REMEMBER_KEY) !== 'true') return
  formulaire.rememberMe = true
  const saved = localStorage.getItem(LOGIN_KEY)
  if (saved) formulaire.login = saved
}

function persistRememberedLogin() {
  if (typeof localStorage === 'undefined') return
  if (formulaire.rememberMe) {
    localStorage.setItem(REMEMBER_KEY, 'true')
    localStorage.setItem(LOGIN_KEY, formulaire.login.trim())
  } else {
    localStorage.removeItem(REMEMBER_KEY)
    localStorage.removeItem(LOGIN_KEY)
  }
}

onMounted(() => {
  restoreRememberedLogin()
})

async function onSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  authStore.error = null

  try {
    const result = await authStore.login({
      variant: 'agent',
      login: formulaire.login.trim(),
      password: formulaire.userpassword,
    })

    if (result.pagePrincipaleHtml) {
      energizerSession.applyFromHtml(result.pagePrincipaleHtml)
    } else if (result.pagePrincipale) {
      energizerSession.pagePrincipale = result.pagePrincipale
    }

    persistAgentSession({
      login: result.user.login,
      displayName: result.user.displayName,
      prenom: result.user.prenom,
      nom: result.user.nom,
      profile: result.user.profile,
      token: result.token,
      lib_centre: result.user.lib_centre,
      code_centre: result.user.code_centre,
    })

    $q.notify({
      type: 'positive',
      message: `Bienvenue ${result.user.displayName}`,
      timeout: 1800,
      position: 'top',
    })

    formulaire.userpassword = ''
    showPassword.value = false
    persistRememberedLogin()

    emit('authenticated', {
      login: result.user.login,
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
</script>

<style scoped>
.energizer-agent-login {
  --eal-accent: #1565c0;
  --eal-surface: #ffffff;
  --eal-muted: #64748b;
  --eal-radius: 16px;
  --eal-pad-x: clamp(0.75rem, 4vw, 1.35rem);
  --eal-pad-y: clamp(0.85rem, 3vw, 1.25rem);

  box-sizing: border-box;
  width: 100%;
  max-width: min(420px, 100%);
  margin: 0 auto;
  padding: var(--eal-pad-y) var(--eal-pad-x) 1rem;
}

.energizer-agent-login__hero {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.energizer-agent-login__hero-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: var(--eal-accent);
}

.energizer-agent-login__title {
  margin: 0;
  font-size: clamp(1.05rem, 2.5vw, 1.2rem);
  font-weight: 700;
  line-height: 1.25;
}

.energizer-agent-login__lead {
  margin: 0.35rem 0 0;
  font-size: 0.82rem;
  color: var(--eal-muted);
  line-height: 1.4;
}

.energizer-agent-login__panel {
  border: none;
  margin: 0;
  padding: 0;
  min-width: 0;
}

.energizer-agent-login__panel {
  background: var(--eal-surface);
  border-radius: var(--eal-radius);
  box-shadow: 0 8px 28px rgba(21, 101, 192, 0.1);
  padding: 1rem 1rem 1.15rem;
}

.energizer-agent-login__submit {
  font-weight: 600;
  letter-spacing: 0.02em;
  min-height: 44px;
}

.energizer-agent-login__error {
  background: #ffebee;
  color: #b71c1c;
}

.energizer-agent-login__remember :deep(.q-checkbox__label) {
  font-size: 0.8rem;
}
</style>

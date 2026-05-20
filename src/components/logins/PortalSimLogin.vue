<template>
  <q-card
    class="portal-sim-login"
    :class="[cardModifier, { 'portal-sim-login--embedded': embedded }]"
    flat
  >
    <!-- Bandeau / Header -->
    <header class="portal-sim-login__header">

      <h1 class="portal-sim-login__title text-center text-primary">
        {{ t(variantConfig.titleKey) }}
      </h1>

      <p v-if="embedded" class="portal-sim-login__subtitle text-center">
        {{ t(variantConfig.subtitleKey) }}
      </p>

    </header>

    <!-- Formulaire principal -->
    <q-form ref="formRef" class="portal-sim-login__form" @submit.prevent="onSubmit">
      <q-input
        v-model="form.login"
        :label="t('home.simLogin.accountLabel')"
        outlined
        dense
        autocomplete="username"
        :disable="loading"
        :rules="[(v) => !!v?.trim() || t('home.simLogin.required')]"
        lazy-rules
        clearable
        class="portal-sim-login__input"
        @keypress="onKeyPress"
      >
        <template #prepend>
          <q-icon name="person" />
        </template>
      </q-input>

      <q-input
        v-model="form.password"
        :label="t('home.simLogin.passwordLabel')"
        outlined
        dense
        :type="showPassword ? 'text' : 'password'"
        autocomplete="current-password"
        :disable="loading"
        :rules="[(v) => !!v || t('home.simLogin.required')]"
        lazy-rules
        class="portal-sim-login__input"
        @keypress="onKeyPress"
      >
        <template #prepend>
          <q-icon name="lock" />
        </template>
        <template #append>
          <q-icon
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            :aria-label="
              showPassword ? t('home.simLogin.hidePassword') : t('home.simLogin.showPassword')
            "
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <div
        class="portal-sim-login__row"
        :class="{ 'portal-sim-login__row--solo': embedded }"
      >
        <q-checkbox
          v-if="!embedded"
          v-model="form.rememberMe"
          :label="t('home.simLogin.rememberMe')"
          :disable="loading"
          dense
          class="portal-sim-login__remember"
        />
        <q-btn
          flat
          dense
          no-caps
          color="primary"
          class="portal-sim-login__forgot-btn"
          :label="t('home.simLogin.forgot.link')"
          :disable="loading"
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
          <q-icon name="error" color="negative" size="20px" />
        </template>
        {{ authStore.error }}
      </q-banner>

      <q-btn
        type="submit"
        :label="t('home.simLogin.submit')"
        color="primary"
        unelevated
        no-caps
        rounded
        size="md"
        :loading="loading"
        class="portal-sim-login__submit"
      >
        <template #loading>
          <q-spinner-dots color="white" />
        </template>
      </q-btn>
    </q-form>

    <!-- Pied de carte -->
    <footer class="portal-sim-login__footer">
      <q-icon name="shield" size="14px" class="q-mr-xs" />
      <span>{{ t('home.simLogin.brand') }}</span>
      <span class="portal-sim-login__footer-sep">·</span>
      <span>{{ t('home.simLogin.brandTagline') }}</span>
    </footer>

    <!-- Dialogue : mot de passe oublié -->
    <q-dialog v-model="forgotDialog.open" persistent>
      <q-card class="portal-sim-login__forgot-card">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar icon="lock_reset" color="primary" text-color="white" />
          <div class="q-ml-md">
            <div class="text-h6">{{ t('home.simLogin.forgot.title') }}</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup :disable="forgotLoading" />
        </q-card-section>

        <q-card-section class="text-body2 text-grey-8">
          {{ t('home.simLogin.forgot.instructions') }}
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form ref="forgotFormRef" @submit.prevent="onForgotSubmit">
            <q-input
              v-model="forgotDialog.login"
              :label="t('home.simLogin.forgot.emailLabel')"
              outlined
              dense
              autocomplete="username"
              :disable="forgotLoading"
              :rules="[(v) => !!v?.trim() || t('home.simLogin.forgot.emailRequired')]"
              lazy-rules
              autofocus
            >
              <template #prepend>
                <q-icon name="mail" />
              </template>
            </q-input>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn
            flat
            no-caps
            :label="t('home.simLogin.forgot.cancel')"
            color="grey-8"
            :disable="forgotLoading"
            v-close-popup
          />
          <q-btn
            unelevated
            no-caps
            color="primary"
            :loading="forgotLoading"
            :label="t('home.simLogin.forgot.submit')"
            @click="onForgotSubmit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/authStore.js'

/**
 * Composant de connexion portail (variantes agent / assuré).
 *
 * @prop variant 'agent' (interne) ou 'insured' (externe). Par défaut : 'insured'.
 * @prop embedded Plein panneau (page login module) : pas de carte flottante.
 * @emits authenticated Émis après authentification réussie avec
 *        `{ login, displayName, profile, token }`.
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
const authStore = useAuthStore()
const { loading, forgotLoading } = storeToRefs(authStore)

const formRef = ref(null)
const forgotFormRef = ref(null)
const showPassword = ref(false)

const form = reactive({
  login: '',
  password: '',
  rememberMe: true,
})

const forgotDialog = reactive({
  open: false,
  login: '',
})

const variantConfig = computed(() =>
  props.variant === 'agent'
    ? {
        icon: 'badge',
        badgeLabel: 'Portail CNPS — Accès agent',
        titleKey: 'home.simLogin.agentTitle',
        subtitleKey: 'home.simLogin.agentSubtitle',
      }
    : {
        icon: 'person',
        badgeLabel: 'Portail CNPS — Accès assuré',
        titleKey: 'home.simLogin.insuredTitle',
        subtitleKey: 'home.simLogin.insuredSubtitle',
      },
)

const cardModifier = computed(() => `portal-sim-login--${props.variant}`)

const VALID_KEYS_RE = /[\w@. -]/
// eslint-disable-next-line no-control-regex
const SPECIAL_KEYS_RE = /[\x08\x0d]/

/**
 * Reprise du contrôle clavier de l'ancienne page Sapelli : refuse les
 * caractères incompatibles côté login (préserve l'ergonomie historique).
 */
function onKeyPress(event) {
  const key = event.key ?? String.fromCharCode(event.which || event.keyCode)
  const isValid = VALID_KEYS_RE.test(key) || SPECIAL_KEYS_RE.test(key)
  if (!isValid) {
    event.preventDefault()
    $q.notify({
      type: 'warning',
      message: t('home.simLogin.invalidChar'),
      timeout: 1500,
      position: 'top',
    })
  }
}

async function onSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    const result = await authStore.login({
      variant: props.variant,
      login: form.login.trim(),
      password: form.password,
    })

    $q.notify({
      type: 'positive',
      message: `Bienvenue ${result.user.displayName}`,
      timeout: 1800,
      position: 'top',
    })

    form.password = ''

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

function openForgotDialog() {
  forgotDialog.login = form.login || ''
  forgotDialog.open = true
}

async function onForgotSubmit() {
  const valid = await forgotFormRef.value?.validate()
  if (!valid) return

  try {
    const result = await authStore.requestPasswordReset({
      login: forgotDialog.login.trim(),
      variant: props.variant,
    })

    $q.notify({
      type: 'positive',
      message: result.message || t('home.simLogin.forgot.successMessage'),
      timeout: 4500,
      position: 'top',
      multiLine: true,
    })

    forgotDialog.open = false
    forgotDialog.login = ''
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
  width: 100%;
  max-width: 440px;
  padding: 1.5rem 1.5rem 1.25rem;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 250, 254, 0.98) 100%);
  box-shadow:
    0 4px 6px rgba(15, 23, 42, 0.04),
    0 14px 42px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(226, 232, 240, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.portal-sim-login--agent {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(239, 246, 255, 0.98) 100%);
}

.portal-sim-login__header {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.portal-sim-login__badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(25, 118, 210, 0.1);
  border: 1px solid rgba(25, 118, 210, 0.22);
  color: #1565c0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.portal-sim-login--insured .portal-sim-login__badge {
  background: rgba(57, 73, 171, 0.1);
  border-color: rgba(57, 73, 171, 0.22);
  color: #3949ab;
}

.portal-sim-login__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.portal-sim-login__subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.45;
}

.portal-sim-login__form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.portal-sim-login__input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 10px;
}

.portal-sim-login__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -4px;
  flex-wrap: wrap;
  gap: 4px;
}

.portal-sim-login__row--solo {
  justify-content: flex-end;
  margin-top: 0;
}

/* Plein panneau (page login Energizer, etc.) */
.portal-sim-login--embedded {
  width: 100%;
  max-width: none;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: 0;
  gap: 0;
  border-radius: 0;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.portal-sim-login--embedded .portal-sim-login__header {
  flex-shrink: 0;
  gap: 0.25rem;
  padding: 1rem 1.25rem 0.85rem;
  background: linear-gradient(180deg, #e8f4fc 0%, #f8fcff 100%);
  border-bottom: 1px solid rgba(21, 101, 192, 0.1);
}

.portal-sim-login--embedded .portal-sim-login__title {
  font-size: 1.15rem;
  color: #0d47a1;
}

.portal-sim-login--embedded .portal-sim-login__subtitle {
  margin: 0;
  font-size: 0.78rem;
  color: #546e7a;
  line-height: 1.35;
}

.portal-sim-login--embedded .portal-sim-login__form {
  flex: 0 0 auto;
  margin: 0 0.85rem;
  padding: 0.85rem 0.9rem 0.65rem;
  gap: 0.6rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(21, 101, 192, 0.1);
  box-shadow: 0 4px 16px rgba(13, 71, 161, 0.06);
}

.portal-sim-login--embedded .portal-sim-login__input :deep(.q-field__control) {
  background: #fff;
  border-radius: 10px;
  min-height: 44px;
}

.portal-sim-login--embedded .portal-sim-login__submit {
  margin-top: 0.25rem;
  width: 100%;
  padding: 11px 16px;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(25, 118, 210, 0.22);
}

.portal-sim-login--embedded .portal-sim-login__footer {
  flex-shrink: 0;
  margin-top: 0.5rem;
  padding: 0.65rem 1rem;
  border-top: 1px solid rgba(21, 101, 192, 0.08);
  background: rgba(232, 244, 252, 0.65);
  font-size: 0.68rem;
  flex-wrap: wrap;
  text-align: center;
  line-height: 1.35;
}


.portal-sim-login__remember :deep(.q-checkbox__label) {
  font-size: 0.8rem;
  color: #475569;
}

.portal-sim-login__forgot-btn {
  font-size: 0.8rem;
  font-weight: 600;
}

.portal-sim-login__error {
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.07);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #b91c1c;
  font-size: 0.85rem;
}

.portal-sim-login__submit {
  margin-top: 0.5rem;
  padding: 10px 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.25);
}

.portal-sim-login__submit :deep(.q-btn__content) {
  font-size: 0.95rem;
}

.portal-sim-login__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #64748b;
  padding-top: 4px;
  border-top: 1px dashed rgba(148, 163, 184, 0.4);
  margin-top: 4px;
}

.portal-sim-login__footer-sep {
  opacity: 0.6;
}

/* Dialogue mot de passe oublié */
.portal-sim-login__forgot-card {
  width: 100%;
  max-width: 460px;
  border-radius: 16px;
}

/* Responsive */
@media (max-width: 480px) {
  .portal-sim-login {
    padding: 1.2rem 1rem 1rem;
    max-width: 100%;
    border-radius: 14px;
  }

  .portal-sim-login__title {
    font-size: 1.2rem;
  }
}
</style>

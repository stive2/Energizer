<template>
  <q-card flat bordered class="portal-sim-login q-pa-none">
    <q-card-section class="bg-primary text-white q-py-md">
      <div class="text-h6 text-weight-bold">{{ t(titleKey) }}</div>
      <div class="text-caption text-white" style="opacity: 0.92">{{ t(subtitleKey) }}</div>
    </q-card-section>

    <q-card-section>
      <q-btn-toggle
        v-if="showProfileToggle"
        v-model="activeProfile"
        spread
        no-caps
        dense
        unelevated
        toggle-color="primary"
        color="grey-3"
        text-color="grey-9"
        :options="profileOptions"
        class="full-width q-mb-md"
      />

      <q-banner dense rounded class="bg-blue-1 text-grey-9 q-mb-md">
        <template #avatar>
          <q-icon name="info" color="primary" />
        </template>
        <div class="text-weight-medium q-mb-xs">{{ t('home.simLogin.demoBannerTitle') }}</div>
        <template v-if="variant === 'portal'">
          <div class="text-caption">{{ t('home.simLogin.demoBannerExternal') }}</div>
          <div class="text-caption q-mt-xs">{{ t('home.simLogin.demoBannerInternal') }}</div>
        </template>
        <div v-else-if="variant === 'agent'" class="text-caption">
          {{ t('home.simLogin.demoBannerInternal') }}
        </div>
        <div v-else class="text-caption">{{ t('home.simLogin.demoBannerExternal') }}</div>
      </q-banner>

      <q-form class="q-gutter-sm" @submit.prevent="submit">
        <q-input
          v-model="formLogin"
          outlined
          dense
          type="email"
          autocomplete="username"
          :label="t('home.simLogin.fieldLogin')"
          :rules="[(v) => !!v || t('home.simLogin.required')]"
        />
        <q-input
          v-model="formPassword"
          outlined
          dense
          type="password"
          autocomplete="current-password"
          :label="t('home.simLogin.fieldPassword')"
          :rules="[(v) => !!v || t('home.simLogin.required')]"
        />

        <q-slide-transition>
          <div v-if="errorMsg" class="text-negative text-caption q-mb-sm">{{ errorMsg }}</div>
        </q-slide-transition>

        <q-btn
          type="submit"
          color="primary"
          class="full-width"
          no-caps
          :label="t('home.simLogin.submit')"
          :loading="loading"
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  SIM_PORTAL_EXTERNAL,
  SIM_PORTAL_INTERNAL,
  validateSimPortalCredentials,
} from 'src/constants/simPortalAuth.js'

const emit = defineEmits(['authenticated'])

const props = defineProps({
  /** portal: les deux profils | agent: agent CNPS uniquement | insured: assuré uniquement */
  variant: {
    type: String,
    default: 'portal',
    validator: (v) => ['portal', 'agent', 'insured'].includes(v),
  },
})

const { t } = useI18n()

const titleKey = computed(() =>
  props.variant === 'agent'
    ? 'modules.energizer.loginTitle'
    : props.variant === 'insured'
      ? 'modules.assure.loginTitle'
      : 'home.simLogin.title',
)

const subtitleKey = computed(() =>
  props.variant === 'agent'
    ? 'modules.energizer.loginSubtitle'
    : props.variant === 'insured'
      ? 'modules.assure.loginSubtitle'
      : 'home.simLogin.subtitle',
)

const showProfileToggle = computed(() => props.variant === 'portal')

const defaultProfile = computed(() =>
  props.variant === 'agent' ? 'internal' : props.variant === 'insured' ? 'external' : 'external',
)

const activeProfile = ref(defaultProfile.value)
const formLogin = ref(
  defaultProfile.value === 'internal' ? SIM_PORTAL_INTERNAL.login : SIM_PORTAL_EXTERNAL.login,
)
const formPassword = ref(
  defaultProfile.value === 'internal'
    ? SIM_PORTAL_INTERNAL.password
    : SIM_PORTAL_EXTERNAL.password,
)
const errorMsg = ref('')
const loading = ref(false)

const profileOptions = computed(() => [
  { label: t('home.simLogin.tabExternal'), value: 'external' },
  { label: t('home.simLogin.tabInternal'), value: 'internal' },
])

function onProfileTabChange(val) {
  errorMsg.value = ''
  if (val === 'external') {
    formLogin.value = SIM_PORTAL_EXTERNAL.login
    formPassword.value = SIM_PORTAL_EXTERNAL.password
  } else {
    formLogin.value = SIM_PORTAL_INTERNAL.login
    formPassword.value = SIM_PORTAL_INTERNAL.password
  }
}

watch(activeProfile, onProfileTabChange)

watch(
  () => props.variant,
  () => {
    activeProfile.value = defaultProfile.value
    onProfileTabChange(activeProfile.value)
  },
)

function submit() {
  errorMsg.value = ''
  const profile =
    props.variant === 'agent' ? 'internal' : props.variant === 'insured' ? 'external' : activeProfile.value
  if (!validateSimPortalCredentials(profile, formLogin.value, formPassword.value)) {
    errorMsg.value = t('home.simLogin.invalidCredentials')
    return
  }
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
    const spec = profile === 'external' ? SIM_PORTAL_EXTERNAL : SIM_PORTAL_INTERNAL
    emit('authenticated', {
      profile: spec.profile,
      displayName: spec.displayName,
      login: formLogin.value.trim(),
    })
  }, 380)
}
</script>

<style scoped>
.portal-sim-login {
  max-width: 440px;
  width: 100%;
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(13, 71, 161, 0.15);
}
</style>

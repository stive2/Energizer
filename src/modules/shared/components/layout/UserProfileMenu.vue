<template>
  <div class="user-profile-menu">
    <q-btn
      flat
      round
      unelevated
      padding="2px"
      class="profile-avatar-btn"
      :aria-label="profileDisplayName ? t('layout.profile.tabView') + ' — ' + profileDisplayName : t('layout.profile.tabView')"
    >
      <q-avatar size="40px" class="profile-avatar" :class="{ 'profile-avatar--photo': !!photoUrl }">
        <img v-if="photoUrl" :src="photoUrl" alt="" />
        <span v-else class="profile-avatar__initials">{{ userInitials }}</span>
      </q-avatar>
      <q-tooltip>{{ profileDisplayName || t('layout.userUnknown') }}</q-tooltip>

      <q-menu
        anchor="top right"
        self="bottom right"
        :offset="[0, 10]"
        transition-show="jump-up"
        transition-hide="jump-down"
        class="profile-menu-popup"
      >
        <q-card flat class="profile-menu-card">
          <div class="profile-menu-card__header">
            <q-avatar size="64px" class="profile-menu-card__avatar">
              <img v-if="photoUrl" :src="photoUrl" alt="" />
              <span v-else>{{ userInitials }}</span>
            </q-avatar>
            <div class="profile-menu-card__identity">
              <div class="profile-menu-card__name">{{ profileDisplayName || t('layout.userUnknown') }}</div>
              <div class="profile-menu-card__email">{{ profileEmail }}</div>
              <q-badge color="white" text-color="primary" class="profile-menu-card__badge">
                {{ t('layout.profile.agentBadge') }}
              </q-badge>
            </div>
          </div>

          <q-tabs
            v-model="activeTab"
            dense
            no-caps
            align="justify"
            class="profile-menu-card__tabs"
            active-color="primary"
            indicator-color="primary"
          >
            <q-tab name="view" :label="t('layout.profile.tabView')" icon="person_outline" />
            <q-tab name="edit" :label="t('layout.profile.tabEdit')" icon="edit_outlined" />
            <q-tab name="password" :label="t('layout.profile.tabPassword')" icon="lock_outline" />
            <q-tab
              v-if="loginHistoryLink"
              name="history"
              :label="t('layout.profile.tabHistory')"
              icon="history"
            />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated class="profile-menu-card__panels">
            <q-tab-panel name="view" class="q-pa-md">
              <div class="profile-field-list">
                <div v-for="field in viewFields" :key="field.key" class="profile-field">
                  <div class="profile-field__label">{{ field.label }}</div>
                  <div class="profile-field__value">{{ field.value || '—' }}</div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="edit" class="q-pa-md">
              <q-form @submit.prevent="saveProfile">
                <q-input
                  v-model="editForm.nom"
                  :label="t('layout.profile.fullName')"
                  outlined
                  dense
                  class="q-mb-sm"
                  :rules="[(v) => !!v || t('layout.profile.required')]"
                />
                <q-input
                  v-model="editForm.email"
                  :label="t('layout.profile.email')"
                  type="email"
                  outlined
                  dense
                  class="q-mb-sm"
                  :rules="[(v) => !!v || t('layout.profile.required')]"
                />
                <q-input
                  v-model="editForm.matricule"
                  :label="t('layout.profile.matricule')"
                  outlined
                  dense
                  class="q-mb-sm"
                />
                <q-input
                  v-model="editForm.agence"
                  :label="t('layout.profile.agency')"
                  outlined
                  dense
                  class="q-mb-sm"
                />
                <q-input
                  v-model="editForm.telephone"
                  :label="t('layout.profile.phone')"
                  outlined
                  dense
                  class="q-mb-md"
                />
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  no-caps
                  class="full-width"
                  :label="t('layout.profile.saveProfile')"
                  :loading="savingProfile"
                />
              </q-form>
            </q-tab-panel>

            <q-tab-panel v-if="loginHistoryLink" name="history" class="q-pa-md">
              <p class="profile-history-lead">{{ t('layout.profile.historyLead') }}</p>
              <q-btn
                color="primary"
                unelevated
                no-caps
                icon="open_in_new"
                class="full-width"
                :label="loginHistoryLink.label || t('layout.profile.openHistory')"
                tag="a"
                :href="loginHistoryLink.href"
                target="_blank"
                rel="noopener noreferrer"
              />
            </q-tab-panel>

            <q-tab-panel name="password" class="q-pa-md">
              <q-form @submit.prevent="savePassword">
                <q-input
                  v-model="passwordForm.current"
                  :label="t('layout.profile.currentPassword')"
                  :type="showCurrent ? 'text' : 'password'"
                  outlined
                  dense
                  class="q-mb-sm"
                  :rules="[(v) => !!v || t('layout.profile.required')]"
                >
                  <template #append>
                    <q-icon
                      :name="showCurrent ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showCurrent = !showCurrent"
                    />
                  </template>
                </q-input>
                <q-input
                  v-model="passwordForm.next"
                  :label="t('layout.profile.newPassword')"
                  :type="showNext ? 'text' : 'password'"
                  outlined
                  dense
                  class="q-mb-sm"
                  :rules="[
                    (v) => !!v || t('layout.profile.required'),
                    (v) => (v && v.length >= 8) || t('layout.profile.passwordMin'),
                  ]"
                >
                  <template #append>
                    <q-icon
                      :name="showNext ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showNext = !showNext"
                    />
                  </template>
                </q-input>
                <q-input
                  v-model="passwordForm.confirm"
                  :label="t('layout.profile.confirmPassword')"
                  :type="showConfirm ? 'text' : 'password'"
                  outlined
                  dense
                  class="q-mb-md"
                  :rules="[
                    (v) => !!v || t('layout.profile.required'),
                    (v) => v === passwordForm.next || t('layout.profile.passwordMismatch'),
                  ]"
                >
                  <template #append>
                    <q-icon
                      :name="showConfirm ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showConfirm = !showConfirm"
                    />
                  </template>
                </q-input>
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  no-caps
                  class="full-width"
                  :label="t('layout.profile.savePassword')"
                  :loading="savingPassword"
                />
              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  displayName: { type: String, default: '' },
  userInitials: { type: String, default: '?' },
  userProfile: { type: Object, default: null },
  persistUserProfile: { type: Function, required: true },
  changeSimPassword: { type: Function, required: true },
  loginHistoryLink: { type: Object, default: null },
})

const $q = useQuasar()
const { t } = useI18n()

const activeTab = ref('view')
const savingProfile = ref(false)
const savingPassword = ref(false)
const showCurrent = ref(false)
const showNext = ref(false)
const showConfirm = ref(false)

const editForm = reactive({
  nom: '',
  email: '',
  matricule: '',
  agence: '',
  telephone: '',
})

const passwordForm = reactive({
  current: '',
  next: '',
  confirm: '',
})

const photoUrl = computed(() => props.userProfile?.photo || props.userProfile?.avatar || '')

const profileEmail = computed(
  () => props.userProfile?.email || props.userProfile?.login || '—',
)

const profileDisplayName = computed(() => {
  const p = props.userProfile
  if (p?.prenom && p?.nom) return `${p.prenom} ${p.nom}`.trim()
  if (props.displayName) return props.displayName.split(/[—–]/)[0].trim()
  return ''
})

const viewFields = computed(() => [
  {
    key: 'nom',
    label: t('layout.profile.fullName'),
    value: profileDisplayName.value || props.displayName,
  },
  { key: 'email', label: t('layout.profile.email'), value: profileEmail.value },
  { key: 'matricule', label: t('layout.profile.matricule'), value: props.userProfile?.matricule },
  { key: 'agence', label: t('layout.profile.agency'), value: props.userProfile?.agence },
  { key: 'telephone', label: t('layout.profile.phone'), value: props.userProfile?.telephone },
])

function syncEditForm() {
  editForm.nom = profileDisplayName.value || props.displayName || ''
  editForm.email = props.userProfile?.email || props.userProfile?.login || ''
  editForm.matricule = props.userProfile?.matricule || ''
  editForm.agence = props.userProfile?.agence || ''
  editForm.telephone = props.userProfile?.telephone || ''
}

watch(
  () => props.userProfile,
  () => syncEditForm(),
  { immediate: true, deep: true },
)

watch(activeTab, (tab) => {
  if (tab === 'edit') syncEditForm()
  if (tab === 'password') {
    passwordForm.current = ''
    passwordForm.next = ''
    passwordForm.confirm = ''
  }
})

async function saveProfile() {
  savingProfile.value = true
  try {
    props.persistUserProfile({
      nom: editForm.nom.trim(),
      email: editForm.email.trim(),
      login: editForm.email.trim(),
      matricule: editForm.matricule.trim(),
      agence: editForm.agence.trim(),
      telephone: editForm.telephone.trim(),
    })
    $q.notify({
      type: 'positive',
      message: t('layout.profile.profileSaved'),
      position: 'top',
    })
    activeTab.value = 'view'
  } finally {
    savingProfile.value = false
  }
}

async function savePassword() {
  savingPassword.value = true
  try {
    const result = props.changeSimPassword(passwordForm.current, passwordForm.next)
    if (!result.ok) {
      const message =
        result.error === 'current_invalid'
          ? t('layout.profile.currentPasswordInvalid')
          : t('layout.profile.passwordMin')
      $q.notify({ type: 'negative', message, position: 'top' })
      return
    }
    passwordForm.current = ''
    passwordForm.next = ''
    passwordForm.confirm = ''
    $q.notify({
      type: 'positive',
      message: t('layout.profile.passwordSaved'),
      position: 'top',
    })
  } finally {
    savingPassword.value = false
  }
}
</script>

<style scoped>
.user-profile-menu {
  display: flex;
  align-items: center;
}

.profile-avatar-btn {
  border-radius: 50%;
}

.profile-avatar {
  background: linear-gradient(135deg, #ffffff 0%, #e8f2ff 100%);
  color: var(--q-primary);
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.85);
}

.profile-avatar--photo img {
  object-fit: cover;
}

.profile-avatar__initials {
  letter-spacing: 0.02em;
}

.profile-menu-card {
  width: min(380px, 92vw);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(15, 23, 42, 0.18);
}

.profile-menu-card__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 18px 16px;
  background: linear-gradient(135deg, var(--q-primary) 0%, #1d4ed8 100%);
  color: #fff;
}

.profile-menu-card__avatar {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: 700;
  font-size: 22px;
  border: 2px solid rgba(255, 255, 255, 0.35);
}

.profile-menu-card__avatar img {
  object-fit: cover;
}

.profile-menu-card__name {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
}

.profile-menu-card__email {
  font-size: 0.78rem;
  opacity: 0.9;
  margin-top: 2px;
  word-break: break-all;
}

.profile-menu-card__badge {
  margin-top: 8px;
  font-size: 0.68rem;
  font-weight: 600;
}

.profile-menu-card__tabs :deep(.q-tab) {
  min-height: 44px;
  font-size: 0.72rem;
}

.profile-menu-card__panels {
  min-height: 220px;
}

.profile-field-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-field {
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.profile-field__label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
  margin-bottom: 2px;
}

.profile-field__value {
  font-size: 0.875rem;
  color: #0f172a;
  font-weight: 500;
}

.profile-history-lead {
  margin: 0 0 16px;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.45;
}
</style>

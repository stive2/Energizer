<template>
  <AssureAuthPageLayout
    :back-to="{ name: 'assure-login' }"
    :back-label="t('modules.assure.register.backLogin')"
  >
    <div class="assure-register">
      <header class="assure-register__hero">
        <div class="assure-register__hero-icon">
          <q-icon name="person_add" size="28px" />
        </div>
        <div class="assure-register__hero-text">
          <h1 class="assure-register__title text-primary">
            {{ t('modules.assure.register.title') }}
          </h1>
          <p class="assure-register__lead">
            {{ t('modules.assure.register.lead') }}
          </p>
        </div>
      </header>

      <div class="assure-register__panel">
        <p class="assure-register__intro text-body2 text-grey-8 text-center">
          {{ t('modules.assure.register.dialogIntro') }}
        </p>

        <q-btn
          color="primary"
          unelevated
          no-caps
          rounded
          icon="person_add"
          class="assure-register__start-btn full-width"
          :label="t('modules.assure.register.startRegistration')"
          @click="openLookupDialog"
        />

        <div class="text-center q-mt-sm">
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            class="assure-register__immat-link"
            :label="t('modules.assure.register.verifyImmat')"
            :to="{ name: 'declarations-home' }"
          />
        </div>

        <div class="assure-register__login-row">
          <q-btn
            flat
            no-caps
            color="primary"
            class="assure-register__login-btn"
            :label="t('modules.assure.register.alreadyAccount')"
            :to="{ name: 'assure-login' }"
          />
        </div>
      </div>
    </div>

    <!-- Étape 1 — recherche matricule -->
    <q-dialog
      v-model="lookupDialogOpen"
      persistent
      maximized-on-small
      class="assure-register-dialog"
    >
      <q-card class="assure-register-dialog__card">
        <q-toolbar class="assure-register-dialog__toolbar bg-primary text-white">
          <div class="assure-register-dialog__toolbar-side">
            <q-icon name="search" size="sm" />
          </div>
          <div class="assure-register-dialog__toolbar-title text-subtitle2 text-weight-bold">
            {{ t('modules.assure.register.lookupTitle') }}
          </div>
          <div class="assure-register-dialog__toolbar-side assure-register-dialog__toolbar-side--end">
            <q-btn flat round dense icon="close" @click="closeLookupDialog" />
          </div>
        </q-toolbar>

        <q-card-section class="assure-register-dialog__body scroll">
          <div class="assure-register__form-center">
          <q-form ref="formRef" class="assure-register__form" @submit.prevent="onLookup">
            <AssureMatriculeInput
              ref="matriculeRef"
              v-model="form.num_assu"
              compact
              :disable="lookingUp"
            />

            <p class="assure-register__hint text-caption text-grey-7 text-center q-mb-none">
              {{ t('modules.assure.register.matriculeHint') }}
            </p>

            <q-btn
              type="submit"
              color="primary"
              unelevated
              no-caps
              rounded
              icon="search"
              class="assure-register__search-btn full-width"
              :label="t('modules.assure.register.search')"
              :loading="lookingUp"
            />
          </q-form>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Étape 2 — fiche assuré + création compte -->
    <q-dialog
      v-model="registerDialogOpen"
      persistent
      maximized-on-small
      class="assure-register-dialog"
    >
      <q-card class="assure-register-dialog__card assure-register-dialog__card--tall">
        <q-toolbar class="assure-register-dialog__toolbar bg-primary text-white">
          <div class="assure-register-dialog__toolbar-side">
            <q-icon name="badge" size="sm" />
          </div>
          <div class="assure-register-dialog__toolbar-title text-subtitle2 text-weight-bold">
            {{ t('modules.assure.register.step2Title') }}
          </div>
          <div class="assure-register-dialog__toolbar-side assure-register-dialog__toolbar-side--end">
            <q-btn flat round dense icon="close" @click="closeRegisterDialog" />
          </div>
        </q-toolbar>

        <q-card-section v-if="assureInfo" class="assure-register-dialog__body scroll">
          <div class="assure-register__form-center">
          <p class="assure-register__matricule-recap text-caption text-grey-8 text-center q-mb-sm">
            {{ form.num_assu }}
          </p>

          <q-card flat bordered class="assure-register__info q-mb-sm">
            <q-card-section class="q-py-xs q-px-sm">
              <div class="text-caption text-primary text-weight-bold text-center">
                {{ t('modules.assure.register.assureInfoTitle') }}
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-py-xs q-px-sm assure-register__info-grid">
              <div><span class="text-grey-7">Nom</span><div class="text-weight-medium">{{ assureInfo.NOM_ASSU || '—' }}</div></div>
              <div><span class="text-grey-7">Prénom</span><div class="text-weight-medium">{{ assureInfo.PRENOM_ASSU || '—' }}</div></div>
              <div>
                <span class="text-grey-7">{{ t('modules.assure.account.bornOn') }}</span>
                <div class="text-weight-medium">{{ assureInfo.DATE_NAISS || '—' }}</div>
              </div>
              <div>
                <span class="text-grey-7">{{ t('modules.assure.register.fatherName') }}</span>
                <div class="text-weight-medium">{{ assureInfo.NOM_PERE_PERS || '—' }}</div>
              </div>
              <div>
                <span class="text-grey-7">{{ t('modules.assure.register.motherName') }}</span>
                <div class="text-weight-medium">{{ assureInfo.NOM_MERE_PERS || '—' }}</div>
              </div>
              <div>
                <span class="text-grey-7">{{ t('modules.assure.register.centreCnps') }}</span>
                <div class="text-weight-medium">{{ assureInfo.LIB_CENTRE || assureInfo.CODE_CENTRE_ASSU || '—' }}</div>
              </div>
            </q-card-section>
          </q-card>

          <q-form ref="detailsFormRef" class="assure-register__form" @submit.prevent="onSubmit">
            <h2 class="assure-register__section-title text-primary">
              {{ t('modules.assure.register.formTitle') }}
            </h2>

            <q-input
              v-model="form.numtelephone"
              name="numtelephone"
              :label="t('modules.assure.account.phone') + ' *'"
              outlined
              dense
              hide-bottom-space
              class="assure-register__input"
              type="tel"
              :disable="submitting"
              :rules="[(v) => !!v?.trim() || t('modules.assure.account.fieldRequired')]"
            >
              <template #prepend>
                <q-icon name="phone" color="primary" size="xs" />
              </template>
            </q-input>

            <q-input
              v-model="form.email"
              name="email"
              :label="t('modules.assure.account.email') + ' *'"
              type="email"
              outlined
              dense
              hide-bottom-space
              class="assure-register__input"
              :disable="submitting"
              :rules="emailRules"
            >
              <template #prepend>
                <q-icon name="email" color="primary" size="xs" />
              </template>
            </q-input>

            <q-select
              v-model="form.numtypepiece"
              name="numtypepiece"
              :options="typePieceOptions"
              :label="t('modules.assure.account.idType') + ' *'"
              outlined
              dense
              emit-value
              map-options
              hide-bottom-space
              class="assure-register__input"
              :disable="submitting"
              :rules="[(v) => v != null && v !== '' || t('modules.assure.account.fieldRequired')]"
              @update:model-value="onTypePieceChange"
            >
              <template #prepend>
                <q-icon name="credit_card" color="primary" size="xs" />
              </template>
            </q-select>

            <q-input
              v-model="form.numpiece"
              name="numpiece"
              :label="t('modules.assure.account.idNumber') + ' *'"
              outlined
              dense
              hide-bottom-space
              class="assure-register__input input-uppercase"
              :disable="submitting"
              :rules="[(v) => !!v?.trim() || t('modules.assure.account.fieldRequired')]"
              @update:model-value="(val) => upperField('numpiece', val)"
            >
              <template #prepend>
                <q-icon name="numbers" color="primary" size="xs" />
              </template>
            </q-input>

            <q-input
              v-model="form.debut_validite"
              name="debut_validite"
              :label="t('modules.assure.account.idStart') + ' *'"
              outlined
              dense
              hide-bottom-space
              mask="##-##-####"
              class="assure-register__input"
              :disable="submitting"
              :rules="debutValiditeRules"
              @update:model-value="onDebutValiditeChange"
            >
              <template #prepend>
                <q-icon name="event" color="primary" size="xs" />
              </template>
              <template #append>
                <q-icon name="event" color="primary" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="form.debut_validite" mask="DD-MM-YYYY">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="OK" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              v-model="form.fin_validite"
              name="fin_validite"
              :label="t('modules.assure.account.idEnd') + ' *'"
              outlined
              dense
              hide-bottom-space
              mask="##-##-####"
              class="assure-register__input"
              :readonly="finValiditeAuto"
              :hint="finValiditeAuto ? t('modules.assure.register.finAutoHint') : undefined"
              :disable="submitting"
              :rules="finValiditeRules"
            >
              <template #prepend>
                <q-icon name="event_available" color="primary" size="xs" />
              </template>
            </q-input>

            <template v-if="form.operation === 'Enregistrer'">
              <q-input
                v-model="form.mot2passe"
                name="mot2passe"
                :label="t('modules.assure.register.password')"
                :type="showPassword ? 'text' : 'password'"
                outlined
                dense
                hide-bottom-space
                class="assure-register__input assure-register__input--password"
                :disable="submitting"
                :rules="passwordRules"
              >
                <template #prepend>
                  <q-icon name="lock" color="primary" size="xs" />
                </template>
                <template #append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer text-grey-7"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <q-input
                v-model="form.mot2passe2"
                name="mot2passe2"
                :label="t('modules.assure.register.passwordConfirm')"
                :type="showPasswordConfirm ? 'text' : 'password'"
                outlined
                dense
                hide-bottom-space
                class="assure-register__input assure-register__input--password"
                :disable="submitting"
                :rules="passwordConfirmRules"
              >
                <template #prepend>
                  <q-icon name="lock_outline" color="primary" size="xs" />
                </template>
                <template #append>
                  <q-icon
                    :name="showPasswordConfirm ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer text-grey-7"
                    @click="showPasswordConfirm = !showPasswordConfirm"
                  />
                </template>
              </q-input>
            </template>

            <q-option-group
              v-model="form.operation"
              name="operation"
              :options="operationOptions"
              inline
              color="primary"
              class="assure-register__operation"
              :disable="submitting"
            />

            <div class="row q-gutter-sm q-mt-sm">
              <q-btn
                flat
                no-caps
                color="grey-8"
                icon="arrow_back"
                class="col"
                :label="t('modules.assure.register.changeMatricule')"
                :disable="submitting"
                @click="backToLookupFromRegister"
              />
              <q-btn
                type="submit"
                color="primary"
                unelevated
                no-caps
                rounded
                icon="check_circle"
                class="col assure-register__submit-btn"
                :label="submitLabel"
                :loading="submitting"
              />
            </div>
          </q-form>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </AssureAuthPageLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import AssureAuthPageLayout from 'src/modules/assure/components/AssureAuthPageLayout.vue'
import AssureMatriculeInput from 'src/modules/assure/components/AssureMatriculeInput.vue'
import {
  fetchTypesPiece,
  lookupAssureProfile,
  registerOrUpdateAssureAccount,
} from 'src/modules/assure/api/assureAccountApi.js'
import {
  findTypePieceDuree,
  isValidMatriculeAssure,
  mapTypePieceOption,
  recalcFinValiditeForForm,
  validateDebutValidite,
  validateFinValidite,
} from 'src/modules/assure/utils/assureRegisterLegacy.js'
import { setLegacyUppercaseText } from 'src/modules/energizer/utils/energizerFormInputUtils.js'

const { t } = useI18n()
const $q = useQuasar()
const router = useRouter()
const formRef = ref(null)
const detailsFormRef = ref(null)
const matriculeRef = ref(null)
const lookingUp = ref(false)
const submitting = ref(false)
const lookupDialogOpen = ref(false)
const registerDialogOpen = ref(false)
const assureInfo = ref(null)
const typePieceOptions = ref([])
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

const form = reactive({
  num_assu: '',
  numtelephone: '',
  email: '',
  numtypepiece: '',
  numpiece: '',
  debut_validite: '',
  fin_validite: '',
  operation: 'Enregistrer',
  mot2passe: '',
  mot2passe2: '',
})

const operationOptions = computed(() => [
  { label: t('modules.assure.register.operationCreate'), value: 'Enregistrer' },
  { label: t('modules.assure.register.operationUpdate'), value: 'Modifier' },
])

const submitLabel = computed(() =>
  form.operation === 'Modifier'
    ? t('modules.assure.register.modify')
    : t('modules.assure.register.create'),
)

const selectedPieceDuree = computed(() =>
  findTypePieceDuree(typePieceOptions.value, form.numtypepiece, assureInfo.value),
)

const finValiditeAuto = computed(() => selectedPieceDuree.value > 0)

const emailRules = [
  (v) => !!v?.trim() || t('modules.assure.account.fieldRequired'),
  (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? '').trim()) || t('modules.assure.register.emailInvalid'),
]

const debutValiditeRules = [
  (v) => !!v?.trim() || t('modules.assure.account.fieldRequired'),
  (v) => {
    const check = validateDebutValidite(v)
    if (check === 'invalid') return t('modules.assure.register.dateDebutInvalid')
    if (check === 'future') return t('modules.assure.register.dateDebutFuture')
    return true
  },
]

const finValiditeRules = [
  (v) => !!v?.trim() || t('modules.assure.account.fieldRequired'),
  (v) => {
    const check = validateFinValidite(v)
    if (check === 'invalid') return t('modules.assure.register.dateFinInvalid')
    if (check === 'expired') return t('modules.assure.register.dateFinExpired')
    return true
  },
]

const passwordRules = [
  (v) => !!v?.trim() || t('modules.assure.register.passwordRequired'),
  (v) => String(v ?? '').length >= 6 || t('modules.assure.account.passwordMin'),
]

const passwordConfirmRules = [
  (v) => !!v?.trim() || t('modules.assure.register.passwordRequired'),
  (v) => v === form.mot2passe || t('modules.assure.account.passwordMismatch'),
]

function upperField(field, val) {
  setLegacyUppercaseText(form, field, val)
}

function recalcFinValidite() {
  recalcFinValiditeForForm(form, typePieceOptions.value, assureInfo.value)
}

function onTypePieceChange() {
  recalcFinValidite()
}

function onDebutValiditeChange() {
  recalcFinValidite()
}

function openLookupDialog() {
  lookupDialogOpen.value = true
}

function closeLookupDialog() {
  lookupDialogOpen.value = false
}

function closeRegisterDialog() {
  registerDialogOpen.value = false
}

function backToLookupFromRegister() {
  registerDialogOpen.value = false
  lookupDialogOpen.value = true
}

onMounted(async () => {
  lookupDialogOpen.value = true
  try {
    const pieces = await fetchTypesPiece()
    typePieceOptions.value = pieces.map(mapTypePieceOption).filter((o) => o.value)
  } catch {
    /* types pièces optionnels au chargement */
  }
})

async function onLookup() {
  matriculeRef.value?.normalize?.()
  if (!isValidMatriculeAssure(form.num_assu)) {
    $q.notify({
      type: 'negative',
      message: t('modules.assure.register.matriculeInvalid'),
      position: 'top',
    })
    return
  }

  const valid = await formRef.value?.validate()
  if (!valid) return

  lookingUp.value = true
  assureInfo.value = null
  try {
    const row = await lookupAssureProfile(form.num_assu.trim())
    assureInfo.value = row
    form.numtelephone = row.TELASSU || row.telassu || form.numtelephone
    form.email = row.EMAILASSU || row.emailassu || form.email
    form.numtypepiece = row.TYPE_PIECE ? String(row.TYPE_PIECE) : form.numtypepiece
    form.numpiece = row.NUM_PIECE || form.numpiece
    form.debut_validite = row.DEBUT_VALIDITE || form.debut_validite
    form.fin_validite = row.FIN_VALIDITE || form.fin_validite
    form.operation = row.TYPE_PIECE ? 'Modifier' : 'Enregistrer'
    recalcFinValidite()
    lookupDialogOpen.value = false
    registerDialogOpen.value = true
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err?.message || t('modules.assure.register.notFound'),
      position: 'top',
    })
  } finally {
    lookingUp.value = false
  }
}

async function onSubmit() {
  const valid = await detailsFormRef.value?.validate()
  if (!valid) return

  if (form.operation === 'Enregistrer') {
    if (!form.mot2passe || form.mot2passe !== form.mot2passe2) {
      $q.notify({
        type: 'negative',
        message: t('modules.assure.account.passwordMismatch'),
        position: 'top',
      })
      return
    }
  }

  submitting.value = true
  try {
    const payload = {
      num_assu: form.num_assu.trim(),
      operation: form.operation,
      numtelephone: form.numtelephone.trim(),
      email: form.email.trim(),
      numtypepiece: form.numtypepiece,
      numpiece: form.numpiece.trim(),
      debut_validite: form.debut_validite.trim(),
      fin_validite: form.fin_validite.trim(),
    }
    if (form.operation === 'Enregistrer') {
      payload.mot2passe = form.mot2passe
    }
    const result = await registerOrUpdateAssureAccount(payload)
    registerDialogOpen.value = false
    $q.notify({
      type: 'positive',
      message: result?.message || t('modules.assure.register.success'),
      position: 'top',
      multiLine: true,
    })
    if (form.operation === 'Enregistrer') {
      form.mot2passe = ''
      form.mot2passe2 = ''
      router.push({ name: 'assure-login' })
    }
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err?.message || t('modules.assure.register.error'),
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.assure-register {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.assure-register__hero {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.15rem 0.5rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, transparent 100%);
}

.assure-register__hero-icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%);
  color: #3949ab;
}

.assure-register__hero-text {
  min-width: 0;
}

.assure-register__title {
  margin: 0;
  font-size: clamp(1rem, 3.5vw, 1.15rem);
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.25;
}

.assure-register__lead {
  margin: 0.25rem 0 0;
  font-size: 0.82rem;
  line-height: 1.4;
  color: #64748b;
}

.assure-register__panel {
  flex: 1 1 auto;
  margin: 0.35rem 0.85rem 0.75rem;
  padding: 1rem 1.1rem 1.1rem;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(57, 73, 171, 0.1);
  box-shadow: 0 8px 28px rgba(57, 73, 171, 0.08);
}

.assure-register__intro {
  margin: 0 0 1rem;
  line-height: 1.45;
}

.assure-register__start-btn {
  font-weight: 700;
  min-height: 44px;
  box-shadow: 0 4px 14px rgba(57, 73, 171, 0.2);
}

.assure-register__form {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.assure-register__form-center {
  max-width: 460px;
  margin: 0 auto;
  width: 100%;
}

.assure-register__section-title {
  margin: 0 0 0.1rem;
  font-size: 0.88rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.02em;
}

.assure-register__input :deep(.q-field__control) {
  border-radius: 8px;
  background: #f8fafc;
  min-height: 36px;
}

.assure-register__input :deep(.q-field--focused .q-field__control) {
  background: #fff;
}

.assure-register__input--password :deep(.q-field__native),
.assure-register__input--password :deep(input) {
  text-transform: none;
}

.assure-register__search-btn,
.assure-register__submit-btn {
  font-weight: 700;
  min-height: 36px;
}

.assure-register__info {
  border-radius: 8px;
}

.assure-register__info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem 0.5rem;
  font-size: 0.78rem;
}

.assure-register__info-grid > div {
  min-width: 0;
}

.assure-register__matricule-recap {
  font-weight: 600;
  letter-spacing: 0.03em;
}

.assure-register__operation {
  justify-content: center;
}

.assure-register__login-row {
  display: flex;
  justify-content: center;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  border-top: 1px solid rgba(148, 163, 184, 0.22);
}

.assure-register__login-btn,
.assure-register__immat-link {
  font-weight: 600;
  font-size: 0.88rem;
}

.input-uppercase :deep(.q-field__native),
.input-uppercase :deep(textarea) {
  text-transform: uppercase;
}

.assure-register-dialog__card {
  width: min(580px, 96vw);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
}

.assure-register-dialog__toolbar {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  min-height: 50px;
  padding: 0 6px;
}

.assure-register-dialog__toolbar-side {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
}

.assure-register-dialog__toolbar-side--end {
  justify-content: flex-end;
}

.assure-register-dialog__toolbar-title {
  text-align: center;
  white-space: nowrap;
  line-height: 1.25;
  font-size: 0.92rem;
  letter-spacing: 0.01em;
  padding: 0 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.assure-register-dialog__card--tall {
  width: min(580px, 96vw);
  max-height: 92vh;
}

.assure-register-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
}
</style>

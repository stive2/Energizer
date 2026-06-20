<template>
  <q-page class="q-pa-md assure-account-page">
    <div class="q-mx-auto" style="max-width: 820px">
      <div class="text-h5 text-primary text-weight-bold q-mb-xs">
        {{ t('modules.assure.account.title') }}
      </div>
      <div class="text-caption text-grey-7 q-mb-md">
        {{ t('modules.assure.account.lead') }}
      </div>

      <q-banner v-if="loadError" dense rounded class="bg-negative text-white q-mb-md">
        {{ loadError }}
      </q-banner>

      <q-card v-if="loading" flat bordered class="q-pa-xl flex flex-center">
        <q-spinner color="primary" size="36px" />
      </q-card>

      <q-card v-else flat bordered>
        <q-tabs
          v-model="tab"
          dense
          class="text-primary"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="infos" icon="person" :label="t('modules.assure.account.tabInfos')" />
          <q-tab name="password" icon="lock" :label="t('modules.assure.account.tabPassword')" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="infos">
            <q-banner v-if="profileRow" dense rounded class="bg-blue-1 q-mb-md">
              {{ profileRow.NOM_ASSU }} {{ profileRow.PRENOM_ASSU }} —
              {{ t('modules.assure.account.bornOn') }} {{ profileRow.DATE_NAISS }}
            </q-banner>

            <q-form @submit.prevent="onSaveInfos">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="infoForm.numtelephone"
                    :label="t('modules.assure.account.phone') + ' *'"
                    outlined
                    dense
                    :rules="[(v) => !!v?.trim() || t('modules.assure.account.fieldRequired')]"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="infoForm.email"
                    :label="t('modules.assure.account.email') + ' *'"
                    type="email"
                    outlined
                    dense
                    :rules="[(v) => !!v?.trim() || t('modules.assure.account.fieldRequired')]"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="infoForm.numtypepiece"
                    :options="typePieceOptions"
                    :label="t('modules.assure.account.idType') + ' *'"
                    outlined
                    dense
                    emit-value
                    map-options
                    :rules="[(v) => v != null && v !== '' || t('modules.assure.account.fieldRequired')]"
                    @update:model-value="onTypePieceChange"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="infoForm.numpiece"
                    :label="t('modules.assure.account.idNumber') + ' *'"
                    outlined
                    dense
                    :rules="[(v) => !!v?.trim() || t('modules.assure.account.fieldRequired')]"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="infoForm.debut_validite"
                    :label="t('modules.assure.account.idStart') + ' *'"
                    outlined
                    dense
                    mask="##-##-####"
                    :rules="[(v) => !!v?.trim() || t('modules.assure.account.fieldRequired')]"
                    @update:model-value="onDebutValiditeChange"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="infoForm.fin_validite"
                    :label="t('modules.assure.account.idEnd') + ' *'"
                    outlined
                    dense
                    mask="##-##-####"
                    :readonly="finValiditeAuto"
                    :hint="finValiditeAuto ? t('modules.assure.register.finAutoHint') : undefined"
                    :rules="[(v) => !!v?.trim() || t('modules.assure.account.fieldRequired')]"
                  />
                </div>
              </div>
              <div class="row justify-end q-mt-lg">
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  no-caps
                  icon="save"
                  :label="t('modules.assure.account.saveInfos')"
                  :loading="savingInfos"
                />
              </div>
            </q-form>
          </q-tab-panel>

          <q-tab-panel name="password">
            <q-form @submit.prevent="onChangePassword">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="pwdForm.mot2passeOld"
                    :label="t('modules.assure.account.currentPassword') + ' *'"
                    :type="showPwdOld ? 'text' : 'password'"
                    outlined
                    dense
                    :rules="[(v) => !!v || t('modules.assure.account.fieldRequired')]"
                  >
                    <template #append>
                      <q-icon
                        :name="showPwdOld ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer text-grey-7"
                        @click="showPwdOld = !showPwdOld"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="pwdForm.mot2passe"
                    :label="t('modules.assure.account.newPassword') + ' *'"
                    :type="showPwdNew ? 'text' : 'password'"
                    outlined
                    dense
                    :rules="[
                      (v) => !!v || t('modules.assure.account.fieldRequired'),
                      (v) => String(v).length >= 6 || t('modules.assure.account.passwordMin'),
                    ]"
                  >
                    <template #append>
                      <q-icon
                        :name="showPwdNew ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer text-grey-7"
                        @click="showPwdNew = !showPwdNew"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="pwdForm.mot2passe2"
                    :label="t('modules.assure.account.confirmPassword') + ' *'"
                    :type="showPwdConfirm ? 'text' : 'password'"
                    outlined
                    dense
                    :rules="[
                      (v) => !!v || t('modules.assure.account.fieldRequired'),
                      (v) => v === pwdForm.mot2passe || t('modules.assure.account.passwordMismatch'),
                    ]"
                  >
                    <template #append>
                      <q-icon
                        :name="showPwdConfirm ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer text-grey-7"
                        @click="showPwdConfirm = !showPwdConfirm"
                      />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="row justify-end q-mt-lg">
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  no-caps
                  icon="lock_reset"
                  :label="t('modules.assure.account.changePassword')"
                  :loading="savingPassword"
                />
              </div>
            </q-form>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { changeAssurePassword } from 'src/modules/shared/api/auth/assureAuthApi.js'
import {
  fetchTypesPiece,
  lookupAssureProfile,
  registerOrUpdateAssureAccount,
} from 'src/modules/assure/api/assureAccountApi.js'
import { readInsuredNumAssu } from 'src/modules/assure/utils/assureSession.js'
import {
  findTypePieceDuree,
  mapTypePieceOption,
  recalcFinValiditeForForm,
} from 'src/modules/assure/utils/assureRegisterLegacy.js'

const { t } = useI18n()
const $q = useQuasar()

const tab = ref('infos')
const loading = ref(true)
const loadError = ref('')
const savingInfos = ref(false)
const savingPassword = ref(false)
const profileRow = ref(null)
const typePieceOptions = ref([])
const numAssu = ref('')
const showPwdOld = ref(false)
const showPwdNew = ref(false)
const showPwdConfirm = ref(false)

const infoForm = reactive({
  numtelephone: '',
  email: '',
  numtypepiece: '',
  numpiece: '',
  debut_validite: '',
  fin_validite: '',
})

const pwdForm = reactive({
  mot2passeOld: '',
  mot2passe: '',
  mot2passe2: '',
})

const finValiditeAuto = computed(() =>
  findTypePieceDuree(typePieceOptions.value, infoForm.numtypepiece, profileRow.value) > 0,
)

function recalcFinValidite() {
  recalcFinValiditeForForm(infoForm, typePieceOptions.value, profileRow.value)
}

function onTypePieceChange() {
  recalcFinValidite()
}

function onDebutValiditeChange() {
  recalcFinValidite()
}

function fillInfoForm(row) {
  if (!row) return
  infoForm.numtelephone = row.TELASSU || row.telassu || ''
  infoForm.email = row.EMAILASSU || row.emailassu || ''
  infoForm.numtypepiece = row.TYPE_PIECE ? String(row.TYPE_PIECE) : ''
  infoForm.numpiece = row.NUM_PIECE || ''
  infoForm.debut_validite = row.DEBUT_VALIDITE || ''
  infoForm.fin_validite = row.FIN_VALIDITE || ''
}

async function loadProfile() {
  loading.value = true
  loadError.value = ''
  try {
    numAssu.value = readInsuredNumAssu()
    if (!numAssu.value) {
      throw new Error(t('modules.assure.account.noSession'))
    }
    const [pieces, row] = await Promise.all([
      fetchTypesPiece(),
      lookupAssureProfile(numAssu.value),
    ])
    typePieceOptions.value = pieces.map(mapTypePieceOption).filter((o) => o.value)
    profileRow.value = row
    fillInfoForm(row)
    recalcFinValidite()
  } catch (e) {
    loadError.value = e?.message || t('modules.assure.account.loadError')
  } finally {
    loading.value = false
  }
}

async function onSaveInfos() {
  savingInfos.value = true
  try {
    const result = await registerOrUpdateAssureAccount({
      num_assu: numAssu.value,
      operation: profileRow.value?.TYPE_PIECE ? 'Modifier' : 'Enregistrer',
      numtelephone: infoForm.numtelephone.trim(),
      email: infoForm.email.trim(),
      numtypepiece: infoForm.numtypepiece,
      numpiece: infoForm.numpiece.trim(),
      debut_validite: infoForm.debut_validite.trim(),
      fin_validite: infoForm.fin_validite.trim(),
    })
    $q.notify({
      type: 'positive',
      message: result?.message || t('modules.assure.account.saveOk'),
      position: 'top',
    })
    await loadProfile()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e?.message || t('modules.assure.account.saveError'),
      position: 'top',
    })
  } finally {
    savingInfos.value = false
  }
}

async function onChangePassword() {
  savingPassword.value = true
  try {
    const result = await changeAssurePassword({
      num_assu: numAssu.value,
      mot2passeOld: pwdForm.mot2passeOld,
      password: pwdForm.mot2passe,
      passwordConfirm: pwdForm.mot2passe2,
    })
    pwdForm.mot2passeOld = ''
    pwdForm.mot2passe = ''
    pwdForm.mot2passe2 = ''
    $q.notify({
      type: 'positive',
      message: result?.message || t('modules.assure.account.passwordOk'),
      position: 'top',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e?.message || t('modules.assure.account.passwordError'),
      position: 'top',
    })
  } finally {
    savingPassword.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.assure-account-page {
  background: linear-gradient(180deg, #f5fafd 0%, #ffffff 100%);
  min-height: 100%;
}
</style>

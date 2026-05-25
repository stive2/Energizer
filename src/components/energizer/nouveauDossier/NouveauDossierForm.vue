<template>
  <q-form ref="formRef" class="nouveau-dossier-form" @submit.prevent="onSubmit">
    <div class="text-subtitle1 text-primary text-weight-medium text-center q-mb-sm">
      {{ store.formTitle }}
    </div>

    <div class="row q-col-gutter-md nouveau-dossier-form__fields">
      <div v-if="visible('numassu')" class="col-12 col-md-6">
        <q-input
          v-model="form.numassu"
          name="numassu"
          label="Numero Assure"
          outlined
          dense
          :disable="!enabled('numassu')"
          :loading="store.loadingAssure"
          :rules="numassuRules"
          :hint="enabled('numassu') ? t('reception.nouveauDossier.numassuHint') : undefined"
          @update:model-value="onNumassuChange"
          @click="onNumassuActivate"
          @blur="onNumassuActivate"
          @keyup.enter="onNumassuLookup"
          @keydown.enter.prevent
        >
          <template #append>
            <q-btn
              flat
              dense
              round
              icon="search"
              color="primary"
              :disable="!enabled('numassu')"
              :loading="store.loadingAssure"
              @click.stop="onNumassuLookup"
            />
          </template>
        </q-input>
      </div>

      <div v-if="visible('nomcompletass')" class="col-12 col-md-6">
        <q-input
          v-model="form.nomcompletass"
          name="nomcompletass"
          label="Nom Complet Assure"
          outlined
          dense
          readonly
          :disable="!enabled('nomcompletass')"
        />
      </div>

      <div v-if="visible('today')" class="col-12 col-md-6">
        <q-input
          v-model="form.today"
          name="today"
          label="Date du jour"
          outlined
          dense
          readonly
          disable
        />
      </div>

      <div v-if="visible('date_naiss')" class="col-12 col-md-6">
        <q-input
          v-model="form.date_naiss"
          name="date_naiss"
          label="Date Naissance Assure"
          outlined
          dense
          readonly
          :disable="!enabled('date_naiss')"
        />
      </div>

      <div v-if="visible('centre_ges')" class="col-12 col-md-6">
        <q-input
          v-model="form.centre_ges"
          name="centre_ges"
          label="Centre de Gestion Assure"
          outlined
          dense
          readonly
          :disable="!enabled('centre_ges')"
        />
      </div>

      <div v-if="visible('nomcomplet')" class="col-12 col-md-6">
        <q-input
          v-model="form.nomcomplet"
          name="nomcomplet"
          label="Nom Deposant"
          outlined
          dense
          :disable="!enabled('nomcomplet')"
          :required="fieldRequired('nomcomplet')"
          :rules="nomcompletRules"
        />
      </div>

      <div v-if="visible('nomtiers')" class="col-12 col-md-6">
        <q-input
          v-model="form.nomtiers"
          name="nomtiers"
          label="Nom Tierce"
          outlined
          dense
          :disable="!enabled('nomtiers')"
        />
      </div>

      <div v-if="visible('datedemande')" class="col-12 col-md-6">
        <q-input
          v-model="form.datedemande"
          name="datedemande"
          label="Date Depot"
          outlined
          dense
          mask="##/##/####"
          :disable="!enabled('datedemande')"
          :required="fieldRequired('datedemande')"
          :rules="datedemandeRules"
        >
          <template #append>
            <q-icon name="event" color="primary" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.datedemande" mask="DD/MM/YYYY">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="OK" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div v-if="visible('datecessation')" class="col-12 col-md-6">
          <q-input
            v-model="form.datecessation"
            name="datecessation"
            label="Date Cessation Cotisation Assure"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('datecessation')"
            :required="fieldRequired('datecessation')"
            :rules="datecessationRules"
          >
            <template #append>
              <q-icon name="event" color="primary" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.datecessation" mask="DD/MM/YYYY" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
      </div>

      <div v-if="visible('datedeces')" class="col-12 col-md-6">
          <q-input
            v-model="form.datedeces"
            name="datedeces"
            label="Date de Décés Assure"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('datedeces')"
            :required="fieldRequired('datedeces')"
            :rules="datedecesRules"
          >
            <template #append>
              <q-icon name="event" color="primary" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.datedeces" mask="DD/MM/YYYY" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
      </div>

      <div v-if="visible('dateconstatinvalid')" class="col-12 col-md-6">
          <q-input
            v-model="form.dateconstatinvalid"
            name="dateconstatinvalid"
            label="Date d Invalidité Assure"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('dateconstatinvalid')"
            :required="fieldRequired('dateconstatinvalid')"
            :rules="dateconstatinvalidRules"
          >
            <template #append>
              <q-icon name="event" color="primary" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.dateconstatinvalid" mask="DD/MM/YYYY" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
      </div>

      <div v-if="visible('dateconstatincapacite')" class="col-12 col-md-6">
          <q-input
            v-model="form.dateconstatincapacite"
            name="dateconstatincapacite"
            label="Date de Constation de l Incapacité Assure"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('dateconstatincapacite')"
            :required="fieldRequired('dateconstatincapacite')"
            :rules="dateconstatincapaciteRules"
          >
            <template #append>
              <q-icon name="event" color="primary" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.dateconstatincapacite" mask="DD/MM/YYYY" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
      </div>

      <div v-if="visible('datedemandeassuredecede')" class="col-12 col-md-6">
          <q-input
            v-model="form.datedemandeassuredecede"
            name="datedemandeassuredecede"
            label="Date Demande Assuré Décédé"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('datedemandeassuredecede')"
            :required="fieldRequired('datedemandeassuredecede')"
            :rules="[required, dateNotAfterToday]"
          >
            <template #append>
              <q-icon name="event" color="primary" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.datedemandeassuredecede" mask="DD/MM/YYYY" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
      </div>

      <div v-if="visible('natureprestation')" class="col-12 col-md-6">
          <q-select
            v-model="form.natureprestation"
            name="natureprestation"
            label="Nature Prestation Assuré Décédé"
            outlined
            dense
            emit-value
            map-options
            :options="store.natureOptions"
            option-value="value"
            option-label="label"
            :disable="!enabled('natureprestation')"
            :required="fieldRequired('natureprestation')"
            :rules="natureprestationRules"
            @update:model-value="store.onNatureSelect"
          />
      </div>

      <div v-if="visible('tauxinvalide')" class="col-12 col-md-6">
          <q-input
            v-model.number="form.tauxinvalide"
            name="tauxinvalide"
            type="number"
            label="Taux Invalidité Assure"
            outlined
            dense
            :disable="!enabled('tauxinvalide')"
            :required="fieldRequired('tauxinvalide')"
            :rules="tauxinvalideRules"
          />
      </div>

      <div v-if="visible('dateaccident')" class="col-12 col-md-6">
          <q-input
            v-model="form.dateaccident"
            name="dateaccident"
            label="Date Accident/Maladie Assure"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('dateaccident')"
            :required="fieldRequired('dateaccident')"
            :rules="dateaccidentRules"
          >
            <template #append>
              <q-icon name="event" color="primary" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.dateaccident" mask="DD/MM/YYYY" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
      </div>

      <div v-if="visible('datedeclaration')" class="col-12 col-md-6">
          <q-input
            v-model="form.datedeclaration"
            name="datedeclaration"
            label="Date Déclaration"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('datedeclaration')"
            :required="fieldRequired('datedeclaration')"
            :rules="datedeclarationRules"
          >
            <template #append>
              <q-icon name="event" color="primary" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.datedeclaration" mask="DD/MM/YYYY" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
      </div>

      <div v-if="visible('email')" class="col-12 col-md-6">
          <q-input
            v-model="form.email"
            name="email"
            label="Email"
            outlined
            dense
            :disable="!enabled('email')"
            :rules="[validateEmail]"
          />
      </div>

      <div v-if="visible('adresse')" class="col-12 col-md-6">
          <q-input
            v-model="form.adresse"
            name="adresse"
            label="Adresse"
            outlined
            dense
            :disable="!enabled('adresse')"
            :required="fieldRequired('adresse')"
            :rules="adresseRules"
          />
      </div>

      <div v-if="visible('telephone')" class="col-12 col-md-6">
          <q-input
            v-model="form.telephone"
            name="telephone"
            type="number"
            label="Telephone"
            outlined
            dense
            :disable="!enabled('telephone')"
            :required="fieldRequired('telephone')"
            :rules="telephoneRules"
          />
      </div>

      <div v-if="visible('typeimmas')" class="col-12 col-md-6">
          <q-select
            v-model="form.typeimmas"
            name="typeimmas"
            label="TYPE IMMATRICULATION?"
            outlined
            dense
            emit-value
            map-options
            :options="store.typeimmasOptions"
            option-value="value"
            option-label="label"
            :disable="!enabled('typeimmas')"
            :required="fieldRequired('typeimmas')"
            :rules="typeimmasRules"
          />
      </div>

      <div v-if="visible('revision')" class="col-12 col-md-6">
          <q-select
            v-model="form.revision"
            name="revision"
            label="VOULEZ VOUS ASSOCIER CE DOSSIER A UNE REVISION DE DROITS?"
            outlined
            dense
            emit-value
            map-options
            :options="store.revisionOptions"
            option-value="value"
            option-label="label"
            :disable="!enabled('revision')"
            :required="fieldRequired('revision')"
            :rules="revisionRules"
            @update:model-value="store.onRevisionSelect"
          />
      </div>

      <div v-if="visible('circuit')" class="col-12 col-md-6">
          <q-select
            v-model="form.circuit"
            name="circuit"
            :label="t('reception.nouveauDossier.circuitLabel')"
            outlined
            dense
            emit-value
            map-options
            :options="store.circuitOptions"
            option-value="value"
            option-label="label"
            :required="fieldRequired('circuit')"
            :rules="[required]"
            @update:model-value="store.onCircuitSelect"
          />
      </div>
    </div>

    <q-expansion-item
      v-if="store.fieldState.group00?.visible"
      :label="t('reception.nouveauDossier.sectionEmployeur')"
      icon="business"
      dense
      header-class="text-primary"
      expand-icon-class="text-primary"
      default-opened
      class="q-mt-sm"
    >
      <q-card flat bordered class="q-pa-sm">
        <div class="row q-col-gutter-md nouveau-dossier-form__fields-row">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.mat_employeur"
              name="mat_employeur"
              :label="t('reception.nouveauDossier.matEmployeur')"
              outlined
              dense
              :required="fieldRequired('mat_employeur')"
              :loading="store.loadingEmployeur"
              :rules="[validateMatriculeEmployeur]"
              :hint="t('reception.nouveauDossier.matEmployeurHint')"
              @update:model-value="onMatEmployeurChange"
              @click="onMatEmployeurActivate"
              @blur="onMatEmployeurActivate"
              @keyup.enter="onMatEmployeurLookup"
              @keydown.enter.prevent
            >
              <template #append>
                <q-btn
                  flat
                  dense
                  round
                  icon="search"
                  color="primary"
                  :loading="store.loadingEmployeur"
                  @click.stop="onMatEmployeurLookup"
                />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.RAISON_SOCIALE"
              name="raison_soc"
              label="Raison sociale"
              outlined
              dense
              readonly
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.CODE_CENTRE"
              name="centre"
              label="Centre de Gestion"
              outlined
              dense
              readonly
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.BOITE_POSTALE"
              name="boite_post"
              label="Boite postale"
              outlined
              dense
              readonly
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.REGIME_CNPS"
              name="regime"
              label="Regime CNPS"
              outlined
              dense
              readonly
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.CODE_GPE_RISQUE"
              name="risque"
              label="Risque"
              outlined
              dense
              readonly
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.ADRESSE_EMPLOYEUR"
              name="adresse_employeur"
              label="Adresse"
              outlined
              dense
              readonly
            />
          </div>
        </div>
      </q-card>
    </q-expansion-item>

    <q-expansion-item
      v-if="store.fieldState.group03?.visible"
      :label="t('reception.nouveauDossier.sectionImport')"
      icon="cloud_download"
      dense
      header-class="text-primary"
      expand-icon-class="text-primary"
      default-opened
      class="q-mt-sm"
    >
      <q-card flat bordered class="q-pa-sm">
        <div class="row q-col-gutter-md nouveau-dossier-form__fields-row">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.code_tele_enreg"
              name="code_tele_enreg"
              :label="t('reception.nouveauDossier.codeTele')"
              outlined
              dense
              :required="fieldRequired('code_tele_enreg')"
              @click="onTeleBlur"
              @blur="onTeleBlur"
              @keyup.enter="onTeleBlur"
              @keydown.enter.prevent
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.code_secret"
              name="code_secret"
              :label="t('reception.nouveauDossier.codeSecret')"
              outlined
              dense
              :required="fieldRequired('code_secret')"
              type="password"
              @click="onTeleBlur"
              @blur="onTeleBlur"
              @keyup.enter="onTeleBlur"
              @keydown.enter.prevent
            />
          </div>
        </div>
        <q-banner v-if="t('reception.nouveauDossier.teleHint')" dense class="bg-blue-1 q-mt-sm">
          {{ t('reception.nouveauDossier.teleHint') }}
        </q-banner>

        <q-expansion-item
          v-if="store.teleClientFields.length"
          :label="t('reception.nouveauDossier.sectionTeleClient')"
          dense
          header-class="text-primary"
          expand-icon-class="text-primary"
          class="q-mt-sm"
          default-opened
        >
          <div class="row q-col-gutter-md q-pa-xs nouveau-dossier-form__fields-row">
            <div
              v-for="f in store.teleClientFields"
              :key="f.name"
              class="col-12 col-md-6"
            >
              <q-input
                :model-value="f.value"
                :name="f.name"
                :label="t(f.labelKey)"
                outlined
                dense
                readonly
              />
            </div>
          </div>
        </q-expansion-item>

        <q-inner-loading :showing="store.loadingTele" />
      </q-card>
    </q-expansion-item>

    <input type="hidden" name="code_circuit" :value="form.code_circuit" />
    <input type="hidden" name="lad" :value="form.lad" />
    <input type="hidden" name="code_centre" :value="form.code_centre" />
    <input type="hidden" name="code_pres" :value="form.code_pres" />
    <input type="hidden" name="code_natu_pres" :value="form.code_natu_pres" />
    <input type="hidden" name="code_natu_pres_register" :value="form.code_natu_pres_register" />

    <div class="row justify-center q-gutter-md q-mt-sm nouveau-dossier-form__actions">
      <q-btn
        flat
        no-caps
        color="grey-8"
        icon="refresh"
        padding="sm lg"
        label="Réinitialiser"
        @click="onReset"
      />
      <q-btn
        type="submit"
        color="primary"
        unelevated
        no-caps
        icon="save"
        padding="sm lg"
        :label="t('reception.nouveauDossier.save')"
        :loading="store.loadingSubmit"
        :disable="!store.fieldState.btEnreg?.enabled"
      />
    </div>
  </q-form>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useNouveauDossierStore } from 'src/stores/energizer/nouveauDossierStore.js'
import { useNouveauDossierRules } from 'src/composables/energizer/useNouveauDossierRules.js'
import {
  isFieldEnabled,
  isFieldRequired,
  isFieldVisibleInForm,
  isFieldActive,
} from 'src/utils/energizer/nouveauDossierFieldState.js'
import { normalizeMatriculeEmployeur } from 'src/api/assure/depotPrestationPfUtils.js'
import { isNouveauDossierFieldRequired } from 'src/utils/energizer/nouveauDossierFormUi.js'

const { t } = useI18n()
const store = useNouveauDossierStore()
const { form, fieldState } = storeToRefs(store)
const formRef = ref(null)

const {
  required,
  validateEmail,
  validateMatriculeAssure,
  validateMatriculeEmployeur,
  dateNotAfterToday,
  dateRangeEndAfterStart,
} = useNouveauDossierRules()

defineExpose({ formRef })

function visible(key) {
  return isFieldVisibleInForm(key, fieldState.value)
}

function enabled(key) {
  return isFieldEnabled(key, fieldState.value)
}

function active(key) {
  return isFieldActive(key, fieldState.value)
}

const formGroups = () => ({
  group00Visible: store.fieldState.group00?.visible,
  group03Visible: store.fieldState.group03?.visible,
})

function fieldRequired(key) {
  return isNouveauDossierFieldRequired(key, fieldState, formGroups())
}

function reqRule(key) {
  if (!active(key)) return []
  return isFieldRequired(key, fieldState.value)
    ? [required, dateNotAfterToday]
    : [dateNotAfterToday]
}

const numassuRules = computed(() =>
  active('numassu') ? [validateMatriculeAssure] : [],
)
const nomcompletRules = computed(() =>
  isFieldRequired('nomcomplet', fieldState.value) ? [required] : [],
)
const datedemandeRules = computed(() => reqRule('datedemande'))
const datecessationRules = computed(() =>
  active('datecessation') ? [required, dateNotAfterToday] : [],
)
const datedecesRules = computed(() =>
  active('datedeces') ? [required, dateNotAfterToday] : [],
)
const dateconstatinvalidRules = computed(() =>
  active('dateconstatinvalid') ? [required, dateNotAfterToday] : [],
)
const dateconstatincapaciteRules = computed(() =>
  active('dateconstatincapacite') ? [required, dateNotAfterToday] : [],
)
const natureprestationRules = computed(() =>
  active('natureprestation') ? [required] : [],
)
const tauxinvalideRules = computed(() =>
  active('tauxinvalide') ? [required] : [],
)
const dateaccidentRules = computed(() =>
  active('dateaccident') ? [required, dateNotAfterToday] : [],
)
const datedeclarationRules = computed(() =>
  active('datedeclaration')
    ? [required, dateNotAfterToday, dateRangeEndAfterStart(form.value.dateaccident)]
    : [],
)
const adresseRules = computed(() =>
  active('adresse') ? [required] : [],
)
const telephoneRules = computed(() =>
  active('telephone') ? [required] : [],
)
const typeimmasRules = computed(() =>
  active('typeimmas') ? [required] : [],
)
const revisionRules = computed(() =>
  active('revision') ? [required] : [],
)

function onNumassuChange(val) {
  if (!(val ?? '').trim()) {
    store.clearAssureFields()
  }
}

function onNumassuActivate() {
  if (active('numassu') && form.value.numassu?.trim()) {
    store.onNumassuEnter()
  }
}

function onNumassuLookup() {
  if (active('numassu')) {
    store.onNumassuEnter()
  }
}

function onMatEmployeurChange(val) {
  const normalized = normalizeMatriculeEmployeur(val)
  if (normalized !== form.value.mat_employeur) {
    form.value.mat_employeur = normalized
  }
  if (!normalized) {
    store.clearEmployeurFields()
  }
}

function onMatEmployeurActivate() {
  if (form.value.mat_employeur?.trim()) {
    store.onMatEmployeurEnter()
  }
}

function onMatEmployeurLookup() {
  store.onMatEmployeurEnter()
}

function onTeleBlur() {
  if (form.value.code_tele_enreg?.trim() && form.value.code_secret?.trim()) {
    store.runTeleimportation()
  }
}

function onReset() {
  store.resetFormFields()
}

function onSubmit() {
  store.submit(formRef.value)
}
</script>

<style scoped>
.nouveau-dossier-form {
  padding: 2px 4px 6px;
}

.nouveau-dossier-form__actions {
  width: 100%;
  margin-top: 8px;
  padding-top: 0;
}
</style>

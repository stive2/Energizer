<template>
  <q-form ref="formRef" class="nouveau-dossier-form" greedy @submit.prevent="onSubmit">
    <div class="text-subtitle1 text-primary text-weight-medium text-center q-mb-sm">
      {{ store.formTitle }}
    </div>

    <div class="row q-col-gutter-md nouveau-dossier-form__fields">
      <div v-if="visible('numassu')" class="col-12 col-md-6">
        <q-input
          v-model="form.numassu"
          v-bind="legacyFieldAttrs"
          name="numassu"
          :label="fieldLabel('numassu')"
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
          <template #prepend>
            <q-spinner v-if="store.loadingAssure" color="primary" size="20px" />
            <q-icon v-else :name="fieldIcon('numassu')" color="primary" />
          </template>
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
          v-bind="legacyFieldAttrs"
          name="nomcompletass"
          :label="fieldLabel('nomcompletass')"
          outlined
          dense
          readonly
          :disable="!enabled('nomcompletass')"
        >
          <template #prepend>
            <q-icon :name="fieldIcon('nomcompletass')" color="primary" />
          </template>
        </q-input>
      </div>

      <div v-if="visible('today')" class="col-12 col-md-6">
        <q-input
          v-model="form.today"
          v-bind="legacyFieldAttrs"
          name="today"
          :label="fieldLabel('today')"
          outlined
          dense
          readonly
          disable
        >
          <template #prepend>
            <q-icon :name="fieldIcon('today')" color="primary" />
          </template>
        </q-input>
      </div>

      <div v-if="visible('date_naiss')" class="col-12 col-md-6">
        <q-input
          v-model="form.date_naiss"
          v-bind="legacyFieldAttrs"
          name="date_naiss"
          :label="fieldLabel('date_naiss')"
          outlined
          dense
          readonly
          :disable="!enabled('date_naiss')"
        >
          <template #prepend>
            <q-icon :name="fieldIcon('date_naiss')" color="primary" />
          </template>
        </q-input>
      </div>

      <div v-if="visible('centre_ges')" class="col-12 col-md-6">
        <q-input
          v-model="form.centre_ges"
          v-bind="legacyFieldAttrs"
          name="centre_ges"
          :label="fieldLabel('centre_ges')"
          outlined
          dense
          readonly
          :disable="!enabled('centre_ges')"
        >
          <template #prepend>
            <q-icon :name="fieldIcon('centre_ges')" color="primary" />
          </template>
        </q-input>
      </div>

      <div v-if="visible('nomcomplet')" class="col-12 col-md-6">
        <q-input
          v-model="form.nomcomplet"
          v-bind="legacyFieldAttrs"
          name="nomcomplet"
          :label="fieldLabel('nomcomplet')"
          outlined
          dense
          :disable="!enabled('nomcomplet')"
          :required="fieldRequired('nomcomplet')"
          :rules="nomcompletRules"
          @update:model-value="(val) => upper('nomcomplet', val)"
        >
          <template #prepend>
            <q-icon :name="fieldIcon('nomcomplet')" color="primary" />
          </template>
        </q-input>
      </div>

      <div v-if="visible('nomtiers')" class="col-12 col-md-6">
        <q-input
          v-model="form.nomtiers"
          v-bind="legacyFieldAttrs"
          name="nomtiers"
          :label="fieldLabel('nomtiers')"
          outlined
          dense
          :disable="!enabled('nomtiers')"
          @update:model-value="(val) => upper('nomtiers', val)"
        >
          <template #prepend>
            <q-icon :name="fieldIcon('nomtiers')" color="primary" />
          </template>
        </q-input>
      </div>

      <div v-if="visible('datedemande')" class="col-12 col-md-6">
        <q-input
          v-model="form.datedemande"
          v-bind="legacyFieldAttrs"
          name="datedemande"
          :label="fieldLabel('datedemande')"
          outlined
          dense
          mask="##/##/####"
          :disable="!enabled('datedemande')"
          :required="fieldRequired('datedemande')"
          :rules="datedemandeRules"
        >
          <template #prepend>
            <q-icon :name="fieldIcon('datedemande')" color="primary" />
          </template>
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
            v-bind="legacyFieldAttrs"
            name="datecessation"
            :label="fieldLabel('datecessation')"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('datecessation')"
            :required="fieldRequired('datecessation')"
            :rules="datecessationRules"
          >
            <template #prepend>
              <q-icon :name="fieldIcon('datecessation')" color="primary" />
            </template>
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
            v-bind="legacyFieldAttrs"
            name="datedeces"
            :label="fieldLabel('datedeces')"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('datedeces')"
            :required="fieldRequired('datedeces')"
            :rules="datedecesRules"
          >
            <template #prepend>
              <q-icon :name="fieldIcon('datedeces')" color="primary" />
            </template>
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
            v-bind="legacyFieldAttrs"
            name="dateconstatinvalid"
            :label="fieldLabel('dateconstatinvalid')"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('dateconstatinvalid')"
            :required="fieldRequired('dateconstatinvalid')"
            :rules="dateconstatinvalidRules"
          >
            <template #prepend>
              <q-icon :name="fieldIcon('dateconstatinvalid')" color="primary" />
            </template>
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
            v-bind="legacyFieldAttrs"
            name="dateconstatincapacite"
            :label="fieldLabel('dateconstatincapacite')"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('dateconstatincapacite')"
            :required="fieldRequired('dateconstatincapacite')"
            :rules="dateconstatincapaciteRules"
          >
            <template #prepend>
              <q-icon :name="fieldIcon('dateconstatincapacite')" color="primary" />
            </template>
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
            v-bind="legacyFieldAttrs"
            name="datedemandeassuredecede"
            :label="fieldLabel('datedemandeassuredecede')"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('datedemandeassuredecede')"
            :required="fieldRequired('datedemandeassuredecede')"
            :rules="datedemandeassuredecedeRules"
          >
            <template #prepend>
              <q-icon :name="fieldIcon('datedemandeassuredecede')" color="primary" />
            </template>
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
            v-bind="legacyFieldAttrs"
            name="natureprestation"
            :label="fieldLabel('natureprestation')"
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
          >
            <template #prepend>
              <q-icon :name="fieldIcon('natureprestation')" color="primary" />
            </template>
          </q-select>
      </div>

      <div v-if="visible('tauxinvalide')" class="col-12 col-md-6">
          <q-input
            v-model.number="form.tauxinvalide"
            v-bind="legacyFieldAttrs"
            name="tauxinvalide"
            type="number"
            :label="fieldLabel('tauxinvalide')"
            outlined
            dense
            :disable="!enabled('tauxinvalide')"
            :required="fieldRequired('tauxinvalide')"
            :rules="tauxinvalideRules"
          >
            <template #prepend>
              <q-icon :name="fieldIcon('tauxinvalide')" color="primary" />
            </template>
          </q-input>
      </div>

      <div v-if="visible('dateaccident')" class="col-12 col-md-6">
          <q-input
            v-model="form.dateaccident"
            v-bind="legacyFieldAttrs"
            name="dateaccident"
            :label="fieldLabel('dateaccident')"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('dateaccident')"
            :required="fieldRequired('dateaccident')"
            :rules="dateaccidentRules"
          >
            <template #prepend>
              <q-icon :name="fieldIcon('dateaccident')" color="primary" />
            </template>
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
            v-bind="legacyFieldAttrs"
            name="datedeclaration"
            :label="fieldLabel('datedeclaration')"
            outlined
            dense
            mask="##/##/####"
            :disable="!enabled('datedeclaration')"
            :required="fieldRequired('datedeclaration')"
            :rules="datedeclarationRules"
          >
            <template #prepend>
              <q-icon :name="fieldIcon('datedeclaration')" color="primary" />
            </template>
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
            v-bind="legacyFieldAttrs"
            name="email"
            :label="fieldLabel('email')"
            outlined
            dense
            :disable="!enabled('email')"
            :rules="[validateEmail]"
          >
            <template #prepend>
              <q-icon :name="fieldIcon('email')" color="primary" />
            </template>
          </q-input>
      </div>

      <div v-if="visible('adresse')" class="col-12 col-md-6">
          <q-input
            v-model="form.adresse"
            v-bind="legacyFieldAttrs"
            name="adresse"
            :label="fieldLabel('adresse')"
            outlined
            dense
            :disable="!enabled('adresse')"
            :required="fieldRequired('adresse')"
            :rules="adresseRules"
            @update:model-value="(val) => upper('adresse', val)"
          >
            <template #prepend>
              <q-icon :name="fieldIcon('adresse')" color="primary" />
            </template>
          </q-input>
      </div>

      <div v-if="visible('telephone')" class="col-12 col-md-6">
          <q-input
            v-model="form.telephone"
            v-bind="legacyFieldAttrs"
            name="telephone"
            :label="fieldLabel('telephone')"
            outlined
            dense
            type="tel"
            prefix="+237"
            maxlength="9"
            :disable="!enabled('telephone')"
            :required="fieldRequired('telephone')"
            :rules="telephoneRules"
          >
            <template #prepend>
              <q-icon :name="fieldIcon('telephone')" color="primary" />
            </template>
          </q-input>
      </div>

      <div v-if="visible('typeimmas')" class="col-12 col-md-6">
          <q-select
            v-model="form.typeimmas"
            v-bind="legacyFieldAttrs"
            name="typeimmas"
            :label="fieldLabel('typeimmas')"
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
          >
            <template #prepend>
              <q-icon :name="fieldIcon('typeimmas')" color="primary" />
            </template>
          </q-select>
      </div>

      <div v-if="visible('revision')" class="col-12 col-md-6">
          <q-select
            v-model="form.revision"
            v-bind="legacyFieldAttrs"
            name="revision"
            :label="fieldLabel('revision')"
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
          >
            <template #prepend>
              <q-icon :name="fieldIcon('revision')" color="primary" />
            </template>
          </q-select>
      </div>

      <div v-if="visible('circuit')" class="col-12 col-md-6">
          <q-select
            v-model="form.circuit"
            v-bind="legacyFieldAttrs"
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
            :rules="circuitRules"
            @update:model-value="store.onCircuitSelect"
          >
            <template #prepend>
              <q-icon :name="fieldIcon('circuit')" color="primary" />
            </template>
          </q-select>
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
              v-bind="legacyFieldAttrs"
              name="mat_employeur"
              :label="t('reception.nouveauDossier.matEmployeur')"
              outlined
              dense
              :required="fieldRequired('mat_employeur')"
              :loading="store.loadingEmployeur"
              :rules="matEmployeurRules"
              :hint="t('reception.nouveauDossier.matEmployeurHint')"
              @update:model-value="onMatEmployeurChange"
              @click="onMatEmployeurActivate"
              @blur="onMatEmployeurActivate"
              @keyup.enter="onMatEmployeurLookup"
              @keydown.enter.prevent
            >
              <template #prepend>
                <q-spinner v-if="store.loadingEmployeur" color="primary" size="20px" />
                <q-icon v-else :name="fieldIcon('mat_employeur')" color="primary" />
              </template>
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
              v-bind="legacyFieldAttrs"
              name="raison_soc"
              :label="fieldLabel('raison_soc')"
              outlined
              dense
              readonly
            >
              <template #prepend>
                <q-icon :name="fieldIcon('raison_soc')" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.CODE_CENTRE"
              v-bind="legacyFieldAttrs"
              name="centre"
              :label="fieldLabel('centre')"
              outlined
              dense
              readonly
            >
              <template #prepend>
                <q-icon :name="fieldIcon('centre')" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.BOITE_POSTALE"
              v-bind="legacyFieldAttrs"
              name="boite_post"
              :label="fieldLabel('boite_post')"
              outlined
              dense
              readonly
            >
              <template #prepend>
                <q-icon :name="fieldIcon('boite_post')" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.REGIME_CNPS"
              v-bind="legacyFieldAttrs"
              name="regime"
              :label="fieldLabel('regime')"
              outlined
              dense
              readonly
            >
              <template #prepend>
                <q-icon :name="fieldIcon('regime')" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.CODE_GPE_RISQUE"
              v-bind="legacyFieldAttrs"
              name="risque"
              :label="fieldLabel('risque')"
              outlined
              dense
              readonly
            >
              <template #prepend>
                <q-icon :name="fieldIcon('risque')" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.ADRESSE_EMPLOYEUR"
              v-bind="legacyFieldAttrs"
              name="adresse_employeur"
              :label="fieldLabel('adresse_employeur')"
              outlined
              dense
              readonly
            >
              <template #prepend>
                <q-icon :name="fieldIcon('adresse_employeur')" color="primary" />
              </template>
            </q-input>
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
              v-bind="legacyFieldAttrs"
              name="code_tele_enreg"
              :label="t('reception.nouveauDossier.codeTele')"
              outlined
              dense
              :required="fieldRequired('code_tele_enreg')"
              :rules="codeTeleRules"
              @update:model-value="(val) => upper('code_tele_enreg', val)"
              @click="onTeleBlur"
              @blur="onTeleBlur"
              @keyup.enter="onTeleBlur"
              @keydown.enter.prevent
            >
              <template #prepend>
                <q-icon :name="fieldIcon('code_tele_enreg')" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.code_secret"
              v-bind="legacyFieldAttrs"
              name="code_secret"
              :label="t('reception.nouveauDossier.codeSecret')"
              outlined
              dense
              :required="fieldRequired('code_secret')"
              :rules="codeSecretRules"
              type="password"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              class="nouveau-dossier-form__secret-input"
              @click="onTeleBlur"
              @blur="onTeleBlur"
              @keyup.enter="onTeleBlur"
              @keydown.enter.prevent
            >
              <template #prepend>
                <q-icon :name="fieldIcon('code_secret')" color="primary" />
              </template>
            </q-input>
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
                v-bind="legacyFieldAttrs"
                :name="f.name"
                :label="t(f.labelKey)"
                outlined
                dense
                readonly
              >
                <template #prepend>
                  <q-icon name="info" color="primary" />
                </template>
              </q-input>
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
import { useNouveauDossierStore } from 'src/modules/energizer/stores/nouveauDossierStore.js'
import { useNouveauDossierRules } from 'src/modules/energizer/composables/useNouveauDossierRules.js'
import {
  isFieldEnabled,
  isFieldRequired,
  isFieldVisibleInForm,
  isFieldActive,
} from 'src/modules/energizer/utils/nouveauDossierFieldState.js'
import { normalizeMatriculeEmployeur } from 'src/modules/assure/api/depotPrestationPfUtils.js'
import { isNouveauDossierFieldRequired } from 'src/modules/energizer/utils/nouveauDossierFormUi.js'
import {
  LEGACY_QFIELD_VALIDATE_ATTRS,
  fieldIcon,
} from 'src/modules/energizer/utils/nouveauDossierFormFields.js'
import {
  buildLegacyTelephoneRules,
  setLegacyUppercaseText,
} from 'src/modules/energizer/utils/energizerFormInputUtils.js'

const legacyFieldAttrs = LEGACY_QFIELD_VALIDATE_ATTRS

const { t } = useI18n()
const store = useNouveauDossierStore()
const { form, fieldState } = storeToRefs(store)
const formRef = ref(null)

const {
  requiredField,
  validateEmail,
  validateMatriculeAssure,
  validateMatriculeEmployeur,
  dateNotAfterToday,
  dateRangeEndAfterStart,
} = useNouveauDossierRules()

function fieldLabel(key) {
  return t(`reception.nouveauDossier.fieldLabels.${key}`)
}

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
    ? [requiredField(key), dateNotAfterToday]
    : [dateNotAfterToday]
}

const numassuRules = computed(() =>
  active('numassu') ? [validateMatriculeAssure] : [],
)
const nomcompletRules = computed(() =>
  isFieldRequired('nomcomplet', fieldState.value) ? [requiredField('nomcomplet')] : [],
)
const datedemandeRules = computed(() => reqRule('datedemande'))
const datecessationRules = computed(() =>
  active('datecessation') ? [requiredField('datecessation'), dateNotAfterToday] : [],
)
const datedecesRules = computed(() =>
  active('datedeces') ? [requiredField('datedeces'), dateNotAfterToday] : [],
)
const dateconstatinvalidRules = computed(() =>
  active('dateconstatinvalid')
    ? [requiredField('dateconstatinvalid'), dateNotAfterToday]
    : [],
)
const dateconstatincapaciteRules = computed(() =>
  active('dateconstatincapacite')
    ? [requiredField('dateconstatincapacite'), dateNotAfterToday]
    : [],
)
const datedemandeassuredecedeRules = computed(() =>
  active('datedemandeassuredecede')
    ? [requiredField('datedemandeassuredecede'), dateNotAfterToday]
    : [],
)
const natureprestationRules = computed(() =>
  active('natureprestation') ? [requiredField('natureprestation')] : [],
)
const tauxinvalideRules = computed(() =>
  active('tauxinvalide') ? [requiredField('tauxinvalide')] : [],
)
const dateaccidentRules = computed(() =>
  active('dateaccident') ? [requiredField('dateaccident'), dateNotAfterToday] : [],
)
const datedeclarationRules = computed(() =>
  active('datedeclaration')
    ? [
        requiredField('datedeclaration'),
        dateNotAfterToday,
        dateRangeEndAfterStart(form.value.dateaccident),
      ]
    : [],
)
const adresseRules = computed(() =>
  active('adresse') ? [requiredField('adresse')] : [],
)
const telephoneRules = computed(() =>
  buildLegacyTelephoneRules(t, {
    required: active('telephone'),
    requiredMessage: t('reception.nouveauDossier.fieldMessages.telephone'),
  }),
)
const typeimmasRules = computed(() =>
  active('typeimmas') ? [requiredField('typeimmas')] : [],
)
const revisionRules = computed(() =>
  active('revision') ? [requiredField('revision')] : [],
)
const circuitRules = computed(() => [requiredField('circuit')])
const matEmployeurRules = computed(() => {
  if (!formGroups().group00Visible) return [validateMatriculeEmployeur]
  return [requiredField('mat_employeur'), validateMatriculeEmployeur]
})
const codeTeleRules = computed(() =>
  formGroups().group03Visible ? [requiredField('code_tele_enreg')] : [],
)
const codeSecretRules = computed(() =>
  formGroups().group03Visible ? [requiredField('code_secret')] : [],
)

function upper(field, val) {
  setLegacyUppercaseText(form.value, field, val)
}

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

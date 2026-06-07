<template>
  <q-dialog v-model="open" persistent full-width>
    <q-card
      :style="$q.screen.gt.sm ? 'width: 980px; max-width: 96vw' : 'width: 100%' "
      class="immat-main-card column no-wrap"
    >
      <q-card-section class="immat-header row items-center no-wrap q-px-md q-py-sm">
        <q-avatar size="32px" class="immat-header-avatar q-mr-sm">
          <q-icon name="business" size="20px" color="primary" />
        </q-avatar>
        <div class="col">
          <div class="text-subtitle1 text-white text-weight-bold ellipsis">
            {{ t(service.name) }}
          </div>
          <div class="text-caption text-white text-opacity-80">
            {{ $t('immep.step' + step) }}
          </div>
        </div>
        <q-btn flat round dense icon="close" color="white" class="q-ml-sm" @click="closeDialog">
          <q-tooltip>{{ $t('form.cancel') }}</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-form
        ref="formRef"
        class="col column immat-form"
        greedy
        reactive-rules
        @submit.prevent="dialValidation = true"
      >
        <q-scroll-area class="col immat-scroll-area">
          <q-inner-loading :showing="loadingInit" :label="referentialsLoadingLabel" />
          <q-card-section v-if="referentialsError && !loadingInit" class="q-pb-none">
            <q-banner rounded class="bg-negative text-white">
              <template #avatar><q-icon name="cloud_off" /></template>
              {{ referentialsError }}
              <template #action>
                <q-btn
                  flat
                  color="white"
                  :label="$t('form.retry')"
                  icon="refresh"
                  @click="loadFormBootstrap"
                />
              </template>
            </q-banner>
          </q-card-section>

          <q-card-section class="immat-stepper-section q-pt-sm q-pb-md">
          <q-stepper
            v-model="step"
            :vertical="!$q.screen.gt.sm"
            color="primary"
            done-color="positive"
            error-color="negative"
            :inactive-color="maxStep >= step ? 'primary' : 'grey-5'"
            animated
            header-nav
            flat
            class="immat-stepper"
          >
            <!-- Etape 1 : Informations sur l'employeur -->
            <q-step
              :name="1"
              :title="$t('immep.step1')"
              icon="business"
              :done="step > 1"
              :disable="!isStepAllowed(1)"
            >
              <div class="immat-field-row">
                <q-input
                  v-model="form.RAISON_SOCIALE"
                  :label="$t('input.raisonSociale')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.RAISON_SOCIALE = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ t('input.raisonSociale') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.NOM_COMMERCIAL"
                  :label="$t('input.nomCommercial')"
                  class="immat-field-cell full-width"
                  outlined
                  dense
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.NOM_COMMERCIAL = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ t('input.nomCommercial') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.Sigle"
                  :label="$t('input.sigle')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.Sigle = val.toUpperCase())"
                />
                <q-select
                  v-model="form.CODE_ARRONDC"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  option-value="CODE_ARROND"
                  :label="$t('input.arrondissement')"
                  outlined
                  dense
                  :disable="!referentialsReady"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                  class="immat-field-cell full-width"
                >
                  <template v-slot:label>
                    {{ t('input.arrondissement') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-select>
                <q-input
                  v-model="form.BOITE_POSTALE"
                  :label="$t('input.boitePostale')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.BOITE_POSTALE = val.toUpperCase())"
                />
                <q-input
                  v-model="form.ADRESSE_EMPL"
                  :label="$t('input.adresse')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.ADRESSE_EMPL = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ t('input.adresse') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.NOM_QUARTIER"
                  :label="$t('input.quartier')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.NOM_QUARTIER = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ t('input.quartier') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.LIEUDIT_EMPL"
                  :label="$t('input.lieuDit')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.LIEUDIT_EMPL = val.toUpperCase())"
                />
                <q-input
                  v-model="form.num_case"
                  :label="$t('input.numLogement')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.num_case = val.toUpperCase())"
                />
                <q-input
                  v-model="form.EMAIL"
                  :label="$t('input.email')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  type="email"
                  :rules="[
                    required,
                    (val) => regexPatterns.email.test(val) || '(ex: adresse@email.com)',
                  ]"
                >
                  <template v-slot:label>
                    {{ t('input.email') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.TEL"
                  :label="$t('input.telephone')"
                  outlined
                  dense
                  prefix="+237"
                  type="tel"
                  maxlength="9"
                  class="immat-field-cell full-width"
                  :rules="[
                    required,
                    (val) => regexPatterns.telephone.test(val) || t('input.invalidPhone'),
                  ]"
                >
                  <template v-slot:label>
                    {{ t('input.telephone') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.AUTRE_CONTACT"
                  :label="$t('input.autreContact')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.AUTRE_CONTACT = val.toUpperCase())"
                />
                <div class="immat-date-row">
                <q-input
                  v-model="form.DATE_DEB_SERVICE"
                  :label="$t('input.dateOuverture')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.DATE_DEB_SERVICE"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          locale="fr"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ t('input.dateOuverture') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.date_creation_empl"
                  :label="$t('input.dateCreation')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.date_creation_empl"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :locale="locale"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.DATE_EFFET"
                  :label="$t('input.dateEmbauche')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.DATE_EFFET"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :locale="locale"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                </div>
                <q-input
                  v-model="form.num_registre"
                  :label="$t('input.numRegistreCommerce')"
                  class="immat-field-cell full-width"
                  outlined
                  dense
                  :rules="[(val) => !val || regexPatterns.regComm.test(val) || '(ex: RC/YAO/2020/B/0002)']"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.num_registre = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ t('input.numRegistreCommerce') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.num_contr"
                  :label="$t('input.numContribuable')"
                  class="immat-field-cell full-width"
                  outlined
                  dense
                  :rules="[
                    (val) =>
                      !val ||
                      regexPatterns.numContr.test(val) ||
                      'Format invalide (ex: P123456789321M)',
                  ]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.num_contr = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ t('input.numContribuable') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <div class="col-12">
                  <div class="step-section-header">
                    <q-icon name="attach_file" class="q-mr-xs" size="18px" />
                    {{ $t('immep.step5') }}
                  </div>
                </div>
                <q-file
                  v-model="formFile.IDREGICOMM"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  label=""
                  accept=".gif,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || t('input.requis'), fileTypeImage]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" color="primary" />
                  </template>
                  <template v-slot:label>
                    {{ t('input.registreCommerce') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-file>
                <q-file
                  v-model="formFile.IDAUTORISATION"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  label=""
                  accept=".gif,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || t('input.requis'), fileTypeImage]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" color="primary" />
                  </template>
                  <template v-slot:label>
                    {{ t('input.autorisationOuverture') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-file>
                <q-file
                  v-model="formFile.IDCONTRIBUABLE"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :label="$t('input.carteContribuable')"
                  accept=".gif,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" color="primary" />
                  </template>
                </q-file>
              </div>

            </q-step>

            <!-- Etape 2 : Localisation et contact employeur + gestion CNPS -->
            <q-step
              :name="2"
              :title="$t('immep.step2')"
              icon="location_on"
              :done="step > 2"
              :disable="!isStepAllowed(2)"
            >
              <div class="step-section-header">
                <q-icon name="location_on" class="q-mr-xs" size="18px" />
                {{ $t('immep.step2') }}
              </div>
              <div class="immat-field-row">
                <div class="col-12">
                  <q-expansion-item
                    v-model="succursaleExpanded"
                    icon="corporate_fare"
                    :label="$t('input.isSuccursale')"
                    dense
                    header-class="text-primary text-weight-bold immat-expansion-header"
                    class="immat-expansion"
                  >
                    <div class="immat-field-row q-pa-sm">
                      <q-checkbox
                        name="is_succursale"
                        v-model="form.isSuccursale"
                        :label="$t('input.isSuccursale')"
                        color="primary"
                        dense
                        class="col-12"
                      />
                      <q-input
                        v-model="form.NUM_EMPL_SIEGE"
                        v-if="form.isSuccursale"
                        :label="$t('input.matriculeSiege')"
                        class="immat-field-cell full-width"
                        style="text-transform: uppercase"
                        :loading="loadingSiege"
                        :disable="!referentialsReady"
                        @update:model-value="(val) => (form.NUM_EMPL_SIEGE = val.toUpperCase())"
                        @blur="rechercherSiege"
                        outlined
                        dense
                        :rules="[
                          required,
                          (val) =>
                            regexPatterns.numEmpl1.test(val) ||
                            regexPatterns.numEmpl2.test(val) ||
                            '(ex: 321-1234567-A ou 321-1234567-000-M)',
                        ]"
                      >
                        <template v-slot:label>
                          {{ t('input.matriculeSiege') }}
                          <span class="required-badge">{{ t('input.requis') }}</span>
                        </template>
                      </q-input>
                      <q-input
                        v-model="form.RAISON_SOCIALE_SIEGE"
                        v-if="form.isSuccursale"
                        :label="$t('input.raisonSocialeSiege')"
                        class="immat-field-cell full-width"
                        outlined
                        dense
                        readonly
                        style="text-transform: uppercase"
                      />
                      <q-input
                        v-model="form.NOM_COMMERCIAL_SIEGE"
                        v-if="form.isSuccursale"
                        :label="$t('input.nomCommercialSiege')"
                        class="immat-field-cell full-width"
                        outlined
                        dense
                        readonly
                        style="text-transform: uppercase"
                      />
                    </div>
                  </q-expansion-item>
                </div>

                <div class="col-12">
                  <div class="step-section-header">
                    <q-icon name="account_balance" class="q-mr-xs" size="18px" />
                    {{ $t('immep.step3') }}
                  </div>
                </div>

                <q-select
                  v-model="form.CAUSE_IMMA"
                  :options="causeImmaOptions"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  :label="$t('input.origineImmatriculation')"
                  outlined
                  dense
                  :rules="[required]"
                  class="immat-field-cell full-width"
                >
                  <template v-slot:label>
                    {{ t('input.origineImmatriculation') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-select>
                <q-select
                  v-model="form.CIRCUIT_DOSSIER"
                  :options="circuitDossierOptions"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  :label="$t('input.origineDossier')"
                  outlined
                  dense
                  :rules="[required]"
                  class="immat-field-cell full-width"
                >
                  <template v-slot:label>
                    {{ t('input.origineDossier') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-select>

                <q-select
                  v-model="form.NATURE_JURC"
                  :options="formeJuridique"
                  option-label="LIBELLE_NATUREJUR"
                  option-value="CODE_NATUREJUR"
                  :label="$t('input.formeJuridique')"
                  outlined
                  dense
                  :disable="!referentialsReady"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterFormeJuridique"
                  :rules="[required]"
                  class="immat-field-cell full-width"
                >
                  <template v-slot:label>
                    {{ t('input.formeJuridique') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-select>
                <q-select
                  v-model="form.CODE_SECT_ACTIVITEC"
                  :options="activites"
                  v-model-options="{ trackBy: 'LIBELLE_SECT_ACTIVITE' }"
                  option-label="LIBELLE_SECT_ACTIVITE"
                  option-value="CODE_SECT_ACTIVITE"
                  :label="$t('input.activiteEconomique')"
                  outlined
                  dense
                  :disable="!referentialsReady"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterActivites"
                  :rules="[required]"
                  class="immat-field-cell full-width"
                >
                  <template v-slot:label>
                    {{ t('input.activiteEconomique') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-select>
                <q-input
                  v-model="form.NBRE_EMPL"
                  :label="$t('input.nombreTravailleurs')"
                  outlined
                  dense
                  type="number"
                  min="1"
                  class="immat-field-cell full-width"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ t('input.nombreTravailleurs') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-input
                  :model-value="activites.find((a) => String(a.CODE_SECT_ACTIVITE) === String(form.CODE_SECT_ACTIVITEC))?.REGIME_CNPS || ''"
                  :label="$t('input.regimeCNPS')"
                  outlined
                  dense
                  readonly
                  class="immat-field-cell full-width readonly-field"
                  :rules="[required]"
                />
                <q-input
                  :model-value="activites.find((a) => String(a.CODE_SECT_ACTIVITE) === String(form.CODE_SECT_ACTIVITEC))?.DESCRIPTION || ''"
                  :label="$t('input.groupeRisque')"
                  outlined
                  dense
                  readonly
                  class="immat-field-cell full-width readonly-field"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.CODE_CENTREIMPOTC"
                  :options="impots"
                  option-label="ABREVIATION"
                  option-value="CODE_CENTREIMPOT"
                  :label="$t('input.centreImpots')"
                  outlined
                  dense
                  :disable="!referentialsReady"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterImpots"
                  @update:model-value="onCentreImpotsSelected"
                  :rules="[required]"
                  class="immat-field-cell full-width"
                >
                  <template v-slot:label>
                    {{ t('input.centreImpots') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-select>
                <q-select
                  v-model="form.CODE_CENTRECNPSC"
                  :options="centres"
                  option-label="LIB_CENTRE"
                  option-value="CODE_CENTRE"
                  :label="$t('input.centreCNPS')"
                  outlined
                  dense
                  :disable="!referentialsReady"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterCentreCNPS"
                  @update:model-value="onCentreCnpsSelected"
                  :rules="[required]"
                  class="immat-field-cell full-width"
                >
                  <template v-slot:label>
                    {{ t('input.centreCNPS') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-select>
                <div class="col-12">
                  <div class="step-section-header">
                    <q-icon name="folder" class="q-mr-xs" size="18px" />
                    {{ $t('immep.step5') }}
                  </div>
                </div>
                <q-file
                  v-model="formFile.IDPLANLOCAL"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  accept=".gif,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || t('input.requis'), fileTypeImage]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend><q-icon name="attach_file" color="primary" /></template>
                  <template v-slot:label>
                    {{ t('input.planLocalisation') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-file>
                <q-file
                  v-model="formFile.IDCONTRATBAIL"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :label="$t('input.contratbail')"
                  accept=".gif,.jpg,.jpeg,.png,.pdf"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend><q-icon name="attach_file" color="primary" /></template>
                </q-file>
                <q-file
                  v-model="formFile.IDLISTTRAV"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  accept=".gif,.jpg,.jpeg,.png,.xls,.xlsx,.doc,.docx"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || t('input.requis'), fileTypeImage]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend><q-icon name="attach_file" color="primary" /></template>
                  <template v-slot:label>
                    {{ t('input.listeTravailleurs') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-file>
                <q-file
                  v-model="formFile.IDPATENTE"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :label="$t('input.patente')"
                  accept=".gif,.jpg,.jpeg,.png,.pdf"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend><q-icon name="attach_file" color="primary" /></template>
                </q-file>
                <q-file
                  v-model="formFile.IDIMPOT"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  accept=".gif,.jpg,.jpeg,.png,.pdf"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend><q-icon name="attach_file" color="primary" /></template>
                  <template v-slot:label>{{ t('input.impotLiberatoire') }}</template>
                </q-file>
                <q-file
                  v-model="formFile.IDSTATUTS"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :label="$t('input.statuts')"
                  accept=".gif,.jpg,.jpeg,.png,.pdf"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend><q-icon name="attach_file" color="primary" /></template>
                </q-file>
              </div>
            </q-step>

            <!-- Etape 3 : Informations du promoteur -->
            <q-step
              :name="3"
              :title="$t('immep.step4')"
              icon="person"
              :done="step > 3"
              :disable="!isStepAllowed(3)"
            >
              <div class="step-section-header">
                <q-icon name="person" class="q-mr-xs" size="18px" />
                {{ $t('immep.step4') }}
              </div>
              <div class="immat-field-row">
                <q-input
                  v-model="form.NOM_PERSEMPL"
                  :label="$t('input.nomResponsable')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.NOM_PERSEMPL = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ t('input.nomResponsable') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.PRENOM_PERSEMPL"
                  :label="$t('input.prenomResponsable')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.PRENOM_PERSEMPL = val.toUpperCase())"
                />
                <q-input
                  v-model="form.DATE_NAISS_PERSEMPL"
                  :label="$t('input.dateNaissanceResponsable')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.DATE_NAISS_PERSEMPL"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :locale="locale"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ t('input.dateNaissanceResponsable') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.LOCALITE_NAISS_PERSEMPL"
                  :label="$t('input.lieuNaissanceResponsable')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.LOCALITE_NAISS_PERSEMPL = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" color="primary" />
                  </template>
                  <template v-slot:label>
                    {{ t('input.lieuNaissanceResponsable') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-select
                  v-model="form.LieuNaissPe"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  option-value="CODE_ARROND"
                  :label="$t('input.arrondissementNaissanceResponsable')"
                  outlined
                  dense
                  :disable="!referentialsReady"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                  class="immat-field-cell full-width"
                >
                  <template v-slot:label>
                    {{ t('input.arrondissementNaissanceResponsable') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-select>
                <q-select
                  v-model="form.SEXE_PERSEMPL"
                  :options="['FEMININ', 'MASCULIN']"
                  :label="$t('input.sexeResponsable')"
                  outlined
                  dense
                  input-debounce="0"
                  fill-input
                  :rules="[required]"
                  class="immat-field-cell full-width"
                >
                  <template v-slot:label>
                    {{ t('input.sexeResponsable') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-select>
                <q-select
                  v-model="form.NATIONALITEC"
                  :options="pays"
                  option-label="nationalite"
                  option-value="code_pays"
                  :label="$t('input.nationaliteResponsable')"
                  outlined
                  dense
                  :disable="!referentialsReady"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPays"
                  :rules="[required]"
                  class="immat-field-cell full-width"
                >
                  <template v-slot:label>
                    {{ t('input.nationaliteResponsable') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-select>

                <q-input
                  v-model="form.ADR_PERSEMPL"
                  :label="$t('input.adresseResponsable')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.ADR_PERSEMPL = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ t('input.adresseResponsable') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.BP_PERSEMPL"
                  :label="$t('input.boitePostaleResponsable')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.BP_PERSEMPL = val.toUpperCase())"
                />
                <q-input
                  v-model="form.TEL_PERSEMPL"
                  :label="$t('input.telephoneResponsable')"
                  outlined
                  dense
                  type="tel"
                  maxlength="9"
                  prefix="+237"
                  class="immat-field-cell full-width"
                  :rules="[
                    required,
                    (val) => regexPatterns.telephone.test(val) || t('input.invalidPhone'),
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" color="primary" />
                  </template>
                  <template v-slot:label>
                    {{ t('input.telephoneResponsable') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.EMAIL_PERSEMPL"
                  :label="$t('input.emailResponsable')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  type="email"
                  :rules="[
                    required,
                    (val) => regexPatterns.email.test(val) || '(ex: adresse@email.com)',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" color="primary" />
                  </template>
                  <template v-slot:label>
                    {{ t('input.emailResponsable') }}
                    <span class="required-badge">{{ t('input.requis') }}</span>
                  </template>
                </q-input>
                <q-select
                  v-model="form.NUM_TYPEPIECE"
                  :options="pieces"
                  option-label="LIBELLE"
                  option-value="NUM_TYPEPIECE"
                  :label="$t('input.pieceIdentiteResponsable')"
                  outlined
                  dense
                  :disable="!referentialsReady"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPieces"
                  @update:model-value="onTypePieceSelected"
                  class="immat-field-cell full-width"
                />
                <q-input
                  v-model="form.NUM_PIECE"
                  :label="$t('input.numPieceIdentiteResponsable')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.NUM_PIECE = val.toUpperCase())"
                />
                <q-input
                  v-model="form.DATE_PIECE"
                  :label="$t('input.dateDelivrancePieceIdentiteResponsable')"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.DATE_PIECE"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :locale="locale"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-select
                  v-model="form.LIEU_PIECEC"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  option-value="CODE_ARROND"
                  :label="$t('input.lieuDelivrancePieceIdentitePromoteur')"
                  outlined
                  dense
                  :disable="!referentialsReady"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  class="immat-field-cell full-width"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" color="primary" />
                  </template>
                </q-select>
                <q-file
                  v-if="form.NUM_TYPEPIECE"
                  v-model="formFile.fichierIdentiteResponsable"
                  outlined
                  dense
                  class="immat-field-cell full-width"
                  accept=".gif,.jpg,.jpeg,.png,.pdf"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[fileTypeDoc]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" color="primary" />
                  </template>
                  <template v-slot:label>
                    {{ pieceIdentiteScanLabel }}
                  </template>
                </q-file>
              </div>

            </q-step>

            <!-- Etape 4 : Résumé -->
            <q-step
              :name="4"
              :title="$t('immep.resume')"
              icon="check_circle"
              :done="step > 4"
              :disable="!isStepAllowed(4)"
            >
              <div class="q-pa-sm recap-container" ref="recapContent">
                <!-- Hero recap -->
                <div class="recap-hero q-mb-lg">
                  <div class="recap-hero-icon">
                    <q-icon name="fact_check" size="42px" color="white" />
                  </div>
                  <div class="recap-hero-content">
                    <div :class="dynamicTextClass">{{ $t('immep.resume') }}</div>
                    <div class="text-body2 text-grey-7 q-mt-xs">
                      Vérifiez les informations avant la soumission finale
                    </div>
                    <q-linear-progress
                      :value="1"
                      size="6px"
                      color="primary"
                      track-color="grey-3"
                      class="q-mt-sm rounded-borders"
                      style="max-width: 340px"
                    />
                  </div>
                </div>

                <div class="row q-col-gutter-md">
                  <div
                    v-for="section in recapSections"
                    :key="section.step"
                    class="col-12 col-lg-6"
                  >
                    <q-card
                      flat
                      bordered
                      class="recap-card q-mb-sm"
                    >
                      <q-card-section class="recap-card-header q-py-sm q-px-md">
                        <div class="row items-center no-wrap">
                          <q-avatar size="32px" class="recap-card-avatar q-mr-sm">
                            <q-icon :name="section.icon" size="18px" color="primary" />
                          </q-avatar>
                          <div class="col">
                            <div class="text-subtitle2 text-weight-bold text-white">
                              {{ section.title }}
                            </div>
                            <div class="text-caption text-white text-opacity-80">
                              Étape {{ section.step }}
                            </div>
                          </div>
                          <q-btn
                            flat
                            round
                            color="white"
                            icon="edit"
                            size="sm"
                            class="hover-scale"
                            @click="step = section.step"
                          >
                            <q-tooltip>{{ $t('form.edit') }}</q-tooltip>
                          </q-btn>
                        </div>
                      </q-card-section>
                      <q-card-section class="q-pa-none">
                        <q-list separator dense>
                          <q-item
                            v-for="(row, idx) in section.items"
                            :key="idx"
                            class="recap-item"
                          >
                            <q-item-section avatar>
                              <q-icon :name="row.icon" color="primary" size="sm" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="recap-label">
                                {{ row.label }}
                              </q-item-label>
                              <q-item-label class="recap-value">
                                {{ row.value }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-step>
          </q-stepper>
          </q-card-section>
        </q-scroll-area>

        <q-separator />
        <q-card-actions align="right" class="immat-step-footer q-pa-sm q-px-md">
          <q-btn
            v-if="step > 1"
            outline
            color="primary"
            :label="$t('form.previous')"
            icon="arrow_back"
            no-caps
            @click="goToPreviousStep"
          />
          <q-btn
            v-if="step === 4"
            outline
            color="primary"
            icon="picture_as_pdf"
            :label="$t('form.pdf')"
            no-caps
            class="q-ml-sm"
            @click="previewPDF"
          />
          <q-space />
          <q-btn
            v-if="step < 4"
            color="primary"
            unelevated
            :label="$t('form.next')"
            icon-right="arrow_forward"
            no-caps
            @click="goToNextStep(step + 1)"
          />
          <q-btn
            v-else
            type="submit"
            color="primary"
            unelevated
            no-caps
            class="q-px-lg text-weight-bold"
            icon-right="send"
            :label="$t('form.submit')"
          />
        </q-card-actions>
      </q-form>

      <q-dialog v-model="pdfDialog" maximized>
        <q-card>
          <q-card-section class="bg-primary text-white row items-center justify-between q-py-sm">
            <div class="text-h6">{{ $t('form.preview', 'Aperçu PDF') }}</div>
            <q-btn icon="close" flat round dense color="white" @click="pdfDialog = false" />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <iframe :src="pdfBlobUrl" width="100%" height="600px" style="border: none"></iframe>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn
              color="primary"
              unelevated
              icon="download"
              no-caps
              :label="$t('form.pdf')"
              @click="downloadPDF"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="dialValidation" persistent>
        <q-card class="confirmation-card" style="min-width: 340px; max-width: 480px">
          <q-card-section class="bg-primary text-white row items-center no-wrap q-py-sm">
            <q-icon name="verified" size="md" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bold col">{{ $t('form.confirmationTitle') }}</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              color="white"
              @click="dialValidation = false"
            />
          </q-card-section>

          <q-card-section>
            <div class="confirmation-message text-body2 q-mb-md">
              <q-icon name="info" color="primary" class="q-mr-xs" />
              {{ $t('form.confirmationMessage') }}
            </div>
            <div class="text-subtitle2 text-weight-medium q-mb-sm text-primary">
              {{ $t('immep.confirmSubmit') }}
            </div>
            <q-option-group
              v-model="form.validation"
              :options="validationOptions"
              color="primary"
              inline
              class="q-mt-sm"
            />
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              flat
              :label="$t('form.cancel')"
              color="grey-7"
              no-caps
              @click="dialValidation = false"
            />
            <q-btn
              unelevated
              color="primary"
              icon="send"
              no-caps
              :label="$t('form.confirm')"
              :disable="form.validation !== true"
              :loading="spinner"
              @click="submitForm"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>
  </q-dialog>

  <q-dialog v-model="spinner" persistent>
    <q-spinner-cube size="xl" color="primary" />
  </q-dialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useNotify } from 'src/modules/shared/components/useNotify.js'
import { regexPatterns } from 'src/js/regex.js'
import { useI18n } from 'vue-i18n'
import html2pdf from 'html2pdf.js'
import { submitGererEmployeur } from 'src/modules/immatriculations/api/immatEmployeurApi.js'
import {
  fetchEmployeurTele,
  fetchImmatEmpProReferentials,
  fetchSiegeEmployeurByMatricule,
} from 'src/modules/immatriculations/api/teleImmatEmployeurApi.js'
import {
  applyEmployeurProTeleToForm,
  applySiegeEmployeurToForm,
} from 'src/modules/immatriculations/adapters/employeurProTeleAdapter.js'
import { TELE_IMMAT_DEST_EMP_PRO } from 'src/modules/shared/config/teleImmat.js'
import {
  buildImmatEmpProLegacyFormData,
  getCauseImmaOptions,
  getCircuitDossierOptions,
  syncImmatEmpProHiddenFields,
  validateImmatEmpProBusinessRules,
} from 'src/modules/immatriculations/utils/immatEmpProLegacy.js'

const props = defineProps({
  service: Object,
  codeTele: { type: String, default: '' },
  codeSecret: { type: String, default: '' },
})

const $q = useQuasar()

const { t, locale } = useI18n()
const emit = defineEmits(['close'])

const { notifyError, notifySuccess, notifyInfo } = useNotify()

const causeImmaOptions = getCauseImmaOptions()
const circuitDossierOptions = getCircuitDossierOptions()

const open = ref(true)
const step = ref(1)
const maxStep = ref(1)
const formRef = ref(null)
const displayDate = ref('')
const spinner = ref(false)
const pdfDialog = ref(false)
const dialValidation = ref(false)
const pdfBlobUrl = ref(null)
const recapContent = ref()

const loadingInit = ref(false)
const loadingSiege = ref(false)
const referentialsReady = ref(false)
const referentialsError = ref(null)
const referentialsLoadingLabel = ref('')

const referentialsSource = ref({
  arrondissements: [],
  activites: [],
  centres: [],
  formeJuridique: [],
  impots: [],
  pays: [],
  pieces: [],
})

const arrondissements = ref([])
const activites = ref([])
const centres = ref([])
const formeJuridique = ref([])
const impots = ref([])
const pays = ref([])
const pieces = ref([])

function getReferentialsSnapshot() {
  return referentialsSource.value
}

function applyReferentials(refs) {
  referentialsSource.value = {
    arrondissements: refs.arrondissements ?? [],
    activites: refs.activites ?? [],
    centres: refs.centres ?? [],
    formeJuridique: refs.formeJuridique ?? [],
    impots: refs.impots ?? [],
    pays: refs.pays ?? [],
    pieces: refs.pieces ?? [],
  }
  arrondissements.value = [...referentialsSource.value.arrondissements]
  activites.value = [...referentialsSource.value.activites]
  centres.value = [...referentialsSource.value.centres]
  formeJuridique.value = [...referentialsSource.value.formeJuridique]
  impots.value = [...referentialsSource.value.impots]
  pays.value = [...referentialsSource.value.pays]
  pieces.value = [...referentialsSource.value.pieces]
  form.value.Dest = TELE_IMMAT_DEST_EMP_PRO
  referentialsReady.value = true
}

async function loadFormBootstrap() {
  loadingInit.value = true
  referentialsReady.value = false
  referentialsError.value = null
  try {
    referentialsLoadingLabel.value = t('immat.referentials.loadingLists')
    const refs = await fetchImmatEmpProReferentials()
    applyReferentials(refs)
  } catch (e) {
    referentialsError.value = e?.message || t('immat.referentials.error')
    notifyError(referentialsError.value)
  } finally {
    loadingInit.value = false
    referentialsLoadingLabel.value = t('immat.referentials.loading')
  }

  const ct = props.codeTele || form.value.code_tele
  const cs = props.codeSecret || form.value.code_secret
  if (ct && cs && referentialsReady.value) {
    await loadExistingDossier(ct, cs)
  }
}

async function loadExistingDossier(codeTele, codeSecret) {
  try {
    $q.loading.show({ message: t('immat.controle.loading', 'Chargement du dossier…') })
    const row = await fetchEmployeurTele(codeTele, codeSecret)
    const { exploited, needsSiegeLookup } = applyEmployeurProTeleToForm(form.value, row)
    form.value.code_tele = codeTele
    form.value.code_secret = codeSecret
    syncImmatEmpProHiddenFields(form.value, getReferentialsSnapshot())
    if (exploited) {
      notifyError(t('immat.controle.dossierExploite', 'Ce dossier a déjà été exploité.'))
    }
    if (needsSiegeLookup && form.value.NUM_EMPL_SIEGE) {
      await rechercherSiege()
    }
  } catch (e) {
    notifyError(e?.message || t('messages.error'))
  } finally {
    $q.loading.hide()
  }
}

onMounted(() => {
  referentialsLoadingLabel.value = t('immat.referentials.loading')
  loadFormBootstrap()
})

const form = ref({
  TYPE_EMPLOYEUR: '1',
  objet: 'Empl',
  laction: 'Creer',
  code_tele: '',
  code_secret: '',
  RAISON_SOCIALE: '',
  NOM_COMMERCIAL: '',
  Sigle: '',
  ADRESSE_EMPL: '',
  NOM_QUARTIER: '',
  EMAIL: '',
  TEL: '',
  NOM_PERSEMPL: '',
  PRENOM_PERSEMPL: '',
  CODE_CENTREIMPOTC: '',
  CODE_CENTREIMPOT: '',
  CODE_CENTRECNPSC: '',
  CODE_CENTRECNPS: '',
  CAUSE_IMMA: '',
  CAUSEIMMA: '',
  CIRCUIT_DOSSIER: '',
  CIRCUITDOSSIER: '',
  NATURE_JURC: '',
  CODE_NATUREJUR: '',
  NBRE_EMPL: '',
  CODE_SECT_ACTIVITEC: '',
  CODE_SECT_ACTIVITE: '',
  CODE_REGIME: '',
  CODE_GPE_RISQUE: '',
  A_VERIFIER: '',
  CODE_ARRONDC: '',
  CODE_ARROND: '',
  CODE_PAYS: '',
  CODE_REGION: '',
  CODE_DEPA: '',
  LIEUDIT_EMPL: '',
  BOITE_POSTALE: '',
  num_case: '',
  AUTRE_CONTACT: '',
  DATE_DEB_SERVICE: '',
  date_creation_empl: '',
  DATE_EFFET: '',
  num_registre: '',
  num_contr: '',
  isSuccursale: false,
  NOM_COMMERCIAL_SIEGE: '',
  RAISON_SOCIALE_SIEGE: '',
  NUM_EMPL_SIEGE: '',
  validation: false,
  LOCALITE_NAISS_PERSEMPL: '',
  DATE_NAISS_PERSEMPL: '',
  LieuNaissPe: '',
  LIEU_NAISS_PERSEMPL: '',
  SEXE_PERSEMPL: '',
  NATIONALITEC: '',
  NATIONALITE: '',
  TEL_PERSEMPL: '',
  BP_PERSEMPL: '',
  ADR_PERSEMPL: '',
  EMAIL_PERSEMPL: '',
  NUM_TYPEPIECE: '',
  typepiece: '',
  NUM_PIECE: '',
  DATE_PIECE: '',
  LIEU_PIECEC: '',
  LIEU_PIECE: '',
  CODE_PAYS_PIECE: '',
  CODE_REGION_PIECE: '',
  CODE_DEPA_PIECE: '',
  CODE_PAYS_NAISSEMPL: '',
  CODE_REGION_NAISSEMPL: '',
  CODE_DEPA_NAISSEMPL: '',
  Dest: '',
  _cnpsManual: false,
})

const formFile = ref({
  IDREGICOMM: null,
  IDAUTORISATION: null,
  IDPLANLOCAL: null,
  IDCONTRATBAIL: null,
  IDLISTTRAV: null,
  IDPATENTE: null,
  IDIMPOT: null,
  IDSTATUTS: null,
  IDCONTRIBUABLE: null,
  fichierIdentiteResponsable: null,
})

const optionsDn = (date) => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = ('0' + (today.getMonth() + 1)).slice(-2)
  const dd = ('0' + today.getDate()).slice(-2)
  const todayStr = `${yyyy}/${mm}/${dd}`
  return date <= todayStr
}

const required = (val) => !!val || 'Ce champ est requis / This field is required'
const maxSize = 3 * 1024 * 1024
const fileTypeImage = (val) => {
  if (!val) return true
  const file = Array.isArray(val) ? val[0] : val
  if (!file) return true
  return /\.(gif|jpe?g|png)$/i.test(file.name) || 'Type de fichier non autorise (gif/jpg/png)'
}

const fileTypeDoc = (val) => {
  if (!val) return true
  const file = Array.isArray(val) ? val[0] : val
  if (!file) return true
  return /\.(gif|jpe?g|png|pdf)$/i.test(file.name) || 'Type non autorise (gif/jpg/png/pdf)'
}

const succursaleExpanded = ref(false)

const dynamicTextClass = computed(() => [
  $q.screen.gt.sm ? 'text-h5' : 'custom-mobile-text',
  'text-primary',
  'text-weight-bold',
])

const validationOptions = computed(() => [
  { label: t('input.yes'), value: true },
  { label: t('input.no'), value: false },
])

const recapEmpty = () => t('input.nonRenseigne')

const recapSections = computed(() => {
  const nz = (v) => (v != null && String(v).trim() !== '' ? String(v) : recapEmpty())
  const nzFile = (f) => f?.name || recapEmpty()

  const step2Items = [
    {
      icon: 'corporate_fare',
      label: t('input.isSuccursale'),
      value: form.value.isSuccursale ? t('input.yes') : t('input.no'),
    },
    ...(form.value.isSuccursale
      ? [
          {
            icon: 'badge',
            label: t('input.matriculeSiege'),
            value: nz(form.value.NUM_EMPL_SIEGE),
          },
          {
            icon: 'apartment',
            label: t('input.raisonSocialeSiege'),
            value: nz(form.value.RAISON_SOCIALE_SIEGE),
          },
          {
            icon: 'store',
            label: t('input.nomCommercialSiege'),
            value: nz(form.value.NOM_COMMERCIAL_SIEGE),
          },
        ]
      : []),
    {
      icon: 'source',
      label: t('input.origineImmatriculation'),
      value:
        causeImmaOptions.find((o) => o.value === form.value.CAUSE_IMMA)?.label || '—',
    },
    {
      icon: 'folder',
      label: t('input.origineDossier'),
      value:
        circuitDossierOptions.find((o) => o.value === form.value.CIRCUIT_DOSSIER)?.label || '—',
    },
    {
      icon: 'gavel',
      label: t('input.formeJuridique'),
      value: getNatureJuridiqueName(form.value.NATURE_JURC),
    },
    {
      icon: 'work',
      label: t('input.activiteEconomique'),
      value: getActiviteName(form.value.CODE_SECT_ACTIVITEC),
    },
    {
      icon: 'groups',
      label: t('input.nombreTravailleurs'),
      value: nz(form.value.NBRE_EMPL),
    },
    { icon: 'policy', label: t('input.regimeCNPS'), value: nz(form.value.CODE_REGIME) },
    {
      icon: 'warning',
      label: t('input.groupeRisque'),
      value: nz(form.value.CODE_GPE_RISQUE),
    },
    {
      icon: 'account_balance',
      label: t('input.centreImpots'),
      value: getCentreImpotName(form.value.CODE_CENTREIMPOTC),
    },
    {
      icon: 'health_and_safety',
      label: t('input.centreCNPS'),
      value: getCentreCnpsName(form.value.CODE_CENTRECNPSC),
    },
    {
      icon: 'map',
      label: t('input.planLocalisation'),
      value: nzFile(formFile.value.IDPLANLOCAL),
    },
    {
      icon: 'description',
      label: t('input.contratbail'),
      value: nzFile(formFile.value.IDCONTRATBAIL),
    },
    {
      icon: 'list_alt',
      label: t('input.listeTravailleurs'),
      value: nzFile(formFile.value.IDLISTTRAV),
    },
    { icon: 'receipt', label: t('input.patente'), value: nzFile(formFile.value.IDPATENTE) },
    {
      icon: 'request_quote',
      label: t('input.impotLiberatoire'),
      value: nzFile(formFile.value.IDIMPOT),
    },
    { icon: 'article', label: t('input.statuts'), value: nzFile(formFile.value.IDSTATUTS) },
  ]

  return [
    {
      step: 1,
      title: t('immep.step1'),
      icon: 'business',
      items: [
        { icon: 'apartment', label: t('input.raisonSociale'), value: nz(form.value.RAISON_SOCIALE) },
        {
          icon: 'store',
          label: t('input.nomCommercial'),
          value: nz(form.value.NOM_COMMERCIAL),
        },
        { icon: 'label', label: t('input.sigle'), value: nz(form.value.Sigle) },
        {
          icon: 'place',
          label: t('input.arrondissement'),
          value: getArrondissementName(form.value.CODE_ARRONDC),
        },
        {
          icon: 'mail',
          label: t('input.boitePostale'),
          value: nz(form.value.BOITE_POSTALE),
        },
        { icon: 'home', label: t('input.adresse'), value: nz(form.value.ADRESSE_EMPL) },
        { icon: 'location_city', label: t('input.quartier'), value: nz(form.value.NOM_QUARTIER) },
        { icon: 'signpost', label: t('input.lieuDit'), value: nz(form.value.LIEUDIT_EMPL) },
        { icon: 'pin', label: t('input.numLogement'), value: nz(form.value.num_case) },
        { icon: 'email', label: t('input.email'), value: nz(form.value.EMAIL) },
        {
          icon: 'phone',
          label: t('input.telephone'),
          value: form.value.TEL ? `+237 ${form.value.TEL}` : recapEmpty(),
        },
        {
          icon: 'contact_phone',
          label: t('input.autreContact'),
          value: nz(form.value.AUTRE_CONTACT),
        },
        {
          icon: 'event',
          label: t('input.dateOuverture'),
          value: nz(form.value.DATE_DEB_SERVICE),
        },
        {
          icon: 'event',
          label: t('input.dateCreation'),
          value: nz(form.value.date_creation_empl),
        },
        {
          icon: 'event',
          label: t('input.dateEmbauche'),
          value: nz(form.value.DATE_EFFET),
        },
        {
          icon: 'numbers',
          label: t('input.numRegistreCommerce'),
          value: nz(form.value.num_registre),
        },
        {
          icon: 'numbers',
          label: t('input.numContribuable'),
          value: nz(form.value.num_contr),
        },
        {
          icon: 'attach_file',
          label: t('input.registreCommerce'),
          value: nzFile(formFile.value.IDREGICOMM),
        },
        {
          icon: 'attach_file',
          label: t('input.autorisationOuverture'),
          value: nzFile(formFile.value.IDAUTORISATION),
        },
        {
          icon: 'attach_file',
          label: t('input.carteContribuable'),
          value: nzFile(formFile.value.IDCONTRIBUABLE),
        },
      ],
    },
    {
      step: 2,
      title: t('immep.step2'),
      icon: 'location_on',
      items: step2Items,
    },
    {
      step: 3,
      title: t('immep.step4'),
      icon: 'person',
      items: [
        {
          icon: 'person',
          label: t('input.nomResponsable'),
          value: nz(form.value.NOM_PERSEMPL),
        },
        {
          icon: 'person_outline',
          label: t('input.prenomResponsable'),
          value: nz(form.value.PRENOM_PERSEMPL),
        },
        {
          icon: 'cake',
          label: t('input.dateNaissanceResponsable'),
          value: nz(form.value.DATE_NAISS_PERSEMPL),
        },
        {
          icon: 'place',
          label: t('input.lieuNaissanceResponsable'),
          value: nz(form.value.LOCALITE_NAISS_PERSEMPL),
        },
        {
          icon: 'location_city',
          label: t('input.arrondissementNaissanceResponsable'),
          value: getArrondissementName(form.value.LieuNaissPe),
        },
        { icon: 'wc', label: t('input.sexeResponsable'), value: nz(form.value.SEXE_PERSEMPL) },
        {
          icon: 'flag',
          label: t('input.nationaliteResponsable'),
          value: getNationaliteName(form.value.NATIONALITEC),
        },
        {
          icon: 'home',
          label: t('input.adresseResponsable'),
          value: nz(form.value.ADR_PERSEMPL),
        },
        {
          icon: 'mail',
          label: t('input.boitePostaleResponsable'),
          value: nz(form.value.BP_PERSEMPL),
        },
        {
          icon: 'phone',
          label: t('input.telephoneResponsable'),
          value: form.value.TEL_PERSEMPL ? `+237 ${form.value.TEL_PERSEMPL}` : recapEmpty(),
        },
        {
          icon: 'email',
          label: t('input.emailResponsable'),
          value: nz(form.value.EMAIL_PERSEMPL),
        },
        {
          icon: 'badge',
          label: t('input.pieceIdentiteResponsable'),
          value: getPieceName(form.value.NUM_TYPEPIECE),
        },
        {
          icon: 'pin',
          label: t('input.numPieceIdentiteResponsable'),
          value: nz(form.value.NUM_PIECE),
        },
        {
          icon: 'event',
          label: t('input.dateDelivrancePieceIdentiteResponsable'),
          value: nz(form.value.DATE_PIECE),
        },
        {
          icon: 'place',
          label: t('input.lieuDelivrancePieceIdentitePromoteur'),
          value: getArrondissementName(form.value.LIEU_PIECEC),
        },
        {
          icon: 'upload_file',
          label: t('input.scanPieceIdentiteResponsable'),
          value: nzFile(formFile.value.fichierIdentiteResponsable),
        },
      ],
    },
  ]
})

const goToPreviousStep = () => {
  if (step.value > 1) step.value -= 1
}

const goToNextStep = async (nextStep) => {
  if (nextStep >= 3 && (!form.value.CIRCUIT_DOSSIER || !form.value.CAUSE_IMMA)) {
    notifyError(
      "Veuillez renseigner l'origine d'immatriculation et l'origine du dossier (étape 2).",
    )
    return
  }
  const valid = await formRef.value.validate()
  if (valid) {
    step.value = nextStep
    if (nextStep > maxStep.value) maxStep.value = nextStep
  } else {
    notifyError('Veuillez remplir tous les champs requis / Please fill in all required fields.')
  }
}

const onRejected = (rejectedEntries) => {
  notifyError(
    `Les fichiers suivants n'ont pas passé les contraintes de validation : ${rejectedEntries
      .map((entry) => entry.name)
      .join(', ')}`,
  )
}

function onCentreImpotsSelected(code) {
  const imp = referentialsSource.value.impots.find(
    (i) => String(i.CODE_CENTREIMPOT) === String(code),
  )
  if (imp?.CODE_CENTRECNPS && !form.value._cnpsManual) {
    form.value.CODE_CENTRECNPSC = imp.CODE_CENTRECNPS
  }
  form.value._cnpsManual = false
  syncImmatEmpProHiddenFields(form.value, getReferentialsSnapshot())
}

const onCentreCnpsSelected = () => {
  form.value._cnpsManual = true
  syncImmatEmpProHiddenFields(form.value, getReferentialsSnapshot())
}

watch(
  () => [
    form.value.CAUSE_IMMA,
    form.value.CIRCUIT_DOSSIER,
    form.value.NATURE_JURC,
    form.value.CODE_SECT_ACTIVITEC,
    form.value.CODE_CENTREIMPOTC,
    form.value.CODE_CENTRECNPSC,
    form.value.CODE_ARRONDC,
    form.value.LieuNaissPe,
    form.value.NATIONALITEC,
    form.value.NUM_TYPEPIECE,
    form.value.LIEU_PIECEC,
  ],
  () => syncImmatEmpProHiddenFields(form.value, getReferentialsSnapshot()),
  { deep: true },
)

const rechercherSiege = async () => {
  const matricule = form.value.NUM_EMPL_SIEGE?.trim().toUpperCase()
  if (!matricule) return
  if (!regexPatterns.numEmpl1.test(matricule) && !regexPatterns.numEmpl2.test(matricule)) {
    notifyError(
      'Le matricule saisi est invalide. Format attendu : 321-1234567-A ou 321-1234567-000-M!',
    )
    return
  }
  if (!referentialsReady.value) {
    notifyError(t('immat.referentials.error'))
    return
  }
  loadingSiege.value = true
  try {
    const row = await fetchSiegeEmployeurByMatricule(matricule)
    const { warning } = applySiegeEmployeurToForm(form.value, row)
    if (warning) notifyError(warning)
    else notifySuccess(t('form.searchSuccess', 'Siège trouvé.'))
  } catch (e) {
    notifyError(e?.message || t('messages.error'))
  } finally {
    loadingSiege.value = false
  }
}

const submitForm = async () => {
  dialValidation.value = false
  const valid = await formRef.value.validate()
  if (!valid) {
    notifyError('Veuillez corriger les erreurs du formulaire.')
    return
  }

  const bizErr = validateImmatEmpProBusinessRules(form.value)
  if (bizErr) {
    notifyError(bizErr)
    return
  }

  spinner.value = true
  notifyInfo('Soumission des données à Energizer.')
  try {
    const fd = buildImmatEmpProLegacyFormData(form.value, formFile.value, {
      dest: form.value.Dest || TELE_IMMAT_DEST_EMP_PRO,
      codeTele: props.codeTele || form.value.code_tele,
      codeSecret: props.codeSecret || form.value.code_secret,
      referentials: getReferentialsSnapshot(),
    })
    const result = await submitGererEmployeur(fd)
    notifySuccess(result?.Msg || 'Formulaire soumis avec succès.')
    spinner.value = false
    open.value = false
    emit('close')
  } catch (err) {
    notifyError(err?.message || 'Erreur lors de la soumission.')
    spinner.value = false
  }
}

const isStepAllowed = (stepName) => stepName <= maxStep.value

const getArrondissementName = (code) => {
  if (!code) return ''
  const arr = arrondissements.value.find((a) => String(a.CODE_ARROND) === String(code))
  return arr ? arr.NOM_ARROND : String(code)
}

const getNationaliteName = (value) => {
  if (!value) return ''
  const found = pays.value.find(
    (item) => String(item.code_pays) === String(value) || item.nationalite === value,
  )
  return found?.nationalite || String(value)
}

const getNatureJuridiqueName = (code) => {
  if (!code) return ''
  const item = formeJuridique.value.find((x) => String(x.CODE_NATUREJUR) === String(code))
  return item?.LIBELLE_NATUREJUR || String(code)
}

const getActiviteName = (code) => {
  if (!code) return ''
  const item = activites.value.find((x) => String(x.CODE_SECT_ACTIVITE) === String(code))
  return item?.LIBELLE_SECT_ACTIVITE || String(code)
}

const getCentreImpotName = (code) => {
  if (!code) return ''
  const item = impots.value.find((x) => String(x.CODE_CENTREIMPOT) === String(code))
  return item?.ABREVIATION || String(code)
}

const getCentreCnpsName = (code) => {
  if (!code) return ''
  const item = centres.value.find((x) => String(x.CODE_CENTRE) === String(code))
  return item?.LIB_CENTRE || String(code)
}

const getPieceName = (code) => {
  if (!code) return ''
  const item = pieces.value.find((x) => String(x.NUM_TYPEPIECE) === String(code))
  return item?.LIBELLE || String(code)
}

const pieceIdentiteScanLabel = computed(() => {
  const libelle = getPieceName(form.value.NUM_TYPEPIECE)
  const base = t('input.scanPieceIdentiteResponsable')
  if (form.value.NUM_TYPEPIECE && libelle && libelle !== String(form.value.NUM_TYPEPIECE)) {
    return `${base} — ${libelle}`
  }
  return base
})

function onTypePieceSelected() {
  formFile.value.fichierIdentiteResponsable = null
  syncImmatEmpProHiddenFields(form.value, getReferentialsSnapshot())
}

const pdfExportOptions = () => ({
  margin: 0.5,
  filename: `recap-entreprise-${new Date().toISOString().split('T')[0]}.pdf`,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
})

const previewPDF = async () => {
  spinner.value = true
  try {
    const element = recapContent.value
    const pdf = await html2pdf().from(element).set(pdfExportOptions()).toPdf().output('blob')
    pdfBlobUrl.value = URL.createObjectURL(pdf)
    pdfDialog.value = true
  } catch (error) {
    notifyError(t('form.submit_error', { error: error?.message || String(error) }))
  } finally {
    spinner.value = false
  }
}

const downloadPDF = async () => {
  spinner.value = true
  try {
    const element = recapContent.value
    await html2pdf().from(element).set(pdfExportOptions()).save()
  } catch (error) {
    notifyError(t('form.submit_error', { error: error?.message || String(error) }))
  } finally {
    spinner.value = false
  }
}

function makeListFilter(sourceKey, targetRef, labelKey) {
  return (val, update) => {
    const source = referentialsSource.value[sourceKey] ?? []
    if (val === '') {
      update(() => {
        targetRef.value = [...source]
      })
      return
    }
    const needle = val.toLowerCase()
    update(() => {
      targetRef.value = source.filter((item) =>
        String(item[labelKey] ?? '')
          .toLowerCase()
          .includes(needle),
      )
    })
  }
}

const filterArrondissement = makeListFilter('arrondissements', arrondissements, 'NOM_ARROND')
const filterActivites = makeListFilter('activites', activites, 'LIBELLE_SECT_ACTIVITE')
const filterCentreCNPS = makeListFilter('centres', centres, 'LIB_CENTRE')
const filterFormeJuridique = makeListFilter('formeJuridique', formeJuridique, 'LIBELLE_NATUREJUR')
const filterImpots = makeListFilter('impots', impots, 'ABREVIATION')
const filterPays = makeListFilter('pays', pays, 'nationalite')
const filterPieces = makeListFilter('pieces', pieces, 'LIBELLE')

const closeDialog = () => {
  open.value = false
  emit('close')
}

function updateDisplayFromDate(val) {
  if (val) {
    const [year, month, day] = val.split('-')
    displayDate.value = `${day}/${month}/${year}`
  } else {
    displayDate.value = ''
  }
}

watch(
  () => form.value.DATE_DEB_SERVICE,
  (val) => updateDisplayFromDate(val),
  { immediate: true },
)
watch(
  () => form.value.date_creation_empl,
  (val) => updateDisplayFromDate(val),
  { immediate: true },
)
watch(
  () => form.value.DATE_EFFET,
  (val) => updateDisplayFromDate(val),
  { immediate: true },
)
watch(
  () => form.value.DATE_NAISS_PERSEMPL,
  (val) => updateDisplayFromDate(val),
  { immediate: true },
)
watch(
  () => form.value.DATE_PIECE,
  (val) => updateDisplayFromDate(val),
  { immediate: true },
)
watch(
  () => form.value.isSuccursale,
  (v) => {
    if (v) succursaleExpanded.value = true
  },
)
</script>

<style scoped>
/* ====== CARD PRINCIPALE ====== */
.immat-main-card {
  border-radius: 14px;
  overflow: hidden;
  height: min(90vh, 860px);
  max-height: 94vh;
  box-shadow: 0 12px 40px rgba(25, 118, 210, 0.15);
}

/* ====== HEADER ====== */
.immat-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1976d2 50%, #42a5f5 100%);
  min-height: unset;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.immat-header-avatar {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* ====== FORM CONTAINER ====== */
.immat-form {
  min-height: 0;
}

.immat-scroll-area {
  height: 0;
  flex: 1 1 auto;
  min-height: 280px;
  background: #fafbfc;
}

/* ====== FOOTER ====== */
.immat-step-footer {
  flex-shrink: 0;
  background: #ffffff;
  border-top: 1px solid #e3e8ee;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

/* ====== STEPPER WRAP ====== */
.immat-stepper-section {
  padding-left: 20px;
  padding-right: 20px;
}

/* ====== STEPPER ====== */
.immat-stepper {
  background: transparent;
}

.immat-stepper :deep(.q-stepper__header) {
  background: #ffffff;
  border-bottom: 2px solid #e3e8ee;
  min-height: unset;
  padding: 6px 8px;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.immat-stepper :deep(.q-stepper__tab) {
  min-height: 52px;
  padding: 8px 12px;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.immat-stepper :deep(.q-stepper__tab:hover) {
  background: rgba(25, 118, 210, 0.06);
}

.immat-stepper :deep(.q-stepper__title) {
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.2;
  margin-top: 2px;
  padding: 0 2px;
}

.immat-stepper :deep(.q-stepper__label) {
  margin-top: 2px;
}

.immat-stepper :deep(.q-stepper__dot) {
  width: 28px;
  min-width: 28px;
  height: 28px;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.immat-stepper :deep(.q-stepper__tab--active .q-stepper__dot),
.immat-stepper :deep(.q-stepper__tab--done .q-stepper__dot) {
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.35);
}

.immat-stepper :deep(.q-stepper__line) {
  margin-top: 14px;
}

.immat-stepper :deep(.q-stepper__step-content) {
  padding-top: 12px;
  padding-bottom: 8px;
}

.immat-stepper :deep(.q-stepper__step-inner) {
  background: #ffffff;
  border-radius: 0 0 10px 10px;
  margin-left: 3cm;
  margin-right: 3cm;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ====== SECTION HEADERS ====== */
.step-section-header {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--q-primary);
  background: linear-gradient(90deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.02) 100%);
  border-left: 4px solid var(--q-primary);
  padding: 10px 14px;
  border-radius: 0 6px 6px 0;
  margin-bottom: 14px;
  margin-top: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

/* ====== FIELD GRID ====== */
.immat-stepper :deep(.immat-field-row) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 16px;
  row-gap: 14px;
  margin-bottom: 8px;
}

.immat-stepper :deep(.immat-field-row > .col-12) {
  grid-column: 1 / -1;
}

.immat-date-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 16px;
  row-gap: 14px;
}

.immat-stepper :deep(.immat-field-cell) {
  min-width: 0;
  width: 100%;
}

/* ====== INPUTS DENSES ====== */
.immat-stepper :deep(.q-field--outlined .q-field__control) {
  border-radius: 8px;
  min-height: 42px;
  transition: all 0.2s ease;
}

.immat-stepper :deep(.q-field--outlined .q-field__control:hover) {
  background: rgba(25, 118, 210, 0.02);
}

.immat-stepper :deep(.q-field--outlined .q-field__control:before) {
  border-color: #d1d9e0;
}

.immat-stepper :deep(.q-field--outlined.q-field--focused .q-field__control:before) {
  border-color: var(--q-primary);
  border-width: 2px;
}

.immat-stepper :deep(.q-field--outlined.q-field--focused .q-field__control:after) {
  border-color: var(--q-primary);
}

.immat-stepper :deep(.q-field--dense .q-field__label) {
  font-size: 13px;
  font-weight: 500;
}

.immat-stepper :deep(.q-field--dense .q-field__native) {
  font-size: 13.5px;
}

.immat-stepper :deep(.immat-field-cell .q-field__bottom) {
  padding-top: 4px;
  min-height: 18px;
  font-size: 11px;
}

.immat-stepper :deep(.q-field__hint) {
  font-size: 11px;
  color: #6b7785;
}

/* Readonly fields visual */
.immat-stepper :deep(.readonly-field .q-field__control) {
  background: #f5f7fa;
}

/* ====== REQUIRED BADGE ====== */
.required-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 8px;
  background: #e53935;
  color: white;
  font-size: 9px;
  font-style: italic;
  font-weight: 600;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  vertical-align: middle;
}

/* ====== EXPANSION ====== */
.immat-expansion {
  border: 1px solid #d1d9e0;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(90deg, rgba(25, 118, 210, 0.03) 0%, transparent 100%);
}

.immat-expansion :deep(.immat-expansion-header) {
  background: rgba(25, 118, 210, 0.05);
  padding: 8px 12px;
}

.immat-expansion :deep(.q-expansion-item__container) {
  background: #ffffff;
}

/* ====== RECAP STEP ====== */
.recap-container {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 20px !important;
}

.recap-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(66, 165, 245, 0.04) 100%);
  border: 1px solid rgba(25, 118, 210, 0.15);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.06);
}

.recap-hero-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--q-primary) 0%, #42a5f5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  flex-shrink: 0;
}

.recap-hero-content {
  flex: 1;
  min-width: 0;
}

.recap-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e3e8ee !important;
  background: #ffffff;
}

.recap-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.12) !important;
  border-color: rgba(25, 118, 210, 0.3) !important;
}

.recap-card-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1976d2 60%, #42a5f5 100%);
  position: relative;
  overflow: hidden;
}

.recap-card-header::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 100%);
  pointer-events: none;
}

.recap-card-avatar {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.recap-item {
  padding: 8px 16px;
  transition: background 0.2s ease;
}

.recap-item:hover {
  background: rgba(25, 118, 210, 0.04);
}

.recap-label {
  font-size: 11px;
  color: #6b7785;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
  margin-bottom: 2px;
}

.recap-value {
  font-size: 13.5px;
  font-weight: 500;
  color: #1f2937;
  word-break: break-word;
}

/* ====== HOVER EFFECTS ====== */
.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.15);
}

/* ====== CONFIRMATION DIALOG ====== */
.confirmation-card {
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.confirmation-message {
  background: linear-gradient(90deg, rgba(25, 118, 210, 0.06) 0%, rgba(25, 118, 210, 0.02) 100%);
  padding: 14px 16px;
  border-radius: 8px;
  border-left: 4px solid var(--q-primary);
  display: flex;
  align-items: flex-start;
}

/* ====== MOBILE ====== */
.custom-mobile-text {
  font-size: 16px;
  line-height: 1.5rem;
  font-weight: 700;
}

@media (max-width: 599px) {
  .immat-stepper :deep(.immat-field-row) {
    grid-template-columns: 1fr;
    column-gap: 0;
  }

  .immat-date-row {
    grid-template-columns: 1fr;
    column-gap: 0;
  }

  .recap-hero {
    flex-direction: column;
    text-align: center;
    padding: 16px;
  }

  .immat-stepper :deep(.q-stepper__step-inner) {
    margin-left: 12px;
    margin-right: 12px;
    padding: 10px 12px;
  }
}

/* ====== DARK MODE ====== */
.body--dark .immat-scroll-area {
  background: #1d1d1d;
}

.body--dark .immat-step-footer {
  background: #2a2a2a;
  border-top-color: #3a3a3a;
}

.body--dark .step-section-header {
  background: linear-gradient(90deg, rgba(66, 165, 245, 0.15) 0%, rgba(66, 165, 245, 0.05) 100%);
  color: #64b5f6;
}

.body--dark .recap-container {
  background: linear-gradient(180deg, #1d1d1d 0%, #2a2a2a 100%);
}

.body--dark .recap-card {
  background: #2a2a2a;
  border-color: #3a3a3a !important;
}

.body--dark .recap-label {
  color: #9ca3af;
}

.body--dark .recap-value {
  color: #e5e7eb;
}
</style>

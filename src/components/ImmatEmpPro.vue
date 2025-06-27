<template>
  <q-dialog v-model="open" persistent full-width>
    <q-card :style="$q.screen.gt.sm ? 'width: 900px' : 'width: 100%'">
      <q-card-section>
        <div class="text-h6 text-primary text-center text-bold">
          {{ $t(service.name) }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="q-gutter-md justify-center row">
          <q-select
            v-model="form.CAUSE_IMMA"
            :options="['Spontanee', 'Suite a controle', 'Immatriculation d office']"
            :label="$t('input.origineImmatriculation')"
            outlined
            dense
            input-debounce="0"
            fill-input
            :rules="[required]"
            class="col-md-5 col-xs-12 col-sm-12"
          >
            <template v-slot:label>
              {{ $t('input.origineImmatriculation') }}
              <span
                class="q-px-sm bg-red text-white text-italic rounded-borders"
                style="font-size: 10px"
                >{{ $t('input.requis') }}</span
              >
            </template>
          </q-select>
          <q-select
            v-model="form.CIRCUIT_DOSSIER"
            :options="['Centre Formalite Creation Entreprise(C.F.C.E)', 'AUTRE']"
            :label="$t('input.origineDossier')"
            outlined
            dense
            input-debounce="0"
            fill-input
            :rules="[required]"
            class="col-md-5 col-xs-12 col-sm-12"
          >
            <template v-slot:label>
              {{ $t('input.origineDossier') }}
              <span
                class="q-px-sm bg-red text-white text-italic rounded-borders"
                style="font-size: 10px"
                >{{ $t('input.requis') }}</span
              >
            </template>
          </q-select>
        </div>
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" @submit.prevent="dialValidation = true">
          <q-stepper
            v-model="step"
            :vertical="$q.screen.lt.sm"
            color="primary"
            :inactive-color="maxStep >= step ? 'secondary' : ''"
            animated
            header-nav
          >
            <!-- Etape 1 : Informations sur l'employeur -->
            <q-step
              :name="1"
              :title="$t('immep.step1')"
              icon="business"
              :done="step > 1"
              :disable="!isStepAllowed(1)"
            >
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.RAISON_SOCIALE"
                  :label="$t('input.raisonSociale')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.RAISON_SOCIALE = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.raisonSociale') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.NOM_COMMERCIAL"
                  :label="$t('input.nomCommercial')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.NOM_COMMERCIAL = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.nomCommercial') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.Sigle"
                  :label="$t('input.sigle')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.Sigle = val.toUpperCase())"
                />
                <q-input
                  v-model="form.AUTRE_CONTACT"
                  :label="$t('input.autreContact')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.AUTRE_CONTACT = val.toUpperCase())"
                />
                <q-input
                  v-model="form.DATE_DEB_SERVICE"
                  :label="$t('input.dateOuverture')"
                  outlined
                  dense
                  class="col-md-4 col-xs-12 col-sm-12"
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
                    {{ $t('input.dateOuverture') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.date_creation_empl"
                  :label="$t('input.dateCreation')"
                  outlined
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
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
                  class="col-md-3 col-xs-12 col-sm-12"
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
                <q-input
                  v-model="form.num_registre"
                  :label="$t('input.numRegistreCommerce')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[
                    required,
                    (val) => !val || regexPatterns.regComm.test(val) || '(ex: RC/YAO/2020/B/0002)',
                  ]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.num_registre = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.numRegistreCommerce') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.num_contr"
                  :label="$t('input.numContribuable')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[
                    required,
                    (val) =>
                      !val ||
                      regexPatterns.numContr.test(val) ||
                      'Format invalide (ex: P123456789321M)',
                  ]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.num_contr = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.numContribuable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-file
                  v-model="formFile.attestationImmatriculation"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  label=""
                  accept=".pdf,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || $t('input.requis')]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.attestationImmatriculation') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-file>
                <q-file
                  v-model="formFile.IDREGICOMM"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  label=""
                  accept=".pdf,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || $t('input.requis')]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.registreCommerce') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-file>
                <q-file
                  v-model="formFile.IDAUTORISATION"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  label=""
                  accept=".pdf,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || $t('input.requis')]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.autorisationOuverture') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-file>
                <q-file
                  v-model="formFile.IDCONTRIBUABLE"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :label="$t('input.carteContribuable')"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
                <q-file
                  v-model="formFile.IDSTATUTS"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :label="$t('input.statuts')"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
                <q-checkbox
                  name="is_succursale"
                  v-model="form.isSuccursale"
                  :label="$t('input.isSuccursale')"
                  class="col-md-5 col-xs-12 col-sm-12"
                />
                <q-input
                  v-model="form.NUM_EMPL_SIEGE"
                  v-if="form.isSuccursale"
                  :label="$t('input.matriculeSiege')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
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
                    {{ $t('input.matriculeSiege') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.RAISON_SOCIALE_SIEGE"
                  v-if="form.isSuccursale"
                  :label="$t('input.raisonSocialeSiege')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  readonly
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.RAISON_SOCIALE_SIEGE = val.toUpperCase())"
                />
                <q-input
                  v-model="form.NOM_COMMERCIAL_SIEGE"
                  v-if="form.isSuccursale"
                  :label="$t('input.nomCommercialSiege')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  readonly
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.NOM_COMMERCIAL_SIEGE = val.toUpperCase())"
                />
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(2)" color="primary" :label="$t('form.next')" />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 2 : Données administratives et fiscales -->
            <q-step
              :name="2"
              :title="$t('immep.step2')"
              icon="location_on"
              :done="step > 2"
              :disable="!isStepAllowed(2)"
            >
              <div class="q-gutter-md justify-center row">
                <q-select
                  v-model="form.NATURE_JURC"
                  :options="formeJuridique"
                  option-label="LIBELLE_NATUREJUR"
                  :label="$t('input.formeJuridique')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterFormeJuridique"
                  :rules="[required]"
                  class="col-md-7 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.formeJuridique') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  v-model="form.NBRE_EMPL"
                  :label="$t('input.nombreTravailleurs')"
                  outlined
                  type="number"
                  min="1 "
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('input.nombreTravailleurs') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-select
                  v-model="form.CODE_SECT_ACTIVITEC"
                  :options="activites"
                  v-model-options="{ trackBy: 'LIBELLE_SECT_ACTIVITE' }"
                  option-label="LIBELLE_SECT_ACTIVITE"
                  :label="$t('input.activiteEconomique')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterActivites"
                  :rules="[required]"
                  class="col-md-6 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.activiteEconomique') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  v-model="form.CODE_SECT_ACTIVITEC.REGIME_CNPS"
                  :label="$t('input.regimeCNPS')"
                  outlined
                  readonly
                  dense
                  class="col-md-2 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.CODE_SECT_ACTIVITEC.DESCRIPTION"
                  :label="$t('input.groupeRisque')"
                  outlined
                  readonly
                  dense
                  class="col-md-2 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.CODE_CENTREIMPOTC"
                  :options="impots"
                  option-label="ABREVIATION"
                  :label="$t('input.centreImpots')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterImpots"
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.centreImpots') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                    <!-- @update:model-value="
                    (val) => (form.CODE_CENTRECNPSC = findCentreCNPSByCentreImpots(val))
                  " -->
                  </template>
                </q-select>
                <q-select
                  v-model="form.CODE_CENTRECNPSC"
                  :options="centres"
                  option-label="LIB_CENTRE"
                  :label="$t('input.centreCNPS')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterCentreCNPS"
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.centreCNPS') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-file
                  v-model="formFile.IDLISTTRAV"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  label=""
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || $t('input.requis')]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.listeTravailleurs') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-file>
              </div>
              <q-stepper-navigation>
                <q-btn @click="goToNextStep(3)" color="primary" :label="$t('form.next')" />
                <q-btn
                  flat
                  @click="step = 1"
                  color="primary"
                  :label="$t('form.previous')"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 3 : Coordonnées de l'entreprise -->
            <q-step
              :name="3"
              :title="$t('immep.step3')"
              icon="location_on"
              :done="step > 3"
              :disable="!isStepAllowed(3)"
            >
              <div class="q-gutter-md justify-center row">
                <q-select
                  v-model="form.CODE_ARRONDC"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  :label="$t('input.arrondissement')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                  class="col-md-3 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.arrondissement') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  v-model="form.ADRESSE_EMPL"
                  :label="$t('input.adresse')"
                  outlined
                  dense
                  class="col-md-7 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.ADRESSE_EMPL = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.adresse') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.NOM_QUARTIER"
                  :label="$t('input.quartier')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.NOM_QUARTIER = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="map" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.quartier') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.LIEUDIT_EMPL"
                  :label="$t('input.lieuDit')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.LIEUDIT_EMPL = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" />
                  </template>
                </q-input>
                <q-input
                  v-model="form.BOITE_POSTALE"
                  :label="$t('input.boitePostale')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.BOITE_POSTALE = val.toUpperCase())"
                />
                <q-input
                  v-model="form.num_case"
                  :label="$t('input.numLogement')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.num_case = val.toUpperCase())"
                />
                <q-input
                  v-model="form.EMAIL"
                  :label="$t('input.email')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  type="email"
                  :rules="[
                    required,
                    (val) => regexPatterns.email.test(val) || '(ex: adresse@email.com)',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.email') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.TEL"
                  :label="$t('input.telephone')"
                  outlined
                  prefix="+237"
                  type="tel"
                  maxlength="9"
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[
                    required,
                    (val) => regexPatterns.telephone.test(val) || $t('input.invalidPhone'),
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.telephone') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-file
                  v-model="formFile.IDPLANLOCAL"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  label=""
                  accept=".pdf,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || $t('input.requis')]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.planLocalisation') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-file>
              </div>
              <q-stepper-navigation>
                <q-btn @click="goToNextStep(4)" color="primary" :label="$t('form.next')" />
                <q-btn
                  flat
                  @click="step = 2"
                  color="primary"
                  :label="$t('form.previous')"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 4 : Informations du promoteur -->
            <q-step
              :name="4"
              :title="$t('immep.step4')"
              icon="folder"
              :done="step > 4"
              :disable="!isStepAllowed(4)"
            >
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.NOM_PERSEMPL"
                  :label="$t('input.nomResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.NOM_PERSEMPL = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.nomResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.PRENOM_PERSEMPL"
                  :label="$t('input.prenomResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.PRENOM_PERSEMPL = val.toUpperCase())"
                />
                <q-input
                  v-model="form.DATE_NAISS_PERSEMPL"
                  :label="$t('input.dateNaissanceResponsable')"
                  outlined
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
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
                    {{ $t('input.dateNaissanceResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.LOCALITE_NAISS_PERSEMPL"
                  :label="$t('input.lieuNaissanceResponsable')"
                  outlined
                  dense
                  class="col-md-7 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.LOCALITE_NAISS_PERSEMPL = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.lieuNaissanceResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-select
                  v-model="form.LieuNaissPe"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  :label="$t('input.arrondissementNaissanceResponsable')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                  class="col-md-4 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.arrondissementNaissanceResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
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
                  class="col-md-3 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.sexeResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-select
                  v-model="form.NATIONALITEC"
                  :options="pays"
                  option-label="nationalite"
                  :label="$t('input.nationaliteResponsable')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPays"
                  :rules="[required]"
                  class="col-md-3 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.nationaliteResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>

                <q-input
                  v-model="form.ADR_PERSEMPL"
                  :label="$t('input.adresseResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.ADR_PERSEMPL = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.adresseResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.BP_PERSEMPL"
                  :label="$t('input.boitePostaleResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.BP_PERSEMPL = val.toUpperCase())"
                />
                <q-input
                  v-model="form.TEL_PERSEMPL"
                  :label="$t('input.telephoneResponsable')"
                  outlined
                  type="tel"
                  maxlength="9"
                  prefix="+237"
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[
                    required,
                    (val) => regexPatterns.telephone.test(val) || $t('input.invalidPhone'),
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.telephoneResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.EMAIL_PERSEMPL"
                  :label="$t('input.emailResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  type="email"
                  :rules="[
                    required,
                    (val) => regexPatterns.email.test(val) || '(ex: adresse@email.com)',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.emailResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-select
                  v-model="form.typepiece"
                  :options="pieces"
                  option-label="LIBELLE"
                  :label="$t('input.pieceIdentiteResponsable')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPieces"
                  class="col-md-5 col-xs-12 col-sm-12"
                />
                <q-input
                  v-model="form.NUM_PIECE"
                  :label="$t('input.numPieceIdentiteResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.NUM_PIECE = val.toUpperCase())"
                />
                <q-input
                  v-model="form.DATE_PIECE"
                  :label="$t('input.dateDelivrancePieceIdentiteResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
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
                  :label="$t('input.lieuDelivrancePieceIdentitePromoteur')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" />
                  </template>
                </q-select>
                <q-file
                  v-model="formFile.fichierIdentiteResponsable"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  label=""
                  accept=".pdf,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || $t('input.requis')]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.fichierIdentiteResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-file>
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(5)" color="primary" :label="$t('form.next')" />
                <q-btn
                  flat
                  @click="step = 3"
                  color="primary"
                  :label="$t('form.previous')"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 5 : Documents à fournir -->
            <q-step
              :name="5"
              :title="$t('immep.step5')"
              icon="person"
              :done="step > 5"
              :disable="!isStepAllowed(5)"
            >
              <div class="q-gutter-md justify-center row">
                <q-file
                  v-model="formFile.IDCONTRATBAIL"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :label="$t('input.contratbail')"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
                <q-file
                  v-model="formFile.acf"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :label="$t('input.acf')"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || $t('input.requis')]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.acf') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-file>
                <q-file
                  v-model="formFile.IDPATENTE"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :label="$t('input.patente')"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || $t('input.requis')]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.patente') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-file>
                <q-file
                  v-model="formFile.IDIMPOT"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  label=""
                  accept=".pdf,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || $t('input.requis')]"
                  counter
                  max-files="1"
                  :hint="$t('input.max_size_hint')"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.impotLiberatoire') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-file>
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(6)" color="primary" :label="$t('form.next')" />
                <q-btn
                  flat
                  @click="step = 4"
                  color="primary"
                  :label="$t('form.previous')"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 6 : Recap -->
            <q-step
              :name="6"
              :title="$t('input.recap')"
              icon="list"
              :done="step > 6"
              :disable="!isStepAllowed(6)"
            >
              <div class="q-pa-md" ref="recapContent">
                <q-card flat bordered class="q-pa-md" style="text-transform: uppercase">
                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('immep.step1') }}</div>
                    <q-separator class="q-my-sm" />

                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.raisonSociale') }} : </strong> {{ form.RAISON_SOCIALE }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.nomCommercial') }} : </strong> {{ form.NOM_COMMERCIAL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.sigle') }} : </strong> {{ form.Sigle }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.autreContact') }} : </strong> {{ form.AUTRE_CONTACT }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.dateOuverture') }} : </strong>
                      {{ form.DATE_DEB_SERVICE }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.dateCreation') }} : </strong>
                      {{ form.date_creation_empl }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.dateEmbauche') }} : </strong> {{ form.DATE_EFFET }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.numRegistreCommerce') }} : </strong>
                      {{ form.num_registre }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.numContribuable') }} : </strong>
                      {{ form.num_contr }}
                    </div>

                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.isSuccursale') }} : </strong>
                      {{ form.isSuccursale ? $t('input.yes') : $t('input.no') }}
                    </div>

                    <template v-if="form.isSuccursale">
                      <div class="col-md-5 col-xs-12 col-sm-12">
                        <strong>{{ $t('input.matriculeSiege') }} : </strong>
                        {{ form.NUM_EMPL_SIEGE }}
                      </div>
                      <div class="col-md-5 col-xs-12 col-sm-12">
                        <strong>{{ $t('input.nomCommercialSiege') }} : </strong>
                        {{ form.NOM_COMMERCIAL_SIEGE }}
                      </div>
                      <div class="col-md-5 col-xs-12 col-sm-12">
                        <strong>{{ $t('input.raisonSocialeSiege') }} : </strong>
                        {{ form.RAISON_SOCIALE_SIEGE }}
                      </div>

                      <div class="col-md-5 col-xs-12 col-sm-12">
                        <strong>{{ $t('input.registreCommerce') }} : </strong>
                        {{ formFile.IDREGICOMM?.name || $t('input.nonRenseigne') }}
                      </div>
                      <div class="col-md-5 col-xs-12 col-sm-12">
                        <strong>{{ $t('input.autorisationOuverture') }} : </strong>
                        {{ formFile.IDAUTORISATION?.name || $t('input.nonRenseigne') }}
                      </div>
                      <div class="col-md-5 col-xs-12 col-sm-12">
                        <strong>{{ $t('input.carteContribuable') }} : </strong>
                        {{ formFile.IDCONTRIBUABLE?.name || $t('input.nonRenseigne') }}
                      </div>
                      <div class="col-md-5 col-xs-12 col-sm-12">
                        <strong>{{ $t('input.statuts') }} : </strong>
                        {{ formFile.IDSTATUTS?.name || $t('input.nonRenseigne') }}
                      </div>
                    </template>
                  </q-card-section>

                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('immep.step2') }}</div>
                    <q-separator class="q-my-sm" />

                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.arrondissement') }} : </strong>
                      {{ getArrondissementName(form.CODE_ARRONDC?.NOM_ARROND) }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.adresse') }} : </strong> {{ form.ADRESSE_EMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.quartier') }} : </strong> {{ form.NOM_QUARTIER }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.lieuDit') }} : </strong>
                      {{ form.LIEUDIT_EMPL || $t('input.nonRenseigne') }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.boitePostale') }} : </strong>
                      {{ form.BOITE_POSTALE || $t('input.nonRenseigne') }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.numLogement') }} : </strong>
                      {{ form.num_case || $t('input.nonRenseigne') }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.email') }} : </strong> {{ form.EMAIL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.telephone') }} : </strong> +237 {{ form.TEL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.planLocalisation') }} : </strong>
                      {{ formFile.IDPLANLOCAL?.name || $t('input.nonRenseigne') }}
                    </div>
                  </q-card-section>

                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('immep.step3') }}</div>
                    <q-separator class="q-my-sm" />

                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.formeJuridique') }} : </strong>
                      {{ form.NATURE_JURC?.LIBELLE_NATUREJUR }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.nombreTravailleurs') }} : </strong>
                      {{ form.NBRE_EMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.activiteEconomique') }} : </strong>
                      {{ form.CODE_SECT_ACTIVITEC?.LIBELLE_SECT_ACTIVITE }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.regimeCNPS') }} : </strong>
                      {{ form.CODE_SECT_ACTIVITEC?.REGIME_CNPS }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.groupeRisque') }} : </strong>
                      {{ form.CODE_SECT_ACTIVITEC?.DESCRIPTION }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.centreImpots') }} : </strong>
                      {{ form.CODE_CENTREIMPOTC?.ABREVIATION }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.centreCNPS') }} : </strong>
                      {{ form.CODE_CENTRECNPSC?.LIB_CENTRE }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.listeTravailleurs') }} : </strong>
                      {{ formFile.IDLISTTRAV?.name || $t('input.nonRenseigne') }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.attestationImmatriculation') }} : </strong>
                      {{ formFile.attestationImmatriculation?.name || $t('input.nonRenseigne') }}
                    </div>
                  </q-card-section>

                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('immep.step4') }}</div>
                    <q-separator class="q-my-sm" />

                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.nomResponsable') }} : </strong> {{ form.NOM_PERSEMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.prenomResponsable') }} : </strong>
                      {{ form.PRENOM_PERSEMPL || $t('input.nonRenseigne') }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.dateNaissanceResponsable') }} : </strong>
                      {{ form.DATE_NAISS_PERSEMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.lieuNaissanceResponsable') }} : </strong>
                      {{ form.LOCALITE_NAISS_PERSEMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.arrondissementNaissanceResponsable') }} : </strong>
                      {{ getArrondissementName(form.LieuNaissPe?.NOM_ARROND) }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.sexeResponsable') }} : </strong>
                      {{ form.SEXE_PERSEMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.nationaliteResponsable') }} : </strong>
                      {{ getNationaliteName(form.NATIONALITEC?.nationalite) }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.adresseResponsable') }} : </strong>
                      {{ form.ADR_PERSEMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.boitePostaleResponsable') }} : </strong>
                      {{ form.BP_PERSEMPL || $t('input.nonRenseigne') }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.telephoneResponsable') }} : </strong> +237
                      {{ form.TEL_PERSEMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.emailResponsable') }} : </strong>
                      {{ form.EMAIL_PERSEMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.pieceIdentiteResponsable') }} : </strong>
                      {{ form.typepiece?.LIBELLE }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.numPieceIdentiteResponsable') }} : </strong>
                      {{ form.NUM_PIECE }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.dateDelivrancePieceIdentiteResponsable') }} : </strong>
                      {{ form.DATE_PIECE }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.lieuDelivrancePieceIdentitePromoteur') }} : </strong>
                      {{ form.LIEU_PIECEC?.NOM_ARROND }}
                    </div>
                  </q-card-section>

                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('immep.step5') }}</div>
                    <q-separator class="q-my-sm" />

                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.contratbail') }} : </strong>
                      {{ formFile.IDCONTRATBAIL?.name || $t('input.nonRenseigne') }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.patente') }} : </strong>
                      {{ formFile.IDPATENTE?.name || $t('input.nonRenseigne') }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.impotLiberatoire') }} : </strong>
                      {{ formFile.IDIMPOT?.name || $t('input.nonRenseigne') }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <q-stepper-navigation>
                <q-btn type="submit" color="primary" :label="$t('form.submit')" />
                <q-btn
                  flat
                  @click="step = 5"
                  color="primary"
                  :label="$t('form.previous')"
                  class="q-ml-sm"
                />
                <q-btn
                  flat
                  color="secondary"
                  icon="picture_as_pdf"
                  label="PDF"
                  class="q-ml-sm"
                  @click="downloadPDF"
                />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-form>
      </q-card-section>

      <q-dialog v-model="pdfDialog" maximized>
        <q-card>
          <q-card-section class="row items-center justify-between">
            <div class="text-h6">Aperçu PDF</div>
            <q-btn icon="close" flat round dense @click="pdfDialog = false" />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <iframe :src="pdfBlobUrl" width="100%" height="600px" style="border: none"></iframe>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn color="primary" icon="download" label="Télécharger" @click="downloadPDF" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="dialValidation" persistent>
        <q-card>
          <q-card-section class="row items-center justify-between">
            <div class="text-h6">{{ $t('input.valid') }}</div>
            <q-btn icon="close" flat round dense @click="dialValidation = false" />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <div class="q-pa-md q-gutter-sm">
              <div class="q-gutter-sm text-bold" style="text-transform: uppercase">
                {{ $t('input.validtion') }} <br />
                <q-radio
                  dense
                  v-model="form.validation"
                  color="red"
                  :val="false"
                  :label="$t('input.no')"
                />
                <q-radio
                  dense
                  v-model="form.validation"
                  color="primary"
                  :val="true"
                  :label="$t('input.yes')"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn color="primary" icon="send" :label="$t('input.confirm')" @click="submitForm" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-card-actions align="right">
        <q-btn flat :label="$t('form.cancel')" v-close-popup color="red" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="spinner" persistent>
    <div class="row items-center justify-center q-pa-md">
      <CustomSpinner :show="spinner" />
    </div>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { useNotify } from './useNotify.js'
import { arrondissements as rawArrondissements } from '../data/Arrondissements.js'
import { activites as rawActivites } from '../data/Activites.js'
import { centres as rawCentres } from '../data/Centres.js'
import { formeJuridique as rawFormeJuridique } from '../data/FormeJuridique.js'
import { impots as rawImpots } from '../data/Impots.js'
import { pays as rawPays } from '../data/Pays.js'
import { pieces as rawPieces } from '../data/Pieces.js'
import { regexPatterns } from '../js/regex.js'
import { useI18n } from 'vue-i18n'
import html2pdf from 'html2pdf.js'
import CustomSpinner from 'src/components/CustomSpinner.vue'

defineProps({
  service: Object,
})

const { locale } = useI18n()
const emit = defineEmits(['close'])

const { notifyError, notifySuccess, notifyInfo } = useNotify()

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

const arrondissements = ref([...rawArrondissements])
const activites = ref([...rawActivites])
const centres = ref([...rawCentres])
const formeJuridique = ref([...rawFormeJuridique])
const impots = ref([...rawImpots])
const pays = ref([...rawPays])
const pieces = ref([...rawPieces])

const form = ref({
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
  CODE_CENTRECNPSC: '',
  CAUSE_IMMA: '',
  CIRCUIT_DOSSIER: '',
  NATURE_JURC: '',
  NBRE_EMPL: '',
  CODE_SECT_ACTIVITEC: '',
  CODE_REGIME: '',
  CODE_GPE_RISQUE: '',
  CODE_ARRONDC: '',
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
  SEXE_PERSEMPL: '',
})

const formFile = ref({
  IDREGICOMM: ref(null),
  IDAUTORISATION: ref(null),
  attestationImmatriculation: ref(null),
  IDPLANLOCAL: ref(null),
  IDCONTRATBAIL: ref(null),
  IDLISTTRAV: ref(null),
  IDPATENTE: ref(null),
  IDIMPOT: ref(null),
  IDSTATUTS: ref(null),
  IDCONTRIBUABLE: ref(null),
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

const goToNextStep = async (nextStep) => {
  if (!form.value.CIRCUIT_DOSSIER || !form.value.CAUSE_IMMA) {
    notifyError(
      'Veuillez selectionner les origines du dossier tout en haut du formulaire / Please choose the file origins at the top section of the form.',
    )
    return
  }
  const valid = await formRef.value.validate()
  if (valid) {
    step.value = nextStep
    if (nextStep > maxStep.value) {
      maxStep.value = nextStep
    }
  } else {
    notifyError('Veuillez remplir tous les champs requis / Please fill in all required fields.')
  }
}

const onRejected = (rejectedEntries) => {
  // Notify plugin needs to be installed
  // https://v2.quasar.dev/quasar-plugins/notify#Installation
  notifyError(
    `Les fichiers n'ont pas passé les contraintes de validation (taille max 3 Mo, accept=".pdf,.jpg,.jpeg,.png,.Xlsx") : ${rejectedEntries
      .map((entry) => entry.name)
      .join(', ')}`,
  )
}

/* const fileSizeRule = (val) => {
  if (!val || val.length === 0) return true // Ne valide pas si rien n'est sélectionné
  return val[0].size <= 3 * 1024 * 1024 || 'Fichier trop volumineux (max 3 Mo)'
} */

const maxSize = 3 * 1024 * 1024

/* const findCentreCNPSByCentreImpots = (selectedCentreImpots) => {
  if (!selectedCentreImpots || !selectedCentreImpots.CODE_CENTRECNPS) return null

  return (
    rawCentres.find((cnps) => cnps.CODE_CENTRE === selectedCentreImpots.CODE_CENTRECNPS) || null
  )
} */

/* watch(
  () => form.value.CODE_CENTREIMPOTC,
  (newValue) => {
    form.value.CODE_CENTRECNPSC = findCentreCNPSByCentreImpots(newValue)
  },
) */

watch(
  () => form.value.CODE_SECT_ACTIVITEC,
  (newValue) => {
    form.value.CODE_REGIME = newValue.CODE_REGIME_CNPS
    form.value.CODE_GPE_RISQUE = newValue.CODE_GPE_RISQUE
  },
)

const rechercherSiege = async () => {
  const matricule = form.value.NUM_EMPL_SIEGE?.trim().toUpperCase()
  if (!regexPatterns.numEmpl1.test(matricule) && !regexPatterns.numEmpl2.test(matricule)) {
    notifyError(
      'Le matricule saisi est invalide. Format attendu : 321-1234567-A ou 321-1234567-000-M!',
    )
    console.warn('Matricule invalide:', matricule)
    return
  }
  spinner.value = true
  notifyInfo('Recherche du siège!')
  setTimeout(() => {
    notifySuccess('Siège trouvé!')
    ;(form.value.RAISON_SOCIALE_SIEGE = "Raison sociale de l'entreprise mère"),
      (form.value.NOM_COMMERCIAL_SIEGE = "Sigle de l'entreprise mère")
    spinner.value = false
  }, 2000)
}

const submitForm = async () => {
  const valid = await formRef.value.validate()
  if (!valid) {
    notifyError('Veuillez corriger les erreurs du formulaire.')
    return
  }
  spinner.value = true
  notifyInfo('Soumission des données à Energizer.')
  console.log('Formulaire soumis:', form.value)
  setTimeout(() => {
    notifySuccess('Formulaire de données soumis avec succès.')
    submitFormFile()
  }, 3000)
  // open.value = false
  // emit('close')
  // Ajouter ici l'appel à l'API si nécessaire
}

const submitFormFile = async () => {
  notifyInfo('Soumission des documents à la GED.')
  console.log('Fichiers soumis:', formFile.value)
  setTimeout(() => {
    notifySuccess('Formulaire de fichier soumis avec succès.')
    spinner.value = false
    open.value = false
    emit('close')
  }, 5000)
  // Ajouter ici l'appel à l'API si nécessaire
}

const isStepAllowed = (stepName) => {
  return stepName <= maxStep.value // Seules les étapes passées ou en cours sont cliquables
}

const getArrondissementName = (code) => {
  const arr = arrondissements.value.find((a) => a.CODE_ARROND === code)
  return arr ? arr.NOM_ARROND : code
}
const getNationaliteName = (value) => {
  const found = pays.value.find((item) => item.code === value || item.nationalite === value)
  return found?.nationalite || value
}

const downloadPDF = () => {
  const element = recapContent.value

  const opt = {
    margin: 0.5,
    filename: `recap-entreprise-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  }

  html2pdf().from(element).set(opt).save()
}

const filterArrondissement = (val, update) => {
  if (val === '') {
    update(() => {
      arrondissements.value = [...rawArrondissements]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    arrondissements.value = rawArrondissements.filter((item) =>
      item.NOM_ARROND.toLowerCase().includes(needle),
    )
  })
}

const filterActivites = (val, update) => {
  if (val === '') {
    update(() => {
      activites.value = [...rawActivites]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    activites.value = rawActivites.filter((item) =>
      item.LIBELLE_SECT_ACTIVITE.toLowerCase().includes(needle),
    )
  })
}

const filterCentreCNPS = (val, update) => {
  if (val === '') {
    update(() => {
      centres.value = [...rawCentres]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    centres.value = rawCentres.filter((item) => item.LIB_CENTRE.toLowerCase().includes(needle))
  })
}

const filterFormeJuridique = (val, update) => {
  if (val === '') {
    update(() => {
      formeJuridique.value = [...rawFormeJuridique]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    formeJuridique.value = rawFormeJuridique.filter((item) =>
      item.LIBELLE_NATUREJUR.toLowerCase().includes(needle),
    )
  })
}

const filterImpots = (val, update) => {
  if (val === '') {
    update(() => {
      impots.value = [...rawImpots]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    impots.value = rawImpots.filter((item) => item.ABREVIATION.toLowerCase().includes(needle))
  })
}

const filterPays = (val, update) => {
  if (val === '') {
    update(() => {
      pays.value = [...rawPays]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    pays.value = rawPays.filter((item) => item.nationalite.toLowerCase().includes(needle))
  })
}
const filterPieces = (val, update) => {
  if (val === '') {
    update(() => {
      pieces.value = [...rawPieces]
    })
    return
  }
  const needle = val.toLowerCase()
  update(() => {
    pieces.value = rawPieces.filter((item) => item.LIBELLE.toLowerCase().includes(needle))
  })
}

const closeDialog = () => {
  open.value = false
  emit('close')
}

// ✅ Convertir JJ/MM/AAAA → YYYY-MM-DD
/* function updateDateFromDisplay(val) {
  const [day, month, year] = val.split('/')
  if (day && month && year) {
    form.value.date_creation_empl = `${year}-${month}-${day}`
  } else {
    form.value.date_creation_empl = null
  }
} */

// ✅ Convertir YYYY-MM-DD → JJ/MM/AAAA
function updateDisplayFromDate(val) {
  if (val) {
    const [year, month, day] = val.split('-')
    displayDate.value = `${day}/${month}/${year}`
  } else {
    displayDate.value = ''
  }
}

// ✅ Synchroniser displayDate si dateOuverture est défini initialement
watch(
  () => form.value.DATE_DEB_SERVICE,
  (val) => updateDisplayFromDate(val, 'DATE_DEB_SERVICE'),
  { immediate: true },
)

watch(
  () => form.value.date_creation_empl,
  (val) => updateDisplayFromDate(val, 'date_creation_empl'),
  { immediate: true },
)

watch(
  () => form.value.DATE_EFFET,
  (val) => updateDisplayFromDate(val, 'DATE_EFFET'),
  { immediate: true },
)

watch(
  () => form.value.DATE_NAISS_PERSEMPL,
  (val) => updateDisplayFromDate(val, 'DATE_NAISS_PERSEMPL'),
  { immediate: true },
)

watch(
  () => form.value.dateDelivrancePieceIdentitePromoteur,
  (val) => updateDisplayFromDate(val, 'dateDelivrancePieceIdentitePromoteur'),
  { immediate: true },
)
</script>

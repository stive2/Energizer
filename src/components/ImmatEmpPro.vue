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
            v-model="form.origineImmatriculation"
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
            v-model="form.origineDossier"
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
        <q-form ref="formRef" @submit.prevent="submitForm">
          <q-stepper v-model="step" :vertical="$q.screen.lt.sm" color="primary" animated header-nav>
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
                  v-model="form.raisonSociale"
                  :label="$t('input.raisonSociale')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.raisonSociale = val.toUpperCase())"
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
                  v-model="form.nomCommercial"
                  :label="$t('input.nomCommercial')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.nomCommercial = val.toUpperCase())"
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
                  v-model="form.sigle"
                  :label="$t('input.sigle')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.sigle = val.toUpperCase())"
                />
                <q-input
                  v-model="form.autreContact"
                  :label="$t('input.autreContact')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.autreContact = val.toUpperCase())"
                />
                <q-input
                  v-model="form.dateOuverture"
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
                          v-model="form.dateOuverture"
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
                  v-model="form.dateCreation"
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
                          v-model="form.dateCreation"
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
                  v-model="form.dateEmbauche"
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
                          v-model="form.dateEmbauche"
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
                  v-model="form.numRegistreCommerce"
                  :label="$t('input.numRegistreCommerce')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[
                    required,
                    (val) => !val || regexPatterns.regComm.test(val) || '(ex: RC/YAO/2020/B/0002)',
                  ]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.numRegistreCommerce = val.toUpperCase())"
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
                  v-model="form.numContribuable"
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
                  @update:model-value="(val) => (form.numContribuable = val.toUpperCase())"
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
                  v-model="formFile.registreCommerce"
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
                  v-model="formFile.autorisationOuverture"
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
                  v-model="formFile.carteContribuable"
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
                  v-model="formFile.statuts"
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
                  v-model="form.matriculeSiege"
                  v-if="form.isSuccursale"
                  :label="$t('input.matriculeSiege')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.matriculeSiege = val.toUpperCase())"
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
                  v-model="form.nomCommercialSiege"
                  v-if="form.isSuccursale"
                  :label="$t('input.nomCommercialSiege')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.nomCommercialSiege = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.nomCommercialSiege') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.raisonSocialeSiege"
                  v-if="form.isSuccursale"
                  :label="$t('input.raisonSocialeSiege')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.raisonSocialeSiege = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.raisonSocialeSiege') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(2)" color="primary" :label="$t('form.next')" />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 2 : Coordonnées de l'entreprise -->
            <q-step
              :name="2"
              :title="$t('immep.step2')"
              icon="location_on"
              :done="step > 2"
              :disable="!isStepAllowed(2)"
            >
              <div class="q-gutter-md justify-center row">
                <q-select
                  v-model="form.arrondissement"
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
                  v-model="form.adresse"
                  :label="$t('input.adresse')"
                  outlined
                  dense
                  class="col-md-7 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.adresse = val.toUpperCase())"
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
                  v-model="form.quartier"
                  :label="$t('input.quartier')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.quartier = val.toUpperCase())"
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
                  v-model="form.lieuDit"
                  :label="$t('input.lieuDit')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.lieuDit = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" />
                  </template>
                </q-input>
                <q-input
                  v-model="form.boitePostale"
                  :label="$t('input.boitePostale')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.boitePostale = val.toUpperCase())"
                />
                <q-input
                  v-model="form.numLogement"
                  :label="$t('input.numLogement')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.numLogement = val.toUpperCase())"
                />
                <q-input
                  v-model="form.email"
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
                  v-model="form.telephone"
                  :label="$t('input.telephone')"
                  outlined
                  prefix="+237"
                  type="tel"
                  mask="### ### ###"
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
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
                  v-model="formFile.planLocalisation"
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

            <!-- Etape 3 : Données administratives et fiscales -->
            <q-step
              :name="3"
              :title="$t('immep.step3')"
              icon="location_on"
              :done="step > 3"
              :disable="!isStepAllowed(3)"
            >
              <div class="q-gutter-md justify-center row">
                <q-select
                  v-model="form.formeJuridique"
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
                  v-model="form.nombreTravailleurs"
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
                  v-model="form.activiteEconomique"
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
                  v-model="form.activiteEconomique.REGIME_CNPS"
                  :label="$t('input.regimeCNPS')"
                  outlined
                  readonly
                  dense
                  class="col-md-2 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.activiteEconomique.DESCRIPTION"
                  :label="$t('input.groupeRisque')"
                  outlined
                  readonly
                  dense
                  class="col-md-2 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.centreImpots"
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
                  @update:model-value="
                    (val) => (form.centreCNPS = findCentreCNPSByCentreImpots(val))
                  "
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
                  </template>
                </q-select>
                <q-select
                  v-model="form.centreCNPS"
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
                  v-model="formFile.listeTravailleurs"
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
                  v-model="form.nomResponsable"
                  :label="$t('input.nomResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.nomResponsable = val.toUpperCase())"
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
                  v-model="form.prenomResponsable"
                  :label="$t('input.prenomResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.prenomResponsable = val.toUpperCase())"
                />
                <q-input
                  v-model="form.dateNaissanceResponsable"
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
                          v-model="form.dateNaissanceResponsable"
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
                  v-model="form.lieuNaissanceResponsable"
                  :label="$t('input.lieuNaissanceResponsable')"
                  outlined
                  dense
                  class="col-md-7 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.lieuNaissanceResponsable = val.toUpperCase())"
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
                  v-model="form.arrondissementNaissanceResponsable"
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
                  v-model="form.sexeResponsable"
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
                  v-model="form.nationaliteResponsable"
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
                  v-model="form.adresseResponsable"
                  :label="$t('input.adresseResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.adresseResponsable = val.toUpperCase())"
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
                  v-model="form.boitePostaleResponsable"
                  :label="$t('input.boitePostaleResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.boitePostaleResponsable = val.toUpperCase())"
                />
                <q-input
                  v-model="form.telephoneResponsable"
                  :label="$t('input.telephoneResponsable')"
                  outlined
                  type="tel"
                  mask="### ### ###"
                  prefix="+237"
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
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
                  v-model="form.emailResponsable"
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
                  v-model="form.pieceIdentiteResponsable"
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
                  v-model="form.numPieceIdentiteResponsable"
                  :label="$t('input.numPieceIdentiteResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="
                    (val) => (form.numPieceIdentiteResponsable = val.toUpperCase())
                  "
                />
                <q-input
                  v-model="form.dateDelivrancePieceIdentiteResponsable"
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
                          v-model="form.dateDelivrancePieceIdentiteResponsable"
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
                  v-model="form.lieuDelivrancePieceIdentiteResponsable"
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
                  v-model="formFile.contratBail"
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
                  v-model="formFile.patente"
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
                  v-model="formFile.impotLiberatoire"
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
                  <q-card-section>
                    <div class="text-h6">{{ $t('immep.step1') }}</div>
                    <q-separator class="q-my-sm" />

                    <div>
                      <strong>{{ $t('input.raisonSociale') }} : </strong> {{ form.raisonSociale }}
                    </div>
                    <div>
                      <strong>{{ $t('input.nomCommercial') }} : </strong> {{ form.nomCommercial }}
                    </div>
                    <div>
                      <strong>{{ $t('input.sigle') }} : </strong> {{ form.sigle }}
                    </div>
                    <div>
                      <strong>{{ $t('input.autreContact') }} : </strong> {{ form.autreContact }}
                    </div>
                    <div>
                      <strong>{{ $t('input.dateOuverture') }} : </strong> {{ form.dateOuverture }}
                    </div>
                    <div>
                      <strong>{{ $t('input.dateCreation') }} : </strong> {{ form.dateCreation }}
                    </div>
                    <div>
                      <strong>{{ $t('input.dateEmbauche') }} : </strong> {{ form.dateEmbauche }}
                    </div>
                    <div>
                      <strong>{{ $t('input.numRegistreCommerce') }} : </strong>
                      {{ form.numRegistreCommerce }}
                    </div>
                    <div>
                      <strong>{{ $t('input.numContribuable') }} : </strong>
                      {{ form.numContribuable }}
                    </div>

                    <div>
                      <strong>{{ $t('input.registreCommerce') }} : </strong>
                      {{ formFile.registreCommerce?.name || $t('input.nonRenseigne') }}
                    </div>
                    <div>
                      <strong>{{ $t('input.autorisationOuverture') }} : </strong>
                      {{ formFile.autorisationOuverture?.name || $t('input.nonRenseigne') }}
                    </div>
                    <div>
                      <strong>{{ $t('input.carteContribuable') }} : </strong>
                      {{ formFile.carteContribuable?.name || $t('input.nonRenseigne') }}
                    </div>
                    <div>
                      <strong>{{ $t('input.statuts') }} : </strong>
                      {{ formFile.statuts?.name || $t('input.nonRenseigne') }}
                    </div>

                    <div>
                      <strong>{{ $t('input.isSuccursale') }} : </strong>
                      {{ form.isSuccursale ? $t('form.oui') : $t('form.non') }}
                    </div>

                    <template v-if="form.isSuccursale">
                      <div>
                        <strong>{{ $t('input.matriculeSiege') }} : </strong>
                        {{ form.matriculeSiege }}
                      </div>
                      <div>
                        <strong>{{ $t('input.nomCommercialSiege') }} : </strong>
                        {{ form.nomCommercialSiege }}
                      </div>
                      <div>
                        <strong>{{ $t('input.raisonSocialeSiege') }} : </strong>
                        {{ form.raisonSocialeSiege }}
                      </div>
                    </template>
                  </q-card-section>

                  <q-card-section>
                    <div class="text-h6">{{ $t('immep.step2') }}</div>
                    <q-separator class="q-my-sm" />

                    <div>
                      <strong>{{ $t('input.arrondissement') }} : </strong>
                      {{ getArrondissementName(form.arrondissement?.NOM_ARROND) }}
                    </div>
                    <div>
                      <strong>{{ $t('input.adresse') }} : </strong> {{ form.adresse }}
                    </div>
                    <div>
                      <strong>{{ $t('input.quartier') }} : </strong> {{ form.quartier }}
                    </div>
                    <div>
                      <strong>{{ $t('input.lieuDit') }} : </strong>
                      {{ form.lieuDit || $t('input.nonRenseigne') }}
                    </div>
                    <div>
                      <strong>{{ $t('input.boitePostale') }} : </strong>
                      {{ form.boitePostale || $t('input.nonRenseigne') }}
                    </div>
                    <div>
                      <strong>{{ $t('input.numLogement') }} : </strong>
                      {{ form.numLogement || $t('input.nonRenseigne') }}
                    </div>
                    <div>
                      <strong>{{ $t('input.email') }} : </strong> {{ form.email }}
                    </div>
                    <div>
                      <strong>{{ $t('input.telephone') }} : </strong> +237 {{ form.telephone }}
                    </div>
                    <div>
                      <strong>{{ $t('input.planLocalisation') }} : </strong>
                      {{ formFile.planLocalisation?.name || $t('input.nonRenseigne') }}
                    </div>
                  </q-card-section>

                  <q-card-section>
                    <div class="text-h6">{{ $t('immep.step3') }}</div>
                    <q-separator class="q-my-sm" />

                    <div>
                      <strong>{{ $t('input.formeJuridique') }} : </strong>
                      {{ form.formeJuridique?.LIBELLE_NATUREJUR }}
                    </div>
                    <div>
                      <strong>{{ $t('input.nombreTravailleurs') }} : </strong>
                      {{ form.nombreTravailleurs }}
                    </div>
                    <div>
                      <strong>{{ $t('input.activiteEconomique') }} : </strong>
                      {{ form.activiteEconomique?.LIBELLE_SECT_ACTIVITE }}
                    </div>
                    <div>
                      <strong>{{ $t('input.regimeCNPS') }} : </strong>
                      {{ form.activiteEconomique?.REGIME_CNPS }}
                    </div>
                    <div>
                      <strong>{{ $t('input.groupeRisque') }} : </strong>
                      {{ form.activiteEconomique?.DESCRIPTION }}
                    </div>
                    <div>
                      <strong>{{ $t('input.centreImpots') }} : </strong>
                      {{ form.centreImpots?.ABREVIATION }}
                    </div>
                    <div>
                      <strong>{{ $t('input.centreCNPS') }} : </strong>
                      {{ form.centreCNPS?.LIB_CENTRE }}
                    </div>
                    <div>
                      <strong>{{ $t('input.listeTravailleurs') }} : </strong>
                      {{ formFile.listeTravailleurs?.name || $t('input.nonRenseigne') }}
                    </div>
                    <div>
                      <strong>{{ $t('input.attestationImmatriculation') }} : </strong>
                      {{ formFile.attestationImmatriculation?.name || $t('input.nonRenseigne') }}
                    </div>
                  </q-card-section>

                  <q-card-section>
                    <div class="text-h6">{{ $t('immep.step4') }}</div>
                    <q-separator class="q-my-sm" />

                    <div>
                      <strong>{{ $t('input.nomResponsable') }} : </strong> {{ form.nomResponsable }}
                    </div>
                    <div>
                      <strong>{{ $t('input.prenomResponsable') }} : </strong>
                      {{ form.prenomResponsable || $t('input.nonRenseigne') }}
                    </div>
                    <div>
                      <strong>{{ $t('input.dateNaissanceResponsable') }} : </strong>
                      {{ form.dateNaissanceResponsable }}
                    </div>
                    <div>
                      <strong>{{ $t('input.lieuNaissanceResponsable') }} : </strong>
                      {{ form.lieuNaissanceResponsable }}
                    </div>
                    <div>
                      <strong>{{ $t('input.arrondissementNaissanceResponsable') }} : </strong>
                      {{
                        getArrondissementName(form.arrondissementNaissanceResponsable.NOM_ARROND)
                      }}
                    </div>
                    <div>
                      <strong>{{ $t('input.sexeResponsable') }} : </strong>
                      {{ form.sexeResponsable }}
                    </div>
                    <div>
                      <strong>{{ $t('input.nationaliteResponsable') }} : </strong>
                      {{ getNationaliteName(form.nationaliteResponsable.nationalite) }}
                    </div>
                    <div>
                      <strong>{{ $t('input.adresseResponsable') }} : </strong>
                      {{ form.adresseResponsable }}
                    </div>
                    <div>
                      <strong>{{ $t('input.boitePostaleResponsable') }} : </strong>
                      {{ form.boitePostaleResponsable || $t('input.nonRenseigne') }}
                    </div>
                    <div>
                      <strong>{{ $t('input.telephoneResponsable') }} : </strong> +237
                      {{ form.telephoneResponsable }}
                    </div>
                    <div>
                      <strong>{{ $t('input.emailResponsable') }} : </strong>
                      {{ form.emailResponsable }}
                    </div>
                    <div>
                      <strong>{{ $t('input.pieceIdentiteResponsable') }} : </strong>
                      {{ form.pieceIdentiteResponsable.LIBELLE }}
                    </div>
                    <div>
                      <strong>{{ $t('input.numPieceIdentiteResponsable') }} : </strong>
                      {{ form.numPieceIdentiteResponsable }}
                    </div>
                    <div>
                      <strong>{{ $t('input.dateDelivrancePieceIdentiteResponsable') }} : </strong>
                      {{ form.dateDelivrancePieceIdentiteResponsable }}
                    </div>
                    <div>
                      <strong>{{ $t('input.lieuDelivrancePieceIdentitePromoteur') }} : </strong>
                      {{ form.lieuDelivrancePieceIdentiteResponsable.NOM_ARROND }}
                    </div>
                  </q-card-section>

                  <q-card-section>
                    <div class="text-h6">{{ $t('immep.step5') }}</div>
                    <q-separator class="q-my-sm" />

                    <div>
                      <strong>{{ $t('input.contratbail') }} : </strong>
                      {{ formFile.contratBail?.name || $t('input.nonRenseigne') }}
                    </div>
                    <div>
                      <strong>{{ $t('input.patente') }} : </strong>
                      {{ formFile.patente?.name || $t('input.nonRenseigne') }}
                    </div>
                    <div>
                      <strong>{{ $t('input.impotLiberatoire') }} : </strong>
                      {{ formFile.impotLiberatoire?.name || $t('input.nonRenseigne') }}
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

      <q-card-actions align="right">
        <q-btn flat :label="$t('form.cancel')" v-close-popup color="red" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog persistent v-model="spinner">
    <q-spinner-cube size="xl" color="primary" />
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
  raisonSociale: '',
  nomCommercial: '',
  sigle: '',
  adresse: '',
  quartier: '',
  email: '',
  telephone: '',
  nomResponsable: '',
  prenomResponsable: '',
  centreImpots: '',
  centreCNPS: '',
  origineImmatriculation: '',
  origineDossier: '',
  formeJuridique: '',
  nombreTravailleurs: '',
  activiteEconomique: '',
  regimeCNPS: '',
  groupeRisque: '',
  arrondissement: '',
  lieuDit: '',
  boitePostale: '',
  numLogement: '',
  autreContact: '',
  dateOuverture: '',
  dateCreation: '',
  dateEmbauche: '',
  numRegistreCommerce: '',
  numIdentifiantUnique: '',
  isSuccursale: false,
  nomCommercialSiege: '',
  raisonSocialeSiege: '',
  matriculeSiege: '',
})

const formFile = ref({
  registreCommerce: ref(null),
  autorisationOuverture: ref(null),
  attestationImmatriculation: ref(null),
  planLocalisation: ref(null),
  contratBail: ref(null),
  listeTravailleurs: ref(null),
  patente: ref(null),
  impotLiberatoire: ref(null),
  statuts: ref(null),
  carteContribuable: ref(null),
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
  if (!form.value.origineDossier || !form.value.origineImmatriculation) {
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

const findCentreCNPSByCentreImpots = (selectedCentreImpots) => {
  if (!selectedCentreImpots || !selectedCentreImpots.CODE_CENTRECNPS) return null

  return (
    rawCentres.find((cnps) => cnps.CODE_CENTRE === selectedCentreImpots.CODE_CENTRECNPS) || null
  )
}

watch(
  () => form.value.centreImpots,
  (newValue) => {
    form.value.centreCNPS = findCentreCNPSByCentreImpots(newValue)
  },
)

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
    form.value.dateCreation = `${year}-${month}-${day}`
  } else {
    form.value.dateCreation = null
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
  () => form.value.dateOuverture,
  (val) => updateDisplayFromDate(val, 'dateOuverture'),
  { immediate: true },
)

watch(
  () => form.value.dateCreation,
  (val) => updateDisplayFromDate(val, 'dateCreation'),
  { immediate: true },
)

watch(
  () => form.value.dateEmbauche,
  (val) => updateDisplayFromDate(val, 'dateEmbauche'),
  { immediate: true },
)

watch(
  () => form.value.dateNaissanceResponsable,
  (val) => updateDisplayFromDate(val, 'dateNaissanceResponsable'),
  { immediate: true },
)

watch(
  () => form.value.dateDelivrancePieceIdentitePromoteur,
  (val) => updateDisplayFromDate(val, 'dateDelivrancePieceIdentitePromoteur'),
  { immediate: true },
)
</script>

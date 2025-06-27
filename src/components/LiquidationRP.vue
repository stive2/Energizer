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
        <q-form ref="formRef" @submit.prevent="dialValidation = true">
          <q-stepper
            v-model="step"
            :vertical="$q.screen.lt.sm"
            color="primary"
            :inactive-color="maxStep >= step ? 'secondary' : ''"
            animated
            header-nav
          >
            <!-- Etape 1 : Informations de l'employeur -->
            <q-step
              :name="1"
              :title="$t('form2.step1')"
              icon="person"
              :done="step > 1"
              :disable="!isStepAllowed(1)"
            >
              <div class="q-gutter-md justify-center row">
                <q-select
                  v-model="form.numdossier"
                  :options="['Dossier 1', 'Dossier 2']"
                  :label="$t('input.objet')"
                  outlined
                  dense
                  input-debounce="0"
                  fill-input
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                  @blur="rechercherDossier"
                >
                  <template v-slot:label>
                    {{ $t('input.numdossier') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  v-model="form.objet"
                  :label="$t('input.objet')"
                  outlined
                  dense
                  :readonly="!form.numdossier"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.objet = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.objet') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.numassu"
                  :readonly="!form.numdossier"
                  :label="$t('input.numassu')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.numassu = val.toUpperCase())"
                  outlined
                  dense
                  :rules="[
                    required,
                    (val) =>
                      regexPatterns.numAssu1.test(val) ||
                      regexPatterns.numAssu2.test(val) ||
                      '(ex: 321-1234567-0 ou 321-1234567-000-0)',
                  ]"
                >
                  <template v-slot:label>
                    {{ $t('input.numassu') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.nom"
                  :readonly="!form.numdossier"
                  :label="$t('input.nomcompletass')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.nom = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.nomcompletass') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>

                <q-input
                  v-model="form.emploiassure"
                  :readonly="!form.numdossier"
                  :label="$t('input.emploiassure')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.emploiassure = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.emploiassure') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>

                <q-input
                  v-model="form.datedeces"
                  :readonly="!form.numdossier"
                  :label="$t('input.datedeces')"
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
                          v-model="form.datedeces"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.txipp"
                  :readonly="!form.numdossier"
                  :label="$t('input.txipp')"
                  outlined
                  dense
                  type="number"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                >
                  <template v-slot:label>
                    {{ $t('input.objet') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.numemployeur"
                  :readonly="!form.numdossier"
                  :label="$t('input.numemployeur')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[
                    required,
                    (val) =>
                      regexPatterns.numEmpl1.test(val) ||
                      regexPatterns.numEmpl2.test(val) ||
                      '(ex: 321-1234567-A ou 321-1234567-000-M)',
                  ]"
                >
                  <template v-slot:label>
                    {{ $t('input.immatriculation') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.datedeclaration"
                  :readonly="!form.numdossier"
                  :label="$t('input.datedeclaration')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.datedeclaration"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.datedeclaration') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.datedepot"
                  :readonly="!form.numdossier"
                  :label="$t('input.datedemande')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.datedepot"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.datedemande') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.observation"
                  :readonly="!form.numdossier"
                  :label="$t('input.observation')"
                  outlined
                  type="textarea"
                  dense
                  class="col-md-10 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.observation = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.observation') }}
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

            <!-- Etape 2 : Coordonnées de l'employeur -->
            <q-step
              :name="2"
              :title="$t('form2.step2')"
              icon="person"
              :done="step > 2"
              :disable="!isStepAllowed(2)"
            >
              <div class="q-gutter-md justify-center row">
                <q-select
                  v-model="form.postetravail"
                  :options="postesTravails"
                  option-label="libelle"
                  :label="$t('input.postetravail')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPostesTravails"
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.postetravail') }}
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
                  v-model="form.codetyperisque"
                  :options="typesRisques"
                  option-label="libelle"
                  :label="$t('input.codetyperisque')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterTypesRisques"
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.codetyperisque') }}
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
                <q-input
                  v-model="form.datesurvenance"
                  :label="$t('input.datesurvenance')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                  :rules="[required]"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.datesurvenance"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.datesurvenance') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-select
                  v-model="form.heuresurvenance"
                  :options="[
                    '12:00 AM',
                    '12:15 AM',
                    '12:30 AM',
                    '12:45 AM',
                    '1:00 AM',
                    '1:15 AM',
                    '1:30 AM',
                    '1:45 AM',
                    '2:00 AM',
                    '2:15 AM',
                    '2:30 AM',
                    '2:45 AM',
                    '3:00 AM',
                    '3:15 AM',
                    '3:30 AM',
                    '3:45 AM',
                    '4:00 AM',
                    '4:15 AM',
                    '4:30 AM',
                    '4:45 AM',
                    '5:00 AM',
                    '5:15 AM',
                    '5:30 AM',
                    '5:45 AM',
                    '6:00 AM',
                    '6:15 AM',
                    '6:30 AM',
                    '6:45 AM',
                    '7:00 AM',
                    '7:15 AM',
                    '7:30 AM',
                    '7:45 AM',
                    '8:00 AM',
                    '8:15 AM',
                    '8:30 AM',
                    '8:45 AM',
                    '9:00 AM',
                    '9:15 AM',
                    '9:30 AM',
                    '9:45 AM',
                    '10:00 AM',
                    '10:15 AM',
                    '10:30 AM',
                    '10:45 AM',
                    '11:00 AM',
                    '11:15 AM',
                    '11:30 AM',
                    '11:45 AM',
                    '12:00 PM',
                    '12:15 PM',
                    '12:30 PM',
                    '12:45 PM',
                    '1:00 PM',
                    '1:15 PM',
                    '1:30 PM',
                    '1:45 PM',
                    '2:00 PM',
                    '2:15 PM',
                    '2:30 PM',
                    '2:45 PM',
                    '3:00 PM',
                    '3:15 PM',
                    '3:30 PM',
                    '3:45 PM',
                    '4:00 PM',
                    '4:15 PM',
                    '4:30 PM',
                    '4:45 PM',
                    '5:00 PM',
                    '5:15 PM',
                    '5:30 PM',
                    '5:45 PM',
                    '6:00 PM',
                    '6:15 PM',
                    '6:30 PM',
                    '6:45 PM',
                    '7:00 PM',
                    '7:15 PM',
                    '7:30 PM',
                    '7:45 PM',
                    '8:00 PM',
                    '8:15 PM',
                    '8:30 PM',
                    '8:45 PM',
                    '9:00 PM',
                    '9:15 PM',
                    '9:30 PM',
                    '9:45 PM',
                    '10:00 PM',
                    '10:15 PM',
                    '10:30 PM',
                    '10:45 PM',
                    '11:00 PM',
                    '11:15 PM',
                    '11:30 PM',
                    '11:45 PM',
                  ]"
                  label=""
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.heuresurvenance') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-select
                  v-model="form.arrondissement"
                  :options="arrondissements"
                  option-label="libelle"
                  :label="$t('input.arrondissement')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
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
                  v-model="form.lieuaccident"
                  :label="$t('input.lieuaccident')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.lieuaccident = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.lieuaccident') }}
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
                    <q-icon name="place" />
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
                  v-model="form.adresse"
                  :label="$t('input.adresse2')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.adresse = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.adresse2') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.causes"
                  :label="$t('input.causes')"
                  outlined
                  dense
                  type="textarea"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.causes = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.causes') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.consequences"
                  :label="$t('input.consequences')"
                  outlined
                  dense
                  type="textarea"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.consequences = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.consequences') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>

                <q-select
                  v-model="form.codesiegelesion"
                  :options="siegesLesions"
                  option-label="libelle"
                  :label="$t('input.siegelesion')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterSiegesLesions"
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.siegelesion') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  v-model="form.siegelesion"
                  :label="$t('input.siegelesion2')"
                  outlined
                  dense
                  type="textarea"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.siegelesion = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.siegelesion2') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-select
                  v-model="form.codenatlesion"
                  :options="naturesLesions"
                  option-label="libelle"
                  :label="$t('input.naturelesion')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterNaturesLesions"
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.naturelesion') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  v-model="form.naturelesion"
                  :label="$t('input.naturelesion2')"
                  outlined
                  dense
                  type="textarea"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.naturelesion = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.naturelesion2') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>

                <q-input
                  v-model="form.ancienneteposte"
                  :label="$t('input.ancienneteposte')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.ancienneteposte = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.ancienneteposte') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>

                <div class="q-pa-md q-gutter-sm col-md-5 col-xs-12 col-sm-12">
                  <div class="q-gutter-sm text-bold" style="text-transform: uppercase">
                    {{ $t('input.flagformation') }}
                    <q-radio
                      dense
                      v-model="form.flagformation"
                      color="red"
                      :val="'NON'"
                      :label="$t('input.non')"
                    />
                    <q-radio
                      dense
                      v-model="form.flagformation"
                      color="primary"
                      :val="'OUI'"
                      :label="$t('input.oui')"
                    />
                  </div>
                </div>

                <q-select
                  v-model="form.agentmateriel"
                  :options="agentsMateriels"
                  option-label="libelle"
                  :label="$t('input.agentmateriel')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterAgentsMateriels"
                  :rules="[required]"
                  class="col-md-10 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.agentmateriel') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>

                <q-input
                  v-model="form.temoin1"
                  :label="$t('input.temoin1')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.temoin1 = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.temoin1') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>

                <q-input
                  v-model="form.identite1"
                  :label="$t('input.identite1')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.identite1 = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.identite1') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.temoin2"
                  :label="$t('input.temoin2')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.temoin2 = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.temoin2') }}
                  </template>
                </q-input>

                <q-input
                  v-model="form.identite2"
                  :label="$t('input.identite2')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.identite2 = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.identite2') }}
                  </template>
                </q-input>
                <q-input
                  v-model="form.temoin3"
                  :label="$t('input.temoin3')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.temoin3 = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.temoin3') }}
                  </template>
                </q-input>

                <q-input
                  v-model="form.identite3"
                  :label="$t('input.identite3')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.identite3 = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.identite3') }}
                  </template>
                </q-input>

                <div class="q-pa-md q-gutter-sm col-md-5 col-xs-12 col-sm-12">
                  <div class="q-gutter-sm text-bold" style="text-transform: uppercase">
                    {{ $t('input.flaghospitalisation') }}
                    <q-radio
                      dense
                      v-model="form.flaghospitalisation"
                      color="red"
                      :val="'NON'"
                      :label="$t('input.non')"
                    />
                    <q-radio
                      dense
                      v-model="form.flaghospitalisation"
                      color="primary"
                      :val="'OUI'"
                      :label="$t('input.oui')"
                    />
                  </div>
                </div>

                <q-input
                  v-model="form.lieuhospitalisation"
                  :label="$t('input.lieuhospitalisation')"
                  outlined
                  dense
                  v-if="form.flaghospitalisation === 'OUI'"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.lieuhospitalisation = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.lieuhospitalisation') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>

                <div class="q-pa-md q-gutter-sm col-md-5 col-xs-12 col-sm-12">
                  <div class="q-gutter-sm text-bold" style="text-transform: uppercase">
                    {{ $t('input.flag') }}
                    <q-radio
                      dense
                      v-model="form.flag"
                      color="red"
                      :val="'NON'"
                      :label="$t('input.non')"
                    />
                    <q-radio
                      dense
                      v-model="form.flag"
                      color="primary"
                      :val="'OUI'"
                      :label="$t('input.oui')"
                    />
                  </div>
                </div>

                <div class="q-pa-md q-gutter-sm col-md-5 col-xs-12 col-sm-12">
                  <div class="q-gutter-sm text-bold" style="text-transform: uppercase">
                    {{ $t('input.flagarrettravail') }}
                    <q-radio
                      dense
                      v-model="form.flagarrettravail"
                      color="red"
                      :val="'NON'"
                      :label="$t('input.non')"
                    />
                    <q-radio
                      dense
                      v-model="form.flagarrettravail"
                      color="primary"
                      :val="'OUI'"
                      :label="$t('input.oui')"
                    />
                  </div>
                </div>

                <div class="q-pa-md q-gutter-sm col-md-5 col-xs-12 col-sm-12">
                  <div class="q-gutter-sm text-bold" style="text-transform: uppercase">
                    {{ $t('input.flagdecesimmediat') }}
                    <q-radio
                      dense
                      v-model="form.flagdecesimmediat"
                      color="red"
                      :val="'NON'"
                      :label="$t('input.non')"
                    />
                    <q-radio
                      dense
                      v-model="form.flagdecesimmediat"
                      color="primary"
                      :val="'OUI'"
                      :label="$t('input.oui')"
                    />
                  </div>
                </div>
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

            <!-- Etape 3 : Informations sur l'entreprise -->
            <q-step
              :name="3"
              :title="$t('form2.step3')"
              icon="business"
              :done="step > 3"
              :disable="!isStepAllowed(3)"
            >
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.categorie"
                  :label="$t('input.categorie')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.categorie = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.categorie') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.echelon"
                  :label="$t('input.echelon')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.echelon = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.echelon') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-select
                  v-model="form.secteur"
                  :options="secteursActivites"
                  :label="$t('input.secteur')"
                  outlined
                  dense
                  input-debounce="0"
                  fill-input
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.secteur') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-select
                  v-model="form.zone"
                  :options="['1', '2', '3']"
                  label=""
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.zone') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  v-model="form.montant1"
                  :label="$t('input.montant1')"
                  outlined
                  dense
                  type="number"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.montant1') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.montant2"
                  :label="$t('input.montant2')"
                  outlined
                  dense
                  type="number"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.montant2') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.montant3"
                  :label="$t('input.montant3')"
                  outlined
                  dense
                  type="number"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.montant3') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.salrecons"
                  :label="$t('input.salrecons')"
                  outlined
                  dense
                  type="number"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.salrecons') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <div class="q-pa-md q-gutter-sm col-md-5 col-xs-12 col-sm-12">
                  <div class="q-gutter-sm text-bold" style="text-transform: uppercase">
                    {{ $t('input.flagretarrerage') }}
                    <q-radio
                      dense
                      v-model="form.flagretarrerage"
                      color="red"
                      :val="'NON'"
                      :label="$t('input.non')"
                    />
                    <q-radio
                      dense
                      v-model="form.flagretarrerage"
                      color="primary"
                      :val="'OUI'"
                      :label="$t('input.oui')"
                    />
                  </div>
                </div>
                <q-input
                  v-model="form.montantretenue"
                  v-if="form.flagretarrerage === 'OUI'"
                  :label="$t('input.montantretenue')"
                  outlined
                  dense
                  type="number"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.montantretenue') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
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

            <!-- Etape 4 : Informations sur l'entreprise -->
            <q-step
              :name="4"
              :title="$t('form2.step4')"
              icon="business"
              :done="step > 4"
              :disable="!isStepAllowed(4)"
            >
              <div class="q-gutter-md justify-center row">
                <div class="q-pa-md q-gutter-sm text-center col-md-12 col-xs-12 col-sm-12">
                  <div class="q-gutter-sm text-bold" style="text-transform: uppercase">
                    {{ $t('input.flagrisqueprec') }}
                    <q-radio
                      dense
                      v-model="form.flagrisqueprec"
                      color="red"
                      :val="'NON'"
                      :label="$t('input.non')"
                    />
                    <q-radio
                      dense
                      v-model="form.flagrisqueprec"
                      color="primary"
                      :val="'OUI'"
                      :label="$t('input.oui')"
                    />
                  </div>
                </div>
                <q-input
                  v-model="form.ippold"
                  v-if="form.flagrisqueprec === 'OUI'"
                  :label="$t('input.ippold')"
                  outlined
                  dense
                  type="number"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.ippold') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.rmmold"
                  v-if="form.flagrisqueprec === 'OUI'"
                  :label="$t('input.rmmold')"
                  outlined
                  dense
                  type="number"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.rmmold') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.renteold"
                  v-if="form.flagrisqueprec === 'OUI'"
                  :label="$t('input.renteold')"
                  outlined
                  dense
                  type="number"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.renteold') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.allocationold"
                  v-if="form.flagrisqueprec === 'OUI'"
                  :label="$t('input.allocationold')"
                  outlined
                  dense
                  type="number"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.allocationold') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
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

            <!-- Etape 5 : Informations sur l'entreprise -->
            <q-step
              :name="5"
              :title="$t('form2.step5')"
              icon="business"
              :done="step > 5"
              :disable="!isStepAllowed(5)"
            >
              <div class="q-gutter-md justify-center row">
                <div class="q-pa-md q-gutter-sm text-center col-md-12 col-xs-12 col-sm-12">
                  <div class="q-gutter-sm text-bold" style="text-transform: uppercase">
                    {{ $t('input.flagtiersresp') }}
                    <q-radio
                      dense
                      v-model="form.flagtiersresp"
                      color="red"
                      :val="'NON'"
                      :label="$t('input.non')"
                    />
                    <q-radio
                      dense
                      v-model="form.flagtiersresp"
                      color="primary"
                      :val="'OUI'"
                      :label="$t('input.oui')"
                    />
                  </div>
                </div>
                <q-input
                  v-model="form.nomtiers"
                  v-if="form.flagtiersresp === 'OUI'"
                  :label="$t('input.nomtiers')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.nomtiers = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.nomtiers') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.orgassureur"
                  v-if="form.flagtiersresp === 'OUI'"
                  :label="$t('input.orgassureur')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.orgassureur = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.orgassureur') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.numpolice"
                  v-if="form.flagtiersresp === 'OUI'"
                  :label="$t('input.numpolice')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.numpolice = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.numpolice') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.immatriculation"
                  v-if="form.flagtiersresp === 'OUI'"
                  :label="$t('input.immatriculation')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.immatriculation = val.toUpperCase())"
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
                    {{ $t('input.immatriculation') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.telephone"
                  v-if="form.flagtiersresp === 'OUI'"
                  label=""
                  outlined
                  type="tel"
                  prefix="+237"
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
                <q-input
                  v-model="form.adresseassureur"
                  v-if="form.flagtiersresp === 'OUI'"
                  :label="$t('input.adresse')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
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
                  v-model="form.boitepostale"
                  v-if="form.flagtiersresp === 'OUI'"
                  :label="$t('input.boitePostale')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.boitepostale = val.toUpperCase())"
                />
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
                    <div class="text-h6 col-12">{{ $t('form2.step1') }}</div>
                    <q-separator class="q-my-sm" />
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.numdossier') }} : </strong> {{ form.numdossier }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.objet') }} : </strong> {{ form.objet }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.numassu') }} : </strong>
                      {{ form.numassu }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.nomcompletass') }} : </strong>
                      {{ form.nom }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.emploiassure') }} : </strong>
                      {{ form.emploiassure }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.datedeces') }} : </strong> {{ form.datedeces }}
                    </div>

                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.txipp') }} : </strong>
                      {{ form.txipp }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.numemployeur') }} : </strong>
                      {{ form.numemployeur }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.datedeclaration') }} : </strong>
                      {{ form.datedeclaration }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.datedemande') }} : </strong>
                      {{ form.datedepot }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.observation') }} : </strong>
                      {{ form.observation }}
                    </div>
                  </q-card-section>

                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('form2.step2') }}</div>
                    <q-separator class="q-my-sm" />
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.postetravail') }} : </strong>
                      {{ form.postetravail.libelle }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.codetyperisque') }} : </strong>
                      {{ form.codetyperisque.libelle }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.datesurvenance') }} : </strong>
                      {{ form.datesurvenance }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.heuresurvenance') }} : </strong>
                      {{ form.heuresurvenance }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.lieuaccident') }} : </strong> {{ form.lieuaccident }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.arrondissement') }} : </strong>
                      {{ form.arrondissement.libelle }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.quartier') }} : </strong> {{ form.quartier }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.adresse2') }} : </strong> {{ form.adresse }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.causes') }} : </strong> {{ form.causes }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.consequences') }} : </strong>
                      {{ form.consequences }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.codesiegelesion') }} : </strong>
                      {{ form.codesiegelesion.libelle }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.siegelesion2') }} : </strong>
                      {{ form.siegelesion }}
                    </div>

                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.codenatlesion') }} : </strong>
                      {{ form.codenatlesion.libelle }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.naturelesion2') }} : </strong> {{ form.naturelesion }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.ancienneteposte') }} : </strong>
                      {{ form.ancienneteposte }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.flagformation') }} : </strong>
                      {{ form.flagformation }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.agentmateriel') }} : </strong>
                      {{ form.agentmateriel.libelle }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.temoin1') }} : </strong>
                      {{ form.temoin1 }}
                    </div>

                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.identite1') }} : </strong> {{ form.identite1 }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.temoin2') }} : </strong> {{ form.temoin2 }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.identite2') }} : </strong> {{ form.identite2 }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.temoin3') }} : </strong>
                      {{ form.temoin3 }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.identite3') }} : </strong>
                      {{ form.identite3 }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.flaghospitalisation') }} : </strong>
                      {{ form.flaghospitalisation }}
                    </div>
                    <div
                      class="col-md-5 col-xs-12 col-sm-12"
                      v-if="form.flaghospitalisation === 'OUI'"
                    >
                      <strong>{{ $t('input.lieuhospitalisation') }} : </strong>
                      {{ form.lieuhospitalisation }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.flag') }} : </strong>
                      {{ form.flag }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.flagarrettravail') }} : </strong>
                      {{ form.flagarrettravail }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.flagdecesimmediat') }} : </strong>
                      {{ form.flagdecesimmediat }}
                    </div>
                  </q-card-section>

                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('form2.step3') }}</div>
                    <q-separator class="q-my-sm" />
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.categorie') }} : </strong>
                      {{ form.categorie }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.echelon') }} : </strong> {{ form.echelon }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.secteur') }} : </strong>
                      {{ form.secteur }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.zone') }} : </strong>
                      {{ form.zone }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.montant1') }} : </strong>
                      {{ form.montant1 }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.montant2') }} : </strong>
                      {{ form.montant2 }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.montant3') }} : </strong>
                      {{ form.montant3 }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.salrecons') }} : </strong>
                      {{ form.salrecons }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.flagretarrerage') }} : </strong>
                      {{ form.flagretarrerage }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12" v-if="form.flagretarrerage === 'OUI'">
                      <strong>{{ $t('input.montantretenue') }} : </strong>
                      {{ form.montantretenue }}
                    </div>
                  </q-card-section>

                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('form2.step4') }}</div>
                    <q-separator class="q-my-sm" />
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.flagrisqueprec') }} : </strong>
                      {{ form.flagrisqueprec }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12" v-if="form.flagrisqueprec === 'OUI'">
                      <strong>{{ $t('input.ippold') }} : </strong> {{ form.ippold }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12" v-if="form.flagrisqueprec === 'OUI'">
                      <strong>{{ $t('input.rmmold') }} : </strong>
                      {{ form.rmmold }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12" v-if="form.flagrisqueprec === 'OUI'">
                      <strong>{{ $t('input.renteold') }} : </strong>
                      {{ form.renteold }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12" v-if="form.flagrisqueprec === 'OUI'">
                      <strong>{{ $t('input.allocationold') }} : </strong>
                      {{ form.allocationold }}
                    </div>
                  </q-card-section>

                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('form2.step5') }}</div>
                    <q-separator class="q-my-sm" />
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.flagtiersresp') }} : </strong>
                      {{ form.flagtiersresp }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12" v-if="form.flagtiersresp === 'OUI'">
                      <strong>{{ $t('input.nomtiers') }} : </strong> {{ form.nomtiers }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12" v-if="form.flagtiersresp === 'OUI'">
                      <strong>{{ $t('input.orgassureur') }} : </strong>
                      {{ form.orgassureur }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12" v-if="form.flagtiersresp === 'OUI'">
                      <strong>{{ $t('input.numpolice') }} : </strong>
                      {{ form.numpolice }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12" v-if="form.flagtiersresp === 'OUI'">
                      <strong>{{ $t('input.immatriculation') }} : </strong>
                      {{ form.immatriculation }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12" v-if="form.flagtiersresp === 'OUI'">
                      <strong>{{ $t('input.telephone') }} : </strong>
                      {{ form.telephone }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12" v-if="form.flagtiersresp === 'OUI'">
                      <strong>{{ $t('input.adresse') }} : </strong>
                      {{ form.adresse }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12" v-if="form.flagtiersresp === 'OUI'">
                      <strong>{{ $t('input.boitePostale') }} : </strong>
                      {{ form.boitepostale }}
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

      <q-card-actions align="right">
        <q-btn flat :label="$t('form.cancel')" v-close-popup color="red" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>

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

  <q-dialog v-model="spinner" persistent>
    <div class="row items-center justify-center q-pa-md">
      <CustomSpinner :show="spinner" />
    </div>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { useNotify } from './useNotify.js'
import { regexPatterns } from '../js/regex.js'
import { useI18n } from 'vue-i18n'
import html2pdf from 'html2pdf.js'
import { arrondissements as rawArrondissements } from '../data/Arrondissements2.js'
import CustomSpinner from 'src/components/CustomSpinner.vue'
import { agentsMateriels as rawAgentsMateriels } from 'src/data/AgentsMateriels.js'
import { naturesLesions as rawNaturesLesions } from 'src/data/NaturesLesions.js'
import { siegesLesions as rawSiegesLesions } from 'src/data/SiegesLesions.js'
import { secteursActivites as rawSecteursActivites } from 'src/data/SecteursActivites.js'
import { postesTravails as rawPostesTravails } from 'src/data/PostesTravails.js'
import { typesRisques as rawTypesRisques } from 'src/data/TypesRisques.js'

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
const dialValidation = ref(false)

const arrondissements = ref([...rawArrondissements])
const agentsMateriels = ref([...rawAgentsMateriels])
const naturesLesions = ref([...rawNaturesLesions])
const siegesLesions = ref([...rawSiegesLesions])
const secteursActivites = ref([...rawSecteursActivites])
const postesTravails = ref([...rawPostesTravails])
const typesRisques = ref([...rawTypesRisques])

const form = ref({
  LIEU_PIECEC: '',
  LOCALITE_NAISS_PERSEMPL: '',
  LieuNaissPe: '',
  ADRESSE_EMPL: '',
  NATIONALITEC: '',
  NOM_PERSEMPL: '',
  CODE_CENTREIMPOTC: '',
  CODE_CENTRECNPSC: '',
  CAUSE_IMMA: '',
  CIRCUIT_DOSSIER: '',
  NOM_QUARTIER: '',
  NBRE_EMPL: '',
  NUM_PIECE: '',
  PROFESSION: '',
  SEXE_PERSEMPL: '',
  TEL: '',
  TEL_PERSEMPL: '',
  typepiece: '',
  num_case: '',
  autreContact: '',
  DATE_DEB_SERVICE: '',
  DATE_EFFET: '',
  isSuccursale: false,
  CODE_ARRONDC: '',
  validation: false,
  today: new Date(),
})

const formFile = ref({
  IDPLANLOCAL: ref(null),
  IDLISTTRAV: ref(null),
  attestationImmatriculation: ref(null),
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
    // generatePDFPreview()
    spinner.value = false
    open.value = false
    emit('close')
  }, 5000)
  // Ajouter ici l'appel à l'API si nécessaire
}

const isStepAllowed = (stepName) => {
  return stepName <= maxStep.value // Seules les étapes passées ou en cours sont cliquables
}

/* const generatePDFPreview = async () => {
  const element = recapContent.value

  const opt = {
    margin: 0.5,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  }

  const worker = html2pdf().from(element).set(opt)
  const pdfBlob = await worker.outputPdf('blob')

  // Crée un URL temporaire
  pdfBlobUrl.value = URL.createObjectURL(pdfBlob)
  pdfDialog.value = true
} */

const rechercherDossier = async () => {
  spinner.value = true
  notifyInfo('Recherche du dossier!')
  setTimeout(() => {
    notifySuccess('Dossier trouvé!')
    ;(form.value.objet = 'Objet du dossier'),
      (form.value.numassu = '321-1234567-8'),
      (form.value.nom = 'Nom Complet Assuré'),
      (form.value.emploiassure = "Emploi de l'assuré"),
      (form.value.datedeces = null),
      (form.value.txipp = '17.5'),
      (form.value.numemployeur = '321-1234567-P'),
      (form.value.datedeclaration = new Date().toISOString().split('T')[0]),
      (form.value.datedepot = new Date().toISOString().split('T')[0]),
      (form.value.observation = 'Observation du dossier'),
      (spinner.value = false)
  }, 2000)
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
      item.libelle.toLowerCase().includes(needle),
    )
  })
}

const filterAgentsMateriels = (val, update) => {
  if (val === '') {
    update(() => {
      agentsMateriels.value = [...rawAgentsMateriels]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    agentsMateriels.value = rawAgentsMateriels.filter((item) =>
      item.libelle.toLowerCase().includes(needle),
    )
  })
}

const filterNaturesLesions = (val, update) => {
  if (val === '') {
    update(() => {
      naturesLesions.value = [...rawNaturesLesions]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    naturesLesions.value = rawNaturesLesions.filter((item) =>
      item.libelle.toLowerCase().includes(needle),
    )
  })
}

const filterPostesTravails = (val, update) => {
  if (val === '') {
    update(() => {
      postesTravails.value = [...rawPostesTravails]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    postesTravails.value = rawPostesTravails.filter((item) =>
      item.libelle.toLowerCase().includes(needle),
    )
  })
}

const filterSiegesLesions = (val, update) => {
  if (val === '') {
    update(() => {
      siegesLesions.value = [...rawSiegesLesions]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    siegesLesions.value = rawSiegesLesions.filter((item) =>
      item.libelle.toLowerCase().includes(needle),
    )
  })
}

const filterTypesRisques = (val, update) => {
  if (val === '') {
    update(() => {
      typesRisques.value = [...rawTypesRisques]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    typesRisques.value = rawTypesRisques.filter((item) =>
      item.libelle.toLowerCase().includes(needle),
    )
  })
}

const closeDialog = () => {
  open.value = false
  emit('close')
}

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
  () => form.value.DATE_NAISS_PERSEMPL,
  (val) => updateDisplayFromDate(val, 'DATE_NAISS_PERSEMPL'),
  { immediate: true },
)

watch(
  () => form.value.DATE_PIECE,
  (val) => updateDisplayFromDate(val, 'DATE_PIECE'),
  { immediate: true },
)

watch(
  () => form.value.DATE_DEB_SERVICE,
  (val) => updateDisplayFromDate(val, 'DATE_DEB_SERVICE'),
  { immediate: true },
)

watch(
  () => form.value.DATE_EFFET,
  (val) => updateDisplayFromDate(val, 'DATE_EFFET'),
  { immediate: true },
)
</script>

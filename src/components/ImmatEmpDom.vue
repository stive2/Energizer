<template>
  <q-dialog v-model="open" persistent full-width>
    <q-card :style="$q.screen.gt.sm ? 'width: 900px' : 'width: 100%'">
      <q-card-section>
        <div class="text-h6 text-primary text-center text-bold">
          {{ $t(service.name) }}
        </div>
      </q-card-section>

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

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" @submit.prevent="submitForm">
          <q-stepper v-model="step" :vertical="$q.screen.lt.sm" color="primary" animated header-nav>
            <!-- Etape 1 : Informations de l'employeur -->
            <q-step
              :name="1"
              :title="$t('immed.step1')"
              icon="person"
              :done="step > 1"
              :disable="!isStepAllowed(1)"
            >
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.nomEmployeur"
                  :label="$t('input.nom')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.nomEmployeur = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.nom') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.prenomEmployeur"
                  :label="$t('input.prenom')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.prenomEmployeur = val.toUpperCase())"
                />
                <q-input
                  v-model="form.dateNaissanceEmployeur"
                  :label="$t('input.dateNaissance')"
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
                          v-model="form.dateNaissanceEmployeur"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.dateNaissance') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.lieuNaissanceEmployeur"
                  :label="$t('input.lieuNaissance')"
                  outlined
                  dense
                  class="col-md-7 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.lieuNaissanceEmployeur = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.lieuNaissance') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-select
                  v-model="form.arrondissementNaissanceEmployeur"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  :label="$t('input.arrondissementNaissance')"
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
                    {{ $t('input.arrondissementNaissance') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-select
                  v-model="form.sexeEmployeur"
                  :options="['FEMININ', 'MASCULIN']"
                  :label="$t('input.sexe')"
                  outlined
                  dense
                  input-debounce="0"
                  fill-input
                  :rules="[required]"
                  class="col-md-3 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.sexe') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-select
                  v-model="form.nationaliteEmployeur"
                  :options="pays"
                  option-label="nationalite"
                  :label="$t('input.nationalite')"
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
                    {{ $t('input.nationalite') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  v-model="form.proffessionEmployeur"
                  :label="$t('input.profession')"
                  outlined
                  dense
                  class="col-md-10 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.proffessionEmployeur = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.profession') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-select
                  v-model="form.pieceIdentiteEmployeur"
                  :options="pieces"
                  option-label="LIBELLE"
                  label=""
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPieces"
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.pieceIdentite') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  v-model="form.numPieceIdentiteEmployeur"
                  label=""
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="
                    (val) => (form.numPieceIdentiteEmployeur = val.toUpperCase())
                  "
                >
                  <template v-slot:label>
                    {{ $t('input.numPieceIdentite') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.dateDelivrancePieceIdentiteEmployeur"
                  label=""
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
                          v-model="form.dateDelivrancePieceIdentiteEmployeur"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.dateDelivrancePieceIdentite') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-select
                  v-model="form.lieuDelivrancePieceIdentitePromoteur"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  label=""
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
                  <template v-slot:label>
                    {{ $t('input.lieuDelivrancePieceIdentite') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(2)" color="primary" :label="$t('form.next')" />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 2 : Coordonnées de l'employeur -->
            <q-step
              :name="2"
              :title="$t('immep.step2')"
              icon="person"
              :done="step > 2"
              :disable="!isStepAllowed(2)"
            >
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.adresseEmployeur"
                  :label="$t('input.adresse')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.adresseEmployeur = val.toUpperCase())"
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
                  v-model="form.boitePostaleEmployeur"
                  :label="$t('input.boitePostale')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.boitePostaleEmployeur = val.toUpperCase())"
                />
                <q-input
                  v-model="form.telephoneEmployeur"
                  label=""
                  outlined
                  prefix="+237"
                  type="tel"
                  mask="### ### ###"
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.phone') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.mobileEmployeur"
                  label=""
                  outlined
                  type="tel"
                  prefix="+237"
                  mask="### ### ###"
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.mobile') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.emailEmployeur"
                  label=""
                  outlined
                  dense
                  class="col-md-4 col-xs-12 col-sm-12"
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
                    {{ $t('input.emailc') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-select
                  v-model="form.arrondissementEmployeur"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  label=""
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
                    {{ $t('input.arrondissementResidence') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  v-model="form.quartierEmployeur"
                  label=""
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.quartierEmployeur = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="map" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.quartierResidence') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.lieuDitEmployeur"
                  :label="$t('input.lieuDitResidence')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.lieuDitEmployeur = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" />
                  </template>
                </q-input>
                <q-input
                  v-model="form.numLogement"
                  :label="$t('input.numLogement')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.numLogement = val.toUpperCase())"
                />
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
              :title="$t('immep.step3')"
              icon="business"
              :done="step > 3"
              :disable="!isStepAllowed(3)"
            >
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.dateOuverture"
                  label=""
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
                          v-model="form.dateOuverture"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
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
                  v-model="form.dateEmbauche"
                  label=""
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
                          v-model="form.dateEmbauche"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.dateEmbauche') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.numIdentifiantUnique"
                  :label="$t('input.numContribuable')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[
                    (val) =>
                      !val ||
                      regexPatterns.numContr.test(val) ||
                      'Format invalide (ex: P123456789321M)',
                  ]"
                />
                <q-input
                  v-model="form.nombreTravailleurs"
                  label=""
                  outlined
                  type="number"
                  min="1 "
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
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
                  v-model="form.centreImpots"
                  :options="impots"
                  option-label="ABREVIATION"
                  label=""
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
                  label=""
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
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(4)" color="primary" :label="$t('form.next')" />
                <q-btn
                  flat
                  @click="step = 1"
                  color="primary"
                  :label="$t('form.previous')"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 4 : Recap -->
            <q-step
              :name="4"
              :title="$t('input.recap')"
              icon="list"
              :done="step > 4"
              :disable="!isStepAllowed(4)"
            >
              <div class="q-pa-md" ref="recapContent">
                <q-card flat bordered class="q-pa-md" style="text-transform: uppercase">
                  <q-card-section>
                    <div class="text-h6">{{ $t('immed.step1') }}</div>
                    <q-separator class="q-my-sm" />
                    <div>
                      <strong>{{ $t('input.nom') }} : </strong> {{ form.nomEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.prenom') }} : </strong> {{ form.prenomEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.dateNaissance') }} : </strong>
                      {{ form.dateNaissanceEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.lieuNaissance') }} : </strong>
                      {{ form.lieuNaissanceEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.arrondissementNaissance') }} : </strong>
                      {{ getArrondissementName(form.arrondissementNaissanceEmployeur.NOM_ARROND) }}
                    </div>
                    <div>
                      <strong>{{ $t('input.sexe') }} : </strong> {{ form.sexeEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.nationalite') }} : </strong>
                      {{ getPaysName(form.nationaliteEmployeur.nationalite) }}
                    </div>
                    <div>
                      <strong>{{ $t('input.profession') }} : </strong>
                      {{ form.proffessionEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.pieceIdentite') }} : </strong>
                      {{ getPieceName(form.pieceIdentiteEmployeur.LIBELLE) }}
                    </div>
                    <div>
                      <strong>{{ $t('input.numPieceIdentite') }} : </strong>
                      {{ form.numPieceIdentiteEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.dateDelivrancePieceIdentite') }} : </strong>
                      {{ form.dateDelivrancePieceIdentiteEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.lieuDelivrancePieceIdentite') }} : </strong>
                      {{
                        getArrondissementName(form.lieuDelivrancePieceIdentitePromoteur.NOM_ARROND)
                      }}
                    </div>
                  </q-card-section>

                  <q-card-section>
                    <div class="text-h6">{{ $t('immed.step2') }}</div>
                    <q-separator class="q-my-sm" />
                    <div>
                      <strong>{{ $t('input.adresse') }} : </strong> {{ form.adresseEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.boitePostale') }} : </strong>
                      {{ form.boitePostaleEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.phone') }} : </strong> +237 {{ form.telephoneEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.mobile') }} : </strong> +237 {{ form.mobileEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.emailc') }} : </strong> {{ form.emailEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.arrondissementResidence') }} : </strong>
                      {{ getArrondissementName(form.arrondissementEmployeur.NOM_ARROND) }}
                    </div>
                    <div>
                      <strong>{{ $t('input.quartierResidence') }} : </strong>
                      {{ form.quartierEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.lieuDitResidence') }} : </strong>
                      {{ form.lieuDitEmployeur }}
                    </div>
                    <div>
                      <strong>{{ $t('input.numLogement') }} : </strong> {{ form.numLogement }}
                    </div>
                  </q-card-section>

                  <q-card-section>
                    <div class="text-h6">{{ $t('immed.step3') }}</div>
                    <q-separator class="q-my-sm" />
                    <div>
                      <strong>{{ $t('input.dateOuverture') }} : </strong> {{ form.dateOuverture }}
                    </div>
                    <div>
                      <strong>{{ $t('input.dateEmbauche') }} : </strong> {{ form.dateEmbauche }}
                    </div>
                    <div>
                      <strong>{{ $t('input.numContribuable') }} : </strong>
                      {{ form.numIdentifiantUnique }}
                    </div>
                    <div>
                      <strong>{{ $t('input.nombreTravailleurs') }} : </strong>
                      {{ form.nombreTravailleurs }}
                    </div>
                    <div>
                      <strong>{{ $t('input.centreImpots') }} : </strong>
                      {{ getCentreImpotsName(form.centreImpots.ABREVIATION) }}
                    </div>
                    <div>
                      <strong>{{ $t('input.centreCNPS') }} : </strong>
                      {{ getCentreCNPSName(form.centreCNPS.LIB_CENTRE) }}
                    </div>
                  </q-card-section>

                  <!-- Fichiers joints -->
                  <q-card-section>
                    <div class="text-h6">{{ $t('input.document') }}</div>
                    <q-separator class="q-my-sm" />
                    <div>
                      <strong>{{ $t('input.attestationImmatriculation') }} : </strong>
                      <span v-if="formFile.attestationImmatriculation">{{
                        formFile.attestationImmatriculation.name
                      }}</span>
                      <span v-else class="text-negative">Non fourni</span>
                    </div>
                    <div>
                      <strong>{{ $t('input.planLocalisation') }} : </strong>
                      <span v-if="formFile.planLocalisation">{{
                        formFile.planLocalisation.name
                      }}</span>
                      <span v-else class="text-negative">Non fourni</span>
                    </div>
                    <div>
                      <strong>{{ $t('input.listeTravailleurs') }} : </strong>
                      <span v-if="formFile.listeTravailleurs">{{
                        formFile.listeTravailleurs.name
                      }}</span>
                      <span v-else class="text-negative">Non fourni</span>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <q-stepper-navigation>
                <q-btn type="submit" color="primary" :label="$t('form.submit')" />
                <q-btn
                  flat
                  @click="step = 3"
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

  <q-dialog persistent v-model="spinner">
    <q-spinner-cube size="xl" color="primary" />
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { useNotify } from './useNotify.js'
import { arrondissements as rawArrondissements } from '../data/Arrondissements.js'
import { centres as rawCentres } from '../data/Centres.js'
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
const centres = ref([...rawCentres])
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
  planLocalisation: ref(null),
  listeTravailleurs: ref(null),
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
    `Les fichiers suivants n'ont pas passé les contraintes de validation : ${rejectedEntries
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
    // generatePDFPreview()
    spinner.value = false
    open.value = false
    emit('close')
  }, 5000)
  // Ajouter ici l'appel à l'API si nécessaire
}

const getCentreImpotsName = (code) => {
  const item = impots.value.find((i) => i.CODE === code || i.ABREVIATION === code)
  return item ? item.ABREVIATION : code
}

const isStepAllowed = (stepName) => {
  return stepName <= maxStep.value // Seules les étapes passées ou en cours sont cliquables
}

const getCentreCNPSName = (code) => {
  const item = centres.value.find((i) => i.CODE_CENTRE === code)
  return item ? item.LIB_CENTRE : code
}

const getArrondissementName = (code) => {
  const arr = arrondissements.value.find((a) => a.CODE_ARROND === code)
  return arr ? arr.NOM_ARROND : code
}

const getPaysName = (code) => {
  const p = pays.value.find((p) => p.code === code)
  return p ? p.nationalite : code
}

const getPieceName = (code) => {
  const piece = pieces.value.find((p) => p.CODE === code)
  return piece ? piece.LIBELLE : code
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
  () => form.value.dateNaissanceEmployeur,
  (val) => updateDisplayFromDate(val, 'dateNaissanceEmployeur'),
  { immediate: true },
)

watch(
  () => form.value.dateDelivrancePieceIdentiteEmployeur,
  (val) => updateDisplayFromDate(val, 'dateDelivrancePieceIdentiteEmployeur'),
  { immediate: true },
)

watch(
  () => form.value.dateOuverture,
  (val) => updateDisplayFromDate(val, 'dateOuverture'),
  { immediate: true },
)

watch(
  () => form.value.dateEmbauche,
  (val) => updateDisplayFromDate(val, 'dateEmbauche'),
  { immediate: true },
)
</script>

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
            :options="circuitDossierOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :label="$t('input.origineDossier')"
            outlined
            dense
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
              :title="$t('immed.step1')"
              icon="person"
              :done="step > 1"
              :disable="!isStepAllowed(1)"
            >
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.NOM_PERSEMPL"
                  :label="$t('input.nom')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.NOM_PERSEMPL = val.toUpperCase())"
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
                  v-model="form.PRENOM_PERSEMPL"
                  :label="$t('input.prenom')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.PRENOM_PERSEMPL = val.toUpperCase())"
                />
                <q-input
                  v-model="form.DATE_NAISS_PERSEMPL"
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
                          v-model="form.DATE_NAISS_PERSEMPL"
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
                  v-model="form.LOCALITE_NAISS_PERSEMPL"
                  :label="$t('input.lieuNaissance')"
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
                    {{ $t('input.lieuNaissance') }}
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
                  option-value="CODE_ARROND"
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
                  v-model="form.SEXE_PERSEMPL"
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
                  v-model="form.NATIONALITEC"
                  :options="pays"
                  option-label="nationalite"
                  option-value="code_pays"
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
                  v-model="form.PROFESSION"
                  :label="$t('input.profession')"
                  outlined
                  dense
                  class="col-md-10 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.PROFESSION = val.toUpperCase())"
                />
                <q-select
                  v-model="form.NUM_TYPEPIECE"
                  :options="pieces"
                  option-label="LIBELLE"
                  option-value="NUM_TYPEPIECE"
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
                  v-model="form.NUM_PIECE"
                  label=""
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.NUM_PIECE = val.toUpperCase())"
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
                  v-model="form.DATE_PIECE"
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
                          v-model="form.DATE_PIECE"
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
                  v-model="form.LIEU_PIECEC"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  option-value="CODE_ARROND"
                  label=""
                  :rules="[required]"
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
                <q-file
                  v-model="formFile.fichierIdentiteEmployeur"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  label=""
                  accept=".gif,.jpg,.jpeg,.png"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || $t('input.requis'), fileTypePieceIdentite]"
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
                  v-model="form.ADRESSE_EMPL"
                  :label="$t('input.adresse')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
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
                  v-model="form.BOITE_POSTALE"
                  :label="$t('input.boitePostale')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.BOITE_POSTALE = val.toUpperCase())"
                />
                <q-input
                  v-model="form.TEL"
                  label=""
                  outlined
                  type="tel"
                  maxlength="9"
                  prefix="+237"
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
                  :rules="[
                    required,
                    (val) => regexPatterns.telephone.test(val) || $t('input.invalidPhone'),
                  ]"
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
                  v-model="form.TEL_PERSEMPL"
                  label=""
                  outlined
                  type="tel"
                  prefix="+237"
                  maxlength="9"
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
                  :rules="[
                    required,
                    (val) => regexPatterns.telephone.test(val) || $t('input.invalidPhone'),
                  ]"
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
                  v-model="form.EMAIL"
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
                  v-model="form.CODE_ARRONDC"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  option-value="CODE_ARROND"
                  label=""
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.arrondissementResidence') }}
                  </template>
                </q-select>
                <q-input
                  v-model="form.NOM_QUARTIER"
                  label=""
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
                    {{ $t('input.quartierResidence') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.LIEUDIT_EMPL"
                  :label="$t('input.lieuDitResidence')"
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
                  v-model="form.num_case"
                  :label="$t('input.numLogement')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.num_case = val.toUpperCase())"
                />
                <q-file
                  v-model="formFile.IDPLANLOCAL"
                  filled
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  label=""
                  accept=".gif,.jpg,.jpeg,.png,.doc,.docx"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || $t('input.requis'), fileTypePlanLocalisation]"
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
                  v-model="form.DATE_DEB_SERVICE"
                  label=""
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
                          v-model="form.DATE_DEB_SERVICE"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.dateOuverture') }}
                  </template>
                </q-input>
                <q-input
                  v-model="form.DATE_EFFET"
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
                          v-model="form.DATE_EFFET"
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
                  v-model="form.NBRE_EMPL"
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
                  v-model="form.CODE_CENTREIMPOTC"
                  :options="impots"
                  option-label="ABREVIATION"
                  option-value="CODE_CENTREIMPOT"
                  label=""
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterImpots"
                  @update:model-value="onCentreImpotsSelected"
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
                    (val) => (form.centreCNPS = findCentreCNPSByCentreImpots(val))
                  " -->
                  </template>
                </q-select>
                <q-select
                  v-model="form.CODE_CENTRECNPSC"
                  :options="centres"
                  option-label="LIB_CENTRE"
                  option-value="CODE_CENTRE"
                  label=""
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterCentreCNPS"
                  @update:model-value="onCentreCnpsSelected"
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
                  accept=".xls,.xlsx,.doc,.docx"
                  :max-total-size="maxSize"
                  @rejected="onRejected"
                  :rules="[(val) => (val && val != '') || $t('input.requis'), fileTypeListeTravailleurs]"
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
                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('immed.step1') }}</div>
                    <q-separator class="q-my-sm" />
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.nom') }} : </strong> {{ form.NOM_PERSEMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.prenom') }} : </strong> {{ form.PRENOM_PERSEMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.dateNaissance') }} : </strong>
                      {{ form.DATE_NAISS_PERSEMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.lieuNaissance') }} : </strong>
                      {{ form.LOCALITE_NAISS_PERSEMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.arrondissementNaissance') }} : </strong>
                      {{ getArrondissementName(form.LieuNaissPe) }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.sexe') }} : </strong> {{ form.SEXE_PERSEMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.nationalite') }} : </strong>
                      {{ getPaysName(form.NATIONALITEC) }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.profession') }} : </strong>
                      {{ form.PROFESSION }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.pieceIdentite') }} : </strong>
                      {{ getPieceName(form.NUM_TYPEPIECE) }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.numPieceIdentite') }} : </strong>
                      {{ form.NUM_PIECE }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.dateDelivrancePieceIdentite') }} : </strong>
                      {{ form.DATE_PIECE }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.lieuDelivrancePieceIdentite') }} : </strong>
                      {{ getArrondissementName(form.LIEU_PIECEC) }}
                    </div>
                  </q-card-section>

                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('immed.step2') }}</div>
                    <q-separator class="q-my-sm" />
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.adresse') }} : </strong> {{ form.ADRESSE_EMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.boitePostale') }} : </strong>
                      {{ form.BOITE_POSTALE }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.phone') }} : </strong> +237 {{ form.TEL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.mobile') }} : </strong> +237 {{ form.TEL_PERSEMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.emailc') }} : </strong> {{ form.EMAIL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.arrondissementResidence') }} : </strong>
                      {{ getArrondissementName(form.CODE_ARRONDC) }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.quartierResidence') }} : </strong>
                      {{ form.NOM_QUARTIER }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.lieuDitResidence') }} : </strong>
                      {{ form.LIEUDIT_EMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.numLogement') }} : </strong> {{ form.num_case }}
                    </div>
                  </q-card-section>

                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('immed.step3') }}</div>
                    <q-separator class="q-my-sm" />
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.dateOuverture') }} : </strong>
                      {{ form.DATE_DEB_SERVICE }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.dateEmbauche') }} : </strong> {{ form.DATE_EFFET }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.nombreTravailleurs') }} : </strong>
                      {{ form.NBRE_EMPL }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.centreImpots') }} : </strong>
                      {{ getCentreImpotsName(form.CODE_CENTREIMPOTC) }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.centreCNPS') }} : </strong>
                      {{ getCentreCNPSName(form.CODE_CENTRECNPSC) }}
                    </div>
                  </q-card-section>

                  <!-- Fichiers joints -->
                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('input.document') }}</div>
                    <q-separator class="q-my-sm" />
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.fichierIdentiteResponsable') }} : </strong>
                      <span v-if="formFile.fichierIdentiteEmployeur">{{
                        formFile.fichierIdentiteEmployeur.name
                      }}</span>
                      <span v-else class="text-negative">Non fourni</span>
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.planLocalisation') }} : </strong>
                      <span v-if="formFile.IDPLANLOCAL">{{ formFile.IDPLANLOCAL.name }}</span>
                      <span v-else class="text-negative">Non fourni</span>
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.listeTravailleurs') }} : </strong>
                      <span v-if="formFile.IDLISTTRAV">{{ formFile.IDLISTTRAV.name }}</span>
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
import { useNotify } from 'src/modules/shared/components/useNotify.js'
import { arrondissements as rawArrondissements } from 'src/modules/shared/data/Arrondissements.js'
import { centres as rawCentres } from 'src/modules/shared/data/Centres.js'
import { impots as rawImpots } from 'src/modules/shared/data/Impots.js'
import { pays as rawPays } from 'src/modules/shared/data/Pays.js'
import { pieces as rawPieces } from 'src/modules/shared/data/Pieces.js'
import { regexPatterns } from 'src/js/regex.js'
import { useI18n } from 'vue-i18n'
import html2pdf from 'html2pdf.js'
import CustomSpinner from 'src/modules/shared/components/CustomSpinner.vue'
import {
  CAUSE_IMMA_OPTIONS,
  CIRCUIT_DOSSIER_OPTIONS,
} from 'src/modules/immatriculations/data/immatEmpDomLegacyFields.js'
import {
  buildImmatEmpDomLegacyFormData,
  syncImmatEmpDomHiddenFields,
  validateImmatEmpDomBusinessRules,
} from 'src/modules/immatriculations/utils/immatEmpDomLegacy.js'
import { submitGererEmployeur } from 'src/modules/immatriculations/api/immatEmployeurApi.js'

const causeImmaOptions = CAUSE_IMMA_OPTIONS
const circuitDossierOptions = CIRCUIT_DOSSIER_OPTIONS

const RE_FILE_ID = /\.(gif|jpe?g|png)$/i
const RE_FILE_PLAN = /\.(gif|jpe?g|png|docx?)$/i
const RE_FILE_LIST = /\.(xls|xlsx|docx?)$/i

function normalizeFile(val) {
  if (!val) return null
  return Array.isArray(val) ? val[0] : val
}

function fileExtensionRule(re, val) {
  const f = normalizeFile(val)
  if (!f) return true
  return re.test(f.name) || 'Type de fichier non autorise (legacy)'
}

const fileTypePieceIdentite = (val) => fileExtensionRule(RE_FILE_ID, val)
const fileTypePlanLocalisation = (val) => fileExtensionRule(RE_FILE_PLAN, val)
const fileTypeListeTravailleurs = (val) => fileExtensionRule(RE_FILE_LIST, val)

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
const centres = ref([...rawCentres])
const impots = ref([...rawImpots])
const pays = ref([...rawPays])
const pieces = ref([...rawPieces])

const form = ref({
  TYPE_EMPLOYEUR: '0',
  CODE_REGIME: '9',
  CODE_GPE_RISQUE: 'A',
  objet: 'Empl',
  laction: 'Creer',
  code_tele: '',
  code_secret: '',
  CAUSE_IMMA: '',
  CAUSEIMMA: '',
  CIRCUIT_DOSSIER: '',
  CIRCUITDOSSIER: '',
  NOM_PERSEMPL: '',
  PRENOM_PERSEMPL: '',
  DATE_NAISS_PERSEMPL: '',
  LOCALITE_NAISS_PERSEMPL: '',
  LieuNaissPe: '',
  LIEU_NAISS_PERSEMPL: '',
  CODE_PAYS_NAISSEMPL: '',
  CODE_REGION_NAISSEMPL: '',
  CODE_DEPA_NAISSEMPL: '',
  NATIONALITEC: '',
  NATIONALITE: '',
  PROFESSION: '',
  SEXE_PERSEMPL: '',
  NUM_TYPEPIECE: '',
  typepiece: '',
  NUM_PIECE: '',
  DATE_PIECE: '',
  LIEU_PIECEC: '',
  LIEU_PIECE: '',
  CODE_PAYS_PIECE: '',
  CODE_REGION_PIECE: '',
  CODE_DEPA_PIECE: '',
  ADRESSE_EMPL: '',
  BOITE_POSTALE: '',
  TEL: '',
  TEL_PERSEMPL: '',
  EMAIL: '',
  CODE_ARRONDC: '',
  CODE_ARROND: '',
  CODE_PAYS: '',
  CODE_REGION: '',
  CODE_DEPA: '',
  NOM_QUARTIER: '',
  LIEUDIT_EMPL: '',
  num_case: '',
  DATE_DEB_SERVICE: '',
  DATE_EFFET: '',
  NBRE_EMPL: '',
  CODE_CENTREIMPOTC: '',
  CODE_CENTREIMPOT: '',
  CODE_CENTRECNPSC: '',
  CODE_CENTRECNPS: '',
  validation: false,
  _cnpsManual: false,
})

const formFile = ref({
  fichierIdentiteEmployeur: null,
  IDPLANLOCAL: null,
  IDLISTTRAV: null,
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

function onCentreImpotsSelected(code) {
  const imp = rawImpots.find((i) => String(i.CODE_CENTREIMPOT) === String(code))
  if (imp?.CODE_CENTRECNPS && !form.value._cnpsManual) {
    form.value.CODE_CENTRECNPSC = imp.CODE_CENTRECNPS
  }
  syncImmatEmpDomHiddenFields(form.value)
}

function onCentreCnpsSelected() {
  form.value._cnpsManual = true
  syncImmatEmpDomHiddenFields(form.value)
}

const submitForm = async () => {
  dialValidation.value = false
  const valid = await formRef.value.validate()
  if (!valid) {
    notifyError('Veuillez corriger les erreurs du formulaire.')
    return
  }

  const bizErr = validateImmatEmpDomBusinessRules(form.value)
  if (bizErr) {
    notifyError(bizErr)
    return
  }

  if (
    !formFile.value.fichierIdentiteEmployeur ||
    !formFile.value.IDPLANLOCAL ||
    !formFile.value.IDLISTTRAV
  ) {
    notifyError('Veuillez joindre tous les documents obligatoires.')
    return
  }

  spinner.value = true
  notifyInfo('Soumission des données à Energizer.')

  const files = {
    pieceIdentite: normalizeFile(formFile.value.fichierIdentiteEmployeur),
    planLocalisation: normalizeFile(formFile.value.IDPLANLOCAL),
    listeTravailleurs: normalizeFile(formFile.value.IDLISTTRAV),
  }

  const fd = buildImmatEmpDomLegacyFormData(form.value, files, {
    dest: import.meta.env.VITE_IMMAT_DEST_EMP_DOM || '',
  })

  try {
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

const getCentreImpotsName = (code) => {
  if (!code) return ''
  if (typeof code === 'object') return code.ABREVIATION || ''
  const item = impots.value.find(
    (i) => String(i.CODE_CENTREIMPOT) === String(code) || i.ABREVIATION === code,
  )
  return item ? item.ABREVIATION : String(code)
}

const isStepAllowed = (stepName) => {
  return stepName <= maxStep.value // Seules les étapes passées ou en cours sont cliquables
}

const getCentreCNPSName = (code) => {
  if (!code) return ''
  if (typeof code === 'object') return code.LIB_CENTRE || ''
  const item = centres.value.find((i) => String(i.CODE_CENTRE) === String(code))
  return item ? item.LIB_CENTRE : String(code)
}

const getArrondissementName = (code) => {
  if (!code) return ''
  if (typeof code === 'object') return code.NOM_ARROND || ''
  const arr = arrondissements.value.find((a) => String(a.CODE_ARROND) === String(code))
  return arr ? arr.NOM_ARROND : String(code)
}

const getPaysName = (code) => {
  if (!code) return ''
  if (typeof code === 'object') return code.nationalite || ''
  const p = pays.value.find(
    (x) => String(x.code_pays) === String(code) || x.nationalite === code,
  )
  return p ? p.nationalite : String(code)
}

const getPieceName = (code) => {
  if (!code) return ''
  if (typeof code === 'object') return code.LIBELLE || ''
  const piece = pieces.value.find((p) => String(p.NUM_TYPEPIECE) === String(code))
  return piece ? piece.LIBELLE : String(code)
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

const syncHidden = () => syncImmatEmpDomHiddenFields(form.value)

watch(
  () => [
    form.value.CAUSE_IMMA,
    form.value.CIRCUIT_DOSSIER,
    form.value.LieuNaissPe,
    form.value.LIEU_PIECEC,
    form.value.CODE_ARRONDC,
    form.value.NATIONALITEC,
    form.value.NUM_TYPEPIECE,
    form.value.CODE_CENTREIMPOTC,
    form.value.CODE_CENTRECNPSC,
  ],
  syncHidden,
  { deep: true },
)
</script>

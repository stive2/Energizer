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
        <q-form ref="formRef" @submit.prevent="submitForm">
          <q-stepper
            v-model="step"
            :vertical="!$q.screen.gt.sm"
            color="primary"
            done-color="secondary"
            header-nav
            animated
          >
            <!-- Étape 1 : Informations sur l'affiliation -->
            <q-step
              :name="1"
              :title="$t('immat.step8')"
              icon="info"
              :done="step > 1"
              :error="stepErrors[1]"
              :header-class="stepErrors[1] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(1)"
            >
              <div class="justify-center row" :class="{ column: !$q.screen.gt.sm }">
                <q-select
                  v-model="form.ORIGINE_REVENU"
                  :label="$t('inputassu.revenue_source')"
                  :options="activitiesOptions"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.revenue_source') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-select>

                <q-input
                  v-model="form.DATE_DEBUT_AFFI"
                  :label="$t('inputassu.normal_affiliation_date')"
                  :hint="$t('inputassu.normal_affiliation_date')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  readonly
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.normal_affiliation_date') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>

                <q-input
                  v-model="form.DETAILS_ORIGINEREV"
                  :label="$t('inputassu.revenue_source_detail')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  @update:model-value="(val) => (form.DETAILS_ORIGINEREV = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.revenue_source_detail') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>

                <q-input
                  v-model="form.DATE_DEBUT_AFFI_SOLL"
                  :label="$t('inputassu.requested_affiliation_date')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  readonly
                  :rules="[required]"
                  :error="stepErrors[1] && !form.DATE_DEBUT_AFFI_SOLL"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy>
                        <q-date
                          v-model="form.DATE_DEBUT_AFFI_SOLL"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :locale="locale"
                          :options="optionsDateAffiliation"
                          color="primary"
                          @update:model-value="getYearFromDate"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('inputassu.requested_affiliation_date') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>

                <q-input
                  v-model="form.MONTANT_REV_ANNUEL"
                  :label="$t('inputassu.declared_annual_income')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  type="number"
                  min="100000"
                  :rules="[required]"
                  @update:model-value="updateAssieteCotisation"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.declared_annual_income') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>

                <q-input
                  v-model="form.ASSIETTE_COTISATION"
                  :label="$t('inputassu.contribution_base')"
                  :hint="$t('inputassu.contribution_base')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  type="number"
                  min="0"
                  readonly
                  :rules="[required, validateAssieteCotisation]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.contribution_base') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>

                <q-input
                  v-model="form.TAUX"
                  :label="$t('inputassu.contribution_rate')"
                  :hint="$t('inputassu.contribution_rate')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  type="number"
                  min="0"
                  readonly
                  :rules="[required]"
                >
                  <template v-slot:append>
                    <q-icon name="percent" class="text-grey-8" />
                  </template>
                  <template v-slot:label>
                    {{ $t('inputassu.contribution_rate') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>

                <q-input
                  v-model="form.SMIG_VALUE"
                  :label="$t('inputassu.minimum_wage')"
                  :hint="$t('inputassu.minimum_wage')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  type="number"
                  min="0"
                  readonly
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.minimum_wage') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>

                <q-input
                  v-model="form.MONTANT_COTISATION"
                  :label="$t('inputassu.contribution_amount')"
                  :hint="$t('inputassu.contribution_amount')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  type="number"
                  min="0"
                  readonly
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.contribution_amount') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>

                <q-file
                  v-model="form.DECLANNUREVE_file"
                  :label="$t('inputassu.annual_income_declaration')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  :counter-label="counterLabelFn"
                  max-files="1"
                  accept=".jpg, .png, image/*, .pdf"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  @update:model-value="onFileSelected('DECLANNUREVE_file')"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('inputassu.annual_income_declaration') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-file>

                <q-file
                  v-model="form.DECLHONN_file"
                  :label="$t('inputassu.honor_declaration')"
                  :hint="$t('inputassu.honor_declaration')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  :counter-label="counterLabelFn"
                  max-files="1"
                  accept=".jpg, .png, image/*, .pdf"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  @update:model-value="onFileSelected('DECLHONN_file')"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('inputassu.honor_declaration') }}
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

            <!-- Étape 2 : Informations personnelles de l'assuré -->
            <q-step
              :name="2"
              :title="$t('immat.step2')"
              icon="person"
              :done="step > 2 || step < 2"
              :error="stepErrors[2]"
              :header-class="stepErrors[2] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(2)"
            >
              <div class="justify-center row" :class="{ column: !$q.screen.gt.sm }">
                <q-input
                  v-model="form.NOM_PERS"
                  :label="$t('inputassu.last_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  @update:model-value="(val) => (form.NOM_PERS = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.last_name') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.PRENOM_PERS"
                  :label="$t('inputassu.first_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @update:model-value="(val) => (form.PRENOM_PERS = val.toUpperCase())"
                />
                <q-select
                  v-model="form.SEXE_PERS"
                  :label="$t('inputassu.gender')"
                  :options="genderOptions"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.gender') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-select>
                <q-input
                  v-model="form.DATE_NAISS_PERS"
                  :label="$t('inputassu.date_of_birth')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.DATE_NAISS_PERS"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.DATE_NAISS_PERS"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('inputassu.date_of_birth') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.LOCALITE_NAISS"
                  :label="$t('inputassu.place_of_birth')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  @update:model-value="(val) => (form.LOCALITE_NAISS = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.place_of_birth') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                  <template v-slot:prepend>
                    <q-icon name="place" />
                  </template>
                </q-input>
                <q-select
                  v-model="form.LieuNaiss"
                  :label="$t('inputassu.birth_district')"
                  :hint="$t('inputassu.birth_district')"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.birth_district') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-select>
                <q-select
                  v-model="form.civilite"
                  :label="$t('inputassu.marital_status')"
                  :options="maritalStatusOptions"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.marital_status') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-select>
                <q-select
                  v-model="form.NATIONALITEC"
                  :label="$t('inputassu.nationality')"
                  :options="pays"
                  option-label="nationalite"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPays"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.nationality') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-select>
                <q-select
                  typepiece
                  v-model="form.typepiece"
                  :label="$t('inputassu.identity_document_type')"
                  :options="documentsOptions"
                  option-label="LIBELLE"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPieces"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.identity_document_type') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-select>
                <q-input
                  v-model="form.NUM_PIECE"
                  :label="$t('inputassu.identity_document_number')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  @update:model-value="(val) => (form.NUM_PIECE = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.identity_document_number') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.DATE_PIECE"
                  :label="$t('inputassu.issued_on')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="$t('inputassu.issued_on')"
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
                    {{ $t('inputassu.issued_on') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>
                <q-select
                  v-model="form.LIEU_PIECEC"
                  :label="$t('inputassu.place_issuance_identity_document')"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  :hint="$t('inputassu.place_issuance_identity_document')"
                  @filter="filterArrondissement"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.place_issuance_identity_document') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-select>
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

            <!-- Étape 3 : Informations sur le père de l'assuré -->
            <q-step
              :name="3"
              :title="$t('immat.step3')"
              icon="person"
              :done="step > 3 || step < 3"
              :error="stepErrors[3]"
              :header-class="stepErrors[3] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(3)"
            >
              <div class="justify-center row" :class="{ column: !$q.screen.gt.sm }">
                <q-input
                  v-model="form.NOM_PERE"
                  :label="$t('inputassu.last_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @update:model-value="(val) => (form.NOM_PERE = val.toUpperCase())"
                />
                <q-input
                  v-model="form.PRENOM_PERE"
                  :label="$t('inputassu.first_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @update:model-value="(val) => (form.PRENOM_PERE = val.toUpperCase())"
                />
                <q-input
                  v-model="form.DATE_NAISS_PERSP"
                  :label="$t('inputassu.date_of_birth')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.DATE_NAISS_PERSP"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.LOCALITE_NAISS_PERE"
                  :label="$t('inputassu.place_of_birth')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @update:model-value="(val) => (form.LOCALITE_NAISS_PERE = val.toUpperCase())"
                />
                <q-select
                  v-model="form.LieuNaissPere"
                  :label="$t('inputassu.birth_district')"
                  :hint="$t('inputassu.birth_district')"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  @update:model-value="(val) => (form.LieuNaissPere = val.toUpperCase())"
                />
                <q-select
                  v-model="form.etatP"
                  :label="$t('inputassu.alive')"
                  :options="yesNoOptions"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                />
                <q-input
                  v-if="form.etatP === $t('inputassu.no')"
                  v-model="form.DATE_DECES_PERSP"
                  :label="$t('inputassu.date_death')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.DATE_DECES_PERSP"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
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

            <!-- Étape 4 : Informations sur la mère de l'assuré -->
            <q-step
              :name="4"
              :title="$t('immat.step4')"
              icon="person"
              :done="step > 4 || step < 4"
              :error="stepErrors[4]"
              :header-class="stepErrors[4] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(4)"
            >
              <div class="justify-center row" :class="{ column: !$q.screen.gt.sm }">
                <q-input
                  v-model="form.NOM_MERE"
                  :label="$t('inputassu.last_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  @update:model-value="(val) => (form.NOM_MERE = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.last_name') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.PRENOM_MERE"
                  :label="$t('inputassu.first_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @update:model-value="(val) => (form.PRENOM_MERE = val.toUpperCase())"
                />
                <q-input
                  v-model="form.DATE_NAISS_PERSM"
                  :label="$t('inputassu.date_of_birth')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.DATE_NAISS_PERSM"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('inputassu.date_of_birth') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.LOCALITE_NAISS_MERE"
                  :label="$t('inputassu.place_of_birth')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  @update:model-value="(val) => (form.LOCALITE_NAISS_MERE = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.place_of_birth') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>
                <q-select
                  v-model="form.LieuNaissMere"
                  :label="$t('inputassu.birth_district')"
                  :hint="$t('inputassu.birth_district')"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.birth_district') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-select>
                <q-select
                  v-model="form.etatM"
                  :label="$t('inputassu.alive')"
                  :options="yesNoOptions"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.alive') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-select>
                <q-input
                  v-if="form.etatM === t('inputassu.no')"
                  v-model="form.DATE_DECES_PERSM"
                  :label="$t('inputassu.date_death')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.DATE_DECES_PERSM"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
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

            <!-- Étape 5 : Contact et Résidence -->
            <q-step
              :name="5"
              :title="$t('immat.step5')"
              icon="home"
              :done="step > 5 || step < 5"
              :error="stepErrors[5]"
              :header-class="stepErrors[5] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(5)"
            >
              <div class="justify-center row" :class="{ column: !$q.screen.gt.sm }">
                <q-select
                  v-model="form.CODE_VILLEC"
                  :label="$t('inputassu.city_of_residence')"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.city_of_residence') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-select>
                <q-input
                  v-model="form.QUARTIER"
                  :label="$t('inputassu.neighborhood')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @update:model-value="(val) => (form.QUARTIER = val.toUpperCase())"
                />
                <q-input
                  v-model="form.TEL_PERS"
                  :label="$t('inputassu.phone')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  type="tel"
                  mask="+237 ### ### ###"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.phone') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.FAX_PERS"
                  :label="$t('inputassu.fax')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @update:model-value="(val) => (form.FAX_PERS = val.toUpperCase())"
                />
                <q-input
                  v-model="form.Adresse"
                  :label="$t('inputassu.address')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @update:model-value="(val) => (form.Adresse = val.toUpperCase())"
                />
                <q-input
                  v-model="form.EMAIL_PERS"
                  :label="$t('inputassu.email')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  type="email"
                  :rules="[required, validateEmail]"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                  <template v-slot:label>
                    {{ $t('inputassu.email') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.BP"
                  :label="$t('inputassu.postal_box')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @update:model-value="(val) => (form.BP = val.toUpperCase())"
                />
                <q-select
                  v-model="form.CODE_CENTRECNPSC"
                  :label="$t('inputassu.centreCNPS')"
                  :hint="$t('inputassu.centreCNPS')"
                  :options="centres"
                  option-label="LIB_CENTRE"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterCentreCNPS"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.centreCNPS') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-select>
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

            <!-- Étape 6 : Pièces complémentaires -->
            <q-step
              :name="6"
              :title="$t('immat.step6')"
              icon="work"
              :done="step > 6 || step < 6"
              :error="stepErrors[6]"
              :header-class="stepErrors[6] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(6)"
            >
              <div class="justify-center row" :class="{ column: !$q.screen.gt.sm }">
                <q-input
                  v-model="form.nombEnfa"
                  :label="$t('inputassu.number_of_children')"
                  type="number"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  min="0"
                  @update:model-value="resetFileField('actesNaissance')"
                />
                <span v-if="form.nombEnfa > 0">
                  <q-file
                    v-for="index in parseInt(form.nombEnfa)"
                    :key="`birth-cert-${index}`"
                    v-model="form.actesNaissance[index - 1]"
                    :label="$t('inputassu.birth_certificate_child', { number: index })"
                    :hint="$t('inputassu.birth_certificate_child', { number: index })"
                    outlined
                    dense
                    :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                    accept=".jpg, .png, .pdf"
                    max-file-size="3072000"
                    class="q-mr-sm q-mb-sm"
                    :rules="[(val) => !!val || $t('validation.required')]"
                    :error="stepErrors[6] && !form.actesNaissance[index - 1]"
                    @update:model-value="onFileSelected('actesNaissance', index - 1)"
                    @rejected="onRejected"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                    <template v-slot:label>
                      {{ $t('inputassu.birth_certificate_child', { number: index }) }}
                      <span
                        class="q-px-sm bg-red text-white text-italic rounded-borders"
                        style="font-size: 10px"
                      >
                        {{ $t('input.requis') }}
                      </span>
                    </template>
                  </q-file>
                </span>
                <q-input
                  v-model="form.nombCert"
                  :label="$t('inputassu.number_of_work_certificates')"
                  :hint="$t('inputassu.number_of_work_certificates')"
                  type="number"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  min="0"
                  @update:model-value="resetFileField('certificatsTravail')"
                />
                <span v-if="form.nombCert > 0">
                  <q-file
                    v-for="index in parseInt(form.nombCert)"
                    :key="`work-cert-${index}`"
                    v-model="form.certificatsTravail[index - 1]"
                    :label="$t('inputassu.work_certificates', { number: index })"
                    :hint="$t('inputassu.works_certificates', { number: index })"
                    outlined
                    dense
                    :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                    accept=".jpg, .png, .pdf"
                    max-file-size="3072000"
                    class="q-mr-sm q-mb-sm"
                    :rules="[(val) => !!val || $t('validation.required')]"
                    :error="stepErrors[6] && !form.nombCert[index - 1]"
                    @update:model-value="onFileSelected('certificatsTravail')"
                    @rejected="onRejected"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                    <template v-slot:label>
                      {{ $t('inputassu.work_certificates', { count: form.nombCert }) }}
                      <span
                        class="q-px-sm bg-red text-white text-italic rounded-borders"
                        style="font-size: 10px"
                      >
                        {{ $t('input.requis') }}
                      </span>
                    </template>
                  </q-file>
                </span>

                <q-input
                  v-model="form.nombConj"
                  :label="$t('inputassu.number_of_spouses')"
                  type="number"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  min="0"
                  @update:model-value="resetFileField('actesMariage')"
                />
                <span v-if="form.nombConj > 0">
                  <q-file
                    v-for="index in parseInt(form.nombConj)"
                    :key="`mar-cert-${index}`"
                    v-model="form.actesMariage[index - 1]"
                    :label="$t('inputassu.marriages_certificates', { number: index })"
                    :hint="$t('inputassu.marriages_certificates', { number: index })"
                    outlined
                    dense
                    :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                    accept=".jpg, .png, .pdf"
                    max-file-size="3072000"
                    class="q-mr-sm q-mb-sm"
                    :rules="[(val) => !!val || $t('validation.required')]"
                    :error="stepErrors[6] && !form.actesMariage[index - 1]"
                    @update:model-value="onFileSelected('actesMariage', index - 1)"
                    @rejected="onRejected"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                    <template v-slot:label>
                      {{ $t('inputassu.marriage_certificates', { count: form.nombConj }) }}
                      <span
                        class="q-px-sm bg-red text-white text-italic rounded-borders"
                        style="font-size: 10px"
                      >
                        {{ $t('input.requis') }}
                      </span>
                    </template>
                  </q-file>
                </span>
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(7)" color="primary" :label="$t('form.next')" />
                <q-btn
                  flat
                  @click="step = 5"
                  color="primary"
                  :label="$t('form.previous')"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>

            <!-- Étape 7 : Validation finale -->
            <q-step
              :name="7"
              :title="$t('immat.step7')"
              icon="check_circle"
              :done="step > 7 || step < 7"
              :error="stepErrors[7]"
              :header-class="stepErrors[7] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(7)"
            >
              <div class="q-pa-md" ref="recapContent">
                <!-- En-tête avec animation -->
                <div class="text-center">
                  <div :class="dynamicTextClass">
                    {{ $t('immat.step7') }}
                  </div>
                </div>
                <!-- Barre de progression -->
                <q-linear-progress
                  :value="1"
                  size="8px"
                  color="positive"
                  class="q-mb-md rounded-borders"
                  animation-speed="100"
                />
                <!-- Grille des sections -->
                <div class="row q-col-gutter-lg">
                  <!-- Étape 1 : Informations sur l'affiliation -->
                  <div class="col-12 col-lg-6">
                    <q-card
                      flat
                      bordered
                      class="recap-card q-mb-md"
                      :class="{ 'shadow-10': $q.dark.isActive, 'shadow-2': !$q.dark.isActive }"
                    >
                      <q-card-section class="bg-gradient-primary text-white">
                        <div class="row items-center no-wrap">
                          <q-icon name="business" size="md" class="q-mr-md" />
                          <div>
                            <div class="text-h6 text-weight-bold">{{ $t('immat.step8') }}</div>
                          </div>
                          <q-space />
                          <q-btn
                            flat
                            round
                            color="white"
                            icon="edit"
                            size="sm"
                            @click="step = 1"
                            class="hover-scale"
                          >
                            <q-tooltip>{{ $t('form.edit') }}</q-tooltip>
                          </q-btn>
                        </div>
                      </q-card-section>

                      <q-card-section class="q-pa-none">
                        <q-list separator>
                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="badge" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.revenue_source')
                              }}</q-item-label>
                              <q-item-label caption class="text-body2">
                                {{ form.ORIGINE_REVENU || $t('inputassu.not_specified') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="calendar_today" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.normal_affiliation_date')
                              }}</q-item-label>
                              <q-item-label caption class="text-body2">
                                {{ form.DATE_DEBUT_AFFI || $t('inputassu.not_specified') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="business_center" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.revenue_source_detail')
                              }}</q-item-label>
                              <q-item-label caption class="text-body2">
                                {{ form.DETAILS_ORIGINEREV || $t('inputassu.not_specified') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="calendar_today" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.requested_affiliation_date')
                              }}</q-item-label>
                              <q-item-label caption class="text-body2">
                                {{ form.DATE_DEBUT_AFFI_SOLL || $t('inputassu.not_specified') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>

                          <!-- Autres champs avec accordéon pour économiser l'espace -->
                          <q-expansion-item
                            icon="more_horiz"
                            :label="$t('form.more_details')"
                            class="text-primary"
                          >
                            <q-list>
                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="attach_money" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.declared_annual_income')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.MONTANT_REV_ANNUEL || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="attach_money" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.contribution_base')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.ASSIETTE_COTISATION || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>
                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="number" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.contribution_rate')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.TAUX || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="money" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.minimum_wage')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.SMIG_VALUE || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>
                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="description" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.annual_income_declaration')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.DECLANNUREVE_file?.name || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="description" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.honor_declaration')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.DECLHONN_file?.name || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-expansion-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </div>

                  <!-- Section 2: Informations Personnelles -->
                  <div class="col-12 col-lg-6">
                    <q-card
                      flat
                      bordered
                      class="recap-card q-mb-md"
                      :class="{ 'shadow-10': $q.dark.isActive, 'shadow-2': !$q.dark.isActive }"
                    >
                      <q-card-section class="bg-gradient-secondary text-white">
                        <div class="row items-center no-wrap">
                          <q-icon name="person" size="md" class="q-mr-md" />
                          <div>
                            <div class="text-h6 text-weight-bold">{{ $t('immat.step2') }}</div>
                          </div>
                          <q-space />
                          <q-btn
                            flat
                            round
                            color="white"
                            icon="edit"
                            size="sm"
                            @click="step = 2"
                            class="hover-scale"
                          >
                            <q-tooltip>{{ $t('form.edit') }}</q-tooltip>
                          </q-btn>
                        </div>
                      </q-card-section>

                      <q-card-section class="q-pa-none">
                        <q-list separator>
                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-avatar color="secondary" text-color="white" size="md">
                                {{ (form.NOM_PERS || 'N')[0].toUpperCase()
                                }}{{ (form.PRENOM_PERS || 'P')[0].toUpperCase() }}
                              </q-avatar>
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-bold text-h6">
                                {{ form.NOM_PERS || $t('inputassu.not_specified') }}
                                {{ form.PRENOM_PERS || '' }}
                              </q-item-label>
                              <q-item-label caption>{{
                                form.SEXE_PERS || $t('inputassu.not_specified')
                              }}</q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="cake" color="secondary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.date_of_birth')
                              }}</q-item-label>
                              <q-item-label caption>{{
                                form.DATE_NAISS_PERS || $t('inputassu.not_specified')
                              }}</q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="place" color="secondary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.place_of_birth')
                              }}</q-item-label>
                              <q-item-label caption>{{
                                form.LOCALITE_NAISS || $t('inputassu.not_specified')
                              }}</q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="domain" color="secondary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.birth_district')
                              }}</q-item-label>
                              <q-item-label caption>{{
                                form.LieuNaiss && form.LieuNaiss.NOM_ARROND
                                  ? form.LieuNaiss.NOM_ARROND
                                  : $t('inputassu.not_specified')
                              }}</q-item-label>
                            </q-item-section>
                          </q-item>
                          <q-expansion-item
                            icon="more_horiz"
                            :label="$t('form.more_details')"
                            class="text-secondary"
                          >
                            <q-list>
                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="favorite" color="pink" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.marital_status')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.civilite || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="flag" color="pink" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.nationality')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.NATIONALITEC && form.NATIONALITEC.nationalite
                                      ? form.NATIONALITEC.nationalite
                                      : $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>
                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="credit_card" color="pink" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.identity_document_type')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.typepiece || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="confirmation_number" color="pink" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.identity_document_number')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.NUM_PIECE || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="date_range" color="pink" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.issued_on')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.DATE_PIECE || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>
                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="location_city" color="pink" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.place_issuance_identity_document')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.LIEU_PIECEC && form.LIEU_PIECEC.NOM_ARROND
                                      ? form.LIEU_PIECEC.NOM_ARROND
                                      : $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-expansion-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </div>
                  <!-- Section Parents (Regroupées) -->
                  <div class="col-12">
                    <q-card
                      flat
                      bordered
                      class="recap-card q-mb-md"
                      :class="{ 'shadow-10': $q.dark.isActive, 'shadow-2': !$q.dark.isActive }"
                    >
                      <q-card-section class="bg-gradient-accent text-white">
                        <div class="row items-center no-wrap">
                          <q-icon name="family_restroom" size="md" class="q-mr-md" />
                          <div>
                            <div class="text-h6 text-weight-bold">
                              {{ $t('immat.parents_info') }}
                            </div>
                          </div>
                        </div>
                      </q-card-section>
                      <q-card-section>
                        <div class="row q-col-gutter-md">
                          <!-- Père -->
                          <div class="col-12 col-md-6">
                            <q-card flat class="bg-blue-1">
                              <q-card-section class="q-pb-sm">
                                <div class="row items-center">
                                  <q-icon name="man" color="blue" size="sm" class="q-mr-sm" />
                                  <span class="text-weight-bold text-blue">{{
                                    $t('immat.step3')
                                  }}</span>
                                  <q-space />
                                  <q-btn
                                    flat
                                    dense
                                    round
                                    color="blue"
                                    icon="edit"
                                    size="xs"
                                    @click="step = 3"
                                  />
                                </div>
                              </q-card-section>
                              <q-card-section class="q-pt-none">
                                <div class="text-subtitle2 text-weight-medium">
                                  {{ form.NOM_PERE || $t('inputassu.not_specified') }}
                                  {{ form.PRENOM_PERE || '' }}
                                </div>
                                <div class="text-caption">
                                  {{ $t('inputassu.date_of_birth') }}:
                                  {{ form.DATE_NAISS_PERSP || $t('inputassu.not_specified') }}
                                </div>
                                <div class="text-caption">
                                  {{ $t('inputassu.place_of_birth') }}:
                                  {{ form.LOCALITE_NAISS_PERE || $t('inputassu.not_specified') }}
                                </div>
                                <div class="text-caption">
                                  {{ $t('inputassu.birth_district') }}:
                                  {{
                                    form.LieuNaissPere && form.LieuNaissPere.NOM_ARROND
                                      ? form.LieuNaissPere.NOM_ARROND
                                      : $t('inputassu.not_specified')
                                  }}
                                </div>
                                <q-badge
                                  :color="
                                    form.etatP === $t('inputassu.yes') ||
                                    form.etatP === 'OUI' ||
                                    form.etatP === 'YES'
                                      ? 'positive'
                                      : 'negative'
                                  "
                                  :label="form.etatP || $t('inputassu.not_specified')"
                                  class="q-mt-sm"
                                />
                                <!-- Afficher la date de décès seulement si le père est décédé -->
                                <div
                                  class="text-caption q-mt-sm"
                                  v-if="
                                    form.etatP === $t('inputassu.no') ||
                                    form.etatP === 'NON' ||
                                    form.etatP === 'NO' ||
                                    form.DATE_DECES_PERSP
                                  "
                                >
                                  <q-icon name="event" color="grey-7" size="xs" class="q-mr-xs" />
                                  {{ $t('inputassu.date_death') }}:
                                  {{ form.DATE_DECES_PERSP || $t('inputassu.not_specified') }}
                                </div>
                              </q-card-section>
                            </q-card>
                          </div>
                          <!-- Mère -->
                          <div class="col-12 col-md-6">
                            <q-card flat class="bg-pink-1">
                              <q-card-section class="q-pb-sm">
                                <div class="row items-center">
                                  <q-icon name="woman" color="pink" size="sm" class="q-mr-sm" />
                                  <span class="text-weight-bold text-pink">{{
                                    $t('immat.step4')
                                  }}</span>
                                  <q-space />
                                  <q-btn
                                    flat
                                    dense
                                    round
                                    color="pink"
                                    icon="edit"
                                    size="xs"
                                    @click="step = 4"
                                  />
                                </div>
                              </q-card-section>
                              <q-card-section class="q-pt-none">
                                <div class="text-subtitle2 text-weight-medium">
                                  {{ form.NOM_MERE || $t('inputassu.not_specified') }}
                                  {{ form.PRENOM_MERE || '' }}
                                </div>
                                <div class="text-caption">
                                  {{ $t('inputassu.date_of_birth') }}:
                                  {{ form.DATE_NAISS_PERSM || $t('inputassu.not_specified') }}
                                </div>
                                <div class="text-caption">
                                  {{ $t('inputassu.place_of_birth') }}:
                                  {{ form.LOCALITE_NAISS_MERE || $t('inputassu.not_specified') }}
                                </div>
                                <div class="text-caption">
                                  {{ $t('inputassu.birth_district') }}:
                                  {{
                                    form.LieuNaissMere && form.LieuNaissMere.NOM_ARROND
                                      ? form.LieuNaissMere.NOM_ARROND
                                      : $t('inputassu.not_specified')
                                  }}
                                </div>
                                <q-badge
                                  :color="
                                    form.etatM === $t('inputassu.yes') ||
                                    form.etatM === 'OUI' ||
                                    form.etatM === 'YES'
                                      ? 'positive'
                                      : 'negative'
                                  "
                                  :label="form.etatM || $t('inputassu.not_specified')"
                                  class="q-mt-sm"
                                />
                                <!-- Afficher la date de décès seulement si la mère est décédée -->
                                <div
                                  class="text-caption q-mt-sm"
                                  v-if="form.etatM === t('inputassu.no') && !form.DATE_DECES_PERSM"
                                >
                                  <q-icon name="event" color="grey-7" size="xs" class="q-mr-xs" />
                                  {{ $t('inputassu.date_death') }}:
                                  {{ form.DATE_DECES_PERSM || $t('inputassu.not_specified') }}
                                </div>
                              </q-card-section>
                            </q-card>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                  <!-- Section Contact -->
                  <div class="col-12 col-lg-6">
                    <q-card
                      flat
                      bordered
                      class="recap-card q-mb-md"
                      :class="{ 'shadow-10': $q.dark.isActive, 'shadow-2': !$q.dark.isActive }"
                    >
                      <q-card-section class="bg-gradient-info text-white">
                        <div class="row items-center no-wrap">
                          <q-icon name="contact_mail" size="md" class="q-mr-md" />
                          <div>
                            <div class="text-h6 text-weight-bold">{{ $t('immat.step5') }}</div>
                          </div>
                          <q-space />
                          <q-btn
                            flat
                            round
                            color="white"
                            icon="edit"
                            size="sm"
                            @click="step = 5"
                            class="hover-scale"
                          >
                            <q-tooltip>{{ $t('form.edit') }}</q-tooltip>
                          </q-btn>
                        </div>
                      </q-card-section>

                      <q-card-section class="q-pa-none">
                        <q-list separator>
                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="location_city" color="info" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.city_of_residence')
                              }}</q-item-label>
                              <q-item-label caption>{{
                                form.CODE_VILLEC.NOM_ARROND || $t('inputassu.not_specified')
                              }}</q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="home" color="info" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.neighborhood')
                              }}</q-item-label>
                              <q-item-label caption>{{
                                form.QUARTIER || $t('inputassu.not_specified')
                              }}</q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="phone" color="info" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.phone')
                              }}</q-item-label>
                              <q-item-label caption>{{
                                form.TEL_PERS || $t('inputassu.not_specified')
                              }}</q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="print" color="info" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.fax')
                              }}</q-item-label>
                              <q-item-label caption>{{
                                form.FAX_PERS || $t('inputassu.not_specified')
                              }}</q-item-label>
                            </q-item-section>
                          </q-item>
                          <q-expansion-item
                            icon="more_horiz"
                            :label="$t('form.more_details')"
                            class="text-secondary"
                          >
                            <q-list>
                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="place" color="pink" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.address')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.Adresse || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="email" color="info" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.email')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.EMAIL_PERS || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="markunread_mailbox" color="pink" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.postal_box')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.BP || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="business" color="pink" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.centreCNPS')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.CODE_CENTRECNPSC.LIB_CENTRE ||
                                    $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-expansion-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </div>

                  <!-- Section Documents -->
                  <div class="col-12 col-lg-6">
                    <q-card
                      flat
                      bordered
                      class="recap-card q-mb-md"
                      :class="{ 'shadow-10': $q.dark.isActive, 'shadow-2': !$q.dark.isActive }"
                    >
                      <q-card-section class="bg-gradient-warning text-white">
                        <div class="row items-center no-wrap">
                          <q-icon name="folder" size="md" class="q-mr-md" />
                          <div>
                            <div class="text-h6 text-weight-bold">{{ $t('immat.step6') }}</div>
                          </div>
                          <q-space />
                          <q-btn
                            flat
                            round
                            color="white"
                            icon="edit"
                            size="sm"
                            @click="step = 6"
                            class="hover-scale"
                          >
                            <q-tooltip>{{ $t('form.edit') }}</q-tooltip>
                          </q-btn>
                        </div>
                      </q-card-section>

                      <q-card-section>
                        <div class="row q-col-gutter-sm">
                          <!-- Enfants -->
                          <div class="col-12">
                            <q-item class="q-px-none">
                              <q-item-section avatar>
                                <q-icon name="child_care" color="warning" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label class="text-weight-medium">{{
                                  $t('inputassu.number_of_children')
                                }}</q-item-label>
                                <q-item-label caption>
                                  <q-chip
                                    :color="form.actesNaissance.length > 0 ? 'positive' : 'grey'"
                                    text-color="white"
                                    size="sm"
                                  >
                                    {{ form.actesNaissance.length }} {{ $t('form.children') }}
                                  </q-chip>
                                </q-item-label>
                                <!-- Affichage des noms de fichiers -->
                                <div v-if="form.actesNaissance.length > 0" class="q-mt-xs">
                                  <q-chip
                                    v-for="(file, index) in form.actesNaissance"
                                    :key="index"
                                    color="blue-grey-3"
                                    text-color="dark"
                                    size="sm"
                                    class="q-mr-xs q-mb-xs"
                                    icon="description"
                                  >
                                    {{ file.name || file.nom || 'Fichier ' + (index + 1) }}
                                  </q-chip>
                                </div>
                              </q-item-section>
                            </q-item>
                          </div>
                          <!-- Certificats de travail -->
                          <div class="col-12">
                            <q-item class="q-px-none">
                              <q-item-section avatar>
                                <q-icon name="work_history" color="warning" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label class="text-weight-medium">{{
                                  $t('inputassu.work_certificates')
                                }}</q-item-label>
                                <q-item-label caption>
                                  <q-chip
                                    :color="
                                      form.certificatsTravail.length > 0 ? 'positive' : 'grey'
                                    "
                                    text-color="white"
                                    size="sm"
                                  >
                                    {{ form.certificatsTravail.length }} {{ $t('form.certificat') }}
                                  </q-chip>
                                </q-item-label>
                                <!-- Affichage des noms de fichiers -->
                                <div v-if="form.certificatsTravail.length > 0" class="q-mt-xs">
                                  <q-chip
                                    v-for="(file, index) in form.certificatsTravail"
                                    :key="index"
                                    color="blue-grey-3"
                                    text-color="dark"
                                    size="sm"
                                    class="q-mr-xs q-mb-xs"
                                    icon="description"
                                  >
                                    {{ file.name || file.nom || 'Fichier ' + (index + 1) }}
                                  </q-chip>
                                </div>
                              </q-item-section>
                            </q-item>
                          </div>

                          <!-- Conjoints -->
                          <div class="col-12">
                            <q-item class="q-px-none">
                              <q-item-section avatar>
                                <q-icon name="people" color="warning" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label class="text-weight-medium">{{
                                  $t('inputassu.number_of_spouses')
                                }}</q-item-label>
                                <q-item-label caption>
                                  <q-chip
                                    :color="form.actesMariage.length > 0 ? 'positive' : 'grey'"
                                    text-color="white"
                                    size="sm"
                                  >
                                    {{ form.actesMariage.length }} {{ $t('form.conjoint') }}
                                  </q-chip>
                                </q-item-label>
                                <!-- Affichage des noms de fichiers -->
                                <div v-if="form.actesMariage.length > 0" class="q-mt-xs">
                                  <q-chip
                                    v-for="(file, index) in form.actesMariage"
                                    :key="index"
                                    color="blue-grey-3"
                                    text-color="dark"
                                    size="sm"
                                    class="q-mr-xs q-mb-xs"
                                    icon="description"
                                  >
                                    {{ file.name || file.nom || 'Fichier ' + (index + 1) }}
                                  </q-chip>
                                </div>
                              </q-item-section>
                            </q-item>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
                <!-- Actions finales -->
                <q-card flat class="bg-grey-1 q-mt-md">
                  <q-card-section class="text-center">
                    <q-stepper-navigation class="justify-center">
                      <q-btn
                        type="submit"
                        color="primary"
                        size="md"
                        class="q-px-md q-py-sm text-weight-bold"
                      >
                        <q-icon name="send" class="q-mr-sm" />
                        {{ $t('form.submit') }}
                      </q-btn>
                      <q-btn
                        flat
                        @click="step = 6"
                        color="primary"
                        :label="$t('form.previous')"
                        class="q-ml-md"
                        size="md"
                      >
                        <q-icon name="arrow_back" class="q-mr-xs" />
                      </q-btn>
                      <q-btn
                        flat
                        color="secondary"
                        size="md"
                        class="q-ml-md"
                        @click="previewDocument"
                      >
                        <q-icon name="visibility" class="q-mr-xs" />
                        {{ $t('form.preview') }}
                      </q-btn>
                    </q-stepper-navigation>
                  </q-card-section>
                </q-card>
              </div>
            </q-step>
          </q-stepper>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('form.cancel')" v-close-popup color="red" @click="closeDialog" />
      </q-card-actions>
    </q-card>

    <q-dialog v-model="pdfDialog" maximized>
      <q-card>
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">{{ $t('pdf.preview') }}</div>
          <q-btn icon="close" flat round dense @click="pdfDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none">
          <iframe :src="pdfBlobUrl" width="100%" height="600px" style="border: none"></iframe>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn color="primary" icon="download" :label="$t('pdf.download')" @click="downloadPDF" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog persistent v-model="spinner">
      <q-spinner-cube size="xl" color="primary" />
    </q-dialog>
    <!-- Confirmation Dialog -->
    <q-dialog v-model="showConfirmationDialog" persistent>
      <q-card class="confirmation-card" style="min-width: 500px">
        <!-- Header avec icône -->
        <q-card-section class="bg-primary text-white text-center q-pa-md">
          <q-icon name="help_outline" size="35px" class="q-mb-sm" />
          <div class="text-h6 text-weight-bold">{{ $t('form.confirmationTitle') }}</div>
        </q-card-section>
        <!-- Contenu principal -->
        <q-card-section style="max-height: 50vh" class="scroll q-pa-md">
          <!-- Sélection du type de soumission -->
          <div class="submission-types q-mt-lg">
            <div class="text-h6 text-weight-bold q-mb-md text-grey-8">
              <q-icon name="radio_button_checked" class="q-mr-sm" />
              {{ $t('form.selectSubmissionType') }}
            </div>

            <!-- Option temporaire -->
            <q-card
              flat
              bordered
              class="submission-option q-mb-md"
              :class="{ 'selected-option': submissionType === 'temporary' }"
              @click="submissionType = 'temporary'"
            >
              <q-card-section class="q-pa-md">
                <div class="row items-center">
                  <q-radio
                    v-model="submissionType"
                    val="temporary"
                    color="orange"
                    class="q-mr-md"
                  />
                  <div class="col">
                    <div class="text-subtitle1 text-weight-bold text-orange-8">
                      <q-icon name="schedule" class="q-mr-xs" />
                      {{ $t('form.temporarySubmission') }}
                    </div>
                    <p class="text-caption text-grey-7 q-ma-none q-mt-sm">
                      {{ $t('form.temporarySubmissionDescription') }}
                    </p>
                  </div>
                </div>
              </q-card-section>
            </q-card>
            <!-- Option définitive -->
            <q-card
              flat
              bordered
              class="submission-option"
              :class="{ 'selected-option': submissionType === 'definitive' }"
              @click="submissionType = 'definitive'"
            >
              <q-card-section class="q-pa-md">
                <div class="row items-center">
                  <q-radio
                    v-model="submissionType"
                    val="definitive"
                    color="green"
                    class="q-mr-md"
                  />
                  <div class="col">
                    <div class="text-subtitle1 text-weight-bold text-green-8">
                      <q-icon name="check_circle" class="q-mr-xs" />
                      {{ $t('form.definitiveSubmission') }}
                    </div>
                    <p class="text-caption text-grey-7 q-ma-none q-mt-sm">
                      {{ $t('form.definitiveSubmissionDescription') }}
                    </p>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
        <!-- Actions -->
        <q-card-actions class="q-pa-lg" align="center">
          <q-btn
            :label="$t('form.confirm')"
            color="positive"
            unelevated
            size="md"
            :disable="!submissionType"
            :icon="submissionType === 'temporary' ? 'schedule' : 'send'"
            @click="confirmSubmission"
            class="q-px-xl"
          />
          <q-btn
            :label="$t('form.cancel')"
            color="grey-7"
            size="md"
            icon="close"
            @click="showConfirmationDialog = false"
            class="q-ml-md"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>
<script setup>
import { ref, computed, watch, defineProps, onMounted, defineEmits } from 'vue'
import { useNotify } from './useNotify.js'
import { arrondissements as rawArrondissements } from '../data/Arrondissements.js'
import { pays as rawPays } from '../data/Pays.js'
import { pieces as rawPieces } from '../data/Pieces.js'
import { centres as rawCentres } from '../data/Centres.js'
import { useI18n } from 'vue-i18n'
import html2pdf from 'html2pdf.js'
// import axios from 'axios';
import { useQuasar } from 'quasar'

const $q = useQuasar()
defineProps({
  service: Object,
})

const { t, locale } = useI18n()
const emit = defineEmits(['close'])

const { notifyError, notifySuccess } = useNotify()

const open = ref(true)
const step = ref(1)
const maxStep = ref(1)
const formRef = ref(null)
const recapContent = ref(null)
const pdfDialog = ref(false)
const pdfBlobUrl = ref(null)
const spinner = ref(false)
const showConfirmationDialog = ref(false)
const submissionType = ref(null)
const stepErrors = ref({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false })

const arrondissements = ref([...rawArrondissements])
const pays = ref([...rawPays])
const pieces = ref([...rawPieces])
const centres = ref([...rawCentres])

const form = ref({
  ORIGINE_REVENU: null,

  DATE_DEBUT_AFFI: null,
  DETAILS_ORIGINEREV: null,
  DATE_DEBUT_AFFI_SOLL: null,
  MONTANT_REV_ANNUEL: null,
  ASSIETTE_COTISATION: null,
  TAUX: null,
  SMIG_VALUE: null,
  MONTANT_COTISATION: null,

  DATE_DEMANDE: '',

  code_tele: '',

  code_secret: '',

  DECLANNUREVE_file: '',
  DECLHONN_file: '',

  SEXE_PERS: '',
  NOM_PERS: '',
  PRENOM_PERS: '',
  DATE_NAISS_PERS: '',
  LOCALITE_NAISS: '',
  LieuNaiss: null,
  NATIONALITEC: null,
  typepiece: '',
  NUM_PIECE: '',
  DATE_PIECE: '',
  LIEU_PIECEC: null,
  civilite: '',
  NOM_PERE: '',
  PRENOM_PERE: '',
  DATE_NAISS_PERSP: '',
  LOCALITE_NAISS_PERE: '',
  LieuNaissPere: null,
  etatP: '',
  DATE_DECES_PERSP: '',
  NOM_MERE: '',
  PRENOM_MERE: '',
  DATE_NAISS_PERSM: '',
  LOCALITE_NAISS_MERE: '',
  LieuNaissMere: null,
  etatM: '',
  DATE_DECES_PERSM: '',
  CODE_VILLEC: null,
  QUARTIER: '',
  TEL_PERS: '',
  FAX_PERS: '',
  Adresse: '',
  EMAIL_PERS: '',
  BP: '',
  CODE_CENTRECNPSC: null,
  nombEnfa: 0,
  actesNaissance: [],
  nombCert: 0,
  certificatsTravail: [],
  nombConj: 0,
  actesMariage: [],
})

const genderOptions = computed(() => [t('inputassu.male'), t('inputassu.female')])

const maritalStatusOptions = computed(() => [
  t('inputassu.single'),
  t('inputassu.married'),
  t('inputassu.divorced'),
  t('inputassu.widowed'),
])

const documentsOptions = computed(() => [
  t('inputassu.national_Identity_Card'),
  t('inputassu.residence_Permit'),
  t('inputassu.diplomatic_Card'),
  t('inputassu.Copy_Birth_Certificate'),
  t('inputassu.passport'),
  t('inputassu.drivers_License'),
])

const activitiesOptions = computed(() => [
  t('inputassu.Self_employed_Activity'),
  t('inputassu.Agricultural_Income'),
  t('inputassu.Commercial_Income'),
  t('inputassu.Rental_Income'),
  t('inputassu.Social_Benefits'),
  t('inputassu.Other_Income'),
  t('inputassu.Investments'),
])

const dynamicTextClass = computed(() => [
  $q.screen.gt.sm ? 'text-h5' : 'custom-mobile-text',
  'text-primary',
  'text-uppercase',
  'q-mb-sm',
])

const yesNoOptions = computed(() => [t('inputassu.yes'), t('inputassu.no')])

const required = (val) => !!val || 'Ce champ est requis / This field is required'

const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || t('errors.invalidEmail')

const optionsDateAffiliation = (date) => {
  const selectedDate = new Date(date.split('/').reverse().join('-'))
  const normaleDate = new Date(form.value.DATE_DEBUT_AFFI.split('/').reverse().join('-'))
  const minDate = new Date(normaleDate)
  minDate.setMonth(minDate.getMonth() - 6)
  return selectedDate >= minDate && selectedDate <= normaleDate
}

// Set Date d'affiliation normale to the start of next month on component mount
onMounted(() => {
  const today = new Date()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  form.value.DATE_DEBUT_AFFI = nextMonth.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
})

const optionsDn = (date) => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = ('0' + (today.getMonth() + 1)).slice(-2)
  const dd = ('0' + today.getDate()).slice(-2)
  const todayStr = `${yyyy}/${mm}/${dd}`
  return date <= todayStr
}

const filterArrondissement = (val, update) => {
  update(() => {
    arrondissements.value = rawArrondissements.filter((arr) =>
      arr.NOM_ARROND.toLowerCase().includes(val.toLowerCase()),
    )
  })
}

const filterPays = (val, update) => {
  update(() => {
    pays.value = rawPays.filter((pays) =>
      pays.nationalite.toLowerCase().includes(val.toLowerCase()),
    )
  })
}

const filterPieces = (val, update) => {
  update(() => {
    pieces.value = rawPieces.filter((piece) =>
      piece.LIBELLE.toLowerCase().includes(val.toLowerCase()),
    )
  })
}

const filterCentreCNPS = (val, update) => {
  update(() => {
    centres.value = rawCentres.filter((centre) =>
      centre.LIB_CENTRE.toLowerCase().includes(val.toLowerCase()),
    )
  })
}

const getArrondissementName = (id) => {
  const arr = arrondissements.value.find((a) => a.ID_ARROND === id)
  return arr ? arr.NOM_ARROND : ''
}

const getPaysName = (id) => {
  const paysItem = pays.value.find((p) => p.ID_PAYS === id)
  return paysItem ? paysItem.nationalite : ''
}

const getPieceName = (id) => {
  const piece = pieces.value.find((p) => p.ID_PIECE === id)
  return piece ? piece.LIBELLE : ''
}

const getCentreCNPSName = (id) => {
  const centre = centres.value.find((c) => c.ID_CENTRE === id)
  return centre ? centre.LIB_CENTRE : ''
}

const resetFileField = (field) => {
  form.value[field] = field === 'avisEmbauche' ? null : []
}

const onFileSelected = (field) => (file) => {
  if (file && file.size > 3072000) {
    notifyError(t('errors.file_too_large'))
    form[field] = null // Réinitialise le champ
    return
  }
}

const onRejected = (rejectedEntries) => {
  rejectedEntries.forEach((entry) => {
    if (entry.failedPropValidation === 'accept') {
      notifyError(t('errors.invalid_file_type'))
    } else if (entry.failedPropValidation === 'max-file-size') {
      notifyError(t('errors.file_too_large'))
    } else {
      notifyError(t('errors.file_error'))
    }
  })
}

const counterLabelFn = ({ totalSize, filesCount, maxFiles }) => {
  return `(${filesCount}/${maxFiles}) ${Math.round(totalSize / 1024)} KB`
}

const isStepAllowed = (stepNumber) => {
  return stepNumber <= maxStep.value
}

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
  showConfirmationDialog.value = true
}

// Validation de l'assiette de cotisation
const validateAssieteCotisation = (val) => {
  if (!val) return $q.lang.label.requis || 'Champ requis'
  if (val < form.value.SMIG_VALUE)
    return $q.lang.label.assiette_below_smig || 'Assiette inférieure au SMIG'
  if (val > form.value.MAX_COTISABLE)
    return $q.lang.label.assiette_above_max || 'Assiette supérieure au maximum'
  return true
}

// Mock database for SMIG, taux, and max cotisable montant
const fetchParameters = ref([
  { year: 2025, smig: 45000, taux: 0.045, maxCotisable: 750000 },
  { year: 2024, smig: 40000, taux: 0.04, maxCotisable: 700000 },
  { year: 2023, smig: 38000, taux: 0.035, maxCotisable: 650000 },
])
function getYearFromDate(dateInput) {
  try {
    let date
    if (typeof dateInput === 'string') {
      // Normaliser les séparateurs (remplace - par /)
      const normalizedDate = dateInput.replace(/-/g, '/')
      // Si format JJ/MM/AAAA
      if (normalizedDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = normalizedDate.split('/')
        date = new Date(`${year}-${month}-${day}`)
      }
      // Si format AAAA/MM/JJ
      else if (normalizedDate.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
        date = new Date(normalizedDate)
      } else {
        throw new Error('Format de date non reconnu')
      }
    } else {
      // Si dateInput est un objet Date
      date = new Date(dateInput)
    }

    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      throw new Error('Format de date invalide')
    }

    // Extraire l'année
    const year = date.getFullYear()

    // Rechercher les paramètres correspondants à l'année
    const params = fetchParameters.value.find((param) => param.year === year)

    if (params) {
      // Mettre à jour les valeurs du formulaire
      form.value.SMIG_VALUE = params.smig
      form.value.TAUX = params.taux
      form.value.MAX_COTISABLE = params.maxCotisable
    } else {
      throw new Error('Aucun paramètre trouvé pour cette année')
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'année:", error.message)
    return null
  }
}

// Mise à jour de l'assiette et de la cotisation
const updateAssieteCotisation = () => {
  if (form.value.MONTANT_REV_ANNUEL && form.value.SMIG_VALUE) {
    let assiette = form.value.MONTANT_REV_ANNUEL / 12
    const maxMontantCotisable = form.value.MAX_COTISABLE
    // Ajuster l'assiette selon les bornes
    if (assiette < form.value.SMIG_VALUE) {
      assiette = form.value.SMIG_VALUE
    } else if (assiette > maxMontantCotisable) {
      assiette = maxMontantCotisable
    }
    form.value.ASSIETTE_COTISATION = Math.round(assiette)
    // Calculer le montant de la cotisation
    form.value.MONTANT_COTISATION = Math.round(
      form.value.ASSIETTE_COTISATION * (form.value.TAUX / 100),
    )
  }
}

// Surveiller les changements de MONTANT_REV_ANNUEL pour recalculer
watch(
  () => form.value.MONTANT_REV_ANNUEL,
  (val) => {
    if (val) updateAssieteCotisation()
  },
)

const confirmSubmission = async () => {
  spinner.value = true
  try {
    // Prepare form data for submission
    const formData = new FormData()

    // Append form fields
    Object.keys(form.value).forEach((key) => {
      if (key === 'avisEmbauche' && form.value[key]) {
        formData.append(key, form.value[key], form.value[key].name)
      } else if (['actesNaissance', 'certificatsTravail', 'actesMariage'].includes(key)) {
        form.value[key].forEach((file, index) => {
          formData.append(`${key}[${index}]`, file, file.name)
        })
      } else if (form.value[key] !== null && form.value[key] !== undefined) {
        formData.append(key, form.value[key])
      }
    })
    // Append translated values for specific fields
    formData.append('SEXE_PERS', t(form.value.SEXE_PERS))
    formData.append('civilite', t(form.value.civilite))
    formData.append('etatP', form.value.etatP ? t(form.value.etatP) : '')
    formData.append('etatM', form.value.etatM ? t(form.value.etatM) : '')
    formData.append(
      'LieuNaiss',
      form.value.LieuNaiss ? getArrondissementName(form.value.LieuNaiss) : '',
    )
    formData.append(
      'NATIONALITEC',
      form.value.NATIONALITEC ? getPaysName(form.value.NATIONALITEC) : '',
    )
    formData.append('typepiece', form.value.typepiece ? getPieceName(form.value.typepiece) : '')
    formData.append(
      'LIEU_PIECEC',
      form.value.LIEU_PIECEC ? getArrondissementName(form.value.LIEU_PIECEC) : '',
    )
    formData.append(
      'LieuNaissPere',
      form.value.LieuNaissPere ? getArrondissementName(form.value.LieuNaissPere) : '',
    )
    formData.append(
      'LieuNaissMere',
      form.value.LieuNaissMere ? getArrondissementName(form.value.LieuNaissMere) : '',
    )
    formData.append(
      'CODE_VILLEC',
      form.value.CODE_VILLEC ? getArrondissementName(form.value.CODE_VILLEC) : '',
    )
    formData.append(
      'CODE_CENTRECNPSC',
      form.value.CODE_CENTRECNPSC ? getCentreCNPSName(form.value.centreCNPS) : '',
    )

    // API call to OneBase GED system
    /* const response = await axios.post('https://api.onebase.ged/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // Add any required authentication headers
        // 'Authorization': `Bearer ${token}`,
      },
    }); */
    console.log(formData)
    if (submissionType.value === 'temporary') {
      // Handle temporary submission
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate temporary submission API call
      notifySuccess(t('form.submitted'))
    } else if (submissionType.value === 'definitive') {
      // Handle definitive submission
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate definitive submission API call
      notifySuccess(t('form.submitted'))
    } else {
      throw new Error('No submission type selected')
    }
    closeDialog()
  } catch (error) {
    notifyError(t('form.submit_error', { error: error.message }))
  } finally {
    spinner.value = false
    showConfirmationDialog.value = false
    submissionType.value = null // Reset selection
  }
}

const downloadPDF = async () => {
  spinner.value = true
  try {
    const element = recapContent.value
    const opt = {
      margin: 1,
      filename: 'immatriculation_form.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    }
    const pdf = await html2pdf().from(element).set(opt).toPdf().output('blob')
    pdfBlobUrl.value = URL.createObjectURL(pdf)
    pdfDialog.value = true
  } catch (error) {
    notifyError(t('pdf.generation_error', error))
  } finally {
    spinner.value = false
  }
}

const previewDocument = async () => {
  spinner.value = true
  try {
    const element = recapContent.value
    const opt = {
      margin: 1,
      filename: 'immatriculation_form.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    }
    const pdf = await html2pdf().from(element).set(opt).toPdf().output('blob')
    pdfBlobUrl.value = URL.createObjectURL(pdf)
    pdfDialog.value = true
  } catch (error) {
    notifyError(t('pdf.generation_error', error))
  } finally {
    spinner.value = false
  }
}

const closeDialog = () => {
  open.value = false
  emit('close')
}
</script>
<style scoped>
.confirmation-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.confirmation-message {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.submission-option {
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submission-option:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.selected-option {
  border-color: var(--q-primary);
  background: rgba(25, 118, 210, 0.04);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
}

.submission-types {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.recap-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.recap-card:hover {
  transform: translateY(-2px);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
}

.bg-gradient-secondary {
  background: linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%);
}

.bg-gradient-accent {
  background: linear-gradient(135deg, #00acc1 0%, #4dd0e1 100%);
}

.bg-gradient-info {
  background: linear-gradient(135deg, #0097a7 0%, #4fc3f7 100%);
}

.bg-gradient-warning {
  background: linear-gradient(135deg, #f57c00 0%, #ffb74d 100%);
}

.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.1);
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
.custom-mobile-text {
  font-size: 14px; /* Even smaller than text-subtitle1 */
  line-height: 1.5rem;
}
</style>

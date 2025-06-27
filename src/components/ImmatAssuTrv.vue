<template>
  <q-dialog v-model="open" persistent full-width>
    <q-card :style="$q.screen.gt.sm ? 'width: 900px' : 'width: 100%'">
      <q-card-section>
        <div class="text-h6 text-primary text-center text-uppercase text-bold">
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
            header-nav
            animated
          >
            <!-- Étape 1 : Informations sur l'emploi travailleur -->
            <q-step
              :name="1"
              :title="$t('immat.stepp1')"
              icon="work"
              :done="step > 1"
              :error="stepErrors[1]"
              :header-class="stepErrors[1] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(1)"
            >
              <div class="justify-center row" :class="{ column: !$q.screen.gt.sm }">
                <q-input
                  v-model="form.mat_employeur"
                  :label="$t('inputassu.employer_cnps_registration_number')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required, validateMatriculeCNPS]"
                  :hint="$t('inputassu.employer_cnps_registration_number')"
                  :error="stepErrors[1] && !form.mat_employeur"
                  @input="form.mat_employeur = form.mat_employeur.toUpperCase()"
                  @keyup.enter="fetchEmployerData"
                  @keydown.enter.prevent="fetchEmployerData"
                >
                  <template v-slot:append>
                    <q-icon
                      name="search"
                      class="cursor-pointer"
                      color="primary"
                      @click="fetchEmployerData"
                    />
                  </template>
                  <template v-slot:label>
                    {{ $t('inputassu.employer_cnps_registration_number') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.NOM_COMMERCIAL"
                  :label="$t('inputassu.trade_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  readonly
                />
                <q-input
                  v-model="form.RAISON_SOCIALE"
                  :label="$t('inputassu.legal_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  readonly
                  :rules="[required]"
                  :error="stepErrors[1] && !form.RAISON_SOCIALE"
                >
                  <template v-slot:label>
                    {{ $t('inputassu.trade_name') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>
                <q-input
                  v-model="form.ADRESSE_EMPLOYEUR"
                  :label="$t('inputassu.company_location')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.ADRESSE_EMPLOYEUR = form.ADRESSE_EMPLOYEUR.toUpperCase()"
                />
                <q-input
                  v-model="form.DATE_EMB_PREM_TRAV"
                  :label="$t('inputassu.first_employee_hiring_date')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  readonly
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="$t('inputassu.first_employee_hiring_date')"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.DATE_EMB_PREM_TRAV"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
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
                />
                <q-input
                  v-model="form.DATE_EMB_PRE_SALL"
                  :label="$t('inputassu.hiring_date')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  readonly
                  :rules="[required]"
                  :error="stepErrors[1] && !form.DATE_EMB_PRE_SALL"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.DATE_EMB_PRE_SALL"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                          @update:model-value="calculateSmig"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('inputassu.hiring_date') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-input>

                <q-select
                  v-model="form.CODE_categ"
                  :label="$t('inputassu.category')"
                  :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                />
                <q-select
                  v-model="form.CODE_echelon"
                  :label="$t('inputassu.level')"
                  :options="['A', 'B', 'C', 'D', 'E', 'F', 'G']"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                />
                <q-input
                  v-model="form.Specialite"
                  :label="$t('inputassu.specialty')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.Specialite = form.Specialite.toUpperCase()"
                />
                <q-input
                  v-model="form.EFFECTIF_APPROX"
                  :label="$t('inputassu.approximate_workforce')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  type="number"
                  min="0"
                />
                <q-input
                  v-model="form.NiveauAss"
                  :label="$t('inputassu.education_level')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.NiveauAss = form.NiveauAss.toUpperCase()"
                />
                <q-input
                  v-model="form.ActuelRevenu"
                  :label="$t('inputassu.current_income')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.ActuelRevenu = form.ActuelRevenu.toUpperCase()"
                />

                <q-file
                  v-model="form.avisEmbauche"
                  :label="$t('inputassu.hiring_notice')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  :counter-label="counterLabelFn"
                  max-files="1"
                  accept=".jpg, .png, image/*, .pdf"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[1] && !form.avisEmbauche"
                  @update:model-value="onFileSelected('avisEmbauche')"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('inputassu.hiring_notice') }}
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

            <!-- Étape 2 : Informations personnelles de l’assuré -->
            <q-step
              :name="2"
              :title="$t('immat.stepp2')"
              icon="person"
              :done="step > 2"
              :error="stepErrors[2]"
              :header-class="stepErrors[2] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(2)"
            >
              <div class="justify-center row" :class="{ column: !$q.screen.gt.sm }">
                <q-input
                  v-model="form.nom"
                  :label="$t('inputassu.last_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.nom"
                  @input="form.nom = form.nom.toUpperCase()"
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
                  v-model="form.prenom"
                  :label="$t('inputassu.first_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.prenom = form.prenom.toUpperCase()"
                />
                <q-select
                  v-model="form.sexe"
                  :label="$t('inputassu.gender')"
                  :options="genderOptions"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.sexe"
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
                  v-model="form.dateNaissance"
                  :label="$t('inputassu.date_of_birth')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.dateNaissance"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateNaissance"
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
                  v-model="form.lieuNaissance"
                  :label="$t('inputassu.place_of_birth')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.lieuNaissance"
                  @input="form.lieuNaissance = form.lieuNaissance.toUpperCase()"
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
                  v-model="form.arrondissementAssure"
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
                  :error="stepErrors[2] && !form.arrondissementAssure"
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
                  v-model="form.etatCivil"
                  :label="$t('inputassu.marital_status')"
                  :options="maritalStatusOptions"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.etatCivil"
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
                  v-model="form.nationaliteAssure"
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
                  :error="stepErrors[2] && !form.nationaliteAssure"
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
                  v-model="form.pieceIdentiteAssure"
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
                  :error="stepErrors[2] && !form.pieceIdentiteAssure"
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
                  v-model="form.numeroPieceIdentite"
                  :label="$t('inputassu.identity_document_number')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.numeroPieceIdentite"
                  @input="form.numeroPieceIdentite = form.numeroPieceIdentite.toUpperCase()"
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
                  v-model="form.datePieceIdentite"
                  :label="$t('inputassu.issued_on')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.datePieceIdentite"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="$t('inputassu.issued_on')"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.datePieceIdentite"
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
                  v-model="form.lieuDelivrancePieceIdentiteAssure"
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
                  :error="stepErrors[2] && !form.lieuDelivrancePieceIdentiteAssure"
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

            <!-- Étape 3 : Informations sur le père de l’assuré -->
            <q-step
              :name="3"
              :title="$t('immat.stepp3')"
              icon="person"
              :done="step > 3"
              :error="stepErrors[3]"
              :header-class="stepErrors[3] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(3)"
            >
              <div class="justify-center row" :class="{ column: !$q.screen.gt.sm }">
                <q-input
                  v-model="form.nomPere"
                  :label="$t('inputassu.last_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.nomPere = form.nomPere.toUpperCase()"
                />
                <q-input
                  v-model="form.prenomPere"
                  :label="$t('inputassu.first_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.prenomPere = form.prenomPere.toUpperCase()"
                />
                <q-input
                  v-model="form.dateNaissancePere"
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
                          v-model="form.dateNaissancePere"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.lieuNaissancePere"
                  :label="$t('inputassu.place_of_birth')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.lieuNaissancePere = form.lieuNaissancePere.toUpperCase()"
                />
                <q-select
                  v-model="form.arrondissementPere"
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
                />
                <q-select
                  v-model="form.vivantPere"
                  :label="$t('inputassu.alive')"
                  :options="yesNoOptions"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                />
                <q-input
                  v-if="form.vivantPere === $t('inputassu.no')"
                  v-model="form.dateDecesPere"
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
                          v-model="form.dateDecesPere"
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

            <!-- Étape 4 : Informations sur la mère de l’assuré -->
            <q-step
              :name="4"
              :title="$t('immat.stepp4')"
              icon="person"
              :done="step > 4"
              :error="stepErrors[4]"
              :header-class="stepErrors[4] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(4)"
            >
              <div class="justify-center row" :class="{ column: !$q.screen.gt.sm }">
                <q-input
                  v-model="form.nomMere"
                  :label="$t('inputassu.last_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[4] && !form.nomMere"
                  @input="form.nomMere = form.nomMere.toUpperCase()"
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
                  v-model="form.prenomMere"
                  :label="$t('inputassu.first_name')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.prenomMere = form.prenomMere.toUpperCase()"
                />
                <q-input
                  v-model="form.dateNaissanceMere"
                  :label="$t('inputassu.date_of_birth')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[4] && !form.dateNaissanceMere"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateNaissanceMere"
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
                  v-model="form.lieuNaissanceMere"
                  :label="$t('inputassu.place_of_birth')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[4] && !form.lieuNaissanceMere"
                  @input="form.lieuNaissanceMere = form.lieuNaissanceMere.toUpperCase()"
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
                  v-model="form.arrondissementMere"
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
                  :error="stepErrors[4] && !form.arrondissementMere"
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
                  v-model="form.vivantMere"
                  :label="$t('inputassu.alive')"
                  :options="yesNoOptions"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[4] && !form.vivantMere"
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
                  v-if="form.vivantMere === $t('inputassu.no')"
                  v-model="form.dateDecesMere"
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
                          v-model="form.dateDecesMere"
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
              :title="$t('immat.stepp5')"
              icon="home"
              :done="step > 5"
              :error="stepErrors[5]"
              :header-class="stepErrors[5] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(5)"
            >
              <div class="justify-center row" :class="{ column: !$q.screen.gt.sm }">
                <q-select
                  v-model="form.ville"
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
                  :error="stepErrors[5] && !form.ville"
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
                  v-model="form.quartier"
                  :label="$t('inputassu.neighborhood')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.quartier = form.quartier.toUpperCase()"
                />
                <q-input
                  v-model="form.telephone"
                  :label="$t('inputassu.phone')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  type="tel"
                  mask="+237 ### ### ###"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[5] && !form.telephone"
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
                  v-model="form.fax"
                  :label="$t('inputassu.fax')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.fax = form.fax.toUpperCase()"
                />
                <q-input
                  v-model="form.addresse"
                  :label="$t('inputassu.address')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.addresse = form.addresse.toUpperCase()"
                />
                <q-input
                  v-model="form.email"
                  :label="$t('inputassu.email')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  type="email"
                  :rules="[required, validateEmail]"
                  :error="stepErrors[5] && !form.email"
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
                  v-model="form.boitePostale"
                  :label="$t('inputassu.postal_box')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.boitePostale = form.boitePostale.toUpperCase()"
                />
                <q-select
                  v-model="form.centreCNPS"
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
                  :error="stepErrors[5] && !form.centreCNPS"
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
              :title="$t('immat.stepp6')"
              icon="work"
              :done="step > 6"
              :error="stepErrors[6]"
              :header-class="stepErrors[6] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(6)"
            >
              <div class="justify-center row" :class="{ column: !$q.screen.gt.sm }">
                <q-input
                  v-model="form.nombreEnfants"
                  :label="$t('inputassu.number_of_children')"
                  type="number"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  min="0"
                  @update:model-value="resetFileField('actesNaissance')"
                />
                <q-file
                  v-if="form.nombreEnfants > 0"
                  v-model="form.actesNaissance"
                  :label="
                    $t('inputassu.children_birth_certificates', { count: form.nombreEnfants })
                  "
                  :hint="$t('inputassu.children_birth_certificates', { count: form.nombreEnfants })"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  :counter-label="counterLabelFn"
                  :max-files="form.nombreEnfants"
                  multiple
                  accept=".jpg, .png, .pdf"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[requiredFiles(form.nombreEnfants)]"
                  :error="
                    stepErrors[6] &&
                    form.nombreEnfants > 0 &&
                    (!form.actesNaissance || form.actesNaissance.length === 0)
                  "
                  @update:model-value="onFileSelected('actesNaissance')"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('inputassu.children_birth_certificates', { count: form.nombreEnfants }) }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-file>
                <q-input
                  v-model="form.nombreCertificat"
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
                <q-file
                  v-if="form.nombreCertificat > 0"
                  v-model="form.certificatsTravail"
                  :label="$t('inputassu.work_certificates', { count: form.nombreCertificat })"
                  :hint="$t('inputassu.work_certificates', { count: form.nombreCertificat })"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  :counter-label="counterLabelFn"
                  :max-files="form.nombreCertificat"
                  multiple
                  accept=".jpg, .png, .pdf"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[requiredFiles(form.nombreCertificat)]"
                  :error="
                    stepErrors[6] &&
                    form.nombreCertificat > 0 &&
                    (!form.certificatsTravail || form.certificatsTravail.length === 0)
                  "
                  @update:model-value="onFileSelected('certificatsTravail')"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('inputassu.work_certificates', { count: form.nombreCertificat }) }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                    >
                      {{ $t('input.requis') }}
                    </span>
                  </template>
                </q-file>
                <q-input
                  v-model="form.nombreConjoints"
                  :label="$t('inputassu.number_of_spouses')"
                  type="number"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  min="0"
                  @update:model-value="resetFileField('actesMariage')"
                />
                <q-file
                  v-if="form.nombreConjoints > 0"
                  v-model="form.actesMariage"
                  :label="$t('inputassu.marriage_certificates', { count: form.nombreConjoints })"
                  :hint="$t('inputassu.marriage_certificates', { count: form.nombreConjoints })"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  :counter-label="counterLabelFn"
                  :max-files="form.nombreConjoints"
                  multiple
                  accept=".jpg, .png, .pdf"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[requiredFiles(form.nombreConjoints)]"
                  :error="
                    stepErrors[6] &&
                    form.nombreConjoints > 0 &&
                    (!form.actesMariage || form.actesMariage.length === 0)
                  "
                  @update:model-value="onFileSelected('actesMariage')"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ $t('inputassu.marriage_certificates', { count: form.nombreConjoints }) }}
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
              :title="$t('immat.stepp7')"
              icon="check_circle"
              :error="stepErrors[7]"
              :header-class="stepErrors[7] ? 'bg-red text-white' : ''"
              :disable="!isStepAllowed(7)"
            >
              <div class="q-pa-md" ref="recapContent">
                <!-- En-tête avec animation -->
                <div class="text-center">
                  <div :class="dynamicTextClass">
                    {{ $t('immat.stepp7') }}
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
                  <!-- Section 1: Informations Employeur -->
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
                            <div class="text-h6 text-weight-bold">{{ $t('immat.stepp1') }}</div>
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
                                $t('inputassu.employer_cnps_registration_number')
                              }}</q-item-label>
                              <q-item-label caption class="text-body2">
                                {{ form.mat_employeur || $t('inputassu.not_specified') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="store" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.legal_name')
                              }}</q-item-label>
                              <q-item-label caption class="text-body2">
                                {{ form.NOM_COMMERCIAL || $t('inputassu.not_specified') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="business_center" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.trade_name')
                              }}</q-item-label>
                              <q-item-label caption class="text-body2">
                                {{ form.RAISON_SOCIALE || $t('inputassu.not_specified') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item class="q-py-sm">
                            <q-item-section avatar>
                              <q-icon name="location_on" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                $t('inputassu.company_location')
                              }}</q-item-label>
                              <q-item-label caption class="text-body2">
                                {{ form.ADRESSE_EMPLOYEUR || $t('inputassu.not_specified') }}
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
                                  <q-icon name="event" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.first_employee_hiring_date')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.DATE_EMB_PREM_TRAV || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="attach_money" color="secondary" />
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
                                  <q-icon name="calendar_today" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.hiring_date')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.DATE_EMB_PRE_SALL || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="work" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.category')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.CODE_categ || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="trending_up" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.level')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.CODE_echelon || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="build" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.specialty')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.Specialite || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="group" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.approximate_workforce')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.EFFECTIF_APPROX || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="school" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.education_level')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.NiveauAss || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="payments" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.current_income')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.ActuelRevenu || $t('inputassu.not_specified')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item class="q-py-sm">
                                <q-item-section avatar>
                                  <q-icon name="description" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.hiring_notice')
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    form.avisEmbauche?.name || $t('inputassu.not_specified')
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
                            <div class="text-h6 text-weight-bold">{{ $t('immat.stepp2') }}</div>
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
                                {{ (form.nom || 'N')[0].toUpperCase()
                                }}{{ (form.prenom || 'P')[0].toUpperCase() }}
                              </q-avatar>
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-bold text-h6">
                                {{ form.nom || $t('inputassu.not_specified') }}
                                {{ form.prenom || '' }}
                              </q-item-label>
                              <q-item-label caption>{{
                                form.sexe || $t('inputassu.not_specified')
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
                                form.dateNaissance || $t('inputassu.not_specified')
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
                                form.lieuNaissance || $t('inputassu.not_specified')
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
                                form.arrondissementAssure && form.arrondissementAssure.NOM_ARROND
                                  ? form.arrondissementAssure.NOM_ARROND
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
                                    form.etatCivil || $t('inputassu.not_specified')
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
                                    form.nationaliteAssure && form.nationaliteAssure.nationalite
                                      ? form.nationaliteAssure.nationalite
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
                                    form.pieceIdentiteAssure || $t('inputassu.not_specified')
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
                                    form.numeroPieceIdentite || $t('inputassu.not_specified')
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
                                    form.datePieceIdentite || $t('inputassu.not_specified')
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
                                    form.lieuDelivrancePieceIdentiteAssure &&
                                    form.lieuDelivrancePieceIdentiteAssure.NOM_ARROND
                                      ? form.lieuDelivrancePieceIdentiteAssure.NOM_ARROND
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
                                    $t('immat.stepp3')
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
                                  {{ form.nomPere || $t('inputassu.not_specified') }}
                                  {{ form.prenomPere || '' }}
                                </div>
                                <div class="text-caption">
                                  {{ $t('inputassu.date_of_birth') }}:
                                  {{ form.dateNaissancePere || $t('inputassu.not_specified') }}
                                </div>
                                <div class="text-caption">
                                  {{ $t('inputassu.place_of_birth') }}:
                                  {{ form.lieuNaissancePere || $t('inputassu.not_specified') }}
                                </div>
                                <div class="text-caption">
                                  {{ $t('inputassu.birth_district') }}:
                                  {{
                                    form.arrondissementPere && form.arrondissementPere.NOM_ARROND
                                      ? form.arrondissementPere.NOM_ARROND
                                      : $t('inputassu.not_specified')
                                  }}
                                </div>
                                <q-badge
                                  :color="
                                    form.vivantPere === $t('inputassu.yes') ||
                                    form.vivantPere === 'OUI' ||
                                    form.vivantPere === 'YES'
                                      ? 'positive'
                                      : 'negative'
                                  "
                                  :label="form.vivantPere || $t('inputassu.not_specified')"
                                  class="q-mt-sm"
                                />
                                <!-- Afficher la date de décès seulement si le père est décédé -->
                                <div
                                  class="text-caption q-mt-sm"
                                  v-if="
                                    form.vivantPere === $t('inputassu.no') ||
                                    form.vivantPere === 'NON' ||
                                    form.vivantPere === 'NO' ||
                                    form.dateDecesPere
                                  "
                                >
                                  <q-icon name="event" color="grey-7" size="xs" class="q-mr-xs" />
                                  {{ $t('inputassu.date_death') }}:
                                  {{ form.dateDecesPere || $t('inputassu.not_specified') }}
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
                                    $t('immat.stepp4')
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
                                  {{ form.nomMere || $t('inputassu.not_specified') }}
                                  {{ form.prenomMere || '' }}
                                </div>
                                <div class="text-caption">
                                  {{ $t('inputassu.date_of_birth') }}:
                                  {{ form.dateNaissanceMere || $t('inputassu.not_specified') }}
                                </div>
                                <div class="text-caption">
                                  {{ $t('inputassu.place_of_birth') }}:
                                  {{ form.lieuNaissanceMere || $t('inputassu.not_specified') }}
                                </div>
                                <div class="text-caption">
                                  {{ $t('inputassu.birth_district') }}:
                                  {{
                                    form.arrondissementMere && form.arrondissementMere.NOM_ARROND
                                      ? form.arrondissementMere.NOM_ARROND
                                      : $t('inputassu.not_specified')
                                  }}
                                </div>
                                <q-badge
                                  :color="
                                    form.vivantMere === $t('inputassu.yes') ||
                                    form.vivantMere === 'OUI' ||
                                    form.vivantMere === 'YES'
                                      ? 'positive'
                                      : 'negative'
                                  "
                                  :label="form.vivantMere || $t('inputassu.not_specified')"
                                  class="q-mt-sm"
                                />
                                <!-- Afficher la date de décès seulement si la mère est décédée -->
                                <div
                                  class="text-caption q-mt-sm"
                                  v-if="
                                    form.vivantMere === $t('inputassu.no') ||
                                    form.vivantMere === 'NON' ||
                                    form.vivantMere === 'NO' ||
                                    form.dateDecesMere
                                  "
                                >
                                  <q-icon name="event" color="grey-7" size="xs" class="q-mr-xs" />
                                  {{ $t('inputassu.date_death') }}:
                                  {{ form.dateDecesMere || $t('inputassu.not_specified') }}
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
                            <div class="text-h6 text-weight-bold">{{ $t('immat.stepp5') }}</div>
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
                                form.ville.NOM_ARROND || $t('inputassu.not_specified')
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
                                form.quartier || $t('inputassu.not_specified')
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
                                form.telephone || $t('inputassu.not_specified')
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
                                form.fax || $t('inputassu.not_specified')
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
                                    form.addresse || $t('inputassu.not_specified')
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
                                    form.email || $t('inputassu.not_specified')
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
                                    form.boitePostale || $t('inputassu.not_specified')
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
                                    form.centreCNPS.LIB_CENTRE || $t('inputassu.not_specified')
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
                            <div class="text-h6 text-weight-bold">{{ $t('immat.stepp6') }}</div>
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
          <!-- Message de confirmation -->
          <div class="confirmation-message q-mb-lg">
            <q-icon name="info" color="blue" size="20px" class="q-mr-sm" />
            <span class="text-body1 text-justify">
              {{ $t('form.confirmationMessage') }}
            </span>
          </div>
          <q-banner class="bg-blue-1 text-blue-9 q-mb-md" rounded>
            <template v-slot:avatar>
              <q-icon name="lightbulb" color="blue" />
            </template>
            {{ $t('form.confirmationNote') }}
          </q-banner>
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
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
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

// Mock data for employers
const employeurs = ref([
  {
    numeroEmployeur: '123-1234567-123-A',
    RAISON_SOCIALE: 'Orange Cameroun',
    NOM_COMMERCIAL: 'Orange Cameroon',
    ADRESSE_EMPLOYEUR: 'Yaoundé, Cameroun',
    DATE_EMB_PREM_TRAV: '25/10/1998',
    EFFECTIF_APPROX: 500,
  },
])

const form = ref({
  mat_employeur: '',
  RAISON_SOCIALE: '',
  NOM_COMMERCIAL: '',
  avisEmbauche: null,
  DATE_EMB_PRE_SALL: '',
  DATE_DEMANDE: '',
  code_tele: '',
  code_secret: '',
  minDateAffi: '',
  CODE_echelon: '',
  regimeAffiC: '',
  regimeAffi: '',
  Specialite: '',
  ADRESSE_EMPLOYEUR: '',
  DATE_EMB_PREM_TRAV: '',
  EFFECTIF_APPROX: 0,
  CODE_categ: null,
  NiveauAss: '',
  ActuelRevenu: '',
  SMIG_VALUE: 0,
  sexe: '',
  nom: '',
  prenom: '',
  dateNaissance: '',
  lieuNaissance: '',
  arrondissementAssure: null,
  nationaliteAssure: null,
  pieceIdentiteAssure: '',
  numeroPieceIdentite: '',
  datePieceIdentite: '',
  lieuDelivrancePieceIdentiteAssure: null,
  etatCivil: '',
  nomPere: '',
  prenomPere: '',
  dateNaissancePere: '',
  lieuNaissancePere: '',
  arrondissementPere: null,
  vivantPere: '',
  dateDecesPere: '',
  nomMere: '',
  prenomMere: '',
  dateNaissanceMere: '',
  lieuNaissanceMere: '',
  arrondissementMere: null,
  vivantMere: '',
  dateDecesMere: '',
  ville: null,
  quartier: '',
  telephone: '',
  fax: '',
  addresse: '',
  email: '',
  boitePostale: '',
  centreCNPS: null,
  nombreEnfants: 0,
  actesNaissance: [],
  nombreCertificat: 0,
  certificatsTravail: [],
  nombreConjoints: 0,
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

const dynamicTextClass = computed(() => [
  $q.screen.gt.sm ? 'text-h5' : 'custom-mobile-text',
  'text-primary',
  'text-uppercase',
  'q-mb-sm',
])

const yesNoOptions = computed(() => [t('inputassu.yes'), t('inputassu.no')])
const required = (val) => !!val || 'Ce champ est requis / This field is required'
//const required = (val) => (val && val.length > 0) || t('input.required');
const requiredFiles = (count) => (val) =>
  (val && val.length >= count) || t('errors.file_too_large', { count })

const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || t('errors.invalidEmail')

const validateMatriculeCNPS = (val) => {
  const regex = /^(?:\d{3}-\d{7}-\d{3}-[A-Z]|\d{3}-\d{7}-[A-Z])$/.test(val)
  return regex || t('errors.invalid_cnps_format')
}

const validateDateNaissance = (val) => {
  if (!val) return t('errors.invalidDate')
  const [day, month, year] = val.split('/').map(Number)
  const date = new Date(year, month - 1, day)
  const today = new Date()
  return date < today || t('errors.invalidDate')
}

const validateDateNaissanceMere = (val) => {
  if (!val) return t('errors.invalidDate')
  const [day, month, year] = val.split('/').map(Number)
  const date = new Date(year, month - 1, day)
  const today = new Date()
  return date < today || t('errors.invalidDate')
}

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

const calculateSmig = () => {
  const DATE_EMB_PRE_SALL = form.value.DATE_EMB_PRE_SALL
  const [day, month, year] = DATE_EMB_PRE_SALL.split('/').map(Number)
  const hireDate = new Date(year, month - 1, day)
  const smigValue = hireDate.getFullYear() >= 2014 ? 36270 : 28182
  form.value.SMIG_VALUE = smigValue
}

const fetchEmployerData = async () => {
  const matricule = form.value.mat_employeur
  if (!validateMatriculeCNPS(matricule)) {
    notifyError(t('messages.error'))
    return
  }
  const employer = employeurs.value.find((e) => e.numeroEmployeur === matricule)
  if (employer) {
    form.value.NOM_COMMERCIAL = employer.NOM_COMMERCIAL
    form.value.RAISON_SOCIALE = employer.RAISON_SOCIALE
    form.value.ADRESSE_EMPLOYEUR = employer.ADRESSE_EMPLOYEUR
    form.value.DATE_EMB_PREM_TRAV = employer.DATE_EMB_PREM_TRAV
    form.value.EFFECTIF_APPROX = employer.EFFECTIF_APPROX
    notifySuccess(t('messages.employer_found'))
  } else {
    notifyError(t('messages.employer_not_found'))
  }
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
  validateStep(step.value)
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

/* const counterLabelFn = ({ files }) => {
  return files.length ? `${files.length} ${t('input.files_selected')}` : t('input.no_files_selected');
}; */
const counterLabelFn = ({ totalSize, filesCount, maxFiles }) => {
  return `(${filesCount}/${maxFiles}) ${Math.round(totalSize / 1024)} KB`
}
const isStepAllowed = (stepNumber) => {
  return stepNumber <= maxStep.value
}

const validateStep = async (stepNumber) => {
  let isValid = true
  const requiredFields = {
    1: ['mat_employeur', 'RAISON_SOCIALE', 'DATE_EMB_PRE_SALL', 'avisEmbauche'],
    2: [
      'nom',
      'sexe',
      'dateNaissance',
      'lieuNaissance',
      'arrondissementAssure',
      'nationaliteAssure',
      'pieceIdentiteAssure',
      'numeroPieceIdentite',
      'datePieceIdentite',
      'lieuDelivrancePieceIdentiteAssure',
      'etatCivil',
    ],
    3: [],
    4: ['nomMere', 'dateNaissanceMere', 'lieuNaissanceMere', 'arrondissementMere', 'vivantMere'],
    5: ['ville', 'telephone', 'email', 'centreCNPS'],
    6: [],
    7: [],
  }

  if (requiredFields[stepNumber]) {
    for (const field of requiredFields[stepNumber]) {
      const value = form.value[field]
      if (field === 'avisEmbauche') {
        if (!value) {
          isValid = false
          break
        }
      } else if (['actesNaissance', 'certificatsTravail', 'actesMariage'].includes(field)) {
        const countField = {
          actesNaissance: 'nombreEnfants',
          certificatsTravail: 'nombreCertificat',
          actesMariage: 'nombreConjoints',
        }[field]
        const count = form.value[countField] || 0
        if (count > 0 && (!value || value.length < count)) {
          isValid = false
          break
        }
      } else if (!value) {
        isValid = false
        break
      }
    }
  }

  if (stepNumber === 1) {
    if (!validateMatriculeCNPS(form.value.mat_employeur)) {
      isValid = false
    }
  } else if (stepNumber === 2) {
    if (!validateDateNaissance(form.value.dateNaissance)) {
      isValid = false
    }
  } else if (stepNumber === 4) {
    if (!validateDateNaissanceMere(form.value.dateNaissanceMere)) {
      isValid = false
    }
    if (form.value.vivantMere === t('inputassu.no') && !form.value.dateDecesMere) {
      isValid = false
    }
  } else if (stepNumber === 5) {
    if (!validateEmail(form.value.email)) {
      isValid = false
    }
  }

  stepErrors.value[stepNumber] = !isValid
  return isValid
}

const goToNextStep = async (nextStep) => {
  if (await validateStep(step.value)) {
    step.value = nextStep
    if (nextStep > maxStep.value) {
      maxStep.value = nextStep
    }
  } else {
    stepErrors.value[step.value] = true
    notifyError(t('form.step_incomplete'))
  }
}

const submitForm = async () => {
  const allStepsValid = await Promise.all(
    Array.from({ length: 7 }, (_, i) => i + 1).map((stepNumber) => validateStep(stepNumber)),
  )
  if (allStepsValid.every((valid) => valid)) {
    showConfirmationDialog.value = true
  } else {
    stepErrors.value[7] = true
    notifyError(t('form.incomplete'))
  }
}

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
    formData.append('sexe', t(form.value.sexe))
    formData.append('etatCivil', t(form.value.etatCivil))
    formData.append('vivantPere', form.value.vivantPere ? t(form.value.vivantPere) : '')
    formData.append('vivantMere', form.value.vivantMere ? t(form.value.vivantMere) : '')
    formData.append(
      'arrondissementAssure',
      form.value.arrondissementAssure ? getArrondissementName(form.value.arrondissementAssure) : '',
    )
    formData.append(
      'nationaliteAssure',
      form.value.nationaliteAssure ? getPaysName(form.value.nationaliteAssure) : '',
    )
    formData.append(
      'pieceIdentiteAssure',
      form.value.pieceIdentiteAssure ? getPieceName(form.value.pieceIdentiteAssure) : '',
    )
    formData.append(
      'lieuDelivrancePieceIdentiteAssure',
      form.value.lieuDelivrancePieceIdentiteAssure
        ? getArrondissementName(form.value.lieuDelivrancePieceIdentiteAssure)
        : '',
    )
    formData.append(
      'arrondissementPere',
      form.value.arrondissementPere ? getArrondissementName(form.value.arrondissementPere) : '',
    )
    formData.append(
      'arrondissementMere',
      form.value.arrondissementMere ? getArrondissementName(form.value.arrondissementMere) : '',
    )
    formData.append('ville', form.value.ville ? getArrondissementName(form.value.ville) : '')
    formData.append(
      'centreCNPS',
      form.value.centreCNPS ? getCentreCNPSName(form.value.centreCNPS) : '',
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

// Watch file inputs to update stepErrors
watch(
  () => form.value.avisEmbauche,
  () => {
    validateStep(1)
  },
  { deep: true },
)

watch(
  () => form.value.actesNaissance,
  () => {
    validateStep(6)
  },
  { deep: true },
)

watch(
  () => form.value.certificatsTravail,
  () => {
    validateStep(6)
  },
  { deep: true },
)

watch(
  () => form.value.actesMariage,
  () => {
    validateStep(6)
  },
  { deep: true },
)

// Watch other fields to update stepErrors
watch(
  () => [
    form.value.mat_employeur,
    form.value.RAISON_SOCIALE,
    form.value.DATE_EMB_PRE_SALL,
    form.value.nom,
    form.value.sexe,
    form.value.dateNaissance,
    form.value.lieuNaissance,
    form.value.arrondissementAssure,
    form.value.nationaliteAssure,
    form.value.pieceIdentiteAssure,
    form.value.numeroPieceIdentite,
    form.value.datePieceIdentite,
    form.value.lieuDelivrancePieceIdentiteAssure,
    form.value.etatCivil,
    form.value.nomMere,
    form.value.dateNaissanceMere,
    form.value.lieuNaissanceMere,
    form.value.arrondissementMere,
    form.value.vivantMere,
    form.value.dateDecesMere,
    form.value.ville,
    form.value.telephone,
    form.value.email,
    form.value.centreCNPS,
  ],
  () => {
    validateStep(step.value)
  },
  { deep: true },
)

watch(
  () => form.value.nombreEnfants,
  (newValue) => {
    if (newValue < form.value.actesNaissance.length) {
      form.value.actesNaissance = form.value.actesNaissance.slice(0, newValue)
    }
    validateStep(6)
  },
)

watch(
  () => form.value.nombreCertificat,
  (newValue) => {
    if (newValue < form.value.certificatsTravail.length) {
      form.value.certificatsTravail = form.value.certificatsTravail.slice(0, newValue)
    }
    validateStep(6)
  },
)

watch(
  () => form.value.nombreConjoints,
  (newValue) => {
    if (newValue < form.value.actesMariage.length) {
      form.value.actesMariage = form.value.actesMariage.slice(0, newValue)
    }
    validateStep(6)
  },
)
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

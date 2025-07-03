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
            >
              <div class="justify-center row" :class="{ column: !$q.screen.gt.sm }">
                <q-select
                  v-model="form.origineRevenue"
                  label="Origine des revenus *"
                  :options="[
                    'Activité indépendante',
                    'Revenus agricoles',
                    'Revenus commerciaux',
                    'Revenus locatifs',
                    'Prestations sociales',
                    'Autres revenus',
                    'Investissements',
                  ]"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[1] && !form.origineRevenue"
                />
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
                  :error="stepErrors[1] && !form.dateAffiliationNormale"
                />
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
                />
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
                  :error="stepErrors[1] && !form.assieteCotisation"
                />
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
                  :error="stepErrors[1] && !form.tauxCotisation"
                >
                  <template v-slot:append>
                    <q-icon name="percent" class="text-grey-8" />
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
                  :error="stepErrors[1] && !form.smig"
                />
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
                  :error="stepErrors[1] && !form.montantCotisation"
                />
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
                  :error="stepErrors[2] && !form.lieuNaissance"
                  @input="form.lieuNaissance = form.lieuNaissance.toUpperCase()"
                />
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
                  :error="stepErrors[2] && !form.arrondissementAssure"
                />
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
                  :error="stepErrors[2] && !form.nationaliteAssure"
                />
                <q-select
                  v-model="form.pieceIdentiteAssure"
                  :options="pieces"
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
                  :error="stepErrors[2] && !form.numeroPieceIdentite"
                  @input="form.numeroPieceIdentite = form.numeroPieceIdentite.toUpperCase()"
                />
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
                <q-btn @click="goToNextStep(3)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 1" color="primary" label="Retour" class="q-ml-sm" />
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
                          v-model="form.dateNaissancePere"
                          mask="DD/MM/YYYY"
                          locale="fr"
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
                  @input="form.lieuNaissancePere = form.lieuNaissancePere.toUpperCase()"
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
                <q-btn @click="goToNextStep(4)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 2" color="primary" label="Retour" class="q-ml-sm" />
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
                  @input="form.prenomMere = form.prenomMere.toUpperCase()"
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
                  :error="stepErrors[4] && !form.lieuNaissanceMere"
                  @input="form.lieuNaissanceMere = form.lieuNaissanceMere.toUpperCase()"
                />
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
                <q-btn @click="goToNextStep(5)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 4" color="primary" label="Retour" class="q-ml-sm" />
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
                  @input="form.fax = form.fax.toUpperCase()"
                />
                <q-input
                  v-model="form.Adresse"
                  :label="$t('inputassu.address')"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.addresse = form.addresse.toUpperCase()"
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
                  @input="form.boitePostale = form.boitePostale.toUpperCase()"
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
                  :error="stepErrors[5] && !form.centreCNPS"
                />
              </div>
              <q-stepper-navigation>
                <q-btn @click="goToNextStep(6)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 5" color="primary" label="Retour" class="q-ml-sm" />
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
                <q-file
                  v-if="form.nombreEnfants > 0"
                  v-model="form.actesNaissance"
                  :label="`Actes de naissance des enfants (${form.nombreEnfants} requis)`"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  counter
                  :counter-label="counterLabelFn"
                  :max-files="form.nombreEnfants"
                  multiple
                  accept=".jpg, .png, .pdf"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[requiredFiles(form.nombreEnfants)]"
                  :error="stepErrors[6] && form.nombreEnfants > 0 && (!form.actesNaissance || form.actesNaissance.length === 0)"
                  @update:model-value="onFileSelected('actesNaissance')"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
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
                <q-file
                  v-if="form.nombreCertificat > 0"
                  v-model="form.certificatsTravail"
                  :label="`Certificats de travail (${form.nombreCertificat} requis)`"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  counter
                  :counter-label="counterLabelFn"
                  :max-files="form.nombreCertificat"
                  multiple
                  accept=".jpg, .png, .pdf"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[requiredFiles(form.nombreCertificat)]"
                  :error="stepErrors[6] && form.nombreCertificat > 0 && (!form.certificatsTravail || form.certificatsTravail.length === 0)"
                  @update:model-value="onFileSelected('certificatsTravail')"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
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
                <q-file
                  v-if="form.nombreConjoints > 0"
                  v-model="form.actesMariage"
                  :label="`Actes de mariage (${form.nombreConjoints} requis)`"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  counter
                  :counter-label="counterLabelFn"
                  :max-files="form.nombreConjoints"
                  multiple
                  accept=".jpg, .png, .pdf"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[requiredFiles(form.nombreConjoints)]"
                  :error="stepErrors[6] && form.nombreConjoints > 0 && (!form.actesMariage || form.actesMariage.length === 0)"
                  @update:model-value="onFileSelected('actesMariage')"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(7)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 5" color="primary" label="Retour" class="q-ml-sm" />
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
            >
              <div class="justify-center row" :class="{ 'column': !$q.screen.gt.sm }">
                <!-- Résumé Étape 1 -->
                <q-card flat bordered class="q-mb-md full-width">
                  <q-card-section class="row items-center">
                    <div class="text-h6 text-primary">Informations sur l'affiliation</div>
                    <q-space />
                    <q-btn
                      flat
                      color="primary"
                      label="Modifier"
                      @click="step = 1"
                    />
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Origine des revenus</q-item-label>
                          <q-item-label caption>{{ form.origineRevenue || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Date d'affiliation sollicitée</q-item-label>
                          <q-item-label caption>{{ form.dateAffiliationSollicitee || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Date d'affiliation normale</q-item-label>
                          <q-item-label caption>{{ form.dateAffiliationNormale || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Détails sur l'origine</q-item-label>
                          <q-item-label caption>{{ form.detailOrigineRevenue || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>SMIG en vigueur</q-item-label>
                          <q-item-label caption>{{ form.smig || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Revenu annuel à déclarer</q-item-label>
                          <q-item-label caption>{{ form.revenuAnnuelDeclare || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Taux de cotisation en vigueur</q-item-label>
                          <q-item-label caption>{{ form.tauxCotisation || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Assiette de cotisation à l'immatriculation</q-item-label>
                          <q-item-label caption>{{ form.assieteCotisation || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Montant de cotisation à l'immatriculation</q-item-label>
                          <q-item-label caption>{{ form.montantCotisation || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Résumé Étape 2 -->
                <q-card flat bordered class="q-mb-md full-width">
                  <q-card-section class="row items-center">
                    <div class="text-h6 text-primary">Informations personnelles de l’assuré</div>
                    <q-space />
                    <q-btn
                      flat
                      color="primary"
                      label="Modifier"
                      @click="step = 2"
                    />
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nom</q-item-label>
                          <q-item-label caption>{{ form.nom || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Prénom</q-item-label>
                          <q-item-label caption>{{ form.prenom || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Sexe</q-item-label>
                          <q-item-label caption>{{ form.sexe || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Date de naissance</q-item-label>
                          <q-item-label caption>{{ form.dateNaissance || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Lieu de naissance</q-item-label>
                          <q-item-label caption>{{ form.lieuNaissance || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Arrondissement de naissance</q-item-label>
                          <q-item-label caption>{{ form.arrondissementAssure?.NOM_ARROND || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>État matrimonial</q-item-label>
                          <q-item-label caption>{{ form.etatCivil || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nationalité</q-item-label>
                          <q-item-label caption>{{ form.nationaliteAssure?.nationalite || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Type de pièce d'identité</q-item-label>
                          <q-item-label caption>{{ form.pieceIdentiteAssure?.LIBELLE || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Numéro de pièce d'identité</q-item-label>
                          <q-item-label caption>{{ form.numeroPieceIdentite || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Établi le</q-item-label>
                          <q-item-label caption>{{ form.datePieceIdentite || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Lieu de délivrance</q-item-label>
                          <q-item-label caption>{{ form.lieuDelivrancePieceIdentiteAssure?.NOM_ARROND || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Résumé Étape 3 -->
                <q-card flat bordered class="q-mb-md full-width">
                  <q-card-section class="row items-center">
                    <div class="text-h6 text-primary">Informations sur le père de l’assuré</div>
                    <q-space />
                    <q-btn
                      flat
                      color="primary"
                      label="Modifier"
                      @click="step = 3"
                    />
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nom</q-item-label>
                          <q-item-label caption>{{ form.nomPere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Prénom</q-item-label>
                          <q-item-label caption>{{ form.prenomPere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Date de naissance</q-item-label>
                          <q-item-label caption>{{ form.dateNaissancePere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Lieu de naissance</q-item-label>
                          <q-item-label caption>{{ form.lieuNaissancePere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Arrondissement de naissance</q-item-label>
                          <q-item-label caption>{{ form.arrondissementPere?.NOM_ARROND || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Vivant</q-item-label>
                          <q-item-label caption>{{ form.vivantPere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="form.vivantPere === 'Non'">
                        <q-item-section>
                          <q-item-label>Date de décès</q-item-label>
                          <q-item-label caption>{{ form.dateDecesPere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Résumé Étape 4 -->
                <q-card flat bordered class="q-mb-md full-width">
                  <q-card-section class="row items-center">
                    <div class="text-h6 text-primary">Informations sur la mère de l’assuré</div>
                    <q-space />
                    <q-btn
                      flat
                      color="primary"
                      label="Modifier"
                      @click="step = 4"
                    />
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nom</q-item-label>
                          <q-item-label caption>{{ form.nomMere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Prénom</q-item-label>
                          <q-item-label caption>{{ form.prenomMere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Date de naissance</q-item-label>
                          <q-item-label caption>{{ form.dateNaissanceMere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Lieu de naissance</q-item-label>
                          <q-item-label caption>{{ form.lieuNaissanceMere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Arrondissement de naissance</q-item-label>
                          <q-item-label caption>{{ form.arrondissementMere?.NOM_ARROND || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Vivant</q-item-label>
                          <q-item-label caption>{{ form.vivantMere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="form.vivantMere === 'Non'">
                        <q-item-section>
                          <q-item-label>Date de décès</q-item-label>
                          <q-item-label caption>{{ form.dateDecesMere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Résumé Étape 5 -->
                <q-card flat bordered class="q-mb-md full-width">
                  <q-card-section class="row items-center">
                    <div class="text-h6 text-primary">Contact et Résidence</div>
                    <q-space />
                    <q-btn
                      flat
                      color="primary"
                      label="Modifier"
                      @click="step = 5"
                    />
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Ville de résidence</q-item-label>
                          <q-item-label caption>{{ form.ville?.NOM_ARROND || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Quartier</q-item-label>
                          <q-item-label caption>{{ form.quartier || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Téléphone</q-item-label>
                          <q-item-label caption>{{ form.telephone || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Fax</q-item-label>
                          <q-item-label caption>{{ form.fax || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Adresse</q-item-label>
                          <q-item-label caption>{{ form.addresse || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Email</q-item-label>
                          <q-item-label caption>{{ form.email || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Boîte postale</q-item-label>
                          <q-item-label caption>{{ form.boitePostale || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Centre CNPS</q-item-label>
                          <q-item-label caption>{{ form.centreCNPS?.LIB_CENTRE || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Résumé Étape 6 -->
                <q-card flat bordered class="q-mb-md full-width">
                  <q-card-section class="row items-center">
                    <div class="text-h6 text-primary">Pièces complémentaires</div>
                    <q-space />
                    <q-btn
                      flat
                      color="primary"
                      label="Modifier"
                      @click="step = 6"
                    />
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nombre d’enfants</q-item-label>
                          <q-item-label caption>{{ form.nombreEnfants || '0' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Actes de naissance</q-item-label>
                          <q-item-label caption>
                            {{ form.actesNaissance.length }} fichier(s)
                            <div v-if="form.actesNaissance.length > 0">
                              <div v-for="file in form.actesNaissance" :key="file.name">
                                - {{ file.name }}
                              </div>
                            </div>
                            <div v-else>Aucun fichier</div>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nombre de certificats de travail</q-item-label>
                          <q-item-label caption>{{ form.nombreCertificat || '0' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Certificats de travail</q-item-label>
                          <q-item-label caption>
                            {{ form.certificatsTravail.length }} fichier(s)
                            <div v-if="form.certificatsTravail.length > 0">
                              <div v-for="file in form.certificatsTravail" :key="file.name">
                                - {{ file.name }}
                              </div>
                            </div>
                            <div v-else>Aucun fichier</div>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nombre de conjoints</q-item-label>
                          <q-item-label caption>{{ form.nombreConjoints || '0' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Actes de mariage</q-item-label>
                          <q-item-label caption>
                            {{ form.actesMariage.length }} fichier(s)
                            <div v-if="form.actesMariage.length > 0">
                              <div v-for="file in form.actesMariage" :key="file.name">
                                - {{ file.name }}
                              </div>
                            </div>
                            <div v-else>Aucun fichier</div>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Bouton de soumission finale -->
                <q-btn
                  color="primary"
                  label="Confirmer et soumettre"
                  @click="validateAndShowConfirmation"
                  class="q-mt-md"
                />
              </div>

              <q-stepper-navigation>
                <q-btn flat @click="step = 6" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
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

        <q-card-actions align="center">
          <q-btn label="Soumettre" color="primary" @click="confirmSubmission" />
          <q-btn flat label="Annuler" color="primary" @click="showConfirmationDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';
import { useNotify } from './useNotify.js';
import { arrondissements as rawArrondissements } from '../data/Arrondissements.js';
import { pays as rawPays } from '../data/Pays.js';
import { pieces as rawPieces } from '../data/Pieces.js';
import { centres as rawCentres } from '../data/Centres.js';

defineProps({
  service: Object,
});

const emit = defineEmits(['close']);

const { notifyError, notifySuccess } = useNotify()

const open = ref(true);
const step = ref(1);
const formRef = ref(null);
const stepErrors = ref({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false });
const showConfirmationDialog = ref(false);

const arrondissements = ref([...rawArrondissements]);
const pays = ref([...rawPays]);
const pieces = ref([...rawPieces]);
const centres = ref([...rawCentres]);

// Mock database for SMIG, taux, and max cotisable montant
const parametersDB = ref([
  { year: 2025, smig: 45000, taux: 0.045, maxCotisable: 750000 },
  { year: 2024, smig: 40000, taux: 0.04, maxCotisable: 700000 },
  { year: 2023, smig: 38000, taux: 0.035, maxCotisable: 650000 },
]);

const form = ref({
  origineRevenue: '',
  dateAffiliationSollicitee: '',
  dateAffiliationNormale: '',
  detailOrigineRevenue: '',
  smig: 0,
  revenuAnnuelDeclare: 0,
  tauxCotisation: 0,
  assieteCotisation: 0,
  montantCotisation: 0,
  maxCotisable: 0,
  sexe: '',
  nom: '',
  prenom: '',
  dateNaissance: '',
  lieuNaissance: '',
  nationaliteAssure: null,
  numeroPieceIdentite: '',
  datePieceIdentite: '',
  lieuDelivrancePieceIdentiteAssure: null,
  etatCivil: '',
  arrondissementAssure: null,
  nomPere: '',
  prenomPere: '',
  dateNaissancePere: '',
  arrondissementPere: null,
  lieuNaissancePere: '',
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
  email: '',
  boitePostale: '',
  centreCNPS: null,
  fax: '',
  addresse: '',
  nombreEnfants: 0,
  nombreCertificat: 0,
  nombreConjoints: 0,
  actesNaissance: [],
  nombCert: 0,
  certificatsTravail: [],
  nombConj: 0,
  actesMariage: [],
  filedeclareAnnuelRevenu: null,
  filedeclareHonneur: null,
});

// Set Date d'affiliation normale to the start of next month on component mount
onMounted(() => {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  form.value.dateAffiliationNormale = nextMonth.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
});

// Fonction de validation pour l'email
const validateEmail = (val) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(val) || 'Veuillez entrer un email valide (ex: exemple@domaine.com)';
};

// Validation pour la date de naissance de l'assuré (minimum 14 ans)
const validateDateNaissance = (val) => {
  if (!val) return 'Ce champ est requis';
  const birthDate = new Date(val.split('/').reverse().join('-'));
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 14);
  return birthDate <= minDate || 'L\'assuré doit avoir au moins 14 ans';
};

// Validation pour la date de naissance du père
const validateDateNaissancePere = (val) => {
  if (!val) return true; // Champ non requis
  if (!form.value.dateNaissance) return 'Veuillez d\'abord entrer la date de naissance de l\'assuré';
  const fatherBirthDate = new Date(val.split('/').reverse().join('-'));
  const assureBirthDate = new Date(form.value.dateNaissance.split('/').reverse().join('-'));
  const minFatherBirthDate = new Date(assureBirthDate);
  minFatherBirthDate.setFullYear(assureBirthDate.getFullYear() - 12);
  return fatherBirthDate <= minFatherBirthDate || 'Le père doit être né au moins 12 ans avant l\'assuré';
};

// Validation pour la date de naissance de la mère
const validateDateNaissanceMere = (val) => {
  if (!val) return 'Ce champ est requis';
  if (!form.value.dateNaissance) return 'Veuillez d\'abord entrer la date de naissance de l\'assuré';
  const motherBirthDate = new Date(val.split('/').reverse().join('-'));
  const assureBirthDate = new Date(form.value.dateNaissance.split('/').reverse().join('-'));
  const minMotherBirthDate = new Date(assureBirthDate);
  minMotherBirthDate.setFullYear(assureBirthDate.getFullYear() - 12);
  return motherBirthDate <= minMotherBirthDate || 'La mère doit être née au moins 12 ans avant l\'assuré';
};

// Validation pour la date d'affiliation sollicitée
/* const validateDateAffiliationSollicitee = (val) => {

  if (!val) return 'Ce champ est requis';
  const solliciteeDate = new Date(val.split('/').reverse().join('-'));
  const normaleDate = new Date(form.value.dateAffiliationNormale.split('/').reverse().join('-'));
  const minDate = new Date(normaleDate);
  minDate.setMonth(minDate.getMonth() - 6);
  return solliciteeDate >= minDate && solliciteeDate <= normaleDate
    ? true
    : 'La date d\'affiliation sollicitée doit être au plus 6 mois avant la date d\'affiliation normale';
}; */

// Validation pour le revenu annuel
const validateRevenuAnnuel = (val) => {
  return val >= 0 || 'Le revenu annuel ne peut pas être négatif';
};

// Validation pour l'assiette de cotisation
const validateAssieteCotisation = (val) => {
  if (!val) return 'Ce champ est requis';
  return (
    val >= form.value.smig &&
    val <= form.value.maxCotisable
  ) || `L'assiette doit être entre ${form.value.smig} et ${form.value.maxCotisable}`;
};

// Validation pour les fichiers requis
const requiredFiles = (count) => (val) => {
  if (!val || val.length === 0) return `Veuillez télécharger ${count} fichier(s)`;
  return val.length === count || `Veuillez télécharger exactement ${count} fichier(s)`;
};

// Gestionnaire pour la sélection de fichier
const onFileSelected = (field) => async (files) => {
  if (files && files.length > 0) {
    notifySuccess(`${files.length} fichier(s) sélectionné(s) avec succès pour ${field} !`);
    formRef.value.resetValidation();
    await formRef.value.validate();
  }
};

const onRejected = (rejectedEntries) => {
  rejectedEntries.forEach((entry) => {
    notifyError(
      `Fichier rejeté : ${entry.file.name} - ${
        entry.failedPropValidation === 'max-file-size'
          ? 'Taille maximale dépassée (3MB)'
          : 'Format non pris en charge.'
      }`,
    );
  });
};

// Réinitialiser le champ fichier lorsque le nombre change
const resetFileField = (field) => {
  form.value[field] = [];
  formRef.value.resetValidation();
};

// Counter label function for file inputs
const counterLabelFn = ({ files } = {}) => {
  return files && files.length > 0 ? `${files.length} fichier(s) sélectionné(s)` : '';
};

// Date options for date pickers
const optionsDn = (date) => {
  const selectedDate = new Date(date.split('/').reverse().join('-'));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate <= today;
};

const optionsDateNaissance = (date) => {
  const selectedDate = new Date(date.split('/').reverse().join('-'));
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 14);
  return selectedDate <= minDate;
};

const optionsDateAffiliation = (date) => {
  const selectedDate = new Date(date.split('/').reverse().join('-'));
  const normaleDate = new Date(form.value.dateAffiliationNormale.split('/').reverse().join('-'));
  const minDate = new Date(normaleDate);
  minDate.setMonth(minDate.getMonth() - 6);
  return selectedDate >= minDate && selectedDate <= normaleDate;
};

const required = (val) => !!val || 'Ce champ est requis';

// Fetch SMIG, taux, and max cotisable based on Date d'affiliation sollicitée
const fetchParameters = () => {
  if (!form.value.dateAffiliationSollicitee) {
    form.value.smig = 0;
    form.value.tauxCotisation = 0;
    form.value.maxCotisable = 0;
    form.value.assieteCotisation = 0;
    form.value.montantCotisation = 0;
    return;
  }

  const year = new Date(form.value.dateAffiliationSollicitee.split('/').reverse().join('-')).getFullYear();
  const params = parametersDB.value.find((p) => p.year === year) || parametersDB.value[0];

  form.value.smig = params.smig;
  form.value.tauxCotisation = params.taux;
  form.value.maxCotisable = params.maxCotisable;

  updateAssieteCotisation();
};

// Calculate Assiette de cotisation
const updateAssieteCotisation = () => {
  if (form.value.revenuAnnuelDeclare && form.value.smig && form.value.maxCotisable) {
    const monthlyRevenue = Math.round(Number(form.value.revenuAnnuelDeclare) / 12);
    form.value.assieteCotisation = Math.min(Math.max(monthlyRevenue, form.value.smig), form.value.maxCotisable);
    calculateMontant();
  } else {
    form.value.assieteCotisation = 0;
    form.value.montantCotisation = 0;
  }
};

// Calculate Montant de cotisation
const calculateMontant = () => {
  if (form.value.assieteCotisation && form.value.tauxCotisation) {
    form.value.montantCotisation = Math.round(Number(form.value.assieteCotisation) * form.value.tauxCotisation);
  } else {
    form.value.montantCotisation = 0;
  }
};

const goToNextStep = async (nextStep) => {
  const valid = await formRef.value.validate();
  if (valid) {
    stepErrors.value[nextStep - 1] = false;
    step.value = nextStep;
  } else {
    stepErrors.value[step.value] = true;
    notifyError('Veuillez remplir tous les champs requis.');
  }
};

const filterArrondissement = (val, update) => {
  if (val === '') {
    update(() => {
      arrondissements.value = [...rawArrondissements];
    });
    return;
  }
  const needle = val.toLowerCase();
  update(() => {
    arrondissements.value = rawArrondissements.filter((item) =>
      item.NOM_ARROND.toLowerCase().includes(needle),
    );
  });
};

const filterPays = (val, update) => {
  if (val === '') {
    update(() => {
      pays.value = [...rawPays];
    });
    return;
  }
  const needle = val.toLowerCase();
  update(() => {
    pays.value = rawPays.filter((item) => item.nationalite.toLowerCase().includes(needle));
  });
};

const filterPieces = (val, update) => {
  if (val === '') {
    update(() => {
      pieces.value = [...rawPieces];
    });
    return;
  }
  const needle = val.toLowerCase();
  update(() => {
    pieces.value = rawPieces.filter((item) => item.LIBELLE.toLowerCase().includes(needle));
  });
};

const filterCentreCNPS = (val, update) => {
  if (val === '') {
    update(() => {
      centres.value = [...rawCentres];
    });
    return;
  }
  const needle = val.toLowerCase();
  update(() => {
    centres.value = rawCentres.filter((item) => item.LIB_CENTRE.toLowerCase().includes(needle));
  });
};

const validateStep = (stepNumber) => {
  const stepFields = {
    1: [
      'origineRevenue',
      'dateAffiliationSollicitee',
      'dateAffiliationNormale',
      'detailOrigineRevenue',
      'smig',
      'revenuAnnuelDeclare',
      'tauxCotisation',
      'assieteCotisation',
      'montantCotisation',
      'filedeclareAnnuelRevenu',
      'filedeclareHonneur',
    ],
    2: [
      'nom',
      'sexe',
      'dateNaissance',
      'lieuNaissance',
      'arrondissementAssure',
      'etatCivil',
      'nationaliteAssure',
      'pieceIdentiteAssure',
      'numeroPieceIdentite',
      'datePieceIdentite',
      'lieuDelivrancePieceIdentiteAssure',
    ],
    3: [],
    4: ['nomMere', 'dateNaissanceMere', 'lieuNaissanceMere', 'arrondissementMere', 'vivantMere'],
    5: ['ville', 'telephone', 'email', 'centreCNPS'],
    6: [],
    7: [],
  };

  // Vérification des champs conditionnels requis pour l'étape 6
  const step6Errors = [];
  if (form.value.nombreEnfants > 0 && (!form.value.actesNaissance || form.value.actesNaissance.length !== form.value.nombreEnfants)) {
    step6Errors.push('actesNaissance');
  }
  if (form.value.nombreCertificat > 0 && (!form.value.certificatsTravail || form.value.certificatsTravail.length !== form.value.nombreCertificat)) {
    step6Errors.push('certificatsTravail');
  }
  if (form.value.nombreConjoints > 0 && (!form.value.actesMariage || form.value.actesMariage.length !== form.value.nombreConjoints)) {
    step6Errors.push('actesMariage');
  }

  const errors = stepFields[stepNumber].filter((field) => !form.value[field]);
  if (stepNumber === 6) {
    return step6Errors.length > 0;
  }
  return errors.length > 0;
};

const validateAndShowConfirmation = async () => {
  // Réinitialiser les erreurs d'étape
  stepErrors.value = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false };

  // Valider toutes les étapes
  let hasErrors = false;
  for (let i = 1; i <= 6; i++) {
    if (validateStep(i)) {
      stepErrors.value[i] = true;
      hasErrors = true;
    }
  }

  // Effectuer la validation du formulaire
  const valid = await formRef.value.validate();
  if (!valid || hasErrors) {
    // Trouver la première étape avec des erreurs
    const firstErrorStep = Object.keys(stepErrors.value).find((key) => stepErrors.value[key]);
    if (firstErrorStep) {
      step.value = parseInt(firstErrorStep);
      notifyError(`Veuillez corriger les erreurs dans l'étape ${firstErrorStep}.`);
    } else {
      notifyError('Veuillez corriger les erreurs du formulaire.');
    }
    return;
  }

  // Si valide, afficher le dialogue de confirmation
  showConfirmationDialog.value = true;
};

const confirmSubmission = async () => {
  showConfirmationDialog.value = false;
  await sendToOnBase();
};

const submitForm = async () => {
  // Réinitialiser les erreurs d'étape
  stepErrors.value = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false };

  // Valider toutes les étapes
  let hasErrors = false;
  for (let i = 1; i <= 6; i++) {
    if (validateStep(i)) {
      stepErrors.value[i] = true;
      hasErrors = true;
    }
  }

  // Effectuer la validation du formulaire
  const valid = await formRef.value.validate();
  if (!valid || hasErrors) {
    // Trouver la première étape avec des erreurs
    const firstErrorStep = Object.keys(stepErrors.value).find((key) => stepErrors.value[key]);
    if (firstErrorStep) {
      step.value = parseInt(firstErrorStep);
      notifyError(`Veuillez corriger les erreurs dans l'étape ${firstErrorStep}.`);
    } else {
      notifyError('Veuillez corriger les erreurs du formulaire.');
    }
    return;
  }

  // Si valide, soumettre directement
  await sendToOnBase();
};

const sendToOnBase = async () => {
  try {
    // Simuler l'envoi des données à OnBase
    console.log('Envoi des données à OnBase:', form.value);

    // Simuler une réponse réussie
    notifySuccess('Formulaire soumis avec succès !');
    closeDialog();
  } catch (error) {
    notifyError('Erreur lors de la soumission du formulaire. Veuillez réessayer.');
    console.error('Erreur OnBase:', error);
  }
};

const closeDialog = () => {
  open.value = false;
  emit('close');
};
</script>

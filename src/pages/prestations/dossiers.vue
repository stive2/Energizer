<!-- eslint-disable vue/multi-word-component-names -->

<template>
  <div class="prestations-container q-pa-md">
    <!-- Navigation breadcrumb -->
    <q-breadcrumbs v-if="selectedType || selectedPrestation" class="q-mb-md">
      <q-breadcrumbs-el
        label="Accueil"
        @click="goHome"
        class="cursor-pointer text-primary"
      />
      <q-breadcrumbs-el
        v-if="selectedType"
        :label="selectedType.title"
        @click="selectedPrestation = null"
        class="cursor-pointer text-primary"
      />
      <q-breadcrumbs-el
        v-if="selectedPrestation"
        :label="selectedPrestation.title"
      />
    </q-breadcrumbs>

    <!-- Formulaire de prestation -->
    <div v-if="selectedPrestation" class="form-section">
      <q-card class="form-card enhanced-card">
        <q-card-section class="bg-primary text-white">
          <div class="text-h5 flex items-center">
            <q-icon name="description" class="q-mr-sm" />
            {{ selectedPrestation.title }}
          </div>
          <div class="text-subtitle2 q-mt-xs">
            {{ selectedPrestation.description }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form ref="prestationForm" @submit="submitForm" class="q-gutter-md">
            <!-- Champs communs -->
            <div class="justify-center row" :class="{ 'column': !$q.screen.gt.sm }">
              <q-input
                v-model="formData.mat_employeur"
                :label="$t('inputassu.employer_cnps_registration_number')"
                outlined
                dense
                :style="$q.screen.gt.sm ? 'width: 500px' : 'width: 100%'"
                class="q-mr-sm q-mb-sm"
                :rules="[required, validateMatriculeCNPS]"
                :hint="$t('inputassu.employer_cnps_registration_number')"
                @keyup.enter="fetchEmployerExamen()"
                @keydown.enter.prevent
                @click="fetchEmployerExamen()"
                @update:model-value="(val) => (formData.mat_employeur = val.toUpperCase())"
              >
                <template v-slot:append>
                  <q-icon
                    name="search"
                    class="cursor-pointer"
                    color="primary"
                    @click="fetchEmployerExamen()"
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
                v-model="formData.raisonsociale"
                :label="$t('inputassu.legal_name')"
                outlined
                dense
                :style="$q.screen.gt.sm ? 'width: 500px' : 'width: 100%'"
                class="q-mr-sm q-mb-sm"
                readonly
                :rules="[required]"
              >
                <template v-slot:label>
                  {{ $t('inputassu.legal_name') }}
                  <span
                    class="q-px-sm bg-red text-white text-italic rounded-borders"
                    style="font-size: 10px"
                  >
                    {{ $t('input.requis') }}
                  </span>
                </template>
              </q-input>
              <q-input
                v-model="formData.mat_interne"
                :label="$t('inputassu.matricule_interne_assure')"
                outlined
                dense
                :style="$q.screen.gt.sm ? 'width: 500px' : 'width: 100%'"
                class="q-mr-sm q-mb-sm"
                @update:model-value="(val) => (formData.mat_interne = val.toUpperCase())"
              />
              <q-input
                v-model="formData.EMAIL_PERS"
                :label="$t('inputassu.email')"
                outlined
                dense
                :style="$q.screen.gt.sm ? 'width: 500px' : 'width: 100%'"
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
                v-model="formData.TEL_PERS"
                :label="$t('inputassu.phone')"
                outlined
                dense
                :style="$q.screen.gt.sm ? 'width: 500px' : 'width: 100%'"
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
                v-model="formData.Adresse"
                :label="$t('inputassu.adresse_assure')"
                outlined
                dense
                :style="$q.screen.gt.sm ? 'width: 500px' : 'width: 100%'"
                class="q-mr-sm q-mb-sm"
                @update:model-value="(val) => (formData.Adresse = val.toUpperCase())"
              />
            </div>

            <!-- Partie variable spécifique à la prestation -->
            <div v-if="selectedPrestation.fields" class="dynamic-fields q-mt-md">
              <!-- Remboursement des frais de prestations familiales (id: 11) -->
              <div v-if="selectedPrestation.id === 11">
                <div class="text-primary">
                  <!-- Premier Examen -->
                  <q-expansion-item
                    icon="looks_one"
                    label="Premier examen prénatal"
                    default-opened
                    class="bg-grey-1 rounded-borders"
                  >
                    <q-card-section>
                      <div class="justify-center row q-mb-md">
                        <div class="col-12 col-sm-6">
                          <q-input
                            v-model="formData.datePremierExamen"
                            :label="$t('date_premier_examen')"
                            dense
                            outlined
                            style="max-width: 300px"
                            :rules="[required]"
                            :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                            :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
                          >
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer" color="primary">
                                <q-popup-proxy transition-show="scale" transition-hide="scale">
                                  <q-date
                                    v-model="formData.datePremierExamen"
                                    :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                    :options="optionsDn"
                                    color="primary"
                                  />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                            <template v-slot:label>
                              {{ $t('inputassu.date_premier_examen') }}
                              <span
                                class="q-px-sm bg-red text-white text-italic rounded-borders"
                                style="font-size: 10px"
                              >
                                {{ $t('input.requis') }}
                              </span>
                            </template>
                          </q-input>
                        </div>
                      </div>
                      <div class="justify-center row q-mb-md">
                        <div class="col-12 col-sm-4">
                          <q-checkbox
                          v-model="formData.allocations1"
                          :label="$t('inputassu.frais_allocation') + ' 1'"
                            :rules="[() => validateFirstExamCheckboxes() || t('errors.checkbox_required_first_exam')]"
                          />
                        </div>
                        <div class="col-12 col-sm-4">
                          <q-checkbox
                          v-model="formData.fraisMedicaux1"
                          :label="$t('inputassu.frais_medicaux') + ' 1'"
                            :rules="[() => validateFirstExamCheckboxes() || t('errors.checkbox_required_first_exam')]"
                          />
                        </div>
                      </div>
                      <div class="justify-center row q-gutter-y-md">
                        <div class="col-12 col-sm-6">
                          <q-file
                            v-model="formData.certificatPremier"
                            :label="$t('inputassu.certificat_premier_examen')"
                            dense
                            outlined
                            accept=".pdf,.jpg,.png"
                            max-file-size="3072000"
                            style="max-width: 500px"
                            :rules="[required]"
                          >
                            <template v-slot:prepend>
                              <q-icon name="attach_file" />
                            </template>
                            <template v-slot:label>
                              {{ $t('inputassu.certificat_premier_examen') }}
                              <span
                                class="q-px-sm bg-red text-white text-italic rounded-borders"
                                style="font-size: 10px"
                              >
                                {{ $t('input.requis') }}
                              </span>
                            </template>
                          </q-file>
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-file
                            v-model="formData.fraisMedicauxPremier"
                            :label="$t('inputassu.frais_medicaux_premier_examen')"
                            dense
                            outlined
                            max-file-size="3072000"
                            accept=".pdf,.jpg,.png"
                            style="max-width: 500px"
                            :rules="[required]"
                          >
                            <template v-slot:prepend>
                              <q-icon name="receipt" />
                            </template>
                            <template v-slot:label>
                              {{ $t('inputassu.frais_medicaux_premier_examen') }}
                              <span
                                class="q-px-sm bg-red text-white text-italic rounded-borders"
                                style="font-size: 10px"
                              >
                                {{ $t('input.requis') }}
                              </span>
                            </template>
                          </q-file>
                        </div>
                      </div>
                    </q-card-section>
                  </q-expansion-item>

                  <!-- Deuxième Examen -->
                  <q-expansion-item
                    icon="looks_two"
                    label="Deuxième examen prénatal au 8ème mois"
                    class="bg-grey-1 rounded-borders q-mt-md"
                  >
                    <q-card-section>
                      <div class="justify-center row q-mb-md">
                        <div class="col-12 col-sm-6">
                          <q-input
                            v-model="formData.dateDeuxiemeExamen"
                            :label="$t('inputassu.date_deuxieme_examen')"
                            dense
                            outlined
                            style="max-width: 300px"
                            :rules="[required]"
                            :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                            :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                          >
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer" color="primary">
                                <q-popup-proxy transition-show="scale" transition-hide="scale">
                                  <q-date
                                    v-model="formData.dateDeuxiemeExamen"
                                    :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                    :options="optionsDn"
                                    color="primary"
                                  />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                            <template v-slot:label>
                              {{ $t('inputassu.date_deuxieme_examen') }}
                              <span
                                class="q-px-sm bg-red text-white text-italic rounded-borders"
                                style="font-size: 10px"
                              >
                                {{ $t('input.requis') }}
                              </span>
                            </template>
                          </q-input>
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-input
                            v-model="formData.dateProbableAccouchement"
                            :label="$t('inputassu.date_probable_accouchement')"
                            dense
                            outlined
                            style="max-width: 350px"
                            :rules="[required]"
                            :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                            :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                          >
                            <template v-slot:prepend>
                              <q-icon name="child_care" />
                            </template>
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer" color="primary">
                                <q-popup-proxy transition-show="scale" transition-hide="scale">
                                  <q-date
                                    v-model="formData.dateProbableAccouchement"
                                    :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                    :options="optionsDn"
                                    color="primary"
                                  />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                            <template v-slot:label>
                              {{ $t('inputassu.date_probable_accouchement') }}
                              <span
                                class="q-px-sm bg-red text-white text-italic rounded-borders"
                                style="font-size: 10px"
                              >
                                {{ $t('input.requis') }}
                              </span>
                            </template>
                          </q-input>
                        </div>
                      </div>
                      <div class="justify-center row q-mb-md">
                        <div class="col-12 col-sm-4">
                          <q-checkbox
                          v-model="formData.allocations2"
                          :label="$t('inputassu.frais_allocation') + ' 2'"
                            :rules="[() => validateSecondExamCheckboxes() || t('errors.checkbox_required_second_exam')]"
                          />
                        </div>
                        <div class="col-12 col-sm-4">
                          <q-checkbox
                          v-model="formData.fraisMedicaux2"
                          :label="$t('inputassu.frais_medicaux') + ' 2'"
                            :rules="[() => validateSecondExamCheckboxes() || t('errors.checkbox_required_second_exam')]"
                          />
                        </div>
                      </div>
                      <div class="justify-center row q-gutter-y-md">
                        <div class="col-12 col-sm-6">
                          <q-file
                            v-model="formData.certificatDeuxieme"
                            :label="$t('inputassu.certificat_medical_huitieme_mois_grossesse')"
                            :hint="$t('inputassu.certificat_medical_huitieme_mois_grossesse')"
                            dense
                            outlined
                            accept=".pdf,.jpg,.png"
                            style="max-width: 500px"
                            max-file-size="3072000"
                            :rules="[required]"
                          >
                            <template v-slot:prepend>
                              <q-icon name="attach_file" />
                            </template>
                            <template v-slot:label>
                              {{ $t('inputassu.certificat_medical_huitieme_mois_grossesse') }}
                              <span
                                class="q-px-sm bg-red text-white text-italic rounded-borders"
                                style="font-size: 10px"
                              >
                                {{ $t('input.requis') }}
                              </span>
                            </template>
                          </q-file>
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-file
                            v-model="formData.fraisMedicauxDeuxieme"
                            :label="$t('inputassu.frais_medicaux_deuxieme_examen')"
                            dense
                            outlined
                            max-file-size="3072000"
                            accept=".pdf,.jpg,.png"
                            style="max-width: 500px"
                            :rules="[required]"
                          >
                            <template v-slot:prepend>
                              <q-icon name="receipt" />
                            </template>
                            <template v-slot:label>
                              {{ $t('inputassu.frais_medicaux_deuxieme_examen') }}
                              <span
                                class="q-px-sm bg-red text-white text-italic rounded-borders"
                                style="font-size: 10px"
                              >
                                {{ $t('input.requis') }}
                              </span>
                            </template>
                          </q-file>
                        </div>
                      </div>
                    </q-card-section>
                  </q-expansion-item>
                </div>
              </div>

              <!-- Remboursement des frais d'accouchement (id: 12) -->
              <div v-if="selectedPrestation.id === 12">
                <p class="text-primary text-weight-bold">
                  <span>{{ $t('inputassu.informations_accouchement') }}</span>
                </p>
                <div class="text-primary">
                  <div class="row q-gutter-md">
                    <q-input
                      v-model="accouchementForm.dateAccouchement"
                      :label="$t('inputassu.date_effective_accouchement')"
                      :hint="$t('inputassu.date_effective_accouchement')"
                      outlined
                      dense
                      :rules="[required]"
                      :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                      style="max-width: 350px"
                      class="col-12 col-sm-6"
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" color="primary">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-date
                              v-model="accouchementForm.dateAccouchement"
                              :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                              color="primary"
                            />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                      <template v-slot:label>
                            {{ $t('inputassu.date_effective_accouchement') }}
                        <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                          {{ $t('input.requis') }}
                        </span>
                      </template>
                    </q-input>
                    <q-input
                      v-model="accouchementForm.nombreEnfantsViables"
                      :label="$t('inputassu.nombre_enfants_viables')"
                      outlined
                      class="col-12 col-sm-6"
                      dense
                      type="number"
                      :rules="[required]"
                      style="max-width: 350px"
                    >
                      <template v-slot:label>
                        {{ $t('inputassu.nombre_enfants_viables') }}
                        <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                          {{ $t('input.requis') }}
                        </span>
                      </template>
                    </q-input>
                    <q-select
                      v-model="accouchementForm.nombreEnfantsSousControle"
                      :label="$t('inputassu.nombre_enfants_sous_controle_medical')"
                      :hint="$t('inputassu.nombre_enfants_sous_controle_medical')"
                      :options="numberOptions"
                      outlined
                      dense
                      class="col-12 col-sm-6"
                      style="max-width: 300px"
                      emit-value
                      map-options
                    >
                    </q-select>
                  </div>

                  <div class="row">
                    <q-checkbox
                      v-model="accouchementForm.fraisAccouchement"
                      :label="$t('inputassu.frais_accouchement')"
                      class="col-12 col-sm-3"
                    />
                    <q-checkbox
                      v-model="accouchementForm.fraisMedicaux"
                      :label="$t('inputassu.frais_medicaux')"
                      class="col-12 col-sm-3"
                    />
                    <q-file
                      v-model="accouchementForm.certificatMedical"
                      :label="$t('inputassu.certificat_medical_accouchement')"
                      outlined
                      dense
                      class="col-12 col-sm-6"
                      accept=".pdf,.jpg,.png"
                      max-file-size="3072000"
                      :rules="[required]"
                      style="max-width: 400px"
                    >
                      <template v-slot:prepend>
                        <q-icon name="attach_file" />
                      </template>
                      <template v-slot:label>
                        {{ $t('inputassu.certificat_medical_accouchement') }}
                        <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                          {{ $t('input.requis') }}
                        </span>
                      </template>
                    </q-file>
                  </div>
                  <div class="row">
                    <div v-for="i in parseInt(accouchementForm.nombreEnfantsSousControle || 0)" :key="i" class="q-pa-sm col-12 col-md-4">
                      <q-file
                        v-model="accouchementForm[`acteNaissanceEnfant${i}`]"
                        :label="`${$t('inputassu.acte_naissance_enfant')} ${i}`"
                        outlined
                        dense
                        accept=".pdf,.jpg,.png"
                        max-file-size="3072000"
                        :rules="[required]"
                        style="max-width: 400px"
                      >
                        <template v-slot:prepend>
                          <q-icon name="child_care" />
                        </template>
                        <template v-slot:label>
                          {{ $t('inputassu.acte_naissance_enfant') }} {{ i }}
                          <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                            {{ $t('input.requis') }}
                          </span>
                        </template>
                      </q-file>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Prise en charge congés de maternité (id: 13) -->
              <div v-if="selectedPrestation.id === 13">
                  <q-card class="q-mb-md">
                    <q-card-section>
                      <div class="text-h6 text-primary q-mb-md">
                        <q-icon name="baby_changing_station" class="q-mr-sm" />
                        Information sur l'accouchement
                      </div>
                        <!-- Section gauche -->
                        <div class="row q-gutter-md">
                          <q-input
                            v-model="formData.dateEffective"
                            :label="$t('inputassu.date_effective_accouchement')"
                            :hint=" $t('inputassu.date_effective_accouchement')"
                            outlined
                            dense
                            :rules="[required]"
                            :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                            style="max-width:450px"
                            class="col-12 col-md-4"
                         >
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer" color="primary">
                                <q-popup-proxy transition-show="scale" transition-hide="scale">
                                  <q-date
                                    v-model="formData.dateEffective"
                                    :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                    :options="optionsDn"
                                    color="primary"
                                  />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                            <template v-slot:label>
                              {{ $t('inputassu.date_effective_accouchement') }}
                              <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                                {{ $t('input.requis') }}
                              </span>
                            </template>
                            </q-input>
                            <q-input
                              v-model.number="formData.nombreEnfantsViables"
                              :label="$t('inputassu.nombre_enfants_viables')"
                              type="number"
                              outlined
                              dense
                              min="0"
                              max="10"
                              class="col-12 col-md-3"
                              style="max-width:250px"
                            />
                          <q-input
                            v-model.number="formData.nombreEnfantsSousControle"
                            :label="$t('inputassu.nombre_enfants_sous_controle_medical')"
                            type="number"
                            outlined
                            dense
                            :min="0"
                            :max="12"
                            :rules="[
                              val => val <= formData.nombreEnfantsViables || 'Ne doit pas dépasser le nombre d\'enfants viables'
                            ]"
                            @update:model-value="updateNaissanceFields"
                            class="col-12 col-md-3"
                             style="max-width:450px"
                          />
                       </div>
                       <div class="q-mt-md">Remboursement des frais relatifs</div>
                      <div class="row q-gutter-lg">
                        <q-checkbox
                          v-model="formData.fraisAccouchement"
                          :label="$t('inputassu.frais_accouchement')"
                          dense
                           class="col-12 col-md-3"
                        />
                        <q-checkbox
                          v-model="formData.fraisMedicaux"
                          :label="$t('inputassu.frais_medicaux')"
                          dense
                          class="col-12 col-md-3"
                        />
                          <q-file
                            v-model="formData.certificatMedical"
                            :label="$t('inputassu.certificat_medical_accouchement')"
                            outlined
                            dense
                            accept=".pdf,.jpg,.jpeg,.png"
                            max-file-size="5242880"
                            class="col-12 col-md-5"
                          >
                            <template v-slot:prepend>
                              <q-icon name="attach_file" />
                            </template>
                          </q-file>
                      </div>
                      <!-- Section droite -->
                      <div class="col-12 col-md-4">
                        <div class="text-subtitle2 q-mb-sm">Actes de naissance:</div>
                        <div v-for="i in nombreActesNaissance" :key="i" class="q-mb-sm">
                          <q-file
                            v-model="formData.actesNaissance[i]"
                            :label="`${$t('inputassu.acte_naissance_enfant')} ${i}`"
                            outlined
                            dense
                            accept=".pdf,.jpg,.jpeg,.png"
                            max-file-size="5242880"
                          >
                            <template v-slot:prepend>
                              <q-icon name="description" />
                            </template>
                          </q-file>
                        </div>
                      </div>
                      <!-- Case à cocher pour indemnités -->
                      <div class="q-mt-lg">
                        <q-checkbox
                          v-model="formData.showIndemnites"
                          :label="$t('inputassu.cocher_indemnites_journalieres')"
                          class="text-weight-medium"
                          color="primary"
                        />
                      </div>

                    </q-card-section>
                  </q-card>

                  <!-- Section Indemnité journalière (conditionnelle) -->
                   <q-slide-transition>
                    <q-card v-show="formData.showIndemnites" class="q-mb-lg">
                      <q-card-section>
                        <div class="text-h6 text-secondary q-mb-md">
                          <q-icon name="payments" class="q-mr-sm" />
                          Indemnité journalière
                        </div>
                        <div class="row q-gutter-md">
                          <!-- Première ligne -->
                          <div class="col-12 col-md-2">
                            <q-checkbox
                              v-model="formData.accouchementPremature"
                              :label="$t('inputassu.accouchement_premature')"
                              dense
                            />
                          </div>
                          <div class="col-12 col-md-3">
                            <q-input
                              v-model.number="formData.nombreJoursCouches"
                              :label="$t('inputassu.nombre_jours_couches_supplementaires')"
                              type="number"
                              outlined
                              dense
                              :min="0"
                              :max="40"
                              class="q-mb-md"
                            />
                          </div>
                          <div class="col-12 col-md-3">
                             <q-input
                              v-model="formData.debutConges"
                              :label="$t('inputassu.debut_conges_effectif')"
                              dense
                              outlined
                              style="max-width: 300px"
                              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                              :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
                              :rules="dateValidationRules"
                          >
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer" color="primary">
                                <q-popup-proxy transition-show="scale" transition-hide="scale">
                                  <q-date
                                    v-model="formData.debutConges"
                                    :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                    :options="optionsDn"
                                    color="primary"
                                  />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-input>
                          </div>
                          <!-- Deuxième ligne -->
                          <div class="col-12 col-md-3">
                            <q-input
                              v-model="formData.finConges"
                              :label="$t('inputassu.fin_conges_effectif')"
                              dense
                              outlined
                              style="max-width: 300px"
                              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                              :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
                          >
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer" color="primary">
                                <q-popup-proxy transition-show="scale" transition-hide="scale">
                                  <q-date
                                    v-model="formData.finConges"
                                    :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                    :options="optionsDn"
                                    color="primary"
                                  />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-input>
                          </div>
                          <div class="col-12 col-md-3">
                             <q-input
                              v-model="formData.dateRepriseActivite"
                              :label="$t('inputassu.date_effective_reprise_activite')"
                              dense
                              outlined
                              style="max-width: 300px"
                              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                              :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
                            >
                             <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer" color="primary">
                                <q-popup-proxy transition-show="scale" transition-hide="scale">
                                  <q-date
                                    v-model="formData.dateRepriseActivite"
                                    :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                    :options="optionsDn"
                                    color="primary"
                                  />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                             </q-input>
                          </div>
                          <div class="col-12 col-md-3">
                            <q-input
                              v-model="formData.debutPeriodeNonSalaire"
                              :label="$t('inputassu.debut_periode_non_salaire')"
                              dense
                              outlined
                              style="max-width: 300px"
                              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                              :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
                            >
                             <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer" color="primary">
                                <q-popup-proxy transition-show="scale" transition-hide="scale">
                                  <q-date
                                    v-model="formData.debutPeriodeNonSalaire"
                                    :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                    :options="optionsDn"
                                    color="primary"
                                  />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                             </q-input>
                          </div>
                          <div class="col-12 col-md-3">

                            <q-input
                              v-model="formData.finPeriodeNonSalaire"
                              :label="$t('inputassu.fin_periode_non_salaire')"
                              dense
                              outlined
                              style="max-width: 300px"
                              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                              :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
                            >
                             <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer" color="primary">
                                <q-popup-proxy transition-show="scale" transition-hide="scale">
                                  <q-date
                                    v-model="formData.dateRepriseActivite"
                                    :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                    :options="optionsDn"
                                    color="primary"
                                  />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                             </q-input>
                          </div>
                          <!-- Troisième ligne -->
                          <div class="col-12 col-md-4">
                            <q-file
                              v-model="formData.bulletinPaie"
                              :label="$t('inputassu.bulletin_paie_nul')"
                              outlined
                              dense
                              accept=".pdf,.jpg,.jpeg,.png"
                              max-file-size="5242880"
                              class="q-mb-md"
                            >
                              <template v-slot:prepend>
                                <q-icon name="receipt" />
                              </template>
                            </q-file>
                          </div>
                          <div class="col-12 col-md-4">
                            <q-file
                              v-model="formData.attestationCessation"
                              :label="$t('inputassu.attestation_cessation_paiement')"
                              :hint="$t('inputassu.attestation_cessation_paiement')"
                              outlined
                              dense
                              accept=".pdf,.jpg,.jpeg,.png"
                              max-file-size="5242880"
                              class="q-mb-md"
                            >
                              <template v-slot:prepend>
                                <q-icon name="verified" />
                              </template>
                            </q-file>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </q-slide-transition>

              </div>
              <!-- Prise en charge d'un ou plusieurs enfants non encore alignés (id: 14) -->
              <div v-if="selectedPrestation.id === 14">
                <p class="text-primary text-weight-bold">
                  <span>{{ $t('inputassu.informations_allocations_familiales') }}</span>
                </p>
                <div class="text-primary">
                  <!-- Informations Principales -->
                  <q-expansion-item
                    icon="info"
                    label="Informations Principales"
                    default-opened
                    class="bg-grey-1 rounded-borders q-mb-md"
                  >
                    <q-card-section>
                      <div class="row q-gutter-md">
                        <q-input
                          v-model="allocationsForm.dateSignatureDossier"
                          :label="$t('inputassu.date_signature_dossier_employeur')"
                          :hint="$t('inputassu.date_signature_dossier_employeur')"
                          outlined
                          dense
                          :rules="[required]"
                          :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                          style="max-width:450px"
                          class="col-12 col-sm-6"
                        >
                          <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer" color="primary">
                              <q-popup-proxy transition-show="scale" transition-hide="scale">
                                <q-date
                                  v-model="allocationsForm.dateSignatureDossier"
                                  :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                  :options="optionsDn"
                                  color="primary"
                                />
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                          <template v-slot:label>
                            {{ $t('inputassu.date_signature_dossier_employeur') }}
                            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                              {{ $t('input.requis') }}
                            </span>
                          </template>
                        </q-input>
                        <q-input
                          v-model="allocationsForm.dateEmbauche"
                          :label="$t('inputassu.date_embauche')"
                          outlined
                          dense
                          :rules="[required]"
                          :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                          :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                          style="max-width: 300px"
                          class="col-12 col-sm-3"
                        >
                          <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer" color="primary">
                              <q-popup-proxy transition-show="scale" transition-hide="scale">
                                <q-date
                                  v-model="allocationsForm.dateEmbauche"
                                  :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                  :options="optionsDn"
                                  color="primary"
                                />
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                          <template v-slot:label>
                            {{ $t('inputassu.date_embauche') }}
                            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                              {{ $t('input.requis') }}
                            </span>
                          </template>
                        </q-input>
                        <q-input
                          v-model="allocationsForm.heuresTravaillees"
                          :label="$t('inputassu.nombre_heures_travaillees_mois_embauche')"
                          :hint="$t('inputassu.nombre_heures_travaillees_mois_embauche')"
                          outlined
                          dense
                          min="0"
                          type="number"
                          style="max-width: 350px"
                          class="col-12 col-sm-4"
                        />
                      </div>
                      <div class="row q-gutter-md q-mt-md">
                        <q-select
                          v-model="allocationsForm.nombreEnfantsMoins6"
                          :label="$t('inputassu.nombre_nouveaux_enfants_moins_six_ans')"
                          :hint="$t('inputassu.nombre_nouveaux_enfants_moins_six_ans')"
                          :options="numberOptions"
                          outlined
                          dense
                          class="col-12 col-sm-4"
                          style="max-width: 350px"
                          emit-value
                          map-options
                          :rules="[() => validateEnfantsSelection() || $t('errors.at_least_one_child_required')]"
                        >
                          <template v-slot:label>
                            {{ $t('inputassu.nombre_nouveaux_enfants_moins_six_ans') }}
                            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                              {{ $t('input.requis') }}
                            </span>
                          </template>
                        </q-select>
                        <q-select
                          v-model="allocationsForm.nombreEnfantsPlus6"
                          :label="$t('inputassu.nombre_nouveaux_enfants_plus_six_ans')"
                          :hint="$t('inputassu.nombre_nouveaux_enfants_plus_six_ans')"
                          :options="numberOptions"
                          outlined
                          dense
                          class="col-12 col-sm-4"
                          style="max-width: 350px"
                          emit-value
                          map-options
                          :rules="[() => validateEnfantsSelection() || $t('errors.at_least_one_child_required')]"
                        >
                          <template v-slot:label>
                            {{ $t('inputassu.nombre_nouveaux_enfants_plus_six_ans') }}
                            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                              {{ $t('input.requis') }}
                            </span>
                          </template>
                        </q-select>
                        <q-select
                          v-model="allocationsForm.nombreEnfantsReconnus"
                          :label="$t('inputassu.nombre_nouveaux_enfants_reconnus')"
                          :hint="$t('inputassu.nombre_nouveaux_enfants_reconnus')"
                          :options="numberOptions"
                          outlined
                          dense
                          class="col-12 col-sm-4"
                          style="max-width: 350px"
                          emit-value
                          map-options
                          :rules="[() => validateEnfantsSelection() || $t('errors.at_least_one_child_required')]"
                        >
                          <template v-slot:label>
                            {{ $t('inputassu.nombre_nouveaux_enfants_reconnus') }}
                            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                              {{ $t('input.requis') }}
                            </span>
                          </template>
                        </q-select>
                      </div>
                      <!-- Documents pour enfants de moins de 6 ans -->
                      <div v-if="allocationsForm.nombreEnfantsMoins6 > 0" class="q-mt-md">
                        <div class="text-subtitle1 text-primary q-mb-sm">Documents pour enfants de moins de 6 ans</div>
                        <div>
                          <div v-for="i in parseInt(allocationsForm.nombreEnfantsMoins6 || 0)" :key="`moins6-${i}`" class="row q-gutter-md">
                            <q-file
                              v-model="allocationsForm[`certificatVieEnfantMoins6_${i}`]"
                              :label="$t(`inputassu.certificat_vie_enfant ${i}` )"
                              outlined
                              dense
                              accept=".pdf,.jpg,.png"
                              max-file-size="3072000"
                              :rules="[required]"
                              style="max-width: 350px"
                              class="col-12 col-md-4 q-pa-sm"
                            >
                              <template v-slot:prepend>
                                <q-icon name="attach_file" />
                              </template>
                              <template v-slot:label>
                                {{ $t("inputassu.certificat_vie_enfant") }} {{ i }}
                                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                                  {{ $t('input.requis') }}
                                </span>
                              </template>
                            </q-file>
                            <q-file
                              v-model="allocationsForm[`certificatScolariteEnfantMoins6_${i}`]"
                              :label="$t(`inputassu.certificat_scolarite_enfant ${i}` )"
                              outlined
                              dense
                              accept=".pdf,.jpg,.png"
                              max-file-size="3072000"
                              :rules="[required]"
                              style="max-width: 350px"
                              class="col-12 col-md-4 q-pa-sm"
                            >
                              <template v-slot:prepend>
                                <q-icon name="school" />
                              </template>
                              <template v-slot:label>
                                {{ $t("inputassu.certificat_scolarite_enfant") }} {{ i }}
                                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                                  {{ $t('input.requis') }}
                                </span>
                              </template>
                            </q-file>
                            <q-file
                              v-model="allocationsForm[`acteNaissanceEnfantMoins6_${i}`]"
                              :label="$t(`inputassu.acte_naissance_enfant ${i}` )"
                              outlined
                              dense
                              accept=".pdf,.jpg,.png"
                              max-file-size="3072000"
                              :rules="[required]"
                              style="max-width: 350px"
                              class="col-12 col-md-4 q-pa-sm"
                            >
                              <template v-slot:prepend>
                                <q-icon name="child_care" />
                              </template>
                              <template v-slot:label>
                                {{ $t("inputassu.acte_naissance_enfant") }} {{ i }}
                                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                                  {{ $t('input.requis') }}
                                </span>
                              </template>
                            </q-file>
                          </div>
                        </div>
                      </div>
                      <!-- Documents pour enfants de plus de 6 ans -->
                      <div v-if="allocationsForm.nombreEnfantsPlus6 > 0" class="q-mt-md">
                        <div class="text-subtitle1 text-primary q-mb-sm">Documents pour enfants de plus de 6 ans</div>
                        <div>
                          <div v-for="i in parseInt(allocationsForm.nombreEnfantsPlus6 || 0)" :key="`plus6-${i}`" class="row q-gutter-md">
                            <q-file
                              v-model="allocationsForm[`certificatScolariteEnfantPlus6_${i}`]"
                              :label="`inputassu.certificat_scolarite_enfant ${i}`"
                              outlined
                              dense
                              accept=".pdf,.jpg,.png"
                              max-file-size="3072000"
                              :rules="[required]"
                              style="max-width: 350px"
                              class="col-12 col-md-4 q-pa-sm"
                            >
                              <template v-slot:prepend>
                                <q-icon name="school" />
                              </template>
                              <template v-slot:label>
                                {{ $t('inputassu.certificat_scolarite_enfant') }} {{ i }}
                                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                                  {{ $t('input.requis') }}
                                </span>
                              </template>
                            </q-file>
                            <q-file
                              v-model="allocationsForm[`acteNaissanceEnfantPlus6_${i}`]"
                              :label="`inputassu.acte_naissance_enfant ${i}`"
                              outlined
                              dense
                              accept=".pdf,.jpg,.png"
                              max-file-size="3072000"
                              :rules="[required]"
                              style="max-width: 350px"
                              class="col-12 col-md-4 q-pa-sm"
                            >
                              <template v-slot:prepend>
                                <q-icon name="child_care" />
                              </template>
                              <template v-slot:label>
                                {{ $t('inputassu.acte_naissance_enfant') }} {{ i }}
                                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                                  {{ $t('input.requis') }}
                                </span>
                              </template>
                            </q-file>
                          </div>
                        </div>
                      </div>
                      <!-- Documents pour enfants reconnus -->
                      <div v-if="allocationsForm.nombreEnfantsReconnus > 0" class="q-mt-md">
                        <div class="text-subtitle1 text-primary q-mb-sm">Documents pour enfants reconnus</div>
                        <div class="row q-gutter-xs" style="width: 100%;">
                          <div v-for="i in parseInt(allocationsForm.nombreEnfantsReconnus || 0)" :key="`reconnus-${i}`" style="width: 32%;">
                            <q-file
                              v-model="allocationsForm[`declarationReconnaissance_${i}`]"
                              :label=" `inputassu.declaration_reconnaissance_enfant ${i}`"
                              :hint="$t('inputassu.declaration_reconnaissance_enfant')"
                              outlined
                              dense
                              accept=".pdf,.jpg,.png"
                              max-file-size="3072000"
                              :rules="[required]"
                              style="max-width: 350px"
                              class="col-12 col-md-4"
                            >
                              <template v-slot:prepend>
                                <q-icon name="gavel" />
                              </template>
                              <template v-slot:label>
                                {{  $t('inputassu.declaration_reconnaissance_enfant') }} {{ i }}
                                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                                  {{ $t('input.requis') }}
                                </span>
                              </template>
                            </q-file>
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-expansion-item>

                  <!-- Pièces Complémentaires -->
                  <q-expansion-item
                    icon="attach_file"
                    label="Pièces Complémentaires"
                    class="bg-grey-1 rounded-borders"
                  >
                    <q-card-section>
                      <div class="row q-gutter-md">
                        <q-file
                          v-model="allocationsForm.attestationNonPerceptionAF"
                          :label="$t('inputassu.attestation_non_perception_af')"
                          :hint="$t('inputassu.attestation_non_perception_af')"
                          outlined
                          dense
                          accept=".pdf,.jpg,.png"
                          max-file-size="3072000"
                          style="max-width: 350px"
                          class="col-12 col-sm-4"
                        >
                          <template v-slot:prepend>
                            <q-icon name="attach_file" />
                          </template>
                        </q-file>
                        <q-file
                          v-model="allocationsForm.acteMariageCertifie"
                          :label="$t('inputassu.acte_mariage_certifie')"
                          :hint="$t('inputassu.acte_mariage_certifie')"
                          outlined
                          dense
                          accept=".pdf,.jpg,.png"
                          max-file-size="3072000"
                          style="max-width: 350px"
                          class="col-12 col-sm-4"
                        >
                          <template v-slot:prepend>
                            <q-icon name="attach_file" />
                          </template>
                        </q-file>
                        <q-file
                          v-model="allocationsForm.originalActeMariage"
                          :label="$t('inputassu.original_acte_mariage')"
                          :hint="$t('inputassu.original_acte_mariage')"
                          outlined
                          dense
                          accept=".pdf,.jpg,.png"
                          max-file-size="3072000"
                          style="max-width: 350px"
                          class="col-12 col-sm-4"
                        >
                          <template v-slot:prepend>
                            <q-icon name="attach_file" />
                          </template>
                        </q-file>
                      </div>
                      <!-- Actes de naissance supplémentaires -->
                      <div class="q-mt-md">
                        <div class="text-subtitle1 text-primary q-mb-sm">Actes de naissance supplémentaires</div>
                        <div v-for="(row, rowIndex) in actesNaissanceSupplementairesRows" :key="`acte-row-${rowIndex}`" class="row q-gutter-md" style="width: 100%;">
                          <div v-for="idx in row" :key="`acte-${idx}`" class="col-12 col-md-4 q-pa-sm" style="width: 350px;">
                            <q-file
                              v-model="allocationsForm[`acteNaissanceSupplementaire_${idx}`]"
                              :label="`${$t('inputassu.acte_naissance_supplementaire')} ${idx}`"
                              outlined
                              dense
                              accept=".pdf,.jpg,.png"
                              max-file-size="3072000"
                              style="max-width: 350px"
                            >
                              <template v-slot:prepend>
                                <q-icon name="child_care" />
                              </template>
                            </q-file>
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-expansion-item>
                </div>
              </div>

              <!-- Vérification et Validation Pension (id: 21) -->
              <div v-if="selectedPrestation.id === 21">
                <q-card class="pension-form-card">
                  <q-card-section class="bg-primary text-white">
                    <div class="text-h6">
                      <q-icon name="verified" class="q-mr-sm" />
                      {{ $t('inputassu.verifie_pension') }}
                    </div>
                  </q-card-section>
                  <q-card-section>
                    <q-expansion-item
                      v-model="revenus.expanded"
                      icon="account_balance_wallet"
                      :label="$t('inputassu.etat_revenus')"
                      class="q-mb-md"
                      header-class="bg-blue-1 text-primary text-weight-bold text-uppercase"
                    >
                      <q-card>
                        <q-card-section>
                          <div class="row q-gutter-md q-mb-md">
                            <q-input
                              v-model="revenus.affiliation"
                              :label="$t('inputassu.date_affiliation')"
                              dense
                              outlined
                              readonly
                              :rules="[required]"
                              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                              :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
                              class="col-md-3 col-sm-6 col-xs-12"
                            >
                              <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer" color="primary">
                                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                                    <q-date
                                      v-model="revenus.affiliation"
                                      readonly
                                      :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                      :options="optionsDn"
                                      color="primary"
                                    />
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                              <template v-slot:label>
                                {{ $t('inputassu.date_affiliation') }}
                                <span
                                  class="q-px-sm bg-red text-white text-italic rounded-borders"
                                  style="font-size: 10px"
                                >
                                  {{ $t('input.requis') }}
                                </span>
                              </template>
                            </q-input>
                            <q-input
                              v-model="revenus.nbMois"
                              :label="$t('inputassu.nombre_mois_assurance')"
                              type="number"
                              outlined
                              readonly
                              dense
                              class="col-md-3 col-sm-6 col-xs-12"
                              style="max-width: 200px;"
                            />
                            <q-input
                              v-model="revenus.dernierMois"
                              :label="$t('inputassu.dernier_mois_declaration_cotisation')"
                              dense
                              outlined
                              readonly
                              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                              :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
                              class="col-md-3 col-sm-6 col-xs-12"
                            >
                              <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer" color="primary">
                                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                                    <q-date
                                      v-model="revenus.dernierMois"
                                      readonly
                                      :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                      :options="optionsDn"
                                      color="primary"
                                    />
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                            </q-input>
                            <q-select
                              v-model="revenus.typePrestation"
                              :options="typePrestationOptions"
                              :label="$t('inputassu.type_prestation')"
                              outlined
                              dense
                              readonly
                              class="col-md-3 col-sm-6 col-xs-12"
                            />
                          </div>
                          <div class="row">
                            <q-btn
                              @click="consulterRevenus"
                              :loading="revenus.loading"
                              color="primary"
                              icon="search"
                              :label="$t('inputassu.consulter')"
                              style="max-width: 200px;"
                              class="col-md-2 col-sm-6 col-xs-12"
                            />
                          </div>
                          <!-- Table des revenus -->
                          <q-table
                            v-if="revenus.data.length > 0"
                            :rows="revenus.data"
                            :columns="revenusColumns"
                            row-key="annee"
                            class="pension-table q-mb-md"
                            :pagination="{ rowsPerPage: 0 }"
                            hide-pagination
                          >
                            <template #top>
                            <div class="text-h6 text-primary">{{$t('inputassu.historique_revenus')}}</div>
                            </template>
                          </q-table>
                          <!-- Validation des revenus -->
                          <div class="q-mt-md" v-if="revenus.data.length > 0">
                            <div class="text-subtitle1 q-mb-sm">{{$t('inputassu.validation_etat_revenus')}}</div>
                            <q-option-group
                              v-model="revenus.validation"
                              :options="validationOptions"
                              color="primary"
                              inline
                            />
                            <q-input
                              v-if="revenus.validation === 'NON'"
                              v-model="revenus.explications"
                              :label="$t('inputassu.explications')"
                              type="textarea"
                              outlined
                              class="q-mt-sm"
                              rows="3"
                            />
                          </div>
                        </q-card-section>
                      </q-card>
                    </q-expansion-item>
                    <!-- Récapitulatif Période d'Activité -->
                    <q-expansion-item
                      v-model="activite.expanded"
                      icon="work_history"
                      :icon-color="activite.data.length > 0 ? 'primary' : 'grey'"
                      label="RÉCAPITULATIF PÉRIODE ACTIVITÉ"
                      class="q-mb-md"
                      header-class="bg-blue-1 text-primary text-weight-bold"
                    >
                      <q-card class="q-mt-sm">
                        <q-card-section>
                          <q-btn
                            @click="consulterActivite"
                            :loading="activite.loading"
                            color="primary"
                            icon="search"
                            :label="$t('inputassu.consulter')"
                            style="max-width: 200px;"
                            class="q-mb-md"
                          />
                          <!-- Table des activités -->
                          <q-table
                            v-if="activite.data.length > 0"
                            :rows="activite.data"
                            :columns="activiteColumns"
                            row-key="matricule"
                            class="pension-table q-mb-md"
                            :pagination="{ rowsPerPage: 0 }"
                            hide-pagination
                          >
                            <template #top>
                            <div class="text-h6 text-primary">{{$t('inputassu.periodes_activite')}}</div>
                            </template>
                          </q-table>
                          <!-- Validation des activités -->
                          <div class="q-mt-md" v-if="activite.data.length > 0">
                            <div class="text-subtitle1 q-mb-sm">{{$t('inputassu.validation_periode_activite')}}</div>
                            <q-option-group
                              v-model="activite.validation"
                              :options="validationOptions"
                              color="primary"
                              inline
                            />
                            <q-input
                              v-if="activite.validation === 'NON'"
                              v-model="activite.explications"
                              :label="$t('inputassu.explications')"
                              type="textarea"
                              outlined
                              class="q-mt-sm"
                              rows="3"
                            />
                          </div>
                        </q-card-section>
                      </q-card>
                    </q-expansion-item>
                    <!-- Section de validation finale -->
                    <q-card class="q-mt-md bg-grey-1">
                      <q-card-section>
                        <div class="text-subtitle1 q-mb-md">
                          {{$t('inputassu.documents_justificatifs')}}
                        </div>
                        <div class="row q-gutter-md items-center">
                          <q-file
                            v-model="fichierJoint"
                            :label="$t('inputassu.plusieurs_documents_pdf')"
                            outlined
                            accept=".pdf"
                            max-file-size="3072000"
                            class="col-md-8 col-sm-12"
                            @rejected="onRejected"
                          >
                            <template #prepend>
                              <q-icon name="attach_file" />
                            </template>
                          </q-file>
                        </div>
                      </q-card-section>
                    </q-card>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Déclaration d'Accident de Travail (id: 31) -->
              <div v-if="selectedPrestation.id === 31">
                <p class="text-primary text-weight-bold">
                  <span>{{ $t('Informations sur l\'Accident de Travail') }}</span>
                </p>
                <div class="text-primary">
                  <div class="row q-gutter-md">
                    <q-input
                      v-model="accidentForm.dateAccident"
                      :label="$t('Date accident')"
                      dense
                      outlined
                      style="max-width: 400px"
                      :rules="[required]"
                      :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                      :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" color="primary">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-date
                              v-model="accidentForm.dateAccident"
                              :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                              :options="optionsDn"
                              color="primary"
                            />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                      <template v-slot:label>
                        {{ $t('Date accident') }}
                        <span
                          class="q-px-sm bg-red text-white text-italic rounded-borders"
                          style="font-size: 10px"
                        >
                          {{ $t('input.requis') }}
                        </span>
                      </template>
                    </q-input>
                  </div>
                  <div class="row q-gutter-md">
                    <q-file
                      v-model="accidentForm.declarationAccident"
                      label="Déclaration d'Accident"
                      outlined
                      dense
                      accept=".pdf,.jpg,.png"
                      max-file-size="3072000"
                      :rules="[required]"
                      style="max-width: 350px"
                      class="col-12 col-sm-4"
                    >
                      <template v-slot:prepend>
                        <q-icon name="attach_file" />
                      </template>
                      <template v-slot:label>
                        Déclaration d'Accident
                        <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                          {{ $t('input.requis') }}
                        </span>
                      </template>
                    </q-file>
                    <q-file
                      v-model="accidentForm.copieCNI"
                      label="Copie Carte Nationale d'Identité"
                      outlined
                      dense
                      accept=".pdf,.jpg,.png"
                      max-file-size="3072000"
                      :rules="[required]"
                      style="max-width: 350px"
                      class="col-12 col-sm-4"
                    >
                      <template v-slot:prepend>
                        <q-icon name="badge" />
                      </template>
                      <template v-slot:label>
                        Copie Carte Nationale d'Identité
                        <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                          {{ $t('input.requis') }}
                        </span>
                      </template>
                    </q-file>
                    <q-file
                      v-model="accidentForm.procesVerbal"
                      label="Procès Verbal Constat Accident"
                      outlined
                      dense
                      accept=".pdf,.jpg,.png"
                      max-file-size="3072000"
                      style="max-width: 350px"
                      class="col-12 col-sm-4"
                    >
                      <template v-slot:prepend>
                        <q-icon name="gavel" />
                      </template>
                      <template v-slot:label>
                        Procès Verbal Constat Accident
                      </template>
                    </q-file>
                  </div>
                  <div class="row q-gutter-md q-mb-md">
                    <q-file
                      v-model="accidentForm.declarationTemoignage"
                      label="Déclaration de Témoignage"
                      outlined
                      dense
                      accept=".pdf,.jpg,.png"
                      max-file-size="3072000"
                      style="max-width: 350px"
                      class="col-12 col-sm-4"
                    >
                      <template v-slot:prepend>
                        <q-icon name="description" />
                      </template>
                    </q-file>
                    <q-file
                      v-model="accidentForm.demandeRemboursement"
                      label="Demande Remboursement Employeur"
                      hint="Demande Remboursement Employeur"
                      outlined
                      dense
                      accept=".pdf,.jpg,.png"
                      max-file-size="3072000"
                      style="max-width: 350px"
                      class="col-12 col-sm-4"
                    >
                      <template v-slot:prepend>
                        <q-icon name="receipt" />
                      </template>
                    </q-file>
                    <q-file
                      v-model="accidentForm.certificatMedicalInitial"
                      label="Certificat Médical Initial"
                      outlined
                      dense
                      accept=".pdf,.jpg,.png"
                      max-file-size="3072000"
                      :rules="[required]"
                      style="max-width: 350px"
                      class="col-12 col-sm-4"
                    >
                      <template v-slot:prepend>
                        <q-icon name="medical_services" />
                      </template>
                      <template v-slot:label>
                        Certificat Médical Initial
                        <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                          {{ $t('input.requis') }}
                        </span>
                      </template>
                    </q-file>
                  </div>
                  <div class="row q-gutter-md q-mb-md">
                    <q-file
                      v-model="accidentForm.certificatMedicalFinal"
                      label="Certificat Médical Final"
                      outlined
                      dense
                      accept=".pdf,.jpg,.png"
                      max-file-size="3072000"
                      style="max-width: 400px"
                      class="col-12 col-sm-4"
                    >
                      <template v-slot:prepend>
                        <q-icon name="medical_services" />
                      </template>
                      <template v-slot:label>
                        Certificat Médical Final
                      </template>
                    </q-file>
                  </div>
                  <div class="row q-gutter-md q-mb-md">
                    <q-select
                      v-model="accidentForm.nombreFacturesOrdonnances"
                      label="Nombre Factures et Ordonnances"
                      :options="numberOptions"
                      outlined
                      dense
                      class="col-12 col-sm-3"
                      :rules="[required]"
                      style="max-width: 300px"
                      emit-value
                      map-options
                    >
                      <template v-slot:label>
                        Nombre Factures et Ordonnances
                        <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                          {{ $t('input.requis') }}
                        </span>
                      </template>
                    </q-select>
                    <q-select
                      v-model="accidentForm.nombreJoursArret"
                      label="Nombre Jours Arrêt de Travail"
                      :options="numberOptions"
                      outlined
                      dense
                      class="col-12 col-sm-3"
                      :rules="[required]"
                      style="max-width: 250px"
                      emit-value
                      map-options
                    >
                      <template v-slot:label>
                        Nombre Jours Arrêt de Travail
                        <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                          {{ $t('input.requis') }}
                        </span>
                      </template>
                    </q-select>
                    <q-select
                      v-model="accidentForm.nombreCertificatsProlongation"
                      label="Nombre Certificats Médicaux Prolongation"
                      :options="numberOptions"
                      outlined
                      dense
                      class="col-12 col-sm-3"
                      style="max-width: 300px"
                      emit-value
                      map-options
                    />
                    <q-select
                      v-model="accidentForm.nombreBulletinsSalaire"
                      label="Nombre Bulletins de Salaire"
                      :options="numberOptions"
                      outlined
                      dense
                      class="col-12 col-sm-3"
                      style="max-width: 250px"
                      emit-value
                      map-options
                    />
                  </div>
                  <!-- Factures et Ordonnances -->
                  <div v-if="accidentForm.nombreFacturesOrdonnances > 0" class="q-mt-md">
                    <div class="text-subtitle1 text-primary q-mb-sm">Factures et Ordonnances</div>
                    <div class="row q-gutter-md" style="width: 100%;">
                      <div v-for="i in parseInt(accidentForm.nombreFacturesOrdonnances || 0)" :key="`facture-${i}`" style="width: 30%;">
                        <q-file
                          v-model="accidentForm[`factureOrdonnance_${i}`]"
                          :label="`Facture ou Ordonnance ${i}`"
                          outlined
                          dense
                          accept=".pdf,.jpg,.png"
                          max-file-size="3072000"
                          :rules="[required]"
                          style="max-width: 350px"
                          class="col-12 col-md-4 q-pa-sm"
                        >
                          <template v-slot:prepend>
                            <q-icon name="receipt" />
                          </template>
                          <template v-slot:label>
                            Facture ou Ordonnance {{ i }}
                            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                              {{ $t('input.requis') }}
                            </span>
                          </template>
                        </q-file>
                      </div>
                    </div>
                  </div>
                  <!-- Certificats Médicaux de Prolongation -->
                  <div v-if="accidentForm.nombreCertificatsProlongation > 0" class="q-mt-md">
                    <div class="text-subtitle1 text-primary q-mb-sm">Certificats Médicaux de Prolongation</div>
                    <div class="row q-gutter-md" style="width: 100%;">
                      <div v-for="i in parseInt(accidentForm.nombreCertificatsProlongation || 0)" :key="`prolongation-${i}`" style="width: 30%;">
                        <q-file
                          v-model="accidentForm[`certificatProlongation_${i}`]"
                          :label="`Certificat Médical Prolongation ${i}`"
                          outlined
                          dense
                          accept=".pdf,.jpg,.png"
                          max-file-size="3072000"
                          :rules="[required]"
                          style="max-width: 350px"
                          class="col-12 col-md-4 q-pa-sm"
                        >
                          <template v-slot:prepend>
                            <q-icon name="medical_services" />
                          </template>
                          <template v-slot:label>
                            Certificat Médical Prolongation {{ i }}
                            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                              {{ $t('input.requis') }}
                            </span>
                          </template>
                        </q-file>
                      </div>
                    </div>
                  </div>
                  <!-- Bulletins de Salaire -->
                  <div v-if="accidentForm.nombreBulletinsSalaire > 0" class="q-mt-md">
                    <div class="text-subtitle1 text-primary q-mb-sm">Bulletins de Salaire</div>
                    <div class="row q-gutter-md" style="width: 100%;">
                      <div v-for="i in parseInt(accidentForm.nombreBulletinsSalaire || 0)" :key="`bulletin-${i}`" style="width: 30%;">
                        <q-file
                          v-model="accidentForm[`bulletinSalaire_${i}`]"
                          :label="`Bulletin de Salaire ${i}`"
                          outlined
                          dense
                          accept=".pdf,.jpg,.png"
                          max-file-size="3072000"
                          :rules="[required]"
                          style="max-width: 350px"
                          class="col-12 col-md-4 q-pa-sm"
                        >
                          <template v-slot:prepend>
                            <q-icon name="payment" />
                          </template>
                          <template v-slot:label>
                            Bulletin de Salaire {{ i }}
                            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                              {{ $t('input.requis') }}
                            </span>
                          </template>
                        </q-file>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Centre CNPS -->  <!-- Champs communs -->
            <div class="q-ma-md row justify-end">
              <q-select
                v-model="formData.CODE_CENTRECNPSC"
                :label="$t('inputassu.centreCNPS')"
                :hint="$t('inputassu.centreCNPS')"
                :options="centres"
                option-label="LIB_CENTRE"
                outlined
                dense
                :style="$q.screen.gt.sm ? 'width: 500px' : 'width: 100%'"
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
            <q-separator class="q-my-xs" />
            <!-- Section Type de Soumission -->
            <div class="section-header">
              <q-icon name="send" class="q-mr-sm text-primary" />
              <span class="text-h6 text-primary">Type de Soumission</span>
            </div>
            <q-option-group
              v-model="formData.typeSubmission"
              :options="submissionOptions"
              color="primary"
              inline
              class="q-mb-md"
            />
            <!-- Actions -->
            <div class="row justify-center q-gutter-md">
              <q-btn
                type="submit"
                :label="formData.typeSubmission === 'temporaire' ? 'Sauvegarde' : 'Soumission'"
                :color="formData.typeSubmission === 'temporaire' ? 'orange' : 'primary'"
                :icon="formData.typeSubmission === 'temporaire' ? 'save' : 'send'"
                size="lg"
                class="q-px-xs"
                :loading="loading"

              />
              <q-btn
                label="Annuler"
                color="grey"
                icon="cancel"
                size="lg"
                class="q-px-xl"
                @click="resetForm,selectedPrestation =''"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>

    <!-- Liste des prestations d'un type sélectionné -->
    <div v-else-if="selectedType" class="prestations-list">
      <div class="flex items-center justify-between q-mb-md">
        <div class="section-header">
          <div class="text-h5 flex items-center text-primary">
            <q-icon :name="selectedType.icon" color="primary" class="q-mr-sm" />
            {{ selectedType.title }}
          </div>
          <div class="text-body1 text-grey-7 q-mt-xs">
            {{ selectedType.description }}
          </div>
        </div>
        <!-- Champ de recherche à droite -->
        <div class="search-container-right">
          <q-input
            v-model="searchQuery"
            placeholder="Rechercher..."
            filled
            dense
            class="search-input"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>
      </div>
      <div class="row justify-center">
        <div
          v-for="prestation in filteredPrestations"
          :key="prestation.id"
          class="q-pa-sm col-sm-12 col-md-3 col-lg-3"
        >
          <q-card
            class="prestation-card enhanced-card cursor-pointer"
            @click="selectPrestation(prestation)"
          >
            <q-card-section class="flex items-start q-pa-md">
              <div class="prestation-icon q-mr-md">
                <q-icon :name="prestation.icon" size="2.5rem" color="primary" />
              </div>
              <div class="flex-5">
                <div class="text-h6 q-mb-xs text-weight-bold text-primary">{{ prestation.title }}</div>
                <div class="text-body2 text-grey-7 line-height-relaxed">{{ prestation.description }}</div>
              </div>
            </q-card-section>
            <q-card-actions align="right" class="q-pa-lg q-pt-none">
              <q-btn
                flat
                color="primary"
                label="Démarrer"
                class="text-weight-medium"
                icon-right="arrow_forward"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Grille des types de données -->
    <div v-else class="types-grid">
      <div class="text-center q-mb-xl">
        <div class="text-h5 q-mb-md text-primary text-weight-bold">
          Types de Préstations
        </div>
        <!-- Champ de recherche centré sous le titre -->
        <div class="search-container q-mt-md justify-end">
          <q-input
            v-model="searchQuery"
            :placeholder="$t('Rechercher un type de prestation...')"
            filled
            dense
            class="search-input-center"
            clearable
            style="width: 400px;"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>
        <div class="text-body1 text-grey-7 q-mb-md">
          Sélectionnez votre type de prestation
        </div>
      </div>
      <div class="row q-gutter-md" style="width: 100%;">
        <span
          v-for="type in filteredTypes"
          :key="type.id"
          class="col-12 col-sm-12 col-md-4 col-lg-4"
          style="width: 30%;"
        >
          <q-card
            class="type-card enhanced-card cursor-pointer"
            @click="selectType(type)"
          >
            <q-card-section class="text-center q-pa-xl">
              <div class="type-icon q-mb-md">
                <q-icon :name="type.icon" size="3rem" color="primary" />
              </div>
              <div class="text-h6 text-primary text-weight-bold">{{ type.title }}</div>
              <div class="text-body2 text-grey-7 q-mt-sm line-height-relaxed">
                {{ type.description }}
              </div>
            </q-card-section>
          </q-card>
        </span>
      </div>
    </div>
  </div>
</template>
```
<script setup>
import { ref, computed, reactive, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { centres as rawCentres } from '../../data/Centres.js';
import { useNotify } from '../../components/useNotify.js';

// Declarations
const $q = useQuasar();
const { t, locale } = useI18n();
const { notifyError, notifySuccess } = useNotify();

// Reactive states
const searchQuery = ref('');
const selectedType = ref(null);
const selectedPrestation = ref(null);
const isSubmitting = ref(false);
const loading = ref(false);
const prestationForm = ref(null);
const centres = ref([...rawCentres]);
const fichierJoint = ref(null);

// Form data
const formData = reactive({
  mat_employeur: '',
  raisonsociale: '',
  mat_interne: '',
  EMAIL_PERS: 'nkoloceleste@gmail.com',
  TEL_PERS: '659295629',
  Adresse: 'Yaoundé',
  nom: '',
  numeroAssure: '',
  telephone: '',
  email: '',
  specific: {},
  files: null,
  typeSubmission: 'definitive',
  datePremierExamen: '',
  allocations1: false,
  fraisMedicaux1: false,
  certificatPremier: null,
  fraisMedicauxPremier: null,
  dateDeuxiemeExamen: '',
  dateProbableAccouchement: '',
  allocations2: false,
  fraisMedicaux2: false,
  certificatDeuxieme: null,
  fraisMedicauxDeuxieme: null,
  dateEffective: '',
  fraisAccouchement: false,
  fraisMedicaux: false,
  nombreEnfantsViables: null,
  nombreEnfantsSousControle: null,
  certificatMedical: null,
  actesNaissance: [],
  showIndemnites: true,
  accouchementPremature: false,
  nombreJoursCouches: 0,
  debutConges: '',
  finConges: '',
  dateRepriseActivite: '',
  debutPeriodeNonSalaire: '',
  finPeriodeNonSalaire: '',
  bulletinPaie: null,
  attestationCessation: null,
});

const dynamicForm = reactive({});

const accouchementForm = reactive({
  dateAccouchement: '',
  nombreEnfantsViables: 0,
  fraisAccouchement: false,
  fraisMedicaux: false,
  certificatMedical: null,
  nombreEnfantsSousControle: null,
  acteNaissanceEnfant1: null,
  acteNaissanceEnfant2: null,
  acteNaissanceEnfant3: null,
  acteNaissanceEnfant4: null,
  acteNaissanceEnfant5: null,
});

const allocationsForm = reactive({
  dateSignatureDossier: '',
  dateEmbauche: '',
  heuresTravaillees: '',
  nombreEnfantsMoins6: 0,
  nombreEnfantsPlus6: 0,
  nombreEnfantsReconnus: 0,
  attestationNonPerceptionAF: null,
  acteMariageCertifie: null,
  originalActeMariage: null,
});

const accidentForm = reactive({
  dateAccident: '',
  declarationAccident: null,
  copieCNI: null,
  procesVerbal: null,
  declarationTemoignage: null,
  demandeRemboursement: null,
  certificatMedicalInitial: null,
  certificatMedicalFinal: null,
  nombreFacturesOrdonnances: 0,
  nombreJoursArret: 0,
  nombreCertificatsProlongation: 0,
  nombreBulletinsSalaire: 0,
});

const revenus = reactive({
  expanded: false,
  loading: false,
  nbMois: '29',
  dernierMois: '2025-04-30',
  affiliation: '2020-11-10',
  typePrestation: 'AVA',
  validation: null,
  explications: '',
  data: [],
});

const activite = reactive({
  expanded: false,
  loading: false,
  validation: null,
  explications: '',
  data: [],
});

// Computed properties
const totalActesNaissance = computed(() => {
  return (
    parseInt(allocationsForm.nombreEnfantsMoins6 || 0) +
    parseInt(allocationsForm.nombreEnfantsPlus6 || 0) +
    parseInt(allocationsForm.nombreEnfantsReconnus || 0)
  );
});

const actesNaissanceSupplementairesRows = computed(() => {
  const total = totalActesNaissance.value;
  const rows = [];
  for (let i = 0; i < Math.ceil(total / 3); i++) {
    const row = [];
    for (let j = 1; j <= 3; j++) {
      const idx = i * 3 + j;
      if (idx <= total) {
        row.push(idx);
      }
    }
    rows.push(row);
  }
  return rows;
});

const nombreActesNaissance = computed(() => {
  return Math.max(0, formData.nombreEnfantsSousControle || 0);
});

const filteredTypes = computed(() => {
  if (!searchQuery.value) return prestationTypes.value;

  return prestationTypes.value.filter(
    (type) =>
      type.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      type.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      type.prestations.some(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
  );
});

const filteredPrestations = computed(() => {
  if (!selectedType.value) return [];

  if (!searchQuery.value) return selectedType.value.prestations;

  return selectedType.value.prestations.filter(
    (prestation) =>
      prestation.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      prestation.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Options
const numberOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
  { label: '11', value: 11 },
  { label: '12', value: 12 },
  { label: '13', value: 13 },
];

const submissionOptions = ref([
  { label: t('inputassu.soumission_definitive'), value: 'definitive', icon: 'send' },
  { label: t('inputassu.sauvegarde_temporaire'), value: 'temporaire', icon: 'save' },
]);

const typePrestationOptions = [
  { label: 'AVA - Allocation Vieillesse Anticipée', value: 'AVA' },
  { label: 'PVN - Pension de Vieillesse Normale', value: 'PVN' },
  { label: 'PIN - Pension d\'Invalidité', value: 'PIN' },
];

const validationOptions = [
  { label: 'OUI', value: 'OUI' },
  { label: 'NON', value: 'NON' },
];

const prestationTypes = ref([
  {
    id: 1,
    title: 'Prestations Familiales',
    description: 'Remboursements et prises en charge liés à la famille',
    icon: 'family_restroom',
    color: 'pink',
    prestations: [
      {
        id: 11,
        title: "Remboursement des frais d'examens prénataux",
        description: 'Remboursement des frais d\'examens prénataux par la CNPS',
        icon: 'pregnant_woman',
        requiresFiles: true,
        fields: [
          { name: 'dateExamen', label: 'Date de l\'examen', type: 'date', required: true },
          { name: 'montant', label: 'Montant des frais', type: 'text', required: true },
          { name: 'etablissement', label: 'Établissement médical', type: 'text', required: true },
        ],
      },
      {
        id: 12,
        title: "Remboursement des frais d'accouchement",
        description: "Remboursement des frais d'accouchement par la CNPS",
        icon: 'child_care',
        requiresFiles: true,
        fields: [
          { name: 'dateAccouchement', label: "Date d'accouchement", type: 'date', required: true },
          { name: 'typeAccouchement', label: "Type d'accouchement", type: 'select', required: true, options: ['Normal', 'Césarienne'] },
          { name: 'hopital', label: 'Hôpital', type: 'text', required: true },
        ],
      },
      {
        id: 13,
        title: 'Prise en charge congés de maternité',
        description: 'Prise en charge de vos congés de maternité par la CNPS',
        icon: 'baby_changing_station',
        requiresFiles: true,
        fields: [
          { name: 'dateDebutConge', label: 'Date début congé', type: 'date', required: true },
          { name: 'dateFinConge', label: 'Date fin congé', type: 'date', required: true },
          { name: 'employeur', label: 'Employeur', type: 'text', required: true },
        ],
      },
      {
        id: 14,
        title: 'Allocations familiales',
        description: "Prise en charge d'un ou plusieurs enfants non encore alignés",
        icon: 'group',
        requiresFiles: true,
        fields: [
          { name: 'nombreEnfants', label: "Nombre d'enfants", type: 'text', required: true },
          { name: 'ageEnfants', label: 'Âges des enfants (sé935parés par des virgules)', type: 'text', required: true },
          { name: 'situationFamiliale', label: 'Situation familiale', type: 'select', required: true, options: ['Marié(e)', 'Célibataire', 'Divorcé(e)', 'Veuf/Veuve'] },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Vérification et Validation Pension',
    description: 'Vérification et validation des éléments de la pension',
    icon: 'verified',
    color: 'green',
    prestations: [
      {
        id: 21,
        title: "Vérification d'éléments de pension",
        description: 'Joindre des pièces justificatives en cas de contestation',
        icon: 'gavel',
        requiresFiles: true,
        fields: [
          { name: 'numeroPension', label: 'Numéro de pension', type: 'text', required: true },
          { name: 'motifContestation', label: 'Motif de contestation', type: 'text', required: true },
          { name: 'dateContestation', label: 'Date de contestation', type: 'date', required: true },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Prise en charge',
    description: 'Dépot des dossiers de prise en charge des accidents de travail et des maladies professionnelles',
    icon: 'more_horiz',
    color: 'blue',
    prestations: [
      {
        id: 31,
        title: "Dossier d'accident de travail",
        description: "Prise en charge d'un accident de travail",
        icon: 'help',
        requiresFiles: false,
        fields: [
          { name: 'sujet', label: 'Sujet de la demande', type: 'text', required: true },
          { name: 'description', label: 'Description détaillée', type: 'text', required: true },
        ],
      },
    ],
  },
]);

const employeurs = ref([
  {
    numeroEmployeur: '123-1234567-123-A',
    raisonsociale: 'Orange Cameroun',
    NOM_COMMERCIAL: 'Orange Cameroon',
    ADRESSE_EMPLOYEUR: 'Yaoundé, Cameroun',
    DATE_EMB_PREM_TRAV: '25/10/1998',
    EFFECTIF_APPROX: 500,
  },
]);

const revenusColumns = [
  {
    name: 'annee',
    label: 'Année',
    field: 'annee',
    align: 'center',
    headerStyle: 'background-color: var(--q-primary); color: white; font-weight: bold;',
  },
  {
    name: 'debutActivite',
    label: 'Début Activité',
    field: 'debutActivite',
    align: 'center',
    headerStyle: 'background-color: var(--q-primary); color: white; font-weight: bold;',
  },
  {
    name: 'finActivite',
    label: 'Fin Activité',
    field: 'finActivite',
    align: 'center',
    headerStyle: 'background-color: var(--q-primary); color: white; font-weight: bold;',
  },
  {
    name: 'nbMoisAssurance',
    label: 'Nombre Mois Assurance',
    field: 'nbMoisAssurance',
    align: 'center',
    headerStyle: 'background-color: var(--q-primary); color: white; font-weight: bold;',
  },
  {
    name: 'raisonSociale',
    label: 'Raison Sociale Contrat financier',
    field: 'raisonSociale',
    align: 'left',
    headerStyle: 'background-color: var(--q-primary); color: white; font-weight: bold;',
  },
  {
    name: 'salaireAnnuelle',
    label: 'Salaire Annuelle',
    field: 'salaireAnnuelle',
    align: 'right',
    format: (val) => `${val.toLocaleString()} FCFA`,
    headerStyle: 'background-color: var(--q-primary); color: white; font-weight: bold;',
  },
];

const activiteColumns = [
  {
    name: 'matricule',
    label: 'Matricule employeur Affiliation volontaire',
    field: 'matricule',
    align: 'left',
    headerStyle: 'background-color: var(--q-primary); color: white; font-weight: bold;',
  },
  {
    name: 'denomination',
    label: 'Dénomination sociale Contrat financier',
    field: 'denomination',
    align: 'left',
    headerStyle: 'background-color: var(--q-primary); color: white; font-weight: bold;',
  },
  {
    name: 'dateEmbauche',
    label: 'Date embauche Début Contrat',
    field: 'dateEmbauche',
    align: 'center',
    headerStyle: 'background-color: var(--q-primary); color: white; font-weight: bold;',
  },
  {
    name: 'dateCessation',
    label: 'Date cessation Fin Contrat',
    field: 'dateCessation',
    align: 'center',
    headerStyle: 'background-color: var(--q-primary); color: white; font-weight: bold;',
  },
];

const simulatedRevenusData = [
  {
    annee: 2020,
    debutActivite: 'novembre 2020',
    finActivite: 'décembre 2020',
    nbMoisAssurance: 2,
    raisonSociale: 'CAISSE NATIONALE DE PREVOYANCE SOCIALE',
    salaireAnnuelle: 667437,
  },
  {
    annee: 2021,
    debutActivite: 'janvier 2021',
    finActivite: 'mai 2021',
    nbMoisAssurance: 5,
    raisonSociale: 'CAISSE NATIONALE DE PREVOYANCE SOCIALE',
    salaireAnnuelle: 1648962,
  },
  {
    annee: 2023,
    debutActivite: 'novembre 2023',
    finActivite: 'décembre 2023',
    nbMoisAssurance: 2,
    raisonSociale: 'INTERNATIONALE INGENIERIE ET DE SERVICES (KENGNE BONIFACE H...)',
    salaireAnnuelle: 120000,
  },
  {
    annee: 2024,
    debutActivite: 'janvier 2024',
    finActivite: 'décembre 2024',
    nbMoisAssurance: 12,
    raisonSociale: 'INTERNATIONALE INGENIERIE ET DE SERVICES (KENGNE BONIFACE H...)',
    salaireAnnuelle: 720000,
  },
  {
    annee: 2025,
    debutActivite: 'janvier 2025',
    finActivite: 'mars 2025',
    nbMoisAssurance: 4,
    raisonSociale: 'INTERNATIONALE INGENIERIE ET DE SERVICES (KENGNE BONIFACE H...)',
    salaireAnnuelle: 180000,
  },
  {
    annee: 2025,
    debutActivite: 'avril 2025',
    finActivite: 'avril 2025',
    nbMoisAssurance: 4,
    raisonSociale: 'CAMEROON TELECOMMUNICATIONS',
    salaireAnnuelle: 711938,
  },
];

const simulatedActiviteData = [
  {
    matricule: 'Employeur 010-1291201-F',
    denomination: 'CAISSE NATIONALE DE PREVOYANCE SOCIALE',
    dateEmbauche: '10/11/2020',
    dateCessation: '',
  },
  {
    matricule: 'Employeur 326-0111785-000-A',
    denomination: 'INTERNATIONALE INGENIERIE ET DE SERVICES (KENGNE BO...',
    dateEmbauche: '01/10/2023',
    dateCessation: '',
  },
  {
    matricule: 'Employeur 010-1138701-H',
    denomination: 'CAMEROON TELECOMMUNICATIONS',
    dateEmbauche: '01/05/2025',
    dateCessation: '',
  },
];
// Validation rules
const dateValidationRules = [
  (val) => {
    if (!val) return true;
    if (formData.debutConges && formData.finConges) {
      return (
        new Date(formData.debutConges) <= new Date(formData.finConges) ||
        'La date de début doit être antérieure à la date de fin'
      );
    }
    return true;
  },
];

// Functions
const optionsDn = (date) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = ('0' + (today.getMonth() + 1)).slice(-2);
  const dd = ('0' + today.getDate()).slice(-2);
  const todayStr = `${yyyy}/${mm}/${dd}`;
  return date <= todayStr;
};

const filterCentreCNPS = (val, update) => {
  update(() => {
    centres.value = rawCentres.filter((centre) =>
      centre.LIB_CENTRE.toLowerCase().includes(val.toLowerCase())
    );
  });
};

const selectType = (type) => {
  selectedType.value = type;
  searchQuery.value = '';
};

const selectPrestation = (prestation) => {
  selectedPrestation.value = prestation;
  Object.keys(dynamicForm).forEach((key) => delete dynamicForm[key]);
  if (prestation.fields) {
    prestation.fields.forEach((field) => {
      dynamicForm[field.name] = '';
    });
  }

  // Initialisation spécifique pour la prestation 13 (congés de maternité)
  if (prestation.id === 13) {
    formData.showIndemnites = true;
    formData.accouchementPremature = false;
    formData.nombreJoursCouches = 0;
    formData.debutConges = '';
    formData.finConges = '';
    formData.dateRepriseActivite = '';
    formData.debutPeriodeNonSalaire = '';
    formData.finPeriodeNonSalaire = '';
    formData.bulletinPaie = null;
    formData.attestationCessation = null;
    formData.nombreEnfantsViables = null;
    formData.nombreEnfantsSousControle = null;
    formData.certificatMedical = null;
    formData.actesNaissance = [null];
  }

  if (prestation.id !== 12) {
    accouchementForm.dateAccouchement = '';
    accouchementForm.nombreEnfantsViables = null;
    accouchementForm.nombreEnfantsSousControle = null;
    accouchementForm.fraisAccouchement = false;
    accouchementForm.fraisMedicaux = false;
    accouchementForm.certificatMedical = null;
    for (let i = 1; i <= 5; i++) {
      accouchementForm[`acteNaissanceEnfant${i}`] = null;
    }
  }
};

const goHome = () => {
  selectedType.value = null;
  selectedPrestation.value = null;
  searchQuery.value = '';
};

const fetchEmployerExamen = async () => {
  const matricule = formData.mat_employeur;
  if (!matricule || matricule.trim() === '') {
    notifyError('Veuillez saisir un matricule employeur');
    return;
  }
  if (!validateMatriculeCNPS(matricule)) {
    notifyError(t('errors.invalid_cnps_format'));
    return;
  }
  const employer = employeurs.value.find((e) => e.numeroEmployeur === matricule);
  if (employer) {
    formData.raisonsociale = employer.raisonsociale;
    formData.NOM_COMMERCIAL = employer.NOM_COMMERCIAL;
    formData.ADRESSE_EMPLOYEUR = employer.ADRESSE_EMPLOYEUR;
    formData.DATE_EMB_PREM_TRAV = employer.DATE_EMB_PREM_TRAV;
    formData.EFFECTIF_APPROX = employer.EFFECTIF_APPROX;
    notifySuccess('Employeur trouvé avec succès');
  } else {
    notifyError('Employeur non trouvé');
  }
};

const required = (val) => !!val || t('input.requis');

const validateEmail = (val) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(val) || 'Email invalide';
};

const validateMatriculeCNPS = (val) => {
  const regex = /^(?:\d{3}-\d{7}-\d{3}-[A-Z]|\d{3}-\d{7}-[A-Z])$/;
  return regex.test(val) || t('errors.invalid_cnps_format');
};

const validateFirstExamCheckboxes = () => {
  return formData.allocations1 || formData.fraisMedicaux1;
};

const validateSecondExamCheckboxes = () => {
  return formData.allocations2 || formData.fraisMedicaux2;
};

const validateAccouchement = () => {
  const errors = [];
  if (!accouchementForm.fraisAccouchement && !accouchementForm.fraisMedicaux) {
    errors.push("Vous devez sélectionner au moins une option (Frais Accouchement ou Frais médicaux).");
  } else {
    if (!accouchementForm.certificatMedical) {
      errors.push("Le certificat médical d'accouchement est requis.");
    }
    for (let i = 1; i <= parseInt(accouchementForm.nombreEnfantsSousControle || 0); i++) {
      if (!accouchementForm[`acteNaissanceEnfant${i}`]) {
        errors.push(`L'acte de naissance de l'enfant ${i} est requis.`);
      }
    }
  }
  return errors;
};

const validateAllocations = () => {
  const errors = [];
  if (
    parseInt(allocationsForm.nombreEnfantsMoins6 || 0) === 0 &&
    parseInt(allocationsForm.nombreEnfantsPlus6 || 0) === 0 &&
    parseInt(allocationsForm.nombreEnfantsReconnus || 0) === 0
  ) {
    errors.push("Vous devez sélectionner au moins un type d'enfant (moins de 6 ans, plus de 6 ans, ou reconnu).");
  }
  return errors;
};

const validateEnfantsSelection = () => {
  return (
    allocationsForm.nombreEnfantsMoins6 > 0 ||
    allocationsForm.nombreEnfantsPlus6 > 0 ||
    allocationsForm.nombreEnfantsReconnus > 0 ||
    t('Au moins un enfant est requis')
  );
};

const submitForm = async () => {
  loading.value = true;
  isSubmitting.value = true;
  try {
    // Validations spécifiques
    if (selectedPrestation.value?.id === 11) {
      if (!validateFirstExamCheckboxes()) {
        notifyError(t('errors.checkbox_required_first_exam'));
        throw new Error('checkbox_required_first_exam');
      }
      if (!validateSecondExamCheckboxes()) {
        notifyError(t('errors.checkbox_required_second_exam'));
        throw new Error('checkbox_required_second_exam');
      }
    }
    if (selectedPrestation.value?.id === 12) {
      const accouchementErrors = validateAccouchement();
      if (accouchementErrors.length > 0) {
        accouchementErrors.forEach((error) => notifyError(error));
        throw new Error('accouchement_invalid');
      }
    }
    if (selectedPrestation.value?.id === 14) {
      const allocationsErrors = validateAllocations();
      if (allocationsErrors.length > 0) {
        allocationsErrors.forEach((error) => notifyError(error));
        throw new Error('allocations_invalid');
      }
    }
    const isValid = await prestationForm.value.validate();
    if (!isValid) {
      notifyError(t('errors.required'));
      throw new Error('form_invalid');
    }
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const message =
      formData.typeSubmission === 'temporaire'
        ? t('form.temporarySubmissionDescription')
        : t('form.definitiveSubmissionDescription');
    notifySuccess(message);
    //resetForm();
    // Fermer le formulaire après soumission

    selectedPrestation.value = null;
     formData.value = null;
  } catch (error) {
    if (error && error.message && [
      'checkbox_required_first_exam',
      'checkbox_required_second_exam',
      'accouchement_invalid',
      'allocations_invalid',
      'form_invalid'
    ].includes(error.message)) {
      // Validation error already notified, just stop
    } else {
      console.error(error);
      notifyError(t('form.submit_error'));
    }
    // Fermer le formulaire même en cas d'erreur de soumission
    //selectedPrestation.value = null;
  } finally {
    loading.value = false;
    isSubmitting.value = false;
  }
};

const resetForm = () => {

  selectedPrestation.value = null
  Object.keys(formData).forEach((key) => {
    if (key === 'specific') {
      formData[key] = {};
    } else if (key === 'files') {
      formData[key] = null;
    } else if (key === 'showIndemnites') {
      formData[key] = true; // Garder la valeur booléenne
    } else if (key === 'allocations1' || key === 'allocations2' || key === 'fraisMedicaux1' || key === 'fraisMedicaux2' || key === 'fraisAccouchement' || key === 'fraisMedicaux' || key === 'accouchementPremature') {
      formData[key] = false; // Réinitialiser les booléens à false
    } else if (key === 'nombreEnfantsViables' || key === 'nombreEnfantsSousControle' || key === 'nombreJoursCouches') {
      formData[key] = key === 'nombreEnfantsViables' || key === 'nombreEnfantsSousControle' ? 1 : 0; // Réinitialiser les nombres
    } else {
      formData[key] = '';
    }
  });

  Object.keys(dynamicForm).forEach((key) => delete dynamicForm[key]);

  accouchementForm.dateAccouchement = '';
  accouchementForm.nombreEnfantsViables = null;
  accouchementForm.nombreEnfantsSousControle = null;
  accouchementForm.fraisAccouchement = false;
  accouchementForm.fraisMedicaux = false;
  accouchementForm.certificatMedical = null;
  for (let i = 1; i <= 5; i++) {
    accouchementForm[`acteNaissanceEnfant${i}`] = null;
  }

  formData.typeSubmission = 'definitive';
  selectedPrestation.value = null;

  if (prestationForm.value) {
    prestationForm.value.resetValidation();
  }
  revenus.data = [];
  revenus.validation = null;
  revenus.explications = '';
  revenus.expanded = false;

  activite.data = [];
  activite.validation = null;
  activite.explications = '';
  activite.expanded = false;

  fichierJoint.value = null;


};

const consulterRevenus = async () => {
  revenus.loading = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    revenus.data = [...simulatedRevenusData];
    $q.notify({
      type: 'positive',
      message: 'Données des revenus chargées avec succès',
      position: 'top',
    });
  } catch (error) {
    console.log(error)
    $q.notify({

      type: 'negative',
      message: 'Erreur lors du chargement des revenus',
      position: 'top',
    });
  } finally {
    revenus.loading = false;
  }
};

const consulterActivite = async () => {
  activite.loading = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    activite.data = [...simulatedActiviteData];
    $q.notify({
      type: 'positive',
      message: 'Données des activités chargées avec succès',
      position: 'top',
    });
  } catch (error) {
    console.log(error)
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des activités',
      position: 'top',
    });
  } finally {
    activite.loading = false;
  }
};

const onRejected = (rejectedEntries) => {
  $q.notify({
    type: 'negative',
    message: `Fichier rejeté: ${rejectedEntries[0].failedPropValidation}`,
    position: 'top',
  });
};

const updateNaissanceFields = (newValue) => {
  const count = Math.max(1, newValue || 1);
  if (formData.actesNaissance.length < count) {
    while (formData.actesNaissance.length < count) {
      formData.actesNaissance.push(null);
    }
  } else if (formData.actesNaissance.length > count) {
    formData.actesNaissance = formData.actesNaissance.slice(0, count);
  }
};

// Watchers
watch(
  () => formData.nombreEnfantsSousControle,
  (newValue) => {
    updateNaissanceFields(newValue);
  },
  { immediate: true }
);
</script>
<style scoped>
.prestations-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Champs de recherche */
.search-container-right {
  flex-shrink: 0;
}

.search-container-center {
  display: flex;
  justify-content: center;
}

.search-input,
.search-input-center {
  max-width: 300px;
  min-width: 250px;
}

.search-input .q-field__control,
.search-input-center .q-field__control {
  border-radius: 25px;
}

/* Cards améliorées */
.enhanced-card {
  border-radius: 16px;
  border: 2px solid transparent;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95));
}

.enhanced-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border-color: var(--q-primary);
  background: rgba(255, 255, 255, 1);
}

/* Type cards */
.type-card {
  height: 100%;
  min-height: 280px;
}

.type-card:hover {
  transform: translateY(-12px) scale(1.02);
}

.type-icon {
  animation: float 4s ease-in-out infinite;
}

.type-card:hover .type-icon {
  transform: scale(1.1);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* Prestation cards */
.prestation-card {
  height: 100%;
  min-height: 200px;
  border-left: 5px solid transparent;
}

.prestation-card:hover {
  transform: translateX(12px) translateY(-8px);
  border-left-color: var(--q-primary);
}

.prestation-icon {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.2));
  border-radius: 50%;
  padding: 16px;
  min-width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.2);
}

.prestation-card:hover .prestation-icon {
  transform: scale(1.1) rotate(5deg);
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.2), rgba(25, 118, 210, 0.3));
}

/* Form card */
.form-card {
  animation: slideInUp 0.6s ease-out;
  min-height: 400px;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Sections */
.prestations-list,
.types-grid {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Typography improvements */
.line-height-relaxed {
  line-height: 1.6;
}

/* Responsive adjustments */
@media (max-width: 1023px) {
  .search-container-right {
    margin-top: 16px;
    align-self: flex-end;
  }

  .flex.items-center.justify-between {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .enhanced-card:hover,
  .type-card:hover,
  .prestation-card:hover {
    transform: none;
  }

  .search-input,
  .search-input-center {
    min-width: 200px;
  }

  .prestations-container {
    padding: 8px;
  }
}

/* Button improvements */
.q-btn {
  border-radius: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.q-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Input field improvements */
.q-field--filled .q-field__control {
  border-radius: 12px;
}
 .pension-form-card {
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
}

.pension-table {
  border-radius: 8px;
  overflow: hidden;
}

.pension-table .q-table__top {
  background-color: #f5f5f5;
  border-bottom: 2px solid var(--q-primary);
}

.q-expansion-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.q-card {
  border-radius: 12px;
}

.q-btn {
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.q-input, .q-select, .q-file {
  border-radius: 8px;
}

/* Animation pour les tableaux */
.pension-table tbody tr {
  transition: background-color 0.2s ease;
}

.pension-table tbody tr:hover {
  background-color: #f8f9fa;
}

/* Style pour les headers de tableau */
:deep(.q-table thead th) {
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pension-form-card {
    margin: 0 10px;
  }

  .row.q-gutter-md {
    margin: -8px;
  }

  .row.q-gutter-md > * {
    margin: 8px;
  }
}
  .q-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.text-h6 {
  font-weight: 600;
}

.text-subtitle2 {
  font-weight: 500;
  color: #555;
}

/* Animation pour l'apparition de la section indemnités */
.q-slide-transition {
  overflow: hidden;
}

/* Style pour les boutons */
.q-btn {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
}

/* Style responsive */
@media (max-width: 768px) {
  .row.q-gutter-md > div {
    margin-bottom: 1rem;
  }
}
</style>

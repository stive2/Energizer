<template>
  <q-dialog v-model="open" persistent full-width>
    <q-card
      :style="$q.screen.gt.sm ? 'width: 960px; max-width: 98vw' : 'width: 100%'"
      class="immat-main-card"
    >
      <!-- ═══ EN-TÊTE ═══ -->
      <q-card-section class="immat-header row items-center no-wrap q-pa-md">
        <q-icon name="assignment_ind" size="32px" class="q-mr-md text-white" />
        <div class="col">
          <div class="text-h6 text-white text-weight-bold">{{ $t(service.name) }}</div>
          <div class="text-caption text-blue-2">
            {{ $t('immat.subtitle', 'Immatriculation en ligne — Régime Obligatoire') }}
          </div>
        </div>
        <q-chip
          :label="form.regimeAffiC || 'Obligatoire'"
          color="white"
          text-color="primary"
          dense
          icon="verified_user"
          class="q-ml-sm"
        />
        <q-btn flat round dense icon="close" color="white" class="q-ml-sm" @click="closeDialog" />
      </q-card-section>

      <!-- ═══ CHAMPS CACHÉS LEGACY ═══ -->
      <div class="immat-legacy-hidden" aria-hidden="true" style="display: none">
        <input type="hidden" name="regime" :value="form.regime" />
        <input type="hidden" name="regimeAffi" :value="form.regimeAffi" />
        <input type="hidden" name="date_effet" :value="form.date_effet" />
        <input type="hidden" name="taux" :value="form.taux" />
        <input type="hidden" name="min_date_effet" :value="form.min_date_effet" />
        <input type="hidden" name="smig_annuel" :value="form.smig_annuel" />
        <input type="hidden" name="max_cotisation_annuel" :value="form.max_cotisation_annuel" />
        <input type="hidden" name="code_tele" :value="form.code_tele" />
        <input type="hidden" name="code_secret" :value="form.code_secret" />
        <input type="hidden" name="minDateAffi" :value="form.minDateAffi" />
        <input type="hidden" name="Dest" :value="form.Dest" />
        <input type="hidden" name="LIEU_NAISS_PERS" :value="form.LIEU_NAISS_PERS" />
        <input type="hidden" name="CODE_PAYS_NAISS" :value="form.CODE_PAYS_NAISS" />
        <input type="hidden" name="CIVILITE_PERS" :value="form.CIVILITE_PERS" />
        <input type="hidden" name="NATIONALITE" :value="form.NATIONALITE" />
        <input type="hidden" name="NUM_TYPEPIECE" :value="form.NUM_TYPEPIECE" />
        <input type="hidden" name="LIEU_PIECE" :value="form.LIEU_PIECE" />
        <input type="hidden" name="CODE_VILLE" :value="form.CODE_VILLE" />
        <input type="hidden" name="CODE_CENTRECNPS" :value="form.CODE_CENTRECNPS" />
        <input type="hidden" name="LIEU_NAISS_PERE" :value="form.LIEU_NAISS_PERE" />
        <input type="hidden" name="CODE_PAYS_NAISSP" :value="form.CODE_PAYS_NAISSP" />
        <input type="hidden" name="LIEU_NAISS_MERE" :value="form.LIEU_NAISS_MERE" />
        <input type="hidden" name="CODE_PAYS_NAISSM" :value="form.CODE_PAYS_NAISSM" />
        <input type="hidden" name="laction" :value="form.laction" />
        <input type="hidden" name="valider" :value="form.valider" />
      </div>

      <q-scroll-area style="height: 700px">
        <!-- ═══ FORMULAIRE STEPPER ═══ -->
        <q-card-section class="q-pa-sm">
          <q-form ref="formRef" @submit.prevent="submitForm">
            <q-stepper
              v-model="step"
              :vertical="!$q.screen.gt.sm"
              color="primary"
              done-color="positive"
              error-color="negative"
              header-nav
              animated
              flat
              class="immat-stepper"
            >
              <!-- ══════════════════════════════════════════════
                  ÉTAPE 1 : Informations emploi du travailleur
              ══════════════════════════════════════════════ -->
              <q-step
                :name="1"
                :title="$t('immat.step1')"
                icon="work"
                :done="step > 1"
                :error="stepErrors[1]"
                :disable="!isStepAllowed(1)"
              >
                <!-- Sous-section : Employeur -->
                <div class="step-section-header">
                  <q-icon name="business" class="q-mr-xs" />
                  {{ $t('immat.section.employer', "Identification de l'employeur") }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <!-- Matricule CNPS Employeur -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.mat_employeur"
                      name="mat_employeur"
                      :label="$t('inputassu.employer_cnps_registration_number')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required, validateMatriculeCNPS]"
                      :hint="$t('inputassu.employer_cnps_registration_number')"
                      @keyup.enter="fetchEmployerData"
                      @keydown.enter.prevent="fetchEmployerData"
                      @update:model-value="(val) => (form.mat_employeur = val.toUpperCase())"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.employer_cnps_registration_number')
                          }}<span class="req-badge">*</span></span
                        ></template
                      >
                      <template v-slot:append>
                        <q-btn
                          flat
                          round
                          dense
                          icon="search"
                          color="primary"
                          @click="fetchEmployerData"
                          size="sm"
                        >
                          <q-tooltip>{{ $t('form.search') }}</q-tooltip>
                        </q-btn>
                      </template>
                    </q-input>
                  </div>
                  <!-- Date 1er embauche travailleur -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.DATE_EMB_PREM_TRAV"
                      name="DATE_EMB_PREM_TRAV"
                      :label="$t('inputassu.first_employee_hiring_date')"
                      outlined
                      dense
                      readonly
                      class="full-width"
                      :rules="[required]"
                      :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                      :hint="$t('inputassu.first_employee_hiring_date')"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.first_employee_hiring_date')
                          }}<span class="req-badge">*</span></span
                        ></template
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
                  </div>
                  <!-- Nom Commercial -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.NOM_COMMERCIAL"
                      name="NOM_COMMERCIAL"
                      :label="$t('inputassu.trade_name')"
                      outlined
                      dense
                      readonly
                      class="full-width"
                    />
                  </div>
                  <!-- Localisation Entreprise -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.ADRESSE_EMPLOYEUR"
                      name="ADRESSE_EMPLOYEUR"
                      :label="$t('inputassu.company_location')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.ADRESSE_EMPLOYEUR = val.toUpperCase())"
                    />
                  </div>
                  <!-- Raison Sociale -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.RAISON_SOCIALE"
                      name="RAISON_SOCIALE"
                      :label="$t('inputassu.legal_name')"
                      outlined
                      dense
                      readonly
                      class="full-width"
                      :rules="[required]"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.legal_name') }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-input>
                  </div>
                  <!-- SMIG -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.SMIG_VALUE"
                      name="SMIG_VALUE"
                      :label="$t('inputassu.minimum_wage')"
                      :hint="$t('inputassu.minimum_wage')"
                      outlined
                      dense
                      type="number"
                      min="0"
                      readonly
                      class="full-width"
                    />
                  </div>
                </div>

                <!-- Sous-section : Poste du travailleur -->
                <div class="step-section-header">
                  <q-icon name="badge" class="q-mr-xs" />
                  {{ $t('immat.section.position', 'Poste & Rémunération') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <!-- Date embauche chez cet employeur -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.DATE_EMB_PRE_SALL"
                      name="DATE_EMB_PRE_SALL"
                      :label="$t('inputassu.hiring_date')"
                      outlined
                      dense
                      readonly
                      class="full-width"
                      :rules="[required]"
                      :error="stepErrors[1] && !form.DATE_EMB_PRE_SALL"
                      :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                      :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.hiring_date') }}<span class="req-badge">*</span></span
                        ></template
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
                    </q-input>
                  </div>
                  <!-- Catégorie -->
                  <div class="col-12 col-sm-3">
                    <q-select
                      v-model="form.CODE_categ"
                      name="CODE_categ"
                      :label="$t('inputassu.category')"
                      :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]"
                      outlined
                      dense
                      class="full-width"
                    />
                  </div>
                  <!-- Échelon -->
                  <div class="col-12 col-sm-3">
                    <q-select
                      v-model="form.CODE_echelon"
                      name="CODE_echelon"
                      :label="$t('inputassu.level')"
                      :options="['A', 'B', 'C', 'D', 'E', 'F', 'G']"
                      outlined
                      dense
                      class="full-width"
                    />
                  </div>
                  <!-- Spécialité -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.Specialite"
                      name="Specialite"
                      :label="$t('inputassu.specialty')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.Specialite = val.toUpperCase())"
                    />
                  </div>
                  <!-- Niveau d'études -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.NiveauAss"
                      name="NiveauAss"
                      :label="$t('inputassu.education_level')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.NiveauAss = val.toUpperCase())"
                    />
                  </div>
                  <!-- Effectif approximatif -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.EFFECTIF_APPROX"
                      name="EFFECTIF_APPROX"
                      :label="$t('inputassu.approximate_workforce')"
                      outlined
                      dense
                      type="number"
                      min="0"
                      class="full-width"
                    />
                  </div>
                  <!-- Revenu actuel -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.ActuelRevenu"
                      name="ActuelRevenu"
                      :label="$t('inputassu.current_income')"
                      outlined
                      dense
                      type="number"
                      min="0"
                      class="full-width"
                    />
                  </div>
                </div>

                <!-- Sous-section : Document principal -->
                <div class="step-section-header">
                  <q-icon name="attach_file" class="q-mr-xs" />
                  {{ $t('immat.section.main_doc', 'Document principal') }}
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-file
                      v-model="form.avisEmbauche"
                      name="110"
                      :label="$t('inputassu.hiring_notice')"
                      outlined
                      dense
                      class="full-width"
                      :counter-label="counterLabelFn"
                      max-files="1"
                      accept=".gif,.jpg,.jpeg,.png,image/gif,image/jpeg,image/png,.pdf"
                      max-file-size="3072000"
                      :rules="[required]"
                      :error="stepErrors[1] && !form.avisEmbauche"
                      @update:model-value="onFileSelected('avisEmbauche')"
                      @rejected="onRejected"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.hiring_notice') }}<span class="req-badge">*</span></span
                        ></template
                      >
                      <template v-slot:prepend
                        ><q-icon name="upload_file" color="primary"
                      /></template>
                    </q-file>
                  </div>
                </div>

                <q-stepper-navigation class="q-mt-md">
                  <q-btn
                    @click="goToNextStep(2)"
                    color="primary"
                    :label="$t('form.next')"
                    icon-right="arrow_forward"
                    unelevated
                  />
                </q-stepper-navigation>
              </q-step>

              <!-- ══════════════════════════════════════════════
                  ÉTAPE 2 : Informations personnelles
              ══════════════════════════════════════════════ -->
              <q-step
                :name="2"
                :title="$t('immat.step2')"
                icon="person"
                :done="step > 2 || step < 2"
                :error="stepErrors[2]"
                :disable="!isStepAllowed(2)"
              >
                <!-- Sous-section : Identité -->
                <div class="step-section-header">
                  <q-icon name="perm_identity" class="q-mr-xs" />
                  {{ $t('immat.section.identity', "Identité de l'assuré") }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <!-- Date demande (readonly) -->
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="form.DATE_DEMANDE"
                      name="DATE_DEMANDE"
                      :label="$t('inputassu.request_date')"
                      outlined
                      dense
                      readonly
                      class="full-width"
                    />
                  </div>
                  <!-- Régime (readonly) -->
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="form.regimeAffiC"
                      name="regimeAffiC"
                      :label="$t('inputassu.affiliation_regime')"
                      outlined
                      dense
                      readonly
                      class="full-width"
                    />
                  </div>
                  <!-- Sexe -->
                  <div class="col-12 col-sm-4">
                    <q-select
                      v-model="form.SEXE_PERS"
                      name="SEXE_PERS"
                      :label="$t('inputassu.gender')"
                      :options="sexeOptions"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.gender') }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-select>
                  </div>
                  <!-- Nom -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.NOM_PERS"
                      name="NOM_PERS"
                      :label="$t('inputassu.last_name')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      @update:model-value="(val) => (form.NOM_PERS = val.toUpperCase())"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.last_name') }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-input>
                  </div>
                  <!-- Prénom -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.PRENOM_PERS"
                      name="PRENOM_PERS"
                      :label="$t('inputassu.first_name')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.PRENOM_PERS = val.toUpperCase())"
                    />
                  </div>
                  <!-- Date de naissance -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.DATE_NAISS_PERS"
                      name="DATE_NAISS_PERS"
                      :label="$t('inputassu.date_of_birth')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      :error="stepErrors[2] && !form.DATE_NAISS_PERS"
                      :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                      :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.date_of_birth') }}<span class="req-badge">*</span></span
                        ></template
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
                    </q-input>
                  </div>
                  <!-- Lieu de naissance (localité) -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.LOCALITE_NAISS"
                      name="LOCALITE_NAISS"
                      :label="$t('inputassu.place_of_birth')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.LOCALITE_NAISS = val.toUpperCase())"
                    />
                  </div>
                  <!-- Arrondissement de naissance -->
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.LieuNaiss"
                      name="LieuNaiss"
                      :label="$t('inputassu.birth_district')"
                      :options="arrondissements"
                      option-label="NOM_ARROND"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      @filter="filterArrondissement"
                      :rules="[required]"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.birth_district')
                          }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-select>
                  </div>
                  <!-- Situation matrimoniale -->
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.civilite"
                      name="civilite"
                      :label="$t('inputassu.marital_status')"
                      :options="matrimonialList"
                      option-label="LIBELLE_MATRI"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      :rules="[required]"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.marital_status')
                          }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-select>
                  </div>
                  <!-- Nationalité -->
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.NATIONALITEC"
                      name="NATIONALITEC"
                      :label="$t('inputassu.nationality')"
                      :options="pays"
                      option-label="nationalite"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      @filter="filterPays"
                      :rules="[required]"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.nationality') }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-select>
                  </div>
                </div>

                <!-- Sous-section : Pièce d'identité -->
                <div class="step-section-header">
                  <q-icon name="credit_card" class="q-mr-xs" />
                  {{ $t('immat.section.id_doc', "Pièce d'identité") }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <!-- Type de pièce -->
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.typepiece"
                      name="typepiece"
                      :label="$t('inputassu.identity_document_type')"
                      :options="pieces"
                      option-label="LIBELLE"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      @filter="filterPieces"
                      :rules="[required]"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.identity_document_type')
                          }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-select>
                  </div>
                  <!-- Numéro de pièce -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.NUM_PIECE"
                      name="NUM_PIECE"
                      :label="$t('inputassu.identity_document_number')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      @update:model-value="(val) => (form.NUM_PIECE = val.toUpperCase())"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.identity_document_number')
                          }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-input>
                  </div>
                  <!-- Date de délivrance -->
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.DATE_PIECE"
                      name="DATE_PIECE"
                      :label="$t('inputassu.issued_on')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      :error="stepErrors[2] && !form.DATE_PIECE"
                      :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                      :hint="$t('inputassu.issued_on')"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.issued_on') }}<span class="req-badge">*</span></span
                        ></template
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
                    </q-input>
                  </div>
                  <!-- Lieu de délivrance -->
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.LIEU_PIECEC"
                      name="LIEU_PIECEC"
                      :label="$t('inputassu.place_issuance_identity_document')"
                      :options="arrondissements"
                      option-label="NOM_ARROND"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      :hint="$t('inputassu.place_issuance_identity_document')"
                      @filter="filterArrondissement"
                      :rules="[required]"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.place_issuance_identity_document')
                          }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-select>
                  </div>
                  <!-- Upload pièce d'identité -->
                  <div class="col-12 col-sm-6" v-if="form.NUM_TYPEPIECE || form.typepiece">
                    <q-file
                      v-model="form.pieceIdentite"
                      :name="form.NUM_TYPEPIECE || 'pieceIdentite'"
                      :label="form.typepiece?.LIBELLE || $t('inputassu.identity_document_type')"
                      outlined
                      dense
                      class="full-width"
                      max-files="1"
                      accept=".gif,.jpg,.jpeg,.png,image/gif,image/jpeg,image/png,.pdf,.docx"
                      max-file-size="3072000"
                      :rules="[required]"
                      @rejected="onRejected"
                    >
                      <template v-slot:prepend
                        ><q-icon name="upload_file" color="primary"
                      /></template>
                    </q-file>
                  </div>
                  <!-- Déclaration sur l'honneur -->
                  <div
                    class="col-12 col-sm-6"
                    v-if="form.NUM_TYPEPIECE && form.NUM_TYPEPIECE !== '99'"
                  >
                    <q-file
                      v-model="form.declarationHonneur"
                      name="153"
                      :label="$t('inputassu.declaration_on_honor')"
                      outlined
                      dense
                      class="full-width"
                      max-files="1"
                      accept=".gif,.jpg,.jpeg,.png,image/gif,image/jpeg,image/png,.pdf,.docx"
                      max-file-size="3072000"
                      :rules="[required]"
                      @rejected="onRejected"
                    >
                      <template v-slot:prepend
                        ><q-icon name="upload_file" color="primary"
                      /></template>
                    </q-file>
                  </div>
                </div>

                <q-stepper-navigation class="q-mt-md">
                  <q-btn
                    @click="goToNextStep(3)"
                    color="primary"
                    :label="$t('form.next')"
                    icon-right="arrow_forward"
                    unelevated
                  />
                  <q-btn
                    flat
                    @click="step = 1"
                    color="primary"
                    :label="$t('form.previous')"
                    icon="arrow_back"
                    class="q-ml-sm"
                  />
                </q-stepper-navigation>
              </q-step>

              <!-- ══════════════════════════════════════════════
                  ÉTAPE 3 : Informations sur le père
              ══════════════════════════════════════════════ -->
              <q-step
                :name="3"
                :title="$t('immat.step3')"
                icon="man"
                :done="step > 3 || step < 3"
                :error="stepErrors[3]"
                :disable="!isStepAllowed(3)"
              >
                <div class="step-section-header step-section-header--blue">
                  <q-icon name="man" class="q-mr-xs" />
                  {{ $t('immat.step3') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.NOM_PERE"
                      :label="$t('inputassu.last_name')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.NOM_PERE = val.toUpperCase())"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.PRENOM_PERE"
                      :label="$t('inputassu.first_name')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.PRENOM_PERE = val.toUpperCase())"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.DATE_NAISS_PERSP"
                      :label="$t('inputassu.date_of_birth')"
                      outlined
                      dense
                      class="full-width"
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
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.LOCALITE_NAISS_PERE"
                      :label="$t('inputassu.place_of_birth')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.LOCALITE_NAISS_PERE = val.toUpperCase())"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.LieuNaissPere"
                      :label="$t('inputassu.birth_district')"
                      :hint="$t('inputassu.birth_district')"
                      :options="arrondissements"
                      option-label="NOM_ARROND"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      @filter="filterArrondissement"
                    />
                  </div>
                  <div class="col-12 col-sm-3">
                    <q-select
                      v-model="form.etatP"
                      name="etatP"
                      :label="$t('inputassu.alive')"
                      :options="etatVieOptions"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
                      outlined
                      dense
                      class="full-width"
                    />
                  </div>
                  <div class="col-12 col-sm-3" v-if="form.etatP === 'Décédé'">
                    <q-input
                      v-model="form.DATE_DECES_PERSP"
                      name="DATE_DECES_PERSP"
                      :label="$t('inputassu.date_death')"
                      outlined
                      dense
                      class="full-width"
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
                </div>

                <q-stepper-navigation class="q-mt-md">
                  <q-btn
                    @click="goToNextStep(4)"
                    color="primary"
                    :label="$t('form.next')"
                    icon-right="arrow_forward"
                    unelevated
                  />
                  <q-btn
                    flat
                    @click="step = 2"
                    color="primary"
                    :label="$t('form.previous')"
                    icon="arrow_back"
                    class="q-ml-sm"
                  />
                </q-stepper-navigation>
              </q-step>

              <!-- ══════════════════════════════════════════════
                  ÉTAPE 4 : Informations sur la mère
              ══════════════════════════════════════════════ -->
              <q-step
                :name="4"
                :title="$t('immat.step4')"
                icon="woman"
                :done="step > 4 || step < 4"
                :error="stepErrors[4]"
                :disable="!isStepAllowed(4)"
              >
                <div class="step-section-header step-section-header--pink">
                  <q-icon name="woman" class="q-mr-xs" />
                  {{ $t('immat.step4') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.NOM_MERE"
                      :label="$t('inputassu.last_name')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      :error="stepErrors[4] && !form.NOM_MERE"
                      @update:model-value="(val) => (form.NOM_MERE = val.toUpperCase())"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.last_name') }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.PRENOM_MERE"
                      :label="$t('inputassu.first_name')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.PRENOM_MERE = val.toUpperCase())"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.DATE_NAISS_PERSM"
                      :label="$t('inputassu.date_of_birth')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      :error="stepErrors[4] && !form.DATE_NAISS_PERSM"
                      :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                      :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.date_of_birth') }}<span class="req-badge">*</span></span
                        ></template
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
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.LOCALITE_NAISS_MERE"
                      :label="$t('inputassu.place_of_birth')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      @update:model-value="(val) => (form.LOCALITE_NAISS_MERE = val.toUpperCase())"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.place_of_birth')
                          }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.LieuNaissMere"
                      :options="arrondissements"
                      :label="$t('inputassu.birth_district')"
                      option-label="NOM_ARROND"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      @filter="filterArrondissement"
                      :rules="[required]"
                      :error="stepErrors[4] && !form.LieuNaissMere"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.birth_district')
                          }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-3">
                    <q-select
                      v-model="form.etatM"
                      name="etatM"
                      :label="$t('inputassu.alive')"
                      :options="etatVieOptions"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.alive') }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-3" v-if="form.etatM === 'Décédé'">
                    <q-input
                      v-model="form.DATE_DECES_PERSM"
                      name="DATE_DECES_PERSM"
                      :label="$t('inputassu.date_death')"
                      outlined
                      dense
                      class="full-width"
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
                </div>

                <q-stepper-navigation class="q-mt-md">
                  <q-btn
                    @click="goToNextStep(5)"
                    color="primary"
                    :label="$t('form.next')"
                    icon-right="arrow_forward"
                    unelevated
                  />
                  <q-btn
                    flat
                    @click="step = 3"
                    color="primary"
                    :label="$t('form.previous')"
                    icon="arrow_back"
                    class="q-ml-sm"
                  />
                </q-stepper-navigation>
              </q-step>

              <!-- ══════════════════════════════════════════════
                  ÉTAPE 5 : Contact et résidence
              ══════════════════════════════════════════════ -->
              <q-step
                :name="5"
                :title="$t('immat.step5')"
                icon="contact_phone"
                :done="step > 5 || step < 5"
                :error="stepErrors[5]"
                :disable="!isStepAllowed(5)"
              >
                <!-- Sous-section : Résidence -->
                <div class="step-section-header">
                  <q-icon name="home" class="q-mr-xs" />
                  {{ $t('immat.section.residence', 'Résidence') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.CODE_VILLEC"
                      :options="arrondissements"
                      option-label="NOM_ARROND"
                      :label="$t('inputassu.city_of_residence')"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      @filter="filterArrondissement"
                      :rules="[required]"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.city_of_residence')
                          }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.QUARTIER"
                      :label="$t('inputassu.neighborhood')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.QUARTIER = val.toUpperCase())"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.Adresse"
                      :label="$t('inputassu.address')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.Adresse = val.toUpperCase())"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.BP"
                      :label="$t('inputassu.postal_box')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.BP = val.toUpperCase())"
                    />
                  </div>
                </div>

                <!-- Sous-section : Contacts -->
                <div class="step-section-header">
                  <q-icon name="contact_phone" class="q-mr-xs" />
                  {{ $t('immat.section.contacts', 'Contacts') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.TEL_PERS"
                      :label="$t('inputassu.phone')"
                      outlined
                      dense
                      type="tel"
                      mask="+237 ### ### ###"
                      class="full-width"
                      :rules="[required]"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.phone') }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.EMAIL_PERS"
                      :label="$t('inputassu.email')"
                      outlined
                      dense
                      type="email"
                      class="full-width"
                      :rules="[required, validateEmail]"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.email') }}<span class="req-badge">*</span></span
                        ></template
                      >
                      <template v-slot:prepend><q-icon name="email" /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.FAX_PERS"
                      :label="$t('inputassu.fax')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.FAX_PERS = val.toUpperCase())"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.CODE_CENTRECNPSC"
                      :label="$t('inputassu.centreCNPS')"
                      :options="centres"
                      option-label="LIB_CENTRE"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      :hint="$t('inputassu.centreCNPS')"
                      @filter="filterCentreCNPS"
                      :rules="[required]"
                    >
                      <template v-slot:label
                        ><span class="req-label"
                          >{{ $t('inputassu.centreCNPS') }}<span class="req-badge">*</span></span
                        ></template
                      >
                    </q-select>
                  </div>
                </div>

                <q-stepper-navigation class="q-mt-md">
                  <q-btn
                    @click="goToNextStep(6)"
                    color="primary"
                    :label="$t('form.next')"
                    icon-right="arrow_forward"
                    unelevated
                  />
                  <q-btn
                    flat
                    @click="step = 4"
                    color="primary"
                    :label="$t('form.previous')"
                    icon="arrow_back"
                    class="q-ml-sm"
                  />
                </q-stepper-navigation>
              </q-step>

              <!-- ══════════════════════════════════════════════
                  ÉTAPE 6 : Pièces complémentaires
              ══════════════════════════════════════════════ -->
              <q-step
                :name="6"
                :title="$t('immat.step6')"
                icon="folder_open"
                :done="step > 6 || step < 6"
                :error="stepErrors[6]"
                :disable="!isStepAllowed(6)"
              >
                <!-- Enfants -->
                <div class="step-section-header">
                  <q-icon name="child_care" class="q-mr-xs" />
                  {{ $t('immat.section.children', 'Enfants') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-sm-3">
                    <q-input
                      v-model="form.nombEnfa"
                      :label="$t('inputassu.number_of_children')"
                      type="number"
                      outlined
                      dense
                      class="full-width"
                      min="0"
                      @update:model-value="resetFileField('actesNaissance')"
                    />
                  </div>
                  <template v-if="form.nombEnfa > 0">
                    <div
                      v-for="index in parseInt(form.nombEnfa)"
                      :key="`birth-cert-${index}`"
                      class="col-12 col-sm-3"
                    >
                      <q-file
                        v-model="form.actesNaissance[index - 1]"
                        :label="$t('inputassu.birth_certificate_child', { number: index })"
                        :hint="$t('inputassu.birth_certificate_child', { number: index })"
                        outlined
                        dense
                        class="full-width"
                        accept=".jpg,.jpeg,.png,.pdf"
                        max-file-size="3072000"
                        :rules="[(val) => !!val || $t('input.requis')]"
                        :error="stepErrors[6] && !form.actesNaissance[index - 1]"
                        @update:model-value="onFileSelected('actesNaissance', index - 1)"
                        @rejected="onRejected"
                      >
                        <template v-slot:label
                          ><span class="req-label"
                            >{{ $t('inputassu.birth_certificate_child', { number: index })
                            }}<span class="req-badge">*</span></span
                          ></template
                        >
                        <template v-slot:prepend><q-icon name="attach_file" /></template>
                      </q-file>
                    </div>
                  </template>
                </div>

                <!-- Certificats de travail -->
                <div class="step-section-header">
                  <q-icon name="work_history" class="q-mr-xs" />
                  {{ $t('immat.section.work_certs', 'Certificats de travail') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-sm-3">
                    <q-input
                      v-model="form.nombCert"
                      :label="$t('inputassu.number_of_work_certificates')"
                      :hint="$t('inputassu.number_of_work_certificates')"
                      type="number"
                      outlined
                      dense
                      class="full-width"
                      min="0"
                      @update:model-value="resetFileField('certificatsTravail')"
                    />
                  </div>
                  <template v-if="form.nombCert > 0">
                    <div
                      v-for="index in parseInt(form.nombCert)"
                      :key="`work-cert-${index}`"
                      class="col-12 col-sm-3"
                    >
                      <q-file
                        v-model="form.certificatsTravail[index - 1]"
                        :label="$t('inputassu.work_certificates', { number: index })"
                        :hint="$t('inputassu.work_certificates', { number: index })"
                        outlined
                        dense
                        class="full-width"
                        accept=".jpg,.jpeg,.png,.pdf"
                        max-file-size="3072000"
                        :rules="[(val) => !!val || $t('input.requis')]"
                        :error="stepErrors[6] && !form.certificatsTravail[index - 1]"
                        @update:model-value="onFileSelected('certificatsTravail')"
                        @rejected="onRejected"
                      >
                        <template v-slot:label
                          ><span class="req-label"
                            >{{ $t('inputassu.work_certificates', { number: index })
                            }}<span class="req-badge">*</span></span
                          ></template
                        >
                        <template v-slot:prepend><q-icon name="attach_file" /></template>
                      </q-file>
                    </div>
                  </template>
                </div>

                <!-- Actes de mariage -->
                <div class="step-section-header">
                  <q-icon name="favorite" class="q-mr-xs" />
                  {{ $t('immat.section.marriage', 'Actes de mariage') }}
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-3">
                    <q-input
                      v-model="form.nombConj"
                      :label="$t('inputassu.number_of_spouses')"
                      type="number"
                      outlined
                      dense
                      class="full-width"
                      min="0"
                      @update:model-value="resetFileField('actesMariage')"
                    />
                  </div>
                  <template v-if="form.nombConj > 0">
                    <div
                      v-for="index in parseInt(form.nombConj)"
                      :key="`mar-cert-${index}`"
                      class="col-12 col-sm-3"
                    >
                      <q-file
                        v-model="form.actesMariage[index - 1]"
                        :label="$t('inputassu.marriages_certificates', { number: index })"
                        :hint="$t('inputassu.marriages_certificates', { number: index })"
                        outlined
                        dense
                        class="full-width"
                        accept=".jpg,.jpeg,.png,.pdf"
                        max-file-size="3072000"
                        :rules="[(val) => !!val || $t('input.requis')]"
                        :error="stepErrors[6] && !form.actesMariage[index - 1]"
                        @update:model-value="onFileSelected('actesMariage', index - 1)"
                        @rejected="onRejected"
                      >
                        <template v-slot:label
                          ><span class="req-label"
                            >{{ $t('inputassu.marriages_certificates', { number: index })
                            }}<span class="req-badge">*</span></span
                          ></template
                        >
                        <template v-slot:prepend><q-icon name="attach_file" /></template>
                      </q-file>
                    </div>
                  </template>
                </div>

                <q-stepper-navigation class="q-mt-md">
                  <q-btn
                    @click="goToNextStep(7)"
                    color="primary"
                    :label="$t('form.next')"
                    icon-right="arrow_forward"
                    unelevated
                  />
                  <q-btn
                    flat
                    @click="step = 5"
                    color="primary"
                    :label="$t('form.previous')"
                    icon="arrow_back"
                    class="q-ml-sm"
                  />
                </q-stepper-navigation>
              </q-step>

              <!-- ══════════════════════════════════════════════
                  ÉTAPE 7 : Récapitulatif & Validation
              ══════════════════════════════════════════════ -->
              <q-step
                :name="7"
                :title="$t('immat.step7')"
                icon="check_circle"
                :error="stepErrors[7]"
                :disable="!isStepAllowed(7)"
              >
                <div class="q-pa-sm" ref="recapContent">
                  <!-- En-tête récap -->
                  <div class="text-center q-mb-md">
                    <q-icon name="fact_check" size="36px" color="positive" />
                    <div :class="dynamicTextClass">{{ $t('immat.step7') }}</div>
                    <q-linear-progress
                      :value="1"
                      size="6px"
                      color="positive"
                      class="q-mt-sm rounded-borders"
                      animation-speed="100"
                    />
                  </div>

                  <div class="row q-col-gutter-lg">
                    <!-- Section Employeur -->
                    <div class="col-12 col-lg-6">
                      <q-card
                        flat
                        bordered
                        class="recap-card q-mb-md"
                        :class="{ 'shadow-10': $q.dark.isActive, 'shadow-2': !$q.dark.isActive }"
                      >
                        <q-card-section class="bg-gradient-primary text-white q-py-sm">
                          <div class="row items-center no-wrap">
                            <q-icon name="business" size="sm" class="q-mr-sm" />
                            <div class="text-subtitle1 text-weight-bold col">
                              {{ $t('immat.step1') }}
                            </div>
                            <q-btn
                              flat
                              round
                              color="white"
                              icon="edit"
                              size="xs"
                              @click="step = 1"
                              class="hover-scale"
                              ><q-tooltip>{{ $t('form.edit') }}</q-tooltip></q-btn
                            >
                          </div>
                        </q-card-section>
                        <q-card-section class="q-pa-none">
                          <q-list separator dense>
                            <q-item class="q-py-xs"
                              ><q-item-section avatar
                                ><q-icon name="badge" color="primary" size="sm" /></q-item-section
                              ><q-item-section
                                ><q-item-label class="text-caption text-grey-6">{{
                                  $t('inputassu.employer_cnps_registration_number')
                                }}</q-item-label
                                ><q-item-label class="text-weight-medium">{{
                                  form.mat_employeur || $t('inputassu.not_specified')
                                }}</q-item-label></q-item-section
                              ></q-item
                            >
                            <q-item class="q-py-xs"
                              ><q-item-section avatar
                                ><q-icon
                                  name="apartment"
                                  color="primary"
                                  size="sm" /></q-item-section
                              ><q-item-section
                                ><q-item-label class="text-caption text-grey-6">{{
                                  $t('inputassu.legal_name')
                                }}</q-item-label
                                ><q-item-label class="text-weight-medium">{{
                                  form.RAISON_SOCIALE || $t('inputassu.not_specified')
                                }}</q-item-label></q-item-section
                              ></q-item
                            >
                            <q-item class="q-py-xs"
                              ><q-item-section avatar
                                ><q-icon name="store" color="primary" size="sm" /></q-item-section
                              ><q-item-section
                                ><q-item-label class="text-caption text-grey-6">{{
                                  $t('inputassu.trade_name')
                                }}</q-item-label
                                ><q-item-label class="text-weight-medium">{{
                                  form.NOM_COMMERCIAL || $t('inputassu.not_specified')
                                }}</q-item-label></q-item-section
                              ></q-item
                            >
                            <q-item class="q-py-xs"
                              ><q-item-section avatar
                                ><q-icon name="today" color="primary" size="sm" /></q-item-section
                              ><q-item-section
                                ><q-item-label class="text-caption text-grey-6">{{
                                  $t('inputassu.hiring_date')
                                }}</q-item-label
                                ><q-item-label class="text-weight-medium">{{
                                  form.DATE_EMB_PRE_SALL || $t('inputassu.not_specified')
                                }}</q-item-label></q-item-section
                              ></q-item
                            >
                            <q-item class="q-py-xs"
                              ><q-item-section avatar
                                ><q-icon
                                  name="payments"
                                  color="primary"
                                  size="sm" /></q-item-section
                              ><q-item-section
                                ><q-item-label class="text-caption text-grey-6">{{
                                  $t('inputassu.current_income')
                                }}</q-item-label
                                ><q-item-label class="text-weight-medium">{{
                                  form.ActuelRevenu || $t('inputassu.not_specified')
                                }}</q-item-label></q-item-section
                              ></q-item
                            >
                          </q-list>
                        </q-card-section>
                      </q-card>
                    </div>

                    <!-- Section Assuré -->
                    <div class="col-12 col-lg-6">
                      <q-card
                        flat
                        bordered
                        class="recap-card q-mb-md"
                        :class="{ 'shadow-10': $q.dark.isActive, 'shadow-2': !$q.dark.isActive }"
                      >
                        <q-card-section class="bg-gradient-secondary text-white q-py-sm">
                          <div class="row items-center no-wrap">
                            <q-avatar color="white" text-color="secondary" size="sm" class="q-mr-sm"
                              >{{ (form.NOM_PERS || 'N')[0]
                              }}{{ (form.PRENOM_PERS || 'P')[0] }}</q-avatar
                            >
                            <div class="text-subtitle1 text-weight-bold col">
                              {{ $t('immat.step2') }}
                            </div>
                            <q-btn
                              flat
                              round
                              color="white"
                              icon="edit"
                              size="xs"
                              @click="step = 2"
                              class="hover-scale"
                              ><q-tooltip>{{ $t('form.edit') }}</q-tooltip></q-btn
                            >
                          </div>
                        </q-card-section>
                        <q-card-section class="q-pa-none">
                          <q-list separator dense>
                            <q-item class="q-py-xs"
                              ><q-item-section avatar
                                ><q-icon
                                  name="person"
                                  color="secondary"
                                  size="sm" /></q-item-section
                              ><q-item-section
                                ><q-item-label class="text-caption text-grey-6"
                                  >{{ $t('inputassu.last_name') }} /
                                  {{ $t('inputassu.first_name') }}</q-item-label
                                ><q-item-label class="text-weight-medium"
                                  >{{ form.NOM_PERS || $t('inputassu.not_specified') }}
                                  {{ form.PRENOM_PERS || '' }}</q-item-label
                                ></q-item-section
                              ></q-item
                            >
                            <q-item class="q-py-xs"
                              ><q-item-section avatar
                                ><q-icon name="cake" color="secondary" size="sm" /></q-item-section
                              ><q-item-section
                                ><q-item-label class="text-caption text-grey-6">{{
                                  $t('inputassu.date_of_birth')
                                }}</q-item-label
                                ><q-item-label class="text-weight-medium">{{
                                  form.DATE_NAISS_PERS || $t('inputassu.not_specified')
                                }}</q-item-label></q-item-section
                              ></q-item
                            >
                            <q-item class="q-py-xs"
                              ><q-item-section avatar
                                ><q-icon name="place" color="secondary" size="sm" /></q-item-section
                              ><q-item-section
                                ><q-item-label class="text-caption text-grey-6">{{
                                  $t('inputassu.place_of_birth')
                                }}</q-item-label
                                ><q-item-label class="text-weight-medium">{{
                                  form.LOCALITE_NAISS || $t('inputassu.not_specified')
                                }}</q-item-label></q-item-section
                              ></q-item
                            >
                            <q-expansion-item
                              icon="more_horiz"
                              :label="$t('form.more_details')"
                              class="text-secondary text-caption"
                            >
                              <q-list dense>
                                <q-item class="q-py-xs"
                                  ><q-item-section avatar
                                    ><q-icon
                                      name="favorite"
                                      color="pink"
                                      size="sm" /></q-item-section
                                  ><q-item-section
                                    ><q-item-label class="text-caption text-grey-6">{{
                                      $t('inputassu.marital_status')
                                    }}</q-item-label
                                    ><q-item-label>{{
                                      form.civilite?.LIBELLE_MATRI || $t('inputassu.not_specified')
                                    }}</q-item-label></q-item-section
                                  ></q-item
                                >
                                <q-item class="q-py-xs"
                                  ><q-item-section avatar
                                    ><q-icon name="flag" color="pink" size="sm" /></q-item-section
                                  ><q-item-section
                                    ><q-item-label class="text-caption text-grey-6">{{
                                      $t('inputassu.nationality')
                                    }}</q-item-label
                                    ><q-item-label>{{
                                      form.NATIONALITEC?.nationalite ||
                                      $t('inputassu.not_specified')
                                    }}</q-item-label></q-item-section
                                  ></q-item
                                >
                                <q-item class="q-py-xs"
                                  ><q-item-section avatar
                                    ><q-icon
                                      name="credit_card"
                                      color="pink"
                                      size="sm" /></q-item-section
                                  ><q-item-section
                                    ><q-item-label class="text-caption text-grey-6">{{
                                      $t('inputassu.identity_document_type')
                                    }}</q-item-label
                                    ><q-item-label
                                      >{{
                                        form.typepiece?.LIBELLE || $t('inputassu.not_specified')
                                      }}
                                      — {{ form.NUM_PIECE || '' }}</q-item-label
                                    ></q-item-section
                                  ></q-item
                                >
                              </q-list>
                            </q-expansion-item>
                          </q-list>
                        </q-card-section>
                      </q-card>
                    </div>

                    <!-- Section Parents -->
                    <div class="col-12">
                      <q-card
                        flat
                        bordered
                        class="recap-card q-mb-md"
                        :class="{ 'shadow-10': $q.dark.isActive, 'shadow-2': !$q.dark.isActive }"
                      >
                        <q-card-section class="bg-gradient-accent text-white q-py-sm">
                          <div class="row items-center no-wrap">
                            <q-icon name="family_restroom" size="sm" class="q-mr-sm" />
                            <div class="text-subtitle1 text-weight-bold col">
                              {{ $t('immat.parents_info') }}
                            </div>
                          </div>
                        </q-card-section>
                        <q-card-section>
                          <div class="row q-col-gutter-md">
                            <!-- Père -->
                            <div class="col-12 col-md-6">
                              <q-card flat class="bg-blue-1">
                                <q-card-section class="q-pb-xs q-pt-sm q-px-sm">
                                  <div class="row items-center">
                                    <q-icon name="man" color="blue" size="sm" class="q-mr-xs" />
                                    <span class="text-weight-bold text-blue text-caption col">{{
                                      $t('immat.step3')
                                    }}</span>
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
                                <q-card-section class="q-pt-xs q-px-sm">
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
                                  <q-badge
                                    :color="form.etatP === 'Vivant' ? 'positive' : 'negative'"
                                    :label="form.etatP || $t('inputassu.not_specified')"
                                    class="q-mt-xs"
                                  />
                                  <div
                                    v-if="form.etatP === 'Décédé' || form.DATE_DECES_PERSP"
                                    class="text-caption q-mt-xs"
                                  >
                                    <q-icon
                                      name="event"
                                      color="grey-7"
                                      size="xs"
                                      class="q-mr-xs"
                                    />{{ $t('inputassu.date_death') }}:
                                    {{ form.DATE_DECES_PERSP || $t('inputassu.not_specified') }}
                                  </div>
                                </q-card-section>
                              </q-card>
                            </div>
                            <!-- Mère -->
                            <div class="col-12 col-md-6">
                              <q-card flat class="bg-pink-1">
                                <q-card-section class="q-pb-xs q-pt-sm q-px-sm">
                                  <div class="row items-center">
                                    <q-icon name="woman" color="pink" size="sm" class="q-mr-xs" />
                                    <span class="text-weight-bold text-pink text-caption col">{{
                                      $t('immat.step4')
                                    }}</span>
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
                                <q-card-section class="q-pt-xs q-px-sm">
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
                                  <q-badge
                                    :color="form.etatM === 'Vivant' ? 'positive' : 'negative'"
                                    :label="form.etatM || $t('inputassu.not_specified')"
                                    class="q-mt-xs"
                                  />
                                  <div
                                    v-if="form.etatM === 'Décédé' || form.DATE_DECES_PERSM"
                                    class="text-caption q-mt-xs"
                                  >
                                    <q-icon
                                      name="event"
                                      color="grey-7"
                                      size="xs"
                                      class="q-mr-xs"
                                    />{{ $t('inputassu.date_death') }}:
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
                        <q-card-section class="bg-gradient-info text-white q-py-sm">
                          <div class="row items-center no-wrap">
                            <q-icon name="contact_mail" size="sm" class="q-mr-sm" />
                            <div class="text-subtitle1 text-weight-bold col">
                              {{ $t('immat.step5') }}
                            </div>
                            <q-btn
                              flat
                              round
                              color="white"
                              icon="edit"
                              size="xs"
                              @click="step = 5"
                              class="hover-scale"
                              ><q-tooltip>{{ $t('form.edit') }}</q-tooltip></q-btn
                            >
                          </div>
                        </q-card-section>
                        <q-card-section class="q-pa-none">
                          <q-list separator dense>
                            <q-item class="q-py-xs"
                              ><q-item-section avatar
                                ><q-icon
                                  name="location_city"
                                  color="info"
                                  size="sm" /></q-item-section
                              ><q-item-section
                                ><q-item-label class="text-caption text-grey-6">{{
                                  $t('inputassu.city_of_residence')
                                }}</q-item-label
                                ><q-item-label class="text-weight-medium">{{
                                  form.CODE_VILLEC?.NOM_ARROND || $t('inputassu.not_specified')
                                }}</q-item-label></q-item-section
                              ></q-item
                            >
                            <q-item class="q-py-xs"
                              ><q-item-section avatar
                                ><q-icon name="home" color="info" size="sm" /></q-item-section
                              ><q-item-section
                                ><q-item-label class="text-caption text-grey-6">{{
                                  $t('inputassu.neighborhood')
                                }}</q-item-label
                                ><q-item-label class="text-weight-medium">{{
                                  form.QUARTIER || $t('inputassu.not_specified')
                                }}</q-item-label></q-item-section
                              ></q-item
                            >
                            <q-item class="q-py-xs"
                              ><q-item-section avatar
                                ><q-icon name="phone" color="info" size="sm" /></q-item-section
                              ><q-item-section
                                ><q-item-label class="text-caption text-grey-6">{{
                                  $t('inputassu.phone')
                                }}</q-item-label
                                ><q-item-label class="text-weight-medium">{{
                                  form.TEL_PERS || $t('inputassu.not_specified')
                                }}</q-item-label></q-item-section
                              ></q-item
                            >
                            <q-expansion-item
                              icon="more_horiz"
                              :label="$t('form.more_details')"
                              class="text-secondary text-caption"
                            >
                              <q-list dense>
                                <q-item class="q-py-xs"
                                  ><q-item-section avatar
                                    ><q-icon name="email" color="info" size="sm" /></q-item-section
                                  ><q-item-section
                                    ><q-item-label class="text-caption text-grey-6">{{
                                      $t('inputassu.email')
                                    }}</q-item-label
                                    ><q-item-label>{{
                                      form.EMAIL_PERS || $t('inputassu.not_specified')
                                    }}</q-item-label></q-item-section
                                  ></q-item
                                >
                                <q-item class="q-py-xs"
                                  ><q-item-section avatar
                                    ><q-icon
                                      name="markunread_mailbox"
                                      color="info"
                                      size="sm" /></q-item-section
                                  ><q-item-section
                                    ><q-item-label class="text-caption text-grey-6">{{
                                      $t('inputassu.postal_box')
                                    }}</q-item-label
                                    ><q-item-label>{{
                                      form.BP || $t('inputassu.not_specified')
                                    }}</q-item-label></q-item-section
                                  ></q-item
                                >
                                <q-item class="q-py-xs"
                                  ><q-item-section avatar
                                    ><q-icon
                                      name="business"
                                      color="info"
                                      size="sm" /></q-item-section
                                  ><q-item-section
                                    ><q-item-label class="text-caption text-grey-6">{{
                                      $t('inputassu.centreCNPS')
                                    }}</q-item-label
                                    ><q-item-label>{{
                                      form.CODE_CENTRECNPSC?.LIB_CENTRE ||
                                      $t('inputassu.not_specified')
                                    }}</q-item-label></q-item-section
                                  ></q-item
                                >
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
                        <q-card-section class="bg-gradient-warning text-white q-py-sm">
                          <div class="row items-center no-wrap">
                            <q-icon name="folder" size="sm" class="q-mr-sm" />
                            <div class="text-subtitle1 text-weight-bold col">
                              {{ $t('immat.step6') }}
                            </div>
                            <q-btn
                              flat
                              round
                              color="white"
                              icon="edit"
                              size="xs"
                              @click="step = 6"
                              class="hover-scale"
                              ><q-tooltip>{{ $t('form.edit') }}</q-tooltip></q-btn
                            >
                          </div>
                        </q-card-section>
                        <q-card-section>
                          <div class="row q-col-gutter-sm">
                            <div class="col-12">
                              <q-item class="q-px-none">
                                <q-item-section avatar
                                  ><q-icon name="child_care" color="warning"
                                /></q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.number_of_children')
                                  }}</q-item-label>
                                  <q-item-label caption>
                                    <q-chip
                                      :color="form.actesNaissance.length > 0 ? 'positive' : 'grey'"
                                      text-color="white"
                                      size="sm"
                                      >{{ form.actesNaissance.length }}
                                      {{ $t('form.children') }}</q-chip
                                    >
                                  </q-item-label>
                                  <div v-if="form.actesNaissance.length > 0" class="q-mt-xs">
                                    <q-chip
                                      v-for="(file, index) in form.actesNaissance"
                                      :key="index"
                                      color="blue-grey-3"
                                      text-color="dark"
                                      size="sm"
                                      class="q-mr-xs q-mb-xs"
                                      icon="description"
                                      >{{ file?.name || 'Fichier ' + (index + 1) }}</q-chip
                                    >
                                  </div>
                                </q-item-section>
                              </q-item>
                            </div>
                            <div class="col-12">
                              <q-item class="q-px-none">
                                <q-item-section avatar
                                  ><q-icon name="work_history" color="warning"
                                /></q-item-section>
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
                                      >{{ form.certificatsTravail.length }}
                                      {{ $t('form.certificat') }}</q-chip
                                    >
                                  </q-item-label>
                                </q-item-section>
                              </q-item>
                            </div>
                            <div class="col-12">
                              <q-item class="q-px-none">
                                <q-item-section avatar
                                  ><q-icon name="favorite" color="warning"
                                /></q-item-section>
                                <q-item-section>
                                  <q-item-label class="text-weight-medium">{{
                                    $t('inputassu.number_of_spouses')
                                  }}</q-item-label>
                                  <q-item-label caption>
                                    <q-chip
                                      :color="form.actesMariage.length > 0 ? 'positive' : 'grey'"
                                      text-color="white"
                                      size="sm"
                                      >{{ form.actesMariage.length }}
                                      {{ $t('form.mariage') }}</q-chip
                                    >
                                  </q-item-label>
                                </q-item-section>
                              </q-item>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                  <!-- /row recap -->

                  <!-- Actions finales -->
                  <q-card flat class="bg-grey-1 q-mt-md">
                    <q-card-section class="text-center">
                      <q-stepper-navigation class="justify-center">
                        <q-btn
                          type="submit"
                          color="primary"
                          size="md"
                          unelevated
                          class="q-px-lg text-weight-bold"
                          icon-right="send"
                        >
                          {{ $t('form.submit') }}
                        </q-btn>
                        <q-btn
                          flat
                          @click="step = 6"
                          color="primary"
                          :label="$t('form.previous')"
                          icon="arrow_back"
                          class="q-ml-md"
                          size="md"
                        />
                        <q-btn
                          flat
                          color="secondary"
                          size="md"
                          class="q-ml-md"
                          @click="previewDocument"
                          icon="visibility"
                        >
                          {{ $t('form.preview') }}
                        </q-btn>
                      </q-stepper-navigation>
                    </q-card-section>
                  </q-card>
                </div>
                <!-- /q-pa-sm recap -->
              </q-step>
            </q-stepper>
          </q-form>
        </q-card-section>
      </q-scroll-area>

      <!-- <q-card-actions align="right" class="q-pa-sm">
        <q-btn
          flat
          :label="$t('form.cancel')"
          v-close-popup
          color="negative"
          @click="closeDialog"
          icon="cancel"
        />
      </q-card-actions> -->
    </q-card>

    <!-- ═══ DIALOGUE PDF ═══ -->
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

    <!-- ═══ SPINNER ═══ -->
    <q-dialog persistent v-model="spinner">
      <q-spinner-cube size="xl" color="primary" />
    </q-dialog>

    <!-- ═══ DIALOGUE CONFIRMATION ═══ -->
    <q-dialog v-model="showConfirmationDialog" persistent>
      <q-card class="confirmation-card" style="min-width: 480px; max-width: 98vw">
        <q-card-section class="bg-primary text-white text-center q-pa-md">
          <q-icon name="help_outline" size="32px" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold">{{ $t('form.confirmationTitle') }}</div>
        </q-card-section>
        <q-card-section style="max-height: 50vh" class="scroll q-pa-md">
          <div class="submission-types q-mt-sm">
            <div class="text-subtitle2 text-weight-bold q-mb-md text-grey-8">
              <q-icon name="radio_button_checked" class="q-mr-sm" />
              {{ $t('form.selectSubmissionType') }}
            </div>
            <!-- Temporaire -->
            <q-card
              flat
              bordered
              class="submission-option q-mb-sm"
              :class="{ 'selected-option': submissionType === 'temporary' }"
              @click="submissionType = 'temporary'"
            >
              <q-card-section class="q-pa-sm">
                <div class="row items-center">
                  <q-radio
                    v-model="submissionType"
                    val="temporary"
                    color="orange"
                    class="q-mr-sm"
                  />
                  <div class="col">
                    <div class="text-subtitle2 text-weight-bold text-orange-8">
                      <q-icon name="schedule" class="q-mr-xs" />{{ $t('form.temporarySubmission') }}
                    </div>
                    <p class="text-caption text-grey-7 q-ma-none q-mt-xs">
                      {{ $t('form.temporarySubmissionDescription') }}
                    </p>
                  </div>
                </div>
              </q-card-section>
            </q-card>
            <!-- Définitive -->
            <q-card
              flat
              bordered
              class="submission-option"
              :class="{ 'selected-option': submissionType === 'definitive' }"
              @click="submissionType = 'definitive'"
            >
              <q-card-section class="q-pa-sm">
                <div class="row items-center">
                  <q-radio
                    v-model="submissionType"
                    val="definitive"
                    color="green"
                    class="q-mr-sm"
                  />
                  <div class="col">
                    <div class="text-subtitle2 text-weight-bold text-green-8">
                      <q-icon name="check_circle" class="q-mr-xs" />{{
                        $t('form.definitiveSubmission')
                      }}
                    </div>
                    <p class="text-caption text-grey-7 q-ma-none q-mt-xs">
                      {{ $t('form.definitiveSubmissionDescription') }}
                    </p>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
        <q-card-actions class="q-pa-md" align="center">
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
import { ref, computed, defineProps, defineEmits, onMounted, watch } from 'vue'
import { useNotify } from 'src/modules/shared/components/useNotify.js'
import { arrondissements as rawArrondissements } from 'src/modules/shared/data/Arrondissements.js'
import { pays as rawPays } from 'src/modules/shared/data/Pays.js'
import { pieces as rawPieces } from 'src/modules/shared/data/Pieces.js'
import { centres as rawCentres } from 'src/modules/shared/data/Centres.js'
import { matrimonial as rawMatrimonial } from 'src/modules/immatriculations/data/Matrimonial.js'
import {
  initImmatAssuTrvRegime0,
  buildLegacyFormData,
  validateRegime0Business,
  syncLegacyHiddenFields,
  parseLegacyDate,
} from 'src/modules/immatriculations/utils/immatAssuTrvLegacy.js'
import { useI18n } from 'vue-i18n'
import html2pdf from 'html2pdf.js'
import { submitTeleImmatAssure } from 'src/modules/immatriculations/api/immatAssureApi.js'
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
const matrimonialList = ref([...rawMatrimonial])

// Mock data for employers
const employeurs = ref([
  {
    NUM_EMPLOYEUR: '010-7183310-M', // 010-7183301-K
    RAISON_SOCIALE: 'BANANA SARL',
    DATE_CREATION: '04/10/1996',
    DATE_IMMAT: '04/08/1998',
    BOITE_POSTALE: '1130',
    ADRESSE_EMPLOYEUR: 'YAOUNDE',
    CODE_CENTRE: '325',
    DATE_EMB_PREM_SAL: '04/08/1998',
    DATE_DEB_SERVICE: '04/08/1998',
    NOM_COMMERCIAL: 'SOCIETE BANANA SARL',
    POSITION: '1',
    LIB_POSITION: 'ACTIF/REACTIVE',
    REGIME: 'RÉGIME GÉNÉRAL',
    RISQUE: 'Risque eleve',
    LIB_CENTRE: 'CPS de MELEN',
    CODE_REGIME: '1',
    CODE: 'SMIG_AE',
    SMIG: '43969',
    DATE_DEBUT: '01/03/2024',
    CODE_PIECE_GERANT: '56',
    LIBELLE_PIECE: 'Carte Nationalité d Identité',
    NOM_GERANT: 'NJONG NJONG',
    PRENOM_GERANT: 'ERIC',
    DATE_NAISS_GERANT: '28/09/1962',
    SEXE_GERANT: 'M',
    CODE_PAYS_NAT_GERANT: 'CMR',
    NOM_PAYS: 'CAMEROON',
    LIEU_NAISS_GERANT: 'E2801',
    NOM_ARROND_NAISS_GERANT: 'WUM',
    LIEU_PIECE_GERANT: 'J0601',
    NOM_ARROND_PIECE_GERANT: 'YAOUNDE I',
    NUM_PIECE_GERANT: '101038307',
    DATE_PIECE_GERANT: '28/11/2016',
    LOCALITE_NAISS_GERANT: 'WUM',
    BP_GERANT: '1130',
    ADR_GERANT: 'B.P. 1130 YAOUNDE',
    EMAIL_GERANT: 'societe.banana@yahoo.fr',
    TEL_GERANT: '222355275',
    NUI_GERANT: 'P096214426111F',
    ORDRE: '6',
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
  regime: '0',
  regimeAffiC: 'Obligatoire',
  regimeAffi: '0',
  date_effet: '',
  taux: '',
  min_date_effet: '',
  smig_annuel: '',
  max_cotisation_annuel: '',
  Dest: '',
  laction: 'Créer',
  valider: 'OUI',
  CODE_echelon: '',
  Specialite: '',
  ADRESSE_EMPLOYEUR: '',
  DATE_EMB_PREM_TRAV: '',
  EFFECTIF_APPROX: 0,
  CODE_categ: null,
  NiveauAss: '',
  ActuelRevenu: '',
  SMIG_VALUE: 0,
  SEXE_PERS: '',
  NOM_PERS: '',
  PRENOM_PERS: '',
  DATE_NAISS_PERS: '',
  LOCALITE_NAISS: '',
  LieuNaiss: null,
  LIEU_NAISS_PERS: '',
  CODE_PAYS_NAISS: '',
  NATIONALITEC: null,
  NATIONALITE: '',
  typepiece: null,
  NUM_TYPEPIECE: '',
  NUM_PIECE: '',
  DATE_PIECE: '',
  LIEU_PIECEC: null,
  LIEU_PIECE: '',
  civilite: null,
  CIVILITE_PERS: '',
  pieceIdentite: null,
  declarationHonneur: null,
  NOM_PERE: '',
  PRENOM_PERE: '',
  DATE_NAISS_PERSP: '',
  LOCALITE_NAISS_PERE: '',
  LieuNaissPere: null,
  LIEU_NAISS_PERE: '',
  CODE_PAYS_NAISSP: '',
  etatP: 'Vivant',
  DATE_DECES_PERSP: '',
  NOM_MERE: '',
  PRENOM_MERE: '',
  DATE_NAISS_PERSM: '',
  LOCALITE_NAISS_MERE: '',
  LieuNaissMere: null,
  LIEU_NAISS_MERE: '',
  CODE_PAYS_NAISSM: '',
  etatM: 'Vivant',
  DATE_DECES_PERSM: '',
  CODE_VILLEC: null,
  CODE_VILLE: '',
  QUARTIER: '',
  TEL_PERS: '',
  FAX_PERS: '',
  Adresse: '',
  EMAIL_PERS: '',
  BP: '',
  CODE_CENTRECNPSC: null,
  CODE_CENTRECNPS: '',
  nombEnfa: 0,
  actesNaissance: [],
  nombCert: 0,
  certificatsTravail: [],
  nombConj: 0,
  actesMariage: [],
})

onMounted(() => {
  initImmatAssuTrvRegime0(form.value)
})

watch(
  () => form.value,
  () => syncLegacyHiddenFields(form.value),
  { deep: true },
)

watch(
  () => form.value.typepiece,
  (piece) => {
    form.value.NUM_TYPEPIECE = piece?.NUM_TYPEPIECE || ''
    if (!form.value.NUM_TYPEPIECE || form.value.NUM_TYPEPIECE === '99') {
      form.value.declarationHonneur = null
    }
  },
)

const sexeOptions = computed(() => [
  { label: t('inputassu.male'), value: 'MASCULIN' },
  { label: t('inputassu.female'), value: 'FEMININ' },
])

const etatVieOptions = computed(() => [
  { label: t('inputassu.yes'), value: 'Vivant' },
  { label: t('inputassu.no'), value: 'Décédé' },
])

const dynamicTextClass = computed(() => [
  $q.screen.gt.sm ? 'text-h5' : 'custom-mobile-text',
  'text-primary',
  'text-uppercase',
  'q-mb-sm',
])

const required = (val) => !!val || 'Ce champ est requis / This field is required'

const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || t('errors.invalidEmail')

const validateMatriculeCNPS = (val) => {
  const regex = /^(?:\d{3}-\d{7}-\d{3}-[A-Z]|\d{3}-\d{7}-[A-Z])$/.test(val)
  return regex || t('errors.invalid_cnps_format')
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

const calculateSmig = () => {
  const hire = parseLegacyDate(form.value.DATE_EMB_PRE_SALL)
  if (!hire) return
  form.value.SMIG_VALUE = hire.getFullYear() >= 2014 ? 36270 : 28182
}

const fetchEmployerData = async () => {
  const matricule = form.value.mat_employeur
  if (!validateMatriculeCNPS(matricule)) {
    notifyError(t('messages.error'))
    return
  }
  const employer = employeurs.value.find((e) => e.NUM_EMPLOYEUR === matricule)
  if (employer) {
    form.value.NOM_COMMERCIAL = employer.NOM_COMMERCIAL
    form.value.RAISON_SOCIALE = employer.RAISON_SOCIALE
    form.value.ADRESSE_EMPLOYEUR = employer.ADRESSE_EMPLOYEUR
    form.value.DATE_EMB_PREM_TRAV = employer.DATE_EMB_PREM_SAL
    form.value.SMIG_VALUE = employer.SMIG
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
    form.value[field] =
      field === 'avisEmbauche' || field === 'pieceIdentite' || field === 'declarationHonneur'
        ? null
        : []
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

/* const counterLabelFn = ({ files }) => {
    return files.length ? `${files.length} ${t('input.files_selected')}` : t('input.no_files_selected');
  }; */
const counterLabelFn = ({ totalSize, filesCount, maxFiles }) => {
  return `(${filesCount}/${maxFiles}) ${Math.round(totalSize / 1024)} KB`
}
const isStepAllowed = (stepNumber) => {
  return stepNumber <= maxStep.value
}

const goToNextStep = async (nextStep) => {
  const currentStep = step.value
  syncLegacyHiddenFields(form.value)
  const valid = await formRef.value.validate()
  const businessErr = validateRegime0Business(form.value, currentStep)
  if (!valid || businessErr) {
    stepErrors.value[currentStep] = true
    notifyError(
      businessErr ||
        'Veuillez remplir tous les champs requis / Please fill in all required fields.',
    )
    return
  }
  stepErrors.value[currentStep] = false
  step.value = nextStep
  if (nextStep > maxStep.value) {
    maxStep.value = nextStep
  }
}

const submitForm = async () => {
  syncLegacyHiddenFields(form.value)
  const valid = await formRef.value.validate()
  const businessErr = validateRegime0Business(form.value, null)
  if (!valid || businessErr) {
    notifyError(
      businessErr ||
        'Veuillez remplir tous les champs requis / Please fill in all required fields.',
    )
    return
  }
  showConfirmationDialog.value = true
}

const confirmSubmission = async () => {
  if (!submissionType.value) {
    notifyError(t('form.selectSubmissionType'))
    return
  }
  spinner.value = true
  try {
    const formData = buildLegacyFormData(form.value, {
      submissionType: submissionType.value,
    })
    if (import.meta.env.DEV) {
      console.info('GererAssure FormData (régime 0):', [...formData.entries()])
    }
    const result = await submitTeleImmatAssure(formData)
    notifySuccess(result.message || t('form.submitted'))
    closeDialog()
  } catch (error) {
    const msg = error?.message || String(error)
    notifyError(t('form.submit_error', { error: msg }))
  } finally {
    spinner.value = false
    showConfirmationDialog.value = false
    submissionType.value = null
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
  font-size: 14px;
  line-height: 1.5rem;
}

/* ── En-tête principal du dialogue ── */
.immat-main-card {
  border-radius: 12px;
  overflow: hidden;
}

.immat-header {
  background: linear-gradient(135deg, #1565c0 0%, #1976d2 60%, #42a5f5 100%);
}

/* ── Stepper ── */
.immat-stepper .q-stepper__header {
  background: #f5f7fa;
  border-bottom: 1px solid #e0e0e0;
}

/* ── En-têtes de sous-sections ── */
.step-section-header {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1565c0;
  background: #e3f2fd;
  border-left: 3px solid #1976d2;
  padding: 5px 10px;
  border-radius: 0 4px 4px 0;
  margin-bottom: 10px;
  margin-top: 4px;
}

.step-section-header--blue {
  color: #0d47a1;
  background: #e3f2fd;
  border-left-color: #1565c0;
}

.step-section-header--pink {
  color: #880e4f;
  background: #fce4ec;
  border-left-color: #e91e63;
}

/* ── Labels avec badge requis ── */
.req-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.req-badge {
  font-size: 9px;
  background: #e53935;
  color: #fff;
  padding: 1px 5px;
  border-radius: 3px;
  font-style: italic;
  font-weight: 600;
  white-space: nowrap;
}
</style>

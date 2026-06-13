<template>
  <q-dialog v-model="open" persistent full-width>
    <ImmatAssuTrvControle
      v-show="phase === 'controle'"
      :code-tele="controleCredentials.codeTele"
      :code-secret="controleCredentials.codeSecret"
      :show-preview="controleValidated"
      :reload-token="controleReloadToken"
      @close="closeDialog"
      @edit="onEditFromControle"
      @validated="onControleValidated"
    />
    <q-card
      v-show="phase === 'form'"
      :style="$q.screen.gt.sm ? 'width: 960px; max-width: 98vw' : 'width: 100%'"
      class="immat-main-card column no-wrap"
    >
      <!-- ═══ EN-TÊTE ═══ -->
      <q-card-section class="immat-header row items-center no-wrap q-px-md q-py-xs">
        <q-icon name="assignment_ind" size="22px" class="q-mr-sm text-white" />
        <div class="col text-subtitle1 text-white text-weight-bold">
          {{ $t(service.name) }}
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

      <q-form ref="formRef" class="col column immat-form" greedy reactive-rules @submit.prevent="dialValidation = true">
        <q-scroll-area class="col immat-scroll-area">
          <q-inner-loading :showing="loadingInit" :label="referentialsLoadingLabel" />
          <q-card-section v-if="referentialsError && !loadingInit" class="q-pb-none">
            <q-banner rounded class="bg-negative text-white">
              <template #avatar><q-icon name="cloud_off" /></template>
              {{ referentialsError }}
              <template #action>
                <q-btn
                  flat
                  color="white"
                  :label="$t('form.retry')"
                  icon="refresh"
                  @click="loadFormBootstrap"
                />
              </template>
            </q-banner>
          </q-card-section>
          <q-card-section class="q-pa-sm">
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
                      :error="hasFieldError('mat_employeur')"
                      :error-message="fieldErrorMsg('mat_employeur')"
                      :hint="$t('inputassu.employer_cnps_registration_number')"
                      @keyup.enter="fetchEmployerData"
                      @keydown.enter.prevent="fetchEmployerData"
                      @update:model-value="reevaluateMatricule"
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
                          :loading="loadingEmployer"
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
                      :error="hasFieldError('DATE_EMB_PRE_SALL')"
                      :error-message="fieldErrorMsg('DATE_EMB_PRE_SALL')"
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
                              @update:model-value="(v) => { form.DATE_EMB_PRE_SALL = v; calculateSmig(); reevaluateField('DATE_EMB_PRE_SALL') }"
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
                      type="tel"
                      :maxlength="LEGACY_TELEIMMAS_DIGIT_LIMITS.REVENU_MENSUEL"
                      class="full-width"
                      :error="hasFieldError('ActuelRevenu')"
                      :error-message="fieldErrorMsg('ActuelRevenu')"
                      @update:model-value="() => reevaluateField('ActuelRevenu')"
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
                      :max-file-size="LEGACY_MAX_FILE_SIZE"
                      :hint="fileMaxSizeHint"
                      :rules="[required]"
                      :error="hasFieldError('avisEmbauche')"
                      :error-message="fieldErrorMsg('avisEmbauche')"
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
                      :error="hasFieldError('DATE_NAISS_PERS')"
                      :error-message="fieldErrorMsg('DATE_NAISS_PERS')"
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
                              @update:model-value="() => reevaluateField('DATE_NAISS_PERS')"
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
                      v-bind="arrondissementSelectProps"
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
                      :disable="!referentialsReady"
                      @filter="filterArrondissement"
                      :rules="[required]"
                      :error="hasFieldError('LieuNaiss')"
                      :error-message="fieldErrorMsg('LieuNaiss')"
                      @update:model-value="() => reevaluateField('LieuNaiss')"
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
                      :disable="!referentialsReady"
                      @filter="filterMatrimonial"
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
                      :disable="!referentialsReady"
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
                      :disable="!referentialsReady"
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
                      v-bind="arrondissementSelectProps"
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
                      :disable="!referentialsReady"
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
                      :max-file-size="LEGACY_MAX_FILE_SIZE"
                      :hint="fileMaxSizeHint"
                      :rules="[required]"
                      :error="hasFieldError('pieceIdentite')"
                      :error-message="fieldErrorMsg('pieceIdentite')"
                      @update:model-value="onFileSelected('pieceIdentite')"
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
                      :max-file-size="LEGACY_MAX_FILE_SIZE"
                      :hint="fileMaxSizeHint"
                      :rules="[required]"
                      :error="hasFieldError('declarationHonneur')"
                      :error-message="fieldErrorMsg('declarationHonneur')"
                      @update:model-value="onFileSelected('declarationHonneur')"
                      @rejected="onRejected"
                    >
                      <template v-slot:prepend
                        ><q-icon name="upload_file" color="primary"
                      /></template>
                    </q-file>
                  </div>
                </div>

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
                      name="NOM_PERE"
                      :label="$t('inputassu.last_name')"
                      outlined
                      dense
                      class="full-width"
                      :error="hasFieldError('NOM_PERE')"
                      :error-message="fieldErrorMsg('NOM_PERE')"
                      @update:model-value="(val) => { form.NOM_PERE = val.toUpperCase(); reevaluateField('NOM_PERE') }"
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
                      name="DATE_NAISS_PERSP"
                      :label="$t('inputassu.date_of_birth')"
                      outlined
                      dense
                      class="full-width"
                      :error="hasFieldError('DATE_NAISS_PERSP')"
                      :error-message="fieldErrorMsg('DATE_NAISS_PERSP')"
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
                              @update:model-value="() => reevaluateField('DATE_NAISS_PERSP')"
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
                      :disable="!referentialsReady"
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
                      name="DATE_NAISS_PERSM"
                      :label="$t('inputassu.date_of_birth')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      :error="hasFieldError('DATE_NAISS_PERSM')"
                      :error-message="fieldErrorMsg('DATE_NAISS_PERSM')"
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
                              @update:model-value="() => reevaluateField('DATE_NAISS_PERSM')"
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
                      :disable="!referentialsReady"
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
                      :disable="!referentialsReady"
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
                      type="tel"
                      :maxlength="LEGACY_TELEIMMAS_DIGIT_LIMITS.BP"
                      class="full-width"
                      :error="hasFieldError('BP')"
                      :error-message="fieldErrorMsg('BP')"
                      :rules="[
                        (val) =>
                          !val ||
                          String(val).replace(/\D/g, '').length <= LEGACY_TELEIMMAS_DIGIT_LIMITS.BP ||
                          $t('inputassu.bpMaxDigits', { max: LEGACY_TELEIMMAS_DIGIT_LIMITS.BP }),
                      ]"
                      @update:model-value="() => reevaluateField('BP')"
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
                      maxlength="9"
                      prefix="+237"
                      class="full-width"
                      :rules="[
                        required,
                        (val) => regexPatterns.telephone.test(val) || $t('input.invalidPhone'),
                      ]"
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
                      type="tel"
                      :maxlength="LEGACY_TELEIMMAS_DIGIT_LIMITS.PHONE"
                      class="full-width"
                      :error="hasFieldError('FAX_PERS')"
                      :error-message="fieldErrorMsg('FAX_PERS')"
                      :rules="[
                        (val) =>
                          !val ||
                          String(val).replace(/\D/g, '').length <= LEGACY_TELEIMMAS_DIGIT_LIMITS.PHONE ||
                          $t('input.invalidPhone'),
                      ]"
                      @update:model-value="() => reevaluateField('FAX_PERS')"
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
                      :disable="!referentialsReady"
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
                        :hint="fileHintWithSize($t('inputassu.birth_certificate_child', { number: index }))"
                        outlined
                        dense
                        class="full-width"
                        accept=".jpg,.jpeg,.png,.pdf"
                        :max-file-size="LEGACY_MAX_FILE_SIZE"
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
                        :hint="fileHintWithSize($t('inputassu.work_certificates', { number: index }))"
                        outlined
                        dense
                        class="full-width"
                        accept=".jpg,.jpeg,.png,.pdf"
                        :max-file-size="LEGACY_MAX_FILE_SIZE"
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
                      name="nombConj"
                      :label="$t('inputassu.number_of_spouses')"
                      type="number"
                      outlined
                      dense
                      class="full-width"
                      min="0"
                      :error="hasFieldError('nombConj')"
                      :error-message="fieldErrorMsg('nombConj')"
                      @update:model-value="(v) => { form.nombConj = v; resetFileField('actesMariage'); reevaluateField('nombConj') }"
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
                        :hint="fileHintWithSize($t('inputassu.marriages_certificates', { number: index }))"
                        outlined
                        dense
                        class="full-width"
                        accept=".jpg,.jpeg,.png,.pdf"
                        :max-file-size="LEGACY_MAX_FILE_SIZE"
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

                </div>
                <!-- /q-pa-sm recap -->
              </q-step>
            </q-stepper>
          </q-card-section>
        </q-scroll-area>

        <q-separator />
        <q-card-actions align="right" class="immat-step-footer q-pa-sm">
          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            :label="$t('form.previous')"
            icon="arrow_back"
            @click="goToPreviousStep"
          />
          <q-space />
          <q-btn
            v-if="step < 7"
            color="primary"
            unelevated
            :label="$t('form.next')"
            icon-right="arrow_forward"
            @click="goToNextStep(step + 1)"
          />
          <q-btn
            v-else
            type="submit"
            color="primary"
            unelevated
            class="q-px-lg text-weight-bold"
            icon-right="send"
            :label="$t('form.submit')"
          />
        </q-card-actions>
      </q-form>

      <!-- ═══ DIALOGUE CONFIRMATION ═══ -->
      <q-dialog v-model="dialValidation" persistent>
        <q-card class="confirmation-card" style="min-width: 340px; max-width: 480px">
          <q-card-section class="immat-header row items-center no-wrap q-py-sm">
            <q-icon name="verified" size="md" class="q-mr-sm text-white" />
            <div class="text-subtitle1 text-weight-bold col text-white">
              {{ $t('form.confirmationTitle') }}
            </div>
            <q-btn flat round dense icon="close" color="white" @click="dialValidation = false" />
          </q-card-section>
          <q-card-section>
            <div class="confirmation-message text-body2 q-mb-md">
              <q-icon name="info" color="primary" class="q-mr-xs" />
              {{ $t('form.confirmationMessage') }}
            </div>
            <div class="text-subtitle2 text-weight-medium q-mb-sm text-primary">
              {{ $t('immep.confirmSubmit') }}
            </div>
            <q-option-group
              v-model="form.validation"
              :options="validationOptions"
              color="primary"
              inline
              class="q-mt-sm"
            />
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat :label="$t('form.cancel')" color="grey-7" @click="dialValidation = false" />
            <q-btn
              unelevated
              color="primary"
              icon="send"
              :label="$t('form.confirm')"
              :disable="form.validation !== true"
              :loading="spinner"
              @click="submitForm"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

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

  </q-dialog>
</template>
<script setup>
import { ref, computed, defineProps, defineEmits, onMounted, watch, nextTick } from 'vue'
import { useNotify } from 'src/modules/shared/components/useNotify.js'
import {
  initImmatAssuTrvRegime0,
  buildLegacyFormData,
  validateRegime0BusinessFieldMap,
  syncLegacyHiddenFields,
  parseLegacyDate,
} from 'src/modules/immatriculations/utils/immatAssuTrvLegacy.js'
import { useI18n } from 'vue-i18n'
import html2pdf from 'html2pdf.js'
import { submitTeleImmatAssure } from 'src/modules/immatriculations/api/immatAssureApi.js'
import {
  fetchAssureTele,
  fetchEmployerByMatricule,
  fetchImmatAssuReferentials,
  fetchSessionAssureInit,
} from 'src/modules/immatriculations/api/teleImmatAssureApi.js'
import { applyAssureTeleToForm } from 'src/modules/immatriculations/adapters/assureTeleAdapter.js'
import { applyEmployerToForm } from 'src/modules/immatriculations/adapters/employerAdapter.js'
import ImmatAssuTrvControle from 'src/modules/immatriculations/components/ImmatAssuTrvControle.vue'
import { selectSmig } from 'src/modules/immatriculations/utils/selectSmig.js'
import { useQuasar } from 'quasar'
import { regexPatterns } from 'src/js/regex.js'
import { LEGACY_TELEIMMAS_DIGIT_LIMITS } from 'src/modules/immatriculations/utils/immatLegacyCommon.js'

/** Taille max pièce jointe — alignée teleImmat / GererAssure (3 Mo). */
const LEGACY_MAX_FILE_SIZE = 3072000

const props = defineProps({
  service: Object,
  /** Reprise d'un dossier existant (modification / validation) */
  codeTele: { type: String, default: '' },
  codeSecret: { type: String, default: '' },
})

const $q = useQuasar()

const { t, locale } = useI18n()
const emit = defineEmits(['close'])

const { notifyError, notifySuccess, notifyControleGenerated } = useNotify()

const open = ref(true)
const step = ref(1)
const maxStep = ref(1)
const formRef = ref(null)
const recapContent = ref(null)
const pdfDialog = ref(false)
const pdfBlobUrl = ref(null)
const spinner = ref(false)
const dialValidation = ref(false)
const stepErrors = ref({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false })
const fieldErrors = ref({})

const phase = ref('form')
const controleCredentials = ref({ codeTele: '', codeSecret: '' })
const controleValidated = ref(false)
const controleReloadToken = ref(0)
const fromControleEdit = ref(false)
const employerSmigLines = ref([])
const loadingInit = ref(false)
const loadingEmployer = ref(false)
const referentialsReady = ref(false)
const referentialsError = ref(null)
const referentialsLoadingLabel = ref('')

const arrondissementSelectProps = {
  virtualScroll: true,
  virtualScrollItemSize: 40,
  popupContentStyle: 'max-height: 280px',
}

const arrondissementsAll = ref([])
const paysAll = ref([])
const piecesAll = ref([])
const centresAll = ref([])
const matrimonialAll = ref([])

const arrondissements = ref([])
const pays = ref([])
const pieces = ref([])
const centres = ref([])
const matrimonialList = ref([])

function getReferentialsSnapshot() {
  return {
    arrondissements: arrondissementsAll.value,
    pays: paysAll.value,
    pieces: piecesAll.value,
    centres: centresAll.value,
    matrimonial: matrimonialAll.value,
  }
}

function applyReferentials(refs) {
  arrondissementsAll.value = [...refs.arrondissements]
  paysAll.value = [...refs.pays]
  piecesAll.value = [...refs.pieces]
  centresAll.value = [...refs.centres]
  matrimonialAll.value = [...refs.matrimonial]

  arrondissements.value = [...refs.arrondissements]
  pays.value = [...refs.pays]
  pieces.value = [...refs.pieces]
  centres.value = [...refs.centres]
  matrimonialList.value = [...refs.matrimonial]
  referentialsReady.value = true
}

function createImmatAssuTrvFormDefaults() {
  return {
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
    Dest: 'dossiers/assure/immas/',
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
    validation: false,
  }
}

const validationOptions = computed(() => [
  { label: t('input.yes'), value: true },
  { label: t('input.no'), value: false },
])

const form = ref(createImmatAssuTrvFormDefaults())

onMounted(() => {
  referentialsLoadingLabel.value = t('immat.referentials.loading')
  loadFormBootstrap()
})

async function loadFormBootstrap() {
  loadingInit.value = true
  referentialsReady.value = false
  referentialsError.value = null
  try {
    referentialsLoadingLabel.value = t('immat.referentials.loadingLists')
    const refs = await fetchImmatAssuReferentials()
    applyReferentials(refs)

    referentialsLoadingLabel.value = t('immat.referentials.loadingSession')
    const session = await fetchSessionAssureInit({ regime: '0' }).catch(() => null)
    if (session) {
      initImmatAssuTrvRegime0(form.value, {
        date_demande: session.DATE_DEMANDE,
        date_effet: session.date_effet,
        taux: session.taux,
        min_date_effet: session.min_date_effet,
        smig_annuel: session.smig_annuel,
        max_cotisation_annuel: session.max_cotisation_annuel,
      })
    } else {
      initImmatAssuTrvRegime0(form.value)
    }
  } catch (e) {
    referentialsError.value = e?.message || t('immat.referentials.error')
    notifyError(referentialsError.value)
  } finally {
    loadingInit.value = false
    referentialsLoadingLabel.value = t('immat.referentials.loading')
  }

  const ct = props.codeTele || form.value.code_tele
  const cs = props.codeSecret || form.value.code_secret
  if (ct && cs && referentialsReady.value) {
    await loadExistingDossier(ct, cs)
  }
}

async function loadExistingDossier(codeTele, codeSecret, options = {}) {
  try {
    $q.loading.show({
      message: options.loadingMessage || t('immat.controle.loadingDossier'),
    })
    const row = await fetchAssureTele(codeTele, codeSecret)
    if (!row) return
    applyAssureTeleToForm(form.value, row, getReferentialsSnapshot())
    form.value.code_tele = codeTele
    form.value.code_secret = codeSecret
    if (form.value._dossierExploite) {
      notifyError(t('immat.controle.dossierExploite'))
    }
    if (form.value.mat_employeur) {
      await fetchEmployerData()
    }
  } catch (e) {
    notifyError(e?.message || t('messages.error'))
  } finally {
    $q.loading.hide()
  }
}

const fileMaxSizeHint = computed(() => t('form.maxFileSizeHint'))

function fileHintWithSize(label = '') {
  const max = fileMaxSizeHint.value
  return label ? `${label} — ${max}` : max
}

watch(
  () => form.value.DATE_EMB_PRE_SALL,
  (hireDate) => {
    if (hireDate && employerSmigLines.value.length) {
      form.value.SMIG_VALUE = selectSmig(employerSmigLines.value, hireDate)
    }
  },
)

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

const hasFieldError = (field) => Boolean(fieldErrors.value[field])
const fieldErrorMsg = (field) => fieldErrors.value[field] || undefined

/** Champs dont la validité dépend d'un autre (réévaluation croisée). */
const FIELD_RELATED = {
  DATE_NAISS_PERS: ['DATE_EMB_PRE_SALL'],
  DATE_EMB_PRE_SALL: ['DATE_NAISS_PERS', 'DATE_EMB_PREM_TRAV'],
  DATE_EMB_PREM_TRAV: ['DATE_EMB_PRE_SALL'],
  DATE_NAISS_PERSM: ['DATE_NAISS_PERS'],
  DATE_NAISS_PERSP: ['DATE_NAISS_PERS', 'NOM_PERE'],
  NOM_PERE: ['DATE_NAISS_PERSP'],
  ActuelRevenu: ['ActuelRevenu'],
}

function updateStepErrorState() {
  const currentStep = step.value
  const map = validateRegime0BusinessFieldMap(form.value, currentStep)
  if (Object.keys(map).length === 0) {
    stepErrors.value[currentStep] = false
  }
}

/**
 * Réévalue un champ à la saisie — retire l'erreur dès que la valeur est conforme.
 * @param {string} field
 */
function reevaluateField(field) {
  syncLegacyHiddenFields(form.value)
  const keys = [field, ...(FIELD_RELATED[field] || [])]
  const next = { ...fieldErrors.value }

  for (const scope of [step.value, null]) {
    const map = validateRegime0BusinessFieldMap(form.value, scope)
    for (const key of keys) {
      if (map[key]) next[key] = map[key]
      else delete next[key]
    }
  }

  fieldErrors.value = next
  updateStepErrorState()
}

function reevaluateMatricule() {
  const mat = String(form.value.mat_employeur || '')
    .trim()
    .toUpperCase()
  form.value.mat_employeur = mat
  const next = { ...fieldErrors.value }
  const formatOk = /^(?:\d{3}-\d{7}-\d{3}-[A-Z]|\d{3}-\d{7}-[A-Z])$/.test(mat)
  if (!mat) next.mat_employeur = t('errors.required')
  else if (!formatOk) next.mat_employeur = t('errors.invalid_cnps_format')
  else delete next.mat_employeur
  fieldErrors.value = next
  updateStepErrorState()
}

function scrollToFirstInvalid() {
  nextTick(() => {
    const el = formRef.value?.$el?.querySelector('.q-field--error')
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

async function validateCurrentForm(stepScope = null) {
  syncLegacyHiddenFields(form.value)
  fieldErrors.value = validateRegime0BusinessFieldMap(form.value, stepScope)
  const valid = await formRef.value?.validate()
  const businessOk = Object.keys(fieldErrors.value).length === 0
  await nextTick()
  if (!valid || !businessOk) {
    const firstBusiness = Object.values(fieldErrors.value)[0]
    if (firstBusiness) {
      notifyError(firstBusiness)
    } else if (!valid) {
      notifyError(t('immat.validation.requiredFields'))
    }
    scrollToFirstInvalid()
    return false
  }
  return true
}

const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || t('errors.invalidEmail')

const validateMatriculeCNPS = (val) => {
  const normalized = String(val || '')
    .trim()
    .toUpperCase()
  const regex = /^(?:\d{3}-\d{7}-\d{3}-[A-Z]|\d{3}-\d{7}-[A-Z])$/.test(normalized)
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
    const needle = (val || '').toLowerCase()
    arrondissements.value = needle
      ? arrondissementsAll.value.filter((arr) =>
          String(arr.NOM_ARROND || '')
            .toLowerCase()
            .includes(needle),
        )
      : [...arrondissementsAll.value]
  })
}

const filterMatrimonial = (val, update) => {
  update(() => {
    const needle = (val || '').toLowerCase()
    matrimonialList.value = needle
      ? matrimonialAll.value.filter((item) =>
          String(item.LIBELLE_MATRI || '')
            .toLowerCase()
            .includes(needle),
        )
      : [...matrimonialAll.value]
  })
}

const filterPays = (val, update) => {
  update(() => {
    const needle = (val || '').toLowerCase()
    pays.value = needle
      ? paysAll.value.filter((item) =>
          String(item.nationalite || '')
            .toLowerCase()
            .includes(needle),
        )
      : [...paysAll.value]
  })
}

const filterPieces = (val, update) => {
  update(() => {
    const needle = (val || '').toLowerCase()
    pieces.value = needle
      ? piecesAll.value.filter((piece) =>
          String(piece.LIBELLE || '')
            .toLowerCase()
            .includes(needle),
        )
      : [...piecesAll.value]
  })
}

const filterCentreCNPS = (val, update) => {
  update(() => {
    const needle = (val || '').toLowerCase()
    centres.value = needle
      ? centresAll.value.filter((centre) =>
          String(centre.LIB_CENTRE || '')
            .toLowerCase()
            .includes(needle),
        )
      : [...centresAll.value]
  })
}

const calculateSmig = () => {
  const hire = form.value.DATE_EMB_PRE_SALL
  if (!hire) return
  if (employerSmigLines.value.length) {
    form.value.SMIG_VALUE = selectSmig(employerSmigLines.value, hire)
    return
  }
  const parsed = parseLegacyDate(hire)
  if (!parsed) return
  form.value.SMIG_VALUE = parsed.getFullYear() >= 2014 ? 36270 : 28182
}

const fetchEmployerData = async () => {
  const matricule = String(form.value.mat_employeur || '')
    .trim()
    .toUpperCase()
  form.value.mat_employeur = matricule

  if (!matricule) {
    fieldErrors.value = { mat_employeur: t('errors.required') }
    await formRef.value?.validate()
    scrollToFirstInvalid()
    return
  }
  if (validateMatriculeCNPS(matricule) !== true) {
    fieldErrors.value = { mat_employeur: t('errors.invalid_cnps_format') }
    await formRef.value?.validate()
    scrollToFirstInvalid()
    return
  }
  reevaluateMatricule()
  loadingEmployer.value = true
  try {
    const rows = await fetchEmployerByMatricule(matricule)
    employerSmigLines.value = rows
    const { warning } = applyEmployerToForm(
      form.value,
      rows[0],
      rows,
      form.value.DATE_EMB_PRE_SALL,
    )
    if (warning) {
      notifyError(warning)
    } else {
      notifySuccess(t('messages.employer_found'))
    }
  } catch (e) {
    employerSmigLines.value = []
    notifyError(e?.message || t('messages.employer_not_found'))
  } finally {
    loadingEmployer.value = false
  }
}

const resetFileField = (field) => {
  form.value[field] = field === 'avisEmbauche' ? null : []
}

const onFileSelected = (field) => (file) => {
  if (file && file.size > LEGACY_MAX_FILE_SIZE) {
    notifyError(t('errors.file_too_large'))
    form.value[field] =
      field === 'avisEmbauche' || field === 'pieceIdentite' || field === 'declarationHonneur'
        ? null
        : []
  }
  reevaluateField(field)
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

const goToPreviousStep = () => {
  if (step.value > 1) {
    step.value -= 1
  }
}

const goToNextStep = async (nextStep) => {
  const currentStep = step.value
  const ok = await validateCurrentForm(currentStep)
  if (!ok) {
    stepErrors.value[currentStep] = true
    return
  }
  stepErrors.value[currentStep] = false
  step.value = nextStep
  if (nextStep > maxStep.value) {
    maxStep.value = nextStep
  }
}

const submitForm = async () => {
  dialValidation.value = false
  const ok = await validateCurrentForm(null)
  if (!ok) {
    stepErrors.value[7] = true
    return
  }
  stepErrors.value[7] = false
  await confirmSubmission()
}

const confirmSubmission = async () => {
  spinner.value = true
  const revalidateFromControle = fromControleEdit.value
  try {
    const formData = buildLegacyFormData(form.value, {
      submissionType: revalidateFromControle ? 'definitive' : 'temporary',
    })
    if (import.meta.env.DEV) {
      console.info('GererAssure FormData (régime 0):', [...formData.entries()])
    }
    const result = await submitTeleImmatAssure(formData)
    const codeTele = result.codeTele
    const codeSecret = result.codeSecret

    form.value.code_tele = codeTele
    form.value.code_secret = codeSecret
    form.value.laction = 'Modifier'
    form.value.valider = revalidateFromControle ? 'OUI' : 'NON'
    controleCredentials.value = { codeTele, codeSecret }
    controleValidated.value = revalidateFromControle
    fromControleEdit.value = false
    controleReloadToken.value += 1
    phase.value = 'controle'

    if (revalidateFromControle) {
      notifySuccess(result.message || t('form.submitted'))
    } else {
      notifyControleGenerated(result.message || t('form.submitted'))
    }
  } catch (error) {
    const msg = error?.message || String(error)
    notifyError(msg || t('form.submit_error', { error: '' }))
  } finally {
    spinner.value = false
  }
}

async function onEditFromControle({ codeTele, codeSecret }) {
  fromControleEdit.value = true
  controleValidated.value = false
  phase.value = 'form'
  await loadExistingDossier(codeTele, codeSecret, {
    loadingMessage: t('immat.controle.loadingDossier'),
  })
  form.value.laction = 'Modifier'
  form.value.valider = 'NON'
  step.value = 7
  maxStep.value = 7
  await nextTick()
}

function onControleValidated() {
  controleValidated.value = true
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
  height: min(88vh, 820px);
  max-height: 92vh;
}

.immat-form {
  min-height: 0;
}

.immat-scroll-area {
  height: 0;
  flex: 1 1 auto;
  min-height: 280px;
}

.immat-step-footer {
  flex-shrink: 0;
  background: #f5f7fa;
  border-top: 1px solid #e0e0e0;
}

.immat-header {
  background: linear-gradient(135deg, #1565c0 0%, #1976d2 60%, #42a5f5 100%);
  min-height: unset;
}

/* ── Stepper ── */
.immat-stepper :deep(.q-stepper__header) {
  background: #f5f7fa;
  border-bottom: 1px solid #e0e0e0;
  min-height: unset;
  padding: 2px 4px;
}

.immat-stepper :deep(.q-stepper__tab) {
  min-height: 40px;
  padding: 4px 6px;
}

.immat-stepper :deep(.q-stepper__title) {
  font-size: 0.7rem;
  line-height: 1.15;
  margin-top: 0;
  padding: 0 2px;
}

.immat-stepper :deep(.q-stepper__label) {
  margin-top: 0;
}

.immat-stepper :deep(.q-stepper__dot) {
  width: 22px;
  min-width: 22px;
  height: 22px;
  font-size: 14px;
}

.immat-stepper :deep(.q-stepper__line) {
  margin-top: 11px;
}

/* ── En-têtes de sous-sections ── */
.step-section-header {
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #1565c0;
  background: #e3f2fd;
  border-left: 3px solid #1976d2;
  padding: 3px 8px;
  border-radius: 0 4px 4px 0;
  margin-bottom: 6px;
  margin-top: 2px;
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

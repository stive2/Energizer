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
        <q-icon name="how_to_reg" size="22px" class="q-mr-sm text-white" />
        <div class="col text-subtitle1 text-white text-weight-bold">
          {{ $t(service.name) }}
        </div>
        <q-chip
          :label="form.regimeAffiC || 'Volontaire'"
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
        <input type="hidden" name="CODE_ORIGINEREV" :value="form.CODE_ORIGINEREV" />
        <input type="hidden" name="CODE_REGIMEAV" :value="form.CODE_REGIMEAV" />
        <input type="hidden" name="MIN_DATE_DEBUT_AFFI" :value="form.MIN_DATE_DEBUT_AFFI" />
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

      <q-form
        ref="formRef"
        class="col column immat-form"
        greedy
        reactive-rules
        @submit.prevent="dialValidation = true"
      >
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
                  ÉTAPE 1 : Informations sur l'affiliation
              ══════════════════════════════════════════════ -->
              <q-step
                :name="1"
                :title="$t('immat.step8')"
                icon="info"
                :done="step > 1"
                :error="stepErrors[1]"
                :disable="!isStepAllowed(1)"
              >
                <!-- Bandeau session (imma_assure.js — Date du jour, Affiliation, SMIG) -->
                <div class="row q-col-gutter-sm q-mb-sm vol-session-band">
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="form.DATE_DEMANDE"
                      name="DATE_DEMANDE"
                      :label="$t('inputassu.request_date')"
                      outlined
                      dense
                      readonly
                      filled
                      class="full-width immat-readonly-field"
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="form.regimeAffiC"
                      name="regimeAffiC"
                      :label="$t('inputassu.affiliation_regime')"
                      outlined
                      dense
                      readonly
                      filled
                      class="full-width immat-readonly-field"
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="form.SMIG_VALUE"
                      name="SMIG_VALUE"
                      :label="$t('inputassu.minimum_wage')"
                      outlined
                      dense
                      readonly
                      filled
                      class="full-width immat-readonly-field"
                    />
                  </div>
                </div>

                <!-- Informations sur l'affiliation (info_regime_assure.js — régime 1) -->
                <div class="step-section-header">
                  <q-icon name="account_balance_wallet" class="q-mr-xs" />
                  {{ $t('immat.section.affiliation', "Informations sur l'affiliation") }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.ORIGINE_REVENU"
                      name="ORIGINE_REVENU"
                      :label="$t('inputassu.revenue_source')"
                      :options="origineRevenuList"
                      option-label="LIB_ORIGINEREV"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      :disable="!referentialsReady"
                      @filter="filterOrigineRevenu"
                      @update:model-value="onOrigineRevenuChange"
                      :rules="[required]"
                      :error="hasFieldError('ORIGINE_REVENU')"
                      :error-message="fieldErrorMsg('ORIGINE_REVENU')"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.revenue_source') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.DETAILS_ORIGINEREV"
                      name="DETAILS_ORIGINEREV"
                      :label="$t('inputassu.revenue_source_detail')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      :error="hasFieldError('DETAILS_ORIGINEREV')"
                      :error-message="fieldErrorMsg('DETAILS_ORIGINEREV')"
                      @blur="onDetailsOrigineBlur"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.revenue_source_detail')
                          }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.MONTANT_REV_ANNUEL"
                      name="MONTANT_REV_ANNUEL"
                      :label="$t('inputassu.declared_annual_income')"
                      outlined
                      dense
                      class="full-width"
                      type="number"
                      :rules="[required, validateRevenuAnnuel]"
                      :error="hasFieldError('MONTANT_REV_ANNUEL')"
                      :error-message="fieldErrorMsg('MONTANT_REV_ANNUEL')"
                      @blur="onMontantRevAnnuelChange"
                      @update:model-value="onMontantRevAnnuelChange"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.declared_annual_income')
                          }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.TAUX"
                      name="TAUX"
                      :label="$t('inputassu.contribution_rate')"
                      outlined
                      dense
                      readonly
                      class="full-width"
                      :rules="[required]"
                    >
                      <template v-slot:append>
                        <q-icon name="percent" class="text-grey-8" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.DATE_DEBUT_AFFI_SOLL"
                      name="DATE_DEBUT_AFFI_SOLL"
                      :label="$t('inputassu.requested_affiliation_date')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required, validateDateAffiSoll]"
                      :error="hasFieldError('DATE_DEBUT_AFFI_SOLL')"
                      :error-message="fieldErrorMsg('DATE_DEBUT_AFFI_SOLL')"
                      :disable="!form.CODE_ORIGINEREV"
                      :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                      :hint="dateAffiSollHint"
                      @focus="onDateAffiSollFocus"
                      @blur="onDateDebutAffiSollBlur"
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
                              @update:model-value="onDateDebutAffiSollChange"
                            />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.requested_affiliation_date')
                          }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.DATE_DEBUT_AFFI"
                      name="DATE_DEBUT_AFFI"
                      :label="$t('inputassu.normal_affiliation_date')"
                      outlined
                      dense
                      readonly
                      class="full-width"
                      :rules="[required]"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.normal_affiliation_date')
                          }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.ASSIETTE_COTISATION"
                      name="ASSIETTE_COTISATION"
                      :label="$t('inputassu.contribution_base')"
                      outlined
                      dense
                      type="number"
                      class="full-width"
                      :rules="[required, validateAssietteDigits, validateAssieteCotisation]"
                      :error="hasFieldError('ASSIETTE_COTISATION')"
                      :error-message="fieldErrorMsg('ASSIETTE_COTISATION')"
                      :hint="assietteCotisationHint"
                      @blur="onAssietteCotisationBlur"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.contribution_base') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.MONTANT_COTISATION"
                      name="MONTANT_COTISATION"
                      :label="$t('inputassu.contribution_amount')"
                      outlined
                      dense
                      readonly
                      class="full-width"
                      :rules="[required]"
                    />
                  </div>
                </div>

                <!-- Document principal -->
                <div class="step-section-header">
                  <q-icon name="attach_file" class="q-mr-xs" />
                  {{ $t('immat.section.main_document', 'Document principal') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <!-- Déclaration revenus annuels (504) -->
                  <div class="col-12 col-sm-6">
                    <q-file
                      v-model="form.file504"
                      name="504"
                      :label="$t('inputassu.annual_income_declaration')"
                      outlined
                      dense
                      class="full-width"
                      :counter-label="counterLabelFn"
                      max-files="1"
                      accept=".gif,.jpg,.jpeg,.png,image/gif,image/jpeg,image/png,.pdf"
                      :max-file-size="LEGACY_MAX_FILE_SIZE"
                      :hint="fileHintWithSize($t('inputassu.annual_income_declaration'))"
                      :rules="[required]"
                      :error="hasFieldError('file504')"
                      :error-message="fieldErrorMsg('file504')"
                      @update:model-value="() => reevaluateField('file504')"
                      @rejected="onRejected"
                    >
                      <template v-slot:prepend>
                        <q-icon name="attach_file" color="primary" />
                      </template>
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.annual_income_declaration')
                          }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-file>
                  </div>
                  <!-- Déclaration sur l'honneur (507) -->
                  <div class="col-12 col-sm-6">
                    <q-file
                      v-model="form.file507"
                      name="507"
                      :label="$t('inputassu.honor_declaration_hint')"
                      :hint="fileHintWithSize($t('inputassu.honor_declaration_hint'))"
                      outlined
                      dense
                      class="full-width"
                      :counter-label="counterLabelFn"
                      max-files="1"
                      accept=".gif,.jpg,.jpeg,.png,image/gif,image/jpeg,image/png,.pdf"
                      :max-file-size="LEGACY_MAX_FILE_SIZE"
                      :rules="[required]"
                      :error="hasFieldError('file507')"
                      :error-message="fieldErrorMsg('file507')"
                      @update:model-value="() => reevaluateField('file507')"
                      @rejected="onRejected"
                    >
                      <template v-slot:prepend>
                        <q-icon name="attach_file" color="primary" />
                      </template>
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.honor_declaration_hint')
                          }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-file>
                  </div>
                </div>
              </q-step>

              <!-- ══════════════════════════════════════════════
                  ÉTAPE 2 : Informations personnelles de l'assuré
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
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.gender') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-select>
                  </div>
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
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.last_name') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.PRENOM_PERS"
                      :label="$t('inputassu.first_name')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.PRENOM_PERS = val.toUpperCase())"
                    />
                  </div>
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
                      @blur="() => reevaluateField('DATE_NAISS_PERS')"
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
                              @update:model-value="() => reevaluateField('DATE_NAISS_PERS')"
                            />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.date_of_birth') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.LOCALITE_NAISS"
                      :label="$t('inputassu.place_of_birth')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      @update:model-value="(val) => (form.LOCALITE_NAISS = val.toUpperCase())"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.place_of_birth') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.LieuNaiss"
                      v-bind="arrondissementSelectProps"
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
                      :rules="[required]"
                      :error="hasFieldError('LieuNaiss')"
                      :error-message="fieldErrorMsg('LieuNaiss')"
                      @update:model-value="() => reevaluateField('LieuNaiss')"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.birth_district') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.civilite"
                      name="civilite"
                      :label="$t('inputassu.marital_status')"
                      :options="matrimonialList"
                      option-label="LIBELLE_MATRI"
                      emit-value
                      map-options
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      :disable="!referentialsReady"
                      @filter="filterMatrimonial"
                      :rules="[required]"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.marital_status') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.NATIONALITEC"
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
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.nationality') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-select>
                  </div>
                </div>

                <!-- Sous-section : Pièce d'identité -->
                <div class="step-section-header">
                  <q-icon name="credit_card" class="q-mr-xs" />
                  {{ $t('immat.section.id_doc', "Pièce d'identité") }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
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
                      @update:model-value="() => reevaluateField('typepiece')"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.identity_document_type')
                          }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.NUM_PIECE"
                      :label="$t('inputassu.identity_document_number')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      @update:model-value="(val) => (form.NUM_PIECE = val.toUpperCase())"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.identity_document_number')
                          }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.DATE_PIECE"
                      :label="$t('inputassu.issued_on')"
                      outlined
                      dense
                      class="full-width"
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
                        <span class="req-label">
                          {{ $t('inputassu.issued_on') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.LIEU_PIECEC"
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
                      :hint="$t('inputassu.place_issuance_identity_document')"
                      :disable="!referentialsReady"
                      @filter="filterArrondissement"
                      :rules="[required]"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.place_issuance_identity_document')
                          }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-select>
                  </div>
                  <div v-if="form.NUM_TYPEPIECE || form.typepiece" class="col-12 col-sm-6">
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
                      @update:model-value="() => reevaluateField('pieceIdentite')"
                      @rejected="onRejected"
                    >
                      <template v-slot:prepend>
                        <q-icon name="upload_file" color="primary" />
                      </template>
                    </q-file>
                  </div>
                  <div
                    v-if="form.NUM_TYPEPIECE && form.NUM_TYPEPIECE !== '99'"
                    class="col-12 col-sm-6"
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
                      @update:model-value="() => reevaluateField('declarationHonneur')"
                      @rejected="onRejected"
                    >
                      <template v-slot:prepend>
                        <q-icon name="upload_file" color="primary" />
                      </template>
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
                      @update:model-value="
                        (val) => {
                          form.NOM_PERE = val.toUpperCase()
                          reevaluateField('NOM_PERE')
                        }
                      "
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
                      @blur="() => reevaluateField('DATE_NAISS_PERSP')"
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
                      v-bind="arrondissementSelectProps"
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
                  <div v-if="form.etatP === 'Décédé'" class="col-12 col-sm-3">
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
                      @update:model-value="(val) => (form.NOM_MERE = val.toUpperCase())"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.last_name') }}<span class="req-badge">*</span>
                        </span>
                      </template>
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
                      @blur="() => reevaluateField('DATE_NAISS_PERSM')"
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
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.date_of_birth') }}<span class="req-badge">*</span>
                        </span>
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
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.place_of_birth') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.LieuNaissMere"
                      v-bind="arrondissementSelectProps"
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
                      :rules="[required]"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.birth_district') }}<span class="req-badge">*</span>
                        </span>
                      </template>
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
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.alive') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-select>
                  </div>
                  <div v-if="form.etatM === 'Décédé'" class="col-12 col-sm-3">
                    <q-input
                      v-model="form.DATE_DECES_PERSM"
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
                  ÉTAPE 5 : Contact et Résidence
              ══════════════════════════════════════════════ -->
              <q-step
                :name="5"
                :title="$t('immat.step5')"
                icon="contact_phone"
                :done="step > 5 || step < 5"
                :error="stepErrors[5]"
                :disable="!isStepAllowed(5)"
              >
                <div class="step-section-header">
                  <q-icon name="home" class="q-mr-xs" />
                  {{ $t('immat.section.residence', 'Résidence') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.CODE_VILLEC"
                      v-bind="arrondissementSelectProps"
                      :label="$t('inputassu.city_of_residence')"
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
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.city_of_residence') }}<span class="req-badge">*</span>
                        </span>
                      </template>
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
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.phone') }}<span class="req-badge">*</span>
                        </span>
                      </template>
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
                      <template v-slot:prepend><q-icon name="email" /></template>
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.email') }}<span class="req-badge">*</span>
                        </span>
                      </template>
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
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('inputassu.centreCNPS') }}<span class="req-badge">*</span>
                        </span>
                      </template>
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
                        :hint="
                          fileHintWithSize(
                            $t('inputassu.birth_certificate_child', { number: index }),
                          )
                        "
                        outlined
                        dense
                        class="full-width"
                        accept=".jpg,.jpeg,.png,.pdf"
                        :max-file-size="LEGACY_MAX_FILE_SIZE"
                        :rules="[(val) => !!val || $t('input.requis')]"
                        :error="stepErrors[6] && !form.actesNaissance[index - 1]"
                        @rejected="onRejected"
                      >
                        <template v-slot:label>
                          <span class="req-label">
                            {{ $t('inputassu.birth_certificate_child', { number: index })
                            }}<span class="req-badge">*</span>
                          </span>
                        </template>
                        <template v-slot:prepend><q-icon name="attach_file" /></template>
                      </q-file>
                    </div>
                  </template>
                </div>

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
                        :hint="
                          fileHintWithSize($t('inputassu.work_certificates', { number: index }))
                        "
                        outlined
                        dense
                        class="full-width"
                        accept=".jpg,.jpeg,.png,.pdf"
                        :max-file-size="LEGACY_MAX_FILE_SIZE"
                        :rules="[(val) => !!val || $t('input.requis')]"
                        :error="stepErrors[6] && !form.certificatsTravail[index - 1]"
                        @rejected="onRejected"
                      >
                        <template v-slot:label>
                          <span class="req-label">
                            {{ $t('inputassu.work_certificates', { number: index })
                            }}<span class="req-badge">*</span>
                          </span>
                        </template>
                        <template v-slot:prepend><q-icon name="attach_file" /></template>
                      </q-file>
                    </div>
                  </template>
                </div>

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
                      @update:model-value="
                        (v) => {
                          form.nombConj = v
                          resetFileField('actesMariage')
                          reevaluateField('nombConj')
                        }
                      "
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
                        :hint="
                          fileHintWithSize(
                            $t('inputassu.marriages_certificates', { number: index }),
                          )
                        "
                        outlined
                        dense
                        class="full-width"
                        accept=".jpg,.jpeg,.png,.pdf"
                        :max-file-size="LEGACY_MAX_FILE_SIZE"
                        :rules="[(val) => !!val || $t('input.requis')]"
                        :error="stepErrors[6] && !form.actesMariage[index - 1]"
                        @rejected="onRejected"
                      >
                        <template v-slot:label>
                          <span class="req-label">
                            {{ $t('inputassu.marriages_certificates', { number: index })
                            }}<span class="req-badge">*</span>
                          </span>
                        </template>
                        <template v-slot:prepend><q-icon name="attach_file" /></template>
                      </q-file>
                    </div>
                  </template>
                </div>
              </q-step>

              <!-- ══════════════════════════════════════════════
                  ÉTAPE 7 : Récapitulatif & Validation finale
              ══════════════════════════════════════════════ -->
              <q-step
                :name="7"
                :title="$t('immat.step7')"
                icon="check_circle"
                :done="step > 7"
                :error="stepErrors[7]"
                :disable="!isStepAllowed(7)"
              >
                <div class="q-pa-sm" ref="recapContent">
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

                  <!-- Grille des sections -->
                  <div class="row q-col-gutter-lg">
                    <!-- Section 1 : Affiliation -->
                    <div class="col-12 col-lg-6">
                      <q-card
                        flat
                        bordered
                        class="recap-card q-mb-md"
                        :class="{ 'shadow-10': $q.dark.isActive, 'shadow-2': !$q.dark.isActive }"
                      >
                        <q-card-section class="bg-gradient-primary text-white q-py-sm">
                          <div class="row items-center no-wrap">
                            <q-icon name="account_balance_wallet" size="sm" class="q-mr-sm" />
                            <div class="text-subtitle1 text-weight-bold col">
                              {{ $t('immat.step8') }}
                            </div>
                            <q-btn
                              flat
                              round
                              color="white"
                              icon="edit"
                              size="xs"
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
                              <q-item-section avatar
                                ><q-icon name="badge" color="primary"
                              /></q-item-section>
                              <q-item-section>
                                <q-item-label class="text-weight-medium">{{
                                  $t('inputassu.revenue_source')
                                }}</q-item-label>
                                <q-item-label caption class="text-body2">{{
                                  form.ORIGINE_REVENU?.LIB_ORIGINEREV ||
                                  $t('inputassu.not_specified')
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                            <q-item class="q-py-sm">
                              <q-item-section avatar
                                ><q-icon name="calendar_today" color="primary"
                              /></q-item-section>
                              <q-item-section>
                                <q-item-label class="text-weight-medium">{{
                                  $t('inputassu.normal_affiliation_date')
                                }}</q-item-label>
                                <q-item-label caption class="text-body2">{{
                                  form.DATE_DEBUT_AFFI || $t('inputassu.not_specified')
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                            <q-item class="q-py-sm">
                              <q-item-section avatar
                                ><q-icon name="business_center" color="primary"
                              /></q-item-section>
                              <q-item-section>
                                <q-item-label class="text-weight-medium">{{
                                  $t('inputassu.revenue_source_detail')
                                }}</q-item-label>
                                <q-item-label caption class="text-body2">{{
                                  form.DETAILS_ORIGINEREV || $t('inputassu.not_specified')
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                            <q-item class="q-py-sm">
                              <q-item-section avatar
                                ><q-icon name="calendar_today" color="primary"
                              /></q-item-section>
                              <q-item-section>
                                <q-item-label class="text-weight-medium">{{
                                  $t('inputassu.requested_affiliation_date')
                                }}</q-item-label>
                                <q-item-label caption class="text-body2">{{
                                  form.DATE_DEBUT_AFFI_SOLL || $t('inputassu.not_specified')
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                            <q-expansion-item
                              icon="more_horiz"
                              :label="$t('form.more_details')"
                              class="text-primary"
                            >
                              <q-list>
                                <q-item class="q-py-sm">
                                  <q-item-section avatar
                                    ><q-icon name="attach_money" color="secondary"
                                  /></q-item-section>
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
                                  <q-item-section avatar
                                    ><q-icon name="attach_money" color="secondary"
                                  /></q-item-section>
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
                                  <q-item-section avatar
                                    ><q-icon name="percent" color="secondary"
                                  /></q-item-section>
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
                                  <q-item-section avatar
                                    ><q-icon name="money" color="secondary"
                                  /></q-item-section>
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
                                  <q-item-section avatar
                                    ><q-icon name="description" color="secondary"
                                  /></q-item-section>
                                  <q-item-section>
                                    <q-item-label class="text-weight-medium">{{
                                      $t('inputassu.annual_income_declaration')
                                    }}</q-item-label>
                                    <q-item-label caption>{{
                                      form.file504?.name || $t('inputassu.not_specified')
                                    }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                                <q-item class="q-py-sm">
                                  <q-item-section avatar
                                    ><q-icon name="description" color="secondary"
                                  /></q-item-section>
                                  <q-item-section>
                                    <q-item-label class="text-weight-medium">{{
                                      $t('inputassu.honor_declaration')
                                    }}</q-item-label>
                                    <q-item-label caption>{{
                                      form.file507?.name || $t('inputassu.not_specified')
                                    }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </q-list>
                            </q-expansion-item>
                          </q-list>
                        </q-card-section>
                      </q-card>
                    </div>

                    <!-- Section 2 : Informations Personnelles -->
                    <div class="col-12 col-lg-6">
                      <q-card
                        flat
                        bordered
                        class="recap-card q-mb-md"
                        :class="{ 'shadow-10': $q.dark.isActive, 'shadow-2': !$q.dark.isActive }"
                      >
                        <q-card-section class="bg-gradient-secondary text-white q-py-sm">
                          <div class="row items-center no-wrap">
                            <q-icon name="person" size="sm" class="q-mr-sm" />
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
                            >
                              <q-tooltip>{{ $t('form.edit') }}</q-tooltip>
                            </q-btn>
                          </div>
                        </q-card-section>
                        <q-card-section class="q-pa-none">
                          <q-list separator>
                            <q-item class="q-py-sm">
                              <q-item-section avatar
                                ><q-icon name="person" color="secondary"
                              /></q-item-section>
                              <q-item-section>
                                <q-item-label class="text-weight-medium">{{
                                  $t('inputassu.last_name')
                                }}</q-item-label>
                                <q-item-label caption class="text-body2">{{
                                  form.NOM_PERS || $t('inputassu.not_specified')
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                            <q-item class="q-py-sm">
                              <q-item-section avatar
                                ><q-icon name="person_outline" color="secondary"
                              /></q-item-section>
                              <q-item-section>
                                <q-item-label class="text-weight-medium">{{
                                  $t('inputassu.first_name')
                                }}</q-item-label>
                                <q-item-label caption class="text-body2">{{
                                  form.PRENOM_PERS || $t('inputassu.not_specified')
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                            <q-item class="q-py-sm">
                              <q-item-section avatar
                                ><q-icon name="calendar_today" color="secondary"
                              /></q-item-section>
                              <q-item-section>
                                <q-item-label class="text-weight-medium">{{
                                  $t('inputassu.date_of_birth')
                                }}</q-item-label>
                                <q-item-label caption class="text-body2">{{
                                  form.DATE_NAISS_PERS || $t('inputassu.not_specified')
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                            <q-item class="q-py-sm">
                              <q-item-section avatar
                                ><q-icon name="place" color="secondary"
                              /></q-item-section>
                              <q-item-section>
                                <q-item-label class="text-weight-medium">{{
                                  $t('inputassu.place_of_birth')
                                }}</q-item-label>
                                <q-item-label caption class="text-body2">{{
                                  form.LOCALITE_NAISS || $t('inputassu.not_specified')
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
                                  <q-item-section avatar
                                    ><q-icon name="wc" color="secondary"
                                  /></q-item-section>
                                  <q-item-section>
                                    <q-item-label class="text-weight-medium">{{
                                      $t('inputassu.gender')
                                    }}</q-item-label>
                                    <q-item-label caption>{{
                                      form.SEXE_PERS || $t('inputassu.not_specified')
                                    }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                                <q-item class="q-py-sm">
                                  <q-item-section avatar
                                    ><q-icon name="flag" color="secondary"
                                  /></q-item-section>
                                  <q-item-section>
                                    <q-item-label class="text-weight-medium">{{
                                      $t('inputassu.nationality')
                                    }}</q-item-label>
                                    <q-item-label caption>{{
                                      form.NATIONALITEC?.nationalite ||
                                      $t('inputassu.not_specified')
                                    }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                                <q-item class="q-py-sm">
                                  <q-item-section avatar
                                    ><q-icon name="credit_card" color="secondary"
                                  /></q-item-section>
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
                                  <q-item-section avatar
                                    ><q-icon name="phone" color="info"
                                  /></q-item-section>
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
                                  <q-item-section avatar
                                    ><q-icon name="home" color="info"
                                  /></q-item-section>
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
                                  <q-item-section avatar
                                    ><q-icon name="email" color="info"
                                  /></q-item-section>
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
                                  <q-item-section avatar
                                    ><q-icon name="markunread_mailbox" color="pink"
                                  /></q-item-section>
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
                                  <q-item-section avatar
                                    ><q-icon name="business" color="pink"
                                  /></q-item-section>
                                  <q-item-section>
                                    <q-item-label class="text-weight-medium">{{
                                      $t('inputassu.centreCNPS')
                                    }}</q-item-label>
                                    <q-item-label caption>{{
                                      form.CODE_CENTRECNPSC?.LIB_CENTRE ||
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
                            >
                              <q-tooltip>{{ $t('form.edit') }}</q-tooltip>
                            </q-btn>
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
                                    >
                                      {{ form.actesNaissance.length }} {{ $t('form.children') }}
                                    </q-chip>
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
                                    >
                                      {{ file.name || file.nom || 'Fichier ' + (index + 1) }}
                                    </q-chip>
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
                                    >
                                      {{ form.certificatsTravail.length }}
                                      {{ $t('form.certificat') }}
                                    </q-chip>
                                  </q-item-label>
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
                            <div class="col-12">
                              <q-item class="q-px-none">
                                <q-item-section avatar
                                  ><q-icon name="people" color="warning"
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
                                    >
                                      {{ form.actesMariage.length }} {{ $t('form.conjoint') }}
                                    </q-chip>
                                  </q-item-label>
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
                </div>
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
    </q-card>

    <!-- ═══ DIALOGUE PDF PREVIEW ═══ -->
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
import { ref, computed, watch, defineProps, onMounted, defineEmits, nextTick } from 'vue'
import { useNotify } from 'src/modules/shared/components/useNotify.js'
import {
  initImmatAssuVolRegime1,
  syncGererAssureTauxVolFields,
  buildLegacyFormDataVol,
  validateRegime1BusinessFieldMap,
  updateAssietteCotisationVol,
  updateMontantCotisationFromAssietteVol,
  getAssietteCotisationBounds,
  applyVolSmigForAffiliationDate,
  updateSmigFromAffiliationDateFallback,
  normalizeQDateForLegacyCompare,
} from 'src/modules/immatriculations/utils/immatAssuVolLegacy.js'
import {
  compareDates,
  syncLegacyHiddenFields,
} from 'src/modules/immatriculations/utils/immatAssuTrvLegacy.js'
import { useI18n } from 'vue-i18n'
import html2pdf from 'html2pdf.js'
import { submitTeleImmatAssure } from 'src/modules/immatriculations/api/immatAssureApi.js'
import {
  fetchAssureTele,
  fetchImmatAssuVolReferentials,
  fetchSessionAssureInit,
  fetchSmigLinesByRegime,
} from 'src/modules/immatriculations/api/teleImmatAssureApi.js'
import {
  applyAssureTeleToForm,
  applyAssureTeleVolFields,
} from 'src/modules/immatriculations/adapters/assureTeleAdapter.js'
import ImmatAssuTrvControle from 'src/modules/immatriculations/components/ImmatAssuTrvControle.vue'
import { useQuasar } from 'quasar'
import { regexPatterns } from 'src/js/regex.js'
import { LEGACY_TELEIMMAS_DIGIT_LIMITS } from 'src/modules/immatriculations/utils/immatLegacyCommon.js'

/** Taille max pièce jointe — alignée teleImmat / GererAssure (3 Mo). */
const LEGACY_MAX_FILE_SIZE = 3072000

const $q = useQuasar()
const props = defineProps({
  service: Object,
  codeTele: { type: String, default: '' },
  codeSecret: { type: String, default: '' },
})

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
const volSmigLines = ref([])

const loadingInit = ref(false)
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
const origineRevenuAll = ref([])

const arrondissements = ref([])
const pays = ref([])
const pieces = ref([])
const centres = ref([])
const matrimonialList = ref([])
const origineRevenuList = ref([])

function applyReferentials(refs) {
  arrondissementsAll.value = [...refs.arrondissements]
  paysAll.value = [...refs.pays]
  piecesAll.value = [...refs.pieces]
  centresAll.value = [...refs.centres]
  matrimonialAll.value = [...refs.matrimonial]
  origineRevenuAll.value = [...refs.origineRevenu]

  arrondissements.value = [...refs.arrondissements]
  pays.value = [...refs.pays]
  pieces.value = [...refs.pieces]
  centres.value = [...refs.centres]
  matrimonialList.value = [...refs.matrimonial]
  origineRevenuList.value = [...refs.origineRevenu]
  referentialsReady.value = true
}

function createImmatAssuVolFormDefaults() {
  return {
    regime: '1',
    regimeAffi: '1',
    regimeAffiC: 'Volontaire',
    ORIGINE_REVENU: null,
    CODE_ORIGINEREV: '',
    CODE_REGIMEAV: '',
    DATE_DEBUT_AFFI: '',
    MIN_DATE_DEBUT_AFFI: '',
    DETAILS_ORIGINEREV: '',
    DATE_DEBUT_AFFI_SOLL: '',
    MONTANT_REV_ANNUEL: '',
    ASSIETTE_COTISATION: '',
    TAUX: '',
    SMIG_VALUE: '',
    MONTANT_COTISATION: '',
    DATE_DEMANDE: '',
    code_tele: '',
    code_secret: '',
    date_effet: '',
    taux: '',
    min_date_effet: '',
    smig_annuel: '',
    max_cotisation_annuel: '',
    Dest: 'dossiers/assure/immas/',
    laction: 'Créer',
    valider: 'OUI',
    minDateAffi: '',
    file504: null,
    file507: null,
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

const form = ref(createImmatAssuVolFormDefaults())

function getReferentialsSnapshot() {
  return {
    arrondissements: arrondissementsAll.value,
    pays: paysAll.value,
    pieces: piecesAll.value,
    centres: centresAll.value,
    matrimonial: matrimonialAll.value,
    origineRevenu: origineRevenuAll.value,
  }
}

async function loadFormBootstrap() {
  loadingInit.value = true
  referentialsReady.value = false
  referentialsError.value = null
  try {
    referentialsLoadingLabel.value = t('immat.referentials.loadingLists')
    const refs = await fetchImmatAssuVolReferentials('1')
    applyReferentials(refs)

    referentialsLoadingLabel.value = t('immat.referentials.loadingSession')
    const session = await fetchSessionAssureInit({ regime: '1' }).catch(() => null)
    if (session) {
      initImmatAssuVolRegime1(form.value, session)
    } else {
      initImmatAssuVolRegime1(form.value)
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
    applyAssureTeleVolFields(form.value, row, getReferentialsSnapshot())
    form.value.code_tele = codeTele
    form.value.code_secret = codeSecret
    if (form.value._dossierExploite) {
      notifyError(t('immat.controle.dossierExploite'))
    }
    syncGererAssureTauxVolFields(form.value)
    if (form.value.CODE_REGIMEAV) {
      await loadVolSmigLines(form.value.CODE_REGIMEAV)
    }
    refreshVolSmigForAffiliationDate()
    if (form.value.MONTANT_REV_ANNUEL) {
      updateAssietteCotisationVol(form.value)
    }
  } catch (e) {
    notifyError(e?.message || t('messages.error'))
  } finally {
    $q.loading.hide()
  }
}

async function loadVolSmigLines(codeRegime) {
  const debut = form.value.min_date_effet || '25/07/2014'
  try {
    const lines = await fetchSmigLinesByRegime(codeRegime, debut)
    if (!lines.length) {
      notifyError(t('immat.vol.smigNotConfigured', 'Régime non paramétré pour cette activité.'))
      volSmigLines.value = []
      return
    }
    volSmigLines.value = lines
  } catch (e) {
    volSmigLines.value = []
    notifyError(e?.message || t('messages.error'))
  }
}

/** Mise à jour SMIG selon la date sollicitée — sans recalculer l'assiette (legacy blur DATE_DEBUT_AFFI_SOLL). */
function refreshVolSmigForAffiliationDate() {
  const dateStr = form.value.DATE_DEBUT_AFFI_SOLL
  if (!dateStr) return
  if (volSmigLines.value.length) {
    applyVolSmigForAffiliationDate(form.value, volSmigLines.value, dateStr)
  } else if (form.value.CODE_REGIMEAV) {
    updateSmigFromAffiliationDateFallback(form.value, dateStr)
  }
  if (form.value.ASSIETTE_COTISATION) {
    updateMontantCotisationFromAssietteVol(form.value)
  }
}

async function onOrigineRevenuChange(origine) {
  if (origine && typeof origine === 'object') {
    form.value.CODE_ORIGINEREV = origine.CODE_ORIGINEREV || ''
    form.value.CODE_REGIMEAV = origine.CODE_REGIME || ''
  } else {
    form.value.CODE_ORIGINEREV = ''
    form.value.CODE_REGIMEAV = ''
    volSmigLines.value = []
    form.value.SMIG_VALUE = ''
    reevaluateField('ORIGINE_REVENU')
    return
  }
  if (form.value.CODE_REGIMEAV) {
    await loadVolSmigLines(form.value.CODE_REGIMEAV)
    refreshVolSmigForAffiliationDate()
  }
  reevaluateField('ORIGINE_REVENU')
}

function onDetailsOrigineBlur() {
  form.value.DETAILS_ORIGINEREV = String(form.value.DETAILS_ORIGINEREV || '')
    .toUpperCase()
    .trim()
  reevaluateField('DETAILS_ORIGINEREV')
}

function onDateAffiSollFocus() {
  if (!form.value.CODE_ORIGINEREV) {
    notifyError(
      t('immat.vol.selectOrigineFirst', "Veuillez d'abord choisir l'origine des revenus."),
    )
  }
}

function onDateDebutAffiSollChange() {
  if (!form.value.CODE_ORIGINEREV) {
    form.value.DATE_DEBUT_AFFI_SOLL = ''
    notifyError(
      t('immat.vol.selectOrigineFirst', "Veuillez d'abord choisir l'origine des revenus."),
    )
    return
  }
  refreshVolSmigForAffiliationDate()
}

function onDateDebutAffiSollBlur() {
  if (!form.value.CODE_ORIGINEREV) {
    form.value.DATE_DEBUT_AFFI_SOLL = ''
    return
  }
  const d = form.value.DATE_DEBUT_AFFI_SOLL
  if (!d) return
  if (form.value.MIN_DATE_DEBUT_AFFI && compareDates(d, form.value.MIN_DATE_DEBUT_AFFI) < 0) {
    notifyError(
      t(
        'immat.vol.dateAffiSollBeforeMin',
        "La date d'affiliation sollicitée est antérieure à la date minimum autorisée.",
      ),
    )
    return
  }
  if (form.value.DATE_DEBUT_AFFI && compareDates(d, form.value.DATE_DEBUT_AFFI) > 0) {
    notifyError(
      t(
        'immat.vol.dateAffiSollAfterMax',
        "La date d'affiliation sollicitée est postérieure à la date d'affiliation normale.",
      ),
    )
    return
  }
  refreshVolSmigForAffiliationDate()
  reevaluateField('DATE_DEBUT_AFFI_SOLL')
}

function onAssietteCotisationBlur() {
  updateMontantCotisationFromAssietteVol(form.value)
  reevaluateField('ASSIETTE_COTISATION')
}

onMounted(() => {
  referentialsLoadingLabel.value = t('immat.referentials.loading')
  loadFormBootstrap()
})

watch(
  () => form.value,
  () => syncLegacyHiddenFields(form.value),
  { deep: true },
)

const fileMaxSizeHint = computed(() => t('form.maxFileSizeHint'))

function fileHintWithSize(label = '') {
  const max = fileMaxSizeHint.value
  return label ? `${label} — ${max}` : max
}

watch(
  () => form.value.typepiece,
  (piece) => {
    form.value.NUM_TYPEPIECE = piece?.NUM_TYPEPIECE || ''
    if (!form.value.NUM_TYPEPIECE || form.value.NUM_TYPEPIECE === '99') {
      form.value.declarationHonneur = null
    }
  },
)

const validateRevenuAnnuel = (val) => {
  const rev = String(val ?? '').trim()
  if (!/^\d{5,10}$/.test(rev)) {
    return 'Le revenu doit comporter entre 5 et 10 chiffres.'
  }
  return true
}

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

/** Champs liés — réévaluation croisée à la saisie. */
const FIELD_RELATED = {
  ORIGINE_REVENU: ['MONTANT_REV_ANNUEL', 'ASSIETTE_COTISATION'],
  DATE_DEBUT_AFFI_SOLL: ['ASSIETTE_COTISATION', 'MONTANT_COTISATION'],
  MONTANT_REV_ANNUEL: ['ASSIETTE_COTISATION', 'MONTANT_COTISATION'],
  ASSIETTE_COTISATION: ['MONTANT_COTISATION'],
  DATE_NAISS_PERS: ['DATE_NAISS_PERSM', 'DATE_NAISS_PERSP', 'DATE_DEBUT_AFFI_SOLL'],
  DATE_NAISS_PERSM: ['DATE_NAISS_PERS'],
  DATE_NAISS_PERSP: ['DATE_NAISS_PERS', 'NOM_PERE'],
  NOM_PERE: ['DATE_NAISS_PERSP'],
  typepiece: ['pieceIdentite', 'declarationHonneur', 'NUM_TYPEPIECE'],
  pieceIdentite: ['declarationHonneur'],
}

function updateStepErrorState() {
  const currentStep = step.value
  const map = validateRegime1BusinessFieldMap(form.value, currentStep)
  stepErrors.value[currentStep] = Object.keys(map).length > 0
}

/**
 * Réévalue un champ à la saisie — affiche ou retire l'erreur sur le champ concerné.
 * @param {string} field
 */
function reevaluateField(field) {
  syncLegacyHiddenFields(form.value)
  const keys = [field, ...(FIELD_RELATED[field] || [])]
  const next = { ...fieldErrors.value }

  for (const scope of [step.value, null]) {
    const map = validateRegime1BusinessFieldMap(form.value, scope)
    for (const key of keys) {
      if (map[key]) next[key] = map[key]
      else delete next[key]
    }
  }

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
  fieldErrors.value = validateRegime1BusinessFieldMap(form.value, stepScope)
  const valid = await formRef.value?.validate()
  const businessOk = Object.keys(fieldErrors.value).length === 0
  await nextTick()
  if (!valid || !businessOk) {
    const firstBusiness = Object.values(fieldErrors.value)[0]
    if (firstBusiness) {
      notifyError(firstBusiness)
    } else if (!valid) {
      notifyError(t('immat.validation.requiredFields', 'Veuillez corriger les champs signalés.'))
    }
    scrollToFirstInvalid()
    return false
  }
  return true
}

const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || t('errors.invalidEmail')

const dateAffiSollHint = computed(() => {
  const min = form.value.MIN_DATE_DEBUT_AFFI
  const max = form.value.DATE_DEBUT_AFFI
  if (min && max) {
    return locale.value === 'fr'
      ? `Entre ${min} et ${max} (JJ/MM/AAAA)`
      : `Between ${min} and ${max}`
  }
  return locale.value === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'
})

const assietteCotisationHint = computed(() => {
  const { min, max } = getAssietteCotisationBounds(form.value)
  if (min != null && max != null) {
    return t('immat.vol.assietteBounds', { min, max }, `Entre ${min} et ${max} F CFA`)
  }
  if (min != null) {
    return t('immat.vol.assietteMin', { min }, `Minimum ${min} F CFA (SMIG)`)
  }
  if (max != null) {
    return t('immat.vol.assietteMax', { max }, `Maximum ${max} F CFA`)
  }
  return ''
})

const optionsDateAffiliation = (dateStr) => {
  if (!form.value.MIN_DATE_DEBUT_AFFI || !form.value.DATE_DEBUT_AFFI) return true
  const normalized = normalizeQDateForLegacyCompare(dateStr)
  return (
    compareDates(normalized, form.value.MIN_DATE_DEBUT_AFFI) >= 0 &&
    compareDates(normalized, form.value.DATE_DEBUT_AFFI) <= 0
  )
}

const validateDateAffiSoll = (val) => {
  if (!val) return true
  if (form.value.MIN_DATE_DEBUT_AFFI && compareDates(val, form.value.MIN_DATE_DEBUT_AFFI) < 0) {
    return t('immat.vol.dateAffiSollBeforeMin', 'Date antérieure au minimum autorisé.')
  }
  if (form.value.DATE_DEBUT_AFFI && compareDates(val, form.value.DATE_DEBUT_AFFI) > 0) {
    return t('immat.vol.dateAffiSollAfterMax', "Date postérieure à l'affiliation normale.")
  }
  return true
}

const validateAssietteDigits = (val) => {
  const s = String(val ?? '').trim()
  if (!/^\d{5,10}$/.test(s)) {
    return t('immat.vol.assietteDigits', "L'assiette doit comporter entre 5 et 10 chiffres.")
  }
  return true
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

const filterOrigineRevenu = (val, update) => {
  update(() => {
    const needle = (val || '').toLowerCase()
    origineRevenuList.value = needle
      ? origineRevenuAll.value.filter((item) =>
          String(item.LIB_ORIGINEREV || '')
            .toLowerCase()
            .includes(needle),
        )
      : [...origineRevenuAll.value]
  })
}

const onMontantRevAnnuelChange = () => {
  updateAssietteCotisationVol(form.value)
  reevaluateField('MONTANT_REV_ANNUEL')
}

/* const onFileSelected = (field, index) => {
  // hook pour traitement futur si nécessaire
} */

const resetFileField = (field) => {
  form.value[field] = ['file504', 'file507', 'pieceIdentite', 'declarationHonneur'].includes(field)
    ? null
    : []
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

const goToPreviousStep = () => {
  if (step.value > 1) {
    step.value -= 1
  }
}

const validateAssieteCotisation = (val) => {
  if (!val) return 'Champ requis'
  const n = Number(val)
  const { min, max } = getAssietteCotisationBounds(form.value)
  if (min != null && !Number.isNaN(n) && n < min) {
    return t('immat.vol.assietteBelowSmig', { min }, `Assiette inférieure au SMIG (${min} F CFA)`)
  }
  if (max != null && !Number.isNaN(n) && n > max) {
    return t('immat.vol.assietteAboveMax', 'Assiette supérieure au maximum autorisé')
  }
  return true
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
    const formData = buildLegacyFormDataVol(form.value, {
      submissionType: revalidateFromControle ? 'definitive' : 'temporary',
    })
    if (import.meta.env.DEV) {
      console.info('GererAssure FormData (régime 1):', [...formData.entries()])
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

/* ── Recap cards ── */
.recap-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.recap-card:hover {
  transform: translateY(-2px);
}

/* ── Gradients ── */
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

/* ── Hover effect ── */
.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.1);
}

/* ── Animation pulse ── */
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

/* ── Mobile ── */
.custom-mobile-text {
  font-size: 14px;
  line-height: 1.5rem;
}

.immat-readonly-field :deep(.q-field__control) {
  background: #f5f5f5;
}

.vol-session-band {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 8px;
}

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
</style>

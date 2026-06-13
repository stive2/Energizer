<template>
  <q-dialog v-model="open" persistent full-width>
    <q-card
      :style="$q.screen.gt.sm ? 'width: 960px; max-width: 98vw' : 'width: 100%'"
      class="immat-main-card column no-wrap"
    >
      <!-- ═══ EN-TÊTE ═══ -->
      <q-card-section class="immat-header row items-center no-wrap q-px-md q-py-xs">
        <q-icon name="business" size="22px" class="q-mr-sm text-white" />
        <div class="col text-subtitle1 text-white text-weight-bold">
          {{ $t(service.name) }}
        </div>
        <q-chip
          label="Employeur DOM"
          color="white"
          text-color="primary"
          dense
          icon="home_work"
          class="q-ml-sm"
        />
        <q-btn flat round dense icon="close" color="white" class="q-ml-sm" @click="closeDialog" />
      </q-card-section>

      <q-separator />

      <q-form
        ref="formRef"
        class="col column immat-form"
        greedy
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
                  ÉTAPE 1 : Identification de l'employeur
              ══════════════════════════════════════════════ -->
              <q-step
                :name="1"
                :title="$t('immed.step1')"
                icon="person"
                :done="step > 1"
                :disable="!isStepAllowed(1)"
              >
                <!-- Sous-section : État civil -->
                <div class="step-section-header">
                  <q-icon name="perm_identity" class="q-mr-xs" />
                  {{ $t('immed.step1') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.CAUSE_IMMA"
                      :options="causeImmaOptions"
                      :label="$t('input.origineImmatriculation')"
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      @update:model-value="syncHidden"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('input.origineImmatriculation') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.CIRCUIT_DOSSIER"
                      :options="circuitDossierOptions"
                      :label="$t('input.origineDossier')"
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      @update:model-value="syncHidden"
                    >
                      <template v-slot:label>
                        <span class="req-label">
                          {{ $t('input.origineDossier') }}<span class="req-badge">*</span>
                        </span>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.NOM_PERSEMPL"
                      :label="$t('input.nom')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      @update:model-value="(val) => (form.NOM_PERSEMPL = val.toUpperCase())"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.nom') }}<span class="req-badge">*</span></span
                        >
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.PRENOM_PERSEMPL"
                      :label="$t('input.prenom')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.PRENOM_PERSEMPL = val.toUpperCase())"
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="form.DATE_NAISS_PERSEMPL"
                      outlined
                      :label="$t('input.dateNaissance')"
                      dense
                      class="full-width"
                      :rules="[required]"
                      :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                      :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.dateNaissance') }}<span class="req-badge">*</span></span
                        >
                      </template>
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
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="form.LOCALITE_NAISS_PERSEMPL"
                      :label="$t('input.lieuNaissance')"
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                      @update:model-value="
                        (val) => (form.LOCALITE_NAISS_PERSEMPL = val.toUpperCase())
                      "
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.lieuNaissance') }}<span class="req-badge">*</span></span
                        >
                      </template>
                      <template v-slot:prepend><q-icon name="place" /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-select
                      v-model="form.LieuNaissPe"
                      :options="arrondissements"
                      option-label="NOM_ARROND"
                      option-value="CODE_ARROND"
                      :label="$t('input.arrondissementNaissance')"
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
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.arrondissementNaissance')
                          }}<span class="req-badge">*</span></span
                        >
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-4">
                    <!-- Sexe : valeurs F/M conformes au legacy JS -->
                    <q-select
                      v-model="form.SEXE_PERSEMPL"
                      :options="sexeOptions"
                      :label="$t('input.sexe')"
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                      outlined
                      dense
                      class="full-width"
                      :rules="[required]"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.sexe') }}<span class="req-badge">*</span></span
                        >
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-select
                      v-model="form.NATIONALITEC"
                      :options="pays"
                      option-label="nationalite"
                      option-value="code_pays"
                      :label="$t('input.nationalite')"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      @filter="filterPays"
                      :rules="[required]"
                      @update:model-value="syncHidden"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.nationalite') }}<span class="req-badge">*</span></span
                        >
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="form.PROFESSION"
                      :label="$t('input.profession')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.PROFESSION = val.toUpperCase())"
                    />
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
                      v-model="form.NUM_TYPEPIECE"
                      :options="pieces"
                      option-label="LIBELLE"
                      option-value="NUM_TYPEPIECE"
                      :label="$t('input.pieceIdentite')"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      @filter="filterPieces"
                      :rules="[required]"
                      @update:model-value="syncHidden"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.pieceIdentite') }}<span class="req-badge">*</span></span
                        >
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.NUM_PIECE"
                      outlined
                      :label="$t('input.numPieceIdentite')"
                      dense
                      class="full-width"
                      :rules="[required]"
                      @update:model-value="(val) => (form.NUM_PIECE = val.toUpperCase())"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.numPieceIdentite') }}<span class="req-badge">*</span></span
                        >
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.DATE_PIECE"
                      outlined
                      dense
                      :label="$t('input.dateDelivrancePieceIdentite')"
                      class="full-width"
                      :rules="[required]"
                      :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                      :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.dateDelivrancePieceIdentite')
                          }}<span class="req-badge">*</span></span
                        >
                      </template>
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
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.LIEU_PIECEC"
                      :options="arrondissements"
                      option-label="NOM_ARROND"
                      option-value="CODE_ARROND"
                      :label="$t('input.lieuDelivrancePieceIdentite')"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      @filter="filterArrondissement"
                      :rules="[required]"
                      @update:model-value="syncHidden"
                    >
                      <template v-slot:prepend><q-icon name="place" /></template>
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.lieuDelivrancePieceIdentite')
                          }}<span class="req-badge">*</span></span
                        >
                      </template>
                    </q-select>
                  </div>
                  <!-- Fichier pièce d'identité — dynamique selon type sélectionné (cf. legacy) -->
                  <div class="col-12 col-sm-6" v-if="form.NUM_TYPEPIECE">
                    <q-file
                      v-model="formFile.fichierIdentiteEmployeur"
                      outlined
                      :label="$t('input.fichierIdentiteResponsable')"
                      dense
                      class="full-width"
                      accept=".gif,.jpg,.jpeg,.png,.pdf"
                      :max-total-size="maxSize"
                      @rejected="onRejected"
                      :rules="[
                        (val) => (val && val != '') || $t('input.requis'),
                        fileTypePieceIdentite,
                      ]"
                      counter
                      max-files="1"
                      :hint="$t('input.max_size_hint')"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.fichierIdentiteResponsable')
                          }}<span class="req-badge">*</span></span
                        >
                      </template>
                      <template v-slot:prepend
                        ><q-icon name="upload_file" color="primary"
                      /></template>
                    </q-file>
                  </div>
                </div>
              </q-step>

              <!-- ══════════════════════════════════════════════
                  ÉTAPE 2 : Coordonnées de l'employeur
              ══════════════════════════════════════════════ -->
              <q-step
                :name="2"
                :title="$t('immep.step2')"
                icon="home"
                :done="step > 2"
                :disable="!isStepAllowed(2)"
              >
                <!-- Sous-section : Adresse -->
                <div class="step-section-header">
                  <q-icon name="home" class="q-mr-xs" />
                  {{ $t('immat.section.residence', 'Résidence') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.ADRESSE_EMPL"
                      outlined
                      :label="$t('input.adresse')"
                      dense
                      class="full-width"
                      :rules="[required]"
                      @update:model-value="(val) => (form.ADRESSE_EMPL = val.toUpperCase())"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.adresse') }}<span class="req-badge">*</span></span
                        >
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <!-- Boîte postale : numberfield dans le legacy -->
                    <q-input
                      v-model="form.BOITE_POSTALE"
                      :label="$t('input.boitePostale')"
                      outlined
                      dense
                      type="number"
                      class="full-width"
                      @update:model-value="(val) => (form.BOITE_POSTALE = val)"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.CODE_ARRONDC"
                      :options="arrondissements"
                      option-label="NOM_ARROND"
                      option-value="CODE_ARROND"
                      :label="$t('input.arrondissementResidence')"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      @filter="filterArrondissement"
                      @update:model-value="syncHidden"
                    >
                      <template v-slot:label>{{ $t('input.arrondissementResidence') }}</template>
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.NOM_QUARTIER"
                      outlined
                      dense
                      :label="$t('input.quartierResidence')"
                      class="full-width"
                      :rules="[required]"
                      @update:model-value="(val) => (form.NOM_QUARTIER = val.toUpperCase())"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.quartierResidence') }}<span class="req-badge">*</span></span
                        >
                      </template>
                      <template v-slot:prepend><q-icon name="map" /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.LIEUDIT_EMPL"
                      :label="$t('input.lieuDitResidence')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.LIEUDIT_EMPL = val.toUpperCase())"
                    >
                      <template v-slot:prepend><q-icon name="place" /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.num_case"
                      :label="$t('input.numLogement')"
                      outlined
                      dense
                      class="full-width"
                      @update:model-value="(val) => (form.num_case = val.toUpperCase())"
                    />
                  </div>
                </div>

                <!-- Sous-section : Contacts -->
                <div class="step-section-header">
                  <q-icon name="contact_phone" class="q-mr-xs" />
                  {{ $t('immat.section.contacts', 'Contacts') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="form.TEL"
                      :label="$t('input.phone')"
                      outlined
                      type="tel"
                      maxlength="9"
                      prefix="+237"
                      dense
                      class="full-width"
                      :rules="[
                        required,
                        (val) => regexPatterns.telephone.test(val) || $t('input.invalidPhone'),
                      ]"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.phone') }}<span class="req-badge">*</span></span
                        >
                      </template>
                      <template v-slot:prepend><q-icon name="phone" /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="form.TEL_PERSEMPL"
                      :label="$t('input.mobile')"
                      outlined
                      type="tel"
                      prefix="+237"
                      maxlength="9"
                      dense
                      class="full-width"
                      :rules="[
                        required,
                        (val) => regexPatterns.telephone.test(val) || $t('input.invalidPhone'),
                      ]"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.mobile') }}<span class="req-badge">*</span></span
                        >
                      </template>
                      <template v-slot:prepend><q-icon name="phone" /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="form.EMAIL"
                      outlined
                      :label="$t('input.emailc')"
                      dense
                      class="full-width"
                      type="email"
                      :rules="[
                        required,
                        (val) => regexPatterns.email.test(val) || '(ex: adresse@email.com)',
                      ]"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.emailc') }}<span class="req-badge">*</span></span
                        >
                      </template>
                      <template v-slot:prepend><q-icon name="email" /></template>
                    </q-input>
                  </div>
                </div>

                <!-- Sous-section : Document -->
                <div class="step-section-header">
                  <q-icon name="attach_file" class="q-mr-xs" />
                  {{ $t('immat.section.main_doc', 'Document principal') }}
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <!-- name="40" conforme au legacy JS (IDPLANLOCAL) -->
                    <q-file
                      v-model="formFile.IDPLANLOCAL"
                      outlined
                      dense
                      :label="$t('input.planLocalisation')"
                      class="full-width"
                      accept=".gif,.jpg,.jpeg,.png,.doc,.docx,.pdf"
                      :max-total-size="maxSize"
                      @rejected="onRejected"
                      :rules="[
                        (val) => (val && val != '') || $t('input.requis'),
                        fileTypePlanLocalisation,
                      ]"
                      counter
                      max-files="1"
                      :hint="$t('input.max_size_hint')"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.planLocalisation') }}<span class="req-badge">*</span></span
                        >
                      </template>
                      <template v-slot:prepend
                        ><q-icon name="upload_file" color="primary"
                      /></template>
                    </q-file>
                  </div>
                </div>
              </q-step>

              <!-- ══════════════════════════════════════════════
                  ÉTAPE 3 : Informations sur l'entreprise
              ══════════════════════════════════════════════ -->
              <q-step
                :name="3"
                :title="$t('immep.step3')"
                icon="business"
                :done="step > 3"
                :disable="!isStepAllowed(3)"
              >
                <!-- Sous-section : Activité -->
                <div class="step-section-header">
                  <q-icon name="business_center" class="q-mr-xs" />
                  {{ $t('immep.step3') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="form.DATE_DEB_SERVICE"
                      outlined
                      :label="$t('input.dateOuverture')"
                      dense
                      class="full-width"
                      :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                      :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                    >
                      <template v-slot:label>{{ $t('input.dateOuverture') }}</template>
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
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-4">
                    <!-- DATE_EFFET = date embauche premier salarié, requis dans le legacy -->
                    <q-input
                      v-model="form.DATE_EFFET"
                      outlined
                      :label="$t('input.dateEmbauche')"
                      dense
                      class="full-width"
                      :rules="[required]"
                      :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                      :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.dateEmbauche') }}<span class="req-badge">*</span></span
                        >
                      </template>
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
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-4">
                    <!-- NBRE_EMPL : numberfield dans le legacy -->
                    <q-input
                      v-model="form.NBRE_EMPL"
                      outlined
                      :label="$t('input.nombreTravailleurs')"
                      type="number"
                      min="1"
                      dense
                      class="full-width"
                      :rules="[required]"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.nombreTravailleurs')
                          }}<span class="req-badge">*</span></span
                        >
                      </template>
                    </q-input>
                  </div>
                </div>

                <!-- Sous-section : Centres -->
                <div class="step-section-header">
                  <q-icon name="account_balance" class="q-mr-xs" />
                  {{ $t('immat.section.centers', 'Centres') }}
                </div>
                <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.CODE_CENTREIMPOTC"
                      :options="impots"
                      option-label="ABREVIATION"
                      option-value="CODE_CENTREIMPOT"
                      :label="$t('input.centreImpots')"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      @filter="filterImpots"
                      @update:model-value="onCentreImpotsSelected"
                      :rules="[required]"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.centreImpots') }}<span class="req-badge">*</span></span
                        >
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="form.CODE_CENTRECNPSC"
                      :options="centres"
                      option-label="LIB_CENTRE"
                      option-value="CODE_CENTRE"
                      :label="$t('input.centreCNPS')"
                      outlined
                      dense
                      class="full-width"
                      use-input
                      input-debounce="0"
                      emit-value
                      map-options
                      @filter="filterCentreCNPS"
                      @update:model-value="onCentreCnpsSelected"
                      :rules="[required]"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.centreCNPS') }}<span class="req-badge">*</span></span
                        >
                      </template>
                    </q-select>
                  </div>
                </div>

                <!-- Sous-section : Documents -->
                <div class="step-section-header">
                  <q-icon name="folder_open" class="q-mr-xs" />
                  {{ $t('immat.section.main_doc', 'Documents') }}
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <!-- name="41" conforme au legacy JS (IDLISTTRAV) -->
                    <q-file
                      v-model="formFile.IDLISTTRAV"
                      :label="$t('input.listeTravailleurs')"
                      outlined
                      dense
                      class="full-width"
                      accept=".xls,.xlsx,.doc,.docx,.pdf"
                      :max-total-size="maxSize"
                      @rejected="onRejected"
                      :rules="[
                        (val) => (val && val != '') || $t('input.requis'),
                        fileTypeListeTravailleurs,
                      ]"
                      counter
                      max-files="1"
                      :hint="$t('input.max_size_hint')"
                    >
                      <template v-slot:label>
                        <span class="req-label"
                          >{{ $t('input.listeTravailleurs') }}<span class="req-badge">*</span></span
                        >
                      </template>
                      <template v-slot:prepend
                        ><q-icon name="upload_file" color="primary"
                      /></template>
                    </q-file>
                  </div>
                </div>
              </q-step>

              <!-- ══════════════════════════════════════════════
                  ÉTAPE 4 : Récapitulatif & Validation
              ══════════════════════════════════════════════ -->
              <q-step
                :name="4"
                :title="$t('immep.resume')"
                icon="check_circle"
                :done="step > 4"
                :disable="!isStepAllowed(4)"
              >
                <div class="q-pa-sm" ref="recapContent">
                  <!-- En-tête récap -->
                  <div class="text-center q-mb-md">
                    <q-icon name="fact_check" size="36px" color="positive" />
                    <div :class="dynamicTextClass">{{ $t('immep.resume') }}</div>
                    <q-linear-progress
                      :value="1"
                      size="6px"
                      color="positive"
                      class="q-mt-sm rounded-borders"
                      animation-speed="100"
                    />
                  </div>

                  <div class="row q-col-gutter-lg">
                    <div
                      v-for="section in recapSections"
                      :key="section.step"
                      class="col-12 col-lg-6"
                    >
                      <q-card
                        flat
                        bordered
                        class="recap-card q-mb-md"
                        :class="{ 'shadow-10': $q.dark.isActive, 'shadow-2': !$q.dark.isActive }"
                      >
                        <q-card-section class="bg-gradient-primary text-white q-py-sm">
                          <div class="row items-center no-wrap">
                            <q-icon :name="section.icon" size="sm" class="q-mr-sm" />
                            <div class="text-subtitle1 text-weight-bold col">
                              {{ section.title }}
                            </div>
                            <q-btn
                              flat
                              round
                              color="white"
                              icon="edit"
                              size="xs"
                              class="hover-scale"
                              @click="step = section.step"
                              ><q-tooltip>{{ $t('form.edit') }}</q-tooltip></q-btn
                            >
                          </div>
                        </q-card-section>
                        <q-card-section class="q-pa-none">
                          <q-list separator dense>
                            <q-item v-for="(row, idx) in section.items" :key="idx" class="q-py-xs">
                              <q-item-section avatar>
                                <q-icon :name="row.icon" color="primary" size="sm" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label class="text-caption text-grey-6">{{
                                  row.label
                                }}</q-item-label>
                                <q-item-label class="text-weight-medium">{{
                                  row.value
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </q-list>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>
              </q-step>
            </q-stepper>
          </q-card-section>
        </q-scroll-area>

        <!-- ═══ FOOTER STICKY ═══ -->
        <q-separator />
        <q-card-actions align="right" class="immat-step-footer q-pa-sm">
          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            :label="$t('form.previous')"
            icon="arrow_back"
            @click="step -= 1"
          />
          <q-space />
          <q-btn
            v-if="step < 4"
            color="primary"
            unelevated
            :label="$t('form.next')"
            icon-right="arrow_forward"
            @click="goToNextStep(step + 1)"
          />
          <template v-else>
            <q-btn
              flat
              color="secondary"
              icon="picture_as_pdf"
              label="PDF"
              class="q-mr-sm"
              @click="downloadPDF"
            />
            <q-btn
              type="submit"
              color="primary"
              unelevated
              class="q-px-lg text-weight-bold"
              icon-right="send"
              :label="$t('form.submit')"
            />
          </template>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <!-- ═══ DIALOGUE VALIDATION ═══ -->
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

  <!-- ═══ DIALOGUE PDF ═══ -->
  <q-dialog v-model="pdfDialog" maximized>
    <q-card>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">{{ $t('pdf.preview', 'Aperçu PDF') }}</div>
        <q-btn icon="close" flat round dense @click="pdfDialog = false" />
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <iframe :src="pdfBlobUrl" width="100%" height="600px" style="border: none" />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn
          color="primary"
          icon="download"
          :label="$t('pdf.download', 'Télécharger')"
          @click="downloadPDF"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- ═══ SPINNER ═══ -->
  <q-dialog persistent v-model="spinner">
    <q-spinner-cube size="xl" color="primary" />
  </q-dialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch, onMounted } from 'vue'
import { useNotify } from 'src/modules/shared/components/useNotify.js'
import { regexPatterns } from 'src/js/regex.js'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js'
import {
  buildImmatEmpDomLegacyFormData,
  syncImmatEmpDomHiddenFields,
  validateImmatEmpDomBusinessRules,
} from 'src/modules/immatriculations/utils/immatEmpDomLegacy.js'
import { submitGererEmployeur } from 'src/modules/immatriculations/api/immatEmployeurApi.js'
import {
  fetchEmployeurTele,
  fetchImmatEmpProReferentials,
} from 'src/modules/immatriculations/api/teleImmatEmployeurApi.js'
import { applyEmployeurProTeleToForm } from 'src/modules/immatriculations/adapters/employeurProTeleAdapter.js'
import { TELE_IMMAT_DEST_EMP_PRO } from 'src/modules/shared/config/teleImmat.js'
import {
  CAUSE_IMMA_OPTIONS,
  CIRCUIT_DOSSIER_OPTIONS,
} from 'src/modules/immatriculations/data/immatEmpDomLegacyFields.js'

const causeImmaOptions = CAUSE_IMMA_OPTIONS
const circuitDossierOptions = CIRCUIT_DOSSIER_OPTIONS

// ── Validation fichiers (cohérent avec legacy JS) ──
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
  return re.test(f.name) || 'Type de fichier non autorisé'
}
const fileTypePieceIdentite = (val) => fileExtensionRule(RE_FILE_ID, val)
const fileTypePlanLocalisation = (val) => fileExtensionRule(RE_FILE_PLAN, val)
const fileTypeListeTravailleurs = (val) => fileExtensionRule(RE_FILE_LIST, val)
const props = defineProps({
  service: Object,
  codeTele: { type: String, default: '' },
  codeSecret: { type: String, default: '' },
})

const $q = useQuasar()
const { t, locale } = useI18n()
const emit = defineEmits(['close'])
const { notifyError, notifySuccess, notifyInfo } = useNotify()

const open = ref(true)
const step = ref(1)
const maxStep = ref(1)
const formRef = ref(null)
const spinner = ref(false)
const pdfDialog = ref(false)
const pdfBlobUrl = ref(null)
const recapContent = ref()
const dialValidation = ref(false)

const loadingInit = ref(false)
const referentialsReady = ref(false)
const referentialsError = ref(null)
const referentialsLoadingLabel = ref('')

const validationOptions = computed(() => [
  { label: t('input.yes'), value: true },
  { label: t('input.no'), value: false },
])

const referentialsSource = ref({
  arrondissements: [],
  activites: [],
  centres: [],
  formeJuridique: [],
  impots: [],
  pays: [],
  pieces: [],
})

const arrondissements = ref([])
const centres = ref([])
const impots = ref([])
const pays = ref([])
const pieces = ref([])

function getReferentialsSnapshot() {
  return referentialsSource.value
}

function applyReferentials(refs) {
  referentialsSource.value = {
    arrondissements: refs.arrondissements ?? [],
    activites: refs.activites ?? [],
    centres: refs.centres ?? [],
    formeJuridique: refs.formeJuridique ?? [],
    impots: refs.impots ?? [],
    pays: refs.pays ?? [],
    pieces: refs.pieces ?? [],
  }
  arrondissements.value = [...referentialsSource.value.arrondissements]
  centres.value = [...referentialsSource.value.centres]
  impots.value = [...referentialsSource.value.impots]
  pays.value = [...referentialsSource.value.pays]
  pieces.value = [...referentialsSource.value.pieces]
  form.value.Dest = TELE_IMMAT_DEST_EMP_PRO
  referentialsReady.value = true
}

async function loadFormBootstrap() {
  loadingInit.value = true
  referentialsReady.value = false
  referentialsError.value = null
  try {
    referentialsLoadingLabel.value = t('immat.referentials.loadingLists')
    const refs = await fetchImmatEmpProReferentials()
    applyReferentials(refs)
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

async function loadExistingDossier(codeTele, codeSecret) {
  try {
    $q.loading.show({ message: t('immat.controle.loading', 'Chargement du dossier…') })
    const row = await fetchEmployeurTele(codeTele, codeSecret)
    const { exploited } = applyEmployeurProTeleToForm(form.value, row)
    form.value.code_tele = codeTele
    form.value.code_secret = codeSecret
    syncImmatEmpDomHiddenFields(form.value, getReferentialsSnapshot())
    if (exploited) {
      notifyError(t('immat.controle.dossierExploite', 'Ce dossier a déjà été exploité.'))
    }
  } catch (e) {
    notifyError(e?.message || t('messages.error'))
  } finally {
    $q.loading.hide()
  }
}

onMounted(() => {
  referentialsLoadingLabel.value = t('immat.referentials.loading')
  loadFormBootstrap()
})

// ── Sexe : valeurs F/M comme dans le legacy JS ──
const sexeOptions = computed(() => [
  { label: 'FEMININ', value: 'F' },
  { label: 'MASCULIN', value: 'M' },
])

const recapEmpty = () => 'Non renseigné'

const recapSections = computed(() => {
  const nz = (v) => (v != null && String(v).trim() !== '' ? String(v) : recapEmpty())
  const nzFile = (f) => f?.name || recapEmpty()

  return [
    {
      step: 1,
      title: 'Identification',
      icon: 'person',
      items: [
        {
          icon: 'person',
          label: 'Nom',
          value: nz(form.value.NOM_PERSEMPL),
        },
        {
          icon: 'person_outline',
          label: 'Prénom',
          value: nz(form.value.PRENOM_PERSEMPL),
        },
        {
          icon: 'cake',
          label: 'Date de naissance',
          value: nz(form.value.DATE_NAISS_PERSEMPL),
        },
        {
          icon: 'place',
          label: 'Lieu de naissance',
          value: nz(form.value.LOCALITE_NAISS_PERSEMPL),
        },
        {
          icon: 'wc',
          label: 'Sexe',
          value: getSexeLabel(form.value.SEXE_PERSEMPL),
        },
        {
          icon: 'flag',
          label: 'Nationalité',
          value: getPaysName(form.value.NATIONALITEC),
        },
        {
          icon: 'credit_card',
          label: "Pièce d'identité",
          value: `${getPieceName(form.value.NUM_TYPEPIECE)} - ${nz(form.value.NUM_PIECE)}`,
        },
      ],
    },

    {
      step: 2,
      title: 'Coordonnées',
      icon: 'home',
      items: [
        {
          icon: 'home',
          label: 'Adresse',
          value: nz(form.value.ADRESSE_EMPL),
        },
        {
          icon: 'location_city',
          label: 'Quartier',
          value: nz(form.value.NOM_QUARTIER),
        },
        {
          icon: 'place',
          label: 'Arrondissement',
          value: nz(form.value.CODE_ARRONDC),
        },
        {
          icon: 'phone',
          label: 'Téléphone',
          value: form.value.TEL ? `+237 ${form.value.TEL}` : recapEmpty(),
        },
        {
          icon: 'smartphone',
          label: 'Mobile',
          value: form.value.TEL_PERSEMPL ? `+237 ${form.value.TEL_PERSEMPL}` : recapEmpty(),
        },
        {
          icon: 'email',
          label: 'Email',
          value: nz(form.value.EMAIL),
        },
      ],
    },

    {
      step: 3,
      title: 'Informations Employeur',
      icon: 'business',
      items: [
        {
          icon: 'source',
          label: "Origine d'immatriculation",
          value: causeImmaOptions.find((o) => o.value === form.value.CAUSE_IMMA)?.label || '—',
        },
        {
          icon: 'folder',
          label: 'Origine du dossier',
          value:
            circuitDossierOptions.find((o) => o.value === form.value.CIRCUIT_DOSSIER)?.label || '—',
        },
        {
          icon: 'event',
          label: "Date d'ouverture",
          value: nz(form.value.DATE_DEB_SERVICE),
        },
        {
          icon: 'today',
          label: "Date d'embauche",
          value: nz(form.value.DATE_EFFET),
        },
        {
          icon: 'groups',
          label: 'Nombre de travailleurs',
          value: nz(form.value.NBRE_EMPL),
        },
        {
          icon: 'account_balance',
          label: 'Centre des impôts',
          value: getCentreImpotsName(form.value.CODE_CENTREIMPOTC),
        },
        {
          icon: 'business',
          label: 'Centre CNPS',
          value: getCentreCNPSName(form.value.CODE_CENTRECNPSC),
        },
      ],
    },

    {
      step: 3,
      title: 'Documents joints',
      icon: 'folder',
      items: [
        {
          icon: 'portrait',
          label: "Pièce d'identité",
          value: nzFile(formFile.value.fichierIdentiteEmployeur),
        },
        {
          icon: 'map',
          label: 'Plan de localisation',
          value: nzFile(formFile.value.IDPLANLOCAL),
        },
        {
          icon: 'list_alt',
          label: 'Liste des travailleurs',
          value: nzFile(formFile.value.IDLISTTRAV),
        },
      ],
    },
  ]
})

const form = ref({
  // Champs techniques (hidden dans le legacy)
  TYPE_EMPLOYEUR: '0',
  CODE_REGIME: '9',
  CODE_GPE_RISQUE: 'A',
  objet: 'Empl',
  laction: 'Creer',
  code_tele: '',
  code_secret: '',
  // Origine
  CAUSE_IMMA: '',
  CAUSEIMMA: '0', // hidden — synchronisé
  CIRCUIT_DOSSIER: '',
  CIRCUITDOSSIER: '3', // hidden — synchronisé
  // Identification
  NOM_PERSEMPL: '',
  PRENOM_PERSEMPL: '',
  DATE_NAISS_PERSEMPL: '',
  LOCALITE_NAISS_PERSEMPL: '',
  LieuNaissPe: '',
  LIEU_NAISS_PERSEMPL: '', // hidden
  CODE_PAYS_NAISSEMPL: '', // hidden
  CODE_REGION_NAISSEMPL: '', // hidden
  CODE_DEPA_NAISSEMPL: '', // hidden
  NATIONALITEC: '',
  NATIONALITE: '', // hidden — code_pays
  PROFESSION: '',
  SEXE_PERSEMPL: '', // F ou M (legacy)
  // Pièce d'identité
  NUM_TYPEPIECE: '',
  typepiece: '', // hidden libellé
  NUM_PIECE: '',
  DATE_PIECE: '',
  LIEU_PIECEC: '',
  LIEU_PIECE: '', // hidden CODE_ARROND
  CODE_PAYS_PIECE: '', // hidden
  CODE_REGION_PIECE: '', // hidden
  CODE_DEPA_PIECE: '', // hidden
  // Coordonnées
  ADRESSE_EMPL: '',
  BOITE_POSTALE: '',
  TEL: '',
  TEL_PERSEMPL: '',
  EMAIL: '',
  CODE_ARRONDC: '',
  CODE_ARROND: '', // hidden
  CODE_PAYS: '', // hidden
  CODE_REGION: '', // hidden
  CODE_DEPA: '', // hidden
  NOM_QUARTIER: '',
  LIEUDIT_EMPL: '',
  num_case: '',
  // Entreprise
  DATE_DEB_SERVICE: '',
  DATE_EFFET: '',
  NBRE_EMPL: '',
  CODE_CENTREIMPOTC: '',
  CODE_CENTREIMPOT: '', // hidden
  CODE_CENTRECNPSC: '',
  CODE_CENTRECNPS: '', // hidden
  // Soumission
  validation: false,
  _cnpsManual: false,
})

const formFile = ref({
  fichierIdentiteEmployeur: null,
  IDPLANLOCAL: null,
  IDLISTTRAV: null,
})

const maxSize = 3 * 1024 * 1024

// ── Contrainte dates (pas de date future) ──
const optionsDn = (date) => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`
  return date <= todayStr
}

const required = (val) => !!val || 'Ce champ est requis / This field is required'

// ── Navigation ──
const isStepAllowed = (s) => s <= maxStep.value

const goToNextStep = async (nextStep) => {
  if (!form.value.CIRCUIT_DOSSIER || !form.value.CAUSE_IMMA) {
    notifyError('Veuillez sélectionner les origines du dossier / Please choose the file origins.')
    return
  }
  const valid = await formRef.value.validate()
  if (valid) {
    step.value = nextStep
    if (nextStep > maxStep.value) maxStep.value = nextStep
  } else {
    notifyError('Veuillez remplir tous les champs requis / Please fill in all required fields.')
  }
}

// ── Centre impôts → auto-remplir CNPS (legacy) ──
function onCentreImpotsSelected(code) {
  const imp = referentialsSource.value.impots.find(
    (i) => String(i.CODE_CENTREIMPOT) === String(code),
  )
  if (imp?.CODE_CENTRECNPS && !form.value._cnpsManual) {
    form.value.CODE_CENTRECNPSC = imp.CODE_CENTRECNPS
  }
  form.value._cnpsManual = false
  syncImmatEmpDomHiddenFields(form.value, getReferentialsSnapshot())
}

function onCentreCnpsSelected() {
  form.value._cnpsManual = true
  syncImmatEmpDomHiddenFields(form.value, getReferentialsSnapshot())
}

// ── Validation métier + soumission ──
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
  try {
    const fd = buildImmatEmpDomLegacyFormData(form.value, formFile.value, {
      dest: form.value.Dest || TELE_IMMAT_DEST_EMP_PRO,
      codeTele: props.codeTele || form.value.code_tele,
      codeSecret: props.codeSecret || form.value.code_secret,
      referentials: getReferentialsSnapshot(),
    })
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

// ── Helpers récapitulatif ──
const dynamicTextClass = computed(() => [
  $q.screen.gt.sm ? 'text-h5' : 'text-subtitle1',
  'text-primary',
  'text-uppercase',
  'q-mb-sm',
])

const getCentreImpotsName = (code) => {
  if (!code) return ''
  const item = impots.value.find(
    (i) => String(i.CODE_CENTREIMPOT) === String(code) || i.ABREVIATION === code,
  )
  return item ? item.ABREVIATION : String(code)
}
const getCentreCNPSName = (code) => {
  if (!code) return ''
  const item = centres.value.find((i) => String(i.CODE_CENTRE) === String(code))
  return item ? item.LIB_CENTRE : String(code)
}
/* const getArrondissementName = (code) => {
  if (!code) return ''
  const arr = arrondissements.value.find((a) => String(a.CODE_ARROND) === String(code))
  return arr ? arr.NOM_ARROND : String(code)
} */
const getPaysName = (code) => {
  if (!code) return ''
  const p = pays.value.find((x) => String(x.code_pays) === String(code) || x.nationalite === code)
  return p ? p.nationalite : String(code)
}
const getPieceName = (code) => {
  if (!code) return ''
  const piece = pieces.value.find((p) => String(p.NUM_TYPEPIECE) === String(code))
  return piece ? piece.LIBELLE : String(code)
}
const getSexeLabel = (val) => {
  return val === 'F' ? 'FEMININ' : val === 'M' ? 'MASCULIN' : val || ''
}

function makeListFilter(sourceKey, targetRef, labelKey) {
  return (val, update) => {
    const source = referentialsSource.value[sourceKey] ?? []
    if (val === '') {
      update(() => {
        targetRef.value = [...source]
      })
      return
    }
    const needle = val.toLowerCase()
    update(() => {
      targetRef.value = source.filter((item) =>
        String(item[labelKey] ?? '')
          .toLowerCase()
          .includes(needle),
      )
    })
  }
}

// ── Filtres ──
const filterArrondissement = makeListFilter('arrondissements', arrondissements, 'NOM_ARROND')
const filterCentreCNPS = makeListFilter('centres', centres, 'LIB_CENTRE')
const filterImpots = makeListFilter('impots', impots, 'ABREVIATION')
const filterPays = makeListFilter('pays', pays, 'nationalite')
const filterPieces = makeListFilter('pieces', pieces, 'LIBELLE')

// ── Rejet fichier ──
const onRejected = (rejectedEntries) => {
  notifyError(
    `Fichier(s) rejeté(s) : ${rejectedEntries.map((e) => e.name || e.file?.name || '?').join(', ')}`,
  )
}

// ── PDF ──
const downloadPDF = () => {
  html2pdf()
    .from(recapContent.value)
    .set({
      margin: 0.5,
      filename: `recap-employeur-dom-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    })
    .save()
}

// ── Fermeture ──
const closeDialog = () => {
  open.value = false
  emit('close')
}

// ── Sync champs cachés (watches sur clés sensibles) ──
const syncHidden = () => syncImmatEmpDomHiddenFields(form.value, getReferentialsSnapshot())

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

<style scoped>
/* ── Carte principale ── */
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

/* ── En-tête gradient ── */
.immat-header {
  background: linear-gradient(135deg, #1565c0 0%, #1976d2 60%, #42a5f5 100%);
  min-height: unset;
}

/* ── Stepper compact ── */
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

/* ── Sous-sections ── */
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

/* ── Labels requis ── */
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

/* ── Cartes récapitulatif ── */
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
.bg-gradient-warning {
  background: linear-gradient(135deg, #f57c00 0%, #ffb74d 100%);
}

.hover-scale {
  transition: transform 0.2s ease;
}
.hover-scale:hover {
  transform: scale(1.1);
}
</style>

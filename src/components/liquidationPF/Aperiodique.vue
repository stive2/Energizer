<template>
  <div class="q-pa-md" style="min-height: 100vh;">
    <!-- En-tête avec animation -->
    <div class="text-h5 text-center text-primary q-mb-lg q-animate-fade">
      <q-icon name="pregnant_woman" size="md" class="q-mr-sm" />
      {{ $t('LiquidationPF.aperiodique.title') }}
    </div>

    <!-- Formulaire de recherche compact -->
    <q-form @submit="searchDossiers">
      <q-card  class="q-mb-md" style="border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
        <q-card-section class="text-primary" style="border-radius: 15px 15px 0 0;">

          <div class="row q-col-gutter-md items-center">
            <q-select
              v-model="searchCriteria"
              :options="searchOptions"
              :label="$t('LiquidationPF.aperiodique.searchForm.criteria')"
              outlined
              dense
              color="primary"
              style="min-width: 140px;"
              class="col-12 col-sm-3"
            />
            <q-input
              v-model="searchStartValue"
              :label="$t('LiquidationPF.aperiodique.searchForm.startValue')"
              outlined
              dense
              color="primary"
              class="col-12 col-sm-3"
            />
            <q-input
              v-model="searchEndValue"
              :label="$t('LiquidationPF.aperiodique.searchForm.endValue')"
              outlined
              dense
              color="primary"
              class="col-12 col-sm-3"
            />
            <div class="col-12 col-sm-3 q-gutter-xs">
              <q-btn
                type="submit"
                color="primary"
                :label="$t('LiquidationPF.aperiodique.searchForm.search')"
                icon="search"
                dense
                style="border-radius: 10px;"
              />
              <q-btn
                type="reset"
                color="grey"
                :label="$t('LiquidationPF.aperiodique.searchForm.reset')"
                icon="refresh"
                dense
                style="border-radius: 10px;"
                @click="resetSearch"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-form>

    <!-- Bouton pour ouvrir le formulaire -->
    <div class="q-mb-lg text-center">
      <q-btn
        @click="dialog = true"
        color="primary"
        icon="edit_document"
        :label="$t('LiquidationPF.aperiodique.addButton')"
        size="md"
        class="q-px-xl q-py-sm"
         style="border-radius: 25px; padding: 12px 30px; box-shadow: 0 6px 20px rgba(0,0,0,0.2); text-transform: none; font-weight: 600;"
      >
      <q-tooltip class="bg-grey text-body2">
          {{ $t('LiquidationPF.aperiodique.searchForm.tooltip') }}
        </q-tooltip>
    </q-btn>
    </div>

    <!-- Dialog pour le formulaire -->
    <q-dialog v-model="dialog" persistent full-width>
      <q-card style="min-width: 95vw; max-width: 95vw; max-height: 95vh;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="pregnant_woman" class="q-mr-sm" />
            {{ $t('LiquidationPF.aperiodique.dialogTitle') }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="validateForm" class="q-gutter-md">
            <q-scroll-area style="height: 75vh;" class="q-pa-md">
              <!-- Section informations de base -->
              <q-card flat bordered class="q-mb-md" style="border-radius: 8px;">
                <q-card-section>
                  <div class="text-subtitle1 text-primary q-mb-md">
                    <q-icon name="info" class="q-mr-xs" />
                    {{ $t('LiquidationPF.aperiodique.sections.basicInfo') }}
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.numDossier"
                        :label="$t('LiquidationPF.aperiodique.form.dossierNumber')"
                        readonly
                        outlined
                        dense
                        color="primary"
                        bg-color="grey-2"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="folder" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.naturePrestation"
                        :label="$t('LiquidationPF.aperiodique.form.naturePrestation')"
                        readonly
                        outlined
                        dense
                        color="primary"
                        bg-color="grey-2"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="category" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.dateDemande"
                        :label="$t('LiquidationPF.aperiodique.form.requestDate')"
                        readonly
                        outlined
                        dense
                        color="primary"
                        bg-color="grey-2"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="calendar_today" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.numAssure"
                        :label="$t('LiquidationPF.aperiodique.form.insuredNumber')"
                        readonly
                        outlined
                        dense
                        color="primary"
                        bg-color="grey-2"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="badge" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.nomAssure"
                        :label="$t('LiquidationPF.aperiodique.form.insuredNames')"
                        readonly
                        outlined
                        dense
                        color="primary"
                        bg-color="grey-2"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="person" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.prenomAssure"
                        :label="$t('LiquidationPF.aperiodique.form.insuredFirstNames')"
                        readonly
                        outlined
                        dense
                        color="primary"
                        bg-color="grey-2"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="person_outline" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Section Prestations et Examens -->
              <q-card flat bordered class="q-mb-md" style="border-radius: 8px;">
                <q-card-section>
                  <div class="text-subtitle1 text-primary q-mb-md">
                    <q-icon name="medical_services" class="q-mr-xs" />
                    {{ $t('LiquidationPF.aperiodique.sections.prenatalExams') }}
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-4">
                      <q-checkbox
                        v-model="form.ap1"
                        :label="$t('LiquidationPF.aperiodique.form.ap1')"
                        color="primary"
                        dense
                        @update:model-value="toggleAP1"
                        class="text-body2"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-checkbox
                        v-model="form.fm1"
                        :label="$t('LiquidationPF.aperiodique.form.fm1')"
                        color="primary"
                        dense
                        @update:model-value="toggleFM1"
                        class="text-body2"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.dateExamen1"
                        :label="$t('LiquidationPF.aperiodique.form.firstExamDate')"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                        :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                        :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                      >
                        <template #append>
                          <q-icon name="event"  class="cursor-pointer" color="primary" size="sm">
                             <q-popup-proxy transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="form.dateExamen1"
                                :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                :locale="locale"
                                color="primary"
                              />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-checkbox
                        v-model="form.ap2"
                        :label="$t('LiquidationPF.aperiodique.form.ap2')"
                        color="primary"
                        dense
                        @update:model-value="toggleAP2"
                        class="text-body2"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-checkbox
                        v-model="form.fm2"
                        :label="$t('LiquidationPF.aperiodique.form.fm2')"
                        color="primary"
                        dense
                        @update:model-value="toggleFM2"
                        class="text-body2"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.dateExamen2"
                        :label="$t('LiquidationPF.aperiodique.form.secondExamDate')"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                        :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                        :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                      >
                        <template #append>
                          <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                             <q-popup-proxy transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="form.dateExamen2"
                                :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                :locale="locale"
                                color="primary"
                              />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Section Accouchement -->
              <q-card flat bordered class="q-mb-md" style="border-radius: 8px;">
                <q-card-section>
                  <div class="text-subtitle1 text-primary q-mb-md">
                    <q-icon name="child_care" class="q-mr-xs" />
                    {{ $t('LiquidationPF.aperiodique.sections.deliveryInfo') }}
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-4">
                      <q-checkbox
                        v-model="form.accouchement"
                        :label="$t('LiquidationPF.aperiodique.form.delivery')"
                        color="primary"
                        dense
                        @update:model-value="toggleAccouchement"
                        class="text-body2"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.nbreEnfantsViables"
                        :label="$t('LiquidationPF.aperiodique.form.viableChildrenCount')"
                        type="number"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="groups" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.datePreAcc"
                        :label="$t('LiquidationPF.aperiodique.form.probableDeliveryDate')"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                        :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                        :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                      >
                        <template #append>
                          <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                             <q-popup-proxy transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="form.datePreAcc"
                                :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                :locale="locale"
                                color="primary"
                              />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-checkbox
                        v-model="form.fraisMedicauxAcc"
                        :label="$t('LiquidationPF.aperiodique.form.deliveryMedicalFees')"
                        color="primary"
                        dense
                        @update:model-value="toggleFraisMedicauxAcc"
                        class="text-body2"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.nbreEnfantsSousControle"
                        :label="$t('LiquidationPF.aperiodique.form.childrenUnderMedicalControl')"
                        type="number"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="medical_services" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.dateEffAcc"
                        :label="$t('LiquidationPF.aperiodique.form.effectiveDeliveryDate')"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                        :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                        :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                      >
                        <template #append>
                          <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                             <q-popup-proxy transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="form.dateEffAcc"
                                :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                :locale="locale"
                                color="primary"
                              />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Section Congés et Indemnités -->
              <q-card flat bordered class="q-mb-md" style="border-radius: 8px;">
                <q-card-section>
                  <div class="text-subtitle1 text-primary q-mb-md">
                    <q-icon name="payments" class="q-mr-xs" />
                    {{ $t('LiquidationPF.aperiodique.sections.leaveAndBenefits') }}
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-4">
                      <q-checkbox
                        v-model="form.indemniteJournaliere"
                        :label="$t('LiquidationPF.aperiodique.form.dailyAllowance')"
                        color="primary"
                        dense
                        class="text-body2"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.nbreJoursCouches"
                        :label="$t('LiquidationPF.aperiodique.form.additionalMaternityDays')"
                        type="number"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="schedule" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.dateDebConges"
                        :label="$t('LiquidationPF.aperiodique.form.leaveStartDate')"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                        :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                        :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                      >
                        <template #append>
                          <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                             <q-popup-proxy transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="form.dateDebConges"
                                :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                :locale="locale"
                                color="primary"
                              />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.nbreJoursIJ"
                        :label="$t('LiquidationPF.aperiodique.form.dailyAllowanceDays')"
                        type="number"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="schedule" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.sexeAssure"
                        :label="$t('LiquidationPF.aperiodique.form.insuredGender')"
                        readonly
                        outlined
                        dense
                        color="primary"
                        bg-color="grey-2"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="person" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.dateCessationActivite"
                        :label="$t('LiquidationPF.aperiodique.form.activityCessationDate')"
                        readonly
                        outlined
                        dense
                        color="primary"
                        bg-color="orange-2"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="work_off" color="orange" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.employeurActuel"
                        :label="$t('LiquidationPF.aperiodique.form.currentEmployer')"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="business" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.dateFinConges"
                        :label="$t('LiquidationPF.aperiodique.form.leaveEndDate')"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                        :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                        :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                      >
                        <template #append>
                          <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                             <q-popup-proxy transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="form.dateFinConges"
                                :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                :locale="locale"
                                color="primary"
                              />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.dateProbFinConges"
                        :label="$t('LiquidationPF.aperiodique.form.probableLeaveEndDate')"
                        readonly
                        outlined
                        dense
                        color="primary"
                        bg-color="orange-2"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="event" color="orange" size="sm" />
                        </template>
                      </q-input>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Section Calculs et Options -->
              <q-card flat bordered class="q-mb-md" style="border-radius: 8px;">
                <q-card-section>
                  <div class="text-subtitle1 text-primary q-mb-md">
                    <q-icon name="calculate" class="q-mr-xs" />
                    {{ $t('LiquidationPF.aperiodique.sections.calculationsAndOptions') }}
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-4">
                      <q-checkbox
                        v-model="form.accouchementPremature"
                        :label="$t('LiquidationPF.aperiodique.form.prematureDelivery')"
                        color="primary"
                        dense
                        @update:model-value="handleAccPremature"
                        class="text-body2"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.dateDebCessationPaiement"
                        :label="$t('LiquidationPF.aperiodique.form.paymentCessationStart')"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                        :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                        :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                      >
                        <template #append>
                          <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                             <q-popup-proxy transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="form.dateDebCessationPaiement"
                                :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                :locale="locale"
                                color="primary"
                              />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.dateFinCessationPaiement"
                        :label="$t('LiquidationPF.aperiodique.form.paymentCessationEnd')"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                        :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                        :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                      >
                        <template #append>
                          <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                             <q-popup-proxy transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="form.dateFinCessationPaiement"
                                :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                :locale="locale"
                                color="primary"
                              />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-field
                        :label="$t('LiquidationPF.aperiodique.form.calculationBase')"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                      >
                        <template v-slot:control>
                          <div class="row q-gutter-md q-pa-sm">
                            <q-checkbox
                              v-model="form.baseCalcul30"
                              :label="$t('LiquidationPF.aperiodique.form.base30')"
                              color="primary"
                              dense
                              @update:model-value="toggleBaseCalcul30"
                              class="text-body2"
                            />
                            <q-checkbox
                              v-model="form.baseCalcul25"
                              :label="$t('LiquidationPF.aperiodique.form.base25')"
                              color="primary"
                              dense
                              @update:model-value="toggleBaseCalcul25"
                              class="text-body2"
                            />
                          </div>
                        </template>
                      </q-field>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.dateRepriseActivite"
                        :label="$t('LiquidationPF.aperiodique.form.activityResumptionDate')"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                        :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                        :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                      >
                        <template #append>
                          <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                             <q-popup-proxy transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="form.dateRepriseActivite"
                                :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                :locale="locale"
                                color="primary"
                              />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.dateProbDebutJouissance"
                        :label="$t('LiquidationPF.aperiodique.form.probableBenefitStartDate')"
                        readonly
                        outlined
                        dense
                        color="primary"
                        bg-color="orange-2"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="event" color="orange" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.salaireReconstitue"
                        :label="$t('LiquidationPF.aperiodique.form.reconstitutedSalary')"
                        type="number"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="attach_money" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-field
                        :label="$t('LiquidationPF.aperiodique.form.justifiesSixMonths')"
                        outlined
                        dense
                        disable
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                      >
                        <template v-slot:control>
                          <div class="row q-gutter-lg q-pa-md">
                            <q-radio
                              v-model="form.justifieSixMois"
                              :val="true"
                              :label="$t('LiquidationPF.aperiodique.form.yes')"
                              color="primary"
                              dense
                              class="text-body2"
                            />
                            <q-radio
                              v-model="form.justifieSixMois"
                              :val="false"
                              :label="$t('LiquidationPF.aperiodique.form.no')"
                              color="primary"
                              dense
                              class="text-body2"
                            />
                          </div>
                        </template>
                      </q-field>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.matriculeInterne"
                        :label="$t('LiquidationPF.aperiodique.form.internalRegistration')"
                        outlined
                        dense
                        color="primary"
                        bg-color="white"
                        class="text-body2"
                      >
                        <template v-slot:prepend>
                          <q-icon name="badge" color="primary" size="sm" />
                        </template>
                      </q-input>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-scroll-area>

            <q-card-actions align="right" class="bg-grey-1 q-pa-md">
               <q-btn
                :label="$t('LiquidationPF.aperiodique.actions.validate')"
                type="submit"
                color="primary"
                icon="check_circle"
                unelevated
                class="q-px-lg"
                style="border-radius: 20px;"
              />
              <q-btn
                flat
                :label="$t('LiquidationPF.aperiodique.actions.cancel')"
                color="negative"
                icon="cancel"
                @click="dialog = false"
                class="q-px-lg"
                style="border-radius: 20px;"
              />

            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Tableau des résultats avec style amélioré -->
    <q-card flat bordered class="shadow-3" style="border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
      <q-card-section class="bg-primary text-white" style="border-radius: 15px 15px 0 0;">
        <div class="text-h6">
          <q-icon name="table_view" class="q-mr-sm" />
          {{ $t('LiquidationPF.aperiodique.table.title') }}
          <q-badge v-if="rows.length > 0" color="primary" :label="rows.length" class="q-ml-sm" />
        </div>
      </q-card-section>

      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :pagination="{ rowsPerPage: 10 }"
        dense
        flat
        style="border-radius: 0 0 15px 15px;"
        class="fairy-table"

      >
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-grey-2">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-primary text-weight-bold"
              style="font-size: 0.9rem;"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

         <template v-slot:body="props">
          <q-tr :props="props" class="hover-row" @click="loadDossier(props.row)">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="font-size: 0.85rem;"
            >
              {{ props.row[col.name] }}
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm text-grey-6 q-pa-lg">
            <q-icon size="2em" name="search_off" />
            <span class="text-body1">{{ $t('LiquidationPF.aperiodique.table.noData') }}</span>
          </div>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { Notify } from 'quasar';
import { useI18n } from 'vue-i18n';

export default {
  name: 'LiquidationAperiodique',
  setup() {
    const { t, locale } = useI18n();

    // État du dialog
    const dialog = ref(false);

    // Données du formulaire
    const form = reactive({
      numDossier: '',
      numAssure: '',
      nomAssure: '',
      prenomAssure: '',
      naturePrestation: '',
      dateDemande: '',
      ap1: false,
      fm1: false,
      dateExamen1: '',
      ap2: false,
      fm2: false,
      dateExamen2: '',
      accouchement: false,
      nbreEnfantsViables: '',
      datePreAcc: '',
      fraisMedicauxAcc: false,
      nbreEnfantsSousControle: '',
      dateEffAcc: '',
      indemniteJournaliere: false,
      nbreJoursCouches: '',
      dateDebConges: '',
      nbreJoursIJ: '',
      sexeAssure: '',
      dateCessationActivite: '',
      employeurActuel: '',
      dateFinConges: '',
      dateProbFinConges: '',
      accouchementPremature: false,
      dateDebCessationPaiement: '',
      dateFinCessationPaiement: '',
      baseCalcul30: false,
      baseCalcul25: false,
      dateRepriseActivite: '',
      dateProbDebutJouissance: '',
      salaireReconstitue: '',
      justifieSixMois: false,
      matriculeInterne: ''
    });

    // Données de recherche
    const searchCriteria = ref('numDossier');
    const searchOptions = [
      { label: t('LiquidationPF.aperiodique.searchOptions.dossierNumber'), value: 'numDossier' },
      { label: t('LiquidationPF.aperiodique.searchOptions.insuredNumber'), value: 'numAssure' },
      { label: t('LiquidationPF.aperiodique.searchOptions.insuredNames'), value: 'nomAssure' }
    ];
    const searchStartValue = ref('');
    const searchEndValue = ref('');

    // Données du tableau
    const rows = ref([
      {
        id: 1,
        numDossier: 'PF001',
        numAssure: 'A123456',
        nomRequerant: 'NKOMO MARIE',
        dateDemande: '15/01/2025',
        naturePrestation: 'PF',
        positionDossier: 'En cours',
        datePosition: '16/01/2025'
      },
      {
        id: 2,
        numDossier: 'PF002',
        numAssure: 'A789012',
        nomRequerant: 'MBALLA SOPHIE',
        dateDemande: '20/01/2025',
        naturePrestation: 'PF',
        positionDossier: 'Validé',
        datePosition: '22/01/2025'
      }
    ]);

    const columns = [
      { name: 'numDossier', label: t('LiquidationPF.aperiodique.table.columns.dossierNumber'), field: 'numDossier', align: 'left' },
      { name: 'numAssure', label: t('LiquidationPF.aperiodique.table.columns.insuredNumber'), field: 'numAssure', align: 'left' },
      { name: 'nomRequerant', label: t('LiquidationPF.aperiodique.table.columns.requesterNames'), field: 'nomRequerant', align: 'left' },
      { name: 'dateDemande', label: t('LiquidationPF.aperiodique.table.columns.requestDate'), field: 'dateDemande', align: 'center' },
      { name: 'naturePrestation', label: t('LiquidationPF.aperiodique.table.columns.naturePrestation'), field: 'naturePrestation', align: 'center' },
      { name: 'positionDossier', label: t('LiquidationPF.aperiodique.table.columns.dossierStatus'), field: 'positionDossier', align: 'center' },
      { name: 'datePosition', label: t('LiquidationPF.aperiodique.table.columns.statusDate'), field: 'datePosition', align: 'center' }
    ];

    // Fonctions toggle
    const toggleAP1 = (val) => { form.ap1 = val; };
    const toggleFM1 = (val) => { form.fm1 = val; };
    const toggleAP2 = (val) => { form.ap2 = val; };
    const toggleFM2 = (val) => { form.fm2 = val; };
    const toggleAccouchement = (val) => { form.accouchement = val; };
    const toggleFraisMedicauxAcc = (val) => { form.fraisMedicauxAcc = val; };
    const toggleBaseCalcul30 = () => {
      if (form.baseCalcul30) {
        form.baseCalcul25 = false; // Décocher l'autre option
      }
    };

    const toggleBaseCalcul25 = () => {
      if (form.baseCalcul25) {
        form.baseCalcul30 = false; // Décocher l'autre option
      }
    };
    const handleAccPremature = (val) => { form.accouchementPremature = val; };

    // Fonction de validation
    const validateForm = () => {
      if (!form.numDossier) {
        Notify.create({
          type: 'negative',
          message: t('LiquidationPF.aperiodique.messages.selectDossier'),
          position: 'top',
          icon: 'warning'
        });
        return;
      }
      if (form.accouchement && !form.dateEffAcc) {
        Notify.create({
          type: 'negative',
          message: t('LiquidationPF.aperiodique.messages.enterDeliveryDate'),
          position: 'top',
          icon: 'warning'
        });
        return;
      }
      if (form.ap1 && !form.dateExamen1) {
        Notify.create({
          type: 'negative',
          message: t('LiquidationPF.aperiodique.messages.enterFirstExamDate'),
          position: 'top',
          icon: 'warning'
        });
        return;
      }
      if (form.ap2 && !form.dateExamen2) {
        Notify.create({
          type: 'negative',
          message: t('LiquidationPF.aperiodique.messages.enterSecondExamDate'),
          position: 'top',
          icon: 'warning'
        });
        return;
      }
      if (form.indemniteJournaliere && !form.dateDebConges) {
        Notify.create({
          type: 'negative',
          message: t('LiquidationPF.aperiodique.messages.enterLeaveStartDate'),
          position: 'top',
          icon: 'warning'
        });
        return;
      }
      if (form.indemniteJournaliere && !form.matriculeInterne) {
        Notify.create({
          type: 'negative',
          message: t('LiquidationPF.aperiodique.messages.internalRegistrationRequired'),
          position: 'top',
          icon: 'warning'
        });
        return;
      }

      dialog.value = false;
      Notify.create({
        type: 'positive',
        message: t('LiquidationPF.aperiodique.messages.formValidated'),
        position: 'top',
        icon: 'check_circle'
      });
    };

    // Recherche des dossiers
    const searchDossiers = () => {
      Notify.create({
        type: 'positive',
        message: `${rows.value.length} ${t('LiquidationPF.aperiodique.messages.dossiersFound')}`,
        position: 'top',
        icon: 'search'
      });
    };

    // Réinitialisation de la recherche
    const resetSearch = () => {
      searchCriteria.value = 'numDossier';
      searchStartValue.value = '';
      searchEndValue.value = '';
    };

    // Chargement des données d'un dossier dans le formulaire
    const loadDossier = (row) => {
      form.numDossier = row.numDossier;
      form.numAssure = row.numAssure;
      form.nomAssure = row.nomRequerant;
      form.prenomAssure = '';
      form.dateDemande = row.dateDemande;
      form.naturePrestation = row.naturePrestation;
      form.sexeAssure = 'F'; // Par défaut pour les PF

      // Réinitialiser les autres champs
      form.dateExamen1 = '';
      form.dateExamen2 = '';
      form.datePreAcc = '';
      form.dateEffAcc = '';
      form.dateDebConges = '';
      form.dateFinConges = '';
      form.employeurActuel = '';
      form.matriculeInterne = '';
      form.salaireReconstitue = '';

      // Ouvrir automatiquement le formulaire
      dialog.value = true;

      Notify.create({
        type: 'info',
        message: `${t('LiquidationPF.aperiodique.table.columns.dossierNumber')} ${row.numDossier} ${t('LiquidationPF.aperiodique.messages.dossierLoaded')}`,
        position: 'top',
        icon: 'info'
      });
    };

    return {
      dialog,
      form,
      searchCriteria,
      searchOptions,
      searchStartValue,
      searchEndValue,
      rows,
      columns,
      locale,
      toggleAP1,
      toggleFM1,
      toggleAP2,
      toggleFM2,
      toggleAccouchement,
      toggleFraisMedicauxAcc,
      toggleBaseCalcul30,
      toggleBaseCalcul25,
      handleAccPremature,
      validateForm,
      searchDossiers,
      resetSearch,
      loadDossier
    };
  }
};
</script>

<style scoped>
.hover-highlight:hover {
  background-color: rgba(25, 118, 210, 0.1) !important;
  transition: background-color 0.2s ease;
}

.q-table__top {
  padding: 16px;
}

.text-body2 {
  font-size: 0.875rem;
}

.rounded-borders {
  border-radius: 12px;
}

.q-dialog__inner {
  padding: 16px;
}

/* Amélioration des checkboxes */
.q-checkbox .q-checkbox__label {
  font-size: 0.875rem;
}

/* Style pour les champs en lecture seule */
.q-field--readonly .q-field__control {
  opacity: 0.8;
}

/* Animation pour l'ouverture du dialog */
.q-dialog .q-card {
  animation: fadeInUp 0.3s ease-out;
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

/* Style spécifique pour la table (adopté du premier exemple) */
.fairy-table {
  border-radius: 0 0 15px 15px;
}

.hover-row:hover {
  background: rgba(103, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.q-btn {
  transition: all 0.3s ease;
}

.q-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.q-card {
  transition: all 0.3s ease;
}

.q-input, .q-select {
  transition: all 0.3s ease;
}

.q-input:hover, .q-select:hover {
  transform: translateY(-1px);
}

.q-dialog .q-card {
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
</style>

<template>
  <div class="q-pa-md" style="min-height: 100vh;">
    <!-- Header Section -->
    <div class="text-center q-mb-lg">
      <div class="text-h6 text-primary q-mb-sm">
        {{ $t('LiquidationPF.saisieReprises.title') }}
      </div>
    </div>
    <!-- Search Section -->
    <q-card class="q-mb-md" style="border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
      <q-card-section class="text-primary" style="border-radius: 15px 15px 0 0;">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-select
              v-model="searchCriteria"
              :options="searchOptions"
              :label="$t('LiquidationPF.saisieReprises.searchForm.criteria')"
              dense
              outlined
              class="text-primary"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="searchValueStart"
              :label="$t('LiquidationPF.saisieReprises.searchForm.startValue')"
              prefix="000-"
              dense
              outlined
              class="text-primary"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="searchValueEnd"
              :label="$t('LiquidationPF.saisieReprises.searchForm.endValue')"
              dense
              outlined
              class="text-primary"
            />
          </div>
          <div class="col-12 col-md-3">
            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                :label="$t('LiquidationPF.saisieReprises.searchForm.search')"
                icon="search"
                dense
                style="border-radius: 10px;"
                @click="searchRecords"
              />
              <q-btn
                color="grey"
                :label="$t('LiquidationPF.saisieReprises.searchForm.cancel')"
                icon="cancel"
                dense
                style="border-radius: 10px;"
                @click="clearSearch"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Main Action Button -->
    <div class="text-center q-mb-lg">
      <q-btn
        color="primary"
        size="md"
        :label="$t('LiquidationPF.saisieReprises.addButton')"
        icon="add_circle"
        @click="openDialog"
        style="border-radius: 25px; padding: 12px 30px; box-shadow: 0 6px 20px rgba(0,0,0,0.2); text-transform: none; font-weight: 600;"
        class="text-white"
      >
        <q-tooltip class="bg-grey text-body2">
          {{ $t('LiquidationPF.saisieReprises.searchForm.tooltip') }}
        </q-tooltip>
      </q-btn>
    </div>

    <!-- Dialog Form -->
    <q-dialog v-model="dialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card>
        <q-bar class="bg-primary text-white">
          <q-space />
          <div class="text-h6">{{ $t('LiquidationPF.saisieReprises.dialogTitle') }}</div>
          <q-space />
          <q-btn dense flat icon="close" @click="closeDialog">
            <q-tooltip class="bg-white text-primary">{{ $t('LiquidationPF.saisieReprises.closeButton') }}</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section style="padding: 0;">
          <q-scroll-area style="height: calc(100vh - 60px);">
            <div class="q-pa-lg">
              <q-form @submit="validateForm" class="q-gutter-md">
                <!-- Basic Info Section -->
                <q-card class="q-mb-md" style="border-radius: 15px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-md">
                      <q-icon name="folder" class="q-mr-sm" />
                      {{ $t('LiquidationPF.saisieReprises.sections.dossierInfo') }}
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-6">
                        <q-input
                          v-model="form.numDossier"
                          :label="$t('LiquidationPF.saisieReprises.form.dossierNumber')"
                          dense
                          readonly
                          outlined
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-6">
                        <q-input
                          v-model="form.numAssure"
                          :label="$t('LiquidationPF.saisieReprises.form.insuredNumber')"
                          dense
                          readonly
                          outlined
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-4">
                        <q-input
                          v-model="form.naturePrestation"
                          :label="$t('LiquidationPF.saisieReprises.form.naturePrestation')"
                          dense
                          readonly
                          outlined
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-4">
                        <q-input
                          v-model="form.nomAssure"
                          :label="$t('LiquidationPF.saisieReprises.form.insuredNames')"
                          dense
                          readonly
                          outlined
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-4">
                        <q-input
                          v-model="form.prenomAssure"
                          :label="$t('LiquidationPF.saisieReprises.form.insuredFirstNames')"
                          dense
                          readonly
                          outlined
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Reprise/Non Reprise Section -->
                <q-card class="q-mb-md" style="border-radius: 15px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-md">
                      <q-icon name="assignment" class="q-mr-sm" />
                      {{ $t('LiquidationPF.saisieReprises.sections.repriseDetails') }}
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-6 col-md-2">
                        <q-select
                          v-model="form.type"
                          :options="typeOptions"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          :label="$t('LiquidationPF.saisieReprises.form.type')"
                          dense
                          outlined
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-6 col-md-2">
                        <q-select
                          v-model="form.rang"
                          :options="rankOptions"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          :label="$t('LiquidationPF.saisieReprises.form.rank')"
                          dense
                          outlined
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-6 col-md-2">
                        <q-input
                          v-model="form.dateDebut"
                          :label="$t('LiquidationPF.saisieReprises.form.startDate')"
                          dense
                          outlined
                          color="primary"
                          bg-color="white"
                          style="border-radius: 10px;"
                          :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                          :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                          :rules="[val => val && val.length === 10 || $t('LiquidationPF.saisieReprises.messages.enterValidStartDate')]"
                        >
                          <template #append>
                            <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                              <q-popup-proxy transition-show="scale" transition-hide="scale">
                                <q-date
                                  v-model="form.dateDebut"
                                  :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                  :locale="locale"
                                  color="primary"
                                  @update:model-value="updateDateDebut"
                                />
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                      <div class="col-6 col-md-2">
                        <q-input
                          v-model="form.dateFin"
                          :label="$t('LiquidationPF.saisieReprises.form.endDate')"
                          dense
                          outlined
                          color="primary"
                          bg-color="white"
                          style="border-radius: 10px;"
                          :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                          :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                          :rules="[val => val && val.length === 10 || $t('LiquidationPF.saisieReprises.messages.enterValidStartDate')]"
                        >
                          <template #append>
                            <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                              <q-popup-proxy transition-show="scale" transition-hide="scale">
                                <q-date
                                  v-model="form.dateFin"
                                  :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                  :locale="locale"
                                  color="primary"
                                  @update:model-value="updateDateFin"
                                />
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                      <div class="col-6 col-md-2">
                        <q-input
                          v-model="form.matAssure"
                          :label="$t('LiquidationPF.saisieReprises.form.insuredRegistration')"
                          dense
                          readonly
                          outlined
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-6 col-md-2">
                        <q-input
                          v-model="form.joursPayes"
                          :label="$t('LiquidationPF.saisieReprises.form.paidDays')"
                          dense
                          type="number"
                          outlined
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-3">
                        <q-input
                          v-model="form.reliquat"
                          :label="$t('LiquidationPF.saisieReprises.form.balance')"
                          dense
                          type="number"
                          outlined
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-3">
                        <q-input
                          v-model="form.dateDemande"
                          :label="$t('LiquidationPF.saisieReprises.form.requestDate')"
                          dense
                          readonly
                          outlined
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Remboursement Section -->
                <q-card class="q-mb-md" style="border-radius: 15px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-md">
                      <q-icon name="account_balance" class="q-mr-sm" />
                      {{ $t('LiquidationPF.saisieReprises.sections.employerReimbursement') }}
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-6 col-md-3">
                        <q-select
                          v-model="form.rembEmployeur"
                          :options="typeOptions"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          :label="$t('LiquidationPF.saisieReprises.form.employerReimbursement')"
                          dense
                          outlined
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-6 col-md-3">
                        <q-input
                          v-model="form.numEmployeur"
                          :label="$t('LiquidationPF.saisieReprises.form.employerNumber')"
                          dense
                          outlined
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-6 col-md-3">
                        <q-input
                          v-model="form.dateDebutRemb"
                          :label="$t('LiquidationPF.saisieReprises.form.reimbursementStartDate')"
                          dense
                          outlined
                          color="primary"
                          bg-color="white"
                          style="border-radius: 10px;"
                          :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                          :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                          :rules="[val => val && val.length === 10 || $t('LiquidationPF.saisieReprises.messages.enterValidStartDate')]"
                        >
                          <template #append>
                            <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                              <q-popup-proxy transition-show="scale" transition-hide="scale">
                                <q-date
                                  v-model="form.dateDebutRemb"
                                  :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                  :locale="locale"
                                  color="primary"
                                  @update:model-value="updateDateDebutRemb"
                                />
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                      <div class="col-6 col-md-3">
                        <q-input
                          v-model="form.dateFinRemb"
                          :label="$t('LiquidationPF.saisieReprises.form.reimbursementEndDate')"
                          dense
                          outlined
                          color="primary"
                          bg-color="white"
                          style="border-radius: 10px;"
                          :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                          :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                          :rules="[val => val && val.length === 10 || $t('LiquidationPF.saisieReprises.messages.enterValidStartDate')]"
                        >
                          <template #append>
                            <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                              <q-popup-proxy transition-show="scale" transition-hide="scale">
                                <q-date
                                  v-model="form.dateFinRemb"
                                  :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                  :locale="locale"
                                  color="primary"
                                  @update:model-value="updateDateFinRemb"
                                />
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Action Buttons -->
                <div class="row q-gutter-md justify-center q-mt-lg">
                  <q-btn
                    :label="$t('LiquidationPF.saisieReprises.actions.validate')"
                    type="submit"
                    color="positive"
                    icon="check"
                    style="border-radius: 20px; padding: 10px 25px;"
                    size="md"
                  />
                  <q-btn
                    :label="$t('LiquidationPF.saisieReprises.actions.delete')"
                    color="negative"
                    icon="delete"
                    style="border-radius: 20px; padding: 10px 25px;"
                    size="md"
                    @click="submitFunction(2)"
                  />
                  <q-btn
                    :label="$t('LiquidationPF.saisieReprises.actions.reset')"
                    color="grey"
                    icon="refresh"
                    style="border-radius: 20px; padding: 10px 25px;"
                    size="md"
                    @click="resetForm"
                  />
                  <q-btn
                    :label="$t('LiquidationPF.saisieReprises.actions.cancel')"
                    flat
                    color="secondary"
                    icon="cancel"
                    style="border-radius: 20px; padding: 10px 25px;"
                    size="md"
                    @click="closeDialog"
                  />
                </div>
              </q-form>
            </div>
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Navigation -->
    <div class="text-center q-mb-md">
      <q-btn-group rounded>
        <q-btn color="primary" :label="$t('LiquidationPF.saisieReprises.actions.previous')" icon="chevron_left" @click="previousPage" />
        <q-btn color="primary" label="1" />
        <q-btn color="primary" :label="$t('LiquidationPF.saisieReprises.actions.next')" icon-right="chevron_right" @click="nextPage" />
      </q-btn-group>
    </div>

    <!-- Data Table -->
    <q-card style="border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
      <q-card-section class="bg-primary text-white" style="border-radius: 15px 15px 0 0;">
        <div class="text-h6">
          <q-icon name="table_view" class="q-mr-sm" />
          {{ $t('LiquidationPF.saisieReprises.table.title') }}
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
          <q-tr :props="props" class="hover-row" @click="loadForm(props.row)">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="font-size: 0.85rem; cursor: pointer;"
            >
              {{ col.value }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const { t, locale } = useI18n();

// Search Data
const searchCriteria = ref('Num Dossier');
const searchValueStart = ref('');
const searchValueEnd = ref('');

// Search options
const searchOptions = [
  t('LiquidationPF.saisieReprises.searchOptions.dossierNumber'),
  t('LiquidationPF.saisieReprises.searchOptions.insuredNumber'),
  t('LiquidationPF.saisieReprises.searchOptions.requesterNames')
];

// Type options
const typeOptions = [
  { label: t('LiquidationPF.saisieReprises.form.no'), value: 'NON' },
  { label: t('LiquidationPF.saisieReprises.form.yes'), value: 'OUI' }
];

// Rank options
const rankOptions = [
  { label: t('LiquidationPF.saisieReprises.form.rank1'), value: 1 },
  { label: t('LiquidationPF.saisieReprises.form.rank2'), value: 2 },
  { label: t('LiquidationPF.saisieReprises.form.rank3'), value: 3 },
  { label: t('LiquidationPF.saisieReprises.form.rank4'), value: 4 },
  { label: t('LiquidationPF.saisieReprises.form.rank5'), value: 5 }
];

// Form Data
const dialog = ref(false);
const form = ref({
  numDossier: 'DOS001',
  numAssure: 'ASS123456',
  nomAssure: 'NGUYEN',
  prenomAssure: 'Marie Claire',
  naturePrestation: 'Prestations Familiales',
  dateDemande: '2025-07-28',
  type: null,
  rang: null,
  dateDebut: '',
  dateFin: '',
  matAssure: 'MAT789',
  joursPayes: '',
  reliquat: '',
  rembEmployeur: null,
  numEmployeur: '',
  dateDebutRemb: '',
  dateFinRemb: ''
});

// Functions
const openDialog = () => {
  dialog.value = true;
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.saisieReprises.messages.formOpened'),
    position: 'top',
    timeout: 2000
  });
};

const closeDialog = () => {
  dialog.value = false;
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.saisieReprises.messages.formClosed'),
    position: 'top',
    timeout: 2000
  });
};

const validateForm = () => {
  if (!form.value.numAssure) {
    $q.notify({
      type: 'negative',
      message: t('LiquidationPF.saisieReprises.messages.enterInsuredNumber'),
      position: 'top',
      timeout: 3000
    });
    return;
  }
  if (!form.value.dateDebut || form.value.dateDebut.length !== 10) {
    $q.notify({
      type: 'negative',
      message: t('LiquidationPF.saisieReprises.messages.enterValidStartDate'),
      position: 'top',
      timeout: 3000
    });
    return;
  }

  dialog.value = false;
  $q.notify({
    type: 'positive',
    message: t('LiquidationPF.saisieReprises.messages.formValidated'),
    position: 'top',
    timeout: 3000,
    actions: [
      { label: t('LiquidationPF.saisieReprises.closeButton'), color: 'white' }
    ]
  });
};

const submitFunction = (action) => {
  if (action === 2) {
    $q.dialog({
      title: t('LiquidationPF.saisieReprises.messages.confirmationTitle'),
      message: t('LiquidationPF.saisieReprises.messages.confirmDelete'),
      cancel: true,
      persistent: true
    }).onOk(() => {
      $q.notify({
        type: 'positive',
        message: t('LiquidationPF.saisieReprises.messages.elementDeleted'),
        position: 'top',
        timeout: 3000
      });
    });
  }
};

const resetForm = () => {
  form.value = {
    numDossier: '',
    numAssure: '',
    nomAssure: '',
    prenomAssure: '',
    naturePrestation: '',
    dateDemande: '',
    type: null,
    rang: null,
    dateDebut: '',
    dateFin: '',
    matAssure: '',
    joursPayes: '',
    reliquat: '',
    rembEmployeur: null,
    numEmployeur: '',
    dateDebutRemb: '',
    dateFinRemb: ''
  };

  $q.notify({
    type: 'info',
    message: t('LiquidationPF.saisieReprises.messages.formReset'),
    position: 'top',
    timeout: 2000
  });
};

const searchRecords = () => {
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.saisieReprises.messages.searchInProgress'),
    position: 'top',
    timeout: 2000
  });
};

const clearSearch = () => {
  searchValueStart.value = '';
  searchValueEnd.value = '';
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.saisieReprises.messages.searchCancelled'),
    position: 'top',
    timeout: 2000
  });
};

const previousPage = () => {
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.saisieReprises.messages.previousPage'),
    position: 'bottom',
    timeout: 1000
  });
};

const nextPage = () => {
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.saisieReprises.messages.nextPage'),
    position: 'bottom',
    timeout: 1000
  });
};

const updateDateDebut = (value) => {
  form.value.dateDebut = value;
};

const updateDateFin = (value) => {
  form.value.dateFin = value;
};

const updateDateDebutRemb = (value) => {
  form.value.dateDebutRemb = value;
};

const updateDateFinRemb = (value) => {
  form.value.dateFinRemb = value;
};

// Fonction pour charger les données d'une ligne dans le formulaire
const loadForm = (row) => {
  // Charger les données de base
  form.value.txtsaisiematempl = row.matEmployeur || '';
  form.value.txtraisonsociale = row.raisonSociale || '';
  form.value.txtsaisiedateembauche = row.dateEmbauche || '';
  form.value.txtsaisienumassu = row.numAssure || '';
  form.value.txtsaisietextenomassu = row.nomAssure || '';
  form.value.txtsaisietexteprenomassu = '';

  // Charger les données de reprise
  form.value.cbxtype = row.type === 'En Activité' ? 'ACT' : 'INT';
  form.value.txtsaisiematassu = row.numAssure || '';
  form.value.txtSaisiedatedebutreprise = row.dateEmbauche || '';
  form.value.txtSaisiedatefinreprise = row.dateCessation === 'null' ? '' : row.dateCessation || '';
  form.value.txtsaisienumempl = row.matEmployeur || '';

  // Charger les données de remboursement (initialiser avec des valeurs vides)
  form.value.rembEmployeur = null;
  form.value.numEmployeur = '';
  form.value.dateDebutRemb = '';
  form.value.dateFinRemb = '';

  // Ouvrir le dialogue
  dialog.value = true;

  // Notification pour informer l'utilisateur
  $q.notify({
    type: 'info',
    message: `${t('LiquidationPF.saisieReprises.messages.dossierLoaded')} ${row.numAssure}`,
    position: 'top',
    timeout: 2000
  });
};

// Table Data
const columns = [
  { name: 'numDossier', label: t('LiquidationPF.saisieReprises.table.columns.dossierNumber'), field: 'numDossier', align: 'left', sortable: true },
  { name: 'numAssure', label: t('LiquidationPF.saisieReprises.table.columns.insuredNumber'), field: 'numAssure', align: 'left', sortable: true },
  { name: 'nomRequerant', label: t('LiquidationPF.saisieReprises.table.columns.requesterNames'), field: 'nomRequerant', align: 'left', sortable: true },
  { name: 'dateDemande', label: t('LiquidationPF.saisieReprises.table.columns.requestDate'), field: 'dateDemande', align: 'left', sortable: true },
  { name: 'naturePrestation', label: t('LiquidationPF.saisieReprises.table.columns.naturePrestation'), field: 'naturePrestation', align: 'left', sortable: true },
  { name: 'positionDossier', label: t('LiquidationPF.saisieReprises.table.columns.dossierStatus'), field: 'positionDossier', align: 'left', sortable: true },
  { name: 'datePosition', label: t('LiquidationPF.saisieReprises.table.columns.statusDate'), field: 'datePosition', align: 'left', sortable: true }
];

const rows = [
  {
    id: 1,
    numDossier: 'DOS001',
    numAssure: 'ASS123456',
    nomRequerant: 'NGUYEN Marie Claire',
    dateDemande: '2025-07-01',
    naturePrestation: 'Prestations Familiales',
    positionDossier: 'En cours',
    datePosition: '2025-07-15'
  },
  {
    id: 2,
    numDossier: 'DOS002',
    numAssure: 'ASS789012',
    nomRequerant: 'KAMDEM Jean Paul',
    dateDemande: '2025-07-02',
    naturePrestation: 'Indemnités Journalières',
    positionDossier: 'Validé',
    datePosition: '2025-07-20'
  },
  {
    id: 3,
    numDossier: 'DOS003',
    numAssure: 'ASS345678',
    nomRequerant: 'FOTSO Christine',
    dateDemande: '2025-07-03',
    naturePrestation: 'Prestations Familiales',
    positionDossier: 'En attente',
    datePosition: '2025-07-18'
  }
];
</script>

<style scoped>
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

/* Animation pour l'ouverture du dialogue */
.q-dialog__inner {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }

  .text-h6 {
    font-size: 1.1rem !important;
  }
}
</style>

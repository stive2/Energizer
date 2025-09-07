<template>
  <q-page class="q-pa-md">
    <!-- Header avec bannière CNPS -->


    <!-- Formulaire principal -->
    <q-card class="form-card">
      <q-card-section class="q-pa-md">
        <!-- Titre du formulaire -->
        <div class="text-h6 text-center text-primary q-mb-lg">
          <q-icon name="account_balance_wallet" class="q-mr-sm" />
          Formulaire de saisie des encaissements de cotisation assuré volontaire
        </div>

        <q-form ref="formRef" @submit="onSubmit" class="q-gutter-y-md form-centered">
          <!-- Section Zone de recherche -->
          <q-expansion-item
            icon="search"
            label="Zone de recherche"
            class="section-card"
            header-class="text-primary"
            default-opened
          >
            <q-card flat>
              <q-card-section class="q-gutter-sm">
                <div class="row q-gutter-sm justify-center">
                  <div class="">
                    <q-input
                      v-model="formData.numAssure"
                      label="Saisir le numéro Assuré"
                      outlined
                      dense
                      class="field-input"
                      :rules="[
                        val => !!val || 'Ce champ est obligatoire',
                        val => validateNumAssure(val) || 'Format invalide. Utilisez: 321-11006497-9'
                      ]"
                      hint="Format: 000-0000000-0"
                      @blur="searchAssure"
                      :loading="loadingAssure"
                    >
                      <template v-slot:append>
                        <q-icon
                          v-if="loadingAssure"
                          name="refresh"
                          class="rotating"
                        />
                        <q-icon
                          v-else-if="formData.numAssure && assureFound"
                          name="check_circle"
                          color="positive"
                        />
                        <q-icon
                          v-else-if="formData.numAssure && !assureFound && !loadingAssure"
                          name="sentiment_dissatisfied"
                          color="negative"
                        />
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Section Informations sur le contrat financier -->
          <q-expansion-item
            icon="description"
            label="Informations sur le contrat financier courant"
            class="section-card"
            header-class="text-primary"
            :default-opened="!!formData.contrat.numContrat"
          >
            <q-card flat>
              <q-card-section class="q-gutter-sm">
                <div class="row q-gutter-sm">
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.contrat.mois60Ans"
                      label="Mois 60ème anniversaire"
                      outlined
                      dense
                      readonly
                      class="field-input"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.contrat.numContrat"
                      label="Contrat Num"
                      outlined
                      dense
                      readonly
                      class="field-input"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.contrat.dateEffetAffi"
                      label="Date d'effet Affi"
                      outlined
                      dense
                      readonly
                      class="field-input"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.contrat.dateCloture"
                      label="Date de clôture"
                      outlined
                      dense
                      readonly
                      class="field-input"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.contrat.revenuAnnuel"
                      label="Revenu Annuel"
                      outlined
                      dense
                      readonly
                      class="field-input"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.contrat.origineRevenu"
                      label="Origine des revenus"
                      outlined
                      dense
                      readonly
                      class="field-input"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.contrat.assietteMens"
                      label="Assiette mensuelle"
                      outlined
                      dense
                      readonly
                      class="field-input"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.contrat.montantMens"
                      label="Montant Mensuel à payer"
                      outlined
                      dense
                      readonly
                      class="field-input"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.contrat.dateEffet"
                      label="Date d'effet CF"
                      outlined
                      dense
                      readonly
                      class="field-input"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Section Liste des encaissements -->
          <q-expansion-item
            icon="list_alt"
            label="Liste des encaissements AV effectués auprès des collecteurs"
            class="section-card"
            header-class="text-primary"
          >
            <q-card flat>
              <q-card-section>
                <q-table
                  :rows="encaissements"
                  :columns="encaissementColumns"
                  row-key="id"
                  flat
                  bordered
                  :rows-per-page-options="[5, 10, 20]"
                  :pagination="{ rowsPerPage: 10 }"
                  class="q-mt-md"
                  @row-click="selectEncaissement"
                >
                  <template v-slot:body-cell-montant="props">
                    <q-td :props="props">
                      <span class="text-weight-bold text-positive">{{ formatCurrency(props.value) }}</span>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Section Détails du paiement -->
          <q-expansion-item
            icon="payment"
            label="Détails Informations liées au paiement"
            class="section-card"
            header-class="text-primary"
            :default-opened="!!formData.paiement.montant"
          >
            <q-card flat>
              <q-card-section class="q-gutter-sm">
                <div class="row q-gutter-sm">
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.paiement.montant"
                      label="Montant versé *"
                      outlined
                      dense
                      type="number"
                      step="0.01"
                      class="field-input"
                      :rules="[val => !!val || 'Ce champ est obligatoire']"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.paiement.refPaiement"
                      label="Référence du Titre de paiement *"
                      outlined
                      dense
                      class="field-input"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-select
                      v-model="formData.paiement.modePaiement"
                      :options="modesPaiement"
                      label="Mode de paiement *"
                      outlined
                      dense
                      class="field-input"
                      :rules="[val => !!val || 'Ce champ est obligatoire']"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.paiement.datePaiement"
                      label="Date de paiement *"
                      outlined
                      dense
                      readonly
                      class="field-input"
                      :rules="[val => !!val || 'Ce champ est obligatoire']"
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" color="primary">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-date
                              v-model="formData.paiement.datePaiement"
                              :mask="'DD/MM/YYYY'"
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
          </q-expansion-item>

          <!-- Section Informations complémentaires -->
          <q-expansion-item
            icon="info"
            label="Informations complémentaires sur le paiement"
            class="section-card"
            header-class="text-primary"
          >
            <q-card flat>
              <q-card-section class="q-gutter-sm">
                <div class="row q-gutter-sm">
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.complementaire.reserve"
                      label="Montant en réserve"
                      outlined
                      dense
                      readonly
                      type="number"
                      class="field-input"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.complementaire.detteMajoration"
                      label="Dette en majoration"
                      outlined
                      dense
                      readonly
                      type="number"
                      class="field-input"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-select
                      v-model="formData.complementaire.natureCotisation"
                      :options="naturesCotisation"
                      label="Nature de cotisation"
                      outlined
                      dense
                      class="field-input"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-select
                      v-model="formData.complementaire.etablissementFinancier"
                      :options="etablissementsFinanciers"
                      label="Établissement financier *"
                      outlined
                      dense
                      class="field-input"
                      :rules="[val => !!val || 'Ce champ est obligatoire']"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-select
                      v-model="formData.complementaire.typeQuittance"
                      :options="typesQuittance"
                      label="Type de Quittance"
                      outlined
                      dense
                      class="field-input"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.complementaire.numQuittance"
                      label="Num quittance"
                      outlined
                      dense
                      type="number"
                      class="field-input"
                      :disable="formData.complementaire.typeQuittance === 'AUTOMATIQUE'"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-select
                      v-model="formData.complementaire.quittanceAEditer"
                      :options="quittancesDisponibles"
                      label="Quittance à générer"
                      outlined
                      dense
                      class="field-input"
                      @focus="loadQuittances"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="formData.complementaire.listeQuittanceEdit"
                      label="Liste Quittance à Générer"
                      outlined
                      dense
                      readonly
                      class="field-input"
                    />
                  </div>
                </div>
                <div class="q-mt-md">
                  <q-banner class="bg-red-1 text-red-8">
                    <template v-slot:avatar>
                      <q-icon name="info" />
                    </template>
                    NB: Le montant en réserve servira uniquement dans les encaissements de cotisations principales
                  </q-banner>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Section Liste des quittances générées -->
          <q-expansion-item
            icon="receipt"
            label="Liste des quittances AV générées"
            class="section-card"
            header-class="text-primary"
          >
            <q-card flat>
              <q-card-section>
                <q-table
                  :rows="quittancesGenerees"
                  :columns="quittanceColumns"
                  row-key="id"
                  flat
                  bordered
                  :rows-per-page-options="[5, 10, 20]"
                  :pagination="{ rowsPerPage: 10 }"
                  class="q-mt-md"
                >
                  <template v-slot:body-cell-montant="props">
                    <q-td :props="props">
                      <span class="text-weight-bold text-positive">{{ formatCurrency(props.value) }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-fichier="props">
                    <q-td :props="props">
                      <q-btn
                        flat
                        color="primary"
                        label="AFFICHER"
                        @click="openQuittance(props.value)"
                        size="sm"
                      />
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Section Actions -->
          <q-card flat bordered class="action-section">
            <q-card-section class="q-gutter-sm">
              <div class="row q-gutter-sm justify-center">
                <q-btn
                  label="Enregistrer"
                  color="primary"
                  size="md"
                  icon="save"
                  @click="enregistrer"
                  :loading="loading"
                  class="action-btn"
                />
                <q-btn
                  label="Charger les encaissements"
                  color="info"
                  size="md"
                  icon="refresh"
                  @click="chargerEncaissements"
                  class="action-btn"
                />
                <q-btn
                  label="Générer Quittance"
                  color="secondary"
                  size="md"
                  icon="receipt"
                  @click="genererQuittance"
                  class="action-btn"
                />
                <q-btn
                  label="Charger Quittances à imprimer"
                  color="accent"
                  size="md"
                  icon="print"
                  @click="chargerQuittances"
                  class="action-btn"
                />
                <q-btn
                  label="Vider Formulaire"
                  color="grey-7"
                  size="md"
                  icon="clear_all"
                  outline
                  @click="viderFormulaire"
                  class="action-btn"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-form>
      </q-card-section>
    </q-card>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

// Références du formulaire
const formRef = ref(null);
const loading = ref(false);
const loadingAssure = ref(false);
const assureFound = ref(false);



// Données du formulaire
const formData = ref({
  numAssure: '',
  contrat: {
    mois60Ans: '',
    numContrat: '',
    dateEffetAffi: '',
    dateCloture: '',
    revenuAnnuel: '',
    origineRevenu: '',
    assietteMens: '',
    montantMens: '',
    dateEffet: ''
  },
  paiement: {
    montant: '',
    refPaiement: '',
    modePaiement: '',
    datePaiement: ''
  },
  complementaire: {
    reserve: 0,
    detteMajoration: 0,
    natureCotisation: 'Cotisations principales',
    etablissementFinancier: '',
    typeQuittance: 'AUTOMATIQUE',
    numQuittance: '',
    quittanceAEditer: '',
    listeQuittanceEdit: ''
  }
});

// Données des encaissements
const encaissements = ref([]);
const encaissementColumns = ref([
  {
    name: 'numAssure',
    label: 'NUMÉRO ASSURÉ',
    field: 'numAssure',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'nomAssure',
    label: 'NOM ASSURÉ',
    field: 'nomAssure',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'refPaiement',
    label: 'RÉFÉRENCE PAIEMENT',
    field: 'refPaiement',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'montant',
    label: 'MONTANT',
    field: 'montant',
    align: 'right',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'datePaiement',
    label: 'DATE PAIEMENT',
    field: 'datePaiement',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'origine',
    label: 'ORIGINE',
    field: 'origine',
    align: 'right',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'modePaiement',
    label: 'MODE PAIEMENT',
    field: 'modePaiement',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'codeCentre',
    label: 'CODE CENTRE DE GESTION',
    field: 'codeCentre',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  }
]);

// Données des quittances générées
const quittancesGenerees = ref([]);
const quittanceColumns = ref([
  {
    name: 'numQuit',
    label: 'NUMÉRO',
    field: 'numQuit',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'montant',
    label: 'MONTANT',
    field: 'montant',
    align: 'right',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'dateCrea',
    label: 'DATE PAIEMENT',
    field: 'dateCrea',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'codeContrat',
    label: 'NUMÉRO CONTRAT',
    field: 'codeContrat',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'dateGeneration',
    label: 'DATE GÉNÉRATION',
    field: 'dateGeneration',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'fichierQuittance',
    label: 'QUITTANCE',
    field: 'fichierQuittance',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  }
]);

// Options des sélecteurs
const modesPaiement = ref([
  'Espèces',
  'Chèque',
  'Virement',
  'Carte bancaire',
  'Prélèvement'
]);

const naturesCotisation = ref([
  'Cotisations principales',
  'Cotisations majorées',
  'Cotisations de réserve'
]);

const etablissementsFinanciers = ref([
  'UBA CAMEROUN',
  'SOCIETE GENERALE',
  'AFRILAND FIRST BANK',
  'ECOBANK',
  'STANDARD CHARTERED'
]);

const typesQuittance = ref([
  'MANUELLE',
  'AUTOMATIQUE'
]);

const quittancesDisponibles = ref([]);

// Fonction de validation du numéro d'assuré
const validateNumAssure = (val) => {
  const regex = /^\d{3}-\d{8}-\d{1}$/;
  return regex.test(val);
};

// Fonction de formatage des montants
const formatCurrency = (value) => {
  if (!value) return '0,00 FCFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 2
  }).format(value).replace('XOF', 'FCFA');
};

// Fonction de recherche d'assuré
const searchAssure = async () => {
  if (!formData.value.numAssure || !validateNumAssure(formData.value.numAssure)) {
    $q.notify({
      type: 'negative',
      message: 'Veuillez saisir un numéro d\'assuré valide',
      position: 'top'
    });
    return;
  }

  loadingAssure.value = true;
  assureFound.value = false;

  try {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Données factices basées sur l'exemple fourni
    const fakeAssureData = {
      '321-11006497-9': {
        mois60Ans: '03/2028',
        numContrat: 'CF2024001',
        dateEffetAffi: '15/03/2024',
        dateCloture: '14/03/2029',
        revenuAnnuel: '1800000',
        origineRevenu: 'SALAIRE PRIVE',
        assietteMens: '150000',
        montantMens: '7500',
        dateEffet: '15/03/2024',
        reserve: 75000,
        detteMajoration: 0
      },
      '123-1234567-123': {
        mois60Ans: '12/2025',
        numContrat: 'CF2025001',
        dateEffetAffi: '01/01/2025',
        dateCloture: '31/12/2025',
        revenuAnnuel: '1200000',
        origineRevenu: 'SALAIRE',
        assietteMens: '100000',
        montantMens: '5000',
        dateEffet: '01/01/2025',
        reserve: 50000,
        detteMajoration: 0
      }
    };

    const assureData = fakeAssureData[formData.value.numAssure];

    if (assureData) {
      assureFound.value = true;
      formData.value.contrat = { ...assureData };
      formData.value.complementaire.reserve = assureData.reserve;
      formData.value.complementaire.detteMajoration = assureData.detteMajoration;

      $q.notify({
        type: 'positive',
        message: 'Informations assuré chargées avec succès',
        position: 'top',
        timeout: 2000
      });
    } else {
      assureFound.value = false;
      $q.notify({
        type: 'negative',
        message: `Assuré avec le numéro ${formData.value.numAssure} non trouvé`,
        position: 'top',
        timeout: 3000
      });
    }
  } catch {
    assureFound.value = false;
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des informations assuré',
      position: 'top'
    });
  } finally {
    loadingAssure.value = false;
  }
};

// Fonction de sélection d'encaissement
const selectEncaissement = (evt, row) => {
  const encaissement = encaissements.value[row];
  if (encaissement) {
    formData.value.paiement.montant = encaissement.montant;
    formData.value.paiement.refPaiement = encaissement.refPaiement;
    formData.value.paiement.datePaiement = encaissement.datePaiement;
    formData.value.paiement.modePaiement = encaissement.modePaiement;

    $q.notify({
      type: 'info',
      message: `Encaissement sélectionné: ${encaissement.numAssure} - ${encaissement.nomAssure}`,
      position: 'top'
    });
  }
};

// Fonction de chargement des quittances
const loadQuittances = async () => {
  if (!formData.value.numAssure) return;

  try {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));

    quittancesDisponibles.value = [
      { label: 'Q2024001 - 20/01/2025', value: 'Q2024001' },
      { label: 'Q2024002 - 20/02/2025', value: 'Q2024002' },
      { label: 'Q2025001 - 01/01/2025', value: 'Q2025001' },
      { label: 'Q2025002 - 01/02/2025', value: 'Q2025002' }
    ];
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des quittances',
      position: 'top'
    });
  }
};

// Fonction d'enregistrement
const enregistrer = async () => {
  const isValid = await formRef.value.validate();
  if (!isValid) {
    $q.notify({
      type: 'negative',
      message: 'Veuillez remplir tous les champs obligatoires',
      position: 'top'
    });
    return;
  }

  loading.value = true;

  try {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 2000));

    $q.notify({
      type: 'positive',
      message: 'Encaissement enregistré avec succès',
      position: 'top',
      icon: 'check_circle'
    });

    // Réinitialiser le formulaire après succès
    viderFormulaire();

  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de l\'enregistrement',
      position: 'top',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
};

// Fonction de chargement des encaissements
const chargerEncaissements = async () => {
  if (!formData.value.numAssure) {
    $q.notify({
      type: 'warning',
      message: 'Veuillez d\'abord rechercher un assuré',
      position: 'top'
    });
    return;
  }

  try {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));

    encaissements.value = [
      {
        id: 1,
        numAssure: '321-11006497-9',
        nomAssure: 'NDJENG NDJENG',
        refPaiement: 'REF2024001',
        montant: 7500,
        datePaiement: '20/01/2025',
        origine: 'EXPRESS EXCHANGE',
        modePaiement: 'Virement',
        codeCentre: '001'
      },
      {
        id: 2,
        numAssure: '123-1234567-123',
        nomAssure: 'JEAN DUPONT',
        refPaiement: 'REF001',
        montant: 5000,
        datePaiement: '15/01/2025',
        origine: 'EXPRESS EXCHANGE',
        modePaiement: 'Virement',
        codeCentre: '001'
      }
    ];

    $q.notify({
      type: 'positive',
      message: 'Encaissements chargés avec succès',
      position: 'top'
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des encaissements',
      position: 'top'
    });
  }
};

// Fonction de génération de quittance
const genererQuittance = async () => {
  if (!formData.value.complementaire.listeQuittanceEdit) {
    $q.notify({
      type: 'warning',
      message: 'Veuillez sélectionner une quittance à générer',
      position: 'top'
    });
    return;
  }

  try {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1500));

    $q.notify({
      type: 'positive',
      message: 'Génération terminée. Vous pouvez charger les quittances à imprimer.',
      position: 'top'
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la génération de quittance',
      position: 'top'
    });
  }
};

// Fonction de chargement des quittances
const chargerQuittances = async () => {
  if (!formData.value.numAssure) {
    $q.notify({
      type: 'warning',
      message: 'Veuillez d\'abord rechercher un assuré',
      position: 'top'
    });
    return;
  }

  try {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));

    quittancesGenerees.value = [
      {
        id: 1,
        numQuit: 'Q2024001',
        montant: 7500,
        dateCrea: '20/01/2025',
        codeContrat: 'CF2024001',
        dateGeneration: '20/01/2025',
        fichierQuittance: '/quittances/Q2024001.pdf'
      },
      {
        id: 2,
        numQuit: 'Q2025001',
        montant: 5000,
        dateCrea: '15/01/2025',
        codeContrat: 'CF2025001',
        dateGeneration: '15/01/2025',
        fichierQuittance: '/quittances/Q2025001.pdf'
      }
    ];

    $q.notify({
      type: 'positive',
      message: 'Quittances chargées avec succès',
      position: 'top'
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des quittances',
      position: 'top'
    });
  }
};

// Fonction d'ouverture de quittance
const openQuittance = (fichier) => {
  window.open(fichier, '_blank');
};

// Fonction de vidage du formulaire
const viderFormulaire = () => {
  formRef.value?.reset();
  formData.value = {
    numAssure: '',
    contrat: {
      mois60Ans: '',
      numContrat: '',
      dateEffetAffi: '',
      dateCloture: '',
      revenuAnnuel: '',
      origineRevenu: '',
      assietteMens: '',
      montantMens: '',
      dateEffet: ''
    },
    paiement: {
      montant: '',
      refPaiement: '',
      modePaiement: '',
      datePaiement: ''
    },
    complementaire: {
      reserve: 0,
      detteMajoration: 0,
      natureCotisation: 'Cotisations principales',
      etablissementFinancier: '',
      typeQuittance: 'AUTOMATIQUE',
      numQuittance: '',
      quittanceAEditer: '',
      listeQuittanceEdit: ''
    }
  };

  encaissements.value = [];
  quittancesGenerees.value = [];
  assureFound.value = false;

  $q.notify({
    type: 'info',
    message: 'Formulaire vidé',
    position: 'top',
    icon: 'refresh'
  });
};

// Fonction de soumission du formulaire
const onSubmit = () => {
  console.log('Formulaire soumis:', formData.value);
};

// Initialisation
onMounted(() => {
  // Initialisation des données si nécessaire
});
</script>

<style scoped>
/* Styles pour la bannière CNPS */
.cnps-banner {
  height: 60px;
  max-width: 300px;
  object-fit: contain;
}

/* Styles pour le formulaire principal */
.form-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

/* Styles pour les sections */
.section-card {
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.section-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* Styles pour la section d'actions */
.action-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 2px solid #dee2e6;
  margin-top: 1rem;
}

.action-btn {
  min-width: 150px;
  height: 40px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}


/* Styles pour le footer */
.footer-section {
  margin-top: 3rem;
}

.footer-card {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  border-radius: 8px;
}

.footer-text {
  font-size: 0.9rem;
  line-height: 1.6;
  opacity: 0.9;
}

/* Styles pour les tables */
.q-table {
  border-radius: 8px;
  overflow: hidden;
}

.q-table thead th {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

/* Styles pour les en-têtes de colonnes en bleu et gras */
.q-table thead th.text-primary {
  color: #1976d2 !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  font-size: 0.9rem !important;
  letter-spacing: 0.8px !important;
}

.q-table tbody tr:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}

/* Styles pour les champs avec max-width */
.field-input {
  max-width: 400px;
}

/* Styles pour les expansion items */
.q-expansion-item__header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  color: #1976d2;
  padding: 1rem;
}

.q-expansion-item__content {
  border-radius: 0 0 8px 8px;
}

/* Animation de rotation pour l'icône de chargement */
.rotating {
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .action-btn {
    min-width: 120px;
    height: 35px;
  }

  .cnps-banner {
    height: 50px;
    max-width: 250px;
  }

  .field-input {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .action-btn {
    min-width: 100px;
    height: 35px;
    font-size: 0.9rem;
  }

  .footer-text {
    font-size: 0.8rem;
  }

  .field-input {
    max-width: 100%;
  }
}

/* Centrage des champs */
.form-centered {
  max-width: 1200px;
  margin: 0 auto;
}

.form-centered .row {
  justify-content: center;
}

.form-centered .col-12,
.form-centered .col-sm-6,
.form-centered .col-md-3 {
  display: flex;
  justify-content: center;
}

.form-centered .field-input {
  width: 100%;
  max-width: 300px;
}

/* Animation pour les cartes */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-card {
  animation: slideInUp 0.6s ease-out;
}

/* Styles pour les montants */
.text-positive {
  font-weight: 600;
  font-size: 1.1em;
}

/* Styles pour les champs obligatoires */
.q-field--error .q-field__control {
  border-color: #f44336;
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
}

/* Styles pour les boutons de chargement */
.q-btn--loading .q-btn__content {
  opacity: 0.7;
}

/* Styles pour les notifications */
.q-notification {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
</style>

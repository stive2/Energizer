<template>
  <q-page class="q-pa-md">
    <!-- Formulaire principal -->
    <q-card class="form-card">
      <q-card-section class="q-pa-md">
        <!-- Titre du formulaire -->
        <div class="text-h6 text-center text-primary q-mb-xl">
          Formulaire d'annulation des saisies des encaissements de cotisation
        </div>

        <q-form ref="formRef" @submit="onSubmit" class="q-gutter-y-md">
          <!-- Section Mois de cotisation -->
          <q-card flat bordered class="section-card">
            <q-card-section>
              <div class="text-h6 text-primary q-mb-md">
                <q-icon name="calendar_month" class="q-mr-sm" />
                Mois de cotisation
              </div>
              <q-input
                v-model="formData.moisCotisation"
                label="Concerné (jj/mm/yyyy)"
                outlined
                dense
                class="q-mb-md field-input"
                :rules="[val => !!val || 'Le mois de cotisation est requis']"
                readonly
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer" color="primary">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="formData.moisCotisation"
                        :mask="'DD/MM/YYYY'"
                        color="primary"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </q-card-section>
          </q-card>

          <!-- Section Informations sur l'Employeur -->
          <q-expansion-item
            icon="business"
            label="Informations sur l'Employeur"
            class="section-card"
            header-class="text-primary"
          >
            <q-card flat>
              <q-card-section class="q-gutter-sm">
                <div class="row q-gutter-sm">
                  <div class="col-md-4">
                    <q-input
                      v-model="formData.matriculeCNPS"
                      label="Matricule CNPS Employeur"
                      outlined
                      dense
                      class="field-input"
                      :rules="[
                        val => !!val || 'Ce champ est obligatoire',
                        val => validateMatriculeCNPS(val) || 'Format invalide. Utilisez: 123-1234567-123-A ou 123-1234567-A'
                      ]"
                      hint="Format: 123-1234567-123-A ou 123-1234567-A"
                      @blur="loadEmployeurInfo"
                      @input="resetEmployeurState"
                      :loading="loadingEmployeurInfo"
                    >
                      <template v-slot:append>
                        <q-icon
                          v-if="loadingEmployeurInfo"
                          name="refresh"
                          class="rotating"
                        />
                        <q-icon
                          v-else-if="formData.matriculeCNPS && validateMatriculeCNPS(formData.matriculeCNPS) && employeurFound"
                          name="check_circle"
                          color="positive"
                        />
                        <q-icon
                          v-else-if="formData.matriculeCNPS && validateMatriculeCNPS(formData.matriculeCNPS) && !employeurFound && !loadingEmployeurInfo"
                          name="sentiment_dissatisfied"
                          color="negative"
                        />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-md-4">
                    <q-input
                      v-model="formData.raisonSociale"
                      label="Raison sociale"
                      outlined
                      dense
                      readonly
                      class="field-input"
                      :rules="[val => !!val || 'Ce champ est obligatoire']"
                    />
                  </div>
                  <div class="col-md-4">
                    <q-input
                      v-model="formData.centreGestion"
                      label="Centre de Gestion"
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

          <!-- Section Listing des BEs Exécutés -->
          <q-expansion-item
            icon="list_alt"
            label="Listing des BEs Exécutés pour le mois concerné"
            class="section-card"
            header-class="text-primary"
          >
            <q-card flat>
              <q-card-section>
                <q-table
                  :rows="besExecutes"
                  :columns="besColumns"
                  row-key="id"
                  flat
                  bordered
                  :rows-per-page-options="[5, 10, 20]"
                  :pagination="{ rowsPerPage: 10 }"
                  class="q-mt-md"
                >
                  <template v-slot:body-cell-total="props">
                    <q-td :props="props">
                      <span class="text-weight-bold text-positive">{{ formatCurrency(props.value) }}</span>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Section Encaissement concerné -->
          <q-expansion-item
            icon="account_balance_wallet"
            label="Encaissement concerné"
            class="section-card"
            header-class="text-primary"
          >
            <q-card flat>
          <q-card-section>
                <q-table
                  :rows="encaissementsConcernes"
                  :columns="encaissementColumns"
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
                </q-table>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Section Informations sur l'encaissement à annuler -->
          <q-expansion-item
            icon="cancel"
            label="Informations sur l'encaissement à annuler"
            class="section-card"
            header-class="text-primary"
            default-opened
          >
            <q-card flat>
              <q-card-section class="q-gutter-sm">
                <div class="row q-gutter-sm">
                  <div class="col-md-3">
                    <q-input
                      v-model="formData.numQuittance"
                      label="N° Quittance"
                      outlined
                      dense
                      class="field-input"
                      :rules="[val => !!val || 'Le numéro de quittance est requis']"
                    />
                  </div>
                  <div class="col-md-3">
                    <q-input
                      v-model="formData.cleBE"
                      label="Clé du BE"
                      outlined
                      dense
                      class="field-input"
                    />
                  </div>
                  <div class="col-md-3">
                    <q-input
                      v-model="formData.periodeConcernee"
                      label="Période Concernée"
                      outlined
                      dense
                      class="field-input"
                    />
                  </div>
                  <div class="col-md-3">
                    <q-input
                      v-model="formData.datePaiement"
                      label="Date de paiement"
                      outlined
                      dense
                      class="field-input"
                      readonly
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" color="primary">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-date
                              v-model="formData.datePaiement"
                              :mask="'DD/MM/YYYY'"
                              color="primary"
                            />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                </div>

                <div class="row q-gutter-sm">
                  <div class="col-md-4">
                    <q-input
                      v-model="formData.montantEncaisse"
                      label="Montant Encaissé"
                      outlined
                      dense
                      type="number"
                      step="0.01"
                      class="field-input"
                      :rules="[val => !!val || 'Le montant est requis']"
                    />
                    <div class="text-caption text-grey-6 q-mt-xs">
                      Période clôturée : correction par réduction du montant
                    </div>
                  </div>
                  <div class="col-md-4">
                    <q-input
                      v-model="formData.dateSaisie"
                      label="Date de Saisie"
                      outlined
                      dense
                      class="field-input"
                      readonly
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" color="primary">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-date
                              v-model="formData.dateSaisie"
                              :mask="'DD/MM/YYYY'"
                              color="primary"
                            />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-md-4">
                    <q-input
                      v-model="formData.codeRubrique"
                      label="Code Rubrique"
                      outlined
                      dense
                      class="field-input"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Section Actions -->
          <q-card flat bordered class="action-section">
            <q-card-section class="q-gutter-sm">
              <div class="row items-center justify-between">
                <div class="col-auto">
                  <q-input
                    v-model="formData.dateEnregistrement"
                    label="Date d'enregistrement"
                    outlined
                    dense
                    readonly
                    class="q-mr-md field-input"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" color="primary">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="formData.dateEnregistrement"
                            :mask="'DD/MM/YYYY'"
                            color="primary"
                          />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
               <!--  <div class="col-auto">
                  <q-chip color="positive" text-color="white" icon="check_circle">
                    Prêt pour un nouvel enregistrement...
                  </q-chip>
                </div> -->
              </div>
              <div class="row q-gutter-sm justify-center q-mt-md">
                <q-btn
                  label="Annuler Encaissement"
                  color="negative"
                  size="md"
                  icon="cancel"
                  @click="annulerEncaissement"
                  :loading="loading"
                  class="action-btn"
                />
                <q-btn
                  label="Vider le formulaire"
                  color="grey-7"
                  size="md"
                  icon="clear_all"
                  outline
                  @click="resetForm"
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
const loadingEmployeurInfo = ref(false);
const employeurFound = ref(false);

// Données du formulaire
const formData = ref({
  moisCotisation: '',
  matriculeCNPS: '',
  raisonSociale: '',
  centreGestion: '',
  numQuittance: '',
  cleBE: '',
  periodeConcernee: '',
  datePaiement: '',
  montantEncaisse: '',
  dateSaisie: '',
  codeRubrique: '',
  dateEnregistrement: '04/09/2025'
});

// Données des BEs exécutés
const besExecutes = ref([]);
const besColumns = ref([
  {
    name: 'numEmployeur',
    label: 'Numéro Employeur',
    field: 'numEmployeur',
    align: 'left',
    sortable: true
  },
  {
    name: 'raisonSociale',
    label: 'Raison Sociale',
    field: 'raisonSociale',
    align: 'left',
    sortable: true
  },
  {
    name: 'cleBE',
    label: 'Clé du BE',
    field: 'cleBE',
    align: 'left',
    sortable: true
  },
  {
    name: 'typeBE',
    label: 'Type du BE',
    field: 'typeBE',
    align: 'left',
    sortable: true
  },
  {
    name: 'rubriqueCotisation',
    label: 'Rubrique cotisation',
    field: 'rubriqueCotisation',
    align: 'left',
    sortable: true
  },
  {
    name: 'total',
    label: 'Total',
    field: 'total',
    align: 'right',
    sortable: true,
    format: (val) => formatCurrency(val)
  }
]);

// Données des encaissements concernés
const encaissementsConcernes = ref([]);
const encaissementColumns = ref([
  {
    name: 'numEmployeur',
    label: 'N°Employeur',
    field: 'numEmployeur',
    align: 'left',
    sortable: true
  },
  {
    name: 'rubrique',
    label: 'RUBRIQUE DE COTISATION',
    field: 'rubrique',
    align: 'left',
    sortable: true
  },
  {
    name: 'numPiece',
    label: 'N°PIECE',
    field: 'numPiece',
    align: 'left',
    sortable: true
  },
  {
    name: 'mode',
    label: 'MODE DE PAIEMENT',
    field: 'mode',
    align: 'left',
    sortable: true
  },
  {
    name: 'montant',
    label: 'MONTANT',
    field: 'montant',
    align: 'right',
    sortable: true,
    format: (val) => formatCurrency(val)
  },
  {
    name: 'banque',
    label: 'BANQUE',
    field: 'banque',
    align: 'left',
    sortable: true
  },
  {
    name: 'utilisateur',
    label: 'UTILISATEUR',
    field: 'utilisateur',
    align: 'left',
    sortable: true
  },
  {
    name: 'ind',
    label: 'IND',
    field: 'ind',
    align: 'left',
    sortable: true
  }
]);

// Fonction de formatage des montants
const formatCurrency = (value) => {
  if (!value) return '0,00 FCFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 2
  }).format(value).replace('XOF', 'FCFA');
};

// Fonction de validation du matricule CNPS
const validateMatriculeCNPS = (val) => {
  const regex = /^(?:\d{3}-\d{7}-\d{3}-[A-Z]|\d{3}-\d{7}-[A-Z])$/;
  return regex.test(val);
};

// Fonction de réinitialisation de l'état employeur
const resetEmployeurState = () => {
  employeurFound.value = false;
  // Vider les champs quand l'utilisateur modifie le matricule
  formData.value.raisonSociale = '';
  formData.value.centreGestion = '';
};

// Fonction de chargement des informations employeur
const loadEmployeurInfo = async () => {
  if (!formData.value.matriculeCNPS || !validateMatriculeCNPS(formData.value.matriculeCNPS)) {
    employeurFound.value = false;
    return;
  }

  loadingEmployeurInfo.value = true;
  employeurFound.value = false;

  try {
    // Simulation d'un appel API avec des données factices
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Données factices basées sur l'exemple fourni
    const fakeEmployeurData = {
      '010-1138701-H': {
        raisonSociale: 'CAMEROON TELECOMMUNICATIONS',
        centreGestion: '324'
      },
      '123-1234567-A': {
        raisonSociale: 'ENTREPRISE GENERALE DU BATIMENT',
        centreGestion: '329'
      },
      '456-7654321-B': {
        raisonSociale: 'SOCIETE COMMERCIALE MODERNE',
        centreGestion: 'CENTRE DE GESTION GAROUA'
      }
    };

    const employeurData = fakeEmployeurData[formData.value.matriculeCNPS];

    if (employeurData) {
      // Employeur trouvé
      employeurFound.value = true;

      // Mise à jour des champs avec les données récupérées
      formData.value.raisonSociale = employeurData.raisonSociale;
      formData.value.centreGestion = employeurData.centreGestion;

      $q.notify({
        type: 'positive',
        message: 'Informations employeur chargées avec succès',
        position: 'top',
        timeout: 2000
      });
    } else {
      // Employeur non trouvé
      employeurFound.value = false;

      // Vider les champs
      formData.value.raisonSociale = '';
      formData.value.centreGestion = '';

      $q.notify({
        type: 'negative',
        message: `Employeur avec le matricule ${formData.value.matriculeCNPS} non trouvé`,
        position: 'top',
        timeout: 3000,
        icon: 'sentiment_dissatisfied'
      });
    }

  } catch {
    employeurFound.value = false;
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des informations employeur',
      position: 'top'
    });
  } finally {
    loadingEmployeurInfo.value = false;
  }
};

// Initialisation des données
onMounted(() => {
  // Simulation des données des BEs exécutés
  besExecutes.value = [
    {
      id: 1,
      numEmployeur: 'EMP001234',
      raisonSociale: 'SOCIETE CAMEROUNAISE DE COMMERCE',
      cleBE: 'BE2025001',
      typeBE: 'COTISATION',
      rubriqueCotisation: 'COTISATION EMPLOYEUR',
      total: 150000
    },
    {
      id: 2,
      numEmployeur: 'EMP005678',
      raisonSociale: 'ENTREPRISE GENERALE DE BTP',
      cleBE: 'BE2025002',
      typeBE: 'COTISATION',
      rubriqueCotisation: 'COTISATION EMPLOYEUR',
      total: 275000
    },
    {
      id: 3,
      numEmployeur: 'EMP009012',
      raisonSociale: 'SOCIETE DE TRANSPORT RAPIDE',
      cleBE: 'BE2025003',
      typeBE: 'COTISATION',
      rubriqueCotisation: 'COTISATION EMPLOYEUR',
      total: 89000
    }
  ];

  // Simulation des données des encaissements concernés
  encaissementsConcernes.value = [
    {
      id: 1,
      numEmployeur: 'EMP001234',
      rubrique: 'COTISATION EMPLOYEUR',
      numPiece: 'Q2025001',
      mode: 'VIREMENT',
      montant: 150000,
      banque: 'UBA CAMEROUN',
      utilisateur: 'ADMIN',
      ind: 'A'
    },
    {
      id: 2,
      numEmployeur: 'EMP005678',
      rubrique: 'COTISATION EMPLOYEUR',
      numPiece: 'Q2025002',
      mode: 'CHEQUE',
      montant: 275000,
      banque: 'SOCIETE GENERALE',
      utilisateur: 'ADMIN',
      ind: 'A'
    }
  ];
});

// Fonction d'annulation d'encaissement
const annulerEncaissement = async () => {
  // Validation du formulaire
  const isValid = await formRef.value.validate();
  if (!isValid) {
    $q.notify({
      type: 'negative',
      message: 'Veuillez remplir tous les champs obligatoires',
      position: 'top'
    });
    return;
  }

  // Confirmation
  $q.dialog({
    title: 'Confirmation d\'annulation',
    message: 'Êtes-vous sûr de vouloir annuler cet encaissement ? Cette action est irréversible.',
    persistent: true,
    ok: {
      label: 'Confirmer',
      color: 'negative'
    },
    cancel: {
      label: 'Annuler',
      color: 'grey'
    }
  }).onOk(async () => {
    loading.value = true;

    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 2000));

      $q.notify({
        type: 'positive',
        message: 'Encaissement annulé avec succès',
        position: 'top',
        icon: 'check_circle'
      });

      // Réinitialiser le formulaire après succès
      resetForm();

    } catch {
      $q.notify({
        type: 'negative',
        message: 'Erreur lors de l\'annulation de l\'encaissement',
        position: 'top',
        icon: 'error'
      });
    } finally {
      loading.value = false;
    }
  });
};

// Fonction de réinitialisation du formulaire
const resetForm = () => {
  formRef.value?.reset();
  formData.value = {
    moisCotisation: '',
    matriculeCNPS: '',
    raisonSociale: '',
    centreGestion: '',
    numQuittance: '',
    cleBE: '',
    periodeConcernee: '',
    datePaiement: '',
    montantEncaisse: '',
    dateSaisie: '',
    codeRubrique: '',
    dateEnregistrement: '04/09/2025'
  };

  $q.notify({
    type: 'info',
    message: 'Formulaire vidé',
    position: 'top',
    icon: 'refresh'
  });
};

// Fonction de soumission du formulaire
const onSubmit = () => {
  // Cette fonction peut être utilisée pour d'autres validations
  console.log('Formulaire soumis:', formData.value);
};
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

.form-title {
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #1976d2;
  position: relative;
}

.form-title::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #1976d2, #42a5f5);
  border-radius: 2px;
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

.q-table tbody tr:hover {
  background-color: #f8f9fa;
}

/* Styles pour les inputs */
.q-field--filled .q-field__control {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.q-field--filled .q-field__control:hover {
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);
}

.q-field--filled .q-field__control:focus-within {
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
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

/* Styles pour les chips */
.q-chip {
  border-radius: 20px;
  font-weight: 500;
  padding: 8px 16px;
}

/* Styles pour les icônes */
.q-icon {
  font-size: 1.2em;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-title {
    font-size: 1.5rem;
  }

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
  .form-title {
    font-size: 1.3rem;
  }

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
</style>

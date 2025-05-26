```vue
<template>
  <q-page class="flex">
    <div class="q-pa-md absolute-top-left">
      <q-select
        rounded
        outlined
        v-model="model"
        use-input
        clearable
        input-debounce="0"
        label="Veuillez sélectionner un service"
        :options="options"
        @filter="filterFn"
        @update:model-value="onServiceSelect"
        style="min-width: 300px; max-width: 500px"
        dense
        behavior="menu"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey"> Aucun résultat </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <!-- Display cards when 'Immatriculation' is selected -->
    <div v-if="model === 'Immatriculation'" class="q-pa-md q-mt-xl q-mx-xl">
      <div class="row q-col-gutter-sm">
        <div v-for="row in rows" :key="row.name" class="col-12 col-sm-6 col-md-4">
          <q-card class="my-card animate-on-hover" flat @click="showDetails(row)">
            <q-card-section class="text-justify q-py-sm">
              <div class="text-h6 text-primary q-mb-xs font-weight-bold">{{ row.name }}</div>
              <div class="q-ml-sm text-body2 text-primary" style="font-size: 12px">
                {{ row.description }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Dialog for card details -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6 text-primary text-justify font-weight-bold">
            {{ selectedRow?.name }}
          </div>
        </q-card-section>
        <q-card-section class="text-justify text-primary" style="font-size: 12px">
          {{ selectedRow?.description }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" label="Plus de détails" @click="showMoreDetails" />
          <q-btn color="primary" label="Fermer" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Stepper Dialog for Immatriculation Form -->
    <q-dialog v-model="showStepperDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 text-primary">Formulaire d'Immatriculation</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-stepper v-model="step" vertical color="primary" animated>
            <!-- Step 1: Informations sur le père de l’assuré -->
            <q-step
              :name="1"
              title="Informations sur le père de l’assuré"
              icon="person"
              :done="step > 1"
            >
              <q-input
                v-model="form.nomPere"
                label="Nom *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.prenomPere"
                label="Prénom *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.dateNaissancePere"
                label="Date de naissance (JJ/MM/AAAA)"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-select
                v-model="form.arrondissementPere"
                label="Arrondissement de naissance *"
                :options="arrondissements"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />

              <q-stepper-navigation>
                <q-btn @click="step = 2" color="primary" label="Continuer" />
              </q-stepper-navigation>
            </q-step>

            <!-- Step 2: Informations sur la mère de l’assuré -->
            <q-step
              :name="2"
              title="Informations sur la mère de l’assuré"
              icon="person"
              :done="step > 2"
            >
              <q-input
                v-model="form.nomMere"
                label="Nom *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.prenomMere"
                label="Prénom *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.dateNaissanceMere"
                label="Date de naissance (JJ/MM/AAAA)"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-select
                v-model="form.arrondissementMere"
                label="Arrondissement de naissance *"
                :options="arrondissements"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />

              <q-stepper-navigation>
                <q-btn @click="step = 3" color="primary" label="Continuer" />
                <q-btn flat @click="step = 1" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Step 3: Contact et Résidence -->
            <q-step :name="3" title="Contact et Résidence" icon="home" :done="step > 3">
              <q-select
                v-model="form.ville"
                label="Ville de résidence *"
                :options="villes"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.quartier"
                label="Quartier"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.telephone"
                label="Téléphone *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.email"
                label="Email"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.boitePostale"
                label="Boîte postale"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.centreDosser"
                label="Centre de dossier *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />

              <q-stepper-navigation>
                <q-btn @click="step = 4" color="primary" label="Continuer" />
                <q-btn flat @click="step = 2" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Step 4: Informations personnelles de l’assuré -->
            <q-step
              :name="4"
              title="Informations personnelles de l’assuré"
              icon="person"
              :done="step > 4"
            >
              <q-select
                v-model="form.sexe"
                label="Sexe *"
                :options="['Masculin', 'Féminin']"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.nom"
                label="Nom *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.prenom"
                label="Prénom *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.dateNaissance"
                label="Date de naissance (JJ/MM/AAAA) *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.lieuNaissance"
                label="Lieu de naissance *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-select
                v-model="form.nationalite"
                label="Nationalité *"
                :options="nationalites"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.dateEmbauche"
                label="Date d’embauche (JJ/MM/AAAA) *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />

              <q-stepper-navigation>
                <q-btn @click="step = 5" color="primary" label="Continuer" />
                <q-btn flat @click="step = 3" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Step 5: Informations professionnelles -->
            <q-step :name="5" title="Informations professionnelles" icon="work">
              <q-input
                v-model="form.nomEmployeur"
                label="Nom employeur *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.lieuTravail"
                label="Lieu de travail *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.categorie"
                label="Catégorie"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.situationMatrimoniale"
                label="Situation matrimoniale *"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.nombreEnfants"
                label="Nombre d’enfants"
                type="number"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.nombreConjoints"
                label="Nombre de conjoints"
                type="number"
                outlined
                dense
                style="width: 250px"
                class="q-mb-sm"
              />

              <q-stepper-navigation>
                <q-btn color="primary" label="Soumettre" @click="submitForm" />
                <q-btn flat @click="step = 4" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Annuler" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// List of CNPS services
const stringOptions = [
  'Immatriculation',
  'Déclaration de salaires',
  'Paiement des cotisations',
  'Prestations sociales',
  'Consultation des comptes',
]

/* const servicesImmat = [
  {
    id: 1,
    name: 'Immatriculation employeur (main d’oeuvre professionnelle)',
    code: 'IMMEP',
  },
  {
    id: 2,
    name: 'Immatriculation employeur (main d’oeuvre domestique)',
    code: 'IMMED',
  },
  {
    id: 3,
    name: 'Immatriculation assuré volontaire',
    code: 'IMMAV',
  },
  {
    id: 4,
    name: 'Immatriculation assuré travailleur',
    code: 'IMMAT',
  },
] */

// Immatriculation types data
const rows = [
  {
    name: 'Auto-immatriculation des Assurés',
    description: 'Inscription en ligne pour les assurés individuels.',
  },
  {
    name: 'Télé-immatriculation des employeurs',
    description: 'Inscription à distance pour les employeurs.',
  },
  {
    name: 'Immatriculation des travailleurs indépendants',
    description: 'Enregistrement pour les travailleurs non salariés.',
  },
  {
    name: 'Mise à jour des données d’immatriculation',
    description: 'Modification des informations d’immatriculation existantes.',
  },
  {
    name: 'Immatriculation des retraités',
    description: 'Inscription pour les personnes retraitées.',
  },
]

// Sample options for select fields
const arrondissements = ['Arrondissement 1', 'Arrondissement 2', 'Arrondissement 3']
const villes = ['Ville 1', 'Ville 2', 'Ville 3']
const nationalites = ['Ivoirienne', 'Française', 'Autre']

// Reactive variables
const model = ref(null)
const options = ref(stringOptions)
const showDialog = ref(false)
const showStepperDialog = ref(false)
const selectedRow = ref(null)
const step = ref(1)

// Form data
const form = ref({
  nomPere: '',
  prenomPere: '',
  dateNaissancePere: '',
  arrondissementPere: null,
  nomMere: '',
  prenomMere: '',
  dateNaissanceMere: '',
  arrondissementMere: null,
  ville: null,
  quartier: '',
  telephone: '',
  email: '',
  boitePostale: '',
  centreDosser: '',
  sexe: null,
  nom: '',
  prenom: '',
  dateNaissance: '',
  lieuNaissance: '',
  nationalite: null,
  dateEmbauche: '',
  nomEmployeur: '',
  lieuTravail: '',
  categorie: '',
  situationMatrimoniale: '',
  nombreEnfants: 0,
  nombreConjoints: 0,
})

// Filter function for the dropdown
const filterFn = (val, update) => {
  if (val === '') {
    update(() => {
      options.value = stringOptions
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    options.value = stringOptions.filter((v) => v.toLowerCase().indexOf(needle) > -1)
  })
}

// Function called when a service is selected
const onServiceSelect = (value) => {
  console.log('Service sélectionné :', value)
}

// Function to show details dialog
const showDetails = (row) => {
  selectedRow.value = row
  showDialog.value = true
}

// Function for the "Plus de détails" button to show stepper dialog
const showMoreDetails = () => {
  showDialog.value = false // Close the first dialog
  showStepperDialog.value = true // Open the stepper dialog
}

// Function to submit the form
const submitForm = () => {
  console.log('Formulaire soumis :', form.value)
  showStepperDialog.value = false // Close the dialog after submission
  // Add your form submission logic here (e.g., API call)
}
</script>

<style scoped>
.absolute-top-left {
  position: absolute;
  top: 0;
  left: 0;
}

/* Consistent margins (top and sides) */
.q-mt-xl {
  margin-top: 80px;
}
.q-mx-xl {
  margin-left: 80px;
  margin-right: 80px;
}

/* Smaller card size with 3D effect */
.my-card {
  width: 100%;
  max-width: 350px;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  box-shadow:
    4px 4px 8px rgba(0, 0, 0, 0.2),
    -2px -2px 6px rgba(255, 255, 255, 0.8);
}

/* Card hover animation */
.animate-on-hover {
  transition: all 0.3s ease;
}

.animate-on-hover:hover {
  transform: scale(1.05);
  box-shadow:
    6px 6px 12px rgba(0, 0, 0, 0.3),
    -3px -3px 8px rgba(255, 255, 255, 0.9);
}

/* Reduced spacing between name and description */
.q-py-sm {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

/* Text styling */
.text-h6 {
  margin-bottom: 4px;
  font-size: 14px;
}

.text-body2 {
  font-size: 14px;
  line-height: 1.2;
}
</style>
```

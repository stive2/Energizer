```vue
<template>
  <q-page class="column flex-center q-pa-md">
    <div
      class="text-primary q-mb-sm text-center text-bold"
      :class="$q.screen.lt.sm ? 'text-h6' : 'text-h4'"
    >
      Bienvenue sur le portail des services en ligne de la CNPS
    </div>
    <br />
    <div
      class="text-grey-8 q-mb-md text-center text-bold"
      :class="$q.screen.lt.sm ? 'text-subtitle2' : 'text-subtitle1'"
    >
      Sélectionnez un type de service pour commencer
    </div>
    <div class="q-pa-md row">
      <q-select
        rounded
        outlined
        v-model="typeService"
        use-input
        input-debounce="0"
        label="Veuillez sélectionner un type de service"
        :options="options"
        option-label="name"
        @filter="filterFn"
        @update:typeService-value="onTypeServiceSelect"
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

    <template v-if="filteredServices.length">
      <!-- Barre de recherche -->
      <q-input
        outlined
        dense
        v-model="search"
        label="Rechercher un service..."
        class="q-mb-md"
        style="min-width: 300px; max-width: 500px"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <div class="text-subtitle2 text-grey-7 q-mb-md">
        {{ filteredServices.length }} service(s) trouvé(s)
      </div>

      <!-- Grille de cards -->
      <div class="row q-col-gutter-md q-gutter-y-md q-gutter-x-lg flex-center">
        <!-- Cards pour chaque service "-->
        <q-card
          v-for="service in filteredServices"
          :key="service.id"
          class="col-xs-12 col-sm-6 col-md-4 col-lg-3 shadow-3 hoverable"
          style="transition: transform 0.3s"
          @click="openForm(service)"
          :style="
            $q.screen.gt.sm
              ? {
                  width: '350px',
                  height: '220px',
                  transform: hoverId === service.id ? 'scale(1.03)' : 'scale(1)',
                }
              : {
                  width: '90%',
                  height: 'auto',
                  transform: hoverId === service.id ? 'scale(1.03)' : 'scale(1)',
                }
          "
          @mouseover="hoverId = service.id"
          @mouseleave="hoverId = null"
        >
          <q-card-section>
            <q-icon :name="getIcon(service.code)" size="40px" color="primary" class="q-mb-sm" />
            <div class="text-h6 text-primary">{{ service.name }}</div>
            <div class="text-caption text-grey-7">{{ service.description }}</div>
          </q-card-section>
        </q-card>
      </div>
    </template>
    <template v-else>
      <div class="text-subtitle2 text-center q-my-md">
        Aucun service ne correspond à votre recherche.
      </div>
    </template>

    <!-- Modale de détails -->
    <q-dialog v-model="detailsDialog">
      <q-card class="q-pa-md" style="max-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ selectedService?.name }}</div>
          <div class="text-body1 q-mt-sm">{{ selectedService?.description }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Fermer" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Stepper Dialog for Immatriculation Form -->
    <q-dialog v-model="showStepperDialog" persistent>
      <!-- Composant affiché sous condition -->
      <ImmatEmpPro
        v-if="showImmatEmpPro"
        :service="selectedService"
        @close="showStepperDialog = false"
      />
      <ImmatEmpDom
        v-if="showImmatEmpDom"
        :service="selectedService"
        @close="showStepperDialog = false"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import ImmatEmpPro from 'components/ImmatEmpPro.vue'
import ImmatEmpDom from 'components/ImmatEmpDom.vue'
import { useNotify } from 'components/useNotify.js'
// import axios from 'axios' onMounted notifySuccess, notifyError, notifyWarning, notifyInfo

const { notifyWarning, notifyInfo } = useNotify()

const hoverId = ref(null)
const search = ref('')
const detailsDialog = ref(false)
const selectedService = ref(null)
const showImmatEmpPro = ref(false)
const showImmatEmpDom = ref(false)

// List of CNPS services
const typesServices = [
  {
    id: 1,
    name: 'Immatriculation',
    code: 'IMMAT',
    services: [
      {
        id: 1,
        name: 'Immatriculation employeur main d’oeuvre professionnelle',
        description: 'Immatriculation en ligne des employeurs de main d’oeuvre professionnelle.',
        code: 'IMMEP',
      },
      {
        id: 2,
        name: 'Immatriculation employeur main d’oeuvre domestique',
        description: 'Immatriculation en ligne des employeurs de main d’oeuvre domestique.',
        code: 'IMMED',
      },
      {
        id: 3,
        name: 'Immatriculation assuré volontaire',
        description: 'Immatriculation en ligne des assurés volontaires.',
        code: 'IMMAV',
      },
      {
        id: 4,
        name: 'Immatriculation assuré travailleur',
        description: 'Immatriculation en ligne des assurés travailleur.',
        code: 'IMMAT',
      },
    ],
  },
  {
    id: 2,
    name: 'Déclaration de salaires',
    code: 'DECLA',
    services: [],
  },
  {
    id: 3,
    name: 'Paiement des cotisations',
    code: 'COTIS',
    services: [],
  },
  {
    id: 4,
    name: 'Prestations sociales',
    code: 'PREST',
    services: [],
  },
  {
    id: 5,
    name: 'Consultation des comptes',
    code: 'CONSU',
    services: [],
  },
]

// Reactive variables
const options = ref(typesServices)

const showStepperDialog = ref(false)

const typeService = ref({
  name: 'Sélectionner un type de service',
  code: '',
  services: ref([]),
})

// Function to filter services based on user input
const filterFn = (val, update) => {
  if (val === '') {
    update(() => {
      options.value = typesServices
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    options.value = typesServices.filter((v) => v.toLowerCase().indexOf(needle) > -1)
  })
}

// Function called when a service is selected
const onTypeServiceSelect = (value) => {
  console.log('Service sélectionné :', value)
}

const filteredServices = computed(() => {
  const servicesList = typeService.value?.services || []
  return servicesList.filter(
    (service) =>
      service.name.toLowerCase().includes(search.value.toLowerCase()) ||
      service.description.toLowerCase().includes(search.value.toLowerCase()),
  )
})

/* const openDetails = (service) => {
  selectedService.value = service
  detailsDialog.value = true
} */

const openForm = (service) => {
  selectedService.value = service
  const validCodes = ['IMMEP', 'IMMED']

  if (validCodes.includes(service.code)) {
    switch (service.code) {
      case 'IMMEP':
        showImmatEmpPro.value = true
        break
      case 'IMMED':
        showImmatEmpDom.value = true
        break
    }
    // Notify user about the selected service
    notifyInfo(`${service.name} sélectionné.`)
    showStepperDialog.value = true
  } else {
    notifyWarning('Formulaire non disponible pour le moment.')
  }
}

const getIcon = (code) => {
  switch (code) {
    case 'IMMEP':
      return 'work_outline'
    case 'IMMED':
      return 'home_repair_service'
    case 'IMMAV':
      return 'person_add_alt_1'
    case 'IMMAT':
      return 'engineering'
    default:
      return 'info'
  }
}

// 🔁 Appel à l’API au montage
/* onMounted(async () => {
  try {
    const { data } = await axios.get('https://ton-api.com/api/services')
    typesServices.value = data
  } catch (error) {
    console.error('Erreur lors du chargement des services', error)
  }
}) */
</script>

<style scoped>
.q-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  background-color: ghostwhite;
}
</style>
``` // This is the main page of the application where users can select a type of service

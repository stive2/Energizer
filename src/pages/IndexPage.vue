<template>
  <q-page class="column flex-center q-pa-md">
    <div v-if="login">
      <LoginAssu />
    </div>

    <div v-else class="column flex-center q-pa-md">
      <div
        class="text-primary q-mb-sm text-center text-bold"
        :class="$q.screen.lt.sm ? 'text-h6' : 'text-h4'"
      >
        {{ t('home.title') }}
      </div>
      <br />
      <div
        class="text-grey-8 q-mb-md text-center text-bold"
        :class="$q.screen.lt.sm ? 'text-subtitle2' : 'text-subtitle1'"
      >
        {{ t('home.description') }}
      </div>
      <div class="q-pa-md row">
        <q-select
          rounded
          outlined
          v-model="typeService"
          use-input
          input-debounce="0"
          :label="$t('home.selectService')"
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
              <q-item-section class="text-grey"> {{ $t('home.noResults') }} </q-item-section>
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
          :placeholder="$t('home.searchPlaceholder')"
          class="q-mb-md"
          style="min-width: 400px; max-width: 500px"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <div class="text-subtitle2 text-grey-7 q-mb-md">
          {{ filteredServices.length }} {{ $t('home.foundServices') }}
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
                    height: '250px',
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
              <div class="text-h6 text-primary text-uppercase">{{ $t(service.name) }}</div>
              <div class="text-caption text-grey-7 text-uppercase">
                {{ $t(service.description) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
      <template v-else>
        <div class="text-subtitle2 text-center q-my-md">
          {{ $t('home.noServicesFound') }}
        </div>
      </template>

      <!-- Modale de détails -->
      <q-dialog v-model="detailsDialog">
        <q-card class="q-pa-md" style="max-width: 500px">
          <q-card-section>
            <div class="text-h6">Oops</div>
            <div class="text-body1 q-mt-sm">{{ $t('home.sorry') }}</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Fermer" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Stepper Dialog for Immatriculation Form -->
      <q-dialog v-model="showStepperDialog" persistent>
        <!-- Composant affiché sous condition -->
        <ImmatAssuVol
          v-if="showImmatAssuVol"
          :service="selectedService"
          @close="((showStepperDialog = false), (showImmatAssuVol = false))"
        />
        <ImmatEmpPro
          v-if="showImmatEmpPro"
          :service="selectedService"
          @close="((showStepperDialog = false), (showImmatEmpPro = false))"
        />
        <ImmatEmpDom
          v-if="showImmatEmpDom"
          :service="selectedService"
          @close="((showStepperDialog = false), (showImmatEmpDom = false))"
        />
        <ImmatAssuTrv
          v-if="showImmatAssuTrv"
          :service="selectedService"
          @close="((showStepperDialog = false), (showImmatAssuTrv = false))"
        />
        <ReceptionDossier
          v-if="showReceptionDossier"
          :service="selectedService"
          @close="((showStepperDialog = false), (showReceptionDossier = false))"
        />
        <ReceptionDossierManuel
          v-if="showReceptionDossierManuel"
          :service="selectedService"
          @close="((showStepperDialog = false), (showReceptionDossierManuel = false))"
        />
        <LiquidationRP
          v-if="showLiquidationRP"
          :service="selectedService"
          @close="((showStepperDialog = false), (showLiquidationRP = false))"
        />
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ImmatEmpPro from 'components/ImmatEmpPro.vue'
import ImmatEmpDom from 'components/ImmatEmpDom.vue'
import ImmatAssuTrv from 'components/ImmatAssuTrv.vue'
import ImmatAssuVol from 'components/ImmatAssuVol.vue'
import ReceptionDossier from 'components/ReceptionDossier.vue'
import ReceptionDossierManuel from 'components/ReceptionDossierManuel.vue'
import LiquidationRP from 'components/LiquidationRP.vue'
import { useNotify } from 'components/useNotify.js'
import LoginAssu from 'components/logins/LoginAssu.vue'
import { useRouter } from 'vue-router'
// import axios from 'axios' onMounted notifySuccess, notifyError, notifyWarning, notifyInfo

const { t } = useI18n()

const { notifyWarning } = useNotify()
const router = useRouter()

const hoverId = ref(null)
const search = ref('')
const detailsDialog = ref(false)
const selectedService = ref(null)
const showImmatEmpPro = ref(false)
const showImmatEmpDom = ref(false)
const showImmatAssuTrv = ref(false)
const showImmatAssuVol = ref(false)
const showReceptionDossier = ref(false)
const showReceptionDossierManuel = ref(false)
const showLiquidationRP = ref(false)

const login = ref(false)
// List of CNPS services
const typesServices = [
  {
    id: 1,
    name: 'Immatriculation / Registration',
    code: 'IMMAT',
    services: [
      {
        id: 1,
        name: 'services.immep.name',
        description: 'services.immep.description',
        code: 'IMMEP',
      },
      {
        id: 2,
        name: 'services.immed.name',
        description: 'services.immed.description',
        code: 'IMMED',
      },
      {
        id: 3,
        name: 'services.immat.name',
        description: 'services.immat.description',
        code: 'IMMAT',
      },
      {
        id: 4,
        name: 'services.immav.name',
        description: 'services.immav.description',
        code: 'IMMAV',
      },
    ],
  },
  {
    id: 2,
    name: 'Formulaire Energizer / Energizer Form',
    code: 'ENERG',
    services: [
      {
        id: 1,
        name: 'services.form1.name',
        description: 'services.form1.description',
        code: 'FORM1',
      },
      {
        id: 2,
        name: 'services.form3.name',
        description: 'services.form3.description',
        code: 'FORM3',
      },
      {
        id: 3,
        name: 'services.form2.name',
        description: 'services.form2.description',
        code: 'FORM2',
      },
    ],
  },
  {
    id: 3,
    name: 'Dépôt des dossiers de prestations',
    code: 'PRESTASSU',
    services: [
      {
        id: 1,
        name: 'services.prestassu.name',
        description: 'services.prestassu.description',
        code: 'PRESTASSU',
      },
    ],
  },
]

// Reactive variables
const options = ref(typesServices)

const showStepperDialog = ref(false)

const typeService = ref({
  name: '',
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

const formDialogMap = {
  IMMEP: showImmatEmpPro,
  IMMED: showImmatEmpDom,
  IMMAV: showImmatAssuVol,
  IMMAT: showImmatAssuTrv,
  FORM1: showReceptionDossier,
  FORM3: showReceptionDossierManuel,
  FORM2: showLiquidationRP,
}

const openForm = (service) => {
  selectedService.value = service

  if (selectedService.value.code === 'PRESTASSU') {
    router.push('/user/depot-dossier')
  } else {
    const dialogRef = formDialogMap[service.code]

    if (dialogRef) {
      dialogRef.value = true
      showStepperDialog.value = true
    } else {
      notifyWarning('Formulaire non disponible pour le moment.')
    }
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
    case 'FORM1':
      return 'folder'
    case 'FORM3':
      return 'folder'
    case 'FORM2':
      return 'warning_amber'
    case 'PRESTASSU':
      return 'note_add'
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

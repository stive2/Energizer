<template>
  <q-page class="gestion-tenu-comptes">
    <div class="q-pa-md">
      <!-- En-tête de la page -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <div class="text-h4 text-primary">
            <q-icon name="account_balance" class="q-mr-md" />
            {{ currentComponentName || 'Gestion des encaissements de cotisations' }}
          </div>
          <div class="text-subtitle1 text-grey-7">
            {{ currentComponentDescription || 'Système de gestion des encaissements de cotisations' }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="arrow_back"
            label="Retour"
            @click="retourAccueil"
            class="q-mr-sm"
          />
          <q-btn
            color="primary"
            icon="refresh"
            label="Actualiser"
            @click="actualiser"
          />
        </div>
      </div>

            <!-- Affichage du composant sélectionné -->
      <div v-if="currentComponentCode" class="q-mb-lg">
        <!-- Enregistrement encaissement -->
        <EnregistrementEncaissement
          v-if="currentComponentCode === 'ENREGISTREMENT_ENCAISSEMENT'"
          @encaissement-enregistre="onEncaissementEnregistre"
        />

        <!-- Saisie encaissement -->
        <SaisieEncaissement
          v-else-if="currentComponentCode === 'SAISIE_ENCAISSEMENT'"
          @encaissement-saisi="onEncaissementSaisi"
        />

        <!-- Suppression encaissement -->
        <SuppressionEncaissement
          v-else-if="currentComponentCode === 'SUPPRESSION_ENCAISSEMENT'"
          @encaissement-supprime="onEncaissementSupprime"
        />

        <!-- Validation encaissement -->
        <ValiderEncaissement
          v-else-if="currentComponentCode === 'VALIDATION_ENCAISSEMENT'"
          @encaissement-valide="onEncaissementValide"
        />
      </div>

      <!-- Message si aucun composant sélectionné -->
      <div v-else class="text-center q-pa-xl">
        <q-icon name="info" size="64px" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-7">Aucun composant sélectionné</div>
        <div class="text-body2 text-grey-6 q-mt-sm">
          Veuillez sélectionner un composant depuis la page d'accueil
        </div>
      </div>

      <!-- Résumé du processus -->
      <q-card v-if="processusTermine" class="q-mt-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="check_circle" class="q-mr-sm text-positive" />
            Processus de gestion des encaissements terminé
          </div>

          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-list bordered separator>
                <q-item>
                  <q-item-section>
                    <q-item-label>Composant utilisé</q-item-label>
                    <q-item-label caption>{{ currentComponentName }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label>Date de traitement</q-item-label>
                    <q-item-label caption>{{ new Date().toLocaleDateString('fr-FR') }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-12 col-md-6">
              <q-list bordered separator>
                <q-item>
                  <q-item-section>
                    <q-item-label>Statut</q-item-label>
                    <q-item-label caption>
                      <q-chip color="positive" text-color="white" icon="check">
                        Traité
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>

          <div class="q-mt-md">
            <q-btn
              color="primary"
              label="Nouveau traitement"
              @click="nouveauTraitement"
              icon="add"
            />
            <q-btn
              flat
              color="grey"
              label="Exporter le rapport"
              class="q-ml-sm"
              icon="download"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'

// Import des composants
import EnregistrementEncaissement from 'src/components/tenuCmptes/EnregistrementEncaissement.vue'
import SaisieEncaissement from 'src/components/tenuCmptes/SaisieEncaissement.vue'
import SuppressionEncaissement from 'src/components/tenuCmptes/SuppressionEncaissement.vue'
import ValiderEncaissement from 'src/components/tenuCmptes/ValiderEncaissement.vue'

export default {
  name: 'GestionTenuComptes',
  components: {
    EnregistrementEncaissement,
    SaisieEncaissement,
    SuppressionEncaissement,
    ValiderEncaissement
  },
  setup() {
    const $q = useQuasar()
    const route = useRoute()
    const router = useRouter()
    const processusTermine = ref(false)

    // Récupération des paramètres de route
    const currentComponentCode = ref(route.query.component || '')
    const currentComponentName = ref(route.query.componentName || '')

    // Descriptions des composants
    const componentDescriptions = {
      'ENREGISTREMENT_ENCAISSEMENT': 'Enregistrer un nouvel encaissement',
      'SAISIE_ENCAISSEMENT': 'Saisir les détails d\'un encaissement',
      'SUPPRESSION_ENCAISSEMENT': 'Supprimer un encaissement existant',
      'VALIDATION_ENCAISSEMENT': 'Valider un encaissement'
    }

    const currentComponentDescription = computed(() => {
      return componentDescriptions[currentComponentCode.value] || ''
    })

    const encaissementEnCours = reactive({
      numeroEncaissement: '',
      montant: 0,
      dateEncaissement: '',
      typeCotisation: '',
      observations: ''
    })

        const onEncaissementEnregistre = (encaissement) => {
      Object.assign(encaissementEnCours, encaissement)
      $q.notify({
        type: 'positive',
        message: 'Encaissement enregistré avec succès'
      })
      processusTermine.value = true
    }

    const onEncaissementSaisi = (encaissement) => {
      Object.assign(encaissementEnCours, encaissement)
      $q.notify({
        type: 'positive',
        message: 'Encaissement saisi avec succès'
      })
      processusTermine.value = true
    }

    const onEncaissementSupprime = () => {
      $q.notify({
        type: 'positive',
        message: 'Encaissement supprimé avec succès'
      })
      processusTermine.value = true
    }

    const onEncaissementValide = (encaissement) => {
      Object.assign(encaissementEnCours, encaissement)
      $q.notify({
        type: 'positive',
        message: 'Encaissement validé avec succès'
      })
      processusTermine.value = true
    }

    const nouveauTraitement = () => {
      // Réinitialiser tous les données
      Object.assign(encaissementEnCours, {
        numeroEncaissement: '',
        montant: 0,
        dateEncaissement: '',
        typeCotisation: '',
        observations: ''
      })

      processusTermine.value = false

      $q.notify({
        type: 'info',
        message: 'Nouveau traitement créé'
      })
    }

    const actualiser = () => {
      $q.notify({
        type: 'info',
        message: 'Page actualisée'
      })
    }

    const retourAccueil = () => {
      router.push('/')
    }

    return {
      processusTermine,
      encaissementEnCours,
      currentComponentCode,
      currentComponentName,
      currentComponentDescription,
      onEncaissementEnregistre,
      onEncaissementSaisi,
      onEncaissementSupprime,
      onEncaissementValide,
      nouveauTraitement,
      actualiser,
      retourAccueil
    }
  }
}
</script>

<style scoped>
.gestion-tenu-comptes {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.q-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>

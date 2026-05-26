<template>
  <q-page class="gestion-liquidation-rp">
    <div class="q-pa-md">
      <!-- En-tête de la page -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <div class="text-h4 text-primary">
            <q-icon name="account_balance" class="q-mr-md" />
            {{ currentComponentName || 'Gestion Liquidation RP' }}
          </div>
          <div class="text-subtitle1 text-grey-7">
            {{ currentComponentDescription || 'Système de liquidation des dossiers de retraite par répartition' }}
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
        <!-- Saisie du dossier -->
        <SaisieDossierRP
          v-if="currentComponentCode === 'SAISIE_DOSSIER_RP'"
          @dossier-saved="onDossierSaved"
        />

        <!-- Calcul de pension -->
        <CalculPension
          v-else-if="currentComponentCode === 'CALCUL_PENSION'"
          @pension-calculated="onPensionCalculated"
        />

        <!-- Validation du dossier -->
        <ValidationDossier
          v-else-if="currentComponentCode === 'VALIDATION_DOSSIER'"
          :dossier="dossierEnCours"
          :calculs="calculsEnCours"
          @dossier-validated="onDossierValidated"
        />

        <!-- Génération arrêté -->
        <GenerationArrete
          v-else-if="currentComponentCode === 'GENERATION_ARRETE'"
          :dossier="dossierEnCours"
          :calculs="calculsEnCours"
          @arrete-generated="onArreteGenerated"
        />

        <!-- Notification bénéficiaire -->
        <NotificationBeneficiaire
          v-else-if="currentComponentCode === 'NOTIFICATION_BENEFICIAIRE'"
          :dossier="dossierEnCours"
          :calculs="calculsEnCours"
          @notification-sent="onNotificationSent"
        />

        <!-- Archivage du dossier -->
        <ArchivageDossier
          v-else-if="currentComponentCode === 'ARCHIVAGE_DOSSIER'"
          :dossier="dossierEnCours"
          :calculs="calculsEnCours"
          @dossier-archived="onDossierArchived"
        />

        <!-- Étapes métier RP (certificats, décès, notes de frais) — espace réservé pour intégration des formulaires -->
        <q-card v-else-if="isLiquidationPlaceholder" flat bordered class="bg-blue-1">
          <q-card-section>
            <div class="text-h6 text-primary">{{ currentComponentName }}</div>
            <p class="text-body2 text-grey-8 q-mt-sm">{{ currentComponentDescription }}</p>
            <p class="text-caption text-grey-7 q-mt-md">
              Parcours visé dans EnergiZer : Prestations / RP / Saisie des éléments de liquidation. Pour les dossiers
              AT, le certificat médical initial et final sont uniques.
            </p>
          </q-card-section>
        </q-card>

        <q-banner v-else rounded class="bg-orange-2 text-grey-9 q-mt-sm">
          Le code « {{ currentComponentCode }} » ne correspond à aucun écran de liquidation chargé.
        </q-banner>
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
            Processus de liquidation terminé
          </div>

          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-list bordered separator>
                <q-item>
                  <q-item-section>
                    <q-item-label>Numéro de dossier</q-item-label>
                    <q-item-label caption>{{ dossierEnCours.numeroDossier }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label>Nom de l'assuré</q-item-label>
                    <q-item-label caption>{{ dossierEnCours.nomAssure }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label>Pension nette</q-item-label>
                    <q-item-label caption>{{ formatCurrency(calculsEnCours.pensionNette) }} FCFA</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-12 col-md-6">
              <q-list bordered separator>
                <q-item>
                  <q-item-section>
                    <q-item-label>Date de traitement</q-item-label>
                    <q-item-label caption>{{ new Date().toLocaleDateString('fr-FR') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label>Statut</q-item-label>
                    <q-item-label caption>
                      <q-chip color="positive" text-color="white" icon="check">
                        Liquidé
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
              label="Nouveau dossier"
              @click="nouveauDossier"
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
import { ref, reactive, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'

// Import des composants
import SaisieDossierRP from 'src/modules/energizer/components/liquidationRP/SaisieDossierRP.vue'
import CalculPension from 'src/modules/energizer/components/liquidationRP/CalculPension.vue'
import ValidationDossier from 'src/modules/energizer/components/liquidationRP/ValidationDossier.vue'
import GenerationArrete from 'src/modules/energizer/components/liquidationRP/GenerationArrete.vue'
import NotificationBeneficiaire from 'src/modules/energizer/components/liquidationRP/NotificationBeneficiaire.vue'
import ArchivageDossier from 'src/modules/energizer/components/liquidationRP/ArchivageDossier.vue'

export default {
  name: 'GestionLiquidationRP',
  components: {
    SaisieDossierRP,
    CalculPension,
    ValidationDossier,
    GenerationArrete,
    NotificationBeneficiaire,
    ArchivageDossier
  },
  setup() {
    const $q = useQuasar()
    const route = useRoute()
    const router = useRouter()
    const etapeActuelle = ref(1)
    const processusTermine = ref(false)

    // Récupération des paramètres de route
    const currentComponentCode = ref(route.query.component || '')
    const currentComponentName = ref(route.query.componentName || '')

    // Descriptions des composants
    const componentDescriptions = {
      SAISIE_DOSSIER_RP: 'Saisir les informations du dossier de retraite',
      CALCUL_PENSION: 'Calculer la pension de retraite',
      VALIDATION_DOSSIER: 'Valider le dossier de liquidation',
      GENERATION_ARRETE: "Générer l'arrêté de liquidation",
      NOTIFICATION_BENEFICIAIRE: 'Notifier le bénéficiaire',
      ARCHIVAGE_DOSSIER: 'Archiver le dossier traité',
      CERTIFICAT_MEDICAL:
        'Certificats médicaux : saisie initiale, prolongation ou final (dossiers AT : initial et final uniques).',
      CERTIFICAT_DECES: 'Certificat médical de décès et genre de mort.',
      NOTES_FRAIS: 'Saisie des notes de frais liées à la liquidation RP.',
    }

    const PLACEHOLDER_CODES = ['CERTIFICAT_MEDICAL', 'CERTIFICAT_DECES', 'NOTES_FRAIS']

    const isLiquidationPlaceholder = computed(() =>
      PLACEHOLDER_CODES.includes(currentComponentCode.value),
    )

    watch(
      () => route.query,
      () => {
        currentComponentCode.value = route.query.component || ''
        currentComponentName.value = route.query.componentName || ''
      },
      { deep: true },
    )

    const currentComponentDescription = computed(() => {
      return componentDescriptions[currentComponentCode.value] || ''
    })

    const dossierEnCours = reactive({
      numeroDossier: '',
      nomAssure: '',
      dateNaissance: '',
      typeLiquidation: '',
      observations: ''
    })

    const calculsEnCours = reactive({
      pensionBrute: 0,
      pensionNette: 0
    })

    const onDossierSaved = (dossier) => {
      Object.assign(dossierEnCours, dossier)
      $q.notify({
        type: 'positive',
        message: 'Dossier enregistré, passage à l\'étape suivante'
      })
      etapeActuelle.value = 2
    }

    const onPensionCalculated = (calculs) => {
      Object.assign(calculsEnCours, calculs)
      $q.notify({
        type: 'positive',
        message: 'Calcul terminé, passage à la validation'
      })
      etapeActuelle.value = 3
    }

    const onDossierValidated = () => {
      $q.notify({
        type: 'positive',
        message: 'Dossier validé, génération de l\'arrêté'
      })
      etapeActuelle.value = 4
    }

    const onArreteGenerated = () => {
      $q.notify({
        type: 'positive',
        message: 'Arrêté généré, envoi de la notification'
      })
      etapeActuelle.value = 5
    }

    const onNotificationSent = () => {
      $q.notify({
        type: 'positive',
        message: 'Notification envoyée, archivage du dossier'
      })
      etapeActuelle.value = 6
    }

    const onDossierArchived = () => {
      $q.notify({
        type: 'positive',
        message: 'Dossier archivé avec succès'
      })
      processusTermine.value = true
    }

    const terminerProcessus = () => {
      $q.dialog({
        title: 'Confirmation',
        message: 'Voulez-vous terminer le processus de liquidation ?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        processusTermine.value = true
        $q.notify({
          type: 'positive',
          message: 'Processus de liquidation terminé avec succès'
        })
      })
    }

    const nouveauDossier = () => {
      // Réinitialiser tous les données
      Object.assign(dossierEnCours, {
        numeroDossier: '',
        nomAssure: '',
        dateNaissance: '',
        typeLiquidation: '',
        observations: ''
      })

      Object.assign(calculsEnCours, {
        pensionBrute: 0,
        pensionNette: 0
      })

      etapeActuelle.value = 1
      processusTermine.value = false

      $q.notify({
        type: 'info',
        message: 'Nouveau dossier créé'
      })
    }

        const actualiser = () => {
      $q.notify({
        type: 'info',
        message: 'Page actualisée'
      })
    }

    const retourAccueil = () => {
      router.push({ name: 'energizer-home' })
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR').format(amount || 0)
    }

    return {
      etapeActuelle,
      processusTermine,
      dossierEnCours,
      calculsEnCours,
      currentComponentCode,
      currentComponentName,
      currentComponentDescription,
      onDossierSaved,
      onPensionCalculated,
      onDossierValidated,
      onArreteGenerated,
      onNotificationSent,
      onDossierArchived,
      terminerProcessus,
      nouveauDossier,
      actualiser,
      retourAccueil,
      formatCurrency,
      isLiquidationPlaceholder,
    }
  }
}
</script>

<style scoped>
.gestion-liquidation-rp {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.q-stepper {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.q-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>

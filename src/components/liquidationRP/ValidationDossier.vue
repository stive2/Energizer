<template>
  <div class="validation-dossier">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="verified" class="q-mr-sm" />
          Validation du Dossier RP
        </div>

        <div class="q-mb-md">
          <q-stepper
            v-model="step"
            color="primary"
            animated
            flat
            bordered
          >
            <q-step
              :name="1"
              title="Vérification des pièces"
              icon="folder_open"
              :done="step > 1"
            >
              <div class="q-pa-md">
                <q-list bordered separator>
                  <q-item
                    v-for="piece in piecesJustificatives"
                    :key="piece.id"
                    clickable
                    v-ripple
                    @click="togglePiece(piece.id)"
                  >
                    <q-item-section avatar>
                      <q-checkbox
                        v-model="piece.verifiee"
                        color="primary"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ piece.nom }}</q-item-label>
                      <q-item-label caption>{{ piece.description }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon
                        :name="piece.verifiee ? 'check_circle' : 'radio_button_unchecked'"
                        :color="piece.verifiee ? 'positive' : 'grey'"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-step>

            <q-step
              :name="2"
              title="Contrôle des données"
              icon="fact_check"
              :done="step > 2"
            >
              <div class="q-pa-md">
                <div class="row q-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-card flat bordered>
                      <q-card-section>
                        <div class="text-subtitle2">Informations personnelles</div>
                        <q-list dense>
                          <q-item>
                            <q-item-section>Nom : {{ dossier.nomAssure }}</q-item-section>
                          </q-item>
                          <q-item>
                            <q-item-section>Date de naissance : {{ dossier.dateNaissance }}</q-item-section>
                          </q-item>
                          <q-item>
                            <q-item-section>Numéro dossier : {{ dossier.numeroDossier }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-card flat bordered>
                      <q-card-section>
                        <div class="text-subtitle2">Calculs</div>
                        <q-list dense>
                          <q-item>
                            <q-item-section>Pension brute : {{ formatCurrency(calculs.pensionBrute) }} FCFA</q-item-section>
                          </q-item>
                          <q-item>
                            <q-item-section>Pension nette : {{ formatCurrency(calculs.pensionNette) }} FCFA</q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-step>

            <q-step
              :name="3"
              title="Validation finale"
              icon="gavel"
              :done="step > 3"
            >
              <div class="q-pa-md">
                <q-form @submit="validerDossier">
                  <q-input
                    v-model="validation.observations"
                    label="Observations de validation"
                    type="textarea"
                    outlined
                    rows="4"
                  />

                  <div class="q-mt-md">
                    <q-checkbox
                      v-model="validation.accordValidation"
                      label="J'atteste que toutes les vérifications ont été effectuées"
                    />
                  </div>

                  <div class="q-mt-md">
                    <q-btn
                      type="submit"
                      color="positive"
                      label="Valider le dossier"
                      :disable="!validation.accordValidation"
                      :loading="validating"
                    />
                  </div>
                </q-form>
              </div>
            </q-step>
          </q-stepper>
        </div>

        <div class="q-mt-md">
          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            label="Précédent"
            @click="step--"
          />
          <q-btn
            v-if="step < 3"
            color="primary"
            label="Suivant"
            @click="step++"
            class="q-ml-sm"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'ValidationDossier',
  props: {
    dossier: {
      type: Object,
      default: () => ({})
    },
    calculs: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['dossier-validated'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const step = ref(1)
    const validating = ref(false)

    const piecesJustificatives = ref([
      { id: 1, nom: 'Acte de naissance', description: 'Certificat de naissance original', verifiee: false },
      { id: 2, nom: 'Bulletins de salaire', description: 'Derniers bulletins de salaire', verifiee: false },
      { id: 3, nom: 'Attestation de service', description: 'Certificat de travail', verifiee: false },
      { id: 4, nom: 'Pièce d\'identité', description: 'CNI ou passeport', verifiee: false },
      { id: 5, nom: 'Demande de liquidation', description: 'Formulaire de demande', verifiee: false }
    ])

    const validation = ref({
      observations: '',
      accordValidation: false
    })

    const togglePiece = (pieceId) => {
      const piece = piecesJustificatives.value.find(p => p.id === pieceId)
      if (piece) {
        piece.verifiee = !piece.verifiee
      }
    }

    const validerDossier = async () => {
      validating.value = true

      try {
        // Simulation de la validation
        await new Promise(resolve => setTimeout(resolve, 1000))

        const piecesVerifiees = piecesJustificatives.value.filter(p => p.verifiee).length
        const totalPieces = piecesJustificatives.value.length

        if (piecesVerifiees < totalPieces) {
          $q.notify({
            type: 'warning',
            message: 'Toutes les pièces doivent être vérifiées'
          })
          return
        }

        emit('dossier-validated', {
          dossier: props.dossier,
          calculs: props.calculs,
          validation: validation.value,
          piecesVerifiees: piecesVerifiees
        })

        $q.notify({
          type: 'positive',
          message: 'Dossier validé avec succès'
        })
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de la validation'
        })
      } finally {
        validating.value = false
      }
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR').format(amount || 0)
    }

    return {
      step,
      validating,
      piecesJustificatives,
      validation,
      togglePiece,
      validerDossier,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.validation-dossier {
  max-width: 1000px;
  margin: 0 auto;
}
</style>

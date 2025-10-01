<template>
  <div class="generation-arrete">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="description" class="q-mr-sm" />
          Génération de l'Arrêté de Liquidation
        </div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="arrete.numeroArrete"
              label="Numéro de l'arrêté"
              outlined
              :rules="[val => !!val || 'Le numéro est requis']"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="arrete.dateArrete"
              label="Date de l'arrêté"
              type="date"
              outlined
            />
          </div>
        </div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="arrete.autoriteSignataire"
              label="Autorité signataire"
              outlined
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="arrete.fonctionSignataire"
              label="Fonction du signataire"
              outlined
            />
          </div>
        </div>

        <q-input
          v-model="arrete.considerants"
          label="Considérants"
          type="textarea"
          outlined
          rows="4"
        />

        <q-input
          v-model="arrete.dispositif"
          label="Dispositif"
          type="textarea"
          outlined
          rows="4"
        />

        <q-separator class="q-my-md" />

        <div class="text-subtitle1 q-mb-md">Aperçu de l'arrêté</div>
        <q-card flat bordered class="q-pa-md bg-grey-1">
          <div class="text-center text-h6 q-mb-md">
            RÉPUBLIQUE DU CAMEROUN<br>
            <small>Paix - Travail - Patrie</small><br>
            <strong>CNPS</strong>
          </div>

          <div class="text-center text-h5 q-mb-md">
            ARRÊTÉ N° {{ arrete.numeroArrete }}
          </div>

          <div class="q-mb-md">
            <strong>Portant liquidation de la pension de retraite de :</strong><br>
            {{ dossier.nomAssure || '[Nom de l\'assuré]' }}
          </div>

          <div class="q-mb-md">
            <strong>Considérants :</strong><br>
            {{ arrete.considerants || '[Considérants...]' }}
          </div>

          <div class="q-mb-md">
            <strong>Dispositif :</strong><br>
            {{ arrete.dispositif || '[Dispositif...]' }}
          </div>

          <div class="text-right q-mt-md">
            <div>Yaoundé, le {{ formatDate(arrete.dateArrete) }}</div>
            <div class="q-mt-md">
              <div>{{ arrete.autoriteSignataire || '[Autorité]' }}</div>
              <div><small>{{ arrete.fonctionSignataire || '[Fonction]' }}</small></div>
            </div>
          </div>
        </q-card>

        <div class="q-mt-md">
          <q-btn
            color="primary"
            label="Générer l'arrêté"
            @click="genererArrete"
            :loading="generating"
            icon="description"
          />
          <q-btn
            flat
            color="grey"
            label="Réinitialiser"
            class="q-ml-sm"
            @click="reinitialiser"
          />
          <q-btn
            v-if="arreteGenere"
            color="positive"
            label="Télécharger PDF"
            class="q-ml-sm"
            icon="download"
            @click="telechargerPDF"
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
  name: 'GenerationArrete',
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
  emits: ['arrete-generated'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const generating = ref(false)
    const arreteGenere = ref(false)

    const arrete = ref({
      numeroArrete: '',
      dateArrete: new Date().toISOString().split('T')[0],
      autoriteSignataire: '',
      fonctionSignataire: '',
      considerants: '',
      dispositif: ''
    })

    const genererArrete = async () => {
      generating.value = true

      try {
        // Simulation de la génération
        await new Promise(resolve => setTimeout(resolve, 1500))

        const arreteComplet = {
          ...arrete.value,
          dossier: props.dossier,
          calculs: props.calculs,
          dateGeneration: new Date().toISOString()
        }

        emit('arrete-generated', arreteComplet)
        arreteGenere.value = true

        $q.notify({
          type: 'positive',
          message: 'Arrêté généré avec succès'
        })
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de la génération'
        })
      } finally {
        generating.value = false
      }
    }

    const reinitialiser = () => {
      arrete.value = {
        numeroArrete: '',
        dateArrete: new Date().toISOString().split('T')[0],
        autoriteSignataire: '',
        fonctionSignataire: '',
        considerants: '',
        dispositif: ''
      }
      arreteGenere.value = false
    }

    const telechargerPDF = () => {
      $q.notify({
        type: 'info',
        message: 'Téléchargement du PDF en cours...'
      })
      // Ici on pourrait intégrer une vraie génération de PDF
    }

    const formatDate = (dateString) => {
      if (!dateString) return '[Date]'
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    }

    return {
      arrete,
      generating,
      arreteGenere,
      genererArrete,
      reinitialiser,
      telechargerPDF,
      formatDate
    }
  }
}
</script>

<style scoped>
.generation-arrete {
  max-width: 900px;
  margin: 0 auto;
}
</style>

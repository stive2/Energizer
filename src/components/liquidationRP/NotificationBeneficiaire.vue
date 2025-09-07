<template>
  <div class="notification-beneficiaire">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="notifications" class="q-mr-sm" />
          Notification du Bénéficiaire
        </div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="notification.nomBeneficiaire"
              label="Nom du bénéficiaire"
              outlined
              :rules="[val => !!val || 'Le nom est requis']"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="notification.email"
              label="Email"
              type="email"
              outlined
            />
          </div>
        </div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="notification.telephone"
              label="Téléphone"
              outlined
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="notification.adresse"
              label="Adresse"
              outlined
            />
          </div>
        </div>

        <q-select
          v-model="notification.typeNotification"
          :options="typesNotification"
          label="Type de notification"
          outlined
          emit-value
          map-options
        />

        <q-input
          v-model="notification.message"
          label="Message personnalisé"
          type="textarea"
          outlined
          rows="4"
          hint="Message qui sera ajouté à la notification standard"
        />

        <q-separator class="q-my-md" />

        <div class="text-subtitle1 q-mb-md">Aperçu de la notification</div>
        <q-card flat bordered class="q-pa-md bg-blue-1">
          <div class="text-h6 q-mb-md">
            <q-icon name="mail" class="q-mr-sm" />
            Notification CNPS
          </div>

          <div class="q-mb-md">
            <strong>À :</strong> {{ notification.nomBeneficiaire || '[Nom du bénéficiaire]' }}<br>
            <strong>Email :</strong> {{ notification.email || '[Email]' }}<br>
            <strong>Téléphone :</strong> {{ notification.telephone || '[Téléphone]' }}
          </div>

          <div class="q-mb-md">
            <strong>Objet :</strong> {{ getObjetNotification() }}
          </div>

          <div class="q-mb-md">
            <strong>Message :</strong><br>
            <div v-html="getMessageNotification()"></div>
          </div>

          <div class="text-right text-caption">
            CNPS - {{ new Date().toLocaleDateString('fr-FR') }}
          </div>
        </q-card>

        <div class="q-mt-md">
          <q-btn
            color="primary"
            label="Envoyer la notification"
            @click="envoyerNotification"
            :loading="sending"
            icon="send"
          />
          <q-btn
            flat
            color="grey"
            label="Prévisualiser"
            class="q-ml-sm"
            @click="previsualiser"
          />
          <q-btn
            flat
            color="grey"
            label="Réinitialiser"
            class="q-ml-sm"
            @click="reinitialiser"
          />
        </div>

        <div v-if="notificationEnvoyee" class="q-mt-md">
          <q-banner class="bg-green-2 text-green-8">
            <template v-slot:avatar>
              <q-icon name="check_circle" />
            </template>
            Notification envoyée avec succès
          </q-banner>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'NotificationBeneficiaire',
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
  emits: ['notification-sent'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const sending = ref(false)
    const notificationEnvoyee = ref(false)

    const notification = ref({
      nomBeneficiaire: '',
      email: '',
      telephone: '',
      adresse: '',
      typeNotification: 'liquidation',
      message: ''
    })

    const typesNotification = [
      { label: 'Notification de liquidation', value: 'liquidation' },
      { label: 'Notification de paiement', value: 'paiement' },
      { label: 'Notification de modification', value: 'modification' },
      { label: 'Notification générale', value: 'generale' }
    ]

    const getObjetNotification = () => {
      const types = {
        liquidation: 'Liquidation de votre pension de retraite',
        paiement: 'Paiement de votre pension',
        modification: 'Modification de votre dossier',
        generale: 'Information concernant votre dossier'
      }
      return types[notification.value.typeNotification] || 'Notification CNPS'
    }

    const getMessageNotification = () => {
      const baseMessage = `
        <p>Madame, Monsieur,</p>
        <p>Nous vous informons que votre dossier de pension de retraite a été traité avec succès.</p>
        <p><strong>Détails :</strong></p>
        <ul>
          <li>Numéro de dossier : ${props.dossier.numeroDossier || '[N° dossier]'}</li>
          <li>Montant de la pension : ${formatCurrency(props.calculs.pensionNette || 0)} FCFA</li>
        </ul>
      `

      if (notification.value.message) {
        return baseMessage + `<p><strong>Message personnalisé :</strong></p><p>${notification.value.message}</p>`
      }

      return baseMessage + '<p>Veuillez contacter nos services pour plus d\'informations.</p><p>Cordialement,<br>L\'équipe CNPS</p>'
    }

    const envoyerNotification = async () => {
      sending.value = true

      try {
        // Simulation de l'envoi
        await new Promise(resolve => setTimeout(resolve, 1200))

        const notificationComplete = {
          ...notification.value,
          dossier: props.dossier,
          calculs: props.calculs,
          dateEnvoi: new Date().toISOString(),
          objet: getObjetNotification(),
          message: getMessageNotification()
        }

        emit('notification-sent', notificationComplete)
        notificationEnvoyee.value = true

        $q.notify({
          type: 'positive',
          message: 'Notification envoyée avec succès'
        })
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de l\'envoi'
        })
      } finally {
        sending.value = false
      }
    }

    const previsualiser = () => {
      $q.dialog({
        title: 'Aperçu de la notification',
        message: getMessageNotification(),
        html: true,
        ok: 'Fermer'
      })
    }

    const reinitialiser = () => {
      notification.value = {
        nomBeneficiaire: '',
        email: '',
        telephone: '',
        adresse: '',
        typeNotification: 'liquidation',
        message: ''
      }
      notificationEnvoyee.value = false
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR').format(amount || 0)
    }

    return {
      notification,
      typesNotification,
      sending,
      notificationEnvoyee,
      envoyerNotification,
      previsualiser,
      reinitialiser,
      getObjetNotification,
      getMessageNotification,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.notification-beneficiaire {
  max-width: 800px;
  margin: 0 auto;
}
</style>

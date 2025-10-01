<template>
  <div class="archivage-dossier">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="archive" class="q-mr-sm" />
          Archivage du Dossier RP
        </div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="archivage.numeroArchive"
              label="Numéro d'archivage"
              outlined
              :rules="[val => !!val || 'Le numéro est requis']"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="archivage.dateArchivage"
              label="Date d'archivage"
              type="date"
              outlined
            />
          </div>
        </div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="archivage.typeArchive"
              :options="typesArchive"
              label="Type d'archivage"
              outlined
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="archivage.emplacement"
              label="Emplacement physique"
              outlined
            />
          </div>
        </div>

        <q-input
          v-model="archivage.observations"
          label="Observations d'archivage"
          type="textarea"
          outlined
          rows="3"
        />

        <q-separator class="q-my-md" />

        <div class="text-subtitle1 q-mb-md">Documents à archiver</div>
        <q-list bordered separator>
          <q-item
            v-for="document in documentsAArchiver"
            :key="document.id"
            clickable
            v-ripple
            @click="toggleDocument(document.id)"
          >
            <q-item-section avatar>
              <q-checkbox
                v-model="document.archive"
                color="primary"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ document.nom }}</q-item-label>
              <q-item-label caption>{{ document.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon
                :name="document.archive ? 'archive' : 'folder_open'"
                :color="document.archive ? 'primary' : 'grey'"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <q-separator class="q-my-md" />

        <div class="text-subtitle1 q-mb-md">Résumé de l'archivage</div>
        <q-card flat bordered class="q-pa-md bg-grey-1">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-list dense>
                <q-item>
                  <q-item-section>Numéro d'archivage :</q-item-section>
                  <q-item-section side>{{ archivage.numeroArchive || '[Non défini]' }}</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Date d'archivage :</q-item-section>
                  <q-item-section side>{{ formatDate(archivage.dateArchivage) }}</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Type d'archivage :</q-item-section>
                  <q-item-section side>{{ getTypeArchiveLabel() }}</q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-12 col-md-6">
              <q-list dense>
                <q-item>
                  <q-item-section>Documents archivés :</q-item-section>
                  <q-item-section side>{{ documentsArchives }}/{{ documentsAArchiver.length }}</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Emplacement :</q-item-section>
                  <q-item-section side>{{ archivage.emplacement || '[Non défini]' }}</q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card>

        <div class="q-mt-md">
          <q-btn
            color="primary"
            label="Archiver le dossier"
            @click="archiverDossier"
            :loading="archiving"
            :disable="documentsArchives === 0"
            icon="archive"
          />
          <q-btn
            flat
            color="grey"
            label="Réinitialiser"
            class="q-ml-sm"
            @click="reinitialiser"
          />
          <q-btn
            v-if="dossierArchive"
            color="positive"
            label="Générer bordereau"
            class="q-ml-sm"
            icon="description"
            @click="genererBordereau"
          />
        </div>

        <div v-if="dossierArchive" class="q-mt-md">
          <q-banner class="bg-green-2 text-green-8">
            <template v-slot:avatar>
              <q-icon name="check_circle" />
            </template>
            Dossier archivé avec succès - Numéro d'archive : {{ archivage.numeroArchive }}
          </q-banner>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'ArchivageDossier',
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
  emits: ['dossier-archived'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const archiving = ref(false)
    const dossierArchive = ref(false)

    const archivage = ref({
      numeroArchive: '',
      dateArchivage: new Date().toISOString().split('T')[0],
      typeArchive: 'definitif',
      emplacement: '',
      observations: ''
    })

    const typesArchive = [
      { label: 'Archivage définitif', value: 'definitif' },
      { label: 'Archivage temporaire', value: 'temporaire' },
      { label: 'Archivage intermédiaire', value: 'intermediaire' }
    ]

    const documentsAArchiver = ref([
      { id: 1, nom: 'Dossier de liquidation', description: 'Dossier complet de liquidation', archive: false },
      { id: 2, nom: 'Arrêté de liquidation', description: 'Arrêté officiel de liquidation', archive: false },
      { id: 3, nom: 'Pièces justificatives', description: 'Toutes les pièces justificatives', archive: false },
      { id: 4, nom: 'Calculs de pension', description: 'Feuilles de calcul de pension', archive: false },
      { id: 5, nom: 'Correspondances', description: 'Échanges de correspondances', archive: false },
      { id: 6, nom: 'Notifications', description: 'Notifications envoyées', archive: false }
    ])

    const documentsArchives = computed(() => {
      return documentsAArchiver.value.filter(doc => doc.archive).length
    })

    const toggleDocument = (documentId) => {
      const document = documentsAArchiver.value.find(d => d.id === documentId)
      if (document) {
        document.archive = !document.archive
      }
    }

    const archiverDossier = async () => {
      archiving.value = true

      try {
        // Simulation de l'archivage
        await new Promise(resolve => setTimeout(resolve, 1500))

        const archivageComplet = {
          ...archivage.value,
          dossier: props.dossier,
          calculs: props.calculs,
          documentsArchives: documentsAArchiver.value.filter(d => d.archive),
          dateArchivage: new Date().toISOString()
        }

        emit('dossier-archived', archivageComplet)
        dossierArchive.value = true

        $q.notify({
          type: 'positive',
          message: 'Dossier archivé avec succès'
        })
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de l\'archivage'
        })
      } finally {
        archiving.value = false
      }
    }

    const genererBordereau = () => {
      $q.notify({
        type: 'info',
        message: 'Génération du bordereau d\'archivage...'
      })
      // Ici on pourrait générer un bordereau d'archivage
    }

    const reinitialiser = () => {
      archivage.value = {
        numeroArchive: '',
        dateArchivage: new Date().toISOString().split('T')[0],
        typeArchive: 'definitif',
        emplacement: '',
        observations: ''
      }
      documentsAArchiver.value.forEach(doc => {
        doc.archive = false
      })
      dossierArchive.value = false
    }

    const getTypeArchiveLabel = () => {
      const type = typesArchive.find(t => t.value === archivage.value.typeArchive)
      return type ? type.label : '[Non défini]'
    }

    const formatDate = (dateString) => {
      if (!dateString) return '[Non définie]'
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    }

    return {
      archivage,
      typesArchive,
      documentsAArchiver,
      documentsArchives,
      archiving,
      dossierArchive,
      toggleDocument,
      archiverDossier,
      genererBordereau,
      reinitialiser,
      getTypeArchiveLabel,
      formatDate
    }
  }
}
</script>

<style scoped>
.archivage-dossier {
  max-width: 900px;
  margin: 0 auto;
}
</style>

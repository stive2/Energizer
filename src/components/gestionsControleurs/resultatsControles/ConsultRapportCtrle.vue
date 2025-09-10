<template>
  <div class="saisie-resultats">
    <q-card class="q-pa-sm">
      <!-- Recherche des Contrôles -->
      <q-card flat bordered class="q-pa-md">
        <div class="text-subtitle1 q-mb-sm text-bold">
          {{ t('labels.rechercheControles') }}
        </div>
        <q-form @submit.prevent="searchDemande" ref="searchForm">
          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-input
                v-model="formSearch.numEmployeur"
                :label="t('labels.numEmployeur')"
                outlined
                dense
                :rules="[required, validateMatriculeCNPS]"
              />
            </div>

            <div class="col-4">
              <q-input
                v-model="formSearch.exercice"
                :label="t('labels.exercice')"
                outlined
                mask="####"
                dense
                :rules="[required]"
              />
            </div>

            <div class="col-2 flex flex-center">
              <q-btn :label="t('labels.recherche')" color="primary" type="submit" />
            </div>
          </div>
        </q-form>
        <div class="q-pa-md">
          <q-table
            class="my-sticky-header-table"
            flat
            bordered
            :rows="rows"
            :columns="columns2"
            row-key="numDemande"
            selection="single"
            v-model:selected="selectedRow"
          />
        </div>
      </q-card>

      <q-form @submit.prevent="onSubmit">
        <q-card flat bordered class="q-pa-md">
          <div class="row q-col-gutter-md items-center">
            <!-- Champ caché nbmois -->
            <q-input v-model="formValid.nbmois" type="hidden" />

            <!-- Controle N° -->
            <div class="col-3">
              <q-input
                v-model="formValid.numControle"
                label="Controle N°"
                outlined
                dense
                readonly
              />
            </div>

            <!-- Type de rapport -->
            <div class="col-3">
              <q-select
                v-model="formValid.reportType"
                :options="reportOptions"
                label="Type de rapport"
                outlined
                dense
                :rules="[required]"
              />
            </div>

            <!-- Bouton Afficher -->
            <div class="col-2">
              <q-btn label="Afficher" color="primary" unelevated @click="control" />
            </div>

            <!-- Bouton Valider -->
            <div class="col-2">
              <q-btn label="Editer" color="secondary" unelevated type="submit" />
            </div>

            <!-- Champ caché txtnumempl -->
            <q-input v-model="formValid.numEmploye" type="hidden" />
          </div>
        </q-card>
      </q-form>

      <div v-if="afficher">
        <!-- Contrôle ordonnance -->
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 q-mb-sm text-bold">
            {{ t('labels.controleOrdonnance') }}
          </div>

          <!-- Ligne 1 -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-3">
              <q-input
                v-model="formData.numDemande"
                :label="t('labels.numDemande')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.dateDemande"
                :label="t('labels.dateDemande')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.employeur"
                :label="t('labels.employeur')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.typeControle"
                :label="t('labels.typeControle')"
                outlined
                dense
                readonly
              />
            </div>
          </div>

          <!-- Ligne 2 : Période -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-3">
              <q-input
                v-model="formData.periodeDebutMois"
                :label="t('labels.periodeDebutMois')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.periodeDebutAnnee"
                :label="t('labels.periodeDebutAnnee')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.periodeFinMois"
                :label="t('labels.periodeFinMois')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.periodeFinAnnee"
                :label="t('labels.periodeFinAnnee')"
                outlined
                dense
                readonly
              />
            </div>
          </div>

          <!-- Ligne 3 : Motif / Taxation -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-4">
              <q-input
                v-model="formData.motifControle"
                :label="t('labels.motifControle')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="formData.taxationOffice"
                :label="t('labels.taxationOffice')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="formData.nomDemandeur"
                :label="t('labels.ordonnancePar')"
                outlined
                dense
                readonly
              />
            </div>
          </div>

          <!-- Ligne 4 : Régime / Risque -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-3">
              <q-input
                v-model="formData.regime"
                :label="t('labels.regime')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.risque"
                :label="t('labels.risque')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.numControle"
                :label="t('labels.numRapport')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.dateDernierControle"
                :label="t('labels.dateDernierControle')"
                outlined
                dense
                readonly
              />
            </div>
          </div>
        </q-card>

        <!-- Saisie du Résultat de Contrôle -->
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 q-mb-sm text-bold">
            {{ t('labels.saisieResultat') }}
          </div>

          <!-- Ligne 1 -->
          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-input
                v-model="formData.datePremiereVisite"
                :label="t('labels.datePremiereVisite')"
                outlined
                dense
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                readonly
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.datePremiereVisite" mask="DD/MM/YYYY">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup :label="t('labels.fermer')" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-4">
              <q-input
                v-model="formData.dateDerniereVisite"
                :label="t('labels.dateDerniereVisite')"
                outlined
                dense
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                readonly
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.dateDerniereVisite" mask="DD/MM/YYYY">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup :label="t('labels.fermer')" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-4">
              <q-input
                v-model="formData.dateControle"
                :label="t('labels.dateControle')"
                outlined
                dense
                readonly
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.dateControle" mask="DD/MM/YYYY">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup :label="t('labels.fermer')" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>

          <!-- Ligne 2 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-6">
              <q-input
                v-model="formData.nomControleur"
                :label="t('labels.nomControleur')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="formData.nomDG"
                :label="t('labels.nomDG')"
                outlined
                dense
                readonly
              />
            </div>
          </div>

          <!-- Ligne 3 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-6">
              <q-input
                v-model="formData.nomComptable"
                :label="t('labels.nomComptable')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="formData.localisation"
                :label="t('labels.localisation')"
                outlined
                dense
                readonly
              />
            </div>
          </div>
        </q-card>

        <!-- Informations Bancaires -->
        <q-card flat bordered class="q-pa-md q-mt-md">
          <div class="text-subtitle1 q-mb-sm text-bold">{{ t('labels.infosBancaires') }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="formData.numCompte"
                :label="t('labels.numCompte')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="formData.banque"
                :options="banques"
                :label="t('labels.banque')"
                outlined
                dense
                readonly
              />
            </div>
          </div>
        </q-card>

        <!-- Centre Impôts -->
        <q-card flat bordered class="q-pa-md q-mt-md">
          <div class="text-subtitle1 q-mb-sm text-bold">{{ t('labels.centreImpots') }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select
                v-model="formData.centreImpots"
                :options="impots"
                :label="t('labels.centreImpots')"
                option-label="ABREVIATION"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.effectifImmat"
                :label="t('labels.effectifImmat')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.effectifNonImmat"
                :label="t('labels.effectifNonImmat')"
                outlined
                dense
                readonly
              />
            </div>
          </div>
        </q-card>

        <!-- Observations -->
        <q-card flat bordered class="q-pa-md q-mt-md">
          <div class="text-subtitle1 q-mb-sm text-bold">{{ $t('observations.title') }}</div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input
                v-model="formData.casTaxation"
                :label="$t('observations.taxation_case')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="formData.constatTerrain"
                :label="$t('observations.field_observation')"
                outlined
                dense
                readonly
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="formData.documentsConsultes"
                :label="$t('observations.documents_reviewed')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="formData.resumeActivites"
                :label="$t('observations.activity_summary')"
                outlined
                dense
                readonly
              />
            </div>
          </div>
        </q-card>

        <!-- Table dynamique -->
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 q-mb-sm text-bold">
            {{ $t('monthly_summary.title') }}
          </div>
          <q-table :rows="formData.lignes" :columns="columns" row-key="id" flat bordered>
            <template v-slot:body-cell="props">
              <q-td :props="props">
                <q-input
                  v-model="props.row[props.col.field]"
                  v-if="props.col.field != 'comp'"
                  dense
                  outlined
                  style="min-width: 100px"
                  readonly
                />
                <q-select
                  v-model="props.row[props.col.field]"
                  v-else
                  :label="$t('monthly_summary.bad_faith')"
                  :options="['YES', 'NO']"
                  outlined
                  dense
                  readonly
                />
              </q-td>
            </template>
          </q-table>
          <!-- <div class="row justify-center q-mt-md">
            <q-btn :label="$t('monthly_summary.add_row')" color="secondary" @click="addRow" />
            <q-btn
              :label="$t('monthly_summary.remove_last')"
              color="negative"
              class="q-ml-md"
              @click="removeRow"
            />
          </div> -->
        </q-card>

        <!-- Boutons -->
        <!-- <div class="row justify-center q-mt-lg">
          <q-btn
            :label="t('labels.enregistrer')"
            color="primary"
            type="submit"
            :loading="loading"
          />
          <q-btn
            :label="t('labels.reinitialiser')"
            color="warning"
            flat
            class="q-ml-md"
            @click="resetForm"
          />
        </div> -->
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
// import axios from 'axios'
import { useI18n } from 'vue-i18n'
import { impots as rawImpots } from '../../../data/Impots.js'
import { banques as rawBanques } from '../../../data/banques.js'

const $q = useQuasar()
const loading = ref(false)
const afficher = ref(false)
const { t, locale } = useI18n()

const formValid = ref({
  nbmois: '',
  numControle: '',
  reportType: '', // valeur par défaut
  numEmploye: '',
})

// Données du formulaire
const formData = ref({
  numEmployeur: '',
  exercice: '',
  numDemande: '',
  dateDemande: '',
  employeur: '',
  typeControle: '',
  numRapport: '',
  dateControle: '',
  nomControleur: '',
  nomDG: '',
  nomComptable: '',
  localisation: '',
  numCompte: '',
  banque: '',
  centreImpots: '',
  datePremiereVisite: '',
  dateDerniereVisite: '',
  lignes: [
    {
      id: 1,
      mois: '',
      annee: '',
      pfA: '',
      pfB: '',
      rpA: '',
      rpB: '',
      pvidA: '',
      pvidB: '',
      effA: '',
      effB: '',
      comp: '',
    },
  ],
})

const formSearch = ref({
  numEmployeur: '',
  exercice: '',
})

// Options
const impots = rawImpots
const banques = rawBanques

// Colonnes de la table
const columns = [
  { name: 'mois', label: 'Mois', field: 'mois', align: 'center' },
  { name: 'annee', label: 'Année', field: 'annee', align: 'center' },
  { name: 'pfA', label: 'PF Déclarée', field: 'pfA', align: 'center' },
  { name: 'pfB', label: 'PF Trouvée', field: 'pfB', align: 'center' },
  { name: 'rpA', label: 'RP Déclarée', field: 'rpA', align: 'center' },
  { name: 'rpB', label: 'RP Trouvée', field: 'rpB', align: 'center' },
  { name: 'pvidA', label: 'PVID Déclarée', field: 'pvidA', align: 'center' },
  { name: 'pvidB', label: 'PVID Trouvée', field: 'pvidB', align: 'center' },
  { name: 'effA', label: 'Effectif Déclaré', field: 'effA', align: 'center' },
  { name: 'effB', label: 'Effectif Trouvé', field: 'effB', align: 'center' },
  { name: 'comp', label: 'Comportement (Bon/Mauvais)', field: 'comp', align: 'center' },
]

// Colonnes Recherche
const columns2 = [
  { name: 'num', label: 'N°', field: 'num', align: 'center' },
  { name: 'numControle', label: 'N° CONTROLE', field: 'numControle', align: 'center' },
  { name: 'numDemande', label: 'N° DMDE', field: 'numDemande', align: 'center' },
  { name: 'montantTotal', label: 'MONTANT TOTAL', field: 'montantTotal', align: 'right' },
  { name: 'periodeDebut', label: 'PERIODE DEBUT', field: 'periodeDebut', align: 'center' },
  { name: 'periodeFin', label: 'PERIODE FIN', field: 'periodeFin', align: 'center' },
  { name: 'centre', label: 'CENTRE', field: 'centre', align: 'center' },
  { name: 'controleur', label: 'CONTROLEUR', field: 'controleur', align: 'left' },
  { name: 'dateControle', label: 'DATE CONTROLE', field: 'dateControle', align: 'left' },
]

const rows = ref([])

const validateMatriculeCNPS = (val) => {
  const regex = /^(?:\d{3}-\d{7}-\d{3}-[A-Z]|\d{3}-\d{7}-[A-Z])$/.test(val)
  return regex || t('errors.invalid_cnps_format')
}

const required = (val) => !!val || 'Ce champ est requis / This field is required'

// Ligne sélectionnée
const selectedRow = ref([])

const rowsData = [
  {
    num: 1,
    numControle: 'C001',
    raison: 'Société ABC',
    numDemande: 'D123',
    facteur: 'Retard paiement',
    ordonnateur: 'DG CNPS',
    montantTotal: 1500000,
    periodeDebut: '01/2024',
    periodeFin: '03/2024',
    centre: 'Centre Douala',
    controleur: 'Jean Dupont',
    dateControle: '15/03/2025',
  },
  {
    num: 2,
    numControle: 'C002',
    raison: 'Société ABC',
    numDemande: 'D124',
    facteur: 'Retard paiement',
    ordonnateur: 'DG CNPS',
    montantTotal: 2000000,
    periodeDebut: '04/2024',
    periodeFin: '06/2024',
    centre: 'Centre Yaoundé',
    controleur: 'Marie Claire',
    dateControle: '18/03/2025',
  },
  {
    num: 3,
    numControle: 'C003',
    raison: 'Société ABC',
    numDemande: 'D125',
    facteur: 'Retard paiement',
    ordonnateur: 'DG CNPS',
    montantTotal: 1200000,
    periodeDebut: '07/2024',
    periodeFin: '09/2024',
    centre: 'Centre Douala',
    controleur: 'Paul Martin',
    dateControle: '20/03/2025',
  },
]

const searchDemande = async () => {
  // Vérification des champs obligatoires
  if (!formSearch.value.numEmployeur || !formSearch.value.exercice) {
    $q.notify({
      type: 'warning',
      message: 'Veuillez renseigner le N° Employeur et l’Exercice avant la recherche.',
    })
    return // on sort de la fonction si les champs sont vides
  }

  try {
    // Exemple appel API (à adapter à ton backend Laravel)
    /* const response = await axios.get('/api/demandes-controle', {
      params: {
        numEmployeur: formSearch.value.numEmployeur,
        exercice: formSearch.value.exercice,
      },
    }) */

    // rows.value = response.data // tableau venant de l’API
    resetForm()
    rows.value = rowsData

    if (rows.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'Aucun résultat trouvé pour ces critères.',
      })
    }
  } catch (error) {
    console.error('Erreur recherche :', error)
    rows.value = rowsData
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la recherche',
    })
  }
}

// Quand une ligne est sélectionnée
watch(selectedRow, (newVal) => {
  if (newVal.length === 0) return
  const row = newVal[0]

  formValid.value.numControle = row.numControle
  formData.value.numDemande = row.numDemande
  formData.value.numControle = row.numControle
  formData.value.dateDemande = row.dateOrdo
  formData.value.employeur = row.raison
  formData.value.typeControle = row.facteur
  formData.value.periodeDebutMois = row.periodeDebut.split('/')[0]
  formData.value.periodeDebutAnnee = row.periodeDebut.split('/')[1]
  formData.value.periodeFinMois = row.periodeFin.split('/')[0]
  formData.value.periodeFinAnnee = row.periodeFin.split('/')[1]
  formData.value.motifControle = row.facteur
  formData.value.nomDemandeur = row.ordonnateur
  formData.value.centreImpots = row.centre
  formData.value.dateControle = row.dateControle
})

// Méthodes
const control = () => {
  // Logique pour "Afficher" le contrôle
  // console.log('Afficher contrôle pour', this.formData.numControle);
  // Tu peux ici faire un fetch ou axios pour récupérer les données
  if (formData.value.numControle) {
    afficher.value = true
  } else {
    $q.notify({
      type: 'warning',
      message: 'Sélectionner une ligne',
    })
  }
}

const onSubmit = async () => {
  if (!formData.value.numControle) {
    $q.notify({
      type: 'warning',
      message: 'Sélectionner une ligne',
    })
    return
  }
  loading.value = true
  afficher.value = false
  try {
    /* const payload = { ...formData.value }
    delete payload.lignes.id // on enlève les id techniques
    const response = await axios.post('/api/controle-resultats', payload) */

    $q.notify({
      type: 'positive',
      message: 'Fichier en cours de téléchargement !',
    })
    // console.log('Réponse API :', response.data)
    resetForm()
  } catch (error) {
    console.error('Erreur API :', error)
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de l’enregistrement',
    })
  } finally {
    loading.value = false
  }
}

const reportOptions = [
  { label: 'Rapport', value: 'rap' },
  { label: 'Annexe', value: 'anexe' },
]

const resetForm = () => {
  formData.value = {
    numDemande: '',
    dateDemande: '',
    employeur: '',
    typeControle: '',
    periodeDebutMois: '',
    periodeDebutAnnee: '',
    periodeFinMois: '',
    periodeFinAnnee: '',
    motifControle: '',
    taxationOffice: '',
    cotisationsPayees: '',
    regime: '',
    risque: '',
    nomDernierControleur: '',
    dateDernierControle: '',
    numRapport: '',
    dateControle: '',
    nomControleur: '',
    nomDemandeur: '',
    nomDG: '',
    nomComptable: '',
    localisation: '',
    numCompte: '',
    centreImpots: '',
    datePremiereVisite: '',
    dateDerniereVisite: '',
    regimeTrouve: '',
    risqueTrouve: '',
    effectifImmat: '00',
    effectifNonImmat: '00',
    casTaxation: '',
    constatTerrain: '',
    documentsConsultes: '',
    resumeActivites: '',
    lignes: [
      {
        id: 1,
        mois: '',
        annee: '',
        pfA: '',
        pfB: '',
        rpA: '',
        rpB: '',
        pvidA: '',
        pvidB: '',
        effA: '',
        effB: '',
        comp: '',
      },
    ],
  }
}

/* const addRow = () => {
  const nextId = formData.value.lignes.length + 1
  formData.value.lignes.push({
    id: nextId,
    mois: '',
    annee: '',
    pfA: '',
    pfB: '',
    rpA: '',
    rpB: '',
    pvidA: '',
    pvidB: '',
    effA: '',
    effB: '',
    comp: '',
  })
}

const removeRow = () => {
  if (formData.value.lignes.length > 1) {
    formData.value.lignes.pop()
  } else {
    $q.notify({
      type: 'warning',
      message: 'Impossible de supprimer la dernière ligne',
    })
  }
} */

/* const searchDemande = () => {
  $q.notify({
    type: 'info',
    message: 'Recherche en cours... (à implémenter)',
  })
} */
</script>

<style scoped>
.saisie-resultats {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 310px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #00b4ff

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>

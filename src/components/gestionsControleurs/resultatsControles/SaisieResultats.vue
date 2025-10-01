<template>
  <div class="saisie-resultats">
    <q-card class="q-pa-sm">
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <!-- Recherche des demandes -->
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 q-mb-sm text-bold">
            {{ t('labels.rechercheDemandes') }}
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

              <div class="col-4 flex flex-center">
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
                v-model="formData.cotisationsPayees"
                :label="t('labels.cotisationsPayees')"
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
                v-model="formData.nomDernierControleur"
                :label="t('labels.nomDernierControleur')"
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
            <div class="col-3">
              <q-input
                v-model="formData.numRapport"
                :label="t('labels.numRapport')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.dateControle"
                :label="t('labels.dateControle')"
                outlined
                dense
                :rules="[required]"
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
            <div class="col-6">
              <q-input
                v-model="formData.nomControleur"
                :label="t('labels.nomControleur')"
                outlined
                dense
                :rules="[required]"
              />
            </div>
          </div>

          <!-- Ligne 2 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-6">
              <q-input
                v-model="formData.nomDemandeur"
                :label="t('labels.ordonnancePar')"
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
                :rules="[required]"
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
                :rules="[required]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="formData.localisation"
                :label="t('labels.localisation')"
                outlined
                dense
                :rules="[required]"
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
                :rules="[required]"
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="formData.banque"
                :options="banques"
                :label="t('labels.banque')"
                outlined
                dense
                :rules="[required]"
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
                :rules="[required]"
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.datePremiereVisite"
                :label="t('labels.datePremiereVisite')"
                outlined
                dense
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                :rules="[required]"
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
            <div class="col-3">
              <q-input
                v-model="formData.dateDerniereVisite"
                :label="t('labels.dateDerniereVisite')"
                outlined
                dense
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                :rules="[required]"
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
          </div>
        </q-card>

        <!-- Régime / Risque -->
        <q-card flat bordered class="q-pa-md q-mt-md">
          <div class="text-subtitle1 q-mb-sm text-bold">{{ t('labels.regimeRisque') }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-3">
              <q-select
                v-model="formData.regimeTrouve"
                :options="regimes"
                :label="t('labels.regimeTrouve')"
                outlined
                dense
                :rules="[required]"
              />
            </div>
            <div class="col-3">
              <q-select
                v-model="formData.risqueTrouve"
                :options="risques"
                :label="t('labels.risqueTrouve')"
                outlined
                dense
                :rules="[required]"
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.effectifImmat"
                :label="t('labels.effectifImmat')"
                outlined
                dense
                :rules="[required]"
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="formData.effectifNonImmat"
                :label="t('labels.effectifNonImmat')"
                outlined
                dense
                :rules="[required]"
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
                :rules="[required]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="formData.constatTerrain"
                :label="$t('observations.field_observation')"
                outlined
                dense
                :rules="[required]"
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
                :rules="[required]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="formData.resumeActivites"
                :label="$t('observations.activity_summary')"
                outlined
                dense
                :rules="[required]"
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
                />
                <q-select
                  v-model="props.row[props.col.field]"
                  v-else
                  :label="$t('monthly_summary.bad_faith')"
                  :options="['YES', 'NO']"
                  outlined
                  dense
                />
              </q-td>
            </template>
          </q-table>
          <div class="row justify-center q-mt-md">
            <q-btn :label="$t('monthly_summary.add_row')" color="secondary" @click="addRow" />
            <q-btn
              :label="$t('monthly_summary.remove_last')"
              color="negative"
              class="q-ml-md"
              @click="removeRow"
            />
          </div>
        </q-card>

        <!-- Boutons -->
        <div class="row justify-center q-mt-lg">
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
        </div>
      </q-form>
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
const { t, locale } = useI18n()

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
  { name: 'matricule', label: 'MATRICULE', field: 'matricule', align: 'center' },
  { name: 'raison', label: 'RAISON SOCIALE', field: 'raison', align: 'center' },
  { name: 'numDemande', label: 'N° DMDE', field: 'numDemande', align: 'center' },
  { name: 'facteur', label: 'FACTEUR DECLENCHEUR', field: 'facteur', align: 'center' },
  { name: 'ordonnateur', label: 'ORDONNATEUR', field: 'ordonnateur', align: 'center' },
  { name: 'periodeDebut', label: 'PERIODE DEBUT', field: 'periodeDebut', align: 'center' },
  { name: 'periodeFin', label: 'PERIODE FIN', field: 'periodeFin', align: 'center' },
  { name: 'centre', label: 'CENTRE', field: 'centre', align: 'center' },
  { name: 'dateOrdo', label: 'DATE ORDO.', field: 'dateOrdo', align: 'center' },
  { name: 'dateControle', label: 'DATE CONTROLE', field: 'dateControle', align: 'center' },
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
    matricule: '010-1291201-F',
    raison: 'Société ABC',
    numDemande: 'D123',
    facteur: 'Retard paiement',
    ordonnateur: 'DG CNPS',
    periodeDebut: '01/2024',
    periodeFin: '12/2024',
    centre: 'Centre Douala',
    dateOrdo: '01/03/2025',
    dateControle: '15/03/2025',
  },
  {
    num: 2,
    matricule: '010-1291201-F',
    raison: 'Société ABC',
    numDemande: 'D124',
    facteur: 'Déclaration incohérente',
    ordonnateur: 'DG CNPS',
    periodeDebut: '01/2024',
    periodeFin: '12/2024',
    centre: 'Centre Yaoundé',
    dateOrdo: '05/03/2025',
    dateControle: '18/03/2025',
  },
  {
    num: 3,
    matricule: '010-1291201-F',
    raison: 'Société ABC',
    numDemande: 'D125',
    facteur: 'Retard paiement',
    ordonnateur: 'DG CNPS',
    periodeDebut: '01/2025',
    periodeFin: '03/2025',
    centre: 'Centre Douala',
    dateOrdo: '01/03/2025',
    dateControle: '15/03/2025',
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
/* const onRowSelected = () => {
  if (selectedRow.value.length === 0) return
  const row = selectedRow.value[0]

  // Remplissage auto des champs readonly
  formData.value.numDemande = row.numDemande
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
} */

watch(selectedRow, (newVal) => {
  if (newVal.length === 0) return
  const row = newVal[0]

  formData.value.numDemande = row.numDemande
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
/* const onSubmit = () => {
  console.log('Formulaire soumis :', formData.value)
  $q.notify({
    type: 'positive',
    message: 'Résultat de contrôle enregistré avec succès !',
  })
  resetForm()
} */

// Méthodes
const onSubmit = async () => {
  loading.value = true
  try {
    /* const payload = { ...formData.value }
    delete payload.lignes.id // on enlève les id techniques
    const response = await axios.post('/api/controle-resultats', payload) */

    $q.notify({
      type: 'positive',
      message: 'Résultat de contrôle enregistré avec succès !',
    })
    /* console.log('Réponse API :', response.data) */
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

const regimes = [
  { label: '1 - Régime Général', value: '1' },
  { label: '2 - Régime Agricole', value: '2' },
  { label: '3 - Enseignement Privé', value: '3' },
  { label: '9 - Main d’œuvre domestique', value: '9' },
]

const risques = [
  { label: 'A - Risque faible', value: 'A' },
  { label: 'B - Risque moyen', value: 'B' },
  { label: 'C - Risque élevé', value: 'C' },
]

const resetForm = () => {
  formData.value = {
    numEmployeur: '',
    exercice: '',
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
    banque: '',
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

const addRow = () => {
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
}

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

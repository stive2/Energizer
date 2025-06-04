<template>
  <q-dialog v-model="open" persistent full-width>
    <q-card :style="$q.screen.gt.sm ? 'width: 900px' : 'width: 100%'">
      <q-card-section>
        <div class="text-h6 text-primary text-center text-bold">{{ $t(service.name) }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" @submit.prevent="submitForm">
          <q-stepper v-model="step" vertical color="primary" animated>
            <!-- Étape 1 : Informations sur l'affiliation -->
            <q-step :name="1" title="Informations sur l'affiliation" icon="money" :done="step > 1">
              <div class="justify-center row">
                <q-select
                  v-model="form.origineRevenue"
                  label="Origine des revenus *"
                  :options="[
                    'Activité indépendante',
                    'Revenus agricoles',
                    'Revenus commerciaux',
                    'Revenus locatifs',
                    'Prestations sociales',
                    'Autres revenus',
                    'Investissements',
                  ]"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.dateAffiliationSollicite"
                  label="Date d'affiliation sollicitée *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  readonly
                  :rules="[required]"
                  mask="##/##/####"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateAffiliationSollicite"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.detailOrigineRevenue"
                  label="Détail sur l'origine des revenus *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.dateAffiliationNormale"
                  label="Date d'affiliation normale *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  readonly
                  :rules="[required]"
                  mask="##/##/####"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateAffiliationNormale"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.revenuAnnuelDeclare"
                  label="Revenu annuel déclaré *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  type="number"
                  min="0"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.assieteCotisation"
                  label="Assiète de cotisation à l'immatriculation *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  min="0"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.tauxCotisation"
                  label="Taux de cotisation en vigueur"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  type="number"
                  min="0"
                >
                  <template v-slot:append>
                    <q-icon name="percent" class="text-grey-8" />
                  </template>
                </q-input>
                <q-input
                  v-model="form.montantCotisation"
                  label="Montant de cotisation à l'immatriculation *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  type="number"
                  min="0"
                  :rules="[required]"
                />
                <q-file
                  v-model="form.filedeclareAnnuelRevenu"
                  label="Déclaration annuelle de revenu *"
                  outlined
                  dense
                  style="width: 600px"
                  counter
                  :counter-label="counterLabelFn"
                  max-files="1"
                  accept=".jpg, .png, image/*"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  @update:model-value="onFileSelected"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
                <q-file
                  v-model="form.filedeclareHonneur"
                  label="Déclaration sur honneur de non salarié et non perception de pension *"
                  outlined
                  dense
                  style="width: 600px"
                  counter
                  :counter-label="counterLabelFn"
                  max-files="1"
                  accept=".jpg, .png, image/*"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  @update:model-value="onFileSelected"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(2)" color="primary" label="Continuer" />
              </q-stepper-navigation>
            </q-step>

            <!-- Étape 2 : Informations personnelles de l’assuré -->
            <q-step
              :name="2"
              title="Informations personnelles de l’assuré"
              icon="person"
              :done="step > 2"
            >
              <div class="justify-center row">
                <q-input
                  v-model="form.nom"
                  label="Nom *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.prenom"
                  label="Prénom"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                />
                <q-select
                  v-model="form.sexe"
                  label="Sexe *"
                  :options="['Masculin', 'Féminin']"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.dateNaissance"
                  label="Date de naissance *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  mask="##/##/####"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateNaissance"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.lieuNaissance"
                  label="Lieu de naissance *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.arrondissementAssure"
                  label="Arrondissement de naissance *"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.etatCivil"
                  label="État matrimonial *"
                  :options="['Célibataire', 'Marié', 'Divorcé', 'Veuf']"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.nationaliteAssure"
                  :options="pays"
                  option-label="nationalite"
                  label="Nationalité *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPays"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.pieceIdentiteAssure"
                  :options="pieces"
                  option-label="LIBELLE"
                  label="Type de Pièce d'identité *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPieces"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.numeroPieceIdentite"
                  label="Numéro de pièce d'identité *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.datePieceIdentite"
                  label="Etabli le *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  mask="##/##/####"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.datePieceIdentite"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-select
                  v-model="form.lieuDelivrancePieceIdentiteAssure"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  label="à *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                />
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(3)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 2" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Étape 3 : Informations sur le père de l’assuré -->
            <q-step
              :name="3"
              title="Informations sur le père de l’assuré"
              icon="person"
              :done="step > 3"
            >
              <div class="justify-center row">
                <q-input
                  v-model="form.nomPere"
                  label="Nom"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                />
                <q-input
                  v-model="form.prenomPere"
                  label="Prénom"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                />
                <q-input
                  v-model="form.dateNaissancePere"
                  label="Date de naissance"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  mask="##/##/####"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateNaissancePere"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.lieuNaissancePere"
                  label="Lieu de naissance"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                />
                <q-select
                  v-model="form.arrondissementPere"
                  label="Arrondissement de naissance"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                />
                <q-select
                  v-model="form.vivantPere"
                  label="Vivant"
                  :options="['Oui', 'Non']"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                />
                <q-input
                  v-model="form.dateDecesPere"
                  label="Date décès"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  mask="##/##/####"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateDecesPere"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <q-stepper-navigation>
                <q-btn @click="goToNextStep(4)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 2" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Étape 4 : Informations sur la mère de l’assuré -->
            <q-step
              :name="4"
              title="Informations sur la mère de l’assuré"
              icon="person"
              :done="step > 4"
            >
              <div class="justify-center row">
                <q-input
                  v-model="form.nomMere"
                  label="Nom *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.prenomMere"
                  label="Prénom"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                />
                <q-input
                  v-model="form.dateNaissanceMere"
                  label="Date de naissance *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  mask="##/##/####"
                  :rules="[required]"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateNaissanceMere"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.lieuNaissanceMere"
                  label="Lieu de naissance *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.arrondissementMere"
                  label="Arrondissement de naissance *"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.vivantMere"
                  label="Vivant *"
                  :options="['Oui', 'Non']"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.dateDecesMere"
                  label="Date décès"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  mask="##/##/####"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateDecesMere"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(5)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 3" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Étape 5 : Contact et Résidence -->
            <q-step :name="5" title="Contact et Résidence" icon="home" :done="step > 5">
              <div class="justify-center row">
                <q-select
                  v-model="form.ville"
                  label="Ville de résidence *"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.quartier"
                  label="Quartier"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                />
                <q-input
                  v-model="form.telephone"
                  label="Téléphone *"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  type="tel"
                  mask="### ### ###"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.fax"
                  label="Fax"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                />
                <q-input
                  v-model="form.addresse"
                  label="Adresse"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                />
                <q-input
                  v-model="form.email"
                  label="Email"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  type="email"
                  :rules="[required, validateEmail]"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
                <q-input
                  v-model="form.boitePostale"
                  label="Boîte postale"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                />
                <q-select
                  v-model="form.centreCNPS"
                  :options="centres"
                  option-label="LIB_CENTRE"
                  label="Centre CNPS de Gestion à préciser au CFCE"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterCentreCNPS"
                  :rules="[required]"
                />
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(6)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 4" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Étape 6 : Pièces complémentaires -->
            <q-step :name="6" title="Pièces complémentaires" icon="work">
              <div class="justify-center row">
                <q-input
                  v-model="form.nombreEnfants"
                  label="Nombre d’enfants"
                  type="number"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  min="0"
                />
                <q-input
                  v-model="form.nombreCertificat"
                  label="Nombre Certificat de travail chez employeur(s) précédent(s)"
                  type="number"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  min="0"
                />
                <q-input
                  v-model="form.nombreConjoints"
                  label="Nombre de conjoints"
                  type="number"
                  outlined
                  dense
                  style="width: 600px"
                  class="q-mr-sm q-mb-sm"
                  min="0"
                />
              </div>

              <q-stepper-navigation>
                <q-btn type="submit" color="primary" label="Soumettre" />
                <q-btn flat @click="step = 5" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Annuler" v-close-popup color="primary" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { useNotify } from './useNotify.js'
import { arrondissements as rawArrondissements } from '../data/Arrondissements.js'
import { pays as rawPays } from '../data/Pays.js'
import { pieces as rawPieces } from '../data/Pieces.js'
import { centres as rawCentres } from '../data/Centres.js'

defineProps({
  service: Object,
})

const emit = defineEmits(['close'])

const { notifyError, notifySuccess } = useNotify()

const open = ref(true)
const step = ref(1)
const formRef = ref(null)

const arrondissements = ref([...rawArrondissements])
const pays = ref([...rawPays])
const pieces = ref([...rawPieces])
const centres = ref([...rawCentres])

// Fonction de validation pour l'email
const validateEmail = (val) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return regex.test(val) || 'Veuillez entrer un email valide (ex: exemple@domaine.com)'
}

// Gestionnaire pour la sélection de fichier
const onFileSelected = (file) => {
  if (file) {
    notifySuccess(`Fichier ${file.name} sélectionné avec succès !`)
  }
}

const onRejected = (rejectedEntries) => {
  rejectedEntries.forEach((entry) => {
    notifyError(
      `Fichier rejeté : ${entry.file.name} - ${entry.failedPropValidation === 'max-file-size' ? 'Taille maximale dépassée (3MB)' : 'Format non pris en charge.'}`,
    )
  })
}

// Counter label function for file inputs
const counterLabelFn = ({ files } = {}) => {
  return files?.length > 0 ? `${files.length} fichier(s) sélectionné(s)` : ''
}

const form = ref({
  origineRevenue: '',
  dateAffiliationSollicite: '',
  detailOrigineRevenue: '',
  dateAffiliationNormale: '',
  revenuAnnuelDeclare: null,
  assieteCotisation: '',
  tauxCotisation: null,
  montantCotisation: null,
  filedeclareAnnuelRevenu: null,
  filedeclareHonneur: null,
  sexe: '',
  nom: '',
  prenom: '',
  dateNaissance: '',
  lieuNaissance: '',
  nationaliteAssure: '',
  numeroCarteNationale: '',
  numeroPieceIdentite: '',
  datePieceIdentite: '',
  lieuDelivrancePieceIdentiteAssure: '',
  etatCivil: '',
  numero: '',
  nomPere: '',
  prenomPere: '',
  dateNaissancePere: '',
  arrondissementPere: '',
  arrondissementAssure: '',
  nationalitePere: '',
  pieceIdentiteAssure: '',
  lieuNaissancePere: '',
  vivantPere: '',
  dateDecesPere: '',
  nomMere: '',
  prenomMere: '',
  dateNaissanceMere: '',
  lieuNaissanceMere: '',
  arrondissementMere: '',
  vivantMere: '',
  dateDecesMere: '',
  ville: '',
  quartier: '',
  telephone: '',
  email: '',
  boitePostale: '',
  centreCNPS: '',
  fax: '',
  addresse: '',
  situationMatrimoniale: '',
  nombreEnfants: 0,
  nombreCertificat: 0,
  nombreConjoints: 0,
  smig: 0,
})

const optionsDn = (date) => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = ('0' + (today.getMonth() + 1)).slice(-2)
  const dd = ('0' + today.getDate()).slice(-2)
  const todayStr = `${dd}/${mm}/${yyyy}`
  return date <= todayStr
}

const required = (val) => !!val || 'Ce champ est requis'

const goToNextStep = async (nextStep) => {
  const valid = await formRef.value.validate()
  if (valid) {
    step.value = nextStep
  } else {
    notifyError('Veuillez remplir tous les champs requis.')
  }
}

const filterArrondissement = (val, update) => {
  if (val === '') {
    update(() => {
      arrondissements.value = [...rawArrondissements]
    })
    return
  }
  const needle = val.toLowerCase()
  update(() => {
    arrondissements.value = rawArrondissements.filter((item) =>
      item.NOM_ARROND.toLowerCase().includes(needle),
    )
  })
}

const filterPays = (val, update) => {
  if (val === '') {
    update(() => {
      pays.value = [...rawPays]
    })
    return
  }
  const needle = val.toLowerCase()
  update(() => {
    pays.value = rawPays.filter((item) => item.nationalite.toLowerCase().includes(needle))
  })
}

const filterPieces = (val, update) => {
  if (val === '') {
    update(() => {
      pieces.value = [...rawPieces]
    })
    return
  }
  const needle = val.toLowerCase()
  update(() => {
    pieces.value = rawPieces.filter((item) => item.LIBELLE.toLowerCase().includes(needle))
  })
}

const filterCentreCNPS = (val, update) => {
  if (val === '') {
    update(() => {
      centres.value = [...rawCentres]
    })
    return
  }
  const needle = val.toLowerCase()
  update(() => {
    centres.value = rawCentres.filter((item) => item.LIB_CENTRE.toLowerCase().includes(needle))
  })
}

const submitForm = async () => {
  const valid = await formRef.value.validate()
  if (!valid) {
    notifyError('Veuillez corriger les erreurs du formulaire.')
    return
  }
  console.log('Formulaire soumis:', form.value)
  notifySuccess('Formulaire soumis avec succès.')
  open.value = false
  emit('close')
}

const closeDialog = () => {
  open.value = false
  emit('close')
}
</script>

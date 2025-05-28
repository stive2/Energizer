<template>
  <q-dialog v-model="open" persistent full-width>
    <q-card :style="$q.screen.gt.sm ? 'width: 900px' : 'width: 100%'">
      <q-card-section>
        <div class="text-h6 text-primary text-center text-bold">
          {{ service.name }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" @submit.prevent="submitForm">
          <q-stepper v-model="step" vertical color="primary" animated>
            <!-- Etape 1 : Informations sur l'entreprise -->
            <q-step
              :name="1"
              title="Informations sur l'entreprise"
              icon="business"
              :done="step > 1"
              class=""
            >
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.raisonSociale"
                  label="Raison sociale *"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.nomCommercial"
                  label="Nom commercial *"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[required]"
                />
                <q-input
                  v-model="form.sigle"
                  label="Sigle"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                />
                <q-input
                  v-model="form.autreContact"
                  label="Autre contact (Nom complet + téléphone)"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                />
                <q-input
                  v-model="form.dateOuverture"
                  hint="Au format YYYY-MM-DD"
                  label="Date début service (Début activité) *"
                  outlined
                  dense
                  class="col-md-4 col-xs-12 col-sm-12"
                  :rules="[required]"
                  mask="####-##-##"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateOuverture"
                          mask="YYYY-MM-DD"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.dateCreation"
                  hint="Au format YYYY-MM-DD"
                  label="Date de création (registre commerce) *"
                  outlined
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
                  :rules="[required]"
                  mask="####-##-##"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateCreation"
                          mask="YYYY-MM-DD"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.dateEmbauche"
                  hint="Au format YYYY-MM-DD"
                  label="Date embauche premier salarie (date d'effet) *"
                  outlined
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
                  :rules="[required]"
                  mask="####-##-##"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateEmbauche"
                          mask="YYYY-MM-DD"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.numRegistreCommerce"
                  label="Numéro de registre de commerce *"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[required]"
                />
                <q-input
                  v-model="form.numIdentifiantUnique"
                  label="Numéro d'identifiant unique (NIU) *"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[required]"
                />
                <q-checkbox
                  name="is_succursale"
                  v-model="form.isSuccursale"
                  label="Cas d'une succursale"
                  class="col-md-2 col-xs-12 col-sm-12"
                />
                <q-input
                  v-model="form.nomCommercialSiege"
                  v-if="form.isSuccursale"
                  label="Nom commercial siége *"
                  class="col-md-8 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[required]"
                />
                <q-input
                  v-model="form.raisonSocialeSiege"
                  v-if="form.isSuccursale"
                  label="Raison sociale siége *"
                  class="col-md-7 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[required]"
                />
                <q-input
                  v-model="form.matriculeSiege"
                  v-if="form.isSuccursale"
                  label="Matricule siége *"
                  class="col-md-3 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[required]"
                />
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(2)" color="primary" label="Suivant" />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 2 : Coordonnées de l'entreprise -->
            <q-step
              :name="2"
              title="Coordonnées de l'entreprise"
              icon="location_on"
              :done="step > 2"
            >
              <div class="q-gutter-md justify-center row">
                <q-select
                  v-model="form.arrondissement"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  label="Arrondissement *"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                  class="col-md-3 col-xs-12 col-sm-12"
                />
                <q-input
                  v-model="form.adresse"
                  label="Adresse *"
                  outlined
                  dense
                  class="col-md-7 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.quartier"
                  label="Quartier *"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.lieuDit"
                  label="Lieu-dit"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                />
                <q-input
                  v-model="form.boitePostale"
                  label="Boîte postale"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                />
                <q-input
                  v-model="form.numLogement"
                  label="Numéro de logement"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                />
                <q-input
                  v-model="form.email"
                  label="Email *"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  type="email"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.telephone"
                  label="Téléphone *"
                  outlined
                  type="tel"
                  mask="### ### ###"
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
              </div>
              <q-stepper-navigation>
                <q-btn @click="goToNextStep(3)" color="primary" label="Suivant" />
                <q-btn flat @click="step = 1" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 3 : Données administratives et fiscales -->
            <q-step
              :name="3"
              title="Données administratives et fiscales"
              icon="location_on"
              :done="step > 3"
            >
              <div class="q-gutter-md justify-center row">
                <q-select
                  v-model="form.origineImmatriculation"
                  :options="['Spontanee', 'Suite a controle', 'Immatriculation d office']"
                  label="Origine immatriculation *"
                  outlined
                  dense
                  input-debounce="0"
                  fill-input
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                />
                <q-select
                  v-model="form.origineDossier"
                  :options="['Centre Formalite Creation Entreprise(C.F.C.E)', 'AUTRE']"
                  label="Origine dossier *"
                  outlined
                  dense
                  input-debounce="0"
                  fill-input
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                />
                <q-select
                  v-model="form.formeJuridique"
                  :options="formeJuridique"
                  option-label="LIBELLE_NATUREJUR"
                  label="Forme juridique *"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterFormeJuridique"
                  :rules="[required]"
                  class="col-md-7 col-xs-12 col-sm-12"
                />
                <q-input
                  v-model="form.nombreTravailleurs"
                  label="Nombre de travailleurs *"
                  outlined
                  type="number"
                  min="1 "
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.activiteEconomique"
                  :options="activites"
                  v-model-options="{ trackBy: 'LIBELLE_SECT_ACTIVITE' }"
                  option-label="LIBELLE_SECT_ACTIVITE"
                  label="Activite economique *"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterActivites"
                  :rules="[required]"
                  class="col-md-6 col-xs-12 col-sm-12"
                />
                <q-input
                  v-model="form.activiteEconomique.REGIME_CNPS"
                  label="Regime CNPS *"
                  outlined
                  readonly
                  dense
                  class="col-md-2 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.activiteEconomique.DESCRIPTION"
                  label="Groupe de risque *"
                  outlined
                  readonly
                  dense
                  class="col-md-2 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.centreImpots"
                  :options="impots"
                  option-label="ABREVIATION"
                  label="Centre d'impots *"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterImpots"
                  @update:model-value="
                    (val) => (form.centreCNPS = findCentreCNPSByCentreImpots(val))
                  "
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                />
                <q-select
                  v-model="form.centreCNPS"
                  :options="centres"
                  option-label="LIB_CENTRE"
                  label="Centre CNPS de Gestion* A préciser au CFCE"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterCentreCNPS"
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                />
              </div>
              <q-stepper-navigation>
                <q-btn @click="goToNextStep(4)" color="primary" label="Suivant" />
                <q-btn flat @click="step = 2" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 4 : Documents à fournir -->
            <q-step
              :name="4"
              title="Documents à fournir (Max 3 Mo par fichier)"
              icon="folder"
              :done="step > 4"
            >
              <div class="q-gutter-md justify-center row">
                <q-uploader
                  label="Registre de commerce *"
                  flat
                  url="http://localhost:4444/upload"
                  accept=".jpg, image/*, .png, .pdf"
                  max-file-size="3072000"
                  max-files="1"
                  class="col-md-3 col-xs-12 col-sm-12"
                  @rejected="onRejected"
                />
                <q-uploader
                  label="Autorisation d'ouverture *"
                  flat
                  url="http://localhost:4444/upload"
                  accept=".jpg, image/*, .png, .pdf"
                  max-file-size="3072000"
                  max-files="1"
                  class="col-md-3 col-xs-12 col-sm-12"
                  @rejected="onRejected"
                />
                <q-uploader
                  label="Attestation d'immatriculation *"
                  flat
                  url="http://localhost:4444/upload"
                  accept=".jpg, image/*, .png, .pdf"
                  max-file-size="3072000"
                  max-files="1"
                  class="col-md-3 col-xs-12 col-sm-12"
                  @rejected="onRejected"
                />
                <q-uploader
                  label="Plan de localisation"
                  flat
                  url="http://localhost:4444/upload"
                  accept=".jpg, image/*, .png, .pdf, .docx, .doc"
                  max-file-size="3072000"
                  max-files="1"
                  class="col-md-3 col-xs-12 col-sm-12"
                  @rejected="onRejected"
                />
                <q-uploader
                  label="Contrat de bail"
                  flat
                  url="http://localhost:4444/upload"
                  accept=".jpg, image/*, .png, .pdf"
                  max-file-size="3072000"
                  max-files="1"
                  class="col-md-3 col-xs-12 col-sm-12"
                  @rejected="onRejected"
                />
                <q-uploader
                  label="Liste des travailleurs"
                  flat
                  url="http://localhost:4444/upload"
                  accept=".jpg, image/*, .png, .pdf, .xlsx, .xls"
                  max-file-size="3072000"
                  max-files="1"
                  class="col-md-3 col-xs-12 col-sm-12"
                  @rejected="onRejected"
                />
                <q-uploader
                  label="Patente"
                  flat
                  url="http://localhost:4444/upload"
                  accept=".jpg, image/*, .png, .pdf"
                  max-file-size="3072000"
                  max-files="1"
                  class="col-md-3 col-xs-12 col-sm-12"
                  @rejected="onRejected"
                />
                <q-uploader
                  label="Impôt libératoire"
                  flat
                  url="http://localhost:4444/upload"
                  accept=".jpg, image/*, .png, .pdf"
                  max-file-size="3072000"
                  max-files="1"
                  class="col-md-3 col-xs-12 col-sm-12"
                  @rejected="onRejected"
                />
                <q-uploader
                  label="Statuts"
                  flat
                  url="http://localhost:4444/upload"
                  accept=".jpg, image/*, .png, .pdf"
                  max-file-size="3072000"
                  max-files="1"
                  class="col-md-3 col-xs-12 col-sm-12"
                  @rejected="onRejected"
                />
              </div>

              <q-stepper-navigation>
                <q-btn @click="step = 5" color="primary" label="Suivant" />
                <q-btn flat @click="step = 3" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 5 : Informations du promoteur -->
            <q-step
              :name="5"
              title="Informations du promoteur / responsable"
              icon="person"
              :done="step > 5"
            >
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.nomResponsable"
                  label="Nom *"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.prenomResponsable"
                  label="Prénom"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                />
                <q-input
                  v-model="form.dateNaissancePromoteur"
                  hint="Au format YYYY-MM-DD"
                  label="Date de naissance du promoteur *"
                  outlined
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
                  :rules="[required]"
                  mask="####-##-##"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateNaissancePromoteur"
                          mask="YYYY-MM-DD"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.lieuNaissancePromoteur"
                  label="Lieu exact de naissance du promoteur *"
                  outlined
                  dense
                  class="col-md-7 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.arrondissementNaissancePromoteur"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  label="Arrondissement de naissance *"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                  class="col-md-4 col-xs-12 col-sm-12"
                />
                <q-select
                  v-model="form.sexePromoteur"
                  :options="['FEMININ', 'MASCULIN']"
                  label="Sexe du promoteur *"
                  outlined
                  dense
                  input-debounce="0"
                  fill-input
                  :rules="[required]"
                  class="col-md-3 col-xs-12 col-sm-12"
                />
                <q-select
                  v-model="form.nationalitePromoteur"
                  :options="pays"
                  option-label="nationalite"
                  label="Nationalité du promoteur *"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPays"
                  :rules="[required]"
                  class="col-md-3 col-xs-12 col-sm-12"
                />
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(6)" color="primary" label="Suivant" />
                <q-btn flat @click="step = 4" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 6 : Coordonnées du promoteur -->
            <q-step :name="6" title="Coordonnées du promoteur / responsable" icon="person">
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.adresse"
                  label="Adresse *"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.boitePostale"
                  label="Boîte postale"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                />
                <q-input
                  v-model="form.telephonePromoteur"
                  label="Téléphone du promoteur *"
                  outlined
                  type="tel"
                  mask="### ### ###"
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.emailPromoteur"
                  label="Email du promoteur *"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  type="email"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.pieceIdentitePromoteur"
                  :options="pieces"
                  option-label="LIBELLE"
                  label="Pièce d'identité du promoteur *"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPieces"
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                />
                <q-input
                  v-model="form.numPieceIdentitePromoteur"
                  label="Numéro de la pièce d'identité du promoteur *"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.dateDelivrancePieceIdentitePromoteur"
                  hint="Au format YYYY-MM-DD"
                  label="Date de délivrance de la pièce d'identité du promoteur *"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  mask="####-##-##"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateDelivrancePieceIdentitePromoteur"
                          mask="YYYY-MM-DD"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-select
                  v-model="form.lieuDelivrancePieceIdentitePromoteur"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  label="Arrondissement de délivrance *"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                />
              </div>

              <q-stepper-navigation>
                <q-btn type="submit" color="primary" label="Soumettre" />
                <q-btn flat @click="step = 4" color="primary" label="Retour" class="q-ml-sm" />
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
import { ref, defineProps, defineEmits, watch } from 'vue'
import { useNotify } from './useNotify.js'
import { arrondissements as rawArrondissements } from '../data/Arrondissements.js'
import { activites as rawActivites } from '../data/Activites.js'
import { centres as rawCentres } from '../data/Centres.js'
import { formeJuridique as rawFormeJuridique } from '../data/FormeJuridique.js'
import { impots as rawImpots } from '../data/Impots.js'
import { pays as rawPays } from '../data/Pays.js'
import { pieces as rawPieces } from '../data/Pieces.js'

defineProps({
  service: Object,
})

const emit = defineEmits(['close'])

const { notifyError, notifySuccess } = useNotify()

const open = ref(true)
const step = ref(1)
const formRef = ref(null)

const arrondissements = ref([...rawArrondissements])
const activites = ref([...rawActivites])
const centres = ref([...rawCentres])
const formeJuridique = ref([...rawFormeJuridique])
const impots = ref([...rawImpots])
const pays = ref([...rawPays])
const pieces = ref([...rawPieces])

const form = ref({
  raisonSociale: '',
  nomCommercial: '',
  sigle: '',
  adresse: '',
  quartier: '',
  email: '',
  telephone: '',
  nomResponsable: '',
  prenomResponsable: '',
  centreImpots: '',
  centreCNPS: '',
  origineImmatriculation: '',
  origineDossier: '',
  formeJuridique: '',
  nombreTravailleurs: '',
  activiteEconomique: '',
  regimeCNPS: '',
  groupeRisque: '',
  arrondissement: '',
  lieuDit: '',
  boitePostale: '',
  numLogement: '',
  autreContact: '',
  dateOuverture: '',
  dateCreation: '',
  dateEmbauche: '',
  numRegistreCommerce: '',
  numIdentifiantUnique: '',
  isSuccursale: false,
  nomCommercialSiege: '',
  raisonSocialeSiege: '',
  matriculeSiege: '',
})

const optionsDn = (date) => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = ('0' + (today.getMonth() + 1)).slice(-2)
  const dd = ('0' + today.getDate()).slice(-2)
  const todayStr = `${yyyy}/${mm}/${dd}`

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

const onRejected = (rejectedEntries) => {
  // Notify plugin needs to be installed
  // https://v2.quasar.dev/quasar-plugins/notify#Installation
  notifyError(
    `Les fichiers suivants n'ont pas passé les contraintes de validation : ${rejectedEntries
      .map((entry) => entry.name)
      .join(', ')}`,
  )
}

const findCentreCNPSByCentreImpots = (selectedCentreImpots) => {
  if (!selectedCentreImpots || !selectedCentreImpots.CODE_CENTRECNPS) return null

  return (
    rawCentres.find((cnps) => cnps.CODE_CENTRE === selectedCentreImpots.CODE_CENTRECNPS) || null
  )
}

watch(
  () => form.value.centreImpots,
  (newValue) => {
    form.value.centreCNPS = findCentreCNPSByCentreImpots(newValue)
  },
)

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
  // Ajouter ici l'appel à l'API si nécessaire
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

const filterActivites = (val, update) => {
  if (val === '') {
    update(() => {
      activites.value = [...rawActivites]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    activites.value = rawActivites.filter((item) =>
      item.LIBELLE_SECT_ACTIVITE.toLowerCase().includes(needle),
    )
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

const filterFormeJuridique = (val, update) => {
  if (val === '') {
    update(() => {
      formeJuridique.value = [...rawFormeJuridique]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    formeJuridique.value = rawFormeJuridique.filter((item) =>
      item.LIBELLE_NATUREJUR.toLowerCase().includes(needle),
    )
  })
}

const filterImpots = (val, update) => {
  if (val === '') {
    update(() => {
      impots.value = [...rawImpots]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    impots.value = rawImpots.filter((item) => item.ABREVIATION.toLowerCase().includes(needle))
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

const closeDialog = () => {
  open.value = false
  emit('close')
}
</script>

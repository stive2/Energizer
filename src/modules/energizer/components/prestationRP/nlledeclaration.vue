<template>
  <div class="q-pa-sm rp-declaration">
    <q-banner v-if="loadError" class="bg-negative text-white q-mb-sm" rounded dense>
      {{ loadError }}
    </q-banner>

    <div class="rp-declaration__hero q-mb-sm">
      <div class="rp-declaration__hero-icon">
        <q-icon name="assignment_add" size="26px" color="white" />
      </div>
      <div>
        <div class="text-h6 text-weight-bold text-primary">Mise à jour des déclarations</div>
        <div class="text-caption text-grey-7">Nouveau dossier RP — AT / MP</div>
      </div>
    </div>

    <q-form ref="formRef" @submit.prevent="submitForm">
      <!-- Identification dossier / employeur -->
      <q-card class="q-mb-sm card-elevated">
        <q-card-section class="card-header card-header--primary q-py-sm">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-icon name="folder_open" size="xs" class="q-mr-xs" />
              <span class="text-body2 text-weight-bold">Dossier et employeur</span>
            </div>
            <q-btn flat dense round icon="restart_alt" color="white" size="sm" @click="resetForm">
              <q-tooltip>Réinitialiser</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
        <q-card-section class="q-py-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-5">
              <q-select
                v-model="selectedDossier"
                :options="dossierOptions"
                label="Numéro Dossier *"
                outlined
                dense
                emit-value
                map-options
                option-label="numdossier"
                option-value="numdossier"
                use-input
                input-debounce="0"
                :loading="loadingCatalog"
                class="field-num-value"
                placeholder="Choisir un dossier MP/AT SVP..."
                @filter="filterDossiers"
                @update:model-value="onDossierSelect"
                color="primary"
                :rules="[(v) => !!v || 'Choisissez un dossier SVP']"
              >
                <template #prepend
                  ><q-icon name="confirmation_number" color="primary" size="xs"
                /></template>
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Aucun dossier</q-item-section></q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-7">
              <q-input
                v-model="form.objet"
                label="Objet"
                outlined
                dense
                readonly
                bg-color="blue-grey-1"
              />
            </div>

            <div class="col-6 col-md-3">
              <q-input
                v-model="form.numassu"
                label="Numéro assuré"
                outlined
                dense
                readonly
                bg-color="blue-grey-1"
                class="field-num-value"
              />
            </div>
            <div class="col-6 col-md-4">
              <q-input
                v-model="form.nom"
                label="Nom assuré"
                outlined
                dense
                readonly
                bg-color="blue-grey-1"
              />
            </div>
            <div class="col-12 col-md-5">
              <q-input
                v-model="form.emploiassure"
                label="Emploi assuré"
                outlined
                dense
                readonly
                bg-color="blue-grey-1"
              />
            </div>

            <div class="col-6 col-md-3">
              <q-input
                v-model="form.datedeces"
                label="Décédé le"
                outlined
                dense
                readonly
                bg-color="blue-grey-1"
              />
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.txipp"
                label="Taux IPP précédent"
                outlined
                dense
                readonly
                bg-color="blue-grey-1"
              />
            </div>

            <div class="col-6 col-md-3">
              <q-input
                v-model="form.numemployeur"
                label="Numéro Employeur *"
                outlined
                dense
                class="field-num-value"
                :rules="[(v) => !!String(v ?? '').trim() || 'Numéro employeur obligatoire']"
                @keyup.enter="lookupEmployeur"
              >
                <template #prepend
                  ><q-icon name="business_center" color="primary" size="xs"
                /></template>
                <template #append>
                  <q-btn
                    flat
                    dense
                    round
                    icon="search"
                    color="primary"
                    :loading="loadingEmployeur"
                    @click="lookupEmployeur"
                  >
                    <q-tooltip>Rechercher (Entrée)</q-tooltip>
                  </q-btn>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.nomemployeur"
                label="Nom employeur *"
                outlined
                dense
                readonly
                bg-color="blue-grey-1"
                :rules="[
                  (v) => !!String(v ?? '').trim() || 'Chargez l\'employeur (Entrée ou recherche)',
                ]"
              />
            </div>

            <div class="col-6 col-md-3">
              <q-input
                v-model="form.datedeclaration"
                label="Date déclaration"
                outlined
                dense
                readonly
                bg-color="blue-grey-1"
              />
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.datedepot"
                label="Date dépôt dossier"
                outlined
                dense
                readonly
                bg-color="blue-grey-1"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="form.observation"
                label="Observation"
                outlined
                dense
                readonly
                bg-color="blue-grey-1"
                type="textarea"
                autogrow
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Informations sur le risque -->
      <q-expansion-item
        v-model="expanded.risque"
        icon="warning_amber"
        label="Informations sur le Risque"
        header-class="expansion-header expansion-header--risque"
        class="q-mb-sm card-elevated expansion-card"
      >
        <q-card-section class="q-pt-none q-pb-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.codeposte"
                :options="posteOptions"
                label="Poste travail *"
                outlined
                dense
                emit-value
                map-options
                @update:model-value="
                  (v) => syncRefLabel('postetravail', 'codeposte', posteOptions, v)
                "
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.coderisque"
                :options="typeRisqueOptions"
                label="Type risque *"
                outlined
                dense
                emit-value
                map-options
                @update:model-value="
                  (v) => syncRefLabel('codetyperisque', 'coderisque', typeRisqueOptions, v)
                "
              />
            </div>

            <div class="col-6 col-md-3">
              <q-input
                v-model="form.datesurvenance"
                label="Date accident *"
                outlined
                dense
                bg-color="yellow-1"
                mask="##/##/####"
                :rules="dateAccidentRules"
              >
                <template #append>
                  <q-icon name="edit_calendar" class="cursor-pointer" color="primary" size="xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="form.datesurvenance"
                        mask="DD/MM/YYYY"
                        today-btn
                        color="primary"
                      >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat dense />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.heuresurvenance"
                label="Heure"
                outlined
                dense
                mask="##:##"
                placeholder="HH:MM"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.lieuaccident"
                label="Lieu accident"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.lieuaccident = toLegacyUppercase(v)
                  }
                "
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.arrondissement"
                :options="arrondissementOptions"
                label="Arrondissement"
                outlined
                dense
                emit-value
                map-options
                clearable
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.quartier"
                label="Quartier"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.quartier = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="form.adresse"
                label="Rue, Avenue, Boulevard"
                outlined
                dense
                type="textarea"
                autogrow
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.adresse = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.causes"
                label="Causes"
                outlined
                dense
                type="textarea"
                autogrow
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.causes = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.consequences"
                label="Conséquences"
                outlined
                dense
                type="textarea"
                autogrow
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.consequences = toLegacyUppercase(v)
                  }
                "
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.codesiegel"
                :options="siegeLesionOptions"
                label="Siège lésion codifié *"
                outlined
                dense
                emit-value
                map-options
                @update:model-value="
                  (v) => syncRefLabel('codesiegelesion', 'codesiegel', siegeLesionOptions, v)
                "
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.siegelesion"
                label="Autres précisions siège lésion"
                outlined
                dense
                type="textarea"
                autogrow
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.siegelesion = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.codenaturel"
                :options="natureLesionOptions"
                label="Nature lésion codifiée *"
                outlined
                dense
                emit-value
                map-options
                @update:model-value="
                  (v) => syncRefLabel('codenatlesion', 'codenaturel', natureLesionOptions, v)
                "
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.naturelesion"
                label="Autres précisions nature lésion"
                outlined
                dense
                type="textarea"
                autogrow
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.naturelesion = toLegacyUppercase(v)
                  }
                "
              />
            </div>

            <div class="col-6 col-md-3">
              <q-input
                v-model.number="form.ancienneteposte"
                type="number"
                label="Ancienneté au poste (années) *"
                outlined
                dense
                min="0"
                max="40"
                :rules="[
                  (v) =>
                    (v !== '' &&
                      v != null &&
                      !Number.isNaN(Number(v)) &&
                      Number(v) >= 0 &&
                      Number(v) <= 40) ||
                    'Entre 0 et 40',
                ]"
              />
            </div>
            <div class="col-12 col-md-5">
              <q-select
                v-model="form.flagformation"
                :options="ouiNonOptions"
                label="Formation à cette activité ? *"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.codeagentmat"
                :options="agentMaterielOptions"
                label="Agent matériel *"
                outlined
                dense
                emit-value
                map-options
                @update:model-value="
                  (v) => syncRefLabel('agentmateriel', 'codeagentmat', agentMaterielOptions, v)
                "
              />
            </div>

            <div class="col-12"><div class="sep q-my-xs">Témoins</div></div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.temoin1"
                label="Témoin (T1)"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.temoin1 = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-12 col-md-8">
              <q-input
                v-model="form.identite1"
                label="Identité T1"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.identite1 = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.temoin2"
                label="Témoin (T2)"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.temoin2 = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-12 col-md-8">
              <q-input
                v-model="form.identite2"
                label="Identité T2"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.identite2 = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.temoin3"
                label="Témoin (T3)"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.temoin3 = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-12 col-md-8">
              <q-input
                v-model="form.identite3"
                label="Identité T3"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.identite3 = toLegacyUppercase(v)
                  }
                "
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.flaghospitalisation"
                :options="ouiNonOptions"
                label="Hospitalisée ? *"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.lieuhospitalisation"
                label="Lieu d'hospitalisation"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.lieuhospitalisation = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.flag"
                :options="ouiNonOptions"
                label="Prise en charge ? *"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.flagarrettravail"
                :options="ouiNonOptions"
                label="Arrêt de travail ? *"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.flagdecesimmediat"
                :options="ouiNonOptions"
                label="Décès immédiat ? *"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
          </div>
        </q-card-section>
      </q-expansion-item>

      <!-- Informations salariales -->
      <q-expansion-item
        v-model="expanded.salarial"
        icon="payments"
        label="Informations salariales"
        header-class="expansion-header expansion-header--salarial"
        class="q-mb-sm card-elevated expansion-card"
      >
        <q-card-section class="q-pt-none q-pb-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.categorie"
                label="Catégorie *"
                outlined
                dense
                :rules="[(v) => !!String(v ?? '').trim() || 'Catégorie obligatoire']"
              />
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.echelon"
                label="Échelon *"
                outlined
                dense
                :rules="[(v) => !!String(v ?? '').trim() || 'Échelon obligatoire']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.secteur"
                :options="secteurOptions"
                label="Secteur activité *"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.zone"
                :options="zoneOptions"
                label="Zone accident *"
                outlined
                dense
                emit-value
                map-options
              />
            </div>

            <div class="col-6 col-md-4">
              <q-input
                v-model.number="form.montant1"
                type="number"
                label="Salaire (n-1)"
                outlined
                dense
              />
            </div>
            <div class="col-6 col-md-4">
              <q-input
                v-model.number="form.montant2"
                type="number"
                label="Salaire (n-2)"
                outlined
                dense
              />
            </div>
            <div class="col-6 col-md-4">
              <q-input
                v-model.number="form.montant3"
                type="number"
                label="Salaire (n-3)"
                outlined
                dense
              />
            </div>
            <div class="col-6 col-md-4">
              <q-input
                v-model.number="form.salrecons"
                type="number"
                label="Salaire reconstitué"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-5">
              <q-select
                v-model="form.flagretarrerage"
                :options="ouiNonOptions"
                label="Retenir les arriérages ? *"
                outlined
                dense
                emit-value
                map-options
                @update:model-value="onRetenueFlagChange"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="form.montantretenue"
                type="number"
                label="Montant retenue"
                outlined
                dense
                :disable="form.flagretarrerage === 'NON'"
              />
            </div>
          </div>
        </q-card-section>
      </q-expansion-item>

      <!-- Risque précédent -->
      <q-expansion-item
        v-model="expanded.precedent"
        icon="history"
        label="Informations sur le risque précédent"
        header-class="expansion-header expansion-header--precedent"
        class="q-mb-sm card-elevated expansion-card"
      >
        <q-card-section class="q-pt-none q-pb-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-6 col-md-3">
              <q-input
                v-model.number="form.ippold"
                type="number"
                label="Taux IPP précédent *"
                outlined
                dense
                :rules="[(v) => (v !== '' && v != null) || 'Taux IPP précédent obligatoire']"
              />
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model.number="form.rmmold"
                type="number"
                label="Ancienne RMM *"
                outlined
                dense
                :rules="[(v) => (v !== '' && v != null) || 'Ancienne RMM obligatoire']"
              />
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model.number="form.renteold"
                type="number"
                label="Rente mensuelle"
                outlined
                dense
              />
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model.number="form.allocationold"
                type="number"
                label="Allocation d'incapacité *"
                outlined
                dense
                :rules="[(v) => (v !== '' && v != null) || 'Allocation obligatoire']"
              />
            </div>
          </div>
        </q-card-section>
      </q-expansion-item>

      <!-- Tiers responsable -->
      <q-expansion-item
        v-model="expanded.tiers"
        icon="gavel"
        label="Informations sur le tiers responsable"
        header-class="expansion-header expansion-header--tiers"
        class="q-mb-sm card-elevated expansion-card"
      >
        <q-card-section class="q-pt-none q-pb-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.nomtiers"
                label="Nom ou raison sociale"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.nomtiers = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.orgassureur"
                label="Organisme assureur"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.orgassureur = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-6 col-md-4">
              <q-input
                v-model="form.numpolice"
                label="Numéro police"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.numpolice = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-6 col-md-4">
              <q-input
                v-model="form.immatriculation"
                label="Immatriculation"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.immatriculation = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-12 col-md-8">
              <q-input
                v-model="form.adresseassureur"
                label="Adresse assureur"
                outlined
                dense
                class="input-uppercase"
                @update:model-value="
                  (v) => {
                    form.adresseassureur = toLegacyUppercase(v)
                  }
                "
              />
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model="form.boitepostale" label="Boîte postale" outlined dense />
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model="form.telephone" label="Téléphone" outlined dense />
            </div>
          </div>
        </q-card-section>
      </q-expansion-item>

      <div class="row justify-center q-mt-md q-gutter-sm">
        <q-btn
          type="submit"
          color="primary"
          label="Valider"
          icon="check_circle"
          unelevated
          class="action-btn"
          :loading="submitting"
        />
        <q-btn
          type="button"
          color="grey-6"
          label="Annuler"
          icon="refresh"
          unelevated
          class="action-btn"
          @click="resetForm"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useLiquidationRpStore } from 'src/modules/energizer/stores/liquidationRpStore.js'
import { toLegacyUppercase } from 'src/modules/energizer/utils/liquidationLegacyUtils.js'
import {
  RP_OUI_NON_OPTIONS,
  RP_SECTEUR_OPTIONS,
  RP_ZONE_OPTIONS,
  applyRpRetenueArrierageRules,
  compareLegacyFrDates,
  isLegacyDateNotFuture,
  mapRpDossierRowToForm,
  rpDeclarationResultMessage,
  toRpSelectOptions,
  validateRpDeclarationForm,
} from 'src/modules/energizer/utils/liquidationRpDeclarationLegacy.js'

defineOptions({ name: 'NlleDeclaration' })

const $q = useQuasar()
const route = useRoute()
const rpStore = useLiquidationRpStore()

const formRef = ref(null)
const submitting = ref(false)
const loadingCatalog = ref(false)
const loadingEmployeur = ref(false)
const loadError = ref('')
const selectedDossier = ref(null)

const expanded = reactive({
  risque: false,
  salarial: false,
  precedent: false,
  tiers: false,
})

const ouiNonOptions = RP_OUI_NON_OPTIONS
const secteurOptions = RP_SECTEUR_OPTIONS
const zoneOptions = RP_ZONE_OPTIONS

const allDossiers = ref([])
const dossierOptions = ref([])
const arrondissementOptions = ref([])
const typeRisqueOptions = ref([])
const siegeLesionOptions = ref([])
const natureLesionOptions = ref([])
const agentMaterielOptions = ref([])
const posteOptions = ref([])

const FORM_INITIAL = {
  numdossier: '',
  objet: '',
  numassu: '',
  nom: '',
  emploiassure: '',
  datedeces: '',
  txipp: '',
  numemployeur: '',
  nomemployeur: '',
  datedeclaration: '',
  datedepot: '',
  observation: '',
  postetravail: '',
  codeposte: '',
  codetyperisque: '',
  coderisque: '',
  datesurvenance: '',
  heuresurvenance: '',
  lieuaccident: '',
  arrondissement: '',
  quartier: '',
  adresse: '',
  causes: '',
  consequences: '',
  codesiegelesion: '',
  codesiegel: '',
  siegelesion: '',
  codenatlesion: '',
  codenaturel: '',
  naturelesion: '',
  ancienneteposte: 0,
  flagformation: '',
  agentmateriel: '',
  codeagentmat: '',
  temoin1: '',
  identite1: '',
  temoin2: '',
  identite2: '',
  temoin3: '',
  identite3: '',
  flaghospitalisation: '',
  lieuhospitalisation: '',
  flag: '',
  flagarrettravail: '',
  flagdecesimmediat: '',
  categorie: '',
  echelon: '',
  secteur: '',
  zone: '',
  periode1: '',
  montant1: 0,
  periode2: '',
  montant2: 0,
  periode3: '',
  montant3: 0,
  salrecons: 0,
  flagretarrerage: '',
  montantretenue: 0,
  ippold: 0,
  rmmold: 0,
  renteold: 0,
  allocationold: 0,
  nomtiers: '',
  orgassureur: '',
  numpolice: '',
  immatriculation: '',
  adresseassureur: '',
  boitepostale: '',
  telephone: '',
}

const form = reactive({ ...FORM_INITIAL })

const dateAccidentRules = computed(() => [
  (v) => !!String(v ?? '').trim() || 'Date accident obligatoire',
  (v) => !v || isLegacyDateNotFuture(v) || 'Date accident invalide ou future',
  (v) => {
    if (!v || !form.datedeclaration) return true
    const cmp = compareLegacyFrDates(v, form.datedeclaration)
    return cmp == null || cmp <= 0 || 'La date accident doit être ≤ à la date de déclaration'
  },
])

onMounted(async () => {
  showLegacyResultBanner()
  loadingCatalog.value = true
  loadError.value = ''
  try {
    const [dossiers, refs] = await Promise.all([
      rpStore.loadRpDossiers(),
      rpStore.loadRpReferentials(),
    ])
    allDossiers.value = Array.isArray(dossiers) ? dossiers : []
    dossierOptions.value = [...allDossiers.value]
    arrondissementOptions.value = toRpSelectOptions(refs?.arrondissements)
    typeRisqueOptions.value = toRpSelectOptions(refs?.typeRisques)
    siegeLesionOptions.value = toRpSelectOptions(refs?.siegeLesions)
    natureLesionOptions.value = toRpSelectOptions(refs?.natureLesions)
    agentMaterielOptions.value = toRpSelectOptions(refs?.agentMateriels)
    posteOptions.value = toRpSelectOptions(refs?.postesTravail)
  } catch (e) {
    loadError.value = e?.message || 'Impossible de charger les données depuis le serveur.'
  } finally {
    loadingCatalog.value = false
  }
})

function showLegacyResultBanner() {
  const code = String(route.query.resultat ?? route.query.error ?? '').trim()
  const message = rpDeclarationResultMessage(code)
  if (!message) return
  $q.notify({
    type: code === 'ok' ? 'positive' : 'negative',
    message,
    position: 'top',
    timeout: code === 'ok' ? 2500 : 4000,
  })
}

function filterDossiers(val, update) {
  update(() => {
    if (!val) {
      dossierOptions.value = allDossiers.value
      return
    }
    const needle = val.toLowerCase()
    dossierOptions.value = allDossiers.value.filter(
      (d) =>
        d.numdossier?.toLowerCase().includes(needle) ||
        d.nom?.toLowerCase().includes(needle) ||
        d.objet?.toLowerCase().includes(needle),
    )
  })
}

function syncRefLabel(labelField, codeField, options, value) {
  form[codeField] = value ?? ''
  const opt = (options || []).find((o) => o.value === value)
  form[labelField] = opt?.label ?? value ?? ''
}

function resolveSelectCodesFromRow() {
  syncRefLabel('postetravail', 'codeposte', posteOptions.value, form.codeposte)
  syncRefLabel('codetyperisque', 'coderisque', typeRisqueOptions.value, form.coderisque)
  syncRefLabel('codesiegelesion', 'codesiegel', siegeLesionOptions.value, form.codesiegel)
  syncRefLabel('codenatlesion', 'codenaturel', natureLesionOptions.value, form.codenaturel)
  syncRefLabel('agentmateriel', 'codeagentmat', agentMaterielOptions.value, form.codeagentmat)
}

function onDossierSelect(numdossier) {
  const row = allDossiers.value.find((x) => x.numdossier === numdossier)
  if (!row) return
  mapRpDossierRowToForm(form, row)
  form.numdossier = numdossier
  resolveSelectCodesFromRow()
  $q.notify({
    type: 'positive',
    message: `Dossier ${numdossier} chargé`,
    position: 'top',
    timeout: 1500,
  })
}

async function lookupEmployeur() {
  const mat = String(form.numemployeur ?? '').trim()
  if (!mat) return
  loadingEmployeur.value = true
  try {
    const row = await rpStore.fetchEmployeur(mat)
    form.nomemployeur = row?.nomemployeur || row?.raison_sociale || ''
    if (!form.nomemployeur) {
      throw new Error('Employeur introuvable')
    }
  } catch {
    $q.notify({
      type: 'warning',
      message:
        'Appuyez sur Entrée une fois de plus — vérifions que ce matricule employeur est correct',
      position: 'top',
    })
  } finally {
    loadingEmployeur.value = false
  }
}

function onRetenueFlagChange(val) {
  form.flagretarrerage = val
  applyRpRetenueArrierageRules(form)
}

function validateMetier() {
  const errors = validateRpDeclarationForm(form)
  if (errors.length) {
    $q.notify({ type: 'negative', message: errors[0], position: 'top' })
    if (errors.some((e) => /risque|accident|lésion|formation|hospital|arrêt|décès/i.test(e))) {
      expanded.risque = true
    }
    if (errors.some((e) => /catégorie|échelon|secteur|zone|arriérage/i.test(e))) {
      expanded.salarial = true
    }
    if (errors.some((e) => /IPP|RMM|allocation/i.test(e))) {
      expanded.precedent = true
    }
    return false
  }
  return true
}

async function submitForm() {
  const ok = await formRef.value?.validate()
  if (!ok) return
  if (!validateMetier()) return

  submitting.value = true
  try {
    const result = await rpStore.submitDeclaration(form)
    $q.notify({
      type: 'positive',
      message: result?.message || 'Modification du dossier accomplie avec succès !',
      position: 'top',
      icon: 'check_circle',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e?.message || 'Modification du dossier non accomplie',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  selectedDossier.value = null
  dossierOptions.value = allDossiers.value
  formRef.value?.resetValidation()
}
</script>

<style scoped>
.rp-declaration {
  max-width: 1100px;
  margin: 0 auto;
}

.rp-declaration__hero {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(21, 101, 192, 0.08), rgba(21, 101, 192, 0.02));
  border: 1px solid rgba(25, 118, 210, 0.12);
}

.rp-declaration__hero-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1565c0, #42a5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-elevated {
  border-radius: 12px;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  color: white;
}
.card-header--primary {
  background: linear-gradient(90deg, #1565c0, #1976d2);
}

.expansion-card {
  border: 1px solid rgba(25, 118, 210, 0.1);
  border-radius: 12px;
  background: #fff;
}

.expansion-card :deep(.expansion-header) {
  font-weight: 700;
  color: #1565c0;
  background: #f5f9ff;
  border-radius: 12px 12px 0 0;
}

.expansion-card :deep(.q-item) {
  min-height: 44px;
}

.sep {
  font-size: 0.72rem;
  font-weight: 700;
  color: #1976d2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-left: 3px solid #1976d2;
  padding: 2px 0 2px 8px;
  background: linear-gradient(to right, rgba(25, 118, 210, 0.06), transparent);
  border-radius: 0 4px 4px 0;
}

.action-btn {
  border-radius: 10px;
  min-width: 160px;
  font-weight: 600;
}

.input-uppercase :deep(.q-field__native),
.input-uppercase :deep(textarea) {
  text-transform: uppercase;
}

.field-num-value :deep(.q-field__native),
.field-num-value :deep(.q-field__input) {
  font-size: 0.8rem;
  letter-spacing: 0;
}
</style>

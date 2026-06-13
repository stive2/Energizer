<template>
  <div class="q-pa-sm nlle-declaration">
    <div class="text-center q-mb-sm">
      <div class="text-h6 text-primary text-weight-bold">
        <q-icon name="assignment" class="q-mr-xs" />
        Mise à jour des Déclarations RP
      </div>
      <div class="text-caption text-grey-6">Accidents du Travail / Maladies Professionnelles</div>
    </div>

    <q-banner v-if="loadError" class="bg-negative text-white q-mb-sm" rounded dense>
      {{ loadError }}
    </q-banner>

    <q-form ref="formRef" @submit.prevent="submitForm">
      <q-stepper
        v-model="step"
        ref="stepperRef"
        color="primary"
        done-color="positive"
        error-color="negative"
        animated
        flat
        bordered
        header-nav
        :vertical="$q.screen.lt.md"
        class="nlle-stepper"
        @update:model-value="onStepChange"
      >
        <!-- ÉTAPE 1 — Identification -->
        <q-step :name="1" title="Dossier" icon="folder_open" :done="step > 1" :error="stepErrors[1]" :disable="!isStepAllowed(1)">
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-12 col-md-4">
              <q-select
                v-model="selectedDossier"
                :options="dossierOptions"
                label="N° Dossier *"
                outlined dense emit-value map-options
                option-label="numdossier"
                option-value="numdossier"
                use-input input-debounce="0"
                :loading="loadingCatalog"
                @filter="filterDossiers"
                @update:model-value="onDossierSelect"
                color="primary"
              />
            </div>
            <div class="col-6 col-md-3"><q-input v-model="form.objet" label="Objet" outlined dense readonly bg-color="blue-grey-1" /></div>
            <div class="col-6 col-md-2"><q-input v-model="form.datedeclaration" label="Date Déclaration" outlined dense readonly bg-color="blue-grey-1" /></div>
            <div class="col-6 col-md-3"><q-input v-model="form.datedepot" label="Date Dépôt Dossier" outlined dense readonly bg-color="blue-grey-1" /></div>
          </div>
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-6 col-md-2"><q-input v-model="form.numassu" label="N° Assuré" outlined dense readonly bg-color="blue-grey-1" /></div>
            <div class="col-6 col-md-3"><q-input v-model="form.nom" label="Nom Assuré" outlined dense readonly bg-color="blue-grey-1" /></div>
            <div class="col-6 col-md-3"><q-input v-model="form.emploiassure" label="Emploi Assuré" outlined dense readonly bg-color="blue-grey-1" /></div>
            <div class="col-6 col-md-2"><q-input v-model="form.datedeces" label="Décédé le" outlined dense readonly bg-color="blue-grey-1" /></div>
            <div class="col-6 col-md-2"><q-input v-model="form.txipp" label="Taux IPP Précédent" outlined dense readonly bg-color="blue-grey-1" /></div>
          </div>
          <div class="row q-col-gutter-xs">
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.numemployeur"
                label="Numéro Employeur *"
                outlined dense bg-color="yellow-1"
                @update:model-value="v => upper('numemployeur', v)"
                @keydown.enter.prevent="fetchEmployeur"
                @blur="onEmployeurFieldActivate"
                :loading="loadingEmployeur"
              >
                <template v-slot:append>
                  <q-btn flat round icon="search" size="xs" color="primary" @click="fetchEmployeur" />
                </template>
              </q-input>
            </div>
            <div class="col-6 col-md-5"><q-input v-model="form.nomemployeur" label="Nom Employeur" outlined dense readonly bg-color="blue-grey-1" /></div>
            <div class="col-12 col-md-4"><q-input v-model="form.observation" label="Observation" outlined dense readonly bg-color="blue-grey-1" /></div>
          </div>
        </q-step>

        <!-- ÉTAPE 2 — Accident & lieu -->
        <q-step :name="2" title="Accident" icon="warning_amber" :done="step > 2" :error="stepErrors[2]" :disable="!isStepAllowed(2)">
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-12 col-md-4">
              <q-select v-model="form.postetravail" :options="posteTravailOptions" label="Poste de Travail *"
                outlined dense emit-value map-options option-label="label" option-value="value"
                @update:model-value="v => { form.codeposte = v }" color="primary" />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.codetyperisque" :options="typeRisqueOptions" label="Type de Risque *"
                outlined dense emit-value map-options option-label="label" option-value="value"
                @update:model-value="v => { form.coderisque = v }" color="primary" />
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model="form.datesurvenance" label="Date Accident *" outlined dense bg-color="yellow-1"
                :rules="[ruleDateAccident]">
                <template v-slot:append>
                  <q-icon name="edit_calendar" class="cursor-pointer" color="primary" size="xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.datesurvenance" mask="DD/MM/YYYY" today-btn color="primary">
                        <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model="form.heuresurvenance" label="Heure Accident" type="time" outlined dense bg-color="yellow-1" />
            </div>
          </div>
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-6 col-md-3"><q-input v-model="form.lieuaccident" label="Lieu Accident" outlined dense bg-color="yellow-1" @update:model-value="v => upper('lieuaccident', v)" /></div>
            <div class="col-6 col-md-3">
              <q-select v-model="form.arrondissement" :options="arrondissementOptions" label="Arrondissement"
                outlined dense emit-value map-options option-label="label" option-value="value" color="primary" />
            </div>
            <div class="col-6 col-md-3"><q-input v-model="form.quartier" label="Quartier" outlined dense bg-color="yellow-1" @update:model-value="v => upper('quartier', v)" /></div>
            <div class="col-12 col-md-3"><q-input v-model="form.adresse" label="Rue / Avenue / Boulevard" type="textarea" rows="2" outlined dense bg-color="yellow-1" @update:model-value="v => upper('adresse', v)" /></div>
          </div>
          <div class="row q-col-gutter-xs">
            <div class="col-12 col-md-6"><q-input v-model="form.causes" label="Causes" type="textarea" rows="2" outlined dense bg-color="yellow-1" @update:model-value="v => upper('causes', v)" /></div>
            <div class="col-12 col-md-6"><q-input v-model="form.consequences" label="Conséquences" type="textarea" rows="2" outlined dense bg-color="yellow-1" @update:model-value="v => upper('consequences', v)" /></div>
          </div>
        </q-step>

        <!-- ÉTAPE 3 — Lésions & victime -->
        <q-step :name="3" title="Lésions" icon="healing" :done="step > 3" :error="stepErrors[3]" :disable="!isStepAllowed(3)">
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-12 col-md-3">
              <q-select v-model="form.codesiegelesion" :options="siegeLesionOptions" label="Siège Lésion Codifié *"
                outlined dense emit-value map-options option-label="label" option-value="value"
                @update:model-value="v => { form.codesiegel = v }" color="primary" />
            </div>
            <div class="col-12 col-md-3"><q-input v-model="form.siegelesion" label="Précisions siège lésion" type="textarea" rows="2" outlined dense bg-color="yellow-1" @update:model-value="v => upper('siegelesion', v)" /></div>
            <div class="col-12 col-md-3">
              <q-select v-model="form.codenatlesion" :options="natureLesionOptions" label="Nature Lésion Codifiée *"
                outlined dense emit-value map-options option-label="label" option-value="value"
                @update:model-value="v => { form.codenaturel = v }" color="primary" />
            </div>
            <div class="col-12 col-md-3"><q-input v-model="form.naturelesion" label="Précisions nature lésion" type="textarea" rows="2" outlined dense bg-color="yellow-1" @update:model-value="v => upper('naturelesion', v)" /></div>
          </div>
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-6 col-md-2">
              <q-input v-model.number="form.ancienneteposte" label="Ancienneté (années) *" type="number" min="0" max="40" outlined dense />
            </div>
            <div class="col-6 col-md-2"><q-select v-model="form.flagformation" :options="ouiNonOptions" label="Formée ? *" outlined dense emit-value map-options color="primary" /></div>
            <div class="col-6 col-md-2"><q-select v-model="form.flaghospitalisation" :options="ouiNonOptions" label="Hospitalisée ? *" outlined dense emit-value map-options color="primary" /></div>
            <div class="col-6 col-md-3"><q-input v-model="form.lieuhospitalisation" label="Lieu d'Hospitalisation" outlined dense bg-color="yellow-1" :disable="form.flaghospitalisation !== 'OUI'" @update:model-value="v => upper('lieuhospitalisation', v)" /></div>
            <div class="col-6 col-md-3"><q-select v-model="form.agentmateriel" :options="agentMaterielOptions" label="Agent Matériel *" outlined dense emit-value map-options option-label="label" option-value="value" @update:model-value="v => { form.codeagentmat = v }" color="primary" /></div>
          </div>
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-6 col-md-2"><q-select v-model="form.flag" :options="ouiNonOptions" label="Prise en charge ? *" outlined dense emit-value map-options color="primary" /></div>
            <div class="col-6 col-md-2"><q-select v-model="form.flagarrettravail" :options="ouiNonOptions" label="Arrêt travail ? *" outlined dense emit-value map-options color="primary" /></div>
            <div class="col-6 col-md-2"><q-select v-model="form.flagdecesimmediat" :options="ouiNonOptions" label="Décédé immédiatement ? *" outlined dense emit-value map-options color="primary" /></div>
          </div>
          <div class="sep q-mb-xs">Témoins</div>
          <div class="row q-col-gutter-xs">
            <div class="col-6 col-md-3"><q-input v-model="form.temoin1" label="Témoin 1" outlined dense bg-color="yellow-1" @update:model-value="v => upper('temoin1', v)" /></div>
            <div class="col-6 col-md-3"><q-input v-model="form.identite1" label="Identité T1" outlined dense bg-color="yellow-1" @update:model-value="v => upper('identite1', v)" /></div>
            <div class="col-6 col-md-3"><q-input v-model="form.temoin2" label="Témoin 2" outlined dense bg-color="yellow-1" @update:model-value="v => upper('temoin2', v)" /></div>
            <div class="col-6 col-md-3"><q-input v-model="form.identite2" label="Identité T2" outlined dense bg-color="yellow-1" @update:model-value="v => upper('identite2', v)" /></div>
            <div class="col-6 col-md-3"><q-input v-model="form.temoin3" label="Témoin 3" outlined dense bg-color="yellow-1" @update:model-value="v => upper('temoin3', v)" /></div>
            <div class="col-6 col-md-3"><q-input v-model="form.identite3" label="Identité T3" outlined dense bg-color="yellow-1" @update:model-value="v => upper('identite3', v)" /></div>
          </div>
        </q-step>

        <!-- ÉTAPE 4 — Salaires -->
        <q-step :name="4" title="Salaires" icon="account_balance_wallet" :done="step > 4" :error="stepErrors[4]" :disable="!isStepAllowed(4)">
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-6 col-md-2"><q-input v-model="form.categorie" label="Catégorie *" outlined dense bg-color="yellow-1" @update:model-value="v => upper('categorie', v)" /></div>
            <div class="col-6 col-md-2"><q-input v-model="form.echelon" label="Échelon *" outlined dense bg-color="yellow-1" @update:model-value="v => upper('echelon', v)" /></div>
            <div class="col-6 col-md-4"><q-select v-model="form.secteur" :options="secteurOptions" label="Secteur *" outlined dense emit-value map-options color="primary" /></div>
            <div class="col-6 col-md-2"><q-select v-model="form.zone" :options="zoneOptions" label="Zone *" outlined dense emit-value map-options color="primary" /></div>
            <div class="col-6 col-md-2"><q-input v-model.number="form.salrecons" label="Salaire Reconstitué" type="number" min="0" outlined dense bg-color="yellow-1" /></div>
          </div>
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-6 col-md-2"><q-input v-model="form.periode1" label="Période (n-1)" outlined dense bg-color="yellow-1" placeholder="MM/AAAA" @update:model-value="v => upper('periode1', v)" /></div>
            <div class="col-6 col-md-2"><q-input v-model.number="form.montant1" label="Salaire (n-1)" type="number" min="0" outlined dense bg-color="yellow-1" /></div>
            <div class="col-6 col-md-2"><q-input v-model="form.periode2" label="Période (n-2)" outlined dense bg-color="yellow-1" placeholder="MM/AAAA" @update:model-value="v => upper('periode2', v)" /></div>
            <div class="col-6 col-md-2"><q-input v-model.number="form.montant2" label="Salaire (n-2)" type="number" min="0" outlined dense bg-color="yellow-1" /></div>
            <div class="col-6 col-md-2"><q-input v-model="form.periode3" label="Période (n-3)" outlined dense bg-color="yellow-1" placeholder="MM/AAAA" @update:model-value="v => upper('periode3', v)" /></div>
            <div class="col-6 col-md-2"><q-input v-model.number="form.montant3" label="Salaire (n-3)" type="number" min="0" outlined dense bg-color="yellow-1" /></div>
          </div>
          <div class="row q-col-gutter-xs">
            <div class="col-6 col-md-4">
              <q-select v-model="form.flagretarrerage" :options="ouiNonOptions" label="Retenir arriérages ? *"
                outlined dense emit-value map-options color="primary" @update:model-value="onFlagRetarreageChange" />
            </div>
            <div class="col-6 col-md-4">
              <q-input v-model.number="form.montantretenue" label="Montant Retenue" type="number" min="0"
                outlined dense bg-color="yellow-1" :disable="form.flagretarrerage !== 'OUI'" />
            </div>
          </div>
        </q-step>

        <!-- ÉTAPE 5 — Risque précédent -->
        <q-step :name="5" title="Risque préc." icon="history" :done="step > 5" :error="stepErrors[5]" :disable="!isStepAllowed(5)">
          <div class="row q-col-gutter-xs">
            <div class="col-6 col-md-3"><q-input v-model="form.ippold" label="Taux IPP Précédent (%) *" type="number" min="0" max="100" outlined dense bg-color="yellow-1" /></div>
            <div class="col-6 col-md-3"><q-input v-model="form.rmmold" label="Ancienne RMM *" type="number" min="0" outlined dense bg-color="yellow-1" /></div>
            <div class="col-6 col-md-3"><q-input v-model="form.renteold" label="Rente Mensuelle" type="number" min="0" outlined dense bg-color="yellow-1" /></div>
            <div class="col-6 col-md-3"><q-input v-model="form.allocationold" label="Allocation Incapacité *" type="number" min="0" outlined dense bg-color="yellow-1" /></div>
          </div>
        </q-step>

        <!-- ÉTAPE 6 — Tiers -->
        <q-step :name="6" title="Tiers" icon="gavel" :done="step > 6" :error="stepErrors[6]" :disable="!isStepAllowed(6)">
          <div class="row q-col-gutter-xs">
            <div class="col-12 col-md-4"><q-input v-model="form.nomtiers" label="Nom / Raison Sociale" outlined dense bg-color="yellow-1" @update:model-value="v => upper('nomtiers', v)" /></div>
            <div class="col-12 col-md-4"><q-input v-model="form.orgassureur" label="Organisme Assureur" outlined dense bg-color="yellow-1" @update:model-value="v => upper('orgassureur', v)" /></div>
            <div class="col-6 col-md-2"><q-input v-model="form.numpolice" label="Numéro Police" outlined dense bg-color="yellow-1" @update:model-value="v => upper('numpolice', v)" /></div>
            <div class="col-6 col-md-2"><q-input v-model="form.immatriculation" label="Immatriculation" outlined dense bg-color="yellow-1" @update:model-value="v => upper('immatriculation', v)" /></div>
            <div class="col-12 col-md-4"><q-input v-model="form.adresseassureur" label="Adresse Assureur" outlined dense bg-color="yellow-1" @update:model-value="v => upper('adresseassureur', v)" /></div>
            <div class="col-6 col-md-2"><q-input v-model="form.boitepostale" label="Boîte Postale" outlined dense bg-color="yellow-1" @update:model-value="v => upper('boitepostale', v)" /></div>
            <div class="col-6 col-md-2"><q-input v-model="form.telephone" label="Téléphone" type="tel" prefix="+237" maxlength="9" outlined dense bg-color="yellow-1" :rules="telephoneRules" /></div>
          </div>
        </q-step>

        <!-- ÉTAPE 7 — Récapitulatif -->
        <q-step :name="7" title="Récapitulatif" icon="fact_check" :error="stepErrors[7]" :disable="!isStepAllowed(7)">
          <div class="text-center q-mb-md">
            <q-icon name="fact_check" size="36px" color="positive" />
            <div class="text-subtitle1 text-weight-bold q-mt-xs">Vérifiez les informations avant validation</div>
            <q-linear-progress :value="1" size="6px" color="positive" class="q-mt-sm rounded-borders" />
          </div>
          <div class="row q-col-gutter-md">
            <div v-for="block in recapBlocks" :key="block.step" class="col-12 col-lg-6">
              <q-card flat bordered class="recap-card">
                <q-card-section class="recap-card__header row items-center q-py-sm">
                  <q-icon :name="block.icon" size="sm" class="q-mr-sm" />
                  <div class="col text-weight-bold">{{ block.title }}</div>
                  <q-btn flat round dense icon="edit" size="xs" color="primary" @click="step = block.step">
                    <q-tooltip>Modifier</q-tooltip>
                  </q-btn>
                </q-card-section>
                <q-separator />
                <q-list dense separator>
                  <q-item v-for="item in block.items" :key="item.label" class="q-py-xs">
                    <q-item-section>
                      <q-item-label caption>{{ item.label }}</q-item-label>
                      <q-item-label>{{ item.value || '—' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </div>
          </div>
        </q-step>
      </q-stepper>

      <div class="row justify-center q-gutter-sm q-mt-md nlle-step-footer">
        <q-btn v-if="step > 1" flat color="primary" icon="chevron_left" label="Précédent" no-caps @click="goPrevStep" />
        <q-btn v-if="step < 7" color="primary" icon-right="chevron_right" label="Suivant" unelevated no-caps @click="goNextStep" />
        <q-btn v-if="step === 7" type="submit" color="positive" icon="save" label="Valider" unelevated no-caps :loading="submitting" />
        <q-btn flat color="grey-7" icon="restart_alt" label="Réinitialiser" no-caps @click="resetForm" />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useLiquidationRpStore } from 'src/modules/energizer/stores/liquidationRpStore.js'
import {
  validateRpDeclarationStep,
  validateRpDeclarationForm,
  mapRpDossierRowToForm,
  applyRpRetenueArrierageRules,
  toRpSelectOptions,
  resolveRpSelectValue,
  RP_OUI_NON_OPTIONS,
  RP_SECTEUR_OPTIONS,
  RP_ZONE_OPTIONS,
  isLegacyDateNotFuture,
  compareLegacyFrDates,
} from 'src/modules/energizer/utils/liquidationRpDeclarationLegacy.js'
import {
  buildLegacyTelephoneRules,
  setLegacyUppercaseText,
} from 'src/modules/energizer/utils/energizerFormInputUtils.js'

defineOptions({ name: 'NlleDeclaration' })

const { t } = useI18n()
const $q = useQuasar()
const telephoneRules = buildLegacyTelephoneRules(t)
const rpStore = useLiquidationRpStore()

const formRef = ref(null)
const stepperRef = ref(null)
const step = ref(1)
const maxStep = ref(1)
const stepErrors = ref({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false })

const submitting = ref(false)
const loadingCatalog = ref(false)
const loadingEmployeur = ref(false)
const loadError = ref('')
const selectedDossier = ref(null)

const allDossiers = ref([])
const dossierOptions = ref([])
const posteTravailOptions = ref([])
const typeRisqueOptions = ref([])
const siegeLesionOptions = ref([])
const natureLesionOptions = ref([])
const agentMaterielOptions = ref([])
const arrondissementOptions = ref([])

const ouiNonOptions = RP_OUI_NON_OPTIONS
const secteurOptions = RP_SECTEUR_OPTIONS
const zoneOptions = RP_ZONE_OPTIONS

const FORM_INITIAL = {
  numdossier: '', objet: '', numassu: '', nom: '', emploiassure: '',
  datedeclaration: '', datedepot: '', datedeces: '', txipp: '',
  numemployeur: '', nomemployeur: '', observation: '',
  postetravail: '', codeposte: '', codetyperisque: '', coderisque: '',
  datesurvenance: '', heuresurvenance: '',
  lieuaccident: '', arrondissement: '', quartier: '', adresse: '',
  causes: '', consequences: '',
  codesiegelesion: '', codesiegel: '', siegelesion: '',
  codenatlesion: '', codenaturel: '', naturelesion: '',
  ancienneteposte: 0,
  flagformation: '', agentmateriel: '', codeagentmat: '',
  temoin1: '', identite1: '', temoin2: '', identite2: '', temoin3: '', identite3: '',
  flaghospitalisation: '', lieuhospitalisation: '',
  flag: '', flagarrettravail: '', flagdecesimmediat: '',
  categorie: '', echelon: '', secteur: '', zone: '',
  periode1: '', montant1: 0, periode2: '', montant2: 0, periode3: '', montant3: 0,
  salrecons: 0, flagretarrerage: '', montantretenue: 0,
  ippold: 0, rmmold: 0, renteold: 0, allocationold: 0,
  nomtiers: '', orgassureur: '', numpolice: '', immatriculation: '',
  adresseassureur: '', boitepostale: '', telephone: '',
}

const form = reactive({ ...FORM_INITIAL })

function upper(field, val) {
  setLegacyUppercaseText(form, field, val)
}

const labelFor = (options, value) => {
  if (!value) return ''
  const opt = options.find(o => o.value === value || o.code === value)
  return opt?.label ?? opt?.libelle ?? String(value)
}

const recapBlocks = computed(() => [
  {
    step: 1, title: 'Identification', icon: 'folder_open',
    items: [
      { label: 'N° Dossier', value: form.numdossier },
      { label: 'Assuré', value: form.nom },
      { label: 'Employeur', value: form.nomemployeur },
      { label: 'N° Employeur', value: form.numemployeur },
    ],
  },
  {
    step: 2, title: 'Accident & lieu', icon: 'warning_amber',
    items: [
      { label: 'Poste', value: labelFor(posteTravailOptions.value, form.postetravail) },
      { label: 'Type risque', value: labelFor(typeRisqueOptions.value, form.codetyperisque) },
      { label: 'Date accident', value: form.datesurvenance },
      { label: 'Lieu', value: form.lieuaccident },
    ],
  },
  {
    step: 3, title: 'Lésions & victime', icon: 'healing',
    items: [
      { label: 'Siège lésion', value: labelFor(siegeLesionOptions.value, form.codesiegelesion) },
      { label: 'Nature lésion', value: labelFor(natureLesionOptions.value, form.codenatlesion) },
      { label: 'Ancienneté', value: form.ancienneteposte },
      { label: 'Hospitalisation', value: form.flaghospitalisation },
    ],
  },
  {
    step: 4, title: 'Salaires', icon: 'account_balance_wallet',
    items: [
      { label: 'Catégorie / Échelon', value: `${form.categorie} / ${form.echelon}` },
      { label: 'Secteur', value: labelFor(secteurOptions, form.secteur) },
      { label: 'Salaire reconstitué', value: form.salrecons },
      { label: 'Arriérages', value: form.flagretarrerage },
    ],
  },
  {
    step: 5, title: 'Risque précédent', icon: 'history',
    items: [
      { label: 'IPP précédent', value: form.ippold },
      { label: 'RMM', value: form.rmmold },
      { label: 'Allocation', value: form.allocationold },
    ],
  },
  {
    step: 6, title: 'Tiers responsable', icon: 'gavel',
    items: [
      { label: 'Nom / Raison sociale', value: form.nomtiers },
      { label: 'Assureur', value: form.orgassureur },
      { label: 'Téléphone', value: form.telephone },
    ],
  },
])

onMounted(async () => {
  loadingCatalog.value = true
  loadError.value = ''
  try {
    const [dossiers, refs] = await Promise.all([
      rpStore.loadRpDossiers(),
      rpStore.loadRpReferentials(),
    ])
    allDossiers.value = Array.isArray(dossiers) ? dossiers : []
    dossierOptions.value = [...allDossiers.value]
    posteTravailOptions.value = toRpSelectOptions(refs?.postesTravail)
    typeRisqueOptions.value = toRpSelectOptions(refs?.typeRisques)
    siegeLesionOptions.value = toRpSelectOptions(refs?.siegeLesions)
    natureLesionOptions.value = toRpSelectOptions(refs?.natureLesions)
    agentMaterielOptions.value = toRpSelectOptions(refs?.agentMateriels)
    arrondissementOptions.value = toRpSelectOptions(refs?.arrondissements)
  } catch (e) {
    loadError.value = e?.message || 'Impossible de charger les données depuis le serveur.'
  } finally {
    loadingCatalog.value = false
  }
})

function ruleDateAccident(val) {
  if (!val) return 'Date accident obligatoire'
  if (!isLegacyDateNotFuture(val)) return 'Date invalide ou future'
  if (form.datedeclaration) {
    const cmp = compareLegacyFrDates(val, form.datedeclaration)
    if (cmp != null && cmp > 0) return 'Doit être antérieure ou égale à la date de déclaration'
  }
  return true
}

function filterDossiers(val, update) {
  update(() => {
    if (!val) dossierOptions.value = allDossiers.value
    else {
      const needle = val.toLowerCase()
      dossierOptions.value = allDossiers.value.filter(
        d => d.numdossier?.toLowerCase().includes(needle) || d.nom?.toLowerCase().includes(needle),
      )
    }
  })
}

function resolveFormSelectFields() {
  form.arrondissement = resolveRpSelectValue(arrondissementOptions.value, form.arrondissement)
  form.postetravail = resolveRpSelectValue(posteTravailOptions.value, form.postetravail)
  form.codetyperisque = resolveRpSelectValue(typeRisqueOptions.value, form.codetyperisque)
  form.codesiegelesion = resolveRpSelectValue(siegeLesionOptions.value, form.codesiegelesion)
  form.codenatlesion = resolveRpSelectValue(natureLesionOptions.value, form.codenatlesion)
  form.agentmateriel = resolveRpSelectValue(agentMaterielOptions.value, form.agentmateriel)
  form.codeposte = form.postetravail || form.codeposte
  form.coderisque = form.codetyperisque || form.coderisque
  form.codesiegel = form.codesiegelesion || form.codesiegel
  form.codenaturel = form.codenatlesion || form.codenaturel
  form.codeagentmat = form.agentmateriel || form.codeagentmat
}

function onDossierSelect(numdossier) {
  const row = allDossiers.value.find(x => x.numdossier === numdossier)
  if (!row) return
  mapRpDossierRowToForm(form, row)
  resolveFormSelectFields()
  $q.notify({ type: 'positive', message: `Dossier ${numdossier} chargé`, position: 'top', timeout: 1500 })
}

function onEmployeurFieldActivate() {
  if (form.numemployeur?.trim()) fetchEmployeur()
}

async function fetchEmployeur() {
  const mat = (form.numemployeur || '').trim()
  if (!mat) {
    form.nomemployeur = ''
    $q.notify({ type: 'warning', message: 'Saisissez un numéro employeur', position: 'top' })
    return
  }
  form.numemployeur = mat
  loadingEmployeur.value = true
  try {
    const data = await rpStore.fetchEmployeur(mat)
    form.nomemployeur = data?.nomemployeur ?? data?.raison_sociale ?? ''
    if (!form.nomemployeur) throw new Error('Employeur introuvable')
    $q.notify({ type: 'positive', message: `Employeur : ${form.nomemployeur}`, position: 'top', timeout: 1500 })
  } catch {
    form.nomemployeur = ''
    $q.notify({ type: 'negative', message: 'Appuyer sur ENTREE une fois de plus !!! Vérifions que ce matricule employeur est correct', position: 'top' })
  } finally {
    loadingEmployeur.value = false
  }
}

function onFlagRetarreageChange() {
  applyRpRetenueArrierageRules(form)
}

function isStepAllowed(n) {
  return n <= maxStep.value
}

function onStepChange(n) {
  if (!isStepAllowed(n)) step.value = maxStep.value
}

function showStepErrors(currentStep, errors) {
  stepErrors.value[currentStep] = true
  $q.notify({ type: 'negative', message: errors[0], position: 'top' })
}

function validateCurrentStep(currentStep) {
  const errors = validateRpDeclarationStep(form, currentStep)
  if (errors.length) {
    showStepErrors(currentStep, errors)
    return false
  }
  stepErrors.value[currentStep] = false
  return true
}

function goPrevStep() {
  if (step.value > 1) step.value -= 1
}

function goNextStep() {
  const current = step.value
  if (!validateCurrentStep(current)) return
  const next = current + 1
  if (next > maxStep.value) maxStep.value = next
  step.value = next
}

async function submitForm() {
  const errors = validateRpDeclarationForm(form)
  if (errors.length) {
    stepErrors.value[7] = true
    $q.notify({ type: 'negative', message: errors[0], position: 'top' })
    return
  }
  stepErrors.value[7] = false
  submitting.value = true
  try {
    const result = await rpStore.submitDeclaration(form)
    $q.notify({
      type: 'positive',
      message: result?.message || 'Modification du dossier accomplie avec succès !',
      position: 'top',
      icon: 'check_circle',
    })
    resetForm()
  } catch (e) {
    $q.notify({ type: 'negative', message: e?.message || 'Modification du dossier non accomplie', position: 'top' })
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  selectedDossier.value = null
  step.value = 1
  maxStep.value = 1
  stepErrors.value = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false }
  formRef.value?.resetValidation()
}
</script>

<style scoped>
.nlle-declaration { max-width: 1400px; margin: 0 auto; }
.nlle-stepper { border-radius: 12px; }
.nlle-step-footer { padding-bottom: 16px; }
.recap-card { border-radius: 10px; }
.recap-card__header { background: rgba(25, 118, 210, 0.08); color: #1565c0; }
.sep {
  font-size: 0.72rem; font-weight: 700; color: #1976d2;
  text-transform: uppercase; letter-spacing: 0.5px;
  border-left: 3px solid #1976d2; padding: 2px 0 2px 8px;
}
.nlle-stepper :deep(.q-stepper__header) { border-radius: 12px 12px 0 0; }
</style>

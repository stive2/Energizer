<template>
  <div class="q-pa-sm nlle-note-frais">

    <!-- En-tête -->
    <div class="text-center q-mb-sm">
      <div class="text-h6 text-primary text-weight-bold">
        <q-icon name="receipt_long" class="q-mr-xs" />
        Nouvelle Note de Frais — AT/MP
      </div>
      <div class="text-caption text-grey-6">
        Saisie des frais médicaux engagés dans le cadre d'un dossier Accident du Travail / Maladie Professionnelle
      </div>
    </div>

    <q-form ref="formRef" @submit.prevent="submitForm">

      <!-- ═══════════════════════════════════════════════════════
           SECTION 1 : IDENTIFICATION DU DOSSIER
      ═══════════════════════════════════════════════════════ -->
      <q-card class="q-mb-sm card-elevated">
        <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-icon name="folder_open" size="xs" class="q-mr-xs" />
              <span class="text-body2 text-weight-bold">Identification du Dossier</span>
            </div>
            <q-btn flat dense round icon="restart_alt" color="white" size="sm" @click="resetForm">
              <q-tooltip>Réinitialiser</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
        <q-card-section class="q-py-sm">
          <div class="row q-col-gutter-xs q-mb-xs">

            <!-- N° Dossier -->
            <div class="col-12 col-md-3">
              <q-select
                v-model="selectedDossier"
                :options="dossierOptions"
                label="N° Dossier *"
                outlined dense emit-value map-options
                option-label="numdossier"
                option-value="numdossier"
                use-input input-debounce="0"
                @filter="filterDossiers"
                @update:model-value="onDossierSelect"
                color="primary"
                :rules="[v => !!v || 'Choisissez un dossier SVP']"
              >
                <template v-slot:prepend>
                  <q-icon name="confirmation_number" color="primary" size="xs" />
                </template>
                <template v-slot:no-option>
                  <q-item><q-item-section class="text-grey">Aucun dossier</q-item-section></q-item>
                </template>
              </q-select>
            </div>

            <!-- N° Assuré (readonly, depuis dossier) -->
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.numassu"
                label="N° Assuré"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
              >
                <template v-slot:prepend><q-icon name="badge" color="primary" size="xs" /></template>
              </q-input>
            </div>

            <!-- N° Note (readonly, depuis dossier) -->
            <div class="col-6 col-md-2">
              <q-input
                v-model="form.numnote"
                label="N° Note"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
              >
                <template v-slot:prepend><q-icon name="tag" color="primary" size="xs" /></template>
              </q-input>
            </div>

            <!-- Mat. Employeur -->
            <div class="col-6 col-md-2">
              <q-input
                v-model="form.numemployeur"
                label="Mat. Employeur *"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
                :rules="[v => !!v || 'Matricule employeur obligatoire']"
              />
            </div>

            <!-- Raison Sociale -->
            <div class="col-6 col-md-4">
              <q-input
                v-model="form.nomemployeur"
                label="Raison Sociale *"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
                :rules="[v => !!v || 'Raison sociale obligatoire']"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ═══════════════════════════════════════════════════════
           SECTION 2 : DÉTAILS DE LA NOTE DE FRAIS
      ═══════════════════════════════════════════════════════ -->
      <q-card class="q-mb-sm card-elevated">
        <q-card-section class="bg-teal-7 text-white card-header-rounded q-py-sm">
          <div class="row items-center">
            <q-icon name="receipt" size="xs" class="q-mr-xs" />
            <span class="text-body2 text-weight-bold">Détails de la Note de Frais</span>
          </div>
        </q-card-section>
        <q-card-section class="q-py-sm">
          <div class="row q-col-gutter-xs q-mb-xs">

            <!-- Objet (nature note de frais) -->
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.objet"
                :options="objetOptions"
                label="Objet *"
                outlined dense emit-value map-options
                option-label="type"
                option-value="id"
                color="teal"
                :rules="[v => !!v || 'Sélectionnez l\'objet de la note SVP']"
              >
                <template v-slot:prepend><q-icon name="category" color="teal-7" size="xs" /></template>
              </q-select>
            </div>

            <!-- Date Note -->
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.datedemande"
                label="Date Note *"
                outlined dense
                bg-color="yellow-1"
                :rules="[v => !!v || 'Date de la note obligatoire']"
              >
                <template v-slot:prepend><q-icon name="event" color="amber-8" size="xs" /></template>
                <template v-slot:append>
                  <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.datedemande" mask="DD/MM/YYYY" today-btn color="teal">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="teal" flat dense />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>

          <!-- Fournisseur -->
          <div class="sep q-mb-xs q-mt-xs">
            <q-icon name="store" size="xs" class="q-mr-xs" />Fournisseur / Prestataire
          </div>
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.fournisseur"
                label="Fournisseur"
                outlined dense
                bg-color="yellow-1"
              >
                <template v-slot:prepend><q-icon name="business" color="amber-8" size="xs" /></template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.adresse"
                label="Adresse"
                outlined dense
                bg-color="yellow-1"
              >
                <template v-slot:prepend><q-icon name="location_on" color="amber-8" size="xs" /></template>
              </q-input>
            </div>
            <div class="col-6 col-md-2">
              <q-input
                v-model="form.telephone"
                label="Téléphone"
                outlined dense
                bg-color="yellow-1"
              >
                <template v-slot:prepend><q-icon name="phone" color="amber-8" size="xs" /></template>
              </q-input>
            </div>
          </div>

          <!-- Prise en charge & Tiers bénéficiaire -->
          <div class="sep q-mb-xs q-mt-xs">
            <q-icon name="people" size="xs" class="q-mr-xs" />Prise en Charge
          </div>
          <div class="row q-col-gutter-xs items-start">

            <!-- Qui prend en charge -->
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.tiersbeneficiaire"
                :options="typesBenefOptions"
                label="La victime est prise en charge par *"
                outlined dense emit-value map-options
                color="teal"
                :rules="[v => !!v || 'Sélectionnez le type de prise en charge']"
                @update:model-value="onTiersBenefChange"
              >
                <template v-slot:prepend><q-icon name="person_search" color="teal-7" size="xs" /></template>
              </q-select>
            </div>

            <!-- Tiers bénéficiaire (activé seulement si TIERS) -->
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.flag"
                :options="tiersBenefOptions"
                label="Tiers Bénéficiaire"
                outlined dense emit-value map-options
                option-label="nombene"
                option-value="numbene"
                color="teal"
                :disable="form.tiersbeneficiaire !== 'TIERS'"
                :class="{ 'opacity-disabled': form.tiersbeneficiaire !== 'TIERS' }"
                :rules="form.tiersbeneficiaire === 'TIERS'
                  ? [v => !!v || 'Sélectionnez le tiers bénéficiaire']
                  : []"
              >
                <template v-slot:prepend><q-icon name="person" color="teal-7" size="xs" /></template>
                <template v-slot:no-option>
                  <q-item><q-item-section class="text-grey">Aucun bénéficiaire</q-item-section></q-item>
                </template>
              </q-select>
            </div>

            <!-- Info si TIERS non sélectionné -->
            <div v-if="form.tiersbeneficiaire && form.tiersbeneficiaire !== 'TIERS'" class="col-12 col-md-4">
              <q-banner dense rounded class="bg-teal-1 text-teal-9">
                <template v-slot:avatar><q-icon name="info" color="teal" size="sm" /></template>
                <span class="text-caption">
                  Prise en charge par <b>{{ form.tiersbeneficiaire }}</b> —
                  aucun tiers bénéficiaire à sélectionner.
                </span>
              </q-banner>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Boutons -->
      <div class="row justify-center q-mt-md q-gutter-sm">
        <q-btn
          type="submit"
          color="teal-7"
          label="Enregistrer"
          icon="save"
          unelevated
          style="border-radius:10px; min-width:180px"
          :loading="submitting"
        />
        <q-btn
          type="reset"
          color="grey-6"
          label="Annuler"
          icon="refresh"
          unelevated
          style="border-radius:10px; min-width:180px"
          @click="resetForm"
        />
      </div>

    </q-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationRpStore } from 'src/stores/energizer/liquidationRpStore.js'

defineOptions({ name: 'NlleNoteDeFrags' })

const $q = useQuasar()
const rpStore = useLiquidationRpStore()

// ─── État ────────────────────────────────────────────────────────
const formRef         = ref(null)
const submitting      = ref(false)
const selectedDossier = ref(null)

// ─── Options fixes ────────────────────────────────────────────────
const typesBenefOptions = [
  { label: 'ASSURÉ',   value: 'ASSURE'   },
  { label: 'EMPLOYEUR', value: 'EMPLOYEUR' },
  { label: 'TIERS',    value: 'TIERS'    },
]

// ─── Données de test ─────────────────────────────────────────────

// Dossiers (nouvellenote.jsp)
const MOCK_DOSSIERS = [
  {
    numdossier:   'R2026-001',
    objet:        'AT',
    numnote:      'NF-2026-001',
    numemployeur: '1-20-97-001234',
    nomemployeur: 'BATCOM SARL',
    numassu:      '5-20-97-123456-78',
  },
  {
    numdossier:   'R2026-002',
    objet:        'MP',
    numnote:      'NF-2026-002',
    numemployeur: '1-20-97-005678',
    nomemployeur: 'CHIMIE BASSA SARL',
    numassu:      '5-20-97-654321-12',
  },
  {
    numdossier:   'R2026-003',
    objet:        'AT',
    numnote:      'NF-2026-003',
    numemployeur: '1-20-97-009012',
    nomemployeur: 'CABINET CONSEIL SUD',
    numassu:      '5-20-97-987654-55',
  },
]

// Natures de notes de frais (naturenotefrais.jsp)
const MOCK_OBJETS = [
  { id: '1', type: 'Consultations médicales' },
  { id: '2', type: 'Médicaments et pharmacie' },
  { id: '3', type: 'Analyses et examens' },
  { id: '4', type: 'Hospitalisation' },
  { id: '5', type: 'Transport sanitaire' },
  { id: '6', type: 'Appareillage / Prothèse' },
  { id: '7', type: 'Rééducation fonctionnelle' },
]

// Tiers bénéficiaires par assuré (lestiersbeneficiaires.jsp)
const MOCK_TIERS = {
  '5-20-97-123456-78': [
    { numdossier: 'R2026-001', numassu: '5-20-97-123456-78', numbene: 'B01', nombene: 'KAMGA Paul (Enfant)' },
    { numdossier: 'R2026-001', numassu: '5-20-97-123456-78', numbene: 'B02', nombene: 'KAMGA Marie (Épouse)' },
  ],
  '5-20-97-654321-12': [
    { numdossier: 'R2026-002', numassu: '5-20-97-654321-12', numbene: 'B01', nombene: 'NKOA Marc (Enfant)' },
  ],
  '5-20-97-987654-55': [],
}

const allDossiers    = ref([...MOCK_DOSSIERS])
const dossierOptions = ref([...MOCK_DOSSIERS])
const objetOptions   = ref([...MOCK_OBJETS])
const tiersBenefOptions = ref([])

onMounted(async () => {
  try {
    const { dossiers, objets } = await rpStore.loadNotesFraisMeta()
    if (dossiers?.length) {
      allDossiers.value = dossiers
      dossierOptions.value = dossiers
    }
    if (objets?.length) {
      objetOptions.value = objets.map((o) => ({
        id: o.id ?? o.code,
        type: o.type ?? o.libelle ?? o.libelle_type,
      }))
    }
  } catch { /* garde MOCK */ }
})

// ─── Formulaire ──────────────────────────────────────────────────
const FORM_INITIAL = {
  numdossier:        '',
  numassu:           '',
  numnote:           '',
  numemployeur:      '',
  nomemployeur:      '',
  objet:             '',
  fournisseur:       '',
  adresse:           '',
  telephone:         '',
  tiersbeneficiaire: '',
  flag:              '',
  datedemande:       '',
}

const form = reactive({ ...FORM_INITIAL })

// ─── Filtre autocomplete ─────────────────────────────────────────
function filterDossiers(val, update) {
  update(() => {
    if (!val) {
      dossierOptions.value = allDossiers.value
    } else {
      const needle = val.toLowerCase()
      dossierOptions.value = allDossiers.value.filter(
        d => d.numdossier.toLowerCase().includes(needle)
          || d.nomemployeur.toLowerCase().includes(needle)
      )
    }
  })
}

// ─── Chargement dossier (équivalent select listener ExtJS) ───────
// Remplit numnote, numassu, numemployeur, nomemployeur
// + charge les tiers bénéficiaires via Ajax (simulé)
async function onDossierSelect(numdossier) {
  const d = allDossiers.value.find(x => x.numdossier === numdossier)
  if (!d) return

  form.numdossier   = d.numdossier
  form.numnote      = d.numnote
  form.numassu      = d.numassu
  form.numemployeur = d.numemployeur
  form.nomemployeur = d.nomemployeur
  form.flag         = ''
  form.tiersbeneficiaire = ''

  try {
    const tiers = await rpStore.loadTiersBeneficiaires(d.numassu)
    tiersBenefOptions.value = tiers?.length ? tiers : (MOCK_TIERS[d.numassu] ?? [])
  } catch {
    tiersBenefOptions.value = MOCK_TIERS[d.numassu] ?? []
  }

  $q.notify({
    type: 'positive',
    message: `Dossier ${numdossier} chargé — ${tiersBenefOptions.value.length} tiers bénéficiaire(s)`,
    position: 'top', timeout: 1500,
  })
}

// ─── Logique tiersbeneficiaire (enable/disable flag combo) ───────
// Si TIERS → activer combo flag (tiers bénéficiaire)
// Sinon → désactiver et vider
function onTiersBenefChange(val) {
  if (val !== 'TIERS') {
    form.flag = ''
  }
}

// ─── Soumission (action = NouvelleNote) ──────────────────────────
async function submitForm() {
  const ok = await formRef.value?.validate()
  if (!ok) return

  submitting.value = true
  try {
    await rpStore.submitNoteFrais({ ...form })
    $q.notify({
      type: 'positive',
      message: 'Note de frais enregistrée avec succès !',
      position: 'top', icon: 'check_circle',
    })
    resetForm()
  } catch {
    $q.notify({
      type: 'negative',
      message: "Erreur lors de l'enregistrement de la note de frais",
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

// ─── Réinitialisation ────────────────────────────────────────────
function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  selectedDossier.value   = null
  tiersBenefOptions.value = []
  dossierOptions.value    = allDossiers.value
  formRef.value?.resetValidation()
}
</script>

<style scoped>
.nlle-note-frais {
  max-width: 1100px;
  margin: 0 auto;
}

.card-elevated {
  border-radius: 12px;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.08);
}

.card-header-rounded {
  border-radius: 12px 12px 0 0;
}

.sep {
  font-size: 0.72rem;
  font-weight: 700;
  color: #00796b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-left: 3px solid #00796b;
  padding: 2px 0 2px 8px;
  background: linear-gradient(to right, rgba(0, 121, 107, 0.06), transparent);
  border-radius: 0 4px 4px 0;
}

.opacity-disabled {
  opacity: 0.5;
}
</style>

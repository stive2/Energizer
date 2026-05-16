<template>
  <div class="q-pa-sm new-certificat-deces">

    <!-- En-tête -->
    <div class="text-center q-mb-sm">
      <div class="text-h6 text-primary text-weight-bold">
        <q-icon name="article" class="q-mr-xs" />
        Ajout du Certificat Médical de Décès et de Genre de Mort
      </div>
      <div class="text-caption text-grey-6">CD — Dossier Accident du Travail / Maladie Professionnelle</div>
    </div>

    <!-- Règle métier -->
    <q-banner class="bg-red-1 text-red-9 q-mb-sm" rounded dense>
      <template v-slot:avatar><q-icon name="warning" color="red-7" size="sm" /></template>
      <span class="text-caption">
        Le <b>Certificat de Décès (CD)</b> est <b>unique</b> par dossier AT/MP.
        La date de décès doit être antérieure ou égale à la date du certificat.
      </span>
    </q-banner>

    <q-form ref="formRef" @submit.prevent="submitForm">

      <!-- ═══════════════════════════════════════════════════════
           SECTION 1 : IDENTIFICATION
      ═══════════════════════════════════════════════════════ -->
      <q-card class="q-mb-sm card-elevated">
        <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-icon name="folder_open" size="xs" class="q-mr-xs" />
              <span class="text-body2 text-weight-bold">Identification du Dossier</span>
            </div>
            <div class="row items-center q-gutter-xs">
              <!-- Badge type fixe -->
              <q-chip color="red-7" text-color="white" icon="article" dense size="sm">
                CD — Certificat de Décès et Genre de Mort
              </q-chip>
              <q-btn flat dense round icon="restart_alt" color="white" size="sm" @click="resetForm">
                <q-tooltip>Réinitialiser</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-py-sm">

          <div class="row q-col-gutter-xs q-mb-xs">
            <!-- Sélection dossier -->
            <div class="col-12 col-md-4">
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
                :rules="[v => !!v || 'Choisissez un dossier MP/AT SVP']"
              >
                <template v-slot:prepend>
                  <q-icon name="confirmation_number" color="primary" size="xs" />
                </template>
                <template v-slot:no-option>
                  <q-item><q-item-section class="text-grey">Aucun dossier</q-item-section></q-item>
                </template>
              </q-select>
            </div>

            <!-- Date Accident (readonly) -->
            <div class="col-6 col-md-2">
              <q-input
                v-model="form.dateaccident"
                label="Date Accident"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
              >
                <template v-slot:prepend><q-icon name="event_busy" color="primary" size="xs" /></template>
              </q-input>
            </div>

            <!-- Date Certificat (saisie, ≥ dateaccident) -->
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.datecertificat"
                label="Date Certificat *"
                outlined dense
                bg-color="yellow-1"
                :rules="[
                  v => !!v || 'Date certificat obligatoire',
                  v => !form.dateaccident || compareDates(v, form.dateaccident) >= 0
                       || 'La date du certificat doit être ≥ à la date de l\'accident'
                ]"
              >
                <template v-slot:append>
                  <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.datecertificat" mask="DD/MM/YYYY" today-btn color="primary">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat dense />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- N° Certificat -->
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.numcertificat"
                label="N° Certificat"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
              >
                <template v-slot:prepend><q-icon name="tag" color="primary" size="xs" /></template>
              </q-input>
            </div>
          </div>

          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-6 col-md-3">
              <q-input v-model="form.numassure" label="N° Assuré" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>
            <div class="col-6 col-md-4">
              <q-input v-model="form.nomassure" label="Nom Assuré" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
            </div>
          </div>

          <!-- Praticien -->
          <div class="row q-col-gutter-xs q-mb-xs">
            <div class="col-6 col-md-4">
              <q-input
                v-model="form.nommedecin"
                label="Nom du Médecin *"
                outlined dense
                bg-color="yellow-1"
                :rules="[v => !!v || 'Nom du médecin obligatoire']"
              >
                <template v-slot:prepend><q-icon name="local_hospital" color="amber-8" size="xs" /></template>
              </q-input>
            </div>
            <div class="col-6 col-md-4">
              <q-input
                v-model="form.structure"
                label="Hôpital / Structure *"
                outlined dense
                bg-color="yellow-1"
                :rules="[v => !!v || 'Hôpital obligatoire']"
              >
                <template v-slot:prepend><q-icon name="domain" color="amber-8" size="xs" /></template>
              </q-input>
            </div>
          </div>

          <!-- Lésions (readonly) -->
          <div class="row q-col-gutter-xs">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.naturelesion"
                label="Nature de la Lésion"
                type="textarea" rows="2"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.siegelesion"
                label="Siège de la Lésion"
                type="textarea" rows="2"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ═══════════════════════════════════════════════════════
           SECTION 2 : INFORMATIONS SUR LE DÉCÈS (membre2)
      ═══════════════════════════════════════════════════════ -->
      <q-expansion-item
        v-model="sections.deces"
        icon="person_off"
        label="Informations sur le Décès"
        header-class="section-header-deces text-weight-bold"
        class="q-mb-sm card-elevated"
        expand-icon-class="text-red-7"
        default-opened
      >
        <q-card>
          <q-card-section class="q-py-sm">
            <div class="row q-col-gutter-xs items-start">

              <!-- Date de décès (≤ datecertificat) -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.datedeces"
                  label="Date de Décès"
                  outlined dense
                  bg-color="yellow-1"
                  :rules="[
                    v => !v || !form.datecertificat
                         || compareDates(v, form.datecertificat) <= 0
                         || 'La date de décès doit être ≤ à la date du certificat'
                  ]"
                  hint="Doit être antérieure ou égale à la date du certificat"
                >
                  <template v-slot:prepend><q-icon name="event" color="red-7" size="xs" /></template>
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datedeces" mask="DD/MM/YYYY" today-btn color="red">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="red" flat dense />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <!-- Observations -->
              <div class="col-12 col-md-8">
                <q-input
                  v-model="form.observation"
                  label="Observations / Genre de Mort"
                  type="textarea"
                  rows="3"
                  outlined dense
                  bg-color="yellow-1"
                  hint="Précisez le genre de mort et toute observation pertinente"
                />
              </div>
            </div>

            <!-- Info CD unique -->
            <q-banner dense rounded class="bg-red-1 text-red-9 q-mt-sm" v-if="form.numassure">
              <template v-slot:avatar><q-icon name="info" color="red-7" size="sm" /></template>
              <span class="text-caption">
                Ce certificat (CD) est <b>unique</b> par dossier.
                Il ne peut être créé qu'<b>une seule fois</b>.
              </span>
            </q-banner>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- Statut du dossier -->
      <div v-if="form.numassure" class="row q-gutter-xs q-mb-sm">
        <q-chip
          :color="form.flagcmi === 'OUI' ? 'positive' : 'grey-4'"
          :text-color="form.flagcmi === 'OUI' ? 'white' : 'grey-7'"
          icon="check_circle" dense size="sm"
        >
          CI {{ form.flagcmi === 'OUI' ? 'existant' : 'non créé' }}
        </q-chip>
        <q-chip
          :color="form.flagcmf === 'OUI' ? 'orange-7' : 'grey-4'"
          :text-color="form.flagcmf === 'OUI' ? 'white' : 'grey-7'"
          icon="task_alt" dense size="sm"
        >
          CF {{ form.flagcmf === 'OUI' ? 'créé' : 'non créé' }}
        </q-chip>
        <q-chip
          :color="form.flagcd === 'OUI' ? 'negative' : 'grey-4'"
          :text-color="form.flagcd === 'OUI' ? 'white' : 'grey-7'"
          icon="block" dense size="sm"
        >
          CD {{ form.flagcd === 'OUI' ? 'existant — unique!' : 'non créé' }}
        </q-chip>
      </div>

      <!-- Boutons -->
      <div class="row justify-center q-mt-md q-gutter-sm">
        <q-btn
          type="submit"
          color="red-7"
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

defineOptions({ name: 'NewCertificatDeces' })

const $q = useQuasar()
const rpStore = useLiquidationRpStore()

// ─── État ────────────────────────────────────────────────────────
const formRef         = ref(null)
const submitting      = ref(false)
const selectedDossier = ref(null)

// ─── Sections ────────────────────────────────────────────────────
const sections = reactive({ deces: true })

// ─── Données de test (même store que newcertificat.vue) ──────────
const MOCK_DOSSIERS = [
  {
    numdossier:    'R2026-001',
    numassu:       '5-20-97-123456-78',
    nom:           'KAMGA Jean-Pierre',
    slesion:       'Membre supérieur droit',
    nlesion:       'Fracture du radius',
    numcertificat: 'CERT-2026-001',
    dateaccident:  '10/03/2026',
    dateeffet:     '10/03/2026',
    numordre:      '1',
    flag:          'OUI',
    flagcmi:       'OUI',
    flagcmf:       'NON',
    flagcd:        'NON',   // CD pas encore créé
  },
  {
    numdossier:    'R2026-002',
    numassu:       '5-20-97-654321-12',
    nom:           'NKOA Sylvie',
    slesion:       'Tronc — Poumons',
    nlesion:       'Intoxication pulmonaire',
    numcertificat: 'CERT-2026-002',
    dateaccident:  '15/04/2026',
    dateeffet:     '15/04/2026',
    numordre:      '2',
    flag:          'OUI',
    flagcmi:       'OUI',
    flagcmf:       'OUI',
    flagcd:        'NON',
  },
]

const allDossiers    = ref([...MOCK_DOSSIERS])
const dossierOptions = ref([...MOCK_DOSSIERS])

onMounted(async () => {
  try {
    const list = await rpStore.loadRpDossiers()
    if (list?.length) {
      allDossiers.value = list
      dossierOptions.value = list
    }
  } catch { /* garde MOCK */ }
})

// ─── Formulaire ──────────────────────────────────────────────────
const FORM_INITIAL = {
  numdossier:    '',
  numassure:     '',
  nomassure:     '',
  dateaccident:  '',
  datecertificat:'',
  numcertificat: '',
  numordre:      '',
  flag:          '',
  flagcmi:       '',
  flagcmf:       '',
  flagcd:        '',
  dateeffet:     '',
  // Praticien
  nommedecin:    '',
  structure:     '',
  // Lésions (readonly)
  naturelesion:  '',
  siegelesion:   '',
  // Informations décès
  datedeces:     '',
  observation:   '',
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
          || d.nom.toLowerCase().includes(needle)
      )
    }
  })
}

// ─── Chargement dossier (équivalent select listener ExtJS) ───────
function onDossierSelect(numdossier) {
  const d = allDossiers.value.find(x => x.numdossier === numdossier)
  if (!d) return

  form.numdossier    = d.numdossier
  form.numassure     = d.numassu
  form.nomassure     = d.nom
  form.siegelesion   = d.slesion
  form.naturelesion  = d.nlesion
  form.numcertificat = d.numcertificat
  form.numordre      = d.numordre
  form.flag          = d.flag
  form.flagcmi       = d.flagcmi
  form.flagcmf       = d.flagcmf
  form.flagcd        = d.flagcd ?? 'NON'
  form.dateaccident  = d.dateaccident
  form.dateeffet     = d.dateeffet

  // Dossier déjà clôturé (FI)
  if (d.flagcmf === 'OUI' && d.flagcd === 'OUI') {
    $q.notify({
      type: 'negative',
      message: 'Échec — Ajout des certificats médicaux clôturé pour ce dossier',
      position: 'top',
    })
    return
  }

  // CD déjà existant (CD)
  if (d.flagcd === 'OUI') {
    $q.notify({
      type: 'negative',
      message: 'Échec — Le certificat médical de décès est unique !',
      position: 'top',
    })
    return
  }

  $q.notify({
    type: 'positive',
    message: `Dossier ${numdossier} chargé`,
    position: 'top', timeout: 1500,
  })
}

// ─── Comparaison de dates DD/MM/YYYY ─────────────────────────────
// Retourne : 1 si d1 > d2 | 0 si égales | -1 si d1 < d2
function compareDates(d1Str, d2Str) {
  if (!d1Str || !d2Str || d1Str.length < 10 || d2Str.length < 10) return 0
  const parse = s => new Date(
    `${s.substring(6,10)}-${s.substring(3,5)}-${s.substring(0,2)}`
  )
  const diff = parse(d1Str).getTime() - parse(d2Str).getTime()
  return diff === 0 ? 0 : diff / Math.abs(diff)
}

// ─── Validation métier ───────────────────────────────────────────
function validateMetier() {
  if (!form.numassure) {
    $q.notify({ type: 'negative', message: 'Choisissez un dossier MP/AT SVP', position: 'top' })
    return false
  }
  // CD unique
  if (form.flagcd === 'OUI') {
    $q.notify({ type: 'negative', message: 'Échec — Le certificat médical de décès est unique !', position: 'top' })
    return false
  }
  // Dossier clôturé
  if (form.flagcmf === 'OUI' && form.flagcd === 'OUI') {
    $q.notify({ type: 'negative', message: 'Échec — Ajout des certificats médicaux clôturé', position: 'top' })
    return false
  }
  // Cohérence dates : datedeces ≤ datecertificat
  if (form.datedeces && form.datecertificat) {
    if (compareDates(form.datedeces, form.datecertificat) > 0) {
      $q.notify({
        type: 'negative',
        message: 'La date de décès doit être antérieure ou égale à la date du certificat',
        position: 'top',
      })
      return false
    }
  }
  return true
}

// ─── Soumission (action = certificatdeces) ───────────────────────
async function submitForm() {
  const ok = await formRef.value?.validate()
  if (!ok) return
  if (!validateMetier()) return

  submitting.value = true
  try {
    await rpStore.submitCertificatDeces({ ...form })
    $q.notify({
      type: 'positive',
      message: 'Ajout du certificat de décès accompli avec succès !',
      position: 'top', icon: 'check_circle',
    })
    resetForm()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Ajout du certificat non accompli',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

// ─── Réinitialisation ────────────────────────────────────────────
function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  selectedDossier.value  = null
  sections.deces         = true
  dossierOptions.value   = allDossiers.value
  formRef.value?.resetValidation()
}
</script>

<style scoped>
.new-certificat-deces {
  max-width: 1200px;
  margin: 0 auto;
}

.card-elevated {
  border-radius: 12px;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.08);
}

.card-header-rounded {
  border-radius: 12px 12px 0 0;
}

.section-header-deces {
  font-size: 0.88rem;
  font-weight: 700;
  color: #b71c1c;
  border-radius: 12px;
}
</style>

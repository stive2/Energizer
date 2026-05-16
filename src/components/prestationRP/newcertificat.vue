<template>
  <div class="q-pa-sm new-certificat">

    <!-- En-tête -->
    <div class="text-center q-mb-sm">
      <div class="text-h6 text-primary text-weight-bold">
        <q-icon name="medical_information" class="q-mr-xs" />
        Ajout de Certificats Médicaux
      </div>
      <div class="text-caption text-grey-6">
        Certificat Initial · Prolongation · Final — AT/MP
      </div>
    </div>

    <!-- Règle métier -->
    <q-banner class="bg-blue-1 text-primary q-mb-sm" rounded dense>
      <template v-slot:avatar><q-icon name="info" color="primary" size="sm" /></template>
      <span class="text-caption">
        Pour tout dossier AT/MP, le <b>certificat médical initial (CI)</b> et le <b>certificat final (CF)</b> sont <b>uniques</b>.
        Le CI doit exister avant tout ajout de certificat de prolongation ou final.
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
            <q-btn flat dense round icon="restart_alt" color="white" size="sm" @click="resetForm">
              <q-tooltip>Réinitialiser</q-tooltip>
            </q-btn>
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

            <!-- Date Accident (readonly, depuis le dossier) -->
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

            <!-- Date Certificat (saisie, >= dateaccident) -->
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

            <!-- Type de certificat -->
            <div class="col-12 col-md-5">
              <q-select
                v-model="form.type"
                :options="typeOptions"
                label="Type de Certificat *"
                outlined dense emit-value map-options
                color="primary"
                :rules="[v => !!v || 'Sélectionnez le type de certificat SVP']"
                @update:model-value="onTypeChange"
              >
                <template v-slot:prepend><q-icon name="category" color="primary" size="xs" /></template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.icon" :color="scope.opt.color" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
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

          <!-- Lésions (readonly, depuis le dossier) -->
          <div class="row q-col-gutter-xs">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.naturelesion"
                label="Nature de la Lésion"
                type="textarea"
                rows="2"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.siegelesion"
                label="Siège de la Lésion"
                type="textarea"
                rows="2"
                outlined dense readonly
                bg-color="blue-grey-1" label-color="primary"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ═══════════════════════════════════════════════════════
           SECTION 2 : CERTIFICAT INITIAL / PROLONGATION (membre1)
           Visible si type ≠ CF (Certificat Final)
      ═══════════════════════════════════════════════════════ -->
      <q-expansion-item
        v-show="showMembre1"
        v-model="sections.membre1"
        icon="healing"
        label="Certificat Médical Initial / Prolongation"
        header-class="section-header text-teal-8 text-weight-bold"
        class="q-mb-sm card-elevated"
        expand-icon-class="text-teal-8"
        :disable="!showMembre1"
      >
        <q-card>
          <q-card-section class="q-py-sm">
            <div class="row q-col-gutter-xs items-center">
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.nbrejours"
                  label="Nombre de Jours d'Incapacité"
                  type="number"
                  min="0"
                  outlined dense
                  bg-color="yellow-1"
                  :rules="showMembre1
                    ? [v => v >= 0 || 'Vous ne pouvez saisir un nombre de jours négatif']
                    : []"
                >
                  <template v-slot:prepend><q-icon name="today" color="teal-7" size="xs" /></template>
                  <template v-slot:append><span class="text-caption text-grey-6">jour(s)</span></template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-banner dense rounded class="bg-teal-1 text-teal-9">
                  <template v-slot:avatar><q-icon name="info" color="teal" size="sm" /></template>
                  <span class="text-caption">
                    Saisissez la durée d'incapacité de travail en jours.
                    Le CI est unique par dossier.
                  </span>
                </q-banner>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- ═══════════════════════════════════════════════════════
           SECTION 3 : CERTIFICAT FINAL (membre2)
           Visible si type = CF
      ═══════════════════════════════════════════════════════ -->
      <q-expansion-item
        v-show="showMembre2"
        v-model="sections.membre2"
        icon="task_alt"
        label="Certificat Médical Final"
        header-class="section-header text-deep-orange text-weight-bold"
        class="q-mb-sm card-elevated"
        expand-icon-class="text-deep-orange"
        :disable="!showMembre2"
      >
        <q-card>
          <q-card-section class="q-py-sm">
            <div class="row q-col-gutter-xs items-start">
              <div class="col-6 col-md-3">
                <q-input
                  v-model.number="form.txipp"
                  label="Taux IPP Médecin Traitant (%)"
                  type="number"
                  min="0"
                  max="100"
                  outlined dense
                  bg-color="yellow-1"
                  :rules="showMembre2
                    ? [
                        v => v >= 0 || 'Valeur minimale : 0',
                        v => v <= 100 || 'Le taux d\'IPP doit être compris entre 0 et 100'
                      ]
                    : []"
                >
                  <template v-slot:prepend><q-icon name="percent" color="deep-orange" size="xs" /></template>
                </q-input>
              </div>
              <div class="col-6 col-md-3">
                <q-input
                  v-model="form.datefinrappel"
                  label="Date Prochain Contrôle"
                  outlined dense
                  bg-color="yellow-1"
                  :rules="showMembre2
                    ? [v => !v || compareDates(v, form.dateaccident) >= 0
                         || 'Date doit être ≥ date d\'accident']
                    : []"
                >
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datefinrappel" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="primary" flat dense />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-5">
                <q-banner dense rounded class="bg-orange-1 text-orange-9">
                  <template v-slot:avatar><q-icon name="warning" color="orange" size="sm" /></template>
                  <span class="text-caption">
                    Le <b>certificat final</b> est unique par dossier.
                    Il clôture la prise en charge et fixe le taux d'IPP.
                  </span>
                </q-banner>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- ═══════════════════════════════════════════════════════
           STATUT DU DOSSIER (badges informatifs)
      ═══════════════════════════════════════════════════════ -->
      <div v-if="form.numassure" class="row q-gutter-xs q-mb-sm q-mt-xs">
        <q-chip
          :color="form.flagcmi === 'OUI' ? 'positive' : 'grey-4'"
          :text-color="form.flagcmi === 'OUI' ? 'white' : 'grey-7'"
          icon="check_circle"
          dense size="sm"
        >
          CI {{ form.flagcmi === 'OUI' ? 'existant' : 'non créé' }}
        </q-chip>
        <q-chip
          :color="form.flagcmf === 'OUI' ? 'negative' : 'grey-4'"
          :text-color="form.flagcmf === 'OUI' ? 'white' : 'grey-7'"
          icon="block"
          dense size="sm"
        >
          CF {{ form.flagcmf === 'OUI' ? 'clôturé' : 'non créé' }}
        </q-chip>
      </div>

      <!-- ═══════════════════════════════════════════════════════
           BOUTONS
      ═══════════════════════════════════════════════════════ -->
      <div class="row justify-center q-mt-md q-gutter-sm">
        <q-btn
          type="submit"
          color="primary"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationRpStore } from 'src/stores/energizer/liquidationRpStore.js'

defineOptions({ name: 'NewCertificat' })

const $q = useQuasar()
const rpStore = useLiquidationRpStore()

// ─── État ────────────────────────────────────────────────────────
const formRef         = ref(null)
const submitting      = ref(false)
const selectedDossier = ref(null)

// ─── Sections ────────────────────────────────────────────────────
const sections = reactive({
  membre1: false,
  membre2: false,
})

// ─── Options ─────────────────────────────────────────────────────
const typeOptions = [
  { label: 'CI — Certificat Médical Initial',        value: 'CI', icon: 'add_circle',   color: 'teal'        },
  { label: 'CP — Certificat Médical de Prolongation',value: 'CP', icon: 'update',        color: 'primary'     },
  { label: 'CF — Certificat Médical Final',          value: 'CF', icon: 'task_alt',      color: 'deep-orange' },
]

// ─── Affichage conditionnel des sections ─────────────────────────
const showMembre1 = computed(() => form.type === 'CI' || form.type === 'CP')
const showMembre2 = computed(() => form.type === 'CF')

// ─── Données de test ─────────────────────────────────────────────
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
    flag:          'NON',   // CMI pas encore créé
    flagcmi:       'NON',
    flagcmf:       'NON',
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
    flag:          'OUI',   // CI déjà créé
    flagcmi:       'OUI',
    flagcmf:       'NON',
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
  } catch { /* garde MOCK si API indisponible */ }
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
  dateeffet:     '',
  // Saisie
  type:          '',
  nommedecin:    '',
  structure:     '',
  naturelesion:  '',
  siegelesion:   '',
  // CI/CP
  nbrejours:     0,
  // CF
  txipp:         0,
  datefinrappel: '',
  dateconsolidation: '',
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
  form.dateaccident  = d.dateaccident
  form.dateeffet     = d.dateeffet

  // Si le CF est déjà clôturé, avertir
  if (d.flagcmf === 'OUI') {
    $q.notify({
      type: 'negative',
      message: 'Échec — Ajout des certificats médicaux clôturé pour ce dossier',
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

// ─── Changement de type (logique membre1/membre2 ExtJS) ──────────
function onTypeChange(type) {
  if (type === 'CF') {
    sections.membre1 = false
    sections.membre2 = true
    // CI doit exister avant de créer le CF
    if (form.flagcmi !== 'OUI') {
      $q.notify({
        type: 'warning',
        message: 'Le certificat médical initial (CI) doit être créé avant le certificat final',
        position: 'top',
      })
    }
  } else {
    sections.membre2 = false
    sections.membre1 = true
    // CI unique
    if (type === 'CI' && form.flagcmi === 'OUI') {
      $q.notify({
        type: 'negative',
        message: 'Échec — Le certificat médical initial est unique !',
        position: 'top',
      })
    }
  }
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
  // Dossier obligatoire
  if (!form.numassure) {
    $q.notify({ type: 'negative', message: 'Choisissez un dossier MP/AT SVP', position: 'top' })
    return false
  }
  // Dossier clôturé
  if (form.flagcmf === 'OUI') {
    $q.notify({ type: 'negative', message: 'Échec — Ajout des certificats médicaux clôturé', position: 'top' })
    return false
  }
  // CI unique
  if (form.type === 'CI' && form.flagcmi === 'OUI') {
    $q.notify({ type: 'negative', message: 'Échec — Le certificat médical initial est unique !', position: 'top' })
    return false
  }
  // CF : CI doit exister
  if (form.type === 'CF' && form.flagcmi !== 'OUI') {
    $q.notify({ type: 'negative', message: 'Le CI doit exister avant de créer le certificat final', position: 'top' })
    return false
  }
  // Jours négatifs
  if (showMembre1.value && form.nbrejours < 0) {
    $q.notify({ type: 'negative', message: 'Vous ne pouvez saisir un nombre de jours négatif', position: 'top' })
    return false
  }
  // IPP hors plage
  if (showMembre2.value && (form.txipp < 0 || form.txipp > 100)) {
    $q.notify({ type: 'negative', message: 'Échec — Le taux d\'IPP saisi doit être compris entre 0 et 100', position: 'top' })
    return false
  }
  return true
}

// ─── Soumission (action = certificatinit) ────────────────────────
async function submitForm() {
  const ok = await formRef.value?.validate()
  if (!ok) return
  if (!validateMetier()) return

  submitting.value = true
  try {
    await rpStore.submitCertificatInit({ ...form })
    $q.notify({
      type: 'positive',
      message: 'Ajout du certificat accompli avec succès !',
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
  selectedDossier.value = null
  sections.membre1 = false
  sections.membre2 = false
  dossierOptions.value = allDossiers.value
  formRef.value?.resetValidation()
}
</script>

<style scoped>
.new-certificat {
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

.section-header {
  font-size: 0.88rem;
  font-weight: 700;
  border-radius: 12px;
}
</style>

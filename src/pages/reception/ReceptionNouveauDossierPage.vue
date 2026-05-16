<template>
  <q-page class="q-pa-md reception-nouveau-page">
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      {{ t('reception.nouveauDossier.pageTitle') }}
    </div>

    <q-breadcrumbs class="q-mb-md" active-color="primary">
      <q-breadcrumbs-el :label="t('layout.sidebar.stats')" :to="{ name: 'energizer-home' }" />
      <q-breadcrumbs-el :label="t('layout.sidebar.dossiers')" />
      <q-breadcrumbs-el :label="t('layout.sidebar.receptionStd')" />
    </q-breadcrumbs>

    <div class="row justify-start q-mb-md">
      <q-btn
        unelevated
        no-caps
        color="primary"
        icon="add_circle"
        :label="t('reception.nouveauDossier.openDialog')"
        @click="openFormDialog"
      />
    </div>

    <!-- Tableau des dossiers enregistrés -->
    <q-card >
      <q-card-section>
        <div class="text-h6 text-primary">{{ t('reception.nouveauDossier.tableTitle') }}</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <q-table
          flat
          bordered
          class="reception-dossiers-table"
          :loading="tableLoading"
          :rows="dossiers"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 8 }"
          :no-data-label="t('reception.nouveauDossier.noData')"
        >
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense round icon="visibility" color="primary" @click="viewRow(props.row)">
                <q-tooltip>{{ t('reception.nouveauDossier.view') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>

  <!-- Dialogues hors q-page (téléportés body — affichage fiable sous QLayout) -->
  <q-dialog
    v-model="formDialogOpen"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
      <q-card class="reception-form-dialog reception-form-dialog--maximized">
        <q-card-section class="bg-primary text-white row items-center q-pb-sm">
          <div class="col">
            <div class="text-h6">{{ t('reception.nouveauDossier.dialogTitle') }}</div>
            <div v-if="selectedType" class="text-caption">{{ selectedType.libelle_type_pres }}</div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup @click="closeFormDialog" />
        </q-card-section>

        <q-card-section class="q-pb-none">
          <q-banner dense rounded class="reception-dialog-lead q-mb-md">
            <template #avatar>
              <q-icon name="info" color="primary" size="md" />
            </template>
            <span class="reception-dialog-lead__text">{{ t('reception.nouveauDossier.pickLead') }}</span>
          </q-banner>

          <q-select
            :model-value="selectedType"
            :options="prestationTypes"
            :label="t('reception.nouveauDossier.selectType')"
            option-label="libelle_type_pres"
            outlined
            dense
            clearable
            @update:model-value="onDialogTypeChange"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.libelle_type_pres }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.code_pres }} — {{ scope.opt.code_natu_pres }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-separator v-if="selectedType" class="q-mt-sm" />

        <q-form v-if="selectedType" ref="formRef" @submit.prevent="onSubmit">
          <q-scroll-area class="reception-form-dialog__scroll">
            <q-card-section>
              <div class="text-subtitle2 text-primary q-mb-sm">{{ t('reception.nouveauDossier.sectionAssure') }}</div>
              <div class="row q-col-gutter-md">
                <q-input
                  v-model="form.numassu"
                  :label="t('input.numassu')"
                  outlined
                  dense
                  class="col-12 col-md-6"
                  :disable="!ui.enableNumAssu"
                  :rules="ui.enableNumAssu ? [ruleRequired, ruleNumAssu] : []"
                  @blur="onLookupAssure"
                />
                <q-input
                  v-model="form.nomcompletass"
                  :label="t('input.nomcompletass')"
                  outlined
                  dense
                  readonly
                  class="col-12 col-md-6"
                  :disable="!ui.enableNomAssu"
                />
                <q-input v-model="form.today" :label="t('input.today')" outlined dense readonly class="col-12 col-md-4" />
                <q-input
                  v-model="form.date_naiss"
                  :label="t('input.date_naiss')"
                  outlined
                  dense
                  readonly
                  class="col-12 col-md-4"
                  :disable="!ui.enableDateNaiss"
                />
                <q-input
                  v-model="form.centre_ges"
                  :label="t('input.centre_ges')"
                  outlined
                  dense
                  readonly
                  class="col-12 col-md-4"
                  :disable="!ui.enableCentreGes"
                />
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 text-primary q-mb-sm">{{ t('reception.nouveauDossier.sectionDepot') }}</div>
              <div class="row q-col-gutter-md">
                <q-input
                  v-model="form.nomcomplet"
                  :label="t('input.nomcomplet')"
                  outlined
                  dense
                  class="col-12 col-md-6"
                  :disable="!ui.enableNomDeposant"
                  :rules="ui.enableNomDeposant ? [ruleRequired] : []"
                />
                <q-input
                  v-model="form.nomtiers"
                  :label="t('input.nomtiers')"
                  outlined
                  dense
                  class="col-12 col-md-6"
                  :disable="!ui.enableNomTiers"
                />
                <q-input
                  v-model="form.date_demande"
                  :label="t('input.datedemande')"
                  outlined
                  dense
                  mask="##/##/####"
                  class="col-12 col-md-4"
                  :rules="[ruleRequired]"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover>
                        <q-date v-model="form.date_demande" mask="DD/MM/YYYY" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-if="ui.enableDateCessation"
                  v-model="form.datecessation"
                  :label="t('input.datecessation')"
                  outlined
                  dense
                  mask="##/##/####"
                  class="col-12 col-md-4"
                  :rules="[ruleRequired]"
                />
                <q-input
                  v-if="ui.enableDatedeces"
                  v-model="form.datedeces"
                  :label="t('input.datedeces')"
                  outlined
                  dense
                  mask="##/##/####"
                  class="col-12 col-md-4"
                  :rules="[ruleRequired]"
                />
                <q-input
                  v-if="ui.enableDateInvalidite"
                  v-model="form.dateconstatinvalid"
                  :label="t('input.dateconstatinvalid')"
                  outlined
                  dense
                  mask="##/##/####"
                  class="col-12 col-md-4"
                  :rules="[ruleRequired]"
                />
                <q-input
                  v-if="ui.enableDateConstatIncap"
                  v-model="form.dateconstatincapacite"
                  :label="t('input.dateconstatincapacite')"
                  outlined
                  dense
                  mask="##/##/####"
                  class="col-12 col-md-4"
                  :rules="[ruleRequired]"
                />
                <q-input
                  v-if="ui.enableDatedemandeDecede"
                  v-model="form.datedemandeassuredecede"
                  :label="t('input.datedemandeassuredecede')"
                  outlined
                  dense
                  mask="##/##/####"
                  class="col-12 col-md-4"
                />
                <q-select
                  v-if="ui.enableNaturePrestation"
                  v-model="form.natureprestation"
                  :options="naturePrestationOptions"
                  :label="t('input.natureprestation')"
                  option-label="libelle_type_pres"
                  outlined
                  dense
                  class="col-12 col-md-6"
                  :rules="[ruleRequired]"
                  @update:model-value="onNatureSelect"
                />
                <q-input
                  v-if="ui.enableTauxInvalidite"
                  v-model.number="form.tauxinvalide"
                  type="number"
                  :label="t('input.tauxinvalide')"
                  outlined
                  dense
                  class="col-12 col-md-4"
                  :rules="[ruleRequired]"
                />
                <q-input
                  v-if="ui.enableDateAccident"
                  v-model="form.dateaccident"
                  :label="t('input.dateaccident')"
                  outlined
                  dense
                  mask="##/##/####"
                  class="col-12 col-md-4"
                  :rules="[ruleRequired]"
                />
                <q-input
                  v-if="ui.enableDateDeclaration"
                  v-model="form.datedeclaration"
                  :label="t('input.datedeclaration')"
                  outlined
                  dense
                  mask="##/##/####"
                  class="col-12 col-md-4"
                  :rules="[ruleRequired]"
                />
              </div>

              <q-separator class="q-my-md" />

              <div class="row q-col-gutter-md">
                <q-input
                  v-model="form.email"
                  :label="t('input.email')"
                  outlined
                  dense
                  class="col-12 col-md-4"
                  :disable="!ui.enableEmail"
                />
                <q-input
                  v-model="form.adresse"
                  :label="t('input.adresse')"
                  outlined
                  dense
                  class="col-12 col-md-4"
                  :disable="!ui.enableAdresse"
                  :rules="ui.enableAdresse ? [ruleRequired] : []"
                />
                <q-input
                  v-model="form.telephone"
                  :label="t('input.phone')"
                  outlined
                  dense
                  class="col-12 col-md-4"
                  :disable="!ui.enableTelephone"
                  :rules="ui.enableTelephone ? [ruleRequired] : []"
                />
                <q-select
                  v-model="form.typeimmas"
                  :options="typeImmatriculationOptions"
                  :label="t('input.typeimmas')"
                  option-label="lib"
                  outlined
                  dense
                  class="col-12 col-md-4"
                  :disable="!ui.enableTypeImmas"
                />
                <q-select
                  v-model="form.revision"
                  :options="ouiNonOptions"
                  :label="t('input.revision')"
                  option-label="lib"
                  outlined
                  dense
                  class="col-12 col-md-4"
                  :disable="!ui.enableRevision"
                />
                <q-select
                  v-model="form.circuit"
                  :options="circuitOptions"
                  :label="t('reception.nouveauDossier.circuitLabel')"
                  option-label="libelle_circuit"
                  outlined
                  dense
                  class="col-12 col-md-4"
                  :rules="[ruleRequired]"
                />
              </div>

              <q-expansion-item
                v-if="ui.showEmployeur"
                icon="business"
                :label="t('reception.nouveauDossier.sectionEmployeur')"
                default-opened
                header-class="text-primary"
                class="q-mt-sm"
              >
                <div class="row q-col-gutter-md q-pt-sm">
                  <q-input
                    v-model="form.mat_employeur"
                    :label="t('reception.nouveauDossier.matEmployeur')"
                    outlined
                    dense
                    class="col-12 col-md-6"
                    @blur="onLookupEmployeur"
                  />
                  <q-input
                    v-model="form.RAISON_SOCIALE"
                    :label="t('input.raisonSociale')"
                    outlined
                    dense
                    readonly
                    class="col-12 col-md-6"
                  />
                  <q-input v-model="form.CODE_CENTRE" :label="t('input.centreCNPS')" outlined dense readonly class="col-4" />
                  <q-input v-model="form.BOITE_POSTALE" :label="t('input.boitePostale')" outlined dense readonly class="col-4" />
                  <q-input v-model="form.REGIME_CNPS" :label="t('input.regimeCNPS')" outlined dense readonly class="col-4" />
                  <q-input
                    v-model="form.ADRESSE_EMPLOYEUR"
                    :label="t('input.adresse')"
                    outlined
                    dense
                    readonly
                    class="col-12"
                  />
                </div>
              </q-expansion-item>

              <q-expansion-item
                v-if="ui.showImport"
                icon="cloud_download"
                :label="t('reception.nouveauDossier.sectionImport')"
                default-opened
                header-class="text-primary"
                class="q-mt-sm"
              >
                <q-banner dense rounded class="bg-blue-1 q-mb-md q-mt-sm">{{ t('reception.nouveauDossier.teleHint') }}</q-banner>
                <div class="row q-col-gutter-md">
                  <q-input
                    v-model="form.code_tele_enreg"
                    :label="t('reception.nouveauDossier.codeTele')"
                    outlined
                    dense
                    class="col-12 col-md-6"
                    @blur="onTelecompletion"
                  />
                  <q-input
                    v-model="form.code_secret"
                    :label="t('reception.nouveauDossier.codeSecret')"
                    type="password"
                    outlined
                    dense
                    class="col-12 col-md-6"
                    @blur="onTelecompletion"
                  />
                </div>
                <q-card v-if="ui.showTeleClient" flat bordered class="q-mt-md">
                  <q-card-section>
                    <div v-for="(val, key) in form.teleFields" :key="key" class="q-mb-xs text-body2">
                      <span class="text-weight-medium">{{ teleLabel(key) }} :</span> {{ val }}
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-card-section>
          </q-scroll-area>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat no-caps :label="t('form.cancel')" @click="closeFormDialog" />
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="save"
              type="submit"
              :label="t('reception.nouveauDossier.save')"
              :disable="!saveEnabled"
              :loading="saving || loading"
            />
          </q-card-actions>
        </q-form>
      </q-card>
  </q-dialog>

  <q-dialog v-model="detailOpen">
    <q-card style="min-width: 320px; max-width: 90vw">
      <q-card-section class="text-h6">{{ t('reception.nouveauDossier.detailTitle') }}</q-card-section>
      <q-card-section v-if="detailRow">
        <pre class="detail-json">{{ JSON.stringify(detailRow, null, 2) }}</pre>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="t('form.cancel')" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { regexPatterns } from 'src/js/regex.js'
import { prestationTypes } from 'src/data/nouveauDossier/prestationTypes.js'
import {
  typeImmatriculationOptions,
  ouiNonOptions,
  circuitOptions,
  naturePrestationOptions,
} from 'src/data/nouveauDossier/referenceData.js'
import { useNouveauDossierForm } from 'src/composables/useNouveauDossierForm.js'
import { useReceptionStore } from 'src/stores/energizer/receptionStore.js'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const $q = useQuasar()

const receptionStore = useReceptionStore()
const { dossiers, loading: tableLoading, saving } = storeToRefs(receptionStore)

const formDialogOpen = ref(false)
const formRef = ref(null)
const detailOpen = ref(false)
const detailRow = ref(null)

const {
  selectedType,
  form,
  ui,
  loading,
  saveEnabled,
  applyPrestationType,
  lookupAssure,
  lookupEmployeur,
  runTelecompletion,
  reset,
} = useNouveauDossierForm()

const ruleRequired = (v) => !!v || t('input.requis')
const ruleNumAssu = (v) =>
  regexPatterns.numAssu1.test(v) ||
  regexPatterns.numAssu2.test(v) ||
  t('reception.nouveauDossier.invalidMatAssu')

const columns = computed(() => [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'objet', label: t('input.objet'), field: 'objetLabel', align: 'left', sortable: true },
  { name: 'numassu', label: t('input.numassu'), field: 'numassu', align: 'left' },
  { name: 'nomcomplet', label: t('input.nomcomplet'), field: 'nomcomplet', align: 'left' },
  { name: 'date_demande', label: t('input.datedemande'), field: 'date_demande', align: 'left' },
  { name: 'circuit', label: t('input.circuit'), field: (r) => r.circuitLabel, align: 'left' },
  { name: 'createdAt', label: t('reception.nouveauDossier.createdAt'), field: (r) => formatDate(r.createdAt), align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
])

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('fr-FR')
}

function teleLabel(key) {
  const labels = {
    tele_nom: 'Nom & prénom',
    tele_date_naiss: 'Date de naissance',
    tele_lieu_naiss: 'Né(e) à',
    tele_empl: 'Employé par',
    tele_date_emb: 'Date début affiliation',
    tele_date_enreg: 'Date dépôt en ligne',
    tele_raison: 'Raison sociale',
    tele_regime: 'Ville',
    tele_risque: 'Quartier',
    date_effet: "Date d'effet",
  }
  return labels[key] || key
}

onMounted(() => receptionStore.loadDossiers())

async function openFormDialog() {
  reset()
  await nextTick()
  formDialogOpen.value = true
}

function closeFormDialog() {
  formDialogOpen.value = false
  reset()
}

function onDialogTypeChange(ptype) {
  if (!ptype) {
    reset()
    return
  }
  applyPrestationType(ptype)
}

function onNatureSelect(val) {
  if (val?.code_natu_pres_register) {
    form.value.code_natu_pres_register = val.code_natu_pres_register
  }
}

async function onLookupAssure() {
  try {
    await lookupAssure()
  } catch (e) {
    if (e.message === 'INVALID_MAT') {
      $q.notify({ type: 'negative', message: t('reception.nouveauDossier.invalidMatAssu') })
    }
  }
}

async function onLookupEmployeur() {
  try {
    await lookupEmployeur()
  } catch {
    $q.notify({ type: 'warning', message: t('reception.nouveauDossier.invalidMatEmpl') })
  }
}

async function onTelecompletion() {
  const r = await runTelecompletion()
  if (r?.type === 'not_found') {
    $q.notify({ type: 'negative', message: t('reception.nouveauDossier.teleNotFound') })
  } else if (r?.type === 'duplicate') {
    $q.notify({
      type: 'warning',
      message: t('reception.nouveauDossier.teleDuplicate', { num: r.num }),
    })
  }
}

async function onSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    $q.notify({ type: 'negative', message: t('reception.nouveauDossier.validationError') })
    return
  }
  if (ui.value.showImport && (!form.value.code_tele_enreg || !form.value.code_secret)) {
    $q.notify({ type: 'warning', message: t('reception.nouveauDossier.teleRequired') })
    return
  }
  const payload = {
    ...JSON.parse(JSON.stringify(form.value)),
    objetLabel: selectedType.value?.libelle_type_pres,
    circuitLabel: form.value.circuit?.libelle_circuit,
    typeimmasLabel: form.value.typeimmas?.lib,
    revisionLabel: form.value.revision?.lib,
  }
  try {
    await receptionStore.saveDossier(payload)
    $q.notify({ type: 'positive', message: t('reception.nouveauDossier.saved') })
    closeFormDialog()
  } catch {
    $q.notify({ type: 'negative', message: t('reception.nouveauDossier.saveError') })
  }
}

function viewRow(row) {
  detailRow.value = row
  detailOpen.value = true
}
</script>

<style scoped>
.reception-nouveau-page {

  max-width: 100%;
  margin: 0 auto;
}

.reception-form-dialog--maximized {
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 0;
}

.reception-form-dialog__scroll {
  flex: 1 1 auto;
  min-height: 0;
  height: calc(100vh - 200px);
}

.reception-dialog-lead {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border: 1px solid rgba(21, 101, 192, 0.35);
  color: #0d47a1;
}

.reception-dialog-lead__text {
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.45;
}

.reception-dossiers-table :deep(thead tr th) {
  background-color: var(--q-primary) !important;
  color: #fff !important;
  font-weight: 600;
}

.reception-dossiers-table :deep(thead tr th .q-icon),
.reception-dossiers-table :deep(thead tr th .q-table__sort-icon) {
  color: #fff !important;
  opacity: 1;
}

.detail-json {
  font-size: 12px;
  max-height: 400px;
  overflow: auto;
  white-space: pre-wrap;
}
</style>

<template>
  <q-page class="q-pa-sm">
    <!-- Header Section -->
    <div class="text-center q-mb-sm">
      <h6 class="text-primary q-mb-xs">
        <q-icon name="account_balance" class="q-mr-sm" />
        {{ $t('labels.formulaireSaisieEncaissementEmployeur') }}
      </h6>

    </div>
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-xs">
      <!-- Informations sur l'Employeur Section -->
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6 text-primary">
            <q-icon name="business" class="q-mr-sm" />
            {{ $t('labels.informationsEmployeur') }}
          </div>
          <div class="row q-gutter-xs justify-center">
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.employeur.matriculeCNPS"
                :label="$t('labels.matriculeCNPSEmployeur')"
                outlined
                dense
                size="sm"
                :rules="[
                  val => !!val || $t('labels.champObligatoire'),
                  val => validateMatriculeCNPS(val) || $t('labels.formatMatriculeInvalide')
                ]"
                :hint="$t('labels.formatMatriculeCNPS')"
                @blur="loadEmployeurInfo"
                @input="resetEmployeurState"
                :loading="loadingEmployeurInfo"
              >
                <template v-slot:append>
                  <q-icon
                    v-if="loadingEmployeurInfo"
                    name="refresh"
                    class="rotating"
                  />
                  <q-icon
                    v-else-if="formData.employeur.matriculeCNPS && validateMatriculeCNPS(formData.employeur.matriculeCNPS) && employeurFound"
                    name="check_circle"
                    color="positive"
                  />
                  <q-icon
                    v-else-if="formData.employeur.matriculeCNPS && validateMatriculeCNPS(formData.employeur.matriculeCNPS) && !employeurFound && !loadingEmployeurInfo"
                    name="sentiment_dissatisfied"
                    color="negative"
                  />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.employeur.raisonSociale"
                :label="$t('labels.raisonSociale')"
                outlined
                readonly
                dense
                :rules="[val => !!val || $t('labels.champObligatoire')]"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.employeur.groupeRisque"
                :label="$t('labels.groupeRisque')"
                outlined
                readonly
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.employeur.codeRegime"
                :label="$t('labels.codeRegime')"
                outlined
                readonly
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.employeur.codeCentreGestion"
                :label="$t('labels.codeCentreGestion')"
                outlined
                readonly
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.employeur.adresse"
                :label="$t('labels.adresse')"
                outlined
                dense
                readonly
                type="textarea"
                rows="2"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Listing des BEs non Exécutés Section -->
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6 text-primary q-mb-md">
            <q-icon name="list_alt" class="q-mr-sm" />
            {{ $t('labels.listingBENonExecutes') }}
          </div>
          <q-table
            :rows="beNonExecutes"
            :columns="beColumns"
            row-key="id"
            :loading="loading"
            :pagination="pagination"
            @request="onRequest"
            binary-state-sort
            class="my-table"
            header-class="text-primary text-weight-bold"
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <div class="q-gutter-xs">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="visibility"
                    size="sm"
                    @click="showPreview(props.row)"
                  >
                    <q-tooltip>{{ $t('labels.voirDetail') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="secondary"
                    icon="attach_file"
                    size="sm"
                    @click="attachDocuments(props.row)"
                  >
                    <q-tooltip>{{ $t('labels.joindrePiecesTooltip') }}</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Informations générales sur le mouvement Section -->
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6 text-primary q-mb-md">
            <q-icon name="info" class="q-mr-sm" />
            {{ $t('labels.informationsGeneralesMouvement') }}
          </div>
          <div class="row q-gutter-xs justify-center">
            <div class="col-12 col-md-4">
              <q-select
                v-model="formData.mouvement.rubriqueCotisation"
                :options="rubriqueOptions"
                :label="$t('labels.rubriqueCotisationLabel')"
                outlined
                dense
                emit-value
                map-options
                :rules="[val => !!val || $t('labels.champObligatoireMessage')]"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="formData.mouvement.natureRecouvrement"
                :options="natureRecouvrementOptions"
                :label="$t('labels.natureRecouvrementLabel')"
                outlined
                dense
                emit-value
                map-options
                :rules="[val => !!val || $t('labels.champObligatoireMessage')]"
              />
            </div>
            <div class="col-12 col-md-4 flex flex-center">
              <q-checkbox
                v-model="formData.mouvement.creditSuiteControle"
                :label="$t('labels.creditSuiteControleLabel')"
                color="primary"
                dense
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Renseignements optionnels Relatifs à un moratoire Section -->
      <q-card class="my-card" v-show="false">
        <q-expansion-item
          v-model="expanded.moratoire"
          icon="schedule"
          :label="$t('labels.renseignementsMoratoire')"
          header-class="text-primary"
        >
          <q-card-section>
            <div class="row q-gutter-xs justify-center">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.moratoire.numeroMoratoire"
                  :label="$t('labels.numeroMoratoireLabel')"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.moratoire.dateMoratoire"
                  :label="$t('labels.dateMoratoireLabel')"
                  outlined
                  dense
                  class="q-mb-md field-input"
                  :rules="[val => !!val || $t('labels.dateMoratoireRequise')]"
                  readonly
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="formData.moratoire.dateMoratoire"
                          :mask="'DD/MM/YYYY'"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.moratoire.montantMoratoire"
                  :label="$t('labels.montantMoratoireLabel')"
                  outlined
                  dense
                  type="number"
                  prefix="FCFA"
                />
              </div>
            </div>
          </q-card-section>
        </q-expansion-item>
      </q-card>

      <!-- Renseignements optionnels Relatifs à une remise gracieuse Section -->
      <q-card class="my-card" v-show="false">
        <q-expansion-item
          v-model="expanded.remiseGracieuse"
          icon="favorite"
          :label="$t('labels.renseignementsRemiseGracieuse')"
          header-class="text-primary"
        >
          <q-card-section>
            <div class="row q-gutter-xs justify-center">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.remiseGracieuse.numeroRemise"
                  :label="$t('labels.numeroRemiseLabel')"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.remiseGracieuse.dateRemise"
                  :label="$t('labels.dateRemiseLabel')"
                  outlined
                  dense
                  class="q-mb-md field-input"
                  :rules="[val => !!val || $t('labels.dateRemiseRequise')]"
                  readonly
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="formData.remiseGracieuse.dateRemise"
                          :mask="'DD/MM/YYYY'"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.remiseGracieuse.montantRemise"
                  :label="$t('labels.montantRemiseLabel')"
                  outlined
                  dense
                  type="number"
                  prefix="FCFA"
                />
              </div>
            </div>
          </q-card-section>
        </q-expansion-item>
      </q-card>

      <!-- Listing des paiements non exploités de l'employeur Section -->
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6 text-primary q-mb-md">
            <q-icon name="payment" class="q-mr-sm" />
            {{ $t('labels.listingPaiementsNonExploites') }}
          </div>
          <q-table
            :rows="paiementsNonExploites"
            :columns="paiementsColumns"
            row-key="id"
            :loading="loadingPaiements"
            class="my-table"
            header-class="text-primary text-weight-bold"
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="edit"
                  size="sm"
                  @click="editPaiement(props.row)"
                >
                  <q-tooltip>Modifier</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Renseignements pour mise à jour en crédit Section -->
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6 text-primary q-mb-md">
            <q-icon name="update" class="q-mr-sm" />
            {{ $t('labels.renseignementsMiseCredit') }}
          </div>
          <div class="row q-gutter-xs justify-center">
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.credit.numeroBulletinEmission"
                :label="$t('labels.numeroBulletinEmissionLabel')"
                outlined
                dense
                :rules="[val => !!val || $t('labels.champObligatoireMessage')]"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.credit.periodeConcernee"
                :label="$t('labels.periodeConcerneeLabel')"
                outlined
                dense
                :rules="[val => !!val || $t('labels.champObligatoireMessage')]"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.credit.totalMontantAttendu"
                :label="$t('labels.totalMontantAttenduLabel')"
                outlined
                dense
                type="number"
                prefix="FCFA"
                :rules="[val => !!val || $t('labels.champObligatoireMessage')]"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.credit.montantPaye"
                :label="$t('labels.montantPayeLabel')"
                outlined
                dense
                type="number"
                prefix="FCFA"
                :rules="[val => !!val || $t('labels.champObligatoireMessage')]"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.credit.referenceTitrePaiement"
                :label="$t('labels.referenceTitrePaiementLabel')"
                outlined
                dense
                :rules="[val => !!val || $t('labels.champObligatoireMessage')]"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.credit.dateEffectivePaiement"
                :label="$t('labels.dateEffectivePaiementLabel')"
                outlined
                dense
                class="q-mb-md field-input"
                :rules="[val => !!val || $t('labels.champObligatoireMessage')]"
                readonly
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer" color="primary">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="formData.credit.dateEffectivePaiement"
                        :mask="'DD/MM/YYYY'"
                        color="primary"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="formData.credit.modePaiement"
                :options="modePaiementOptions"
                :label="$t('labels.modePaiementLabel')"
                outlined
                dense
                emit-value
                map-options
                :rules="[val => !!val || $t('labels.champObligatoireMessage')]"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="formData.credit.imputationComptable"
                :options="imputationComptableOptions"
                :label="$t('labels.imputationComptableLabel')"
                outlined
                dense
                emit-value
                map-options
                :rules="[val => !!val || $t('labels.champObligatoireMessage')]"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Action Buttons -->
      <div class="row justify-center q-gutter-sm q-mt-md">
        <q-btn
          type="submit"
          color="primary"
          size="md"
          icon="save"
          :label="$t('labels.enregistrer')"
          :loading="saving"
          class="q-px-lg"
        />
        <q-btn
          type="reset"
          color="grey"
          size="md"
          icon="cancel"
          :label="$t('labels.annuler')"
          class="q-px-lg"
          @click="onReset"
        />
      </div>
    </q-form>

    <!-- Preview Dialog -->
    <q-dialog v-model="showPreviewDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('labels.apercu') }}</div>
        </q-card-section>
        <q-card-section>
          <div v-if="selectedBE">
            <p><strong>{{ $t('labels.numeroEmployeurLabel') }}:</strong> {{ selectedBE.numeroEmployeur }}</p>
            <p><strong>Raison Sociale:</strong> {{ selectedBE.raisonSociale }}</p>
            <p><strong>{{ $t('labels.typeLabel') }}:</strong> {{ selectedBE.typeBE }}</p>
            <p><strong>{{ $t('labels.periodeLabel') }}:</strong> {{ selectedBE.periode }}</p>
            <p><strong>Total:</strong> {{ selectedBE.total }} FCFA</p>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('labels.fermer')" color="primary" size="sm" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Attach Documents Dialog -->
    <q-dialog v-model="showAttachDialog" persistent>
      <q-card style="min-width: 500px; max-width: 800px">
        <q-card-section>
          <div class="text-h6 text-primary">
            <q-icon name="attach_file" class="q-mr-sm" />
            {{ $t('labels.joindrePieces') }}
          </div>
          <div class="text-subtitle2 text-grey-6 q-mt-sm">
            {{ selectedBEForAttach?.numeroEmployeur }} - {{ selectedBEForAttach?.raisonSociale }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="q-gutter-md">
            <!-- File Upload Area -->
            <div class="upload-area">
              <q-file
                v-model="attachedFiles"
                multiple
                outlined
                :label="$t('labels.selectionnerFichiers')"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                max-file-size="5242880"
                @rejected="onFileRejected"
              >
                <template v-slot:prepend>
                  <q-icon name="cloud_upload" />
                </template>
              </q-file>
              <div class="text-caption text-grey-6 q-mt-sm">
                {{ $t('labels.formatsAcceptes') }}
              </div>
            </div>

            <!-- Attached Files List -->
            <div v-if="attachedFiles && attachedFiles.length > 0" class="q-mt-md">
              <div class="text-subtitle2 text-primary q-mb-sm">{{ $t('labels.fichiersSelectionnes') }}</div>
              <q-list bordered separator>
                <q-item v-for="(file, index) in attachedFiles" :key="index">
                  <q-item-section avatar>
                    <q-icon :name="getFileIcon(file.name)" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ file.name }}</q-item-label>
                    <q-item-label caption>{{ formatFileSize(file.size) }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      size="sm"
                      @click="removeFile(index)"
                    >
                      <q-tooltip>{{ $t('labels.supprimer') }}</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md">

          <q-btn
            :label="$t('labels.joindre')"
            color="primary"
            size="md"
            @click="confirmAttach"
            :disable="!attachedFiles || attachedFiles.length === 0"
            :loading="attachingFiles"
          />

          <q-btn flat :label="$t('labels.annuler')" color="grey" size="md" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t: $t } = useI18n()

// Reactive form data
const formData = reactive({
  employeur: {
    matriculeCNPS: '',
    raisonSociale: '',
    groupeRisque: '',
    codeRegime: '',
    codeCentreGestion: '',
    adresse: ''
  },
  mouvement: {
    rubriqueCotisation: '',
    natureRecouvrement: '',
    creditSuiteControle: false
  },
  moratoire: {
    numeroMoratoire: '',
    dateMoratoire: '',
    montantMoratoire: ''
  },
  remiseGracieuse: {
    numeroRemise: '',
    dateRemise: '',
    montantRemise: ''
  },
  credit: {
    numeroBulletinEmission: '',
    periodeConcernee: '',
    totalMontantAttendu: '',
    montantPaye: '',
    referenceTitrePaiement: '',
    dateEffectivePaiement: '',
    modePaiement: '',
    imputationComptable: ''
  }
})

// Expanded sections state
const expanded = reactive({
  moratoire: false,
  remiseGracieuse: false
})

// Loading states
const loading = ref(false)
const loadingPaiements = ref(false)
const saving = ref(false)
const loadingEmployeurInfo = ref(false)
const employeurFound = ref(false)

// Dialog state
const showPreviewDialog = ref(false)
const selectedBE = ref(null)
const showAttachDialog = ref(false)
const selectedBEForAttach = ref(null)
const attachedFiles = ref([])
const attachingFiles = ref(false)

// Table data
const beNonExecutes = ref([])
const paiementsNonExploites = ref([])

// Table columns - computed properties for reactivity
const beColumns = computed(() => [
  {
    name: 'numeroEmployeur',
    required: true,
    label: $t('labels.numeroEmployeurShort'),
    align: 'left',
    field: 'numeroEmployeur',
    sortable: true,
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'raisonSociale',
    label: $t('labels.raisonSociale'),
    align: 'left',
    field: 'raisonSociale',
    sortable: true,
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'typeBE',
    label: $t('labels.typeBE'),
    align: 'left',
    field: 'typeBE',
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'origineBE',
    label: $t('labels.origineBE'),
    align: 'left',
    field: 'origineBE',
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'rubriqueCotisation',
    label: $t('labels.rubrique'),
    align: 'left',
    field: 'rubriqueCotisation',
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'periode',
    label: $t('labels.periode'),
    align: 'left',
    field: 'periode',
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'total',
    label: $t('labels.total'),
    align: 'right',
    field: 'total',
    format: val => `${val} FCFA`,
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'utilisateur',
    label: $t('labels.user'),
    align: 'left',
    field: 'utilisateur',
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'actions',
    label: $t('labels.actions'),
    align: 'center',
    field: 'actions',
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  }
])

const paiementsColumns = computed(() => [
  {
    name: 'numeroEmployeur',
    required: true,
    label: $t('labels.numeroEmployeurShort'),
    align: 'left',
    field: 'numeroEmployeur',
    sortable: true,
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'referencePaiement',
    label: $t('labels.refPaiementShort'),
    align: 'left',
    field: 'referencePaiement',
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'montant',
    label: $t('labels.montant'),
    align: 'right',
    field: 'montant',
    format: val => `${val} FCFA`,
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'banque',
    label: $t('labels.banque'),
    align: 'left',
    field: 'banque',
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'referenceTransaction',
    label: $t('labels.referenceTransaction'),
    align: 'left',
    field: 'referenceTransaction',
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'datePaiement',
    label: $t('labels.datePaiement'),
    align: 'left',
    field: 'datePaiement',
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'origine',
    label: $t('labels.origine'),
    align: 'left',
    field: 'origine',
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'contact',
    label: $t('labels.contact'),
    align: 'left',
    field: 'contact',
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'actions',
    label: $t('labels.modifier'),
    align: 'center',
    field: 'actions',
    headerStyle: 'color: #1976d2; font-size: 12px; font-weight: 700; text-transform: uppercase;'
  }
])

// Pagination
const pagination = ref({
  sortBy: 'numeroEmployeur',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// Select options
const rubriqueOptions = [
  { label: 'Cotisations patronales', value: 'patronales' },
  { label: 'Cotisations salariales', value: 'salariales' },
  { label: 'Cotisations totales', value: 'totales' }
]

const natureRecouvrementOptions = [
  { label: 'Paiement normal', value: 'normal' },
  { label: 'Paiement avec majoration', value: 'majoration' },
  { label: 'Paiement avec remise', value: 'remise' }
]

const modePaiementOptions = [
  { label: 'Virement bancaire', value: 'virement' },
  { label: 'Chèque', value: 'cheque' },
  { label: 'Espèces', value: 'especes' },
  { label: 'Carte bancaire', value: 'carte' }
]

const imputationComptableOptions = [
  { label: 'Banque principale', value: 'banque_principale' },
  { label: 'Tier collecteur 1', value: 'tier_1' },
  { label: 'Tier collecteur 2', value: 'tier_2' }
]

// Methods

const validateMatriculeCNPS = (val) => {
  const regex = /^(?:\d{3}-\d{7}-\d{3}-[A-Z]|\d{3}-\d{7}-[A-Z])$/.test(val);
  return regex || 'Formsat invalide. Utilisez: 123-1234567-123-A ou 123-1234567-A';
};

const resetEmployeurState = () => {
  employeurFound.value = false
  // Vider les champs quand l'utilisateur modifie le matricule
  formData.employeur.raisonSociale = ''
  formData.employeur.groupeRisque = ''
  formData.employeur.codeRegime = ''
  formData.employeur.codeCentreGestion = ''
  formData.employeur.adresse = ''
};

const loadEmployeurInfo = async () => {
  if (!formData.employeur.matriculeCNPS || !validateMatriculeCNPS(formData.employeur.matriculeCNPS)) {
    employeurFound.value = false
    return
  }

  loadingEmployeurInfo.value = true
  employeurFound.value = false

  try {
    // Simulation d'un appel API avec des données factices
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Données factices basées sur l'exemple fourni
    const fakeEmployeurData = {
      '010-1138701-H': {
        raisonSociale: 'CAMEROON TELECOMMUNICATIONS',
        groupeRisque: 'B',
        codeRegime: '324',
        codeCentreGestion: '1',
        adresse: 'BP 1571 YAOUNDE'
      },
      '123-1234567-A': {
        raisonSociale: 'ENTREPRISE GENERALE DU BATIMENT',
        groupeRisque: 'A',
        codeRegime: '321',
        codeCentreGestion: '2',
        adresse: 'BP 1234 DOUALA'
      },
      '456-7654321-B': {
        raisonSociale: 'SOCIETE COMMERCIALE MODERNE',
        groupeRisque: 'C',
        codeRegime: '325',
        codeCentreGestion: '3',
        adresse: 'BP 5678 GAROUA'
      }
    }

    const employeurData = fakeEmployeurData[formData.employeur.matriculeCNPS]

    if (employeurData) {
      // Employeur trouvé
      employeurFound.value = true

      // Mise à jour des champs avec les données récupérées
      formData.employeur.raisonSociale = employeurData.raisonSociale
      formData.employeur.groupeRisque = employeurData.groupeRisque
      formData.employeur.codeRegime = employeurData.codeRegime
      formData.employeur.codeCentreGestion = employeurData.codeCentreGestion
      formData.employeur.adresse = employeurData.adresse

      $q.notify({
        type: 'positive',
        message: $t('labels.informationsEmployeurChargees'),
        position: 'top',
        timeout: 2000
      })
    } else {
      // Employeur non trouvé
      employeurFound.value = false

      // Vider les champs
      formData.employeur.raisonSociale = ''
      formData.employeur.groupeRisque = ''
      formData.employeur.codeRegime = ''
      formData.employeur.codeCentreGestion = ''
      formData.employeur.adresse = ''

      $q.notify({
        type: 'negative',
        message: `${$t('labels.employeurNonTrouve')} ${formData.employeur.matriculeCNPS}`,
        position: 'top',
        timeout: 3000,
        icon: 'sentiment_dissatisfied'
      })
    }

  } catch {
    employeurFound.value = false
    $q.notify({
      type: 'negative',
      message: $t('labels.erreurChargementEmployeur'),
      position: 'top'
    })
  } finally {
    loadingEmployeurInfo.value = false
  }
}

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  loading.value = true

  // Simulate API call
  setTimeout(() => {
    // Mock data
    beNonExecutes.value = [
      {
        id: 1,
        numeroEmployeur: 'EMP001',
        raisonSociale: 'Entreprise ABC',
        typeBE: 'Mensuel',
        origineBE: 'Télédéclaration',
        rubriqueCotisation: 'Cotisations patronales',
        periode: '2024-01',
        total: 150000,
        utilisateur: 'Admin'
      }
    ]

    pagination.value.rowsNumber = beNonExecutes.value.length
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending

    loading.value = false
  }, 1000)
}

const showPreview = (row) => {
  selectedBE.value = row
  showPreviewDialog.value = true
}

const attachDocuments = (row) => {
  selectedBEForAttach.value = row
  attachedFiles.value = []
  showAttachDialog.value = true
}

const onFileRejected = () => {
  $q.notify({
    type: 'negative',
    message: $t('labels.fichiersRejetes'),
    position: 'top',
    icon: 'warning'
  })
}

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase()
  switch (extension) {
    case 'pdf':
      return 'picture_as_pdf'
    case 'doc':
    case 'docx':
      return 'description'
    case 'jpg':
    case 'jpeg':
    case 'png':
      return 'image'
    default:
      return 'attach_file'
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const removeFile = (index) => {
  attachedFiles.value.splice(index, 1)
}

const confirmAttach = async () => {
  if (!attachedFiles.value || attachedFiles.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: $t('labels.selectionnerFichierMessage'),
      position: 'top'
    })
    return
  }

  attachingFiles.value = true

  try {
    // Simulation d'un appel API pour joindre les fichiers
    await new Promise(resolve => setTimeout(resolve, 2000))

    $q.notify({
      type: 'positive',
      message: `${attachedFiles.value.length} ${$t('labels.fichiersJointesSucces')} ${selectedBEForAttach.value.numeroEmployeur}`,
      position: 'top',
      icon: 'check_circle'
    })

    // Fermer le dialog et réinitialiser
    showAttachDialog.value = false
    attachedFiles.value = []
    selectedBEForAttach.value = null

  } catch {
    $q.notify({
      type: 'negative',
      message: $t('labels.erreurJointureFichiers'),
      position: 'top',
      icon: 'error'
    })
  } finally {
    attachingFiles.value = false
  }
}

const editPaiement = (row) => {
  $q.notify({
    type: 'info',
    message: `${$t('labels.modificationPaiement')} ${row.referencePaiement}`,
    position: 'top'
  })
}

const onSubmit = () => {
  saving.value = true

  // Simulate save operation
  setTimeout(() => {
    $q.notify({
      type: 'positive',
      message: $t('labels.enregistrementSucces'),
      position: 'top'
    })
    saving.value = false
  }, 2000)
}

const onReset = () => {
  // Reset all form data
  Object.keys(formData).forEach(section => {
    Object.keys(formData[section]).forEach(field => {
      if (typeof formData[section][field] === 'boolean') {
        formData[section][field] = false
      } else {
        formData[section][field] = ''
      }
    })
  })

  // Reset expanded sections
  expanded.moratoire = false
  expanded.remiseGracieuse = false

  $q.notify({
    type: 'info',
    message: $t('labels.formulaireReinitialise'),
    position: 'top'
  })
}

// Load initial data
onMounted(() => {
  onRequest({ pagination: pagination.value })

  // Load payments data
  loadingPaiements.value = true
  setTimeout(() => {
    paiementsNonExploites.value = [
      {
        id: 1,
        numeroEmployeur: 'EMP001',
        referencePaiement: 'PAY001',
        montant: 150000,
        banque: 'BICEC',
        referenceTransaction: 'TXN001',
        datePaiement: '2024-01-15',
        origine: 'Bancaire',
        contact: 'contact@entreprise.com'
      }
    ]
    loadingPaiements.value = false
  }, 1000)
})
</script>

<style scoped>
.my-card {
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  max-width: 80%;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.my-table {
  border-radius: 8px;
  overflow: hidden;
}

.text-primary {
  color: #1976d2;
}

.q-expansion-item {
  border-radius: 8px;
  overflow: hidden;
}

.q-expansion-item .q-item {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.q-expansion-item .q-item__section--main {
  font-weight: 600;
}

.q-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
}

.q-input, .q-select {
  border-radius: 8px;
}

.q-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.q-card-section {
  padding: 16px;
}

.text-h6 {
  font-weight: 600;
  margin-bottom: 8px;
}

.q-separator {
  margin: 8px 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .q-pa-md {
    padding: 16px;
  }

  .q-card-section {
    padding: 16px;
  }

  .row.q-gutter-md > div {
    margin-bottom: 16px;
  }
}

/* Animation for form sections */
.my-card {
  transition: all 0.3s ease;
}

.my-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Custom scrollbar for tables */
.my-table ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.my-table ::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.my-table ::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.my-table ::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animation pour l'icône de chargement */
.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Styles pour les en-têtes de table */
.my-table .q-table__top,
.my-table .q-table__bottom,
.my-table thead th {
  background-color: #f5f5f5;
  font-size: 16px;
  font-weight: 600;
  padding: 8px 12px;
}

.my-table thead th {
  color: #1976d2 !important;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: #e3f2fd !important;
}

.my-table tbody td {
  font-size: 14px;
  padding: 8px 12px;
}

.my-table .q-table__control {
  padding: 8px;
}

/* Styles pour le dialog de pièces jointes */
.upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  transition: border-color 0.3s ease;
}

.upload-area:hover {
  border-color: #1976d2;
}

.upload-area .q-field {
  margin: 0;
}

.q-list .q-item {
  border-radius: 4px;
  margin-bottom: 4px;
}

.q-list .q-item:hover {
  background-color: #f5f5f5;
}

/* Animation pour les boutons d'action */
.q-btn--round {
  transition: all 0.3s ease;
}

.q-btn--round:hover {
  transform: scale(1.1);
}

/* Réduction globale des tailles des éléments de formulaire */
.my-card {
  margin-bottom: 6px;
}

.my-card .q-card-section {
  padding: 8px;
}

.my-card .text-h6 {
  font-size: 1.1rem;
  margin-bottom: 6px;
  margin-top: 0;
}

/* Réduction des tailles des champs de saisie */
.q-field--outlined .q-field__control {
  min-height: 40px;
}

.q-field--dense .q-field__control {
  min-height: 36px;
}

.q-field--dense .q-field__native {
  font-size: 0.9rem;
}

.q-field--dense .q-field__label {
  font-size: 0.85rem;
}

/* Réduction des tailles des boutons */
.q-btn {
  font-size: 0.85rem;
  padding: 6px 12px;
}

.q-btn--round {
  width: 32px;
  height: 32px;
}

/* Réduction des espacements */
.q-gutter-sm > * {
  margin: 4px;
}

.q-mb-sm {
  margin-bottom: 4px !important;
}

.q-mb-md {
  margin-bottom: 8px !important;
}

/* Réduction des tailles des tableaux */
.my-table .q-table__top,
.my-table .q-table__bottom,
.my-table thead th {
  font-size: 0.75rem;
  padding: 4px 6px;
}

.my-table tbody td {
  font-size: 0.75rem;
  padding: 4px 6px;
}

/* Réduction supplémentaire des en-têtes de colonnes */
.my-table thead th {
  font-size: 0.7rem !important;
  padding: 3px 4px !important;
  line-height: 1.2;
}

/* Réduction des tailles des icônes */
.q-icon {
  font-size: 1.1rem;
}

/* Réduction des tailles des séparateurs */
.q-separator {
  margin: 4px 0;
}

/* Réduction de la marge supérieure du formulaire */
.q-page.q-pa-sm {
  padding: 8px;
}

/* Réduction des marges du header */
.text-center.q-mb-sm {
  margin-bottom: 8px;
}

/* Réduction des marges des titres */
.text-center h6 {
  margin-bottom: 4px;
  margin-top: 0;
}

/* Optimisation de l'espacement global */
.q-page {
  min-height: 100vh;
}
</style>

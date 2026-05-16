<template>
  <div class="q-pa-sm elements-liquidation-pf">

    <!-- Bannière d'erreur -->
    <q-banner v-if="errorMsg" class="bg-negative text-white q-mb-sm" rounded dense>
      <template v-slot:avatar><q-icon name="error" color="white" /></template>
      {{ errorMsg }}
      <template v-slot:action>
        <q-btn flat color="white" label="Fermer" dense @click="errorMsg = ''" />
      </template>
    </q-banner>

    <!-- ═══════════════════════════════════════════════════════
         RECHERCHE
    ═══════════════════════════════════════════════════════ -->
    <q-card class="q-mb-sm card-elevated">
      <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
        <div class="row items-center">
          <q-icon name="search" size="xs" class="q-mr-xs" />
          <span class="text-body2 text-weight-bold">Recherche de Dossiers</span>
        </div>
      </q-card-section>
      <q-card-section class="q-py-sm">
        <q-form @submit.prevent="searchDossiers" @reset="resetSearch">
          <div class="row q-col-gutter-sm items-end">
            <div class="col-12 col-sm-3">
              <q-select
                v-model="searchCriteria"
                :options="searchOptions"
                label="Critères"
                outlined dense emit-value map-options color="primary"
              />
            </div>
            <div class="col-12 col-sm-3">
              <q-input
                v-model="searchStartValue"
                label="Valeur de Début"
                outlined dense
                @update:model-value="val => (searchStartValue = (val || '').toUpperCase())"
              />
            </div>
            <div class="col-12 col-sm-3">
              <q-input
                v-model="searchEndValue"
                label="Valeur de Fin"
                outlined dense
                @update:model-value="val => (searchEndValue = (val || '').toUpperCase())"
              />
            </div>
            <div class="col-12 col-sm-3">
              <div class="row q-gutter-xs">
                <q-btn type="submit" color="primary" label="Rechercher" icon="search"
                  dense unelevated style="border-radius:8px" :loading="loading" />
                <q-btn type="reset" color="grey-6" label="Annuler" icon="close"
                  dense unelevated style="border-radius:8px" />
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- ═══════════════════════════════════════════════════════
         LISTE DES DOSSIERS  +  bouton Nouvelle Saisie
    ═══════════════════════════════════════════════════════ -->
    <q-card class="card-elevated">
      <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="list_alt" size="xs" class="q-mr-xs" />
            <span class="text-body2 text-weight-bold">Liste des Dossiers PF</span>
          </div>
          <div class="row items-center q-gutter-sm">
            <q-badge color="white" text-color="primary" :label="`${dossiers.length} dossier(s)`" />
            <q-btn
              color="white" text-color="primary" icon="add" label="Nouvelle saisie"
              dense unelevated size="sm" style="border-radius:8px; font-weight:600;"
              @click="openDialog()"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-table
          :rows="dossiers" :columns="tableColumns" row-key="numdoss"
          :loading="loading" dense flat :rows-per-page-options="[10, 20, 50]"
          no-data-label="Aucun dossier trouvé — utilisez la recherche ci-dessus"
          class="pf-dossier-table"
        >
          <template v-slot:body-cell-index="props">
            <q-td :props="props" class="text-center text-grey-6">{{ props.rowIndex + 1 }}</q-td>
          </template>
          <template v-slot:body-cell-numdoss="props">
            <q-td :props="props">
              <a class="dossier-link" href="#" @click.prevent="loadDossier(props.row)">
                <q-icon name="folder_open" size="xs" class="q-mr-xs" />{{ props.row.numdoss }}
              </a>
            </q-td>
          </template>
          <template v-slot:body-cell-position="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.position)"
                :label="props.row.position || '—'" style="font-size:0.7rem" />
            </q-td>
          </template>
          <template v-slot:no-data="{ message }">
            <div class="full-width row flex-center text-grey-6 q-pa-lg">
              <q-icon name="inbox" size="2rem" class="q-mr-sm" />{{ message }}
            </div>
          </template>
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- ═══════════════════════════════════════════════════════
         DIALOG – FORMULAIRE DE SAISIE
    ═══════════════════════════════════════════════════════ -->
    <q-dialog v-model="showDialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="dialog-form-card">
        <q-bar class="bg-primary text-white q-py-sm">
          <q-icon name="edit_document" />
          <span class="q-ml-sm text-body1 text-weight-bold">Saisie des Éléments de Liquidation</span>
          <q-space />
          <q-btn v-if="totalMontant > 0" flat dense round color="white" icon="payments" size="sm">
            <q-tooltip>TOTAL : {{ formatMoney(totalMontant) }} FCFA</q-tooltip>
          </q-btn>
          <q-btn flat dense round color="white" icon="restart_alt" size="sm" @click="resetForm">
            <q-tooltip>Réinitialiser</q-tooltip>
          </q-btn>
          <q-btn flat dense round color="white" icon="close" size="sm" v-close-popup @click="resetForm" />
        </q-bar>

        <q-card-section class="q-pa-sm overflow-auto dialog-body">
          <q-form ref="saisieFormRef" @submit.prevent="submitForm" @reset="resetForm">

            <div class="sep q-mb-xs"><q-icon name="folder_open" size="xs" class="q-mr-xs" />Identification du Dossier</div>
            <div class="row q-col-gutter-xs q-mb-sm">
              <div class="col-6 col-md-2">
                <q-input v-model="form.numdoss" label="N° Dossier" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-3">
                <q-input v-model="form.natupres" label="Nature Prestation" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.datedemande" label="Date Demande" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.numassu" label="N° Assuré" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.nomassu" label="Noms Assuré" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
              </div>
              <div class="col-6 col-md-1">
                <q-input v-model="form.prenomassu" label="Prénoms" outlined dense readonly bg-color="blue-grey-1" label-color="primary" />
              </div>
            </div>

            <div class="sep q-mb-xs"><q-icon name="medical_services" size="xs" class="q-mr-xs" />Examens Prénataux</div>
            <div class="row q-col-gutter-xs q-mb-sm items-start">
              <div class="col-6 col-md-2">
                <div class="inline-check">
                  <q-checkbox v-model="form.ap1" label="AP1" color="primary" dense @update:model-value="onAP1Change" />
                  <span v-if="form.ap1" class="chip-montant">{{ formatMoney(form.montap1) }} F</span>
                </div>
              </div>
              <div class="col-6 col-md-2">
                <div class="inline-check">
                  <q-checkbox v-model="form.fm1" label="FM1" color="teal" dense @update:model-value="onFM1Change" />
                  <span v-if="form.fm1" class="chip-montant chip-teal">{{ formatMoney(form.montfm1) }} F</span>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.dateExamen1" label="1er Examen Prénatal" outlined dense bg-color="yellow-1"
                  :rules="[v => !form.ap1 || !!v || 'Date 1er Examen obligatoire']">
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.dateExamen1" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-6 col-md-2">
                <div class="inline-check">
                  <q-checkbox v-model="form.ap2" label="AP2" color="primary" dense @update:model-value="onAP2Change" />
                  <span v-if="form.ap2" class="chip-montant">{{ formatMoney(form.montap2) }} F</span>
                </div>
              </div>
              <div class="col-6 col-md-2">
                <div class="inline-check">
                  <q-checkbox v-model="form.fm2" label="FM2" color="teal" dense @update:model-value="onFM2Change" />
                  <span v-if="form.fm2" class="chip-montant chip-teal">{{ formatMoney(form.montfm2) }} F</span>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.dateExamen2" label="2e Examen Prénatal" outlined dense bg-color="yellow-1"
                  :rules="[v => !form.ap2 || !!v || 'Date 2e Examen obligatoire']">
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.dateExamen2" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="sep q-mb-xs"><q-icon name="child_care" size="xs" class="q-mr-xs" />Accouchement</div>
            <div class="row q-col-gutter-xs q-mb-sm items-start">
              <div class="col-6 col-md-2">
                <div class="inline-check">
                  <q-checkbox v-model="form.acc" label="Accouchement" color="purple" dense @update:model-value="onACCChange" />
                  <span v-if="form.acc" class="chip-montant chip-purple">{{ formatMoney(form.montacc) }} F</span>
                </div>
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model.number="form.nbreenfantsviables" label="Enfants Viables" type="number" min="0"
                  outlined dense @update:model-value="onNbreEnfantsViablesChange" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.datepreacc" label="Date Probable Accouchement" outlined dense bg-color="yellow-1"
                  @update:model-value="onDatePreaccChange">
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datepreacc" mask="DD/MM/YYYY" today-btn color="primary"
                          @update:model-value="onDatePreaccChange">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-6 col-md-2">
                <div class="inline-check">
                  <q-checkbox v-model="form.fraisMedicauxAcc" label="Frais Méd. Acc" color="orange" dense @update:model-value="onFMACCChange" />
                  <span v-if="form.fraisMedicauxAcc" class="chip-montant chip-orange">{{ formatMoney(form.montfmacc) }} F</span>
                </div>
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model.number="form.nbreenfantssouscontr" label="Enfants Sous Contrôle" type="number" min="0"
                  outlined dense @update:model-value="onNbreEnfantsSousContrChange" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.dateeffacc" label="Date Effective Accouchement" outlined dense bg-color="yellow-1"
                  :rules="[v => !form.acc || !!v || 'Date d\'accouchement obligatoire']">
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.dateeffacc" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="sep q-mb-xs"><q-icon name="event_note" size="xs" class="q-mr-xs" />Indemnité Journalière (IJ)</div>
            <div class="row q-col-gutter-xs q-mb-sm items-start">
              <div class="col-6 col-md-2">
                <q-checkbox v-model="form.ij" label="IJ" color="indigo" dense />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model.number="form.nbrejourscouches" label="Jours Couches Supp." type="number" min="0"
                  outlined dense :rules="[v => Number(v) <= 28 || 'Max 28 j']" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.datedebconges" label="Date Début Congés Effectif" outlined dense bg-color="yellow-1"
                  :rules="[v => !form.ij || !!v || 'Date début congés obligatoire']">
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datedebconges" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model.number="form.nbrejoursijpayer" label="Nb Jours IJ Payés" type="number" min="0"
                  outlined dense :rules="[v => Number(v) <= 98 || 'Max 98 j']" />
              </div>
              <div class="col-6 col-md-2">
                <q-input v-model="form.sexeassu" label="Sexe Assuré" outlined dense readonly bg-color="blue-grey-1" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.cessationactivite" label="Date Cessation d'Activité" outlined dense readonly bg-color="deep-orange-1" label-color="deep-orange" />
              </div>
            </div>

            <div class="sep q-mb-xs"><q-icon name="business_center" size="xs" class="q-mr-xs" />Congés & Employeur</div>
            <div class="row q-col-gutter-xs q-mb-sm">
              <div class="col-12 col-md-4">
                <q-input v-model="form.employeuractuel" label="Employeur Actuel" outlined dense bg-color="yellow-1" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.finconges" label="Date Effective Fin Congés" outlined dense bg-color="yellow-1"
                  @update:model-value="onFinCongesChange">
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.finconges" mask="DD/MM/YYYY" today-btn color="primary"
                          @update:model-value="onFinCongesChange">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.probablefinconges" label="Date Probable Fin Congès" outlined dense readonly bg-color="deep-orange-1" label-color="deep-orange" />
              </div>
            </div>

            <div class="sep q-mb-xs"><q-icon name="warning_amber" size="xs" class="q-mr-xs" />Accouchement Prématuré & Cessation de Paiement</div>
            <div class="row q-col-gutter-xs q-mb-sm items-start">
              <div class="col-6 col-md-2">
                <q-checkbox v-model="form.accpremature" label="Acc. Prématuré" color="orange-8" dense @update:model-value="onAccPrematureChange" />
              </div>
              <div class="col-12 col-md-5">
                <q-input v-model="form.datedebcesspaie" label="Début Cessation Paiement" outlined dense bg-color="yellow-1">
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datedebcesspaie" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-5">
                <q-input v-model="form.datefincesspaie" label="Fin Cessation Paiement" outlined dense bg-color="yellow-1">
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datefincesspaie" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="sep q-mb-xs"><q-icon name="calculate" size="xs" class="q-mr-xs" />Base de Calcul & Reprise</div>
            <div class="row q-col-gutter-xs q-mb-sm items-center">
              <div class="col-6 col-md-2">
                <div class="inline-check">
                  <q-checkbox v-model="form.mode30" label="1/30" color="primary" dense @update:model-value="v => { if (v) form.mode25 = false }" />
                  <q-checkbox v-model="form.mode25" label="1/25" color="primary" dense @update:model-value="v => { if (v) form.mode30 = false }" />
                </div>
              </div>
              <div class="col-12 col-md-5">
                <q-input v-model="form.repriseactivite" label="Date Reprise Activité" outlined dense bg-color="yellow-1">
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.repriseactivite" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-5">
                <q-input v-model="form.probablejouissance" label="Date Probable Début Jouissance" outlined dense readonly bg-color="deep-orange-1" label-color="deep-orange" />
              </div>
            </div>

            <div class="sep q-mb-xs"><q-icon name="info_outline" size="xs" class="q-mr-xs" />Informations Complémentaires</div>
            <div class="row q-col-gutter-xs q-mb-sm items-start">
              <div class="col-6 col-md-3">
                <q-input v-model.number="form.salnetreconstitue" label="Salaire Net Reconstitué" type="number" min="0" outlined dense>
                  <template v-slot:append><span class="text-caption text-grey-6">FCFA</span></template>
                </q-input>
              </div>
              <div class="col-6 col-md-3">
                <q-input v-model="form.matinterne" label="Matricule Interne" outlined dense
                  :rules="[v => !form.ij || !!v || 'Matricule interne obligatoire si IJ']" />
              </div>
              <div class="col-12 col-md-6">
                <div class="inline-check q-mt-xs">
                  <span class="text-caption text-grey-7 q-mr-sm">≥ 6 mois d'activité ?</span>
                  <q-checkbox v-model="form.sixmoisactivite" label="OUI" color="positive" dense disable />
                  <q-checkbox v-model="form.nonsixmoisactivite" label="NON" color="negative" dense disable />
                </div>
              </div>
            </div>

            <div v-if="totalMontant > 0" class="recap-bar q-mb-sm">
              <q-icon name="summarize" size="xs" class="q-mr-xs text-primary" />
              <span class="text-caption text-weight-bold text-primary q-mr-sm">Récap :</span>
              <q-chip v-if="form.ap1" color="primary" text-color="white" dense size="sm">AP1 {{ formatMoney(form.montap1) }}</q-chip>
              <q-chip v-if="form.fm1" color="teal" text-color="white" dense size="sm">FM1 {{ formatMoney(form.montfm1) }}</q-chip>
              <q-chip v-if="form.ap2" color="indigo" text-color="white" dense size="sm">AP2 {{ formatMoney(form.montap2) }}</q-chip>
              <q-chip v-if="form.fm2" color="cyan-8" text-color="white" dense size="sm">FM2 {{ formatMoney(form.montfm2) }}</q-chip>
              <q-chip v-if="form.acc" color="purple" text-color="white" dense size="sm">ACC {{ formatMoney(form.montacc) }}</q-chip>
              <q-chip v-if="form.fraisMedicauxAcc" color="orange-8" text-color="white" dense size="sm">FMACC {{ formatMoney(form.montfmacc) }}</q-chip>
              <q-chip color="positive" text-color="white" icon="payments" dense size="sm">TOTAL {{ formatMoney(totalMontant) }} FCFA</q-chip>
            </div>

            <div class="row justify-center q-gutter-sm q-mt-sm">
              <q-btn type="submit" color="primary" label="Valider" icon="save"
                unelevated style="border-radius:10px; min-width:140px" :loading="submitting" />
              <q-btn type="reset" color="grey-6" label="Annuler" icon="refresh"
                unelevated style="border-radius:10px; min-width:140px" @click="resetForm" />
            </div>

          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationPfStore } from 'src/stores/energizer/liquidationPfStore.js'

defineOptions({ name: 'ElementsLiquidationPF' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()

const loading    = ref(false)
const submitting = ref(false)
const errorMsg   = ref('')
const showDialog = ref(false)
const saisieFormRef = ref(null)

const MOCK_DOSSIERS = [
  {
    numdoss: 'F2026-001', numassu: '5-20-97-123456-78',
    requerant: 'KAMGA Marie-Claire', datedemande: '15/03/2026',
    natupres: 'Prestations Familiales', position: 'En Cours de Traitement', dateposi: '15/03/2026',
    nomassu: 'KAMGA', prenomassu: 'Marie-Claire', sexe: 'F', numemployeur: '1-20-97-001234',
    ap1: 'OUI', fm1: 'OUI', dateexamen1: '10/01/2026', ap2: 'OUI', fm2: 'OUI', dateexamen2: '15/02/2026',
    acc: 'OUI', nbreenfvia: 1, nbreviabsoucont: 1, datepreacc: '20/03/2026', fmacc: 'OUI', dateeffacc: '22/03/2026',
    ij: 'OUI', nbrejrcouche: 0, datedebconges: '19/02/2026', nbreij: 98, datefinconge: '28/05/2026',
    datecessaactivite: '19/02/2026', dateprobjouiss: '20/02/2026', dateprevfincong: '28/05/2026',
    datedebcesspaie: '19/02/2026', datefincesspaie: '28/05/2026', accprema: 'NON', basecal: '30',
    datereprise: '01/06/2026', salreconstitue: 250000, matriculeinterne: 'MAT-2026-001',
  },
  {
    numdoss: 'F2026-002', numassu: '5-20-97-654321-12',
    requerant: 'NKOA Sylvie', datedemande: '02/04/2026',
    natupres: 'Prestations Familiales', position: 'En attente de pièces', dateposi: '05/04/2026',
    nomassu: 'NKOA', prenomassu: 'Sylvie', sexe: 'F', numemployeur: '1-20-97-005678',
    ap1: 'OUI', fm1: 'NON', dateexamen1: '05/02/2026', ap2: 'NON', fm2: 'NON', dateexamen2: '',
    acc: 'OUI', nbreenfvia: 2, nbreviabsoucont: 2, datepreacc: '10/04/2026', fmacc: 'OUI', dateeffacc: '08/04/2026',
    ij: 'OUI', nbrejrcouche: 5, datedebconges: '10/03/2026', nbreij: 98, datefinconge: '17/06/2026',
    datecessaactivite: '10/03/2026', dateprobjouiss: '11/03/2026', dateprevfincong: '17/06/2026',
    datedebcesspaie: '10/03/2026', datefincesspaie: '17/06/2026', accprema: 'NON', basecal: '25',
    datereprise: '18/06/2026', salreconstitue: 185000, matriculeinterne: 'MAT-2026-002',
  },
  {
    numdoss: 'F2026-003', numassu: '5-20-97-987654-55',
    requerant: 'MBELLA Claire', datedemande: '20/04/2026',
    natupres: 'Prestations Familiales', position: 'Transmis au superviseur', dateposi: '22/04/2026',
    nomassu: 'MBELLA', prenomassu: 'Claire', sexe: 'F', numemployeur: '1-20-97-009012',
    ap1: 'OUI', fm1: 'OUI', dateexamen1: '01/03/2026', ap2: 'OUI', fm2: 'OUI', dateexamen2: '05/04/2026',
    acc: 'NON', nbreenfvia: 0, nbreviabsoucont: 0, datepreacc: '15/05/2026', fmacc: 'NON', dateeffacc: '',
    ij: 'NON', nbrejrcouche: 0, datedebconges: '', nbreij: 0, datefinconge: '',
    datecessaactivite: '', dateprobjouiss: '', dateprevfincong: '', datedebcesspaie: '', datefincesspaie: '',
    accprema: 'NON', basecal: '30', datereprise: '', salreconstitue: 320000, matriculeinterne: 'MAT-2026-003',
  },
  {
    numdoss: 'F2026-004', numassu: '5-20-97-111222-33',
    requerant: 'ATANGANA Patience', datedemande: '01/05/2026',
    natupres: 'Prestations Familiales', position: 'Annuler Liquidation', dateposi: '03/05/2026',
    nomassu: 'ATANGANA', prenomassu: 'Patience', sexe: 'F', numemployeur: '1-20-97-003344',
    ap1: 'NON', fm1: 'NON', dateexamen1: '', ap2: 'NON', fm2: 'NON', dateexamen2: '',
    acc: 'OUI', nbreenfvia: 1, nbreviabsoucont: 1, datepreacc: '05/05/2026', fmacc: 'OUI', dateeffacc: '03/05/2026',
    ij: 'OUI', nbrejrcouche: 0, datedebconges: '06/04/2026', nbreij: 98, datefinconge: '12/07/2026',
    datecessaactivite: '06/04/2026', dateprobjouiss: '07/04/2026', dateprevfincong: '12/07/2026',
    datedebcesspaie: '06/04/2026', datefincesspaie: '12/07/2026', accprema: 'OUI', basecal: '30',
    datereprise: '13/07/2026', salreconstitue: 140000, matriculeinterne: 'MAT-2026-004',
  },
]

onMounted(() => { dossiers.value = MOCK_DOSSIERS })

const searchCriteria   = ref('fnumdoss')
const searchStartValue = ref('000-')
const searchEndValue   = ref('')
const searchOptions = [
  { label: 'Num Dossier', value: 'fnumdoss' },
  { label: 'Num Assuré',  value: 'fnumassu' },
  { label: 'Noms Assuré', value: 'fnomassu' },
]

const FORM_INITIAL = {
  numdoss: '', numassu: '', natupres: '', datedemande: '', nomassu: '', prenomassu: '',
  ap1: false, montap1: 0, fm1: false, montfm1: 0, dateExamen1: '',
  ap2: false, montap2: 0, fm2: false, montfm2: 0, dateExamen2: '',
  acc: false, montacc: 0, nbreenfantsviables: 0, datepreacc: '',
  fraisMedicauxAcc: false, montfmacc: 0, nbreenfantssouscontr: 0, dateeffacc: '',
  ij: false, nbrejourscouches: 0, datedebconges: '',
  nbrejoursij: 0, nbrejoursijpayer: 0, sexeassu: '', cessationactivite: '',
  employeuractuel: '', finconges: '', probablefinconges: '',
  accpremature: false, datedebcesspaie: '', datefincesspaie: '',
  mode30: false, mode25: false, repriseactivite: '', probablejouissance: '',
  salnetreconstitue: 0, sixmoisactivite: false, nonsixmoisactivite: false, matinterne: '',
}
const form = reactive({ ...FORM_INITIAL })
const dossiers = ref([])
const tableColumns = [
  { name: 'index',      label: 'N°',               field: 'index',       align: 'center', style: 'width:50px' },
  { name: 'numdoss',    label: 'N° Dossier',        field: 'numdoss',     align: 'left', sortable: true },
  { name: 'numassu',    label: 'N° Assuré',         field: 'numassu',     align: 'left', sortable: true },
  { name: 'requerant',  label: 'Noms Requérant',    field: 'requerant',   align: 'left', sortable: true },
  { name: 'datedemande',label: 'Date Demande',       field: 'datedemande', align: 'left', sortable: true },
  { name: 'natupres',   label: 'Nature Prestation', field: 'natupres',    align: 'left', sortable: true },
  { name: 'position',   label: 'Position Dossier',  field: 'position',    align: 'left', sortable: true },
  { name: 'dateposi',   label: 'Date Position',     field: 'dateposi',    align: 'left', sortable: true },
]
const totalMontant = computed(() =>
  (form.ap1 ? form.montap1 : 0) + (form.fm1 ? form.montfm1 : 0)
  + (form.ap2 ? form.montap2 : 0) + (form.fm2 ? form.montfm2 : 0)
  + (form.acc ? form.montacc : 0) + (form.fraisMedicauxAcc ? form.montfmacc : 0),
)

function addDays(strDate, j) {
  if (!strDate || strDate.length < 10) return ''
  const d = new Date(`${strDate.substring(6,10)}-${strDate.substring(3,5)}-${strDate.substring(0,2)}`)
  if (isNaN(d.getTime())) return ''
  const temp = new Date(d.getTime() + 1000 * 60 * 60 * 24 * j)
  return `${String(temp.getDate()).padStart(2,'0')}/${String(temp.getMonth()+1).padStart(2,'0')}/${temp.getFullYear()}`
}
function compareDeuxDates(date1, date2) {
  if (!date1 || !date2 || date1.length < 10 || date2.length < 10) return false
  const d1 = new Date(`${date1.substring(3,5)}-${date1.substring(0,2)}-${date1.substring(6,10)}`)
  const d2 = new Date(`${date2.substring(3,5)}-${date2.substring(0,2)}-${date2.substring(6,10)}`)
  return d1.getTime() >= d2.getTime()
}
function differenceDeuxDatesEnJour(date1, date2) {
  if (!date1 || !date2 || date1.length < 10 || date2.length < 10) return 0
  const dateMax = new Date(date1.substring(6,10), date1.substring(3,5), date1.substring(0,2))
  const dateMin = new Date(date2.substring(6,10), date2.substring(3,5), date2.substring(0,2))
  return Math.round((dateMax.getTime() - dateMin.getTime()) / (1000 * 60 * 60 * 24))
}
function calculerDateProbableDebutJouissance(d) { return addDays(d, 1) }
function determinerdatefinprobableaccnormal(d)   { return addDays(d, 69) }
function determinerdatefinprobableaccpremature(d){ return addDays(d, 98) }
function determineDateCessationAccNormal(d)      { return addDays(d, -29) }
function determineDateCessationAccPrema(d)       { return addDays(d, -1) }
function calculeDateProbablejouissance(d) { form.probablejouissance = calculerDateProbableDebutJouissance(d) }
function calculeDateProbableFinConges(d) {
  form.probablefinconges = form.accpremature
    ? determinerdatefinprobableaccpremature(form.cessationactivite)
    : determinerdatefinprobableaccnormal(d)
}
function calculeDateCessationActivite(d) {
  if (form.accpremature && compareDeuxDates(form.datedebconges, form.dateeffacc)) {
    form.cessationactivite = determineDateCessationAccPrema(form.dateeffacc)
    form.datedebconges = form.dateeffacc
    calculeDateProbableFinConges(d)
  } else {
    form.cessationactivite = determineDateCessationAccNormal(d)
    calculeDateProbableFinConges(d)
  }
  calculeDateProbablejouissance(form.cessationactivite)
}
function calculerNombrejoursIJPayes() { form.nbrejoursij = differenceDeuxDatesEnJour(form.finconges, form.datedebconges) }
function calculMontantAcc() {
  const n = parseInt(String(form.nbreenfantsviables)) || 0
  form.montacc = form.acc && n > 0 ? 21600 * n : form.acc ? 21600 : 0
}
function onAP1Change(v)  { form.montap1  = v ? 8100 : 0 }
function onAP2Change(v)  { form.montap2  = v ? 8100 : 0 }
function onFM1Change(v)  { form.montfm1  = v ? 200  : 0 }
function onFM2Change(v)  { form.montfm2  = v ? 200  : 0 }
function onFMACCChange(v){ form.montfmacc = v ? 1400 : 0 }
function onACCChange(v) {
  if (v) { form.nbreenfantsviables = 1; form.nbreenfantssouscontr = 1; form.montacc = 21600 }
  else   { form.montacc = 0; form.nbreenfantsviables = 0; form.nbreenfantssouscontr = 0 }
}
function onAccPrematureChange()         { calculeDateCessationActivite(form.datepreacc) }
function onDatePreaccChange(d)          { calculeDateCessationActivite(d || form.datepreacc) }
function onFinCongesChange()            { calculerNombrejoursIJPayes() }
function onNbreEnfantsViablesChange()   { calculMontantAcc() }
function onNbreEnfantsSousContrChange() { calculMontantAcc() }
function openDialog()  { showDialog.value = true }
function loadDossier(row) {
  form.numdoss = row.numdoss ?? ''; form.numassu = row.numassu ?? ''
  form.datedemande = row.datedemande ?? ''; form.natupres = row.natupres ?? ''
  form.nomassu = row.nomassu ?? ''; form.prenomassu = row.prenomassu ?? ''
  form.datepreacc = row.datepreacc ?? ''; form.dateeffacc = row.dateeffacc ?? ''
  form.datedebconges = row.datedebconges ?? ''; form.finconges = row.datefinconge ?? ''
  form.cessationactivite = row.datecessaactivite ?? ''; form.probablejouissance = row.dateprobjouiss ?? ''
  form.repriseactivite = row.datereprise ?? ''; form.datedebcesspaie = row.datedebcesspaie ?? ''
  form.datefincesspaie = row.datefincesspaie ?? ''; form.probablefinconges = row.dateprevfincong ?? ''
  form.sexeassu = row.sexe ?? ''; form.employeuractuel = row.numemployeur ?? ''
  form.dateExamen1 = row.dateexamen1 ?? ''; form.dateExamen2 = row.dateexamen2 ?? ''
  form.nbreenfantsviables = row.nbreenfvia ?? 0; form.nbreenfantssouscontr = row.nbreviabsoucont ?? 0
  form.nbrejoursij = row.nbreij ?? 0; form.nbrejourscouches = row.nbrejrcouche ?? 0
  form.salnetreconstitue = row.salreconstitue !== 'null' ? (row.salreconstitue ?? 0) : 0
  form.matinterne = row.matriculeinterne ?? ''
  form.ap1 = row.ap1 === 'OUI'; form.montap1 = form.ap1 ? 8100 : 0
  form.fm1 = row.fm1 === 'OUI'; form.montfm1 = form.fm1 ? 200 : 0
  form.ap2 = row.ap2 === 'OUI'; form.montap2 = form.ap2 ? 8100 : 0
  form.fm2 = row.fm2 === 'OUI'; form.montfm2 = form.fm2 ? 200 : 0
  form.acc = row.acc === 'OUI'; form.montacc = form.acc ? 21600 * (parseInt(String(row.nbreenfvia)) || 1) : 0
  form.fraisMedicauxAcc = row.fmacc === 'OUI'; form.montfmacc = form.fraisMedicauxAcc ? 1400 : 0
  form.ij = row.ij === 'OUI'; form.accpremature = row.accprema === 'OUI'
  form.mode25 = row.basecal === '25'; form.mode30 = !form.mode25
  showDialog.value = true
  $q.notify({ type: 'positive', message: `Dossier ${row.numdoss} chargé`, position: 'top', timeout: 1500 })
}
function validateForm() {
  if (!form.numdoss) { $q.notify({ type: 'negative', message: 'Veuillez sélectionner un dossier dans la liste SVP', position: 'top' }); return false }
  if (form.acc && !form.dateeffacc) { $q.notify({ type: 'negative', message: "Veuillez saisir la date d'accouchement SVP", position: 'top' }); return false }
  if (form.ap1 && !form.dateExamen1) { $q.notify({ type: 'negative', message: 'Veuillez saisir la date du Premier Examen Prénatal SVP', position: 'top' }); return false }
  if (form.ap2 && !form.dateExamen2) { $q.notify({ type: 'negative', message: 'Veuillez saisir la date du Deuxième Examen Prénatal SVP', position: 'top' }); return false }
  if (form.ij && !form.datedebconges) { $q.notify({ type: 'negative', message: 'Veuillez saisir la date du Début Congés de Maternité SVP', position: 'top' }); return false }
  if (form.ij && !form.matinterne) { $q.notify({ type: 'negative', message: 'La saisie du matricule interne est obligatoire SVP', position: 'top' }); return false }
  return true
}
async function submitForm() {
  const ok = await saisieFormRef.value?.validate()
  if (!ok) return
  if (!validateForm()) return
  submitting.value = true
  try {
    await pfStore.submitLiquidation({ ...form })
    $q.notify({ type: 'positive', message: 'Éléments de liquidation enregistrés avec succès !', position: 'top', icon: 'check_circle' })
    showDialog.value = false; resetForm()
  } catch {
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement", position: 'top' })
  } finally { submitting.value = false }
}
function resetForm() { Object.assign(form, { ...FORM_INITIAL }); saisieFormRef.value?.resetValidation() }
async function searchDossiers() {
  loading.value = true
  errorMsg.value = ''
  try {
    dossiers.value = await pfStore.searchDossiers({
      criteria: searchCriteria.value,
      start: searchStartValue.value,
      end: searchEndValue.value,
    })
    $q.notify({
      type: dossiers.value.length ? 'positive' : 'info',
      message: dossiers.value.length
        ? `${dossiers.value.length} dossier(s) trouvé(s)`
        : 'Recherche effectuée — aucun résultat',
      position: 'top',
    })
  } catch {
    dossiers.value = []
  } finally {
    loading.value = false
  }
}
function resetSearch() { searchCriteria.value = 'fnumdoss'; searchStartValue.value = '000-'; searchEndValue.value = ''; dossiers.value = []; errorMsg.value = '' }
function formatMoney(v) { return new Intl.NumberFormat('fr-FR').format(Number(v) || 0) }
function getStatusColor(s) {
  if (!s) return 'grey-5'
  const t = s.toLowerCase()
  if (t.includes('cours')) return 'orange-7'
  if (t.includes('attente')) return 'blue-6'
  if (t.includes('transmi')) return 'teal-6'
  if (t.includes('annul')) return 'negative'
  return 'grey-6'
}
</script>

<style scoped>
.elements-liquidation-pf { max-width: 1400px; margin: 0 auto; }
.card-elevated { border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.card-header-rounded { border-radius: 15px 15px 0 0; }
.dialog-form-card { display: flex; flex-direction: column; height: 100vh; }
.dialog-body { flex: 1; overflow-y: auto; }
.sep { font-size: 0.72rem; font-weight: 700; color: #1976d2; text-transform: uppercase; letter-spacing: 0.5px; border-left: 3px solid #1976d2; padding: 2px 0 2px 8px; background: linear-gradient(to right, rgba(25,118,210,0.06), transparent); border-radius: 0 4px 4px 0; }
.inline-check { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; padding: 4px 0; }
.chip-montant { font-size: 0.68rem; font-weight: 700; color: #1565c0; background: rgba(25,118,210,0.12); border-radius: 4px; padding: 1px 6px; }
.chip-teal   { color: #00695c; background: rgba(0,137,123,0.12); }
.chip-purple { color: #6a1b9a; background: rgba(106,27,154,0.12); }
.chip-orange { color: #e65100; background: rgba(230,81,0,0.12); }
.recap-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; background: rgba(25,118,210,0.05); border-radius: 8px; padding: 6px 10px; border: 1px solid rgba(25,118,210,0.15); }
.dossier-link { color: #1976d2; text-decoration: none; font-weight: 600; font-size: 0.85rem; transition: color 0.2s; }
.dossier-link:hover { color: #0d47a1; text-decoration: underline; }
.pf-dossier-table { border-radius: 0 0 15px 15px; }
.pf-dossier-table :deep(.q-table__bottom) { background: #fafafa; border-radius: 0 0 15px 15px; }
</style>

<template>
  <div class="q-pa-xs q-pa-sm elements-liquidation-pf">

    <!-- Bannière d'erreur -->
    <q-banner v-if="errorMsg" class="bg-negative text-white q-mb-sm" rounded dense>
      <template v-slot:avatar><q-icon name="error" color="white" /></template>
      {{ errorMsg }}
      <template v-slot:action>
        <q-btn flat color="white" label="Fermer" dense @click="errorMsg = ''" />
      </template>
    </q-banner>

    <!-- ═══════════════════════════════════════════════════════
         LISTE DES DOSSIERS (recherche intégrée dans l'en-tête)
    ═══════════════════════════════════════════════════════ -->
    <q-card class="card-elevated">
      <q-card-section class="table-toolbar q-py-sm q-px-sm q-px-md">
        <div class="row items-center q-col-gutter-sm q-mb-xs">
          <div class="col-12 col-lg-auto row items-center no-wrap q-gutter-xs toolbar-title-row">
            <q-icon name="list_alt" size="sm" color="primary" />
            <span class="text-body2 text-weight-bold text-primary toolbar-title-text">Liste des Dossiers PF</span>
            <q-badge outline color="primary" :label="`${dossiers.length}`" />
          </div>

          <q-form
            class="col-12 col-lg toolbar-search-form"
            @submit.prevent="searchDossiers"
            @reset.prevent="resetSearch"
          >
            <div class="row q-col-gutter-sm items-center">
              <div class="col-12 col-sm-6 col-md-4 col-lg-auto">
                <q-select
                  v-model="cbxcritere"
                  name="cbxcritere"
                  :options="cbxcritereOptions"
                  label="Critères"
                  label-color="primary"
                  outlined
                  dense
                  color="primary"
                  emit-value
                  map-options
                  class="toolbar-field toolbar-field--critere full-width"
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6 col-md-4 col-lg-auto">
                <q-input
                  v-model="txtvaleurdeb"
                  name="txtvaleurdeb"
                  label="Valeur de Début"
                  label-color="primary"
                  outlined
                  dense
                  color="primary"
                  clearable
                  class="toolbar-field toolbar-field--valeur full-width"
                  hide-bottom-space
                  input-class="text-primary"
                  @update:model-value="val => (txtvaleurdeb = (val || '').toUpperCase())"
                  @keyup.enter="searchDossiers"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" size="xs" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-12 col-md-4 col-lg-auto row q-gutter-sm items-center toolbar-actions">
                <q-btn
                  type="submit"
                  color="primary"
                  icon="search"
                  label="Rechercher"
                  dense
                  unelevated
                  :loading="loading"
                  class="toolbar-btn col-grow col-sm-auto"
                />
                <q-btn
                  type="reset"
                  flat
                  dense
                  round
                  color="primary"
                  icon="restart_alt"
                  :disable="loading"
                >
                  <q-tooltip>Réinitialiser la recherche</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-form>
        </div>

        <div class="text-caption text-primary toolbar-hint row items-center">
          <q-icon name="touch_app" size="xs" class="q-mr-xs flex-shrink-0" />
          <span>Cliquez sur un N° dossier pour ouvrir la saisie des éléments de liquidation</span>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none pf-table-responsive">
        <q-table
          :rows="dossiers"
          :columns="visibleTableColumns"
          row-key="numdoss"
          :grid="tableGrid"
          :loading="loading"
          dense
          flat
          :rows-per-page-options="tableRowsPerPageOptions"
          :pagination="{ rowsPerPage: tableDefaultRowsPerPage }"
          no-data-label="Aucun dossier trouvé — modifiez les critères ou la valeur de début"
          class="pf-module-table"
        >
          <template v-slot:header-cell="props">
            <q-th :props="props" class="pf-col-header bg-primary text-white">
              <span class="pf-col-header__label text-weight-bold">
                {{ props.col.label }}
              </span>
            </q-th>
          </template>
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
          <template v-slot:item="props">
            <div class="pf-grid-card q-pa-sm q-mb-sm" @click="loadDossier(props.row)">
              <div class="row items-center justify-between q-mb-xs">
                <a class="dossier-link text-body2" href="#" @click.prevent.stop="loadDossier(props.row)">
                  {{ props.row.numdoss }}
                </a>
                <q-badge :color="getStatusColor(props.row.position)" :label="props.row.position || '—'" dense />
              </div>
              <div class="text-caption text-grey-8">{{ props.row.requerant }}</div>
              <div class="text-caption text-grey-6 q-mt-xs">
                {{ props.row.numassu }} · {{ props.row.datedemande }}
              </div>
            </div>
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
    <q-dialog
      v-model="showDialog"
      persistent
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
      :full-width="$q.screen.lt.md"
      :full-height="$q.screen.lt.sm"
    >
      <q-card class="dialog-form-card" :class="{ 'dialog-form-card--desktop': $q.screen.gt.sm }">
        <q-bar class="bg-primary text-white q-py-sm dialog-bar">
          <q-icon name="edit_document" class="flex-shrink-0" />
          <span class="q-ml-sm text-body2 text-weight-bold dialog-bar__title ellipsis">
            Saisie des Éléments de Liquidation
          </span>
          <q-space />
          <q-btn v-if="totalMontant > 0" flat dense round color="white" icon="payments" size="sm">
            <q-tooltip>TOTAL : {{ formatMoney(totalMontant) }} FCFA</q-tooltip>
          </q-btn>
          <q-btn flat dense round color="white" icon="restart_alt" size="sm" @click="resetForm">
            <q-tooltip>Réinitialiser</q-tooltip>
          </q-btn>
          <q-btn flat dense round color="white" icon="close" size="sm" v-close-popup @click="resetForm" />
        </q-bar>

        <q-card-section class="q-pa-md overflow-auto dialog-body">
          <q-form ref="saisieFormRef" class="pf-legacy-form" @submit.prevent="submitForm" @reset="resetForm">

            <!-- Ligne 1 : N° Dossier | Nature Prestation | Date Demande -->
            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">N° Dossier</span>
                  <q-input v-model="form.txtsaisienumdoss" name="txtsaisienumdoss" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Nature Prestation</span>
                  <q-input v-model="form.txtsaisienatupres" name="txtsaisienatupres" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Demande</span>
                  <q-input v-model="form.txtsaisiedatedemande" name="txtsaisiedatedemande" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
            </div>

            <!-- Ligne 2 : N° Assuré | Noms Assuré | Prénoms Assuré -->
            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">N° Assuré</span>
                  <q-input v-model="form.txtsaisienumassu" name="txtsaisienumassu" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Noms Assuré</span>
                  <q-input v-model="form.txtsaisietextenomassu" name="txtsaisietextenomassu" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Prénoms Assuré</span>
                  <q-input v-model="form.txtsaisietexteprenomassu" name="txtsaisietexteprenomassu" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
            </div>

            <!-- Ligne 3 : AP1 ? | FM1 ? | Date Premier Examen Prénatal -->
            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">AP1 ?</span>
                  <q-checkbox v-model="form.chsaisieAP1" name="chsaisieAP1" dense @update:model-value="onAP1Change" />
                  <input type="hidden" name="txtsaisiemontap1" :value="form.txtsaisiemontap1" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">FM1 ?</span>
                  <q-checkbox v-model="form.chsaisieFM1" name="chsaisieFM1" dense @update:model-value="onFM1Change" />
                  <input type="hidden" name="txtsaisiemontfm1" :value="form.txtsaisiemontfm1" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Premier Examen Prénatal</span>
                  <q-input v-model="form.txtSaisieDateExamen1" name="txtSaisieDateExamen1" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date"
                    :rules="[v => !form.chsaisieAP1 || !!v || 'Date 1er Examen obligatoire']">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtSaisieDateExamen1" mask="DD/MM/YYYY" today-btn color="primary">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Ligne 4 : AP2 ? | FM2 ? | Date Deuxième Examen Prénatal -->
            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">AP2 ?</span>
                  <q-checkbox v-model="form.chsaisieAP2" name="chsaisieAP2" dense @update:model-value="onAP2Change" />
                  <input type="hidden" name="txtsaisiemontap2" :value="form.txtsaisiemontap2" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">FM2 ?</span>
                  <q-checkbox v-model="form.chsaisieFM2" name="chsaisieFM2" dense @update:model-value="onFM2Change" />
                  <input type="hidden" name="txtsaisiemontfm2" :value="form.txtsaisiemontfm2" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Deuxième Examen Prénatal</span>
                  <q-input v-model="form.txtSaisieDateExamen2" name="txtSaisieDateExamen2" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date"
                    :rules="[v => !form.chsaisieAP2 || !!v || 'Date 2e Examen obligatoire']">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtSaisieDateExamen2" mask="DD/MM/YYYY" today-btn color="primary">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Ligne 5 : Accouchement ? | Nombre Enfants Nés Viables | Date Probable Accouchement -->
            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Accouchement ?</span>
                  <q-checkbox v-model="form.chsaisieAcc" name="chsaisieAcc" dense @update:model-value="onACCChange" />
                  <input type="hidden" name="txtsaisiemontacc" :value="form.txtsaisiemontacc" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Nombre Enfants Nés Viables</span>
                  <q-input v-model.number="form.txtsaisienbreenfantsviables" name="txtsaisienbreenfantsviables" type="number" min="0"
                    dense outlined hide-bottom-space class="pf-legacy-input pf-legacy-input--narrow" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Probable Accouchement</span>
                  <q-input v-model="form.txtSaisieDatepreacc" name="txtSaisieDatepreacc" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date" @update:model-value="onDatePreaccChange">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtSaisieDatepreacc" mask="DD/MM/YYYY" today-btn color="primary" @update:model-value="onDatePreaccChange">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Ligne 6 : Frais Médicaux Accouchement | Enfants Sous Contrôle | Date Effective Accouchement -->
            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Frais Médicaux Accouchement</span>
                  <q-checkbox v-model="form.chsaisieFraisMedicauxAcc" name="chsaisieFraisMedicauxAcc" dense @update:model-value="onFMACCChange" />
                  <input type="hidden" name="txtsaisiemontfmacc" :value="form.txtsaisiemontfmacc" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Enfants Nés Sous Contrôle Médical</span>
                  <q-input v-model.number="form.txtsaisienbreenfantssouscontr" name="txtsaisienbreenfantssouscontr" type="number" min="0"
                    dense outlined hide-bottom-space class="pf-legacy-input pf-legacy-input--narrow"
                    @blur="onNbreEnfantsSousContrChange(form.txtsaisienbreenfantssouscontr)" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Effective Accouchement</span>
                  <q-input v-model="form.txtSaisieDateeffacc" name="txtSaisieDateeffacc" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date"
                    :rules="[v => !form.chsaisieAcc || !!v || 'Date d\'accouchement obligatoire']">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtSaisieDateeffacc" mask="DD/MM/YYYY" today-btn color="primary">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Ligne 7 : IJ ? | Jours Couches | Date Début Congés -->
            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Indemnité Journalière (IJ) ?</span>
                  <q-checkbox v-model="form.chsaisieIj" name="chsaisieIj" dense />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Jours Couches Supplémentaires</span>
                  <q-input v-model.number="form.txtsaisienbrejourscouches" name="txtsaisienbrejourscouches" type="number" min="0"
                    dense outlined hide-bottom-space class="pf-legacy-input pf-legacy-input--narrow"
                    @blur="valideNombrejrCouches(form.txtsaisienbrejourscouches)" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Début Congés Effectif</span>
                  <q-input v-model="form.txtSaisieDateDebConges" name="txtSaisieDateDebConges" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date"
                    :rules="[v => !form.chsaisieIj || !!v || 'Date début congés obligatoire']">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtSaisieDateDebConges" mask="DD/MM/YYYY" today-btn color="primary">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Ligne 8 : Nombre Jours IJ | Sexe Assuré | Date Cessation d'Activité -->
            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Nombre Jours IJ</span>
                  <input type="hidden" name="txtsaisienbrejoursij" :value="form.txtsaisienbrejoursij" />
                  <q-input v-model.number="form.txtsaisienbrejoursijpayer" name="txtsaisienbrejoursijpayer" type="number" min="0"
                    dense outlined hide-bottom-space class="pf-legacy-input pf-legacy-input--narrow"
                    @click="calculerNombrejoursIJPayes()"
                    @blur="onBlurNombrejoursIjPayer" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Sexe Assuré</span>
                  <q-input v-model="form.txtsaisiesexeassu" name="txtsaisiesexeassu" dense outlined readonly hide-bottom-space
                    class="pf-legacy-input pf-legacy-input--narrow" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Cessation d'Activité</span>
                  <q-input v-model="form.txtSaisieCessationActivite" name="txtSaisieCessationActivite" dense outlined readonly hide-bottom-space
                    bg-color="deep-orange-2" class="pf-legacy-input pf-legacy-input--date cursor-pointer"
                    @click="onCessationActiviteClick" />
                </div>
              </div>
            </div>

            <!-- Ligne 9 : Employeur | Fin Congés | Probable Fin Congés -->
            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Employeur Actuel</span>
                  <q-input v-model="form.txtSaisieemployeuractuel" name="txtSaisieemployeuractuel" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Effective Fin Congés</span>
                  <q-input v-model="form.txtSaisiefinconges" name="txtSaisiefinconges" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date" @update:model-value="onFinCongesChange">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtSaisiefinconges" mask="DD/MM/YYYY" today-btn color="primary" @update:model-value="onFinCongesChange">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Probable Fin Congés</span>
                  <q-input v-model="form.txtSaisieProbablefinconges" name="txtSaisieProbablefinconges" dense outlined readonly hide-bottom-space
                    bg-color="deep-orange-2" class="pf-legacy-input pf-legacy-input--date cursor-pointer" @click="onProbableFinCongesClick" />
                </div>
              </div>
            </div>

            <!-- Ligne 10 : Acc. Prématuré | Début Cessation Paiement | Fin Cessation Paiement -->
            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Accouchement Prématuré ?</span>
                  <q-checkbox v-model="form.chsaisieaccpremature" name="chsaisieaccpremature" dense @update:model-value="onAccPrematureChange" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Début Cessation Paiement ( Début Non Salaire)</span>
                  <q-input v-model="form.txtSaisieDateDebCessationPaiement" name="txtSaisieDateDebCessationPaiement" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtSaisieDateDebCessationPaiement" mask="DD/MM/YYYY" today-btn color="primary">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Fin Cessation Paiement (Fin Non Salaire)</span>
                  <q-input v-model="form.txtSaisieFinCessationPaiement" name="txtSaisieFinCessationPaiement" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtSaisieFinCessationPaiement" mask="DD/MM/YYYY" today-btn color="primary">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Ligne 11 : Base de calcul | Reprise | Jouissance -->
            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell pf-legacy-cell--base">
                  <span class="pf-legacy-label">Base de calcul</span>
                  <div class="pf-base-calcul">
                    <q-checkbox v-model="form.chsaisiemode30" name="chsaisiemode30" label="(1/30)" dense :disable="mode30Disabled" @update:model-value="onMode30Change" />
                    <q-checkbox v-model="form.chsaisiemode25" name="chsaisiemode25" label="(1/25)" dense :disable="mode25Disabled" @update:model-value="onMode25Change" />
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Reprise Activité</span>
                  <q-input v-model="form.txtSaisierepriseactivite" name="txtSaisierepriseactivite" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtSaisierepriseactivite" mask="DD/MM/YYYY" today-btn color="primary">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Probable Début Jouissance</span>
                  <q-input v-model="form.txtSaisieProbablejouissance" name="txtSaisieProbablejouissance" dense outlined readonly hide-bottom-space
                    bg-color="deep-orange-2" class="pf-legacy-input pf-legacy-input--date cursor-pointer" @click="onProbableJouissanceClick" />
                </div>
              </div>
            </div>

            <!-- Ligne 12 : Salaire Reconstitué | Question 6 mois (colspan 2) -->
            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Salaire Reconstitué</span>
                  <q-input v-model.number="form.txtsaisiesalnetreconstitue" name="txtsaisiesalnetreconstitue" type="number" min="0"
                    dense outlined hide-bottom-space class="pf-legacy-input pf-legacy-input--narrow" />
                </div>
              </div>
              <div class="col-12 col-md-8">
                <div class="pf-legacy-cell pf-legacy-cell--question text-center">
                  <p class="pf-six-mois-text q-mb-xs">
                    La femme (assuré) justifie elle d'au moins six mois d'activités consécutifs avant son début congés ?
                  </p>
                  <div class="pf-six-mois-checks">
                    <q-checkbox v-model="form.chsalouisixmoisactivite" name="chsalouisixmoisactivite" label="OUI" dense disable />
                    <q-checkbox v-model="form.chsalnonsixmoisactivite" name="chsalnonsixmoisactivite" label="NON" dense disable />
                  </div>
                </div>
              </div>
            </div>

            <!-- Ligne 13 : Matricule Interne -->
            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Matricule Interne</span>
                  <q-input v-model="form.txtsaisiematinterne" name="txtsaisiematinterne" dense outlined hide-bottom-space class="pf-legacy-input pf-legacy-input--matricule"
                    :rules="[v => !form.chsaisieIj || !!v || 'Matricule interne obligatoire si IJ']" />
                </div>
              </div>
            </div>

            <div v-if="totalMontant > 0" class="recap-bar q-mb-sm q-mt-sm">
              <q-icon name="summarize" size="xs" class="q-mr-xs text-primary" />
              <span class="text-caption text-weight-bold text-primary q-mr-sm">Récap :</span>
              <q-chip v-if="form.chsaisieAP1" color="primary" text-color="white" dense size="sm">AP1 {{ formatMoney(form.txtsaisiemontap1) }}</q-chip>
              <q-chip v-if="form.chsaisieFM1" color="teal" text-color="white" dense size="sm">FM1 {{ formatMoney(form.txtsaisiemontfm1) }}</q-chip>
              <q-chip v-if="form.chsaisieAP2" color="indigo" text-color="white" dense size="sm">AP2 {{ formatMoney(form.txtsaisiemontap2) }}</q-chip>
              <q-chip v-if="form.chsaisieFM2" color="cyan-8" text-color="white" dense size="sm">FM2 {{ formatMoney(form.txtsaisiemontfm2) }}</q-chip>
              <q-chip v-if="form.chsaisieAcc" color="purple" text-color="white" dense size="sm">ACC {{ formatMoney(form.txtsaisiemontacc) }}</q-chip>
              <q-chip v-if="form.chsaisieFraisMedicauxAcc" color="orange-8" text-color="white" dense size="sm">FMACC {{ formatMoney(form.txtsaisiemontfmacc) }}</q-chip>
              <q-chip color="positive" text-color="white" icon="payments" dense size="sm">TOTAL {{ formatMoney(totalMontant) }} FCFA</q-chip>
            </div>

            <div class="row q-mt-md dialog-actions justify-center q-gutter-md">
              <q-btn type="submit" color="primary" label="Valider" unelevated :loading="submitting" class="pf-legacy-btn" />
              <q-btn type="reset" color="grey-7" label="Annuler" unelevated class="pf-legacy-btn" @click="resetForm" />
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

const cbxcritere   = ref('fnumdoss')
const txtvaleurdeb = ref('000-')
const cbxcritereOptions = [
  { label: 'Num Dossier', value: 'fnumdoss' },
  { label: 'Num Assuré',  value: 'fnumassu' },
  { label: 'Noms Assuré', value: 'fnomassu' },
]

/** Noms identiques à elementsLiquidationPF.jsp (frmSaisieElementLiquidat) */
const FORM_INITIAL = {
  txtsaisienumdoss: '',
  txtsaisienatupres: '',
  txtsaisiedatedemande: '',
  txtsaisienumassu: '',
  txtsaisietextenomassu: '',
  txtsaisietexteprenomassu: '',
  chsaisieAP1: false,
  txtsaisiemontap1: 0,
  chsaisieFM1: false,
  txtsaisiemontfm1: 0,
  txtSaisieDateExamen1: '',
  chsaisieAP2: false,
  txtsaisiemontap2: 0,
  chsaisieFM2: false,
  txtsaisiemontfm2: 0,
  txtSaisieDateExamen2: '',
  chsaisieAcc: false,
  txtsaisiemontacc: 0,
  txtsaisienbreenfantsviables: 0,
  txtSaisieDatepreacc: '',
  chsaisieFraisMedicauxAcc: false,
  txtsaisiemontfmacc: 0,
  txtsaisienbreenfantssouscontr: 0,
  txtSaisieDateeffacc: '',
  chsaisieIj: false,
  txtsaisienbrejourscouches: 0,
  txtSaisieDateDebConges: '',
  txtsaisienbrejoursij: 0,
  txtsaisienbrejoursijpayer: 0,
  txtsaisiesexeassu: '',
  txtSaisieCessationActivite: '',
  txtSaisieemployeuractuel: '',
  txtSaisiefinconges: '',
  txtSaisieProbablefinconges: '',
  chsaisieaccpremature: false,
  txtSaisieDateDebCessationPaiement: '',
  txtSaisieFinCessationPaiement: '',
  chsaisiemode30: false,
  chsaisiemode25: false,
  txtSaisierepriseactivite: '',
  txtSaisieProbablejouissance: '',
  txtsaisiesalnetreconstitue: 0,
  chsalouisixmoisactivite: false,
  chsalnonsixmoisactivite: false,
  txtsaisiematinterne: '',
}
const form = reactive({ ...FORM_INITIAL })
const dossiers = ref([])
const ALL_TABLE_COLUMNS = [
  { name: 'index',       label: 'N°',                field: 'index',       align: 'center', style: 'width:50px' },
  { name: 'numdoss',     label: 'N° Dossier',         field: 'numdoss',     align: 'left', sortable: true },
  { name: 'numassu',     label: 'N° Assuré',          field: 'numassu',     align: 'left', sortable: true },
  { name: 'requerant',   label: 'Noms Requérant',     field: 'requerant',   align: 'left', sortable: true },
  { name: 'datedemande', label: 'Date Demande',        field: 'datedemande', align: 'left', sortable: true },
  { name: 'natupres',    label: 'Nature Prestation',  field: 'natupres',    align: 'left', sortable: true },
  { name: 'position',    label: 'Position Dossier',   field: 'position',    align: 'left', sortable: true },
  { name: 'dateposi',    label: 'Date Position',      field: 'dateposi',    align: 'left', sortable: true },
]

const visibleTableColumns = computed(() => {
  if ($q.screen.lt.sm) {
    return ALL_TABLE_COLUMNS.filter((c) => ['index', 'numdoss', 'requerant', 'position'].includes(c.name))
  }
  if ($q.screen.lt.md) {
    return ALL_TABLE_COLUMNS.filter((c) => !['dateposi', 'natupres'].includes(c.name))
  }
  return ALL_TABLE_COLUMNS
})

const tableGrid = computed(() => $q.screen.lt.sm)
const tableRowsPerPageOptions = computed(() => ($q.screen.lt.sm ? [5, 10] : [10, 20, 50]))
const tableDefaultRowsPerPage = computed(() => ($q.screen.lt.sm ? 5 : 10))
const mode30Disabled = ref(false)
const mode25Disabled = ref(false)

const totalMontant = computed(() =>
  (form.chsaisieAP1 ? form.txtsaisiemontap1 : 0) + (form.chsaisieFM1 ? form.txtsaisiemontfm1 : 0)
  + (form.chsaisieAP2 ? form.txtsaisiemontap2 : 0) + (form.chsaisieFM2 ? form.txtsaisiemontfm2 : 0)
  + (form.chsaisieAcc ? form.txtsaisiemontacc : 0) + (form.chsaisieFraisMedicauxAcc ? form.txtsaisiemontfmacc : 0),
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
function calculeDateProbablejouissance(d) {
  form.txtSaisieProbablejouissance = calculerDateProbableDebutJouissance(d)
}
function calculeDateProbableFinConges(d) {
  form.txtSaisieProbablefinconges = form.chsaisieaccpremature
    ? determinerdatefinprobableaccpremature(form.txtSaisieCessationActivite)
    : determinerdatefinprobableaccnormal(d)
}
function calculeDateCessationActivite(d) {
  if (form.chsaisieaccpremature && compareDeuxDates(form.txtSaisieDateDebConges, form.txtSaisieDateeffacc)) {
    form.txtSaisieCessationActivite = determineDateCessationAccPrema(form.txtSaisieDateeffacc)
    form.txtSaisieDateDebConges = form.txtSaisieDateeffacc
    calculeDateProbableFinConges(d)
  } else {
    form.txtSaisieCessationActivite = determineDateCessationAccNormal(d)
    calculeDateProbableFinConges(d)
  }
  calculeDateProbablejouissance(form.txtSaisieCessationActivite)
}
function validateNombrejrIj(nbjrij) {
  if (Number(nbjrij) > 98) {
    $q.notify({ type: 'warning', message: 'Le nombre de Jours de congés de maternité doit être inférieur ou égal à 98', position: 'top' })
    form.txtsaisienbrejoursij = 0
    form.txtsaisienbrejoursijpayer = 0
  }
}
function onBlurNombrejoursIjPayer() {
  form.txtsaisienbrejoursij = form.txtsaisienbrejoursijpayer
  validateNombrejrIj(form.txtsaisienbrejoursij)
}
function valideNombrejrCouches(nbjrcouche) {
  if (Number(nbjrcouche) > 28) {
    $q.notify({ type: 'warning', message: 'Le nombre de Jours de couches doit être inférieur ou égal à 28', position: 'top' })
    form.txtsaisienbrejourscouches = 0
  }
}
function calculerNombrejoursIJPayes() {
  form.txtsaisienbrejoursij = differenceDeuxDatesEnJour(form.txtSaisiefinconges, form.txtSaisieDateDebConges)
  form.txtsaisienbrejoursijpayer = form.txtsaisienbrejoursij
  validateNombrejrIj(form.txtsaisienbrejoursij)
}
function calculMontantAcc(value) {
  const raw = value != null ? value : form.txtsaisienbreenfantssouscontr
  const s = String(raw ?? '')
  if (s.length > 0) {
    const nbre = parseInt(s, 10) || 0
    form.txtsaisiemontacc = 21600 * nbre
  }
}
function onAP1Change(v) { form.txtsaisiemontap1 = v ? 8100 : 0 }
function onAP2Change(v) { form.txtsaisiemontap2 = v ? 8100 : 0 }
function onFM1Change(v) { form.txtsaisiemontfm1 = v ? 200 : 0 }
function onFM2Change(v) { form.txtsaisiemontfm2 = v ? 200 : 0 }
function onFMACCChange(v) { form.txtsaisiemontfmacc = v ? 1400 : 0 }
function onACCChange(v) {
  if (v) {
    form.txtsaisienbreenfantsviables = 1
    form.txtsaisienbreenfantssouscontr = 1
    form.txtsaisiemontacc = 21600
  } else {
    form.txtsaisiemontacc = 0
    form.txtsaisienbreenfantsviables = 0
    form.txtsaisienbreenfantssouscontr = 0
  }
}
function onMode25Change(v) {
  if (v) {
    form.chsaisiemode30 = false
    mode30Disabled.value = true
  } else {
    mode30Disabled.value = false
  }
}
function onMode30Change(v) {
  if (v) {
    form.chsaisiemode25 = false
    mode25Disabled.value = true
  } else {
    mode25Disabled.value = false
  }
}
function onAccPrematureChange() { calculeDateCessationActivite(form.txtSaisieDatepreacc) }
function onDatePreaccChange(d) { calculeDateCessationActivite(d || form.txtSaisieDatepreacc) }
function onFinCongesChange() { calculerNombrejoursIJPayes() }
function onNbreEnfantsSousContrChange(v) { calculMontantAcc(v) }
function onCessationActiviteClick() { calculeDateCessationActivite(form.txtSaisieDatepreacc) }
function onProbableFinCongesClick() { calculeDateProbableFinConges(form.txtSaisieDatepreacc) }
function onProbableJouissanceClick() { calculeDateProbablejouissance(form.txtSaisieCessationActivite) }

/** Filtre local des mocks (aligné JSP : LIKE %valeur% sur le critère choisi). */
function filterMockDossiers() {
  const needle = (txtvaleurdeb.value || '').toUpperCase().trim()
  if (!needle) return [...MOCK_DOSSIERS]
  return MOCK_DOSSIERS.filter((row) => {
    if (cbxcritere.value === 'fnumassu') {
      return (row.numassu || '').toUpperCase().includes(needle)
    }
    if (cbxcritere.value === 'fnomassu') {
      const nom = (row.nomassu || '').toUpperCase()
      const req = (row.requerant || '').toUpperCase()
      return nom.includes(needle) || req.includes(needle)
    }
    return (row.numdoss || '').toUpperCase().includes(needle)
  })
}

function loadDossier(row) {
  form.txtsaisienumdoss = row.numdoss ?? ''
  form.txtsaisienumassu = row.numassu ?? ''
  form.txtsaisiedatedemande = row.datedemande ?? ''
  form.txtsaisienatupres = row.natupres ?? ''
  form.txtsaisietextenomassu = row.nomassu ?? ''
  form.txtsaisietexteprenomassu = row.prenomassu ?? ''
  form.txtSaisieDatepreacc = row.datepreacc ?? ''
  form.txtSaisieDateeffacc = row.dateeffacc ?? ''
  form.txtSaisieDateDebConges = row.datedebconges ?? ''
  form.txtSaisiefinconges = row.datefinconge ?? ''
  form.txtSaisieCessationActivite = row.datecessaactivite ?? ''
  form.txtSaisieProbablejouissance = row.dateprobjouiss ?? ''
  form.txtSaisierepriseactivite = row.datereprise ?? ''
  form.txtSaisieDateDebCessationPaiement = row.datedebcesspaie ?? ''
  form.txtSaisieFinCessationPaiement = row.datefincesspaie ?? ''
  form.txtSaisieProbablefinconges = row.dateprevfincong ?? ''
  form.txtsaisiesexeassu = row.sexe ?? ''
  form.txtSaisieemployeuractuel = row.numemployeur ?? ''
  form.txtSaisieDateExamen1 = row.dateexamen1 ?? ''
  form.txtSaisieDateExamen2 = row.dateexamen2 ?? ''
  form.txtsaisienbreenfantsviables = row.nbreenfvia ?? 0
  form.txtsaisienbreenfantssouscontr = row.nbreviabsoucont ?? 0
  form.txtsaisienbrejoursij = row.nbreij ?? 0
  form.txtsaisienbrejoursijpayer = row.nbreij ?? 0
  form.txtsaisienbrejourscouches = row.nbrejrcouche ?? 0
  form.txtsaisiesalnetreconstitue = row.salreconstitue !== 'null' ? (row.salreconstitue ?? 0) : 0
  form.txtsaisiematinterne = row.matriculeinterne ?? ''
  form.chsaisieAP1 = row.ap1 === 'OUI'
  form.txtsaisiemontap1 = form.chsaisieAP1 ? 8100 : 0
  form.chsaisieFM1 = row.fm1 === 'OUI'
  form.txtsaisiemontfm1 = form.chsaisieFM1 ? 200 : 0
  form.chsaisieAP2 = row.ap2 === 'OUI'
  form.txtsaisiemontap2 = form.chsaisieAP2 ? 8100 : 0
  form.chsaisieFM2 = row.fm2 === 'OUI'
  form.txtsaisiemontfm2 = form.chsaisieFM2 ? 200 : 0
  form.chsaisieAcc = row.acc === 'OUI'
  form.txtsaisiemontacc = form.chsaisieAcc ? 21600 * (parseInt(String(row.nbreenfvia), 10) || 1) : 0
  form.chsaisieFraisMedicauxAcc = row.fmacc === 'OUI'
  form.txtsaisiemontfmacc = form.chsaisieFraisMedicauxAcc ? 1400 : 0
  form.chsaisieIj = row.ij === 'OUI'
  form.chsaisieaccpremature = row.accprema === 'OUI'
  form.chsaisiemode25 = row.basecal === '25'
  form.chsaisiemode30 = !form.chsaisiemode25
  mode30Disabled.value = form.chsaisiemode25
  mode25Disabled.value = form.chsaisiemode30
  showDialog.value = true
  $q.notify({ type: 'positive', message: `Dossier ${row.numdoss} chargé`, position: 'top', timeout: 1500 })
}
function validateForm() {
  if (!form.txtsaisienumdoss) {
    $q.notify({ type: 'negative', message: 'Veuillez Selectionner un dossier dans la liste SVP', position: 'top' })
    return false
  }
  if (form.chsaisieAcc && !form.txtSaisieDateeffacc) {
    $q.notify({ type: 'negative', message: "Veuillez Saisir la date d'accouchement SVP", position: 'top' })
    return false
  }
  if (form.chsaisieAP1 && !form.txtSaisieDateExamen1) {
    $q.notify({ type: 'negative', message: 'Veuillez Saisir la date du Premier Examen Prenatal SVP', position: 'top' })
    return false
  }
  if (form.chsaisieAP2 && !form.txtSaisieDateExamen2) {
    $q.notify({ type: 'negative', message: 'Veuillez Saisir la date du Deuxieme Examen Prenatal SVP', position: 'top' })
    return false
  }
  if (form.chsaisieIj && !form.txtSaisieDateDebConges) {
    $q.notify({ type: 'negative', message: 'Veuillez Saisir la date du Debut Conges de Maternite SVP', position: 'top' })
    return false
  }
  if (form.chsaisieIj && !form.txtsaisiematinterne) {
    $q.notify({ type: 'negative', message: 'La saisie du matricule interne est obligatoire SVP', position: 'top' })
    return false
  }
  return true
}
async function submitForm() {
  const ok = await saisieFormRef.value?.validate()
  if (!ok) return
  if (!validateForm()) return
  if (form.txtSaisiefinconges && form.txtSaisieDateDebConges) {
    calculerNombrejoursIJPayes()
  }
  submitting.value = true
  try {
    await pfStore.submitLiquidation(form)
    $q.notify({ type: 'positive', message: 'Éléments de liquidation enregistrés avec succès !', position: 'top', icon: 'check_circle' })
    showDialog.value = false; resetForm()
  } catch {
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement", position: 'top' })
  } finally { submitting.value = false }
}
function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  mode30Disabled.value = false
  mode25Disabled.value = false
  saisieFormRef.value?.resetValidation()
}
async function searchDossiers() {
  loading.value = true
  errorMsg.value = ''
  try {
    let list = await pfStore.searchDossiers({
      criteria: cbxcritere.value,
      start: txtvaleurdeb.value,
    })
    if (!list.length) {
      list = filterMockDossiers()
    }
    dossiers.value = list
    $q.notify({
      type: dossiers.value.length ? 'positive' : 'info',
      message: dossiers.value.length
        ? `${dossiers.value.length} dossier(s) trouvé(s)`
        : 'Recherche effectuée — aucun résultat',
      position: 'top',
      timeout: 1500,
    })
  } catch {
    dossiers.value = filterMockDossiers()
  } finally {
    loading.value = false
  }
}
function resetSearch() {
  cbxcritere.value = 'fnumdoss'
  txtvaleurdeb.value = '000-'
  errorMsg.value = ''
  dossiers.value = [...MOCK_DOSSIERS]
}

onMounted(() => { dossiers.value = [...MOCK_DOSSIERS] })
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
.pf-legacy-form { background: #f0f0f0; padding: 12px 14px; border-radius: 6px; }
.pf-form-row { margin-bottom: 0; padding: 8px 6px; align-items: stretch; }
.pf-form-row--alt { background: #f5f5f5; }
.pf-legacy-cell {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  min-height: 42px;
}
.pf-legacy-cell--base { align-items: flex-start; }
.pf-legacy-cell--question { flex-direction: column; align-items: center; justify-content: center; padding: 8px 12px; }
.pf-legacy-label {
  flex: 0 0 auto;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
  max-width: 44%;
}
.pf-legacy-input { flex: 1 1 140px; min-width: 0; }
.pf-legacy-input--narrow { flex: 0 1 88px; max-width: 104px; }
.pf-legacy-input--matricule { flex: 0 1 168px; max-width: 200px; }
.pf-legacy-input--date { flex: 1 1 200px; }
.pf-base-calcul { display: flex; flex-direction: column; gap: 4px; }
.pf-six-mois-text { font-size: 0.875rem; margin: 0; color: #333; line-height: 1.4; }
.pf-six-mois-checks { display: flex; gap: 20px; justify-content: center; }
.pf-legacy-btn { min-width: 120px; min-height: 36px; font-size: 0.9rem; border-radius: 4px; }
.pf-legacy-form :deep(.q-field__control) { min-height: 34px; height: 34px; background: #fff; }
.pf-legacy-form :deep(.q-field--outlined .q-field__control:before) { border-color: #bdbdbd; }
.pf-legacy-form :deep(.q-field__native),
.pf-legacy-form :deep(.q-field__input) { font-size: 0.9rem; padding: 0 8px; }
.pf-legacy-form :deep(.q-checkbox__label) { font-size: 0.9rem; }
.pf-legacy-form :deep(.q-checkbox__inner) { font-size: 36px; }
@media (max-width: 1023px) {
  .pf-legacy-label { max-width: 100%; flex: 1 1 100%; }
  .pf-legacy-input,
  .pf-legacy-input--date,
  .pf-legacy-input--narrow,
  .pf-legacy-input--matricule { flex: 1 1 100%; max-width: 100%; }
}
.dialog-form-card { display: flex; flex-direction: column; min-height: 0; }
.dialog-form-card:not(.dialog-form-card--desktop) { height: 100vh; }
.dialog-form-card--desktop {
  width: min(94vw, 1280px);
  max-width: 1280px;
  min-width: min(94vw, 1000px);
  max-height: 94vh;
  height: auto;
  border-radius: 12px;
}
@media (min-width: 1280px) {
  .dialog-form-card--desktop {
    width: 1280px;
    min-width: 1100px;
  }
}
.dialog-bar { min-height: 52px; }
.dialog-bar__title { font-size: 1rem; }
.dialog-bar__title { flex: 1; min-width: 0; }
.dialog-actions { justify-content: center; }
.dialog-body { flex: 1; overflow-y: auto; }
.sep { font-size: 0.72rem; font-weight: 700; color: #1976d2; text-transform: uppercase; letter-spacing: 0.5px; border-left: 3px solid #1976d2; padding: 2px 0 2px 8px; background: linear-gradient(to right, rgba(25,118,210,0.06), transparent); border-radius: 0 4px 4px 0; }
.inline-check { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; padding: 4px 0; }
.chip-montant { font-size: 0.68rem; font-weight: 700; color: #1565c0; background: rgba(25,118,210,0.12); border-radius: 4px; padding: 1px 6px; }
.chip-teal   { color: #00695c; background: rgba(0,137,123,0.12); }
.chip-purple { color: #6a1b9a; background: rgba(106,27,154,0.12); }
.chip-orange { color: #e65100; background: rgba(230,81,0,0.12); }
.recap-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; background: rgba(25,118,210,0.05); border-radius: 8px; padding: 6px 10px; border: 1px solid rgba(25,118,210,0.15); }
@media (max-width: 599px) {
  .elements-liquidation-pf { max-width: 100%; }
  .toolbar-title-text { font-size: 0.95rem; }
  .recap-bar { flex-direction: column; align-items: flex-start; }
  .inline-check { align-items: flex-start; }
}
</style>

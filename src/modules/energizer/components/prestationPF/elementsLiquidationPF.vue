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
         LISTE DES DOSSIERS (recherche fusionnée avec la table)
    ═══════════════════════════════════════════════════════ -->
    <q-card class="dossiers-card">

      <!-- ── EN-TÊTE HERO ── -->
      <div class="dossiers-hero">
        <div class="dossiers-hero__left">
          <div class="dossiers-hero__icon-wrap">
            <q-icon name="folder_special" size="28px" color="white" />
          </div>
          <div>
            <div class="dossiers-hero__title">Liste des Dossiers PF</div>
            <div class="dossiers-hero__sub">Prestations de maternité</div>
          </div>
        </div>
        <q-badge
          class="dossiers-hero__badge"
          :label="`${dossiers.length} dossier${dossiers.length !== 1 ? 's' : ''}`"
        />
      </div>

      <!-- ── BARRE DE RECHERCHE ── -->
      <div class="search-bar-wrap">
        <q-form
          class="search-bar"
          @submit.prevent="searchDossiers"
          @reset.prevent="resetSearch"
        >
          <!-- Critère -->
          <q-select
            v-model="cbxcritere"
            :options="cbxcritereOptions"
            label="Critère"
            outlined
            dense
            emit-value
            map-options
            hide-bottom-space
            color="primary"
            label-color="primary"
            class="search-bar__critere"
            popup-content-class="search-select-popup"
          >
            <template v-slot:prepend>
              <q-icon name="tune" color="primary" size="18px" />
            </template>
          </q-select>

          <!-- Valeur début -->
          <q-input
            v-model="txtvaleurdeb"
            label="Valeur de début"
            outlined
            dense
            clearable
            hide-bottom-space
            color="primary"
            label-color="primary"
            class="search-bar__value"
            input-class="search-input-text"
            @update:model-value="val => (txtvaleurdeb = (val || '').toUpperCase())"
            @keyup.enter="searchDossiers"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" size="18px" />
            </template>
          </q-input>

          <!-- Valeur fin -->
          <q-input
            v-model="txtvaleurfin"
            label="Valeur de fin"
            outlined
            dense
            clearable
            hide-bottom-space
            color="primary"
            label-color="primary"
            class="search-bar__value"
            input-class="search-input-text"
            @update:model-value="val => (txtvaleurfin = (val || '').toUpperCase())"
            @keyup.enter="searchDossiers"
          >
            <template v-slot:prepend>
              <q-icon name="last_page" color="primary" size="18px" />
            </template>
          </q-input>

          <!-- Bouton Rechercher -->
          <q-btn
            type="submit"
            color="primary"
            icon="search"
            label="Rechercher"
            unelevated
            :loading="loading"
            class="search-bar__btn"
            no-caps
          />

          <!-- Reset -->
          <q-btn
            type="reset"
            flat
            round
            dense
            color="primary"
            icon="restart_alt"
            :disable="loading"
            class="search-bar__reset"
          >
            <q-tooltip anchor="bottom middle" self="top middle">Réinitialiser</q-tooltip>
          </q-btn>
        </q-form>

        <!-- Astuce -->
        <div class="search-hint">
          <q-icon name="touch_app" size="14px" class="q-mr-xs" color="primary" />
          <span>Cliquez sur un numéro de dossier pour ouvrir la saisie</span>
        </div>
      </div>

      <!-- ── DIVIDER avec stats ── -->
      <div class="table-divider" v-if="!loading && dossiers.length > 0">
        <span class="table-divider__line" />
        <span class="table-divider__text">
          <q-icon name="check_circle" size="14px" color="positive" class="q-mr-xs" />
          {{ dossiers.length }} résultat{{ dossiers.length !== 1 ? 's' : '' }} trouvé{{ dossiers.length !== 1 ? 's' : '' }}
        </span>
        <span class="table-divider__line" />
      </div>

      <!-- ── TABLE ── -->
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
        no-data-label="Aucun dossier — modifiez les critères ou la valeur de début"
        class="pf-module-table"
      >
        <!-- Header -->
        <template v-slot:header-cell="props">
          <q-th :props="props" class="pf-col-header">
            {{ props.col.label }}
          </q-th>
        </template>

        <!-- Index -->
        <template v-slot:body-cell-index="props">
          <q-td :props="props" class="text-center">
            <span class="row-index">{{ props.rowIndex + 1 }}</span>
          </q-td>
        </template>

        <!-- Numéro dossier -->
        <template v-slot:body-cell-numdoss="props">
          <q-td :props="props">
            <a class="dossier-link" href="#" @click.prevent="loadDossier(props.row)">
              <q-icon name="folder_open" size="14px" class="q-mr-xs link-icon" />
              <span>{{ props.row.numdoss }}</span>
            </a>
          </q-td>
        </template>

        <!-- Position badge -->
        <template v-slot:body-cell-position="props">
          <q-td :props="props">
            <q-badge
              :color="getStatusColor(props.row.position)"
              :label="props.row.position || '—'"
              style="font-size:0.7rem; padding:3px 8px; border-radius:20px"
            />
          </q-td>
        </template>

        <!-- Vue grille (mobile) -->
        <template v-slot:item="props">
          <div
            class="pf-grid-card"
            @click="loadDossier(props.row)"
          >
            <div class="pf-grid-card__header">
              <a class="dossier-link" href="#" @click.prevent.stop="loadDossier(props.row)">
                <q-icon name="folder_open" size="14px" class="q-mr-xs link-icon" />
                {{ props.row.numdoss }}
              </a>
              <q-badge
                :color="getStatusColor(props.row.position)"
                :label="props.row.position || '—'"
                dense
                style="border-radius:20px"
              />
            </div>
            <div class="pf-grid-card__name">{{ props.row.requerant }}</div>
            <div class="pf-grid-card__meta">
              <q-icon name="badge" size="12px" class="q-mr-xs" />{{ props.row.numassu }}
              <q-icon name="event" size="12px" class="q-ml-sm q-mr-xs" />{{ props.row.datedemande }}
            </div>
          </div>
        </template>

        <!-- No data -->
        <template v-slot:no-data="{ message }">
          <div class="no-data-block">
            <q-icon name="inbox" size="3rem" color="primary" style="opacity:.25" />
            <div class="no-data-block__text">{{ message }}</div>
            <div class="no-data-block__sub">Lancez une recherche pour afficher les dossiers</div>
          </div>
        </template>

        <!-- Loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
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
      <q-card
        class="dialog-form-card elements-liquidation-pf-dialog"
        :class="{ 'dialog-form-card--desktop': $q.screen.gt.sm }"
      >
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

            <div class="row pf-form-row q-col-gutter-sm pf-dossier-info-row">
              <div class="col-12 col-md-3">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">N° Dossier</span>
                  <q-input v-model="form.txtsaisienumdoss" name="txtsaisienumdoss" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-5 pf-natupres-col">
                <div class="pf-legacy-cell pf-legacy-cell--natupres-end">
                  <span class="pf-legacy-label">Nature Prestation</span>
                  <q-input v-model="form.txtsaisienatupres" name="txtsaisienatupres" dense outlined readonly hide-bottom-space class="pf-legacy-input pf-legacy-input--natupres" />
                </div>
              </div>
              <div class="col-12 col-md-4 pf-date-demande-col">
                <div class="pf-legacy-cell pf-legacy-cell--date-demande-end">
                  <span class="pf-legacy-label">Date Demande</span>
                  <q-input v-model="form.txtsaisiedatedemande" name="txtsaisiedatedemande" dense outlined readonly hide-bottom-space class="pf-legacy-input pf-legacy-input--date-demande" />
                </div>
              </div>
            </div>

            <div class="row pf-form-row q-col-gutter-sm">
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

            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell pf-legacy-cell--check">
                  <span class="pf-legacy-label">AP1 ?</span>
                  <q-checkbox v-model="form.chsaisieAP1" name="chsaisieAP1" color="primary" dense @update:model-value="onAP1Change" />
                  <input type="hidden" name="txtsaisiemontap1" :value="form.txtsaisiemontap1" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell pf-legacy-cell--check">
                  <span class="pf-legacy-label">FM1 ?</span>
                  <q-checkbox v-model="form.chsaisieFM1" name="chsaisieFM1" color="primary" dense @update:model-value="onFM1Change" />
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
                      <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
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

            <!-- Ligne 4 -->
            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell pf-legacy-cell--check">
                  <span class="pf-legacy-label">AP2 ?</span>
                  <q-checkbox v-model="form.chsaisieAP2" name="chsaisieAP2" color="primary" dense @update:model-value="onAP2Change" />
                  <input type="hidden" name="txtsaisiemontap2" :value="form.txtsaisiemontap2" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell pf-legacy-cell--check">
                  <span class="pf-legacy-label">FM2 ?</span>
                  <q-checkbox v-model="form.chsaisieFM2" name="chsaisieFM2" color="primary" dense @update:model-value="onFM2Change" />
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
                      <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
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

            <!-- Ligne 5 -->
            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell pf-legacy-cell--check">
                  <span class="pf-legacy-label">Accouchement ?</span>
                  <q-checkbox v-model="form.chsaisieAcc" name="chsaisieAcc" color="primary" dense @update:model-value="onACCChange" />
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
                      <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
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

            <!-- Ligne 6 -->
            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell pf-legacy-cell--check">
                  <span class="pf-legacy-label">Frais Médicaux Accouchement</span>
                  <q-checkbox v-model="form.chsaisieFraisMedicauxAcc" name="chsaisieFraisMedicauxAcc" color="primary" dense @update:model-value="onFMACCChange" />
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
                      <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
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

            <!-- Ligne 7 -->
            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell pf-legacy-cell--check">
                  <span class="pf-legacy-label">Indemnité Journalière (IJ) ?</span>
                  <q-checkbox v-model="form.chsaisieIj" name="chsaisieIj" color="primary" dense />
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
                      <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
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

            <!-- Ligne 8 -->
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

            <!-- Ligne 9 -->
            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Employeur Actuel</span>
                  <q-input v-model="form.txtSaisieemployeuractuel" name="txtSaisieemployeuractuel" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--wide"
                    @update:model-value="v => upper('txtSaisieemployeuractuel', v)" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Effective Fin Congés</span>
                  <q-input v-model="form.txtSaisiefinconges" name="txtSaisiefinconges" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date" @update:model-value="onFinCongesChange">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
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

            <!-- Ligne 10 -->
            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell pf-legacy-cell--check">
                  <span class="pf-legacy-label">Accouchement Prématuré ?</span>
                  <q-checkbox v-model="form.chsaisieaccpremature" name="chsaisieaccpremature" color="primary" dense @update:model-value="onAccPrematureChange" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Début Cessation Paiement (Début Non Salaire)</span>
                  <q-input v-model="form.txtSaisieDateDebCessationPaiement" name="txtSaisieDateDebCessationPaiement" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
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
                      <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
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

            <!-- Ligne 11 -->
            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell pf-legacy-cell--base">
                  <div class="text-caption text-weight-bold text-primary q-mb-xs">Base de calcul</div>
                  <div class="pf-base-calcul">
                    <q-checkbox v-model="form.chsaisiemode30" name="chsaisiemode30" color="primary" label="(1/30)" dense :disable="mode30Disabled" @update:model-value="onMode30Change" />
                    <q-checkbox v-model="form.chsaisiemode25" name="chsaisiemode25" color="primary" label="(1/25)" dense :disable="mode25Disabled" @update:model-value="onMode25Change" />
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Reprise Activité</span>
                  <q-input v-model="form.txtSaisierepriseactivite" name="txtSaisierepriseactivite" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
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

            <!-- Ligne 12 -->
            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Salaire Reconstitué</span>
                  <q-input v-model.number="form.txtsaisiesalnetreconstitue" name="txtsaisiesalnetreconstitue" type="number" min="0"
                    dense outlined hide-bottom-space class="pf-legacy-input pf-legacy-input--narrow" />
                </div>
              </div>
              <div class="col-12 col-md-8">
                <div class="pf-legacy-cell pf-legacy-cell--question">
                  <p class="pf-six-mois-text q-mb-xs">
                    La femme (assuré) justifie elle d'au moins six mois d'activités consécutifs avant son début congés ?
                  </p>
                  <div class="pf-six-mois-checks">
                    <q-checkbox v-model="form.chsalouisixmoisactivite" name="chsalouisixmoisactivite" color="primary" label="OUI" dense disable />
                    <q-checkbox v-model="form.chsalnonsixmoisactivite" name="chsalnonsixmoisactivite" color="primary" label="NON" dense disable />
                  </div>
                </div>
              </div>
            </div>

            <!-- Ligne 13 -->
            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Matricule Interne</span>
                  <q-input v-model="form.txtsaisiematinterne" name="txtsaisiematinterne" dense outlined hide-bottom-space class="pf-legacy-input"
                    :rules="[v => !form.chsaisieIj || !!v || 'Matricule interne obligatoire si IJ']"
                    @update:model-value="v => upper('txtsaisiematinterne', v)" />
                </div>
              </div>
            </div>

            <!-- Récap -->
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

            <div class="row q-mt-md pf-form-actions dialog-actions justify-center q-gutter-md">
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
// ← script identique, aucune modification →
import { ref, reactive, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationPfStore } from 'src/modules/energizer/stores/liquidationPfStore.js'
import { usePfDossierCatalogTable } from 'src/modules/energizer/composables/usePfDossierCatalogTable.js'
import { setLegacyUppercaseText } from 'src/modules/energizer/utils/energizerFormInputUtils.js'

defineOptions({ name: 'ElementsLiquidationPF' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()

const submitting = ref(false)
const showDialog = ref(false)
const saisieFormRef = ref(null)

const cbxcritereOptions = [
  { label: 'Num Dossier', value: 'fnumdoss' },
  { label: 'Num Assuré',  value: 'fnumassu' },
  { label: 'Noms Assuré', value: 'fnomassu' },
]

const FORM_INITIAL = {
  txtsaisienumdoss: '', txtsaisienatupres: '', txtsaisiedatedemande: '',
  txtsaisienumassu: '', txtsaisietextenomassu: '', txtsaisietexteprenomassu: '',
  chsaisieAP1: false, txtsaisiemontap1: 0, chsaisieFM1: false, txtsaisiemontfm1: 0,
  txtSaisieDateExamen1: '', chsaisieAP2: false, txtsaisiemontap2: 0,
  chsaisieFM2: false, txtsaisiemontfm2: 0, txtSaisieDateExamen2: '',
  chsaisieAcc: false, txtsaisiemontacc: 0, txtsaisienbreenfantsviables: 0,
  txtSaisieDatepreacc: '', chsaisieFraisMedicauxAcc: false, txtsaisiemontfmacc: 0,
  txtsaisienbreenfantssouscontr: 0, txtSaisieDateeffacc: '', chsaisieIj: false,
  txtsaisienbrejourscouches: 0, txtSaisieDateDebConges: '', txtsaisienbrejoursij: 0,
  txtsaisienbrejoursijpayer: 0, txtsaisiesexeassu: '', txtSaisieCessationActivite: '',
  txtSaisieemployeuractuel: '', txtSaisiefinconges: '', txtSaisieProbablefinconges: '',
  chsaisieaccpremature: false, txtSaisieDateDebCessationPaiement: '',
  txtSaisieFinCessationPaiement: '', chsaisiemode30: false, chsaisiemode25: false,
  txtSaisierepriseactivite: '', txtSaisieProbablejouissance: '',
  txtsaisiesalnetreconstitue: 0, chsalouisixmoisactivite: false,
  chsalnonsixmoisactivite: false, txtsaisiematinterne: '',
}
const form = reactive({ ...FORM_INITIAL })

function upper(field, val) {
  setLegacyUppercaseText(form, field, val)
}

const {
  loading, errorMsg, cbxcritere, txtvaleurdeb, txtvaleurfin, dossiers, searchDossiers, resetSearch,
} = usePfDossierCatalogTable({ pfStore, scope: 'pf', $q, withEndFilter: true })

const ALL_TABLE_COLUMNS = [
  { name: 'index',       label: 'N°',               field: 'index',       align: 'center', style: 'width:50px' },
  { name: 'numdoss',     label: 'N° Dossier',        field: 'numdoss',     align: 'left', sortable: true },
  { name: 'numassu',     label: 'N° Assuré',         field: 'numassu',     align: 'left', sortable: true },
  { name: 'requerant',   label: 'Noms Requérant',    field: 'requerant',   align: 'left', sortable: true },
  { name: 'datedemande', label: 'Date Demande',       field: 'datedemande', align: 'left', sortable: true },
  { name: 'natupres',    label: 'Nature Prestation', field: 'natupres',    align: 'left', sortable: true },
  { name: 'position',    label: 'Position Dossier',  field: 'position',    align: 'left', sortable: true },
  { name: 'dateposi',    label: 'Date Position',     field: 'dateposi',    align: 'left', sortable: true },
]

const visibleTableColumns = computed(() => {
  if ($q.screen.lt.sm)  return ALL_TABLE_COLUMNS.filter(c => ['index','numdoss','requerant','position'].includes(c.name))
  if ($q.screen.lt.md)  return ALL_TABLE_COLUMNS.filter(c => !['dateposi','natupres'].includes(c.name))
  return ALL_TABLE_COLUMNS
})
const tableGrid = computed(() => $q.screen.lt.sm)
const tableRowsPerPageOptions = computed(() => $q.screen.lt.sm ? [5, 10] : [10, 20, 50])
const tableDefaultRowsPerPage = computed(() => $q.screen.lt.sm ? 5 : 10)
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
  const temp = new Date(d.getTime() + 1000*60*60*24*j)
  return `${String(temp.getDate()).padStart(2,'0')}/${String(temp.getMonth()+1).padStart(2,'0')}/${temp.getFullYear()}`
}
function compareDeuxDates(date1, date2) {
  if (!date1||!date2||date1.length<10||date2.length<10) return false
  const d1=new Date(`${date1.substring(3,5)}-${date1.substring(0,2)}-${date1.substring(6,10)}`)
  const d2=new Date(`${date2.substring(3,5)}-${date2.substring(0,2)}-${date2.substring(6,10)}`)
  return d1.getTime()>=d2.getTime()
}
function differenceDeuxDatesEnJour(date1, date2) {
  if (!date1||!date2||date1.length<10||date2.length<10) return 0
  const dateMax=new Date(date1.substring(6,10),date1.substring(3,5),date1.substring(0,2))
  const dateMin=new Date(date2.substring(6,10),date2.substring(3,5),date2.substring(0,2))
  return Math.round((dateMax.getTime()-dateMin.getTime())/(1000*60*60*24))
}
function calculerDateProbableDebutJouissance(d) { return addDays(d, 1) }
function determinerdatefinprobableaccnormal(d)   { return addDays(d, 69) }
function determinerdatefinprobableaccpremature(d){ return addDays(d, 98) }
function determineDateCessationAccNormal(d)      { return addDays(d, -29) }
function determineDateCessationAccPrema(d)       { return addDays(d, -1) }
function calculeDateProbablejouissance(d)  { form.txtSaisieProbablejouissance = calculerDateProbableDebutJouissance(d) }
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
    $q.notify({ type:'warning', message:'Le nombre de Jours de congés de maternité doit être inférieur ou égal à 98', position:'top' })
    form.txtsaisienbrejoursij = 0
    form.txtsaisienbrejoursijpayer = 0
  }
}
function onBlurNombrejoursIjPayer() { form.txtsaisienbrejoursij=form.txtsaisienbrejoursijpayer; validateNombrejrIj(form.txtsaisienbrejoursij) }
function valideNombrejrCouches(nbjrcouche) {
  if (Number(nbjrcouche) > 28) {
    $q.notify({ type:'warning', message:'Le nombre de Jours de couches doit être inférieur ou égal à 28', position:'top' })
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
  if (s.length > 0) { const nbre = parseInt(s,10)||0; form.txtsaisiemontacc = 21600*nbre }
}
function onAP1Change(v)  { form.txtsaisiemontap1 = v ? 8100 : 0 }
function onAP2Change(v)  { form.txtsaisiemontap2 = v ? 8100 : 0 }
function onFM1Change(v)  { form.txtsaisiemontfm1 = v ? 200 : 0 }
function onFM2Change(v)  { form.txtsaisiemontfm2 = v ? 200 : 0 }
function onFMACCChange(v){ form.txtsaisiemontfmacc = v ? 1400 : 0 }
function onACCChange(v) {
  if (v) { form.txtsaisienbreenfantsviables=1; form.txtsaisienbreenfantssouscontr=1; form.txtsaisiemontacc=21600 }
  else   { form.txtsaisiemontacc=0; form.txtsaisienbreenfantsviables=0; form.txtsaisienbreenfantssouscontr=0 }
}
function onMode25Change(v) { if(v){form.chsaisiemode30=false;mode30Disabled.value=true}else{mode30Disabled.value=false} }
function onMode30Change(v) { if(v){form.chsaisiemode25=false;mode25Disabled.value=true}else{mode25Disabled.value=false} }
function onAccPrematureChange()     { calculeDateCessationActivite(form.txtSaisieDatepreacc) }
function onDatePreaccChange(d)      { calculeDateCessationActivite(d||form.txtSaisieDatepreacc) }
function onFinCongesChange()        { calculerNombrejoursIJPayes() }
function onNbreEnfantsSousContrChange(v) { calculMontantAcc(v) }
function onCessationActiviteClick() { calculeDateCessationActivite(form.txtSaisieDatepreacc) }
function onProbableFinCongesClick() { calculeDateProbableFinConges(form.txtSaisieDatepreacc) }
function onProbableJouissanceClick(){ calculeDateProbablejouissance(form.txtSaisieCessationActivite) }

function loadDossier(row) {
  form.txtsaisienumdoss=row.numdoss??''; form.txtsaisienumassu=row.numassu??''
  form.txtsaisiedatedemande=row.datedemande??''; form.txtsaisienatupres=row.natupres??''
  form.txtsaisietextenomassu=row.nomassu??''; form.txtsaisietexteprenomassu=row.prenomassu??''
  form.txtSaisieDatepreacc=row.datepreacc??''; form.txtSaisieDateeffacc=row.dateeffacc??''
  form.txtSaisieDateDebConges=row.datedebconges??''; form.txtSaisiefinconges=row.datefinconge??''
  form.txtSaisieCessationActivite=row.datecessaactivite??''; form.txtSaisieProbablejouissance=row.dateprobjouiss??''
  form.txtSaisierepriseactivite=row.datereprise??''; form.txtSaisieDateDebCessationPaiement=row.datedebcesspaie??''
  form.txtSaisieFinCessationPaiement=row.datefincesspaie??''; form.txtSaisieProbablefinconges=row.dateprevfincong??''
  form.txtsaisiesexeassu=row.sexe??''; form.txtSaisieemployeuractuel=row.numemployeur??''
  form.txtSaisieDateExamen1=row.dateexamen1??''; form.txtSaisieDateExamen2=row.dateexamen2??''
  form.txtsaisienbreenfantsviables=row.nbreenfvia??0; form.txtsaisienbreenfantssouscontr=row.nbreviabsoucont??0
  form.txtsaisienbrejoursij=row.nbreij??0; form.txtsaisienbrejoursijpayer=row.nbreij??0
  form.txtsaisienbrejourscouches=row.nbrejrcouche??0
  form.txtsaisiesalnetreconstitue=row.salreconstitue!=='null'?(row.salreconstitue??0):0
  form.txtsaisiematinterne=row.matriculeinterne??''
  form.chsaisieAP1=row.ap1==='OUI'; form.txtsaisiemontap1=form.chsaisieAP1?8100:0
  form.chsaisieFM1=row.fm1==='OUI'; form.txtsaisiemontfm1=form.chsaisieFM1?200:0
  form.chsaisieAP2=row.ap2==='OUI'; form.txtsaisiemontap2=form.chsaisieAP2?8100:0
  form.chsaisieFM2=row.fm2==='OUI'; form.txtsaisiemontfm2=form.chsaisieFM2?200:0
  form.chsaisieAcc=row.acc==='OUI'; form.txtsaisiemontacc=form.chsaisieAcc?21600*(parseInt(String(row.nbreenfvia),10)||1):0
  form.chsaisieFraisMedicauxAcc=row.fmacc==='OUI'; form.txtsaisiemontfmacc=form.chsaisieFraisMedicauxAcc?1400:0
  form.chsaisieIj=row.ij==='OUI'; form.chsaisieaccpremature=row.accprema==='OUI'
  form.chsaisiemode25=row.basecal==='25'; form.chsaisiemode30=!form.chsaisiemode25
  mode30Disabled.value=form.chsaisiemode25; mode25Disabled.value=form.chsaisiemode30
  showDialog.value=true
  $q.notify({ type:'positive', message:`Dossier ${row.numdoss} chargé`, position:'top', timeout:1500 })
}
function validateForm() {
  if (!form.txtsaisienumdoss) { $q.notify({type:'negative',message:'Veuillez Selectionner un dossier dans la liste SVP',position:'top'}); return false }
  if (form.chsaisieAcc&&!form.txtSaisieDateeffacc) { $q.notify({type:'negative',message:"Veuillez Saisir la date d'accouchement SVP",position:'top'}); return false }
  if (form.chsaisieAP1&&!form.txtSaisieDateExamen1) { $q.notify({type:'negative',message:'Veuillez Saisir la date du Premier Examen Prenatal SVP',position:'top'}); return false }
  if (form.chsaisieAP2&&!form.txtSaisieDateExamen2) { $q.notify({type:'negative',message:'Veuillez Saisir la date du Deuxieme Examen Prenatal SVP',position:'top'}); return false }
  if (form.chsaisieIj&&!form.txtSaisieDateDebConges) { $q.notify({type:'negative',message:'Veuillez Saisir la date du Debut Conges de Maternite SVP',position:'top'}); return false }
  if (form.chsaisieIj&&!form.txtsaisiematinterne) { $q.notify({type:'negative',message:'La saisie du matricule interne est obligatoire SVP',position:'top'}); return false }
  return true
}
async function submitForm() {
  const ok = await saisieFormRef.value?.validate()
  if (!ok) return
  if (!validateForm()) return
  if (form.txtSaisiefinconges && form.txtSaisieDateDebConges) calculerNombrejoursIJPayes()
  submitting.value = true
  try {
    const result = await pfStore.submitLiquidation(form)
    $q.notify({ type:'positive', message:result?.message||'Éléments de liquidation enregistrés avec succès !', position:'top', icon:'check_circle' })
    showDialog.value = false
    resetForm()
  } catch (error) {
    $q.notify({ type:'negative', message:error?.message||"Erreur lors de l'enregistrement", position:'top' })
  } finally { submitting.value = false }
}
function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  mode30Disabled.value = false
  mode25Disabled.value = false
  saisieFormRef.value?.resetValidation()
}
function formatMoney(v) { return new Intl.NumberFormat('fr-FR').format(Number(v)||0) }
function getStatusColor(s) {
  if (!s) return 'grey-5'
  const t = s.toLowerCase()
  if (t.includes('cours'))   return 'orange-7'
  if (t.includes('attente')) return 'blue-6'
  if (t.includes('transmi')) return 'teal-6'
  if (t.includes('annul'))   return 'negative'
  return 'grey-6'
}
</script>

<style scoped>
/* ══════════════════════════════════════════════
   CONTENEUR PRINCIPAL
══════════════════════════════════════════════ */
.elements-liquidation-pf {
  max-width: 1400px;
  margin: 0 auto;
}

/* ══════════════════════════════════════════════
   CARD PRINCIPALE
══════════════════════════════════════════════ */
.dossiers-card {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(25, 118, 210, 0.10), 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid rgba(25, 118, 210, 0.10);
}

/* ══════════════════════════════════════════════
   EN-TÊTE (HERO)
══════════════════════════════════════════════ */
.dossiers-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 16px;
  background: linear-gradient(135deg, #1565c0 0%, #1976d2 60%, #42a5f5 100%);
  position: relative;
  overflow: hidden;
}
.dossiers-hero::before,
.dossiers-hero::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
}
.dossiers-hero::before { width: 180px; height: 180px; top: -60px; right: 60px; }
.dossiers-hero::after  { width:  90px; height:  90px; bottom: -30px; right: 20px; }

.dossiers-hero__left {
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 1;
}
.dossiers-hero__icon-wrap {
  width: 46px; height: 46px;
  border-radius: 12px;
  background: rgba(255,255,255,0.18);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
}
.dossiers-hero__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  letter-spacing: 0.01em;
}
.dossiers-hero__sub {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.75);
  margin-top: 2px;
}
.dossiers-hero__badge {
  z-index: 1;
  background: rgba(255,255,255,0.22) !important;
  color: #fff !important;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 20px;
  border: 1.5px solid rgba(255,255,255,0.35);
  backdrop-filter: blur(4px);
  letter-spacing: 0.02em;
}

/* ══════════════════════════════════════════════
   BARRE DE RECHERCHE
══════════════════════════════════════════════ */
.search-bar-wrap {
  padding: 16px 20px 10px;
  background: #fafbff;
  border-bottom: 1px solid rgba(25, 118, 210, 0.08);
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.search-bar__critere { flex: 0 0 200px; min-width: 160px; }
.search-bar__value   { flex: 1 1 220px;  min-width: 180px; }
.search-bar__btn {
  height: 40px;
  min-width: 130px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  flex-shrink: 0;
  transition: box-shadow 0.2s, transform 0.1s;
}
.search-bar__btn:hover  { box-shadow: 0 4px 14px rgba(25,118,210,0.35); transform: translateY(-1px); }
.search-bar__btn:active { transform: translateY(0); }
.search-bar__reset { flex-shrink: 0; transition: transform 0.25s; }
.search-bar__reset:hover { transform: rotate(180deg); }

.search-bar :deep(.q-field__control) {
  border-radius: 8px;
  height: 40px;
  min-height: 40px;
  background: #fff;
}
.search-bar :deep(.q-field--outlined .q-field__control:before) {
  border-color: rgba(25, 118, 210, 0.28);
  transition: border-color 0.2s;
}
.search-bar :deep(.q-field--outlined.q-field--focused .q-field__control:before) {
  border-color: #1976d2;
  border-width: 2px;
}
.search-bar :deep(.q-field__native),
.search-bar :deep(.q-field__input) {
  font-size: 0.92rem;
  color: #1a1a2e;
  font-weight: 500;
}
.search-hint {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 0.78rem;
  color: #1976d2;
  opacity: 0.75;
}

/* ══════════════════════════════════════════════
   SÉPARATEUR RÉSULTATS
══════════════════════════════════════════════ */
.table-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 20px;
  background: #fafbff;
}
.table-divider__line { flex: 1; height: 1px; background: rgba(25,118,210,0.12); }
.table-divider__text {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  color: #555;
  white-space: nowrap;
}

/* ══════════════════════════════════════════════
   TABLE
══════════════════════════════════════════════ */
.pf-module-table { background: transparent; }

.pf-col-header {
  background: #1976d2;
  color: #fff !important;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 10px 12px;
  white-space: nowrap;
}
.pf-module-table :deep(tbody tr:nth-child(even)) { background: rgba(25,118,210,0.03); }
.pf-module-table :deep(tbody tr) { transition: background 0.15s; }
.pf-module-table :deep(tbody tr:hover) { background: rgba(25,118,210,0.07) !important; }
.pf-module-table :deep(td) { font-size: 0.87rem; padding: 8px 12px; }

.row-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: rgba(25,118,210,0.1);
  color: #1976d2;
  font-size: 0.75rem;
  font-weight: 700;
}
.dossier-link {
  display: inline-flex;
  align-items: center;
  color: #1565c0;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  letter-spacing: 0.01em;
  transition: color 0.15s;
}
.dossier-link .link-icon { opacity: 0.6; transition: opacity 0.15s, transform 0.15s; }
.dossier-link:hover { color: #0d47a1; }
.dossier-link:hover .link-icon { opacity: 1; transform: translateX(2px); }

/* Carte grille (mobile) */
.pf-grid-card {
  background: #fff;
  border: 1px solid rgba(25,118,210,0.12);
  border-radius: 10px;
  padding: 12px 14px;
  margin: 6px;
  cursor: pointer;
  transition: box-shadow 0.18s, transform 0.15s;
}
.pf-grid-card:hover { box-shadow: 0 4px 16px rgba(25,118,210,0.15); transform: translateY(-2px); }
.pf-grid-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.pf-grid-card__name { font-size: 0.9rem; font-weight: 600; color: #222; }
.pf-grid-card__meta { display: flex; align-items: center; font-size: 0.78rem; color: #888; margin-top: 4px; }

/* No data */
.no-data-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 8px;
}
.no-data-block__text { font-size: 0.95rem; color: #666; font-weight: 500; text-align: center; }
.no-data-block__sub  { font-size: 0.8rem;  color: #aaa; text-align: center; }

/* ══════════════════════════════════════════════
   DIALOG — structure générale
══════════════════════════════════════════════ */
.dialog-form-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.dialog-form-card:not(.dialog-form-card--desktop) {
  height: 100vh;
}
.dialog-form-card--desktop {
  width: min(94vw, 1280px);
  max-width: 1280px;
  min-width: min(94vw, 1000px);
  max-height: 94vh;
  height: auto;
  border-radius: 12px;
}
@media (min-width: 1280px) {
  .dialog-form-card--desktop { width: 1280px; min-width: 1100px; }
}
.dialog-bar { min-height: 52px; }
.dialog-bar__title { flex: 1; min-width: 0; font-size: 1rem; }
.dialog-body { flex: 1; overflow-y: auto; }
.dialog-actions { justify-content: center; }

/* ══════════════════════════════════════════════
   FORMULAIRE LEGACY — layout des lignes
══════════════════════════════════════════════ */
@import 'src/css/pf-legacy-form.scss';

/* Boutons calcul inline */
.pf-legacy-btn {
  min-width: 110px;
  min-height: 34px;
  font-size: 0.85rem;
  border-radius: 4px;
}

/* Base de calcul (radio 25 / 30) */
.pf-base-calcul {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pf-six-mois-text {
  font-size: 0.875rem;
  color: #333;
  line-height: 1.4;
  margin: 0;
}
.pf-six-mois-checks {
  display: flex;
  gap: 20px;
  justify-content: center;
}

/* ══════════════════════════════════════════════
   BARRE RÉCAPITULATIF (montant total)
══════════════════════════════════════════════ */
.recap-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  background: rgba(25,118,210,0.05);
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(25,118,210,0.15);
}

/* ══════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════ */
@media (max-width: 767px) {
  .dossiers-hero { padding: 14px 16px 12px; }
  .dossiers-hero__title { font-size: 0.95rem; }
  .search-bar-wrap { padding: 12px 14px 8px; }
  .search-bar__critere,
  .search-bar__value,
  .search-bar__btn { flex: 1 1 100%; }
}

@media (max-width: 599px) {
  .elements-liquidation-pf { max-width: 100%; }

  /* Les champs du formulaire passent en colonne sur très petit écran */
  .pf-legacy-cell { flex-wrap: wrap; }
  .pf-legacy-label { max-width: 100%; flex: 1 1 100%; }
  .pf-legacy-input,
  .pf-legacy-input--narrow,
  .pf-legacy-input--date,
  .pf-legacy-input--wide { max-width: 100%; flex: 1 1 100%; }

  .recap-bar { flex-direction: column; align-items: flex-start; }
}
</style>

<style>
/* Dialog Apériodique : Quasar portal → styles non-scoped (classe elements-liquidation-pf-dialog) */
.elements-liquidation-pf-dialog.dialog-form-card--desktop {
  width: min(96vw, 1400px) !important;
  max-width: 1400px !important;
  min-width: min(96vw, 1120px) !important;
}
@media (min-width: 1400px) {
  .elements-liquidation-pf-dialog.dialog-form-card--desktop {
    width: 1400px !important;
    min-width: 1200px !important;
  }
}

.elements-liquidation-pf-dialog .pf-legacy-cell:has(.pf-legacy-input--date) .pf-legacy-label {
  flex: 1 1 auto;
  max-width: 48%;
}
.elements-liquidation-pf-dialog .pf-legacy-input--date-demande,
.elements-liquidation-pf-dialog .pf-legacy-input--date-demande .q-field {
  flex: 0 0 auto !important;
  width: 100% !important;
  min-width: 7.25rem !important;
  max-width: 9.5rem !important;
}
.elements-liquidation-pf-dialog .pf-legacy-input.pf-legacy-input--date {
  flex: 0 1 300px !important;
  width: 100% !important;
  min-width: 10.5rem !important;
  max-width: 300px !important;
}
.elements-liquidation-pf-dialog .pf-legacy-input--date .q-field {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 300px !important;
}
.elements-liquidation-pf-dialog .pf-legacy-input--date .q-field__control {
  min-height: 38px;
  height: 38px;
}
.elements-liquidation-pf-dialog .pf-legacy-input--date .q-field__native,
.elements-liquidation-pf-dialog .pf-legacy-input--date .q-field__input {
  font-size: 0.92rem;
  letter-spacing: 0.02em;
}

@media (max-width: 767px) {
  .elements-liquidation-pf-dialog.dialog-form-card--desktop {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
}
@media (max-width: 599px) {
  .elements-liquidation-pf-dialog .pf-legacy-input.pf-legacy-input--date,
  .elements-liquidation-pf-dialog .pf-legacy-input--date .q-field {
    flex: 1 1 100% !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
}
</style>

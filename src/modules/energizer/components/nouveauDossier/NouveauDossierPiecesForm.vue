<template>
  <div class="nouveau-dossier-pieces nouveau-dossier-form">
    <q-banner v-if="isInitial" rounded class="bg-green-1 text-positive q-mb-md">
      <template #avatar>
        <q-icon name="check_circle" color="positive" />
      </template>
      <span class="text-weight-medium">
        {{ t('reception.nouveauDossier.piecesSavedBanner', { num: ctx.numdossier }) }}
      </span>
    </q-banner>

    <div
      v-if="store.showAssureOnPieces && ctx.nom_complet"
      class="nouveau-dossier-assure-info q-mb-md"
    >
      <span>
        <span class="nouveau-dossier-assure-info__label">{{ t('reception.nouveauDossier.nomAssure') }}</span>
        <span class="nouveau-dossier-assure-info__value">{{ ctx.nom_complet }}</span>
      </span>
      <q-separator vertical spaced inset />
      <span>
        <span class="nouveau-dossier-assure-info__label">{{ t('reception.nouveauDossier.numAssure') }}</span>
        <span class="nouveau-dossier-assure-info__value">{{ ctx.numassu }}</span>
      </span>
      <q-separator vertical spaced inset />
      <span>
        <span class="nouveau-dossier-assure-info__label">{{ t('reception.nouveauDossier.dateNaissance') }}</span>
        <span class="nouveau-dossier-assure-info__value">{{ ctx.date_naiss }}</span>
      </span>
    </div>

    <p class="text-subtitle2 text-center text-primary text-weight-medium q-mb-sm">
      {{ formTitle }}
    </p>

    <div
      v-for="row in store.pieceRows"
      :key="row.index"
      class="piece-row q-pa-sm q-mb-sm rounded-borders bg-grey-2"
    >
      <div class="piece-row-grid">
        <div class="piece-row-grid__index">
          {{ row.index }}
        </div>
        <div class="piece-row-grid__nature">
          <q-select
            v-model="row.person"
            :name="'person' + row.index"
            :label="t('reception.nouveauDossier.naturePiece')"
            class="piece-field-nature"
            outlined
            dense
            :required="!row._readonly"
            emit-value
            map-options
            :options="store.pieceTypeOptions"
            option-value="value"
            option-label="label"
            :readonly="row._readonly"
          />
        </div>
        <div>
          <q-input
            v-model="row.titulaire"
            :name="'titulaire' + row.index"
            :label="t('reception.nouveauDossier.titulaire')"
            outlined
            dense
            :required="!row._readonly"
            :readonly="row._readonly"
          />
        </div>
        <div>
          <q-input
            v-model="row.dateDep"
            :name="'dateDep' + row.index"
            :label="t('reception.nouveauDossier.dateDepot')"
            outlined
            dense
            mask="##-##-####"
            fill-mask
            hint="JJ-MM-AAAA"
            class="piece-date-input"
            :required="!row._readonly"
            :readonly="row._readonly"
          >
            <template #append>
              <q-icon name="event" color="primary" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="row.dateDep" mask="DD-MM-YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="OK" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div>
          <q-input
            v-model="row.dateVal"
            :name="'dateVal' + row.index"
            :label="t('reception.nouveauDossier.dateSignature')"
            outlined
            dense
            mask="##-##-####"
            fill-mask
            hint="JJ-MM-AAAA"
            class="piece-date-input"
            required
          >
            <template #append>
              <q-icon name="event" color="primary" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="row.dateVal" mask="DD-MM-YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="OK" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div>
          <q-input
            v-model="row.observ"
            :name="'observ' + row.index"
            :label="t('reception.nouveauDossier.observations')"
            outlined
            dense
            :readonly="row._readonly"
          />
        </div>
        <div class="piece-row-grid__numero">
          <q-select
            v-model="row.nbre"
            :name="'nbre' + row.index"
            :label="t('reception.nouveauDossier.nbrePiece')"
            class="piece-field-numero"
            outlined
            dense
            required
            emit-value
            map-options
            :options="store.nbrePieceOptions"
          />
        </div>
      </div>
    </div>

    <input type="hidden" name="psize" :value="store.piecesPsize" />
    <input type="hidden" name="numdossier" :value="ctx.numdossier" />
    <input type="hidden" name="objet" :value="ctx.objet" />

    <div class="row justify-center q-gutter-sm q-mt-lg">
      <template v-if="isReception">
        <q-btn
          outline
          color="grey-8"
          no-caps
          :label="t('reception.nouveauDossier.pause')"
          :loading="store.loadingPieces"
          @click="store.goToJaccueil()"
        />
        <q-btn
          outline
          color="primary"
          no-caps
          :label="t('reception.nouveauDossier.terminer')"
          :loading="store.loadingFinalize"
          @click="store.terminerDossier()"
        />
      </template>
      <q-btn
        outline
        color="negative"
        no-caps
        :label="t('reception.nouveauDossier.enlever')"
        @click="store.removeLastPieceRow()"
      />
      <q-btn
        outline
        color="secondary"
        no-caps
        :label="t('reception.nouveauDossier.ajouter')"
        @click="store.addPieceRow()"
      />
      <q-btn
        color="primary"
        unelevated
        no-caps
        icon="done"
        :label="t('reception.nouveauDossier.valider')"
        :loading="store.loadingPieces"
        @click="store.validatePiecesToRecap()"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNouveauDossierStore } from 'src/modules/energizer/stores/nouveauDossierStore.js'

const props = defineProps({
  mode: {
    type: String,
    default: 'initial',
    validator: (v) => ['initial', 'reception'].includes(v),
  },
})

const { t } = useI18n()
const store = useNouveauDossierStore()

const isInitial = computed(() => props.mode === 'initial')
const isReception = computed(() => props.mode === 'reception')
const ctx = computed(() => store.piecesContext ?? {})

const formTitle = computed(() => {
  if (isReception.value) {
    return t('reception.nouveauDossier.manualPiecesTitle', { num: ctx.value.numdossier })
  }
  return t('reception.nouveauDossier.addPiecesTitle', { num: ctx.value.numdossier })
})
</script>

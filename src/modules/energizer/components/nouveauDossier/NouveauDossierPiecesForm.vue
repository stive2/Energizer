<template>
  <q-form
    ref="piecesFormRef"
    class="nouveau-dossier-pieces nouveau-dossier-form"
    greedy
    @submit.prevent="onValidate"
  >
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
        <span class="nouveau-dossier-assure-info__label">{{
          t('reception.nouveauDossier.nomAssure')
        }}</span>
        <span class="nouveau-dossier-assure-info__value">{{ ctx.nom_complet }}</span>
      </span>
      <q-separator vertical spaced inset />
      <span>
        <span class="nouveau-dossier-assure-info__label">{{
          t('reception.nouveauDossier.numAssure')
        }}</span>
        <span class="nouveau-dossier-assure-info__value">{{ ctx.numassu }}</span>
      </span>
      <q-separator vertical spaced inset />
      <span>
        <span class="nouveau-dossier-assure-info__label">{{
          t('reception.nouveauDossier.dateNaissance')
        }}</span>
        <span class="nouveau-dossier-assure-info__value">{{ ctx.date_naiss }}</span>
      </span>
    </div>

    <p class="text-subtitle2 text-center text-primary text-weight-medium q-mb-sm">
      {{ formTitle }}
    </p>

    <div
      v-for="row in store.pieceRows"
      :key="row._uid"
      class="piece-row q-pa-sm q-mb-sm rounded-borders bg-grey-2"
    >
      <div class="piece-row-grid">
        <div class="piece-row-grid__index">
          {{ row.index }}
        </div>
        <div class="piece-row-grid__field piece-row-grid__nature">
          <q-select
            v-model="row.person"
            v-bind="legacyFieldAttrs"
            :key="`person-${row._uid}-${store.pieceOptionsVersion}`"
            :name="'person' + row.index"
            :label="t('reception.nouveauDossier.naturePiece')"
            class="piece-field-nature"
            outlined
            dense
            stack-label
            emit-value
            map-options
            :options="store.pieceTypeOptions"
            option-value="value"
            option-label="label"
            :loading="store.isOpeningPieces && !store.pieceTypeOptions.length"
            :hint="!store.pieceTypeOptions.length ? t('reception.nouveauDossier.pieceTypesLoading') : undefined"
            behavior="menu"
            options-dense
          >
            <template #prepend>
              <q-icon :name="pieceFieldIcon('person')" color="primary" />
            </template>
          </q-select>
        </div>
        <div class="piece-row-grid__field">
          <q-input
            v-model="row.titulaire"
            v-bind="legacyFieldAttrs"
            :name="'titulaire' + row.index"
            :label="t('reception.nouveauDossier.titulaire')"
            outlined
            dense
            stack-label
            :required="!row._readonly"
            :readonly="row._readonly"
            :rules="titulaireRules(row._readonly)"
            @update:model-value="(val) => !row._readonly && upperRow(row, 'titulaire', val)"
          >
            <template #prepend>
              <q-icon :name="pieceFieldIcon('titulaire')" color="primary" />
            </template>
          </q-input>
        </div>
        <div class="piece-row-grid__field">
          <q-input
            v-model="row.dateDep"
            v-bind="legacyFieldAttrs"
            :name="'dateDep' + row.index"
            :label="t('reception.nouveauDossier.dateDepot')"
            outlined
            dense
            stack-label
            mask="##-##-####"
            fill-mask
            class="piece-date-input"
            :required="!row._readonly"
            :readonly="row._readonly"
            :rules="dateDepRules(row._readonly)"
          >
            <template #prepend>
              <q-icon :name="pieceFieldIcon('dateDep')" color="primary" />
            </template>
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
        <div class="piece-row-grid__field">
          <q-input
            v-model="row.dateVal"
            v-bind="legacyFieldAttrs"
            :name="'dateVal' + row.index"
            :label="t('reception.nouveauDossier.dateSignature')"
            outlined
            dense
            stack-label
            mask="##-##-####"
            fill-mask
            class="piece-date-input"
            :required="!row._readonly"
            :readonly="row._readonly"
            :rules="dateValRules(row._readonly, row.dateDep)"
          >
            <template #prepend>
              <q-icon :name="pieceFieldIcon('dateVal')" color="primary" />
            </template>
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
        <div class="piece-row-grid__field">
          <q-input
            v-model="row.observ"
            v-bind="legacyFieldAttrs"
            :name="'observ' + row.index"
            :label="t('reception.nouveauDossier.observations')"
            outlined
            dense
            stack-label
            :readonly="row._readonly"
            @update:model-value="(val) => !row._readonly && upperRow(row, 'observ', val)"
          >
            <template #prepend>
              <q-icon :name="pieceFieldIcon('observ')" color="primary" />
            </template>
          </q-input>
        </div>
        <div class="piece-row-grid__field piece-row-grid__numero">
          <q-select
            v-model="row.nbre"
            v-bind="legacyFieldAttrs"
            :name="'nbre' + row.index"
            :label="t('reception.nouveauDossier.nbrePiece')"
            class="piece-field-numero"
            outlined
            dense
            stack-label
            required
            emit-value
            map-options
            :options="store.nbrePieceOptions"
            :rules="nbreRules()"
          >
            <template #prepend>
              <q-icon :name="pieceFieldIcon('nbre')" color="primary" />
            </template>
          </q-select>
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
          :loading="store.isPausingPieces"
          @click="store.pauseDossier()"
        />
        <q-btn
          outline
          color="primary"
          no-caps
          :label="t('reception.nouveauDossier.terminer')"
          :loading="store.isTerminerCorbeilleLoading"
          @click="store.terminerVersCorbeille()"
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
        type="submit"
        color="primary"
        unelevated
        no-caps
        icon="done"
        :label="t('reception.nouveauDossier.valider')"
        :loading="store.isValidatingPieces"
      />
    </div>
  </q-form>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNouveauDossierStore } from 'src/modules/energizer/stores/nouveauDossierStore.js'
import { setLegacyUppercaseText } from 'src/modules/energizer/utils/energizerFormInputUtils.js'
import {
  LEGACY_QFIELD_VALIDATE_ATTRS,
  pieceFieldIcon,
} from 'src/modules/energizer/utils/nouveauDossierFormFields.js'
import { useNouveauDossierPieceRules } from 'src/modules/energizer/composables/useNouveauDossierPieceRules.js'

const props = defineProps({
  mode: {
    type: String,
    default: 'initial',
    validator: (v) => ['initial', 'reception'].includes(v),
  },
})

const { t } = useI18n()
const store = useNouveauDossierStore()
const piecesFormRef = ref(null)
const legacyFieldAttrs = LEGACY_QFIELD_VALIDATE_ATTRS

const isInitial = computed(() => props.mode === 'initial')
const isReception = computed(() => props.mode === 'reception')
const ctx = computed(() => store.piecesContext ?? {})

const { titulaireRules, dateDepRules, dateValRules, nbreRules } = useNouveauDossierPieceRules({
  mode: props.mode,
  getDatedemande: () => ctx.value.datedemande,
})

function upperRow(row, field, val) {
  setLegacyUppercaseText(row, field, val)
}

const formTitle = computed(() => {
  if (isReception.value) {
    return t('reception.nouveauDossier.manualPiecesTitle', { num: ctx.value.numdossier })
  }
  return t('reception.nouveauDossier.addPiecesTitle', { num: ctx.value.numdossier })
})

async function onValidate() {
  const ok = await piecesFormRef.value?.validate()
  if (!ok) return
  store.validatePiecesToRecap()
}

onMounted(() => {
  store.ensurePieceTypeOptions()
})

watch(
  () => store.step,
  (step) => {
    if (step === 'pieces' || step === 'piecesReception') {
      store.ensurePieceTypeOptions()
    }
  },
)
</script>

<template>

  <q-dialog

    :model-value="store.dialogOpen"

    persistent

    maximized-on-small

    class="nouveau-dossier-dialog"

    @update:model-value="onDialogToggle"

  >

    <q-card
      class="nouveau-dossier-dialog__card"
      :class="{
        'nouveau-dossier-dialog__card--form': store.step === 'form',
        'nouveau-dossier-dialog__card--pieces': isPiecesStep,
      }"
    >

      <q-toolbar class="bg-primary text-white nouveau-dossier-dialog__toolbar">

        <q-toolbar-title class="text-subtitle1 text-weight-bold absolute-center text-center">

          {{ toolbarTitle }}

        </q-toolbar-title>

        <q-btn flat round dense icon="close" class="q-ml-auto" @click="store.closeDialog()" />

      </q-toolbar>



      <q-card-section class="scroll nouveau-dossier-dialog__body">

        <template v-if="store.step === 'pick'">

          <q-inner-loading :showing="store.loadingMeta" />

          <p class="text-body2 text-primary text-center q-mb-md">
            {{ t('reception.nouveauDossier.pickLead') }}
          </p>

          <q-select

            v-model="pickedObjet"

            name="objet"

            :label="t('reception.nouveauDossier.selectType')"

            outlined

            dense

            required

            emit-value

            map-options

            :options="store.objetOptions"

            option-value="value"

            option-label="label"

            :rules="[required]"

            class="q-mb-md nouveau-dossier-dialog__pick-select"

          />

          <div class="row justify-end q-gutter-sm">

            <q-btn

              flat

              no-caps

              color="grey-8"

              label="Annuler"

              @click="store.closeDialog()"

            />

            <q-btn

              color="primary"

              unelevated

              no-caps

              icon="arrow_forward"

              :label="t('reception.nouveauDossier.continue')"

              :disable="!pickedObjet"

              @click="onContinue"

            />

          </div>

        </template>



        <template v-else-if="store.step === 'form'">

          <div class="q-mb-md">

            <q-btn

              flat

              dense

              no-caps

              color="primary"

              icon="arrow_back"

              :label="t('reception.nouveauDossier.backPick')"

              @click="store.backToPick()"

            />

          </div>

          <NouveauDossierForm ref="formComponentRef" />

        </template>



        <template v-else-if="store.step === 'pieces'">

          <NouveauDossierPiecesForm mode="initial" />

        </template>



        <template v-else-if="store.step === 'piecesRecap'">

          <NouveauDossierPiecesRecap />

        </template>



        <template v-else-if="store.step === 'jaccueil'">

          <NouveauDossierJAccueil />

        </template>



        <template v-else-if="store.step === 'piecesReception'">

          <NouveauDossierPiecesRecep />

        </template>

      </q-card-section>

    </q-card>

  </q-dialog>

</template>



<script setup>

import { computed, ref } from 'vue'

import { useI18n } from 'vue-i18n'

import { useNouveauDossierStore } from 'src/modules/energizer/stores/nouveauDossierStore.js'

import { useNouveauDossierRules } from 'src/modules/energizer/composables/useNouveauDossierRules.js'

import NouveauDossierForm from './NouveauDossierForm.vue'

import NouveauDossierPiecesForm from './NouveauDossierPiecesForm.vue'

import NouveauDossierPiecesRecap from './NouveauDossierPiecesRecap.vue'

import NouveauDossierPiecesRecep from './NouveauDossierPiecesRecep.vue'

import NouveauDossierJAccueil from './NouveauDossierJAccueil.vue'



const { t } = useI18n()

const store = useNouveauDossierStore()

const { required } = useNouveauDossierRules()

const pickedObjet = ref(null)

const formComponentRef = ref(null)



const isPiecesStep = computed(() =>
  ['pieces', 'piecesRecap', 'piecesReception', 'jaccueil'].includes(store.step),
)

const toolbarTitle = computed(() => {

  const stepTitles = {

    pick: 'reception.nouveauDossier.dialogTitle',

    form: null,

    pieces: 'reception.nouveauDossier.piecesStepTitle',

    piecesRecap: 'reception.nouveauDossier.recapStepTitle',

    jaccueil: 'reception.nouveauDossier.jaccueilStepTitle',

    piecesReception: 'reception.nouveauDossier.receptionPiecesStepTitle',

  }

  const key = stepTitles[store.step]

  if (key) return t(key)

  return store.formTitle

})



function onDialogToggle(val) {

  if (!val) store.closeDialog()

}



function onContinue() {

  if (!pickedObjet.value) return

  store.selectObjet(pickedObjet.value)

  pickedObjet.value = null

}



defineExpose({

  open: () => store.openDialog(),

})

</script>



<style scoped>

.nouveau-dossier-dialog__toolbar {
  position: relative;
}

.nouveau-dossier-dialog__toolbar .q-toolbar__title {
  flex: 1 1 auto;
  text-align: center;
  padding-left: 40px;
  padding-right: 40px;
}

.nouveau-dossier-dialog__card {

  width: min(960px, 96vw);

  max-height: 92vh;

  display: flex;

  flex-direction: column;

}

.nouveau-dossier-dialog__card--form {

  width: min(1280px, 98vw);

  max-height: 94vh;

}

.nouveau-dossier-dialog__card--form .nouveau-dossier-dialog__body {

  min-height: 480px;

  padding: 16px 20px;

}

.nouveau-dossier-dialog__card--pieces {

  width: min(1680px, 98vw);

  max-width: 98vw;

  max-height: 94vh;

}

@media (min-width: 1280px) {

  .nouveau-dossier-dialog__card--form {

    min-width: min(1100px, 98vw);

  }

  .nouveau-dossier-dialog__card--pieces {

    min-width: min(1320px, 98vw);

  }

}

.nouveau-dossier-dialog__card--pieces .nouveau-dossier-dialog__body {

  min-height: 420px;

  padding-left: 20px;

  padding-right: 20px;

}



.nouveau-dossier-dialog__body {

  flex: 1;

  min-height: 200px;

}

.nouveau-dossier-dialog__body :deep(.nouveau-dossier-table__head-row) {
  background: var(--q-primary);
}

.nouveau-dossier-dialog__body :deep(.nouveau-dossier-table__head-cell) {
  background: var(--q-primary) !important;
  color: #fff !important;
  font-weight: 600;
  font-size: 13px;
}

.nouveau-dossier-dialog__body :deep(.q-table thead th) {
  background: var(--q-primary) !important;
  color: #fff !important;
  font-weight: 600;
}

</style>


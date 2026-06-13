<template>

  <div class="depot-pf-form-section">

    <div class="depot-pf-section-heading text-primary">

      {{ t('modules.assure.depotPf.coordonneesTitre') }}

    </div>

    <p class="text-body2 text-grey-8 q-mb-md">

      {{ t('modules.assure.depotPf.coordonneesLead') }}

    </p>



    <q-input

      v-model="store.common.addrAssuText"

      :label="t('inputassu.adresse_assure')"

      outlined

      dense

      class="q-mb-sm"

      @update:model-value="(v) => (store.common.addrAssuText = String(v || '').toUpperCase())"

    />



    <div class="depot-pf-form-grid-3">

      <q-input

        v-model="store.common.emailAssuText"

        :label="t('inputassu.email')"

        type="email"

        outlined

        dense

        :rules="[required, validateEmail]"

      >

        <template #prepend>

          <q-icon name="email" color="primary" />

        </template>

      </q-input>

      <q-input

        v-model="store.common.telAssuText"

        :label="t('inputassu.phone')"

        outlined

        dense

        type="tel"

        prefix="+237"

        maxlength="9"

        :rules="[required, validateTelephone]"

      />

      <q-input

        v-model="store.common.matrInteText"

        :label="t('inputassu.matricule_interne_assure')"

        outlined

        dense

        :rules="[required]"

        @update:model-value="(v) => (store.common.matrInteText = String(v || '').toUpperCase())"

      />

    </div>



    <div class="depot-pf-form-grid-1-2 q-mt-sm">

      <q-input

        v-model="store.common.matEmployeur"

        :label="t('inputassu.employer_cnps_registration_number')"

        outlined

        dense

        :loading="store.loadingEmployeur"

        :rules="[required, validateMatriculeCNPS]"

        @update:model-value="onMatriculeChange"

        @click="onMatriculeFieldActivate"

        @keyup.enter="onSearchEmployeur"

        @keydown.enter.prevent

      >

        <template #append>

          <q-btn

            flat

            dense

            round

            icon="search"

            color="primary"

            :loading="store.loadingEmployeur"

            @click.stop="onSearchEmployeur"

          />

        </template>

      </q-input>

      <q-input

        v-model="store.common.RAISON_SOCIALE"

        :label="t('inputassu.legal_name')"

        outlined

        dense

        readonly

        bg-color="blue-grey-1"

        :rules="[required]"

        :placeholder="t('modules.assure.depotPf.raisonSocialeHint')"

      />

    </div>

  </div>

</template>



<script setup>

import { useI18n } from 'vue-i18n'

import { useDepotPrestationPfStore } from 'src/modules/assure/stores/depotPrestationPfStore.js'

import { useDepotPrestationPfRules } from 'src/modules/assure/composables/useDepotPrestationPfRules.js'

import { useNotify } from 'src/modules/shared/components/useNotify.js'

import { normalizeMatriculeEmployeur } from 'src/modules/assure/api/depotPrestationPfUtils.js'



const { t } = useI18n()

const store = useDepotPrestationPfStore()

const { required, validateEmail, validateMatriculeCNPS, validateTelephone } = useDepotPrestationPfRules()

const { notifySuccess, notifyError } = useNotify()



function onMatriculeChange(val) {

  store.common.matEmployeur = normalizeMatriculeEmployeur(val)

  if (!store.common.matEmployeur) {

    store.common.RAISON_SOCIALE = ''

  }

}



function onMatriculeFieldActivate() {

  if (store.common.matEmployeur?.trim()) {

    onSearchEmployeur()

  }

}



async function onSearchEmployeur() {

  const matricule = normalizeMatriculeEmployeur(store.common.matEmployeur)

  store.common.matEmployeur = matricule

  if (!matricule) {

    notifyError(t('modules.assure.depotPf.matriculeRequis'))

    return

  }

  const matriculeValide = validateMatriculeCNPS(matricule)

  if (matriculeValide !== true) {

    notifyError(matriculeValide)

    return

  }



  try {

    await store.fetchEmployeur()

    notifySuccess(t('modules.assure.depotPf.employeurTrouve'))

  } catch (e) {

    store.common.RAISON_SOCIALE = ''

    if (e?.message === 'matricule_required') {

      notifyError(t('modules.assure.depotPf.matriculeRequis'))

    } else {

      notifyError(t('modules.assure.depotPf.employeurIntrouvable'))

    }

  }

}

</script>


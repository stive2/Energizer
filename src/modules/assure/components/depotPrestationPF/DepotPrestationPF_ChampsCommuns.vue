<template>
  <div class="depot-pf-form-section">
    <q-banner dense rounded class="bg-blue-1 depot-pf-instruction-banner">
      {{ t('modules.assure.depotPf.instructionFormulaire') }}
    </q-banner>

    <div class="depot-pf-form-grid-1-2">
      <q-input
        :model-value="store.numAssu"
        :label="fieldLabel(t('inputassu.matricule_assure'))"
        outlined
        dense
        readonly
        bg-color="blue-grey-1"
      >
        <template #prepend>
          <q-icon name="fingerprint" color="primary" />
        </template>
      </q-input>
      <q-input
        :model-value="nomPrenom"
        :label="fieldLabel(t('inputassu.nom_prenom'))"
        outlined
        dense
        readonly
        bg-color="blue-grey-1"
      >
        <template #prepend>
          <q-icon name="person" color="primary" />
        </template>
      </q-input>
    </div>

    <div class="depot-pf-form-grid-3">
      <q-input
        :model-value="dateNaissance"
        :label="fieldLabel(t('inputassu.date_naissance_assure'))"
        outlined
        dense
        readonly
        bg-color="blue-grey-1"
      >
        <template #prepend>
          <q-icon name="cake" color="primary" />
        </template>
      </q-input>
      <q-input
        :model-value="sexeLabel"
        :label="fieldLabel(t('inputassu.sexe'))"
        outlined
        dense
        readonly
        bg-color="blue-grey-1"
      >
        <template #prepend>
          <q-icon name="wc" color="primary" />
        </template>
      </q-input>
      <q-input
        v-model="store.common.addrAssuText"
        :label="fieldLabel(t('inputassu.adresse_assure'))"
        :class="requiredFieldClass(true)"
        outlined
        dense
        :rules="[required]"
        @update:model-value="(v) => (store.common.addrAssuText = String(v || '').toUpperCase())"
      >
        <template #prepend>
          <q-icon name="home" color="primary" />
        </template>
      </q-input>
    </div>

    <div class="depot-pf-form-grid-3">
      <q-input
        v-model="store.common.emailAssuText"
        :label="fieldLabel(t('inputassu.email'))"
        :class="requiredFieldClass(true)"
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
        :label="fieldLabel(t('inputassu.phone'))"
        :class="requiredFieldClass(true)"
        outlined
        dense
        type="tel"
        prefix="+237"
        maxlength="9"
        :rules="[required, validateTelephone]"
      >
        <template #prepend>
          <q-icon name="phone" color="primary" />
        </template>
      </q-input>
      <q-input
        v-model="store.common.matrInteText"
        :label="fieldLabel(t('inputassu.matricule_interne_assure'))"
        :class="requiredFieldClass(true)"
        outlined
        dense
        :rules="[required]"
        @update:model-value="(v) => (store.common.matrInteText = String(v || '').toUpperCase())"
      >
        <template #prepend>
          <q-icon name="badge" color="primary" />
        </template>
      </q-input>
    </div>

    <div class="depot-pf-form-grid-1-2">
      <q-input
        v-model="store.common.matEmployeur"
        :label="fieldLabel(t('inputassu.employer_cnps_registration_number'))"
        :class="requiredFieldClass(true)"
        outlined
        dense
        :loading="store.loadingEmployeur"
        :rules="[required, validateMatriculeCNPS]"
        @update:model-value="onMatriculeChange"
        @click="onMatriculeFieldActivate"
        @keyup.enter="onSearchEmployeur"
        @keydown.enter.prevent
      >
        <template #prepend>
          <q-icon name="business" color="primary" />
        </template>
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
        :label="fieldLabel(t('inputassu.legal_name'))"
        :class="requiredFieldClass(true)"
        outlined
        dense
        readonly
        bg-color="blue-grey-1"
        :rules="[required]"
        :placeholder="t('modules.assure.depotPf.raisonSocialeHint')"
      >
        <template #prepend>
          <q-icon name="corporate_fare" color="primary" />
        </template>
      </q-input>
    </div>

    <template v-if="!hideCentre">
      <div class="depot-pf-section-heading depot-pf-section-heading--center">
        {{ t('modules.assure.depotPf.sectionPrestation') }}
      </div>
      <DepotPrestationPF_CentreCnpsSelect />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepotPrestationPfStore } from 'src/modules/assure/stores/depotPrestationPfStore.js'
import { useDepotPrestationPfRules } from 'src/modules/assure/composables/useDepotPrestationPfRules.js'
import { useNotify } from 'src/modules/shared/components/useNotify.js'
import { normalizeMatriculeEmployeur } from 'src/modules/assure/api/depotPrestationPfUtils.js'
import { formatSexeLabel } from 'src/modules/assure/utils/formatSexeLabel.js'
import DepotPrestationPF_CentreCnpsSelect from './DepotPrestationPF_CentreCnpsSelect.vue'

defineProps({
  hideCentre: { type: Boolean, default: false },
})

const { t } = useI18n()
const store = useDepotPrestationPfStore()
const { required, fieldLabel, requiredFieldClass, validateEmail, validateMatriculeCNPS, validateTelephone } =
  useDepotPrestationPfRules()
const { notifySuccess, notifyError } = useNotify()

const nomPrenom = computed(() => {
  const ctx = store.contexte
  if (!ctx) return ''
  return [ctx.nom, ctx.prenom].filter(Boolean).join(' ').trim()
})

const dateNaissance = computed(
  () => store.contexte?.dateNaissance || store.contexte?.date_naissance || '',
)

const sexeLabel = computed(() => formatSexeLabel(store.contexte?.sexe, t))

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

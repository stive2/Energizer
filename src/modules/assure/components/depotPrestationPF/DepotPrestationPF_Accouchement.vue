<template>
  <div class="depot-pf-form-section depot-pf-accouchement-form">
    <div class="depot-pf-accouchement-groupe">
      <div class="depot-pf-examens-groupe__title depot-pf-examens-groupe__title--center text-primary">
        {{ t('inputassu.information_accouchement') }}
      </div>

      <div class="depot-pf-accouchement-champs">
        <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform depot-pf-accouchement-champ--date">
          <q-input
            v-model="f.dateAccoEffe"
            :class="['depot-pf-field-date-compact', requiredFieldClass(true)]"
            :label="fieldLabel(t('inputassu.date_effective_accouchement'))"
            stack-label
            outlined
            dense
            mask="##/##/####"
            :rules="[required]"
          >
            <template #prepend>
              <q-icon name="event" color="primary" />
            </template>
            <template #append>
              <q-icon name="calendar_month" color="primary" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="f.dateAccoEffe" mask="DD/MM/YYYY" :options="optionsDn">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">
          <q-input
            v-model.number="f.nombEnfaViab"
            :class="['depot-pf-field-compact', requiredFieldClass(true)]"
            type="number"
            min="1"
            max="5"
            :label="fieldLabel(t('inputassu.nombre_enfants_viables'))"
            stack-label
            outlined
            dense
            :rules="[required]"
          >
            <template #prepend>
              <q-icon name="child_care" color="primary" />
            </template>
          </q-input>
        </div>

        <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">
          <q-input
            v-model.number="f.nombEnfaContMedi"
            :class="['depot-pf-field-compact', requiredFieldClass(true)]"
            type="number"
            min="0"
            max="99"
            :label="fieldLabel(t('inputassu.nombre_enfants_sous_controle_medical'))"
            stack-label
            outlined
            dense
            :rules="[requiredNombreEnfants]"
          >
            <template #prepend>
              <q-icon name="medical_services" color="primary" />
            </template>
          </q-input>
        </div>

        <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">
          <DepotPrestationPF_FichierPiece
            v-model="f[PF_PIECE.CERT_ACCOUCHEMENT]"
            :label="t('inputassu.certificat_medical_accouchement')"
            mark-required
            :rules="[required, fileTypesPieces]"
          />
        </div>

        <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform depot-pf-accouchement-remboursement">
          <div class="depot-pf-accouchement-remboursement__label text-primary">
            <q-icon name="payments" color="primary" size="20px" class="q-mr-xs" />
            {{ t('inputassu.remboursement_frais_relatifs') }}
          </div>
          <div class="depot-pf-accouchement-remboursement__checks">
            <DepotPrestationPF_CheckboxField
              v-model="f.FAChBo"
              icon="local_hospital"
              :label="t('inputassu.frais_accouchement')"
            />
            <DepotPrestationPF_CheckboxField
              v-model="f.FMAChBo"
              icon="medication"
              :label="t('inputassu.frais_medicaux')"
            />
          </div>
        </div>
      </div>

      <div v-if="nombreActes > 0" class="depot-pf-accouchement-actes">
        <div class="depot-pf-accouchement-actes__title">
          {{ t('inputassu.children_birth_certificates') }}
        </div>
        <div class="depot-pf-accouchement-actes__grid">
          <div
            v-for="i in actesIndices"
            :key="`acte-${i}`"
            class="depot-pf-accouchement-actes__cell"
          >
            <DepotPrestationPF_FichierPiece
              v-model="store.accouchement[acteKey(i)]"
              :label="`${t('inputassu.acte_naissance_enfant')} ${i}`"
              mark-required
              :rules="[required, fileTypesPieces]"
            />
          </div>
        </div>
      </div>

      <div class="depot-pf-accouchement-zone-centre">
        <div class="depot-pf-centre-cnps-select-wrap">
          <DepotPrestationPF_CentreCnpsSelect />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { PF_PIECE } from 'src/modules/assure/data/depotPrestationPfLegacyFields.js'
import { useDepotPrestationPfStore } from 'src/modules/assure/stores/depotPrestationPfStore.js'
import { useDepotPrestationPfRules } from 'src/modules/assure/composables/useDepotPrestationPfRules.js'
import {
  MAX_ENFANTS_SOUS_CONTROLE_MEDICAL,
  acteNaissanceKey,
  getActesNaissanceIndices,
  parseNombreEnfantsSousControleAccouchement,
  syncActesNaissanceAccouchement,
} from 'src/modules/assure/utils/depotPrestationPfAccouchement.js'
import DepotPrestationPF_FichierPiece from './DepotPrestationPF_FichierPiece.vue'
import DepotPrestationPF_CheckboxField from './DepotPrestationPF_CheckboxField.vue'
import DepotPrestationPF_CentreCnpsSelect from './DepotPrestationPF_CentreCnpsSelect.vue'

const { t } = useI18n()
const store = useDepotPrestationPfStore()
const f = computed(() => store.accouchement)
const { required, fieldLabel, requiredFieldClass, optionsDn, fileTypesPieces } = useDepotPrestationPfRules()

const acteKey = acteNaissanceKey

function requiredNombreEnfants(val) {
  if (val === null || val === undefined || val === '') {
    return t('input.requis')
  }
  const n = parseInt(String(val), 10)
  if (!Number.isFinite(n) || n <= 0) {
    return t('modules.assure.depotPf.errors.accouchement_nombre_enfants_sous_controle_requis')
  }
  if (n > MAX_ENFANTS_SOUS_CONTROLE_MEDICAL) {
    return t('modules.assure.depotPf.errors.accouchement_nombre_enfants_max')
  }
  return true
}

const nombreActes = computed(() =>
  parseNombreEnfantsSousControleAccouchement(f.value.nombEnfaContMedi),
)

const actesIndices = computed(() => getActesNaissanceIndices(f.value.nombEnfaContMedi))

watch(
  () => f.value.nombEnfaContMedi,
  (val) => {
    if (val !== null && val !== undefined && val !== '' && Number.isNaN(Number(val))) {
      store.accouchement.nombEnfaContMedi = null
    }
    syncActesNaissanceAccouchement(store.accouchement, val)
  },
  { immediate: true },
)
</script>

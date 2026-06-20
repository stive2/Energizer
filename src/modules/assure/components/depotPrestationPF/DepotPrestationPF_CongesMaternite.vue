<template>
  <div class="depot-pf-form-section depot-pf-accouchement-form depot-pf-maternite-form">
    <q-banner v-if="!store.isFemale" class="bg-orange-2 text-dark q-mb-sm" rounded>
      {{ t('modules.assure.depotPf.materniteFemmeUniquement') }}
    </q-banner>

    <template v-else>
      <div class="depot-pf-accouchement-groupe">
        <div
          class="depot-pf-examens-groupe__title depot-pf-examens-groupe__title--center text-primary"
        >
          {{ t('inputassu.information_conges_maternite') }}
        </div>

        <div class="depot-pf-maternite-indemnites">
          <DepotPrestationPF_CheckboxField
            v-model="f.ijcmChBo"
            icon="paid"
            :label="t('inputassu.cocher_indemnites_conges_maternite')"
          />
        </div>

        <div class="depot-pf-maternite-section">
          <div class="depot-pf-maternite-section__title">
            {{ t('inputassu.indemnite_journaliere') }}
          </div>

          <div class="depot-pf-form-grid-3 depot-pf-maternite-grid">
            <div class="depot-pf-maternite-option">
              <DepotPrestationPF_CheckboxField
                v-model="f.accoPremChBo"
                icon="warning"
                :label="t('inputassu.accouchement_premature')"
              />
            </div>

            <q-input
              v-model.number="f.nombJourSupp"
              class="depot-pf-field-compact"
              type="number"
              min="0"
              :label="fieldLabel(t('inputassu.nombre_jours_couches_supplementaires'))"
              stack-label
              outlined
              dense
            >
              <template #prepend>
                <q-icon name="calendar_view_day" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="f.dateDebuCongEffe"
              :class="['depot-pf-field-date-compact', requiredFieldClass(true)]"
              :label="fieldLabel(t('inputassu.date_debut_conge'))"
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
                    <q-date v-model="f.dateDebuCongEffe" mask="DD/MM/YYYY" :options="optionsDn">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              v-model="f.dateFinCongEffe"
              class="depot-pf-field-date-compact"
              :label="fieldLabel(t('inputassu.date_fin_conge'))"
              stack-label
              outlined
              dense
              mask="##/##/####"
              :rules="[validateFinConge]"
            >
              <template #prepend>
                <q-icon name="event_busy" color="primary" />
              </template>
              <template #append>
                <q-icon name="calendar_month" color="primary" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="f.dateFinCongEffe"
                      mask="DD/MM/YYYY"
                      :options="optionsFinConge"
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              v-model="f.dateDebuNonSala"
              :class="['depot-pf-field-date-compact', requiredFieldClass(true)]"
              :label="fieldLabel(t('inputassu.debut_periode_non_salaire'))"
              stack-label
              outlined
              dense
              mask="##/##/####"
              :rules="[required]"
            >
              <template #prepend>
                <q-icon name="money_off" color="primary" />
              </template>
              <template #append>
                <q-icon name="calendar_month" color="primary" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="f.dateDebuNonSala" mask="DD/MM/YYYY" :options="optionsDn">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              v-model="f.dateFinNonSala"
              class="depot-pf-field-date-compact"
              :label="fieldLabel(t('inputassu.fin_periode_non_salaire'))"
              stack-label
              outlined
              dense
              mask="##/##/####"
              :rules="[validateFinNonSala]"
            >
              <template #prepend>
                <q-icon name="event_available" color="primary" />
              </template>
              <template #append>
                <q-icon name="calendar_month" color="primary" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="f.dateFinNonSala"
                      mask="DD/MM/YYYY"
                      :options="optionsFinNonSala"
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              v-model="f.dateReprActi"
              class="depot-pf-field-date-compact"
              :label="fieldLabel(t('modules.assure.depotPf.dateRepriseActivite'))"
              stack-label
              outlined
              dense
              mask="##/##/####"
            >
              <template #prepend>
                <q-icon name="work_history" color="primary" />
              </template>
              <template #append>
                <q-icon name="calendar_month" color="primary" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="f.dateReprActi" mask="DD/MM/YYYY" :options="optionsReprActi">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <DepotPrestationPF_FichierPiece
              v-model="f[PF_PIECE.BULLETIN_PAIE]"
              :label="t('inputassu.bulletin_salaire')"
              :rules="[fileTypesPieces]"
            />

            <DepotPrestationPF_FichierPiece
              v-model="f[PF_PIECE.ATTESTATION_CESSATION]"
              :label="t('inputassu.attestation_cessation_paiement')"
              :rules="[fileTypesPieces]"
            />
          </div>
        </div>

        <div class="depot-pf-maternite-section">
          <div class="depot-pf-maternite-section__title">
            {{ t('inputassu.information_accouchement') }}
          </div>

          <div
            class="depot-pf-form-grid-3 depot-pf-maternite-grid depot-pf-maternite-grid--accouchement"
          >
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

            <DepotPrestationPF_FichierPiece
              v-model="f[PF_PIECE.CERT_ACCOUCHEMENT]"
              :label="t('inputassu.certificat_medical_accouchement')"
              :rules="[fileTypesPieces]"
            />
          </div>

          <div v-if="nombreActes > 0" class="depot-pf-accouchement-actes">
            <div class="depot-pf-accouchement-actes__title">
              {{ t('inputassu.children_birth_certificates') }}
            </div>
            <div class="depot-pf-accouchement-actes__grid">
              <div
                v-for="idx in actesIndices"
                :key="`acte-maternite-${idx}`"
                class="depot-pf-accouchement-actes__cell"
              >
                <DepotPrestationPF_FichierPiece
                  v-model="store.congesMaternite[acteKey(idx)]"
                  :label="`${t('inputassu.acte_naissance_enfant')} ${idx}`"
                  mark-required
                  :rules="[required, fileTypesPieces]"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="depot-pf-accouchement-zone-centre">
          <div class="depot-pf-centre-cnps-select-wrap">
            <DepotPrestationPF_CentreCnpsSelect />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { PF_PIECE } from 'src/modules/assure/data/depotPrestationPfLegacyFields.js'
import { useDepotPrestationPfStore } from 'src/modules/assure/stores/depotPrestationPfStore.js'
import { useDepotPrestationPfRules } from 'src/modules/assure/composables/useDepotPrestationPfRules.js'
import { useDepotPrestationPfMaterniteDates } from 'src/modules/assure/composables/useDepotPrestationPfMaterniteDates.js'
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
const f = computed(() => store.congesMaternite)
const { required, fieldLabel, requiredFieldClass, optionsDn, fileTypesPieces } =
  useDepotPrestationPfRules()
const {
  optionsFinConge,
  optionsFinNonSala,
  optionsReprActi,
  validateFinConge,
  validateFinNonSala,
} = useDepotPrestationPfMaterniteDates(f, optionsDn)

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
      store.congesMaternite.nombEnfaContMedi = null
    }
    syncActesNaissanceAccouchement(store.congesMaternite, val)
  },
  { immediate: true },
)
</script>

<template>
  <div class="depot-pf-form-section">
    <div class="depot-pf-accouchement-groupe">
      <div class="depot-pf-examens-groupe__title">
        {{ t('inputassu.information_accouchement') }}
      </div>

      <!-- Ligne 1 : date, effectifs, remboursement -->
      <div class="depot-pf-accouchement-ligne row items-center justify-between text-center">
        <q-input
          v-model="f.dateAccouchement"
          class="depot-pf-accouchement-cell depot-pf-field-date-compact"
          :label="t('inputassu.date_effective_accouchement')"
          stack-label
          outlined
          dense
          mask="##/##/####"
          :rules="[required]"
        >
          <template #append>
            <q-icon name="event" color="primary" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="f.dateAccouchement" mask="DD/MM/YYYY" :options="optionsDn">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-input
          v-model.number="f.nombreEnfantsViables"
          class="depot-pf-accouchement-cell depot-pf-field-compact"
          type="number"
          min="1"
          max="5"
          :label="t('inputassu.nombre_enfants_viables')"
          stack-label
          outlined
          dense
          :rules="[required]"
        />

        <q-input
          v-model.number="f.nombreEnfantsSousControle"
          class="depot-pf-accouchement-cell depot-pf-field-compact"
          type="number"
          min="0"
          max="5"
          :label="t('inputassu.nombre_enfants_sous_controle_medical')"
          stack-label
          outlined
          dense
          :rules="[requiredNombreEnfants]"
        />

      </div>
      <div class="row justify-center q-mt-sm">
          <div class="depot-pf-checkbox-inline">
            <span class="text-bold">{{ t('inputassu.remboursement_frais_relatifs') }}:</span>
            <q-checkbox v-model="f.fraisAccouchement" :label="t('inputassu.frais_accouchement')" />
            <q-checkbox v-model="f.fraisMedicaux" :label="t('inputassu.frais_medicaux')" />
          </div>

      </div>

      <div class="depot-pf-accouchement-certificat row justify-center q-mt-sm">
        <div class="depot-pf-accouchement-certificat__field">
          <DepotPrestationPF_FichierPiece
            v-model="f.certificatMedical"
            :label="t('inputassu.certificat_medical_accouchement')"
            :rules="[required, fileTypesPieces]"
          />
        </div>
      </div>
      <div
        v-if="nombreActes > 0"
        class="depot-pf-accouchement-ligne row items-center justify-between q-mt-sm"
      >
        <div
          v-for="i in actesLigne1"
          :key="`acte-${i}`"
          class="depot-pf-accouchement-cell depot-pf-accouchement-fichier"
        >
          <DepotPrestationPF_FichierPiece
            v-model="store.accouchement[`acteNaissanceEnfant${i}`]"
            :label="`${t('inputassu.acte_naissance_enfant')} ${i}`"
            :rules="[required, fileTypesPieces]"
          />
        </div>
        <div
          v-for="n in spacersLigneFichiers"
          :key="`spacer-fichier-${n}`"
          class="depot-pf-accouchement-cell depot-pf-accouchement-cell--spacer"
          aria-hidden="true"
        />
      </div>

      <!-- Actes supplémentaires (4e et 5e enfant) -->
      <div
        v-if="actesLigne2.length"
        class="depot-pf-accouchement-ligne row items-center justify-between q-mt-sm"
      >
        <div
          v-for="i in actesLigne2"
          :key="`acte-${i}`"
          class="depot-pf-accouchement-cell depot-pf-accouchement-fichier"
        >
          <DepotPrestationPF_FichierPiece
            v-model="store.accouchement[`acteNaissanceEnfant${i}`]"
            :label="`${t('inputassu.acte_naissance_enfant')} ${i}`"
            :rules="[required, fileTypesPieces]"
          />
        </div>
        <div
          v-for="n in spacersLigneActesSup"
          :key="`spacer-acte-sup-${n}`"
          class="depot-pf-accouchement-cell depot-pf-accouchement-cell--spacer"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepotPrestationPfStore } from 'src/stores/assure/depotPrestationPfStore.js'
import { useDepotPrestationPfRules } from 'src/composables/assure/useDepotPrestationPfRules.js'
import DepotPrestationPF_FichierPiece from './DepotPrestationPF_FichierPiece.vue'

const { t } = useI18n()
const store = useDepotPrestationPfStore()
const f = computed(() => store.accouchement)
const { required, optionsDn, fileTypesPieces } = useDepotPrestationPfRules()

function parseNombreActes(val) {
  if (val === null || val === undefined || val === '') return 0
  const n = parseInt(String(val), 10)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.min(5, n)
}

function syncActesNaissance(count) {
  const lastVisible = count <= 0 ? 0 : Math.min(5, count)
  for (let i = lastVisible + 1; i <= 5; i += 1) {
    store.accouchement[`acteNaissanceEnfant${i}`] = null
  }
}

function requiredNombreEnfants(val) {
  if (val === null || val === undefined || val === '') {
    return t('input.requis')
  }
  const n = parseInt(String(val), 10)
  if (!Number.isFinite(n) || n <= 0) {
    return t('modules.assure.depotPf.errors.accouchement_nombre_enfants_sous_controle_requis')
  }
  if (n > 5) {
    return t('modules.assure.depotPf.errors.accouchement_nombre_enfants_max')
  }
  return true
}

const nombreActes = computed(() => parseNombreActes(f.value.nombreEnfantsSousControle))

watch(
  () => f.value.nombreEnfantsSousControle,
  (val) => {
    if (val !== null && val !== undefined && val !== '' && Number.isNaN(Number(val))) {
      store.accouchement.nombreEnfantsSousControle = null
    }
    syncActesNaissance(parseNombreActes(val))
  },
)

const actesLigne1 = computed(() => {
  const n = nombreActes.value
  return Array.from({ length: Math.min(3, n) }, (_, idx) => idx + 1)
})

const actesLigne2 = computed(() => {
  const n = nombreActes.value
  if (n <= 3) return []
  return Array.from({ length: n - 3 }, (_, idx) => idx + 4)
})

const spacersLigneFichiers = computed(() => {
  const occupied = actesLigne1.value.length
  return Math.max(0, 4 - occupied)
})

const spacersLigneActesSup = computed(() => Math.max(0, 4 - actesLigne2.value.length))
</script>

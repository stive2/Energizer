<template>
  <div class="depot-pf-form-section">
    <q-banner v-if="!store.isFemale" class="bg-orange-2 text-dark" rounded>
      {{ t('modules.assure.depotPf.materniteFemmeUniquement') }}
    </q-banner>
    <template v-else>
      <q-checkbox
        v-model="f.showIndemnites"
        :label="t('inputassu.cocher_indemnites_conges_maternite')"
      />
      <div class="depot-pf-form-grid-2">
        <q-input
          v-model="f.debutConges"
          class="depot-pf-field-date-compact"
          :label="t('inputassu.date_debut_conge')"
          outlined
          dense
          mask="##/##/####"
          :rules="[required]"
        >
          <template #append>
            <q-icon name="event" color="primary" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="f.debutConges" mask="DD/MM/YYYY" :options="optionsDn">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input
          v-model="f.finConges"
          class="depot-pf-field-date-compact"
          :label="t('inputassu.date_fin_conge')"
          outlined
          dense
          mask="##/##/####"
          :rules="[required]"
        >
          <template #append>
            <q-icon name="event" color="primary" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="f.finConges" mask="DD/MM/YYYY" :options="optionsDn">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <q-input
        v-model="f.dateRepriseActivite"
        :label="t('modules.assure.depotPf.dateRepriseActivite')"
        outlined
        dense
        mask="##/##/####"
      />
      <q-checkbox v-model="f.accouchementPremature" :label="t('inputassu.accouchement_premature')" />
      <div class="depot-pf-form-grid-2">
        <q-input
          v-model.number="f.nombreJoursCouches"
          type="number"
          min="0"
          :label="t('inputassu.nombre_jours_couches_supplementaires')"
          outlined
          dense
        />
        <q-input
          v-model.number="f.nombreEnfantsViables"
          type="number"
          min="1"
          max="5"
          :label="t('inputassu.nombre_enfants_viables')"
          outlined
          dense
          :rules="[required]"
        />
      </div>
      <div class="depot-pf-form-grid-3">
        <DepotPrestationPF_FichierPiece
          v-model="f.certificatMedical"
          :label="t('inputassu.certificat_medical_accouchement')"
          :rules="[required, fileTypesPieces]"
        />
        <DepotPrestationPF_FichierPiece
          v-model="f.bulletinPaie"
          :label="t('inputassu.bulletin_salaire')"
          :rules="[fileTypesPieces]"
        />
        <DepotPrestationPF_FichierPiece
          v-model="f.attestationCessation"
          :label="t('inputassu.attestation_cessation_paiement')"
          :rules="[fileTypesPieces]"
        />
      </div>

      <div class="text-subtitle2">{{ t('inputassu.actes_naissance') }}</div>
      <div class="depot-pf-form-grid-3">
        <div
          v-for="(_acte, idx) in f.actesNaissance"
          :key="`acte-naissance-${idx}`"
          class="depot-pf-acte-naissance-cell"
        >
          <DepotPrestationPF_FichierPiece
            v-model="f.actesNaissance[idx]"
            :label="`${t('inputassu.acte_naissance_enfant')} ${idx + 1}`"
            :rules="[fileTypesPieces]"
          />
          <q-btn
            v-if="canRemoveActeNaissance"
            flat
            dense
            round
            color="negative"
            icon="remove_circle_outline"
            class="depot-pf-acte-naissance-cell__remove"
            :aria-label="t('modules.assure.depotPf.supprimerActeNaissance')"
            @click="removeActeNaissance(idx)"
          />
        </div>
      </div>
      <q-btn
        flat
        color="primary"
        icon="add"
        :disable="f.actesNaissance.length >= maxActesNaissance"
        :label="t('modules.assure.depotPf.ajouterActeNaissance')"
        @click="addActeNaissance"
      />
    </template>
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
const f = computed(() => store.congesMaternite)
const { required, optionsDn, fileTypesPieces } = useDepotPrestationPfRules()

const maxActesNaissance = 5

const minActesNaissance = computed(() => {
  const n = parseInt(f.value.nombreEnfantsViables || 1, 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(maxActesNaissance, n)
})

const canRemoveActeNaissance = computed(
  () => f.value.actesNaissance.length > minActesNaissance.value,
)

function addActeNaissance() {
  if (f.value.actesNaissance.length < maxActesNaissance) {
    f.value.actesNaissance.push(null)
  }
}

function removeActeNaissance(idx) {
  if (!canRemoveActeNaissance.value) return
  f.value.actesNaissance.splice(idx, 1)
}

watch(
  () => f.value.nombreEnfantsViables,
  (n) => {
    const count = Math.max(1, parseInt(n || 1, 10))
    const target = Math.min(maxActesNaissance, count)
    while (f.value.actesNaissance.length < target) f.value.actesNaissance.push(null)
    if (f.value.actesNaissance.length > target) {
      f.value.actesNaissance = f.value.actesNaissance.slice(0, target)
    }
  },
  { immediate: true },
)
</script>

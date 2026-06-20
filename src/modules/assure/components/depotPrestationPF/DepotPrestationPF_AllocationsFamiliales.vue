<template>
  <div class="depot-pf-form-section depot-pf-accouchement-form depot-pf-allocations-form">
    <div class="depot-pf-accouchement-groupe">
      <div class="depot-pf-examens-groupe__title depot-pf-examens-groupe__title--center text-primary">
        {{ t('inputassu.informations_allocations_familiales') }}
      </div>

      <div class="depot-pf-accouchement-champs">
        <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform depot-pf-accouchement-champ--date">
          <q-input
            v-model="f.dateSignEmpl"
            :class="['depot-pf-field-date-compact', requiredFieldClass(true)]"
            :label="fieldLabel(t('inputassu.date_signature_dossier_employeur'))"
            stack-label
            outlined
            dense
            mask="##/##/####"
            :rules="[required]"
          >
            <template #prepend>
              <q-icon name="draw" color="primary" />
            </template>
            <template #append>
              <q-icon name="calendar_month" color="primary" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="f.dateSignEmpl" mask="DD/MM/YYYY" :options="optionsDn">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform depot-pf-accouchement-champ--date">
          <q-input
            v-model="f.dateEmba"
            :class="['depot-pf-field-date-compact', requiredFieldClass(true)]"
            :label="fieldLabel(t('inputassu.date_embauche'))"
            stack-label
            outlined
            dense
            mask="##/##/####"
            :rules="[required]"
          >
            <template #prepend>
              <q-icon name="work" color="primary" />
            </template>
            <template #append>
              <q-icon name="calendar_month" color="primary" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="f.dateEmba" mask="DD/MM/YYYY" :options="optionsDn">
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
            v-model="f.nbreHeurEmba"
            :class="['depot-pf-field-compact', requiredFieldClass(true)]"
            :label="fieldLabel(t('inputassu.nombre_heures_travaillees_mois_embauche'))"
            stack-label
            outlined
            dense
            :rules="[required]"
          >
            <template #prepend>
              <q-icon name="schedule" color="primary" />
            </template>
          </q-input>
        </div>

        <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">
          <q-input
            v-model.number="f.nombEnfaMoin6"
            class="depot-pf-field-compact"
            type="number"
            min="0"
            max="99"
            :label="fieldLabel(t('inputassu.nombre_nouveaux_enfants_moins_six_ans'))"
            stack-label
            outlined
            dense
          >
            <template #prepend>
              <q-icon name="child_friendly" color="primary" />
            </template>
          </q-input>
        </div>

        <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">
          <q-input
            v-model.number="f.nombEnfaPlus6"
            class="depot-pf-field-compact"
            type="number"
            min="0"
            max="99"
            :label="fieldLabel(t('inputassu.nombre_nouveaux_enfants_plus_six_ans'))"
            stack-label
            outlined
            dense
          >
            <template #prepend>
              <q-icon name="escalator_warning" color="primary" />
            </template>
          </q-input>
        </div>

        <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">
          <q-input
            v-model.number="f.nombEnfaReco"
            class="depot-pf-field-compact"
            type="number"
            min="0"
            max="99"
            :label="fieldLabel(t('inputassu.nombre_nouveaux_enfants_reconnus'))"
            stack-label
            outlined
            dense
          >
            <template #prepend>
              <q-icon name="family_restroom" color="primary" />
            </template>
          </q-input>
        </div>
      </div>

      <div class="depot-pf-allocations-pieces">
        <div class="depot-pf-examens-groupe__title depot-pf-examens-groupe__title--center text-primary">
          {{ t('inputassu.pieces_complementaires') }}
        </div>
        <div class="depot-pf-accouchement-champs">
          <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">
            <DepotPrestationPF_FichierPiece
              v-model="f[PF_PIECE.ATTESTATION_AF]"
              :label="t('inputassu.attestation_non_perception_af')"
              :rules="[fileTypesPieces]"
            />
          </div>
          <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">
            <DepotPrestationPF_FichierPiece
              v-model="f[PF_PIECE.ACTE_MARIAGE]"
              :label="t('inputassu.acte_mariage_certifie')"
              :rules="[fileTypesPieces]"
            />
          </div>
          <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">
            <DepotPrestationPF_FichierPiece
              v-model="f[PF_PIECE.ORIGINAL_ACTE_MARIAGE]"
              :label="t('inputassu.original_acte_mariage')"
              :rules="[fileTypesPieces]"
            />
          </div>
        </div>
      </div>

      <div v-if="indicesCertificatVie.length" class="depot-pf-accouchement-actes">
        <div class="depot-pf-accouchement-actes__title">
          {{ t('inputassu.certificat_vie_enfant') }}
        </div>
        <div class="depot-pf-accouchement-actes__grid">
          <div
            v-for="idx in indicesCertificatVie"
            :key="`25-${idx}`"
            class="depot-pf-accouchement-actes__cell"
          >
            <DepotPrestationPF_FichierPiece
              v-model="store.allocations[pieceKey(PF_ACTE_PREFIX.CERTIFICAT_VIE, idx)]"
              :label="`${t('inputassu.certificat_vie_enfant')} ${idx}`"
              mark-required
              :rules="[required, fileTypesPieces]"
            />
          </div>
        </div>
      </div>

      <div v-if="indicesScolarite.length" class="depot-pf-accouchement-actes">
        <div class="depot-pf-accouchement-actes__title">
          {{ t('inputassu.certificat_scolarite_enfant') }}
        </div>
        <div class="depot-pf-accouchement-actes__grid">
          <div
            v-for="idx in indicesScolarite"
            :key="`28-${idx}`"
            class="depot-pf-accouchement-actes__cell"
          >
            <DepotPrestationPF_FichierPiece
              v-model="store.allocations[pieceKey(PF_ACTE_PREFIX.CERTIFICAT_SCOLARITE, idx)]"
              :label="`${t('inputassu.certificat_scolarite_enfant')} ${idx}`"
              mark-required
              :rules="[required, fileTypesPieces]"
            />
          </div>
        </div>
      </div>

      <div v-if="indicesActesNaissance.length" class="depot-pf-accouchement-actes">
        <div class="depot-pf-accouchement-actes__title">
          {{ t('inputassu.actes_naissance_supplementaires') }}
        </div>
        <div class="depot-pf-accouchement-actes__grid">
          <div
            v-for="idx in indicesActesNaissance"
            :key="`33-${idx}`"
            class="depot-pf-accouchement-actes__cell"
          >
            <DepotPrestationPF_FichierPiece
              v-model="store.allocations[pieceKey(PF_ACTE_PREFIX.NAISSANCE, idx)]"
              :label="`${t('inputassu.acte_naissance_supplementaire')} ${idx}`"
              mark-required
              :rules="[required, fileTypesPieces]"
            />
          </div>
        </div>
      </div>

      <div v-if="indicesDeclarationReco.length" class="depot-pf-accouchement-actes">
        <div class="depot-pf-accouchement-actes__title">
          {{ t('inputassu.declaration_reconnaissance_enfant') }}
        </div>
        <div class="depot-pf-accouchement-actes__grid">
          <div
            v-for="idx in indicesDeclarationReco"
            :key="`23-${idx}`"
            class="depot-pf-accouchement-actes__cell"
          >
            <DepotPrestationPF_FichierPiece
              v-model="store.allocations[pieceKey(PF_ACTE_PREFIX.DECLARATION_RECONNAISSANCE, idx)]"
              :label="`${t('inputassu.declaration_reconnaissance_enfant')} ${idx}`"
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
import {
  PF_ACTE_PREFIX,
  PF_PIECE,
  pieceKey,
} from 'src/modules/assure/data/depotPrestationPfLegacyFields.js'
import { useDepotPrestationPfStore } from 'src/modules/assure/stores/depotPrestationPfStore.js'
import { useDepotPrestationPfRules } from 'src/modules/assure/composables/useDepotPrestationPfRules.js'
import {
  getPieceIndicesByPrefix,
  syncAllocationsPieces,
} from 'src/modules/assure/utils/depotPrestationPfAccouchement.js'
import DepotPrestationPF_FichierPiece from './DepotPrestationPF_FichierPiece.vue'
import DepotPrestationPF_CentreCnpsSelect from './DepotPrestationPF_CentreCnpsSelect.vue'

const { t } = useI18n()
const store = useDepotPrestationPfStore()
const f = computed(() => store.allocations)
const { required, fieldLabel, requiredFieldClass, optionsDn, fileTypesPieces } = useDepotPrestationPfRules()

const indicesCertificatVie = computed(() =>
  getPieceIndicesByPrefix(f.value, PF_ACTE_PREFIX.CERTIFICAT_VIE),
)
const indicesScolarite = computed(() =>
  getPieceIndicesByPrefix(f.value, PF_ACTE_PREFIX.CERTIFICAT_SCOLARITE),
)
const indicesActesNaissance = computed(() =>
  getPieceIndicesByPrefix(f.value, PF_ACTE_PREFIX.NAISSANCE),
)
const indicesDeclarationReco = computed(() =>
  getPieceIndicesByPrefix(f.value, PF_ACTE_PREFIX.DECLARATION_RECONNAISSANCE),
)

watch(
  () => [f.value.nombEnfaMoin6, f.value.nombEnfaPlus6, f.value.nombEnfaReco],
  () => {
    syncAllocationsPieces(store.allocations)
  },
  { immediate: true },
)
</script>

<template>

  <div class="depot-pf-form-section depot-pf-accouchement-form depot-pf-maternite-form">

    <q-banner v-if="!store.isFemale" class="bg-orange-2 text-dark q-mb-sm" rounded>

      {{ t('modules.assure.depotPf.materniteFemmeUniquement') }}

    </q-banner>



    <template v-else>

      <div class="depot-pf-accouchement-groupe">

        <div class="depot-pf-examens-groupe__title depot-pf-examens-groupe__title--center text-primary">

          {{ t('inputassu.information_conges_maternite') }}

        </div>



        <div class="depot-pf-accouchement-champs">

          <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform depot-pf-maternite-indemnites">

            <q-checkbox

              v-model="f.ijcmChBo"

              :label="t('inputassu.cocher_indemnites_conges_maternite')"

            />

          </div>



          <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform depot-pf-accouchement-champ--date">

            <q-input

              v-model="f.dateDebuCongEffe"

              class="depot-pf-field-date-compact"

              :label="t('inputassu.date_debut_conge')"

              stack-label

              outlined

              dense

              mask="##/##/####"

              :rules="[required]"

            >

              <template #append>

                <q-icon name="event" color="primary" class="cursor-pointer">

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

          </div>



          <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform depot-pf-accouchement-champ--date">

            <q-input

              v-model="f.dateFinCongEffe"

              class="depot-pf-field-date-compact"

              :label="t('inputassu.date_fin_conge')"

              stack-label

              outlined

              dense

              mask="##/##/####"

              :rules="[required]"

            >

              <template #append>

                <q-icon name="event" color="primary" class="cursor-pointer">

                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">

                    <q-date v-model="f.dateFinCongEffe" mask="DD/MM/YYYY" :options="optionsDn">

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

              v-model="f.dateReprActi"

              class="depot-pf-field-date-compact"

              :label="t('modules.assure.depotPf.dateRepriseActivite')"

              stack-label

              outlined

              dense

              mask="##/##/####"

            >

              <template #append>

                <q-icon name="event" color="primary" class="cursor-pointer">

                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">

                    <q-date v-model="f.dateReprActi" mask="DD/MM/YYYY" :options="optionsDn">

                      <div class="row items-center justify-end">

                        <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />

                      </div>

                    </q-date>

                  </q-popup-proxy>

                </q-icon>

              </template>

            </q-input>

          </div>



          <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform depot-pf-maternite-option">

            <q-checkbox

              v-model="f.accoPremChBo"

              :label="t('inputassu.accouchement_premature')"

            />

          </div>



          <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">

            <q-input

              v-model.number="f.nombJourSupp"

              class="depot-pf-field-compact"

              type="number"

              min="0"

              :label="t('inputassu.nombre_jours_couches_supplementaires')"

              stack-label

              outlined

              dense

            />

          </div>



          <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">

            <q-input

              v-model.number="f.nombEnfaViab"

              class="depot-pf-field-compact"

              type="number"

              min="1"

              max="5"

              :label="t('inputassu.nombre_enfants_viables')"

              stack-label

              outlined

              dense

              :rules="[required]"

            />

          </div>



          <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">

            <q-input

              v-model.number="f.nombEnfaContMedi"

              class="depot-pf-field-compact"

              type="number"

              min="0"

              max="99"

              :label="t('inputassu.nombre_enfants_sous_controle_medical')"

              stack-label

              outlined

              dense

              :rules="[requiredNombreEnfants]"

            />

          </div>



          <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">

            <DepotPrestationPF_FichierPiece

              v-model="f[PF_PIECE.CERT_ACCOUCHEMENT]"

              :label="t('inputassu.certificat_medical_accouchement')"

              :rules="[required, fileTypesPieces]"

            />

          </div>



          <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">

            <DepotPrestationPF_FichierPiece

              v-model="f[PF_PIECE.BULLETIN_PAIE]"

              :label="t('inputassu.bulletin_salaire')"

              :rules="[fileTypesPieces]"

            />

          </div>



          <div class="depot-pf-accouchement-champ depot-pf-accouchement-champ--uniform">

            <DepotPrestationPF_FichierPiece

              v-model="f[PF_PIECE.ATTESTATION_CESSATION]"

              :label="t('inputassu.attestation_cessation_paiement')"

              :rules="[fileTypesPieces]"

            />

          </div>

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

    </template>

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

import DepotPrestationPF_CentreCnpsSelect from './DepotPrestationPF_CentreCnpsSelect.vue'



const { t } = useI18n()

const store = useDepotPrestationPfStore()

const f = computed(() => store.congesMaternite)

const { required, optionsDn, fileTypesPieces } = useDepotPrestationPfRules()



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


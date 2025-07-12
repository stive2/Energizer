<template>
  <q-card class="q-mb-md">
    <q-card-section>
      <div class="text-h6 text-primary q-mb-md">
        <q-icon name="baby_changing_station" class="q-mr-sm" />
        {{ t('inputassu.information_accouchement') }}
      </div>
      <div class="row q-gutter-md">
        <q-input
          v-model="formData.dateEffective"
          :label="t('inputassu.date_effective_accouchement')"
          :hint="t('inputassu.date_effective_accouchement')"
          outlined
          dense
          :rules="[required]"
          :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
          style="max-width:400px"
          class="col-12 col-md-4"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer" color="primary">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="formData.dateEffective"
                  :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                  :options="optionsDn"
                  color="primary"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:label>
            {{ t('inputassu.date_effective_accouchement') }}
            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
              {{ t('input.requis') }}
            </span>
          </template>
        </q-input>
        <q-input
          v-model.number="formData.nombreEnfantsViables"
          :label="t('inputassu.nombre_enfants_viables')"
          type="number"
          outlined
          dense
          min="0"
          max="10"
          class="col-12 col-md-3"
          style="max-width:350px"
          :rules="[required]"
          >
          <template v-slot:label>
          {{ t('inputassu.nombre_enfants_viables') }}
          <span
            class="q-px-sm bg-red text-white text-italic rounded-borders"
            style="font-size: 10px"
          >
            {{ t('input.requis') }}
          </span>
        </template>
        </q-input>
        <q-input
          v-model.number="formData.nombreEnfantsSousControle"
          :label="t('inputassu.nombre_enfants_sous_controle_medical')"
          type="number"
          outlined
          dense
          :min="0"
          :max="12"
          :rules="[
            required,
            (val) => val <= formData.nombreEnfantsViables || t('inputassu.nombre_enfants_sous_controle_medical_max')
          ]"
          @update:model-value="updateNaissanceFields"
          class="col-12 col-md-3"
          style="max-width:500px"
        >
          <template v-slot:label>
            {{ t('inputassu.nombre_enfants_sous_controle_medical') }}
            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
              {{ t('input.requis') }}
            </span>
          </template>
      </q-input>
      </div>
      <div class="q-mt-md">Remboursement des frais relatifs</div>
      <div class="row q-gutter-md">
        <q-checkbox
          v-model="formData.fraisAccouchement"
          :label="t('inputassu.frais_accouchement')"
          dense
          class="col-12 col-md-3"
        />
        <q-checkbox
          v-model="formData.fraisMedicaux"
          :label="t('inputassu.frais_medicaux')"
          dense
          class="col-12 col-md-3"
        />
        <q-file
          v-model="formData.certificatMedical"
          :label="t('inputassu.certificat_medical_accouchement')"
          outlined
          dense
          accept=".pdf,.jpg,.jpeg,.png"
          max-file-size="5242880"
          class="col-12 col-md-5"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
      </div>
      <div class="col-12 col-md-4">
        <div class="text-subtitle2 q-mb-sm">Actes de naissance:</div>
        <div v-for="i in nombreActesNaissance" :key="i" class="q-mb-sm">
          <q-file
            v-model="formData.actesNaissance[i]"
            :label="`${t('inputassu.acte_naissance_enfant')} ${i}`"
            outlined
            dense
            accept=".pdf,.jpg,.jpeg,.png"
            max-file-size="5242880"
          >
            <template v-slot:prepend>
              <q-icon name="description" />
            </template>
          </q-file>
        </div>
      </div>
      <div class="q-mt-lg">
        <q-checkbox
          v-model="formData.showIndemnites"
          :label="t('inputassu.cocher_indemnites_journalieres')"
          class="text-weight-medium"
          color="primary"
        />
      </div>
    </q-card-section>
  </q-card>
  <!-- Section Indemnité journalière (conditionnelle) -->
  <q-slide-transition>
    <q-card v-show="formData.showIndemnites" class="q-mb-lg">
      <q-card-section>
        <div class="text-h6 text-secondary q-mb-md">
          <q-icon name="payments" class="q-mr-sm" />
          Indemnité journalière
        </div>
        <div class="row q-gutter-md">
          <!-- Première ligne -->
          <div class="col-12 col-md-2">
            <q-checkbox
              v-model="formData.accouchementPremature"
              :label="t('inputassu.accouchement_premature')"
              dense
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model.number="formData.nombreJoursCouches"
              :label="t('inputassu.nombre_jours_couches_supplementaires')"
              type="number"
              outlined
              dense
              :min="0"
              :max="40"
              class="q-mb-md"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="formData.debutConges"
              :label="t('inputassu.debut_conges_effectif')"
              dense
              outlined
              style="max-width: 300px"
              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
              :rules="[required, dateValidationRules]"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="primary">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formData.debutConges"
                      :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                      :options="optionsDn"
                      color="primary"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
               <template v-slot:label>
                {{ t('inputassu.debut_conges_effectif') }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ t('input.requis') }}
                </span>
              </template>
            </q-input>
          </div>
        </div>
        <!-- Deuxième ligne -->
        <div class="row q-gutter-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model="formData.finConges"
              :label="t('inputassu.fin_conges_effectif')"
              dense
              outlined
              style="max-width: 300px"
              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="primary">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formData.finConges"
                      :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                      :options="optionsDn"
                      color="primary"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="formData.dateRepriseActivite"
              :label="t('inputassu.date_effective_reprise_activite')"
              dense
              outlined
              style="max-width: 300px"
              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="primary">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formData.dateRepriseActivite"
                      :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                      :options="optionsDn"
                      color="primary"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="formData.debutPeriodeNonSalaire"
              :label="t('inputassu.debut_periode_non_salaire')"
              dense
              outlined
              style="max-width: 300px"
              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
              :rules="[required]"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="primary">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formData.debutPeriodeNonSalaire"
                      :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                      :options="optionsDn"
                      color="primary"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:label>
                {{ t('inputassu.debut_periode_non_salaire') }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ t('input.requis') }}
                </span>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="formData.finPeriodeNonSalaire"
              :label="t('inputassu.fin_periode_non_salaire')"
              dense
              outlined
              style="max-width: 300px"
              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="primary">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formData.dateRepriseActivite"
                      :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                      :options="optionsDn"
                      color="primary"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
        <!-- Troisième ligne -->
        <div class="row q-gutter-md">
          <div class="col-12 col-md-4">
            <q-file
              v-model="formData.bulletinPaie"
              :label="t('inputassu.bulletin_paie_nul')"
              outlined
              dense
              accept=".pdf,.jpg,.jpeg,.png"
              max-file-size="5242880"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="receipt" />
              </template>
            </q-file>
          </div>
          <div class="col-12 col-md-4">
            <q-file
              v-model="formData.attestationCessation"
              :label="t('inputassu.attestation_cessation_paiement')"
              :hint="t('inputassu.attestation_cessation_paiement')"
              outlined
              dense
              accept=".pdf,.jpg,.jpeg,.png"
              max-file-size="5242880"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="verified" />
              </template>
            </q-file>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-slide-transition>
</template>

<script setup>
import { toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
defineOptions({ name: 'PrestationMaternite' });
const props = defineProps({
  formData: { type: Object, required: true },
  locale: { type: String, required: true },
  required: { type: Function, required: true },
  nombreActesNaissance: { type: Number, required: true },
  updateNaissanceFields: { type: Function, required: false },
  dateValidationRules: { type: Array, required: false },
  optionsDn: { type: Function, required: false }
});
const { formData, locale, required, nombreActesNaissance, updateNaissanceFields, dateValidationRules, optionsDn } = toRefs(props);
const { t } = useI18n();
</script>

<template>
  <div class="text-primary">
    <p class="text-primary text-weight-bold">
      <span>{{ t('inputassu.informations_allocations_familiales') }}</span>
    </p>
    <div class="text-primary">
      <!-- Informations Principales -->
      <q-expansion-item
        icon="info"
        :label="t('inputassu.informations_principales')"
        default-opened
        class="bg-grey-1 rounded-borders q-mb-md"
      >
        <q-card-section>
          <div class="row q-gutter-md">
            <q-input
              v-model="allocationsForm.dateSignatureDossier"
              :label="t('inputassu.date_signature_dossier_employeur')"
              :hint="t('inputassu.date_signature_dossier_employeur')"
              outlined
              dense
              :rules="[required]"
              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              style="max-width:450px"
              class="col-12 col-sm-6"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="primary">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="allocationsForm.dateSignatureDossier"
                      :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                      :options="optionsDn"
                      color="primary"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:label>
                {{ t('inputassu.date_signature_dossier_employeur') }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ t('input.requis') }}
                </span>
              </template>
            </q-input>
            <q-input
              v-model="allocationsForm.dateEmbauche"
              :label="t('inputassu.date_embauche')"
              outlined
              dense
              :rules="[required]"
              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
              style="max-width: 300px"
              class="col-12 col-sm-3"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="primary">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="allocationsForm.dateEmbauche"
                      :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                      :options="optionsDn"
                      color="primary"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:label>
                {{ t('inputassu.date_embauche') }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ t('input.requis') }}
                </span>
              </template>
            </q-input>
            <q-input
              v-model="allocationsForm.heuresTravaillees"
              :label="t('inputassu.nombre_heures_travaillees_mois_embauche')"
              :hint="t('inputassu.nombre_heures_travaillees_mois_embauche')"
              outlined
              dense
              min="0"
              type="number"
              style="max-width: 350px"
              class="col-12 col-sm-4"
            />
          </div>
          <div class="row q-gutter-md q-mt-md">
            <q-select
              v-model="allocationsForm.nombreEnfantsMoins6"
              :label="t('inputassu.nombre_nouveaux_enfants_moins_six_ans')"
              :hint="t('inputassu.nombre_nouveaux_enfants_moins_six_ans')"
              :options="numberOptions"
              outlined
              dense
              class="col-12 col-sm-4"
              style="max-width: 350px"
              emit-value
              map-options
              :rules="[() => validateEnfantsSelection() || t('errors.at_least_one_child_required')]"
            >
              <template v-slot:label>
                {{ t('inputassu.nombre_nouveaux_enfants_moins_six_ans') }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ t('input.requis') }}
                </span>
              </template>
            </q-select>
            <q-select
              v-model="allocationsForm.nombreEnfantsPlus6"
              :label="t('inputassu.nombre_nouveaux_enfants_plus_six_ans')"
              :hint="t('inputassu.nombre_nouveaux_enfants_plus_six_ans')"
              :options="numberOptions"
              outlined
              dense
              class="col-12 col-sm-4"
              style="max-width: 350px"
              emit-value
              map-options
              :rules="[() => validateEnfantsSelection() || t('errors.at_least_one_child_required')]"
            >
              <template v-slot:label>
                {{ t('inputassu.nombre_nouveaux_enfants_plus_six_ans') }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ t('input.requis') }}
                </span>
              </template>
            </q-select>
            <q-select
              v-model="allocationsForm.nombreEnfantsReconnus"
              :label="t('inputassu.nombre_nouveaux_enfants_reconnus')"
              :hint="t('inputassu.nombre_nouveaux_enfants_reconnus')"
              :options="numberOptions"
              outlined
              dense
              class="col-12 col-sm-4"
              style="max-width: 350px"
              emit-value
              map-options
              :rules="[() => validateEnfantsSelection() || t('errors.at_least_one_child_required')]"
            >
              <template v-slot:label>
                {{ t('inputassu.nombre_nouveaux_enfants_reconnus') }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ t('input.requis') }}
                </span>
              </template>
            </q-select>
          </div>
          <!-- Documents pour enfants de moins de 6 ans -->
          <div v-if="allocationsForm.nombreEnfantsMoins6 > 0" class="q-mt-md">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('inputassu.documents_pour_enfants_moins_6_ans') }}</div>
            <div>
              <div v-for="i in parseInt(allocationsForm.nombreEnfantsMoins6 || 0)" :key="`moins6-${i}`" class="row q-gutter-md">
                <q-file
                  v-model="allocationsForm[`certificatVieEnfantMoins6_${i}`]"
                  :label="t(`inputassu.certificat_vie_enfant ${i}` )"
                  outlined
                  dense
                  accept=".pdf,.jpg,.png"
                  max-file-size="3072000"
                  :rules="[required]"
                  style="max-width: 350px"
                  class="col-12 col-md-4 q-pa-sm"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:label>
                    {{ t('inputassu.certificat_vie_enfant') }} {{ i }}
                    <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                      {{ t('input.requis') }}
                    </span>
                  </template>
                </q-file>
                <q-file
                  v-model="allocationsForm[`certificatScolariteEnfantMoins6_${i}`]"
                  :label="t(`inputassu.certificat_scolarite_enfant ${i}` )"
                  outlined
                  dense
                  accept=".pdf,.jpg,.png"
                  max-file-size="3072000"
                  :rules="[required]"
                  style="max-width: 350px"
                  class="col-12 col-md-4 q-pa-sm"
                >
                  <template v-slot:prepend>
                    <q-icon name="school" />
                  </template>
                  <template v-slot:label>
                    {{ t('inputassu.certificat_scolarite_enfant') }} {{ i }}
                    <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                      {{ t('input.requis') }}
                    </span>
                  </template>
                </q-file>
                <q-file
                  v-model="allocationsForm[`acteNaissanceEnfantMoins6_${i}`]"
                  :label="t(`inputassu.acte_naissance_enfant ${i}` )"
                  outlined
                  dense
                  accept=".pdf,.jpg,.png"
                  max-file-size="3072000"
                  :rules="[required]"
                  style="max-width: 350px"
                  class="col-12 col-md-4 q-pa-sm"
                >
                  <template v-slot:prepend>
                    <q-icon name="child_care" />
                  </template>
                  <template v-slot:label>
                    {{ t('inputassu.acte_naissance_enfant') }} {{ i }}
                    <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                      {{ t('input.requis') }}
                    </span>
                  </template>
                </q-file>
              </div>
            </div>
          </div>
          <!-- Documents pour enfants de plus de 6 ans -->
          <div v-if="allocationsForm.nombreEnfantsPlus6 > 0" class="q-mt-md">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('inputassu.documents_pour_enfants_plus_6_ans') }}</div>
            <div>
              <div v-for="i in parseInt(allocationsForm.nombreEnfantsPlus6 || 0)" :key="`plus6-${i}`" class="row q-gutter-md">
                <q-file
                  v-model="allocationsForm[`certificatScolariteEnfantPlus6_${i}`]"
                  :label="t(`inputassu.certificat_scolarite_enfant ${i}`)"
                  outlined
                  dense
                  accept=".pdf,.jpg,.png"
                  max-file-size="3072000"
                  :rules="[required]"
                  style="max-width: 350px"
                  class="col-12 col-md-4 q-pa-sm"
                >
                  <template v-slot:prepend>
                    <q-icon name="school" />
                  </template>
                  <template v-slot:label>
                    {{ t('inputassu.certificat_scolarite_enfant') }} {{ i }}
                    <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                      {{ t('input.requis') }}
                    </span>
                  </template>
                </q-file>
                <q-file
                  v-model="allocationsForm[`acteNaissanceEnfantPlus6_${i}`]"
                  :label="t(`inputassu.acte_naissance_enfant ${i}`)"
                  outlined
                  dense
                  accept=".pdf,.jpg,.png"
                  max-file-size="3072000"
                  :rules="[required]"
                  style="max-width: 350px"
                  class="col-12 col-md-4 q-pa-sm"
                >
                  <template v-slot:prepend>
                    <q-icon name="child_care" />
                  </template>
                  <template v-slot:label>
                    {{ t('inputassu.acte_naissance_enfant') }} {{ i }}
                    <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                      {{ t('input.requis') }}
                    </span>
                  </template>
                </q-file>
              </div>
            </div>
          </div>
          <!-- Documents pour enfants reconnus -->
          <div v-if="allocationsForm.nombreEnfantsReconnus > 0" class="q-mt-md">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('inputassu.documents_pour_enfants_reconnus') }}</div>
            <div class="row q-gutter-xs" style="width: 100%;">
              <div v-for="i in parseInt(allocationsForm.nombreEnfantsReconnus || 0)" :key="`reconnus-${i}`" style="width: 32%;">
                <q-file
                  v-model="allocationsForm[`declarationReconnaissance_${i}`]"
                  :label=" t('inputassu.declaration_reconnaissance_enfant') + ' ' + i"
                  :hint="t('inputassu.declaration_reconnaissance_enfant')"
                  outlined
                  dense
                  accept=".pdf,.jpg,.png"
                  max-file-size="3072000"
                  :rules="[required]"
                  style="max-width: 350px"
                  class="col-12 col-md-4"
                >
                  <template v-slot:prepend>
                    <q-icon name="gavel" />
                  </template>
                  <template v-slot:label>
                    {{ t('inputassu.declaration_reconnaissance_enfant') }} {{ i }}
                    <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                      {{ t('input.requis') }}
                    </span>
                  </template>
                </q-file>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-expansion-item>
      <!-- Pièces Complémentaires -->
      <q-expansion-item
        icon="attach_file"
        :label="t('inputassu.pieces_complementaires')"
        class="bg-grey-1 rounded-borders"
      >
        <q-card-section>
          <div class="row q-gutter-md">
            <q-file
              v-model="allocationsForm.attestationNonPerceptionAF"
              :label="t('inputassu.attestation_non_perception_af')"
              :hint="t('inputassu.attestation_non_perception_af')"
              outlined
              dense
              accept=".pdf,.jpg,.png"
              max-file-size="3072000"
              style="max-width: 350px"
              class="col-12 col-sm-4"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <q-file
              v-model="allocationsForm.acteMariageCertifie"
              :label="t('inputassu.acte_mariage_certifie')"
              :hint="t('inputassu.acte_mariage_certifie')"
              outlined
              dense
              accept=".pdf,.jpg,.png"
              max-file-size="3072000"
              style="max-width: 350px"
              class="col-12 col-sm-4"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <q-file
              v-model="allocationsForm.originalActeMariage"
              :label="t('inputassu.original_acte_mariage')"
              :hint="t('inputassu.original_acte_mariage')"
              outlined
              dense
              accept=".pdf,.jpg,.png"
              max-file-size="3072000"
              style="max-width: 350px"
              class="col-12 col-sm-4"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
          </div>
          <!-- Actes de naissance supplémentaires -->
          <div class="q-mt-md">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('inputassu.actes_naissance_supplementaires') }}</div>
            <div v-for="(row, rowIndex) in actesNaissanceSupplementairesRows" :key="`acte-row-${rowIndex}`" class="row q-gutter-md" style="width: 100%;">
              <div v-for="idx in row" :key="`acte-${idx}`" class="col-12 col-md-4 q-pa-sm" style="width: 350px;">
                <q-file
                  v-model="allocationsForm[`acteNaissanceSupplementaire_${idx}`]"
                  :label="t('inputassu.acte_naissance_supplementaire') + ' ' + idx"
                  outlined
                  dense
                  accept=".pdf,.jpg,.png"
                  max-file-size="3072000"
                  style="max-width: 350px"
                >
                  <template v-slot:prepend>
                    <q-icon name="child_care" />
                  </template>
                </q-file>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-expansion-item>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
defineOptions({ name: 'PrestationAllocations' });
const props = defineProps({
  allocationsForm: { type: Object, required: true },
  locale: { type: String, required: true },
  required: { type: Function, required: true },
  numberOptions: { type: Array, required: true },
  validateEnfantsSelection: { type: Function, required: true },
  actesNaissanceSupplementairesRows: { type: Array, required: true },
  optionsDn: { type: Function, required: false }
});
const { allocationsForm, locale, required, numberOptions, validateEnfantsSelection, actesNaissanceSupplementairesRows, optionsDn } = toRefs(props);
const { t } = useI18n();
</script>

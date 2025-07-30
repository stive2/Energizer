<template>
  <div class="text-primary">
    <!-- Choix du/des examen(s) à demander -->
    <div class="row q-mb-md q-gutter-md">
      <q-checkbox
        v-model="formData.demandePremierExamen"
        :label="$t('inputassu.demande_remboursement_premier_examen')"
        class="col-12 col-sm-6"
      />
      <q-checkbox
        v-model="formData.demandeDeuxiemeExamen"
        :label="$t('inputassu.demande_remboursement_deuxieme_examen')"
        class="col-12 col-sm-6"
        :rules="[() => validateSecondExamCheckboxes() || t('errors.checkbox_required_second_exam')]"
      />
    </div>
    <!-- Premier Examen -->
    <q-expansion-item
      v-if="formData.demandePremierExamen"
      icon="looks_one"
      :label="$t('inputassu.premier_examen_prenatal')"
      default-opened
      class="bg-grey-1 rounded-borders"
    >
      <q-card-section>
        <div class="justify-center row q-mb-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="formData.datePremierExamen"
              :label="$t('date_premier_examen')"
              dense
              outlined
              clearable
              style="max-width: 300px"
              :rules="[required]"
              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="primary">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formData.datePremierExamen"
                      :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                      :options="optionsDn"
                      color="primary"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:label>
                {{ $t('inputassu.date_premier_examen') }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ $t('input.requis') }}
                </span>
              </template>
            </q-input>
          </div>
        </div>
        <div class="justify-center row q-mb-md">
          <div class="col-12 col-sm-4">
            <q-checkbox
              v-model="formData.allocations1"
              :label="$t('inputassu.frais_allocation') + ' 1'"
              :rules="[() => validateFirstExamCheckboxes() || t('errors.checkbox_required_first_exam')]"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-checkbox
              v-model="formData.fraisMedicaux1"
              :label="$t('inputassu.frais_medicaux') + ' 1'"
              :rules="[() => validateFirstExamCheckboxes() || t('errors.checkbox_required_first_exam')]"
            />
          </div>
        </div>
        <div class="justify-center row q-gutter-y-md">
          <div class="col-12 col-sm-6">
            <q-file
              v-model="formData.certificatPremier"
              :label="$t('inputassu.certificat_premier_examen')"
              dense
              outlined
              clearable
              accept=".pdf,.jpg,.png"
              max-file-size="3072000"
              style="max-width: 500px"
              :rules="[required]"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-slot:label>
                {{ $t('inputassu.certificat_premier_examen') }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ $t('input.requis') }}
                </span>
              </template>
            </q-file>
          </div>
          <div class="col-12 col-sm-6">
            <q-file
              v-model="formData.fraisMedicauxPremier"
              :label="$t('inputassu.frais_medicaux_premier_examen')"
              dense
              outlined
              clearable
              max-file-size="3072000"
              accept=".pdf,.jpg,.png"
              style="max-width: 500px"
            >
              <template v-slot:prepend>
                <q-icon name="receipt" />
              </template>
            </q-file>
          </div>
        </div>
      </q-card-section>
    </q-expansion-item>
    <!-- Deuxième Examen -->
    <q-expansion-item
      v-if="formData.demandeDeuxiemeExamen"
      icon="looks_two"
      :label="$t('inputassu.deuxieme_examen_prenatal')"
      class="bg-grey-1 rounded-borders q-mt-md"
    >
      <q-card-section>
        <div class="justify-center row q-mb-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="formData.dateDeuxiemeExamen"
              :label="$t('inputassu.date_deuxieme_examen')"
              dense
              outlined
              style="max-width: 300px"
              :rules="[required]"
              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="primary">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formData.dateDeuxiemeExamen"
                      :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                      :options="optionsDn"
                      color="primary"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:label>
                {{ $t('inputassu.date_deuxieme_examen') }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ $t('input.requis') }}
                </span>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="formData.dateProbableAccouchement"
              :label="$t('inputassu.date_probable_accouchement')"
              dense
              outlined
              style="max-width: 400px"
              :rules="[required]"
              :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
            >
              <template v-slot:prepend>
                <q-icon name="child_care" />
              </template>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="primary">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formData.dateProbableAccouchement"
                      :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                      color="primary"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:label>
                {{ $t('inputassu.date_probable_accouchement') }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ $t('input.requis') }}
                </span>
              </template>
            </q-input>
          </div>
        </div>
        <div class="justify-center row q-mb-md">
          <div class="col-12 col-sm-4">
            <q-checkbox
              v-model="formData.allocations2"
              :label="$t('inputassu.frais_allocation') + ' 2'"
              :rules="[() => validateSecondExamCheckboxes() || t('errors.checkbox_required_second_exam')]"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-checkbox
              v-model="formData.fraisMedicaux2"
              :label="$t('inputassu.frais_medicaux') + ' 2'"
              :rules="[() => validateSecondExamCheckboxes() || t('errors.checkbox_required_second_exam')]"
            />
          </div>
        </div>
        <div class="justify-center row q-gutter-y-md">
          <div class="col-12 col-sm-6">
            <q-file
              v-model="formData.certificatDeuxieme"
              :label="$t('inputassu.certificat_medical_huitieme_mois_grossesse')"
              :hint="$t('inputassu.certificat_medical_huitieme_mois_grossesse')"
              dense
              outlined
              accept=".pdf,.jpg,.png"
              style="max-width: 500px"
              max-file-size="3072000"
              :rules="[required]"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-slot:label>
                {{ $t('inputassu.certificat_medical_huitieme_mois_grossesse') }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ $t('input.requis') }}
                </span>
              </template>
            </q-file>
          </div>
          <div class="col-12 col-sm-6">
            <q-file
              v-model="formData.fraisMedicauxDeuxieme"
              :label="$t('inputassu.frais_medicaux_deuxieme_examen')"
              dense
              outlined
              max-file-size="3072000"
              accept=".pdf,.jpg,.png"
              style="max-width: 500px"
            >
              <template v-slot:prepend>
                <q-icon name="receipt" />
              </template>
            </q-file>
          </div>
        </div>
      </q-card-section>
    </q-expansion-item>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
defineOptions({ name: 'PrestationRemboursementPrenatal' });
const props = defineProps({
  formData: { type: Object, required: true },
  locale: { type: String, required: true },
  required: { type: Function, required: true },
  validateFirstExamCheckboxes: { type: Function, required: true },
  validateSecondExamCheckboxes: { type: Function, required: true },
  t: { type: Function, required: true },
  optionsDn: { type: Function, required: false },
});
const { formData, locale, required, validateFirstExamCheckboxes, validateSecondExamCheckboxes, t, optionsDn } = toRefs(props);
</script>

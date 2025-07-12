<template>
  <div class="text-primary">
    <p class="text-primary text-weight-bold">
      <span>{{ t('inputassu.informations_accouchement') }}</span>
    </p>
    <div class="text-primary">
      <div class="row q-gutter-md">
        <q-input
          v-model="accouchementForm.dateAccouchement"
          :label="t('inputassu.date_effective_accouchement')"
          :hint="t('inputassu.date_effective_accouchement')"
          outlined
          dense
          :rules="[required]"
          :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
          style="max-width: 350px"
          class="col-12 col-sm-6"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer" color="primary">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="accouchementForm.dateAccouchement"
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
          v-model="accouchementForm.nombreEnfantsViables"
          :label="t('inputassu.nombre_enfants_viables')"
          outlined
          class="col-12 col-sm-6"
          dense
          min="0"
          type="number"
          :rules="[required]"
          style="max-width: 350px"
        >
          <template v-slot:label>
            {{ t('inputassu.nombre_enfants_viables') }}
            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
              {{ t('input.requis') }}
            </span>
          </template>
        </q-input>
        <q-input
          v-model="accouchementForm.nombreEnfantsSousControle"
          :label="t('inputassu.nombre_enfants_sous_controle_medical')"
          :hint="t('inputassu.nombre_enfants_sous_controle_medical')"
          type="number"
          :min="0"
          :max="10"
          outlined
          dense
          :rules="[required]"
          class="col-12 col-sm-6"
          style="max-width: 400px"
        >
          <template v-slot:label>
            {{ t('inputassu.nombre_enfants_sous_controle_medical') }}
            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
              {{ t('input.requis') }}
            </span>
          </template>
        </q-input>
      </div>
      <div class="row">
        <q-checkbox
          v-model="accouchementForm.fraisAccouchement"
          :label="t('inputassu.frais_accouchement')"
          class="col-12 col-sm-3"
        />
        <q-checkbox
          v-model="accouchementForm.fraisMedicaux"
          :label="t('inputassu.frais_medicaux')"
          class="col-12 col-sm-3"
        />
        <q-file
          v-model="accouchementForm.certificatMedical"
          :label="t('inputassu.certificat_medical_accouchement')"
          outlined
          dense
          class="col-12 col-sm-6"
          accept=".pdf,.jpg,.png"
          max-file-size="3072000"
          clearable
          style="max-width: 400px"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
      </div>
      <div class="row">
        <div v-for="i in parseInt(accouchementForm.nombreEnfantsSousControle || 0)" :key="i" class="q-pa-sm col-12 col-md-4">
          <q-file
            v-model="accouchementForm[`acteNaissanceEnfant${i}`]"
            :label="`${t('inputassu.acte_naissance_enfant')} ${i}`"
            outlined
            dense
            accept=".pdf,.jpg,.png"
            max-file-size="3072000"
            :rules="[required]"
            style="max-width: 400px"
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
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
defineOptions({ name: 'PrestationAccouchement' });
const props = defineProps({
  accouchementForm: { type: Object, required: true },
  locale: { type: String, required: true },
  required: { type: Function, required: true },
  optionsDn: { type: Function, required: false }
});
const { accouchementForm, locale, required, optionsDn } = toRefs(props);
const { t } = useI18n();
</script>

<template>
  <div class="text-primary">
    <p class="text-primary text-weight-bold">
      <span>{{ t("Informations sur l'Accident de Travail") }}</span>
    </p>
    <div class="text-primary">
      <div class="row q-gutter-md">
        <q-input
          v-model="accidentForm.dateAccident"
          :label="t('Date accident')"
          dense
          outlined
          style="max-width: 400px"
          :rules="[required]"
          :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
          :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer" color="primary">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="accidentForm.dateAccident"
                  :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                  :options="optionsDn"
                  color="primary"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:label>
            {{ t('Date accident') }}
            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
              {{ t('input.requis') }}
            </span>
          </template>
        </q-input>
      </div>
      <div class="row q-gutter-md">
        <q-file
          v-model="accidentForm.declarationAccident"
          :label="t('Déclaration d\'Accident')"
          outlined
          dense
          accept=".pdf,.jpg,.png"
          max-file-size="3072000"
          :rules="[required]"
          style="max-width: 350px"
          class="col-12 col-sm-4"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
          <template v-slot:label>
            {{ t('Déclaration d\'Accident') }}
            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
              {{ t('input.requis') }}
            </span>
          </template>
        </q-file>
        <q-file
          v-model="accidentForm.copieCNI"
          :label="t('Copie Carte Nationale d\'Identité')"
          outlined
          dense
          accept=".pdf,.jpg,.png"
          max-file-size="3072000"
          :rules="[required]"
          style="max-width: 350px"
          class="col-12 col-sm-4"
        >
          <template v-slot:prepend>
            <q-icon name="badge" />
          </template>
          <template v-slot:label>
            {{ t('Copie Carte Nationale d\'Identité') }}
            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
              {{ t('input.requis') }}
            </span>
          </template>
        </q-file>
        <q-file
          v-model="accidentForm.procesVerbal"
          :label="t('Procès Verbal Constat Accident')"
          outlined
          dense
          accept=".pdf,.jpg,.png"
          max-file-size="3072000"
          style="max-width: 350px"
          class="col-12 col-sm-4"
        >
          <template v-slot:prepend>
            <q-icon name="gavel" />
          </template>
          <template v-slot:label>
            {{ t('Procès Verbal Constat Accident') }}
          </template>
        </q-file>
      </div>
      <div class="row q-gutter-md q-mb-md">
        <q-file
          v-model="accidentForm.declarationTemoignage"
          :label="t('Déclaration de Témoignage')"
          outlined
          dense
          accept=".pdf,.jpg,.png"
          max-file-size="3072000"
          style="max-width: 350px"
          class="col-12 col-sm-4"
        >
          <template v-slot:prepend>
            <q-icon name="description" />
          </template>
        </q-file>
        <q-file
          v-model="accidentForm.demandeRemboursement"
          :label="t('Demande Remboursement Employeur')"
          :hint="t('Demande Remboursement Employeur')"
          outlined
          dense
          accept=".pdf,.jpg,.png"
          max-file-size="3072000"
          style="max-width: 350px"
          class="col-12 col-sm-4"
        >
          <template v-slot:prepend>
            <q-icon name="receipt" />
          </template>
        </q-file>
        <q-file
          v-model="accidentForm.certificatMedicalInitial"
          :label="t('Certificat Médical Initial')"
          outlined
          dense
          accept=".pdf,.jpg,.png"
          max-file-size="3072000"
          :rules="[required]"
          style="max-width: 350px"
          class="col-12 col-sm-4"
        >
          <template v-slot:prepend>
            <q-icon name="medical_services" />
          </template>
          <template v-slot:label>
            {{ t('Certificat Médical Initial') }}
            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
              {{ t('input.requis') }}
            </span>
          </template>
        </q-file>
      </div>
      <div class="row q-gutter-md q-mb-md">
        <q-file
          v-model="accidentForm.certificatMedicalFinal"
          :label="t('Certificat Médical Final')"
          outlined
          dense
          accept=".pdf,.jpg,.png"
          max-file-size="3072000"
          style="max-width: 400px"
          class="col-12 col-sm-4"
        >
          <template v-slot:prepend>
            <q-icon name="medical_services" />
          </template>
          <template v-slot:label>
            {{ t('Certificat Médical Final') }}
          </template>
        </q-file>
      </div>
      <div class="row q-gutter-md q-mb-md">
        <q-select
          v-model="accidentForm.nombreFacturesOrdonnances"
          :label="t('Nombre Factures et Ordonnances')"
          :options="numberOptions"
          outlined
          dense
          class="col-12 col-sm-3"
          :rules="[required]"
          style="max-width: 300px"
          emit-value
          map-options
        >
          <template v-slot:label>
            {{ t('Nombre Factures et Ordonnances') }}
            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
              {{ t('input.requis') }}
            </span>
          </template>
        </q-select>
        <q-select
          v-model="accidentForm.nombreJoursArret"
          :label="t('Nombre Jours Arrêt de Travail')"
          :options="numberOptions"
          outlined
          dense
          class="col-12 col-sm-3"
          :rules="[required]"
          style="max-width: 250px"
          emit-value
          map-options
        >
          <template v-slot:label>
            {{ t('Nombre Jours Arrêt de Travail') }}
            <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
              {{ t('input.requis') }}
            </span>
          </template>
        </q-select>
        <q-select
          v-model="accidentForm.nombreCertificatsProlongation"
          :label="t('Nombre Certificats Médicaux Prolongation')"
          :options="numberOptions"
          outlined
          dense
          class="col-12 col-sm-3"
          style="max-width: 300px"
          emit-value
          map-options
        />
        <q-select
          v-model="accidentForm.nombreBulletinsSalaire"
          :label="t('Nombre Bulletins de Salaire')"
          :options="numberOptions"
          outlined
          dense
          class="col-12 col-sm-3"
          style="max-width: 250px"
          emit-value
          map-options
        />
      </div>
      <!-- Factures et Ordonnances -->
      <div v-if="accidentForm.nombreFacturesOrdonnances > 0" class="q-mt-md">
        <div class="text-subtitle1 text-primary q-mb-sm">{{ t('Factures et Ordonnances') }}</div>
        <div class="row q-gutter-md" style="width: 100%;">
          <div v-for="i in parseInt(accidentForm.nombreFacturesOrdonnances || 0)" :key="`facture-${i}`" style="width: 30%;">
            <q-file
              v-model="accidentForm[`factureOrdonnance_${i}`]"
              :label="`${t('Facture ou Ordonnance')} ${i}`"
              outlined
              dense
              accept=".pdf,.jpg,.png"
              max-file-size="3072000"
              :rules="[required]"
              style="max-width: 350px"
              class="col-12 col-md-4 q-pa-sm"
            >
              <template v-slot:prepend>
                <q-icon name="receipt" />
              </template>
              <template v-slot:label>
                {{ t('Facture ou Ordonnance') }} {{ i }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ t('input.requis') }}
                </span>
              </template>
            </q-file>
          </div>
        </div>
      </div>
      <!-- Certificats Médicaux de Prolongation -->
      <div v-if="accidentForm.nombreCertificatsProlongation > 0" class="q-mt-md">
        <div class="text-subtitle1 text-primary q-mb-sm">{{ t('Certificats Médicaux de Prolongation') }}</div>
        <div class="row q-gutter-md" style="width: 100%;">
          <div v-for="i in parseInt(accidentForm.nombreCertificatsProlongation || 0)" :key="`prolongation-${i}`" style="width: 30%;">
            <q-file
              v-model="accidentForm[`certificatProlongation_${i}`]"
              :label="`${t('Certificat Médical Prolongation')} ${i}`"
              outlined
              dense
              accept=".pdf,.jpg,.png"
              max-file-size="3072000"
              :rules="[required]"
              style="max-width: 350px"
              class="col-12 col-md-4 q-pa-sm"
            >
              <template v-slot:prepend>
                <q-icon name="medical_services" />
              </template>
              <template v-slot:label>
                {{ t('Certificat Médical Prolongation') }} {{ i }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ t('input.requis') }}
                </span>
              </template>
            </q-file>
          </div>
        </div>
      </div>
      <!-- Bulletins de Salaire -->
      <div v-if="accidentForm.nombreBulletinsSalaire > 0" class="q-mt-md">
        <div class="text-subtitle1 text-primary q-mb-sm">{{ t('Bulletins de Salaire') }}</div>
        <div class="row q-gutter-md" style="width: 100%;">
          <div v-for="i in parseInt(accidentForm.nombreBulletinsSalaire || 0)" :key="`bulletin-${i}`" style="width: 30%;">
            <q-file
              v-model="accidentForm[`bulletinSalaire_${i}`]"
              :label="`${t('Bulletin de Salaire')} ${i}`"
              outlined
              dense
              accept=".pdf,.jpg,.png"
              max-file-size="3072000"
              :rules="[required]"
              style="max-width: 350px"
              class="col-12 col-md-4 q-pa-sm"
            >
              <template v-slot:prepend>
                <q-icon name="payment" />
              </template>
              <template v-slot:label>
                {{ t('Bulletin de Salaire') }} {{ i }}
                <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                  {{ t('input.requis') }}
                </span>
              </template>
            </q-file>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
defineOptions({ name: 'PrestationAccident' });
const props = defineProps({
  accidentForm: { type: Object, required: true },
  locale: { type: String, required: true },
  required: { type: Function, required: true },
  numberOptions: { type: Array, required: true },
  optionsDn: { type: Function, required: false }
});
const { accidentForm, locale, required, numberOptions, optionsDn } = toRefs(props);
const { t } = useI18n();
</script>

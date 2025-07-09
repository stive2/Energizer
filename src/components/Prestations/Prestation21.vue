<template>
  <q-card class="pension-form-card">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">
        <q-icon name="verified" class="q-mr-sm" />
        {{ t('inputassu.verifie_pension') }}
      </div>
    </q-card-section>
    <q-card-section>
      <q-expansion-item
        v-model="revenus.expanded"
        icon="account_balance_wallet"
        :label="t('inputassu.etat_revenus')"
        class="q-mb-md"
        header-class="bg-blue-1 text-primary text-weight-bold text-uppercase"
      >
        <q-card>
          <q-card-section>
            <div class="row q-gutter-md q-mb-md">
              <q-input
                v-model="revenus.affiliation"
                :label="t('inputassu.date_affiliation')"
                dense
                outlined
                readonly
                :rules="[required]"
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
                class="col-md-3 col-sm-6 col-xs-12"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer" color="primary">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="revenus.affiliation"
                        readonly
                        :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                        :options="optionsDn"
                        color="primary"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
                <template v-slot:label>
                  {{ t('inputassu.date_affiliation') }}
                  <span class="q-px-sm bg-red text-white text-italic rounded-borders" style="font-size: 10px">
                    {{ t('input.requis') }}
                  </span>
                </template>
              </q-input>
              <q-input
                v-model="revenus.nbMois"
                :label="t('inputassu.nombre_mois_assurance')"
                type="number"
                outlined
                readonly
                dense
                class="col-md-3 col-sm-6 col-xs-12"
                style="max-width: 200px;"
              />
              <q-input
                v-model="revenus.dernierMois"
                :label="t('inputassu.dernier_mois_declaration_cotisation')"
                dense
                outlined
                readonly
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                :hint="locale === 'en' ? 'YYYY-MM-DD' : 'JJ/MM/AAAA'"
                class="col-md-3 col-sm-6 col-xs-12"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer" color="primary">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="revenus.dernierMois"
                        readonly
                        :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                        :options="optionsDn"
                        color="primary"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-select
                v-model="revenus.typePrestation"
                :options="typePrestationOptions"
                :label="t('inputassu.type_prestation')"
                outlined
                dense
                readonly
                class="col-md-3 col-sm-6 col-xs-12"
              />
            </div>
            <div class="row">
              <q-btn
                @click="consulterRevenus"
                :loading="revenus.loading"
                color="primary"
                icon="search"
                :label="t('inputassu.consulter')"
                style="max-width: 200px;"
                class="col-md-2 col-sm-6 col-xs-12"
              />
            </div>
            <!-- Table des revenus -->
            <q-table
              v-if="revenus.data.length > 0"
              :rows="revenus.data"
              :columns="revenusColumns"
              row-key="annee"
              class="pension-table q-mb-md"
              :pagination="{ rowsPerPage: 0 }"
              hide-pagination
            >
              <template #top>
                <div class="text-h6 text-primary">{{t('inputassu.historique_revenus')}}</div>
              </template>
            </q-table>
            <!-- Validation des revenus -->
            <div class="q-mt-md" v-if="revenus.data.length > 0">
              <div class="text-subtitle1 q-mb-sm">{{t('inputassu.validation_etat_revenus')}}</div>
              <q-option-group
                v-model="revenus.validation"
                :options="validationOptions"
                color="primary"
                inline
              />
              <q-input
                v-if="revenus.validation === 'NON'"
                v-model="revenus.explications"
                :label="t('inputassu.explications')"
                type="textarea"
                outlined
                class="q-mt-sm"
                rows="3"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <!-- Récapitulatif Période d'Activité -->
      <q-expansion-item
        v-model="activite.expanded"
        icon="work_history"
        :icon-color="activite.data.length > 0 ? 'primary' : 'grey'"
        :label="t('inputassu.periodes_activite')"
        class="q-mb-md"
        header-class="bg-blue-1 text-primary text-weight-bold"
      >
        <q-card class="q-mt-sm">
          <q-card-section>
            <q-btn
              @click="consulterActivite"
              :loading="activite.loading"
              color="primary"
              icon="search"
              :label="t('inputassu.consulter')"
              style="max-width: 200px;"
              class="q-mb-md"
            />
            <!-- Table des activités -->
            <q-table
              v-if="activite.data.length > 0"
              :rows="activite.data"
              :columns="activiteColumns"
              row-key="matricule"
              class="pension-table q-mb-md"
              :pagination="{ rowsPerPage: 0 }"
              hide-pagination
            >
              <template #top>
                <div class="text-h6 text-primary">{{t('inputassu.periodes_activite')}}</div>
              </template>
            </q-table>
            <!-- Validation des activités -->
            <div class="q-mt-md" v-if="activite.data.length > 0">
              <div class="text-subtitle1 q-mb-sm">{{t('inputassu.validation_periode_activite')}}</div>
              <q-option-group
                v-model="activite.validation"
                :options="validationOptions"
                color="primary"
                inline
              />
              <q-input
                v-if="activite.validation === 'NON'"
                v-model="activite.explications"
                :label="t('inputassu.explications')"
                type="textarea"
                outlined
                class="q-mt-sm"
                rows="3"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <!-- Section de validation finale -->
      <q-card class="q-mt-md bg-grey-1">
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            {{t('inputassu.documents_justificatifs')}}
          </div>
          <div class="row q-gutter-md items-center">
            <q-file
              v-model="fichierJoint"
              :label="t('inputassu.plusieurs_documents_pdf')"
              outlined
              accept=".pdf"
              max-file-size="3072000"
              class="col-md-8 col-sm-12"
              @rejected="onRejected"
            >
              <template #prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
          </div>
        </q-card-section>
      </q-card>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
defineOptions({ name: 'PrestationPension' });
const props = defineProps({
  revenus: { type: Object, required: true },
  activite: { type: Object, required: true },
  fichierJoint: { type: Object, required: false },
  revenusColumns: { type: Array, required: true },
  activiteColumns: { type: Array, required: true },
  validationOptions: { type: Array, required: true },
  typePrestationOptions: { type: Array, required: true },
  consulterRevenus: { type: Function, required: true },
  consulterActivite: { type: Function, required: true },
  onRejected: { type: Function, required: true },
  locale: { type: String, required: true },
  required: { type: Function, required: true },
  optionsDn: { type: Function, required: false }
});
const { revenus, activite, fichierJoint, revenusColumns, activiteColumns, validationOptions, typePrestationOptions, consulterRevenus, consulterActivite, onRejected, locale, required, optionsDn } = toRefs(props);
const { t } = useI18n();
</script>

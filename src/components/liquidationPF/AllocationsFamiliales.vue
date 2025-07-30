<template>
  <div class="q-pa-md">
    <!-- En-tête avec animation -->
    <div class="text-h6 text-center text-primary q-mb-lg q-animate-fade">
      <q-icon name="assignment" size="md" class="q-mr-sm" />
      {{ $t('LiquidationPF.allocationsFamiliales.title') }}
    </div>

    <!-- Formulaire de recherche compact -->
    <q-form @submit="searchDossiers" class="q-mb-md">
      <q-card class="q-mb-md" style="border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
        <q-card-section class="text-primary" style="border-radius: 15px 15px 0 0;">
          <div class="row q-col-gutter-sm items-center">
            <q-select
              v-model="searchCriteria"
              :options="searchOptions"
              :label="$t('LiquidationPF.allocationsFamiliales.searchForm.criteria')"
              outlined
              dense
              color="primary"
              style="min-width: 140px;"
              class="col-12 col-sm-3"
            />
            <q-input
              v-model="searchStartValue"
              :label="$t('LiquidationPF.allocationsFamiliales.searchForm.startValue')"
              outlined
              dense
              color="primary"
              @input="searchStartValue = searchStartValue.toUpperCase()"
              class="col-12 col-sm-3"
            />
            <q-input
              v-model="searchEndValue"
              :label="$t('LiquidationPF.allocationsFamiliales.searchForm.endValue')"
              outlined
              dense
              color="primary"
              @input="searchEndValue = searchEndValue.toUpperCase()"
              class="col-12 col-sm-3"
            />
            <div class="col-12 col-sm-3 q-gutter-xs">
              <q-btn
                type="submit"
                color="primary"
                :label="$t('LiquidationPF.allocationsFamiliales.searchForm.search')"
                icon="search"
                dense
                style="border-radius: 10px;"
              />
              <q-btn
                type="reset"
                color="grey-6"
                :label="$t('LiquidationPF.allocationsFamiliales.searchForm.reset')"
                icon="refresh"
                dense
                style="border-radius: 10px;"
                @click="resetSearch(); dialog = false"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-form>

    <!-- Bouton pour afficher/masquer le formulaire de saisie -->
    <div class="q-mb-sm text-center">
      <q-btn
        @click="dialog = true"
        color="primary"
        icon="edit_document"
        :label="$t('LiquidationPF.allocationsFamiliales.addButton')"
        size="md"
        unelevated
        class="q-px-xl q-py-sm"
        style="border-radius: 25px; padding: 12px 30px; box-shadow: 0 6px 20px rgba(0,0,0,0.2); text-transform: none; font-weight: 600;"
      >
        <q-tooltip class="bg-grey text-body2">
          {{ $t('LiquidationPF.allocationsFamiliales.searchForm.tooltip') }}
        </q-tooltip>
      </q-btn>
    </div>

    <!-- Formulaire de saisie (conditionnel) -->
    <q-dialog v-model="dialog" persistent full-width>
      <div class="q-mb-lg">
        <q-form ref="saisieForm" @submit="validateForm">
          <q-card>
            <q-bar class="bg-primary text-white">
              <q-space />
              <div class="text-h6">{{ $t('LiquidationPF.allocationsFamiliales.dialogTitle') }}</div>
              <q-space />
              <q-btn dense flat icon="close" @click="dialog = false">
                <q-tooltip class="bg-white text-primary">{{ $t('LiquidationPF.allocationsFamiliales.closeButton') }}</q-tooltip>
              </q-btn>
            </q-bar>
            <q-card-section class="q-pb-none">
              <div class="text-h6 text-primary q-mb-md">
                <q-icon name="edit_document" class="q-mr-sm" />
                {{ $t('LiquidationPF.allocationsFamiliales.sections.formTitle') }}
              </div>

              <!-- Première ligne - 3 champs -->
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="formData.numDossier"
                    :label="$t('LiquidationPF.allocationsFamiliales.form.dossierNumber')"
                    readonly
                    outlined
                    dense
                    color="primary"
                    bg-color="grey-1"
                    class="text-body2"
                  >
                    <template v-slot:prepend>
                      <q-icon name="folder" color="primary" size="sm" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="formData.naturePrestation"
                    :label="$t('LiquidationPF.allocationsFamiliales.form.naturePrestation')"
                    readonly
                    outlined
                    dense
                    color="primary"
                    bg-color="grey-1"
                    class="text-body2"
                  >
                    <template v-slot:prepend>
                      <q-icon name="category" color="primary" size="sm" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="formData.dateDemande"
                    :label="$t('LiquidationPF.allocationsFamiliales.form.requestDate')"
                    readonly
                    outlined
                    dense
                    color="primary"
                    bg-color="grey-1"
                    class="text-body2"
                  >
                    <template v-slot:prepend>
                      <q-icon name="calendar_today" color="primary" size="sm" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Deuxième ligne - 3 champs -->
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="formData.numAssure"
                    :label="$t('LiquidationPF.allocationsFamiliales.form.insuredNumber')"
                    readonly
                    outlined
                    dense
                    color="primary"
                    bg-color="grey-1"
                    class="text-body2"
                  >
                    <template v-slot:prepend>
                      <q-icon name="badge" color="primary" size="sm" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="formData.nomAssure"
                    :label="$t('LiquidationPF.allocationsFamiliales.form.insuredNames')"
                    readonly
                    outlined
                    dense
                    color="primary"
                    bg-color="grey-1"
                    class="text-body2"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" color="primary" size="sm" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="formData.prenomAssure"
                    :label="$t('LiquidationPF.allocationsFamiliales.form.insuredFirstNames')"
                    readonly
                    outlined
                    dense
                    color="primary"
                    bg-color="grey-1"
                    class="text-body2"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person_outline" color="primary" size="sm" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Troisième ligne - 3 champs éditables -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="formData.dateEmbauche"
                    :label="$t('LiquidationPF.allocationsFamiliales.form.hiringDate')"
                    outlined
                    dense
                    color="primary"
                    bg-color="white"
                    class="text-body2"
                    :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                    :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                    :rules="[val => val && val.length === 10 || $t('LiquidationPF.allocationsFamiliales.messages.hiringDateRequired')]"
                  >
                    <template #append>
                      <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="formData.dateEmbauche"
                            :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                            :locale="locale"
                            color="primary"
                            @update:model-value="updateDateEmbauche"
                          />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="formData.dateSignatureEmployeur"
                    :label="$t('LiquidationPF.allocationsFamiliales.form.employerSignatureDate')"
                    outlined
                    dense
                    color="primary"
                    bg-color="white"
                    class="text-body2"
                    :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                    :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                    :rules="[val => val && val.length === 10 || $t('LiquidationPF.allocationsFamiliales.messages.signatureDateRequired')]"
                  >
                    <template #append>
                      <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="formData.dateSignatureEmployeur"
                            :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                            :locale="locale"
                            color="primary"
                            @update:model-value="updateDateSignature"
                          />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="formData.nombreHeures"
                    :label="$t('LiquidationPF.allocationsFamiliales.form.workedHours')"
                    type="number"
                    outlined
                    dense
                    color="primary"
                    :rules="[val => val >= 0 || $t('LiquidationPF.allocationsFamiliales.messages.invalidHours')]"
                    bg-color="white"
                    class="text-body2"
                  >
                    <template v-slot:prepend>
                      <q-icon name="schedule" color="primary" size="sm" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Boutons d'action -->
              <div class="row justify-center">
                <q-btn
                  type="submit"
                  color="primary"
                  :label="$t('LiquidationPF.allocationsFamiliales.actions.validate')"
                  icon="check_circle"
                  size="md"
                  class="q-px-md  q-mb-lg"
                  style="border-radius: 20px;"
                />
                <q-btn
                  type="reset"
                  color="grey-6"
                  :label="$t('LiquidationPF.allocationsFamiliales.actions.cancel')"
                  icon="cancel"
                  flat
                  size="md"
                  @click="resetForm, dialog = false"
                  class="q-px-md  q-mb-lg"
                  style="border-radius: 20px;"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-form>
      </div>
    </q-dialog>

    <!-- Tableau des résultats avec style amélioré -->
    <q-card flat bordered class="shadow-3" style="border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
      <q-card-section class="bg-primary text-white" style="border-radius: 15px 15px 0 0;">
        <div class="text-h6">
          <q-icon name="table_view" class="q-mr-sm" />
          {{ $t('LiquidationPF.allocationsFamiliales.table.title') }}
        </div>
      </q-card-section>

      <q-table
        :rows="dossiers"
        :columns="columns"
        row-key="id"
        :pagination="{ rowsPerPage: 10 }"
        dense
        flat
        style="border-radius: 0 0 15px 15px;"
        class="fairy-table"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-grey-2">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-primary text-weight-bold"
              style="font-size: 0.9rem;"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" class="hover-row" @click="loadDossier(props.row)">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="font-size: 0.85rem;"
            >
              {{ props.row[col.name] }}
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm text-grey-6 q-pa-lg">
            <q-icon size="2em" name="search_off" />
            <span class="text-body1">{{ $t('LiquidationPF.allocationsFamiliales.table.noData') }}</span>
          </div>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { Notify } from 'quasar';
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const { t, locale } = useI18n();
    // État du dialog
    const dialog = ref(false);

    // Données du formulaire
    const formData = reactive({
      numDossier: '',
      naturePrestation: '',
      dateDemande: '',
      numAssure: '',
      nomAssure: '',
      prenomAssure: '',
      dateEmbauche: '',
      dateSignatureEmployeur: '',
      nombreHeures: 0
    });

    // Données de recherche
    const searchCriteria = ref('fnumdoss');
    const searchOptions = [
      { label: t('LiquidationPF.allocationsFamiliales.searchOptions.dossierNumber'), value: 'fnumdoss' },
      { label: t('LiquidationPF.allocationsFamiliales.searchOptions.insuredNumber'), value: 'fnumassu' },
      { label: t('LiquidationPF.allocationsFamiliales.searchOptions.insuredNames'), value: 'fnomassu' }
    ];
    const searchStartValue = ref('');
    const searchEndValue = ref('');

    // Données du tableau
    const dossiers = ref([]);
    const columns = [
      { name: 'numDossier', label: t('LiquidationPF.allocationsFamiliales.table.columns.dossierNumber'), field: 'numDossier', align: 'left' },
      { name: 'numAssure', label: t('LiquidationPF.allocationsFamiliales.table.columns.insuredNumber'), field: 'numAssure', align: 'left' },
      { name: 'nomRequerant', label: t('LiquidationPF.allocationsFamiliales.table.columns.requesterNames'), field: 'nomRequerant', align: 'left' },
      { name: 'dateDemande', label: t('LiquidationPF.allocationsFamiliales.table.columns.requestDate'), field: 'dateDemande', align: 'center' },
      { name: 'naturePrestation', label: t('LiquidationPF.allocationsFamiliales.table.columns.naturePrestation'), field: 'naturePrestation', align: 'center' },
      { name: 'positionDossier', label: t('LiquidationPF.allocationsFamiliales.table.columns.dossierStatus'), field: 'positionDossier', align: 'center' },
      { name: 'datePosition', label: t('LiquidationPF.allocationsFamiliales.table.columns.statusDate'), field: 'datePosition', align: 'center' }
    ];

    // Référence au formulaire pour validation
    const saisieForm = ref(null);

    // Validation des dates
    const validateForm = async () => {
      const isValid = await saisieForm.value.validate();
      if (!isValid) {
        Notify.create({
          type: 'negative',
          message: t('LiquidationPF.allocationsFamiliales.messages.formErrors'),
          position: 'top'
        });
        return;
      }
      if (!compareDates(formData.dateEmbauche, formData.dateSignatureEmployeur)) {
        Notify.create({
          type: 'negative',
          message: t('LiquidationPF.allocationsFamiliales.messages.hiringDateAfterSignature'),
          position: 'top'
        });
        return;
      }
      // Soumettre les données (simulé)
      dialog.value = false;
      Notify.create({
        type: 'positive',
        message: t('LiquidationPF.allocationsFamiliales.messages.dataSaved'),
        position: 'top',
        icon: 'check_circle'
      });
    };

    // Comparaison des dates
    const compareDates = (date1, date2) => {
      if (date1.length !== 10 || date2.length !== 10) return false;
      const [day1, month1, year1] = date1.split('/').map(Number);
      const [day2, month2, year2] = date2.split('/').map(Number);
      if (year1 > year2) return true;
      if (year1 < year2) return false;
      if (month1 > month2) return true;
      if (month1 < month2) return false;
      return day1 > day2;
    };

    // Mise à jour des dates
    const updateDateEmbauche = (value) => {
      formData.dateEmbauche = value;
    };
    const updateDateSignature = (value) => {
      formData.dateSignatureEmployeur = value;
    };

    // Réinitialisation du formulaire
    const resetForm = () => {
      Object.keys(formData).forEach(key => {
        formData[key] = key === 'nombreHeures' ? 0 : '';
      });
      saisieForm.value.resetValidation();
    };

    // Recherche des dossiers
    const searchDossiers = () => {
      dossiers.value = [
        {
          numDossier: 'DOS123',
          numAssure: 'ASS456',
          nomRequerant: 'NDJENG NKOLO',
          dateDemande: '01/01/2025',
          naturePrestation: 'AF',
          positionDossier: 'En attente',
          datePosition: '02/01/2025'
        },
        {
          numDossier: 'DOS124',
          numAssure: 'ASS457',
          nomRequerant: 'MBALLA SOPHIE',
          dateDemande: '03/01/2025',
          naturePrestation: 'AF',
          positionDossier: 'Validé',
          datePosition: '04/01/2025'
        }
      ];
      Notify.create({
        type: 'positive',
        message: `${dossiers.value.length} ${t('LiquidationPF.allocationsFamiliales.messages.dossiersFound')}`,
        position: 'top',
        icon: 'search'
      });
    };

    // Réinitialisation de la recherche
    const resetSearch = () => {
      searchCriteria.value = 'fnumdoss';
      searchStartValue.value = '';
      searchEndValue.value = '';
      dossiers.value = [];
    };

    // Chargement des données d'un dossier dans le formulaire
    const loadDossier = (row) => {
      formData.numDossier = row.numDossier;
      formData.numAssure = row.numAssure;
      formData.nomAssure = row.nomRequerant;
      formData.prenomAssure = '';
      formData.dateDemande = row.dateDemande;
      formData.naturePrestation = row.naturePrestation;
      formData.dateEmbauche = '';
      formData.dateSignatureEmployeur = '';
      formData.nombreHeures = 0;

      // Ouvrir automatiquement le formulaire
      dialog.value = true;

      Notify.create({
        type: 'info',
        message: `Dossier ${row.numDossier} ${t('LiquidationPF.allocationsFamiliales.messages.dossierLoaded')}`,
        position: 'top',
        icon: 'info'
      });
    };

    return {
      dialog,
      formData,
      searchCriteria,
      searchOptions,
      searchStartValue,
      searchEndValue,
      dossiers,
      columns,
      saisieForm,
      locale,
      validateForm,
      resetForm,
      searchDossiers,
      resetSearch,
      loadDossier,
      updateDateEmbauche,
      updateDateSignature
    };
  }
};
</script>

<style scoped>
.hover-highlight:hover {
  background-color: rgba(25, 118, 210, 0.1) !important;
  transition: background-color 0.2s ease;
}

.q-table__top {
  padding: 16px;
}

.text-body2 {
  font-size: 0.875rem;
}

.q-dialog__inner {
  padding: 16px;
}

/* Animation pour l'ouverture du dialog */
.q-dialog .q-card {
  animation: fadeInUp 0.3s ease-out;
}
.q-dialog .q-card {
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.rounded-borders {
  border-radius: 12px;
}
</style>

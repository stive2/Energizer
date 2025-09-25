<template>
  <div class="nouveau-dossier">
    <q-card class="q-pa-sm">
      <!-- Recherche des demandes -->
      <q-card flat bordered class="q-pa-md">
        <div class="text-subtitle1 q-mb-sm text-bold">Rechercher Télédéclaration RP</div>
        <q-form @submit.prevent="searchDemande" ref="searchForm">
          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-input
                v-model="formSearch.numAssure"
                label="Matricule Assure"
                outlined
                dense
                :rules="[required, validateMatriculeCNPS]"
              />
            </div>

            <div class="col-4">
              <q-select
                v-model="formSearch.typeRp"
                :options="typeRP"
                label="Type de risque"
                outlined
                dense
                @update:model-value="rows = []"
                :rules="[required]"
              />
            </div>

            <div class="col-4 flex flex-center">
              <q-btn :label="t('labels.recherche')" color="primary" type="submit" />
            </div>
          </div>
        </q-form>
        <div class="q-pa-md">
          <q-table
            class="my-sticky-header-table"
            flat
            bordered
            :rows="rows"
            :columns="columns"
            row-key="code_temporaire"
            selection="single"
            v-model:selected="selectedRow"
          />
        </div>
      </q-card>

      <!-- AT -->
      <q-card flat bordered class="q-pa-md" v-if="formSearch.typeRp.value === 'AT' && eltSelect">
        <q-stepper
          v-model="step"
          :vertical="$q.screen.lt.sm"
          color="primary"
          :inactive-color="maxStep >= step ? 'secondary' : ''"
          animated
          header-nav
          ref="stepper"
          contracted
        >
          <q-step
            :name="1"
            :title="$t('assu')"
            icon="person"
            :done="done[1]"
            :error="stateform[1]"
            :disable="!isStepAllowed(1)"
          >
            <q-card class="flex-center text-center">
              <div
                class="text-wrap q-mt-md flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -20px"
              >
                {{ $t('assu') }}
              </div>
              <q-card-section>
                <q-form ref="myForm">
                  <div class="row flex justify-evenly">
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        autofocus
                        :dense="dense"
                        class="q-ma-sm"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.num_assu"
                        readonly
                        :label="$t('num_assu')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.nom_assu"
                        :label="$t('nom_assu')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.prenom_assu"
                        :label="$t('prenom_assu')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.date_naiss_assu"
                        :label="$t('date_naiss_assu')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.lieu_naiss_assu"
                        :label="$t('lieu_naiss_assu')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.sexe_assu"
                        label="Sexe"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.code_pays_nat_assu"
                        :label="$t('nationalite_assu')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.code_pays_naiss_assu"
                        :label="$t('origine_assu')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.sit_fam_mat"
                        :label="$t('sit_fam_mat')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.date_embauche"
                        :label="$t('date_emb')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.date_cessation"
                        :label="$t('date_cessation')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        :options="secteurs"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.secteur"
                        option-label="lib_secteur"
                        :label="$t('sect_class_prof')"
                        use-input
                        input-debounce="300"
                        @filter="filterSp"
                        :rules="[(val) => (val && val != null) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        :options="qualifications"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.qualification"
                        option-label="lib_qualification"
                        :label="$t('quaf_prof')"
                        use-input
                        input-debounce="300"
                        @filter="filterQa"
                        :rules="[(val) => (val && val != null) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.adresse_assu"
                        :label="$t('adresse_assu')"
                        :rules="[
                          (val) => (val && val.length > 0) || 'Saisir l\'adresse de l\'assuré',
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.quartier_assu"
                        :label="$t('quartier_assu')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        v-model="formData.assure.email_assu"
                        type="email"
                        color="primary-12"
                        label-slot
                        :label="$t('email_assu')"
                        style="width: 95%"
                        lazy-rules
                        :rules="[
                          (val) => (val && val.length > 0) || $t('emailForm'),
                          (val) =>
                            val.match(/^[A-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i) ||
                            $t('emailForm2'),
                        ]"
                      >
                        <template v-slot:label>
                          <div class="row items-center all-pointer-events">
                            <q-icon class="q-mr-xs" color="blue" size="24px" name="mail" />
                            {{ $t('email_assu') }}
                          </div>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        v-model="formData.assure.tel_assu"
                        :label="$t('tel_assu')"
                        color="primary-12"
                        prefix="(+237)"
                        mask="### ### ###"
                        unmasked-value
                        label-slot
                        lazy-rules
                        :rules="[
                          (val) => val.length >= 9 || $t('telephoneForm'),
                          (val) =>
                            val.match(/^65|66|67|68|69|70+[0-9]{7}$/) ||
                            val.match(/^222|233|242|243|244+[0-9]{6}$/) ||
                            $t('telephoneForm2'),
                        ]"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-end">
              <q-btn
                @click="checkStep(1, 2, myForm)"
                class="q-mx-sm"
                color="primary"
                :label="$t('Suivant')"
              />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="2"
            :title="$t('empl')"
            icon="person"
            :done="done[2]"
            :error="stateform[2]"
            :disable="!isStepAllowed(2)"
          >
            <q-card class="flex-center text-center">
              <div
                class="text-wrap flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -10px"
              >
                {{ $t('empl') }}
              </div>
              <q-card-section>
                <q-form ref="myForm2">
                  <div class="row flex justify-evenly">
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        autofocus
                        :dense="dense"
                        class="q-ma-sm"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.employeur.num_employeur"
                        :label="$t('num_employeur')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.employeur.raison_sociale"
                        :label="$t('raison_sociale')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        readonly
                        v-model="formData.employeur.nom_commercial"
                        :label="$t('nom_commerciale')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        readonly
                        v-model="formData.employeur.sigle"
                        :label="$t('sigle')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.employeur.num_contr"
                        :label="$t('num_contrib')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.employeur.lib_centre"
                        label="CPS"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        type="number"
                        step="1"
                        color="primary-12"
                        readonly
                        v-model="formData.employeur.nbre_sal"
                        :label="$t('nbre_sal')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        readonly
                        v-model="formData.employeur.act_principale"
                        :label="$t('act_pric')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="secteursAct"
                        filled
                        use-input
                        input-debounce="300"
                        option-label="libelle_sect_activite"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.employeur.act_sencondaire"
                        :label="$t('autres_act')"
                        @filter="filterSa"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.employeur.adresse_employeur"
                        :label="$t('adresse_empl')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        v-model="formData.employeur.email"
                        type="email"
                        color="primary-12"
                        label-slot
                        :label="$t('email_empl')"
                        style="width: 95%"
                        lazy-rules
                        :rules="[
                          (val) => (val && val.length > 0) || $t('emailForm'),
                          (val) =>
                            val.match(/^[A-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i) ||
                            $t('emailForm2'),
                        ]"
                      >
                        <template v-slot:label>
                          <div class="row items-center all-pointer-events">
                            <q-icon class="q-mr-xs" color="blue" size="24px" name="mail" />
                            {{ $t('email_empl') }}
                          </div>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        v-model="formData.employeur.tel"
                        :label="$t('tel_empl')"
                        color="primary-12"
                        prefix="(+237)"
                        mask="### ### ###"
                        unmasked-value
                        label-slot
                        lazy-rules
                        :rules="[
                          (val) => val.length >= 9 || $t('telephoneForm'),
                          (val) =>
                            val.match(/^65|66|67|68|69|70+[0-9]{7}$/) ||
                            val.match(/^222|233|242|243|244+[0-9]{6}$/) ||
                            $t('telephoneForm2'),
                        ]"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn
                flat
                @click="stepBack()"
                color="primary"
                :label="$t('Précédent')"
                class="q-mx-sm"
              />
              <q-btn @click="checkStep(2, 3, myForm2)" color="primary" :label="$t('Suivant')" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="3"
            :title="$t('poste_trav')"
            icon="add_comment"
            :done="done[3]"
            :error="stateform[3]"
            :disable="!isStepAllowed(3)"
          >
            <q-card class="flex-center text-center">
              <div
                class="text-wrap q-mt-md flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -20px"
              >
                {{ $t('poste_trav') }}
              </div>
              <q-card-section>
                <q-form ref="myForm3">
                  <div class="row flex justify-evenly">
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="postes"
                        filled
                        use-input
                        input-debounce="300"
                        option-label="libelle"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.posteTravail"
                        :label="$t('poste_assu')"
                        @filter="filterPt"
                        :rules="[
                          (val) =>
                            val && Object.keys(val).length > 0
                              ? true
                              : 'Sélectionner le poste de travail de la victime',
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="optionsCont"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.type_contrat"
                        :label="$t('type_contrat')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.anc_poste_travail"
                        :label="$t('anc_poste')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.horaire_travail"
                        :label="$t('horaire_trav')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        min="1"
                        step="1"
                        v-model="formData.accident.categorie"
                        :label="$t('categorie')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.echelon"
                        :label="$t('echelon')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="options"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.perc_remuneration"
                        :label="$t('perc_remuneration')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" :label="$t('Précédent')" />
              <q-btn @click="checkStep(3, 4, myForm3)" color="primary" :label="$t('Suivant')" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="4"
            :title="$t('Antecedent')"
            icon="add_comment"
            :done="done[4]"
            :error="stateform[4]"
            :disable="!isStepAllowed(4)"
          >
            <q-card class="flex-center text-center">
              <div
                class="text-wrap q-mt-md flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -20px"
              >
                {{ $t('Antecedent') }}
              </div>
              <q-card-section>
                <q-form ref="myForm4">
                  <div class="row flex justify-evenly">
                    <div class="col-12 col-md-12">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="options"
                        style="width: 98%"
                        color="primary-12"
                        v-model="formData.accident.vict_risq_ant"
                        :label="$t('vict_risq_ant')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.vict_risq_ant == 'OUI'"
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('date_risque_1')"
                        v-model="formData.accident.date_risque_1"
                        :rules="[(val) => (val && val.length > 0) || 'Seleclionnez la date']"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="formData.accident.date_risque_1"
                                :options="optionsDn"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.vict_risq_ant == 'OUI'"
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="number"
                        step="0.01"
                        min="0"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.taux_ipp_1"
                        :label="$t('taux_ipp_1')"
                        :rules="[(val) => (val !== null && val >= 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.vict_risq_ant == 'OUI'"
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('date_risque_2')"
                        v-model="formData.accident.date_risque_2"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="formData.accident.date_risque_2"
                                :options="optionsDn"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.vict_risq_ant == 'OUI'"
                        outlined
                        class="q-ma-sm"
                        type="number"
                        step="0.01"
                        min="0"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.taux_ipp_2"
                        :label="$t('taux_ipp_2')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.vict_risq_ant == 'OUI'"
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('date_risque_3')"
                        v-model="formData.accident.date_risque_3"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="formData.accident.date_risque_3"
                                :options="optionsDn"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.vict_risq_ant == 'OUI'"
                        outlined
                        class="q-ma-sm"
                        type="number"
                        step="0.01"
                        min="0"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.taux_ipp_3"
                        :label="$t('taux_ipp_3')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.vict_risq_ant == 'OUI'"
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('date_risque_4')"
                        v-model="formData.accident.date_risque_4"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="formData.accident.date_risque_4"
                                :options="optionsDn"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.vict_risq_ant == 'OUI'"
                        outlined
                        class="q-ma-sm"
                        type="number"
                        step="0.01"
                        min="0"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.taux_ipp_4"
                        :label="$t('taux_ipp_4')"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" :label="$t('Précédent')" />
              <q-btn @click="checkStep(4, 5, myForm4)" color="primary" :label="$t('Suivant')" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="5"
            :title="$t('Accident')"
            icon="add_comment"
            :done="done[5]"
            :error="stateform[5]"
            :disable="!isStepAllowed(5)"
          >
            <q-card class="flex-center text-center">
              <div
                class="text-wrap flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -20px"
              >
                {{ $t('Accident') }}
              </div>
              <q-card-section>
                <q-form ref="myForm5">
                  <div class="row flex justify-center">
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('date_accident')"
                        v-model="formData.accident.date_accident"
                        :rules="[
                          (val) => (val && val.length > 0) || 'Seleclionnez la date de l\'accident',
                        ]"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="formData.accident.date_accident"
                                :options="optionsDn"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="formData.accident.heure_accident"
                        style="width: 95%"
                        :dense="dense"
                        :label="$t('heure_accident')"
                        filled
                        type="time"
                        :rules="[
                          (val) => (val && val != null) || 'Saisir l\'heure de l\'accident ',
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.lieu_accident"
                        :label="$t('lieu_accident')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="causes"
                        filled
                        use-input
                        input-debounce="300"
                        option-label="libelle_cause"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.causeAccident"
                        :label="$t('cause_accident')"
                        @filter="filterCa"
                        :rules="[
                          (val) => (val && val != {} && val != null && val != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="agents"
                        filled
                        use-input
                        input-debounce="300"
                        option-label="libelle"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.agentMateriel"
                        :label="$t('agent_materiel')"
                        @filter="filterAm"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="options"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.hospitalisation"
                        :label="$t('hospitalisation')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.hospitalisation == 'OUI'"
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.lieu_hospitalisation"
                        :label="$t('lieu_hospitalisation')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="options"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.tiers_resp"
                        :label="$t('tiers_resp')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.tiers_resp == 'OUI'"
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.nom_resp"
                        :label="$t('nom_resp')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.tiers_resp == 'OUI'"
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.adresse_resp"
                        :label="$t('adresse_resp')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.tiers_resp == 'OUI'"
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.org_assu_resp"
                        :label="$t('org_assu_resp')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.tiers_resp == 'OUI'"
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.num_police_resp"
                        :label="$t('num_police_resp')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.date_accident"
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="number"
                        min="0"
                        step="0.1"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.salaire_1"
                        :label="mois1"
                        :rules="[(val) => (val !== null && val >= 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.date_accident"
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="number"
                        min="0"
                        step="0.1"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.salaire_2"
                        :label="mois2"
                        :rules="[(val) => (val !== null && val >= 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.accident.date_accident"
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="number"
                        min="0"
                        step="0.1"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.salaire_3"
                        :label="mois3"
                        :rules="[(val) => (val !== null && val >= 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="textarea"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.description_accident"
                        :label="$t('description_accident')"
                        :rules="[
                          (val) => (val && val.length > 0) || $t('Required'),
                          (val) => val.length <= 500 || 'MAX 500',
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="textarea"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.sequelles_initiales"
                        :label="$t('sequelles')"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" :label="$t('Précédent')" />
              <q-btn @click="checkStep(5, 6, myForm5)" color="primary" :label="$t('Suivant')" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="6"
            :title="$t('Consequence')"
            icon="add_comment"
            :done="done[6]"
            :error="stateform[6]"
            :disable="!isStepAllowed(6)"
          >
            <q-card>
              <p
                class="text-wrap flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -17px"
              >
                {{ $t('Consequence') }}
              </p>
              <q-card-section>
                <q-form ref="myForm6">
                  <div class="row flex-center text-center" style="width: 100%">
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="options"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.arret_travail"
                        :label="$t('arret_travail')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="options"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.arret_sup_24h"
                        :label="$t('arret_sup_24h')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="options"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.deces_immediat"
                        :label="$t('deces_immediat')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                  </div>
                  <div class="" style="width: 100%">
                    <div v-for="(lesion, index) in formData.accident.lesions" :key="lesion.index">
                      <div
                        class="q-pa-xs text-center text-primary text-bold"
                        style="margin-top: 10px"
                      >
                        <span> {{ $t('Lesion') }} {{ index + 1 }}</span>
                        <q-btn
                          icon="delete"
                          flat
                          round
                          @click="deleteLesion(index)"
                          style="color: red"
                        />
                      </div>
                      <div class="row flex justify-evenly">
                        <div class="col-12 col-md-6">
                          <q-select
                            outlined
                            class="q-ma-sm"
                            :dense="dense"
                            :options="natures"
                            option-label="libelle"
                            filled
                            use-input
                            input-debounce="300"
                            @filter="filterNl"
                            style="width: 95%"
                            color="primary-12"
                            v-model="lesion.natureLesion"
                            :label="$t('natureLesion')"
                            :rules="[
                              (val) =>
                                (val && val != {} && val != '') ||
                                'Sélectionner au moins une nature de lésion',
                            ]"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-select
                            outlined
                            class="q-ma-sm"
                            :dense="dense"
                            :options="sieges"
                            option-label="libelle"
                            filled
                            use-input
                            input-debounce="300"
                            @filter="filterSl"
                            style="width: 95%"
                            color="primary-12"
                            v-model="lesion.siegeLesion"
                            :label="$t('siegeLesion')"
                            :rules="[
                              (val) =>
                                (val && val != {} && val != '') ||
                                'Sélectionner au moins un Siège de lésion',
                            ]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" :label="$t('Précédent')" />
              <q-btn :label="$t('Ajouter_lesion')" @click="addLesion()" dense color="primary" />
              <q-btn
                :disable="formData.accident.lesions.length == 0"
                @click="checkStep(6, 7, myForm6)"
                color="primary"
                :label="$t('Suivant')"
              />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="7"
            :title="$t('Témoins')"
            icon="add_comment"
            :done="done[7]"
            :error="stateform[7]"
            :disable="!isStepAllowed(7)"
          >
            <q-card>
              <p
                class="text-wrap flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -17px"
              >
                {{ $t('Témoins') }}
              </p>
              <q-card-section>
                <q-form ref="myForm7">
                  <div class="row flex justify-center">
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.nom_temoin_1"
                        :label="$t('nom_temoin_1')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.prof_temoin_1"
                        :label="$t('prof_temoin_1')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.ville_temoin_1"
                        :label="$t('ville_temoin_1')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.tel_temoin_1"
                        :label="$t('tel_temoin_1')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.nom_temoin_2"
                        :label="$t('nom_temoin_2')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.prof_temoin_2"
                        :label="$t('prof_temoin_2')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.ville_temoin_2"
                        :label="$t('ville_temoin_2')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.tel_temoin_2"
                        :label="$t('tel_temoin_2')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.nom_temoin_3"
                        :label="$t('nom_temoin_3')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.prof_temoin_3"
                        :label="$t('prof_temoin_3')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.ville_temoin_3"
                        :label="$t('ville_temoin_3')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.tel_temoin_3"
                        :label="$t('tel_temoin_3')"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" :label="$t('Précédent')" />
              <q-btn @click="checkStep(7, 8, myForm7)" color="primary" :label="$t('Suivant')" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="8"
            :title="$t('Proches')"
            icon="add_comment"
            :done="done[8]"
            :error="stateform[8]"
            :disable="!isStepAllowed(8)"
          >
            <q-card>
              <p
                class="text-wrap flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -17px"
              >
                {{ $t('Proches') }}
              </p>
              <q-card-section>
                <q-form ref="myForm8">
                  <div class="row flex justify-center">
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.nom_pers_cont_1"
                        :label="$t('nom_pers_cont_1')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.qual_pers_cont_1"
                        :label="$t('qual_pers_cont_1')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.ville_pers_cont_1"
                        :label="$t('ville_pers_cont_1')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.tel_pers_cont_1"
                        :label="$t('tel_pers_cont_1')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.nom_pers_cont_2"
                        :label="$t('nom_pers_cont_2')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.qual_pers_cont_2"
                        :label="$t('qual_pers_cont_2')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.ville_pers_cont_2"
                        :label="$t('ville_pers_cont_2')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.tel_pers_cont_2"
                        :label="$t('tel_pers_cont_2')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.nom_pers_cont_3"
                        :label="$t('nom_pers_cont_3')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.qual_pers_cont_3"
                        :label="$t('qual_pers_cont_3')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.ville_pers_cont_3"
                        :label="$t('ville_pers_cont_3')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.tel_pers_cont_3"
                        :label="$t('tel_pers_cont_3')"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" :label="$t('Précédent')" />
              <q-btn @click="checkStep(8, 9, myForm8)" color="primary" :label="$t('Suivant')" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="9"
            :title="$t('Declarant')"
            icon="add_comment"
            :done="done[9]"
            :error="stateform[9]"
            :disable="!isStepAllowed(9)"
          >
            <q-card class="flex-center text-center">
              <div
                class="text-wrap flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -20px"
              >
                {{ $t('Declarant') }}
              </div>
              <q-card-section>
                <q-form ref="myForm9">
                  <div class="row flex justify-center">
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.declarant"
                        :label="$t('Nom_declarant')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.contact_declarant"
                        :label="$t('contact_declarant')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.lien_declarant"
                        :label="$t('lien_declarant')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.lieu_declaration"
                        :label="$t('lieu_declaration')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="optionsDeclarants"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.accident.qual_declarant"
                        :label="$t('qual_declarant')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" :label="$t('Précédent')" />
              <q-btn @click="checkStep(9, 10, myForm9)" color="primary" :label="$t('Suivant')" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="10"
            :title="$t('Resume')"
            icon="add_comment"
            :done="done[10]"
            :disable="!isStepAllowed(10)"
          >
            <div class="q-pa-md" ref="recapContent10">
              <span class="text-h6 text-blue text-center">{{ $t('Resume') }}</span
              ><br />
              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('empl') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('num_employeur') }} :
                    <strong>{{ formData.employeur.num_employeur }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('raison_sociale') }} :
                    <strong> {{ formData.employeur.raison_sociale }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nom_commerciale') }} :
                    <strong>{{ formData.employeur.nom_commercial }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('sigle') }} : <strong>{{ formData.employeur.sigle }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('num_contrib') }} :
                    <strong>{{ formData.employeur.num_contr }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >CPS : <strong>{{ formData.employeur.lib_centre }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nbre_sal') }} :
                    <strong>{{ lisibilite_nombre(formData.employeur.nbre_sal) }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('act_pric') }} :
                    <strong> {{ formData.employeur.act_principale }} </strong></span
                  >
                  <span v-if="formData.employeur.act_sencondaire" class="col-md-6 col-xs-12"
                    >{{ $t('autres_act') }} :
                    <strong>{{
                      formData.employeur.act_sencondaire.libelle_sect_activite
                    }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('adresse_empl') }} :
                    <strong>{{ formData.employeur.adresse_employeur }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('email_empl') }} : <strong>{{ formData.employeur.email }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('tel_empl') }} : <strong>{{ formData.employeur.tel }} </strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 1"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('assu') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('num_assu') }} : <strong>{{ formData.assure.num_assu }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nom_assu') }} : <strong> {{ formData.assure.nom_assu }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('prenom_assu') }} :
                    <strong>{{ formData.assure.prenom_assu }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('date_naiss_assu') }} :
                    <strong>{{ lisibilite_date(formData.assure.date_naiss_assu) }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('lieu_naiss_assu') }} :
                    <strong>{{ formData.assure.lieu_naiss_assu }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >Sexe : <strong>{{ formData.assure.sexe_assu }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nationalite_assu') }} :
                    <strong>{{ formData.assure.code_pays_nat_assu }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('origine_assu') }} :
                    <strong> {{ formData.assure.code_pays_naiss_assu }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('sit_fam_mat') }} :
                    <strong>{{ formData.assure.sit_fam_mat }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('date_emb') }} :
                    <strong>{{ formData.assure.date_embauche }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('date_cessation') }} :
                    <strong>{{ formData.assure.date_cessation }}</strong></span
                  >
                  <span v-if="formData.assure.secteur != null" class="col-md-6 col-xs-12"
                    >{{ $t('sect_class_prof') }} :
                    <strong>{{ formData.assure.secteur.lib_secteur }}</strong></span
                  >
                  <span v-if="formData.assure.qualification != null" class="col-md-6 col-xs-12"
                    >{{ $t('quaf_prof') }} :
                    <strong>{{ formData.assure.qualification.lib_qualification }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('adresse_assu') }} :
                    <strong>{{ formData.assure.adresse_assu }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('quartier_assu') }} :
                    <strong>{{ formData.assure.quartier_assu }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('email_assu') }} :
                    <strong>{{ formData.assure.email_assu }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('tel_assu') }} : <strong>{{ formData.assure.tel_assu }} </strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 2"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('poste_trav') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('poste_assu') }} :
                    <strong>{{ formData.accident.posteTravail.lib_poste }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('anc_poste') }} :
                    <strong> {{ formData.accident.anc_poste_travail }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('horaire_trav') }} :
                    <strong>{{ formData.accident.horaire_travail }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('categorie') }} :
                    <strong>{{ formData.accident.categorie }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('echelon') }} : <strong>{{ formData.accident.echelon }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('perc_remuneration') }} :
                    <strong> {{ formData.accident.perc_remuneration }} </strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 3"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('Antecedent') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-12 col-xs-12"
                    >{{ $t('victime_risq') }} :
                    <strong>{{ formData.accident.vict_risq_ant }}</strong></span
                  >
                  <div v-if="formData.accident.vict_risq_ant == 'OUI'">
                    <span class="col-md-6 col-xs-12"
                      >{{ $t('date_risque_1') }} :
                      <strong>
                        {{ lisibilite_date(formData.accident.date_risque_1) }}
                      </strong></span
                    >
                    <span class="col-md-6 col-xs-12"
                      >{{ $t('taux_ipp_1') }} :
                      <strong>{{ formData.accident.taux_ipp_1 }}</strong></span
                    >
                    <span v-if="formData.accident.date_risque_2" class="col-md-6 col-xs-12"
                      >{{ $t('date_risque_2') }} :
                      <strong> {{ lisibilite_date(formData.accident.date_risque_2) }} </strong> -
                    </span>
                    <span v-if="formData.accident.taux_ipp_2" class="col-md-6 col-xs-12"
                      >{{ $t('taux_ipp_2') }} : <strong>{{ formData.accident.taux_ipp_2 }}</strong
                      >;
                    </span>
                    <span v-if="formData.accident.date_risque_3" class="col-md-6 col-xs-12"
                      >{{ $t('date_risque_3') }} :
                      <strong> {{ lisibilite_date(formData.accident.date_risque_3) }} </strong> -
                    </span>
                    <span v-if="formData.accident.taux_ipp_3" class="col-md-6 col-xs-12"
                      >{{ $t('taux_ipp_3') }} : <strong>{{ formData.accident.taux_ipp_3 }}</strong
                      >;
                    </span>
                    <span v-if="formData.accident.date_risque_4" class="col-md-6 col-xs-12"
                      >{{ $t('date_risque_4') }} :
                      <strong> {{ lisibilite_date(formData.accident.date_risque_4) }} </strong> -
                    </span>
                    <span v-if="formData.accident.taux_ipp_4" class="col-md-6 col-xs-12"
                      >{{ $t('taux_ipp_4') }} : <strong>{{ formData.accident.taux_ipp_4 }}</strong
                      >;
                    </span>
                  </div>
                </div>
                <q-btn
                  flat
                  @click="step = 4"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('Accident') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('date_accident') }} :
                    <strong>{{ lisibilite_date(formData.accident.date_accident) }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('heure_accident') }} :
                    <strong>{{ formData.accident.heure_accident }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('lieu_accident') }} :
                    <strong> {{ formData.accident.lieu_accident }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ mois1 }} :
                    <strong> {{ lisibilite_nombre(formData.accident.salaire_1) }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ mois2 }} :
                    <strong> {{ lisibilite_nombre(formData.accident.salaire_2) }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ mois3 }} :
                    <strong> {{ lisibilite_nombre(formData.accident.salaire_3) }} </strong></span
                  >
                  <span v-if="causeAccident != null" class="col-md-6 col-xs-12"
                    >{{ $t('cause_accident') }} :
                    <strong>{{ causeformData.accident.libelle_cause }}</strong></span
                  >
                  <span v-if="agentMateriel != null" class="col-md-6 col-xs-12"
                    >{{ $t('agent_materiel') }} :
                    <strong>{{ agentMateriel.libelle_agent }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('hospitalisation') }} :
                    <strong>{{ formData.accident.hospitalisation }}</strong></span
                  >
                  <span v-if="formData.accident.hospitalisation == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('lieu_hospitalisation') }} :
                    <strong>{{ formData.accident.lieu_hospitalisation }} </strong></span
                  >
                  <span class="col-md-12 col-xs-12"
                    >{{ $t('tiers_resp') }} :
                    <strong>{{ formData.accident.tiers_resp }}</strong></span
                  >
                  <span v-if="formData.accident.tiers_resp == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('nom_resp') }} :
                    <strong> {{ formData.accident.nom_resp }} </strong></span
                  >
                  <span v-if="formData.accident.tiers_resp == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('adresse_resp') }} :
                    <strong>{{ formData.accident.adresse_resp }}</strong></span
                  >
                  <span v-if="formData.accident.tiers_resp == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('org_assu_resp') }} :
                    <strong>{{ formData.accident.org_assu_resp }}</strong></span
                  >
                  <span v-if="formData.accident.tiers_resp == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('num_police_resp') }} :
                    <strong>{{ formData.accident.num_police_resp }}</strong></span
                  >
                  <span class="col-md-12 col-xs-12"
                    >{{ $t('description_accident') }} :
                    <strong>{{ formData.accident.description_accident }} </strong></span
                  >
                  <span class="col-md-12 col-xs-12"
                    >{{ $t('sequelles') }} :
                    <strong>{{ formData.accident.sequelles_initiales }} </strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 5"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('Consequence') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('arret_travail') }} :
                    <strong>{{ formData.accident.arret_travail }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('arret_sup_24h') }} :
                    <strong> {{ formData.accident.arret_sup_24h }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('deces_immediat') }} :
                    <strong>{{ formData.accident.deces_immediat }}</strong></span
                  >
                  <table style="max-width: 1300px">
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th>{{ $t('natureLesion') }}</th>
                        <th>{{ $t('siegeLesion') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(lesion, index) in formData.accident.lesions" :key="lesion.index">
                        <td>{{ index + 1 }}</td>
                        <td v-if="lesion.natureLesion != null">
                          {{ lesion.natureLesion.libelle_nature }}
                        </td>
                        <td v-if="lesion.siegeLesion != null">
                          {{ lesion.siegeLesion.libelle_siege }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div v-for="(lesion, index) in formData.accident.lesions" :key="lesion.index">
                    <span v-if="lesion != null" class="col-md-6 col-xs-12"
                      >{{ $t('natureLesion') }} {{ index + 1 }} :
                      <strong>{{ lesion.natureLesion.libelle_nature }}</strong> -
                    </span>
                    <span v-if="lesion != null" class="col-md-6 col-xs-12"
                      >{{ $t('siegeLesion') }} {{ index + 1 }} :
                      <strong>{{ lesion.siegeLesion.libelle_siege }}</strong>
                    </span>
                  </div>
                </div>
                <q-btn
                  flat
                  @click="step = 6"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('Témoins') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nom_temoin_1') }} :
                    <strong>{{ formData.accident.nom_temoin_1 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('prof_temoin_1') }} :
                    <strong> {{ formData.accident.prof_temoin_1 }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('ville_temoin_1') }} :
                    <strong>{{ formData.accident.ville_temoin_1 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('tel_temoin_1') }} :
                    <strong>{{ formData.accident.tel_temoin_1 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nom_temoin_2') }} :
                    <strong>{{ formData.accident.nom_temoin_2 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('prof_temoin_2') }} :
                    <strong> {{ formData.accident.prof_temoin_2 }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('ville_temoin_2') }} :
                    <strong>{{ formData.accident.ville_temoin_2 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('tel_temoin_2') }} :
                    <strong>{{ formData.accident.tel_temoin_2 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nom_temoin_3') }} :
                    <strong>{{ formData.accident.nom_temoin_3 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('prof_temoin_3') }} :
                    <strong> {{ formData.accident.prof_temoin_3 }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('ville_temoin_3') }} :
                    <strong>{{ formData.accident.ville_temoin_3 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('tel_temoin_3') }} :
                    <strong>{{ formData.accident.tel_temoin_3 }}</strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 7"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('Proches') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nom_pers_cont_1') }} :
                    <strong>{{ formData.accident.nom_pers_cont_1 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('qual_pers_cont_1') }} :
                    <strong> {{ formData.accident.qual_pers_cont_1 }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('ville_pers_cont_1') }} :
                    <strong>{{ formData.accident.ville_pers_cont_1 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('tel_pers_cont_1') }} :
                    <strong>{{ formData.accident.tel_pers_cont_1 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nom_pers_cont_2') }} :
                    <strong>{{ formData.accident.nom_pers_cont_2 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('qual_pers_cont_2') }} :
                    <strong> {{ formData.accident.qual_pers_cont_2 }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('ville_pers_cont_2') }} :
                    <strong>{{ formData.accident.ville_pers_cont_2 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('tel_pers_cont_2') }} :
                    <strong>{{ formData.accident.tel_pers_cont_2 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nom_pers_cont_3') }} :
                    <strong>{{ formData.accident.nom_pers_cont_3 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('qual_pers_cont_3') }} :
                    <strong> {{ formData.accident.qual_pers_cont_3 }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('ville_pers_cont_3') }} :
                    <strong>{{ formData.accident.ville_pers_cont_3 }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('tel_pers_cont_3') }} :
                    <strong>{{ formData.accident.tel_pers_cont_3 }}</strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 8"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('Declarant') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('Nom_declarant') }} :
                    <strong>{{ formData.accident.declarant }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('contact_declarant') }} :
                    <strong>{{ formData.accident.contact_declarant }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('lien_declarant') }} :
                    <strong> {{ formData.accident.lien_declarant }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('lieu_declaration') }} :
                    <strong>{{ formData.accident.lieu_declaration }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('qual_declarant') }} :
                    <strong>{{ formData.accident.qual_declarant }}</strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 9"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="text-center text-justify">
                <span class="text-h6 text-red no-print">{{ $t('soumettant') }}</span>
              </div>
            </div>
            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" label="Précédent" />
              <q-btn
                flat
                color="secondary"
                icon="picture_as_pdf"
                label="PDF"
                class="q-ml-sm"
                @click="downloadPDF(10)"
              />
              <q-btn color="primary" @click="onSubmit()" :label="$t('soumettre')" />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>
      </q-card>

      <!-- MP -->
      <q-card flat bordered class="q-pa-md" v-if="formSearch.typeRp.value === 'MP' && eltSelect">
        <q-stepper
          v-model="step"
          :vertical="$q.screen.lt.sm"
          color="primary"
          :inactive-color="maxStep >= step ? 'secondary' : ''"
          animated
          header-nav
          ref="stepper"
          contracted
        >
          <q-step
            :name="1"
            :title="$t('assu')"
            icon="person"
            :done="done[1]"
            :error="stateform[1]"
            :disable="!isStepAllowed(1)"
          >
            <q-card class="flex-center text-center">
              <div
                class="text-wrap q-mt-md flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -20px"
              >
                {{ $t('assu') }}
              </div>
              <q-card-section>
                <q-form ref="myForm">
                  <div class="row flex justify-evenly">
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        autofocus
                        :dense="dense"
                        class="q-ma-sm"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.num_assu"
                        readonly
                        :label="$t('num_assu')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.nom_assu"
                        :label="$t('nom_assu')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.prenom_assu"
                        :label="$t('prenom_assu')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.date_naiss_assu"
                        :label="$t('date_naiss_assu')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.lieu_naiss_assu"
                        :label="$t('lieu_naiss_assu')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.sexe_assu"
                        label="Sexe"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.code_pays_nat_assu"
                        :label="$t('nationalite_assu')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.code_pays_naiss_assu"
                        :label="$t('origine_assu')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.sit_fam_mat"
                        :label="$t('sit_fam_mat')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.date_embauche"
                        :label="$t('date_emb')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.date_cessation"
                        :label="$t('date_cessation')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        use-input
                        input-debounce="300"
                        :options="secteurs"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.secteur"
                        option-label="lib_secteur"
                        :label="$t('sect_class_prof')"
                        @filter="filterSp"
                        :rules="[(val) => (val && val != null) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        use-input
                        input-debounce="300"
                        :options="qualifications"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.qualification"
                        option-label="lib_qualification"
                        :label="$t('quaf_prof')"
                        @filter="filterQa"
                        :rules="[(val) => (val && val != null) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.adresse_assu"
                        :label="$t('adresse_assu')"
                        :rules="[
                          (val) => (val && val.length > 0) || 'Saisir l\'adresse de l\'assuré',
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.quartier_assu"
                        :label="$t('quartier_assu')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        v-model="formData.assure.email_assu"
                        type="email"
                        color="primary-12"
                        label-slot
                        :label="$t('email_assu')"
                        style="width: 95%"
                        lazy-rules
                        :rules="[
                          (val) => (val && val.length > 0) || $t('emailForm'),
                          (val) =>
                            val.match(/^[A-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i) ||
                            $t('emailForm2'),
                        ]"
                      >
                        <template v-slot:label>
                          <div class="row items-center all-pointer-events">
                            <q-icon class="q-mr-xs" color="blue" size="24px" name="mail" />
                            {{ $t('email_assu') }}
                          </div>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        v-model="formData.assure.tel_assu"
                        :label="$t('tel_assu')"
                        color="primary-12"
                        prefix="(+237)"
                        mask="### ### ###"
                        unmasked-value
                        label-slot
                        lazy-rules
                        :rules="[
                          (val) => val.length >= 9 || $t('telephoneForm'),
                          (val) =>
                            val.match(/^65|66|67|68|69|70+[0-9]{7}$/) ||
                            val.match(/^222|233|242|243|244+[0-9]{6}$/) ||
                            $t('telephoneForm2'),
                        ]"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-end">
              <q-btn
                @click="checkStep(1, 2, myForm1)"
                class="q-mx-sm"
                color="primary"
                :label="$t('Suivant')"
              />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="2"
            :title="$t('empl')"
            icon="person"
            :done="done[2]"
            :error="stateform[2]"
            :disable="!isStepAllowed(2)"
          >
            <q-card class="flex-center text-center">
              <div
                class="text-wrap flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -10px"
              >
                {{ $t('empl') }}
              </div>
              <q-card-section>
                <q-form ref="myForm2">
                  <div class="row flex justify-evenly">
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        autofocus
                        :dense="dense"
                        class="q-ma-sm"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.employeur.num_employeur"
                        :label="$t('num_employeur')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.employeur.raison_sociale"
                        :label="$t('raison_sociale')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        readonly
                        v-model="formData.employeur.nom_commercial"
                        :label="$t('nom_commerciale')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        readonly
                        v-model="formData.employeur.sigle"
                        :label="$t('sigle')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.employeur.num_contr"
                        :label="$t('num_contrib')"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.employeur.lib_centre"
                        label="CPS"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        type="number"
                        step="1"
                        color="primary-12"
                        readonly
                        v-model="formData.employeur.nbre_sal"
                        :label="$t('nbre_sal')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        readonly
                        v-model="formData.employeur.act_principale"
                        :label="$t('act_pric')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="secteursAct"
                        filled
                        use-input
                        input-debounce="300"
                        option-label="libelle_sect_activite"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.employeur.act_sencondaire"
                        :label="$t('autres_act')"
                        @filter="filterSa"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.employeur.adresse_employeur"
                        :label="$t('adresse_empl')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        v-model="formData.employeur.email"
                        type="email"
                        color="primary-12"
                        label-slot
                        :label="$t('email_empl')"
                        style="width: 95%"
                        lazy-rules
                        :rules="[
                          (val) => (val && val.length > 0) || $t('emailForm'),
                          (val) =>
                            val.match(/^[A-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i) ||
                            $t('emailForm2'),
                        ]"
                      >
                        <template v-slot:label>
                          <div class="row items-center all-pointer-events">
                            <q-icon class="q-mr-xs" color="blue" size="24px" name="mail" />
                            {{ $t('email_empl') }}
                          </div>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        class="q-ma-xs"
                        outlined
                        :dense="dense"
                        style="width: 95%"
                        v-model="formData.employeur.tel"
                        :label="$t('tel_empl')"
                        color="primary-12"
                        prefix="(+237)"
                        mask="### ### ###"
                        unmasked-value
                        label-slot
                        lazy-rules
                        :rules="[
                          (val) => val.length >= 9 || $t('telephoneForm'),
                          (val) =>
                            val.match(/^65|66|67|68|69|70+[0-9]{7}$/) ||
                            val.match(/^222|233|242|243|244+[0-9]{6}$/) ||
                            $t('telephoneForm2'),
                        ]"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn
                flat
                @click="stepBack()"
                color="primary"
                :label="$t('Précédent')"
                class="q-mx-sm"
              />
              <q-btn @click="checkStep(2, 3, myForm2)" color="primary" :label="$t('Suivant')" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="3"
            :title="$t('poste_trav')"
            icon="add_comment"
            :done="done[3]"
            :error="stateform[3]"
            :disable="!isStepAllowed(3)"
          >
            <q-card class="flex-center text-center">
              <div
                class="text-wrap q-mt-md flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -20px"
              >
                {{ $t('poste_trav') }}
              </div>
              <q-card-section>
                <q-form ref="myForm3">
                  <div class="row flex justify-evenly">
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="postes"
                        filled
                        use-input
                        input-debounce="300"
                        option-label="libelle"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.assure.posteTravail"
                        :label="$t('poste_assu')"
                        @filter="filterPt"
                        :rules="[
                          (val) =>
                            val && Object.keys(val).length > 0
                              ? true
                              : 'Sélectionner le poste de travail de la victime',
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="optionsTypo"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.typologie_poste_trav"
                        :label="$t('typologie_poste_trav')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.nature_travail"
                        :label="$t('nature_travail')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="optionsCont"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.type_contrat"
                        :label="$t('type_contrat')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.anc_poste_travail"
                        :label="$t('anc_poste')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.matricule"
                        :label="$t('matricule')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="optionsStat"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.statut"
                        :label="$t('statut')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('date_visite_emb')"
                        v-model="formData.maladie.date_visite_emb"
                        :rules="[
                          (val) =>
                            (val && val.length > 0) || 'Seleclionnez la date de visite d\'embauche',
                        ]"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="formData.maladie.date_visite_emb"
                                :options="optionsDn"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('date_visite_period')"
                        v-model="formData.maladie.date_visite_period"
                        :rules="[
                          (val) =>
                            (val && val.length > 0) || 'Seleclionnez la date de la dernière visite',
                        ]"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="formData.maladie.date_visite_period"
                                :options="optionsDn"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.horaire_travail"
                        :label="$t('horaire_trav')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.nbre_jour_sem"
                        :label="$t('nbre_jour_sem')"
                        :rules="[(val) => (val && val >= 1 && val <= 7) || $t('Required')]"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" :label="$t('Précédent')" />
              <q-btn @click="checkStep(3, 4, myForm3)" color="primary" :label="$t('Suivant')" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="4"
            :title="$t('Invalidites')"
            icon="add_comment"
            :done="done[4]"
            :error="stateform[4]"
            :disable="!isStepAllowed(4)"
          >
            <q-card class="flex-center text-center">
              <div
                class="text-wrap q-mt-md flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -20px"
              >
                {{ $t('Invalidites') }}
              </div>
              <q-card-section>
                <q-form ref="myForm4">
                  <div class="row flex justify-evenly">
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="optionsMal"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.type_maladie"
                        :label="$t('type_maladie')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('delais_constat')"
                        v-model="formData.maladie.delais_constat"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="formData.maladie.delais_constat"
                                :options="optionsDn"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="options"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.premiere_dem"
                        :label="$t('premiere_dem')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.premiere_dem == $t('NON')">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('date_prem_dem')"
                        v-model="formData.maladie.date_prem_dem"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date v-model="formData.maladie.date_prem_dem" :options="optionsDn">
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.maladie.delais_constat"
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="number"
                        min="0"
                        step="0.1"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.salaire_1"
                        :label="mois1"
                        :rules="[(val) => (val !== null && val >= 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.maladie.delais_constat"
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="number"
                        min="0"
                        step="0.1"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.salaire_2"
                        :label="mois2"
                        :rules="[(val) => (val !== null && val >= 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-if="formData.maladie.delais_constat"
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="number"
                        min="0"
                        step="0.1"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.salaire_3"
                        :label="mois3"
                        :rules="[(val) => (val !== null && val >= 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="options"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.inv_anterieure"
                        :label="$t('inv_anterieure')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.inv_anterieure == 'OUI'">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="optionsIn"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.choix"
                        :label="$t('choix')"
                        :rules="[(val) => (val && val != null) || $t('Required')]"
                      />
                    </div>
                    <div
                      class="col-12 col-md-6"
                      v-if="
                        (formData.maladie.choix == 'Congénitales' ||
                          formData.maladie.choix == 'Congénitales & Acquises') &&
                        formData.maladie.inv_anterieure == 'OUI'
                      "
                    >
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="number"
                        step="0.01"
                        min="0"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.taux_ipp_inv_con_at"
                        :label="$t('taux_ipp_inv_con_at')"
                        :rules="[(val) => (val !== null && val >= 0) || $t('Required')]"
                      />
                    </div>
                    <div
                      class="col-12 col-md-6"
                      v-if="
                        (formData.maladie.choix == 'Congénitales' ||
                          formData.maladie.choix == 'Congénitales & Acquises') &&
                        formData.maladie.inv_anterieure == 'OUI'
                      "
                    >
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.num_rente_inv_con_at"
                        :label="$t('num_rente_inv_con_at')"
                      />
                    </div>
                    <div
                      class="col-12 col-md-6"
                      v-if="
                        (formData.maladie.choix == 'Acquises' ||
                          formData.maladie.choix == 'Congénitales & Acquises') &&
                        formData.maladie.inv_anterieure == 'OUI'
                      "
                    >
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="number"
                        step="0.01"
                        min="0"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.taux_ipp_inv_non_con_at"
                        :label="$t('taux_ipp_inv_non_con_at')"
                        :rules="[(val) => (val !== null && val >= 0) || $t('Required')]"
                      />
                    </div>
                    <div
                      class="col-12 col-md-6"
                      v-if="
                        (formData.maladie.choix == 'Acquises' ||
                          formData.maladie.choix == 'Congénitales & Acquises') &&
                        formData.maladie.inv_anterieure == 'OUI'
                      "
                    >
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.num_rente_inv_non_con_at"
                        :label="$t('num_rente_inv_non_con_at')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="options"
                        type="typearea"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.victime_decede"
                        :label="$t('victime_decede')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="textarea"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.description_maladie"
                        :label="$t('description_maladie')"
                        :rules="[
                          (val) => (val && val.length > 0) || $t('Required'),
                          (val) => val.length <= 500 || 'MAX 500',
                        ]"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" :label="$t('Précédent')" />
              <q-btn @click="checkStep(4, 5, myForm4)" color="primary" :label="$t('Suivant')" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="5"
            :title="$t('Historique')"
            icon="add_comment"
            :done="done[5]"
            :error="stateform[5]"
            :disable="!isStepAllowed(5)"
          >
            <q-card class="flex-center text-center">
              <div
                class="text-wrap flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -20px"
              >
                {{ $t('Historique') }}
              </div>
              <q-card-section>
                <q-form ref="myForm5">
                  <div class="row flex justify-center">
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="options"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.hist_prof"
                        :label="$t('hist_prof')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.raison_sociale_empl_1"
                        :label="$t('raison_sociale_empl_1')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.adresse_empl_1"
                        :label="$t('adresse_empl_1')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.nature_emploi_1"
                        :label="$t('nature_emploi_1')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="agents"
                        filled
                        use-input
                        input-debounce="300"
                        option-label="libelle"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.agents1"
                        multiple
                        :label="$t('agents1')"
                        @filter="filterAn"
                        :rules="[
                          (val) => (val && val != {} && val != null && val != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('debut_emploi_1')"
                        v-model="formData.maladie.debut_emploi_1"
                        :rules="[(val) => (val && val.length > 0) || 'Seleclionnez la date début']"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="formData.maladie.debut_emploi_1"
                                :options="optionsDn"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('fin_emploi_1')"
                        v-model="formData.maladie.fin_emploi_1"
                        :rules="[(val) => (val && val.length > 0) || 'Seleclionnez la date de fin']"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date v-model="formData.maladie.fin_emploi_1" :options="optionsDn">
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.raison_sociale_empl_2"
                        :label="$t('raison_sociale_empl_2')"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.adresse_empl_2"
                        :label="$t('adresse_empl_2')"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.nature_emploi_2"
                        :label="$t('nature_emploi_2')"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="agents"
                        filled
                        use-input
                        input-debounce="300"
                        option-label="libelle"
                        style="width: 95%"
                        multiple
                        color="primary-12"
                        v-model="formData.maladie.agents2"
                        :label="$t('agents2')"
                        @filter="filterAn"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('debut_emploi_2')"
                        v-model="formData.maladie.debut_emploi_2"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="formData.maladie.debut_emploi_2"
                                :options="optionsDn"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('fin_emploi_2')"
                        v-model="formData.maladie.fin_emploi_2"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date v-model="formData.maladie.fin_emploi_2" :options="optionsDn">
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.raison_sociale_empl_3"
                        :label="$t('raison_sociale_empl_3')"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.adresse_empl_3"
                        :label="$t('adresse_empl_3')"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.nature_emploi_3"
                        :label="$t('nature_emploi_3')"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="agents"
                        filled
                        use-input
                        input-debounce="300"
                        option-label="libelle"
                        style="width: 95%"
                        multiple
                        color="primary-12"
                        v-model="formData.maladie.agents3"
                        :label="$t('agents3')"
                        @filter="filterAn"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('debut_emploi_3')"
                        v-model="formData.maladie.debut_emploi_3"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="formData.maladie.debut_emploi_3"
                                :options="optionsDn"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6" v-if="formData.maladie.hist_prof == 'OUI'">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        readonly
                        style="width: 95%"
                        :dense="dense"
                        label-slot
                        :label="$t('fin_emploi_3')"
                        v-model="formData.maladie.fin_emploi_3"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer" color="primary">
                            <q-popup-proxy
                              ref="qDateProxy"
                              transition-show="scale"
                              readonly
                              transition-hide="scale"
                            >
                              <q-date v-model="formData.maladie.fin_emploi_3" :options="optionsDn">
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    readonly
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" :label="$t('Précédent')" />
              <q-btn @click="checkStep(5, 6, myForm5)" color="primary" :label="$t('Suivant')" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="6"
            :title="$t('Conditions')"
            icon="add_comment"
            :done="done[6]"
            :error="stateform[6]"
            :disable="!isStepAllowed(6)"
          >
            <q-card>
              <p
                class="text-wrap flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -17px"
              >
                {{ $t('Conditions') }}
              </p>
              <q-card-section>
                <q-form ref="myForm6">
                  <div class="row flex-center text-center" style="width: 100%">
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="textarea"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.description_poste"
                        :label="$t('description_poste')"
                        :rules="[
                          (val) => (val && val.length > 0) || $t('Required'),
                          (val) => val.length <= 500 || 'MAX 500',
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        type="textarea"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.autres_infos"
                        :label="$t('autres_infos')"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="agents"
                        filled
                        use-input
                        input-debounce="300"
                        option-label="libelle"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.nocifs"
                        multiple
                        :label="$t('nocifs')"
                        @filter="filterAn"
                        :rules="[
                          (val) => (val && val != {} && val != null && val != '') || $t('Required'),
                        ]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="options"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.perc_remuneration"
                        :label="$t('perc_total_rem')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" :label="$t('Précédent')" />
              <q-btn @click="checkStep(6, 7, myForm6)" color="primary" :label="$t('Suivant')" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="7"
            :title="$t('Declarant')"
            icon="add_comment"
            :done="done[7]"
            :error="stateform[7]"
            :disable="!isStepAllowed(7)"
          >
            <q-card class="flex-center text-center">
              <div
                class="text-wrap flex justify-center text-weight-bold text-blue-5 text-uppercase"
                style="margin-top: -20px"
              >
                {{ $t('Declarant') }}
              </div>
              <q-card-section>
                <q-form ref="myForm7">
                  <div class="row flex justify-center">
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.declarant"
                        :label="$t('Nom_declarant')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.contact_declarant"
                        :label="$t('contact_declarant')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.lien_declarant"
                        :label="$t('lien_declarant')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.lieu_declaration"
                        :label="$t('lieu_declaration')"
                        :rules="[(val) => (val && val.length > 0) || $t('Required')]"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        class="q-ma-sm"
                        :dense="dense"
                        :options="optionsDeclarants"
                        style="width: 95%"
                        color="primary-12"
                        v-model="formData.maladie.qual_declarant"
                        :label="$t('qual_declarant')"
                        :rules="[
                          (val) =>
                            (val && val.length != null && val.length != '') || $t('Required'),
                        ]"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" :label="$t('Précédent')" />
              <q-btn @click="checkStep(7, 8, myForm7)" color="primary" :label="$t('Suivant')" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="8"
            :title="$t('Resume')"
            icon="add_comment"
            :done="done[8]"
            :disable="!isStepAllowed(8)"
          >
            <div class="q-pa-md" ref="recapContent8">
              <span class="text-h6 text-blue text-center">{{ $t('Resume') }}</span
              ><br />
              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('empl') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('num_employeur') }} :
                    <strong>{{ formData.employeur.num_employeur }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('raison_sociale') }} :
                    <strong> {{ formData.employeur.raison_sociale }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nom_commerciale') }} :
                    <strong>{{ formData.employeur.nom_commercial }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('sigle') }} : <strong>{{ formData.employeur.sigle }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('num_contrib') }} :
                    <strong>{{ formData.employeur.num_contr }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >CPS : <strong>{{ formData.employeur.lib_centre }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nbre_sal') }} :
                    <strong>{{ lisibilite_nombre(formData.employeur.nbre_sal) }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('act_pric') }} :
                    <strong> {{ formData.employeur.act_principale }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('adresse_empl') }} :
                    <strong>{{ formData.employeur.adresse_employeur }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('email_empl') }} : <strong>{{ formData.employeur.email }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('tel_empl') }} : <strong>{{ formData.employeur.tel }} </strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 1"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('assu') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('num_assu') }} : <strong>{{ formData.assure.num_assu }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nom_assu') }} : <strong> {{ formData.assure.nom_assu }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('prenom_assu') }} :
                    <strong>{{ formData.assure.prenom_assu }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('date_naiss_assu') }} :
                    <strong>{{ lisibilite_date(formData.assure.date_naiss_assu) }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('lieu_naiss_assu') }} :
                    <strong>{{ formData.assure.lieu_naiss_assu }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >Sexe : <strong>{{ formData.assure.sexe_assu }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nationalite_assu') }} :
                    <strong>{{ formData.assure.code_pays_nat_assu }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('origine_assu') }} :
                    <strong> {{ formData.assure.code_pays_naiss_assu }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('sit_fam_mat') }} :
                    <strong>{{ formData.assure.sit_fam_mat }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('date_emb') }} :
                    <strong>{{ formData.assure.date_embauche }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('date_cessation') }} :
                    <strong>{{ formData.assure.date_cessation }}</strong></span
                  >
                  <span v-if="formData.assure.secteur != null" class="col-md-6 col-xs-12"
                    >{{ $t('sect_class_prof') }} :
                    <strong>{{ formData.assure.secteur.lib_secteur }}</strong></span
                  >
                  <span v-if="formData.assure.qualification != null" class="col-md-6 col-xs-12"
                    >{{ $t('quaf_prof') }} :
                    <strong>{{ formData.assure.qualification.lib_qualification }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('adresse_assu') }} :
                    <strong>{{ formData.assure.adresse_assu }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('quartier_assu') }} :
                    <strong>{{ formData.assure.quartier_assu }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('email_assu') }} :
                    <strong>{{ formData.assure.email_assu }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('tel_assu') }} : <strong>{{ formData.assure.tel_assu }} </strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 2"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('poste_trav') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('poste_assu') }} :
                    <strong>{{ formData.maladie.posteTravail?.lib_poste }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('typologie_poste_trav') }} :
                    <strong>{{ formData.maladie.typologie_poste_trav }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nature_travail') }} :
                    <strong> {{ formData.maladie.nature_travail }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('type_contrat') }} :
                    <strong>{{ formData.maladie.type_contrat }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('anc_poste_travail') }} :
                    <strong>{{ formData.maladie.anc_poste_travail }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('matricule') }} : <strong>{{ formData.maladie.matricule }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('statut') }} : <strong> {{ formData.maladie.statut }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('date_visite_emb') }} :
                    <strong>{{ lisibilite_date(formData.maladie.date_visite_emb) }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('date_visite_period') }} :
                    <strong>{{
                      lisibilite_date(formData.maladie.date_visite_period)
                    }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('horaire_travail') }} :
                    <strong>{{ formData.maladie.horaire_travail }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nbre_jour_sem') }} :
                    <strong> {{ formData.maladie.nbre_jour_sem }} </strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 3"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('Invalidites') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('delais_constat') }} :
                    <strong>{{ lisibilite_date(formData.maladie.delais_constat) }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ mois1 }} :
                    <strong> {{ lisibilite_nombre(formData.maladie.salaire_1) }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ mois2 }} :
                    <strong> {{ lisibilite_nombre(formData.maladie.salaire_2) }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ mois3 }} :
                    <strong> {{ lisibilite_nombre(formData.maladie.salaire_3) }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('premiere_dem') }} :
                    <strong> {{ formData.maladie.premiere_dem }} </strong></span
                  >
                  <span
                    v-if="
                      formData.maladie.premiere_dem == 'NON' ||
                      formData.maladie.premiere_dem == 'NO'
                    "
                    class="col-md-6 col-xs-12"
                    >{{ $t('date_prem_dem') }} :
                    <strong>{{ formData.maladie.date_prem_dem }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('inv_anterieure') }} :
                    <strong>{{ formData.maladie.inv_anterieure }}</strong></span
                  >
                  <span v-if="formData.maladie.inv_anterieure == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('choix') }} : <strong>{{ formData.maladie.choix }} </strong></span
                  >
                  <span
                    v-if="
                      formData.maladie.choix == 'Congénitales' ||
                      formData.maladie.choix == 'Congénitales & Acquises'
                    "
                    class="col-md-6 col-xs-12"
                    >{{ $t('taux_ipp_inv_con_at') }} :
                    <strong>{{ formData.maladie.taux_ipp_inv_con_at }}</strong></span
                  >
                  <span
                    v-if="
                      formData.maladie.choix == 'Congénitales' ||
                      formData.maladie.choix == 'Congénitales & Acquises'
                    "
                    class="col-md-6 col-xs-12"
                    >{{ $t('num_rente_inv_con_at') }} :
                    <strong> {{ formData.maladie.num_rente_inv_con_at }} </strong></span
                  >
                  <span
                    v-if="
                      formData.maladie.choix == 'Acquises' ||
                      formData.maladie.choix == 'Congénitales & Acquises'
                    "
                    class="col-md-6 col-xs-12"
                    >{{ $t('taux_ipp_inv_non_con_at') }} :
                    <strong>{{ formData.maladie.taux_ipp_inv_non_con_at }}</strong></span
                  >
                  <span
                    v-if="
                      formData.maladie.choix == 'Acquises' ||
                      formData.maladie.choix == 'Congénitales & Acquises'
                    "
                    class="col-md-6 col-xs-12"
                    >{{ $t('num_rente_inv_non_con_at') }} :
                    <strong>{{ formData.maladie.num_rente_inv_non_con_at }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('victime_decede') }} :
                    <strong>{{ formData.maladie.victime_decede }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('description_maladie') }} :
                    <strong> {{ formData.maladie.description_maladie }} </strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 4"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('Historique') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-12 col-xs-12"
                    >{{ $t('hist_prof') }} : <strong>{{ formData.maladie.hist_prof }}</strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('raison_sociale_empl_1') }} :
                    <strong> {{ formData.maladie.raison_sociale_empl_1 }} </strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('adresse_empl_1') }} :
                    <strong>{{ formData.maladie.adresse_empl_1 }}</strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('nature_emploi_1') }} :
                    <strong>{{ formData.maladie.nature_emploi_1 }}</strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('agents1') }} :
                    <div v-for="agent in formData.maladie.agents1" :key="agent.index">
                      <strong> {{ agent.libelle }}, </strong>
                    </div></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('debut_emploi_1') }} :
                    <strong>{{ lisibilite_date(formData.maladie.debut_emploi_1) }}</strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('fin_emploi_1') }} :
                    <strong>{{ lisibilite_date(formData.maladie.fin_emploi_1) }}</strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('raison_sociale_empl_2') }} :
                    <strong> {{ formData.maladie.raison_sociale_empl_2 }} </strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('adresse_empl_2') }} :
                    <strong>{{ formData.maladie.adresse_empl_2 }}</strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('nature_emploi_2') }} :
                    <strong>{{ formData.maladie.nature_emploi_2 }}</strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('agents2') }} :
                    <div v-for="agent in formData.maladie.agents2" :key="agent.index">
                      <strong> {{ agent.libelle }}, </strong>
                    </div></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('debut_emploi_2') }} :
                    <strong>{{ lisibilite_date(formData.maladie.debut_emploi_2) }}</strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('fin_emploi_2') }} :
                    <strong>{{ lisibilite_date(formData.maladie.fin_emploi_2) }}</strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('raison_sociale_empl_3') }} :
                    <strong> {{ formData.maladie.raison_sociale_empl_3 }} </strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('adresse_empl_3') }} :
                    <strong>{{ formData.maladie.adresse_empl_3 }}</strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('nature_emploi_3') }} :
                    <strong>{{ formData.maladie.nature_emploi_3 }}</strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('agents3') }} :
                    <div v-for="agent in formData.maladie.agents3" :key="agent.index">
                      <strong> {{ agent.libelle }}, </strong>
                    </div></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('debut_emploi_3') }} :
                    <strong>{{ lisibilite_date(formData.maladie.debut_emploi_3) }}</strong></span
                  >
                  <span v-if="formData.maladie.hist_prof == 'OUI'" class="col-md-6 col-xs-12"
                    >{{ $t('fin_emploi_3') }} :
                    <strong>{{ lisibilite_date(formData.maladie.fin_emploi_3) }}</strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 5"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('Conditions') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('description_poste') }} :
                    <strong>{{ formData.maladie.description_poste }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('autres_infos') }} :
                    <strong> {{ formData.maladie.autres_infos }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('nocifs') }} :
                    <div v-for="agent in formData.maladie.nocifs" :key="agent.index">
                      <strong> {{ agent.libelle }}, </strong>
                    </div></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('perc_total_rem') }} :
                    <strong>{{ formData.maladie.perc_remuneration }} </strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 6"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="q-gutter-md q-my-md">
                <span class="text-h6 text-center">{{ $t('Declarant') }}</span
                ><br />
                <div class="row flex q-pb-md">
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('Nom_declarant') }} :
                    <strong>{{ formData.maladie.declarant }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('contact_declarant') }} :
                    <strong>{{ formData.maladie.contact_declarant }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('lien_declarant') }} :
                    <strong> {{ formData.maladie.lien_declarant }} </strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('lieu_declaration') }} :
                    <strong>{{ formData.maladie.lieu_declaration }}</strong></span
                  >
                  <span class="col-md-6 col-xs-12"
                    >{{ $t('qual_declarant') }} :
                    <strong>{{ formData.maladie.qual_declarant }} </strong></span
                  >
                </div>
                <q-btn
                  flat
                  @click="step = 7"
                  color="red"
                  :label="$t('Modifier')"
                  class="no-print"
                />
              </div>

              <div class="text-center text-justify">
                <span class="text-h6 text-red no-print">{{ $t('soumettant') }}</span>
              </div>
            </div>

            <q-stepper-navigation class="row flex justify-between">
              <q-btn flat @click="stepBack()" color="primary" :label="$t('Précédent')" />
              <q-btn
                flat
                color="secondary"
                icon="picture_as_pdf"
                label="PDF"
                class="q-ml-sm"
                @click="downloadPDF(8)"
              />
              <q-btn color="primary" @click="onSubmit()" :label="$t('soumettre')" />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>
      </q-card>
    </q-card>

    <q-dialog v-model="loading" persistent>
      <div class="row items-center justify-center q-pa-md">
        <CustomSpinner :show="loading" />
      </div>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
// import axios from 'axios'
import { useI18n } from 'vue-i18n'
import { teledeclarations as rowsDataAT } from '../../../data/teledeclarationsAT.js'
import { teledeclarations as rowsDataMP } from '../../../data/teledeclarationsMP.js'
import { secteursActivites as secteursAct } from '../../../data/SecteursActivites.js'
import { SecteurQualPro as secteurs } from '../../../data/SecteurQualPro.js'
import { postesTravails as postes } from '../../../data/PostesTravails.js'
import { agentsMateriels as agents } from '../../../data/AgentsMateriels.js'
import { naturesLesions as natures } from '../../../data/NaturesLesions.js'
import { siegesLesions as sieges } from '../../../data/SiegesLesions.js'
import { QualificationPro as qualifications } from '../../../data/QualificationPro.js'
import { CausesAccidents as causes } from '../../../data/CausesAccidents.js'
import { formStruct } from '../../../data/structure.js'
import CustomSpinner from 'src/components/CustomSpinner.vue'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const loading = ref(false)
const eltSelect = ref(false)
const { t } = useI18n()

// état du stepper
const step = ref(1)
const maxStep = ref(1)

// états "done"
const done = ref({
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: false,
  7: false,
  8: false,
  9: false,
  10: false,
  11: false,
})

// états de validation des formulaires
const stateform = ref({
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: false,
  7: false,
  8: false,
  9: false,
  10: false,
})

// refs des formulaires
const myForm = ref(null)
const myForm2 = ref(null)
const myForm3 = ref(null)
const myForm4 = ref(null)
const myForm5 = ref(null)
const myForm6 = ref(null)
const myForm7 = ref(null)
const myForm8 = ref(null)
const myForm9 = ref(null)

const recapContent10 = ref(null)
const recapContent8 = ref(null)

// autres flags
const dense = ref(true)

const optionsCont = [
  'CDI',
  'CDD',
  'Saisonnier',
  'Temporaire',
  'Journalier',
  'Apprenti',
  'Stagiaire',
]

const optionsMal = ['Maladie Professionnelle', 'Maladie A Caractère Professionnel']

const optionsIn = ['Congénitales', 'Acquises', 'Congénitales & Acquises']

const optionsStat = ['Chômeur(se)', 'Retraité(e)', 'Actif']

const optionsTypo = ['Atelier', 'Bureau', 'Chantier', 'Ambulant', 'Domicile', 'teletravail']

const filterSp = (val, update) => {
  update(() => {
    if (val === '') {
      // si rien n'est saisi, on affiche toutes les options
      return secteurs
    }
    const needle = val.toLowerCase()
    return secteurs.filter((s) => s.lib_secteur.toLowerCase().includes(needle))
  })
}

const filterQa = (val, update) => {
  update(() => {
    if (!val) return qualifications // si vide, afficher toutes les options
    const needle = val.toLowerCase()
    return qualifications.filter((q) => q.lib_qualification.toLowerCase().includes(needle))
  })
}

const filterSa = (val, update) => {
  update(() => {
    if (!val) return secteursAct // retourne toutes les options si vide
    const needle = val.toLowerCase()
    return secteursAct.filter((s) => s.libelle_sect_activite.toLowerCase().includes(needle))
  })
}

function filterPt(val, update) {
  if (val === '') {
    update(() => {
      return postes.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    return postes.value.filter((p) => p.lib_poste.toLowerCase().includes(needle))
  })
}

function filterCa(val, update) {
  if (val === '') {
    update(() => causes.value)
    return
  }

  const needle = val.toLowerCase()
  update(() => causes.value.filter((c) => c.libelle_cause.toLowerCase().includes(needle)))
}

function filterAm(val, update) {
  if (val === '') {
    update(() => agents.value)
    return
  }

  const needle = val.toLowerCase()
  update(() => agents.value.filter((a) => a.libelle_agent.toLowerCase().includes(needle)))
}

function filterNl(val, update) {
  if (!val) {
    update(() => natures.value)
    return
  }

  const needle = val.toLowerCase()
  update(() => natures.value.filter((n) => n.libelle_nature.toLowerCase().includes(needle)))
}

function filterSl(val, update) {
  if (!val) {
    update(() => sieges.value)
    return
  }

  const needle = val.toLowerCase()
  update(() => sieges.value.filter((s) => s.libelle_siege.toLowerCase().includes(needle)))
}

function filterAn(val, update) {
  if (!val) {
    update(() => agents.value)
    return
  }
  const needle = val.toLowerCase()
  update(() => agents.value.filter((a) => a.libelle.toLowerCase().includes(needle)))
}

const optionsDeclarants = ['Employeur', 'Assure', 'Ayant droit']

// actions de navigation
function stepBack() {
  if (step.value > 1) {
    step.value = step.value - 1
  }
}

async function checkStep(n, nextStep) {
  // validation du formulaire
  let valid = false
  if (n === 1) {
    valid = await myForm.value.validate()
  } else if (n === 2) {
    valid = await myForm2.value.validate()
  } else if (n === 3) {
    valid = await myForm3.value.validate()
  } else if (n === 4) {
    valid = await myForm4.value.validate()
  } else if (n === 5) {
    valid = await myForm5.value.validate()
  } else if (n === 6) {
    valid = await myForm6.value.validate()
  } else if (n === 7) {
    valid = await myForm7.value.validate()
  } else if (n === 8) {
    valid = await myForm8.value.validate()
  } else if (n === 9) {
    valid = await myForm9.value.validate()
  }

  if (valid) {
    stateform.value[n] = false
    done.value[n] = true
    step.value = nextStep
    if (nextStep > maxStep.value) {
      maxStep.value = nextStep
    }
  } else {
    stateform.value[n] = true
    // step.value = n
  }
}

const isStepAllowed = (stepName) => {
  return stepName <= maxStep.value // Seules les étapes passées ou en cours sont cliquables
}

function lisibilite_date(date) {
  if (date === null) {
    return ''
  }
  if (date === null) {
    return ''
  }
  var d = new Date(date)
  var datestring =
    ('0' + d.getDate()).slice(-2) +
    '-' +
    ('0' + (d.getMonth() + 1)).slice(-2) +
    '-' +
    d.getFullYear()
  return datestring
}

function lisibilite_nombre(nbr) {
  const nombre = '' + nbr
  let retour = ''
  let count = 0

  if (nombre.indexOf('.') > -1) {
    const entier = '' + nombre.split('.')[0]
    const decimal = '' + nombre.split('.')[1]
    for (let i = entier.length - 1; i >= 0; i--) {
      if (count !== 0 && count % 3 === 0) retour = entier[i] + ' ' + retour
      else retour = entier[i] + retour
      count++
    }
    retour = retour + '.' + decimal
  } else {
    for (let i = nombre.length - 1; i >= 0; i--) {
      if (count !== 0 && count % 3 === 0) retour = nombre[i] + ' ' + retour
      else retour = nombre[i] + retour
      count++
    }
  }
  return retour
}

// exemple d’utilisation

// Données du formulaire
const formData = ref(formStruct)

const formSearch = ref({
  numAssure: '321-1234567-9',
  typeRp: '',
})

// Colonnes Recherche
const columns = [
  {
    name: 'code_temporaire',
    label: 'N° Déclaration',
    align: 'center',
    field: (row) => row.code_temporaire || row.code_temporaire,
  },
  {
    name: 'num_assu',
    label: 'NUM. ASSURE',
    align: 'center',
    field: (row) => row.assure.num_assu,
  },
  {
    name: 'nom_assu',
    label: 'ASSURÉ',
    align: 'left',
    field: (row) => `${row.assure.nom_assu} ${row.assure.prenom_assu}`,
  },
  {
    name: 'num_employeur',
    label: 'NUM. EMPLOYEUR',
    align: 'center',
    field: (row) => row.employeur.num_employeur,
  },
  {
    name: 'raison_sociale',
    label: 'RAISON SOCIALE',
    align: 'left',
    field: (row) => row.employeur.raison_sociale,
  },
  {
    name: 'created_at',
    label: 'DATE DÉCLARATION',
    align: 'center',
    field: (row) => row.accident?.created_at || row.maladie?.created_at, // à ajouter dans tes objets formData
  },
]

const rows = ref([])

const validateMatriculeCNPS = (val) => {
  const regex = /^(?:\d{3}-\d{7}-[1-9])$/.test(val)
  return regex || t('errors.invalid_cnps_format')
}

const required = (val) => !!val || 'Ce champ est requis / This field is required'

// Ligne sélectionnée
const selectedRow = ref([])

const options = ['OUI', 'NON']

const searchDemande = async () => {
  // Vérification des champs obligatoires
  resetForm()
  if (!formSearch.value.numAssure || !formSearch.value.typeRp) {
    $q.notify({
      type: 'warning',
      message: 'Veuillez renseigner le N° Assure et le type de RP avant la recherche.',
    })
    return // on sort de la fonction si les champs sont vides
  }

  if (formSearch.value.typeRp.value === 'AT') {
    rows.value = rowsDataAT
  } else if (formSearch.value.typeRp.value === 'MP') {
    rows.value = rowsDataMP
  }
  return // on sort de la fonction si les champs sont vides

  /* try {
    // Exemple appel API (à adapter à ton backend Laravel)
    const response = await axios.get('/api/demandes-controle', {
      params: {
        numEmployeur: formSearch.value.numEmployeur,
        exercice: formSearch.value.exercice,
      },
    })

    // rows.value = response.data // tableau venant de l’API
    resetForm()
    rows.value = rowsData

    if (rows.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'Aucun résultat trouvé pour ces critères.',
      })
    }
  } catch (error) {
    console.error('Erreur recherche :', error)
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la recherche',
    })
  } */
}

const addLesion = () => {
  formData.value.accident.lesions.push({
    matricule: '124-4755698-9',
    natureLesion: { libelle_nature: '' },
    siegeLesion: { libelle_siege: '' },
  })
}

const deleteLesion = (index) => {
  if (index >= 0 && index < formData.value.accident.lesions.length) {
    formData.value.accident.lesions.splice(index, 1)
  }
}

watch(selectedRow, (newVal) => {
  step.value = 1
  maxStep.value = 1
  if (newVal.length === 0) return
  const row = newVal[0]

  eltSelect.value = true
  formData.value = row
})

// Méthodes
/* const onSubmit = () => {
  console.log('Formulaire soumis :', formData.value)
  $q.notify({
    type: 'positive',
    message: 'Résultat de contrôle enregistré avec succès !',
  })
  resetForm()
} */

const typeRP = [
  { label: 'Accident de Travail', value: 'AT' },
  { label: 'Maladie Professionnel', value: 'MP' },
]

// Méthodes
const onSubmit = async () => {
  loading.value = true
  try {
    /* const payload = { ...formData.value }
    delete payload.lignes.id // on enlève les id techniques
    const response = await axios.post('/api/controle-resultats', payload) */

    $q.notify({
      type: 'positive',
      message: 'Dossier enregistré avec succès !',
    })
    /* console.log('Réponse API :', response.data) */
    resetForm()
  } catch (error) {
    console.error('Erreur API :', error)
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de l’enregistrement',
    })
  } finally {
    loading.value = false
  }
}

const downloadPDF = (n) => {
  var element = null
  if (n === 8) {
    element = recapContent8.value
  } else if (n === 10) {
    element = recapContent10.value
  } else {
    return
  }

  // Cloner le contenu
  const clone = element.cloneNode(true)

  // Supprimer les éléments avec une classe spécifique
  clone.querySelectorAll('.no-print').forEach((el) => el.remove())

  const opt = {
    margin: 0.5,
    filename: `recap-dossier-RP-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  }

  html2pdf().from(clone).set(opt).save()
}

const resetForm = () => {
  formData.value = formStruct
  step.value = 1
  maxStep.value = 1
  done.value = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
    11: false,
  }
  stateform.value = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
  }
  selectedRow.value = []
  rows.value = []
  eltSelect.value = false
}

/* const searchDemande = () => {
  $q.notify({
    type: 'info',
    message: 'Recherche en cours... (à implémenter)',
  })
} */
</script>

<style scoped>
.nouveau-dossier {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 310px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #00b4ff

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>

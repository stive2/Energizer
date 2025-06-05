
<template>
  <q-dialog v-model="open" persistent full-width>
    <q-card :style="$q.screen.gt.sm ? 'width: 900px' : 'width: 100%'">
      <q-card-section>
        <div class="text-h6 text-primary text-center text-bold">
          {{ $t(service.name) }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" @submit.prevent="submitForm">
          <q-stepper
            v-model="step"
            :vertical="!$q.screen.gt.sm"
            color="primary"
            header-nav
            animated
          >
            <!-- Étape 1 : Informations sur l'emploi travailleur -->
            <q-step
              :name="1"
              title="Informations sur l'emploi travailleur"
              icon="work"
              :done="step > 1"
              :error="stepErrors[1]"
              :header-class="stepErrors[1] ? 'bg-red text-white' : ''"
            >
              <div class="justify-center row" :class="{ 'column': !$q.screen.gt.sm }">
               <q-input
                v-model="form.matriculeCNPS"
                label="Matricule CNPS employeur *"
                outlined
                dense
                :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                class="q-mr-sm q-mb-sm"
                :rules="[required, validateMatriculeCNPS]"
                :error="stepErrors[1] && !form.matriculeCNPS"
                @input="form.matriculeCNPS = form.matriculeCNPS.toUpperCase()"
                @keyup.enter="fetchEmployerData"
                @keydown.enter.prevent="fetchEmployerData"
              >
                <template v-slot:append>
                  <q-icon
                    name="search"
                    class="cursor-pointer"
                    color="primary"
                    @click="fetchEmployerData"
                  />
                </template>
              </q-input>
                <q-input
                  v-model="form.nomEntreprise"
                  label="Dénomination sociale"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  readonly
                />
                <q-input
                  v-model="form.employeur"
                  label="Nom commercial *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  readonly
                  :rules="[required]"
                  :error="stepErrors[1] && !form.employeur"
                />
                <q-input
                  v-model="form.localisation"
                  label="Localisation Entreprise"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.localisation = form.localisation.toUpperCase()"
                />
                <q-input
                  v-model="form.datePremierSalaire"
                  placeholder="Date d'embauche Premier salarié" hint="Date d'embauche Premier salarié"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  mask="##/##/####"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.datePremierSalaire"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.smig"
                  label="SMIG"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  type="number"
                  min="0"
                  readonly
                />
                <q-input
                  v-model="form.dateEmbauche"
                  label="Date d'embauche *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  readonly
                  :rules="[required]"
                  :error="stepErrors[1] && !form.dateEmbauche"
                  mask="##/##/####"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateEmbauche"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                          @update:model-value="calculateSmig"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-select
                  v-model="form.categorie"
                  label="Catégorie "
                  :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                />
                <q-select
                  v-model="form.echelon"
                  label="Echelon"
                  :options="['A', 'B', 'C', 'D', 'E', 'F', 'G']"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                />
                <q-input
                  v-model="form.specialite"
                  label="Spécialité "
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.specialite = form.specialite.toUpperCase()"
                />
                <q-input
                  v-model="form.effectif"
                  label="Effectif Approximatif"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  type="number"
                  min="0"
                />
                <q-input
                  v-model="form.niveau"
                  label="Niveau d'instruction"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.niveau = form.niveau.toUpperCase()"
                />
                <q-input
                  v-model="form.revenuActuel"
                  label="Revenu actuel"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.revenuActuel = form.revenuActuel.toUpperCase()"
                />
                <q-file
                  v-model="form.avisEmbauche"
                  label="Avis d'embauche *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  counter
                  :counter-label="counterLabelFn"
                  max-files="1"
                  accept=".jpg, .png, image/*"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[1] && !form.avisEmbauche"
                  @update:model-value="onFileSelected('avisEmbauche')"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(2)" color="primary" label="Continuer" />
              </q-stepper-navigation>
            </q-step>

            <!-- Étape 2 : Informations personnelles de l’assuré -->
            <q-step
              :name="2"
              title="Informations personnelles de l’assuré"
              icon="person"
              :done="step > 2"
              :error="stepErrors[2]"
              :header-class="stepErrors[2] ? 'bg-red text-white' : ''"
            >
              <div class="justify-center row" :class="{ 'column': !$q.screen.gt.sm }">
                <q-input
                  v-model="form.nom"
                  label="Nom *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.nom"
                  @input="form.nom = form.nom.toUpperCase()"
                />
                <q-input
                  v-model="form.prenom"
                  label="Prénom"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.prenom = form.prenom.toUpperCase()"
                />
                <q-select
                  v-model="form.sexe"
                  label="Sexe *"
                  :options="['Masculin', 'Féminin']"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.sexe"
                />
                <q-input
                  v-model="form.dateNaissance"
                  label="Date de naissance *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required, validateDateNaissance]"
                  :error="stepErrors[2] && !form.dateNaissance"
                  mask="##/##/####"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateNaissance"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDateNaissance"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.lieuNaissance"
                  label="Lieu de naissance *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.lieuNaissance"
                  @input="form.lieuNaissance = form.lieuNaissance.toUpperCase()"
                />
                <q-select
                  v-model="form.arrondissementAssure"
                  label="Arrondissement de naissance *"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  hint="Arrondissement de naissance *"
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.arrondissementAssure"
                />
                <q-select
                  v-model="form.etatCivil"
                  label="État matrimonial *"
                  :options="['Célibataire', 'Marié', 'Divorcé', 'Veuf']"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.etatCivil"
                />
                <q-select
                  v-model="form.nationaliteAssure"
                  :options="pays"
                  option-label="nationalite"
                  label="Nationalité *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPays"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.nationaliteAssure"
                />
                <q-select
                  v-model="form.pieceIdentiteAssure"
                  :options="pieces"
                  option-label="LIBELLE"
                  label="Type de Pièce d'identité *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPieces"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.pieceIdentiteAssure"
                />
                <q-input
                  v-model="form.numeroPieceIdentite"
                  label="Numéro de pièce d'identité *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.numeroPieceIdentite"
                  @input="form.numeroPieceIdentite = form.numeroPieceIdentite.toUpperCase()"
                />
                <q-input
                  v-model="form.datePieceIdentite"
                  label="Etabli le *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[2] && !form.datePieceIdentite"
                  mask="##/##/####"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.datePieceIdentite"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-select
                  v-model="form.lieuDelivrancePieceIdentiteAssure"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  label="à *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  :rules="[required]"
                  :error="stepErrors[2] && !form.lieuDelivrancePieceIdentiteAssure"
                  map-options
                  @filter="filterArrondissement"
                />
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(3)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 1" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Étape 3 : Informations sur le père de l’assuré -->
            <q-step
              :name="3"
              title="Informations sur le père de l’assuré"
              icon="person"
              :done="step > 3"
              :error="stepErrors[3]"
              :header-class="stepErrors[3] ? 'bg-red text-white' : ''"
            >
              <div class="justify-center row" :class="{ 'column': !$q.screen.gt.sm }">
                <q-input
                  v-model="form.nomPere"
                  label="Nom"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.nomPere = form.nomPere.toUpperCase()"
                />
                <q-input
                  v-model="form.prenomPere"
                  label="Prénom"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.prenomPere = form.prenomPere.toUpperCase()"
                />
                <q-input
                  v-model="form.dateNaissancePere"
                  label="Date de naissance"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  mask="##/##/####"
                  :rules="[validateDateNaissancePere]"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateNaissancePere"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.lieuNaissancePere"
                  label="Lieu de naissance"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.lieuNaissancePere = form.lieuNaissancePere.toUpperCase()"
                />
                <q-select
                  v-model="form.arrondissementPere"
                  label="Arrondissement de naissance"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                />
                <q-select
                  v-model="form.vivantPere"
                  label="Vivant"
                  :options="['Oui', 'Non']"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                />
                <q-input
                  v-if="form.vivantPere === 'Non'"
                  v-model="form.dateDecesPere"
                  label="Date décès"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  mask="##/##/####"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateDecesPere"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <q-stepper-navigation>
                <q-btn @click="goToNextStep(4)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 3" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Étape 4 : Informations sur la mère de l’assuré -->
            <q-step
              :name="4"
              title="Informations sur la mère de l’assuré"
              icon="person"
              :done="step > 4"
              :error="stepErrors[4]"
              :header-class="stepErrors[4] ? 'bg-red text-white' : ''"
            >
              <div class="justify-center row" :class="{ 'column': !$q.screen.gt.sm }">
                <q-input
                  v-model="form.nomMere"
                  label="Nom *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[4] && !form.nomMere"
                  @input="form.nomMere = form.nomMere.toUpperCase()"
                />
                <q-input
                  v-model="form.prenomMere"
                  label="Prénom"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.prenomMere = form.prenomMere.toUpperCase()"
                />
                <q-input
                  v-model="form.dateNaissanceMere"
                  label="Date de naissance *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  mask="##/##/####"
                  :rules="[required, validateDateNaissanceMere]"
                  :error="stepErrors[4] && !form.dateNaissanceMere"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateNaissanceMere"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.lieuNaissanceMere"
                  label="Lieu de naissance *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[4] && !form.lieuNaissanceMere"
                  @input="form.lieuNaissanceMere = form.lieuNaissanceMere.toUpperCase()"
                />
                <q-select
                  v-model="form.arrondissementMere"
                  label="Arrondissement de naissance *"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                  :error="stepErrors[4] && !form.arrondissementMere"
                />
                <q-select
                  v-model="form.vivantMere"
                  label="Vivant *"
                  :options="['Oui', 'Non']"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[4] && !form.vivantMere"
                />
                <q-input
                  v-if="form.vivantMere === 'Non'"
                  v-model="form.dateDecesMere"
                  label="Date décès"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  mask="##/##/####"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateDecesMere"
                          mask="DD/MM/YYYY"
                          locale="fr"
                          :options="optionsDn"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(5)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 3" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Étape 5 : Contact et Résidence -->
            <q-step
              :name="5"
              title="Contact et Résidence"
              icon="home"
              :done="step > 5"
              :error="stepErrors[5]"
              :header-class="stepErrors[5] ? 'bg-red text-white' : ''"
            >
              <div class="justify-center row" :class="{ 'column': !$q.screen.gt.sm }">
                <q-select
                  v-model="form.ville"
                  label="Ville de résidence *"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                  :error="stepErrors[5] && !form.ville"
                />
                <q-input
                  v-model="form.quartier"
                  label="Quartier"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.quartier = form.quartier.toUpperCase()"
                />
                <q-input
                  v-model="form.telephone"
                  label="Téléphone *"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  type="tel"
                  mask="+237 ### ### ###"
                  class="q-mr-sm q-mb-sm"
                  :rules="[required]"
                  :error="stepErrors[5] && !form.telephone"
                />
                <q-input
                  v-model="form.fax"
                  label="Fax"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.fax = form.fax.toUpperCase()"
                />
                <q-input
                  v-model="form.addresse"
                  label="Adresse"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.addresse = form.addresse.toUpperCase()"
                />
                <q-input
                  v-model="form.email"
                  label="Email"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  type="email"
                  :rules="[required, validateEmail]"
                  :error="stepErrors[5] && !form.email"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
                <q-input
                  v-model="form.boitePostale"
                  label="Boîte postale"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  @input="form.boitePostale = form.boitePostale.toUpperCase()"
                />
                <q-select
                  v-model="form.centreCNPS"
                  :options="centres"
                  option-label="LIB_CENTRE"
                  label="Centre CNPS de Gestion à préciser au CFCE*"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterCentreCNPS"
                  :rules="[required]"
                  :error="stepErrors[5] && !form.centreCNPS"
                />
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(6)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 4" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Étape 6 : Pièces complémentaires -->
            <q-step
              :name="6"
              title="Pièces complémentaires"
              icon="work"
              :done="step > 6"
              :error="stepErrors[6]"
              :header-class="stepErrors[6] ? 'bg-red text-white' : ''"
            >
              <div class="justify-center row" :class="{ 'column': !$q.screen.gt.sm }">
                <q-input
                  v-model="form.nombreEnfants"
                  label="Nombre d’enfants"
                  type="number"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  min="0"
                  @update:model-value="resetFileField('actesNaissance')"
                />
                <q-file
                  v-if="form.nombreEnfants > 0"
                  v-model="form.actesNaissance"
                  :label="`Actes de naissance des enfants (${form.nombreEnfants} requis)`"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  counter
                  :counter-label="counterLabelFn"
                  :max-files="form.nombreEnfants"
                  multiple
                  accept=".jpg, .png, .pdf"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[requiredFiles(form.nombreEnfants)]"
                  :error="stepErrors[6] && form.nombreEnfants > 0 && (!form.actesNaissance || form.actesNaissance.length === 0)"
                  @update:model-value="onFileSelected('actesNaissance')"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
                <q-input
                  v-model="form.nombreCertificat"
                  label="Nombre Certificat de travail chez employeur(s) précédent(s)"
                  placeholder="Nombre Certificat de travail chez employeur(s) précédent(s)" hint="Nombre Certificat de travail chez employeur(s) précédent(s)"
                  type="number"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  min="0"
                  @update:model-value="resetFileField('certificatsTravail')"
                />
                <q-file
                  v-if="form.nombreCertificat > 0"
                  v-model="form.certificatsTravail"
                  :label="`Certificats de travail (${form.nombreCertificat} requis)`"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  counter
                  :counter-label="counterLabelFn"
                  :max-files="form.nombreCertificat"
                  multiple
                  accept=".jpg, .png, .pdf"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[requiredFiles(form.nombreCertificat)]"
                  :error="stepErrors[6] && form.nombreCertificat > 0 && (!form.certificatsTravail || form.certificatsTravail.length === 0)"
                  @update:model-value="onFileSelected('certificatsTravail')"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
                <q-input
                  v-model="form.nombreConjoints"
                  label="Nombre de conjoints"
                  type="number"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  class="q-mr-sm q-mb-sm"
                  min="0"
                  @update:model-value="resetFileField('actesMariage')"
                />
                <q-file
                  v-if="form.nombreConjoints > 0"
                  v-model="form.actesMariage"
                  :label="`Actes de mariage (${form.nombreConjoints} requis)`"
                  outlined
                  dense
                  :style="$q.screen.gt.sm ? 'width: 600px' : 'width: 100%'"
                  counter
                  :counter-label="counterLabelFn"
                  :max-files="form.nombreConjoints"
                  multiple
                  accept=".jpg, .png, .pdf"
                  max-file-size="3072000"
                  class="q-mr-sm q-mb-sm"
                  :rules="[requiredFiles(form.nombreConjoints)]"
                  :error="stepErrors[6] && form.nombreConjoints > 0 && (!form.actesMariage || form.actesMariage.length === 0)"
                  @update:model-value="onFileSelected('actesMariage')"
                  @rejected="onRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(7)" color="primary" label="Continuer" />
                <q-btn flat @click="step = 5" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>

            <!-- Étape 7 : Validation finale -->
            <q-step
              :name="7"
              title="Validation finale"
              icon="check_circle"
              :error="stepErrors[7]"
              :header-class="stepErrors[7] ? 'bg-red text-white' : ''"
            >
              <div class="justify-center row" :class="{ 'column': !$q.screen.gt.sm }">
                <!-- Résumé Étape 1 -->
                <q-card flat bordered class="q-mb-md full-width">
                  <q-card-section class="row items-center">
                    <div class="text-h6 text-primary">Informations sur l'emploi travailleur</div>
                    <q-space />
                    <q-btn
                      flat
                      color="primary"
                      label="Modifier"
                      @click="step = 1"
                    />
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Matricule CNPS</q-item-label>
                          <q-item-label caption>{{ form.matriculeCNPS || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Dénomination sociale</q-item-label>
                          <q-item-label caption>{{ form.nomEntreprise || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nom commercial</q-item-label>
                          <q-item-label caption>{{ form.employeur || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Localisation Entreprise</q-item-label>
                          <q-item-label caption>{{ form.localisation || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Date d'embauche Premier salarié</q-item-label>
                          <q-item-label caption>{{ form.datePremierSalaire || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>SMIG</q-item-label>
                          <q-item-label caption>{{ form.smig || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Date d'embauche</q-item-label>
                          <q-item-label caption>{{ form.dateEmbauche || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Catégorie</q-item-label>
                          <q-item-label caption>{{ form.categorie || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Echelon</q-item-label>
                          <q-item-label caption>{{ form.echelon || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Spécialité</q-item-label>
                          <q-item-label caption>{{ form.specialite || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Effectif Approximatif</q-item-label>
                          <q-item-label caption>{{ form.effectif || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Niveau d'instruction</q-item-label>
                          <q-item-label caption>{{ form.niveau || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Revenu actuel</q-item-label>
                          <q-item-label caption>{{ form.revenuActuel || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Avis d'embauche</q-item-label>
                          <q-item-label caption>{{ form.avisEmbauche ? form.avisEmbauche.name : 'Aucun fichier' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Résumé Étape 2 -->
                <q-card flat bordered class="q-mb-md full-width">
                  <q-card-section class="row items-center">
                    <div class="text-h6 text-primary">Informations personnelles de l’assuré</div>
                    <q-space />
                    <q-btn
                      flat
                      color="primary"
                      label="Modifier"
                      @click="step = 2"
                    />
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nom</q-item-label>
                          <q-item-label caption>{{ form.nom || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Prénom</q-item-label>
                          <q-item-label caption>{{ form.prenom || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Sexe</q-item-label>
                          <q-item-label caption>{{ form.sexe || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Date de naissance</q-item-label>
                          <q-item-label caption>{{ form.dateNaissance || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Lieu de naissance</q-item-label>
                          <q-item-label caption>{{ form.lieuNaissance || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Arrondissement de naissance</q-item-label>
                          <q-item-label caption>{{ form.arrondissementAssure?.NOM_ARROND || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>État matrimonial</q-item-label>
                          <q-item-label caption>{{ form.etatCivil || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nationalité</q-item-label>
                          <q-item-label caption>{{ form.nationaliteAssure?.nationalite || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Type de pièce d'identité</q-item-label>
                          <q-item-label caption>{{ form.pieceIdentiteAssure?.LIBELLE || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Numéro de pièce d'identité</q-item-label>
                          <q-item-label caption>{{ form.numeroPieceIdentite || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Établi le</q-item-label>
                          <q-item-label caption>{{ form.datePieceIdentite || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Lieu de délivrance</q-item-label>
                          <q-item-label caption>{{ form.lieuDelivrancePieceIdentiteAssure?.NOM_ARROND || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Résumé Étape 3 -->
                <q-card flat bordered class="q-mb-md full-width">
                  <q-card-section class="row items-center">
                    <div class="text-h6 text-primary">Informations sur le père de l’assuré</div>
                    <q-space />
                    <q-btn
                      flat
                      color="primary"
                      label="Modifier"
                      @click="step = 3"
                    />
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nom</q-item-label>
                          <q-item-label caption>{{ form.nomPere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Prénom</q-item-label>
                          <q-item-label caption>{{ form.prenomPere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Date de naissance</q-item-label>
                          <q-item-label caption>{{ form.dateNaissancePere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Lieu de naissance</q-item-label>
                          <q-item-label caption>{{ form.lieuNaissancePere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Arrondissement de naissance</q-item-label>
                          <q-item-label caption>{{ form.arrondissementPere?.NOM_ARROND || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Vivant</q-item-label>
                          <q-item-label caption>{{ form.vivantPere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="form.vivantPere === 'Non'">
                        <q-item-section>
                          <q-item-label>Date de décès</q-item-label>
                          <q-item-label caption>{{ form.dateDecesPere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Résumé Étape 4 -->
                <q-card flat bordered class="q-mb-md full-width">
                  <q-card-section class="row items-center">
                    <div class="text-h6 text-primary">Informations sur la mère de l’assuré</div>
                    <q-space />
                    <q-btn
                      flat
                      color="primary"
                      label="Modifier"
                      @click="step = 4"
                    />
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nom</q-item-label>
                          <q-item-label caption>{{ form.nomMere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Prénom</q-item-label>
                          <q-item-label caption>{{ form.prenomMere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Date de naissance</q-item-label>
                          <q-item-label caption>{{ form.dateNaissanceMere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Lieu de naissance</q-item-label>
                          <q-item-label caption>{{ form.lieuNaissanceMere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Arrondissement de naissance</q-item-label>
                          <q-item-label caption>{{ form.arrondissementMere?.NOM_ARROND || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Vivant</q-item-label>
                          <q-item-label caption>{{ form.vivantMere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="form.vivantMere === 'Non'">
                        <q-item-section>
                          <q-item-label>Date de décès</q-item-label>
                          <q-item-label caption>{{ form.dateDecesMere || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Résumé Étape 5 -->
                <q-card flat bordered class="q-mb-md full-width">
                  <q-card-section class="row items-center">
                    <div class="text-h6 text-primary">Contact et Résidence</div>
                    <q-space />
                    <q-btn
                      flat
                      color="primary"
                      label="Modifier"
                      @click="step = 5"
                    />
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Ville de résidence</q-item-label>
                          <q-item-label caption>{{ form.ville?.NOM_ARROND || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Quartier</q-item-label>
                          <q-item-label caption>{{ form.quartier || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Téléphone</q-item-label>
                          <q-item-label caption>{{ form.telephone || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Fax</q-item-label>
                          <q-item-label caption>{{ form.fax || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Adresse</q-item-label>
                          <q-item-label caption>{{ form.addresse || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Email</q-item-label>
                          <q-item-label caption>{{ form.email || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Boîte postale</q-item-label>
                          <q-item-label caption>{{ form.boitePostale || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Centre CNPS</q-item-label>
                          <q-item-label caption>{{ form.centreCNPS?.LIB_CENTRE || 'Non spécifié' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Résumé Étape 6 -->
                <q-card flat bordered class="q-mb-md full-width">
                  <q-card-section class="row items-center">
                    <div class="text-h6 text-primary">Pièces complémentaires</div>
                    <q-space />
                    <q-btn
                      flat
                      color="primary"
                      label="Modifier"
                      @click="step = 6"
                    />
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nombre d’enfants</q-item-label>
                          <q-item-label caption>{{ form.nombreEnfants || '0' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Actes de naissance</q-item-label>
                          <q-item-label caption>
                            {{ form.actesNaissance.length }} fichier(s)
                            <div v-if="form.actesNaissance.length > 0">
                              <div v-for="file in form.actesNaissance" :key="file.name">
                                - {{ file.name }}
                              </div>
                            </div>
                            <div v-else>Aucun fichier</div>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nombre de certificats de travail</q-item-label>
                          <q-item-label caption>{{ form.nombreCertificat || '0' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Certificats de travail</q-item-label>
                          <q-item-label caption>
                            {{ form.certificatsTravail.length }} fichier(s)
                            <div v-if="form.certificatsTravail.length > 0">
                              <div v-for="file in form.certificatsTravail" :key="file.name">
                                - {{ file.name }}
                              </div>
                            </div>
                            <div v-else>Aucun fichier</div>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Nombre de conjoints</q-item-label>
                          <q-item-label caption>{{ form.nombreConjoints || '0' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>Actes de mariage</q-item-label>
                          <q-item-label caption>
                            {{ form.actesMariage.length }} fichier(s)
                            <div v-if="form.actesMariage.length > 0">
                              <div v-for="file in form.actesMariage" :key="file.name">
                                - {{ file.name }}
                              </div>
                            </div>
                            <div v-else>Aucun fichier</div>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Bouton de soumission finale -->
                <q-btn
                  color="primary"
                  label="Confirmer et soumettre"
                  @click="validateAndShowConfirmation"
                  class="q-mt-md"
                />
              </div>

              <q-stepper-navigation>
                <q-btn flat @click="step = 6" color="primary" label="Retour" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Annuler" v-close-popup color="primary" @click="closeDialog" />
      </q-card-actions>
    </q-card>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="showConfirmationDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6 text-primary text-center">Confirmation de soumission</div>
        </q-card-section>

        <q-separator />

        <q-card-section style="max-height: 50vh" class="scroll">
          <p class="text-justify">
            Vous êtes sur le point de soumettre définitivement les informations. Veuillez vérifier que toutes les informations fournies sont correctes, car aucune modification ne sera possible après la soumission.
          </p>
          <p>
            En cliquant sur "Soumettre", vous confirmez que vous avez lu et compris les conditions de soumission.
          </p>
        </q-card-section>

        <q-separator />

        <q-card-actions align="center">
          <q-btn  label="Soumettre" color="primary" @click="confirmSubmission" />
          <q-btn flat label="Annuler" color="primary" @click="showConfirmationDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { useNotify } from './useNotify.js';
import { arrondissements as rawArrondissements } from '../data/Arrondissements.js';
import { pays as rawPays } from '../data/Pays.js';
import { pieces as rawPieces } from '../data/Pieces.js';
import { centres as rawCentres } from '../data/Centres.js';

defineProps({
  service: Object,
});

const emit = defineEmits(['close']);

const { notifyError, notifySuccess } = useNotify();

const open = ref(true);
const step = ref(1);
const formRef = ref(null);
const stepErrors = ref({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false });
const showConfirmationDialog = ref(false);

const arrondissements = ref([...rawArrondissements]);
const pays = ref([...rawPays]);
const pieces = ref([...rawPieces]);
const centres = ref([...rawCentres]);

// Fonction de validation pour l'email
const validateEmail = (val) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(val) || 'Veuillez entrer un email valide (ex: exemple@domaine.com)';
};

// Fonction de validation pour le matricule CNPS
const validateMatriculeCNPS = (val) => {
  const regex = /^(?:\d{3}-\d{7}-\d{3}-[A-Z]|\d{3}-\d{7}-[A-Z])$/;
  return regex.test(val) || 'Le matricule CNPS doit suivre le format 123-1234567-123-A ou 123-1234567-A';
};

// Validation pour la date de naissance de l'assuré (minimum 14 ans)
const validateDateNaissance = (val) => {
  if (!val) return 'Ce champ est requis';
  const [day, month, year] = val.split('/').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 14);
  return birthDate <= minDate || 'L\'assuré doit avoir au moins 14 ans';
};

// Validation pour la date de naissance du père
const validateDateNaissancePere = (val) => {
  if (!val) return true; // Champ non requis
  if (!form.value.dateNaissance) return 'Veuillez d\'abord entrer la date de naissance de l\'assuré';
  const [day, month, year] = val.split('/').map(Number);
  const fatherBirthDate = new Date(year, month - 1, day);
  const [assureDay, assureMonth, assureYear] = form.value.dateNaissance.split('/').map(Number);
  const assureBirthDate = new Date(assureYear, assureMonth - 1, assureDay);
  const minFatherBirthDate = new Date(assureBirthDate);
  minFatherBirthDate.setFullYear(assureBirthDate.getFullYear() - 12);
  return fatherBirthDate <= minFatherBirthDate || 'Le père doit être né au moins 12 ans avant l\'assuré';
};

// Validation pour la date de naissance de la mère
const validateDateNaissanceMere = (val) => {
  if (!val) return 'Ce champ est requis';
  if (!form.value.dateNaissance) return 'Veuillez d\'abord entrer la date de naissance de l\'assuré';
  const [day, month, year] = val.split('/').map(Number);
  const motherBirthDate = new Date(year, month - 1, day);
  const [assureDay, assureMonth, assureYear] = form.value.dateNaissance.split('/').map(Number);
  const assureBirthDate = new Date(assureYear, assureMonth - 1, assureDay);
  const minMotherBirthDate = new Date(assureBirthDate);
  minMotherBirthDate.setFullYear(assureBirthDate.getFullYear() - 12);
  return motherBirthDate <= minMotherBirthDate || 'La mère doit être née au moins 12 ans avant l\'assuré';
};

// Validation pour les fichiers requis
const requiredFiles = (count) => (val) => {
  if (!val || val.length === 0) return `Veuillez télécharger ${count} fichier(s)`;
  //return val.length === count || `Vous devez télécharger exactement ${count} fichier(s)`;
};

// Gestionnaire pour la sélection de fichier
const onFileSelected = (field) => async (files) => {
  if (files && files.length > 0) {
    notifySuccess(`${files.length} fichier(s) sélectionné(s) avec succès pour ${field} !`);
    formRef.value.resetValidation();
    await formRef.value.validate();
  }
};

const onRejected = (rejectedEntries) => {
  rejectedEntries.forEach((entry) => {
    notifyError(
      `Fichier rejeté : ${entry.file.name} - ${
        entry.failedPropValidation === 'max-file-size'
          ? 'Taille maximale dépassée (3MB)'
          : 'Format non pris en charge.'
      }`,
    );
  });
};

// Réinitialiser le champ fichier lorsque le nombre change
const resetFileField = (field) => {
  form.value[field] = [];
  formRef.value.resetValidation();
};

// Counter label function for file inputs
const counterLabelFn = ({ files } = {}) => {
  return files && files.length > 0 ? `${files.length} fichier(s) sélectionné(s)` : '';
};

// Mock data for employers
const employeurs = ref([
  {
    numeroEmployeur: '123-1234567-123-A',
    employeur: 'Orange Cameroun',
    nomEntreprise: 'Orange Cameroon',
    localisation: 'Yaoundé, Cameroun',
    datePremierSalaire: '25/10/1998',
    effectif: 500,
  },
]);

const form = ref({
  matriculeCNPS: '',
  employeur: '',
  nomEntreprise: '',
  avisEmbauche: null,
  dateEmbauche: '',
  echelon: '',
  specialite: '',
  localisation: '',
  datePremierSalaire: '',
  effectif: 0,
  categorie: null,
  niveau: '',
  revenuActuel: '',
  sexe: '',
  nom: '',
  prenom: '',
  dateNaissance: '',
  lieuNaissance: '',
  nationaliteAssure: null,
  numeroCarteNationale: '',
  numeroPieceIdentite: '',
  datePieceIdentite: '',
  lieuDelivrancePieceIdentiteAssure: null,
  etatCivil: '',
  profession: '',
  numero: '',
  nomPere: '',
  prenomPere: '',
  dateNaissanceMer:'',
  dateNaissancePere: '',
  arrondissementPere: null,
  arrondissementAssure: null,
  nationalitePere: null,
  pieceIdentiteAssure: null,
  lieuNaissancePere: '',
  vivantPere: '',
  dateDecesPere: '',
  nomMere: '',
  prenomMere: '',
  dateNaissanceMere: '',
  lieuNaissanceMere: '',
  arrondissementMere: null,
  vivantMere: '',
  dateDecesMere: '',
  ville: null,
  quartier: '',
  telephone: '',
  email: '',
  boitePostale: '',
  centreCNPS: null,
  fax: '',
  addresse: '',
  nomEmployeur: '',
  lieuTravail: '',
  situationMatrimoniale: '',
  nombreEnfants: 0,
  nombreCertificat: 0,
  nombreConjoints: 0,
  smig: 0,
  actesNaissance: [],
  certificatsTravail: [],
  actesMariage: [],
});

const optionsDn = (date) => {
  const [year, month, day] = date.split('/').map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate <= today;
};

const optionsDateNaissance = (date) => {
  const [year, month, day] = date.split('/').map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 14);
  return selectedDate <= minDate;
};

const required = (val) => !!val || 'Ce champ est requis';

// Calcul du SMIG basé sur la date d'embauche
const calculateSmig = () => {
  if (!form.value.dateEmbauche) return;

  const dateParts = form.value.dateEmbauche.split('/');
  if (dateParts.length !== 3) return;

  const year = parseInt(dateParts[2]);
  if (isNaN(year)) return;

  const currentYear = new Date().getFullYear();
  const yearsSinceHire = currentYear - year;

  const baseSmig = 36250;
  const randomIncrement = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
  form.value.smig = baseSmig + (yearsSinceHire * randomIncrement);
};

const goToNextStep = async (nextStep) => {
  const valid = await formRef.value.validate();
  if (valid) {
    stepErrors.value[nextStep - 1] = false;
    step.value = nextStep;
  } else {
    stepErrors.value[step.value] = true;
    notifyError('Veuillez remplir tous les champs requis.');
  }
};

const fetchEmployerData = () => {
  const matricule = form.value.matriculeCNPS;
  const employer = employeurs.value.find((emp) => emp.numeroEmployeur === matricule);

  if (employer) {
    form.value.employeur = employer.employeur || '';
    form.value.nomEntreprise = employer.nomEntreprise || '';
    form.value.localisation = employer.localisation || '';
    form.value.datePremierSalaire = employer.datePremierSalaire || '';
    form.value.effectif = employer.effectif || 0;
    notifySuccess("Informations de l'employeur chargées avec succès.");
  } else {
    form.value.employeur = '';
    form.value.nomEntreprise = '';
    form.value.localisation = '';
    form.value.datePremierSalaire = '';
    form.value.effectif = 0;
    notifyError("L'employeur n'existe pas.");
  }
};

const filterArrondissement = (val, update) => {
  if (val === '') {
    update(() => {
      arrondissements.value = [...rawArrondissements];
    });
    return;
  }
  const needle = val.toLowerCase();
  update(() => {
    arrondissements.value = rawArrondissements.filter((item) =>
      item.NOM_ARROND.toLowerCase().includes(needle),
    );
  });
};

const filterPays = (val, update) => {
  if (val === '') {
    update(() => {
      pays.value = [...rawPays];
    });
    return;
  }
  const needle = val.toLowerCase();
  update(() => {
    pays.value = rawPays.filter((item) => item.nationalite.toLowerCase().includes(needle));
  });
};

const filterPieces = (val, update) => {
  if (val === '') {
    update(() => {
      pieces.value = [...rawPieces];
    });
    return;
  }
  const needle = val.toLowerCase();
  update(() => {
    pieces.value = rawPieces.filter((item) => item.LIBELLE.toLowerCase().includes(needle));
  });
};

const filterCentreCNPS = (val, update) => {
  if (val === '') {
    update(() => {
      centres.value = [...rawCentres];
    });
    return;
  }
  const needle = val.toLowerCase();
  update(() => {
    centres.value = rawCentres.filter((item) => item.LIB_CENTRE.toLowerCase().includes(needle));
  });
};

const validateStep = (stepNumber) => {
  const stepFields = {
    1: ['matriculeCNPS', 'employeur', 'dateEmbauche', 'avisEmbauche'],
    2: [
      'nom',
      'sexe',
      'dateNaissance',
      'lieuNaissance',
      'arrondissementAssure',
      'etatCivil',
      'nationaliteAssure',
      'pieceIdentiteAssure',
      'numeroPieceIdentite',
      'datePieceIdentite',
      'lieuDelivrancePieceIdentiteAssure'
    ],
    3: [],
    4: ['nomMere', 'dateNaissanceMere', 'lieuNaissanceMere', 'arrondissementMere', 'vivantMere'],
    5: ['ville', 'telephone', 'email', 'centreCNPS'],
    6: [],
    7: [],
  };

  // Vérification des champs conditionnels requis pour l'étape 6
  const step6Errors = [];
  if (form.value.nombreEnfants > 0 && (!form.value.actesNaissance || form.value.actesNaissance.length !== form.value.nombreEnfants)) {
    step6Errors.push('actesNaissance');
  }
  if (form.value.nombreCertificat > 0 && (!form.value.certificatsTravail || form.value.certificatsTravail.length !== form.value.nombreCertificat)) {
    step6Errors.push('certificatsTravail');
  }
  if (form.value.nombreConjoints > 0 && (!form.value.actesMariage || form.value.actesMariage.length !== form.value.nombreConjoints)) {
    step6Errors.push('actesMariage');
  }

  const errors = stepFields[stepNumber].filter((field) => !form.value[field]);
  if (stepNumber === 6) {
    return step6Errors.length > 0;
  }
  return errors.length > 0;
};

const validateAndShowConfirmation = async () => {
  // Réinitialiser les erreurs d'étape
  stepErrors.value = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false };

  // Valider toutes les étapes
  let hasErrors = false;
  for (let i = 1; i <= 6; i++) {
    if (validateStep(i)) {
      stepErrors.value[i] = true;
      hasErrors = true;
    }
  }

  // Effectuer la validation du formulaire
  const valid = await formRef.value.validate();
  if (!valid || hasErrors) {
    // Trouver la première étape avec des erreurs
    const firstErrorStep = Object.keys(stepErrors.value).find((key) => stepErrors.value[key]);
    if (firstErrorStep) {
      step.value = parseInt(firstErrorStep);
      notifyError(`Veuillez corriger les erreurs dans l'étape ${firstErrorStep}.`);
    } else {
      notifyError('Veuillez corriger les erreurs du formulaire.');
    }
    return;
  }

  // Si valide, afficher le dialogue de confirmation
  showConfirmationDialog.value = true;
};

const confirmSubmission = async () => {
  showConfirmationDialog.value = false;
  await sendToOnBase();
};

const submitForm = async () => {
  // Réinitialiser les erreurs d'étape
  stepErrors.value = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false };

  // Valider toutes les étapes
  let hasErrors = false;
  for (let i = 1; i <= 6; i++) {
    if (validateStep(i)) {
      stepErrors.value[i] = true;
      hasErrors = true;
    }
  }

  // Effectuer la validation du formulaire
  const valid = await formRef.value.validate();
  if (!valid || hasErrors) {
    // Trouver la première étape avec des erreurs
    const firstErrorStep = Object.keys(stepErrors.value).find((key) => stepErrors.value[key]);
    if (firstErrorStep) {
      step.value = parseInt(firstErrorStep);
      notifyError(`Veuillez corriger les erreurs dans l'étape ${firstErrorStep}.`);
    } else {
      notifyError('Veuillez corriger les erreurs du formulaire.');
    }
    return;
  }

  // Si tout est valide, passer à l'étape de validation finale
  step.value = 7;
  notifySuccess('Formulaire prêt pour la validation finale.');
};

// Simulation d'envoi des données et fichiers à OnBase
const sendToOnBase = async () => {
  try {
    // Créer un FormData pour envoyer les données et fichiers
    const formData = new FormData();

    // Ajouter les champs du formulaire
    Object.keys(form.value).forEach((key) => {
      if (key === 'avisEmbauche' && form.value.avisEmbauche) {
        formData.append('avisEmbauche', form.value.avisEmbauche);
      } else if (key === 'actesNaissance' && form.value.actesNaissance.length > 0) {
        form.value.actesNaissance.forEach((file, index) => {
          formData.append(`actesNaissance[${index}]`, file);
        });
      } else if (key === 'certificatsTravail' && form.value.certificatsTravail.length > 0) {
        form.value.certificatsTravail.forEach((file, index) => {
          formData.append(`certificatsTravail[${index}]`, file);
        });
      } else if (key === 'actesMariage' && form.value.actesMariage.length > 0) {
        form.value.actesMariage.forEach((file, index) => {
          formData.append(`actesMariage[${index}]`, file);
        });
      } else if (typeof form.value[key] === 'object' && form.value[key] !== null) {
        formData.append(key, JSON.stringify(form.value[key]));
      } else {
        formData.append(key, form.value[key] || '');
      }
    });

    // Simulation d'envoi (remplacer par une vraie requête API)
    console.log('Envoi des données à OnBase:', formData);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simuler un délai réseau

    notifySuccess('Formulaire soumis avec succès à OnBase !');
    closeDialog();
  } catch (error) {
    console.error('Erreur lors de l\'envoi à OnBase:', error);
    notifyError('Une erreur est survenue lors de la soumission. Veuillez réessayer.');
  }
};

const closeDialog = () => {
  open.value = false;
  emit('close');
};
</script>

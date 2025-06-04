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
        <div class="q-gutter-md justify-center row">
          <q-select
            v-model="form.origineImmatriculation"
            :options="['Spontanee', 'Suite a controle', 'Immatriculation d office']"
            :label="$t('input.origineImmatriculation')"
            outlined
            dense
            input-debounce="0"
            fill-input
            :rules="[required]"
            class="col-md-5 col-xs-12 col-sm-12"
          >
            <template v-slot:label>
              {{ $t('input.origineImmatriculation') }}
              <span
                class="q-px-sm bg-red text-white text-italic rounded-borders"
                style="font-size: 10px"
                >{{ $t('input.requis') }}</span
              >
            </template>
          </q-select>
          <q-select
            v-model="form.origineDossier"
            :options="['Centre Formalite Creation Entreprise(C.F.C.E)', 'AUTRE']"
            :label="$t('input.origineDossier')"
            outlined
            dense
            input-debounce="0"
            fill-input
            :rules="[required]"
            class="col-md-5 col-xs-12 col-sm-12"
          >
            <template v-slot:label>
              {{ $t('input.origineDossier') }}
              <span
                class="q-px-sm bg-red text-white text-italic rounded-borders"
                style="font-size: 10px"
                >{{ $t('input.requis') }}</span
              >
            </template>
          </q-select>
          <q-field
            label-slot
            filled
            dense
            :rules="[required, fileSizeRule]"
            class="col-md-5 col-xs-12 col-sm-12"
          >
            <template v-slot:label>
              {{ $t('input.listeTravailleurs') }}
              <span
                class="q-px-sm bg-red text-white text-italic rounded-borders"
                style="font-size: 10px"
              >
                {{ $t('input.requis') }}
              </span>
            </template>

            <template v-slot:control>
              <input
                ref="fileInput"
                type="file"
                @change="onFileSelected"
                accept=".pdf,.jpg,.jpeg,.png,.xlsx"
                class="q-field__input"
              />
            </template>
          </q-field>
        </div>
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" @submit.prevent="submitForm">
          <q-stepper v-model="step" :vertical="$q.screen.lt.sm" color="primary" animated header-nav>
            <!-- Etape 1 : Informations sur l'employeur -->
            <q-step :name="1" :title="$t('immep.step1')" icon="business" :done="step > 1" class="">
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.raisonSociale"
                  :label="$t('input.raisonSociale')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @input="form.raisonSociale = form.raisonSociale.toUpperCase()"
                >
                  <template v-slot:label>
                    {{ $t('input.raisonSociale') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.nomCommercial"
                  :label="$t('input.nomCommercial')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @input="form.nomCommercial = form.nomCommercial.toUpperCase()"
                >
                  <template v-slot:label>
                    {{ $t('input.nomCommercial') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.sigle"
                  :label="$t('input.sigle')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @input="form.sigle = form.sigle.toUpperCase()"
                />
                <q-input
                  v-model="form.autreContact"
                  :label="$t('input.autreContact')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @input="form.autreContact = form.autreContact.toUpperCase()"
                />
                <q-input
                  v-model="form.dateOuverture"
                  :label="$t('input.dateOuverture')"
                  outlined
                  dense
                  class="col-md-4 col-xs-12 col-sm-12"
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateOuverture"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          locale="fr"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.dateOuverture') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.dateCreation"
                  :label="$t('input.dateCreation')"
                  outlined
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateCreation"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :locale="locale"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.dateEmbauche"
                  :label="$t('input.dateEmbauche')"
                  outlined
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateEmbauche"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :locale="locale"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="form.numRegistreCommerce"
                  :label="$t('input.numRegistreCommerce')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[
                    (val) => !val || regexPatterns.regComm.test(val) || '(ex: RC/YAO/2020/B/0002)',
                  ]"
                  style="text-transform: uppercase"
                  @input="form.numRegistreCommerce = form.numRegistreCommerce.toUpperCase()"
                />
                <q-input
                  v-model="form.numContribuable"
                  :label="$t('input.numContribuable')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[
                    (val) =>
                      !val ||
                      regexPatterns.numContr.test(val) ||
                      'Format invalide (ex: P123456789321M)',
                  ]"
                  style="text-transform: uppercase"
                  @input="form.numContribuable = form.numContribuable.toUpperCase()"
                />
                <q-input
                  @update:model-value="
                    (val) => {
                      formFile.registreCommerce = val[0]
                    }
                  "
                  filled
                  dense
                  type="file"
                  :rules="[fileSizeRule]"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :hint="$t('input.registreCommerce')"
                  class="col-md-5 col-xs-12 col-sm-12"
                />
                <q-input
                  @update:model-value="
                    (val) => {
                      formFile.autorisationOuverture = val[0]
                    }
                  "
                  filled
                  dense
                  type="file"
                  :hint="$t('input.autorisationOuverture')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[fileSizeRule]"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <q-input
                  @update:model-value="
                    (val) => {
                      formFile.carteContribuable = val[0]
                    }
                  "
                  filled
                  dense
                  type="file"
                  :hint="$t('input.carteContribuable')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[fileSizeRule]"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <q-input
                  @update:model-value="
                    (val) => {
                      formFile.statuts = val[0]
                    }
                  "
                  filled
                  dense
                  type="file"
                  :hint="$t('input.statuts')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[fileSizeRule]"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <q-checkbox
                  name="is_succursale"
                  v-model="form.isSuccursale"
                  :label="$t('input.isSuccursale')"
                  class="col-md-5 col-xs-12 col-sm-12"
                />
                <q-input
                  v-model="form.matriculeSiege"
                  v-if="form.isSuccursale"
                  :label="$t('input.matriculeSiege')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @input="form.matriculeSiege = form.matriculeSiege.toUpperCase()"
                  outlined
                  dense
                  :rules="[
                    required,
                    (val) =>
                      regexPatterns.numEmpl1.test(val) ||
                      regexPatterns.numEmpl2.test(val) ||
                      '(ex: 321-1234567-A ou 321-1234567-000-M)',
                  ]"
                >
                  <template v-slot:label>
                    {{ $t('input.matriculeSiege') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.nomCommercialSiege"
                  v-if="form.isSuccursale"
                  :label="$t('input.nomCommercialSiege')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @input="form.nomCommercialSiege = form.nomCommercialSiege.toUpperCase()"
                >
                  <template v-slot:label>
                    {{ $t('input.nomCommercialSiege') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.raisonSocialeSiege"
                  v-if="form.isSuccursale"
                  :label="$t('input.raisonSocialeSiege')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  outlined
                  dense
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @input="form.raisonSocialeSiege = form.raisonSocialeSiege.toUpperCase()"
                >
                  <template v-slot:label>
                    {{ $t('input.raisonSocialeSiege') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(2)" color="primary" :label="$t('form.next')" />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 2 : Coordonnées de l'entreprise -->
            <q-step :name="2" :title="$t('immep.step2')" icon="location_on" :done="step > 2">
              <div class="q-gutter-md justify-center row">
                <q-select
                  v-model="form.arrondissement"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  :label="$t('input.arrondissement')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                  class="col-md-3 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.arrondissement') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  v-model="form.adresse"
                  :label="$t('input.adresse')"
                  outlined
                  dense
                  class="col-md-7 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @input="form.adresse = form.adresse.toUpperCase()"
                >
                  <template v-slot:label>
                    {{ $t('input.adresse') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.quartier"
                  :label="$t('input.quartier')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @input="form.quartier = form.quartier.toUpperCase()"
                >
                  <template v-slot:label>
                    {{ $t('input.quartier') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.lieuDit"
                  :label="$t('input.lieuDit')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @input="form.lieuDit = form.lieuDit.toUpperCase()"
                />
                <q-input
                  v-model="form.boitePostale"
                  :label="$t('input.boitePostale')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @input="form.boitePostale = form.boitePostale.toUpperCase()"
                />
                <q-input
                  v-model="form.numLogement"
                  :label="$t('input.numLogement')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @input="form.numLogement = form.numLogement.toUpperCase()"
                />
                <q-input
                  v-model="form.email"
                  :label="$t('input.email')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  type="email"
                  :rules="[
                    required,
                    (val) => regexPatterns.email.test(val) || '(ex: adresse@email.com)',
                  ]"
                >
                  <template v-slot:label>
                    {{ $t('input.email') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.telephone"
                  :label="$t('input.telephone')"
                  outlined
                  prefix="+237"
                  type="tel"
                  mask="### ### ###"
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('input.telephone') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  @update:model-value="
                    (val) => {
                      formFile.planLocalisation = val[0]
                    }
                  "
                  filled
                  dense
                  label=""
                  type="file"
                  :rules="[required, fileSizeRule]"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :hint="$t('input.planLocalisation')"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.planLocalisation') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
              </div>
              <q-stepper-navigation>
                <q-btn @click="goToNextStep(3)" color="primary" :label="$t('form.next')" />
                <q-btn
                  flat
                  @click="step = 1"
                  color="primary"
                  :label="$t('form.previous')"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 3 : Données administratives et fiscales -->
            <q-step :name="3" :title="$t('immep.step3')" icon="location_on" :done="step > 3">
              <div class="q-gutter-md justify-center row">
                <q-select
                  v-model="form.formeJuridique"
                  :options="formeJuridique"
                  option-label="LIBELLE_NATUREJUR"
                  :label="$t('input.formeJuridique')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterFormeJuridique"
                  :rules="[required]"
                  class="col-md-7 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.formeJuridique') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  v-model="form.nombreTravailleurs"
                  :label="$t('input.nombreTravailleurs')"
                  outlined
                  type="number"
                  min="1 "
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('input.nombreTravailleurs') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-select
                  v-model="form.activiteEconomique"
                  :options="activites"
                  v-model-options="{ trackBy: 'LIBELLE_SECT_ACTIVITE' }"
                  option-label="LIBELLE_SECT_ACTIVITE"
                  :label="$t('input.activiteEconomique')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterActivites"
                  :rules="[required]"
                  class="col-md-6 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.activiteEconomique') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  v-model="form.activiteEconomique.REGIME_CNPS"
                  :label="$t('input.regimeCNPS')"
                  outlined
                  readonly
                  dense
                  class="col-md-2 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-input
                  v-model="form.activiteEconomique.DESCRIPTION"
                  :label="$t('input.groupeRisque')"
                  outlined
                  readonly
                  dense
                  class="col-md-2 col-xs-12 col-sm-12"
                  :rules="[required]"
                />
                <q-select
                  v-model="form.centreImpots"
                  :options="impots"
                  option-label="ABREVIATION"
                  :label="$t('input.centreImpots')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterImpots"
                  @update:model-value="
                    (val) => (form.centreCNPS = findCentreCNPSByCentreImpots(val))
                  "
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.centreImpots') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-select
                  v-model="form.centreCNPS"
                  :options="centres"
                  option-label="LIB_CENTRE"
                  :label="$t('input.centreCNPS')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterCentreCNPS"
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.centreCNPS') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-input
                  @update:model-value="
                    (val) => {
                      formFile.listeTravailleurs = val[0]
                    }
                  "
                  filled
                  dense
                  type="file"
                  label=""
                  :rules="[required, fileSizeRule]"
                  accept=".pdf,.jpg,.jpeg,.png,.Xlsx"
                  :hint="$t('input.listeTravailleurs')"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.raisonSocialeSiege') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  @update:model-value="
                    (val) => {
                      formFile.attestationImmatriculation = val[0]
                    }
                  "
                  filled
                  dense
                  type="file"
                  :rules="[fileSizeRule]"
                  label=""
                  accept=".pdf,.jpg,.jpeg,.png"
                  :hint="$t('input.attestationImmatriculation')"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.raisonSocialeSiege') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
              </div>
              <q-stepper-navigation>
                <q-btn @click="goToNextStep(4)" color="primary" :label="$t('form.next')" />
                <q-btn
                  flat
                  @click="step = 2"
                  color="primary"
                  :label="$t('form.previous')"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 4 : Informations du promoteur -->
            <q-step :name="4" :title="$t('immep.step4')" icon="folder" :done="step > 4">
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.nomResponsable"
                  :label="$t('input.nomResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @input="form.nomResponsable = form.nomResponsable.toUpperCase()"
                >
                  <template v-slot:label>
                    {{ $t('input.nomResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.prenomResponsable"
                  :label="$t('input.prenomResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @input="form.prenomResponsable = form.prenomResponsable.toUpperCase()"
                />
                <q-input
                  v-model="form.dateNaissanceResponsable"
                  :label="$t('input.dateNaissanceResponsable')"
                  outlined
                  dense
                  class="col-md-3 col-xs-12 col-sm-12"
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateNaissanceResponsable"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :locale="locale"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.dateNaissanceResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.lieuNaissanceResponsable"
                  :label="$t('input.lieuNaissanceResponsable')"
                  outlined
                  dense
                  class="col-md-7 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @input="
                    form.lieuNaissanceResponsable = form.lieuNaissanceResponsable.toUpperCase()
                  "
                >
                  <template v-slot:label>
                    {{ $t('input.lieuNaissanceResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-select
                  v-model="form.arrondissementNaissanceResponsable"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  :label="$t('input.arrondissementNaissanceResponsable')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  :rules="[required]"
                  class="col-md-4 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.arrondissementNaissanceResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-select
                  v-model="form.sexeResponsable"
                  :options="['FEMININ', 'MASCULIN']"
                  :label="$t('input.sexeResponsable')"
                  outlined
                  dense
                  input-debounce="0"
                  fill-input
                  :rules="[required]"
                  class="col-md-3 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.sexeResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
                <q-select
                  v-model="form.nationaliteResponsable"
                  :options="pays"
                  option-label="nationalite"
                  :label="$t('input.nationaliteResponsable')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPays"
                  :rules="[required]"
                  class="col-md-3 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.nationaliteResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>

                <q-input
                  v-model="form.adresseResponsable"
                  :label="$t('input.adresseResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @input="form.adresseResponsable = form.adresseResponsable.toUpperCase()"
                >
                  <template v-slot:label>
                    {{ $t('input.adresseResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.boitePostaleResponsable"
                  :label="$t('input.boitePostaleResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                  style="text-transform: uppercase"
                  @input="form.boitePostaleResponsable = form.boitePostaleResponsable.toUpperCase()"
                />
                <q-input
                  v-model="form.telephoneResponsable"
                  :label="$t('input.telephoneResponsable')"
                  outlined
                  type="tel"
                  mask="### ### ###"
                  prefix="+237"
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                >
                  <template v-slot:label>
                    {{ $t('input.telephoneResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.emailResponsable"
                  :label="$t('input.emailResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  type="email"
                  :rules="[
                    required,
                    (val) => regexPatterns.email.test(val) || '(ex: adresse@email.com)',
                  ]"
                >
                  <template v-slot:label>
                    {{ $t('input.emailResponsable') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-select
                  v-model="form.pieceIdentiteResponsable"
                  :options="pieces"
                  option-label="LIBELLE"
                  :label="$t('input.pieceIdentiteResponsable')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterPieces"
                  class="col-md-5 col-xs-12 col-sm-12"
                />
                <q-input
                  v-model="form.numPieceIdentiteResponsable"
                  :label="$t('input.numPieceIdentiteResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @input="
                    form.numPieceIdentiteResponsable =
                      form.numPieceIdentiteResponsable.toUpperCase()
                  "
                />
                <q-input
                  v-model="form.dateDelivrancePieceIdentiteResponsable"
                  :label="$t('input.dateDelivrancePieceIdentiteResponsable')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateDelivrancePieceIdentitePromoteur"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :locale="locale"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-select
                  v-model="form.lieuDelivrancePieceIdentitePromoteur"
                  :options="arrondissements"
                  option-label="NOM_ARROND"
                  :label="$t('input.lieuDelivrancePieceIdentitePromoteur')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  @filter="filterArrondissement"
                  class="col-md-5 col-xs-12 col-sm-12 q-mb-sm"
                />
              </div>

              <q-stepper-navigation>
                <q-btn @click="step = 5" color="primary" :label="$t('form.next')" />
                <q-btn
                  flat
                  @click="step = 3"
                  color="primary"
                  :label="$t('form.previous')"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 5 : Documents à fournir -->
            <q-step :name="5" :title="$t('immep.step5')" icon="person" :done="step > 5">
              <div class="q-gutter-md justify-center row">
                <q-input
                  @update:model-value="
                    (val) => {
                      formFile.contratBail = val[0]
                    }
                  "
                  filled
                  dense
                  type="file"
                  :rules="[fileSizeRule]"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :hint="$t('input.contratBail')"
                  class="col-md-5 col-xs-12 col-sm-12"
                />
                <q-input
                  @update:model-value="
                    (val) => {
                      formFile.patente = val[0]
                    }
                  "
                  filled
                  dense
                  type="file"
                  :rules="[fileSizeRule]"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :hint="$t('input.patente')"
                  class="col-md-5 col-xs-12 col-sm-12"
                />
                <q-input
                  @update:model-value="
                    (val) => {
                      formFile.impotLiberatoire = val[0]
                    }
                  "
                  filled
                  dense
                  type="file"
                  :rules="[fileSizeRule]"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :hint="$t('input.impotLiberatoire')"
                  class="col-md-5 col-xs-12 col-sm-12"
                />
              </div>

              <q-stepper-navigation>
                <q-btn type="submit" color="primary" :label="$t('form.submit')" />
                <q-btn
                  flat
                  @click="step = 4"
                  color="primary"
                  :label="$t('form.previous')"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('form.cancel')" v-close-popup color="primary" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { useNotify } from './useNotify.js'
import { arrondissements as rawArrondissements } from '../data/Arrondissements.js'
import { activites as rawActivites } from '../data/Activites.js'
import { centres as rawCentres } from '../data/Centres.js'
import { formeJuridique as rawFormeJuridique } from '../data/FormeJuridique.js'
import { impots as rawImpots } from '../data/Impots.js'
import { pays as rawPays } from '../data/Pays.js'
import { pieces as rawPieces } from '../data/Pieces.js'
import { regexPatterns } from '../js/regex.js'
import { useI18n } from 'vue-i18n'

defineProps({
  service: Object,
})

const { locale } = useI18n()
const emit = defineEmits(['close'])

const { notifyError, notifySuccess } = useNotify()

const open = ref(true)
const step = ref(1)
const formRef = ref(null)
const displayDate = ref('')

const arrondissements = ref([...rawArrondissements])
const activites = ref([...rawActivites])
const centres = ref([...rawCentres])
const formeJuridique = ref([...rawFormeJuridique])
const impots = ref([...rawImpots])
const pays = ref([...rawPays])
const pieces = ref([...rawPieces])

const form = ref({
  raisonSociale: '',
  nomCommercial: '',
  sigle: '',
  adresse: '',
  quartier: '',
  email: '',
  telephone: '',
  nomResponsable: '',
  prenomResponsable: '',
  centreImpots: '',
  centreCNPS: '',
  origineImmatriculation: '',
  origineDossier: '',
  formeJuridique: '',
  nombreTravailleurs: '',
  activiteEconomique: '',
  regimeCNPS: '',
  groupeRisque: '',
  arrondissement: '',
  lieuDit: '',
  boitePostale: '',
  numLogement: '',
  autreContact: '',
  dateOuverture: '',
  dateCreation: '',
  dateEmbauche: '',
  numRegistreCommerce: '',
  numIdentifiantUnique: '',
  isSuccursale: false,
  nomCommercialSiege: '',
  raisonSocialeSiege: '',
  matriculeSiege: '',
})

const formFile = ref({
  registreCommerce: ref(null),
  autorisationOuverture: ref(null),
  attestationImmatriculation: ref(null),
  planLocalisation: ref(null),
  contratBail: ref(null),
  listeTravailleurs: ref(null),
  patente: ref(null),
  impotLiberatoire: ref(null),
  statuts: ref(null),
  carteContribuable: ref(null),
})

const optionsDn = (date) => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = ('0' + (today.getMonth() + 1)).slice(-2)
  const dd = ('0' + today.getDate()).slice(-2)
  const todayStr = `${yyyy}/${mm}/${dd}`

  return date <= todayStr
}

const required = (val) => !!val || 'Ce champ est requis / This field is required'

const goToNextStep = async (nextStep) => {
  if (nextStep === 2 && (!form.value.origineDossier || !form.value.origineImmatriculation)) {
    notifyError(
      'Veuillez selectionner les origines du dossier tout en haut du formulaire / Please choose the file origins at the top section of the form.',
    )
    return
  }
  const valid = await formRef.value.validate()
  if (valid) {
    step.value = nextStep
  } else {
    notifyError('Veuillez remplir tous les champs requis / Please fill in all required fields.')
  }
}

/* const onRejected = (rejectedEntries) => {
  // Notify plugin needs to be installed
  // https://v2.quasar.dev/quasar-plugins/notify#Installation
  notifyError(
    `Les fichiers suivants n'ont pas passé les contraintes de validation : ${rejectedEntries
      .map((entry) => entry.name)
      .join(', ')}`,
  )
} */

const fileSizeRule = (val) => {
  if (!val || val.length === 0) return true // Ne valide pas si rien n'est sélectionné
  return val[0].size <= 3 * 1024 * 1024 || 'Fichier trop volumineux (max 3 Mo)'
}

const findCentreCNPSByCentreImpots = (selectedCentreImpots) => {
  if (!selectedCentreImpots || !selectedCentreImpots.CODE_CENTRECNPS) return null

  return (
    rawCentres.find((cnps) => cnps.CODE_CENTRE === selectedCentreImpots.CODE_CENTRECNPS) || null
  )
}

watch(
  () => form.value.centreImpots,
  (newValue) => {
    form.value.centreCNPS = findCentreCNPSByCentreImpots(newValue)
  },
)

const submitForm = async () => {
  const valid = await formRef.value.validate()
  if (!valid) {
    notifyError('Veuillez corriger les erreurs du formulaire.')
    return
  }
  console.log('Formulaire soumis:', form.value)
  notifySuccess('Formulaire soumis avec succès.')
  open.value = false
  emit('close')
  // Ajouter ici l'appel à l'API si nécessaire
}

const filterArrondissement = (val, update) => {
  if (val === '') {
    update(() => {
      arrondissements.value = [...rawArrondissements]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    arrondissements.value = rawArrondissements.filter((item) =>
      item.NOM_ARROND.toLowerCase().includes(needle),
    )
  })
}

const filterActivites = (val, update) => {
  if (val === '') {
    update(() => {
      activites.value = [...rawActivites]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    activites.value = rawActivites.filter((item) =>
      item.LIBELLE_SECT_ACTIVITE.toLowerCase().includes(needle),
    )
  })
}

const filterCentreCNPS = (val, update) => {
  if (val === '') {
    update(() => {
      centres.value = [...rawCentres]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    centres.value = rawCentres.filter((item) => item.LIB_CENTRE.toLowerCase().includes(needle))
  })
}

const filterFormeJuridique = (val, update) => {
  if (val === '') {
    update(() => {
      formeJuridique.value = [...rawFormeJuridique]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    formeJuridique.value = rawFormeJuridique.filter((item) =>
      item.LIBELLE_NATUREJUR.toLowerCase().includes(needle),
    )
  })
}

const filterImpots = (val, update) => {
  if (val === '') {
    update(() => {
      impots.value = [...rawImpots]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    impots.value = rawImpots.filter((item) => item.ABREVIATION.toLowerCase().includes(needle))
  })
}

const filterPays = (val, update) => {
  if (val === '') {
    update(() => {
      pays.value = [...rawPays]
    })
    return
  }

  const needle = val.toLowerCase()

  update(() => {
    pays.value = rawPays.filter((item) => item.nationalite.toLowerCase().includes(needle))
  })
}
const filterPieces = (val, update) => {
  if (val === '') {
    update(() => {
      pieces.value = [...rawPieces]
    })
    return
  }
  const needle = val.toLowerCase()
  update(() => {
    pieces.value = rawPieces.filter((item) => item.LIBELLE.toLowerCase().includes(needle))
  })
}

const closeDialog = () => {
  open.value = false
  emit('close')
}

// ✅ Convertir JJ/MM/AAAA → YYYY-MM-DD
/* function updateDateFromDisplay(val) {
  const [day, month, year] = val.split('/')
  if (day && month && year) {
    form.value.dateCreation = `${year}-${month}-${day}`
  } else {
    form.value.dateCreation = null
  }
} */

// ✅ Convertir YYYY-MM-DD → JJ/MM/AAAA
function updateDisplayFromDate(val) {
  if (val) {
    const [year, month, day] = val.split('-')
    displayDate.value = `${day}/${month}/${year}`
  } else {
    displayDate.value = ''
  }
}

// ✅ Synchroniser displayDate si dateOuverture est défini initialement
watch(
  () => form.value.dateOuverture,
  (val) => updateDisplayFromDate(val, 'dateOuverture'),
  { immediate: true },
)

watch(
  () => form.value.dateCreation,
  (val) => updateDisplayFromDate(val, 'dateCreation'),
  { immediate: true },
)

watch(
  () => form.value.dateEmbauche,
  (val) => updateDisplayFromDate(val, 'dateEmbauche'),
  { immediate: true },
)

watch(
  () => form.value.dateNaissanceResponsable,
  (val) => updateDisplayFromDate(val, 'dateNaissanceResponsable'),
  { immediate: true },
)

watch(
  () => form.value.dateDelivrancePieceIdentitePromoteur,
  (val) => updateDisplayFromDate(val, 'dateDelivrancePieceIdentitePromoteur'),
  { immediate: true },
)
</script>

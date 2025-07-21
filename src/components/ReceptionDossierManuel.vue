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
        <q-form ref="formRef" @submit.prevent="dialValidation = true">
          <q-stepper
            v-model="step"
            :vertical="$q.screen.lt.sm"
            color="primary"
            :inactive-color="maxStep >= step ? 'secondary' : ''"
            animated
            header-nav
          >
            <!-- Etape 1 : Informations de l'employeur -->
            <q-step
              :name="1"
              :title="$t('form1.step1')"
              icon="person"
              :done="step > 1"
              :disable="!isStepAllowed(1)"
            >
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.today"
                  label="Date du jour"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  readonly
                />
                <q-select
                  v-model="form.objet"
                  :options="objetsD"
                  :label="$t('input.objet')"
                  outlined
                  dense
                  input-debounce="0"
                  fill-input
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.objet') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>

                <q-select
                  v-model="form.circuit"
                  :options="['MANUEL']"
                  label=""
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.circuit') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>

                <q-input
                  v-model="form.date_depot"
                  :label="$t('input.date_depot')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.date_depot"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.date_depot') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>

                <q-input
                  v-model="form.numassu"
                  :label="$t('input.numassu')"
                  class="col-md-5 col-xs-12 col-sm-12"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.numassu = val.toUpperCase())"
                  @blur="rechercherAssure"
                  outlined
                  dense
                  :rules="[
                    required,
                    (val) =>
                      regexPatterns.numAssu1.test(val) ||
                      regexPatterns.numAssu2.test(val) ||
                      '(ex: 321-1234567-0 ou 321-1234567-000-0)',
                  ]"
                >
                  <template v-slot:label>
                    {{ $t('input.numassu') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.nomcompletass"
                  :label="$t('input.nomcompletass')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  readonly
                  @update:model-value="(val) => (form.nomcompletass = val.toUpperCase())"
                />
                <q-input
                  v-model="form.date_naiss"
                  :label="$t('input.date_naiss')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  readonly
                />
                <q-input
                  v-model="form.centre_ges"
                  :label="$t('input.centre_ges')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  readonly
                  @update:model-value="(val) => (form.centre_ges = val.toUpperCase())"
                />
                <q-select
                  v-model="form.typeimmas"
                  :options="['OBLIGATOIRE', 'VOLONTAIRE']"
                  label=""
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  map-options
                  :rules="[required]"
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.typeimmas') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-select>
              </div>

              <q-stepper-navigation>
                <q-btn @click="goToNextStep(2)" color="primary" :label="$t('form.next')" />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 2 : Coordonnées de l'employeur -->
            <q-step
              :name="2"
              :title="$t('form1.step2')"
              icon="person"
              :done="step > 2"
              :disable="!isStepAllowed(2)"
            >
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.nomcomplet"
                  :label="$t('input.nomcomplet')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.nomcomplet = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.nomcomplet') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.nomtiers"
                  :label="$t('input.nomtiers')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.nomtiers = val.toUpperCase())"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.nomtiers') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.email"
                  label=""
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  type="email"
                  :rules="[
                    required,
                    (val) => regexPatterns.email.test(val) || '(ex: adresse@email.com)',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.emailc') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.adresse"
                  :label="$t('input.adresse')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.adresse = val.toUpperCase())"
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
                  v-model="form.telephone"
                  label=""
                  outlined
                  type="tel"
                  prefix="+237"
                  maxlength="9"
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[
                    required,
                    (val) => regexPatterns.telephone.test(val) || $t('input.invalidPhone'),
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                  <template v-slot:label>
                    {{ $t('input.mobile') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <div class="q-pa-md q-gutter-sm col-md-5 col-xs-12 col-sm-12">
                  <div class="q-gutter-sm text-bold" style="text-transform: uppercase">
                    {{ $t('input.revision') }}
                    <q-radio
                      dense
                      v-model="form.revision"
                      color="red"
                      :val="'NON'"
                      :label="$t('input.non')"
                    />
                    <q-radio
                      dense
                      v-model="form.revision"
                      color="primary"
                      :val="'OUI'"
                      :label="$t('input.oui')"
                    />
                  </div>
                </div>
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

            <!-- Etape 3 : Informations sur l'entreprise -->
            <q-step
              :name="3"
              :title="$t('form1.step3')"
              icon="business"
              :done="step > 3"
              :disable="!isStepAllowed(3)"
            >
              <div class="q-gutter-md justify-center row">
                <q-input
                  v-model="form.datedemande"
                  :label="$t('input.datedemande')"
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
                          v-model="form.datedemande"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.datedemande') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.datecessation"
                  :label="$t('input.datecessation')"
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
                          v-model="form.datecessation"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.datecessation') }}
                  </template>
                </q-input>
                <q-input
                  v-model="form.datedeces"
                  :label="$t('input.datedeces')"
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
                          v-model="form.datedeces"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.datedeces') }}
                  </template>
                </q-input>
                <q-input
                  v-model="form.dateconstatinvalid"
                  :label="$t('input.dateconstatinvalid')"
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
                          v-model="form.dateconstatinvalid"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.dateconstatinvalid') }}
                  </template>
                </q-input>
                <q-input
                  v-model="form.dateconstatincapacite"
                  :label="$t('input.dateconstatincapacite')"
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
                          v-model="form.dateconstatincapacite"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.dateconstatincapacite') }}
                  </template>
                </q-input>
                <q-input
                  v-model="form.datedemandeassuredecede"
                  :label="$t('input.datedemandeassuredecede')"
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
                          v-model="form.datedemandeassuredecede"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.datedemandeassuredecede') }}
                  </template>
                </q-input>
                <q-select
                  v-model="form.natureprestation"
                  :options="['NATURE 1', 'NATURE 2']"
                  :label="$t('input.natureprestation')"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  emit-value
                  class="col-md-5 col-xs-12 col-sm-12"
                >
                  <template v-slot:label>
                    {{ $t('input.natureprestation') }}
                  </template>
                </q-select>
                <q-input
                  v-model="form.tauxinvalide"
                  :label="$t('input.tauxinvalide')"
                  outlined
                  dense
                  type="number"
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  style="text-transform: uppercase"
                  @update:model-value="(val) => (form.tauxinvalide = val.toUpperCase())"
                >
                  <template v-slot:label>
                    {{ $t('input.tauxinvalide') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.dateaccident"
                  :label="$t('input.dateaccident')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.dateaccident"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.dateaccident') }}
                    <span
                      class="q-px-sm bg-red text-white text-italic rounded-borders"
                      style="font-size: 10px"
                      >{{ $t('input.requis') }}</span
                    >
                  </template>
                </q-input>
                <q-input
                  v-model="form.datedeclaration"
                  :label="$t('input.datedeclaration')"
                  outlined
                  dense
                  class="col-md-5 col-xs-12 col-sm-12"
                  :rules="[required]"
                  :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                  :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="form.datedeclaration"
                          :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                          :options="optionsDn"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:label>
                    {{ $t('input.datedeclaration') }}
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
                  @click="step = 1"
                  color="primary"
                  :label="$t('form.previous')"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>

            <!-- Etape 4 : Recap -->
            <q-step
              :name="4"
              :title="$t('input.recap')"
              icon="list"
              :done="step > 4"
              :disable="!isStepAllowed(4)"
            >
              <div class="q-pa-md" ref="recapContent">
                <q-card flat bordered class="q-pa-md" style="text-transform: uppercase">
                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('form1.step1') }}</div>
                    <q-separator class="q-my-sm" />
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.objet') }} : </strong> {{ form.objet }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.numassu') }} : </strong> {{ form.numassu }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.nomcompletass') }} : </strong>
                      {{ form.nomcompletass }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.date_naiss') }} : </strong>
                      {{ form.date_naiss }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.centre_ges') }} : </strong>
                      {{ form.centre_ges }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.typeimmas') }} : </strong> {{ form.typeimmas }}
                    </div>
                  </q-card-section>

                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('form1.step2') }}</div>
                    <q-separator class="q-my-sm" />
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.nomcomplet') }} : </strong> {{ form.nomcomplet }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.nomtiers') }} : </strong>
                      {{ form.nomtiers }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.email') }} : </strong> {{ form.email }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.mobile') }} : </strong> +237 {{ form.telephone }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.adresse') }} : </strong> {{ form.adresse }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.today') }} : </strong>
                      {{ form.today }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.circuit') }} : </strong>
                      {{ form.circuit }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.revision') }} : </strong>
                      {{ form.revision }}
                    </div>
                  </q-card-section>

                  <q-card-section class="q-gutter-md justify-center row">
                    <div class="text-h6 col-12">{{ $t('form1.step3') }}</div>
                    <q-separator class="q-my-sm" />
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.datedemande') }} : </strong>
                      {{ form.datedemande }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.datecessation') }} : </strong> {{ form.datecessation }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.datedeces') }} : </strong>
                      {{ form.datedeces }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.dateconstatinvalid') }} : </strong>
                      {{ form.dateconstatinvalid }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.dateconstatincapacite') }} : </strong>
                      {{ form.dateconstatincapacite }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.datedemandeassuredecede') }} : </strong>
                      {{ form.datedemandeassuredecede }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.datedemandeassuredecede') }} : </strong>
                      {{ form.datedemandeassuredecede }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.natureprestation') }} : </strong>
                      {{ form.natureprestation }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.tauxinvalide') }} : </strong>
                      {{ form.tauxinvalide }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.dateaccident') }} : </strong>
                      {{ form.dateaccident }}
                    </div>
                    <div class="col-md-5 col-xs-12 col-sm-12">
                      <strong>{{ $t('input.datedeclaration') }} : </strong>
                      {{ form.datedeclaration }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <q-stepper-navigation>
                <q-btn type="submit" color="primary" :label="$t('form.submit')" />
                <q-btn
                  flat
                  @click="step = 3"
                  color="primary"
                  :label="$t('form.previous')"
                  class="q-ml-sm"
                />
                <q-btn
                  flat
                  color="secondary"
                  icon="picture_as_pdf"
                  label="PDF"
                  class="q-ml-sm"
                  @click="downloadPDF"
                />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('form.cancel')" v-close-popup color="red" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="pdfDialog" maximized>
    <q-card>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Aperçu PDF</div>
        <q-btn icon="close" flat round dense @click="pdfDialog = false" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <iframe :src="pdfBlobUrl" width="100%" height="600px" style="border: none"></iframe>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn color="primary" icon="download" label="Télécharger" @click="downloadPDF" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialValidation" persistent>
    <q-card>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">{{ $t('input.valid') }}</div>
        <q-btn icon="close" flat round dense @click="dialValidation = false" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <div class="q-pa-md q-gutter-sm">
          <div class="q-gutter-sm text-bold" style="text-transform: uppercase">
            {{ $t('input.validtion') }} <br />
            <q-radio
              dense
              v-model="form.validation"
              color="red"
              :val="false"
              :label="$t('input.no')"
            />
            <q-radio
              dense
              v-model="form.validation"
              color="primary"
              :val="true"
              :label="$t('input.yes')"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn color="primary" icon="send" :label="$t('input.confirm')" @click="submitForm" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="spinner" persistent>
    <div class="row items-center justify-center q-pa-md">
      <CustomSpinner :show="spinner" />
    </div>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted } from 'vue'
import { useNotify } from './useNotify.js'
import { regexPatterns } from '../js/regex.js'
import { useI18n } from 'vue-i18n'
import html2pdf from 'html2pdf.js'
import { objets as rawObjets } from 'src/data/ObjectDossier.js'
import CustomSpinner from 'src/components/CustomSpinner.vue'

defineProps({
  service: Object,
})

const { locale } = useI18n()
const emit = defineEmits(['close'])

const { notifyError, notifySuccess, notifyInfo } = useNotify()

const open = ref(true)
const step = ref(1)
const maxStep = ref(1)
const formRef = ref(null)
const displayDate = ref('')
const spinner = ref(false)
const pdfDialog = ref(false)
const pdfBlobUrl = ref(null)
const recapContent = ref()
const dialValidation = ref(false)
const objetsD = ref([...rawObjets])

const form = ref({
  LIEU_PIECEC: '',
  LOCALITE_NAISS_PERSEMPL: '',
  LieuNaissPe: '',
  ADRESSE_EMPL: '',
  NATIONALITEC: '',
  NOM_PERSEMPL: '',
  CODE_CENTREIMPOTC: '',
  CODE_CENTRECNPSC: '',
  CAUSE_IMMA: '',
  CIRCUIT_DOSSIER: '',
  NOM_QUARTIER: '',
  NBRE_EMPL: '',
  NUM_PIECE: '',
  PROFESSION: '',
  SEXE_PERSEMPL: '',
  TEL: '',
  TEL_PERSEMPL: '',
  typepiece: '',
  num_case: '',
  autreContact: '',
  DATE_DEB_SERVICE: '',
  DATE_EFFET: '',
  isSuccursale: false,
  CODE_ARRONDC: '',
  validation: false,
  today: new Date(),
})

const formFile = ref({
  IDPLANLOCAL: ref(null),
  IDLISTTRAV: ref(null),
  attestationImmatriculation: ref(null),
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
  // const valid = await formRef.value.validate()
  // if (valid) {
  step.value = nextStep
  if (nextStep > maxStep.value) {
    maxStep.value = nextStep
  }
  /* } else {
    notifyError('Veuillez remplir tous les champs requis / Please fill in all required fields.')
  } */
}

const submitForm = async () => {
  const valid = await formRef.value.validate()
  if (!valid) {
    notifyError('Veuillez corriger les erreurs du formulaire.')
    return
  }
  spinner.value = true
  notifyInfo('Soumission des données à Energizer.')
  console.log('Formulaire soumis:', form.value)
  setTimeout(() => {
    notifySuccess('Formulaire de données soumis avec succès.')
    submitFormFile()
  }, 3000)
  // open.value = false
  // emit('close')
  // Ajouter ici l'appel à l'API si nécessaire
}

const submitFormFile = async () => {
  notifyInfo('Soumission des documents à la GED.')
  console.log('Fichiers soumis:', formFile.value)
  setTimeout(() => {
    notifySuccess('Formulaire de fichier soumis avec succès.')
    // generatePDFPreview()
    spinner.value = false
    open.value = false
    emit('close')
  }, 5000)
  // Ajouter ici l'appel à l'API si nécessaire
}

const isStepAllowed = (stepName) => {
  return stepName <= maxStep.value // Seules les étapes passées ou en cours sont cliquables
}

/* const generatePDFPreview = async () => {
  const element = recapContent.value

  const opt = {
    margin: 0.5,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  }

  const worker = html2pdf().from(element).set(opt)
  const pdfBlob = await worker.outputPdf('blob')

  // Crée un URL temporaire
  pdfBlobUrl.value = URL.createObjectURL(pdfBlob)
  pdfDialog.value = true
} */

const rechercherAssure = async () => {
  const matricule = form.value.numassu?.trim().toUpperCase()
  if (!regexPatterns.numAssu1.test(matricule) && !regexPatterns.numAssu2.test(matricule)) {
    notifyError(
      'Le matricule saisi est invalide. Format attendu : 321-1234567-0 ou 321-1234567-000-0!',
    )
    console.warn('Matricule invalide:', matricule)
    return
  }
  spinner.value = true
  notifyInfo("Recherche de l'assuré!")
  setTimeout(() => {
    notifySuccess('Assuré trouvé!')
    ;(form.value.nomcompletass = "Nom Complet de l'assuré"),
      (form.value.date_naiss = new Date().toISOString().split('T')[0]),
      (form.value.centre_ges = 'CPS YAOUNDE INDEPENDANCE'),
      (spinner.value = false)
  }, 2000)
}

const downloadPDF = () => {
  const element = recapContent.value

  const opt = {
    margin: 0.5,
    filename: `recap-entreprise-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  }

  html2pdf().from(element).set(opt).save()
}

const closeDialog = () => {
  open.value = false
  emit('close')
}

// ✅ Convertir YYYY-MM-DD → JJ/MM/AAAA
function updateDisplayFromDate(val) {
  if (val) {
    const [year, month, day] = val.split('-')
    displayDate.value = `${day}/${month}/${year}`
  } else {
    displayDate.value = ''
  }
}

/* function updateDisplayFromDate2(val) {
  if (val) {
    const [year, month, day] = val.split('/')
    displayDate.value = `${day}/${month}/${year}`
  } else {
    displayDate.value = ''
  }
} */

function formatDate(date) {
  const formattedDate = date.toLocaleDateString('fr-FR') // ex: 20/07/2025
  const [year, month, day] = formattedDate.split('/')
  displayDate.value = `${day}/${month}/${year}`
  return displayDate.value
}

onMounted(() => {
  form.value.today = formatDate(new Date())
})

// ✅ Synchroniser displayDate si dateOuverture est défini initialement
watch(
  () => form.value.DATE_NAISS_PERSEMPL,
  (val) => updateDisplayFromDate(val, 'DATE_NAISS_PERSEMPL'),
  { immediate: true },
)

watch(
  () => form.value.DATE_PIECE,
  (val) => updateDisplayFromDate(val, 'DATE_PIECE'),
  { immediate: true },
)

watch(
  () => form.value.DATE_DEB_SERVICE,
  (val) => updateDisplayFromDate(val, 'DATE_DEB_SERVICE'),
  { immediate: true },
)

watch(
  () => form.value.DATE_EFFET,
  (val) => updateDisplayFromDate(val, 'DATE_EFFET'),
  { immediate: true },
)
</script>

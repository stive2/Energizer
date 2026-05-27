<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="q-pa-md">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6 text-primary">{{ t('layout.sidebar.assurePrestationPension') }}</div>
        <p class="text-body2 text-grey-8 q-mt-sm">{{ t('modules.assure.prestationsPlaceholder') }}</p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

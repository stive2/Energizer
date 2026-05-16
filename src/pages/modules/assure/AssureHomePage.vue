<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="q-mx-auto" style="max-width: 520px">
      <q-card-section>
        <div class="text-h6 text-primary">{{ t('modules.assure.homeTitle') }}</div>
        <p class="text-body2 text-grey-8 q-mt-sm">{{ t('modules.assure.homeLead') }}</p>
      </q-card-section>
      <q-separator />
      <q-card-actions vertical class="q-pa-md q-gutter-sm">
        <q-btn
          color="primary"
          unelevated
          no-caps
          icon="dashboard"
          :label="t('modules.assure.btnDashboard')"
          :to="{ name: 'assure-dashboard' }"
        />
        <q-btn
          outline
          color="primary"
          no-caps
          icon="upload_file"
          :label="t('modules.assure.btnDepot')"
          :to="{ name: 'depot-dossier' }"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const PROFILE_KEY = 'assure-sim-profile'

onMounted(() => {
  if (typeof sessionStorage === 'undefined') return
  const p = sessionStorage.getItem(PROFILE_KEY)
  if (p !== 'external') {
    router.replace({ name: 'assure-login' })
  }
})
</script>

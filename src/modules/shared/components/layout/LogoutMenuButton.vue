<template>
  <q-btn flat dense round icon="logout" color="white" :aria-label="t('logout')">
    <q-tooltip>{{ t('logout') }}</q-tooltip>

    <q-menu
      anchor="top right"
      self="bottom right"
      :offset="[0, 10]"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <q-card flat class="logout-menu-card">
        <q-card-actions class="logout-menu-card__actions q-pa-md">
          <q-btn
            flat
            no-caps
            color="primary"
            :label="t('layout.logoutConfirmCancel')"
            v-close-popup
          />
          <q-btn
            unelevated
            no-caps
            color="primary"
            :label="t('layout.logoutConfirmOk')"
            v-close-popup
            @click="onConfirm"
          />
        </q-card-actions>
      </q-card>
    </q-menu>
  </q-btn>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['confirm'])

const { t } = useI18n()

function onConfirm() {
  emit('confirm')
}
</script>

<style scoped>
.logout-menu-card {
  width: auto;
  min-width: 200px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.16);
}

.logout-menu-card__actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
</style>

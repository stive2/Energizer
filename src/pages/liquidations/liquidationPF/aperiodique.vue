<template>
  <div class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-breadcrumbs separator-icon="chevron_right">
        <q-breadcrumbs-el icon="home" label="Accueil" to="/" />
        <q-breadcrumbs-el label="Liquidations" to="/liquidations/liquidationPF/liquidationPF" />
        <q-breadcrumbs-el label="Apériodique" />
      </q-breadcrumbs>
    </div>

    <Aperiodique />
  </div>
</template>

<script>
import Aperiodique from 'components/liquidationPF/Aperiodique.vue'

export default {
  name: 'AperiodiquePage',
  components: { Aperiodique },
}
</script>

<style scoped>
</style>

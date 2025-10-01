<template>
  <div class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-breadcrumbs separator-icon="chevron_right">
        <q-breadcrumbs-el icon="home" label="Accueil" to="/" />
        <q-breadcrumbs-el label="Liquidations" to="/liquidations/liquidationPF/liquidationPF" />
        <q-breadcrumbs-el label="Statistiques" />
      </q-breadcrumbs>
    </div>

    <Statistiques />
  </div>
</template>

<script>
import Statistiques from 'components/liquidationPF/Statistiques.vue'

export default {
  name: 'LiquidationStatistiquesPage',
  components: { Statistiques },
}
</script>

<style scoped>
</style>

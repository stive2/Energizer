<template>
  <div class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-breadcrumbs separator-icon="chevron_right">
        <q-breadcrumbs-el icon="home" label="Accueil" to="/" />
        <q-breadcrumbs-el label="Liquidations" to="/liquidations/liquidationPF/liquidationPF" />
        <q-breadcrumbs-el label="Période active" />
      </q-breadcrumbs>
    </div>

    <PeriodeActive />
  </div>

</template>

<script>
import PeriodeActive from 'components/liquidationPF/PeriodeActive.vue'

export default {
  name: 'PeriodeActivePage',
  components: { PeriodeActive },
}
</script>

<style scoped>
</style>



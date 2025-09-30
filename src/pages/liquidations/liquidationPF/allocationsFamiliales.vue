<template>
  <div class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-breadcrumbs separator-icon="chevron_right">
        <q-breadcrumbs-el icon="home" label="Accueil" to="/" />
        <q-breadcrumbs-el label="Liquidations" to="/liquidations/liquidationPF/liquidationPF" />
        <q-breadcrumbs-el label="Allocations familiales" />
      </q-breadcrumbs>
    </div>

    <AllocationsFamiliales />
  </div>

</template>

<script>
import AllocationsFamiliales from 'components/liquidationPF/AllocationsFamiliales.vue'

export default {
  name: 'AllocationsFamilialesPage',
  components: { AllocationsFamiliales },
}
</script>

<style scoped>
</style>



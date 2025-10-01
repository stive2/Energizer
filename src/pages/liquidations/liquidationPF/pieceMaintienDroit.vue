<template>
  <div class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-breadcrumbs separator-icon="chevron_right">
        <q-breadcrumbs-el icon="home" label="Accueil" to="/" />
        <q-breadcrumbs-el label="Liquidations" to="/liquidations/liquidationPF/liquidationPF" />
        <q-breadcrumbs-el label="Pièce maintien de droit" />
      </q-breadcrumbs>
    </div>

    <PieceMaintienDroit />
  </div>

</template>

<script>
import PieceMaintienDroit from 'components/liquidationPF/PieceMaintienDroit.vue'

export default {
  name: 'PieceMaintienDroitPage',
  components: { PieceMaintienDroit },
}
</script>

<style scoped>
</style>



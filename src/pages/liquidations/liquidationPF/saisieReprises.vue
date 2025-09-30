<template>
  <div class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-breadcrumbs separator-icon="chevron_right">
        <q-breadcrumbs-el icon="home" label="Accueil" to="/" />
        <q-breadcrumbs-el label="Liquidations" to="/liquidations/liquidationPF/liquidationPF" />
        <q-breadcrumbs-el label="Saisie des reprises" />
      </q-breadcrumbs>
    </div>

    <SaisieReprises />
  </div>

</template>

<script>
import SaisieReprises from 'components/liquidationPF/SaisieReprises.vue'

export default {
  name: 'SaisieReprisesPage',
  components: { SaisieReprises },
}
</script>

<style scoped>
</style>



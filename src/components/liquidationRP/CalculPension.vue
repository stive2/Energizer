<template>
  <div class="calcul-pension">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="calculate" class="q-mr-sm" />
          Calcul de Pension RP
        </div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="calcul.salaireMoyen"
              label="Salaire moyen (FCFA)"
              type="number"
              outlined
              prefix="FCFA"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="calcul.anneesService"
              label="Années de service"
              type="number"
              outlined
              suffix="ans"
            />
          </div>
        </div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="calcul.tauxLiquidation"
              label="Taux de liquidation (%)"
              type="number"
              outlined
              suffix="%"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="calcul.majoration"
              label="Majoration (FCFA)"
              type="number"
              outlined
              prefix="FCFA"
            />
          </div>
        </div>

        <q-separator class="q-my-md" />

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="calcul.pensionBrute"
              label="Pension brute"
              type="number"
              outlined
              prefix="FCFA"
              readonly
              class="bg-grey-1"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="calcul.pensionNette"
              label="Pension nette"
              type="number"
              outlined
              prefix="FCFA"
              readonly
              class="bg-green-1"
            />
          </div>
        </div>

        <div class="q-mt-md">
          <q-btn
            color="primary"
            label="Calculer"
            @click="calculerPension"
            :loading="calculating"
          />
          <q-btn
            flat
            color="grey"
            label="Réinitialiser"
            class="q-ml-sm"
            @click="reinitialiser"
          />
        </div>

        <div v-if="calcul.pensionNette > 0" class="q-mt-md">
          <q-banner class="bg-green-2 text-green-8">
            <template v-slot:avatar>
              <q-icon name="check_circle" />
            </template>
            Pension calculée avec succès : {{ formatCurrency(calcul.pensionNette) }} FCFA
          </q-banner>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'CalculPension',
  emits: ['pension-calculated'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const calculating = ref(false)

    const calcul = ref({
      salaireMoyen: 0,
      anneesService: 0,
      tauxLiquidation: 0,
      majoration: 0,
      pensionBrute: 0,
      pensionNette: 0
    })

    const calculerPension = async () => {
      calculating.value = true

      try {
        // Simulation du calcul
        await new Promise(resolve => setTimeout(resolve, 800))

        const { salaireMoyen, anneesService, tauxLiquidation, majoration } = calcul.value

        // Calcul de la pension brute
        const pensionBrute = (salaireMoyen * anneesService * tauxLiquidation) / 100 + majoration

        // Calcul de la pension nette (avec retenues)
        const retenues = pensionBrute * 0.1 // 10% de retenues
        const pensionNette = pensionBrute - retenues

        calcul.value.pensionBrute = Math.round(pensionBrute)
        calcul.value.pensionNette = Math.round(pensionNette)

        emit('pension-calculated', {
          pensionBrute: calcul.value.pensionBrute,
          pensionNette: calcul.value.pensionNette
        })

        $q.notify({
          type: 'positive',
          message: 'Calcul de pension terminé'
        })
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Erreur lors du calcul'
        })
      } finally {
        calculating.value = false
      }
    }

    const reinitialiser = () => {
      calcul.value = {
        salaireMoyen: 0,
        anneesService: 0,
        tauxLiquidation: 0,
        majoration: 0,
        pensionBrute: 0,
        pensionNette: 0
      }
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR').format(amount)
    }

    return {
      calcul,
      calculating,
      calculerPension,
      reinitialiser,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.calcul-pension {
  max-width: 800px;
  margin: 0 auto;
}
</style>

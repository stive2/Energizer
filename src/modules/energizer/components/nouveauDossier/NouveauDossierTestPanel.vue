<template>
  <q-expansion-item
    icon="science"
    label="Données de test — tous les cas de formulaire"
    caption="Matricules, codes télé, valeurs par objet"
    class="q-mt-md nouveau-dossier-test-panel"
    header-class="text-primary"
  >
    <q-card flat bordered class="q-pa-md">
      <q-banner dense class="bg-amber-1 q-mb-md">
        Parcours : ouvrir le dialogue → choisir l’objet → renseigner les champs
        <strong>activés</strong> ci-dessous. Matricule assuré / employeur : cliquer sur le champ,
        Entrée ou l’icône recherche après saisie.
        <div class="q-mt-sm text-caption">
          Guide complet :
          <code class="text-primary">src/modules/energizer/data/GUIDE_TEST_NOUVEAU_DOSSIER.md</code>
        </div>
      </q-banner>

      <div class="text-subtitle2 q-mb-sm">Références rapides</div>
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-12 col-md-6">
          <q-list dense bordered>
            <q-item>
              <q-item-section>
                <q-item-label overline>Assurés (numassu)</q-item-label>
                <q-item-label>321-1234567-0 — KAMGA Jean-Pierre</q-item-label>
                <q-item-label>321-1256447-9 — alerte pré-dépôt PVID</q-item-label>
                <q-item-label>321-8888888-1 — alerte calcul pension PV</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="col-12 col-md-6">
          <q-list dense bordered>
            <q-item>
              <q-item-section>
                <q-item-label overline>Employeur (mat_employeur)</q-item-label>
                <q-item-label>321-1234567-A — ENTREPRISE DEMO SARL</q-item-label>
                <q-item-label>321-6549873-Z — SOCIETE NORD CAMEROUN</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Télé-immat</q-item-label>
                <q-item-label>Assuré : DEMO-ASS-001 / secret2026</q-item-label>
                <q-item-label>Employeur : DEMO-EMP-001 / secret2026</q-item-label>
                <q-item-label>Doublon : DUPLICATE / duplicate</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>

      <q-table
        flat
        bordered
        :rows="rows"
        :columns="columns"
        row-key="ordre"
        :pagination="{ rowsPerPage: 15 }"
        class="nouveau-dossier-test-table"
      >
        <template #body-cell-valeurs="props">
          <q-td :props="props">
            <pre class="test-valeurs-pre">{{ formatValeurs(props.row.valeurs) }}</pre>
          </q-td>
        </template>
        <template #body-cell-champsActifs="props">
          <q-td :props="props">
            <span class="text-caption">{{ props.row.champsActifs.join(', ') }}</span>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-expansion-item>
</template>

<script setup>
import { NOUVEAU_DOSSIER_TEST_CHECKLIST } from 'src/modules/energizer/data/nouveauDossierTestScenarios.js'

const rows = NOUVEAU_DOSSIER_TEST_CHECKLIST

const columns = [
  { name: 'ordre', label: '#', field: 'ordre', align: 'center', style: 'width: 40px' },
  { name: 'objet', label: 'Objet à sélectionner', field: 'objet', align: 'left' },
  { name: 'scenarioLabel', label: 'Cas', field: 'scenarioLabel', align: 'left' },
  { name: 'champsActifs', label: 'Champs activés', field: 'champsActifs', align: 'left' },
  { name: 'valeurs', label: 'Valeurs de test', field: 'valeurs', align: 'left' },
  { name: 'notes', label: 'Notes', field: 'notes', align: 'left' },
]

function formatValeurs(v) {
  if (!v || !Object.keys(v).length) return '—'
  return Object.entries(v)
    .map(([k, val]) => `${k}: ${val}`)
    .join('\n')
}
</script>

<style scoped>
.test-valeurs-pre {
  margin: 0;
  font-size: 11px;
  white-space: pre-wrap;
  font-family: inherit;
}
.nouveau-dossier-test-table :deep(td) {
  vertical-align: top;
}
</style>

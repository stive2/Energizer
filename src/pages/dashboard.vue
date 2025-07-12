<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="dashboard-page">
      <div>
          <h3> BONJOUR ! ACCUIEL</h3>
      </div>
  </q-page>
</template>

<script setup>


</script>

<style scoped>
.dashboard-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 12px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.chart-card, .activity-card, .table-card, .quick-actions-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.chart-container {
  height: 300px;
  position: relative;
}

.claims-table {
  border-radius: 8px;
}

.claims-table .q-table__top,
.claims-table .q-table__bottom,
.claims-table thead tr:first-child th {
  background-color: #fafafa;
}

/* Responsive adjustments */
@media (max-width: 1023px) {
  .stat-card:hover {
    transform: none;
  }

  .chart-container {
    height: 250px;
  }
}

@media (max-width: 599px) {
  .dashboard-page .q-pa-md {
    padding: 8px;
  }

  .chart-container {
    height: 200px;
  }
}
</style>

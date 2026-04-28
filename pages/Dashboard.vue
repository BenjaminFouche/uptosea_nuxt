<template>
  <div class="dashboard-page">
    <div class="dashboard-container">

      <div class="dashboard-header">
        <h1 class="dashboard-title">Tableau de bord</h1>

        <div class="dashboard-filters">
          <select v-model="store.selectedMonth" class="filter-select">
            <option :value="null">Tous les mois</option>
            <option v-for="(month, index) in months" :key="index" :value="index">
              {{ month }}
            </option>
          </select>

          <select v-model="store.selectedYear" class="filter-select">
            <option :value="null">Toutes les années</option>
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>

      <LoadingSpinner v-if="store.isLoading" message="Chargement des données du tableau de bord..." />

      <div v-else-if="store.error" class="error-container">
        <h3>Erreur de chargement</h3>
        <p>{{ store.error }}</p>
      </div>

      <div v-else>
        <div class="dashboard-summary">
          <div class="summary-card">
            <div class="summary-icon icon-revenue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="summary-details">
              <p class="summary-value">{{ store.totalCommission.toFixed(2) }} €</p>
              <p class="summary-label">Commission Globale</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon icon-rentals">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div class="summary-details">
              <p class="summary-value">{{ store.totalRentals }}</p>
              <p class="summary-label">Réservations Totales</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon icon-anomalies">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div class="summary-details">
              <p class="summary-value">{{ store.totalAnomalies }}</p>
              <p class="summary-label">Anomalies Signalées</p>
            </div>
          </div>
        </div>

        <h2 class="boats-grid-title">Statistiques par Bateau</h2>
        <div v-if="store.boatsWithStats.length > 0" class="boats-dashboard-grid">
          <DashboardBoatCard v-for="boat in store.boatsWithStats" :key="boat.id" :boat="boat" />
        </div>
        <div v-else class="empty-container">
          <p>Aucun bateau trouvé.</p>
        </div>
      </div>
    </div>
    </div>
</template>

<script setup>
import { onMounted, computed, watch } from 'vue';
import { useBoatProprietaireStore } from '@/stores/useBoatProprietaireStore';
import DashboardBoatCard from '@/components/dashboard/DashboardBoatCard.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const store = useBoatProprietaireStore();

watch(() => store.selectedYear, async (newYear, oldYear) => {
  if (newYear !== oldYear) {
    await store.fetchDashboardData();
  }
});

// Liste statique des mois
const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Calcul des années
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1
  ];
});

onMounted(() => {
  store.selectedYear = new Date().getFullYear();
  store.selectedMonth = null; // "Tous les mois" par défaut

  store.fetchDashboardData();
});
</script>

<style lang="scss">
@import 'assets/styles/scss/dashboard/dashboard';
</style>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard-title {
  margin-bottom: 0;
}

.dashboard-filters {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.5rem 2rem 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: white;
  font-size: 1rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  appearance: auto;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
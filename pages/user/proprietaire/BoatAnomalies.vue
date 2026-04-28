<template>
  <div class="anomalies-page-container">
    <div class="anomalies-page">
      <div class="container">
        <Breadcrumbs></Breadcrumbs>

        <div class="page-header">
          <h1>Anomalies & Incidents</h1>
          <UiButton variant="primary" @click="openAddModal">
            + Déclarer une anomalie
          </UiButton>
        </div>

        <div class="boat-action-page__tabs">
          <div class="search-field">
            <input
                type="text"
                v-model="store.searchQuery"
                placeholder="Rechercher une anomalie..."
                class="search-input"
            />
            <img src="@/assets/svg/loupe.svg" alt="Rechercher" class="search-icon"/>
          </div>
          <div class="booking-tabs">
            <button
                @click="store.activeTab = 'all'"
                :class="['booking-tabs__tab', { active: store.activeTab === 'all' }]"
            >
              Toutes
              <span v-if="store.totalCount" class="booking-tabs__count">
                {{ store.totalCount }}
              </span>
            </button>
            <button
                @click="store.activeTab = 'en-cours'"
                :class="['booking-tabs__tab', { active: store.activeTab === 'en-cours' }]"
            >
              En cours
              <span v-if="store.enCoursCount" class="booking-tabs__count">
                {{ store.enCoursCount }}
              </span>
            </button>
            <button
                @click="store.activeTab = 'resolu'"
                :class="['booking-tabs__tab', { active: store.activeTab === 'resolu' }]"
            >
              Résolues
              <span v-if="store.resoluCount" class="booking-tabs__count">
                {{ store.resoluCount }}
              </span>
            </button>
          </div>
        </div>

        <div v-if="store.isLoading" class="loader-container">
          <LoadingSpinner v-if="store.isLoading" message="Chargement des anomalies..." />
        </div>

        <div v-else-if="store.error" class="error-message">
          <strong>Erreur:</strong> {{ store.error }}
        </div>

        <div v-else>
          <div v-if="store.anomalies.length === 0" class="empty-state">
            <p>Aucune anomalie signalée pour ce bateau.</p>
          </div>

          <div v-else class="anomalies-grid animate__animated animate__fadeIn">
            <AnomalyCard
                v-for="anomaly in store.anomalies"
                :key="anomaly.id"
                :anomaly="anomaly"
                @edit="openEditModal"
                @delete="handleDelete"
            />
          </div>
        </div>

      </div>
    </div>

    <AnomalyModal
        :is-open="isModalOpen"
        :is-edit="isEditMode"
        :initial-data="selectedAnomaly"
        @close="isModalOpen = false"
        @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAnomalyStore } from '@/stores/useAnomalyStore';
import AnomalyCard from '@/components/user/proprietaire/AnomalyCard.vue';
import AnomalyModal from '@/components/user/proprietaire/AnomalyModal.vue';
import UiButton from '@/components/ui/UiButton.vue';
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Breadcrumbs from "@/components/common/Breadcrumbs.vue";

const route = useRoute();
const store = useAnomalyStore();

const boatCode = computed(() => route.query.boatCode || 'DEFAULT');

const isModalOpen = ref(false);
const isEditMode = ref(false);
const selectedAnomaly = ref(null);

// Récupération des anomalies
onMounted(() => {
  store.fetchAnomalies(boatCode.value);
});

// Ouverture du modal d'ajout
const openAddModal = () => {
  isEditMode.value = false;
  selectedAnomaly.value = null;
  isModalOpen.value = true;
};

// Ouverture du modal de modification
const openEditModal = (anomaly) => {
  isEditMode.value = true;
  selectedAnomaly.value = anomaly;
  isModalOpen.value = true;
};

const handleSave = async ({ formData, files }) => {
  try {
    if (isEditMode.value) {
      const updatedAnomaly = { ...selectedAnomaly.value, ...formData };
      await store.updateAnomaly(updatedAnomaly, files);
    } else {
      const newAnomaly = { ...formData, boatCode: boatCode.value };
      await store.addAnomaly(newAnomaly, files);
    }
    isModalOpen.value = false;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'anomalie:", error);
  }
};

// Suppression d'une anomalie
const handleDelete = async (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette anomalie ?')) {
    await store.deleteAnomaly(id, boatCode.value);
  }
};
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/user/proprietaire/boat-action-proprietaire';
@import 'assets/styles/scss/user/proprietaire/boat-anomalies';
</style>
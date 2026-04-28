<template>
  <div class="bookings-page-container">
    <div class="bookings-page">
      <div class="container">
        <Breadcrumbs></Breadcrumbs>
        <div class="bookings-page__header">
          <div v-if="boats.length > 0">
            <h1 class="bookings-page__title">Mes bateaux</h1>
            <p class="bookings-page__subtitle">Gérez vos bateaux et consultez leurs informations</p>
          </div>
          <div v-else>
            <h1 class="bookings-page__title">Mon bateau</h1>
            <p class="bookings-page__subtitle">Gérez votre bateau et consultez ses informations.</p>
          </div>
        </div>

        <div v-if="isLoading" class="loader-container">
          <LoadingSpinner v-if="isLoading" message="Chargement de vos bateaux..." />
        </div>

        <div v-else-if="boats.length === 0" class="bookings-page__empty">
          <h3>Vous n'avez pas encore de bateaux</h3>
          <p>Proposer votre bateaux à UPtoSEA pour commencer à gérer votre flotte</p>
          <a href="https://www.uptosea.com/mettre-en-ligne-mon-bateau/">
          <UiButton variant="primary" size="medium">PROPOSER MON BATEAU</UiButton>
          </a>
        </div>

        <div v-else>
          <div class="bookings-page__filters">
            <div class="search-field">
              <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Rechercher un bateau (nom, marque...)"
                  class="search-input"
              />
              <img src="@/assets/svg/loupe.svg" alt="Rechercher" class="search-icon" />
            </div>
          </div>

          <div v-if="filteredBoats.length === 0" class="bookings-page__empty search-empty">
            <h3>Aucun résultat</h3>
            <p>Aucun bateau ne correspond à votre recherche "{{ searchQuery }}"</p>
          </div>

          <div v-else>
            <div class="bookings-list">
              <div v-for="boat in paginatedFilteredBoats" :key="boat.code" class="bookings-list__item">
                <MyBoatCard
                    :boat="boat"
                    @view-details="handleViewDetails"
                    @view-actions="handleViewActions"
                    @reserve="handleReserve"
                />
              </div>
            </div>

            <div v-if="totalFilteredPages > 1" class="pagination">
              <button
                  class="pagination-arrow"
                  :disabled="!hasPreviousFilteredPage || isLoading"
                  @click="goToPreviousFilteredPage"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <span class="pagination-info">
                Page {{ currentFilteredPage + 1 }} sur {{ totalFilteredPages }}
              </span>

              <button
                  class="pagination-arrow"
                  :disabled="!hasNextFilteredPage || isLoading"
                  @click="goToNextFilteredPage"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ReservationModal
        :show="showReservationModal"
        :boat="selectedBoat"
        @close="showReservationModal = false"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useBoatProprietaireStore } from '@/stores/useBoatProprietaireStore';
import MyBoatCard from '@/components/user/proprietaire/MyBoatCard.vue';
import UiButton from '@/components/ui/UiButton.vue';
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ReservationModal from "../../../components/boat-detail/BookingModal.vue"
import Breadcrumbs from "@/components/common/Breadcrumbs.vue";

const router = useRouter();
const boatStore = useBoatProprietaireStore();
const isLoading = computed(() => boatStore.isLoading);
const error = computed(() => boatStore.error);
const boats = computed(() => boatStore.boats || []);

const showReservationModal = ref(false);
const selectedBoat = ref(null);

// Recherche et filtres
const searchQuery = ref('');
const activeFilter = ref('all');

const filters = [
  { label: 'Tous', value: 'all' },
  { label: 'Permis requis', value: 'permis_required' },
  { label: 'Sans permis', value: 'no_permis' },
];

// Bateaux filtrées
const filteredBoats = computed(() => {
  // Sécurité sur le tableau source
  let filtered = Array.isArray(boatStore.boats) ? [...boatStore.boats] : [];

  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();

    // Critère de recherche
    filtered = filtered.filter(boat =>
        (boat.nom && boat.nom.toLowerCase().includes(query)) ||
        (boat.nomBapteme && boat.nomBapteme.toLowerCase().includes(query)) ||
        (boat.marque && boat.marque.toLowerCase().includes(query)) ||
        (boat.franchise?.nom && boat.franchise.nom.toLowerCase().includes(query))
    );
  }

  // Appliquer les filtres
  if (activeFilter.value !== 'all') {
    if (activeFilter.value === 'permis_required') {
      filtered = filtered.filter(boat => boat.permisObligatoire);
    } else if (activeFilter.value === 'no_permis') {
      filtered = filtered.filter(boat => !boat.permisObligatoire);
    }
  }

  return filtered;
});

// Pagination
const itemsPerPage = 5;
const currentFilteredPage = ref(0);

const totalFilteredPages = computed(() => {
  return Math.ceil(filteredBoats.value.length / itemsPerPage);
});

const paginatedFilteredBoats = computed(() => {
  const start = currentFilteredPage.value * itemsPerPage;
  return filteredBoats.value.slice(start, start + itemsPerPage);
});

const hasNextFilteredPage = computed(() => {
  return currentFilteredPage.value < totalFilteredPages.value - 1;
});

const hasPreviousFilteredPage = computed(() => {
  return currentFilteredPage.value > 0;
});

// Réinitialiser la pagination
watch(searchQuery, () => {
  currentFilteredPage.value = 0;
});

// Charger les bateaux
onMounted(async () => {
  try {
    await boatStore.fetchBoats();
  } catch (err) {
    console.error(err);
  }
});

// Gestion des actions
const handleViewDetails = (boat) => {
  MapsTo(`/bateaux/${boat.code}`);
};

const handleViewActions = (boat) => {
  MapsTo(`/proprietaire/bateau/${boat.code}/actions`);
};

const handleReserve = (boat) => {
  selectedBoat.value = boat;
  showReservationModal.value = true;
};


// Navigation dans la pagination
const goToPreviousFilteredPage = () => {
  if (hasPreviousFilteredPage.value) {
    currentFilteredPage.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const goToNextFilteredPage = () => {
  if (hasNextFilteredPage.value) {
    currentFilteredPage.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const toggleFilter = (filterValue) => {
  if (activeFilter.value === filterValue) {
    activeFilter.value = 'all';
  } else {
    activeFilter.value = filterValue;
  }
  currentFilteredPage.value = 0;
};
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/user/booking';

.search-empty {
  padding: 3rem 0;
  text-align: center;
  opacity: 0.7;
}
</style>

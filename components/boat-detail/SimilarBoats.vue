<template>
  <section class="similar-boats" v-if="!isLoading && (similarBoats.length > 0 || error)">
    <div class="similar-boats__header">
      <h2 class="similar-boats__title">Annonces similaires</h2>
      <p class="similar-boats__subtitle">
      </p>
    </div>

    <div v-if="error" class="similar-boats__error">
      <p>Erreur lors du chargement des annonces similaires</p>
    </div>

    <div v-else-if="similarBoats.length === 0 && !isLoading" class="similar-boats__empty">
      <p>Aucune annonce similaire trouvée pour cette catégorie.</p>
    </div>

    <div v-else class="similar-boats__carousel">
      <!-- Flèche précédente -->
      <button class="similar-boats__nav-arrow similar-boats__nav-arrow--prev" @click="previousSlide"
        :disabled="currentIndex === 0">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>

      <!-- Grille des bateaux -->
      <div class="similar-boats__grid" @mousedown="handleStart" @mousemove="handleMove" @mouseup="handleEnd"
        @mouseleave="handleEnd" @touchstart="handleStart" @touchmove="handleMove" @touchend="handleEnd">
        <BoatCard v-for="boat in visibleBoats" :key="boat.code" :boat="boat" @view-details="handleViewDetails" />
      </div>

      <!-- Flèche suivante -->
      <button class="similar-boats__nav-arrow similar-boats__nav-arrow--next" @click="nextSlide"
        :disabled="currentIndex >= maxIndex">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ApiBoatService } from '../../services/apiBoat.js';
import BoatCard from '../common/BoatCard.vue';

/**
 * @typedef {import('../../types/Boat').Boat} Boat
 */

/**
 * @typedef {Object} Props
 * @property {Boat} currentBoat - Le bateau actuellement affiché
 */

const props = defineProps({
  currentBoat: {
    type: Object,
    required: true
  }
});

const router = useRouter();

// États par défault
const similarBoats = ref([]);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const error = ref(null);
const currentOffset = ref(0);
const limit = 6;
const totalBoats = ref(0);
const allFilteredBoats = ref([]);

// États carrousel
const currentIndex = ref(0);

// Variables swipe
const isDragging = ref(false);
const startX = ref(0);
const currentX = ref(0);
const threshold = 50;

// Computed
const hasMoreBoats = computed(() => {
  return similarBoats.value.length < allFilteredBoats.value.length;
});

// Computed carrousel
const visibleBoats = computed(() => {
  const itemsPerPage = getItemsPerPage();
  const start = currentIndex.value;
  const end = start + itemsPerPage;
  return allFilteredBoats.value.slice(start, end);
});

const maxIndex = computed(() => {
  const itemsPerPage = getItemsPerPage();
  return Math.max(0, allFilteredBoats.value.length - itemsPerPage);
});

// Nombre item par page
const getItemsPerPage = () => {
  if (window.innerWidth <= 768) {
    return 1;
  } else if (window.innerWidth <= 1024) {
    return 2;
  } else {
    return 3;
  }
};

/**
 * Charge les bateaux similaires
 */
const loadSimilarBoats = async (offset = 0, append = false) => {
  if (!props.currentBoat?.categorieNom) {
    return;
  }

  try {
    if (append) {
      isLoadingMore.value = true;
    } else {
      isLoading.value = true;
      similarBoats.value = [];
      allFilteredBoats.value = [];
    }

    error.value = null;

    const response = await ApiBoatService.getBoatsByCategory(
      props.currentBoat.categorieNom,
      0,
      50,
      props.currentBoat.code
    );

    // Stocke les bateaux filtré
    allFilteredBoats.value = response.boats;

    // Affiche les premier bateau
    if (append) {
      const startIndex = similarBoats.value.length;
      const endIndex = startIndex + limit;
      const nextBoats = allFilteredBoats.value.slice(startIndex, endIndex);
      similarBoats.value = [...similarBoats.value, ...nextBoats];
    } else {
      similarBoats.value = allFilteredBoats.value.slice(0, limit);
    }

    totalBoats.value = response.total;

  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

/**
 * Charge plus de bateaux
 */
const loadMoreBoats = async () => {
  const startIndex = similarBoats.value.length;
  const endIndex = startIndex + limit;
  const nextBoats = allFilteredBoats.value.slice(startIndex, endIndex);

  if (nextBoats.length > 0) {
    isLoadingMore.value = true;
    setTimeout(() => {
      similarBoats.value = [...similarBoats.value, ...nextBoats];
      isLoadingMore.value = false;
    }, 300);
  }
};

/**
 * Navigation du carrousel
 */
const nextSlide = () => {
  if (currentIndex.value < maxIndex.value) {
    currentIndex.value += 1;
  }
};

const previousSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
  }
};

// Fonction de swipe
const handleStart = (event) => {
  event.preventDefault();
  isDragging.value = true;

  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  startX.value = clientX;
  currentX.value = clientX;
};

const handleMove = (event) => {
  if (!isDragging.value) return;
  event.preventDefault();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  currentX.value = clientX;
};

const handleEnd = (event) => {
  if (!isDragging.value) return;

  event.preventDefault();
  isDragging.value = false;

  const deltaX = currentX.value - startX.value;

  // Direction du swipe
  if (Math.abs(deltaX) > threshold) {
    if (deltaX > 0) {
      previousSlide();
    } else {
      nextSlide();
    }
  }

  startX.value = 0;
  currentX.value = 0;
};

/**
 * Gère la navigation vers les détails d'un bateau
 */
const handleViewDetails = (boat) => {
  MapsTo({
    name: 'BoatDetail',
    params: { code: boat.code }
  });
};

watch(
  () => props.currentBoat,
  (newBoat) => {
    if (newBoat?.categorieNom) {
      currentOffset.value = 0;
      currentIndex.value = 0;
      loadSimilarBoats();
    }
  },
  { immediate: true }
);

// Montage du composant
onMounted(() => {
  if (props.currentBoat?.categorieNom) {
    loadSimilarBoats();
  }
});

// Nettoyage
onUnmounted(() => {});
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/boat-detail/similar-boats';
</style>

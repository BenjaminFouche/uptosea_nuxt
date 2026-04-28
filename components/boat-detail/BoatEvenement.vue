<template>
  <div class="boat-evenement">
    <h3 class="evenement-title">Idéal pour</h3>

    <!-- Chargement -->
    <LoadingSpinner v-if="isLoading" message="Chargement des évènements..." />

    <!-- Liste des événements -->
    <div v-else-if="evenementList && evenementList.length > 0" class="evenement-list">
      <div class="evenement-item" v-for="evenement in displayedEvenements" :key="evenement.id || evenement.nom">
        <div v-html="getEventIcon(evenement)" class="event-icon"></div>
        <span>{{ evenement.nom || evenement.titre || evenement }}</span>
      </div>
    </div>

    <!-- Aucun évènement -->
    <div v-else class="empty-state">
      <p>Aucun événement disponible pour ce bateau.</p>
    </div>

    <!-- Voir tout les évènements-->
    <button v-if="evenementList.length > 10" class="show-all-btn" @click="toggleShowAll">
      {{ showAll ? 'Voir moins' : `Voir tous les événements (${evenementList.length})` }}
      <img src="../../assets/svg/chevron.svg" :class="{ 'rotated': showAll }" alt="">
    </button>


  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import LoadingSpinner from "@/components/LoadingSpinner.vue";

/**
 * @typedef {Object} Props
 * @property {Array} evenementList - Liste des événements
 * @property {boolean} isLoading - État de chargement
 */

const props = defineProps({
  evenementList: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['show-all-evenement']);

const showAll = ref(false);

// Affichage des 10 premiers événements
const displayedEvenements = computed(() => {
  if (!props.evenementList || props.evenementList.length === 0) return [];
  return showAll.value ? props.evenementList : props.evenementList.slice(0, 10);
});

const toggleShowAll = () => {
  showAll.value = !showAll.value;
  emit('show-all-evenement', showAll.value);
};

// Récupération de l'icone correspondante à l'événement
const getEventIcon = (evenement) => {
  const eventName = (evenement.nom || evenement.titre || evenement).toLowerCase();

  // Lever de soleil
  if (eventName.includes('lever de soleil')) {
    return `<img src="https://app.uptosea.com/images/picto-lever-soleil.svg" alt="Lever de soleil">`;
  }

  // Pêche
  if (eventName.includes('pêche') || eventName.includes('peche')) {
    return `<img src="https://app.uptosea.com/images/picto-peche-2.svg" alt="Pêche en mer">`;
  }

  // Matin
  if (eventName.includes('matin')) {
    return `<img src="https://app.uptosea.com/images/picto-matinee.svg" alt="Matinée">`;
  }

  // Après-midi
  if (eventName.includes('après-midi') || eventName.includes('apres-midi')) {
    return `<img src="https://app.uptosea.com/images/picto-apres-midi.svg" alt="Après midi">`;
  }

  // EVJF & EVG (Enterrement de Vie de Jeune Fille / Garçon )
  if (eventName.includes('evjf') || eventName.includes('evg')) {
    return `<img src="https://app.uptosea.com/images/picto-fete.svg" alt="Enterrement de Vie de Jeune Fille ou Garçon">`;
  }

  // Mariage / Demande en mariage
  if (eventName.includes('mariage') || eventName.includes('demande')) {
    return `<img src="https://app.uptosea.com/images/picto-mariage.svg" alt="Demande en mariage">`;
  }

  // Dispersion des cendres
  if (eventName.includes('cendres') || eventName.includes('dispersion') || eventName.includes('dispersion des cendres')) {
    return `<img src="https://app.uptosea.com/images/picto-dispersion-cendres.svg" alt="Dispersion des cendre">`;
  }

  // Bouée tractée
  if (eventName.includes('bouée') || eventName.includes('bouee')) {
    return `<img src="https://app.uptosea.com/images/bouee.svg" alt="Bouée tractée">`;
  }

  // Déjeuner
  if (eventName.includes('déjeuner') || eventName.includes('dejeuner')) {
    return `<img src="https://app.uptosea.com/images/picto-dejeuner.svg" alt="Déjeuner">`;
  }

  // Apéro
  if (eventName.includes('apéro') || eventName.includes('apero')) {
    return `<img src="https://app.uptosea.com/images/picto-champagne.svg" alt="Apéro en mer">`;
  }

  // Dîner
  if (eventName.includes('dîner') || eventName.includes('diner')) {
    return `<img src="https://app.uptosea.com/images/picto-dejeuner.svg" alt="Diner">`;
  }

  // Nuitée
  if (eventName.includes('nuitée') || eventName.includes('nuitee')) {
    return `<img src="https://app.uptosea.com/images/picto-nuit.svg" alt="Nuitée">`;
  }

  // Coucher de soleil
  if (eventName.includes('coucher de soleil')) {
    return `<img src="https://app.uptosea.com/images/picto-coucher-soleil.svg" alt="Coucher de soleil">`;
  }

  // Icône par défaut (étoile)
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24" stroke="#fbbf24" stroke-width="1"/></svg>`;
};
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/boat-detail/boat-evenement';
</style>

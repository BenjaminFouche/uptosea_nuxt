<template>
  <div class="boat-card" @click="handleClick">
    <div
        class="boat-card__image"
        @mousedown="handleStart"
        @mousemove="handleMove"
        @mouseup="handleEnd"
        @mouseleave="handleEnd"
        @touchstart="handleStart"
        @touchmove="handleMove"
        @touchend="handleEnd"
    >
      <img
          :src="currentImage"
          :alt="boat.nom"
          class="boat-card__img"
          draggable="false"
      />
      <!--      <div class="boat-card__favorite" @click="toggleFavorite">-->
      <!--        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">-->
      <!--          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"-->
      <!--                :fill="isFavorite ? '#FF6B6B' : 'none'"-->
      <!--                :stroke="isFavorite ? '#FF6B6B' : 'currentColor'"-->
      <!--                stroke-width="2"-->
      <!--          />-->
      <!--        </svg>-->
      <!--      </div>-->

      <div v-if="boatImages.length > 1" class="boat-card__image-indicators">
        <button
            v-for="(_, index) in boatImages"
            :key="index"
            :class="['image-indicator', { active: index === currentImageIndex }]"
            @click="setCurrentImage(index, $event)"
        />
      </div>
    </div>

    <div class="boat-card__content">
      <div class="boat-card__main-info">
        <div class="boat-card__header">
          <h3 class="boat-card__title">{{ boat.nomBapteme }} <span v-if="boat.annee">({{ boat.annee }})</span></h3>
        </div>

        <div class="boat-card__location" style="text-transform: capitalize;">
          {{ [boat.franchise.ville, boat.franchise.pays].filter(item => item).join(', ').toLowerCase() }}
        </div>

        <div class="boat-card__location">
          {{ boat.localisation  }}
        </div>

        <div class="boat-card__specs">
          {{ boat.longueur }} m <span v-if="boat.puissance"> • {{ boat.puissance }} CV</span> • {{ boat.nombreDePersonnesAutorisees }} passagers
        </div>

        <div v-if="boat.permisObligatoire === true" class="boat-card__license">
          Permis obligatoire
        </div>
      </div>

      <div class="boat-card__footer">
        <div class="boat-card__price">
          <span class="price-label">À partir de</span>
          <span class="price-amount">{{ (boat.prixMinimal  / 100)}} €</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

/**
 * @typedef {import('../../types/Boat').Boat} Boat
 */

/**
 * @typedef {Object} Props
 * @property {Boat} boat
 */

const props = defineProps(['boat']);

const emit = defineEmits(['view-details']);

const currentImageIndex = ref(0);

const isFavorite = ref(false);

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
};

const resetImageIndex = () => {
  currentImageIndex.value = 0;
};

const defaultImage = 'https://app.uptosea.com/images/produit.webp';

const boatImages = computed(() => {
  if (props.boat.imagePrincipale) {
    const imagePrincipaleUrl = typeof props.boat.imagePrincipale === 'string'
        ? props.boat.imagePrincipale
        : (props.boat.imagePrincipale.slug || props.boat.imagePrincipale.url || null);
    if (imagePrincipaleUrl) {
      return [imagePrincipaleUrl];
    }
  }

  if (props.boat.mediasPresentationBateau && props.boat.mediasPresentationBateau.length > 0) {
    const firstMediaUrl = props.boat.mediasPresentationBateau[0].slug;
    if (firstMediaUrl) {
      return [firstMediaUrl];
    }
  }

  // Affichage de l'image
  if (props.boat.images && props.boat.images.length > 0) {
    return [props.boat.images[0]];
  }

  // Image par défault
  return [defaultImage];
});

const currentImage = computed(() => {
  const image = boatImages.value[currentImageIndex.value];
  const imageUrl = typeof image === 'string' ? image : defaultImage;

  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}w=527`;
});

const handleClick = () => {
  emit('view-details', props.boat);
};

const setCurrentImage = (index, event) => {
  event.stopPropagation();
  currentImageIndex.value = index;
};
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/boat-card';
</style>
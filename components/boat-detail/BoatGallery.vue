<template>
  <div class="boat-gallery-container">
    <div class="boat-gallery">
      <div class="main-image">
        <img
            :src="currentImage"
            :alt="altText || 'Photo du bateau'"
            class="boat-image"
            @click="openGalleryModal"
        >
        <slot name="favorite-button"></slot>

        <button
            v-if="images.length > 1"
            class="nav-arrow nav-arrow-left"
            @click.stop="previousImage"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round"/>
          </svg>
        </button>

        <button
            v-if="images.length > 1"
            class="nav-arrow nav-arrow-right"
            @click.stop="nextImage"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div v-if="images.length > 1" class="gallery-thumbnails">

        <button
            v-for="(image, index) in thumbnailsToShowWithSize"
            :key="index"
            :class="['thumbnail', { active: index === currentImageIndex }]"
            @click.stop="setCurrentImage(index)"
        >
          <img :src="image" :alt="`Photo ${index + 1} du bateau`"/>
        </button>

        <button
            v-if="images.length > 5"
            class="thumbnail more-images"
            @click.stop="openGalleryModal"
        >
          <img :src="fifthImageWithSize" alt="Plus d'images" class="bg-image" />

          <div class="overlay">
            <span>+{{ images.length - 4 }}</span>
          </div>
        </button>
      </div>
    </div>

    <div v-if="isGalleryModalOpen" class="gallery-modal">
      <div class="gallery-modal-content">
        <button class="close-modal" @click="closeGalleryModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div class="modal-image-container">
          <img :src="currentImage" :alt="altText || 'Photo du bateau'" class="modal-image">

          <button
              v-if="images.length > 1"
              class="modal-nav-arrow modal-nav-left"
              @click="previousImage"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="white" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
          </button>

          <button
              v-if="images.length > 1"
              class="modal-nav-arrow modal-nav-right"
              @click="nextImage"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6" stroke="white" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div
            class="modal-thumbnails"
            ref="thumbnailsContainer"
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="endDrag"
            @mouseleave="endDrag"
            @touchstart="startDrag"
            @touchmove="onDrag"
            @touchend="endDrag"
        >
          <div
              v-for="(image, index) in modalThumbnailsWithSize"
              :key="index"
              :class="['modal-thumbnail', { active: index === currentImageIndex }]"
              @click="handleThumbnailClick(index)"
          >
            <img
                :src="image"
                :alt="`Photo ${index + 1} du bateau`"
                draggable="false"
            />
          </div>
        </div>

        <div class="image-counter">
          {{ currentImageIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  altText: {
    type: String,
    default: ''
  }
});

const currentImageIndex = ref(0);

const currentImage = computed(() => {
  const image = props.images[currentImageIndex.value] || '';
  const separator = image.includes('?') ? '&' : '?';
  return `${image}${separator}w=958`;
});

const isGalleryModalOpen = ref(false);
const thumbnailsContainer = ref(null);
const isDragging = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);
const hasMoved = ref(false);

// 4 vignette visible
const thumbnailsToShow = computed(() => {
  if (props.images.length > 5) {
    return props.images.slice(0, 4);
  }
  return props.images.slice(0, 5);
});

// Taille des miniatures
const thumbnailsToShowWithSize = computed(() => {
  return thumbnailsToShow.value.map(img => {
    if (!img) return '';
    const separator = img.includes('?') ? '&' : '?';
    return `${img}${separator}w=187`;
  });
});

const fifthImageWithSize = computed(() => {
  if (props.images.length > 4) {
    const img = props.images[4];
    const separator = img.includes('?') ? '&' : '?';
    return `${img}${separator}w=187`;
  }
  return '';
});

// Taille des miniatures dans la galerie
const modalThumbnailsWithSize = computed(() => {
  return props.images.map(img => {
    if (!img) return '';
    const separator = img.includes('?') ? '&' : '?';
    return `${img}${separator}w=120`;
  });
});

// Navigations
const setCurrentImage = (index) => {
  currentImageIndex.value = index;
};

const nextImage = () => {
  const nextIndex = (currentImageIndex.value + 1) % props.images.length;
  setCurrentImage(nextIndex);
};

const previousImage = () => {
  const prevIndex = currentImageIndex.value === 0
      ? props.images.length - 1
      : currentImageIndex.value - 1;
  setCurrentImage(prevIndex);
};

// Fonctions pour le défilement
const startDrag = (e) => {
  isDragging.value = true;
  hasMoved.value = false;
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  startX.value = clientX;
  if (thumbnailsContainer.value) {
    scrollLeft.value = thumbnailsContainer.value.scrollLeft;
    thumbnailsContainer.value.style.cursor = 'grabbing';
  }
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const x = clientX - startX.value;

  if (Math.abs(x) > 5) {
    hasMoved.value = true;
    e.preventDefault();
    if (thumbnailsContainer.value) {
      thumbnailsContainer.value.scrollLeft = scrollLeft.value - x;
    }
  }
};

const endDrag = () => {
  isDragging.value = false;
  if (thumbnailsContainer.value) {
    thumbnailsContainer.value.style.cursor = 'grab';
  }
};

// Gérer le clic de la vignette
const handleThumbnailClick = (index) => {
  if (!hasMoved.value) {
    setCurrentImage(index);
  }
};

const openGalleryModal = () => {
  isGalleryModalOpen.value = true;
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', handleKeyPress);
};

const closeGalleryModal = () => {
  isGalleryModalOpen.value = false;
  document.body.style.overflow = 'auto';
  document.removeEventListener('keydown', handleKeyPress);
};

const handleKeyPress = (event) => {
  if (!isGalleryModalOpen.value) return;
  if (event.key === 'Escape') closeGalleryModal();
  else if (event.key === 'ArrowLeft') previousImage();
  else if (event.key === 'ArrowRight') nextImage();
};

// Nettoyage
onUnmounted(() => {
  if (isGalleryModalOpen.value) {
    document.removeEventListener('keydown', handleKeyPress);
    document.body.style.overflow = 'auto';
  }
});
</script>

<style lang="scss" scoped>
@import 'assets/styles/scss/boats/boat-gallery';
</style>
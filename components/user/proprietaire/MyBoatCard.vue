<template>
  <div class="myboat-card-container">
    <div class="myboat-card">
      <div class="myboat-card__image">
        <img
            :src="boatImage"
            :alt="boat.nomBapteme || 'Bateau'"
            class="myboat-card__img"
        />
      </div>

      <div class="myboat-card__content">
        <div class="myboat-card__header">
          <h3 class="myboat-card__title">
            {{ boat.nomBapteme || 'Bateau sans nom' }}
          </h3>
          <span class="myboat-card__date reference reference-status">
            {{ boat.marque || 'Marque inconnue' }}
          </span>
        </div>

        <div class="myboat-card__header">
          <div class="myboat-card__location">
            {{ boat.franchise?.nom || 'Lieu non spécifié' }}
          </div>
          <!--          <span class="reference reference-status">-->
          <!--            Réf : {{ boat.code }}-->
          <!--          </span>-->
        </div>

        <div class="myboat-card__specs">
          <div class="spec-item">
            <div class="spec-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div class="spec-text">
              <span class="spec-label">Longueur</span>
              <span class="spec-value">{{ boat.longueur ? boat.longueur + ' m' : '--' }}</span>
            </div>
          </div>

          <div class="spec-item">
            <div class="spec-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="spec-text">
              <span class="spec-label">Capacité</span>
              <span class="spec-value">{{ boat.nombreDePersonnesAutorisees || '0' }} pers.</span>
            </div>
          </div>
        </div>

        <div class="myboat-card__actions">

          <div class="actions">
            <UiButton
                @click="$emit('view-details', boat)"
                variant="secondary"
                size="small"
            >
              Détails
            </UiButton>
            <UiButton
                @click="$emit('view-actions', boat)"
                variant="primary"
                size="small"
            >
              Voir l'activité
            </UiButton>
            <UiButton
                @click="$emit('reserve', boat)"
                variant="primary"
                size="small"
            >
              Réserver
            </UiButton>
          </div>

          <div class="more-actions">
            <UiButton
                @click="goToAnomalie"
                variant="outline"
                size="small"
            >
              Anomalie
            </UiButton>

            <UiButton
                @click="goToDocuments"
                variant="outline"
                size="small"
            >
              Documents
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import UiButton from '@/components/ui/UiButton.vue';

/**
 * Props
 */
const props = defineProps({
  boat: {
    type: Object,
    required: true
  },
});

const router = useRouter();

/**
 * Émissions
 */
const emit = defineEmits(['view-details', 'view-actions', 'reserve']);

const hasContratConciergerie = computed(() => {
  return props.boat?.contratConciergerie && Array.isArray(props.boat.contratConciergerie) && props.boat.contratConciergerie.length > 0;
});

/**
 * Obtenir l'image du bateau avec redimensionnement (w=250)
 */
const boatImage = computed(() => {
  let image = '';

  const imagePrincipaleSlug = props.boat?.imagePrincipale?.slug;
  if (imagePrincipaleSlug) {
    image = imagePrincipaleSlug;
  }

  else if (props.boat?.mediasPresentationBateau && props.boat.mediasPresentationBateau.length > 0) {
    const firstMedia = props.boat.mediasPresentationBateau[0];

    if (typeof firstMedia === 'object' && firstMedia !== null && firstMedia.url) {
      image = firstMedia.url;
    } else if (typeof firstMedia === 'string') {
      image = firstMedia;
    }
  }

  if (!image) {
    image = 'https://app.uptosea.com/images/produit.webp';
  }

  if (typeof image === 'string') {
    const separator = image.includes('?') ? '&' : '?';
    return `${image}${separator}w=250`;
  }
  return '';
});

// Redirection vers "mes documents"
function goToDocuments() {
  MapsTo({
    name: 'BoatDocument',
    query: {
      boatCode: props.boat.code
    }
  });
}

// Redirection vers "Anomalie"
function goToAnomalie() {
  MapsTo({
    name: 'BoatAnomalies',
    query: { boatCode: props.boat.code }
  });
}

</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/user/myboat_card';

</style>

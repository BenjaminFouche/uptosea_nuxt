<template>
  <div class="boat-detail-page">
    <UiToast
        v-if="toastMessage"
        :message="toastMessage"
        type="error"
        @close="toastMessage = null"
    />
    <Breadcrumbs></Breadcrumbs>

    <!-- État de chargement -->
    <LoadingSpinner v-if="isLoading" message="Chargement du bateau..." />

    <!-- État d'erreur -->
    <div v-else-if="error && !boat" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>Erreur de chargement</h3>
      <p>{{ error }}</p>
      <UiButton @click="goBackToList" variant="outline">
        Retour à la liste
      </UiButton>
    </div>

    <!-- Contenu du bateau -->
    <div v-else-if="boat" class="boat-detail-content">
      <!-- Galerie d'image -->
      <BoatGallery :images="images" :boat="boat" :alt-text="boat?.nomBapteme || 'Photo du bateau'"></BoatGallery>

      <!-- Informations du bateau -->
      <div class="boat-info-left">

        <h1 class="boat-title">{{ boat?.nomBapteme }} <span v-if="boat?.annee">({{ boat?.annee }})</span></h1>

        <!-- Localisation -->
        <div class="boat-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"
                  fill="none"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          <span style="text-transform: capitalize"> {{ [boat.franchise.ville, boat.franchise.pays].filter(item => item).join(', ').toLowerCase() }}</span>
        </div>

        <!-- Caractéristiques -->
        <BoatSpecs :boat="boat"/>

        <!-- Description -->
        <BoatDescription :description="boatDescription"/>

        <hr>

        <!-- Équipements -->
        <BoatEquipment
            :equipment-list="equipmentList"
            @show-all-equipment="handleShowAllEquipment"
        />

        <hr>

        <!-- Evènement -->
        <BoatEvenement
            :evenement-list="evenementList"
            @show-all-equipment="handleShowAllEquipment"
        />

        <!-- Fiche du bateau -->
        <BoatFiche v-if="boat?.lienDetails?.length > 0" :boat="boat"/>

        <hr v-if="boat?.lienDetails?.length > 0">

        <FaqSection/>

        <ReassuranceSection/>
      </div>
    </div>

    <!-- Section de prix -->
    <div v-if="!isLoading && boat" class="boat-actions">
      <div class="price-section">
        <span class="price-label">À partir de</span>
        <span class="price-amount">{{ (boat?.prixMinimal  / 100)}} €</span>
      </div>

      <div class="action-buttons">
        <UiButton
            variant="secondary"
            class="contact-btn"
            @click="handleContact"
        >
          CONTACTEZ-NOUS
        </UiButton>

        <UiButton
            variant="primary"
            class="reserve-btn"
            @click="isLoggedIn ? handleReservation() : goToLogin()"
        >
          RÉSERVER
        </UiButton>
      </div>
    </div>

    <!-- Section Annonces similaires -->
    <SimilarBoats v-if="!isLoading && boat" :current-boat="boat"/>

    <!-- Modal de réservation -->
    <BookingModal
        :show="showBookingModal"
        :boat="boat"
        @close="closeBookingModal"
        @submit="processBookingSubmission"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBoatsStore } from '../../stores/useBoatsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { ApiBoatService } from '../../services/apiBoat';
import UiButton from '../../components/ui/UiButton.vue';
import BoatSpecs from '../../components/boat-detail/BoatSpecs.vue';
import BoatEquipment from '../../components/boat-detail/BoatEquipment.vue';
import BoatDescription from '../../components/boat-detail/BoatDescription.vue';
import BoatEvenement from '../../components/boat-detail/BoatEvenement.vue';
import BoatGallery from '../../components/boat-detail/BoatGallery.vue';
import FaqSection from '../../components/common/FaqSection.vue';
import BoatFiche from '@/components/boat-detail/BoatFiche.vue';
import SimilarBoats from '../../components/boat-detail/SimilarBoats.vue';
import ReassuranceSection from '@/components/common/ReassuranceSection.vue';
import BookingModal from '@/components/boat-detail/BookingModal.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import Breadcrumbs from "@/components/common/Breadcrumbs.vue";
import UiToast from "@/components/ui/UiToast.vue";

const route = useRoute();
const router = useRouter();
const boatsStore = useBoatsStore();
const authStore = useAuthStore();

// État de connexion
const isLoggedIn = computed(() => authStore.isLoggedIn);

// État local
const boat = ref(null);
const isFavorite = ref(false);
const currentImageIndex = ref(0);
const isLoading = ref(true);
const error = ref(null);
const toastMessage = ref(null);

// Description du bateau
const boatDescription = ref('Description non disponible pour ce bateau.');

// Liste d'équipements
const equipmentList = ref([]);

// Liste des événements
const evenementList = ref([]);
const isLoadingEvenements = ref(false);

onMounted(async () => {
  const boatCode = route.params.code;

  if (!boatCode) {
    error.value = 'Code du bateau manquant';
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;

    const response = await ApiBoatService.getBoatById(boatCode);

    if (response && response.statut === 'success' && response.elements && response.elements.length > 0) {
      boat.value = response.elements[0];

      images.value = getBoatImages(boat.value);

      boatDescription.value = boat.value.descriptionFr;

      if (boat.value.equipements && Array.isArray(boat.value.equipements)) {
        equipmentList.value = boat.value.equipements.map(equipement => equipement.nom);
      } else {
        equipmentList.value = [];
      }

      if (boat.value.evenementsAutorises && Array.isArray(boat.value.evenementsAutorises)) {
        evenementList.value = boat.value.evenementsAutorises;
      } else {
        evenementList.value = [];
      }
    } else {
      error.value = 'Bateau non trouvé';
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur lors du chargement';
    error.value = msg;
    toastMessage.value = msg;
    console.error('Erreur:', err);
  } finally {
    isLoading.value = false;
  }

  const handleKeyPress = (event) => {
    if (images.value.length <= 1) return;

    if (event.key === 'ArrowLeft') {
      previousImage();
    } else if (event.key === 'ArrowRight') {
      nextImage();
    }
  };

  document.addEventListener('keydown', handleKeyPress);

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyPress);
  });
});

// Récupération image principale
const getBoatImages = (boat) => {
  const images = [];

  if (boat?.imagePrincipale) {
    const principaleUrl = typeof boat.imagePrincipale === 'string'
        ? boat.imagePrincipale
        : (boat.imagePrincipale.slug || boat.imagePrincipale.url || '');

    if (principaleUrl && principaleUrl.trim() !== '') {
      images.push(principaleUrl);
    }
  }

  if (boat?.mediasPresentationBateau && Array.isArray(boat.mediasPresentationBateau) && boat.mediasPresentationBateau.length > 0) {
    const mediasUrls = boat.mediasPresentationBateau.map(media => media.slug).filter(url => url && url.trim() !== '');
    mediasUrls.forEach(url => {
      if (!images.some(img => img === url)) {
        images.push(url);
      }
    });
  }

  if (boat?.image) {
    if (!images.some(img => img === boat.image)) {
      images.push(boat.image);
    }
  }

  if (boat?.images && Array.isArray(boat.images)) {
    boat.images.forEach(img => {
      if (typeof img === 'string' && img.trim() !== '' && !images.some(existing => existing === img)) {
        images.push(img);
      }
    });
  }

  if (images.length === 0) {
    images.push(
        'https://app.uptosea.com/images/produit.webp',
        'https://app.uptosea.com/images/produit.webp',
        'https://app.uptosea.com/images/produit.webp',
        'https://app.uptosea.com/images/produit.webp'
    );
  }

  return images;
};

const images = ref([
  'https://app.uptosea.com/images/produit.webp',
  'https://app.uptosea.com/images/produit.webp',
  'https://app.uptosea.com/images/produit.webp',
  'https://app.uptosea.com/images/produit.webp',
]);

// Fonction pour charger les événements
const loadEvenements = async () => {
  try {
    isLoadingEvenements.value = true;
    const response = await ApiBoatService.getBoatEvent();

    if (response.statut === 'success') {
      evenementList.value = response.elements || [];
    } else {
      console.error('Erreur API événements:', response.message);
      evenementList.value = [];
    }
  } catch (err) {
    console.error('Erreur lors du chargement des événements:', err);
    evenementList.value = [];
  } finally {
    isLoadingEvenements.value = false;
  }
};

const handleShowAllEquipment = (showAll) => {};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
};

const setCurrentImage = (index) => {
  currentImageIndex.value = index;
};

const nextImage = () => {
  const nextIndex = (currentImageIndex.value + 1) % images.value.length;
  setCurrentImage(nextIndex);
};

const previousImage = () => {
  const prevIndex = currentImageIndex.value === 0
      ? images.value.length - 1
      : currentImageIndex.value - 1;
  setCurrentImage(prevIndex);
};

const handleContact = () => {
  window.location.href = 'https://www.uptosea.com/contact/';
};

const showBookingModal = ref(false);

const handleReservation = () => {
  showBookingModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeBookingModal = () => {
  showBookingModal.value = false;
  document.body.style.overflow = 'auto';
};

const processBookingSubmission = (bookingData) => {
  // TODO: Envoyer les données de réservation à l'API
};

const goToLogin = () => {
  const currentPath = route.fullPath;
  navigateTo({
    path: '/login',
    query: { redirect: currentPath }
  });
};

const goBackToList = () => {
  navigateTo('/bateaux');
};
</script>

<style lang="scss">
@import 'assets/styles/scss/boats/boat-detail';
</style>

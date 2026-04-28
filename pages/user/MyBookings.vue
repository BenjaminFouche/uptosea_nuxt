<template>
  <div class="bookings-page-container">
    <div class="bookings-page">
      <div class="container">
        <Breadcrumbs></Breadcrumbs>
        <div class="bookings-page__header">
          <h1 class="bookings-page__title" v-if="activeFilter === 'attente_paiement'">Mon panier</h1>
          <h1 class="bookings-page__title" v-else>Mes réservations</h1>
          <p class="bookings-page__subtitle">Retrouvez toutes vos réservations de bateaux</p>
        </div>

        <div v-if="showSuccessMessage" class="confirmation-message" :class="{ 'fade-out': !showSuccessMessage }">
          <UiToast :message="`Réservation ${confirmationCode} annulée !`" type="info" />
        </div>

        <UiToast :message="error" />

        <div v-if="isLoading" class="loader-container">
          <LoadingSpinner v-if="isLoading" message="Chargement de vos réservations..." />
        </div>

        <div v-else-if="bookings.length === 0" class="bookings-page__empty">
          <div class="empty-illustration">
            <img src="../../assets/svg/icon-annulation.svg" alt="Aucune réservation"/>
          </div>
          <h3>Vous n'avez pas encore de réservations</h3>
          <p>Découvrez notre sélection de bateaux et planifiez votre prochaine aventure nautique</p>
          <NuxtLink to="/bateaux">
            <UiButton variant="primary" size="medium">Découvrir des bateaux</UiButton>
          </NuxtLink>
        </div>

        <div v-else>
          <div class="bookings-page__tabs">
            <div class="booking-tabs">
              <button
                  v-for="tab in tabs"
                  :key="tab.value"
                  @click="activeTab = tab.value"
                  :class="['booking-tabs__tab', { active: activeTab === tab.value }]"
              >
                <span class="booking-tabs__icon" v-html="tab.icon"></span>
                {{ tab.label }}
                <span v-if="getTabCount(tab.value)" class="booking-tabs__count">
                  {{ getTabCount(tab.value) }}
                </span>
              </button>
            </div>
          </div>

          <div class="bookings-page__filters">
            <div class="search-field">
              <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Rechercher une réservation (code, nom du bateau...)"
                  class="search-input"
              />
              <img src="../../assets/svg/loupe.svg" alt="Rechercher" class="search-icon"/>
            </div>

            <div class="filter-buttons">
              <button
                  v-for="filter in filters"
                  :key="filter.value"
                  @click="toggleFilter(filter.value)"
                  :class="['filter-button', { active: activeFilter === filter.value }]"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>

          <div v-if="paginatedFilteredBookings.length === 0 && searchQuery" class="bookings-page__empty search-empty">
            <h3>Aucun résultat</h3>
            <p>Aucune réservation ne correspond à votre recherche "{{ searchQuery }}"</p>
          </div>

          <div v-else class="bookings-list">
            <MyBookingCard
                :paginated-filtered-bookings="paginatedFilteredBookings"
                :total-filtered-pages="totalFilteredPages"
                :current-filtered-page="currentFilteredPage"
                :has-next-filtered-page="hasNextFilteredPage"
                :has-previous-filtered-page="hasPreviousFilteredPage"
                :is-loading="isLoading"
                @view-details="viewBookingDetails"
                @cancel-booking="confirmCancelBooking"
                @edit-booking="editBooking"
                @pay-booking="redirectToPaymentPage"
                @add-articles="openAddArticlesModal"
                @add-anomaly="openAnomalyModal"
                @previous-page="goToPreviousFilteredPage"
                @next-page="goToNextFilteredPage"
            />
          </div>
        </div>
      </div>
    </div>

    <CancelBookingModal
        v-model="showCancelModal"
        :booking="selectedBooking"
        :error="error"
        :is-canceling="isCanceling"
        :show-success-message="showSuccessMessage"
        @confirm="cancelBooking"
    />

    <div v-if="showSuccessMessage" class="confirmation-message" :class="{ 'fade-out': !showSuccessMessage }">
      <UiToast :message="successMessageText" type="info" @close="successMessageText = null" />
    </div>

    <BookingModal
        :show="showEditModal"
        :boat="selectedBoat"
        :booking="currentBooking"
        :edit-articles-only="editArticlesOnly"
        @close="closeEditModal"
        @submit="handleBookingUpdated"
        ></BookingModal>

    <AnomalyModal
        :is-open="showAnomalyModal"
        :is-edit="false"
        :hide-priority="true"
        @close="showAnomalyModal = false"
        @save="handleSaveAnomaly"
    />
  </div>
</template>

<script setup>
import {computed, ref, onMounted, watch} from 'vue'
import {useAuth} from '../../composables/useAuth.js'
import Default from '../../layouts/default.vue'
import UiButton from '../../components/ui/UiButton.vue'
import {ApiBookingService} from '../../services/apiBooking.js'
import BookingCard from '../../components/user/BookingCard.vue'
import BookingModal from '../../components/boat-detail/BookingModal.vue'
import MyBookingCard from '../../components/user/MyBookingCard.vue'
import CancelBookingModal from '../../components/user/CancelBookingModal.vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '../../stores/useAuthStore.js'
import {isValidCategoryUrl, urlToCategory} from "@/utils/categoryUrlUtils.js";
import {useBookingStore} from "@/stores/useBookingStore.js";
import {useBoatsStore} from "@/stores/useBoatsStore.js";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { useAnomalyStore } from '@/stores/useAnomalyStore.js';
import AnomalyModal from '@/components/user/proprietaire/AnomalyModal.vue';
import Breadcrumbs from "@/components/common/Breadcrumbs.vue";
import UiToast from "@/components/ui/UiToast.vue";

const router = useRouter()
const {user, isLoading: authLoading, token} = useAuth()
const bookingsStore = useBookingStore()
const isLoading = computed(() => bookingsStore.isLoading)

const storeError = computed(() => bookingsStore.error)
const actionError = ref(null)
const error = computed(() => actionError.value || storeError.value)

const bookings = computed(() => bookingsStore.allBookings && bookingsStore.allBookings.length > 0 ? bookingsStore.allBookings : bookingsStore.bookings)

const selectedBooking = ref(null)
const showCancelModal = ref(false)
const editArticlesOnly = ref(false);

const showEditModal = ref(false);
const selectedBoat = ref(null);
const currentBooking = ref(null);

const isCanceling = ref(false);
const showSuccessMessage = ref(false);
const confirmationCode = ref('');
const successMessageText = ref('');

const anomalyStore = useAnomalyStore();
const showAnomalyModal = ref(false);
const bookingForAnomaly = ref(null);

// Onglets et filtres
const searchQuery = ref('')
const activeFilter = ref('all')
const activeTab = ref('all')

const tabs = [
  {
    label: 'Toutes',
    value: 'all',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
  },
  {
    label: 'À venir',
    value: 'upcoming',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>'
  },
  {
    label: 'En cours',
    value: 'active',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
  },
  {
    label: 'Terminées',
    value: 'past',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path></svg>'
  }
]

const filters = [
  {label: 'En attente de paiement', value: 'attente_paiement'},
  {label: 'Réservation payée', value: 'payee'},]

const getTabCount = (tabValue) => {
  if (!bookings.value || !bookings.value.length) return 0;

  switch (tabValue) {
    case 'all':
      return bookings.value.length;
    case 'upcoming':
      return bookings.value.filter(booking => {
        const startDate = booking.dateDebut ? new Date(booking.dateDebut) : null;
        return startDate && startDate > new Date();
      }).length;
    case 'active':
      return bookings.value.filter(booking => {
        const startDate = booking.dateDebut ? new Date(booking.dateDebut) : null;
        const endDate = booking.dateFin ? new Date(booking.dateFin) : null;
        const today = new Date();
        return startDate && endDate && startDate <= today && endDate >= today;
      }).length;
    case 'past':
      return bookings.value.filter(booking => {
        const endDate = booking.dateFin ? new Date(booking.dateFin) : null;
        return endDate && endDate < new Date();
      }).length;
    default:
      return 0;
  }
}

// Réservations filtrées
const filteredBookings = computed(() => {
  if (!bookingsStore.allBookings) return [];

  let filtered = [...bookingsStore.allBookings];

  // Filtre de recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(booking =>
        (booking.bateau?.nom && booking.bateau?.nom.toLowerCase().includes(query)) ||
        (booking.bateau?.nomBapteme && booking.bateau?.nomBapteme.toLowerCase().includes(query)) ||
        (booking.code && booking.code.toLowerCase().includes(query))
    );
  }

  // Filtre par status
  if (activeFilter.value !== 'all') {
    if (activeFilter.value === 'upcoming') {
      filtered = filtered.filter(booking => {
        const endDate = booking.dateFin ? new Date(booking.dateFin) : null;
        return !endDate || endDate >= new Date();
      });
    } else if (activeFilter.value === 'attente_paiement') {
      filtered = filtered.filter(booking => {
        return booking.statutSlug === 'attente_paiement' || booking.supplementEnAttente === true;
      });
    } else if (activeFilter.value === 'payee' || activeFilter.value === 'terminee') {
      filtered = filtered.filter(booking => {
        return booking.statutSlug === activeFilter.value;
      });
    }
  }

  // Filtre par onglet (Toutes, À venir, En cours, Terminées)
  if (activeTab.value === 'upcoming') {
    filtered = filtered.filter(booking => {
      const startDate = booking.dateDebut ? new Date(booking.dateDebut) : null;
      return startDate && startDate > new Date();
    });
  } else if (activeTab.value === 'active') {
    filtered = filtered.filter(booking => {
      const startDate = booking.dateDebut ? new Date(booking.dateDebut) : null;
      const endDate = booking.dateFin ? new Date(booking.dateFin) : null;
      const today = new Date();
      return startDate && endDate && startDate <= today && endDate >= today;
    });
  } else if (activeTab.value === 'past') {
    filtered = filtered.filter(booking => {
      const endDate = booking.dateFin ? new Date(booking.dateFin) : null;
      return endDate && endDate < new Date();
    });
  }

  // Tri par date a venir
  const nowTime = Date.now();

  filtered.sort((a, b) => {
    if (!a.dateDebut) return 1;
    if (!b.dateDebut) return -1;

    const timeA = new Date(a.dateDebut).getTime();
    const timeB = new Date(b.dateDebut).getTime();

    // Reservation dans le futur
    const isAFuture = timeA >= nowTime;
    const isBFuture = timeB >= nowTime;

    // Futur avant le passé
    if (isAFuture && !isBFuture) return -1;
    if (!isAFuture && isBFuture) return 1;

    // Deux dans le futur on tri la plus proche
    if (isAFuture && isBFuture) {
      return timeA - timeB;
    }

    // Les deux dans le passé on tri la plus récente
    if (!isAFuture && !isBFuture) {
      return timeB - timeA;
    }
  });

  return filtered;
})

// Pagination
const itemsPerPage = 5;
const currentFilteredPage = ref(0);
const totalFilteredPages = computed(() => {
  return Math.ceil(filteredBookings.value.length / itemsPerPage);
});
const paginatedFilteredBookings = computed(() => {
  const start = currentFilteredPage.value * itemsPerPage;
  return filteredBookings.value.slice(start, start + itemsPerPage);
});
const hasNextFilteredPage = computed(() => {
  return currentFilteredPage.value < totalFilteredPages.value - 1;
});
const hasPreviousFilteredPage = computed(() => {
  return currentFilteredPage.value > 0;
});

const openAnomalyModal = (booking) => {
  bookingForAnomaly.value = booking;
  showAnomalyModal.value = true;
};

const handleBookingUpdated = (data) => {
  closeEditModal();

  successMessageText.value = `La réservation ${data.id || ''} a bien été mise à jour !`;
  showSuccessMessage.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(() => {
    showSuccessMessage.value = false;
  }, 3000);
};

const handleSaveAnomaly = async ({ formData, files }) => {
  try {
    formData.boatCode = bookingForAnomaly.value.bateau?.code || bookingForAnomaly.value.bateauCode;
    formData.actionLiee = bookingForAnomaly.value.code;
    formData.priorite = 'Moyenne';

    await anomalyStore.addAnomaly(formData, files);

    showAnomalyModal.value = false;
    showSuccessMessage.value = true;
    confirmationCode.value = "Anomalie déclarée avec succès !";

    setTimeout(() => { showSuccessMessage.value = false; }, 3000);

  } catch (err) {
    actionError.value = err.message || "Erreur lors de la déclaration de l'anomalie.";
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { actionError.value = null; }, 5000);
  } finally {
    showAnomalyModal.value = false;
  }
};

watch(() => router.currentRoute.value.query.statut, (newStatus) => {
  if (newStatus === 'attente_paiement') {
    activeFilter.value = 'attente_paiement';
  } else if (newStatus) {
    activeFilter.value = newStatus;
  }
  currentFilteredPage.value = 0;
}, { immediate: true });

// Watch search
watch(searchQuery, () => {
  currentFilteredPage.value = 0;
});

// Mounted
onMounted(async () => {
  isLoading.value = true;
  try {
    await bookingsStore.fetchBookings(0, 999);
    bookingsStore.itemsPerPage = 5;
    bookingsStore.goToPage(0);
  } catch (error) {
    console.error("Erreur lors du chargement des réservations:", error);
  } finally {
    isLoading.value = false;
  }
});

const viewBookingDetails = (booking) => {
  selectedBooking.value = booking;
};

const openAddArticlesModal = (booking) => {
  if (!booking || !booking.bateau) return;
  selectedBoat.value = booking.bateau;
  currentBooking.value = booking;
  editArticlesOnly.value = true;
  showEditModal.value = true;
};

const confirmCancelBooking = (booking) => {
  selectedBooking.value = booking;
  actionError.value = null;
  showCancelModal.value = true;
};

// Annulation
const cancelBooking = async () => {
  if (!selectedBooking.value || !selectedBooking.value.code) {
    actionError.value = 'Impossible d\'annuler la réservation. Aucune réservation sélectionnée.';
    return;
  }

  isCanceling.value = true;
  showSuccessMessage.value = false;
  actionError.value = null;
  confirmationCode.value = selectedBooking.value.code;

  try {
    const authToken = typeof token === 'object' && token?.value ? token.value : token || localStorage.getItem('token');
    if (!authToken) throw new Error('Token d\'authentification manquant');

    await ApiBookingService.cancelBooking(authToken, selectedBooking.value.code);
    await bookingsStore.fetchBasketCount();
    await bookingsStore.fetchBookings(0, bookingsStore.itemsPerPage);

    showCancelModal.value = false;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    showSuccessMessage.value = true;

    // Disparition du message de succès 2s
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 2000);

  } catch (err) {
    actionError.value = 'Erreur impossible de supprimer cette réservation veuillez contacter UPtoSEA';

    // Fermeture modal
    showCancelModal.value = false;
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Disparition de l'erreur après 10 secondes
    setTimeout(() => {
      actionError.value = null;
    }, 10000);

  } finally {
    isCanceling.value = false;
  }
};

const goToPreviousFilteredPage = () => {
  if (hasPreviousFilteredPage.value) {
    currentFilteredPage.value--;
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
};

const goToNextFilteredPage = () => {
  if (hasNextFilteredPage.value) {
    currentFilteredPage.value++;
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
};

const editBooking = (data) => {
  try {
    const bookingToEdit = data.booking;
    if (!bookingToEdit || !bookingToEdit.bateau) return;

    selectedBoat.value = bookingToEdit.bateau;
    currentBooking.value = bookingToEdit;
    editArticlesOnly.value = false;
    showEditModal.value = true;
  } catch (err) {
    console.error("Erreur édition:", err);
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

const redirectToPaymentPage = (booking) => {
  if (!booking || !booking.code) return;
  MapsTo(`/reservations/${booking.code}/paiement`);
};

const closeEditModal = () => {
  showEditModal.value = false;
  editArticlesOnly.value = false;
};
</script>

<style lang="scss" scoped>
@import 'assets/styles/scss/user/booking';

.search-empty {
  padding: 3rem 0;
  text-align: center;
  opacity: 0.7;
}
</style>
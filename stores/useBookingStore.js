import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ApiBoatService } from '../services/apiBoat';
import { ApiBookingService } from '../services/apiBooking';
import { useAuthStore } from './useAuthStore';

// import { useRouter } from 'vue-router';

export const useBookingStore = defineStore('booking', () => {
    // const router = useRouter();
    const allBookings = ref([]);
    const bookings = ref([]);
    const linkPayment = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const currentPage = ref(0);
    const itemsPerPage = ref(5)
    const totalBookings = ref(0);
    const hasFullCache = ref(false);
    const activeFilters = ref(null);

    const isBasketLoading = ref(true);
    const basketCount = ref(0);

    const hasBookings = computed(() => bookings.value.length > 0);
    const totalPages = computed(() => Math.ceil(totalBookings.value / itemsPerPage.value));
    const hasNextPage = computed(() => currentPage.value < totalPages.value - 1);
    const hasPreviousPage = computed(() => currentPage.value > 0);

    function updateDisplayedBookings() {
        const startIndex = currentPage.value * itemsPerPage.value;
        const endIndex = startIndex + itemsPerPage.value;
        bookings.value = allBookings.value.slice(startIndex, endIndex);
    }

    /**
     * @param {number} page
     * @param {number} limit
     */
    async function fetchBookings(page = 0, limit = 5) {
        isLoading.value = true;
        error.value = null;
        currentPage.value = page;
        itemsPerPage.value = limit;

        try {
          const authStore = useAuthStore();
const token = authStore.token;
            if (token) {
                const response = await ApiBookingService.getBookings(token);

                let processedBookings = [];
                if (response.elements && Array.isArray(response.elements)) {
                    if (response.elements.length > 0 && Array.isArray(response.elements[0])) {
                        processedBookings = response.elements[0];
                    }
                    else {
                        processedBookings = response.elements;
                    }
                } else if (response.elements) {
                    processedBookings = [response.elements];
                }

                allBookings.value = processedBookings;
                totalBookings.value = processedBookings.length;
                hasFullCache.value = true;

                updateDisplayedBookings();
            } else {
                error.value = "Vous devez être connecté pour voir vos réservations";
                await navigateTo('/login');
            }
        } catch (err) {
            error.value = "Impossible de charger vos réservations";
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Change de page et met à jour les réservations affichées
     * @param {number} page - Numéro de la page à afficher
     */
    function goToPage(page) {
        if (page >= 0 && page < totalPages.value) {
            currentPage.value = page;
            if (hasFullCache.value) {
                updateDisplayedBookings();
            } else {
                fetchBookings(page, itemsPerPage.value);
            }
        }
    }

    async function loadMoreBookings() {
        if (hasNextPage.value && !isLoading.value) {
            if (hasFullCache.value) {
                goToPage(currentPage.value + 1);
            } else {
                await fetchBookings(currentPage.value + 1, itemsPerPage.value);
            }
        }
    }

    async function loadPreviousBookings() {
        if (hasPreviousPage.value && !isLoading.value) {
            if (hasFullCache.value) {
                goToPage(currentPage.value - 1);
            } else {
                await fetchBookings(currentPage.value - 1, itemsPerPage.value);
            }
        }
    }

    async function fetchBasketCount() {
        isBasketLoading.value = true;
        if (!localStorage.getItem('token')) {
            basketCount.value = 0;
            isBasketLoading.value = false;
            return 0;
        }

        try {
            const count = await ApiBookingService.getBasketCount();
            basketCount.value = count;
            return count;
        } catch (err) {
            basketCount.value = 0;
            return 0;
        } finally {
            isBasketLoading.value = false;
        }
    }

    async function generateLinkPayment(bookingId) {
        isLoading.value = true;
        error.value = null;

        try {
          const authStore = useAuthStore();
const token = authStore.token;
            if (token) {
                const response = await ApiBookingService.getPaymentLink(token, bookingId);

                if (response && response.elements && Array.isArray(response.elements) && response.elements.length > 0) {
                    linkPayment.value = response.elements;
                } else if (response && response.linkPayment) {
                    linkPayment.value = response.linkPayment;
                } else if (response && Object.prototype.hasOwnProperty.call(response, 'locationPaiementUrl')) {
                    linkPayment.value = [response];
                }

                return linkPayment.value;
            } else {
                error.value = "Vous devez être connecté pour procéder au paiement";
                await navigateTo('/login');
                return null;
            }
        } catch (err) {
            error.value = "Impossible de générer le lien de paiement: " + (err.message || "Erreur inconnue");
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    async function checkPaymentStatus(bookingId) {
        isLoading.value = true
        error.value = null;

        try {
          const authStore = useAuthStore();
const token = authStore.token;
            if (token) {
                const response = await ApiBookingService.checkPaymentStatus(token, bookingId);
                return response;
            } else {
                error.value = "Vous devez être connecté pour vérifier le paiement";
                await navigateTo('/login');
                return null;
            }
        } catch (err) {
            error.value = "Impossible de vérifier le statut du paiement";
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Récupère une réservation par son identifiant
     * @param {string|number} id - Identifiant de la réservation
     * @returns {Promise<Object>} - La réservation trouvée
     */
    async function getBookingById(id) {
        if (!id) throw new Error("Identifiant de réservation requis");

        const cachedBooking = allBookings.value.find(booking => booking.id == id);
        if (cachedBooking) return cachedBooking;

        isLoading.value = true;
        error.value = null;

        try {
          const authStore = useAuthStore();
const token = authStore.token;
            if (!token) {
                throw new Error("Vous devez être connecté pour accéder à cette réservation");
            }

            const response = await ApiBookingService.getBookingById(token, id);
            if (!response || !response.elements) {
                throw new Error("Réservation introuvable");
            }

            let bookingData;
            if (Array.isArray(response.elements)) {
                bookingData = response.elements[0];
            } else {
                bookingData = response.elements;
            }

            return bookingData;
        } catch (err) {
            error.value = err.message || "Impossible de charger les détails de la réservation";
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Récupère un lien de paiement pour une réservation
     * @param {string|number} bookingId - Identifiant de la réservation
     * @returns {Promise<Object>} - Les données du lien de paiement
     */
    async function getPaymentLink(bookingId) {
        if (!bookingId) throw new Error("Identifiant de réservation requis");

        isLoading.value = true;
        error.value = null;

        try {
          const authStore = useAuthStore();
const token = authStore.token;
            if (!token) {
                throw new Error("Vous devez être connecté pour effectuer le paiement");
            }

            const response = await ApiBookingService.getPaymentLink(token, bookingId);
            if (!response || !response.elements) {
                throw new Error("Impossible de générer un lien de paiement");
            }

            let paymentData;
            if (Array.isArray(response.elements)) {
                paymentData = response.elements[0];
            } else {
                paymentData = response.elements;
            }

            linkPayment.value = paymentData;
            return paymentData;
        } catch (err) {
            console.error("Erreur lors de la génération du lien de paiement:", err);
            error.value = err.message || "Impossible de générer le lien de paiement";
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Rafraîchit une seule réservation depuis l'API et met à jour le state local
     */
    async function refreshSingleBooking(bookingId) {
        try {
          const authStore = useAuthStore();
const token = authStore.token;
            if (!token) return;

            const response = await ApiBookingService.getBookingById(token, bookingId);

            let updatedBooking;
            if (response.elements && Array.isArray(response.elements)) {
                updatedBooking = response.elements[0];
            } else {
                updatedBooking = response.elements || response;
            }

            if (updatedBooking) {
                const index = allBookings.value.findIndex(b => b.code === bookingId || b.id === bookingId);

                if (index !== -1) {
                    allBookings.value.splice(index, 1, { ...allBookings.value[index], ...updatedBooking });
                } else {
                    allBookings.value.unshift(updatedBooking);
                }

                // Met à jour la liste affichée
                updateDisplayedBookings();
            }
        } catch (err) {
            console.error(`Impossible de rafraîchir la réservation ${bookingId}`, err);
        }
    }

    return {
        allBookings,
        bookings,
        isLoading,
        error,
        currentPage,
        itemsPerPage,
        totalBookings,
        hasBookings,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        linkPayment,

        fetchBookings,
        goToPage,
        getBookingById,
        getPaymentLink,
        generateLinkPayment,
        checkPaymentStatus,
        loadMoreBookings,
        loadPreviousBookings,
        refreshSingleBooking,

        fetchBasketCount,
        isBasketLoading,
        basketCount,
    };
});
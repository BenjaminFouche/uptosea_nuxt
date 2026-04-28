<template>
  <div class="validation-container">
    <div v-if="loading" class="loader-container">
      <LoadingSpinner v-if="loading" message="Vérification du statut de paiement en cours..." />
    </div>

    <div v-else class="status-container">
      <div v-if="error" class="error-message">
        <h2>Une erreur s'est produite</h2>
        <p>{{ error }}</p>
        <NuxtLink to="/reservation" class="return-link">Retour à mes réservations</NuxtLink>
      </div>

      <div v-else-if="paymentStatus === 'PAID'" class="success-message">
        <h2>Paiement confirmé !</h2>
        <p>Votre paiement pour la réservation {{ bookingCode }} a été validé avec succès.</p>
        <NuxtLink to="/reservation" class="return-link">Voir mes réservations</NuxtLink>
      </div>

      <div v-else-if="isOwnerReservation && !paymentStatus" class="success-message">
        <h2>Réservation confirmée !</h2>
        <p>Votre réservation {{ bookingCode }} en tant que propriétaire a été validée avec succès.</p>
        <NuxtLink to="/reservation" class="return-link">Voir mes réservations</NuxtLink>
      </div>

      <div v-else-if="paymentStatus === 'RUNNING'" class="pending-message">
        <h2>Paiement en cours</h2>
        <p>Votre paiement pour la réservation {{ bookingCode }} est en cours de traitement.</p>
        <p>Veuillez patienter, cette page se rafraîchira automatiquement.</p>
      </div>

      <div v-else class="failed-message">
        <h2>Échec du paiement</h2>
        <p>Votre paiement pour la réservation n'a pas pu être validé.</p>
        <p>Vous pouvez réessayer ultérieurement ou contacter notre service client.</p>
        <NuxtLink to="/reservation" class="return-link">Retour à mes réservations</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import {ApiBookingService} from '../../services/apiBooking';
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Breadcrumbs from "@/components/common/Breadcrumbs.vue";

const route = useRoute();
const bookingId = ref(route.params.id);
const loading = ref(true);
const error = ref(null);
const paymentStatus = ref(null);
const bookingCode = ref('');
const isOwnerReservation = ref(route.query.isOwner === 'true');

const checkPayment = async () => {
  if (!bookingId.value) {
    error.value = "Identifiant de réservation non trouvé dans l'URL.";
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    const response = await ApiBookingService.checkPaymentStatus(null, bookingId.value);

    let paymentData = null;
    if (response && response.locationPaiementStatut) {
      paymentData = response; // Cas objet direct
    } else if (response && response.elements && response.elements.length > 0) {
      paymentData = response.elements[0];
    }

    if (paymentData) {
      paymentStatus.value = paymentData.locationPaiementStatut;
      bookingCode.value = paymentData.code;

      if (paymentStatus.value === 'RUNNING') {
        setTimeout(checkPayment, 5000);
      }
    } else {
      if (isOwnerReservation.value) {
        bookingCode.value = bookingId.value;
        paymentStatus.value = null;
      } else {
        error.value = "Aucune information de paiement n'a été trouvée pour cette réservation.";
      }
    }
  } catch (err) {
    if (isOwnerReservation.value && err?.response?.data?.detail?.includes('No payment order')) {
      bookingCode.value = bookingId.value;
      paymentStatus.value = null;
    } else {
      error.value = `Erreur lors de la vérification du paiement: ${err.message || err}`;
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  checkPayment();
});
</script>

<style lang="scss" scoped>
@import 'assets/styles/scss/booking/booking';
</style>
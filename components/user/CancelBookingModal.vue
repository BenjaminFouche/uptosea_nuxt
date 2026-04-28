<template>
  <div v-if="modelValue" class="cancel-modal">
    <div class="cancel-modal__backdrop" @click="$emit('update:modelValue', false)"></div>
    <div class="cancel-modal__content">
      <div class="cancel-modal__header">
        <h3>Confirmation d'annulation</h3>
        <button class="cancel-modal__close" @click="$emit('update:modelValue', false)" :disabled="isCanceling">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="cancel-modal__body">
        <div v-if="error && !showSuccessMessage" class="cancel-modal__error">
          <span class="error-icon">!</span>
          <p>{{ error }}</p>
        </div>
        <div v-else class="cancel-modal__message">
          <div class="cancel-modal__warning-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"
                  fill="#FF6B6B"/>
            </svg>
          </div>
          <h3>Annuler cette réservation ?</h3>
          <p>Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.</p>
          <div v-if="booking" class="cancel-modal__booking-info">
            <p><strong>Référence :</strong> {{ booking.code }}</p>
            <p><strong>Date :</strong> {{ formatDateRange(booking.dateDebut, booking.dateFin) }}</p>
          </div>
          <div class="cancel-modal__note">
            <p>Note : Les conditions d'annulation peuvent s'appliquer.</p>
          </div>
        </div>
      </div>

      <div class="cancel-modal__actions">
        <UiButton
            @click="$emit('update:modelValue', false)"
            variant="secondary"
            size="medium"
            :disabled="isCanceling"
        >
          Annuler
        </UiButton>
        <UiButton
            @click="$emit('confirm')"
            variant="danger"
            size="medium"
            :disabled="isCanceling"
            :loading="isCanceling"
        >
          {{ isCanceling ? 'En cours...' : 'Confirmer l\'annulation' }}
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import UiButton from '../ui/UiButton.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  booking: {
    type: Object,
    default: null
  },
  error: {
    type: String,
    default: null
  },
  isCanceling: {
    type: Boolean,
    default: false
  },
  showSuccessMessage: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue', 'confirm']);

const formatDateRange = (startDateStr, endDateStr) => {
  if (!startDateStr) return 'Date non spécifiée';

  const startDate = new Date(startDateStr);
  const endDate = endDateStr ? new Date(endDateStr) : null;

  if (isNaN(startDate.getTime())) return 'Date invalide';

  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

  const startFormatted = startDate.toLocaleDateString('fr-FR', options);

  if (!endDate || startDate.toDateString() === endDate.toDateString()) {
    return startFormatted;
  } else {
    const endFormatted = endDate.toLocaleDateString('fr-FR', options);
    return `${startFormatted} - ${endFormatted}`;
  }
};
</script>

<style lang="scss" scoped>
@import 'assets/styles/scss/user/booking';
</style>

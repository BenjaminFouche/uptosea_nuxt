<template>
  <div class="bookings-list">
    <div v-for="booking in paginatedFilteredBookings" :key="`booking-${booking.code}-${booking.montantTtcTotalReservation || 0}`" class="bookings-list__item">
      <BookingCard
          :booking="booking"
          @view-details="$emit('view-details', booking)"
          @cancel-booking="$emit('cancel-booking', booking)"
          @edit-booking="editBooking"
          @pay-booking="$emit('pay-booking', booking)"
          @add-articles="$emit('add-articles', booking)"
          @add-anomaly="$emit('add-anomaly', booking)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalFilteredPages > 1" class="pagination">
      <button
          class="pagination-arrow"
          :disabled="!hasPreviousFilteredPage || isLoading"
          @click="$emit('previous-page')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg>
      </button>

      <span class="pagination-info">
        Page {{ currentFilteredPage + 1 }} sur {{ totalFilteredPages }}
      </span>

      <button
          class="pagination-arrow"
          :disabled="!hasNextFilteredPage || isLoading"
          @click="$emit('next-page')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import BookingCard from './BookingCard.vue';

defineProps({
  paginatedFilteredBookings: {
    type: Array,
    required: true
  },
  totalFilteredPages: {
    type: Number,
    required: true
  },
  currentFilteredPage: {
    type: Number,
    required: true
  },
  hasNextFilteredPage: {
    type: Boolean,
    required: true
  },
  hasPreviousFilteredPage: {
    type: Boolean,
    required: true
  },
  isLoading: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['view-details', 'cancel-booking', 'edit-booking', 'pay-booking', 'previous-page', 'next-page', 'add-articles', 'add-anomaly']);
const editBooking = (data) => {
  emit('edit-booking', data);
};
</script>

<style lang="scss" scoped>
@import 'assets/styles/scss/user/booking';
</style>

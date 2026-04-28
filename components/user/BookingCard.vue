<template>
  <div class="booking-card-container">
    <div class="booking-card">

      <div class="booking-card__image">
        <img
            :src="bookingImage"
            :alt="booking.bateau?.nom || 'Réservation'"
            class="booking-card__img"
        />
        <div class="booking-card__statuses">
          <div v-for="(tag, index) in statusTags" :key="index" class="booking-card__status" :class="tag.class">
            {{ tag.label }}
          </div>
        </div>
      </div>

      <div class="booking-card__content">

        <div class="booking-card__header">
          <h3 class="booking-card__title">
            {{ booking.bateau?.nomBapteme || booking.bateau?.nom || 'Réservation' }}
          </h3>
          <span class="reference">Réf {{ booking.code }}</span>
        </div>

        <div class="booking-card__location">
          {{ booking.bateau?.port || "Les Sables d'Olonne" }}, France
        </div>

        <div class="booking-card__specs">
          <div class="spec-row">
            <span class="spec-label">Début</span>
            <span class="spec-value">
              {{ formatDate(booking.dateDebut) }}
              <span class="spec-time">
                {{ getStartHour(booking) }}
              </span>
            </span>
          </div>

          <div class="spec-row">
            <span class="spec-label">Fin</span>
            <span class="spec-value">
              {{ formatDate(booking.dateFin) }}
              <span class="spec-time">
                {{ getEndHour(booking) }}
              </span>
            </span>
          </div>

          <div class="spec-row">
            <span class="spec-label">À bord</span>
            <span class="spec-value">{{ booking.nombrePersonnes || 1 }} passagers</span>
          </div>
        </div>

        <div class="booking-card__price">
          <div class="booking-card__actions">

            <UiButton
                v-if="bookingEditable"
                @click="goBackToForm('date')"
                variant="warning"
                size="small"
            >
              Modifier
            </UiButton>

            <UiButton
                v-if="canDeclareAnomaly"
                @click="$emit('add-anomaly', booking)"
                variant="outline"
                size="small"
            >
              + Anomalie
            </UiButton>

            <UiButton
                v-if="booking.statutSlug === 'payee'"
                variant="outline"
                size="small"
                @click="$emit('add-articles')">
              Ajouter des articles
            </UiButton>

            <UiButton
                v-if="(canPayBooking && !isMultiDay && booking.montantTtcTotalReservation > 0) || booking.supplementEnAttente"
                @click.prevent="processPayment(booking)"
                variant="success"
                size="small"
                class="paid_button"
                :disabled="isProcessingPayment"
            >
              {{ isProcessingPayment ? 'Chargement...' : (
                booking.supplementEnAttente
                    ? `Payer les options`
                    : `Payer (${formatPrice(booking.montantTtcTotalReservation)})`
            ) }}
            </UiButton>

            <UiButton
                v-if="hasFactureLocation"
                @click="downloadFacture"
                variant="outline"
                size="small"
            >
              Télécharger facture
            </UiButton>

            <UiButton
                v-if="canCancel"
                @click="$emit('cancel-booking', booking)"
                variant="danger"
                size="small"
                class="cancel-button"
            >
              Annuler
            </UiButton>
          </div>

          <span v-if="!isMultiDay || isOwnerBooking" class="price-amount">
            {{ formatPrice(booking.montantTtcTotalReservation) }}
          </span>
          <span v-else class="price-amount devis-text">
            Sur devis
          </span>

        </div>

      </div>
    </div>

    <div v-if="paymentError" class="payment-error-toast">{{ paymentError }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import UiButton from '../ui/UiButton.vue';
import { useBookingStore } from '../../stores/useBookingStore';
import { isBookingEditable } from '../../utils/bookingUtils';

const props = defineProps({
  booking: {
    type: Object,
    required: true
  },
});

// Ajout de 'add-articles' dans les emits
const emit = defineEmits(['view-details', 'cancel-booking', 'edit-booking', 'add-articles', 'add-anomaly']);
const router = useRouter();
const bookingStore = useBookingStore();

const isProcessingPayment = ref(false);
const paymentError = ref(null);

const isBookingOngoing = computed(() => {
  if (!props.booking.dateDebut || !props.booking.dateFin) return false;

  const now = new Date();
  const start = new Date(props.booking.dateDebut);
  start.setHours(0, 0, 0, 0);

  const end = new Date(props.booking.dateFin);
  end.setHours(23, 59, 59, 999);

  return start <= now && end >= now;
});

const canDeclareAnomaly = computed(() => {
  const b = props.booking;

  // Vérification du statut
  let isTypeValid = false;
  if (b.typeAction) {
    const validTypes = ['185UTS', '183UTS', '180UTS'];
    isTypeValid = validTypes.includes(b.typeAction);
  } else {
    const validStatuses = ['payee', 'en_cours', 'terminee', 'confirmee', 'validee', 'confirme'];
    isTypeValid = validStatuses.includes(b.statutSlug) || (b.statutSlug === 'attente_paiement' && b.supplementEnAttente === true);
  }

  if (!isTypeValid) return false;

  // Vérification des dates et heures
  if (!b.dateDebut || !b.dateFin) return false;

  const now = new Date();

  // Récupération de l'heure de début exact
  const start = new Date(b.dateDebut);
  const startVal = b.creneauSlug || b.creneau || b.creneauDebut;
  const startKey = getInternalKey(startVal);
  const startHourStr = timeSlotHours.start[startKey];
  if (startHourStr) {
    start.setHours(parseInt(startHourStr), 0, 0, 0);
  } else {
    start.setHours(0, 0, 0, 0);
  }

  // Récupération de l'heure de fin exact
  const end = new Date(b.dateFin);
  const endVal = b.creneauFinSlug || b.creneauFin || b.creneauSlug || b.creneau || b.creneauDebut;
  const endKey = getInternalKey(endVal);
  const endHourStr = timeSlotHours.end[endKey];
  if (endHourStr) {
    end.setHours(parseInt(endHourStr), 0, 0, 0);
  } else {
    end.setHours(23, 59, 59, 999);
  }

  return start <= now && end >= now;
});

const isMultiDay = computed(() => {
  if (!props.booking.dateDebut || !props.booking.dateFin) return false;

  const d1 = new Date(props.booking.dateDebut);
  const d2 = new Date(props.booking.dateFin);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;

  return d1.toDateString() !== d2.toDateString();
});

const isOwnerBooking = computed(() => {
  return props.booking.reservationProprietaire === true || props.booking.typeAction === 'LOCATION_PROPRIETAIRE';
});

// Mapping des heures de début et de fin
const timeSlotHours = {
  start: { 'morning': '5h', 'morning-half': '9h', 'afternoon': '14h', 'sunset': '19h' },
  end:   { 'morning': '8h', 'morning-half': '13h', 'afternoon': '18h', 'sunset': '22h' }
};

const internalKeys = {
  'lever': 'morning',
  'matin': 'morning-half', 'matinée': 'morning-half', 'matinee': 'morning-half',
  'apresmidi': 'afternoon', 'après-midi': 'afternoon', 'apres-midi': 'afternoon',
  'coucher': 'sunset'
};

const getInternalKey = (slug) => {
  if (!slug) return '';
  const s = String(slug).toLowerCase().trim();

  if (timeSlotHours.start[s]) return s;
  if (internalKeys[s]) return internalKeys[s];

  if (s.includes('lever')) return 'morning';
  if (s.includes('matin') || s.includes('09h')) return 'morning-half';
  if (s.includes('apres') || s.includes('après') || s.includes('14h')) return 'afternoon';
  if (s.includes('coucher') || s.includes('19h')) return 'sunset';

  return '';
};

const getStartHour = (b) => {
  if (!b) return '';
  const val = b.creneauSlug || b.creneau || b.creneauDebut;
  if (!val) return '';
  const key = getInternalKey(val);
  const hour = timeSlotHours.start[key];
  return hour ? `à ${hour}` : `(${val})`;
};

const getEndHour = (b) => {
  if (!b) return '';
  const val = b.creneauFinSlug || b.creneauFin || b.creneauSlug || b.creneau || b.creneauDebut;
  if (!val) return '';
  const key = getInternalKey(val);
  const hour = timeSlotHours.end[key];
  return hour ? `à ${hour}` : `(${val})`;
};

const hasFactureLocation = computed(() => {
  return props.booking?.facturesLocation && Array.isArray(props.booking.facturesLocation) && props.booking.facturesLocation.length > 0;
});

const goBackToForm = (focusField = null) => {
  const creneauMapping = {
    'Lever de soleil': 'morning',
    'Coucher de soleil': 'sunset',
    'Matinée': 'morning-half',
    '09h00 - 12h00': 'morning-half',
    'Après-midi': 'afternoon',
    '14h00 - 17h00': 'afternoon'
  };

  const payload = {
    ...props.booking,
    creneauSlug: creneauMapping[props.booking.creneau] || 'morning',
  };

  emit('edit-booking', { booking: payload, focusField });
};

const bookingImage = computed(() => {
  let image = '';
  const boat = props.booking?.bateau;
  if (boat?.imagePrincipale?.slug) image = boat.imagePrincipale.slug;
  else if (boat?.images && Array.isArray(boat.images) && boat.images.length > 0) image = boat.images[0];
  if (!image) image = 'https://app.uptosea.com/images/produit.webp';
  return image.includes('?') ? `${image}&w=670` : `${image}?w=670`;
});

const statusTags = computed(() => {
  const b = props.booking;
  let tags = [];
  const slug = b.statutSlug?.toLowerCase();

  // Annulation
  if (['cancelled', 'annule', 'annulée', 'annulee'].includes(slug)) {
    return [{ label: 'Annulée', class: 'cancelled' }];
  }

  // Vérification du paiement
  // Si c'est en attente de paiement
  const isCoreUnpaid = slug === 'attente_paiement' && !b.supplementEnAttente;

  if (isCoreUnpaid) {
    tags.push({ label: 'En attente de paiement', class: 'attente_paiement warning' });
  } else {
    let isPast = false;
    let isOngoing = false;

    if (b.dateDebut && b.dateFin) {
      const now = new Date();

      const start = new Date(b.dateDebut);
      const startKey = getInternalKey(b.creneauSlug || b.creneau || b.creneauDebut);
      const startHourStr = timeSlotHours.start[startKey];
      if (startHourStr) start.setHours(parseInt(startHourStr), 0, 0, 0);
      else start.setHours(0, 0, 0, 0);

      const end = new Date(b.dateFin);
      const endKey = getInternalKey(b.creneauFinSlug || b.creneauFin || b.creneauSlug || b.creneau || b.creneauDebut);
      const endHourStr = timeSlotHours.end[endKey];
      if (endHourStr) end.setHours(parseInt(endHourStr), 0, 0, 0);
      else end.setHours(23, 59, 59, 999);

      if (now > end) {
        isPast = true;
      } else if (now >= start && now <= end) {
        isOngoing = true;
      }
    }

    if (isPast) {
      tags.push({ label: 'Terminée', class: 'terminee completed payee' });
    } else if (isOngoing) {
      tags.push({ label: 'En cours', class: 'en_cours payee' });
    } else {
      // Événements futurs
      if (slug === 'attente_validation') {
        tags.push({ label: 'En attente de validation', class: 'attente_validation warning' });
      }
      else if (slug === 'attente_devis' || slug === 'pending_devis') {
        tags.push({ label: 'En attente de devis', class: 'attente_devis warning' });
      }
      else {
        if (isOwnerBooking.value) {
          tags.push({ label: 'Réservation propriétaire', class: 'payee success' });
        } else {
          tags.push({ label: 'Réservation confirmée', class: 'payee success' });
        }
      }
    }
  }

  // Options en attente
  if (b.supplementEnAttente) {
    tags.push({ label: 'Options en attente de paiement', class: 'attente_paiement warning' });
  }

  return tags;
});

const canCancel = computed(() => {
  const b = props.booking;
  const status = b.statutSlug?.toLowerCase();

  // Proprietaire toujours annulable tant que pas annulé
  if (isOwnerBooking.value) {
    return !['cancelled', 'annulé', 'annulée', 'annulee'].includes(status);
  }

  if (status === 'attente_paiement' && b.supplementEnAttente && isBookingOngoing.value) {
    return false;
  }

  if (!status || ['cancelled', 'annulé', 'completed', 'terminé'].includes(status)) return false;

  if (b.conditionAnnulation === '2UTS') {
    // Si seulement le suplément est pas payé on bloque pas la réservation
    return status === 'attente_paiement' && !b.supplementEnAttente;
  }

  return true;
});

const bookingEditable = computed(() => {
  const b = props.booking;
  const status = b.statutSlug?.toLowerCase();

  // Proprietaire toujours modifiable tant que pas annulé
  if (isOwnerBooking.value) {
    return !['cancelled', 'annulé', 'annulée', 'annulee'].includes(status);
  }

  if (isBookingOngoing.value) return false;
  if (b.supplementEnAttente) return false;
  if (['payee', 'validee', 'confirmee', 'terminee'].includes(status)) return false;
  return isBookingEditable(b);
});

const canPayBooking = computed(() => props.booking.statutSlug === 'attente_paiement');

const processPayment = async (booking) => {
  if (!booking || !booking.code) {
    paymentError.value = 'ID de réservation manquant.';
    return;
  }
  isProcessingPayment.value = true;
  paymentError.value = null;
  try {
    const paymentData = await bookingStore.getPaymentLink(booking.code);

    // CORRECTION : Même recherche agressive que pour la Modale
    let paymentUrl = null;
    if (paymentData?.locationPaiementUrl) paymentUrl = paymentData.locationPaiementUrl;
    else if (paymentData?.[0]?.locationPaiementUrl) paymentUrl = paymentData[0].locationPaiementUrl;
    else if (paymentData?.elements?.[0]?.locationPaiementUrl) paymentUrl = paymentData.elements[0].locationPaiementUrl;

    if (paymentUrl && paymentUrl !== "null" && paymentUrl.includes('http')) {
      window.open(paymentUrl, '_blank');
    } else {
      throw new Error('URL de paiement générée invalide.');
    }
  } catch (error) {
    console.error('Erreur:', error);
    paymentError.value = 'Impossible de générer un nouveau lien de paiement.';
    setTimeout(() => paymentError.value = null, 5000);
  } finally {
    isProcessingPayment.value = false;
  }
};

const formatPrice = (price) => {
  if (!price) return '--- €';
  return (price / 100).toFixed(2) + ' €';
};

const formatDate = (dateString) => {
  if (!dateString) return '---';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch (e) {
    return dateString;
  }
};

async function downloadFacture() {
  try {
    const pdfUrl = props.booking?.facturesLocation?.[0]?.slug;
    if (!pdfUrl) return alert('Aucune facture disponible.');
    window.open(pdfUrl, '_blank');
  } catch (error) {
    alert('Impossible de télécharger la facture.');
  }
}
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/user/booking_card';

.payment-error-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ef4444;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  font-size: 0.9rem;
  font-weight: 500;
}

.booking-card__statuses {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  z-index: 2;
}

.booking-card__statuses .booking-card__status {
  position: relative;
  top: auto;
  right: auto;
  margin: 0;
}

</style>
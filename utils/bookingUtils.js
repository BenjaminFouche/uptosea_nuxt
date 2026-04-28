/**
 * Vérifie si une réservation est modifiable
 * @param {Object} booking - La réservation à vérifier
 * @returns {boolean} - True si la réservation peut être modifiée, false sinon
 */
export function isBookingEditable(booking) {
  // Une réservation est modifiable si son statut est "attente_paiement"
  return booking && booking.statutSlug === 'attente_paiement';
}

/**
 * Fonction pour revenir au formulaire en mode édition
 * @param {Object} options - Options pour la navigation
 * @param {ref} options.currentStep - Référence à la variable currentStep
 * @param {ref} options.apiError - Référence à la variable apiError
 * @param {string} focusField - Champ à mettre en focus (date, timeSlot, options)
 */
export function goBackToForm({ currentStep, apiError }, focusField = null) {
  if (currentStep) currentStep.value = 'form';
  if (apiError) apiError.value = null;

  if (focusField) {
    setTimeout(() => {
      switch (focusField) {
        case 'date':
          document.getElementById('booking-date')?.focus();
          break;
        case 'timeSlot':
          document.querySelector('.time-slots')?.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'options':
          document.querySelector('.options-list')?.scrollIntoView({ behavior: 'smooth' });
          break;
      }
    }, 100);
  }
}

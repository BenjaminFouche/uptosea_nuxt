<template>
  <!-- Caractéristique d'un bateau -->
  <div class="boat-specs">
    <div class="spec-item" v-if="boat.longueur">
      <span class="spec-label">Longueur</span>
      <span class="spec-value">{{ boat.longueur }} m</span>
    </div>
    <div class="spec-item" v-if="boat.marque">
      <span class="spec-label">Marque</span>
      <span class="spec-value">{{ boat.marque }}</span>
    </div>
    <div class="spec-item" v-if="boat.famille">
      <span class="spec-label">Famille</span>
      <span class="spec-value">{{ boat.famille }}</span>
    </div>
       <div class="spec-item" v-if="boat.puissance">
      <span class="spec-label">Puissance</span>
      <span class="spec-value">{{ boat.puissance }} CV</span>
    </div>
    <div class="spec-item" v-if="boat.tirantEauMin">
      <span class="spec-label">Tirant d'eau</span>
      <span class="spec-value">{{ boat.tirantEauMin }} m</span>
    </div>
    <div class="spec-item" v-if="boat.nombreDePersonnesAutorisees">
      <span class="spec-label">Passagers</span>
      <span class="spec-value">{{ boat.nombreDePersonnesAutorisees }} <span v-if="boat.nombreDePersonnesAutorisees > 1">Passagers</span><span v-else>Passager</span></span>
    </div>
    <div class="spec-item permis" v-if="boat.permisObligatoire">
      <span class="spec-label">Permis obligatoire</span>
    </div>

    <div class="spec-item skipper" v-if="boat.skipperObligatoire && boat.experience === true">
      <span class="spec-value skipper-label">Skipper obligatoire ou expérience sur ce type de bateau</span>
    </div>

    <div class="spec-item skipper" v-else-if="boat.skipperObligatoire === true">
      <span class="spec-value skipper-label">Skipper obligatoire</span>
    </div>

    <div class="spec-item skipper" v-else>
      <span class="spec-value skipper-label">Expérience sur ce type de bateau</span>
    </div>
  </div>
</template>

<script setup>

/**
 * @typedef {Object} Props
 * @property {Boat} boat
 */

defineProps(['boat']);
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/boat-detail/boat-specs';
</style>

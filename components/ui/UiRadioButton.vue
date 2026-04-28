<template>
  <div class="reservation-toggle-wrapper">
    <div
        :class="['toggle-switch', { 'is-multi': modelValue === 'multi' }]"
        @click="toggleValue"
        role="switch"
        :aria-checked="modelValue === 'multi'"
    >
      <span class="toggle-label single-label">Journée simple</span>
      <div class="toggle-track">
        <div class="toggle-thumb"></div>
      </div>
      <span class="toggle-label multi-label">Multi-journée</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Utilisation de modelValue pour l'intégration v-model
  modelValue: {
    type: String, // 'single' ou 'multi'
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

// Logique pour basculer entre 'single' et 'multi'
const toggleValue = () => {
  const newValue = props.modelValue === 'single' ? 'multi' : 'single';
  emit('update:modelValue', newValue);
};

</script>

<style scoped lang="scss">
// Variables de base
$toggle-height: 28px;
$toggle-width: 50px;
$thumb-size: 20px;
$color-single: #a0a0a0;

.reservation-toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.toggle-track {
  width: $toggle-width;
  height: $toggle-height;
  border-radius: $toggle-height / 2;
  background-color: $color-single;
  position: relative;
  transition: background-color 0.3s ease;

  background-color: lighten($color-single, 15%);

  .toggle-switch.is-multi & {
    background-color: $primary-color;
  }
}

.toggle-thumb {
  position: absolute;
  top: ($toggle-height - $thumb-size) / 2;
  left: ($toggle-height - $thumb-size) / 2; /* Position de départ (côté "single") */
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  transition: transform 0.3s ease-in-out, background-color 0.3s ease;

  .toggle-switch.is-multi & {
    transform: translateX($toggle-width - $thumb-size - ($toggle-height - $thumb-size));
  }
}
</style>
<template>
  <div class="help-section">
    <div class="help-content">
      <h3 class="help-title">Besoin d'aide pour organiser votre prochaine sortie ?</h3>
      <p class="help-description">
        Planifiez votre aventure en toute simplicité avec nos outils et conseils personnalisés ! Que ce soit pour une escapade en nature, une soirée entre amis ou un voyage culturel, nous vous accompagnons à chaque étape pour créer des moments inoubliables. Laissez-vous guider et profitez pleinement de votre expérience sans stress.
      </p>
      <UiButton @click="handleContactExpert" class="help-button" variant="primary">
        CONTACTEZ-NOUS
      </UiButton>
    </div>
  </div>
</template>

<script setup>
import UiButton from '../ui/UiButton.vue';
const emit = defineEmits(['contactExpert']);

const handleContactExpert = () => {
  window.location.href = 'https://www.uptosea.com/contact/';
};
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/help-section';
</style>

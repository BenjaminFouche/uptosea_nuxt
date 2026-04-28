<template>
  <div class="email-verification-page">
    <div class="verification-container">
      <HeaderModal
          title="Vérification Email"
          :showArrow="false"
      />

      <div class="verification-content">
        <div v-if="isLoading" class="loader-container">
          <LoadingSpinner v-if="isLoading" message="Vérification en cours..." />
        </div>

        <div v-if="!isLoading" class="verification-icon">
          <div class="captain-hat">
            <img src="../../assets/svg/chapeau-de-capitaine.svg" alt="Chapeau de capitaine">
          </div>
        </div>

        <h2 v-if="!isLoading" class="verification-title-content">
          {{ status === 'success' ? 'Bienvenue à bord !' : 'Lien non valide' }}
        </h2>

        <div class="separator-line"></div>

        <div v-if="!isLoading" class="verification-details">
          <h3 class="verification-subtitle-content">
            {{ status === 'success' ? 'Votre compte est activé' : 'Vérification impossible' }}
          </h3>
          <p class="details-text">
            {{ message }}
          </p>
        </div>

        <div v-if="!isLoading" class="verification-actions">
          <UiButton
              v-if="status === 'success'"
              @click="redirectToLogin"
              class="primary"
          >
            Se connecter
          </UiButton>
          <UiButton
              v-if="status === 'error'"
              @click="redirectToHome"
              class="primary"
          >
            Retour à l'accueil
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import UiButton from '@/components/ui/UiButton.vue';
import { ApiAuthService } from '@/services/apiAuth';
import HeaderModal from "@/components/common/HeaderModal.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

// Props pour récupérer les paramètres de l'URL
const props = defineProps({
  expires: String,
  id: String,
  signature: String,
  token: String
});

const router = useRouter();
const route = useRoute();

const isLoading = ref(true);
const status = ref('');
const message = ref('');

// Rediriger vers la page d'accueil
const redirectToHome = () => {
  MapsTo('/');
};

// Rediriger vers la page de connexion
const redirectToLogin = () => {
  MapsTo('/login');
};

// Vérifier l'email au chargement de la page
onMounted(async () => {
  try {
    // Récupération des paramètres
    const params = {
      expires: props.expires || route.query.expires,
      id: props.id || route.query.id,
      signature: props.signature || route.query.signature,
      token: props.token || route.query.token
    };

    if (!params.expires || !params.id || !params.signature || !params.token) {
      throw new Error('Lien de vérification invalide ou incomplet');
    }

    // Vérification de l'email
    const response = await ApiAuthService.verifyEmail(params);

    status.value = 'success';
    message.value = 'Votre email a bien été confirmé. Votre compte est désormais actif et prêt à naviguer. Connectez-vous pour accéder à votre espace.';
  } catch (error) {
    // Message d'erreur
    status.value = 'error';
    message.value = 'Ce lien de confirmation semble avoir expiré ou a déjà été utilisé. Veuillez réessayer ou contacter le support.';
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/auth/email-verification';
</style>

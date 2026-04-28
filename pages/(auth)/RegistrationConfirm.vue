<template>
  <div class="confirmation-page">
    <div class="confirmation-container">
      <HeaderModal
          title="Inscription confirmée"
          :showArrow="false"
      />

      <div class="confirmation-content">
        <div class="confirmation-icon">
          <div class="captain-hat">
            <img src="../../assets/svg/chapeau-de-capitaine.svg" alt="Chapeau de capitaine">
          </div>
        </div>

        <h2 class="confirmation-title-content">
          Bienvenue à bord<br>
          de l'aventure UPtoSEA !
        </h2>

        <div class="separator-line"></div>

        <div class="confirmation-details">
          <h3 class="confirmation-title-content">Merci pour votre inscription</h3>
          <p class="details-text">
            Votre compte a été créé avec succès.<br>
            <b style="font-weight: bold; color: black">Un lien de confirmation vous a été envoyé par email.</b> Cliquez dessus pour activer votre compte et vous connecter."
          </p>
        </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import UiButton from '../../components/ui/UiButton.vue'
import HeaderModal from "@/components/common/HeaderModal.vue";

const router = useRouter()

function goToExplore() {
  navigateTo('/login')
}

function goToProfile() {
  navigateTo('/user/profile')
}
</script>

<style lang="scss">
@import 'assets/styles/scss/auth/confirm';

.confirmation-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  padding-bottom: 0;
  background-color: white;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  z-index: 10;

  button {
    width: 100%;
  }
}

</style>

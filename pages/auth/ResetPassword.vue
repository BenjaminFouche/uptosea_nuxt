<template>
  <div class="reset-password-page">
    <div class="reset-password-container">
      <HeaderModal
          title="Réinitialisation du mot de passe"
          @close="goBack"
      />

      <div v-if="!resetComplete" class="reset-password-form">
        <div class="form-section">
          <h2 class="section-title">Créez votre nouveau mot de passe</h2>
          <p class="section-description">
            Veuillez entrer votre nouveau mot de passe ci-dessous. Pour votre sécurité, le mot de passe doit contenir au moins 12 caractères une majuscule et un caractère spécial ou un chiffre.
          </p>

          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <PasswordInput
                  id="password"
                  v-model="password"
                  label="Nouveau mot de passe"
                  placeholder="Minimum 12 caractères"
                  :error="passwordError"
                  required
                  @input="validatePasswords"
              />
              <p v-if="passwordError" class="form-error">{{ passwordError }}</p>
            </div>

            <div class="form-group">
              <PasswordInput
                  id="confirmPassword"
                  v-model="confirmPassword"
                  label="Confirmation du mot de passe"
                  placeholder="Confirmez votre mot de passe"
                  :error="confirmPasswordError"
                  required
                  @input="validatePasswords"
              />
              <p v-if="confirmPasswordError" class="form-error">{{ confirmPasswordError }}</p>
            </div>

            <div class="form-actions">
              <UiButton
                  type="submit"
                  :loading="isLoading"
                  :disabled="!isFormValid || isLoading"
                  class="primary"
              >
                {{ isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}
              </UiButton>
            </div>

            <p v-if="error" class="global-error">{{ error }}</p>
          </form>
        </div>
      </div>

      <!-- Confirmation de réinitialisation -->
      <div v-else class="success-message">
        <div class="success-icon">✓</div>
        <h2 class="success-title">Mot de passe réinitialisé !</h2>
        <p class="success-description">
          Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
        </p>
        <div class="success-actions">
          <UiButton @click="goToLogin" class="primary">
            Se connecter
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/useAuthStore.js'
import UiButton from '../../components/ui/UiButton.vue'
import PasswordInput from '../../components/ui/UiPasswordInput.vue'
import HeaderModal from "@/components/common/HeaderModal.vue";

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Props pour récupérer le token
const props = defineProps({
  token: {
    type: String,
    default: ''
  }
})

// Récupération du token
const token = ref('')

// État
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const resetComplete = ref(false)

onMounted(() => {
  if (props.token) {
    token.value = props.token
  }
  else if (route.query.token) {
    token.value = route.query.token
  }
  if (!token.value) {
    MapsTo('/login')
  }
})

watch(() => props.token, (newToken) => {
  if (newToken) {
    token.value = newToken
  }
})

// Validation des mots de passe
function validatePasswords() {
  error.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  // Validation du mot de passe
  if (password.value && password.value.length < 12) {
    passwordError.value = 'Le mot de passe doit contenir au moins 12 caractères'
  }

  // Validation de la confirmation
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Les mots de passe ne correspondent pas'
  }
}

const isFormValid = computed(() => {
  return password.value.length >= 8 &&
      password.value === confirmPassword.value &&
      !passwordError.value &&
      !confirmPasswordError.value
})

// Retour en arrière
function goBack() {
  router.go(-1)
}

// Redirection vers la page de connexion
function goToLogin() {
  MapsTo('/login')
}

// Soumission du formulaire
async function handleSubmit() {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = ''

  try {
    await authStore.resetPassword(token.value, password.value)
    resetComplete.value = true
  } catch (err) {
    error.value = err.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe'
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss">
@import 'assets/styles/scss/auth/reset-password';
</style>
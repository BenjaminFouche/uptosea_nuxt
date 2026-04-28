<template>
  <div class="login-page">
    <div class="login-container">
      <HeaderModal
          title="Connexion"
          @close="goBack"
      />

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-section">
          <h2 class="section-title">Bienvenue sur UPtoSEA</h2>

          <div class="form-grid">
            <div class="form-group form-group-full">
              <label for="email" class="form-label">Adresse e-mail<span class="required">*</span></label>
              <input
                  type="email"
                  id="email"
                  v-model="formData.email"
                  @input="clearError('email')"
                  placeholder="exemple@gmail.com"
                  class="form-input"
                  :class="{ 'error': errors.email }"
                  required
              />
              <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
            </div>

            <div class="form-group form-group-full">
              <PasswordInput
                  id="password"
                  v-model="formData.password"
                  label="Mot de passe"
                  placeholder="Mot de passe"
                  :error="errors.password"
                  required
                  @input="clearError('password')"
              />
              <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
            </div>
          </div>

          <!-- Bouton de connexion -->
          <div class="form-actions">
            <UiButton
                type="submit"
                :loading="isLoading"
                :disabled="!isFormValid || isLoading"
                class="primary"
            >
              {{ isLoading ? 'Connexion...' : 'Se connecter' }}
            </UiButton>
          </div>

          <!-- Message d'erreur -->
          <div v-if="errors.general" class="form-error-global">
            {{ errors.general }}
          </div>
        </div>
      </form>

        <hr class="hr-google">

      <div class="google-login-container">
        <ClientOnly>
        <GoogleLogin :callback="handleGoogleCallback" />
          <template #fallback>
            <div class="google-placeholder">Chargement du bouton Google...</div>
          </template>
        </ClientOnly>
      </div>

      <div class="auth-separator">
        <hr class="separator-line">
      </div>

      <!-- Actions -->
      <div class="auth-actions">
        <div class="auth-action">
          <p>Vous n'avez pas de compte ?</p>
          <RouterLink to="/register">
            <button class="link-button">S'inscrire</button>
          </RouterLink>
        </div>

        <div class="auth-action">
          <RouterLink to="/forgot-password">
            <button class="link-button">J'ai oublié mon mot de passe</button>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../../composables/useAuth.js'
import { useAuthStore } from '../../stores/useAuthStore.js'
import UiButton from '../../components/ui/UiButton.vue'
import PasswordInput from '../../components/ui/UiPasswordInput.vue'
import { GoogleLogin } from 'vue3-google-login'
import HeaderModal from "@/components/common/HeaderModal.vue";

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const { login, isLoading, clearError: clearAuthError } = useAuth()

// Données du formulaire
const formData = reactive({
  email: '',
  password: ''
})

// Erreurs
const errors = reactive({
  email: '',
  password: '',
  general: ''
})

// Validation du formulaire
const isFormValid = computed(() => {
  return formData.email.trim() !== '' &&
      formData.password.trim() !== '' &&
      isValidEmail(formData.email)
})

// Validation de l'email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Nettoyage des erreurs
function clearError(field) {
  if (errors[field]) {
    errors[field] = ''
  }
  if (errors.general) {
    errors.general = ''
  }
  clearAuthError()
}

// Validation des champs
function validateForm() {
  let isValid = true

  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  if (!formData.email.trim()) {
    errors.email = 'L\'adresse e-mail est obligatoire'
    isValid = false
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'L\'adresse e-mail n\'est pas valide'
    isValid = false
  }

  if (!formData.password.trim()) {
    errors.password = 'Le mot de passe est obligatoire'
    isValid = false
  }

  return isValid
}

// Soumission du formulaire
async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  try {
    await login(formData.email, formData.password)

    await new Promise(resolve => setTimeout(resolve, 100))
    const redirectPath = route.query.redirect

    if (redirectPath && typeof redirectPath === 'string' && redirectPath.startsWith('/')) {
      await router.replace(redirectPath)
    } else if (authStore.isProprietaire) {
      await router.replace('/dashboard')
    } else {
      await router.replace('/bateaux')
    }
  } catch (error) {
    if (error.message.includes('email') || error.message.includes('utilisateur')) {
      errors.email = 'Adresse e-mail incorrecte'
    } else if (error.message.includes('mot de passe') || error.message.includes('password')) {
      errors.password = 'Mot de passe incorrect'
    } else if (error.message.toLowerCase().includes('invalid credential') ||
        error.message.toLowerCase().includes('credentials') ||
        error.message.toLowerCase().includes('unauthorized')) {
      errors.general = 'Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe.'
    } else {
      errors.general = error.message || 'Erreur lors de la connexion. Veuillez vérifier vos identifiants.'
    }
  }
}

// Navigation
function goBack() {
  router.back()
}

function goToRegister() {
  MapsTo('/register')
}

function goToForgotPassword() {
  MapsTo('/forgot-password')
}

const handleGoogleCallback = async (response) => {
  if (response.credential) {

    try {
      await authStore.loginWithGoogle(response.credential)
      const redirectPath = route.query.redirect
      if (redirectPath && typeof redirectPath === 'string' && redirectPath.startsWith('/')) {
        await router.replace(redirectPath)
      } else if (authStore.isProprietaire) {
        await router.replace('/dashboard')
      } else {
        await router.replace('/bateaux')
      }

    } catch (error) {
      errors.general = "Impossible de se connecter avec Google via nos serveurs."
    }
  } else {
    errors.general = "Erreur de communication avec Google."
  }
}
</script>

<style lang="scss">
@import 'assets/styles/scss/auth/login';
</style>
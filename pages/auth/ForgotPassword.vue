<template>
    <div class="forgot-password-page">
        <div class="forgot-password-container">
          <HeaderModal
              title="Mot de passe oublié"
              @close="goBack"
          />

            <div v-if="!emailSent" class="forgot-password-form">
                <div class="form-section">
                    <h2 class="section-title">Réinitialiser votre mot de passe</h2>
                    <p class="section-description">
                        Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>

                    <form @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label for="email" class="form-label">Adresse e-mail<span class="required">*</span></label>
                            <input 
                                type="email" 
                                id="email" 
                                v-model="email" 
                                @input="clearError"
                                placeholder="exemple@gmail.com" 
                                class="form-input" 
                                :class="{ 'error': error }"
                                required 
                            />
                            <p v-if="error" class="form-error">{{ error }}</p>
                        </div>

                        <div class="form-actions">
                            <UiButton 
                                type="submit" 
                                :loading="isLoading" 
                                :disabled="!email.trim() || isLoading"
                                class="primary"
                            >
                                {{ isLoading ? 'Envoi...' : 'Envoyer le lien' }}
                            </UiButton>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Confirmation d'envoi -->
            <div v-else class="success-message">
                <div class="success-icon">✓</div>
                <h2 class="success-title">E-mail envoyé !</h2>
                <p class="success-description">
                    Nous avons envoyé un lien de réinitialisation à <strong>{{ email }}</strong>.
                    Vérifiez votre boîte de réception et suivez les instructions.
                </p>
                <div class="success-actions">
                    <UiButton @click="goToLogin" class="login-button">
                        Retour à la connexion
                    </UiButton>
                    <UiButton @click="resendEmail" class="primary" :disabled="isLoading">
                        {{ isLoading ? 'Envoi...' : 'Renvoyer l\'e-mail' }}
                    </UiButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/useAuthStore.js'
import UiButton from '../../components/ui/UiButton.vue'
import HeaderModal from '../../components/common/HeaderModal.vue';

const router = useRouter()
const authStore = useAuthStore()

// État
const email = ref('')
const isLoading = ref(false)
const error = ref('')
const emailSent = ref(false)

// Nettoyage des erreurs
function clearError() {
    if (error.value) {
        error.value = ''
    }
}

// Validation de l'email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Soumission du formulaire
async function handleSubmit() {
    error.value = ''

    if (!email.value.trim()) {
        error.value = 'L\'adresse e-mail est obligatoire'
        return
    }

    if (!isValidEmail(email.value)) {
        error.value = 'L\'adresse e-mail n\'est pas valide'
        return
    }

    isLoading.value = true

    try {
        await authStore.generateResetPassword(email.value)
        emailSent.value = true
    } catch (err) {
        console.error('Erreur lors de la demande de réinitialisation:', err)
        error.value = err.message || 'Erreur lors de l\'envoi de l\'e-mail. Veuillez réessayer.'
    } finally {
        isLoading.value = false
    }
}

// Renvoyer l'e-mail
async function resendEmail() {
    await handleSubmit()
}

// Navigation
function goBack() {
    router.back()
}

function goToLogin() {
    MapsTo('/login')
}
</script>

<style lang="scss">
@import 'assets/styles/scss/auth/forgot-password';
</style>

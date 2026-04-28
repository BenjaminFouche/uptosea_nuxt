<template>
  <div class="register-page">
    <div class="register-container">
      <HeaderModal
          title="Inscription"
          @close="goBack"
      />

      <!-- Formulaire d'inscription -->
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-section">
          <h2 class="section-title">Vos informations</h2>

          <div class="form-grid">
            <!-- Email -->
            <div class="form-group form-group-full">
              <label for="email" class="form-label">Adresse e-mail<span class="required">*</span></label>
              <input type="email" id="email" v-model="formData.email" @input="clearError('email')"
                     placeholder="exemple@gmail.com" class="form-input" :class="{ 'error': errors.email }" required />
              <p class="form-help">Nous vous enverrons les confirmations par e-mail.</p>
              <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
            </div>

            <!-- Nom -->
            <div class="form-group">
              <label for="lastName" class="form-label">Nom<span class="required">*</span></label>
              <input type="text" id="lastName" v-model="formData.nom" @input="clearError('lastName')" placeholder="Nom"
                     class="form-input" :class="{ 'error': errors.lastName }" required />
              <p v-if="errors.lastName" class="form-error">{{ errors.lastName }}</p>
            </div>

            <!-- Prénom -->
            <div class="form-group">
              <label for="firstName" class="form-label">Prénom<span class="required">*</span></label>
              <input type="text" id="firstName" v-model="formData.prenom" @input="clearError('firstName')"
                     placeholder="Prénom" class="form-input" :class="{ 'error': errors.firstName }" required />
              <p v-if="errors.firstName" class="form-error">{{ errors.firstName }}</p>
            </div>

            <!-- Date de naissance -->
            <div class="form-group">
              <label for="dateNaissance" class="form-label">Date de naissance<span class="required">*</span></label>

              <VDatePicker
                  v-model="formData.dateNaissance"
                  placeholder="Date de naissance"
                  @input="clearError('dateNaissance')"
                  dateFormat="dd/mm/yy"
                  mode="date"
                  @update:modelValue="updateFormattedDate"
                  :is-dark="false"
                  id="dateNaissance"

              >
                <template #default="{ inputValue, inputEvents }">
                  <input
                      id="dateNaissance"
                      class="form-input"
                      :class="{ 'error': errors.dateNaissance }"
                      :value="inputValue"
                      v-on="inputEvents"
                      placeholder="jj/mm/aaaa"
                  />
                </template>
              </VDatePicker>

              <p v-if="errors.dateNaissance" class="form-error">{{ errors.dateNaissance }}</p>
            </div>

            <!-- Téléphone -->
            <div class="form-group">
              <label for="phone" class="form-label">Téléphone<span class="required">*</span></label>
              <input type="tel" id="phone" v-model="formData.phone" @input="clearError('phone')" placeholder="Téléphone"
                     class="form-input" :class="{ 'error': errors.phone }" required />
              <p v-if="errors.phone" class="form-error">{{ errors.phone }}</p>
            </div>

            <!-- Adresse -->
            <div class="form-group">
              <label for="address" class="form-label">Adresse<span class="required">*</span></label>
              <input type="text" id="address" v-model="formData.address" @input="clearError('address')"
                     placeholder="Adresse" class="form-input" :class="{ 'error': errors.address }" required />
              <p v-if="errors.address" class="form-error">{{ errors.address }}</p>
            </div>

            <!-- Ville -->
            <div class="form-group">
              <label for="ville" class="form-label">Ville<span class="required">*</span></label>
              <input type="text" id="ville" v-model="formData.ville" @input="clearError('ville')"
                     placeholder="Ville" class="form-input" :class="{ 'error': errors.ville }" required />
              <p v-if="errors.ville" class="form-error">{{ errors.ville }}</p>
            </div>

            <!-- Code postal -->
            <div class="form-group">
              <label for="postalCode" class="form-label">Code postal<span class="required">*</span></label>
              <input type="text" id="postalCode" v-model="formData.postalCode" @input="clearError('postalCode')"
                     placeholder="Code postal" class="form-input" :class="{ 'error': errors.postalCode }" required />
              <p v-if="errors.postalCode" class="form-error">{{ errors.postalCode }}</p>
            </div>

            <!-- Pays -->
            <div class="form-group">
              <label for="pays" class="form-label">Pays<span class="required">*</span></label>
              <input type="text" id="pays" v-model="formData.pays" @input="clearError('pays')" placeholder="Pays"
                     class="form-input" :class="{ 'error': errors.pays }" required />
              <p v-if="errors.pays" class="form-error">{{ errors.pays }}</p>
            </div>

            <!-- Mot de passe -->
            <div class="form-group form-group-full">
              <PasswordInput
                  id="password"
                  v-model="formData.password"
                  label="Mot de passe"
                  placeholder="Mot de passe"
                  :error="errors.password"
                  required
                  @input="clearError('password')"
                  @update:modelValue="clearError('password')"
              />

              <!-- Indicateurs de validation du mot de passe -->
              <div class="password-validation">
                <div class="validation-item strength-indicator" :class="`strength-${passwordValidation.strengthColor}`"
                     v-if="formData.password">
                  <span class="validation-icon">🔒</span>
                  Fiabilité du mot de passe : {{ passwordValidation.strength }}
                </div>

                <!-- Critères mot de passe -->
                <div class="validation-item"
                     :class="{ 'valid': passwordValidation.hasMinLength, 'invalid': !passwordValidation.hasMinLength && formData.password }">
                  <span class="validation-icon">{{ passwordValidation.hasMinLength ? '✓' : '●' }}</span>
                  Au moins 12 caractères
                </div>
                <div class="validation-item"
                     :class="{ 'valid': passwordValidation.hasUpperCase, 'invalid': !passwordValidation.hasUpperCase && formData.password }">
                  <span class="validation-icon">{{ passwordValidation.hasUpperCase ? '✓' : '●' }}</span>
                  Contient une majuscule
                </div>
                <div class="validation-item"
                     :class="{ 'valid': passwordValidation.hasNumberOrSymbol, 'invalid': !passwordValidation.hasNumberOrSymbol && formData.password }">
                  <span class="validation-icon">{{ passwordValidation.hasNumberOrSymbol ? '✓' : '●' }}</span>
                  Contient un chiffre ou un symbole
                </div>
              </div>

              <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
            </div>

            <!-- Permis -->
            <div class="form-group form-group-full">
              <label class="form-label">Possédez vous un permis bateau ?</label>
              <div class="time-slots">
                <div
                    class="time-slot"
                    :class="{ 'active': selectedPermis.includes('cotier'), 'error': errors.typePermis }"
                    @click="togglePermis('cotier')"
                    @change="clearError('typePermis')"
                >
                  Permis cotier
                </div>
                <div
                    class="time-slot"
                    :class="{ 'active': selectedPermis.includes('fluvial'), 'error': errors.typePermis }"
                    @click="togglePermis('fluvial')"
                    @change="clearError('typePermis')"
                >
                  Permis fluvial
                </div>
                <div
                    class="time-slot"
                    :class="{ 'active': selectedPermis.includes('hauturier'), 'error': errors.typePermis }"
                    @click="togglePermis('hauturier')"
                    @change="clearError('typePermis')"
                >
                  Permis hauturier
                </div>
                <p v-if="errors.typePermis" class="form-error">{{ errors.typePermis }}</p>
              </div>
            </div>

            <!-- CV nautique -->
            <div class="form-group form-group-full">
              <label for="cvNautique" class="form-label">CV nautique en quelques mots</label>
              <textarea id="cvNautique" v-model="formData.cvNautique" @input="clearError('cvNautique')"
                        placeholder="CV nautique en quelques mots.&#10;Ex : je navigue régulièrement sur les Sables d'olonne à destination des Iles Vendéennes, de Charente ou vers la Bretagne sud. Je navigue environ 400 heures par an."
                        class="form-textarea" :class="{ 'error': errors.cvNautique }" rows="4"></textarea>
              <p v-if="errors.cvNautique" class="form-error">{{ errors.cvNautique }}</p>
            </div>

          </div>
        </div>

        <UiToast v-if="errors.api" :message="errors.api" />

        <!-- Bouton de soumission -->
        <div class="form-actions">
          <UiButton type="submit" variant="primary" class="reserve-btn" :loading="isLoading">
            <span v-if="!isLoading">S'inscrire</span>
            <span v-else>Inscription en cours...</span>
          </UiButton>
          <UiButton variant="secondary" class="retour-btn" @click="goBack">
            <span>Retour</span>
          </UiButton>
          <!-- Message d'erreur API -->
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import UiButton from '../../components/ui/UiButton.vue'
import PasswordInput from '../../components/ui/UiPasswordInput.vue'
import { ApiAuthService } from '../../services/apiAuth.js'
import HeaderModal from "@/components/common/HeaderModal.vue";
import 'v-calendar/dist/style.css';
import { DatePicker as VDatePicker } from 'v-calendar';
import UiToast from "@/components/ui/UiToast.vue";

// Router
const router = useRouter()
const apiError = ref(null);

// État réactif
const isLoading = ref(false)
const formData = reactive({
  email: '',
  nom: '',
  prenom: '',
  dateNaissance: '',
  phone: '',
  address: '',
  postalCode: '',
  ville: '',
  pays: '',
  password: '',
  permis: '',
  typePermis: '',
  cvNautique: ''
})
const errors = reactive({})

// Fonction pour formater la date au format YYYY-MM-DD pour l'API
const formatDateForAPI = (dateInput) => {
  if (!dateInput) return ''

  let dateStr;
  if (dateInput instanceof Date) {
    return dateInput.toISOString().split('T')[0]
  } else if (typeof dateInput === 'string') {
    dateStr = dateInput
  } else {
    return ''
  }

  const parts = dateStr.split('/')
  if (parts.length !== 3) return ''

  let [day, month, year] = parts.map(p => p.trim())

  day = day.padStart(2, '0')
  month = month.padStart(2, '0')

  if (year.length === 2) {
    year = `20${year}`
  } else if (year.length === 4) {
    const y = parseInt(year, 10)
    if (isNaN(y) || y < 1900 || y > new Date().getFullYear()) {
      return ''
    }
  } else {
    return ''
  }

  const formatted = `${year}-${month}-${day}`
  const testDate = new Date(formatted)
  if (isNaN(testDate.getTime()) || testDate.getDate() !== parseInt(day, 10) || testDate.getMonth() + 1 !== parseInt(month, 10)) {
    return ''
  }

  return formatted
}

// Validation du mot de passe
const passwordValidation = computed(() => {
  const password = formData.password

  // Critères de validation
  const hasMinLength = password.length >= 12
  const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)

  // Score de sécurité mot de passe
  let score = 0
  if (hasMinLength) score++
  if (hasNumberOrSymbol) score++
  if (hasUpperCase) score++
  if (hasLowerCase) score++
  if (password.length >= 12) score++

  // Détermination du niveau de fiabilité
  let strength = 'faible'
  let strengthColor = 'weak'

  if (score >= 4 && hasMinLength && hasNumberOrSymbol) {
    strength = 'fort'
    strengthColor = 'strong'
  } else if (score >= 2 && hasMinLength) {
    strength = 'moyen'
    strengthColor = 'medium'
  }

  return {
    hasMinLength,
    hasNumberOrSymbol,
    hasUpperCase,
    hasLowerCase,
    score,
    strength,
    strengthColor,
    isValid: hasMinLength && hasNumberOrSymbol
  }
})

// Méthodes
const goBack = () => {
  router.go(-1)
}

/**
 * Validation du formulaire
 */
const validateForm = () => {
  // Réinitialiser les erreurs
  Object.keys(errors).forEach(key => delete errors[key])

  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email) {
    errors.email = 'L\'email est requis'
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Format d\'email invalide'
  }

  // Validation nom
  if (!formData.nom) {
    errors.lastName = 'Le nom est requis'
  }

  // Validation prénom
  if (!formData.prenom) {
    errors.firstName = 'Le prénom est requis'
  }

  // Validation date de naissance
  if (!formData.dateNaissance) {
    errors.dateNaissance = 'La date de naissance est requise'
  } else {
    const formattedDate = formatDateForAPI(formData.dateNaissance)
    if (!formattedDate) {
      errors.dateNaissance = 'Format de date invalide'
    } else {
      const dateNaissance = new Date(formattedDate)
      if (isNaN(dateNaissance.getTime())) {
        errors.dateNaissance = 'Format de date invalide'
      } else {
        const today = new Date()
        let age = today.getFullYear() - dateNaissance.getFullYear()
        const m = today.getMonth() - dateNaissance.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < dateNaissance.getDate())) {
          age--
        }
        if (age < 18) {
          errors.dateNaissance = 'Vous devez être majeur pour vous inscrire'
        }
      }
    }
  }

  // Validation téléphone
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
  if (!formData.phone) {
    errors.phone = 'Le téléphone est requis'
  } else if (!phoneRegex.test(formData.phone)) {
    errors.phone = 'Format de téléphone invalide'
  }

  // Validation adresse
  if (!formData.address) {
    errors.address = 'L\'adresse est requise'
  }

  // Validation ville
  if (!formData.ville) {
    errors.ville = 'La ville est requise'
  }

  // Validation code postal
  const postalCodeRegex = /^[0-9]{5}$/
  if (!formData.postalCode) {
    errors.postalCode = 'Le code postal est requis'
  } else if (!postalCodeRegex.test(formData.postalCode)) {
    errors.postalCode = 'Le code postal doit contenir 5 chiffres'
  }

  // Validation pays
  if (!formData.pays) {
    errors.pays = 'Le pays est requis'
  }

  // Validation mot de passe
  if (!formData.password) {
    errors.password = 'Le mot de passe est requis'
  } else if (!passwordValidation.value.isValid) {
    errors.password = 'Le mot de passe doit contenir au moins 12 caractères une majuscule et un chiffre ou un symbole'
  }

  // Validation CV nautique
  if (formData.cvNautique && formData.cvNautique.length > 1000) {
    errors.cvNautique = 'Le CV nautique ne doit pas dépasser 1000 caractères'
  }

  return Object.keys(errors).length === 0
}

/**
 * Soumission du formulaire
 */
const handleSubmit = async () => {

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    // Formatage des données pour l'API
    const formattedData = {
      email: formData.email,
      password: formData.password,
      nom: formData.nom,
      prenom: formData.prenom,
      dateNaissance: formatDateForAPI(formData.dateNaissance),
      telephone: formData.phone || "vide",
      adresse: formData.address || "vide",
      codePostal: formData.postalCode || "vide",
      ville: formData.ville || "vide",
      pays: formData.pays || "vide",
      possedeBateau: selectedPermis.value.length > 0 ? "oui" : "vide",
      typePermisBateau: formData.typePermis || "vide",
      permisBateauCotier: selectedPermis.value.includes('cotier'),
      permisBateauHauturier: selectedPermis.value.includes('hauturier'),
      permisBateauFluvial: selectedPermis.value.includes('fluvial'),
      cvNautique: formData.cvNautique || ""
    }

    const response = await ApiAuthService.register(formattedData)

    // Affichage d'un message de succès
    await navigateTo('/registrationconfirm')
  } catch (error) {
    console.error('Erreur inscription:', error)
    // Gestion des erreurs de l'API
    if (error.message && error.message.includes('email')) {
      errors.email = 'Cette adresse email est déjà utilisée'
    } else {
      errors.api = error.message || 'Erreur inconnue'
    }
  } finally {
    isLoading.value = false
  }
}

/**
 * Effacement des erreurs lors de la saisie
 */
const clearError = (field) => {
  if (errors[field]) {
    delete errors[field]
  }
}

/**
 * Gestion de la sélection des permis bateau
 */
const selectedPermis = ref([])

const togglePermis = (type) => {
  const index = selectedPermis.value.indexOf(type)
  if (index === -1) {
    selectedPermis.value.push(type)
  } else {
    selectedPermis.value.splice(index, 1)
  }
  formData.typePermis = selectedPermis.value.join(', ')
  clearError('typePermis')
}

watch(selectedPermis, (newVal) => {
  formData.permis = newVal.length > 0 ? 'oui' : ''
}, { deep: true })

</script>

<style lang="scss">
@import 'assets/styles/scss/auth/register';
</style>
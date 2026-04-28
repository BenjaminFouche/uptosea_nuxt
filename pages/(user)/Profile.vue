<template>
  <div class="profile-page">
    <div class="profile-container">
      <Breadcrumbs></Breadcrumbs>

      <div v-if="!loadingUserDetails" class="profile-header">
        <div class="profile-header-content">
          <div class="profile-avatar">
            <div class="avatar-circle">
              <span class="avatar-initials">{{ userInitials }}</span>
            </div>
          </div>
          <div class="profile-info">
            <h1 class="profile-name">{{ userName }}</h1>
            <p class="profile-email">{{ userEmail }}</p>
            <div class="profile-badge" v-if="user?.type">
              <span class="badge" :class="getBadgeClass(user.type)">
                {{ getUserTypeLabel(user.type) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loadingUserDetails" class="profile-nav">
        <button v-for="section in sections" :key="section.id" @click="activeSection = section.id"
                :class="['nav-button', { active: activeSection === section.id }]">
          {{ section.label }}
        </button>
      </div>

      <LoadingSpinner v-if="loadingUserDetails" message="Chargement des informations du profil..." />

      <div v-else class="profile-content">
        <div v-if="errorMessage" class="error-message">
          <p>{{ errorMessage }}</p>
          <button @click="errorMessage = null" class="close-error">×</button>
        </div>

        <div v-if="activeSection === 'personal'" class="profile-section">
          <div class="section-header">
            <h2 class="section-title">Informations personnelles</h2>
            <UiButton variant="outline" size="small" @click="toggleEdit('personal')">
              {{ isEditing.personal ? 'Annuler' : 'Modifier' }}
            </UiButton>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">Prénom</label>
              <input v-if="isEditing.personal" v-model="editData.firstName" type="text" class="info-input" />
              <p v-else class="info-value">{{ user?.prenom || user?.firstName || 'Non renseigné' }}</p>
            </div>

            <div class="info-item">
              <label class="info-label">Nom</label>
              <input v-if="isEditing.personal" v-model="editData.lastName" type="text" class="info-input" />
              <p v-else class="info-value">{{ user?.nom || user?.lastName || 'Non renseigné' }}</p>
            </div>

            <div class="info-item">
              <label class="info-label">Email</label>
              <input v-if="isEditing.personal" v-model="editData.email" type="email" class="info-input" />
              <p v-else class="info-value">{{ userEmail }}</p>
            </div>

            <div class="info-item">
              <label class="info-label">Mot de passe</label>
              <input v-if="isEditing.personal" v-model="editData.password" type="password" class="info-input"
                     placeholder="Laisser vide pour ne pas changer" />
              <p v-else class="info-value">••••••••</p>
            </div>

            <div class="info-item">
              <label class="info-label">Téléphone fixe</label>
              <input v-if="isEditing.personal" v-model="editData.telephone" type="tel" class="info-input"
                     placeholder="02 12 34 56 78" />
              <p v-else class="info-value">{{ userTelephone }}</p>
            </div>

            <div class="info-item">
              <label class="info-label">Téléphone portable</label>
              <input v-if="isEditing.personal" v-model="editData.mobile" type="tel" class="info-input"
                     placeholder="06 12 34 56 78" />
              <p v-else class="info-value">{{ userMobile }}</p>
            </div>

            <div class="info-item">
              <label class="info-label">Date de naissance</label>
              <input v-if="isEditing.personal" v-model="editData.birthDate" type="date" class="info-input" />
              <p v-else class="info-value">{{ userBirthDate }}</p>
            </div>

            <div class="info-item full-width">
              <label class="info-label">CV Nautique</label>
              <textarea v-if="isEditing.personal" v-model="editData.cvNautique" class="info-textarea"
                        placeholder="Décrivez votre expérience nautique..." rows="3"></textarea>
              <p v-else class="info-value">{{ userCvNautique }}</p>
            </div>
          </div>

          <div v-if="isEditing.personal" class="form-actions">
            <UiButton variant="primary" @click="savePersonalInfo" :disabled="loadingUserDetails">
              Sauvegarder
            </UiButton>
          </div>
        </div>

        <div v-if="activeSection === 'address'" class="profile-section">
          <div class="section-header">
            <h2 class="section-title">Adresse</h2>
            <UiButton variant="outline" size="small" @click="toggleEdit('address')">
              {{ isEditing.address ? 'Annuler' : 'Modifier' }}
            </UiButton>
          </div>

          <div class="info-grid">
            <div class="info-item full-width">
              <label class="info-label">Adresse</label>
              <input v-if="isEditing.address" v-model="editData.address" type="text" class="info-input"
                     placeholder="123 rue de la Mer" />
              <p v-else class="info-value">{{ userAddress }}</p>
            </div>

            <div class="info-item">
              <label class="info-label">Code postal</label>
              <input v-if="isEditing.address" v-model="editData.zipCode" type="text" class="info-input"
                     placeholder="06000" />
              <p v-else class="info-value">{{ userZipCode }}</p>
            </div>

            <div class="info-item">
              <label class="info-label">Ville</label>
              <input v-if="isEditing.address" v-model="editData.city" type="text" class="info-input"
                     placeholder="Nice" />
              <p v-else class="info-value">{{ userCity }}</p>
            </div>

            <div class="info-item">
              <label class="info-label">Pays</label>
                <p class="info-value">{{ user?.pays || 'FRANCE' }}</p>
            </div>
          </div>

          <div v-if="isEditing.address" class="form-actions">
            <UiButton variant="primary" @click="saveAddressInfo" :disabled="loadingUserDetails">
              Sauvegarder
            </UiButton>
          </div>
        </div>

        <div v-if="activeSection === 'permits'" class="profile-section">
          <div class="section-header">
            <h2 class="section-title">Permis nautiques</h2>
            <UiButton variant="outline" size="small" @click="toggleEdit('permits')">
              {{ isEditing.permits ? 'Annuler' : 'Modifier' }}
            </UiButton>
          </div>

          <div class="permits-grid">
            <div class="permit-item"
                 :class="{ 'editing-mode': isEditing.permits, 'is-valid': editData.possedePermisCotier && isEditing.permits }"
                 @click="isEditing.permits && (editData.possedePermisCotier = !editData.possedePermisCotier)">
              <div class="permit-icon">
                <img src="../../assets/svg/chapeau-de-capitaine.svg" alt="Permis côtier">
              </div>
              <div class="permit-info">
                <h3 class="permit-title">Permis côtier</h3>
                <p class="permit-status" :class="{ 'permit-valid': user?.possedePermisCotier || (editData.possedePermisCotier && isEditing.permits) }">
                  <span v-if="isEditing.permits">{{ editData.possedePermisCotier ? 'Validé (Cliquer pour désactiver)' : 'Non déposé (Cliquer pour activer)' }}</span>
                  <span v-else>{{ user?.possedePermisCotier ? 'Validé' : 'Non déposé' }}</span>
                </p>
              </div>
            </div>

            <div class="permit-item"
                 :class="{ 'editing-mode': isEditing.permits, 'is-valid': editData.possedePermisFluvial && isEditing.permits }"
                 @click="isEditing.permits && (editData.possedePermisFluvial = !editData.possedePermisFluvial)">
              <div class="permit-icon">
                <img src="../../assets/svg/chapeau-de-capitaine.svg" alt="Permis fluvial">
              </div>
              <div class="permit-info">
                <h3 class="permit-title">Permis fluvial</h3>
                <p class="permit-status" :class="{ 'permit-valid': user?.possedePermisFluvial || (editData.possedePermisFluvial && isEditing.permits) }">
                  <span v-if="isEditing.permits">{{ editData.possedePermisFluvial ? 'Validé (Cliquer pour désactiver)' : 'Non déposé (Cliquer pour activer)' }}</span>
                  <span v-else>{{ user?.possedePermisFluvial ? 'Validé' : 'Non déposé' }}</span>
                </p>
              </div>
            </div>

            <div class="permit-item"
                 :class="{ 'editing-mode': isEditing.permits, 'is-valid': editData.possedePermisHauturier && isEditing.permits }"
                 @click="isEditing.permits && (editData.possedePermisHauturier = !editData.possedePermisHauturier)">
              <div class="permit-icon">
                <img src="../../assets/svg/chapeau-de-capitaine.svg" alt="Permis hauturier">
              </div>
              <div class="permit-info">
                <h3 class="permit-title">Permis hauturier</h3>
                <p class="permit-status" :class="{ 'permit-valid': user?.possedePermisHauturier || (editData.possedePermisHauturier && isEditing.permits) }">
                  <span v-if="isEditing.permits">{{ editData.possedePermisHauturier ? 'Validé (Cliquer pour désactiver)' : 'Non déposé (Cliquer pour activer)' }}</span>
                  <span v-else>{{ user?.possedePermisHauturier ? 'Validé' : 'Non déposé' }}</span>
                </p>
              </div>
            </div>
          </div>

          <div v-if="isEditing.permits" class="form-group-upload">
            <ImageUpload
                v-model="selectedFiles"
                id="permits-upload"
                label="Justificatifs de permis"
                :disabled="loadingUserDetails"
            />
          </div>

          <div v-if="isEditing.permits" class="form-actions">
            <UiButton variant="primary" @click="savePermitsInfo" :disabled="loadingUserDetails">
              Sauvegarder
            </UiButton>
          </div>
        </div>

        <div v-if="activeSection === 'documents'" class="profile-section">
          <div class="section-header">
            <h2 class="section-title">Documents & Fichiers</h2>
            <UiButton variant="outline" size="small" @click="toggleEdit('documents')">
              {{ isEditing.documents ? 'Annuler' : 'Ajouter' }}
            </UiButton>
          </div>

          <div v-if="user?.medias && user.medias.length > 0" class="documents-gallery">
            <a v-for="media in user.medias" :key="media.id" :href="media.slug" target="_blank" class="document-card">
              <div class="document-preview">
                <img
                    v-if="media.contentType.startsWith('image/')"
                    :src="media.slug"
                    :alt="media.fileName"
                />
                <div v-else class="document-icon">
                  <span class="file-extension">{{ media.fileName.split('.').pop() }}</span>
                </div>
              </div>
              <div class="document-info">
                <span class="document-name" :title="media.fileName">{{ media.fileName }}</span>
              </div>
            </a>
          </div>

          <div v-else-if="!isEditing.documents" class="empty-state">
            <p>Aucun document disponible.</p>
          </div>

          <div v-if="isEditing.documents" class="upload-section">
            <div class="form-group-upload">
              <ImageUpload
                  v-model="selectedFiles"
                  id="docs-upload"
                  label="Ajouter des fichiers"
                  :disabled="loadingUserDetails"
              />
            </div>

            <div class="form-actions">
              <UiButton variant="primary" @click="saveDocuments" :disabled="loadingUserDetails || selectedFiles.length === 0">
                Envoyer les fichiers
              </UiButton>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth.js'
import { ApiUserService } from '../../services/apiUser.js'
import UiButton from '../../components/ui/UiButton.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ImageUpload from '@/components/ui/UiFilesUpload.vue'
import Breadcrumbs from "@/components/common/Breadcrumbs.vue";

definePageMeta({
  middleware: ['auth'],
  breadcrumb: 'Mon profil'
})

const { user: authUser, isLoading, token } = useAuth()

// Données utilisateur détaillées de l'API
const userDetails = ref(null)
const loadingUserDetails = ref(false)
const errorMessage = ref(null)

// État des sections
const activeSection = ref('personal')
const sections = [
  { id: 'personal', label: 'Informations personnelles' },
  { id: 'address', label: 'Adresse' },
  { id: 'permits', label: 'Permis nautiques' },
  { id: 'documents', label: 'Documents' },
]

// État d'édition
const isEditing = reactive({
  personal: false,
  address: false,
  permits: false,
  documents: false,
})

// Données d'édition
const editData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  telephone: '',
  mobile: '',
  address: '',
  zipCode: '',
  city: '',
  birthDate: '',
  cvNautique: '',
  password: '',
  possedePermisCotier: false,
  possedePermisFluvial: false,
  possedePermisHauturier: false,
})

const selectedFiles = ref([]);

// Computed
const user = computed(() => {
  if (userDetails.value) {
    return userDetails.value
  }
  return authUser.value
})

const userInitials = computed(() => {
  if (!user.value) return '?'
  const first = user.value.prenom?.[0] || user.value.firstName?.[0] || ''
  const last = user.value.nom?.[0] || user.value.lastName?.[0] || ''
  return (first + last).toUpperCase() || user.value.email?.[0]?.toUpperCase() || '?'
})

const userName = computed(() => {
  if (!user.value) return 'Utilisateur'
  return `${user.value.prenom || user.value.firstName || ''} ${user.value.nom || user.value.lastName || ''}`.trim()
})

const userEmail = computed(() => {
  return user.value?.email || 'Email non renseigné'
})

const userTelephone = computed(() => {
  const userData = userDetails.value || user.value
  const telephone = userData?.telephone
  return telephone || 'Non renseigné'
})

const userMobile = computed(() => {
  const userData = userDetails.value || user.value
  const mobile = userData?.telephonePortable
  return mobile || 'Non renseigné'
})

const userAddress = computed(() => {
  const userData = userDetails.value || user.value
  return userData?.adresse || 'Non renseigné'
})

const userCity = computed(() => {
  const userData = userDetails.value || user.value
  return userData?.ville || 'Non renseigné'
})

const userZipCode = computed(() => {
  const userData = userDetails.value || user.value
  return userData?.codePostal || 'Non renseigné'
})

const userBirthDate = computed(() => {
  const userData = userDetails.value || user.value
  if (!userData?.dateNaissance || userData?.dateNaissance === null) return 'Non renseigné'
  const date = new Date(userData.dateNaissance)
  return date.toLocaleDateString('fr-FR')
})

const userCvNautique = computed(() => {
  const userData = userDetails.value || user.value
  const cv = userData?.cvNautique
  return cv || 'Non renseigné'
})

// Chargement des données de l'utilisateur
const loadUserDetails = async () => {
  if (!token.value) {
    console.warn('Aucun token disponible')
    return
  }

  try {
    loadingUserDetails.value = true
    errorMessage.value = null

    const response = await ApiUserService.getUserDetails(token.value)
    userDetails.value = response.user

    loadEditData()

  } catch (error) {
    console.error('Erreur lors du chargement des détails utilisateur:', error)
    errorMessage.value = error.message || 'Erreur lors du chargement des données'
  } finally {
    loadingUserDetails.value = false
  }
}


const loadEditData = () => {
  if (userDetails.value) {
    const userData = userDetails.value
    editData.firstName = userData.prenom || ''
    editData.lastName = userData.nom || ''
    editData.email = userData.email || ''
    editData.telephone = userData.telephone || ''
    editData.mobile = userData.telephonePortable || ''
    editData.address = userData.adresse || ''
    editData.zipCode = userData.codePostal || ''
    editData.city = userData.ville || ''
    editData.birthDate = userData.dateNaissance ? userData.dateNaissance.split('T')[0] : ''
    editData.cvNautique = userData.cvNautique || ''
    editData.password = ''

    editData.possedePermisCotier = userData.possedePermisCotier || false
    editData.possedePermisFluvial = userData.possedePermisFluvial || false
    editData.possedePermisHauturier = userData.possedePermisHauturier || false
  }
}

const getUserTypeLabel = (type) => {
  const labels = {
    'owner': 'Propriétaire',
    'renter': 'Locataire',
    'admin': 'Administrateur'
  }
  return labels[type] || 'Utilisateur'
}

const getBadgeClass = (type) => {
  return {
    'badge-owner': type === 'owner',
    'badge-renter': type === 'renter',
    'badge-admin': type === 'admin'
  }
}

const toggleEdit = (section) => {
  Object.keys(isEditing).forEach(key => {
    if (key !== section) {
      isEditing[key] = false;
    }
  });

  if (isEditing[section]) {
    loadEditData()
    editData.password = ''
    resetFiles();
  } else {
    loadEditData()
  }
  isEditing[section] = !isEditing[section]
}

const createFullUpdatePayload = (updatedFields) => {
  const payload = {
    prenom: editData.firstName,
    nom: editData.lastName,
    email: editData.email,
    telephone: editData.telephone,
    telephonePortable: editData.mobile,
    dateNaissance: editData.birthDate || '2004-10-24',
    cvNautique: editData.cvNautique,
    adresse: editData.address,
    codePostal: editData.zipCode,
    ville: editData.city,

    pays: userDetails.value?.pays || 'FRANCE',

    // Permis
    permisBateauCotier: editData.possedePermisCotier,
    permisBateauFluvial: editData.possedePermisFluvial,
    permisBateauHauturier: editData.possedePermisHauturier,

    ...updatedFields,
  };

  return payload;
};

const savePersonalInfo = async () => {
  if (!token.value) {
    console.error('Token manquant')
    return
  }

  try {
    loadingUserDetails.value = true;
    errorMessage.value = null;

    let payload = createFullUpdatePayload({});

    if (editData.password) {
      payload.mot_de_passe = editData.password;
    }

    await ApiUserService.updateUserAttributes(token.value, payload)

    await loadUserDetails()

    editData.password = ''
    isEditing.personal = false
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des informations personnelles:', error)
    errorMessage.value = error.message || 'Erreur lors de la sauvegarde'
  } finally {
    loadingUserDetails.value = false;
  }
}

const saveAddressInfo = async () => {
  if (!token.value) {
    console.error('Token manquant')
    return
  }

  try {
    loadingUserDetails.value = true;
    errorMessage.value = null;

    let payload = createFullUpdatePayload({});

    await ApiUserService.updateUserAttributes(token.value, payload)

    await loadUserDetails()

    isEditing.address = false
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'adresse:', error)
    errorMessage.value = error.message || 'Erreur lors de la sauvegarde de l\'adresse'
  } finally {
    loadingUserDetails.value = false;
  }
}

const savePermitsInfo = async () => {
  if (!token.value) {
    console.error('Token manquant');
    return;
  }

  try {
    loadingUserDetails.value = true;
    errorMessage.value = null;

    let payload = createFullUpdatePayload({});
    await ApiUserService.updateUserAttributes(token.value, payload);

    // Upload des fichiers
    if (selectedFiles.value.length > 0 && userDetails.value?.code) {
      const uploadPromises = selectedFiles.value.map(file =>
          ApiUserService.uploadUserPermis(token.value, userDetails.value.code, file)
      );
      await Promise.all(uploadPromises);
    }

    await loadUserDetails();

    isEditing.permits = false;
    resetFiles();

  } catch (error) {
    console.error('Erreur lors de la sauvegarde des permis nautiques:', error);
    errorMessage.value = error.message || 'Erreur lors de la sauvegarde des permis';
  } finally {
    loadingUserDetails.value = false;
  }
};

const saveDocuments = async () => {
  if (!token.value || !userDetails.value?.code) {
    console.error('Token ou Code utilisateur manquant');
    return;
  }

  if (selectedFiles.value.length === 0) {
    errorMessage.value = "Veuillez sélectionner au moins un fichier.";
    return;
  }

  try {
    loadingUserDetails.value = true;
    errorMessage.value = null;

    // Upload des fichiers
    const uploadPromises = selectedFiles.value.map(file =>
        ApiUserService.uploadUserDocument(token.value, userDetails.value.code, file)
    );
    await Promise.all(uploadPromises);

    await loadUserDetails();

    isEditing.documents = false;
    resetFiles();

  } catch (error) {
    console.error('Erreur lors de l\'envoi des documents:', error);
    errorMessage.value = error.message || 'Erreur lors de l\'envoi des documents';
  } finally {
    loadingUserDetails.value = false;
  }
};

const resetFiles = () => {
  selectedFiles.value = [];
};

// Initialisation
onMounted(async () => {
  await loadUserDetails()
})
</script>

<style lang="scss" scoped>
@import 'assets/styles/scss/user/profile';
</style>
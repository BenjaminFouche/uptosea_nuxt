<template>
  <div class="documents-page">
    <div class="container">
      <Breadcrumbs></Breadcrumbs>

      <div class="page-header">
        <h1>
          {{ filterCode ? 'Documents du bateau' : 'Mes Documents' }}
        </h1>
        <UiButton variant="primary" @click="openUploadModal">
          + Ajouter un document
        </UiButton>
      </div>

      <div v-if="boatStore.isLoading" class="loader-container">
        <LoadingSpinner message="Chargement des documents.." />
      </div>

      <div v-else-if="boatStore.error" class="error-state">
        <p>{{ boatStore.error }}</p>
        <button @click="boatStore.fetchBoats()">Réessayer</button>
      </div>

      <div v-else-if="flattenedDocuments.length === 0" class="empty-state">
        <p>Aucun document trouvé {{ filterCode ? 'pour ce bateau' : '' }}.</p>
        <UiButton
            v-if="filterCode"
            @click="clearFilter"
            variant="outline"
        >
          Voir tous les documents
        </UiButton>
      </div>

      <div v-else class="documents-grid">
        <DocumentBateauCard
            v-for="(item, index) in flattenedDocuments"
            :key="index"
            :document="item.document"
            :boat-name="item.boatName"
            :boat-image-url="item.boatImage"
        />
      </div>

      <div v-if="filterCode && flattenedDocuments.length > 0" style="margin-top: 20px; display: flex; justify-content: center">
        <UiButton
            variant="outline"
            @click="clearFilter">Voir tous mes bateaux</UiButton>
      </div>

    </div>

    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
      <div class="modal-content">
        <LoadingSpinner v-if="boatStore.isLoading" message="Dépot de votre fichier ..." />

        <div :class="{ 'content-hidden': boatStore.isLoading }">
          <div class="modal-header">
            <h2>Ajouter un document</h2>
            <button class="btn-close" @click="closeUploadModal" title="Fermer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <form @submit.prevent="confirmUpload">
            <div class="form-group" v-if="!filterCode">
              <label for="boat-select">Concerne le bateau</label>
              <select id="boat-select" v-model="selectedBoatCode" class="form-control">
                <option value="" disabled>-- Choisir un bateau --</option>
                <option v-for="boat in boatStore.boats" :key="boat.code" :value="boat.code">
                  {{ boat.nom || boat.nomBapteme || 'Bateau sans nom' }}
                </option>
              </select>
            </div>
            <div v-else class="info-text-box">
              Ajout pour le bateau : <strong>{{ currentBoatName }}</strong>
            </div>

            <div class="form-group">
              <ImageUpload
                  v-model="selectedFiles"
                  id="boat-doc-upload"
                  label="Document du bateau"
                  :disabled="boatStore.isLoading"
              />
              <div v-if="uploadError" class="error-msg">{{ uploadError }}</div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-ghost" @click="closeUploadModal">Annuler</button>
              <button
                  type="submit"
                  class="btn-primary"
                  :disabled="!canUpload || boatStore.isLoading"
              >
                {{ boatStore.isLoading ? 'Envoi...' : 'Ajouter le document' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBoatProprietaireStore } from '@/stores/useBoatProprietaireStore';
import DocumentBateauCard from '@/components/user/proprietaire/BoatDocumentCard.vue';
import UiButton from "@/components/ui/UiButton.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ImageUpload from '@/components/ui/UiFilesUpload.vue'
import Breadcrumbs from "@/components/common/Breadcrumbs.vue";

definePageMeta({
  middleware: ['auth'],
  breadcrumb: [
    { label: 'Mes bateaux', to: '/proprietaire/bateaux' },
    { label: 'Mes documents' }
  ]
})

const boatStore = useBoatProprietaireStore();
const route = useRoute();
const router = useRouter();

// État pour la modale
const showUploadModal = ref(false);
const selectedBoatCode = ref('');
const selectedFiles = ref([]);
const uploadError = ref(null);

// Récupère le code du bateau depuis l'URL
const filterCode = computed(() => route.query.boatCode);

// Nom du bateau
const currentBoatName = computed(() => {
  if (!filterCode.value || !boatStore.boats) return '';
  const boat = boatStore.boats.find(b => b.code === filterCode.value);
  return boat ? (boat.nom || boat.nomBapteme) : '';
});

onMounted(() => {
  if (!boatStore.hasBoats) {
    boatStore.fetchBoats();
  }
});

// Retire le filtre
const clearFilter = () => {
  navigateTo({ path: '/proprietaire/BoatDocument' });
};

// Gestion du modal
const openUploadModal = () => {
  uploadError.value = null;
  selectedFiles.value = [];
  // Si un filtre est actif, on présélectionne le bateau
  if (filterCode.value) {
    selectedBoatCode.value = filterCode.value;
  } else {
    selectedBoatCode.value = '';
  }
  showUploadModal.value = true;
};

const closeUploadModal = () => {
  showUploadModal.value = false;
};

const canUpload = computed(() => {
  return selectedBoatCode.value && selectedFiles.value.length > 0 && !uploadError.value;
});

const confirmUpload = async () => {
  if (!canUpload.value) return;

  try {
    uploadError.value = null;

    await boatStore.addDocuments(selectedBoatCode.value, selectedFiles.value);

    closeUploadModal();
  } catch (e) {
    console.error("Erreur lors de l'upload:", e);
    uploadError.value = "Erreur lors de l'envoi du document.";
  }
};

// Liste combinée des documents
const flattenedDocuments = computed(() => {
  const allDocs = [];

  if (!boatStore.boats) return [];

  boatStore.boats.forEach(boat => {
    if (filterCode.value && boat.code !== filterCode.value) {
      return;
    }

    const boatInfo = {
      boatName: boat.nom || boat.nomBapteme || 'Mon Bateau',
      boatImage: boat.imagePrincipale ? boat.imagePrincipale.slug : null
    };

    if (boat.contratConciergerie && Array.isArray(boat.contratConciergerie)) {
      boat.contratConciergerie.forEach(contrat => {
        allDocs.push({
          document: contrat,
          ...boatInfo,
          type: 'Contrat'
        });
      });
    }

    if (boat.medias && Array.isArray(boat.medias)) {
      boat.medias.forEach(media => {
        if(media.id !== boat.imagePrincipale?.id) {
          allDocs.push({
            document: media,
            ...boatInfo,
            type: 'Document'
          });
        }
      });
    }
  });

  return allDocs;
});
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/user/proprietaire/boat-document';
</style>
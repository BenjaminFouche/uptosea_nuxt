<template>
  <div class="action-details-layout">
    <div class="container">
      <Breadcrumbs></Breadcrumbs>

      <div v-if="isPageLoading" class="loader-container">
        <LoadingSpinner v-if="isLoading" message="Chargement des détails de l'action..." />
      </div>
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>
      <div v-else-if="action" class="details-content">
        <header class="details-header">
          <h1>{{ action.nom || 'Détail de l\'action' }}</h1>
          <span class="action-code">Code: {{ action.code }}</span>
        </header>

        <div class="details-grid">
          <main class="main-column">
            <section class="details-section">
              <h2>Description</h2>
              <div class="description-content" v-html="action.detail || 'Aucune description'"></div>

            </section>

            <!-- Image Gallery Section -->
            <section v-if="hasImages" class="details-section image-gallery">
              <h2 class="gallery-title">{{ imageCount === 1 ? 'Image' : 'Images' }}</h2>
              <div class="gallery-header">
                <button
                    class="btn-photos"
                    :class="{ active: showGallery }"
                    @click="showGallery = !showGallery"
                >
                  {{ showGallery ? 'Masquer les images' : `Afficher les images (${imageCount})` }}
                </button>
              </div>
              <transition name="slide-fade">
                <div v-if="showGallery" class="gallery-content">
                  <div class="gallery-scroll">
                    <div
                        v-for="media in images"
                        :key="media.slug"
                        class="gallery-item"
                        @click="openImage(media)"
                    >
                      <img
                          :src="getMediaUrl(media.slug)"
                          :alt="media.fileName"
                          loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </transition>
            </section>

            <!-- Documents Section -->
            <section v-if="hasDocuments" class="details-section document-section">
              <h2>{{ documentCount === 1 ? 'Document' : 'Documents' }}</h2>
              <div class="document-grid">
                <div v-for="doc in documents" :key="doc.slug" class="article-card">
                  <div class="article-card__content">
                    <div class="article-card__info">
                      <h3 class="article-card__title">{{ getDocumentName(doc.fileName) }}</h3>
                    </div>
                    <div class="article-card__footer">
                      <span class="file-name" :title="doc.fileName">{{ doc.fileName }}</span>
                      <a :href="getMediaUrl(doc.slug)" target="_blank" class="article-card__download-btn" title="Télécharger">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="download-icon">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </main>

          <aside class="sidebar-column">
            <section class="details-section info-card">
              <h2>Informations Clés</h2>
              <ul class="info-list">
                <li>
                  <strong>Date Prévue:</strong>
                  <span>{{ formatDate(action.datePrevu) }}</span>
                </li>
                <li>
                  <strong>Date de Fin:</strong>
                  <span>{{ formatDate(action.dateFin) }}</span>
                </li>
                <li>
                  <strong>Type :</strong>
                  <span>{{ action.libelleTypeAction || 'N/A' }}</span>
                </li>
                <li>
                  <strong>Bateau:</strong>
                  <span>{{ action.bateau.nomBapteme || 'N/A' }}</span>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
      <div v-else class="no-data">
        <p>Aucun détail d'action à afficher.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import { useRoute } from 'vue-router';
import { useBoatProprietaireStore } from '@/stores/useBoatProprietaireStore';
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Breadcrumbs from "@/components/common/Breadcrumbs.vue";

definePageMeta({
  middleware: ['auth'],
  breadcrumb: (route) => [
    { label: 'Mes bateaux', to: '/proprietaire/bateaux' },
    { label: 'Gestion des activités', to: `/proprietaire/bateau/${route.params.code}/actions` },
    { label: 'Détail de l\'activité' }
  ]
})

const route = useRoute();
const store = useBoatProprietaireStore();
const action = ref(null);
const isLoading = ref(false);
const error = ref(null);
const showGallery = ref(false);

const isPageLoading = ref(true);

// --- Media Helpers ---
const isImage = (mimeType) => mimeType?.startsWith('image/');
const getMediaUrl = (slug) => slug;
const openImage = (media) => window.open(getMediaUrl(media.slug), '_blank');
const getDocumentName = (fileName) => fileName.split('.').slice(0, -1).join('.') || fileName;

// --- Computed Properties for Media ---
const images = computed(() => action.value?.medias?.filter(m => isImage(m.contentType)) || []);
const documents = computed(() => action.value?.medias?.filter(m => !isImage(m.contentType)) || []);
const hasImages = computed(() => images.value.length > 0);
const imageCount = computed(() => images.value.length);
const hasDocuments = computed(() => documents.value.length > 0);
const documentCount = computed(() => documents.value.length);

onMounted(async () => {
  const actionCode = route.params.actionCode;

  if (actionCode) {
    isLoading.value = true;
    try {
      // 🪄 CORRECTION ICI : On stocke le résultat dans 'const response'
      const response = await store.fetchActionsDetail(actionCode);

      if (response && response.elements && response.elements.length > 0) {
        action.value = response.elements[0];
      } else {
        error.value = "Aucun détail d'action trouvé pour ce code.";
      }
    } catch (e) {
      error.value = e.message || "Une erreur est survenue lors de la récupération des détails.";
    } finally {
      isPageLoading.value = false;
      isLoading.value = false; // N'oublie pas de stopper l'autre loader aussi !
    }
  } else {
    isPageLoading.value = false;
    error.value = "Code de l'action manquant.";
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'Non spécifiée';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

</script>

<style scoped lang="scss">
@import 'assets/styles/scss/user/proprietaire/action-boat-details';
</style>

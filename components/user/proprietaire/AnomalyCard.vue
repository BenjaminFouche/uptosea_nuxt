<template>
  <div class="anomaly-card">
    <div class="anomaly-card__header">
      <div class="badges">
        <span class="badge" :class="getPriorityClass(anomaly.priorite)">
          {{ anomaly.priorite }}
        </span>
        <span class="badge" :class="getStatusClass(anomaly.statut)">
          {{ anomaly.statut }}
        </span>
      </div>

      <div class="meta-info">
        <span class="reference" v-if="anomaly.reference">
          <span class="label">Ref:</span> {{ anomaly.reference }}
        </span>
        <span class="date">{{ formatDate(anomaly.dateCreation) }}</span>
      </div>
    </div>

    <div class="anomaly-card__content">
      <h3 class="title">{{ anomaly.titre }}</h3>
      <p class="description">{{ anomaly.description }}</p>

      <transition name="slide-fade">
        <div v-if="showGallery && hasMedias" class="gallery-section">
          <div class="gallery-scroll">
            <div
                v-for="(media, index) in anomaly.medias"
                :key="index"
                class="gallery-item"
                @click="openImage(media)"
            >
              <img
                  v-if="isImage(media.contentType)"
                  :src="getMediaUrl(media.slug)"
                  loading="lazy"
                  alt="Photo anomalie"
              />
            </div>
          </div>
        </div>
      </transition>
    </div>

    <div class="anomaly-card__footer">
      <div class="footer-left">
        <button
            v-if="hasMedias"
            class="btn-photos"
            :class="{ active: showGallery }"
            @click="showGallery = !showGallery"
        >
          {{ showGallery ? 'Masquer' : `Photos (${mediaCount})` }}
        </button>
      </div>

      <div class="footer-actions">
        <button
            class="action-btn edit"
            @click="$emit('edit', anomaly)"
            v-if="anomaly.statut !== 'Résolu'"
        >
          Modifier
        </button>
        <button class="action-btn delete" v-if="anomaly.statut !== 'Résolu'" @click="$emit('delete', anomaly.id)">
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  anomaly: { type: Object, required: true }
});

defineEmits(['edit', 'delete']);

const showGallery = ref(false);

// --- Computed ---
const hasMedias = computed(() => {
  return props.anomaly.medias && props.anomaly.medias.length > 0;
});

const mediaCount = computed(() => {
  return props.anomaly.medias ? props.anomaly.medias.length : 0;
});

// --- Helpers pour les média ---
const isImage = (mimeType) => {
  return mimeType && mimeType.startsWith('image/');
};

const getMediaUrl = (slug) => {
  if (!slug) return '';
  if (slug.startsWith('http')) return slug;
  return slug;
};

const openImage = (media) => {
  const url = getMediaUrl(media.slug);
  if (url) window.open(url, '_blank');
};

// --- Helpers existants ---
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR');
};

const getPriorityClass = (prio) => {
  switch (prio) {
    case 'Haute': return 'badge--high';
    case 'Moyenne': return 'badge--medium';
    default: return 'badge--low';
  }
};

const getStatusClass = (status) => {
  return status === 'Résolu' ? 'badge--success' : 'badge--pending';
};
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/user/proprietaire/anomaly_card';

</style>
<template>
  <div class="article-card-container">
    <div class="article-card">

      <a
          target="_blank"
          class="article-card__header"
          title="Télécharger le document"
      >
<!--        <div class="article-card__image-wrapper">-->
<!--          <img-->
<!--              :src="boatImage"-->
<!--              :alt="boatName"-->
<!--              class="article-card__img"-->
<!--          />-->
<!--        </div>-->

<!--        <div class="article-card__badge article-card__badge&#45;&#45;category">-->
<!--          Document-->
<!--        </div>-->
      </a>

      <div class="article-card__content">
        <div class="article-card__info">
          <h3 class="article-card__title">{{ typeDocument }}</h3>

          <div class="article-card__description">
            <p>Document lié au bateau : <br><strong>{{ boatName }}</strong></p>
          </div>
        </div>

        <div class="article-card__footer">
          <span>
            {{documentName}}
          </span>
          <a :href="documentUrl" target="_blank" class="article-card__download-btn" title="Télécharger">
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
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  boatName: {
    type: String,
    default: 'Bateau inconnu'
  },
  boatImageUrl: {
    type: String,
    default: null
  }
});

const documentUrl = computed(() => {
  return props.document.slug || '#';
});

const documentName = computed(() => {
  return `${props.document.fileName || 'Document'}`;
});

const typeDocument = props.document.fileName.split('.').slice(0, -1).join('.');

</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/user/proprietaire/boat_document_card';
</style>
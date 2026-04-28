<template>
  <div class="article-card-container" :class="{ 'is-compact': isBookingMode }">
    <div class="article-card">

      <component
          :is="downloadLink ? 'a' : 'div'"
          :href="downloadLink || null"
          :download="downloadLink ? article.titre : null"
          :target="downloadLink ? '_blank' : null"
          class="article-card__header"
      >
        <div class="article-card__image-wrapper">
          <img
              :src="currentImage"
              :alt="article.titre"
              class="article-card__img"
          />
        </div>

        <div v-if="article.venteOuLocation === 'location'" class="article-card__badge article-card__badge--location">
          {{ article.venteOuLocation }}
        </div>
        <div class="article-card__badge article-card__badge--category">
          {{ article.categorieNom }}
        </div>
      </component>

      <div class="article-card__content">
        <div class="article-card__info">
          <h3 class="article-card__title">{{ article.titre }}</h3>
          <div class="article-card__description line-clamp" v-html="article.description"></div>
        </div>

        <div class="article-card__footer">

          <div class="article-card__download-zone">
            <a v-if="downloadLink" :href="downloadLink" target="_blank" class="article-card__download-btn" title="Télécharger la fiche">
              <img src="/src/assets/svg/download-icon.svg" alt="Download">
            </a>
          </div>

          <div class="article-card__controls-zone">
            <div class="article-card__price">
              {{ formatPrice(article.prixTtc) }} €
            </div>

            <div v-if="isBookingMode" class="article-actions-card">
              <button type="button" @click="$emit('decrease')" :disabled="disableMinus">-</button>
              <span>{{ quantity }}</span>
              <button type="button" @click="$emit('increase')" :disabled="disablePlus">+</button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'ArticleCard',
  props: {
    article: {
      type: Object,
      required: true
    },
    // Props pour le système de réservation
    isBookingMode: {
      type: Boolean,
      default: false
    },
    quantity: {
      type: Number,
      default: 0
    },
    disableMinus: {
      type: Boolean,
      default: false
    },
    disablePlus: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentImage() {
      // Affichage de l'image
      if (this.article.imageUrl && this.article.imageUrl.slug) {
        const image = this.article.imageUrl.slug;
        const separator = image.includes('?') ? '&' : '?';
        return `${image}${separator}w=317`;
      }

      // Image par défault si pas d'image dans l'article
      return 'https://app.uptosea.com/images/produit.webp';
    },
    downloadLink() {
      if (this.article.ficheUrl && this.article.ficheUrl.slug) {
        return this.article.ficheUrl.slug;
      }
      return null;
    }
  },
  methods: {
    formatPrice(price) {
      // Conversion du prix en euros
      return (price / 100).toFixed(2);
    }
  }
}
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/article/article_card';
</style>
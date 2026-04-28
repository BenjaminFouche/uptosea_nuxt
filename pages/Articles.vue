<template>
  <div class="articles-page">
    <div class="container">
      <Breadcrumbs></Breadcrumbs>

      <h1 class="articles-page__title">
        Présentation des articles
      </h1>
      <LoadingSpinner v-if="loading" message="Chargement des articles..." />

      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Erreur de chargement</h3>
        <p>{{ error }}</p>
        <button @click="refreshArticles" class="retry-button">
          Réessayer
        </button>
      </div>

      <div v-else class="articles-page__layout">
        <div class="articles-page__content">
          <div class="articles-page__grid">
            <ArticleCard
                v-for="article in filteredArticles"
                :key="article.code"
                :article="article"
                class="articles-page__card"
            />

            <div v-if="filteredArticles.length === 0" class="no-results">
              <p>Aucun article ne correspond à votre recherche.</p>
            </div>
          </div>
        </div>

        <div class="articles-page__sidebar">
          <ArticleCategorie></ArticleCategorie>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ArticleCard from '@/components/article/ArticleCard.vue';
import ArticleCategorie from '@/components/article/CategoriesArticle.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useArticlesStore } from '@/stores/useArticlesStore';
import { computed, onMounted, reactive, ref } from 'vue';
import Breadcrumbs from "@/components/common/Breadcrumbs.vue";

export default {
  name: 'Articles',
  components: {
    Breadcrumbs,
    ArticleCategorie,
    ArticleCard,
    LoadingSpinner
  },
  setup() {
    const articlesStore = useArticlesStore();

    // État local
    const loading = computed(() => articlesStore.loading);
    const error = computed(() => articlesStore.error);
    const filters = reactive({
      categorieSlug: '',
      sousCategorieSlug: '',
      searchQuery: ''
    });

    // --- MODIFICATION : Suppression de categories et subcategories en double ---
    const categories = ref([]);
    const subcategories = ref([]);
    // --------------------------------------------------------------------------

    // Articles filtrés
    const filteredArticles = computed(() => {
      return articlesStore.filteredArticles;
    });

    // Récupération des articles
    const fetchArticles = async () => {
      await articlesStore.fetchArticles();
      // --- MODIFICATION : Appel supprimé ---
    };

    // Méthodes de filtrage
    const filterByCategory = () => {
      articlesStore.updateFilters({ categorieSlug: filters.categorieSlug });
    };

    const filterBySubCategory = () => {
      articlesStore.updateFilters({ sousCategorieSlug: filters.sousCategorieSlug });
    };

    const updateSearchQuery = () => {
      articlesStore.updateFilters({ searchQuery: filters.searchQuery });
    };

    // Charger les articles au montage du composant
    onMounted(() => {
      fetchArticles();
    });

    return {
      loading,
      error,
      filters,
      categories,
      subcategories,
      filteredArticles,
      filterByCategory,
      filterBySubCategory,
      updateSearchQuery
    };
  }
};
</script>

<style scoped lang="scss">
@import 'assets/styles/scss/article/article';
</style>
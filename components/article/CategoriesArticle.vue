<template>
  <div class="categories-article">
    <h2>Catégories</h2>

    <select
        class="categories-select-mobile"
        @change="handleSelectChange"
    >
      <option value="">Tous les produits</option>

      <optgroup
          v-for="category in categories"
          :key="category.id"
          :label="category.categorieNom"
      >
        <option :value="category.categorieNom">
          {{ category.categorieNom }}
        </option>

        <template v-for="subCat in category.sousCategories" :key="subCat.id">
          <option
              :value="`${category.categorieNom}||${subCat.sousCategorieNom}`"
          >
            └ {{ subCat.sousCategorieNom }}
          </option>

          <option
              v-for="subSubCat in subCat.sousSousCategories"
              :key="subSubCat.id"
              :value="`${category.categorieNom}||${subCat.sousCategorieNom}||${subSubCat.sousSousCategorieNom}`"
          >
            &nbsp;&nbsp;&nbsp;&nbsp;└ {{ subSubCat.sousSousCategorieNom }}
          </option>
        </template>
      </optgroup>
    </select>

    <div class="categories-menu">
      <div class="all-products">
        <a href="#"
           @click.prevent="selectCategory(null)"
           :class="{ active: !articlesStore.activeCategory || articlesStore.activeCategory === 'Tous' }">
          Tous les produits
        </a>
      </div>

      <div v-if="loading" class="loading">Chargement des catégories...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="category-list">
        <div v-for="category in categories" :key="category.id" class="category">
          <div class="main-category">
            <a href="#"
               @click.prevent="selectCategory(category.categorieNom)"
               :class="{ active: articlesStore.activeCategory === category.categorieNom }">
              {{ category.categorieNom }}
            </a>
          </div>

          <div v-if="category.sousCategories && category.sousCategories.length" class="sub-categories">
            <div class="subcategory-container">
              <div class="vertical-line-container"></div>
              <div class="subcategories-content">
                <div v-for="(subCategory, subIdx) in category.sousCategories" :key="subCategory.id" class="sub-category">
                  <a href="#"
                     @click.prevent="selectSubCategory(category.categorieNom, subCategory.sousCategorieNom)"
                     :class="{ active: articlesStore.activeSubCategory === subCategory.sousCategorieNom }">
                    {{ subCategory.sousCategorieNom }}
                  </a>

                  <div v-if="subCategory.sousSousCategories && subCategory.sousSousCategories.length" class="sub-sub-categories">
                    <div class="subsubcategory-container">
                      <div class="vertical-line-container"></div>
                      <div class="subsubcategories-content">
                        <div v-for="subSubCategory in subCategory.sousSousCategories" :key="subSubCategory.id" class="sub-sub-category">
                          <a href="#"
                             @click.prevent="selectSubSubCategory(category.categorieNom, subCategory.sousCategorieNom, subSubCategory.sousSousCategorieNom)"
                             :class="{ active: articlesStore.activeSubSubCategory === subSubCategory.sousSousCategorieNom }">
                            {{ subSubCategory.sousSousCategorieNom }}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useArticlesStore } from '@/stores/useArticlesStore';

// Store et router
const articlesStore = useArticlesStore();
const router = useRouter();

// --- MODIFICATION : Remplacement des ref et API par le computed du store ---
const categories = computed(() => articlesStore.categoriesHierarchy);
const loading = computed(() => articlesStore.loading);
const error = computed(() => articlesStore.error);
// --------------------------------------------------------------------------

// Sélection des catégories
const selectCategory = (categoryName) => {
  if (categoryName) {
    // Filtrer les articles par catégorie
    articlesStore.filterArticlesByCategory(categoryName);

    // Naviguer vers la page des articles filtrés
    MapsTo({
      name: 'Articles',
      query: { categorie: categoryName }
    });
  } else {
    // Réinitialiser les filtres
    articlesStore.resetFilters();
    MapsTo({ name: 'Articles' });
  }
};

const selectSubCategory = (categoryName, subCategoryName) => {
  articlesStore.filterArticlesByCategory(categoryName);

  // Filtrer les articles par sous-catégorie
  articlesStore.filterArticlesBySubCategory(subCategoryName);

  // Naviguer vers la page des articles filtrés
  MapsTo({
    name: 'Articles',
    query: {
      categorie: categoryName,
      sousCategorie: subCategoryName
    }
  });
};

const selectSubSubCategory = (categoryName, subCategoryName, subSubCategoryName) => {
  // S'assurer que les catégories parentes sont sélectionnées
  articlesStore.filterArticlesByCategory(categoryName);
  articlesStore.filterArticlesBySubCategory(subCategoryName);

  // Filtrer par sous-sous-catégorie
  articlesStore.filterArticlesBySubSubCategory(subSubCategoryName);

  // Naviguer vers la page des articles filtrés
  MapsTo({
    name: 'Articles',
    query: {
      categorie: categoryName,
      sousCategorie: subCategoryName,
      sousSousCategorie: subSubCategoryName
    }
  });
};

// Chargement initial des catégories
onMounted(() => {
  // Vérifier les paramètres d'URL pour restaurer les filtres actifs
  const query = router.currentRoute.value.query;
  if (query.categorie) {
    articlesStore.filterArticlesByCategory(query.categorie);

    if (query.sousCategorie) {
      articlesStore.filterArticlesBySubCategory(query.sousCategorie);

      if (query.sousSousCategorie) {
        articlesStore.filterArticlesBySubSubCategory(query.sousSousCategorie);
      }
    }
  }
});

const handleSelectChange = (event) => {
  const value = event.target.value;
  if (!value) {
    articlesStore.resetFilters();
    MapsTo({ name: 'Articles' });
    return;
  }

  const parts = value.split("||");
  if (parts.length === 1) selectCategory(parts[0]);
  if (parts.length === 2) selectSubCategory(parts[0], parts[1]);
  if (parts.length === 3) selectSubSubCategory(parts[0], parts[1], parts[2]);
};

</script>

<style scoped lang="scss">
@import 'assets/styles/scss/components/article/article_categories';
</style>
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiArticle from '../services/apiArticle';
import { useAuthStore } from './useAuthStore';

export const useArticlesStore = defineStore('articles', () => {
    const allArticles = ref([]);
    const articles = ref([]);
    const filteredArticles = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const currentPage = ref(0);
    const itemsPerPage = ref(8);
    const totalArticles = ref(0);
    const activeCategory = ref('Tous');
    const activeSubCategory = ref(null);
    const activeSubSubCategory = ref(null);
    const activeFilters = ref(null);

    const filters = ref({
        categorieSlug: null,
        sousCategorieSlug: null,
        sousSousCategorieSlug: null,
        searchQuery: ''
    });

    // --- MODIFICATION : Propriété calculée pour générer la hiérarchie dynamiquement ---
    const categoriesHierarchy = computed(() => {
        const hierarchy = [];

        allArticles.value.forEach(article => {
            if (!article.categorieNom) return;

            // 1. Catégorie principale
            let category = hierarchy.find(c => c.categorieNom === article.categorieNom);
            if (!category) {
                category = {
                    id: article.categorieSlug || article.categorieNom,
                    categorieNom: article.categorieNom,
                    sousCategories: []
                };
                hierarchy.push(category);
            }

            // 2. Sous-catégorie
            if (article.sousCategorieNom) {
                let subCategory = category.sousCategories.find(sc => sc.sousCategorieNom === article.sousCategorieNom);
                if (!subCategory) {
                    subCategory = {
                        id: article.sousCategorieSlug || article.sousCategorieNom,
                        sousCategorieNom: article.sousCategorieNom,
                        sousSousCategories: []
                    };
                    category.sousCategories.push(subCategory);
                }

                // 3. Sous-sous-catégorie
                if (article.sousSousCategorieNom) {
                    let subSubCategory = subCategory.sousSousCategories.find(ssc => ssc.sousSousCategorieNom === article.sousSousCategorieNom);
                    if (!subSubCategory) {
                        subSubCategory = {
                            id: article.sousSousCategorieSlug || article.sousSousCategorieNom,
                            sousSousCategorieNom: article.sousSousCategorieNom
                        };
                        subCategory.sousSousCategories.push(subSubCategory);
                    }
                }
            }
        });

        hierarchy.sort((a, b) => a.categorieNom.localeCompare(b.categorieNom));
        return hierarchy;
    });
    // --------------------------------------------------------------------------------

    const hasArticles = computed(() => articles.value.length > 0);
    const totalPages = computed(() => Math.ceil(totalArticles.value / itemsPerPage.value));
    const hasNextPage = computed(() => currentPage.value < totalPages.value - 1);
    const hasPreviousPage = computed(() => currentPage.value > 0);

    function updateDisplayedArticles() {
        const startIndex = currentPage.value * itemsPerPage.value;
        const endIndex = startIndex + itemsPerPage.value;
        articles.value = filteredArticles.value.slice(startIndex, endIndex);
    }

    function filterArticlesByCategory(categorieSlug) {
        activeCategory.value = categorieSlug || 'Tous';
        filters.value.categorieSlug = categorieSlug === 'Tous' ? null : categorieSlug;

        // Réinitialiser les filtres de niveau inférieur
        filters.value.sousCategorieSlug = null;
        filters.value.sousSousCategorieSlug = null;
        activeSubCategory.value = null;
        activeSubSubCategory.value = null;

        applyFilters();
    }

    function filterArticlesBySubCategory(sousCategorieSlug) {
        filters.value.sousCategorieSlug = sousCategorieSlug;
        activeSubCategory.value = sousCategorieSlug;

        // Réinitialiser les filtres de sous-sous-catégorie
        filters.value.sousSousCategorieSlug = null;
        activeSubSubCategory.value = null;

        applyFilters();
    }

    function filterArticlesBySubSubCategory(sousSousCategorieSlug) {
        filters.value.sousSousCategorieSlug = sousSousCategorieSlug;
        activeSubSubCategory.value = sousSousCategorieSlug;

        applyFilters();
    }

    function updateSearchQuery(query) {
        filters.value.searchQuery = query;
        applyFilters();
    }

    /**
     * Applique les filtres aux articles
     */
    function applyFilters() {
        if (allArticles.value.length === 0) {
            filteredArticles.value = [];
            return;
        }

        let filtered = [...allArticles.value];

        // Filtre par catégorie
        if (filters.value.categorieSlug) {
            filtered = filtered.filter(article =>
                article.categorieSlug === filters.value.categorieSlug ||
                article.categorieNom === filters.value.categorieSlug
            );
        }

        // Filtre par sous-catégorie
        if (filters.value.sousCategorieSlug) {
            filtered = filtered.filter(article =>
                article.sousCategorieSlug === filters.value.sousCategorieSlug ||
                article.sousCategorieNom === filters.value.sousCategorieSlug
            );
        }

        // Filtre par sous-sous-catégorie
        if (filters.value.sousSousCategorieSlug) {
            filtered = filtered.filter(article =>
                article.sousSousCategorieSlug === filters.value.sousSousCategorieSlug ||
                article.sousSousCategorieNom === filters.value.sousSousCategorieSlug
            );
        }

        // Filtre par recherche
        if (filters.value.searchQuery) {
            const query = filters.value.searchQuery.toLowerCase();
            filtered = filtered.filter(article =>
                article.titre.toLowerCase().includes(query) ||
                (article.description && article.description.toLowerCase().includes(query))
            );
        }

        filteredArticles.value = filtered;
        totalArticles.value = filtered.length;
        currentPage.value = 0;
        updateDisplayedArticles();
    }

    /**
     * Récupère tous les articles
     * @param {number} page - Page à récupérer
     * @param {number} limit - Nombre d'articles par page
     */
    async function fetchArticles(page = 0, limit = 8) {
        loading.value = true;
        error.value = null;

        try {
            if (allArticles.value.length === 0) {
                const response = await apiArticle.getArticles();

                if (response && response.article && Array.isArray(response.article)) {
                    allArticles.value = response.article;
                    filteredArticles.value = response.article;
                    totalArticles.value = response.total || response.article.length;
                } else if (response && response.elements && Array.isArray(response.elements)) {
                    allArticles.value = response.elements;
                    filteredArticles.value = response.elements;
                    totalArticles.value = response.elements.length;
                } else if (Array.isArray(response)) {
                    allArticles.value = response;
                    filteredArticles.value = response;
                    totalArticles.value = response.length;
                } else {
                    allArticles.value = [];
                    filteredArticles.value = [];
                    totalArticles.value = 0;
                }
            }

            currentPage.value = page;
            itemsPerPage.value = limit;

            applyFilters();
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des articles';
        } finally {
            loading.value = false;
        }
    }

    async function loadMoreArticles() {
        if (hasNextPage.value && !loading.value) {
            await fetchArticles(currentPage.value + 1, itemsPerPage.value);
        }
    }

    async function loadPreviousArticles() {
        if (hasPreviousPage.value && !loading.value) {
            await fetchArticles(currentPage.value - 1, itemsPerPage.value);
        }
    }

    /**
     * Récupère un article par son code
     * @param {string} code - Code de l'article
     * @returns {Promise<Object|null>} L'article ou null si non trouvé
     */
    async function fetchArticleByCode(code) {
        loading.value = true;
        error.value = null;

        try {
            const existingArticle = allArticles.value.find(article => article.code === code);
            if (existingArticle) {
                return existingArticle;
            }

            const article = await apiArticle.getArticleByCode(code);

            if (article) {
                allArticles.value.push(article);
            }

            return article;
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'article ${code}:`, error);
            return null;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Récupère les articles par catégorie
     * @param {string} categorieSlug - Slug de la catégorie
     */
    async function fetchArticlesByCategory(categorieSlug) {
        loading.value = true;
        error.value = null;
        filters.value.categorieSlug = categorieSlug;

        try {
            if (allArticles.value.length > 0) {
                filterArticlesByCategory(categorieSlug);
            } else {
                const response = await apiArticle.getArticlesByCategory(categorieSlug);

                if (response && response.article && Array.isArray(response.article)) {
                    allArticles.value = response.article;
                    totalArticles.value = response.total || response.article.length;
                    filterArticlesByCategory(categorieSlug);
                } else if (response && response.elements && Array.isArray(response.elements)) {
                    allArticles.value = response.elements;
                    totalArticles.value = response.elements.length;
                    filterArticlesByCategory(categorieSlug);
                } else if (Array.isArray(response)) {
                    allArticles.value = response;
                    totalArticles.value = response.length;
                    filterArticlesByCategory(categorieSlug);
                } else {
                    allArticles.value = [];
                    filteredArticles.value = [];
                    totalArticles.value = 0;
                }
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la récupération des articles par catégorie';
        } finally {
            loading.value = false;
        }
    }

    /**
     * Récupère les articles par sous-catégorie
     * @param {string} sousCategorieSlug - Slug de la sous-catégorie
     */
    async function fetchArticlesBySubCategory(sousCategorieSlug) {
        loading.value = true;
        error.value = null;
        filters.value.sousCategorieSlug = sousCategorieSlug;

        try {
            if (allArticles.value.length > 0) {
                filterArticlesBySubCategory(sousCategorieSlug);
            } else {
                const response = await apiArticle.getArticlesBySubCategory(sousCategorieSlug);

                if (response && response.article && Array.isArray(response.article)) {
                    allArticles.value = response.article;
                    totalArticles.value = response.total || response.article.length;
                    filterArticlesBySubCategory(sousCategorieSlug);
                } else if (response && response.elements && Array.isArray(response.elements)) {
                    allArticles.value = response.elements;
                    totalArticles.value = response.elements.length;
                    filterArticlesBySubCategory(sousCategorieSlug);
                } else if (Array.isArray(response)) {
                    allArticles.value = response;
                    totalArticles.value = response.length;
                    filterArticlesBySubCategory(sousCategorieSlug);
                } else {
                    console.warn("La réponse de l'API n'a pas la structure attendue:", response);
                    allArticles.value = [];
                    filteredArticles.value = [];
                    totalArticles.value = 0;
                }
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la récupération des articles par sous-catégorie';
            console.error(`Erreur lors de la récupération des articles de la sous-catégorie ${sousCategorieSlug}:`, err);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Fonction pour forcer le rechargement depuis l'API
     */
    async function refreshArticles() {
        allArticles.value = [];
        await fetchArticles(0, itemsPerPage.value);
    }

    /**
     * Réinitialise tous les filtres
     */
    function resetFilters() {
        filters.value = {
            categorieSlug: null,
            sousCategorieSlug: null,
            sousSousCategorieSlug: null,
            searchQuery: ''
        };

        activeCategory.value = 'Tous';
        activeSubCategory.value = null;
        activeSubSubCategory.value = null;

        applyFilters();
    }

    /**
     * Vide le store d'articles
     */
    function clearArticles() {
        articles.value = [];
        filteredArticles.value = [];
        allArticles.value = [];
        totalArticles.value = 0;
        currentPage.value = 0;
        activeCategory.value = 'Tous';
        error.value = null;
        resetFilters();
    }

    return {
        allArticles,
        articles,
        filteredArticles,
        loading,
        error,
        hasArticles,
        totalArticles,
        currentPage,
        itemsPerPage,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        activeCategory,
        activeSubCategory,
        activeSubSubCategory,
        filters,
        categoriesHierarchy, // --- MODIFICATION : Export de la nouvelle propriété ---
        fetchArticles,
        filterArticlesByCategory,
        filterArticlesBySubCategory,
        filterArticlesBySubSubCategory,
        updateSearchQuery,
        loadMoreArticles,
        loadPreviousArticles,
        resetFilters,
        refreshArticles,
        clearArticles
    };
});